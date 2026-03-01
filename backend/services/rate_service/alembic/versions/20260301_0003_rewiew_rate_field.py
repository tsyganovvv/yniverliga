"""Replace rewiew score with rate.

Revision ID: 20260301_0003
Revises: 20260301_0002
Create Date: 2026-03-01 12:45:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260301_0003"
down_revision: Union[str, Sequence[str], None] = "20260301_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_rewiews_score_range", "rewiews", type_="check")
    op.alter_column(
        "rewiews",
        "score",
        existing_type=sa.SmallInteger(),
        new_column_name="rate",
    )
    op.execute(
        """
        UPDATE rewiews
        SET rate = CASE
            WHEN rate IS NULL THEN 1
            WHEN rate < 1 THEN 1
            WHEN rate > 5 THEN 5
            ELSE rate
        END
        """
    )
    op.alter_column(
        "rewiews",
        "rate",
        existing_type=sa.SmallInteger(),
        nullable=False,
    )
    op.create_check_constraint(
        "ck_rewiews_rate_range",
        "rewiews",
        "rate BETWEEN 1 AND 5",
    )
    op.create_index("ix_rewiews_rate", "rewiews", ["rate"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_rewiews_rate", table_name="rewiews")
    op.drop_constraint("ck_rewiews_rate_range", "rewiews", type_="check")
    op.alter_column(
        "rewiews",
        "rate",
        existing_type=sa.SmallInteger(),
        nullable=True,
    )
    op.alter_column(
        "rewiews",
        "rate",
        existing_type=sa.SmallInteger(),
        new_column_name="score",
    )
    op.create_check_constraint(
        "ck_rewiews_score_range",
        "rewiews",
        "score IS NULL OR score BETWEEN -5 AND 5",
    )
