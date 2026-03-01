from __future__ import annotations

from datetime import date
from typing import TypedDict
from uuid import UUID

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.domain.models.department_models import Department
from app.domain.models.rewiew_models import Rewiew
from app.domain.models.topic_models import Topic
from app.domain.models.users_models import GenderType, User, UserRole


class DepartmentSeed(TypedDict):
    id: UUID
    key: str
    name: str
    description: str
    is_active: bool


class UserSeed(TypedDict):
    id: UUID
    username: str
    fullname: str
    role: UserRole
    department_key: str
    gender: GenderType
    birth_date: date
    is_active: bool


class TopicSeed(TypedDict):
    id: UUID
    name: str
    categories: list[str]
    is_positive: bool
    is_active: bool


class RewiewSeed(TypedDict):
    id: UUID
    from_username: str
    to_username: str
    topic: str
    category: str
    context: str
    is_positive: bool
    rate: int


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)
DEFAULT_PASSWORD = "111111"

DEPARTMENTS: list[DepartmentSeed] = [
    {
        "id": UUID("10000000-0000-0000-0000-000000000001"),
        "key": "product",
        "name": "Разработка продукта",
        "description": "Команда разработки и поддержки ключевого продукта.",
        "is_active": True,
    },
    {
        "id": UUID("10000000-0000-0000-0000-000000000002"),
        "key": "analytics",
        "name": "Аналитика данных",
        "description": "Отдел аналитики, метрик и внутренних отчётов.",
        "is_active": True,
    },
    {
        "id": UUID("10000000-0000-0000-0000-000000000003"),
        "key": "support",
        "name": "Клиентский сервис",
        "description": "Поддержка клиентов и сопровождение обращений.",
        "is_active": True,
    },
    {
        "id": UUID("10000000-0000-0000-0000-000000000004"),
        "key": "marketing",
        "name": "Маркетинг и коммуникации",
        "description": "Внешние и внутренние коммуникации, контент и бренд.",
        "is_active": True,
    },
]

USERS: list[UserSeed] = [
    {
        "id": UUID("20000000-0000-0000-0000-000000000001"),
        "username": "ivan.petrov",
        "fullname": "Иван Петров",
        "role": UserRole.ADMIN,
        "department_key": "product",
        "gender": GenderType.MALE,
        "birth_date": date(1991, 5, 11),
        "is_active": True,
    },
    {
        "id": UUID("20000000-0000-0000-0000-000000000002"),
        "username": "olga.smirnova",
        "fullname": "Ольга Смирнова",
        "role": UserRole.ADMIN,
        "department_key": "analytics",
        "gender": GenderType.FEMALE,
        "birth_date": date(1990, 9, 3),
        "is_active": True,
    },
    {
        "id": UUID("20000000-0000-0000-0000-000000000003"),
        "username": "anna.kuznetsova",
        "fullname": "Анна Кузнецова",
        "role": UserRole.EMPLOYEE,
        "department_key": "product",
        "gender": GenderType.FEMALE,
        "birth_date": date(1996, 2, 18),
        "is_active": True,
    },
    {
        "id": UUID("20000000-0000-0000-0000-000000000004"),
        "username": "sergey.orlov",
        "fullname": "Сергей Орлов",
        "role": UserRole.EMPLOYEE,
        "department_key": "support",
        "gender": GenderType.MALE,
        "birth_date": date(1994, 11, 27),
        "is_active": True,
    },
    {
        "id": UUID("20000000-0000-0000-0000-000000000005"),
        "username": "maria.lebedeva",
        "fullname": "Мария Лебедева",
        "role": UserRole.EMPLOYEE,
        "department_key": "analytics",
        "gender": GenderType.FEMALE,
        "birth_date": date(1997, 7, 9),
        "is_active": True,
    },
    {
        "id": UUID("20000000-0000-0000-0000-000000000006"),
        "username": "dmitry.volkov",
        "fullname": "Дмитрий Волков",
        "role": UserRole.EMPLOYEE,
        "department_key": "support",
        "gender": GenderType.MALE,
        "birth_date": date(1993, 3, 14),
        "is_active": True,
    },
]

