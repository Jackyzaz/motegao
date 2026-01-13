import datetime

from pydantic import BaseModel, EmailStr, Field
from beanie import PydanticObjectId

from . import bases


class BaseUser(BaseModel):
    email: str = Field(example="admin@email.local")
    username: str = Field(example="admin")
    first_name: str = Field(example="Firstname")
    last_name: str = Field(example="Lastname")
    status: str = Field(example="active")


class User(bases.BaseSchema, BaseUser):
    last_login_date: datetime.datetime | None = Field(
        example="2023-01-01T00:00:00.000000", default=None
    )
    roles: list[str]


class ReferenceUser(bases.BaseSchema):
    username: str = Field(example="admin")
    first_name: str = Field(example="Firstname")
    last_name: str = Field(example="Lastname")


class UserList(BaseModel):
    users: list[User]
    count: int
    current_page: int = 0
    total_page: int = 0


class Login(BaseModel):
    email: EmailStr
    password: str


class ChangedPassword(BaseModel):
    current_password: str
    new_password: str


class ResetedPassword(BaseModel):
    email: EmailStr
    citizen_id: str


class RegisteredUser(BaseUser):
    password: str = Field(example="password")
    confirm_password: str = Field(example="confirm_password")


class UpdatedUser(BaseUser):
    roles: list[str]


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    expires_at: datetime.datetime
    scope: str
    issued_at: datetime.datetime


class RefreshToken(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    user_id: str | None = None


class ChangedPasswordUser(BaseModel):
    current_password: str
    new_password: str
