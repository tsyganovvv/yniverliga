from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.topic_models import Topic
from app.domain.schemas.topic_schemas import TopicSchema

class TopicRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_name(self, topic_name: str, is_positive: bool = True) -> Topic | None:
        result = await self.db.execute(select(Topic).where(Topic.name == topic_name, Topic.is_positive == is_positive))
        return result.scalar_one_or_none()
    
    async def get_all_topics(self) -> list[Topic]:
        result = await self.db.execute(select(Topic))
        return result.scalars().all()
    
    async def create(
        self, topic_data: TopicSchema
    ) -> Topic:
        topic = Topic(
            name=topic_data.name,
            categories=topic_data.categories,
            is_positive=topic_data.is_positive,
            is_active=topic_data.is_active,
        )
        
        self.db.add(topic)
        await self.db.commit()
        await self.db.refresh(topic)
        return topic
    
