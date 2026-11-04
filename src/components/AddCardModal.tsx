import React, { useState } from 'react';
import { X, Plus, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CreditCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('Capital One');
  const [last4, setLast4] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');
  const [perk, setPerk] = useState('3x on Dining, 2x on Travel');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCard: CreditCard = {
      id: `card-${Date.now()}`,
      name: name.trim(),
      issuer,
      last4: last4.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
      network: 'visa',
      balance: 0,
      creditLimit: parseFloat(creditLimit) || 5000,
      statementCloseDate: 'Nov 18',
      statementCloseDays: 20,
      paymentDueDate: 'Dec 13',
      paymentDueDays: 45,
      colorHex: '#64748b',
      multiplierCategories: [
        { category: 'Top Category', multiplier: 3, description: perk },
        { category: 'General', multiplier: 1, description: '1x on everything else' },
      ],
    };

    onAddCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-md rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                Add Card to Wallet
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Sync rewards & statement cycle for optimization
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Card Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Capital One Savor, Discover it"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
                Issuer
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="4011"
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white font-mono focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Credit Limit ($)
            </label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Top Reward Benefit
            </label>
            <input
              type="text"
              value={perk}
              onChange={(e) => setPerk(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#666666] dark:text-[#a0a0a0] hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
