from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.department_service import DepartmentService
from app.services.profile_service import ProfileService
from app.services.session_service import SessionService
from app.services.user_service import UserService


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


def get_session_service(db: AsyncSession = Depends(get_db)) -> SessionService:
    return SessionService(db)


def get_departments_service(db: AsyncSession = Depends(get_db)) -> DepartmentService:
    return DepartmentService(db)


def get_profile_service(db: AsyncSession = Depends(get_db)) -> ProfileService:
    return ProfileService(db)
