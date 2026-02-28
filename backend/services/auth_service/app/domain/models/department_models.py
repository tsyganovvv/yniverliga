from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship

from app.domain.models import BaseModel

class Department(BaseModel):
    __tablename__ = "departments"

    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)