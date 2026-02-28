from sqlalchemy import Column, String, DateTime, ForeignKey, UUID
from sqlalchemy.orm import relationship
from app.domain.models import BaseModel

class SessionModel(BaseModel):
    __tablename__ = "sessions"

    token_hash = Column(String(255), nullable=False)
    
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    expires_at = Column(DateTime(timezone=True), nullable=False)
    