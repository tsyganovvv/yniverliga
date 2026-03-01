from sqlalchemy import Column, Float, ForeignKey, String, Text, UUID

from app.domain.models import BaseModel


class Profile(BaseModel):
    __tablename__ = "profiles"

    image = Column(Text, nullable=True, default=None)
    rating = Column(Float, nullable=False, default=0.0, server_default="0")
    position = Column(String(255), nullable=True, default=None)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
