from datetime import datetime, timezone

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.sessions_repository import SessionRepository
from app.repositories.user_repository import UserRepository

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class SessionService:
    def __init__(self, db: AsyncSession) -> None:
        self.Sessionrepository = SessionRepository(db)
        self.Userrepository = UserRepository(db)

    @staticmethod
    def get_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    async def login(self, username: str, password: str) -> str:
        clean_username = username.strip()
        user = await self.Userrepository.get_by_username(clean_username)
        if not user:
            raise ValueError("no such user")
        if not user.hashed_password:
            raise ValueError("incorrect password")
        if not self.verify(password, user.hashed_password):
            raise ValueError("incorrect password")
        token = await self.Sessionrepository.create_session(user_id=user.id)
        return token

    async def get_user_by_token(self, token: str)-> dict | None:
        token_obj = await self.Sessionrepository.get_session_by_token(token)
        if not token_obj:
            raise ValueError("invalid token")
        expires_at = token_obj.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) >= expires_at:
            raise ValueError("token expired")
        user = await self.Userrepository.get_by_id(token_obj.user_id)
        if not user:
            raise ValueError("no such user")
        return {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "department_id": user.department_id,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "fullname": user.fullname,
        }
