# ตำแหน่ง: app/schemas.py หรือ app/api/v1/schemas.py
from pydantic import BaseModel
from typing import List

class ProjectSchema(BaseModel):
    id: str
    name: str
    nodes: List[dict] = []
    edges: List[dict] = []
    lastModified: str
    owner: str  # ฟิลด์นี้สำคัญมาก เอาไว้เช็คว่าเป็นของใคร