import enum
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Enum, UUID
from sqlalchemy.orm import relationship

from app.domain.models import BaseModel


class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"
    ROOT = "ROOT"


class GenderType(str, enum.Enum):
    NOT_SPECIFIED = "NOT_SPECIFIED"
    MALE = "MALE"
    FEMALE = "FEMALE"


class User(BaseModel):
    __tablename__ = "users"

    username = Column(String(100), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    fullname = Column(String(255), nullable=False)

    role = Column(Enum(UserRole, name="user_role"), default=UserRole.EMPLOYEE)

    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    gender = Column(
        Enum(GenderType, name="gender_type"),
        default=GenderType.NOT_SPECIFIED,
    )

    birth_date = Column(Date)

    is_active = Column(Boolean, nullable=False, default=True)
