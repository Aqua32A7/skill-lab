import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.favorite import FavoriteRecipe
from schemas.favorite import FavoriteCreateRequest, FavoriteRecipeResponse
from schemas.recipe import Ingredient, Nutrition

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

def _format_favorite(fav: FavoriteRecipe) -> FavoriteRecipeResponse:
    ingredients_data = json.loads(fav.ingredients or "[]")
    instructions_data = json.loads(fav.instructions or "[]")
    nutrition_data = json.loads(fav.nutrition or "{}")

    ingredients = [Ingredient(**i) for i in ingredients_data]
    nutrition = Nutrition(**nutrition_data) if nutrition_data else None

    return FavoriteRecipeResponse(
        id=fav.id,
        recipe_id=fav.recipe_id,
        name=fav.name,
        description=fav.description,
        cuisine=fav.cuisine,
        difficulty=fav.difficulty,
        prep_time=fav.prep_time,
        cook_time=fav.cook_time,
        total_time=fav.total_time,
        servings=fav.servings,
        ingredients=ingredients,
        instructions=instructions_data,
        nutrition=nutrition,
        created_at=fav.created_at
    )

@router.get("", response_model=List[FavoriteRecipeResponse])
def get_favorites(db: Session = Depends(get_db)):
    favs = db.query(FavoriteRecipe).order_by(FavoriteRecipe.created_at.desc()).all()
    return [_format_favorite(f) for f in favs]

@router.post("", response_model=FavoriteRecipeResponse, status_code=201)
def add_favorite(request: FavoriteCreateRequest, db: Session = Depends(get_db)):
    r = request.recipe
    recipe_id = r.id or r.name.lower().replace(" ", "_")

    # Check if existing
    existing = db.query(FavoriteRecipe).filter(FavoriteRecipe.recipe_id == recipe_id).first()
    if existing:
        return _format_favorite(existing)

    fav = FavoriteRecipe(
        recipe_id=recipe_id,
        name=r.name,
        description=r.description,
        cuisine=r.cuisine,
        difficulty=r.difficulty,
        prep_time=r.prep_time,
        cook_time=r.cook_time,
        total_time=r.total_time or (r.prep_time + r.cook_time),
        servings=r.servings,
        ingredients=json.dumps([i.model_dump() for i in r.ingredients]),
        instructions=json.dumps(r.instructions),
        nutrition=json.dumps(r.nutrition.model_dump() if r.nutrition else {}),
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return _format_favorite(fav)

@router.delete("/{fav_id}", status_code=204)
def delete_favorite(fav_id: str, db: Session = Depends(get_db)):
    # Match either numeric db id or string recipe_id
    query = db.query(FavoriteRecipe)
    if fav_id.isdigit():
        fav = query.filter(FavoriteRecipe.id == int(fav_id)).first()
    else:
        fav = query.filter(FavoriteRecipe.recipe_id == fav_id).first()

    if not fav:
        raise HTTPException(status_code=404, detail="Favorite recipe not found")

    db.delete(fav)
    db.commit()
    return None
