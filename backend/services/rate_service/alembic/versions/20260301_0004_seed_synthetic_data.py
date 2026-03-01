"""Seed synthetic data for topics and rewiews.

Revision ID: 20260301_0004
Revises:
Create Date: 2026-03-01 13:10:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260301_0004"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO topics (id, name, categories, is_positive, is_active)
        VALUES
            (
                'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
                'Коммуникация',
                '["ясность","доступность","обратная связь"]'::jsonb,
                true,
                true
            ),
            (
                'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
                'Сроки',
                '["планирование","эскалация","ответственность"]'::jsonb,
                false,
                true
            ),
            (
                'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
                'Командность',
                '["поддержка","вовлеченность","инициативность"]'::jsonb,
                true,
                true
            )
        ON CONFLICT (id) DO NOTHING
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rewiews') THEN
                RETURN;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'rewiews' AND column_name = 'context'
            ) THEN
                INSERT INTO rewiews (
                    id, from_user_id, to_user_id, topic, category,
                    subcategories, context, comment, episode_key, is_positive, rate
                )
                SELECT
                    'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
                    'Коммуникация',
                    'ясность',
                    '["ясность","доступность"]'::jsonb,
                    'Совместная подготовка релиза',
                    'Быстро синхронизировал команду',
                    'seed-episode-1',
                    true,
                    5
                WHERE
                    EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid)
                    AND EXISTS (SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid)
                ON CONFLICT (id) DO NOTHING;
            ELSE
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
                ON CONFLICT (id) DO NOTHING;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM rewiews
        WHERE id = 'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid
        """
    )
    op.execute(
        """
        DELETE FROM topics
        WHERE id IN (
            'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
            'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
            'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid
        )
        """
    )
