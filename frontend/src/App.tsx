import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import { CookingMode } from './pages/CookingMode';
import { Pantry } from './pages/Pantry';
import { Favorites } from './pages/Favorites';
import { MealPlanner } from './pages/MealPlanner';
import { CookingAssistant } from './pages/CookingAssistant';
import { SubstitutionModal } from './components/SubstitutionModal';
import { ScaleModal } from './components/ScaleModal';
import { ConfigWarningModal } from './components/ConfigWarningModal';
import { Recipe, PantryItem, FavoriteRecipeResponse } from './types/recipe';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Active viewing/cooking states
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);

  // Chat pre-filled states
  const [chatRecipeContext, setChatRecipeContext] = useState<Recipe | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // Modals state
  const [subModalRecipe, setSubModalRecipe] = useState<Recipe | null>(null);
  const [subPreSelectedIng, setSubPreSelectedIng] = useState<string | undefined>(undefined);
  const [scaleModalRecipe, setScaleModalRecipe] = useState<Recipe | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Data persistence states
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecipeResponse[]>([]);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(false);

  // Fetch initial data
  const refreshStatus = async () => {
    try {
      const health = await api.checkHealth();
      setIsAiConfigured(health.gemini_configured);
    } catch {
      setIsAiConfigured(false);
    }
  };

  const loadPantry = async () => {
    try {
      const items = await api.getPantryItems();
      setPantryItems(items);
    } catch (e) {
      console.error('Error loading pantry:', e);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await api.getFavorites();
      setFavorites(favs);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  useEffect(() => {
    refreshStatus();
    loadPantry();
    loadFavorites();
  }, []);

  // Handlers for recipes & actions
  const handleStartCooking = (recipe: Recipe) => {
    setActiveCookingRecipe(recipe);
    setIsCookingMode(true);
  };

  const handleOpenScale = (recipe: Recipe) => {
    setScaleModalRecipe(recipe);
  };

  const handleRecipeScaled = (scaledRecipe: Recipe) => {
    if (selectedRecipe && (selectedRecipe.id === scaledRecipe.id || selectedRecipe.name === scaledRecipe.name)) {
      setSelectedRecipe(scaledRecipe);
    }
  };

  const handleOpenSubstitute = (recipe: Recipe, ingredientName?: string) => {
    setSubModalRecipe(recipe);
    setSubPreSelectedIng(ingredientName);
  };

  const handleAskChefMate = (recipe: Recipe) => {
    setChatRecipeContext(recipe);
    setActiveTab('chat');
  };

  const handleAskDirectPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleOpenDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    const existing = favorites.find(
      (f) => f.recipe_id === recipe.id || f.name.toLowerCase() === recipe.name.toLowerCase()
    );
    if (existing) {
      await api.deleteFavorite(existing.id || existing.recipe_id);
    } else {
      await api.saveFavorite(recipe);
    }
    await loadFavorites();
  };

  // Pantry handlers
  const handleAddPantryItem = async (item: { name: string; quantity?: string; unit?: string; category?: string }) => {
    await api.addPantryItem(item);
    await loadPantry();
  };

  const handleUpdatePantryItem = async (id: number, data: any) => {
    await api.updatePantryItem(id, data);
    await loadPantry();
  };

  const handleDeletePantryItem = async (id: number) => {
    await api.deletePantryItem(id);
    await loadPantry();
  };

  const handleCookWithPantry = () => {
    setActiveTab('recipes');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedRecipe(null);
        }}
        favoritesCount={favorites.length}
        pantryCount={pantryItems.length}
        isAiConfigured={isAiConfigured}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content Pages */}
      <div className="flex-1">
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onStartCooking={handleStartCooking}
            onScaleRecipe={handleOpenScale}
            onSubstituteIngredient={handleOpenSubstitute}
            onAskChefMate={handleAskChefMate}
            isFavorite={favorites.some(
              (f) => f.recipe_id === selectedRecipe.id || f.name.toLowerCase() === selectedRecipe.name.toLowerCase()
            )}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <Home
                onNavigate={(tab) => setActiveTab(tab)}
                onStartCooking={handleStartCooking}
                onScaleRecipe={handleOpenScale}
                onSubstituteIngredient={handleOpenSubstitute}
                onAskChefMate={handleAskChefMate}
                onOpenDetail={handleOpenDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAskDirectPrompt={handleAskDirectPrompt}
              />
            )}

            {activeTab === 'recipes' && (
              <Recipes
                onStartCooking={handleStartCooking}
                onScaleRecipe={handleOpenScale}
                onSubstituteIngredient={handleOpenSubstitute}
                onAskChefMate={handleAskChefMate}
                onOpenDetail={handleOpenDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                pantryItems={pantryItems}
              />
            )}

            {activeTab === 'pantry' && (
              <Pantry
                pantryItems={pantryItems}
                onAddItem={handleAddPantryItem}
                onUpdateItem={handleUpdatePantryItem}
                onDeleteItem={handleDeletePantryItem}
                onCookWithPantry={handleCookWithPantry}
              />
            )}

            {activeTab === 'meal-planner' && <MealPlanner />}

            {activeTab === 'favorites' && (
              <Favorites
                favorites={favorites}
                onOpenRecipe={handleOpenDetail}
                onStartCooking={handleStartCooking}
                onDeleteFavorite={async (id) => {
                  await api.deleteFavorite(id);
                  await loadFavorites();
                }}
                onDiscoverRecipes={() => setActiveTab('recipes')}
              />
            )}

            {activeTab === 'chat' && (
              <CookingAssistant
                recipeContext={chatRecipeContext}
                initialPrompt={chatInitialPrompt}
                onClearRecipeContext={() => setChatRecipeContext(null)}
              />
            )}
          </>
        )}
      </div>

      {/* Distraction-Free "Start Cooking" Mode Overlay */}
      {isCookingMode && activeCookingRecipe && (
        <CookingMode
          recipe={activeCookingRecipe}
          onExit={() => {
            setIsCookingMode(false);
            setActiveCookingRecipe(null);
          }}
        />
      )}

      {/* Ingredient Substitution Modal */}
      {subModalRecipe && (
        <SubstitutionModal
          recipe={subModalRecipe}
          isOpen={!!subModalRecipe}
          onClose={() => setSubModalRecipe(null)}
          preSelectedIngredient={subPreSelectedIng}
        />
      )}

      {/* Recipe Scaling Modal */}
      {scaleModalRecipe && (
        <ScaleModal
          recipe={scaleModalRecipe}
          isOpen={!!scaleModalRecipe}
          onClose={() => setScaleModalRecipe(null)}
          onRecipeScaled={handleRecipeScaled}
        />
      )}

      {/* Gemini Configuration Modal */}
      <ConfigWarningModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        isConfigured={isAiConfigured}
        onRefreshStatus={refreshStatus}
      />
    </div>
  );
}

export default App;
