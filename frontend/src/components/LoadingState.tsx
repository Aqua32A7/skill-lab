import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, Sparkles, Utensils } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

const COOKING_TIPS = [
  "Season your food in layers, tasting as you build the dish.",
  "Resting meats after cooking allows juices to redistribute throughout.",
  "Dry herbs go into sauces early; fresh delicate herbs go in at the very end.",
  "High heat caramelizes vegetables, unlocking deep natural sweetness.",
  "Always save a cup of starchy pasta water to bind pan sauces smoothly.",
  "A sharp chef's knife is significantly safer and faster than a dull one.",
  "Bringing ingredients to room temperature ensures even pan searing."
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "ChefMate is crafting your recipe...",
  subtitle = "Infusing culinary expertise and nutritional balance"
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % COOKING_TIPS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/70 backdrop-blur-sm rounded-3xl border border-stone-200/80 shadow-sm max-w-lg mx-auto my-8">
      {/* Animated cooking icon container */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 animate-bounce">
          <ChefHat className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center shadow-md animate-spin" style={{ animationDuration: '4s' }}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute -top-1 -left-2 text-rose-500 animate-pulse">
          <Flame className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-stone-900 font-serif mb-1">{title}</h3>
      <p className="text-sm text-stone-500 mb-6">{subtitle}</p>

      {/* Culinary tip banner */}
      <div className="w-full bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 text-left transition-all">
        <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Utensils className="w-3.5 h-3.5" />
          <span>Chef's Secret Tip</span>
        </div>
        <p className="text-xs text-amber-950 font-medium leading-relaxed italic">
          "{COOKING_TIPS[tipIndex]}"
        </p>
      </div>

      {/* Progress bar shimmer */}
      <div className="w-full h-1.5 bg-stone-100 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 w-1/2 rounded-full animate-pulse" />
      </div>
    </div>
  );
};
