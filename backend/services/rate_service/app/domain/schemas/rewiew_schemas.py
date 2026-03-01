from uuid import UUID
from pydantic import Field

from app.domain.schemas import Base


class RewiewSchema(Base):
    from_user_id: UUID
    to_user_id: UUID
    topic: str
    category: str
    context: str = Field(min_length=1, max_length=5000)
    is_positive: bool
    rate: int = Field(ge=1, le=5)
