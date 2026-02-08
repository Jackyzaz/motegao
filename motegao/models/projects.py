from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List
import datetime


class Project(Document):
    id: PydanticObjectId | None = Field(default_factory=PydanticObjectId, alias="_id")
    name: str
    # Reference to the owning user (stored as ObjectId)
    owner: PydanticObjectId | None = Field(default=None)
    nodes: List[dict] = []
    edges: List[dict] = []
    lastModified: datetime.datetime = Field(default_factory=datetime.datetime.now)

    class Settings:
        name = "projects"  # ชื่อ collection ใน MongoDB
