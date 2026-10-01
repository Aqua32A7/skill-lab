import React from 'react';
import { ChefHat, User, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/recipe';

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format message lines into paragraphs and bullet lists
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={i} className="h-2" />;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        return (
          <div key={i} className="flex items-start space-x-2 my-1 pl-1">
            <span className="text-orange-500 font-bold">•</span>
            <span className="flex-1">{trimmed.substring(2)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+\.)\s*(.*)$/);
        return (
          <div key={i} className="flex items-start space-x-2 my-1 pl-1">
            <span className="text-orange-600 font-mono font-bold text-xs mt-0.5">{match ? match[1] : '•'}</span>
            <span className="flex-1">{match ? match[2] : trimmed}</span>
          </div>
        );
      }
      return (
        <p key={i} className="my-1.5 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-stone-800 text-white'
            : 'bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 text-white'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-sm shadow-sm ${
          isUser
            ? 'bg-orange-600 text-white rounded-tr-xs'
            : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-black/5">
          <span className={`text-[11px] font-bold tracking-wider uppercase ${isUser ? 'text-orange-100' : 'text-stone-500'}`}>
            {isUser ? 'You' : 'ChefMate AI'}
          </span>
          {message.timestamp && (
            <span className={`text-[10px] ${isUser ? 'text-orange-200' : 'text-stone-400'}`}>
              {message.timestamp}
            </span>
          )}
        </div>
        <div className="text-sm">{renderFormattedContent(message.content)}</div>
      </div>
    </div>
  );
};
