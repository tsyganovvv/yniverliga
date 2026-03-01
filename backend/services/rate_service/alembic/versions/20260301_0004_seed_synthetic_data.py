"""Seed rate tables with synthetic data.

Revision ID: 20260301_0004
Revises: 20260301_0003
Create Date: 2026-03-01 13:33:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260301_0004"
down_revision: Union[str, Sequence[str], None] = "20260301_0003"
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
                '["ясность", "доступность", "обратная связь"]'::jsonb,
                true,
                true
            ),
            (
                'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
                'Сроки',
                '["планирование", "эскалация", "ответственность"]'::jsonb,
                false,
                true
            ),
            (
                'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
                'Командность',
                '["поддержка", "вовлеченность", "инициативность"]'::jsonb,
                true,
                true
            )
        ON CONFLICT (name, is_positive) DO NOTHING
        """
    )

    op.execute(
        """
        INSERT INTO rewiews (
            id, from_user_id, to_user_id, topic, category, subcategories,
            context, comment, episode_key, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
            'Коммуникация',
            'ясность',
            '["ясность", "обратная связь"]'::jsonb,
            'Синк по релизу v1.7',
            'Четко разложил блокеры и быстро согласовал решение',
            'seed-episode-comm-1',
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
            id, from_user_id, to_user_id, topic, category, subcategories,
            context, comment, episode_key, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
            'Сроки',
            'планирование',
            '["планирование", "ответственность"]'::jsonb,
            'Подготовка квартального отчета',
            'Оценка рисков была запоздалой, сроки пришлось сдвигать',
            'seed-episode-deadline-1',
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
            id, from_user_id, to_user_id, topic, category, subcategories,
            context, comment, episode_key, is_positive, rate
        )
        SELECT
            'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
            'Командность',
            'поддержка',
            '["поддержка", "вовлеченность"]'::jsonb,
            'Онбординг нового сотрудника',
            'Активно помогал коллеге в первый спринт',
            'seed-episode-team-1',
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
        DELETE FROM rewiews
        WHERE id IN (
            'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
            'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
            'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid
        )
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
