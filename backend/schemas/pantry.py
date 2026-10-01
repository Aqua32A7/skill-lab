from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PantryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    quantity: Optional[str] = Field(default=None, max_length=50)
    unit: Optional[str] = Field(default=None, max_length=50)
    category: Optional[str] = Field(default="General", max_length=50)

class PantryItemCreate(PantryItemBase):
    pass

class PantryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None

class PantryItemResponse(PantryItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
