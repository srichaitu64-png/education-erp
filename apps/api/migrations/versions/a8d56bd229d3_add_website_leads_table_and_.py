"""add_website_leads_table_and_notification_pipeline

Revision ID: a8d56bd229d3
Revises: 6ce207a01090
Create Date: 2026-11-05 13:12:47.405442

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a8d56bd229d3'
down_revision: Union[str, Sequence[str], None] = '6ce207a01090'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to include website_leads and reliable notification tracking."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "website_leads" not in tables:
        op.create_table(
            'website_leads',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('reference_no', sa.String(length=50), nullable=False),
            sa.Column('contact_name', sa.String(length=255), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=False),
            sa.Column('institution_name', sa.String(length=255), nullable=False),
            sa.Column('institution_type', sa.String(length=50), nullable=False, server_default='school'),
            sa.Column('city', sa.String(length=100), nullable=True),
            sa.Column('state', sa.String(length=100), nullable=True),
            sa.Column('student_strength', sa.String(length=50), nullable=True),
            sa.Column('current_erp', sa.String(length=100), nullable=True),
            sa.Column('enquiry_type', sa.String(length=50), nullable=False, server_default='demo_request'),
            sa.Column('requested_modules', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('preferred_date', sa.String(length=50), nullable=True),
            sa.Column('preferred_time_slot', sa.String(length=50), nullable=True),
            sa.Column('message', sa.Text(), nullable=True),
            sa.Column('consent_given', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('consent_timestamp', sa.DateTime(timezone=True), nullable=True),
            sa.Column('page_url', sa.String(length=255), nullable=True),
            sa.Column('source', sa.String(length=100), nullable=True, server_default='website'),
            sa.Column('utm_source', sa.String(length=100), nullable=True),
            sa.Column('utm_medium', sa.String(length=100), nullable=True),
            sa.Column('utm_campaign', sa.String(length=100), nullable=True),
            sa.Column('status', sa.String(length=50), nullable=False, server_default='NEW'),
            sa.Column('assigned_to', sa.String(length=255), nullable=True),
            sa.Column('follow_up_date', sa.String(length=50), nullable=True),
            sa.Column('internal_notes', sa.Text(), nullable=True),
            sa.Column('is_repeat_enquiry', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('previous_enquiry_count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('notification_status', sa.String(length=50), nullable=False, server_default='PENDING'),
            sa.Column('notification_attempts', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('notification_last_error', sa.Text(), nullable=True),
            sa.Column('notification_sent_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('converted_tenant_id', sa.UUID(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['converted_tenant_id'], ['tenants.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_website_leads_email'), 'website_leads', ['email'], unique=False)
        op.create_index(op.f('ix_website_leads_phone'), 'website_leads', ['phone'], unique=False)
        op.create_index(op.f('ix_website_leads_reference_no'), 'website_leads', ['reference_no'], unique=True)
        op.create_index(op.f('ix_website_leads_status'), 'website_leads', ['status'], unique=False)
    else:
        columns = [c['name'] for c in inspector.get_columns('website_leads')]
        if 'notification_status' not in columns:
            op.add_column('website_leads', sa.Column('notification_status', sa.String(length=50), nullable=False, server_default='PENDING'))
        if 'notification_attempts' not in columns:
            op.add_column('website_leads', sa.Column('notification_attempts', sa.Integer(), nullable=False, server_default='0'))
        if 'notification_last_error' not in columns:
            op.add_column('website_leads', sa.Column('notification_last_error', sa.Text(), nullable=True))
        if 'notification_sent_at' not in columns:
            op.add_column('website_leads', sa.Column('notification_sent_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('website_leads')
