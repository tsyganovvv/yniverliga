"""Add context field back to rewiews.

Revision ID: 20260301_0006
Revises: 20260301_0005
Create Date: 2026-03-01 18:15:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260301_0006"
down_revision: Union[str, Sequence[str], None] = "20260301_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE rewiews
        ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT '';
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE rewiews
        DROP COLUMN IF EXISTS context;
        """
    )
