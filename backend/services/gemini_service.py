import json
import re
import uuid
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from google import genai
from google.genai import types

import config
from schemas.recipe import (
    Recipe,
    Ingredient,
    Nutrition,
    SubstitutionOption,
    RecipeSubstituteResponse,
    MealPlanResponse,
    DayPlan,
    MealPlanItem,
)
from schemas.chat import ChatMessage, ChatResponse

CHEF_SYSTEM_PROMPT = (
    "You are ChefMate AI, an expert cooking assistant. Help users cook safely and practically. "
    "Give clear instructions suitable for home cooks. Ask clarifying questions when necessary. "
    "When discussing cooking temperatures, food safety, or storage, prioritize conservative food-safety guidance. "
    "Never claim certainty when nutritional values are only estimates. Be encouraging, warm, and precise."
)

class GeminiService:
    def __init__(self):
        self._client: Optional[genai.Client] = None

    def get_client(self) -> genai.Client:
        if not config.is_gemini_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "Gemini API key is not configured. Please set a valid GEMINI_API_KEY "
                    "in backend/.env or your environment variables."
                )
            )
        api_key = config.get_gemini_api_key()
        if self._client is None or getattr(self, '_current_key', None) != api_key:
            self._client = genai.Client(api_key=api_key)
            self._current_key = api_key
        return self._client

    def _clean_json_text(self, text: str) -> str:
        """Strip markdown code fences and whitespace from model output."""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    def _call_gemini_json(self, prompt: str, system_instruction: str = CHEF_SYSTEM_PROMPT) -> Any:
        import time
        client = self.get_client()
        models_to_try = [
            config.GEMINI_MODEL,
            "gemini-3.5-flash",
            "gemini-3-flash-preview",
            "gemini-3.8-flash",
            "gemini-3.1-pro-preview",
            "gemini-flash-latest"
        ]
        # deduplicate while preserving order
        seen = set()
        models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

        last_error = None
        for model in models:
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            response_mime_type="application/json",
                            temperature=0.4,
                        ),
                    )
                    raw_text = response.text or ""
                    cleaned = self._clean_json_text(raw_text)
                    return json.loads(cleaned)
                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    if "503" in err_str or "UNAVAILABLE" in err_str:
                        time.sleep(1.2)
                        continue
                    else:
                        break

        raise HTTPException(
            status_code=502,
            detail=f"Gemini API call failed: {str(last_error)}"
        )

    def _call_gemini_text(self, contents: Any, system_instruction: str = CHEF_SYSTEM_PROMPT) -> str:
        import time
        client = self.get_client()
        models_to_try = [
            config.GEMINI_MODEL,
            "gemini-3.5-flash",
            "gemini-3-flash-preview",
            "gemini-3.8-flash",
            "gemini-3.1-pro-preview",
            "gemini-flash-latest"
        ]
        seen = set()
        models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

        last_error = None
        for model in models:
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.7,
                        ),
                    )
                    return response.text or ""
                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    if "503" in err_str or "UNAVAILABLE" in err_str:
                        time.sleep(1.2)
                        continue
                    else:
                        break

        raise HTTPException(
            status_code=502,
            detail=f"Gemini AI chat call failed: {str(last_error)}"
        )

    def _parse_recipe_dict(self, data: dict) -> Recipe:
        """Safely parse a dictionary into a Recipe model with robust fallbacks."""
        recipe_id = data.get("id") or f"rec_{uuid.uuid4().hex[:8]}"
        name = data.get("name") or "ChefMate Special"
        description = data.get("description") or "A delicious chef-crafted recipe."
        cuisine = data.get("cuisine") or "International"
        difficulty = data.get("difficulty") or "Medium"
        prep_time = int(data.get("prep_time") or 15)
        cook_time = int(data.get("cook_time") or 20)
        total_time = data.get("total_time") or (prep_time + cook_time)
        servings = int(data.get("servings") or 2)

        # Parse ingredients
        raw_ingredients = data.get("ingredients") or []
        ingredients = []
        for ing in raw_ingredients:
            if isinstance(ing, dict):
                ingredients.append(Ingredient(
                    name=str(ing.get("name", "Ingredient")),
                    quantity=ing.get("quantity", "1"),
                    unit=str(ing.get("unit") or "")
                ))
            elif isinstance(ing, str):
                ingredients.append(Ingredient(
                    name=ing,
                    quantity="1",
                    unit=""
                ))

        # Parse instructions
        raw_instructions = data.get("instructions") or []
        instructions = []
        for step in raw_instructions:
            if isinstance(step, str) and step.strip():
                # Remove leading numbering like "01. " or "1. " if Gemini added it
                cleaned_step = re.sub(r"^\d+[\.\-\)]\s*", "", step.strip())
                instructions.append(cleaned_step)

        # Parse nutrition
        nutrition_data = data.get("nutrition") or {}
        nutrition = None
        if isinstance(nutrition_data, dict):
            nutrition = Nutrition(
                calories=nutrition_data.get("calories"),
                protein=nutrition_data.get("protein"),
                carbs=nutrition_data.get("carbs"),
                fat=nutrition_data.get("fat")
            )

        tags = data.get("tags") or []
        if not isinstance(tags, list):
            tags = []

        return Recipe(
            id=recipe_id,
            name=name,
            description=description,
            cuisine=cuisine,
            difficulty=difficulty,
            prep_time=prep_time,
            cook_time=cook_time,
            total_time=total_time,
            servings=servings,
            ingredients=ingredients,
            instructions=instructions,
            nutrition=nutrition,
            tags=[str(t) for t in tags]
        )

    def generate_recipe(
        self,
        prompt: Optional[str] = None,
        cuisine: Optional[str] = "Any",
        diet: Optional[str] = None,
        difficulty: Optional[str] = "Any",
        max_time: Optional[int] = None,
        servings: Optional[int] = 2,
    ) -> Recipe:
        user_prompt = f"""Generate a high-quality, practical recipe with the following criteria:
- Main Request / Dish: {prompt or 'A delicious crowd-pleasing dish'}
- Cuisine: {cuisine if cuisine and cuisine != 'Any' else 'Suitable to the dish'}
- Dietary Restrictions: {diet if diet and diet != 'Any' else 'None'}
- Difficulty: {difficulty if difficulty and difficulty != 'Any' else 'Appropriate'}
- Maximum Cooking Time: {f'{max_time} minutes' if max_time else 'Standard'}
- Target Servings: {servings or 2}

Return a single JSON object with this exact structure:
{{
  "name": "Recipe Title",
  "description": "Short appetizing description",
  "cuisine": "Cuisine Name",
  "difficulty": "Easy|Medium|Hard",
  "prep_time": 15,
  "cook_time": 25,
  "total_time": 40,
  "servings": {servings or 2},
  "ingredients": [
    {{"name": "Ingredient name", "quantity": "numeric or string amount", "unit": "unit like g, tbsp, cup"}}
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "nutrition": {{
    "calories": 450,
    "protein": 28,
    "carbs": 40,
    "fat": 15
  }},
  "tags": ["tag1", "tag2"]
}}
"""
        result = self._call_gemini_json(user_prompt)
        return self._parse_recipe_dict(result)

    def generate_from_ingredients(
        self,
        ingredients: List[str],
        cuisine: Optional[str] = "Any",
        diet: Optional[str] = None,
        difficulty: Optional[str] = "Any",
        max_time: Optional[int] = None,
        servings: Optional[int] = 2,
    ) -> List[Recipe]:
        ingredients_list = ", ".join(ingredients)
        user_prompt = f"""The user has the following kitchen ingredients available:
{ingredients_list}

Additional Preferences:
- Cuisine: {cuisine if cuisine and cuisine != 'Any' else 'Flexible'}
- Dietary: {diet if diet and diet != 'Any' else 'None'}
- Difficulty: {difficulty if difficulty and difficulty != 'Any' else 'Any'}
- Maximum Time: {f'{max_time} minutes' if max_time else 'No limit'}
- Target Servings: {servings or 2}

Generate 3 distinct, creative, and realistic recipes that make optimal use of these ingredients (pantry staples like oil, salt, pepper, and water are assumed available).

Return a JSON array containing 3 recipe objects, each with this exact structure:
[
  {{
    "name": "Recipe Title",
    "description": "Short appetizing description",
    "cuisine": "Cuisine Name",
    "difficulty": "Easy|Medium|Hard",
    "prep_time": 10,
    "cook_time": 20,
    "total_time": 30,
    "servings": {servings or 2},
    "ingredients": [
      {{"name": "Ingredient name", "quantity": "amount", "unit": "unit"}}
    ],
    "instructions": [
      "Step 1 instruction",
      "Step 2 instruction"
    ],
    "nutrition": {{
      "calories": 450,
      "protein": 25,
      "carbs": 35,
      "fat": 12
    }},
    "tags": ["Pantry-Friendly", "Quick"]
  }}
]
"""
        result = self._call_gemini_json(user_prompt)
        if isinstance(result, dict) and "recipes" in result:
            result = result["recipes"]
        elif not isinstance(result, list):
            result = [result]

        recipes = [self._parse_recipe_dict(r) for r in result]
        return recipes

    def substitute_ingredient(
        self,
        recipe_name: str,
        ingredient_name: str,
        ingredient_quantity: str = "",
    ) -> RecipeSubstituteResponse:
        user_prompt = f"""In the recipe '{recipe_name or 'General Cooking'}', the user wants to substitute:
Original Ingredient: {ingredient_name}
Original Quantity: {ingredient_quantity or 'Standard'}

Suggest 3 to 4 best culinary substitutes.
For each substitute, provide:
1. Substitute name
2. Ratio / Quantity equivalent
3. Taste impact (how flavor changes)
4. Texture impact (how consistency/mouthfeel changes)
5. Method impact (cooking technique, heat level, or timing adjustments)
6. Chef notes / tips

Return a JSON object with this exact structure:
{{
  "original_ingredient": "{ingredient_name}",
  "original_quantity": "{ingredient_quantity}",
  "substitutions": [
    {{
      "name": "Olive Oil",
      "quantity": "3/4 tbsp per 1 tbsp butter",
      "taste_impact": "Fruitier, slightly grassy undertone, lacks dairy richness.",
      "texture_impact": "Lighter, moist, does not create flaky pastry layers.",
      "method_impact": "Lower smoking point than clarified butter; do not overheat.",
      "notes": "Excellent for sautéing vegetables, but avoid in delicate cream icings."
    }}
  ]
}}
"""
        result = self._call_gemini_json(user_prompt)
        subs = []
        raw_subs = result.get("substitutions") or []
        for s in raw_subs:
            subs.append(SubstitutionOption(
                name=s.get("name", "Alternative"),
                quantity=s.get("quantity", "1:1 ratio"),
                taste_impact=s.get("taste_impact", "Minimal change"),
                texture_impact=s.get("texture_impact", "Comparable"),
                method_impact=s.get("method_impact", "Use identical cooking method"),
                notes=s.get("notes")
            ))

        return RecipeSubstituteResponse(
            original_ingredient=ingredient_name,
            original_quantity=ingredient_quantity,
            substitutions=subs
        )

    def scale_recipe(self, recipe: Recipe, target_servings: int) -> Recipe:
        user_prompt = f"""The user wants to scale this recipe from {recipe.servings} servings to {target_servings} servings.
Recipe Name: {recipe.name}
Current Servings: {recipe.servings}
Target Servings: {target_servings}

Current Ingredients:
{json.dumps([ing.model_dump() for ing in recipe.ingredients], indent=2)}

Current Instructions:
{json.dumps(recipe.instructions, indent=2)}

Carefully scale the ingredient quantities so they make culinary sense for {target_servings} servings (e.g. adjust liquids, spices, and cooking times if necessary, without over-spicing or under-seasoning).
Also adjust prep time, cook time, and nutrition estimates proportionally.

Return a JSON object with the complete scaled recipe:
{{
  "name": "{recipe.name}",
  "description": "{recipe.description}",
  "cuisine": "{recipe.cuisine}",
  "difficulty": "{recipe.difficulty}",
  "prep_time": {recipe.prep_time},
  "cook_time": {recipe.cook_time},
  "total_time": {recipe.total_time or (recipe.prep_time + recipe.cook_time)},
  "servings": {target_servings},
  "ingredients": [
    {{"name": "Ingredient", "quantity": "scaled quantity", "unit": "unit"}}
  ],
  "instructions": [
    "Step 1"
  ],
  "nutrition": {{
    "calories": {recipe.nutrition.calories if recipe.nutrition else 450},
    "protein": {recipe.nutrition.protein if recipe.nutrition else 25},
    "carbs": {recipe.nutrition.carbs if recipe.nutrition else 35},
    "fat": {recipe.nutrition.fat if recipe.nutrition else 15}
  }},
  "tags": {json.dumps(recipe.tags)}
}}
"""
        result = self._call_gemini_json(user_prompt)
        scaled = self._parse_recipe_dict(result)
        scaled.id = recipe.id
        return scaled

    def chat(
        self,
        messages: List[ChatMessage],
        recipe_context: Optional[dict] = None,
        current_step: Optional[int] = None,
    ) -> ChatResponse:
        # Build prompt context
        context_str = ""
        if recipe_context:
            context_str += f"\n--- ACTIVE RECIPE CONTEXT ---\nRecipe: {recipe_context.get('name', 'Dish')}\n"
            if "ingredients" in recipe_context:
                context_str += f"Ingredients: {json.dumps(recipe_context['ingredients'])}\n"
            if current_step is not None:
                instructions = recipe_context.get("instructions", [])
                if 0 <= current_step < len(instructions):
                    context_str += f"USER IS CURRENTLY ON STEP {current_step + 1} of {len(instructions)}:\n\"{instructions[current_step]}\"\n"

        system_instruction = CHEF_SYSTEM_PROMPT
        if context_str:
            system_instruction += (
                f"\n\nThe user is actively viewing/cooking this recipe:\n{context_str}\n"
                "Prioritize answering their question directly in relation to this active recipe and step!"
            )

        # Build conversation contents
        formatted_contents = []
        for msg in messages:
            role = "user" if msg.role == "user" else "model"
            formatted_contents.append(f"{role.upper()}: {msg.content}")

        prompt = "\n".join(formatted_contents) + "\n\nReply as ChefMate AI:"

        raw_reply = self._call_gemini_text(prompt, system_instruction=system_instruction)

        # Generate 2-3 quick follow-up suggestions
        suggestions = []
        if current_step is not None and recipe_context:
            suggestions = [
                "What should it smell or look like right now?",
                "Can I lower the heat?",
                "What is the next step?"
            ]
        else:
            suggestions = [
                "What wine or side dish pairs well with this?",
                "How should I store leftovers?",
                "Can I make this ahead of time?"
            ]

        return ChatResponse(reply=raw_reply.strip(), suggestions=suggestions)

    def generate_meal_plan(
        self,
        people: int = 2,
        diet: Optional[str] = "Any",
        cuisine: Optional[str] = "Any",
        budget: Optional[str] = "Medium",
        target_calories_per_day: Optional[int] = None,
        target_protein_per_day: Optional[int] = None,
    ) -> MealPlanResponse:
        user_prompt = f"""Generate a comprehensive 7-day weekly meal plan for {people} people.
Preferences:
- Dietary: {diet if diet and diet != 'Any' else 'Balanced'}
- Cuisine: {cuisine if cuisine and cuisine != 'Any' else 'Varied & Exciting'}
- Budget Level: {budget or 'Medium'}
- Target Calories/day: {f'~{target_calories_per_day} kcal' if target_calories_per_day else 'Standard balanced ~2000 kcal'}
- Target Protein/day: {f'~{target_protein_per_day} g' if target_protein_per_day else 'Standard ~80g'}

Days to include: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
Each day must have Breakfast, Lunch, and Dinner.
Also provide a consolidated grocery shopping list and 3 practical chef prep tips for the week.

Return a JSON object with this exact structure:
{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "daily_total_calories": 2100,
      "daily_total_protein": 95,
      "breakfast": {{
        "meal_name": "Greek Yogurt & Berry Chia Bowl",
        "description": "Creamy Greek yogurt layered with fresh berries, chia seeds, and honey.",
        "estimated_calories": 420,
        "estimated_protein": 24,
        "cooking_time": 5,
        "key_ingredients": ["Greek yogurt", "mixed berries", "chia seeds", "honey"]
      }},
      "lunch": {{
        "meal_name": "Mediterranean Quinoa Salad",
        "description": "Fluffy quinoa with cucumbers, cherry tomatoes, olives, and feta.",
        "estimated_calories": 650,
        "estimated_protein": 22,
        "cooking_time": 15,
        "key_ingredients": ["quinoa", "cucumber", "cherry tomatoes", "kalamata olives", "feta cheese"]
      }},
      "dinner": {{
        "meal_name": "Lemon Herb Baked Chicken Thighs with Asparagus",
        "description": "Crispy seasoned chicken thighs roasted alongside garlic asparagus.",
        "estimated_calories": 850,
        "estimated_protein": 48,
        "cooking_time": 35,
        "key_ingredients": ["chicken thighs", "lemon", "asparagus", "garlic", "olive oil"]
      }}
    }}
  ],
  "grocery_list": [
    "Produce: Lemons, Cucumbers, Cherry tomatoes, Asparagus, Garlic, Berries",
    "Dairy: Greek yogurt, Feta cheese",
    "Pantry: Quinoa, Olive oil, Chia seeds, Honey",
    "Meat/Poultry: Chicken thighs"
  ],
  "chef_tips": [
    "Batch cook quinoa on Sunday night for easy weekday lunches.",
    "Marinate chicken in lemon and olive oil 30 minutes before roasting.",
    "Pre-portion nuts and seeds into small containers."
  ]
}}
"""
        result = self._call_gemini_json(user_prompt)

        days = []
        raw_days = result.get("weekly_plan") or []
        for d in raw_days:
            breakfast_data = d.get("breakfast", {})
            lunch_data = d.get("lunch", {})
            dinner_data = d.get("dinner", {})

            days.append(DayPlan(
                day=d.get("day", "Day"),
                daily_total_calories=int(d.get("daily_total_calories", 2000)),
                daily_total_protein=int(d.get("daily_total_protein", 80)),
                breakfast=MealPlanItem(
                    meal_name=breakfast_data.get("meal_name", "Breakfast"),
                    description=breakfast_data.get("description", ""),
                    estimated_calories=int(breakfast_data.get("estimated_calories", 400)),
                    estimated_protein=int(breakfast_data.get("estimated_protein", 20)),
                    cooking_time=int(breakfast_data.get("cooking_time", 10)),
                    key_ingredients=breakfast_data.get("key_ingredients", [])
                ),
                lunch=MealPlanItem(
                    meal_name=lunch_data.get("meal_name", "Lunch"),
                    description=lunch_data.get("description", ""),
                    estimated_calories=int(lunch_data.get("estimated_calories", 600)),
                    estimated_protein=int(lunch_data.get("estimated_protein", 30)),
                    cooking_time=int(lunch_data.get("cooking_time", 20)),
                    key_ingredients=lunch_data.get("key_ingredients", [])
                ),
                dinner=MealPlanItem(
                    meal_name=dinner_data.get("meal_name", "Dinner"),
                    description=dinner_data.get("description", ""),
                    estimated_calories=int(dinner_data.get("estimated_calories", 800)),
                    estimated_protein=int(dinner_data.get("estimated_protein", 40)),
                    cooking_time=int(dinner_data.get("cooking_time", 30)),
                    key_ingredients=dinner_data.get("key_ingredients", [])
                ),
            ))

        grocery_list = result.get("grocery_list") or []
        chef_tips = result.get("chef_tips") or []

        return MealPlanResponse(
            weekly_plan=days,
            grocery_list=[str(item) for item in grocery_list],
            chef_tips=[str(tip) for tip in chef_tips]
        )

# Global singleton
gemini_service = GeminiService()
