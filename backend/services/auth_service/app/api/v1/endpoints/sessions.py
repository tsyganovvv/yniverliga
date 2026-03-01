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
            content={"message": "login success", "token": token},
            status_code=status.HTTP_200_OK,
        )
        response.headers["Auth-Token"] = token
        response.headers["X-Auth-Token"] = token
        response.headers["Authorization"] = f"Bearer {token}"
        return response
    except ValueError as e:
        error_text = str(e).lower()
        status_code = (
            status.HTTP_401_UNAUTHORIZED
            if error_text in {"no such user", "incorrect password"}
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code, detail=str(e),
        )


@router.get("/", status_code=status.HTTP_200_OK)
async def get_user(
    service: Annotated[SessionService, Depends(get_session_service)],
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
):
    try:
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="missing authorization header",
            )
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
        error_text = str(e).lower()
        status_code = (
            status.HTTP_401_UNAUTHORIZED
            if error_text in {"invalid token", "token expired"}
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code, detail=str(e),
        )
