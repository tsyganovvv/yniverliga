from pydantic import Field

from app.domain.schemas import Base


class TopicSchema(Base):
    name: str
    categories: list[str] = Field(default_factory=list)
    is_positive: bool
    is_active: bool = True
