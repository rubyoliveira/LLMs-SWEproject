import React from 'react';
import {
  Sparkles,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Compass,
} from 'lucide-react';
import { CreditCard as CreditCardType, AppMode } from '../types';

interface WelcomeCardProps {
  mode: AppMode;
  onSelectPrompt: (prompt: string) => void;
  activeCards: CreditCardType[];
  onOpenUploadCards: () => void;
  onSelectScenario: (scenario: any) => void;
  onOpenCardMatcher?: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  mode,
  onSelectPrompt,
  activeCards,
  onOpenUploadCards,
  onSelectScenario,
  onOpenCardMatcher,
}) => {
  // Check for any active credits
  const cardsWithCredits = activeCards.filter(
    (c) => c.activeCredits && c.activeCredits.length > 0
  );
  const firstCredit = cardsWithCredits[0]?.activeCredits?.[0];

  return (
    <div className="bg-white dark:bg-[#1f1e21] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ece7] dark:border-[#2b292d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#191919] dark:text-white tracking-tight">
                Welcome to RocketRewards
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#74455d]/10 dark:bg-[#c98bb1]/15 text-[#74455d] dark:text-[#d79fc0]">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-[#737373] dark:text-[#a0a0a0] mt-0.5">
              Your AI Financial & Card Copilot. Ask which card to swipe before paying to maximize points, use expiring credits, and protect your credit score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCardMatcher && (
            <button
              type="button"
              onClick={onOpenCardMatcher}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#74455d] hover:bg-[#60354a] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] text-white dark:text-[#181517] transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Card Matcher</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenUploadCards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f1ec] dark:bg-[#28262a] hover:bg-[#ede7e0] dark:hover:bg-[#343136] text-[#191919] dark:text-white transition-colors cursor-pointer shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
            <span>My Cards ({activeCards.length})</span>
          </button>
        </div>
      </div>

      {/* New User Card Matching Spotlight Banner */}
      {onOpenCardMatcher && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#faf6f3] via-[#f7f2ed] to-[#f4eeec] dark:from-[#242125] dark:via-[#28242a] dark:to-[#2b262d] border border-[#e8ded5] dark:border-[#38333b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#191919] dark:text-white">
                  New to RocketRewards? Match Cards to Your Spending History
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#191919]">
                  NEW
                </span>
              </div>
              <p className="text-[11.5px] text-[#666666] dark:text-[#b8b8b8] mt-0.5 leading-relaxed">
                Analyze your actual $1,450.40/mo spending history or archetype presets (Dining, Travel, Groceries, Rent) to find the highest net-value card and stop leaving rewards on the table.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCardMatcher}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#74455d] hover:bg-[#60354a] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] text-white dark:text-[#181517] transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <span>Match My Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expiring Credit Alert if present */}
      {firstCredit && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf5f0] dark:bg-[#252024] border border-[#eedfd0] dark:border-[#3d2f38] text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
            <div>
              <span className="font-semibold text-[#8f4f1f] dark:text-[#e09867]">
                Expiring Credit Alert:
              </span>{' '}
              <span className="text-[#6c4021] dark:text-[#d1b399]">
                ${firstCredit.remaining} dining credit ends in {firstCredit.daysLeft} days.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectPrompt('Ordering lunch at Shake Shack for $24. Which card should I swipe?')}
            className="text-[11px] font-semibold text-[#74455d] dark:text-[#c98bb1] hover:underline shrink-0 ml-2 cursor-pointer flex items-center gap-1"
          >
            <span>Use it now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Your Active Enrolled Cards Pill Summary */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-[#525252] dark:text-[#b3b3b3] uppercase tracking-wider text-[11px]">
            Your Enrolled Cards (Searched in Real-Time)
          </span>
          <button
            type="button"
            onClick={onOpenUploadCards}
            className="text-[11px] text-[#74455d] dark:text-[#c98bb1] hover:underline font-medium cursor-pointer"
          >
            + Add or filter cards
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {activeCards.slice(0, 3).map((card) => {
            const topMultiplier = card.multiplierCategories[0];
            return (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#191919] dark:text-white truncate">
                      {card.name}
                    </span>
                    <span className="text-[10px] text-[#8c8c8c]">•• {card.last4}</span>
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                    {topMultiplier ? `${topMultiplier.category} · ${topMultiplier.multiplier}x` : 'All Purchases'}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-[#f0ece7] dark:border-[#323035] flex items-center justify-between text-[10px] text-[#8c8c8c]">
                  <span>Limit ${card.creditLimit.toLocaleString()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Prompts to Try */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#525252] dark:text-[#b3b3b3] uppercase tracking-wider text-[11px] mb-2.5">
          <Compass className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
          <span>Ask RocketRewards Anything</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectPrompt('Lunch at Burger King for $14')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] hover:border-[#74455d] dark:hover:border-[#c98bb1] text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] flex items-center gap-1.5">
                <span>🍔 Lunch at Burger King for $14</span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Identifies 4x dining multiplier on Amex Gold
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('shake-shack')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] hover:border-[#74455d] dark:hover:border-[#c98bb1] text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] flex items-center gap-1.5">
                <span>🥤 Shake Shack for $24</span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Applies $10 expiring credit → $14 net charge
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('headphones-starter')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] hover:border-[#74455d] dark:hover:border-[#c98bb1] text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] flex items-center gap-1.5">
                <span>🎧 Can I buy $180 headphones?</span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Safe-spend guardrail with scheduled payment
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectPrompt('Groceries at Whole Foods for $85')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] hover:border-[#74455d] dark:hover:border-[#c98bb1] text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] flex items-center gap-1.5">
                <span>🛒 Whole Foods Groceries for $85</span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Supermarket MCC 5411 evaluation
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectPrompt('Donating $50 to church')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] dark:bg-[#252427] border border-[#ece7e1] dark:border-[#2f2e32] hover:border-[#74455d] dark:hover:border-[#c98bb1] text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] flex items-center gap-1.5">
                <span>⛪ Donating $50 to church</span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Non-category purchase → "Use any card"
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* 5 Categories & Non-Category Blurb Info Callout */}
      <div className="p-3 rounded-xl bg-[#faf7f5] dark:bg-[#262327] border border-[#eee5dd] dark:border-[#38333a] text-xs">
        <div className="flex items-start gap-2">
          <span className="text-[#74455d] dark:text-[#c98bb1] text-sm shrink-0">💡</span>
          <div className="text-[11.5px] text-[#555555] dark:text-[#b5b5b5] leading-relaxed">
            <span className="font-semibold text-[#191919] dark:text-white">The 5 Core Bonus Categories: </span>
            Dining, Groceries, Shopping, Travel &amp; Rides, and Bills &amp; Utilities. Any purchase outside these 5 (e.g. <em>donating to church</em>, tuition, or government fees) does not have bonus multipliers, triggering a <strong>"Use any card"</strong> recommendation.
          </div>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="pt-1 text-center">
        <p className="text-[11px] text-[#8c8c8c]">
          Type any merchant or amount in the search bar below, or ask questions like <span className="italic">"Can I afford dinner tonight?"</span>
        </p>
      </div>
    </div>
  );
};
