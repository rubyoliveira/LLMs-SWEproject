import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2 bg-[#191919] dark:bg-white text-white dark:text-[#191919] px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-neutral-700 dark:border-neutral-200">
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
        ) : (
          <Info className="w-4 h-4 text-[#c98bb1] dark:text-[#74455d]" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
