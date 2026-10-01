import React from 'react';
import { Heart, Trash2, Play, Utensils, Clock, Users, Flame, ArrowRight } from 'lucide-react';
import { Recipe, FavoriteRecipeResponse } from '../types/recipe';

interface FavoritesProps {
  favorites: (Recipe | FavoriteRecipeResponse)[];
  onOpenRecipe: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
  onDeleteFavorite: (idOrRecipeId: string | number) => void;
  onDiscoverRecipes: () => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onOpenRecipe,
  onStartCooking,
  onDeleteFavorite,
  onDiscoverRecipes,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-600" />
            <span>Saved Culinary Creations</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-serif">Favorite Recipes</h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Quickly access your saved kitchen masterpieces.
          </p>
        </div>

        <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
          {favorites.length} Saved
        </span>
      </div>

      {/* Grid or Empty State */}
      {favorites.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-stone-200/90 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">No favorites saved yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Whenever you generate a recipe you love, click the heart icon to save it here forever.
            </p>
          </div>
          <button
            onClick={onDiscoverRecipes}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/20 inline-flex items-center space-x-2"
          >
            <span>Discover &amp; Generate Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe, idx) => {
            const recipeKey = (recipe as any).recipe_id || recipe.id || String(idx);
            const totalTime = recipe.total_time || (recipe.prep_time + recipe.cook_time);

            return (
              <div
                key={recipeKey}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                      {recipe.cuisine}
                    </span>
                    <button
                      onClick={() => onDeleteFavorite((recipe as any).id || (recipe as any).recipe_id || recipe.id || '')}
                      title="Remove from favorites"
                      className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3
                    onClick={() => onOpenRecipe(recipe)}
                    className="text-lg font-bold text-stone-900 font-serif mb-2 group-hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {recipe.name}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {recipe.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50 rounded-2xl text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold uppercase">Difficulty</span>
                      <span className="font-bold text-stone-800">{recipe.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold uppercase">Cook Time</span>
                      <span className="font-bold text-stone-800">{totalTime}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold uppercase">Servings</span>
                      <span className="font-bold text-stone-800">{recipe.servings}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => onOpenRecipe(recipe)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Open Recipe
                  </button>
                  <button
                    onClick={() => onStartCooking(recipe)}
                    className="py-2.5 px-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Cook</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
