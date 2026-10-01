import React, { useState } from 'react';
import { Plus, X, Sparkles, Trash2 } from 'lucide-react';

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  placeholder?: string;
  onImportPantry?: () => void;
  hasPantryItems?: boolean;
}

const COMMON_PANTRY_SUGGESTIONS = [
  'Eggs',
  'Rice',
  'Tomato',
  'Onion',
  'Potato',
  'Chicken Breast',
  'Garlic',
  'Spinach',
  'Pasta',
  'Olive Oil',
  'Cheese',
  'Bell Pepper',
  'Mushrooms',
];

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  onChange,
  placeholder = 'Type an ingredient and press Enter...',
  onImportPantry,
  hasPantryItems = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (!ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...ingredients, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const removeIngredient = (indexToRemove: number) => {
    onChange(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Input box */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm shadow-sm transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => addIngredient(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl font-medium text-sm transition-colors flex items-center space-x-1 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            title="Clear all ingredients"
            className="p-3 text-stone-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-stone-200 rounded-2xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected tags */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {ingredients.map((ing, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-950 text-sm font-medium shadow-2xs group"
            >
              <span>{ing}</span>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="text-orange-400 hover:text-orange-700 group-hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick suggestions and pantry import */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Quick Add Staples
          </span>
          {onImportPantry && hasPantryItems && (
            <button
              type="button"
              onClick={onImportPantry}
              className="text-xs text-orange-700 hover:text-orange-800 font-medium flex items-center space-x-1 hover:underline"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>Import from My Pantry</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PANTRY_SUGGESTIONS.map((item) => {
            const isSelected = ingredients.some((i) => i.toLowerCase() === item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                onClick={() => (isSelected ? null : addIngredient(item))}
                disabled={isSelected}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-default'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                + {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
