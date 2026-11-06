"""rotate predictable legacy hall-ticket QR verification codes

Revision ID: f2c3d4e5a6b7
Revises: e1b2c3d4f5a6
Create Date: 2026-11-06 18:10:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "f2c3d4e5a6b7"
down_revision: Union[str, Sequence[str], None] = "e1b2c3d4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Legacy QR values embedded ticket/admission data and were guessable.
    # Replace them with 72 hex characters from two PostgreSQL UUID generators.
    op.execute("""
        UPDATE hall_tickets
        SET qr_verification_code = replace(gen_random_uuid()::text, '-', '')
                                  || replace(gen_random_uuid()::text, '-', '')
        WHERE qr_verification_code LIKE 'TICKET:%'
    """)


def downgrade() -> None:
    # Rotated bearer secrets cannot be reconstructed safely.
    pass
