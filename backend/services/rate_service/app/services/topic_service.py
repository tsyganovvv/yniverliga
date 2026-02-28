from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.schemas.topic_schemas import TopicSchema
from app.domain.models.topic_models import Topic
from app.repositories.topics_repository import TopicRepository


class TopicService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = TopicRepository(db)

    async def create_topic(self, topic_data: TopicSchema) -> Topic:
        existing_topic = await self.repository.get_by_name(topic_data.name, topic_data.is_positive)
        if existing_topic and existing_topic.is_positive == topic_data.is_positive:
            raise ValueError("This topic already exists")
        result = await self.repository.create(topic_data)
        return result
    
    async def get_topics(self)->list[Topic]:
        result = await self.repository.get_all_topics()
        return result