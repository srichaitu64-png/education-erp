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
    "institution_subjects",
    "class_subject_mappings",
]

# Non-private control-plane records platform admins may inspect across tenants.
PLATFORM_READ_TABLES = {
    "campuses",
    "tenant_domains",
    "subscriptions",
    "tenant_feature_overrides",
    "feature_usage",
}
PLATFORM_WRITE_TABLES = {
    "campuses",
    "tenant_domains",
    "subscriptions",
    "tenant_feature_overrides",
}

# Hybrid tables where tenant_id is nullable (global system records have tenant_id=NULL)
HYBRID_SCOPED_TABLES = [
    "roles",
    "user_roles",
    "user_permission_overrides",
    "dashboard_layout_configs",
    "subscription_audit_logs",
    "subject_catalog",
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
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        )
        WITH CHECK (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        );
        """
        await conn.execute(text(policy_sql))
        await conn.execute(text(f"DROP POLICY IF EXISTS platform_admin_control_plane_policy ON {table};"))
        if table in PLATFORM_READ_TABLES:
            policy_command = "ALL" if table in PLATFORM_WRITE_TABLES else "SELECT"
            check_clause = """
                WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM users u
                        WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                          AND u.is_superadmin = TRUE
                    )
                )
            """ if table in PLATFORM_WRITE_TABLES else ""
            await conn.execute(text(f"""
                CREATE POLICY platform_admin_control_plane_policy ON {table}
                FOR {policy_command}
                USING (
                    EXISTS (
                        SELECT 1 FROM users u
                        WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                          AND u.is_superadmin = TRUE
                    )
                )
                {check_clause}
            """))

    # 2. Enforce hybrid RLS on tables with global records (tenant_id IS NULL)
    for table in HYBRID_SCOPED_TABLES:
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} ENABLE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"ALTER TABLE IF EXISTS {table} FORCE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"DROP POLICY IF EXISTS hybrid_isolation_policy ON {table};"))
        await conn.execute(text(f"DROP POLICY IF EXISTS hybrid_global_read_policy ON {table};"))
        await conn.execute(text(f"DROP POLICY IF EXISTS hybrid_tenant_write_policy ON {table};"))

        # Global rows are visible to every tenant but remain immutable to tenant users.
        # Tenant-owned rows are readable and writable only inside their tenant.
        await conn.execute(text(f"""
            CREATE POLICY hybrid_global_read_policy ON {table}
            FOR SELECT
            USING (
                tenant_id IS NULL
                OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            );
        """))
        await conn.execute(text(f"""
            CREATE POLICY hybrid_tenant_write_policy ON {table}
            FOR ALL
            USING (
                tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
            WITH CHECK (
                tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            );
        """))
        await conn.execute(text(f"""
            CREATE POLICY hybrid_platform_admin_write_policy ON {table}
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                      AND u.is_superadmin = TRUE
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                      AND u.is_superadmin = TRUE
                )
            );
        """))

    # Security audit rows may be tenant-scoped, or user-scoped during password
    # recovery before an institution context is known. They are append-only.
    await conn.execute(text("ALTER TABLE IF EXISTS account_security_events ENABLE ROW LEVEL SECURITY;"))
    await conn.execute(text("ALTER TABLE IF EXISTS account_security_events FORCE ROW LEVEL SECURITY;"))
    await conn.execute(text("DROP POLICY IF EXISTS account_security_event_select_policy ON account_security_events;"))
    await conn.execute(text("DROP POLICY IF EXISTS account_security_event_insert_policy ON account_security_events;"))
    await conn.execute(text("""
        CREATE POLICY account_security_event_select_policy ON account_security_events
        FOR SELECT
        USING (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        );
    """))
    await conn.execute(text("""
        CREATE POLICY account_security_event_insert_policy ON account_security_events
        FOR INSERT
        WITH CHECK (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR (
                tenant_id IS NULL
                AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
            )
        );
    """))

    # Platform administrators may manage support-session metadata across tenants;
    # this does not grant access to the tenant's underlying student or finance tables.
    await conn.execute(text("ALTER TABLE IF EXISTS platform_support_access_sessions ENABLE ROW LEVEL SECURITY;"))
    await conn.execute(text("ALTER TABLE IF EXISTS platform_support_access_sessions FORCE ROW LEVEL SECURITY;"))
    await conn.execute(text("DROP POLICY IF EXISTS tenant_isolation_policy ON platform_support_access_sessions;"))
    await conn.execute(text("DROP POLICY IF EXISTS platform_support_session_access_policy ON platform_support_access_sessions;"))
    await conn.execute(text("""
        CREATE POLICY platform_support_session_access_policy ON platform_support_access_sessions
        FOR ALL
        USING (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                  AND u.is_superadmin = TRUE
            )
        )
        WITH CHECK (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR EXISTS (
                SELECT 1 FROM users u
                WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
                  AND u.is_superadmin = TRUE
            )
        );
    """))

