from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from schemas.recipe import Recipe, Ingredient, Nutrition

class FavoriteCreateRequest(BaseModel):
    recipe: Recipe

class FavoriteRecipeResponse(BaseModel):
    id: int
    recipe_id: str
    name: str
    description: Optional[str] = None
    cuisine: str
    difficulty: str
    prep_time: int
    cook_time: int
    total_time: int
    servings: int
    ingredients: List[Ingredient]
    instructions: List[str]
    nutrition: Optional[Nutrition] = None
    created_at: datetime

    class Config:
        from_attributes = True
