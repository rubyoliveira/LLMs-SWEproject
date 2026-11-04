import React from 'react';
import { X, CreditCard as CardIcon, Check } from 'lucide-react';
import { CreditCard } from '../types';

interface DifferentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  selectedCardId: string;
  onSelectCard: (card: CreditCard) => void;
}

export const DifferentCardModal: React.FC<DifferentCardModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedCardId,
  onSelectCard,
}) => {
  if (!isOpen) return null;

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
                Choose a Different Card
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Select which card you prefer to swipe for this purchase
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

        <div className="space-y-2.5">
          {cards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  onSelectCard(card);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#74455d] dark:border-[#c98bb1] bg-[#fbf5f8] dark:bg-[#2d222a]'
                    : 'border-[#eeeae5] dark:border-[#323035] bg-[#fbfaf8] dark:bg-[#272529] hover:border-[#cfc7bf] dark:hover:border-[#423f45]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#191919] dark:text-white">
                      {card.name}
                    </span>
                    <span className="text-[10px] text-[#8c8c8c] font-mono">•• {card.last4}</span>
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-0.5">
                    {card.multiplierCategories[0]?.description || 'Cash back'}
                  </div>
                  <div className="text-[10px] text-[#8c8c8c] mt-0.5">
                    Balance: ${card.balance.toFixed(2)} of ${card.creditLimit.toLocaleString()} limit
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-[#74455d] dark:bg-[#c98bb1] text-white dark:text-[#191919] flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#d1ccc7] dark:border-[#4d4a50]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
