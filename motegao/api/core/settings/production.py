from motegao.api.core.settings.app import AppSettings


class ProdAppSettings(AppSettings):
    MONGODB_HOST: str = "motegao-mongodb"

    # Enable API docs in production
    # Set these to None to disable docs
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"

    class Config(AppSettings.Config):
        env_file = "prod.env"
