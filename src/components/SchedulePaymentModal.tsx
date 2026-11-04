import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SchedulePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, date: string) => void;
  defaultAmount: number;
  defaultDate: string;
}

export const SchedulePaymentModal: React.FC<SchedulePaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultAmount,
  defaultDate,
}) => {
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [date, setDate] = useState('2026-11-10');
  const [selectedBank, setSelectedBank] = useState('Chase Total Checking (•• 4819)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-md rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                Schedule Safe-Spend Payment
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Auto-pay before statement close to lock in 10% utilization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Payment Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#8c8c8c]">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-sm text-[#191919] dark:text-white font-semibold focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Keeps reported balance at exactly $50 (10% utilization)
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
            />
            <p className="text-[10px] text-[#8c8c8c] mt-1">2 days before statement closes on Nov 12</p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Pay From Account
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
            >
              <option>Chase Total Checking (•• 4819) — $820.00 available</option>
              <option>Marcus High Yield Savings (•• 1092) — $4,250.00</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#666666] dark:text-[#a0a0a0] hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(parseFloat(amount) || defaultAmount, defaultDate);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
