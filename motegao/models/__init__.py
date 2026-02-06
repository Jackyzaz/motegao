# import motor.motor_asyncio
import sys
from typing import Sequence, Type, TypeVar
from inspect import getmembers, isclass
import beanie
import pymongo

from . import files

from .users import User
from .tokens import ApiToken


DocumentType = TypeVar("DocumentType", bound=beanie.Document)


from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/motegaodb"

    class Config:
        env_file = ".env"
        extra = "allow"


async def gather_documents() -> Sequence[Type[DocumentType]]:
    """Returns a list of all MongoDB document models defined in `models` module."""

    class_models = getmembers(sys.modules[__name__], isclass)

    for key in [k for k in sys.modules if __name__ in k]:
        class_models.extend(getmembers(sys.modules[key], isclass))

    class_models = list(set(class_models))

    return [
        doc
        for _, doc in class_models
        if issubclass(doc, beanie.Document) and doc.__name__ != "Document"
    ]


class BeanieClient:
    async def init_beanie(self, settings):
        self.settings = settings
        self.client = pymongo.AsyncMongoClient(settings.MONGODB_URI)
        self.db = self.client.get_default_database()

        documents = await gather_documents()

        print("Documents >>>")
        for document in documents:
            print(document)

        await beanie.init_beanie(
            database=self.db,
            document_models=documents,
            # recreate_views=True,
        )


async def init_beanie(app, settings):
    await beanie_client.init_beanie(settings)


async def init_default_beanie_client():
    settings = AppSettings()
    print("setings>>>", settings)
    await beanie_client.init_beanie(settings)


beanie_client = BeanieClient()
