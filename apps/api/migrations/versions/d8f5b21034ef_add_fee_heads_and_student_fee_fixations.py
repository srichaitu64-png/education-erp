"""add_fee_heads_and_student_fee_fixations

Revision ID: d8f5b21034ef
Revises: c7e45b1289df
Create Date: 2026-11-07 07:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd8f5b21034ef'
down_revision: Union[str, Sequence[str], None] = 'f2c3d4e5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create fee_heads, student_fee_fixations, fee_adjustment_logs with RLS and add admission columns."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # 1. fee_heads table
    if "fee_heads" not in tables:
        op.create_table(
            "fee_heads",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="RESTRICT"), nullable=False, index=True),
            sa.Column("head_code", sa.String(64), nullable=False, index=True),
            sa.Column("title", sa.String(128), nullable=False),
            sa.Column("category", sa.String(64), nullable=False, server_default="ACADEMIC"),
            sa.Column("charge_type", sa.String(32), nullable=False, server_default="PER_TERM"),
            sa.Column("is_compulsory", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("is_recurring", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("default_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("tax_rate", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint("tenant_id", "head_code", name="uq_tenant_fee_head_code"),
        )
        op.create_index("idx_fee_head_tenant_cat", "fee_heads", ["tenant_id", "category"])
        op.execute("ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY tenant_isolation_policy ON fee_heads
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
            WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
        """)

    # 2. student_fee_fixations table
    if "student_fee_fixations" not in tables:
        op.create_table(
            "student_fee_fixations",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="RESTRICT"), nullable=False, index=True),
            sa.Column("student_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("students.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("admission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("admission_applications.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("student_name", sa.String(255), nullable=False, index=True),
            sa.Column("admission_number", sa.String(64), nullable=True, index=True),
            sa.Column("academic_year", sa.String(32), nullable=False, server_default="2026-2027", index=True),
            sa.Column("class_or_stream", sa.String(64), nullable=False, index=True),
            sa.Column("standard_annual_fee", sa.Float(), nullable=False),
            sa.Column("total_concession_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("concession_category", sa.String(64), nullable=False, server_default="Management Negotiation"),
            sa.Column("concession_method", sa.String(32), nullable=False, server_default="OVERALL_ALLOCATION"),
            sa.Column("final_annual_payable", sa.Float(), nullable=False),
            sa.Column("head_allocations", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
            sa.Column("additional_charges", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
            sa.Column("term_installments", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
            sa.Column("reason_remarks", sa.Text(), nullable=True),
            sa.Column("status", sa.String(32), nullable=False, server_default="APPROVED", index=True),
            sa.Column("created_by_name", sa.String(255), nullable=False, server_default="Admissions Officer"),
            sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("approved_by_name", sa.String(255), nullable=True),
            sa.Column("approved_by_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("audit_history", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("idx_fee_fix_tenant_student", "student_fee_fixations", ["tenant_id", "student_id"])
        op.create_index("idx_fee_fix_tenant_year_class", "student_fee_fixations", ["tenant_id", "academic_year", "class_or_stream"])
        op.create_index("idx_fee_fix_tenant_status", "student_fee_fixations", ["tenant_id", "status"])
        op.execute("ALTER TABLE student_fee_fixations ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY tenant_isolation_policy ON student_fee_fixations
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
            WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
        """)

    # 3. fee_adjustment_logs table
    if "fee_adjustment_logs" not in tables:
        op.create_table(
            "fee_adjustment_logs",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="RESTRICT"), nullable=False, index=True),
            sa.Column("fixation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("student_fee_fixations.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("invoice_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("fee_invoices.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("student_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True),
            sa.Column("action_type", sa.String(64), nullable=False, index=True),
            sa.Column("previous_amount", sa.Float(), nullable=False),
            sa.Column("new_amount", sa.Float(), nullable=False),
            sa.Column("reason", sa.Text(), nullable=False),
            sa.Column("approved_by_name", sa.String(255), nullable=False, server_default="Administrator"),
            sa.Column("details", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="{}"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("idx_fee_adj_tenant_student", "fee_adjustment_logs", ["tenant_id", "student_id"])
        op.create_index("idx_fee_adj_tenant_action", "fee_adjustment_logs", ["tenant_id", "action_type"])
        op.execute("ALTER TABLE fee_adjustment_logs ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY tenant_isolation_policy ON fee_adjustment_logs
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
            WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
        """)

    # 4. Add columns to admission_applications
    adm_cols = [c["name"] for c in inspector.get_columns("admission_applications")]
    if "fee_fixation_id" not in adm_cols:
        op.add_column("admission_applications", sa.Column("fee_fixation_id", postgresql.UUID(as_uuid=True), nullable=True))
    if "negotiated_fee" not in adm_cols:
        op.add_column("admission_applications", sa.Column("negotiated_fee", sa.Float(), nullable=True))
    if "is_transport_opted" not in adm_cols:
        op.add_column("admission_applications", sa.Column("is_transport_opted", sa.Boolean(), nullable=False, server_default=sa.false()))
    if "is_hostel_opted" not in adm_cols:
        op.add_column("admission_applications", sa.Column("is_hostel_opted", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    """Reversible downgrade dropping added tables and columns."""
    op.drop_column("admission_applications", "is_hostel_opted")
    op.drop_column("admission_applications", "is_transport_opted")
    op.drop_column("admission_applications", "negotiated_fee")
    op.drop_column("admission_applications", "fee_fixation_id")
    op.drop_table("fee_adjustment_logs")
    op.drop_table("student_fee_fixations")
    op.drop_table("fee_heads")
