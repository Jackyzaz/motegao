import logging

from pydantic import SecretStr

from motegao.api.core.settings.app import AppSettings


class TestAppSettings(AppSettings):
    DEBUG: bool = True

    TITLE: str = "Test Billbaht application"

    SECRET_KEY: SecretStr = SecretStr("test_secret")

    LOGGING_LEVEL: int = logging.DEBUG
