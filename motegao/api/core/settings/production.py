from motegao.api.core.settings.app import AppSettings


class ProdAppSettings(AppSettings):
    MONGODB_HOST: str = "motegao-mongodb"

    class Config(AppSettings.Config):
        env_file = "prod.env"
