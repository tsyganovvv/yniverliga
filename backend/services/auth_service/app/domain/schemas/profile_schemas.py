from datetime import datetime
from uuid import UUID

from app.domain.schemas import Base


class ProfileBase(Base):
    image: str | None = None
    rating: float = 0.0
    position: str | None = None
    user_id: UUID


class ProfileResponse(ProfileBase):
    id: UUID
    username: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
