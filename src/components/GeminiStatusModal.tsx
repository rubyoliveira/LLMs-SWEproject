import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle2, Shield, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface GeminiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasServerKey: boolean;
  onKeySaved: (key: string) => void;
}

export const GeminiStatusModal: React.FC<GeminiStatusModalProps> = ({
  isOpen,
  onClose,
  hasServerKey,
  onKeySaved,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Gemini API key.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/config/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Gemini API key verified! All copilot requests are now running 100% through Gemini (gemini-3.8-flash).',
        });
        onKeySaved(keyInput.trim());
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to verify API key with Google Gemini.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Network error connecting to Gemini API server endpoint.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-lg rounded-xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                Configure Gemini API Key
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Direct Google GenAI integration (gemini-3.8-flash)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status card */}
        <div className="bg-[#fbfaf8] dark:bg-[#28262a] border border-[#eeeae5] dark:border-[#333036] rounded-xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              API Key Connection
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                hasServerKey
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
              }`}
            >
              {hasServerKey ? 'Gemini 3.8 Flash Active' : 'Key Needed for Full LLM'}
            </span>
          </div>
          <p className="text-[#666666] dark:text-[#a0a0a0] leading-relaxed">
            Enter your <strong>Gemini API key</strong> below to route all queries (e.g. <em>"lunch at burger king"</em>) directly through Gemini AI for autonomous merchant classification, MCC routing, and credit optimization.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveAndVerify} className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e]">
                Enter Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#74455d] dark:text-[#c98bb1] hover:underline flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8c8c8c]" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs font-mono text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>
            <p className="text-[10px] text-[#8c8c8c] mt-1">
              Key is verified with Google GenAI and stored securely on your server backend.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#666666] dark:text-[#a0a0a0] hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Verifying with Gemini...' : 'Verify & Enable Gemini AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
