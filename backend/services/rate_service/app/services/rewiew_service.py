from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.rewiew_repository import RewiewRepository
from app.domain.schemas.rewiew_schemas import RewiewSchema
from app.domain.models.rewiew_models import Rewiew


class RewiewService:
    def __init__(self, db: AsyncSession):
        self.repository = RewiewRepository(db)
    
    async def create_rewiew(self, rewiew_data: RewiewSchema) -> Rewiew:
        try:
            result = await self.repository.create(rewiew_data)
        except Exception as e:
            raise ValueError(str(e))
        return result

    async def get_all_rewiews(self) -> list[Rewiew]:
        return await self.repository.get_all()

    async def get_rewiews_by_from_user_id(self, user_id: UUID) -> list[Rewiew]:
        return await self.repository.get_by_from_user_id(user_id)

    async def get_rewiews_by_to_user_id(self, user_id: UUID) -> list[Rewiew]:
        return await self.repository.get_by_to_user_id(user_id)

    async def get_rewiews_by_category(self, category: str) -> list[Rewiew]:
        return await self.repository.get_by_category(category)

    async def get_rewiews_by_positive(self, is_positive: bool) -> list[Rewiew]:
        return await self.repository.get_by_positive(is_positive)

    async def get_rewiews_by_rate(self, rate: int) -> list[Rewiew]:
        if rate < 1 or rate > 5:
            raise ValueError("rate must be between 1 and 5")
        return await self.repository.get_by_rate(rate)
