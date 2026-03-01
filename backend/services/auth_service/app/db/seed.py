from __future__ import annotations

from datetime import date
from typing import TypedDict
from uuid import UUID

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.domain.models.department_models import Department
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


async def seed_synthetic_data() -> None:
    async with AsyncSessionLocal() as session:
        department_ids = await _seed_departments(session)
        await _seed_users(session, department_ids)
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


async def _seed_users(session: AsyncSession, department_ids: dict[str, UUID]) -> None:
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
            continue

        user.fullname = user_seed["fullname"]
        user.role = user_seed["role"]
        user.department_id = department_id
        user.gender = user_seed["gender"]
        user.birth_date = user_seed["birth_date"]
        user.is_active = user_seed["is_active"]
        if not _matches_default_password(user.hashed_password):
            user.hashed_password = pwd_context.hash(DEFAULT_PASSWORD)


def _matches_default_password(hashed_password: str | None) -> bool:
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(DEFAULT_PASSWORD, hashed_password)
    except Exception:
        return False
