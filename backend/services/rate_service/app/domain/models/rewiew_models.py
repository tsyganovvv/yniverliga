from sqlalchemy import Boolean, Column, ForeignKey, SmallInteger, String, Text, UUID

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
    context = Column(Text, nullable=False, default="", server_default="")
    is_positive = Column(Boolean, nullable=False, default=True)
    rate = Column(SmallInteger, nullable=False)
