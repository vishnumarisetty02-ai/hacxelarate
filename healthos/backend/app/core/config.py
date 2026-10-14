"""
HealthOS — Core Configuration
All settings loaded from environment variables with validation.
No secrets hardcoded.
"""
from __future__ import annotations

import secrets
from enum import Enum
from typing import Any, List, Optional

from pydantic import AnyHttpUrl, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production" 
    TEST = "test"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "HealthOS"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = False
    SECRET_KEY: str = secrets.token_urlsafe(64)
    ALLOWED_HOSTS: List[str] = ["*"]

    # ─── API ──────────────────────────────────────────────────────────────────
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    # ─── Auth ─────────────────────────────────────────────────────────────────
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://healthos:healthos@localhost:5432/healthos"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # ─── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ─── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "local"  # "local" | "s3" | "gcs"
    LOCAL_STORAGE_PATH: str = "./uploads"
    S3_BUCKET: Optional[str] = None
    S3_REGION: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # ─── AI / LLM ─────────────────────────────────────────────────────────────
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "openai"
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"
    EXTRACTION_LLM_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536
    LLM_MAX_TOKENS: int = 4096
    LLM_TEMPERATURE: float = 0.1  # Low temperature for medical accuracy

    # ─── RAG ──────────────────────────────────────────────────────────────────
    RAG_TOP_K: int = 10
    RAG_SIMILARITY_THRESHOLD: float = 0.75
    RAG_MAX_CONTEXT_TOKENS: int = 8000

    # ─── Agent Safety ─────────────────────────────────────────────────────────
    AGENT_MAX_ITERATIONS: int = 10
    AGENT_TIMEOUT_SECONDS: int = 120
    SAFETY_RISK_THRESHOLD: float = 0.6
    REQUIRE_HUMAN_APPROVAL_ABOVE: float = 0.7

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60
    UPLOAD_RATE_LIMIT_PER_HOUR: int = 20
    MAX_UPLOAD_SIZE_MB: int = 50

    # ─── File Validation ──────────────────────────────────────────────────────
    ALLOWED_DOCUMENT_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/tiff",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    # ─── Observability ────────────────────────────────────────────────────────
    OTEL_ENDPOINT: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    # ─── Feature Flags ────────────────────────────────────────────────────────
    ENABLE_KNOWLEDGE_GRAPH: bool = False  # Phase 2 feature
    ENABLE_WEARABLE_SYNC: bool = False    # Phase 3 feature
    ENABLE_CLINICIAN_PORTAL: bool = False # Phase 4 feature

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == Environment.PRODUCTION

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == Environment.DEVELOPMENT


settings = Settings()
