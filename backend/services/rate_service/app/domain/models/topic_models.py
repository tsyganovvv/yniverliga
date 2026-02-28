from sqlalchemy import Column, String, Boolean, JSON

from app.domain.models import BaseModel

class Topic(BaseModel):
    __tablename__ = "topics"

    name = Column(String(255), nullable=False, unique=False)
    categories = Column(JSON, default=list)
    is_positive = Column(Boolean, default=True)