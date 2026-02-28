from app.domain.schemas import Base


class TopicSchema(Base):
    name: str
    categories: list[str]
    is_positive: bool