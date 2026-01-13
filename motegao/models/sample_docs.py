from pydantic import Field
from beanie import Document, Indexed, PydanticObjectId

import datetime


class FileDoc(Document):
    id: PydanticObjectId | None = Field(
        default_factory=PydanticObjectId,
        alias="_id",
    )

    file_id: PydanticObjectId | None = Field(
        default_factory=PydanticObjectId,
    )

    created_date: datetime.datetime = Field(default_factory=datetime.datetime.now)
    updated_date: datetime.datetime = Field(default_factory=datetime.datetime.now)

    class Settings:
        name = "sample_docs"
