from beanie import Document, PydanticObjectId # เพิ่มการ import
from pydantic import Field
from typing import List, Optional, Union # เพิ่ม Union

class Project(Document):
    # ✅ แก้ให้รองรับทั้ง ID แบบมาตรฐาน และแบบ String ตัวเลข
    id: Optional[Union[PydanticObjectId, str]] = Field(default=None, alias="_id")
    name: str
    owner: str
    nodes: List[dict] = []
    edges: List[dict] = []
    lastModified: Optional[str] = None

    class Settings:
        name = "projects"