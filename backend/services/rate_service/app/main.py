from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import router
from app.db.session import Base, engine
from app.domain.models.users_models import User
from app.domain.models.department_models import Department

@asynccontextmanager
async def lifespan(app=FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title='rate-service',
    version='1.0.0', 
    lifespan=lifespan
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