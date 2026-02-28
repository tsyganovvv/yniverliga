from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.schemas.department_schemas import DepartmentSchema
from app.domain.models.department_models import Department
from app.repositories.departments_repository import DepartmentRepository


class DepartmentService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = DepartmentRepository(db)

    async def create_department(self, department_data: DepartmentSchema) -> Department:
        existing_department = await self.repository.get_by_name(department_data.name)
        if existing_department:
            raise ValueError("This department already exists")
        result = await self.repository.create(department_data=department_data)
        return result
    
    async def get_departments(self)->list[Department]:
        result = await self.repository.get_all_departments()
        return result
    