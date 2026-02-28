from uuid import UUID

from app.domain.schemas import Base


class RewiewSchema(Base):
    from_user_id: UUID
    to_user_id: UUID
    topic: str
    category: str
    is_positive: bool