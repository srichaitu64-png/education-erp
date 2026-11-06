import asyncio
from logging.config import fileConfig
import sys
import os

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context
from app.core.config import settings
from app.database.base import Base

# Import all models to ensure they register on Base.metadata
from app.modules.tenants.models import Tenant, Campus, TenantDomain
from app.modules.identity.models import (
    User,
    Role,
    Permission,
    UserRole,
    PermissionChangeAudit,
    UserPermissionOverride,
    DashboardLayoutConfig,
    PermissionChangeRequest
)
from app.modules.subscriptions.models import (
    SubscriptionPlan,
    FeatureCatalog,
    PlanFeature,
    Subscription,
    TenantFeatureOverride,
    FeatureUsage,
    SubscriptionAuditLog
)
from app.modules.examinations.models import (
    Examination,
    ExamAttendanceAndMarks,
    OfflineSyncQueue,
    ExternalExamProviderConfig,
    ExamApprovalAudit
)
from app.modules.finance.models import (
    FeeStructure,
    FeeInvoice,
    FeePayment,
    FeeReceipt,
    ReceiptAuditLog
)
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    HallTicket,
    ConsolidatedFeeReportSnapshot,
    Student,
    AdmissionApplication,
    SubjectCatalog,
    InstitutionSubject,
    ClassSubjectMapping
)
from app.modules.attendance.models import (
    InstitutionAttendanceConfig,
    DailyAttendanceRecord,
    PeriodAttendanceRecord
)
from app.modules.migration.models import MigrationBatchLog
from app.modules.leads.models import WebsiteLead

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_db_url() -> str:
    x_args = context.get_x_argument(as_dictionary=True)
    if "db_url" in x_args:
        return x_args["db_url"]
    url = config.get_main_option("sqlalchemy.url")
    if not url or url.startswith("driver://"):
        return settings.DATABASE_URL
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_db_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    database_url = get_db_url()
    connectable = create_async_engine(
        database_url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
