from typing import List, Optional, Union
from pydantic import BaseModel, Field

class Ingredient(BaseModel):
    name: str = Field(..., description="Name of the ingredient")
    quantity: Union[float, int, str] = Field(..., description="Quantity of the ingredient")
    unit: Optional[str] = Field(default="", description="Unit of measurement (g, ml, tbsp, cup, etc.)")

class Nutrition(BaseModel):
    calories: Optional[int] = Field(default=None, description="Estimated calories per serving")
    protein: Optional[float] = Field(default=None, description="Estimated protein in grams per serving")
    carbs: Optional[float] = Field(default=None, description="Estimated carbohydrates in grams per serving")
    fat: Optional[float] = Field(default=None, description="Estimated fat in grams per serving")

class Recipe(BaseModel):
    id: Optional[str] = Field(default=None, description="Unique recipe identifier")
    name: str = Field(..., description="Recipe title")
    description: str = Field(..., description="Short appetizing description")
    cuisine: str = Field(default="Any", description="Cuisine type")
    difficulty: str = Field(default="Medium", description="Easy, Medium, or Hard")
    prep_time: int = Field(default=15, description="Preparation time in minutes")
    cook_time: int = Field(default=20, description="Cooking time in minutes")
    total_time: Optional[int] = Field(default=None, description="Total time in minutes")
    servings: int = Field(default=2, description="Number of servings")
    ingredients: List[Ingredient] = Field(default_factory=list, description="List of ingredients")
    instructions: List[str] = Field(default_factory=list, description="Step-by-step instructions")
    nutrition: Optional[Nutrition] = Field(default=None, description="Nutritional information")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags like high-protein, quick, etc.")

class RecipeGenerateRequest(BaseModel):
    prompt: Optional[str] = Field(default=None, description="General dish or craving prompt")
    cuisine: Optional[str] = Field(default="Any", description="Cuisine preference")
    diet: Optional[str] = Field(default=None, description="Dietary preference")
    difficulty: Optional[str] = Field(default="Any", description="Difficulty level")
    max_time: Optional[int] = Field(default=None, description="Max cooking time in minutes")
    servings: Optional[int] = Field(default=2, description="Target servings")

class RecipeFromIngredientsRequest(BaseModel):
    ingredients: List[str] = Field(..., min_length=1, description="List of ingredients available in kitchen")
    cuisine: Optional[str] = Field(default="Any", description="Cuisine preference")
    diet: Optional[str] = Field(default=None, description="Dietary preference")
    difficulty: Optional[str] = Field(default="Any", description="Difficulty level")
    max_time: Optional[int] = Field(default=None, description="Max cooking time in minutes")
    servings: Optional[int] = Field(default=2, description="Target servings")

class SubstitutionOption(BaseModel):
    name: str = Field(..., description="Name of the substitute ingredient")
    quantity: str = Field(..., description="Ratio/amount to replace the original")
    taste_impact: str = Field(..., description="How this substitute affects the taste profile")
    texture_impact: str = Field(..., description="How this substitute affects the texture/consistency")
    method_impact: str = Field(..., description="Cooking technique adjustments if any")
    notes: Optional[str] = Field(default=None, description="General culinary tips or warnings")

class RecipeSubstituteRequest(BaseModel):
    recipe_name: Optional[str] = Field(default="", description="Name of recipe")
    ingredient_name: str = Field(..., description="The original ingredient to replace")
    ingredient_quantity: Optional[str] = Field(default="", description="Original quantity")

class RecipeSubstituteResponse(BaseModel):
    original_ingredient: str
    original_quantity: Optional[str] = ""
    substitutions: List[SubstitutionOption]

class RecipeScaleRequest(BaseModel):
    recipe: Recipe
    target_servings: int = Field(..., ge=1, le=20, description="Target number of servings")

# Meal Planner Schemas
class MealPlanItem(BaseModel):
    meal_name: str
    description: str
    estimated_calories: int
    estimated_protein: int
    cooking_time: int
    key_ingredients: List[str]

class DayPlan(BaseModel):
    day: str
    breakfast: MealPlanItem
    lunch: MealPlanItem
    dinner: MealPlanItem
    daily_total_calories: int
    daily_total_protein: int

class MealPlanRequest(BaseModel):
    people: int = Field(default=2, ge=1, le=12)
    diet: Optional[str] = Field(default="Any")
    cuisine: Optional[str] = Field(default="Any")
    budget: Optional[str] = Field(default="Medium")
    target_calories_per_day: Optional[int] = Field(default=None)
    target_protein_per_day: Optional[int] = Field(default=None)

class MealPlanResponse(BaseModel):
    weekly_plan: List[DayPlan]
    grocery_list: List[str]
    chef_tips: List[str]
