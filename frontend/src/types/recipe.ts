export interface Ingredient {
  name: string;
  quantity: number | string;
  unit?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  id?: string | number;
  name: string;
  description: string;
  cuisine: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  total_time?: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition?: Nutrition;
  tags?: string[];
}

export interface RecipeGenerateRequest {
  prompt?: string;
  cuisine?: string;
  diet?: string;
  difficulty?: string;
  max_time?: number;
  servings?: number;
}

export interface RecipeFromIngredientsRequest {
  ingredients: string[];
  cuisine?: string;
  diet?: string;
  difficulty?: string;
  max_time?: number;
  servings?: number;
}

export interface SubstitutionOption {
  name: string;
  quantity: string;
  taste_impact: string;
  texture_impact: string;
  method_impact: string;
  notes?: string;
}

export interface RecipeSubstituteRequest {
  recipe_name?: string;
  ingredient_name: string;
  ingredient_quantity?: string;
}

export interface RecipeSubstituteResponse {
  original_ingredient: string;
  original_quantity?: string;
  substitutions: SubstitutionOption[];
}

export interface PantryItem {
  id: number;
  name: string;
  quantity?: string;
  unit?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface MealPlanItem {
  meal_name: string;
  description: string;
  estimated_calories: number;
  estimated_protein: number;
  cooking_time: number;
  key_ingredients: string[];
}

export interface DayPlan {
  day: string;
  breakfast: MealPlanItem;
  lunch: MealPlanItem;
  dinner: MealPlanItem;
  daily_total_calories: number;
  daily_total_protein: number;
}

export interface MealPlanRequest {
  people: number;
  diet?: string;
  cuisine?: string;
  budget?: string;
  target_calories_per_day?: number;
  target_protein_per_day?: number;
}

export interface MealPlanResponse {
  weekly_plan: DayPlan[];
  grocery_list: string[];
  chef_tips: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  recipe_context?: any;
  current_step?: number;
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[];
}

export interface FavoriteRecipeResponse extends Recipe {
  id: number;
  recipe_id: string;
  created_at: string;
}
