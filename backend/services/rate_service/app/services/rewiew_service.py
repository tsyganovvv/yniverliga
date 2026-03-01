from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.rewiew_repository import RewiewRepository
from app.domain.schemas.rewiew_schemas import RewiewSchema
from app.domain.models.rewiew_models import Rewiew


class RewiewService:
    def __init__(self, db: AsyncSession):
        self.repository = RewiewRepository(db)

    @staticmethod
    def _as_value_error(error: Exception) -> ValueError:
        return ValueError(str(error))
    
    async def create_rewiew(self, rewiew_data: RewiewSchema) -> Rewiew:
        from_user_exists = await self.repository.user_exists(rewiew_data.from_user_id)
        if not from_user_exists:
            raise ValueError("undefined user id in from_user_id")
        to_user_exists = await self.repository.user_exists(rewiew_data.to_user_id)
        if not to_user_exists:
            raise ValueError("undefined user id in to_user_id")
        try:
            result = await self.repository.create(rewiew_data)
        except IntegrityError as e:
            raise ValueError("undefined user id") from e
        except Exception as e:
            raise self._as_value_error(e)
        return result

    async def get_all_rewiews(self) -> list[Rewiew]:
        try:
            return await self.repository.get_all()
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_from_user_id(self, user_id: UUID) -> list[Rewiew]:
        try:
            return await self.repository.get_by_from_user_id(user_id)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_to_user_id(self, user_id: UUID) -> list[Rewiew]:
        try:
            return await self.repository.get_by_to_user_id(user_id)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_category(self, category: str) -> list[Rewiew]:
        try:
            return await self.repository.get_by_category(category)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_positive(self, is_positive: bool) -> list[Rewiew]:
        try:
            return await self.repository.get_by_positive(is_positive)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_rate(self, rate: int) -> list[Rewiew]:
        if rate < 1 or rate > 5:
            raise ValueError("rate must be between 1 and 5")
        try:
            return await self.repository.get_by_rate(rate)
        except Exception as e:
            raise self._as_value_error(e)
