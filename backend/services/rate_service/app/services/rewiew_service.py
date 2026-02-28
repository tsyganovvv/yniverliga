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