"""Add missing indexes used by tenant and operational queries.

Revision ID: b7e1c4f6a902
Revises: a8d56bd229d3
Create Date: 2026-11-06
"""
from alembic import op

revision = "b7e1c4f6a902"
down_revision = "a8d56bd229d3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS makes this safe for installations where SQLAlchemy
    # create_all() already created the model-declared indexes.
    op.execute("CREATE INDEX IF NOT EXISTS ix_admission_applications_status ON admission_applications (status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_migration_batch_logs_status ON migration_batch_logs (status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_migration_batch_logs_target_module ON migration_batch_logs (target_module)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_students_academic_year ON students (academic_year)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_students_parent_email ON students (parent_email)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_students_pen_number ON students (pen_number)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_students_registration_number ON students (registration_number)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_students_status ON students (status)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_students_status")
    op.execute("DROP INDEX IF EXISTS ix_students_registration_number")
    op.execute("DROP INDEX IF EXISTS ix_students_pen_number")
    op.execute("DROP INDEX IF EXISTS ix_students_parent_email")
    op.execute("DROP INDEX IF EXISTS ix_students_academic_year")
    op.execute("DROP INDEX IF EXISTS ix_migration_batch_logs_target_module")
    op.execute("DROP INDEX IF EXISTS ix_migration_batch_logs_status")
    op.execute("DROP INDEX IF EXISTS ix_admission_applications_status")
