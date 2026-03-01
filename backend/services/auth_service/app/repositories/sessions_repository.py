from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.session_models import SessionModel


class SessionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
    
    @staticmethod
    def get_hash(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    async def create_session(
        self, user_id: UUID, expires_days: int = 3,
    ) -> SessionModel | None:
        token = secrets.token_urlsafe(32)
        expire_at = datetime.now(timezone.utc) + timedelta(days=expires_days)
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
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) < expires_at
