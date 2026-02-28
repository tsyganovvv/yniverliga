
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.users_models import User
from app.domain.schemas.users_schemas import UserCreate, UserUpdateInDB


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.username == username),
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        result = await self.db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(
        self, user_data: UserCreate, hashed_password: str | None = None,
    ) -> User:
        db_user = User(
            username=user_data.username,
            fullname=user_data.fullname,
            hashed_password=hashed_password,
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def update(
        self, username: str, user_data: UserUpdateInDB,
    ) -> User | None:
        update_data = user_data.model_dump()
        if not update_data:
            return None
        await self.db.execute(
            update(User).where(User.username == username).values(**update_data),
        )
        await self.db.commit()
        return await self.get_by_username(username)

    async def delete(self, username: str) -> bool:
        await self.db.execute(delete(User).where(User.username == username))
        await self.db.commit()
        return True
