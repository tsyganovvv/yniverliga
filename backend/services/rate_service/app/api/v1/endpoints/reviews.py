from uuid import UUID
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.responses import Response

from app.domain.schemas.rewiew_schemas import RewiewSchema
from app.services.rewiew_service import RewiewService
from app.api.dependencies.services import get_rewiew_service

router = APIRouter()

@router.get('/health')
def health_check():
    return {
        "success": True
    }

@router.post(
    "/", status_code=status.HTTP_201_CREATED,
)
async def create_rewiew(
    rewiew_data: RewiewSchema, service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.create_rewiew(rewiew_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/", status_code=status.HTTP_200_OK,
)
async def get_all_rewiews(
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_all_rewiews()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/from/{user_id}", status_code=status.HTTP_200_OK,
)
async def get_rewiews_from_by_user_id(
    user_id: UUID,
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_rewiews_by_from_user_id(user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/to/{user_id}", status_code=status.HTTP_200_OK,
)
async def get_rewiews_to_by_user_id(
    user_id: UUID,
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_rewiews_by_to_user_id(user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/category/{category}", status_code=status.HTTP_200_OK,
)
async def get_rewiews_category(
    category: str,
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_rewiews_by_category(category)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/positive/{is_positive}", status_code=status.HTTP_200_OK,
)
async def get_rewiews_positive(
    is_positive: bool,
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_rewiews_by_positive(is_positive)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )

@router.get(
    "/rate/{rate}", status_code=status.HTTP_200_OK,
)
async def get_rewiews_rate(
    rate: int,
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        return await service.get_rewiews_by_rate(rate)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )


@router.get(
    "/report/csv", status_code=status.HTTP_200_OK,
)
async def export_rewiews_report_csv(
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        report_bytes = await service.export_report_csv()
        stamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"reviews_report_{stamp}.csv"
        return Response(
            content=report_bytes,
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )


@router.get(
    "/report/excel", status_code=status.HTTP_200_OK,
)
async def export_rewiews_report_excel(
    service: Annotated[RewiewService, Depends(get_rewiew_service)],
):
    try:
        report_bytes = await service.export_report_excel()
        stamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"reviews_report_{stamp}.xlsx"
        return Response(
            content=report_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        )
