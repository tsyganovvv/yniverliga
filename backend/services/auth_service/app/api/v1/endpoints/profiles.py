from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies.services import get_profile_service
from app.domain.schemas.profile_schemas import ProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("/health")
def profiles_health() -> dict:
    return {"health": True}


@router.get(
    "/by-id/{user_id}", response_model=ProfileResponse, status_code=status.HTTP_200_OK,
)
async def get_profile_by_id(
    user_id: UUID,
    service: Annotated[ProfileService, Depends(get_profile_service)],
):
    try:
        return await service.get_profile_by_user_id(user_id)
    except ValueError as e:
        detail = str(e)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == "user not found" else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail)


@router.get(
    "/by-username/{username}", response_model=ProfileResponse, status_code=status.HTTP_200_OK,
)
async def get_profile_by_username(
    username: str,
    service: Annotated[ProfileService, Depends(get_profile_service)],
):
    try:
        return await service.get_profile_by_username(username)
    except ValueError as e:
        detail = str(e)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == "user not found" else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail)


@router.post(
    "/{user_id}/photo", response_model=ProfileResponse, status_code=status.HTTP_200_OK,
)
async def upload_profile_photo(
    user_id: UUID,
    service: Annotated[ProfileService, Depends(get_profile_service)],
    photo: UploadFile = File(...),
):
    try:
        photo_bytes = await photo.read()
        return await service.upload_photo(
            user_id=user_id,
            content=photo_bytes,
            content_type=photo.content_type or "",
        )
    except ValueError as e:
        detail = str(e)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == "user not found" else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail)
