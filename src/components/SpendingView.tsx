import React, { useState } from 'react';
import { ArrowUp, Sparkles, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { SpendingCategory, WeeklySpending, Transaction } from '../types';

interface SpendingViewProps {
  categories: SpendingCategory[];
  weeklySpending: WeeklySpending[];
  transactions: Transaction[];
  totalSpent: number;
  compact?: boolean;
}

export const SpendingView: React.FC<SpendingViewProps> = ({
  categories,
  weeklySpending,
  transactions,
  totalSpent,
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [insight, setInsight] = useState<string | null>(
    'You spent $389.20 on dining in September. 14 charges, $27.80 on average. October is at $412.60 so far, $23.40 more.'
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const lower = query.toLowerCase();
    if (lower.includes('dining') || lower.includes('food') || lower.includes('restaurant')) {
      setInsight('You spent $412.60 on Dining across 14 transactions this month (36% of total). Amex Gold captured 96% of these for 4x rewards.');
    } else if (lower.includes('grocery') || lower.includes('groceries')) {
      setInsight('Groceries total $284.10 in October. You earned 1,136 Amex points at Whole Foods and Trader Joe’s.');
    } else if (lower.includes('biggest') || lower.includes('highest')) {
      setInsight('Your highest single transaction this month was $112.50 for Delta Air Lines on Oct 25, followed by $84.15 at Whole Foods.');
    } else {
      setInsight(`Analyzing "${query}": Total October spending is currently $${totalSpent.toFixed(2)}, pacing 8% under your September average.`);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? 'p-1' : 'p-4 max-w-xl mx-auto'}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#191919] dark:text-white">
          Spending
        </h2>
        <p className="text-xs text-[#737373] dark:text-[#9e9e9e] mt-0.5">
          October · all accounts
        </p>
      </div>

      {/* Hero Stat */}
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-4 shadow-xs">
        <div className="text-xs text-[#737373] dark:text-[#9e9e9e]">Spent this month</div>
        <div className="text-3xl font-bold tracking-tight text-[#191919] dark:text-white mt-1">
          ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about your spending"
          className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 w-7 h-7 rounded-lg bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#181517] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick spending prompt chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <button
          type="button"
          onClick={() => {
            setQuery('How much did I spend on dining last month?');
            setInsight('You spent $389.20 on dining in September. 14 charges, $27.80 on average. October is at $412.60 so far, $23.40 more.');
          }}
          className="px-2.5 py-1 rounded-md bg-[#f0ebe6] hover:bg-[#e7e1db] dark:bg-[#272529] dark:hover:bg-[#323035] text-[#525252] dark:text-[#a3a3a3] whitespace-nowrap cursor-pointer transition-colors"
        >
          Dining last month?
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery('What is my biggest expense?');
            setInsight('Your highest single transaction this month was $112.50 for Delta Air Lines on Oct 25, followed by $84.15 at Whole Foods.');
          }}
          className="px-2.5 py-1 rounded-md bg-[#f0ebe6] hover:bg-[#e7e1db] dark:bg-[#272529] dark:hover:bg-[#323035] text-[#525252] dark:text-[#a3a3a3] whitespace-nowrap cursor-pointer transition-colors"
        >
          Biggest expense?
        </button>
      </div>

      {/* AI Insight Card */}
      {insight && (
        <div className="bg-[#fbfaf8] dark:bg-[#242226] border border-[#eee9e3] dark:border-[#2f2c31] rounded-xl p-3.5 text-xs text-[#333333] dark:text-[#dddddd] shadow-xs">
          <div className="leading-relaxed">{insight}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#8c8c8c] dark:text-[#7d7d7d] mt-2.5 pt-2 border-t border-[#f0ece7] dark:border-[#2f2c31]">
            <Calculator className="w-3 h-3" />
            <span>Calculated from your data</span>
          </div>
        </div>
      )}

      {/* BY WEEK Chart */}
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-3">
          <span>By Week</span>
          <span className="normal-case font-normal text-[10px] text-[#8c8c8c]">Latest week is partial</span>
        </div>

        <div className="grid grid-cols-5 gap-2 items-end h-28 pt-2 pb-1">
          {weeklySpending.map((w, idx) => {
            const heightPercent = Math.max(18, Math.round((w.amount / 360) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-semibold text-[#191919] dark:text-white">
                  ${w.amount}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    w.isCurrentWeek
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

      {/* BY CATEGORY Breakdown */}
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-4 shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-3">
          By Category
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#191919] dark:text-white">{cat.name}</span>
                <span className="font-semibold text-[#191919] dark:text-white">
                  ${cat.amount.toFixed(2)}{' '}
                  <span className="text-[10px] text-[#8c8c8c] font-normal">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-[#eae5df] dark:bg-[#2e2c30] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cat.id === 'cat-dining' ? 'bg-[#74455d] dark:bg-[#c98bb1]' : 'bg-[#9e9994] dark:bg-[#524e55]'
                  }`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Blurb explaining purchases outside these 5 categories */}
        <div className="mt-3.5 pt-3 border-t border-[#f0ece7] dark:border-[#2b292c] text-[11px] text-[#737373] dark:text-[#a0a0a0] flex items-start gap-2">
          <span className="text-[#74455d] dark:text-[#c98bb1] font-semibold text-xs shrink-0">💡</span>
          <span>
            <strong>Outside the 5 categories?</strong> Charges that don't match Dining, Groceries, Shopping, Travel, or Bills (such as <em>donations to church</em>, charity, or government fees) earn standard baseline rate—feel free to <strong>use any card</strong>.
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-4 shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-3">
          Recent Charges
        </div>
        <div className="divide-y divide-[#f0ece7] dark:divide-[#2c2a2d]">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div>
                <div className="text-xs font-semibold text-[#191919] dark:text-white">{tx.merchant}</div>
                <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e]">
                  {tx.date} · {tx.cardName} {tx.pointsEarned ? `· ${tx.pointsEarned} pts` : ''}
                </div>
              </div>
              <div className="text-xs font-bold text-[#191919] dark:text-white">
                ${tx.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
