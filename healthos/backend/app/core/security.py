"""
HealthOS — Security Layer
JWT auth, password hashing, token management, RBAC.
Zero-trust design: every action requires explicit permission check.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ─── Password Hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── RBAC Roles ───────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    PATIENT = "patient"
    CLINICIAN = "clinician"          # Phase 4
    ADMIN = "admin"
    READONLY = "readonly"


# ─── Permission Scopes ────────────────────────────────────────────────────────
class Permission(str, Enum):
    # Health Records
    HEALTH_RECORDS_READ = "health_records:read"
    HEALTH_RECORDS_WRITE = "health_records:write"
    HEALTH_RECORDS_DELETE = "health_records:delete"

    # Documents
    DOCUMENTS_UPLOAD = "documents:upload"
    DOCUMENTS_READ = "documents:read"
    DOCUMENTS_DELETE = "documents:delete"

    # AI / Agents
    AI_CONVERSATION = "ai:conversation"
    AI_INSIGHTS_READ = "ai:insights:read"
    AI_ACTIONS_APPROVE = "ai:actions:approve"

    # Care Gaps
    CARE_GAPS_READ = "care_gaps:read"

    # Visit Prep
    VISIT_PREP_GENERATE = "visit_prep:generate"

    # Audit
    AUDIT_READ = "audit:read"

    # Admin
    ADMIN_ALL = "admin:all"


ROLE_PERMISSIONS: Dict[UserRole, list[Permission]] = {
    UserRole.PATIENT: [
        Permission.HEALTH_RECORDS_READ,
        Permission.HEALTH_RECORDS_WRITE,
        Permission.DOCUMENTS_UPLOAD,
        Permission.DOCUMENTS_READ,
        Permission.DOCUMENTS_DELETE,
        Permission.AI_CONVERSATION,
        Permission.AI_INSIGHTS_READ,
        Permission.AI_ACTIONS_APPROVE,
        Permission.CARE_GAPS_READ,
        Permission.VISIT_PREP_GENERATE,
        Permission.AUDIT_READ,
    ],
    UserRole.READONLY: [
        Permission.HEALTH_RECORDS_READ,
        Permission.DOCUMENTS_READ,
        Permission.AI_INSIGHTS_READ,
        Permission.CARE_GAPS_READ,
        Permission.AUDIT_READ,
    ],
    UserRole.CLINICIAN: [
        Permission.HEALTH_RECORDS_READ,
        Permission.DOCUMENTS_READ,
        Permission.AI_INSIGHTS_READ,
        Permission.CARE_GAPS_READ,
        Permission.AUDIT_READ,
    ],
    UserRole.ADMIN: [p for p in Permission],
}


def get_permissions_for_role(role: UserRole) -> list[Permission]:
    return ROLE_PERMISSIONS.get(role, [])


def has_permission(role: UserRole, permission: Permission) -> bool:
    return permission in get_permissions_for_role(role)


# ─── JWT Token Management ─────────────────────────────────────────────────────
class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


def create_access_token(
    subject: str,
    role: UserRole,
    tenant_id: str,
    additional_claims: Optional[Dict[str, Any]] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "role": role.value,
        "tenant_id": tenant_id,
        "type": TokenType.ACCESS.value,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),  # Unique token ID for revocation
    }
    if additional_claims:
        payload.update(additional_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str, tenant_id: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": subject,
        "tenant_id": tenant_id,
        "type": TokenType.REFRESH.value,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT. Raises JWTError on failure."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        raise JWTError(f"Token validation failed: {e}") from e


# ─── Tenant Isolation ─────────────────────────────────────────────────────────
def assert_tenant_access(resource_tenant_id: str, requesting_tenant_id: str) -> None:
    """
    Hard boundary: users can NEVER access another tenant's data.
    This is called at the service layer, not just the route layer.
    """
    if resource_tenant_id != requesting_tenant_id:
        raise PermissionError(
            f"Tenant isolation violation: "
            f"resource belongs to {resource_tenant_id}, "
            f"requester is {requesting_tenant_id}"
        )
