import datetime

from .. import schemas

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class User(schemas.users.User, Document):
    # id: PydanticObjectId = Field(
    #     default_factory=PydanticObjectId,
    #     alias="_id",
    # )

    password: str
    roles: list[str] = ["user"]
    status: str = "active"

    register_date: datetime.datetime = Field(default_factory=datetime.datetime.now)
    updated_date: datetime.datetime = Field(default_factory=datetime.datetime.now)

    class Settings:
        name = "users"

    async def has_roles(self, roles):
        for role in roles:
            if role in self.roles:
                return True
        return False

    def set_password(self, password):
        from werkzeug.security import generate_password_hash

        self.password = generate_password_hash(password)

    def verify_password(self, password):
        from werkzeug.security import check_password_hash

        # OAuth users may not have a password set
        if not self.password:
            return False

        if check_password_hash(self.password, password):
            return True
        return False
