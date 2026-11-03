from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

# Tables requiring strict PostgreSQL Row-Level Security
TENANT_SCOPED_TABLES = [
    "campuses",
    "tenant_domains",
    "subscriptions",
    "tenant_feature_overrides",
    "feature_usage",
]


async def enable_row_level_security(conn: AsyncConnection) -> None:
    """
    Enforce PostgreSQL Row-Level Security (RLS) on all tenant-owned tables.
    Guarantees isolation at the database engine level.
    """
    for table in TENANT_SCOPED_TABLES:
        # Enable & Force RLS
        await conn.execute(text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;"))
        await conn.execute(text(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY;"))

        # Drop existing policy if present
        await conn.execute(text(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table};"))

        # Create bulletproof multi-tenant isolation policy
        # If app.is_superadmin is 'true', platform admin can access
        # Otherwise, query is strictly filtered by session tenant_id
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
