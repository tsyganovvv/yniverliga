from passlib.context import CryptContext
from uuid import UUID
import secrets
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.session_models import SessionModel


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class SessionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
    
    @staticmethod
    def get_hash(token: str) -> str:
        return pwd_context.hash(token)
    
    @staticmethod
    def verify(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    async def create_session(
        self, user_id: UUID, expires_days: int = 3,
    ) -> SessionModel | None:
        token = secrets.token_urlsafe(32)
        expire_at = datetime.now() + timedelta(days=expires_days)
        token_hash = self.get_hash(token)
        session = SessionModel(
            user_id=user_id, token_hash=token_hash, expires_at=expire_at,
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return token

    async def get_session(self, session_id: UUID) -> SessionModel | None:
        result = await self.db.execute(
            select(SessionModel).where(SessionModel.id == session_id),
        )
        return result.scalar_one_or_none()

    async def get_session_by_token(self, token: str) -> SessionModel | None:
        token_hash = self.get_hash(token)
        result = await self.db.execute(
            select(SessionModel).where(SessionModel.token_hash == token_hash),
        )
        return result.scalar_one_or_none()

    async def delete_session(self, session_id: UUID) -> SessionModel | None:
        session = self.get_session(session_id)
        if session:
            await self.db.delete(session)
            await self.db.commit()
        return session

    async def is_valid(self, session: SessionModel):
        if not session:
            return False
        return datetime.now(timezone=True) < session.expires_at
