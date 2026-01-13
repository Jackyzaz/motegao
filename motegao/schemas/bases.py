from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from typing import List


class BaseSchema(BaseModel):
    id: PydanticObjectId = Field(
        default_factory=PydanticObjectId,
        # alias="_id",
    )

    class Config:
        from_attributes = True
        populate_by_name = True


class GeoObject(BaseModel):
    type: str = "Point"
    coordinates: List[float] = Field(example=[0.0, 0.0], default=[0.0, 0.0])
