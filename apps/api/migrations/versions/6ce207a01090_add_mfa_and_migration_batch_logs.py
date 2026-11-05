"""add_mfa_and_migration_batch_logs

Revision ID: 6ce207a01090
Revises: bd0751c8eb27
Create Date: 2026-11-05 09:45:39.189821

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ce207a01090'
down_revision: Union[str, Sequence[str], None] = 'bd0751c8eb27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add MFA columns to users table
    op.add_column('users', sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('mfa_secret', sa.String(length=64), nullable=True))

    # 2. Create migration_batch_logs table
    op.create_table(
        'migration_batch_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('batch_number', sa.String(length=64), nullable=False),
        sa.Column('target_module', sa.String(length=64), nullable=False),
        sa.Column('import_type', sa.String(length=64), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('total_records', sa.Integer(), nullable=False, default=0),
        sa.Column('imported_count', sa.Integer(), nullable=False, default=0),
        sa.Column('skipped_count', sa.Integer(), nullable=False, default=0),
        sa.Column('error_count', sa.Integer(), nullable=False, default=0),
        sa.Column('conflict_policy', sa.String(length=32), nullable=False, default='SKIP'),
        sa.Column('status', sa.String(length=32), nullable=False, default='COMPLETED'),
        sa.Column('validation_summary', sa.JSON(), nullable=False),
        sa.Column('executed_by_name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('updated_by', sa.UUID(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'batch_number', name='uq_tenant_migration_batch_no'),
        if_not_exists=True
    )
    op.create_index('idx_migration_tenant_module', 'migration_batch_logs', ['tenant_id', 'target_module'], if_not_exists=True)
    op.create_index(op.f('ix_migration_batch_logs_tenant_id'), 'migration_batch_logs', ['tenant_id'], if_not_exists=True)
    op.create_index(op.f('ix_migration_batch_logs_batch_number'), 'migration_batch_logs', ['batch_number'], if_not_exists=True)


def downgrade() -> None:
    op.drop_table('migration_batch_logs', if_exists=True)
    op.drop_column('users', 'mfa_secret')
    op.drop_column('users', 'mfa_enabled')
