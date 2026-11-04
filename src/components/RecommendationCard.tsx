import React, { useState } from 'react';
import { Calculator, Check, ArrowRight, Edit3, CreditCard, Info } from 'lucide-react';
import { RecommendationDetails } from '../types';

interface RecommendationCardProps {
  data: RecommendationDetails;
  isDark: boolean;
  onUseCard: () => void;
  onDifferentCard: () => void;
  used: boolean;
  onUpdateAmount?: (newAmount: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  data,
  isDark,
  onUseCard,
  onDifferentCard,
  used,
  onUpdateAmount,
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState(data.originalAmount.toString());

  const handleSaveAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmountInput);
    if (parsed > 0 && onUpdateAmount) {
      onUpdateAmount(parsed);
    }
    setIsEditingAmount(false);
  };

  const isUseAny = !!data.isUseAnyCard;
  const cardTitle = isUseAny ? 'Use Any Card' : (data.recommendedCardName || 'American Express Gold');
  const cardLast4 = isUseAny ? 'Any' : (data.recommendedCardLast4 || '4011');
  const mccCode = data.mccCode || (isUseAny ? '8661' : '5814');

  return (
    <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-5 shadow-xs transition-colors">
      {/* Top Tag Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-semibold px-2.5 py-1 rounded-md ${
              isUseAny
                ? 'bg-[#f4ecf1] dark:bg-[#362432] text-[#74455d] dark:text-[#dca8c7]'
                : 'bg-[#f4ecf1] dark:bg-[#362432] text-[#74455d] dark:text-[#dca8c7]'
            }`}
          >
            {isUseAny ? 'Use Any Card' : 'Recommended'}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            MCC {mccCode} · {data.categoryName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#737373] dark:text-[#9e9e9e]">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">1.2s · Zero Hallucination</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>
      </div>

      {/* Prominent "Use Any Card" blurb for Non-Category Purchases (e.g. church donation) */}
      {isUseAny && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#faf5f8] dark:bg-[#282126] border border-[#ecd9e5] dark:border-[#3e2c38] text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#191919] dark:text-white">
                  Non-Bonus Category · Use Any Card
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#dca8c7]">
                  Base 1x – 2%
                </span>
              </div>
              <p className="text-[11.5px] text-[#555555] dark:text-[#b8b8b8] leading-relaxed">
                {data.nonCategoryBlurb || (
                  <>
                    This purchase falls outside our 5 bonus categories (<strong>Dining</strong>, <strong>Groceries</strong>, <strong>Shopping</strong>, <strong>Travel &amp; Rides</strong>, <strong>Bills &amp; Utilities</strong>). Because merchants like churches, charities, or civic services do not qualify for reward multipliers, <strong>any card in your wallet will earn standard baseline rewards</strong> (or swipe your highest flat-rate card like Citi Double Cash for 2% back).
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title & Subtitle in Notion Sans */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#191919] dark:text-[#f8f8f8]">
          {cardTitle}
        </h2>
        <div className="flex items-center gap-2 mt-1 text-xs text-[#737373] dark:text-[#9e9e9e]">
          <span className="inline-block tracking-widest font-mono">
            {isUseAny ? '•• Any card' : `•• ${cardLast4}`}
          </span>
          <span>·</span>
          <span className="font-medium text-[#191919] dark:text-white">{data.merchantName}</span>
          <span>·</span>
          <span>{data.categoryName}</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-[#fbfaf8] dark:bg-[#272529] border border-[#eeeae5] dark:border-[#323035] rounded-lg p-2.5 text-left relative group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#737373] dark:text-[#a0a0a0]">Net charge</span>
            <button
              type="button"
              onClick={() => setIsEditingAmount(!isEditingAmount)}
              className="text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white p-0.5 transition-colors cursor-pointer"
              title="Edit purchase amount"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>

          {isEditingAmount ? (
            <form onSubmit={handleSaveAmount} className="mt-1 flex items-center gap-1">
              <span className="text-xs text-[#737373]">$</span>
              <input
                type="number"
                step="0.5"
                value={customAmountInput}
                onChange={(e) => setCustomAmountInput(e.target.value)}
                autoFocus
                className="w-16 px-1.5 py-0.5 text-xs bg-white dark:bg-[#1a191b] border border-[#74455d] rounded"
              />
              <button
                type="submit"
                className="px-1.5 py-0.5 text-[10px] bg-[#74455d] text-white rounded cursor-pointer"
              >
                OK
              </button>
            </form>
          ) : (
            <div className="text-xl font-bold text-[#191919] dark:text-white mt-0.5 tracking-tight">
              ${data.netCharge.toFixed(2)}
            </div>
          )}

          <div className="text-[10px] text-[#8c8c8c] dark:text-[#888888] mt-0.5 truncate">
            {data.isEstimatedAmount ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Estimated average</span>
            ) : data.creditApplied > 0 ? (
              `$${data.originalAmount.toFixed(2)} minus $${data.creditApplied.toFixed(2)} credit`
            ) : (
              `Full charge: $${data.originalAmount.toFixed(2)}`
            )}
          </div>
        </div>

        <div className="bg-[#fbfaf8] dark:bg-[#272529] border border-[#eeeae5] dark:border-[#323035] rounded-lg p-2.5 text-left">
          <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0]">Points</div>
          <div className="text-xl font-bold text-[#191919] dark:text-white mt-0.5 tracking-tight">
            {data.pointsEarned}
          </div>
          <div className="text-[10px] text-[#8c8c8c] dark:text-[#888888] mt-0.5 truncate">
            {data.categoryMultiplier.split('·')[1]?.trim() || '4x on dining'}
          </div>
        </div>

        <div className="bg-[#fbfaf8] dark:bg-[#272529] border border-[#eeeae5] dark:border-[#323035] rounded-lg p-2.5 text-left">
          <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0]">Credit</div>
          <div className="text-xl font-bold text-[#191919] dark:text-white mt-0.5 tracking-tight">
            ${data.creditApplied}
          </div>
          <div className="text-[10px] text-[#8c8c8c] dark:text-[#888888] mt-0.5 truncate">
            {data.creditApplied > 0 ? 'Ends in 3 days' : 'None applicable'}
          </div>
        </div>
      </div>

      {/* HOW THE CARDS COMPARE */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-2 uppercase">
          <span>How your enrolled cards compare</span>
          <span className="normal-case font-normal text-[11px] text-[#8c8c8c] dark:text-[#888888]">
            value at 1¢ a point
          </span>
        </div>

        <div className="space-y-2">
          {data.cardsComparison.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span className="w-28 text-[#333333] dark:text-[#d6d6d6] font-medium truncate">
                {item.cardName}
              </span>
              <div className="flex-1 h-2.5 bg-[#eae5df] dark:bg-[#2e2c30] rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.isRecommended
                      ? 'bg-[#74455d] dark:bg-[#c98bb1]'
                      : 'bg-[#b8b1a9] dark:bg-[#48444a]'
                  }`}
                  style={{ width: `${item.barPercent}%` }}
                />
              </div>
              <span className="w-12 text-right font-medium text-[#191919] dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DINING BY WEEK */}
      <div className="mb-5 pt-3 border-t border-[#f0ece7] dark:border-[#2b292c]">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-3 uppercase">
          <span>{data.categoryName} by week · $412.60</span>
        </div>

        <div className="grid grid-cols-5 gap-2 items-end h-24 pt-2 pb-1">
          {data.weeklyBars.map((bar, idx) => {
            const heightPercent = Math.max(20, Math.round((bar.amount / 110) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-medium text-[#737373] dark:text-[#9e9e9e]">
                  {bar.label}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    bar.isHighlighted
                      ? 'bg-[#74455d] dark:bg-[#c98bb1]'
                      : 'bg-[#e4ded8] dark:bg-[#2c2a2d]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Status pills list */}
      <div className="space-y-2 mb-5 pt-2 border-t border-[#f0ece7] dark:border-[#2b292c] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Category</span>
          <span className="bg-[#fef3c7] dark:bg-[#3a2c16] text-[#92400e] dark:text-[#fbbf24] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.categoryMultiplier}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Expiring credit</span>
          <span className="bg-[#fef3c7] dark:bg-[#3a2c16] text-[#92400e] dark:text-[#fbbf24] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.expiringCreditText || (data.creditApplied > 0 ? `$${data.creditApplied} · 3 days left` : 'No credit applies')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Utilization</span>
          <span className="bg-[#dcfce7] dark:bg-[#153421] text-[#166534] dark:text-[#4ade80] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.utilizationText}
          </span>
        </div>
      </div>

      {/* Timeline with dots */}
      <div className="space-y-2 mb-6 pt-2 border-t border-[#f0ece7] dark:border-[#2b292c] text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#333333] dark:text-[#dddddd] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#74455d] dark:bg-[#c98bb1]" />
            <span>Today</span>
          </div>
          <span className="text-[#666666] dark:text-[#999999]">{data.todayDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#666666] dark:text-[#999999]">
            <span className="w-2 h-2 rounded-full border border-[#8c8c8c] dark:border-[#737373]" />
            <span>Statement closes</span>
          </div>
          <span className="text-[#666666] dark:text-[#999999]">{data.statementCloseText}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#666666] dark:text-[#999999]">
            <span className="w-2 h-2 rounded-full border border-[#8c8c8c] dark:border-[#737373]" />
            <span>Payment due</span>
          </div>
          <span className="text-[#666666] dark:text-[#999999]">{data.paymentDueText}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onUseCard}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
            used
              ? 'bg-emerald-600 text-white dark:bg-emerald-500'
              : 'bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517]'
          }`}
        >
          {used ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Card Recorded</span>
            </>
          ) : (
            <span>Used this card</span>
          )}
        </button>

        <button
          type="button"
          onClick={onDifferentCard}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg font-medium text-xs bg-[#f0ebe6] hover:bg-[#e7e1db] text-[#333333] dark:bg-[#2b292c] dark:hover:bg-[#343236] dark:text-[#e0e0e0] transition-colors cursor-pointer"
        >
          <span>Different card</span>
          <ArrowRight className="w-3 h-3 text-[#737373]" />
        </button>
      </div>
    </div>
  );
};
