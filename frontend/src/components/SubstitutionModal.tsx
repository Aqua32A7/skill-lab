import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, AlertCircle, ChefHat, Check } from 'lucide-react';
import { Recipe, SubstitutionOption } from '../types/recipe';
import { api } from '../services/api';

interface SubstitutionModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  preSelectedIngredient?: string;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  recipe,
  isOpen,
  onClose,
  preSelectedIngredient,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>(
    preSelectedIngredient || (recipe.ingredients[0]?.name ?? '')
  );
  const [loading, setLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<SubstitutionOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentIngredientObj = recipe.ingredients.find(
    (i) => i.name.toLowerCase() === selectedIngredient.toLowerCase()
  );

  const handleFetchSubstitutions = async () => {
    if (!selectedIngredient) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.substituteIngredient({
        recipe_name: recipe.name,
        ingredient_name: selectedIngredient,
        ingredient_quantity: currentIngredientObj ? `${currentIngredientObj.quantity} ${currentIngredientObj.unit || ''}`.trim() : '',
      });
      setSubstitutions(response.substitutions);
    } catch (err: any) {
      setError(err.message || 'Failed to generate substitutions. Please check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">Ingredient Substitution</h3>
              <p className="text-xs text-stone-500">AI-powered culinary alternatives for {recipe.name}</p>
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
          {/* Ingredient Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Select Ingredient to Replace
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recipe.ingredients.map((ing, idx) => {
                const isSelected = selectedIngredient === ing.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedIngredient(ing.name);
                      setSubstitutions([]);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-semibold shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-sm truncate">{ing.name}</div>
                    <div className="text-xs text-stone-500">
                      {ing.quantity} {ing.unit}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger button */}
          <button
            type="button"
            onClick={handleFetchSubstitutions}
            disabled={loading || !selectedIngredient}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl font-semibold text-sm shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consulting Gemini Chef...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find Substitutes for {selectedIngredient}</span>
              </>
            )}
          </button>

          {/* Error notice */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold">Unable to fetch substitutes: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Results list */}
          {substitutions.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Recommended Substitutes for {selectedIngredient}
              </h4>
              <div className="space-y-3">
                {substitutions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-orange-200 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-stone-900 text-base">{sub.name}</h5>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
                        Ratio: {sub.quantity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="font-bold text-stone-700 block mb-0.5">Taste Impact:</span>
                        <span className="text-stone-600">{sub.taste_impact}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="font-bold text-stone-700 block mb-0.5">Texture Impact:</span>
                        <span className="text-stone-600">{sub.texture_impact}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="font-bold text-stone-700 block mb-0.5">Method:</span>
                        <span className="text-stone-600">{sub.method_impact}</span>
                      </div>
                    </div>

                    {sub.notes && (
                      <div className="text-xs text-stone-500 italic pt-1 flex items-center space-x-1.5">
                        <ChefHat className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        <span>{sub.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
