import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { OverLimitDetails } from '../types';

interface OverLimitCardProps {
  data: OverLimitDetails;
  onCheckSmaller: () => void;
  onPaidAnotherWay: () => void;
  isPaidAnotherWay: boolean;
}

export const OverLimitCard: React.FC<OverLimitCardProps> = ({
  data,
  onCheckSmaller,
  onPaidAnotherWay,
  isPaidAnotherWay,
}) => {
  const [showMath, setShowMath] = useState(false);

  return (
    <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-5 shadow-xs transition-colors">
      {/* Top Badges */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md bg-[#fee2e2] dark:bg-[#3a191d] text-[#b91c1c] dark:text-[#fca5a5]">
          <AlertCircle className="w-3.5 h-3.5" />
          Not safe right now
        </span>
        <span className="text-[#737373] dark:text-[#9e9e9e] font-medium">0 of 1 cards</span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold tracking-tight text-[#191919] dark:text-[#f8f8f8] mb-2 leading-snug">
        No card is safe for this right now
      </h2>

      {/* Description */}
      <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed mb-5">
        A ${data.cost} {data.item || 'purchase'} is ${data.overAmount} over your ${data.cardLimit} limit, so your {data.cardName || 'Starter Card'} would decline it. You have no other card to use.
      </p>

      {/* Metrics breakdown */}
      <div className="space-y-2 mb-5 pt-3 border-t border-[#f0ece7] dark:border-[#2b292c] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">{data.cardName || 'Starter Card'} limit</span>
          <span className="font-medium text-[#191919] dark:text-white">${data.cardLimit}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Over the limit by</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">${data.overAmount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">If paid from checking</span>
          <span className="font-medium text-[#191919] dark:text-white">
            ${data.checkingBalance} → ${data.checkingAfter} left
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Fits your goal</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {data.safeLimitText}
          </span>
        </div>
      </div>

      {/* Math expander */}
      <div className="pt-2 border-t border-[#f0ece7] dark:border-[#2b292c] mb-5">
        <button
          type="button"
          onClick={() => setShowMath(!showMath)}
          className="flex items-center justify-between w-full text-[11px] text-[#737373] dark:text-[#9e9e9e] hover:text-[#191919] dark:hover:text-white cursor-pointer"
        >
          <span>Calculated from your data</span>
          <span className="flex items-center gap-1 font-medium text-[#74455d] dark:text-[#c98bb1]">
            See the math {showMath ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>

        {showMath && (
          <div className="mt-2.5 p-2.5 bg-[#fbfaf8] dark:bg-[#28262a] rounded-lg text-[11px] text-[#525252] dark:text-[#a3a3a3] space-y-1">
            <p>• {data.cardName || 'Starter Card'} limit: ${data.cardLimit}.00</p>
            <p>• {data.item ? data.item.charAt(0).toUpperCase() + data.item.slice(1) : 'Purchase'} cost: ${data.cost}.00 (deficit: -${data.overAmount}.00)</p>
            <p>• Recommended credit bureau reporting ratio: &lt;10% (${(data.cardLimit * 0.1).toFixed(0)})</p>
            <p>• Recommendation: Book via checking debit directly or pay down balance first.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onCheckSmaller}
          className="flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-xs bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors cursor-pointer"
        >
          Check another amount
        </button>

        <button
          type="button"
          onClick={onPaidAnotherWay}
          className={`flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
            isPaidAnotherWay
              ? 'bg-emerald-600 text-white dark:bg-emerald-500'
              : 'bg-[#f0ebe6] hover:bg-[#e7e1db] text-[#333333] dark:bg-[#2b292c] dark:hover:bg-[#343236] dark:text-[#e0e0e0]'
          }`}
        >
          {isPaidAnotherWay ? 'Recorded: Checking' : 'Paid another way'}
        </button>
      </div>
    </div>
  );
};
