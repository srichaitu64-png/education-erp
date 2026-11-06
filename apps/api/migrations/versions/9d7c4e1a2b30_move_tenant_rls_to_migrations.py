"""move tenant row-level security setup into versioned migrations

Revision ID: 9d7c4e1a2b30
Revises: a8d56bd229d3
Create Date: 2026-11-06
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "9d7c4e1a2b30"
down_revision: Union[str, Sequence[str], None] = "a8d56bd229d3"
branch_labels = None
depends_on = None

TENANT_SCOPED_TABLES = (
    "campuses", "tenant_domains", "subscriptions", "tenant_feature_overrides",
    "feature_usage", "examinations", "exam_marks", "offline_sync_queue",
    "external_exam_providers", "exam_approval_audits", "permission_change_requests",
    "fee_structures", "fee_invoices", "fee_payments", "fee_receipts",
    "receipt_audit_logs", "institution_attendance_configs", "daily_attendance_records",
    "period_attendance_records", "academic_sections", "student_section_enrolments",
    "staff_duty_assignments", "hall_tickets", "consolidated_fee_report_snapshots",
    "students", "admission_applications", "migration_batch_logs",
    "platform_support_access_sessions",
)
HYBRID_SCOPED_TABLES = (
    "roles", "user_roles", "user_permission_overrides", "dashboard_layout_configs",
    "subscription_audit_logs", "account_security_events",
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for table in TENANT_SCOPED_TABLES:
        if not inspector.has_table(table):
            continue
        op.execute(sa.text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
        op.execute(sa.text(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY"))
        op.execute(sa.text(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table}"))
        op.execute(sa.text(f"""
            CREATE POLICY tenant_isolation_policy ON {table}
            FOR ALL
            USING (
                current_setting('app.is_superadmin', true) = 'true'
                OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
            WITH CHECK (
                current_setting('app.is_superadmin', true) = 'true'
                OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
        """))

    for table in HYBRID_SCOPED_TABLES:
        if not inspector.has_table(table):
            continue
        op.execute(sa.text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
        op.execute(sa.text(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY"))
        op.execute(sa.text(f"DROP POLICY IF EXISTS hybrid_isolation_policy ON {table}"))
        op.execute(sa.text(f"""
            CREATE POLICY hybrid_isolation_policy ON {table}
            FOR ALL
            USING (
                current_setting('app.is_superadmin', true) = 'true'
                OR tenant_id IS NULL
                OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
            WITH CHECK (
                current_setting('app.is_superadmin', true) = 'true'
                OR tenant_id IS NULL
                OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
        """))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for table in TENANT_SCOPED_TABLES:
        if inspector.has_table(table):
            op.execute(sa.text(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table}"))
            op.execute(sa.text(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY"))
            op.execute(sa.text(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY"))

    for table in HYBRID_SCOPED_TABLES:
        if inspector.has_table(table):
            op.execute(sa.text(f"DROP POLICY IF EXISTS hybrid_isolation_policy ON {table}"))
            op.execute(sa.text(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY"))
            op.execute(sa.text(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY"))
