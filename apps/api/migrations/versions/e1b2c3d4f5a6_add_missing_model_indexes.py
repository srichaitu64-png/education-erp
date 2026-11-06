"""add missing indexes required by SQLAlchemy model metadata

Revision ID: e1b2c3d4f5a6
Revises: c7e45b1289df
Create Date: 2026-11-06 17:45:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "e1b2c3d4f5a6"
down_revision: Union[str, Sequence[str], None] = "c7e45b1289df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


INDEXES = (
    ("ix_admission_applications_status", "admission_applications", "status"),
    ("ix_migration_batch_logs_status", "migration_batch_logs", "status"),
    ("ix_migration_batch_logs_target_module", "migration_batch_logs", "target_module"),
    ("ix_students_academic_year", "students", "academic_year"),
    ("ix_students_parent_email", "students", "parent_email"),
    ("ix_students_pen_number", "students", "pen_number"),
    ("ix_students_registration_number", "students", "registration_number"),
    ("ix_students_status", "students", "status"),
)


def upgrade() -> None:
    for index_name, table_name, column_name in INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name} ({column_name})"
        )


def downgrade() -> None:
    for index_name, _table_name, _column_name in reversed(INDEXES):
        op.execute(f"DROP INDEX IF EXISTS {index_name}")
