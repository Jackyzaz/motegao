from fastapi import APIRouter
from .projects import router as projects_router

router = APIRouter(tags=["v1"], prefix="/v1")
router.include_router(projects_router, prefix="/projects", tags=["Projects"])