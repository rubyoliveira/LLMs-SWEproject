import React from 'react';
import { MessageSquare, CreditCard, BarChart2 } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="w-full bg-[#fbfaf8] dark:bg-[#1c1b1d] border-t border-[#e8e4df] dark:border-[#2b292c] py-2 px-6 flex items-center justify-around z-20">
      <button
        type="button"
        onClick={() => onSelectTab('ask')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
          activeTab === 'ask'
            ? 'text-[#74455d] dark:text-[#c98bb1]'
            : 'text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-[11px] font-medium">Ask</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('wallet')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
          activeTab === 'wallet'
            ? 'text-[#74455d] dark:text-[#c98bb1]'
            : 'text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white'
        }`}
      >
        <CreditCard className="w-4 h-4" />
        <span className="text-[11px] font-medium">Wallet</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('spending')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
          activeTab === 'spending'
            ? 'text-[#74455d] dark:text-[#c98bb1]'
            : 'text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white'
        }`}
      >
        <BarChart2 className="w-4 h-4" />
        <span className="text-[11px] font-medium">Spending</span>
      </button>
    </nav>
  );
};
