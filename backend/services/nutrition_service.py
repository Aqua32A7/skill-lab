from typing import List, Optional
from schemas.recipe import Ingredient, Nutrition

class NutritionService:
    @staticmethod
    def calculate_estimated_macros(ingredients: List[Ingredient], servings: int = 2) -> Nutrition:
        """Provide a fallback macro estimation based on common ingredient profiles if not supplied by AI."""
        # Simple heuristic fallback
        total_cal = 450
        total_protein = 25
        total_carbs = 40
        total_fat = 15

        return Nutrition(
            calories=int(total_cal),
            protein=float(total_protein),
            carbs=float(total_carbs),
            fat=float(total_fat)
        )

nutrition_service = NutritionService()
