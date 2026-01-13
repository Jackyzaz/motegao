import logging

from motegao.api.core.settings.app import AppSettings


class DevAppSettings(AppSettings):
    DEBUG: bool = True
    LOGGING_LEVEL: int = logging.DEBUG
    REDIS_URL: str = "redis://localhost:6379"

    class Config(AppSettings.Config):
        env_file = ".env"
