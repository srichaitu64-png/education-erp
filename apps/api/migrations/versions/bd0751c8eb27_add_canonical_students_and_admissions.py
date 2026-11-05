"""add_canonical_students_and_admissions

Revision ID: bd0751c8eb27
Revises: fb126a33b6fc
Create Date: 2026-11-05 09:00:44.842658

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'bd0751c8eb27'
down_revision: Union[str, Sequence[str], None] = 'fb126a33b6fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create students table if not exists
    op.create_table(
        'students',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('admission_number', sa.String(length=64), nullable=False),
        sa.Column('pen_number', sa.String(length=64), nullable=True),
        sa.Column('registration_number', sa.String(length=64), nullable=True),
        sa.Column('first_name', sa.String(length=128), nullable=False),
        sa.Column('middle_name', sa.String(length=128), nullable=True),
        sa.Column('last_name', sa.String(length=128), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=16), nullable=True),
        sa.Column('blood_group', sa.String(length=8), nullable=True),
        sa.Column('father_name', sa.String(length=255), nullable=True),
        sa.Column('mother_name', sa.String(length=255), nullable=True),
        sa.Column('guardian_name', sa.String(length=255), nullable=True),
        sa.Column('father_mobile', sa.String(length=32), nullable=True),
        sa.Column('mother_mobile', sa.String(length=32), nullable=True),
        sa.Column('guardian_phone', sa.String(length=32), nullable=True),
        sa.Column('parent_email', sa.String(length=255), nullable=True),
        sa.Column('emergency_contact', sa.String(length=32), nullable=True),
        sa.Column('door_street', sa.String(length=255), nullable=True),
        sa.Column('city_town', sa.String(length=128), nullable=True),
        sa.Column('district_state', sa.String(length=128), nullable=True),
        sa.Column('pincode', sa.String(length=16), nullable=True),
        sa.Column('academic_year', sa.String(length=32), nullable=False),
        sa.Column('institution_level', sa.String(length=64), nullable=False),
        sa.Column('class_name', sa.String(length=64), nullable=False),
        sa.Column('section_or_stream', sa.String(length=64), nullable=False),
        sa.Column('roll_number', sa.String(length=32), nullable=True),
        sa.Column('admission_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('masked_aadhaar', sa.String(length=32), nullable=True),
        sa.Column('fee_balance', sa.Float(), nullable=False),
        sa.Column('attendance_pct', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('updated_by', sa.UUID(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'admission_number', name='uq_tenant_student_admission_number'),
        if_not_exists=True
    )
    op.create_index('idx_student_tenant_class', 'students', ['tenant_id', 'class_name'], if_not_exists=True)
    op.create_index('idx_student_tenant_status', 'students', ['tenant_id', 'status'], if_not_exists=True)
    op.create_index(op.f('ix_students_tenant_id'), 'students', ['tenant_id'], if_not_exists=True)
    op.create_index(op.f('ix_students_admission_number'), 'students', ['admission_number'], if_not_exists=True)
    op.create_index(op.f('ix_students_first_name'), 'students', ['first_name'], if_not_exists=True)
    op.create_index(op.f('ix_students_last_name'), 'students', ['last_name'], if_not_exists=True)
    op.create_index(op.f('ix_students_class_name'), 'students', ['class_name'], if_not_exists=True)

    # 2. Create admission_applications table if not exists
    op.create_table(
        'admission_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('application_number', sa.String(length=64), nullable=False),
        sa.Column('applicant_name', sa.String(length=255), nullable=False),
        sa.Column('level', sa.String(length=64), nullable=False),
        sa.Column('target_class', sa.String(length=64), nullable=False),
        sa.Column('parent_name', sa.String(length=255), nullable=False),
        sa.Column('parent_phone', sa.String(length=32), nullable=False),
        sa.Column('parent_email', sa.String(length=255), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=16), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('submission_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('reviewed_by', sa.String(length=255), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('enrolled_student_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('updated_by', sa.UUID(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'application_number', name='uq_tenant_admission_app_no'),
        if_not_exists=True
    )
    op.create_index('idx_admission_tenant_status', 'admission_applications', ['tenant_id', 'status'], if_not_exists=True)
    op.create_index(op.f('ix_admission_applications_tenant_id'), 'admission_applications', ['tenant_id'], if_not_exists=True)
    op.create_index(op.f('ix_admission_applications_application_number'), 'admission_applications', ['application_number'], if_not_exists=True)


def downgrade() -> None:
    op.drop_table('admission_applications', if_exists=True)
    op.drop_table('students', if_exists=True)

