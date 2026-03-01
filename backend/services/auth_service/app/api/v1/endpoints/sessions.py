from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import JSONResponse

from app.api.dependencies.services import get_session_service
from app.domain.schemas.auth_schemas import LoginRequest
from app.services.session_service import SessionService

router = APIRouter()


@router.get("/health")
def session_health()->dict:
    return {"health": True}


@router.post("/", status_code=status.HTTP_200_OK)
async def login(
    user_data: LoginRequest,
    service: Annotated[SessionService, Depends(get_session_service)],
):
    try:
        token = await service.login(user_data.username, user_data.password)
        response = JSONResponse(
            content={"message": "Login successful"},
            status_code=status.HTTP_200_OK,
        )
        response.headers["X-Auth-Token"] = token
        response.headers["Authorization"] = f"Bearer {token}"
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )


@router.get("/", status_code=status.HTTP_200_OK)
async def get_user(
    authorization: Annotated[str, Header(alias="Authorization")],
    service: Annotated[SessionService, Depends(get_session_service)],
):
    try:
        token = authorization.strip()
        if token.lower().startswith("bearer "):
            token = token[7:].strip()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Empty token",
            )
        return await service.get_user_by_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )
