from fastapi import APIRouter
from .projects import router as projects_router
from .authentication import router as auth_router
from .users import router as users_router

router = APIRouter(tags=["v1"], prefix="/v1")
# router.include_router(projects_router, prefix="/projects", tags=["Projects"])
# router.include_router(auth_router, prefix="/auth", tags=["Auth"])
# router.include_router(users_router, prefix="/users", tags=["Users"])
# router.include_router(projects_router, prefix="/projects", tags=["Projects"])
router.include_router(projects_router, tags=["Projects"])
router.include_router(auth_router, tags=["Auth"])
router.include_router(users_router, tags=["Users"])
router.include_router(projects_router, tags=["Projects"])