from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import router
from app.db.session import Base, engine
from app.domain.models.department_models import Department  # noqa: F401
from app.domain.models.rewiew_models import Rewiew  # noqa: F401
from app.domain.models.seed_data import seed_topics_and_rewiews
from app.domain.models.topic_models import Topic  # noqa: F401
from app.domain.models.users_models import User  # noqa: F401

@asynccontextmanager
async def lifespan(app=FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            text(
                """
                ALTER TABLE rewiews
                ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT '';
                """
            )
        )
        await seed_topics_and_rewiews(conn)
    yield
    await engine.dispose()

app = FastAPI(
    title='rate-service',
    version='1.0.0', 
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__=="__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0",
        port=8001,
        reload=True
        )
