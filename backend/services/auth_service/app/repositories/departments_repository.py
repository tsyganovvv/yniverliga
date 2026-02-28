
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.department_models import Department
from app.domain.schemas.department_schemas import DepartmentSchema


class DepartmentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_name(self, department_name: str) -> Department | None:
        result = await self.db.execute(select(Department).where(Department.name == department_name))
        return result.scalar_one_or_none()
    
    async def get_by_id(self, department_id: str) -> Department | None:
        result = await self.db.execute(select(Department).where(Department.id == department_id))
        return result.scalar_one_or_none()
    
    async def get_all_departments(self) -> list[Department]:
        result = await self.db.execute(select(Department))
        return result.scalars().all()

    async def create(
        self, department_data: DepartmentSchema
    ) -> Department:
        department = Department(
            name=department_data.name,
            description=department_data.description,
        )
        
        self.db.add(department)
        await self.db.commit()
        await self.db.refresh(department)
        return department

    async def update(
        self, department_id: str, department_data: Department,
    ) -> Department | None:
        update_data = department_data.model_dump()
        if not update_data:
            return None
        await self.db.execute(
            update(Department).where(Department.id == department_id).values(**update_data),
        )
        await self.db.commit()
        return await self.get_by_id(department_id)

    async def delete(self, department_id: str) -> bool:
        await self.db.execute(delete(Department).where(Department.id == department_id))
        await self.db.commit()
        return True
