from datetime import datetime
from uuid import UUID

from app.domain.schemas import Base


class UserBase(Base):
    username: str
    fullname: str | None = None
    department_id: UUID | None = None


class UserCreate(UserBase):
    department_id: UUID
    password: str | None = None


class UserUpdate(UserBase):
    username: str | None = None
    fullname: str | None = None
    department_id: UUID | None = None
    password: str | None = None


class UserUpdateInDB(UserBase):
    username: str
    fullname: str
    hashed_password: str


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None
    role: str | None = None

    class Config:
        from_attributes = True
