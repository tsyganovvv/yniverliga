from app.domain.schemas import Base


class LoginRequest(Base):
    username: str
    password: str
