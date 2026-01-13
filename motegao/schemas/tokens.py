import datetime

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from beanie import PydanticObjectId

# from ..models import GeoObject
from . import bases


class BaseApiToken(BaseModel):
    source: str | None = Field("")
    access_token: str | None = Field("")
    access_token_expires: datetime.datetime | None = Field(None)
    refresh_token: str | None = Field("")
    refresh_token_expires: datetime.datetime | None = Field(None)


class ApiToken(bases.BaseSchema, BaseApiToken):
    created_date: datetime.datetime
    updated_date: datetime.datetime


class ApiTokenResponse(ApiToken):
    created_date: datetime.datetime
    updated_date: datetime.datetime


class CreateUpdateApiToken(BaseApiToken):
    pass
