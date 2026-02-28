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
        user = await self.Userrepository.get_by_username(username)
        if not user:
            raise ValueError("No such user")
        if not self.verify(password, user.hashed_password):
            raise ValueError("Incorrect password")
        token = await self.Sessionrepository.create_session(user_id=user.id)
        return token

    async def get_user_by_token(self, token: str)-> dict | None:
        token_obj = await self.Sessionrepository.get_session_by_token(token)
        if not token_obj:
            raise ValueError("Error: No such token")
        user = await self.Userrepository.get_by_id(token_obj.user_id)
        if not user:
            raise ValueError("Error: No such user")
        return {
            "id": user.id,
            "username": user.username,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "fullname": user.fullname,
        }
