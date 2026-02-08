from typing import List
from motegao.api.core.settings.app import AppSettings


class ProdAppSettings(AppSettings):
    MONGODB_HOST: str = "motegao-mongodb"

    # API prefix is empty because nginx handles /api/ routing
    API_PREFIX: str = ""

    # Enable API docs in production
    # Set these to None to disable docs
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"

    ALLOWED_HOSTS: List[str] = [
        "https://npspst.xyz",
        "http://npspst.xyz",
    ]

    class Config(AppSettings.Config):
        env_file = "../.env.production"
