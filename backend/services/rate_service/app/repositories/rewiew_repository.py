from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.domain.models.rewiew_models import Rewiew
from app.domain.models.users_models import User
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

    async def get_by_rate(self, rate: int) -> list[Rewiew]:
        result = await self.db.execute(
            select(Rewiew).where(Rewiew.rate == rate),
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

    async def user_exists(self, user_id: UUID) -> bool:
        result = await self.db.execute(
            select(User.id).where(User.id == user_id),
        )
        return result.scalar_one_or_none() is not None
    
    async def create(self, rewiew_data: RewiewSchema) -> Rewiew | None:
        db_rewiew = Rewiew(
            topic=rewiew_data.topic,
            category=rewiew_data.category,
            context=rewiew_data.context,
            to_user_id=rewiew_data.to_user_id,
            from_user_id=rewiew_data.from_user_id,
            is_positive=rewiew_data.is_positive,
            rate=rewiew_data.rate,
        )
        self.db.add(db_rewiew)
        await self.db.commit()
        await self.db.refresh(db_rewiew)
        return db_rewiew

    async def get_report_rows(self) -> list[dict]:
        from_user = aliased(User)
        to_user = aliased(User)

        result = await self.db.execute(
            select(
                Rewiew,
                from_user.username,
                from_user.fullname,
                to_user.username,
                to_user.fullname,
            )
            .outerjoin(from_user, Rewiew.from_user_id == from_user.id)
            .outerjoin(to_user, Rewiew.to_user_id == to_user.id)
            .order_by(Rewiew.created_at.desc()),
        )

        rows = []
        for rewiew, from_username, from_fullname, to_username, to_fullname in result.all():
            rows.append(
                {
                    "review_id": str(rewiew.id),
                    "created_at": rewiew.created_at.isoformat() if rewiew.created_at else "",
                    "from_user_id": str(rewiew.from_user_id) if rewiew.from_user_id else "",
                    "from_username": from_username or "Удален",
                    "from_fullname": from_fullname or "Удален",
                    "to_user_id": str(rewiew.to_user_id) if rewiew.to_user_id else "",
                    "to_username": to_username or "Удален",
                    "to_fullname": to_fullname or "Удален",
                    "context": rewiew.context or "",
                    "topic": rewiew.topic or "",
                    "category": rewiew.category or "",
                    "feedback_type": "Позитивный" if rewiew.is_positive else "Негативный",
                    "rate": rewiew.rate,
                }
            )
        return rows
