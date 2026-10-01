from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class PantryItem(Base):
    __tablename__ = "pantry_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    quantity = Column(String(50), nullable=True)
    unit = Column(String(50), nullable=True)
    category = Column(String(50), default="General", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
