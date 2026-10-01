from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base

class FavoriteRecipe(Base):
    __tablename__ = "favorite_recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipe_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cuisine = Column(String(100), default="Any")
    difficulty = Column(String(50), default="Medium")
    prep_time = Column(Integer, default=15)
    cook_time = Column(Integer, default=25)
    total_time = Column(Integer, default=40)
    servings = Column(Integer, default=2)
    ingredients = Column(Text, nullable=False)   # JSON string
    instructions = Column(Text, nullable=False)  # JSON string
    nutrition = Column(Text, nullable=True)      # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
