from enum import Enum
import os

from pydantic_settings import BaseSettings


class AppEnvTypes(Enum):
    prod: str = "prod"
    dev: str = "dev"
    test: str = "test"


class BaseAppSettings(BaseSettings):
    APP_ENV: AppEnvTypes = AppEnvTypes.prod

    class Config:
        env_file = os.getenv("ENV_FILE", ".env")
        extra = "allow"