TOPICS: list[TopicSeed] = [
    {
        "id": UUID("30000000-0000-0000-0000-000000000001"),
        "name": "Коммуникация",
        "categories": ["Ясность", "Доступность", "Обратная связь"],
        "is_positive": True,
        "is_active": True,
    },
    {
        "id": UUID("30000000-0000-0000-0000-000000000002"),
        "name": "Соблюдение сроков",
        "categories": ["Планирование", "Ответственность", "Приоритизация"],
        "is_positive": False,
        "is_active": True,
    },
    {
        "id": UUID("30000000-0000-0000-0000-000000000003"),
        "name": "Командное взаимодействие",
        "categories": ["Поддержка", "Наставничество", "Инициативность"],
        "is_positive": True,
        "is_active": True,
    },
    {
        "id": UUID("30000000-0000-0000-0000-000000000004"),
        "name": "Качество исполнения",
        "categories": ["Точность", "Внимание к деталям", "Самопроверка"],
        "is_positive": True,
        "is_active": True,
    },
]

REWIEWS: list[RewiewSeed] = [
    {
        "id": UUID("40000000-0000-0000-0000-000000000001"),
        "from_username": "ivan.petrov",
        "to_username": "anna.kuznetsova",
        "topic": "Коммуникация",
        "category": "Ясность",
        "context": "Чётко формулирует задачи и быстро даёт обратную связь по работе.",
        "is_positive": True,
        "rate": 5,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000002"),
        "from_username": "anna.kuznetsova",
        "to_username": "ivan.petrov",
        "topic": "Командное взаимодействие",
        "category": "Поддержка",
        "context": "Помог в сложной задаче по релизу и подключил нужных специалистов.",
        "is_positive": True,
        "rate": 4,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000003"),
        "from_username": "olga.smirnova",
        "to_username": "maria.lebedeva",
        "topic": "Соблюдение сроков",
        "category": "Планирование",
        "context": "На последнем цикле спринта оценка задач была неточной и сроки сдвинулись.",
        "is_positive": False,
        "rate": 2,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000004"),
        "from_username": "maria.lebedeva",
        "to_username": "olga.smirnova",
        "topic": "Коммуникация",
        "category": "Обратная связь",
        "context": "По итогам встречи дала структурированные комментарии и понятные шаги.",
        "is_positive": True,
        "rate": 4,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000005"),
        "from_username": "sergey.orlov",
        "to_username": "dmitry.volkov",
        "topic": "Качество исполнения",
        "category": "Внимание к деталям",
        "context": "Подготовил аккуратный отчёт без ошибок и с полными пояснениями.",
        "is_positive": True,
        "rate": 5,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000006"),
        "from_username": "dmitry.volkov",
        "to_username": "sergey.orlov",
        "topic": "Соблюдение сроков",
        "category": "Ответственность",
        "context": "Часть задач была закрыта позже согласованной даты без предварительного сигнала.",
        "is_positive": False,
        "rate": 3,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000007"),
        "from_username": "ivan.petrov",
        "to_username": "sergey.orlov",
        "topic": "Командное взаимодействие",
        "category": "Наставничество",
        "context": "Помог новичку адаптироваться в процессах и сопровождал в первые недели.",
        "is_positive": True,
        "rate": 5,
    },
    {
        "id": UUID("40000000-0000-0000-0000-000000000008"),
        "from_username": "olga.smirnova",
        "to_username": "anna.kuznetsova",
        "topic": "Коммуникация",
        "category": "Доступность",
        "context": "Оперативно отвечает в рабочем чате и держит всех в курсе прогресса.",
        "is_positive": True,
        "rate": 4,
    },
]


async def seed_synthetic_data() -> None:
    async with AsyncSessionLocal() as session:
        department_ids = await _seed_departments(session)
        user_ids = await _seed_users(session, department_ids)
        topic_categories = await _seed_topics(session)
        await _seed_rewiews(session, user_ids, topic_categories)
        await session.commit()


