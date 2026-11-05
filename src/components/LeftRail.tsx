import React from 'react';
import { MessageSquare, CreditCard, BarChart2, ShieldCheck, Zap, Sun, Moon, Sparkles, Terminal } from 'lucide-react';
import { TabType, AppMode } from '../types';

interface LeftRailProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenStressTest?: () => void;
  onOpenCardMatcher?: () => void;
  onOpenTddTests?: () => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  activeTab,
  onSelectTab,
  mode,
  onModeChange,
  isDark,
  onToggleTheme,
  onOpenStressTest,
  onOpenCardMatcher,
  onOpenTddTests,
}) => {
  return (
    <aside className="w-16 h-full flex flex-col items-center justify-between py-5 border-r border-[#e8e4df] dark:border-[#272629] bg-[#fbfaf8] dark:bg-[#1a191b] shrink-0">
      {/* Top Brand & Main Navigation */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand mark */}
        <div className="w-8 h-8 rounded-lg bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#181517] font-bold text-xs flex items-center justify-center shadow-xs">
          RR
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          <button
            type="button"
            onClick={() => onSelectTab('ask')}
            title="Ask (Optimizer Chat)"
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'ask'
                ? 'bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1]'
                : 'text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-medium">Ask</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('wallet')}
            title="Wallet"
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1]'
                : 'text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[9px] font-medium">Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('spending')}
            title="Spending"
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'spending'
                ? 'bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1]'
                : 'text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="text-[9px] font-medium">Spending</span>
          </button>

          {onOpenCardMatcher && (
            <button
              type="button"
              onClick={onOpenCardMatcher}
              title="Card Matcher (Based on Spending History)"
              className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[8px] font-semibold">Matcher</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Mode Switch & Theme Toggle */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Quick toggle mode */}
        <button
          type="button"
          onClick={() => onModeChange(mode === 'optimizer' ? 'first-timer' : 'optimizer')}
          title={mode === 'optimizer' ? 'Switch to First-timer mode' : 'Switch to Optimizer mode'}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] hover:text-[#191919] dark:hover:text-white transition-colors cursor-pointer"
        >
          {mode === 'optimizer' ? (
            <Zap className="w-4 h-4 text-[#74455d] dark:text-[#c98bb1]" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title="Toggle light / dark mode"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] hover:text-[#191919] dark:hover:text-white transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
