import React from 'react';
import { AlertCircle, HelpCircle, ArrowRight, Tag, Store, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { InvalidQueryDetails } from '../types';

interface InvalidQueryCardProps {
  data: InvalidQueryDetails;
  onSelectPrompt: (prompt: string) => void;
}

export const InvalidQueryCard: React.FC<InvalidQueryCardProps> = ({ data, onSelectPrompt }) => {
  return (
    <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-all text-left">
      {/* Alert Header Banner */}
      <div className="flex items-start gap-3.5 pb-4 border-b border-[#f0ebe6] dark:border-[#2a292d]">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              Non-Card Question Detected
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#191919] dark:text-white mt-1">
            Question needs a store, category, or dollar amount
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0] mt-1">
            We couldn't connect your phrase to a credit card purchase or financial decision.
          </p>
        </div>
      </div>

      {/* Flagged Query Callout */}
      <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#262428] border border-[#ebe5df] dark:border-[#333136]">
        <div className="text-[11px] font-medium text-[#8c8c8c] dark:text-[#999999] uppercase tracking-wider mb-1">
          Query Received
        </div>
        <div className="text-sm font-semibold text-[#191919] dark:text-white italic">
          "{data.prompt}"
        </div>
        <div className="text-xs text-[#737373] dark:text-[#a0a0a0] mt-1.5 leading-relaxed">
          Phrases like <em>"i have an exam today"</em> or <em>"what's the weather"</em> cannot be evaluated because they don't involve a purchase, merchant, or payment card.
        </div>
      </div>

      {/* The 3 Criteria Checklist */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
          <span>Every valid question must have at least one of these 3:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Criterion 1: Category */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              data.hasCategory
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#faf8f5] dark:bg-[#252427] border-[#ebe5df] dark:border-[#323035]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#191919] dark:text-white">
                <Tag className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
                1. Category
              </span>
              {data.hasCategory ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Found
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-[#8c8c8c] font-medium">
                  <XCircle className="w-3 h-3 text-amber-500" /> Missing
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] leading-snug">
              e.g. dining, shopping, groceries, donating to church, travel, bills
            </p>
          </div>

          {/* Criterion 2: Store / Merchant */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              data.hasMerchant
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#faf8f5] dark:bg-[#252427] border-[#ebe5df] dark:border-[#323035]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#191919] dark:text-white">
                <Store className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
                2. Store / Place
              </span>
              {data.hasMerchant ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Found
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-[#8c8c8c] font-medium">
                  <XCircle className="w-3 h-3 text-amber-500" /> Missing
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] leading-snug">
              e.g. Lowe's, Target, Shake Shack, Burger King, Sephora, Amazon
            </p>
          </div>

          {/* Criterion 3: Money Value or Intent */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              data.hasMoneyOrIntent
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#faf8f5] dark:bg-[#252427] border-[#ebe5df] dark:border-[#323035]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#191919] dark:text-white">
                <DollarSign className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
                3. Money / Spend
              </span>
              {data.hasMoneyOrIntent ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Found
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-[#8c8c8c] font-medium">
                  <XCircle className="w-3 h-3 text-amber-500" /> Missing
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] leading-snug">
              e.g. "$25", "can I buy", "can I afford", "spend $100", cost
            </p>
          </div>
        </div>
      </div>

      {/* Search Guidance */}
      <div className="pt-2">
        <div className="p-3.5 rounded-xl border border-[#e8e4df] dark:border-[#2f2d31] bg-[#faf8f5] dark:bg-[#252427] text-xs">
          <div className="font-semibold text-[#191919] dark:text-white mb-1">
            How to format your question:
          </div>
          <p className="text-[11.5px] text-[#737373] dark:text-[#a0a0a0] leading-relaxed">
            Enter the name of a store, merchant, category, or purchase amount in the search bar below (e.g. <em>"Which card for groceries?"</em>, <em>"Buying lunch at Chipotle"</em>, or <em>"Can I afford $80 shoes?"</em>).
          </p>
        </div>
      </div>
    </div>
  );
};