async def _seed_departments(session: AsyncSession) -> dict[str, UUID]:
    department_ids: dict[str, UUID] = {}

    for department_seed in DEPARTMENTS:
        department = (
            await session.execute(
                select(Department).where(Department.name == department_seed["name"]),
            )
        ).scalar_one_or_none()

        if department is None:
            department = Department(
                id=department_seed["id"],
                name=department_seed["name"],
                description=department_seed["description"],
                is_active=department_seed["is_active"],
            )
            session.add(department)
            await session.flush()
        else:
            department.description = department_seed["description"]
            department.is_active = department_seed["is_active"]

        department_ids[department_seed["key"]] = department.id

    return department_ids


async def _seed_users(session: AsyncSession, department_ids: dict[str, UUID]) -> dict[str, UUID]:
    user_ids: dict[str, UUID] = {}

    for user_seed in USERS:
        department_id = department_ids[user_seed["department_key"]]
        user = (
            await session.execute(
                select(User).where(User.username == user_seed["username"]),
            )
        ).scalar_one_or_none()

        if user is None:
            user = User(
                id=user_seed["id"],
                username=user_seed["username"],
                hashed_password=pwd_context.hash(DEFAULT_PASSWORD),
                fullname=user_seed["fullname"],
                role=user_seed["role"],
                department_id=department_id,
                gender=user_seed["gender"],
                birth_date=user_seed["birth_date"],
                is_active=user_seed["is_active"],
            )
            session.add(user)
            await session.flush()
        else:
            user.fullname = user_seed["fullname"]
            user.role = user_seed["role"]
            user.department_id = department_id
            user.gender = user_seed["gender"]
            user.birth_date = user_seed["birth_date"]
            user.is_active = user_seed["is_active"]
            if not _matches_default_password(user.hashed_password):
                user.hashed_password = pwd_context.hash(DEFAULT_PASSWORD)

        user_ids[user_seed["username"]] = user.id

    return user_ids


def _matches_default_password(hashed_password: str | None) -> bool:
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(DEFAULT_PASSWORD, hashed_password)
    except Exception:
        return False


async def _seed_topics(session: AsyncSession) -> dict[str, list[str]]:
    topic_categories: dict[str, list[str]] = {}

    for topic_seed in TOPICS:
        topic = (
            await session.execute(
                select(Topic).where(Topic.name == topic_seed["name"]),
            )
        ).scalar_one_or_none()

        if topic is None:
            topic = Topic(
                id=topic_seed["id"],
                name=topic_seed["name"],
                categories=topic_seed["categories"],
                is_positive=topic_seed["is_positive"],
                is_active=topic_seed["is_active"],
            )
            session.add(topic)
            await session.flush()
        else:
            topic.categories = topic_seed["categories"]
            topic.is_positive = topic_seed["is_positive"]
            topic.is_active = topic_seed["is_active"]

        topic_categories[topic_seed["name"]] = topic_seed["categories"]

    return topic_categories


async def _seed_rewiews(
    session: AsyncSession,
    user_ids: dict[str, UUID],
    topic_categories: dict[str, list[str]],
) -> None:
    for rewiew_seed in REWIEWS:
        from_user_id = user_ids.get(rewiew_seed["from_username"])
        to_user_id = user_ids.get(rewiew_seed["to_username"])
        if from_user_id is None or to_user_id is None:
            continue

        categories = topic_categories.get(rewiew_seed["topic"], [])
        if rewiew_seed["category"] not in categories:
            continue

        rewiew = await session.get(Rewiew, rewiew_seed["id"])
        if rewiew is None:
            rewiew = Rewiew(
                id=rewiew_seed["id"],
                from_user_id=from_user_id,
                to_user_id=to_user_id,
                topic=rewiew_seed["topic"],
                category=rewiew_seed["category"],
                context=rewiew_seed["context"],
                is_positive=rewiew_seed["is_positive"],
                rate=rewiew_seed["rate"],
            )
            session.add(rewiew)
            continue

        rewiew.from_user_id = from_user_id
        rewiew.to_user_id = to_user_id
        rewiew.topic = rewiew_seed["topic"]
        rewiew.category = rewiew_seed["category"]
        rewiew.context = rewiew_seed["context"]
        rewiew.is_positive = rewiew_seed["is_positive"]
        rewiew.rate = rewiew_seed["rate"]
