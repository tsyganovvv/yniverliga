"""Align rate schema with feedback requirements.

Revision ID: 20260301_0002
Revises: 20260301_0001
Create Date: 2026-03-01 12:20:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "20260301_0002"
down_revision: Union[str, Sequence[str], None] = "20260301_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "topics",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )

    op.alter_column(
        "topics",
        "categories",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="categories::jsonb",
        existing_nullable=False,
        existing_server_default=sa.text("'[]'::json"),
    )
    op.alter_column(
        "topics",
        "categories",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        server_default=sa.text("'[]'::jsonb"),
        existing_nullable=False,
    )
    op.create_index("ix_topics_is_active", "topics", ["is_active"], unique=False)
    op.create_index(
        "ix_topics_categories_gin",
        "topics",
        ["categories"],
        unique=False,
        postgresql_using="gin",
    )

    op.add_column("rewiews", sa.Column("score", sa.SmallInteger(), nullable=True))
    op.create_check_constraint(
        "ck_rewiews_score_range",
        "rewiews",
        "score IS NULL OR score BETWEEN -5 AND 5",
    )
    op.execute("UPDATE rewiews SET context = '' WHERE context IS NULL")
    op.execute("UPDATE rewiews SET comment = '' WHERE comment IS NULL")
    op.alter_column(
        "rewiews",
        "context",
        existing_type=sa.Text(),
        nullable=False,
    )
    op.alter_column(
        "rewiews",
        "comment",
        existing_type=sa.Text(),
        nullable=False,
    )
    op.alter_column(
        "rewiews",
        "subcategories",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="subcategories::jsonb",
        existing_nullable=False,
        existing_server_default=sa.text("'[]'::json"),
    )
    op.alter_column(
        "rewiews",
        "subcategories",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        server_default=sa.text("'[]'::jsonb"),
        existing_nullable=False,
    )
    op.create_index("ix_rewiews_category", "rewiews", ["category"], unique=False)
    op.create_index("ix_rewiews_is_positive", "rewiews", ["is_positive"], unique=False)
    op.create_index(
        "ix_rewiews_to_user_created_at",
        "rewiews",
        ["to_user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_rewiews_subcategories_gin",
        "rewiews",
        ["subcategories"],
        unique=False,
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_rewiews_subcategories_gin", table_name="rewiews")
    op.drop_index("ix_rewiews_to_user_created_at", table_name="rewiews")
    op.drop_index("ix_rewiews_is_positive", table_name="rewiews")
    op.drop_index("ix_rewiews_category", table_name="rewiews")
    op.alter_column(
        "rewiews",
        "subcategories",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="subcategories::json",
        existing_nullable=False,
        existing_server_default=sa.text("'[]'::jsonb"),
    )
    op.alter_column(
        "rewiews",
        "subcategories",
        existing_type=sa.JSON(),
        server_default=sa.text("'[]'::json"),
        existing_nullable=False,
    )
    op.alter_column(
        "rewiews",
        "comment",
        existing_type=sa.Text(),
        nullable=True,
    )
    op.alter_column(
        "rewiews",
        "context",
        existing_type=sa.Text(),
        nullable=True,
    )
    op.drop_constraint("ck_rewiews_score_range", "rewiews", type_="check")
    op.drop_column("rewiews", "score")

    op.drop_index("ix_topics_categories_gin", table_name="topics")
    op.drop_index("ix_topics_is_active", table_name="topics")
    op.alter_column(
        "topics",
        "categories",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="categories::json",
        existing_nullable=False,
        existing_server_default=sa.text("'[]'::jsonb"),
    )
    op.alter_column(
        "topics",
        "categories",
        existing_type=sa.JSON(),
        server_default=sa.text("'[]'::json"),
        existing_nullable=False,
    )
    op.drop_column("topics", "is_active")
