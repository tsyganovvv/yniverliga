"""Drop unrequested rewiew fields and keep only rate extension.

Revision ID: 20260301_0005
Revises: 20260301_0004
Create Date: 2026-03-01 14:35:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260301_0005"
down_revision: Union[str, Sequence[str], None] = "20260301_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE schemaname = current_schema()
                  AND indexname = 'ix_rewiews_subcategories_gin'
            ) THEN
                EXECUTE 'DROP INDEX ix_rewiews_subcategories_gin';
            END IF;

            IF EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE schemaname = current_schema()
                  AND indexname = 'uq_rewiew_episode_once'
            ) THEN
                EXECUTE 'DROP INDEX uq_rewiew_episode_once';
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'rewiews' AND column_name = 'episode_key'
            ) THEN
                ALTER TABLE rewiews DROP COLUMN episode_key;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'rewiews' AND column_name = 'comment'
            ) THEN
                ALTER TABLE rewiews DROP COLUMN comment;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'rewiews' AND column_name = 'context'
            ) THEN
                ALTER TABLE rewiews DROP COLUMN context;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'rewiews' AND column_name = 'subcategories'
            ) THEN
                ALTER TABLE rewiews DROP COLUMN subcategories;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        INSERT INTO rewiews (
            id, from_user_id, to_user_id, topic, category, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
            'Коммуникация',
            'ясность',
            true,
            5
        WHERE
            EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid)
            AND EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid)
        ON CONFLICT (id) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO rewiews (
            id, from_user_id, to_user_id, topic, category, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
            'Сроки',
            'планирование',
            false,
            2
        WHERE
            EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid)
            AND EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid)
        ON CONFLICT (id) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO rewiews (
            id, from_user_id, to_user_id, topic, category, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
            'Командность',
            'поддержка',
            true,
            4
        WHERE
            EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid)
            AND EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid)
        ON CONFLICT (id) DO NOTHING
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE rewiews
            ADD COLUMN IF NOT EXISTS subcategories jsonb NOT NULL DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS comment text NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS episode_key varchar(255);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_rewiews_subcategories_gin
        ON rewiews USING gin (subcategories);
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_rewiew_episode_once
        ON rewiews (from_user_id, to_user_id, episode_key)
        WHERE episode_key IS NOT NULL;
        """
    )
