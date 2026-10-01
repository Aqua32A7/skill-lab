from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas.recipe import (
    Recipe,
    RecipeGenerateRequest,
    RecipeFromIngredientsRequest,
    RecipeSubstituteRequest,
    RecipeSubstituteResponse,
    RecipeScaleRequest,
)
from services.gemini_service import gemini_service
from services.recipe_service import recipe_service

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

@router.post("/generate", response_model=Recipe)
def generate_recipe(request: RecipeGenerateRequest, db: Session = Depends(get_db)):
    recipe = gemini_service.generate_recipe(
        prompt=request.prompt,
        cuisine=request.cuisine,
        diet=request.diet,
        difficulty=request.difficulty,
        max_time=request.max_time,
        servings=request.servings,
    )
    # Save to database for direct URL link / shareability
    recipe_service.save_recipe_record(db, recipe)
    return recipe

@router.post("/from-ingredients", response_model=List[Recipe])
def generate_from_ingredients(request: RecipeFromIngredientsRequest, db: Session = Depends(get_db)):
    if not request.ingredients or len(request.ingredients) == 0:
        raise HTTPException(status_code=400, detail="Please provide at least one ingredient.")

    recipes = gemini_service.generate_from_ingredients(
        ingredients=request.ingredients,
        cuisine=request.cuisine,
        diet=request.diet,
        difficulty=request.difficulty,
        max_time=request.max_time,
        servings=request.servings,
    )
    for r in recipes:
        recipe_service.save_recipe_record(db, r)
    return recipes

@router.post("/substitute", response_model=RecipeSubstituteResponse)
def substitute_ingredient(request: RecipeSubstituteRequest):
    if not request.ingredient_name.strip():
        raise HTTPException(status_code=400, detail="Ingredient name is required.")
    return gemini_service.substitute_ingredient(
        recipe_name=request.recipe_name or "",
        ingredient_name=request.ingredient_name,
        ingredient_quantity=request.ingredient_quantity or "",
    )

@router.post("/scale", response_model=Recipe)
def scale_recipe(request: RecipeScaleRequest, db: Session = Depends(get_db)):
    if request.target_servings < 1:
        raise HTTPException(status_code=400, detail="Target servings must be at least 1.")
    scaled = gemini_service.scale_recipe(request.recipe, request.target_servings)
    recipe_service.save_recipe_record(db, scaled)
    return scaled

@router.get("/{id}", response_model=Recipe)
def get_recipe(id: str, db: Session = Depends(get_db)):
    recipe = recipe_service.get_recipe_by_id(db, id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    return recipe
