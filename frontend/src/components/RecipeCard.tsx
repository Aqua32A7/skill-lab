import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Users,
  Utensils,
  Play,
  Heart,
  Scale,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award
} from 'lucide-react';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
  onScaleRecipe: (recipe: Recipe) => void;
  onSubstituteIngredient: (recipe: Recipe) => void;
  onAskChefMate: (recipe: Recipe) => void;
  onOpenDetail?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  onStartCooking,
  onScaleRecipe,
  onSubstituteIngredient,
  onAskChefMate,
  onOpenDetail,
}) => {
  const [expanded, setExpanded] = useState(false);

  const totalTime = recipe.total_time || (recipe.prep_time + recipe.cook_time);

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200/80 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Banner & Cuisine tag */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
              {recipe.cuisine}
            </span>
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${getDifficultyBadge(
                recipe.difficulty
              )}`}
            >
              {recipe.difficulty}
            </span>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-2 rounded-2xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200 scale-105'
                  : 'bg-stone-50 text-stone-400 hover:text-rose-500 hover:bg-rose-50 border-stone-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Title & Description */}
        <h3
          onClick={() => onOpenDetail?.(recipe)}
          className="text-xl font-bold text-stone-900 font-serif mb-2 group-hover:text-orange-600 transition-colors cursor-pointer"
        >
          {recipe.name}
        </h3>
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {recipe.description}
        </p>

        {/* Key Metrics Chips */}
        <div className="grid grid-cols-4 gap-2 py-3 px-3.5 bg-[#FAF8F3] rounded-2xl border border-stone-200/60 text-center">
          <div className="flex flex-col items-center">
            <Clock className="w-3.5 h-3.5 text-stone-400 mb-1" />
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Total</span>
            <span className="text-xs font-bold text-stone-800">{totalTime}m</span>
          </div>
          <div className="flex flex-col items-center border-l border-stone-200">
            <Users className="w-3.5 h-3.5 text-stone-400 mb-1" />
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Serves</span>
            <span className="text-xs font-bold text-stone-800">{recipe.servings}</span>
          </div>
          <div className="flex flex-col items-center border-l border-stone-200">
            <Flame className="w-3.5 h-3.5 text-orange-500 mb-1" />
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Calories</span>
            <span className="text-xs font-bold text-stone-800">
              {recipe.nutrition?.calories ? `${recipe.nutrition.calories} kcal` : '~450 kcal'}
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-stone-200">
            <Award className="w-3.5 h-3.5 text-emerald-600 mb-1" />
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Protein</span>
            <span className="text-xs font-bold text-stone-800">
              {recipe.nutrition?.protein ? `${recipe.nutrition.protein}g` : '~25g'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Preview */}
      <div className="px-6 py-2 flex-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-500 hover:text-stone-800 py-1"
        >
          <span className="flex items-center space-x-1.5">
            <Utensils className="w-3.5 h-3.5 text-orange-500" />
            <span>
              {recipe.ingredients.length} Ingredients &bull; {recipe.instructions.length} Steps
            </span>
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 pt-2 border-t border-stone-100 text-xs">
            <div>
              <span className="font-bold text-stone-700 block mb-1">Ingredients:</span>
              <ul className="space-y-1 text-stone-600 pl-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="list-disc list-inside">
                    {ing.quantity} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-stone-700 block mb-1">Instructions Preview:</span>
              <ol className="space-y-1 text-stone-600 pl-2 list-decimal list-inside">
                {recipe.instructions.slice(0, 3).map((step, idx) => (
                  <li key={idx} className="truncate">
                    {step}
                  </li>
                ))}
                {recipe.instructions.length > 3 && (
                  <li className="text-stone-400 italic">
                    +{recipe.instructions.length - 3} more steps in cooking mode
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-2 mt-auto">
        {/* Primary CTA: Start Cooking */}
        <button
          type="button"
          onClick={() => onStartCooking(recipe)}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Cooking</span>
        </button>

        {/* Secondary Action Bar */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onScaleRecipe(recipe)}
            title="Scale Recipe Servings"
            className="py-2 px-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-stone-500" />
            <span>Scale</span>
          </button>

          <button
            type="button"
            onClick={() => onSubstituteIngredient(recipe)}
            title="Substitute an Ingredient"
            className="py-2 px-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={() => onAskChefMate(recipe)}
            title="Ask ChefMate AI about this recipe"
            className="py-2 px-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
