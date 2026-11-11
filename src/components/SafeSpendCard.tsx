import React from 'react';
import { ShieldCheck, Calendar, ArrowRight, Check } from 'lucide-react';
import { SafeSpendDetails } from '../types';

interface SafeSpendCardProps {
  data: SafeSpendDetails;
  onSchedulePayment: () => void;
  isScheduled: boolean;
}

export const SafeSpendCard: React.FC<SafeSpendCardProps> = ({
  data,
  onSchedulePayment,
  isScheduled,
}) => {
  return (
    <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-5 shadow-xs transition-colors">
      {/* Top Badges */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md bg-[#dcfce7] dark:bg-[#153421] text-[#166534] dark:text-[#4ade80]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Safe to buy
        </span>
        <span className="text-[#737373] dark:text-[#9e9e9e] font-medium">{data.cardName || 'Starter Card'}</span>
      </div>

      {/* Main headline in Notion Sans */}
      <h2 className="text-xl font-bold tracking-tight text-[#191919] dark:text-[#f8f8f8] mb-2 leading-snug">
        Safe to buy with a scheduled ${data.scheduledPayment} payment
      </h2>

      {/* Context explanation */}
      <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed mb-5">
        The {data.item || 'purchase'} costs <strong className="text-[#191919] dark:text-white">${data.cost}</strong> and your {data.cardName || 'Starter Card'} has a <strong className="text-[#191919] dark:text-white">${data.cardLimit}</strong> limit. If you
        pay <strong className="text-emerald-700 dark:text-emerald-400">${data.scheduledPayment}</strong> before your statement closes on {data.statementClosesDate}, you
        will only owe <strong className="text-[#191919] dark:text-white">${data.reportedBalance}</strong> (under 10% utilization) when reported to credit bureaus.
      </p>

      {/* Limit used section */}
      <div className="space-y-3 mb-5 pt-3 border-t border-[#f0ece7] dark:border-[#2b292c] text-xs">
        <div className="flex items-center justify-between font-semibold tracking-wider text-[11px] text-[#737373] dark:text-[#9e9e9e] uppercase">
          <span>Limit Used</span>
          <span className="normal-case font-normal text-[#737373] dark:text-[#9e9e9e]">{data.goalText}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#404040] dark:text-[#cccccc]">Today</span>
          <span className="bg-[#dcfce7] dark:bg-[#153421] text-[#166534] dark:text-[#4ade80] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.todayUtilization}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#404040] dark:text-[#cccccc]">After you buy</span>
          <span className="bg-[#fef3c7] dark:bg-[#3a2c16] text-[#92400e] dark:text-[#fbbf24] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.afterBuyUtilization}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#404040] dark:text-[#cccccc]">After your ${data.scheduledPayment} payment</span>
          <span className="bg-[#dcfce7] dark:bg-[#153421] text-[#166534] dark:text-[#4ade80] font-medium px-2 py-0.5 rounded text-[11px]">
            {data.afterPaymentUtilization}
          </span>
        </div>
      </div>

      {/* Slide 7: Guardrail Verifications */}
      <div className="space-y-2 mb-5 p-3 rounded-lg bg-[#fbfaf8] dark:bg-[#28262a] border border-[#eeeae5] dark:border-[#333036] text-[11px]">
        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> 1. Debit Parity Verification
          </span>
          <span>Checking reserve &gt; $200 buffer</span>
        </div>
        <div className="flex items-center justify-between text-[#74455d] dark:text-[#c98bb1] font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> 2. Statement vs Due Date Shield
          </span>
          <span>Locks sub-10% bureau reporting</span>
        </div>
        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> 3. 750+ Credit Score Pathway
          </span>
          <span>0% APR interest exposure</span>
        </div>
      </div>

      {/* Account impact */}
      <div className="space-y-2 mb-6 pt-3 border-t border-[#f0ece7] dark:border-[#2b292c] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Checking balance</span>
          <span className="font-medium text-[#191919] dark:text-white">
            ${data.checkingBefore} → ${data.checkingAfter} after payment
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#666666] dark:text-[#999999]">Pay by</span>
          <span className="font-medium text-[#191919] dark:text-white">
            {data.payByDate} (statement closes {data.statementClosesDate})
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onSchedulePayment}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
          isScheduled
            ? 'bg-emerald-600 text-white dark:bg-emerald-500'
            : 'bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517]'
        }`}
      >
        {isScheduled ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Scheduled for {data.payByDate}</span>
          </>
        ) : (
          <>
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule ${data.scheduledPayment} payment for {data.payByDate}</span>
          </>
        )}
      </button>
    </div>
  );
};
