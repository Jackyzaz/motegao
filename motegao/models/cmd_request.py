from pydantic import BaseModel, Field
from typing import List, Optional


class NmapRequest(BaseModel):
    host: str
    timing_template: int = Field(3, ge=0, le=5)
    options: Optional[List[str]] = None
    all_ports: bool = False
    ports_range: Optional[List[int]] = None
    ports_specific: Optional[List[int]] = None


class subdomainEnumRequest(BaseModel):
    domain: str
    threads: int = Field(10, ge=1, le=100)
    wordlist: int = Field(1, ge=1, le=3)
