"""Initial rate service schema

Revision ID: 20260301_0001
Revises:
Create Date: 2026-03-01 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260301_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "topics",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "categories",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
        sa.Column(
            "is_positive",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "uq_topics_name_polarity",
        "topics",
        ["name", "is_positive"],
        unique=True,
    )

    op.create_table(
        "rewiews",
        sa.Column("to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("from_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column(
            "subcategories",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
        sa.Column("context", sa.Text(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("episode_key", sa.String(length=255), nullable=True),
        sa.Column(
            "is_positive",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["to_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["from_user_id"],
            ["users.id"],
            name="fk_reviews_users",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_rewiews_to_user_id"),
        "rewiews",
        ["to_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_rewiews_from_user_id"),
        "rewiews",
        ["from_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_rewiews_created_at"),
        "rewiews",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "uq_rewiew_episode_once",
        "rewiews",
        ["from_user_id", "to_user_id", "episode_key"],
        unique=True,
        postgresql_where=sa.text("episode_key IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_rewiew_episode_once", table_name="rewiews")
    op.drop_index(op.f("ix_rewiews_created_at"), table_name="rewiews")
    op.drop_index(op.f("ix_rewiews_from_user_id"), table_name="rewiews")
    op.drop_index(op.f("ix_rewiews_to_user_id"), table_name="rewiews")
    op.drop_table("rewiews")

    op.drop_index("uq_topics_name_polarity", table_name="topics")
    op.drop_table("topics")
