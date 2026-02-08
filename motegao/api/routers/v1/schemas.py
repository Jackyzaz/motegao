# ตำแหน่ง: app/schemas.py หรือ app/api/v1/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from beanie import PydanticObjectId
import datetime


class ProjectCreateSchema(BaseModel):
    """Schema for creating a new project - accepts strings"""

    name: str
    owner: Optional[str] = None  # Username or email from frontend
    nodes: List[dict] = []
    edges: List[dict] = []

    class Config:
        populate_by_name = True


class ProjectRenameSchema(BaseModel):
    """Schema for renaming a project"""

    name: str

    class Config:
        populate_by_name = True


class ProjectSchema(BaseModel):
    """Schema for project responses - uses proper types"""

    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    name: str
    owner: Optional[PydanticObjectId] = Field(default=None)
    nodes: List[dict] = []
    edges: List[dict] = []
    lastModified: datetime.datetime = Field(default_factory=datetime.datetime.now)

    class Config:
        populate_by_name = True
        json_encoders = {PydanticObjectId: str}
