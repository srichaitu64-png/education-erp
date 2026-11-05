from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

# Tables requiring strict PostgreSQL Row-Level Security (tenant_id NOT NULL)
TENANT_SCOPED_TABLES = [
    "campuses",
    "tenant_domains",
    "subscriptions",
    "tenant_feature_overrides",
    "feature_usage",
    "examinations",
    "exam_marks",
    "offline_sync_queue",
    "external_exam_providers",
    "exam_approval_audits",
    "permission_change_requests",
    "fee_structures",
    "fee_invoices",
    "fee_payments",
    "fee_receipts",
    "receipt_audit_logs",
    "institution_attendance_configs",
    "daily_attendance_records",
    "period_attendance_records",
    "academic_sections",
    "student_section_enrolments",
    "staff_duty_assignments",
    "hall_tickets",
    "consolidated_fee_report_snapshots",
    "students",
    "admission_applications",
    "migration_batch_logs",
    "platform_support_access_sessions",
]

# Hybrid tables where tenant_id is nullable (global system records have tenant_id=NULL)
HYBRID_SCOPED_TABLES = [
    "roles",
    "user_roles",
    "user_permission_overrides",
    "dashboard_layout_configs",
    "subscription_audit_logs",
    "account_security_events",
]


async def enable_row_level_security(conn: AsyncConnection) -> None:
    """
    Enforce PostgreSQL Row-Level Security (RLS) on all tenant-owned tables.
    Guarantees isolation at the database engine level.
    """
    # 1. Enforce strict isolation on tenant-scoped tables
    for table in TENANT_SCOPED_TABLES:
        # Enable & Force RLS
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} ENABLE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} FORCE ROW LEVEL SECURITY;"))

        # Drop existing policy if present
        await conn.execute(text(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table};"))

        # Create bulletproof multi-tenant isolation policy
        policy_sql = f"""
        CREATE POLICY tenant_isolation_policy ON {table}
        FOR ALL
        USING (
            current_setting('app.is_superadmin', true) = 'true'
            OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        )
        WITH CHECK (
            current_setting('app.is_superadmin', true) = 'true'
            OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        );
        """
        await conn.execute(text(policy_sql))

    # 2. Enforce hybrid RLS on tables with global records (tenant_id IS NULL)
    for table in HYBRID_SCOPED_TABLES:
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} ENABLE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} FORCE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"DROP POLICY IF EXISTS hybrid_isolation_policy ON {table};"))

        hybrid_sql = f"""
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
            OR (
                tenant_id IS NOT NULL 
                AND tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
        );
        """
        await conn.execute(text(hybrid_sql))

