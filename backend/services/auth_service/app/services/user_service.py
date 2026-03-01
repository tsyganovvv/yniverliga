
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.schemas.users_schemas import (
    UserCreate,
    UserUpdate,
    UserUpdateInDB,
)
from app.repositories.user_repository import UserRepository
from app.repositories.departments_repository import DepartmentRepository
from app.repositories.profile_repository import ProfileRepository

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = UserRepository(db)
        self.department_repository = DepartmentRepository(db)
        self.profile_repository = ProfileRepository(db)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    async def create_user(self, user_data: UserCreate) -> dict:
        existing_user = await self.repository.get_by_username(user_data.username)
        if existing_user:
            raise ValueError("User with this name already exists")

        department = await self.department_repository.get_by_id(
            str(user_data.department_id),
        )
        if not department:
            raise ValueError("undefined departament")

        if not user_data.password:
            raise ValueError("password is required")

        hashed_password = self.get_password_hash(user_data.password)
        try:
            user = await self.repository.create(user_data, hashed_password)
        except IntegrityError as e:
            message = str(e).lower()
            if "department" in message or "foreign key" in message:
                raise ValueError("undefined departament") from e
            raise ValueError("cannot create user") from e

        user_response = {
            "id": user.id,
            "username": user.username,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "fullname": user.fullname,
            "department_id": user.department_id,
        }

        try:
            await self.profile_repository.create(user.id)
        except Exception as e:
            try:
                await self.repository.delete(user.username)
            except Exception:
                pass
            raise ValueError("cannot create user profile") from e

        return user_response

    async def authenticate_user(
        self, email: str, password: str,
    ) -> dict | None:
        user = await self.repository.get_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }

    async def update_user(self, username: str, user_data: UserUpdate):
        user_data = user_data.model_dump()
        if user_data.get("department_id"):
            try:
                user_data = UserUpdateInDB(**user_data)
                return await self.repository.update(username, user_data)
            except Exception as e:
                raise ValueError("Department with this ID does not exists")
        if user_data.get("password"):
            user_data["hashed_password"] = self.get_password_hash(
                user_data["password"],
            )
            user_data.pop("password", None)
        user_data = UserUpdateInDB(**user_data)
        return await self.repository.update(username, user_data)
