import uuid

from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncConnection

from app.domain.models.rewiew_models import Rewiew
from app.domain.models.topic_models import Topic


TOPICS = [
    {
        "id": uuid.UUID("30000000-0000-0000-0000-000000000001"),
        "name": "Коммуникация",
        "categories": ["Ясность", "Доступность", "Обратная связь"],
        "is_positive": True,
        "is_active": True,
    },
    {
        "id": uuid.UUID("30000000-0000-0000-0000-000000000002"),
        "name": "Соблюдение сроков",
        "categories": ["Планирование", "Ответственность", "Приоритизация"],
        "is_positive": False,
        "is_active": True,
    },
    {
        "id": uuid.UUID("30000000-0000-0000-0000-000000000003"),
        "name": "Командное взаимодействие",
        "categories": ["Поддержка", "Наставничество", "Инициативность"],
        "is_positive": True,
        "is_active": True,
    },
    {
        "id": uuid.UUID("30000000-0000-0000-0000-000000000004"),
        "name": "Качество исполнения",
        "categories": ["Точность", "Внимание к деталям", "Самопроверка"],
        "is_positive": True,
        "is_active": True,
    },
]


REWIEWS = [
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000001"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000001"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000003"),
        "topic": "Коммуникация",
        "category": "Ясность",
        "context": "Созвон по подготовке релиза",
        "is_positive": True,
        "rate": 5,
    },
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000002"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000003"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000001"),
        "topic": "Командное взаимодействие",
        "category": "Поддержка",
        "context": "Парная отладка сложного бага",
        "is_positive": True,
        "rate": 4,
    },
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000003"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000002"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000005"),
        "topic": "Соблюдение сроков",
        "category": "Планирование",
        "context": "Подготовка ежемесячного отчёта по метрикам",
        "is_positive": False,
        "rate": 2,
    },
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000004"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000005"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000002"),
        "topic": "Коммуникация",
        "category": "Обратная связь",
        "context": "Ретроспектива аналитической команды",
        "is_positive": True,
        "rate": 4,
    },
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000005"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000004"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000006"),
        "topic": "Качество исполнения",
        "category": "Внимание к деталям",
        "context": "Обработка сложного клиентского обращения",
        "is_positive": True,
        "rate": 5,
    },
    {
        "id": uuid.UUID("40000000-0000-0000-0000-000000000006"),
        "from_user_id": uuid.UUID("20000000-0000-0000-0000-000000000006"),
        "to_user_id": uuid.UUID("20000000-0000-0000-0000-000000000004"),
        "topic": "Соблюдение сроков",
        "category": "Ответственность",
        "context": "Закрытие очереди заявок в конце недели",
        "is_positive": False,
        "rate": 3,
    },
]


async def seed_topics_and_rewiews(conn: AsyncConnection) -> None:
    await conn.execute(
        insert(Topic)
        .values(TOPICS)
        .on_conflict_do_update(
            index_elements=[Topic.id],
            set_={
                "name": insert(Topic).excluded.name,
                "categories": insert(Topic).excluded.categories,
                "is_positive": insert(Topic).excluded.is_positive,
                "is_active": insert(Topic).excluded.is_active,
            },
        ),
    )

    await conn.execute(
        text(
            """
            DELETE FROM topics AS t
            USING topics AS dup
            WHERE t.name = dup.name
              AND t.ctid > dup.ctid;
            """
        )
    )
    await conn.execute(
        text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'topics_name_key'
                ) THEN
                    ALTER TABLE topics
                    ADD CONSTRAINT topics_name_key UNIQUE (name);
                END IF;
            END $$;
            """
        )
    )

    await conn.execute(
        insert(Rewiew)
        .values(REWIEWS)
        .on_conflict_do_update(
            index_elements=[Rewiew.id],
            set_={
                "from_user_id": insert(Rewiew).excluded.from_user_id,
                "to_user_id": insert(Rewiew).excluded.to_user_id,
                "topic": insert(Rewiew).excluded.topic,
                "category": insert(Rewiew).excluded.category,
                "context": insert(Rewiew).excluded.context,
                "is_positive": insert(Rewiew).excluded.is_positive,
                "rate": insert(Rewiew).excluded.rate,
            },
        ),
    )

    await conn.execute(
        text(
            """
            DELETE FROM rewiews AS r
            WHERE
                from_user_id IS NULL
                OR to_user_id IS NULL
                OR NOT EXISTS (SELECT 1 FROM users AS u WHERE u.id = r.from_user_id)
                OR NOT EXISTS (SELECT 1 FROM users AS u WHERE u.id = r.to_user_id)
                OR NOT EXISTS (SELECT 1 FROM topics AS t WHERE t.name = r.topic);
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            DROP CONSTRAINT IF EXISTS fk_reviews_users;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            ADD CONSTRAINT fk_reviews_users
            FOREIGN KEY (from_user_id)
            REFERENCES users(id)
            ON DELETE RESTRICT;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            DROP CONSTRAINT IF EXISTS rewiews_to_user_id_fkey;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            ADD CONSTRAINT rewiews_to_user_id_fkey
            FOREIGN KEY (to_user_id)
            REFERENCES users(id)
            ON DELETE RESTRICT;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            DROP CONSTRAINT IF EXISTS rewiews_topic_fkey;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            ADD CONSTRAINT rewiews_topic_fkey
            FOREIGN KEY (topic)
            REFERENCES topics(name)
            ON DELETE RESTRICT;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            ALTER COLUMN from_user_id SET NOT NULL;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE rewiews
            ALTER COLUMN to_user_id SET NOT NULL;
            """
        )
    )
