from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.services import get_topic_service
from app.domain.schemas.topic_schemas import TopicSchema
from app.services.topic_service import TopicService


router = APIRouter()

@router.get('/health')
def health_check():
    return {
        "success": True
    }

@router.post(
    "/", status_code=status.HTTP_201_CREATED,
)
async def create_topic(
    topic_data: TopicSchema, service: Annotated[TopicService, Depends(get_topic_service)],
):
    try:
        return await service.create_topic(topic_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/", status_code=status.HTTP_200_OK,
)
async def get_topics(
    service: Annotated[TopicService, Depends(get_topic_service)],
):
    try:
        return await service.get_topics()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )