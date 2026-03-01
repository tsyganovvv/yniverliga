from sqlalchemy import Boolean, Column, Index, String
from sqlalchemy.dialects.postgresql import JSONB

from app.domain.models import BaseModel

class Topic(BaseModel):
    __tablename__ = "topics"
    

    name = Column(String(255), nullable=False, unique=False)
    categories = Column(JSONB, nullable=False, default=list)
    is_positive = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
