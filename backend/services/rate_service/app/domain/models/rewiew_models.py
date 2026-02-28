from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Enum, UUID
from sqlalchemy.orm import relationship

from app.domain.models import BaseModel


class Rewiew(BaseModel):
    __tablename__ = "rewiews"

    to_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    from_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_reviews_users"),
        nullable=True,
    )
    topic = Column(String(255), nullable=False)

    category = Column(String(255), nullable=False)
    is_positive = Column(Boolean, nullable=False, default=True)