from app.domain.schemas import Base


class LoginRequest(Base):
    email: str
    password: str
