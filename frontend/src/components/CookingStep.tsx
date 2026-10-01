import React from 'react';
import { Check, HelpCircle } from 'lucide-react';

interface CookingStepProps {
  stepNumber: number;
  instruction: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onAskAboutStep?: (stepText: string, stepIndex: number) => void;
}

export const CookingStep: React.FC<CookingStepProps> = ({
  stepNumber,
  instruction,
  isCompleted,
  onToggleComplete,
  onAskAboutStep,
}) => {
  const formattedNumber = String(stepNumber).padStart(2, '0');

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 text-stone-500'
          : 'bg-white border-stone-200/90 text-stone-900 shadow-2xs hover:border-orange-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox */}
          <button
            type="button"
            onClick={onToggleComplete}
            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-stone-300 bg-stone-50 hover:border-orange-500'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Number and Step instruction */}
          <div>
            <span
              className={`text-xs font-mono font-bold tracking-wider mr-2 ${
                isCompleted ? 'text-emerald-700' : 'text-orange-600'
              }`}
            >
              {formattedNumber}
            </span>
            <span
              className={`text-sm leading-relaxed ${
                isCompleted ? 'line-through text-stone-400' : 'text-stone-800'
              }`}
            >
              {instruction}
            </span>
          </div>
        </div>

        {/* Quick ask button */}
        {onAskAboutStep && !isCompleted && (
          <button
            type="button"
            onClick={() => onAskAboutStep(instruction, stepNumber - 1)}
            title="Ask ChefMate for tips on this step"
            className="flex-shrink-0 p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
