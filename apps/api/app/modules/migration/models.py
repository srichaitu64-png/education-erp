import uuid
from typing import Dict, Any, Optional
from sqlalchemy import String, Integer, JSON, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import TenantBaseModel


class MigrationBatchLog(TenantBaseModel):
    """
    Audit log of bulk data migration and ingestion batches.
    Maintains record counts, conflict policies, and execution metrics per tenant.
    """
    __tablename__ = "migration_batch_logs"

    batch_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_module: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    import_type: Mapped[str] = mapped_column(String(64), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    total_records: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    imported_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    conflict_policy: Mapped[str] = mapped_column(String(32), nullable=False, default="SKIP") # SKIP, OVERWRITE, MERGE
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="COMPLETED", index=True) # VALIDATED, COMPLETED, FAILED
    
    validation_summary: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    executed_by_name: Mapped[str] = mapped_column(String(255), nullable=False)

    __table_args__ = (
        UniqueConstraint("tenant_id", "batch_number", name="uq_tenant_migration_batch_no"),
        Index("idx_migration_tenant_module", "tenant_id", "target_module"),
    )

