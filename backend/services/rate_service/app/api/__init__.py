from fastapi import APIRouter
from .v1.endpoints import reviews, topics

router = APIRouter()

router.include_router(
    reviews.router, prefix="/v1/reviews", tags=["reviews"]
)

router.include_router(
    topics.router, prefix="/v1/topics", tags=["topics"]
)