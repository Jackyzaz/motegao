from beanie import Document, PydanticObjectId
from datetime import datetime
from pydantic import Field

from motegao import schemas


class ApiToken(schemas.tokens.ApiToken, Document):
    id: PydanticObjectId = Field(
        default_factory=PydanticObjectId,
        alias="_id",
    )

    created_date: datetime | None = Field(default_factory=datetime.utcnow)
    updated_date: datetime | None = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "api_tokens"
