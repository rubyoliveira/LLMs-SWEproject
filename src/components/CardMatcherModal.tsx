import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  Zap,
  Sliders,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  MonthlySpendingProfile,
  CatalogCard,
  CardMatchResult,
  PRESET_SPENDING_PROFILES,
  USER_CURRENT_SPENDING_PROFILE,
  matchCardsForProfile,
  convertCatalogCardToCreditCard,
} from '../utils/cardMatcher';
import { CreditCard } from '../types';

interface CardMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCards: CreditCard[];
  onEnrollCard: (card: CatalogCard) => void;
  onAskCopilot: (prompt: string) => void;
}

export const CardMatcherModal: React.FC<CardMatcherModalProps> = ({
  isOpen,
  onClose,
  userCards,
  onEnrollCard,
  onAskCopilot,
}) => {
  // Always invoke hooks before any conditional returns
  const [selectedPresetName, setSelectedPresetName] = useState<string>(
    USER_CURRENT_SPENDING_PROFILE.name
  );

  const [spending, setSpending] = useState<MonthlySpendingProfile>({
    ...USER_CURRENT_SPENDING_PROFILE,
  });

  const [filterNoAnnualFee, setFilterNoAnnualFee] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'breakdown'>('matches');

  // Handle Preset Selection
  const handleSelectPreset = (profile: MonthlySpendingProfile) => {
    setSelectedPresetName(profile.name);
    setSpending({ ...profile });
  };

  // Handle slider/input change
  const handleCategoryChange = (key: keyof MonthlySpendingProfile, val: number) => {
    setSelectedPresetName('Custom Profile');
    setSpending((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  // Deterministically match cards against the current spending profile
  const matchResults: CardMatchResult[] = useMemo(() => {
    return matchCardsForProfile(spending, filterNoAnnualFee);
  }, [spending, filterNoAnnualFee]);

  const topMatch = matchResults[0];

  const totalMonthlySpend = useMemo(() => {
    return (
      spending.dining +
      spending.groceries +
      spending.travel +
      spending.streamingAndBills +
      spending.shoppingAndRetail +
      spending.gas +
      spending.rent
    );
  }, [spending]);

  const totalAnnualSpend = totalMonthlySpend * 12;

  // Check if a card is already enrolled in the user's wallet
  const isCardEnrolled = (cardName: string) => {
    const norm = cardName.toLowerCase();
    return userCards.some((c) => {
      const cNorm = c.name.toLowerCase();
      return (
        cNorm.includes(norm) ||
        norm.includes(cNorm) ||
        (norm.includes('gold') && cNorm.includes('gold')) ||
        (norm.includes('sapphire') && cNorm.includes('sapphire')) ||
        (norm.includes('savor') && cNorm.includes('savor')) ||
        (norm.includes('double') && cNorm.includes('double')) ||
        (norm.includes('venture') && cNorm.includes('venture')) ||
        (norm.includes('bilt') && cNorm.includes('bilt')) ||
        (norm.includes('blue cash') && cNorm.includes('blue cash'))
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-matcher-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#fcfbf9] dark:bg-[#1a191b] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eee9e2] dark:border-[#2a282c] flex items-center justify-between shrink-0 bg-white dark:bg-[#201f22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="card-matcher-title"
                  className="text-base sm:text-lg font-bold text-[#191919] dark:text-white tracking-tight"
                >
                  Card Matcher based on Spending History
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  New User Onboarding
                </span>
              </div>
              <p className="text-xs text-[#737373] dark:text-[#9e9e9e]">
                Analyzes your monthly spending categories to deterministically rank market-leading cards by net annual value.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] dark:text-[#9e9e9e] hover:bg-[#f0ece7] dark:hover:bg-[#28262a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Preset Profile Selector Tabs */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#525252] dark:text-[#b3b3b3] uppercase tracking-wider text-[11px] mb-2.5">
              <span>Select Spending History Preset</span>
              <span className="normal-case font-normal text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Or adjust sliders below
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(USER_CURRENT_SPENDING_PROFILE)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPresetName === USER_CURRENT_SPENDING_PROFILE.name
                    ? 'bg-[#74455d]/10 dark:bg-[#c98bb1]/20 border-[#74455d] dark:border-[#c98bb1] shadow-xs'
                    : 'bg-white dark:bg-[#222124] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#74455d] dark:text-[#c98bb1]">
                    <span>⭐</span>
                    <span className="truncate">Your October</span>
                  </div>
                  <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                    $1,450.40/mo
                  </div>
                </div>
                <div className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  Active Data
                </div>
              </button>

              {PRESET_SPENDING_PROFILES.map((preset) => {
                const isSelected = selectedPresetName === preset.name;
                const monthlyTotal =
                  preset.dining +
                  preset.groceries +
                  preset.travel +
                  preset.streamingAndBills +
                  preset.shoppingAndRetail +
                  preset.gas +
                  preset.rent;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#74455d]/10 dark:bg-[#c98bb1]/20 border-[#74455d] dark:border-[#c98bb1] shadow-xs'
                        : 'bg-white dark:bg-[#222124] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-[#191919] dark:text-white truncate">
                        {preset.name.split('&')[0]}
                      </div>
                      <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                        ${monthlyTotal.toLocaleString()}/mo
                      </div>
                    </div>
                    <div className="text-[9px] text-[#8c8c8c] truncate mt-1">
                      {preset.description.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Spending Breakdown Sliders & Live Total Bar */}
          <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0ece7] dark:border-[#2b292d]">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#74455d] dark:text-[#c98bb1]" />
                  <h3 className="text-sm font-bold text-[#191919] dark:text-white">
                    Monthly Spending Distribution
                  </h3>
                </div>
                <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                  Drag the sliders to reflect your actual spending across core reward categories.
                </p>
              </div>

              {/* Total Summary */}
              <div className="flex items-center gap-4 bg-[#faf8f5] dark:bg-[#28262a] px-3.5 py-2 rounded-xl border border-[#ece6de] dark:border-[#353238] shrink-0">
                <div>
                  <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase tracking-wider font-semibold">
                    Total Monthly
                  </div>
                  <div className="text-base font-bold text-[#191919] dark:text-white">
                    ${totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="h-6 w-px bg-[#e0dad2] dark:bg-[#3d3a40]" />
                <div>
                  <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase tracking-wider font-semibold">
                    Total Annual
                  </div>
                  <div className="text-base font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${totalAnnualSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* Dining */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>🍔</span>
                    <span>Dining & Takeout</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.dining}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="10"
                  value={spending.dining}
                  onChange={(e) => handleCategoryChange('dining', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Groceries */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>🛒</span>
                    <span>Groceries</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.groceries}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="10"
                  value={spending.groceries}
                  onChange={(e) => handleCategoryChange('groceries', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Travel */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>✈️</span>
                    <span>Travel & Transit</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.travel}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="25"
                  value={spending.travel}
                  onChange={(e) => handleCategoryChange('travel', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Streaming & Bills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>📺</span>
                    <span>Streaming & Bills</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.streamingAndBills}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={spending.streamingAndBills}
                  onChange={(e) => handleCategoryChange('streamingAndBills', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Shopping & Retail */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>🛍️</span>
                    <span>Shopping & Retail</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.shoppingAndRetail}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="20"
                  value={spending.shoppingAndRetail}
                  onChange={(e) => handleCategoryChange('shoppingAndRetail', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Gas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>⛽</span>
                    <span>Gas Stations</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.gas}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="10"
                  value={spending.gas}
                  onChange={(e) => handleCategoryChange('gas', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Rent */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    <span>🏠</span>
                    <span>Monthly Rent</span>
                  </span>
                  <span className="font-bold text-[#74455d] dark:text-[#c98bb1]">
                    ${spending.rent}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3500"
                  step="50"
                  value={spending.rent}
                  onChange={(e) => handleCategoryChange('rent', Number(e.target.value))}
                  className="w-full accent-[#74455d] dark:accent-[#c98bb1] cursor-pointer"
                />
              </div>

              {/* Reset to October actual */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(USER_CURRENT_SPENDING_PROFILE)}
                  className="w-full py-2 px-3 rounded-lg border border-[#e2dcd4] dark:border-[#353338] text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white hover:bg-[#f5f1eb] dark:hover:bg-[#28262a] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Actual</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter & Results Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#191919] dark:text-white uppercase tracking-wider text-[11px]">
                Ranked Card Matches ({matchResults.length})
              </span>
              <span className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Sorted by Net Annual Value (Rewards + Credits - Annual Fee)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-[#404040] dark:text-[#d1d5db] cursor-pointer select-none bg-white dark:bg-[#201f22] px-3 py-1.5 rounded-lg border border-[#e8e4df] dark:border-[#2f2d31]">
                <input
                  type="checkbox"
                  checked={filterNoAnnualFee}
                  onChange={(e) => setFilterNoAnnualFee(e.target.checked)}
                  className="rounded-xs accent-[#74455d] dark:accent-[#c98bb1]"
                />
                <span>$0 Annual Fee Only</span>
              </label>
            </div>
          </div>

          {/* Cards Ranking Grid */}
          <div className="space-y-4">
            {matchResults.map((result, idx) => {
              const { card, matchScore, netAnnualValueDollars, annualGrossRewardsDollars, annualCreditsApplied, annualFee, topEarningCategory, recommendationReason, gainVersusDebit, gainVersusFlatRate } = result;
              const isWinner = idx === 0;
              const alreadyEnrolled = isCardEnrolled(card.name);

              return (
                <div
                  key={card.id}
                  className={`rounded-2xl border transition-all p-5 ${
                    isWinner
                      ? 'bg-[#faf8f6] dark:bg-[#221f24] border-[#74455d] dark:border-[#c98bb1] shadow-md ring-1 ring-[#74455d]/20 dark:ring-[#c98bb1]/20'
                      : 'bg-white dark:bg-[#201f22] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be] shadow-xs'
                  }`}
                >
                  {/* Top row: Rank badge + Card Title + Match Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2e]">
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isWinner
                            ? 'bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#181517]'
                            : 'bg-[#f0ebe6] dark:bg-[#2c2a2e] text-[#525252] dark:text-[#a3a3a3]'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-[#191919] dark:text-white tracking-tight">
                            {card.name}
                          </h4>
                          {isWinner && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#191919] flex items-center gap-1">
                              <Award className="w-3 h-3" /> #1 Match
                            </span>
                          )}
                          {card.annualFee === 0 ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              $0 Annual Fee
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                              ${card.annualFee}/yr Fee
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                          {card.issuer} · {card.network.toUpperCase()} · Best for {card.bestFor}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c]">
                          Match Score
                        </div>
                        <div className="text-lg font-black text-[#74455d] dark:text-[#c98bb1]">
                          {matchScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                    <div className="p-3 rounded-xl bg-[#f7f5f2] dark:bg-[#272529] border border-[#eee8e1] dark:border-[#323035]">
                      <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase font-semibold">
                        Net Annual Value
                      </div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${netAnnualValueDollars.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#8c8c8c] mt-0.5">
                        +${(netAnnualValueDollars / 12).toFixed(0)}/mo profit
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f2] dark:bg-[#272529] border border-[#eee8e1] dark:border-[#323035]">
                      <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase font-semibold">
                        Gross Rewards
                      </div>
                      <div className="text-base font-bold text-[#191919] dark:text-white mt-0.5">
                        ${annualGrossRewardsDollars.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#8c8c8c] mt-0.5">
                        {result.pointsEarnedAnnual.toLocaleString()} pts/yr
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f2] dark:bg-[#272529] border border-[#eee8e1] dark:border-[#323035]">
                      <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase font-semibold">
                        Fee & Credits
                      </div>
                      <div className="text-base font-bold text-[#191919] dark:text-white mt-0.5">
                        {card.annualFee > 0 ? `-$${card.annualFee}` : '$0 Fee'}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {card.annualCredits > 0 ? `+$${annualCreditsApplied} credits` : 'No annual fee'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f2] dark:bg-[#272529] border border-[#eee8e1] dark:border-[#323035]">
                      <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] uppercase font-semibold">
                        Gain vs Debit
                      </div>
                      <div className="text-base font-bold text-[#74455d] dark:text-[#c98bb1] mt-0.5">
                        +${gainVersusDebit.toFixed(0)}/yr
                      </div>
                      <div className="text-[10px] text-[#8c8c8c] mt-0.5">
                        vs leaving at 0%
                      </div>
                    </div>
                  </div>

                  {/* Algorithmic Recommendation Reason */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#252427] border border-[#eee9e2] dark:border-[#323036] text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[#191919] dark:text-white text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
                      <span>Why this card matches your spending:</span>
                    </div>
                    <p className="text-[11.5px] text-[#555555] dark:text-[#c5c5c5] leading-relaxed">
                      {recommendationReason}
                    </p>
                  </div>

                  {/* Key Perks & Multipliers */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#525252] dark:text-[#a3a3a3]">
                    {card.keyPerks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons: Enroll & Add to Wallet / Ask Copilot */}
                  <div className="mt-4 pt-3.5 border-t border-[#f0ece7] dark:border-[#2c2a2e] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                      Top category: <span className="font-semibold text-[#191919] dark:text-white">{topEarningCategory}</span> (${result.categoryBreakdownAnnual[topEarningCategory.toLowerCase().includes('dining') ? 'dining' : topEarningCategory.toLowerCase().includes('grocer') ? 'groceries' : topEarningCategory.toLowerCase().includes('travel') ? 'travel' : topEarningCategory.toLowerCase().includes('rent') ? 'rent' : 'shoppingAndRetail']?.toFixed(0)}/yr)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAskCopilot(`Should I apply for ${card.name} based on my spending?`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#e2ddd6] dark:border-[#353338] text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#191919] dark:hover:text-white hover:bg-[#f5f1eb] dark:hover:bg-[#28262a] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Ask Copilot</span>
                      </button>

                      {alreadyEnrolled ? (
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Enrolled in Wallet</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEnrollCard(card)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#74455d] hover:bg-[#60354a] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#191919] transition-all cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enroll & Add to Wallet</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Education & Credit Health Callout */}
          <div className="p-4 rounded-xl bg-[#faf6f2] dark:bg-[#242126] border border-[#ece3d8] dark:border-[#37333a] flex items-start gap-3 text-xs">
            <Info className="w-5 h-5 text-[#74455d] dark:text-[#c98bb1] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-[#191919] dark:text-white">
                How RocketRewards Matches Cards Deterministically
              </h5>
              <p className="text-[11.5px] text-[#666666] dark:text-[#b8b8b8] leading-relaxed">
                Rather than relying on generic affiliate rankings, our engine calculates category-by-category multiplier yield on your actual annual dollar volume, deducts the annual fee, accounts for statement credits up to fee parity, and valuations point currencies (e.g. 1.25¢ for Chase Ultimate Rewards). Adding a card immediately activates it in your Copilot swipe recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#eee9e2] dark:border-[#2a282c] flex items-center justify-between shrink-0 bg-white dark:bg-[#201f22]">
          <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
            {topMatch ? `Top Recommendation: ${topMatch.card.name} (+${topMatch.netAnnualValueDollars.toFixed(0)}/yr net value)` : ''}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#f0ebe6] hover:bg-[#e6e0d9] dark:bg-[#28262a] dark:hover:bg-[#343136] text-[#191919] dark:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
