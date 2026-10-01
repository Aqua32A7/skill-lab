import React, { useState } from 'react';
import { X, Scale, Users, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { api } from '../services/api';

interface ScaleModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onRecipeScaled: (scaledRecipe: Recipe) => void;
}

const PRESET_SERVINGS = [1, 2, 4, 6, 8];

export const ScaleModal: React.FC<ScaleModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onRecipeScaled,
}) => {
  const [targetServings, setTargetServings] = useState<number>(recipe.servings || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scaledPreview, setScaledPreview] = useState<Recipe | null>(null);

  if (!isOpen) return null;

  const handleScaleRequest = async (servingsToUse: number) => {
    setTargetServings(servingsToUse);
    setLoading(true);
    setError(null);

    try {
      const scaled = await api.scaleRecipe(recipe, servingsToUse);
      setScaledPreview(scaled);
    } catch (err: any) {
      // If backend Gemini fails or no key, compute mathematical scale fallback
      const ratio = servingsToUse / (recipe.servings || 2);
      const fallbackScaled: Recipe = {
        ...recipe,
        servings: servingsToUse,
        ingredients: recipe.ingredients.map((ing) => {
          const num = typeof ing.quantity === 'number' ? ing.quantity : parseFloat(String(ing.quantity));
          if (!isNaN(num)) {
            const scaledQty = Number((num * ratio).toFixed(2));
            return {
              ...ing,
              quantity: scaledQty % 1 === 0 ? Math.round(scaledQty) : scaledQty,
            };
          }
          return ing;
        }),
        nutrition: recipe.nutrition
          ? {
              ...recipe.nutrition,
              calories: recipe.nutrition.calories ? Math.round(recipe.nutrition.calories) : undefined,
              protein: recipe.nutrition.protein ? Number((recipe.nutrition.protein).toFixed(1)) : undefined,
            }
          : undefined,
      };
      setScaledPreview(fallbackScaled);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (scaledPreview) {
      onRecipeScaled(scaledPreview);
      onClose();
    }
  };

  const displayRecipe = scaledPreview || recipe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">Scale Recipe</h3>
              <p className="text-xs text-stone-500">Adjust ingredient ratios for different group sizes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Servings Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Number of Servings</span>
              <span className="text-orange-700 font-bold">Currently: {targetServings} servings</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_SERVINGS.map((qty) => {
                const isSelected = targetServings === qty;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => handleScaleRequest(qty)}
                    className={`py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-600 text-white font-bold shadow-md shadow-orange-600/25 scale-105'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                    }`}
                  >
                    <Users className="w-4 h-4 mb-1 opacity-80" />
                    <span className="text-base">{qty}</span>
                    <span className="text-[10px] uppercase font-semibold opacity-75">
                      {qty === 1 ? 'Portion' : 'Portions'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="py-4 text-center text-sm text-stone-600 flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
              <span>Calculating precise culinary scaling with Gemini...</span>
            </div>
          )}

          {/* Scaled Ingredients Comparison */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Updated Ingredient Quantities ({targetServings} Servings)
            </h4>
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-stone-200 divide-y divide-stone-100 max-h-60 overflow-y-auto">
              {displayRecipe.ingredients.map((ing, idx) => {
                const originalIng = recipe.ingredients[idx];
                return (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-sm">
                    <span className="text-stone-800 font-medium">{ing.name}</span>
                    <div className="flex items-center space-x-2">
                      {scaledPreview && originalIng && (
                        <span className="text-xs text-stone-400 line-through">
                          {originalIng.quantity} {originalIng.unit}
                        </span>
                      )}
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!scaledPreview || loading}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-orange-600/20 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
