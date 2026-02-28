from fastapi import APIRouter

from .v1.endpoints import api, sessions, users, departments

router = APIRouter()

router.include_router(
    api.router, prefix="/v1/api", tags=["api"]
)
router.include_router(
    departments.router, prefix="/v1/departments", tags=["departments"]
)
router.include_router(
    users.router, prefix="/v1/users", tags=["users"]
)
router.include_router(
    sessions.router, prefix="/v1/sessions", tags=["sessions"],
)
