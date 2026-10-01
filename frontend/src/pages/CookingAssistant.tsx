import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Send,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  Utensils
} from 'lucide-react';
import { ChatMessage as ChatMessageType, Recipe } from '../types/recipe';
import { api } from '../services/api';
import { ChatMessage } from '../components/ChatMessage';

interface CookingAssistantProps {
  recipeContext?: Recipe | null;
  initialPrompt?: string;
  onClearRecipeContext?: () => void;
}

const INITIAL_MESSAGES: ChatMessageType[] = [
  {
    role: 'assistant',
    content:
      "Hello! I'm ChefMate AI, your dedicated cooking assistant. Whether you're working with mystery ingredients in your pantry, dialing in the perfect steak temperature, or looking for clever ingredient substitutions, I'm here to guide you step-by-step. What are you cooking today?",
    timestamp: 'Just now',
  },
];

const SUGGESTED_QUERIES = [
  'I have chicken and rice. What can I make?',
  'How do I know when bread dough is fully kneaded?',
  'What is the safe internal temperature for salmon and poultry?',
  'How can I rescue a dish that is too salty or acidic?',
];

export const CookingAssistant: React.FC<CookingAssistantProps> = ({
  recipeContext,
  initialPrompt,
  onClearRecipeContext,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessageType = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.chatWithChef(
        updated,
        recipeContext
          ? {
              name: recipeContext.name,
              ingredients: recipeContext.ingredients,
              instructions: recipeContext.instructions,
            }
          : undefined
      );

      const assistantMsg: ChatMessageType = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...updated, assistantMsg]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with ChefMate. Please check your Gemini API key in backend/.env.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 pb-20 flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">ChefMate AI Live Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-stone-500">
              Conversational cooking intelligence &bull; Food safety &amp; culinary technique
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {recipeContext && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-xl text-xs font-semibold">
              <Utensils className="w-3.5 h-3.5 text-orange-600" />
              <span className="truncate max-w-[120px]">{recipeContext.name}</span>
              {onClearRecipeContext && (
                <button
                  onClick={onClearRecipeContext}
                  className="text-stone-400 hover:text-stone-700 ml-1"
                >
                  &times;
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-5">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="bg-stone-50 border border-stone-200/80 rounded-3xl rounded-tl-xs p-4 text-xs text-stone-600 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
              <span>ChefMate is thinking and preparing cooking advice...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Dynamic Follow-up Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Follow-up questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/80 transition-colors text-left flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Starter Chips if only welcome message */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 px-2 flex-shrink-0">
          {SUGGESTED_QUERIES.map((query, i) => (
            <button
              key={i}
              onClick={() => handleSend(query)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-200 text-stone-600 hover:text-orange-900 transition-colors text-left"
            >
              &ldquo;{query}&rdquo;
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative bg-white rounded-3xl border border-stone-200 shadow-lg shadow-stone-200/50 p-2 pl-4 flex items-center space-x-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ChefMate anything... (e.g. I have eggs, rice and onions)"
          disabled={loading}
          className="w-full bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none text-sm py-2"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/20 disabled:opacity-40 transition-all flex items-center space-x-1.5 flex-shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
