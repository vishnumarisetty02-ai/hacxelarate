"""
HealthOS — Structured Logging
Uses structlog for JSON-structured, context-aware logging.
Every log entry includes trace_id, tenant_id, user_id for correlation.
"""
from __future__ import annotations

import logging
import sys
from typing import Any

import structlog

from app.core.config import settings


def configure_logging() -> None:
    """Configure structlog for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if settings.is_production:
        # JSON output for log aggregation in prod
        processors = shared_processors + [structlog.processors.JSONRenderer()]
    else:
        # Human-readable in dev
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True)
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )

    # Also configure stdlib logging to route through structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )


def get_logger(name: str = "healthos") -> Any:
    return structlog.get_logger(name)


# ─── Audit Logger ─────────────────────────────────────────────────────────────
_audit_logger = structlog.get_logger("audit")


def audit_log(
    event: str,
    user_id: str | None = None,
    tenant_id: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    action: str | None = None,
    outcome: str = "success",
    metadata: dict | None = None,
) -> None:
    """
    Write an immutable audit event.
    In production this would also write to an append-only audit table.
    """
    _audit_logger.info(
        "audit_event",
        event=event,
        user_id=user_id,
        tenant_id=tenant_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        outcome=outcome,
        **(metadata or {}),
    )
