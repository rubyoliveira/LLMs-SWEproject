import React from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  Monitor,
  ShieldCheck,
  Zap,
  GitBranch,
  Upload,
  BookOpen,
  Laptop,
  Share2,
} from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  viewMode: 'desktop' | 'phone';
  onToggleViewMode: () => void;
  onOpenUploadCards: () => void;
  onOpenGeminiStatus: () => void;
  onOpenGitHub: () => void;
  onOpenDesktopInstall: () => void;
  onOpenResearchPaper: () => void;
  onOpenShare: () => void;
  onOpenStressTest: () => void;
  activeCardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  isDark,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  onOpenUploadCards,
  onOpenGeminiStatus,
  onOpenGitHub,
  onOpenDesktopInstall,
  onOpenResearchPaper,
  onOpenShare,
  onOpenStressTest,
  activeCardsCount,
}) => {
  return (
    <header className="w-full bg-[#f7f6f4] dark:bg-[#171718] border-b border-[#e9e6e2] dark:border-[#272629] sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#74455d] dark:bg-[#c98bb1] flex items-center justify-center text-white dark:text-[#191919] font-bold text-xs shadow-xs">
            RR
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-tight text-[#191919] dark:text-[#ffffff] whitespace-nowrap">
            RocketRewards
          </span>
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#74455d]/10 dark:bg-[#c98bb1]/15 text-[#74455d] dark:text-[#d79fc0]">
            <Sparkles className="w-3 h-3" /> Version C · Notion Sans
          </span>
        </div>

        {/* Center: Mode Switcher (Optimizer / First-timer) */}
        <div className="flex items-center bg-[#eae6e1] dark:bg-[#252427] p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onModeChange('optimizer')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all ${
              mode === 'optimizer'
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
            <span className="hidden sm:inline">Optimizer</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('first-timer')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all ${
              mode === 'first-timer'
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">First-timer</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1,000 Scenarios Stress Test */}
          <button
            type="button"
            onClick={onOpenStressTest}
            title="Run 1,000 Scenarios Stress Test Benchmark (Startup #5)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#74455d] hover:bg-[#60354a] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#191919] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>1,000 Stress Test</span>
          </button>

          {/* Upload Cards Button (Enforces user's own cards) */}
          <button
            type="button"
            onClick={onOpenUploadCards}
            title="Upload and filter your active credit cards"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#f0ebe6] hover:bg-[#e6e0d9] dark:bg-[#252427] dark:hover:bg-[#302e33] text-[#191919] dark:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
            <span className="hidden md:inline">My Cards</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#181517] font-bold">
              {activeCardsCount}
            </span>
          </button>

          {/* Research Paper & Slide Deck */}
          <button
            type="button"
            onClick={onOpenResearchPaper}
            title="View Research Paper, Architecture & Quantitative Gates"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white bg-[#eae6e1]/70 dark:bg-[#252427] rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Paper</span>
          </button>

          {/* Gemini AI Status */}
          <button
            type="button"
            onClick={onOpenGeminiStatus}
            title="Gemini API Key & Status"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white bg-[#eae6e1]/70 dark:bg-[#252427] rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
            <span>Gemini AI</span>
          </button>

          {/* GitHub & ZIP Export */}
          <button
            type="button"
            onClick={onOpenGitHub}
            title="GitHub push guide and safe secrets"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white bg-[#eae6e1]/70 dark:bg-[#252427] rounded-lg transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">GitHub / ZIP</span>
          </button>

          {/* Share App Button */}
          <button
            type="button"
            onClick={onOpenShare}
            title="Share App link or QR code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#74455d] dark:text-[#c98bb1] hover:bg-[#eae6e1] dark:hover:bg-[#252427] bg-[#f0ebe6]/70 dark:bg-[#201e22] border border-[#e2ddd6] dark:border-[#2f2d31] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Desktop Install */}
          <button
            type="button"
            onClick={onOpenDesktopInstall}
            title="Download / Install Desktop App"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white bg-[#eae6e1]/70 dark:bg-[#252427] rounded-lg transition-colors cursor-pointer"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">App</span>
          </button>

          {/* Phone Mockup Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'desktop' ? 'Switch to Phone mockup view' : 'Switch to Desktop layout'}
            className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white bg-[#eae6e1]/70 dark:bg-[#252427] rounded-lg transition-colors"
          >
            {viewMode === 'desktop' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white hover:bg-[#eae6e1] dark:hover:bg-[#252427] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
