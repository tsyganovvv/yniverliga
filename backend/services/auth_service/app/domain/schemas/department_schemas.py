from app.domain.schemas import Base


class DepartmentSchema(Base):
    name: str
    description: str
