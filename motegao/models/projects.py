from beanie import Document
from typing import List

class Project(Document):
    id: str
    name: str
    owner: str
    nodes: List[dict] = []
    edges: List[dict] = []
    lastModified: str

    class Settings:
        name = "projects" # ชื่อ collection ใน MongoDB