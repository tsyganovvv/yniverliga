from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UUID,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.domain.models import BaseModel


class Rewiew(BaseModel):
    __tablename__ = "rewiews"
    __table_args__ = (
        Index("ix_rewiews_to_user_id", "to_user_id"),
        Index("ix_rewiews_from_user_id", "from_user_id"),
        Index("ix_rewiews_created_at", "created_at"),
        Index("ix_rewiews_category", "category"),
        Index("ix_rewiews_is_positive", "is_positive"),
        Index("ix_rewiews_rate", "rate"),
        Index("ix_rewiews_to_user_created_at", "to_user_id", "created_at"),
        Index("ix_rewiews_subcategories_gin", "subcategories", postgresql_using="gin"),
        Index(
            "uq_rewiew_episode_once",
            "from_user_id",
            "to_user_id",
            "episode_key",
            unique=True,
            postgresql_where=text("episode_key IS NOT NULL"),
        ),
        CheckConstraint(
            "rate BETWEEN 1 AND 5",
            name="ck_rewiews_rate_range",
        ),
    )

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
    subcategories = Column(JSONB, nullable=False, default=list)
    context = Column(Text, nullable=False)
    comment = Column(Text, nullable=False)
    episode_key = Column(String(255), nullable=True)
    is_positive = Column(Boolean, nullable=False, default=True)
    rate = Column(SmallInteger, nullable=False)
