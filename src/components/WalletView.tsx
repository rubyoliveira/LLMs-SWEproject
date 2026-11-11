import React from 'react';
import { CreditCard as CardIcon, Clock, AlertTriangle, Plus, ChevronRight, CheckCircle2, Zap, RefreshCw, ShieldCheck, Lock } from 'lucide-react';
import { CreditCard } from '../types';

interface WalletViewProps {
  cards: CreditCard[];
  onSelectCreditPrompt: (creditText: string) => void;
  onOpenAddCard: () => void;
  onOpenPlaid?: () => void;
  onSyncPlaid?: () => void;
  isSyncingPlaid?: boolean;
  lastPlaidSync?: string;
  compact?: boolean; // For desktop 360px right panel
}

export const WalletView: React.FC<WalletViewProps> = ({
  cards,
  onSelectCreditPrompt,
  onOpenAddCard,
  onOpenPlaid,
  onSyncPlaid,
  isSyncingPlaid = false,
  lastPlaidSync,
  compact = false,
}) => {
  const totalBalance = cards.reduce((acc, c) => acc + c.balance, 0);
  const totalLimit = cards.reduce((acc, c) => acc + c.creditLimit, 0);
  const overallUtil = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const plaidCardsCount = cards.filter((c) => c.isPlaidConnected).length;

  return (
    <div className={`space-y-4 ${compact ? 'p-1' : 'p-4 max-w-xl mx-auto'}`}>
      {/* Wallet Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#191919] dark:text-white">
            Wallet
          </h2>
          <p className="text-xs text-[#737373] dark:text-[#9e9e9e] mt-0.5">
            {cards.length} cards · ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} balance ({overallUtil}% used)
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenPlaid && (
            <button
              type="button"
              onClick={onOpenPlaid}
              title="Connect cards securely via Plaid"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111] dark:bg-white text-white dark:text-[#111] hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 dark:text-[#74455d]" />
              <span>Plaid Link</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f0ebe6] hover:bg-[#e6e0d9] dark:bg-[#28262a] dark:hover:bg-[#323035] text-[#191919] dark:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* PLAID LIVE CONNECTION BANNER */}
      <div className="p-3.5 rounded-xl border border-[#e8e4df] dark:border-[#2f2d31] bg-gradient-to-r from-[#faf8f5] to-[#f4eee8] dark:from-[#201f22] dark:to-[#27252a] flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-white text-white dark:text-[#111] flex items-center justify-center font-black text-sm shrink-0">
            ☵
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#191919] dark:text-white truncate">
                {plaidCardsCount > 0 ? `Plaid Multi-Card Sync (${plaidCardsCount} connected)` : 'Plaid Bank Connection'}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            </div>
            <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e] truncate mt-0.5">
              {lastPlaidSync ? `Last synced ${lastPlaidSync}` : 'Auto-syncs balances, statement dates & credit limits'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSyncPlaid && (
            <button
              type="button"
              disabled={isSyncingPlaid}
              onClick={onSyncPlaid}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#302e33] border border-[#d8d2cb] dark:border-[#423f45] text-[#191919] dark:text-white hover:bg-[#ede7e1] dark:hover:bg-[#3a373e] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingPlaid ? 'animate-spin text-[#74455d] dark:text-[#c98bb1]' : ''}`} />
              <span className="hidden sm:inline">{isSyncingPlaid ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          {onOpenPlaid && (
            <button
              type="button"
              onClick={onOpenPlaid}
              className="text-xs font-bold text-[#74455d] dark:text-[#c98bb1] hover:underline px-1 cursor-pointer"
            >
              Connect More
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e]">
          Cards
        </div>

        {cards.map((card) => {
          const utilization = Math.round((card.balance / card.creditLimit) * 100);
          const isLow = utilization <= 10;
          const isModerate = utilization > 10 && utilization <= 30;

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl p-4 shadow-xs transition-all hover:border-[#cfc7be] dark:hover:border-[#413e44]"
            >
              {/* Card Title & Balance */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#191919] dark:text-white">
                      {card.name}
                    </span>
                    <span className="text-[10px] text-[#8c8c8c] font-mono">•• {card.last4}</span>
                    {card.isPlaidConnected && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-blue-500/15 text-blue-700 dark:text-blue-300 flex items-center gap-0.5">
                        ☵ Plaid
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                    {card.multiplierCategories[0]?.category}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#191919] dark:text-white tracking-tight">
                    ${card.balance.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#8c8c8c]">balance</div>
                </div>
              </div>

              {/* Utilization progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-[#737373] dark:text-[#9e9e9e] mb-1">
                  <span
                    className={`font-medium ${
                      isLow
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isModerate
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {utilization}% used · {isLow ? 'Low' : isModerate ? 'Moderate' : 'High'}
                  </span>
                  <span>
                    ${card.balance.toFixed(2)} of ${card.creditLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-[#eae5df] dark:bg-[#2e2c30] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      card.id === 'amex-gold'
                        ? 'bg-[#74455d] dark:bg-[#c98bb1]'
                        : isLow
                        ? 'bg-emerald-500'
                        : isModerate
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, utilization))}%` }}
                  />
                </div>
              </div>

              {/* Statement & Due Dates */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#f2ede8] dark:border-[#2b292c] text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                <span>
                  Closes {card.statementCloseDate} · in {card.statementCloseDays} days
                </span>
                <span className="text-[#191919] dark:text-white font-medium">
                  Due {card.paymentDueDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPIRING CREDITS Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e]">
            Expiring Credits
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
            <Clock className="w-3 h-3" /> $20.00 ends in 3 days
          </span>
        </div>

        <div className="space-y-2">
          <div
            onClick={() => onSelectCreditPrompt('Where can I spend my $10 dining credit before Oct 31?')}
            className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#74455d] dark:hover:border-[#c98bb1] rounded-xl p-3 shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="text-xs font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors">
                $10 dining credit
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Amex Gold · ends Oct 31
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#191919] dark:text-white">$10.00</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                3 days left
              </div>
            </div>
          </div>

          <div
            onClick={() => onSelectCreditPrompt('How do I activate my $10 Uber credit this month?')}
            className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#74455d] dark:hover:border-[#c98bb1] rounded-xl p-3 shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="text-xs font-semibold text-[#191919] dark:text-white group-hover:text-[#74455d] dark:group-hover:text-[#c98bb1] transition-colors">
                $10 Uber credit
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
                Amex Gold · ends Oct 31
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#191919] dark:text-white">$10.00</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                3 days left
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
