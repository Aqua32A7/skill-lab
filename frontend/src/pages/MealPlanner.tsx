import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Users,
  Flame,
  Award,
  DollarSign,
  Clock,
  ShoppingCart,
  ChefHat,
  ChevronRight,
  AlertCircle,
  Check
} from 'lucide-react';
import { MealPlanResponse, DayPlan } from '../types/recipe';
import { api } from '../services/api';
import { LoadingState } from '../components/LoadingState';

export const MealPlanner: React.FC = () => {
  const [people, setPeople] = useState<number>(2);
  const [diet, setDiet] = useState<string>('Any');
  const [cuisine, setCuisine] = useState<string>('Any');
  const [budget, setBudget] = useState<string>('Moderate');
  const [targetCalories, setTargetCalories] = useState<string>('2000');
  const [targetProtein, setTargetProtein] = useState<string>('80');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<MealPlanResponse | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.generateMealPlan({
        people,
        diet: diet === 'Any' ? undefined : diet,
        cuisine: cuisine === 'Any' ? undefined : cuisine,
        budget,
        target_calories_per_day: targetCalories ? parseInt(targetCalories) : undefined,
        target_protein_per_day: targetProtein ? parseInt(targetProtein) : undefined,
      });
      setPlanData(response);
      setSelectedDayIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to generate weekly meal plan. Please check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const activeDay: DayPlan | undefined = planData?.weekly_plan[selectedDayIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Intelligent Nutrition Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-serif mb-3">
          Weekly Meal Planner
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Specify your household size, caloric and macro targets, and culinary preferences.
          Gemini will curate a seamless 7-day culinary roadmap with consolidated grocery planning.
        </p>
      </div>

      {/* Configuration Controls */}
      <form onSubmit={handleGeneratePlan} className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* People */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Number of People
            </label>
            <select
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>

          {/* Diet */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Dietary Preference
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {['Any', 'Vegetarian', 'Vegan', 'High-Protein', 'Low Carb', 'Mediterranean', 'Keto'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Cuisine Variety
            </label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {['Any', 'Mixed / Global', 'Mediterranean', 'Asian Fusion', 'Italian', 'Mexican', 'Indian'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Budget Level
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {['Budget-friendly', 'Moderate', 'Gourmet / Premium'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Calories Target */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Target Calories / Day
            </label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Daily Protein Target */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Target Protein / Day (g)
            </label>
            <input
              type="number"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              placeholder="e.g. 90"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate 7-Day Weekly Meal Plan</span>
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <LoadingState
          title="Gemini is designing your 7-Day Meal Architecture..."
          subtitle="Balancing calories, macronutrients, and grocery efficiency across Monday through Sunday"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Meal Planner Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Meal Plan Results */}
      {planData && (
        <div className="space-y-10">
          {/* Day Navigation Tabs */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2">
            {planData.weekly_plan.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex flex-col items-center ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-105'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  <span className="text-sm font-serif">{day.day}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                    {day.daily_total_calories} kcal
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day View */}
          {activeDay && (
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Day Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 font-serif">
                    {activeDay.day} Daily Menu
                  </h2>
                  <p className="text-xs text-stone-500">
                    Crafted for {people} {people === 1 ? 'person' : 'people'} &bull; {budget} Budget
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span>{activeDay.daily_total_calories} Total kcal</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{activeDay.daily_total_protein}g Protein</span>
                  </div>
                </div>
              </div>

              {/* Breakfast, Lunch, Dinner Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast */}
                <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/60 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                      Breakfast
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 font-serif mt-3 mb-1">
                      {activeDay.breakfast.meal_name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {activeDay.breakfast.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-amber-200/40">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{activeDay.breakfast.cooking_time} mins</span>
                      </span>
                      <span className="font-bold text-amber-900">
                        {activeDay.breakfast.estimated_calories} kcal &bull; {activeDay.breakfast.estimated_protein}g pro
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {activeDay.breakfast.key_ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] bg-white text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className="p-6 rounded-3xl bg-orange-50/50 border border-orange-200/60 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-1 rounded-lg">
                      Lunch
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 font-serif mt-3 mb-1">
                      {activeDay.lunch.meal_name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {activeDay.lunch.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-orange-200/40">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{activeDay.lunch.cooking_time} mins</span>
                      </span>
                      <span className="font-bold text-orange-900">
                        {activeDay.lunch.estimated_calories} kcal &bull; {activeDay.lunch.estimated_protein}g pro
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {activeDay.lunch.key_ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] bg-white text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/60 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-1 rounded-lg">
                      Dinner
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 font-serif mt-3 mb-1">
                      {activeDay.dinner.meal_name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {activeDay.dinner.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-rose-200/40">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{activeDay.dinner.cooking_time} mins</span>
                      </span>
                      <span className="font-bold text-rose-900">
                        {activeDay.dinner.estimated_calories} kcal &bull; {activeDay.dinner.estimated_protein}g pro
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {activeDay.dinner.key_ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] bg-white text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grocery List & Chef Prep Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grocery Shopping List */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Consolidated Grocery List</h3>
                  <p className="text-xs text-stone-500">Everything needed for the full 7 days</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {planData.grocery_list.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-stone-700 p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50/50 transition-colors">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef Prep Tips */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Chef Prep Tips</h3>
                  <p className="text-xs text-stone-500">Effort-saving meal prep tactics for the week</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {planData.chef_tips.map((tip, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 leading-relaxed flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
