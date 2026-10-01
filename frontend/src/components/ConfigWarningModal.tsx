import React, { useState } from 'react';
import { X, Key, Check, Copy, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface ConfigWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  onRefreshStatus: () => Promise<void>;
}

export const ConfigWarningModal: React.FC<ConfigWarningModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
  onRefreshStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const envSample = `GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here\nDATABASE_URL=sqlite:///./chefmate.db\nGEMINI_MODEL=gemini-2.5-flash`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setChecking(true);
    setTestResult(null);
    try {
      await onRefreshStatus();
      const health = await api.checkHealth();
      if (health.gemini_configured) {
        setTestResult('Success! Gemini API Key is configured and ready.');
      } else {
        setTestResult('Key not found yet. Please make sure you saved it in backend/.env and restart the backend.');
      }
    } catch (err: any) {
      setTestResult(`Connection error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                {isConfigured ? 'Gemini API Connected' : 'Configure Gemini API Key'}
              </h3>
              <p className="text-xs text-stone-500">Google Gemini powers ChefMate AI cooking intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-stone-700">
          {isConfigured ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Your Gemini API Key is configured and ready!</p>
                <p className="text-xs text-emerald-800 mt-1">
                  ChefMate can generate custom recipes, manage substitutions, scale portions, and provide live cooking chat.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Gemini API Key Required for Real-time AI</p>
                <p className="text-xs text-amber-800 mt-1">
                  ChefMate connects directly to the official Google Gemini API. Please add your key to enable live generation.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Step 1: Get a Free Gemini API Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-stone-500">
              Generate a free API key instantly in Google AI Studio with your Google account.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Step 2: Add to <code className="text-orange-600 font-mono">backend/.env</code>
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-stone-200 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-stone-800">
              {envSample}
            </pre>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium border ${
                testResult.startsWith('Success')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResult}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={checking}
            className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Connection'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
