import logging
from typing import List

from motegao.api.core.settings.app import AppSettings


class DevAppSettings(AppSettings):
    DEBUG: bool = True
    LOGGING_LEVEL: int = logging.DEBUG
    REDIS_URL: str = "redis://localhost:6379"

    # Allow localhost origins for development
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config(AppSettings.Config):
        env_file = "../.env.local"
