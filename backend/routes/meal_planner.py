from fastapi import APIRouter
from schemas.recipe import MealPlanRequest, MealPlanResponse
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/meal-plan", tags=["meal_planner"])

@router.post("/generate", response_model=MealPlanResponse)
def generate_weekly_meal_plan(request: MealPlanRequest):
    return gemini_service.generate_meal_plan(
        people=request.people,
        diet=request.diet,
        cuisine=request.cuisine,
        budget=request.budget,
        target_calories_per_day=request.target_calories_per_day,
        target_protein_per_day=request.target_protein_per_day,
    )
