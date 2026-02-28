from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.services import get_departments_service
from app.domain.schemas.department_schemas import DepartmentSchema
from app.services.department_service import DepartmentService

router = APIRouter()


@router.get("/health")
def departments_health()->dict:
    return {
        "health": True
    }


@router.post(
    "/", status_code=status.HTTP_201_CREATED,
)
async def create_department(
    department_data: DepartmentSchema, service: Annotated[DepartmentService, Depends(get_departments_service)],
):
    try:
        return await service.create_department(department_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )


@router.get(
    "/", status_code=status.HTTP_200_OK,
)
async def get_departments(
    service: Annotated[DepartmentService, Depends(get_departments_service)],
):
    try:
        return await service.get_departments()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

