from uuid import UUID
from pydantic import Field

from app.domain.schemas import Base


class RewiewSchema(Base):
    from_user_id: UUID
    to_user_id: UUID
    topic: str
    category: str
    subcategories: list[str] = Field(default_factory=list)
    context: str
    comment: str
    episode_key: str | None = None
    is_positive: bool
    score: int | None = Field(default=None, ge=-5, le=5)
