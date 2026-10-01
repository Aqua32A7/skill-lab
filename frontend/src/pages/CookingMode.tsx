import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChefHat,
  Send,
  CheckCircle2,
  HelpCircle,
  Clock,
  Flame,
  Volume2,
  RefreshCw,
  X
} from 'lucide-react';
import { Recipe, ChatMessage } from '../types/recipe';
import { api } from '../services/api';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [inStepChatHistory, setInStepChatHistory] = useState<ChatMessage[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const totalSteps = recipe.instructions.length;
  const currentStepText = recipe.instructions[currentStepIndex] || 'Ready to cook!';
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsFinished(false);
    }
  };

  const handleAskChef = async (textToSend?: string) => {
    const query = textToSend || questionInput.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...inStepChatHistory, userMsg];
    setInStepChatHistory(newHistory);
    setQuestionInput('');
    setLoadingChat(true);

    try {
      const response = await api.chatWithChef(
        newHistory,
        {
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        },
        currentStepIndex
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setInStepChatHistory([...newHistory, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `ChefMate note: ${err.message || 'Please check your Gemini API key configuration in backend/.env.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setInStepChatHistory([...newHistory, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Quick contextual questions tailored to home cooks
  const stepSuggestions = [
    "How do I know when it's done?",
    "Can I lower or raise the heat?",
    "What should this look or smell like?",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F5] text-stone-900 flex flex-col justify-between overflow-y-auto">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Cooking Mode</span>
        </button>

        <div className="text-center">
          <div className="text-xs text-orange-600 font-bold uppercase tracking-wider font-mono">
            {recipe.cuisine} &bull; {recipe.servings} Servings
          </div>
          <h2 className="text-base font-bold text-stone-900 font-serif truncate max-w-xs sm:max-w-md">
            {recipe.name}
          </h2>
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            chatOpen
              ? 'bg-orange-600 text-white'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span className="hidden sm:inline">Ask ChefMate</span>
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1.5">
        <div
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 h-full transition-all duration-300"
          style={{ width: `${isFinished ? 100 : progressPercent}%` }}
        />
      </div>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center items-center text-center">
        {!isFinished ? (
          <div className="space-y-8 max-w-3xl w-full">
            {/* Step Counter Badge */}
            <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-bold tracking-wider font-mono">
              <span>STEP {currentStepIndex + 1} OF {totalSteps}</span>
            </div>

            {/* Giant instruction text */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
              <p className="text-2xl sm:text-4xl font-serif text-stone-900 leading-snug font-medium">
                {currentStepText}
              </p>
            </div>

            {/* Quick in-step query chips */}
            <div className="space-y-2">
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                Have a question about this step?
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {stepSuggestions.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatOpen(true);
                      handleAskChef(query);
                    }}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-700 shadow-2xs transition-all flex items-center space-x-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Dish Completed View */
          <div className="bg-white p-10 sm:p-14 rounded-3xl border border-stone-200 shadow-xl max-w-lg text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-stone-900 font-serif mb-2">Bon Appétit!</h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                You've successfully completed all {totalSteps} steps for <strong className="text-stone-800">{recipe.name}</strong>.
                Take a moment to plate, garnish, and enjoy your meal!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onExit}
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/20"
              >
                Return to Recipe
              </button>
              <button
                onClick={() => {
                  setIsFinished(false);
                  setCurrentStepIndex(0);
                }}
                className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-semibold text-sm"
              >
                Review Steps
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating In-Cooking AI Chat Drawer */}
      {chatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
          {/* Drawer Header */}
          <div className="p-4 bg-orange-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5" />
              <div>
                <h4 className="font-bold text-sm">ChefMate Live Support</h4>
                <p className="text-[10px] text-orange-100">Step {currentStepIndex + 1} Context Active</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Chat Scroll */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
            {inStepChatHistory.length === 0 ? (
              <div className="text-center py-6 text-stone-400">
                <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="font-medium text-stone-600">Ask any question about this step!</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  "How do I know when they're translucent?" &bull; "Can I use low heat?"
                </p>
              </div>
            ) : (
              inStepChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-orange-600 text-white ml-8 rounded-tr-xs'
                      : 'bg-stone-100 text-stone-800 mr-8 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              ))
            )}

            {loadingChat && (
              <div className="p-3 bg-stone-50 rounded-2xl mr-8 text-stone-500 italic flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>ChefMate is thinking...</span>
              </div>
            )}
          </div>

          {/* Drawer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskChef();
            }}
            className="p-3 border-t border-stone-200 bg-stone-50 flex items-center space-x-2"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask about this step..."
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={loadingChat || !questionInput.trim()}
              className="p-2 bg-orange-600 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Sticky Control Bar */}
      <footer className="px-6 py-5 border-t border-stone-200 bg-white/95 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 text-stone-800 text-sm font-bold flex items-center space-x-2 shadow-xs transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-stone-500 font-mono hidden sm:block">
          {currentStepIndex + 1} / {totalSteps}
        </div>

        <button
          onClick={handleNext}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold flex items-center space-x-2 shadow-md shadow-orange-600/25 transition-all"
        >
          <span>{currentStepIndex === totalSteps - 1 ? 'Finish Dish' : 'Next Step'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
