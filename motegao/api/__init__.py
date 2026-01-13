from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.exceptions import RequestValidationError

from contextlib import asynccontextmanager

from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware

from motegao.api.routers.errors.http_error import http_error_handler
from motegao.api.routers.errors.validation_error import http422_error_handler
from motegao.api.routers import init_router

from motegao.api.core.config import get_app_settings
from motegao.api.core.caching import init_redis_cache
from motegao import models


def create_application() -> FastAPI:
    settings = get_app_settings()
    settings.configure_logging()
    application = FastAPI(lifespan=lifespan, **settings.fastapi_kwargs)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.add_exception_handler(HTTPException, http_error_handler)
    application.add_exception_handler(RequestValidationError, http422_error_handler)

    # init_rq(settings)
    return application


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_app_settings()

    init_redis_cache(settings)
    await models.init_beanie(app, settings)
    await init_router(app, settings)
    yield
