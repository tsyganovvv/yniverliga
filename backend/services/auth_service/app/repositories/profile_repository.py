from uuid import UUID

from sqlalchemy import select, text, update
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.profile_models import Profile
from app.domain.models.users_models import User


class ProfileRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user_id: UUID) -> Profile:
        profile = Profile(user_id=user_id, image=None, rating=0.0, position=None)
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_by_user_id(self, user_id: UUID) -> Profile | None:
        result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id),
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Profile | None:
        result = await self.db.execute(
            select(Profile)
            .join(User, Profile.user_id == User.id)
            .where(User.username == username),
        )
        return result.scalar_one_or_none()

    async def update_image(self, user_id: UUID, image_data: str) -> Profile | None:
        await self.db.execute(
            update(Profile).where(Profile.user_id == user_id).values(image=image_data),
        )
        await self.db.commit()
        return await self.get_by_user_id(user_id)

    async def update_rating(self, user_id: UUID, rating: float) -> Profile | None:
        await self.db.execute(
            update(Profile).where(Profile.user_id == user_id).values(rating=rating),
        )
        await self.db.commit()
        return await self.get_by_user_id(user_id)

    async def calculate_rating(self, user_id: UUID) -> float:
        try:
            result = await self.db.execute(
                text(
                    """
                    SELECT COALESCE(AVG(rate)::float, 0.0)
                    FROM rewiews
                    WHERE to_user_id = CAST(:user_id AS uuid)
                    """
                ),
                {"user_id": str(user_id)},
            )
        except ProgrammingError:
            await self.db.rollback()
            return 0.0
        rating = result.scalar_one_or_none()
        if rating is None:
            return 0.0
        return float(rating)
