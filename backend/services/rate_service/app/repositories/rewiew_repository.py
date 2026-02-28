from uuid import UUID
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.rewiew_models import Rewiew
from app.domain.schemas.rewiew_schemas import RewiewSchema


class RewiewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, rewiew_id: int) -> Rewiew | None:
        result = await self.db.execute(select(Rewiew).where(Rewiew.id == rewiew_id))
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Rewiew]:
        result = await self.db.execute(select(Rewiew).offset(skip).limit(limit))
        return result.scalars().all()
    
    async def get_by_category(self, category: str) -> list[Rewiew]:
        result = await self.db.execute(
            select(Rewiew).where(Rewiew.category == category),
        )
        return result.scalars().all()
    
    async def get_by_positive(self, is_positive: bool) -> list[Rewiew]:
        result = await self.db.execute(
            select(Rewiew).where(Rewiew.is_positive == is_positive),
        )
        return result.scalars().all()
    
    async def get_by_from_user_id(self, user_id: UUID) -> list[Rewiew]:
        result = await self.db.execute(
            select(Rewiew).where(Rewiew.from_user_id == user_id)
        )
        return result.scalars().all()
    
    async def get_by_to_user_id(self, user_id: UUID) -> list[Rewiew]:
        result = await self.db.execute(
            select(Rewiew).where(Rewiew.to_user_id == user_id)
        )
        return result.scalars().all()
    
    async def create(self, rewiew_data: RewiewSchema) -> Rewiew | None:
        db_rewiew = Rewiew(
            topic=rewiew_data.topic,
            category=rewiew_data.category,
            to_user_id=rewiew_data.to_user_id,
            from_user_id=rewiew_data.from_user_id,
            is_positive=rewiew_data.is_positive
        )
        self.db.add(db_rewiew)
        await self.db.commit()
        await self.db.refresh(db_rewiew)
        return db_rewiew
