"""add_subject_catalogue_and_curriculum_mappings

Revision ID: c7e45b1289df
Revises: a8d56bd229d3
Create Date: 2026-11-06 11:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c7e45b1289df'
down_revision: Union[str, Sequence[str], None] = 'a8d56bd229d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create subject_catalog, institution_subjects, and class_subject_mappings with RLS."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # 1. Subject Catalogue (Global + Custom Tenant Library)
    if "subject_catalog" not in tables:
        op.create_table(
            'subject_catalog',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('tenant_id', sa.UUID(), nullable=True),
            sa.Column('code', sa.String(length=64), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('category', sa.String(length=64), nullable=False, server_default='Core Science'),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('has_practical', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('default_theory_max', sa.Float(), nullable=False, server_default='100.0'),
            sa.Column('default_practical_max', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('credits', sa.Integer(), nullable=False, server_default='4'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('created_by', sa.UUID(), nullable=True),
            sa.Column('updated_by', sa.UUID(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('tenant_id', 'code', name='uq_subject_catalog_tenant_code')
        )
        op.create_index('idx_subject_cat_search', 'subject_catalog', ['tenant_id', 'category', 'is_active'], unique=False)
        op.create_index(op.f('ix_subject_catalog_code'), 'subject_catalog', ['code'], unique=False)
        op.create_index(op.f('ix_subject_catalog_name'), 'subject_catalog', ['name'], unique=False)
        op.create_index(op.f('ix_subject_catalog_category'), 'subject_catalog', ['category'], unique=False)
        op.create_index(op.f('ix_subject_catalog_tenant_id'), 'subject_catalog', ['tenant_id'], unique=False)

    # 2. Institution Subjects (Adopted & Configured by Institution)
    if "institution_subjects" not in tables:
        op.create_table(
            'institution_subjects',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('tenant_id', sa.UUID(), nullable=False),
            sa.Column('subject_id', sa.UUID(), nullable=False),
            sa.Column('custom_code', sa.String(length=64), nullable=True),
            sa.Column('custom_name', sa.String(length=255), nullable=True),
            sa.Column('department', sa.String(length=128), nullable=True),
            sa.Column('institution_level', sa.String(length=64), nullable=False, server_default='PU College'),
            sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('created_by', sa.UUID(), nullable=True),
            sa.Column('updated_by', sa.UUID(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['subject_id'], ['subject_catalog.id'], ondelete='RESTRICT'),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='RESTRICT'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('tenant_id', 'subject_id', name='uq_institution_subject_tenant')
        )
        op.create_index('idx_inst_subject_level', 'institution_subjects', ['tenant_id', 'institution_level', 'is_active'], unique=False)
        op.create_index(op.f('ix_institution_subjects_tenant_id'), 'institution_subjects', ['tenant_id'], unique=False)
        op.create_index(op.f('ix_institution_subjects_subject_id'), 'institution_subjects', ['subject_id'], unique=False)
        op.create_index(op.f('ix_institution_subjects_custom_code'), 'institution_subjects', ['custom_code'], unique=False)
        op.create_index(op.f('ix_institution_subjects_department'), 'institution_subjects', ['department'], unique=False)
        op.create_index(op.f('ix_institution_subjects_institution_level'), 'institution_subjects', ['institution_level'], unique=False)

    # 3. Class Subject Mappings (Curriculum mapping)
    if "class_subject_mappings" not in tables:
        op.create_table(
            'class_subject_mappings',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('tenant_id', sa.UUID(), nullable=False),
            sa.Column('academic_year', sa.String(length=32), nullable=False, server_default='2026-2027'),
            sa.Column('institution_level', sa.String(length=64), nullable=False, server_default='PU College'),
            sa.Column('class_name', sa.String(length=64), nullable=False),
            sa.Column('stream', sa.String(length=64), nullable=True),
            sa.Column('institution_subject_id', sa.UUID(), nullable=False),
            sa.Column('is_compulsory', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('has_theory', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('has_practical', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('theory_max_marks', sa.Float(), nullable=False, server_default='100.0'),
            sa.Column('practical_max_marks', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('total_max_marks', sa.Float(), nullable=False, server_default='100.0'),
            sa.Column('theory_pass_marks', sa.Float(), nullable=False, server_default='35.0'),
            sa.Column('practical_pass_marks', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('total_pass_marks', sa.Float(), nullable=False, server_default='35.0'),
            sa.Column('weekly_periods', sa.Integer(), nullable=False, server_default='5'),
            sa.Column('assigned_teacher_id', sa.UUID(), nullable=True),
            sa.Column('assigned_teacher_name', sa.String(length=255), nullable=True),
            sa.Column('display_order', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('created_by', sa.UUID(), nullable=True),
            sa.Column('updated_by', sa.UUID(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['assigned_teacher_id'], ['users.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['institution_subject_id'], ['institution_subjects.id'], ondelete='RESTRICT'),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='RESTRICT'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('tenant_id', 'academic_year', 'class_name', 'stream', 'institution_subject_id', name='uq_class_subject_mapping')
        )
        op.create_index('idx_class_subject_lookup', 'class_subject_mappings', ['tenant_id', 'academic_year', 'class_name', 'stream'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_tenant_id'), 'class_subject_mappings', ['tenant_id'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_academic_year'), 'class_subject_mappings', ['academic_year'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_institution_level'), 'class_subject_mappings', ['institution_level'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_class_name'), 'class_subject_mappings', ['class_name'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_stream'), 'class_subject_mappings', ['stream'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_institution_subject_id'), 'class_subject_mappings', ['institution_subject_id'], unique=False)
        op.create_index(op.f('ix_class_subject_mappings_assigned_teacher_id'), 'class_subject_mappings', ['assigned_teacher_id'], unique=False)

    # 4. Enforce Row-Level Security without caller-settable superadmin bypass.
    op.execute("ALTER TABLE subject_catalog ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE subject_catalog FORCE ROW LEVEL SECURITY;")
    op.execute("DROP POLICY IF EXISTS hybrid_isolation_policy ON subject_catalog;")
    op.execute("DROP POLICY IF EXISTS hybrid_global_read_policy ON subject_catalog;")
    op.execute("DROP POLICY IF EXISTS hybrid_tenant_write_policy ON subject_catalog;")
    op.execute("""
        CREATE POLICY hybrid_global_read_policy ON subject_catalog
        FOR SELECT
        USING (
            tenant_id IS NULL
            OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        );
    """)
    op.execute("""
        CREATE POLICY hybrid_tenant_write_policy ON subject_catalog
        FOR ALL
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
    """)

    for table in ("institution_subjects", "class_subject_mappings"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY;")
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table};")
        op.execute(f"""
            CREATE POLICY tenant_isolation_policy ON {table}
            FOR ALL
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
            WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
        """)


def downgrade() -> None:
    """Downgrade schema to remove curriculum and subject catalog tables."""
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON class_subject_mappings;")
    op.execute("DROP TABLE IF EXISTS class_subject_mappings;")

    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON institution_subjects;")
    op.execute("DROP TABLE IF EXISTS institution_subjects;")

    op.execute("DROP POLICY IF EXISTS hybrid_isolation_policy ON subject_catalog;")
    op.execute("DROP TABLE IF EXISTS subject_catalog;")
