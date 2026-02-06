import re
from urllib.parse import urlparse
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class NmapRequest(BaseModel):
    host: str
    timing_template: int = Field(3, ge=0, le=5)
    options: Optional[List[str]] = None
    all_ports: bool = False
    ports_range: Optional[List[int]] = None
    ports_specific: Optional[List[int]] = None


class subdomainEnumRequest(BaseModel):
    domain: str = Field(..., examples=["example.com"])
    threads: int = Field(10, ge=1, le=100)
    wordlist: int = Field(1, ge=1, le=3)
    
    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str):
        domain_regex = r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$"
        if not re.match(domain_regex, v):
            raise ValueError("Invalid domain format")
        return v.lower()

class PathEnumRequest(BaseModel):
    url: str
    threads: int = Field(10, ge=1, le=100)
    wordlist: int = Field(1, ge=1, le=5)
    exclude_status: Optional[List[int]] = Field(default_factory=list)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str):
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("URL must start with http:// or https://")
        if not parsed.netloc:
            raise ValueError("Invalid URL")
        return v
    
    @field_validator("exclude_status")
    @classmethod
    def validate_status_codes(cls, v: List[int]):
        for code in v:
            if code < 100 or code > 599:
                raise ValueError(f"Invalid HTTP status code: {code}")
        return v