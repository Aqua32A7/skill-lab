import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Refrigerator,
  CalendarDays,
  Flame,
  Clock,
  ShieldCheck,
  ChefHat,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { api } from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { LoadingState } from '../components/LoadingState';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onStartCooking: (recipe: Recipe) => void;
  onScaleRecipe: (recipe: Recipe) => void;
  onSubstituteIngredient: (recipe: Recipe) => void;
  onAskChefMate: (recipe: Recipe) => void;
  onOpenDetail: (recipe: Recipe) => void;
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onAskDirectPrompt: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  "What can I make with eggs, rice and onions?",
  "Give me a high-protein vegetarian dinner.",
  "How can I replace butter in this recipe?",
  "I have 20 minutes. What can I cook?",
];

const QUICK_TAGS = [
  { label: 'High Protein', diet: 'High protein' },
  { label: 'Under 25 mins', maxTime: 25 },
  { label: 'Italian Comfort', cuisine: 'Italian' },
  { label: 'Vegetarian', diet: 'Vegetarian' },
  { label: 'Mexican Fiesta', cuisine: 'Mexican' },
  { label: 'Healthy Meal-Prep', diet: 'Low calorie' },
];

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  onStartCooking,
  onScaleRecipe,
  onSubstituteIngredient,
  onAskChefMate,
  onOpenDetail,
  favorites,
  onToggleFavorite,
  onAskDirectPrompt,
}) => {
  const [heroInput, setHeroInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleHeroSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = heroInput.trim();
    if (!query) return;

    // If query looks like a question e.g. "How can I replace...", route directly to chat!
    if (query.toLowerCase().startsWith('how') || query.toLowerCase().startsWith('why') || query.includes('?')) {
      onAskDirectPrompt(query);
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const recipe = await api.generateRecipe({
        prompt: query,
        servings: 2,
      });
      setGeneratedRecipe(recipe);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipe. Please verify your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTagClick = async (tag: { label: string; diet?: string; maxTime?: number; cuisine?: string }) => {
    setHeroInput(tag.label);
    setLoading(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const recipe = await api.generateRecipe({
        prompt: tag.label,
        diet: tag.diet,
        max_time: tag.maxTime,
        cuisine: tag.cuisine,
      });
      setGeneratedRecipe(recipe);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipe. Please verify your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 sm:pt-10">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>Next-Gen Culinary Intelligence Powered by Gemini</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight font-serif mb-5 leading-tight">
          What are you cooking today?
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          From pantry ingredient matching to conversational cooking mode and instant substitutions,
          ChefMate AI turns any kitchen into a five-star culinary studio.
        </p>

        {/* Large AI input box */}
        <form onSubmit={handleHeroSubmit} className="relative max-w-2xl mx-auto mb-4 group">
          <div className="relative flex items-center bg-white rounded-3xl border-2 border-stone-200 group-hover:border-orange-400 focus-within:border-orange-500 shadow-xl shadow-orange-500/5 transition-all p-2 pl-5">
            <Search className="w-5 h-5 text-stone-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              placeholder="Ask ChefMate anything..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none text-base"
            />
            <button
              type="submit"
              disabled={loading || !heroInput.trim()}
              className="ml-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/25 flex items-center space-x-2 transition-all flex-shrink-0"
            >
              <span>Ask Chef</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Example prompts */}
        <div className="max-w-2xl mx-auto text-left">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Try asking:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setHeroInput(prompt);
                  if (prompt.startsWith('How') || prompt.startsWith('What can I make with eggs')) {
                    onAskDirectPrompt(prompt);
                  } else {
                    handleHeroSubmit();
                  }
                }}
                className="text-left text-xs text-stone-600 hover:text-orange-700 bg-white/70 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-200 rounded-xl px-3 py-2 transition-all flex items-center justify-between group/btn"
              >
                <span className="truncate mr-2">&ldquo;{prompt}&rdquo;</span>
                <Sparkles className="w-3 h-3 text-stone-400 group-hover/btn:text-orange-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tags pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-800 border border-stone-200 transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* Loading state display */}
      {loading && (
        <LoadingState
          title="ChefMate is creating your custom recipe..."
          subtitle="Calculating flavor profiles, ingredient synergy, and nutritional estimates"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Generation Notice</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Newly generated recipe display */}
      {generatedRecipe && (
        <section className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-stone-900 font-serif flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>ChefMate's Custom Recommendation</span>
            </h2>
            <button
              onClick={() => setGeneratedRecipe(null)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Clear
            </button>
          </div>
          <RecipeCard
            recipe={generatedRecipe}
            isFavorite={favorites.some((f) => f.id === generatedRecipe.id || f.name === generatedRecipe.name)}
            onToggleFavorite={onToggleFavorite}
            onStartCooking={onStartCooking}
            onScaleRecipe={onScaleRecipe}
            onSubstituteIngredient={onSubstituteIngredient}
            onAskChefMate={onAskChefMate}
            onOpenDetail={onOpenDetail}
          />
        </section>
      )}

      {/* Core Features Highlight Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-stone-900 font-serif">
            A Complete Culinary Copilot
          </h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto mt-2">
            Engineered specifically to solve real kitchen problems: from forgotten ingredients to portion adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What's in your kitchen */}
          <div
            onClick={() => onNavigate('recipes')}
            className="p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-2 group-hover:text-orange-600 transition-colors">
              What's in Your Kitchen?
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6 flex-1">
              Select chips for eggs, rice, tomatoes, or whatever is in your fridge. Filter by cuisine, dietary preference, and time for zero-waste meals.
            </p>
            <div className="flex items-center text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
              <span>Generate from Ingredients</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 2: Interactive Cooking Mode */}
          <div
            onClick={() => onNavigate('chat')}
            className="p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChefHat className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-2 group-hover:text-orange-600 transition-colors">
              Hands-Free Cooking Mode
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6 flex-1">
              Distraction-free step-by-step instructions with contextual Q&amp;A. Ask "How do I know when onions are translucent?" and get immediate expert answers.
            </p>
            <div className="flex items-center text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
              <span>Talk to ChefMate AI</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 3: Smart Weekly Meal Planner */}
          <div
            onClick={() => onNavigate('meal-planner')}
            className="p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-2 group-hover:text-orange-600 transition-colors">
              7-Day Meal Planner
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6 flex-1">
              Custom weekly plans for your group size, budget, and caloric goals, complete with a consolidated grocery shopping list and chef prep tips.
            </p>
            <div className="flex items-center text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
              <span>Plan Your Week</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Quality Assurance Guarantee */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Food Safety &amp; Reliability First</span>
            </div>
            <h3 className="text-2xl font-bold font-serif">Home-Cook Friendly Guidance</h3>
            <p className="text-xs text-stone-400 max-w-lg">
              ChefMate AI prioritizes conservative food-safety temperatures, verified substitution ratios, and practical home cooking techniques.
            </p>
          </div>
          <button
            onClick={() => onNavigate('pantry')}
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/30 whitespace-nowrap transition-colors"
          >
            Manage Your Pantry
          </button>
        </div>
      </section>
    </div>
  );
};
