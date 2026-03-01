from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.db.session import Base, engine
from app.domain.models.department_models import Department  # noqa: F401
from app.domain.models.profile_models import Profile  # noqa: F401
from app.domain.models.seed_data import seed_departments_and_users
from app.domain.models.session_models import SessionModel  # noqa: F401
from app.domain.models.users_models import User  # noqa: F401


@asynccontextmanager
async def lifespan(app=FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await seed_departments_and_users(conn)
    yield
    await engine.dispose()


app = FastAPI(title="users-service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "Auth-Token",
        "X-Auth-Token",
        "Authorization",
    ],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ssl_keyfile=None,
        ssl_certfile=None,
    )
