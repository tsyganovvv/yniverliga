from sqlalchemy import Boolean, Column, Index, String
from sqlalchemy.dialects.postgresql import JSONB

from app.domain.models import BaseModel

class Topic(BaseModel):
    __tablename__ = "topics"
    __table_args__ = (
        Index("uq_topics_name_polarity", "name", "is_positive", unique=True),
        Index("ix_topics_is_active", "is_active"),
        Index("ix_topics_categories_gin", "categories", postgresql_using="gin"),
    )

    name = Column(String(255), nullable=False, unique=False)
    categories = Column(JSONB, nullable=False, default=list)
    is_positive = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
