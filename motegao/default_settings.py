import os
import json
import dotenv

env_file_name = os.environ.get("MOTEGAO_ENV", ".env")
dotenv.load_dotenv(dotenv_path=env_file_name)


def parse_bool(value):
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    return value.lower() in ["true", "1"]


APP_TITLE = os.getenv("APP_TITLE", "Motegao")
SECRET_KEY = os.getenv("SECRET_KEY", "changethis")

MONGODB_DB = os.getenv("MONGODB_DB", "motegaodb")
MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
MONGODB_PORT = int(os.getenv("MONGODB_PORT", "27017"))
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

CACHE_TYPE = "SimpleCache"

# Error handling configuration
SHOW_ERROR_TRACEBACK = parse_bool(os.getenv("SHOW_ERROR_TRACEBACK", "False"))
DEBUG = parse_bool(os.getenv("DEBUG", "False"))


BASE_URL = os.getenv("BASE_URL", "")
