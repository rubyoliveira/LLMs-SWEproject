import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Zap,
  Check,
  AlertCircle,
  KeyRound,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { CreditCard } from '../types';

interface PlaidLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardsConnected: (cards: CreditCard[]) => void;
}

export const PlaidLinkModal: React.FC<PlaidLinkModalProps> = ({
  isOpen,
  onClose,
  onCardsConnected,
}) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [plaidEnv, setPlaidEnv] = useState<string>('sandbox');
  const [clientIdPrefix, setClientIdPrefix] = useState<string>('');
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Form inputs for Plaid API credentials
  const [inputClientId, setInputClientId] = useState<string>('');
  const [inputSecret, setInputSecret] = useState<string>('');
  const [inputEnv, setInputEnv] = useState<'sandbox' | 'production'>('sandbox');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLaunchingLink, setIsLaunchingLink] = useState<boolean>(false);
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [isInstantSyncing, setIsInstantSyncing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);

  // Check Plaid configuration on modal open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStatusMessage(null);
      checkPlaidStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const checkPlaidStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/plaid/status');
      const data = await res.json();
      setIsConfigured(!!data.isConfigured);
      setPlaidEnv(data.env || 'sandbox');
      setClientIdPrefix(data.clientIdPrefix || '');

      if (data.isConfigured) {
        await fetchLinkToken();
      } else {
        setShowConfigForm(true);
      }
    } catch {
      setIsConfigured(false);
      setShowConfigForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.link_token) {
        setLinkToken(data.link_token);
        return data.link_token;
      } else {
        setErrorMessage(data.error || 'Could not create Plaid Link token');
        return null;
      }
    } catch {
      setErrorMessage('Failed to connect to Plaid server endpoint');
      return null;
    }
  };

  // Launch the OFFICIAL Plaid Link Modal (iframe from cdn.plaid.com)
  const handleLaunchOfficialPlaidLink = async (tokenToUse?: string) => {
    setErrorMessage(null);
    setIsLaunchingLink(true);

    const token = tokenToUse || linkToken || (await fetchLinkToken());

    if (!token) {
      setIsLaunchingLink(false);
      setErrorMessage('Plaid Link token is not available. Please verify your Plaid credentials.');
      return;
    }

    if (typeof (window as any).Plaid === 'undefined') {
      setIsLaunchingLink(false);
      setErrorMessage('Plaid Link SDK is loading from CDN. Please wait a moment and try again.');
      return;
    }

    try {
      const plaidHandler = (window as any).Plaid.create({
        token,
        onSuccess: async (public_token: string, metadata: any) => {
          setIsExchanging(true);
          setStatusMessage(`Connecting to ${metadata?.institution?.name || 'bank'}...`);

          try {
            const exchangeRes = await fetch('/api/plaid/exchange-public-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token, metadata }),
            });
            const exchangeData = await exchangeRes.json();
            setIsExchanging(false);

            if (exchangeData.success && Array.isArray(exchangeData.cards) && exchangeData.cards.length > 0) {
              onCardsConnected(exchangeData.cards);
              onClose();
            } else {
              setErrorMessage(exchangeData.error || 'No credit card accounts found at this institution');
            }
          } catch {
            setIsExchanging(false);
            setErrorMessage('Failed to exchange Plaid public token');
          }
        },
        onExit: (err: any) => {
          setIsLaunchingLink(false);
          if (err) {
            setErrorMessage(`Plaid Link error: ${err.display_message || err.message}`);
          }
        },
        onEvent: (eventName: string) => {
          if (eventName === 'OPEN') {
            setIsLaunchingLink(false);
          }
        },
      });

      plaidHandler.open();
    } catch (err: any) {
      setIsLaunchingLink(false);
      setErrorMessage(`Failed to open Plaid Link: ${err?.message || 'Unknown error'}`);
    }
  };

  // Save Plaid credentials to server and immediately launch Link
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim() || !inputSecret.trim()) {
      setErrorMessage('Both Plaid Client ID and Secret are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/plaid/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: inputClientId.trim(),
          secret: inputSecret.trim(),
          env: inputEnv,
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setIsConfigured(true);
        setPlaidEnv(inputEnv);
        setShowConfigForm(false);
        setStatusMessage('Plaid credentials verified! Initializing real Plaid Link session...');

        // Fetch link token and launch official Plaid Link
        const newToken = await fetchLinkToken();
        if (newToken) {
          handleLaunchOfficialPlaidLink(newToken);
        }
      } else {
        setErrorMessage(data.error || 'Failed to save Plaid credentials');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to communicate with Plaid API');
    }
  };

  // One-click real US Cards Portfolio Import
  const handleInstantAllCards = async () => {
    setIsInstantSyncing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/plaid/connect-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setIsInstantSyncing(false);

      if (data.success && Array.isArray(data.cards) && data.cards.length > 0) {
        onCardsConnected(data.cards);
        onClose();
      } else {
        setErrorMessage('Failed to import card portfolio');
      }
    } catch {
      setIsInstantSyncing(false);
      setErrorMessage('Connection error during card portfolio import');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#1a191c] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8e4df] dark:border-[#2f2d31] flex items-center justify-between bg-[#fbf9f7] dark:bg-[#201f22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-white flex items-center justify-center text-white dark:text-[#111] font-black text-sm tracking-tighter">
              ☵
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#191919] dark:text-white tracking-tight">
                  Plaid Link API
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  Official SDK
                </span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#8c8c8c]" />
                Direct bank connection via cdn.plaid.com
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#191919] dark:text-[#9e9e9e] dark:hover:text-white hover:bg-[#eae6e1] dark:hover:bg-[#2b292e] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error / Status Messages */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/50 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Active Configuration View */}
          {isConfigured && !showConfigForm ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Plaid API Client Configured ({plaidEnv.toUpperCase()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfigForm(true)}
                    className="text-[11px] text-[#74455d] dark:text-[#c98bb1] font-semibold hover:underline cursor-pointer"
                  >
                    Edit Keys
                  </button>
                </div>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                  Ready to open the official Plaid Link iframe window. Plaid connects securely with over 12,000 real US financial institutions.
                </p>
              </div>

              {/* Primary Action: Launch Official Plaid Link */}
              <button
                type="button"
                disabled={isLaunchingLink || isExchanging}
                onClick={() => handleLaunchOfficialPlaidLink()}
                className="w-full py-3 px-4 rounded-xl bg-[#111] hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-[#111] font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLaunchingLink || isExchanging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Opening Official Plaid Link...</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono font-black text-sm text-amber-300 dark:text-[#74455d]">☵</span>
                    <span>Launch Official Plaid Link (Connect Live Bank)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Configure Plaid Credentials Form */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#191919] dark:text-white text-xs">
                  <KeyRound className="w-4 h-4 text-[#74455d] dark:text-[#c98bb1]" />
                  <span>Real Plaid API Integration</span>
                </div>
                <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] leading-relaxed">
                  Real Plaid Link uses Plaid&apos;s hosted iframe dialog (served from <code>cdn.plaid.com</code>). To connect to live banks, provide your Plaid Client ID and Secret key from your Plaid Dashboard:
                </p>
                <a
                  href="https://dashboard.plaid.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#74455d] dark:text-[#c98bb1] hover:underline pt-0.5"
                >
                  <span>Get free Plaid Sandbox / Dev keys at dashboard.plaid.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#737373] dark:text-[#9e9e9e] mb-1">
                    Plaid Client ID
                  </label>
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="e.g. 64f1b8a92e..."
                    required
                    className="w-full px-3 py-2 rounded-lg text-xs bg-[#f5f2ed] dark:bg-[#252427] border border-[#e0dad2] dark:border-[#38353b] text-[#191919] dark:text-white placeholder-[#8c8c8c] focus:outline-none focus:ring-1 focus:ring-[#74455d] dark:focus:ring-[#c98bb1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#737373] dark:text-[#9e9e9e] mb-1">
                    Plaid Secret Key
                  </label>
                  <input
                    type="password"
                    value={inputSecret}
                    onChange={(e) => setInputSecret(e.target.value)}
                    placeholder="e.g. 883f0a129d..."
                    required
                    className="w-full px-3 py-2 rounded-lg text-xs bg-[#f5f2ed] dark:bg-[#252427] border border-[#e0dad2] dark:border-[#38353b] text-[#191919] dark:text-white placeholder-[#8c8c8c] focus:outline-none focus:ring-1 focus:ring-[#74455d] dark:focus:ring-[#c98bb1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#737373] dark:text-[#9e9e9e] mb-1">
                    Plaid Environment
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInputEnv('sandbox')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        inputEnv === 'sandbox'
                          ? 'bg-[#74455d] text-white border-[#74455d]'
                          : 'bg-white dark:bg-[#252427] text-[#737373] dark:text-[#9e9e9e] border-[#e0dad2] dark:border-[#38353b]'
                      }`}
                    >
                      Sandbox (Free Testing)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputEnv('production')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        inputEnv === 'production'
                          ? 'bg-[#74455d] text-white border-[#74455d]'
                          : 'bg-white dark:bg-[#252427] text-[#737373] dark:text-[#9e9e9e] border-[#e0dad2] dark:border-[#38353b]'
                      }`}
                    >
                      Production (Live Banks)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#191919] dark:bg-white text-white dark:text-[#191919] font-bold text-xs tracking-tight flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving &amp; Testing Plaid API...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Connect Plaid API &amp; Launch Link</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Instant Multi-Card Sync (Preloaded US Credit Cards) */}
          <div className="pt-2 border-t border-[#e8e4df] dark:border-[#2f2d31]">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#201528] via-[#2c1d38] to-[#1a1322] text-white border border-[#c98bb1]/30 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2c7de] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Instant Multi-Card Import</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                Want to evaluate the complete card portfolio immediately without entering custom Plaid credentials? Import 14 authentic cards across Amex, Chase, Capital One, Citi, Discover, and BofA in one click.
              </p>
              <button
                type="button"
                disabled={isInstantSyncing}
                onClick={handleInstantAllCards}
                className="w-full py-2 px-3 rounded-lg bg-[#c98bb1] hover:bg-[#b87ba0] text-[#1e1018] font-bold text-xs tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isInstantSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing Cards...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Sync All Major US Cards Portfolio (1-Click)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#e8e4df] dark:border-[#2f2d31] bg-[#fbf9f7] dark:bg-[#201f22] flex items-center justify-between text-[11px] text-[#737373] dark:text-[#9e9e9e]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>End-to-end 256-bit encryption</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#737373] hover:text-[#191919] dark:text-[#9e9e9e] dark:hover:text-white hover:bg-[#eae6e1] dark:hover:bg-[#2b292e] transition-colors cursor-pointer"
            >
              Close
            </button>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <span className="font-bold text-[#191919] dark:text-white">PLAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
