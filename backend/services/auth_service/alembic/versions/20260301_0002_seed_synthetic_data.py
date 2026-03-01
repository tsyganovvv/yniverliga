"""Seed auth tables with synthetic data.

Revision ID: 20260301_0002
Revises: 20260301_0001
Create Date: 2026-03-01 13:30:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260301_0002"
down_revision: Union[str, Sequence[str], None] = "20260301_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # password for all seeded users: pass123
    password_hash = "$2b$12$b5EIBxotUpcCBmwHqRE7fuYpftUpD4Eu1fiiYvIKWvJqKLg.avNuW"

    op.execute(
        """
        INSERT INTO departments (id, name, description, is_active)
        VALUES
            ('11111111-1111-1111-1111-111111111111'::uuid, 'Seed Engineering', 'Synthetic engineering department', true),
            ('22222222-2222-2222-2222-222222222222'::uuid, 'Seed Product', 'Synthetic product department', true),
            ('33333333-3333-3333-3333-333333333333'::uuid, 'Seed HR', 'Synthetic HR department', true)
        ON CONFLICT (name) DO NOTHING
        """
    )

    op.execute(
        f"""
        INSERT INTO users (
            id, username, hashed_password, fullname, role, department_id, gender,
            birth_date, is_active
        )
        VALUES
            (
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
                'seed_alice',
                '{password_hash}',
                'Seed Alice',
                'EMPLOYEE'::user_role,
                '11111111-1111-1111-1111-111111111111'::uuid,
                'FEMALE'::gender_type,
                '1994-04-11',
                true
            ),
            (
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
                'seed_bob',
                '{password_hash}',
                'Seed Bob',
                'ADMIN'::user_role,
                '22222222-2222-2222-2222-222222222222'::uuid,
                'MALE'::gender_type,
                '1992-08-19',
                true
            ),
            (
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
                'seed_carol',
                '{password_hash}',
                'Seed Carol',
                'EMPLOYEE'::user_role,
                '11111111-1111-1111-1111-111111111111'::uuid,
                'NOT_SPECIFIED'::gender_type,
                '1996-01-28',
                true
            )
        ON CONFLICT (username) DO NOTHING
        """
    )

    op.execute(
        """
        INSERT INTO sessions (id, token_hash, user_id, expires_at)
        VALUES
            (
                'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
                'c26a7f01074b72beff2295b5cb02eb0b0fa871f4aca30367c51ffcd0c68d4832',
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
                now() + interval '30 days'
            ),
            (
                'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
                '1ccf8933062b5a156c5f57ad39314916ec1cbf46db164a70721323b8523c7068',
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
                now() + interval '30 days'
            )
        ON CONFLICT (id) DO NOTHING
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM sessions
        WHERE id IN (
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid
        )
        """
    )
    op.execute(
        """
        DELETE FROM users
        WHERE id IN (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid
        )
        """
    )
    op.execute(
        """
        DELETE FROM departments
        WHERE id IN (
            '11111111-1111-1111-1111-111111111111'::uuid,
            '22222222-2222-2222-2222-222222222222'::uuid,
            '33333333-3333-3333-3333-333333333333'::uuid
        )
        """
    )
