import React from 'react';
import { HelpCircle, ChevronRight, Store, Utensils } from 'lucide-react';

interface AmbiguousMerchantCardProps {
  onSelectOption: (merchantName: string) => void;
}

export const AmbiguousMerchantCard: React.FC<AmbiguousMerchantCardProps> = ({
  onSelectOption,
}) => {
  return (
    <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-5 h-5 rounded-full bg-[#f4ecf1] dark:bg-[#362432] text-[#74455d] dark:text-[#dca8c7] flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
          Two merchants match, and the category changes the answer.
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => onSelectOption('Shake Shack')}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-[#eeeae5] dark:border-[#323035] bg-[#fbfaf8] dark:bg-[#272529] hover:border-[#74455d] dark:hover:border-[#c98bb1] transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#f4ecf1] dark:bg-[#34202e] text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors">
                Shake Shack
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Restaurants · Fast casual
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8c8c8c] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onSelectOption('Shack Shop')}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-[#eeeae5] dark:border-[#323035] bg-[#fbfaf8] dark:bg-[#272529] hover:border-[#74455d] dark:hover:border-[#c98bb1] transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#eae6e1] dark:bg-[#343236] text-[#666666] dark:text-[#cccccc] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors">
                Shack Shop
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Convenience store · Retail
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8c8c8c] group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors" />
        </button>
      </div>

      <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] leading-relaxed pt-2 border-t border-[#f0ece7] dark:border-[#2b292c]">
        Restaurants earn 4x on Amex Gold. Convenience stores earn 1x. I will not guess, because the wrong category means the wrong card.
      </div>
    </div>
  );
};
