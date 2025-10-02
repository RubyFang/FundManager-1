from pydantic import BaseModel
from typing import Optional, List

class FundMeta(BaseModel):
    code: str
    name: str
    type: Optional[str] = None
    company: Optional[str] = None
    manager: Optional[str] = None
    scale: Optional[str] = None
    trace: Optional[str] = None

class FundHistoryRow(BaseModel):
    date: str
    nav: float
    accNav: Optional[float] = None
    dailyReturn: Optional[float] = None

class FundHistory(BaseModel):
    code: str
    rows: List[FundHistoryRow]