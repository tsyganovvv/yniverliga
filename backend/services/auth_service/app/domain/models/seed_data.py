import uuid
from datetime import date

from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncConnection

from app.domain.models.department_models import Department
from app.domain.models.profile_models import Profile
from app.domain.models.users_models import GenderType, User, UserRole


PASSWORD_HASH = "$2b$12$YZkkjcR6lqQjRx8RSZ6KEOlSxibdn4J6Yd0qT262SUnMjWe7OE/vO"


DEPARTMENTS = [
    {
        "id": uuid.UUID("10000000-0000-0000-0000-000000000001"),
        "name": "Разработка продукта",
        "description": "Команда разработки и поддержки ключевого продукта.",
        "is_active": True,
    },
    {
        "id": uuid.UUID("10000000-0000-0000-0000-000000000002"),
        "name": "Аналитика данных",
        "description": "Отдел аналитики, метрик и внутренних отчётов.",
        "is_active": True,
    },
    {
        "id": uuid.UUID("10000000-0000-0000-0000-000000000003"),
        "name": "Клиентский сервис",
        "description": "Поддержка клиентов и сопровождение обращений.",
        "is_active": True,
    },
    {
        "id": uuid.UUID("10000000-0000-0000-0000-000000000004"),
        "name": "Маркетинг и коммуникации",
        "description": "Внешние и внутренние коммуникации, контент и бренд.",
        "is_active": True,
    },
]


USERS = [
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000001"),
        "username": "ivan.petrov",
        "fullname": "Иван Петров",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000001"),
        "role": UserRole.EMPLOYEE,
        "gender": GenderType.MALE,
        "birth_date": date(1994, 4, 12),
        "is_active": True,
    },
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000002"),
        "username": "olga.smirnova",
        "fullname": "Ольга Смирнова",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000002"),
        "role": UserRole.ADMIN,
        "gender": GenderType.FEMALE,
        "birth_date": date(1990, 11, 5),
        "is_active": True,
    },
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000003"),
        "username": "anna.kuznetsova",
        "fullname": "Анна Кузнецова",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000001"),
        "role": UserRole.EMPLOYEE,
        "gender": GenderType.FEMALE,
        "birth_date": date(1996, 7, 21),
        "is_active": True,
    },
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000004"),
        "username": "sergey.orlov",
        "fullname": "Сергей Орлов",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000003"),
        "role": UserRole.EMPLOYEE,
        "gender": GenderType.MALE,
        "birth_date": date(1989, 1, 30),
        "is_active": True,
    },
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000005"),
        "username": "maria.lebedeva",
        "fullname": "Мария Лебедева",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000002"),
        "role": UserRole.EMPLOYEE,
        "gender": GenderType.FEMALE,
        "birth_date": date(1993, 9, 15),
        "is_active": True,
    },
    {
        "id": uuid.UUID("20000000-0000-0000-0000-000000000006"),
        "username": "dmitry.volkov",
        "fullname": "Дмитрий Волков",
        "department_id": uuid.UUID("10000000-0000-0000-0000-000000000003"),
        "role": UserRole.EMPLOYEE,
        "gender": GenderType.MALE,
        "birth_date": date(1991, 12, 2),
        "is_active": True,
    },
]


PROFILES = [
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000001"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000001"),
        "position": "Ведущий backend-разработчик",
        "rating": 4.6,
    },
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000002"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000002"),
        "position": "Руководитель аналитики",
        "rating": 4.8,
    },
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000003"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000003"),
        "position": "Frontend-разработчик",
        "rating": 4.4,
    },
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000004"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000004"),
        "position": "Старший специалист поддержки",
        "rating": 4.3,
    },
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000005"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000005"),
        "position": "Аналитик данных",
        "rating": 4.5,
    },
    {
        "id": uuid.UUID("50000000-0000-0000-0000-000000000006"),
        "user_id": uuid.UUID("20000000-0000-0000-0000-000000000006"),
        "position": "Руководитель клиентского сервиса",
        "rating": 4.7,
    },
]


async def seed_departments_and_users(conn: AsyncConnection) -> None:
    await conn.execute(
        insert(Department)
        .values(DEPARTMENTS)
        .on_conflict_do_update(
            index_elements=[Department.id],
            set_={
                "name": insert(Department).excluded.name,
                "description": insert(Department).excluded.description,
                "is_active": insert(Department).excluded.is_active,
            },
        ),
    )

    users_payload = [
        {
            **user,
            "hashed_password": PASSWORD_HASH,
        }
        for user in USERS
    ]
    await conn.execute(
        insert(User)
        .values(users_payload)
        .on_conflict_do_update(
            index_elements=[User.id],
            set_={
                "username": insert(User).excluded.username,
                "fullname": insert(User).excluded.fullname,
                "department_id": insert(User).excluded.department_id,
                "role": insert(User).excluded.role,
                "gender": insert(User).excluded.gender,
                "birth_date": insert(User).excluded.birth_date,
                "is_active": insert(User).excluded.is_active,
                "hashed_password": insert(User).excluded.hashed_password,
            },
        ),
    )

    await conn.execute(
        insert(Profile)
        .values(PROFILES)
        .on_conflict_do_update(
            index_elements=[Profile.user_id],
            set_={
                "position": insert(Profile).excluded.position,
                "rating": insert(Profile).excluded.rating,
            },
        ),
    )

    default_department_id = str(DEPARTMENTS[0]["id"])
    await conn.execute(
        text(
            """
            UPDATE users AS u
            SET department_id = CAST(:default_department_id AS uuid)
            WHERE
                department_id IS NULL
                OR NOT EXISTS (
                    SELECT 1
                    FROM departments AS d
                    WHERE d.id = u.department_id
                );
            """
        ),
        {"default_department_id": default_department_id},
    )

    await conn.execute(
        text(
            """
            ALTER TABLE users
            DROP CONSTRAINT IF EXISTS users_department_id_fkey;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE users
            ADD CONSTRAINT users_department_id_fkey
            FOREIGN KEY (department_id)
            REFERENCES departments(id)
            ON DELETE RESTRICT;
            """
        )
    )
    await conn.execute(
        text(
            """
            ALTER TABLE users
            ALTER COLUMN department_id SET NOT NULL;
            """
        )
    )
