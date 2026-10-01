import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Heart,
  Scale,
  RefreshCw,
  Clock,
  Users,
  Flame,
  Award,
  CheckCircle2,
  ChefHat,
  MessageSquare
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { CookingStep } from '../components/CookingStep';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onStartCooking: (recipe: Recipe) => void;
  onScaleRecipe: (recipe: Recipe) => void;
  onSubstituteIngredient: (recipe: Recipe, ingredientName?: string) => void;
  onAskChefMate: (recipe: Recipe, stepIndex?: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onStartCooking,
  onScaleRecipe,
  onSubstituteIngredient,
  onAskChefMate,
  isFavorite,
  onToggleFavorite,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = recipe.instructions.length;
  const completedCount = completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const totalTime = recipe.total_time || (recipe.prep_time + recipe.cook_time);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to recipes</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleFavorite(recipe)}
            className={`p-2.5 rounded-2xl border transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-stone-500 hover:text-rose-600 border-stone-200'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
          <button
            onClick={() => onScaleRecipe(recipe)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 flex items-center space-x-1.5"
          >
            <Scale className="w-4 h-4 text-orange-600" />
            <span>Scale ({recipe.servings})</span>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-xl text-xs font-bold uppercase tracking-wider">
            {recipe.cuisine}
          </span>
          <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold">
            {recipe.difficulty}
          </span>
          {recipe.tags?.map((t, i) => (
            <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium">
              #{t}
            </span>
          ))}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif mb-3">
            {recipe.name}
          </h1>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
            {recipe.description}
          </p>
        </div>

        {/* Nutrition and Timing Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF8F3] rounded-2xl border border-stone-200/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-semibold">Total Time</div>
              <div className="text-sm font-bold text-stone-800">{totalTime} mins</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-semibold">Portions</div>
              <div className="text-sm font-bold text-stone-800">{recipe.servings} Servings</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-semibold">Calories</div>
              <div className="text-sm font-bold text-stone-800">
                {recipe.nutrition?.calories ? `${recipe.nutrition.calories} kcal` : '~450 kcal'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-semibold">Protein</div>
              <div className="text-sm font-bold text-stone-800">
                {recipe.nutrition?.protein ? `${recipe.nutrition.protein}g` : '~25g'}
              </div>
            </div>
          </div>
        </div>

        {/* Start Cooking Big Button */}
        <button
          onClick={() => onStartCooking(recipe)}
          className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2 transition-all"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Launch Distraction-Free "Start Cooking" Mode</span>
        </button>
      </div>

      {/* Two Column Layout: Ingredients and Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingredients Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 font-serif">Ingredients</h3>
            <span className="text-xs text-stone-500 font-medium">
              {recipe.ingredients.length} items
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 space-y-2">
            {recipe.ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-bold text-stone-800">{ing.name}</div>
                  <div className="text-xs text-stone-500 font-medium">
                    {ing.quantity} {ing.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSubstituteIngredient(recipe, ing.name)}
                  title="Substitute this ingredient"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-all text-xs flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Swap</span>
                </button>
              </div>
            ))}
          </div>

          {/* Quick AI advice button */}
          <button
            onClick={() => onAskChefMate(recipe)}
            className="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <ChefHat className="w-4 h-4 text-orange-600" />
            <span>Ask ChefMate About Ingredients</span>
          </button>
        </div>

        {/* Instructions Column */}
        <div className="md:col-span-2 space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 font-serif">Instructions</h3>
            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
              Step {completedCount} of {totalSteps} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {recipe.instructions.map((step, idx) => (
              <CookingStep
                key={idx}
                stepNumber={idx + 1}
                instruction={step}
                isCompleted={completedSteps.includes(idx)}
                onToggleComplete={() => toggleStep(idx)}
                onAskAboutStep={() => onAskChefMate(recipe, idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
