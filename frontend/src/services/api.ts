import {
  Recipe,
  RecipeGenerateRequest,
  RecipeFromIngredientsRequest,
  RecipeSubstituteRequest,
  RecipeSubstituteResponse,
  PantryItem,
  MealPlanRequest,
  MealPlanResponse,
  ChatMessage,
  ChatResponse,
  FavoriteRecipeResponse
} from '../types/recipe';

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api' : '/api');

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Health & Config status
  async checkHealth(): Promise<{ status: string; gemini_configured: boolean; model: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Recipes
  async generateRecipe(data: RecipeGenerateRequest): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/recipes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Recipe>(res);
  },

  async generateFromIngredients(data: RecipeFromIngredientsRequest): Promise<Recipe[]> {
    const res = await fetch(`${API_BASE}/recipes/from-ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Recipe[]>(res);
  },

  async substituteIngredient(data: RecipeSubstituteRequest): Promise<RecipeSubstituteResponse> {
    const res = await fetch(`${API_BASE}/recipes/substitute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<RecipeSubstituteResponse>(res);
  },

  async scaleRecipe(recipe: Recipe, targetServings: number): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/recipes/scale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, target_servings: targetServings }),
    });
    return handleResponse<Recipe>(res);
  },

  async getRecipeById(id: string): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/recipes/${id}`);
    return handleResponse<Recipe>(res);
  },

  // AI Chat
  async chatWithChef(
    messages: ChatMessage[],
    recipeContext?: any,
    currentStep?: number
  ): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        recipe_context: recipeContext,
        current_step: currentStep,
      }),
    });
    return handleResponse<ChatResponse>(res);
  },

  // Pantry
  async getPantryItems(query?: string): Promise<PantryItem[]> {
    const url = query ? `${API_BASE}/pantry?q=${encodeURIComponent(query)}` : `${API_BASE}/pantry`;
    const res = await fetch(url);
    return handleResponse<PantryItem[]>(res);
  },

  async addPantryItem(item: { name: string; quantity?: string; unit?: string; category?: string }): Promise<PantryItem> {
    const res = await fetch(`${API_BASE}/pantry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<PantryItem>(res);
  },

  async updatePantryItem(
    id: number,
    data: { name?: string; quantity?: string; unit?: string; category?: string }
  ): Promise<PantryItem> {
    const res = await fetch(`${API_BASE}/pantry/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<PantryItem>(res);
  },

  async deletePantryItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/pantry/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete pantry item: ${res.status}`);
    }
  },

  // Favorites
  async getFavorites(): Promise<FavoriteRecipeResponse[]> {
    const res = await fetch(`${API_BASE}/favorites`);
    return handleResponse<FavoriteRecipeResponse[]>(res);
  },

  async saveFavorite(recipe: Recipe): Promise<FavoriteRecipeResponse> {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe }),
    });
    return handleResponse<FavoriteRecipeResponse>(res);
  },

  async deleteFavorite(idOrRecipeId: string | number): Promise<void> {
    const res = await fetch(`${API_BASE}/favorites/${idOrRecipeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete favorite: ${res.status}`);
    }
  },

  // Meal Planner
  async generateMealPlan(data: MealPlanRequest): Promise<MealPlanResponse> {
    const res = await fetch(`${API_BASE}/meal-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MealPlanResponse>(res);
  },
};
