from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.topic_service import TopicService
from app.services.rewiew_service import RewiewService


def get_topic_service(db: AsyncSession = Depends(get_db)) -> TopicService:
    return TopicService(db)

def get_rewiew_service(db: AsyncSession = Depends(get_db)) -> RewiewService:
    return RewiewService(db)

