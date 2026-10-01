import React, { useState } from 'react';
import {
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Filter,
  AlertCircle,
  ArrowRight,
  Clock,
  Flame,
  Scale
} from 'lucide-react';
import { Recipe, PantryItem } from '../types/recipe';
import { api } from '../services/api';
import { IngredientInput } from '../components/IngredientInput';
import { RecipeCard } from '../components/RecipeCard';
import { LoadingState } from '../components/LoadingState';

interface RecipesProps {
  onStartCooking: (recipe: Recipe) => void;
  onScaleRecipe: (recipe: Recipe) => void;
  onSubstituteIngredient: (recipe: Recipe) => void;
  onAskChefMate: (recipe: Recipe) => void;
  onOpenDetail: (recipe: Recipe) => void;
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  pantryItems: PantryItem[];
}

const CUISINES = ['Any', 'Indian', 'Italian', 'Chinese', 'Mexican', 'Korean', 'American'];
const DIET_OPTIONS = [
  'Any',
  'Vegetarian',
  'Vegan',
  'Non-vegetarian',
  'High protein',
  'Low calorie',
  'Gluten free',
];
const DIFFICULTIES = ['Any', 'Easy', 'Medium', 'Hard'];
const TIME_LIMITS = [
  { label: 'No limit', value: undefined },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

export const Recipes: React.FC<RecipesProps> = ({
  onStartCooking,
  onScaleRecipe,
  onSubstituteIngredient,
  onAskChefMate,
  onOpenDetail,
  favorites,
  onToggleFavorite,
  pantryItems,
}) => {
  const [ingredients, setIngredients] = useState<string[]>(['Eggs', 'Rice', 'Tomato', 'Onion']);
  const [cuisine, setCuisine] = useState<string>('Any');
  const [diet, setDiet] = useState<string>('Any');
  const [difficulty, setDifficulty] = useState<string>('Any');
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);
  const [servings, setServings] = useState<number>(2);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportPantry = () => {
    const pantryNames = pantryItems.map((p) => p.name);
    const combined = Array.from(new Set([...ingredients, ...pantryNames]));
    setIngredients(combined);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      setError('Please provide at least one ingredient to generate recipes.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const generated = await api.generateFromIngredients({
        ingredients,
        cuisine: cuisine === 'Any' ? undefined : cuisine,
        diet: diet === 'Any' ? undefined : diet,
        difficulty: difficulty === 'Any' ? undefined : difficulty,
        max_time: maxTime,
        servings,
      });
      setRecipes(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipes. Please check your Gemini API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Zero-Waste Kitchen Generator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-serif mb-3">
          What's in your kitchen?
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Add the ingredients currently in your fridge or pantry. ChefMate AI will craft multiple delicious recipes tailored to your exact dietary and time preferences.
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Ingredient Chips Input */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
            Ingredients Available
          </label>
          <IngredientInput
            ingredients={ingredients}
            onChange={setIngredients}
            placeholder="e.g. Chicken, Onion, Sweet Potato, Rosemary..."
            onImportPantry={handleImportPantry}
            hasPantryItems={pantryItems.length > 0}
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-stone-100">
          {/* Cuisine Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Cuisine
            </label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Diet Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Dietary Preference
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {DIET_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Max Cooking Time */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Maximum Time
            </label>
            <select
              value={maxTime ?? ''}
              onChange={(e) => setMaxTime(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {TIME_LIMITS.map((t, idx) => (
                <option key={idx} value={t.value ?? ''}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || ingredients.length === 0}
            className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Recipes ({ingredients.length} Ingredients)</span>
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingState
          title="Simmering culinary combinations with Gemini..."
          subtitle={`Analyzing ${ingredients.length} ingredients to build balanced, delicious recipes`}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Generation Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {recipes.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900 font-serif">
              Suggested Recipes for Your Kitchen
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              Showing {recipes.length} custom recipes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r, idx) => (
              <RecipeCard
                key={r.id || idx}
                recipe={r}
                isFavorite={favorites.some((f) => f.id === r.id || f.name === r.name)}
                onToggleFavorite={onToggleFavorite}
                onStartCooking={onStartCooking}
                onScaleRecipe={onScaleRecipe}
                onSubstituteIngredient={onSubstituteIngredient}
                onAskChefMate={onAskChefMate}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
