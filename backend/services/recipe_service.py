import json
from typing import Optional, List
from sqlalchemy.orm import Session
from models.recipe import RecipeRecord
from schemas.recipe import Recipe, Ingredient, Nutrition

class RecipeService:
    @staticmethod
    def save_recipe_record(db: Session, recipe: Recipe) -> RecipeRecord:
        # Check if already exists
        existing = db.query(RecipeRecord).filter(RecipeRecord.recipe_id == recipe.id).first()
        if existing:
            return existing

        record = RecipeRecord(
            recipe_id=recipe.id or "",
            name=recipe.name,
            description=recipe.description,
            cuisine=recipe.cuisine,
            difficulty=recipe.difficulty,
            prep_time=recipe.prep_time,
            cook_time=recipe.cook_time,
            total_time=recipe.total_time or (recipe.prep_time + recipe.cook_time),
            servings=recipe.servings,
            ingredients=json.dumps([i.model_dump() for i in recipe.ingredients]),
            instructions=json.dumps(recipe.instructions),
            nutrition=json.dumps(recipe.nutrition.model_dump() if recipe.nutrition else {}),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_recipe_by_id(db: Session, recipe_id: str) -> Optional[Recipe]:
        record = db.query(RecipeRecord).filter(RecipeRecord.recipe_id == recipe_id).first()
        if not record:
            from models.favorite import FavoriteRecipe
            fav = db.query(FavoriteRecipe).filter(FavoriteRecipe.recipe_id == recipe_id).first()
            if not fav:
                return None
            record = fav

        ingredients_data = json.loads(record.ingredients or "[]")
        instructions_data = json.loads(record.instructions or "[]")
        nutrition_data = json.loads(record.nutrition or "{}")

        ingredients = [Ingredient(**i) for i in ingredients_data]
        nutrition = Nutrition(**nutrition_data) if nutrition_data else None

        return Recipe(
            id=record.recipe_id,
            name=record.name,
            description=record.description or "",
            cuisine=record.cuisine,
            difficulty=record.difficulty,
            prep_time=record.prep_time,
            cook_time=record.cook_time,
            total_time=record.total_time,
            servings=record.servings,
            ingredients=ingredients,
            instructions=instructions_data,
            nutrition=nutrition,
        )

recipe_service = RecipeService()
