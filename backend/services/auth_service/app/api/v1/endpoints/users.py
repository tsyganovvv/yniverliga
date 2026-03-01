from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.services import get_user_service
from app.domain.schemas.users_schemas import (
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.user_service import UserService

router = APIRouter()


@router.get("/health")
def users_health()->dict:
    return {"health": True}


@router.post(
    "/", response_model=UserResponse, status_code=status.HTTP_201_CREATED,
)
async def create_user(
    user_data: UserCreate, service: Annotated[UserService, Depends(get_user_service)],
):
    try:
        return await service.create_user(user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )


@router.get(
    "/", response_model=list[UserResponse], status_code=status.HTTP_200_OK,
)
async def get_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service),
):
    users = await service.repository.get_all(skip=skip, limit=limit)
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Users not found",
        )
    return users


@router.get(
    "/{username}", response_model=UserResponse, status_code=status.HTTP_200_OK,
)
async def get_user(
    username: str, service: Annotated[UserService, Depends(get_user_service)],
):
    user = await service.repository.get_by_username(username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found",
        )
    return user


@router.delete("/{username}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    username: str, service: Annotated[UserService, Depends(get_user_service)],
) -> None:
    await service.repository.delete(username)


@router.put(
    "/{username}", response_model=UserResponse, status_code=status.HTTP_200_OK,
)
async def update_user(
    username: str,
    user_data: UserUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
):
    try:
        user = await service.update_user(username=username, user_data=user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found",
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e),
        )
    return user
