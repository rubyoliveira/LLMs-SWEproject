import React, { useState } from 'react';
import { ArrowUp, Sparkles, Filter, CreditCard, ShieldCheck, Key, CheckCircle2, Zap } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { SafeSpendCard } from './SafeSpendCard';
import { AmbiguousMerchantCard } from './AmbiguousMerchantCard';
import { OverLimitCard } from './OverLimitCard';
import { WelcomeCard } from './WelcomeCard';
import { InvalidQueryCard } from './InvalidQueryCard';
import {
  AppMode,
  ScenarioType,
  RecommendationDetails,
  SafeSpendDetails,
  OverLimitDetails,
  CreditCard as CreditCardType,
  InvalidQueryDetails,
} from '../types';

interface ChatViewProps {
  mode: AppMode;
  scenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  recommendationData: RecommendationDetails;
  safeSpendData: SafeSpendDetails;
  overLimitData: OverLimitDetails;
  isDark: boolean;
  onUseCard: () => void;
  onDifferentCard: () => void;
  usedCard: boolean;
  onSchedulePayment: () => void;
  isPaymentScheduled: boolean;
  onPaidAnotherWay: () => void;
  isPaidAnotherWay: boolean;
  onSelectAmbiguousOption: (merchant: string) => void;
  onCustomQuery: (query: string) => void;
  activeCards: CreditCardType[];
  onOpenUploadCards: () => void;
  isEvaluating?: boolean;
  hasGeminiKey: boolean;
  onOpenGeminiStatus: () => void;
  onDirectKeyPasted: (key: string) => void;
  invalidQueryData?: InvalidQueryDetails | null;
}

export const ChatView: React.FC<ChatViewProps> = ({
  mode,
  scenario,
  onSelectScenario,
  recommendationData,
  safeSpendData,
  overLimitData,
  isDark,
  onUseCard,
  onDifferentCard,
  usedCard,
  onSchedulePayment,
  isPaymentScheduled,
  onPaidAnotherWay,
  isPaidAnotherWay,
  onSelectAmbiguousOption,
  onCustomQuery,
  activeCards,
  onOpenUploadCards,
  isEvaluating = false,
  hasGeminiKey,
  onOpenGeminiStatus,
  onDirectKeyPasted,
  invalidQueryData,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if user pasted a Gemini API Key (starts with AIzaSy)
    if (trimmed.startsWith('AIzaSy') && trimmed.length > 30) {
      onDirectKeyPasted(trimmed);
      setInputValue('');
      return;
    }

    onCustomQuery(trimmed);
    setInputValue('');
  };

  let userQueryText = '';
  let assistantHeadline = '';

  switch (scenario) {
    case 'welcome':
      userQueryText = '';
      assistantHeadline = mode === 'optimizer'
        ? 'Which card should you swipe today?'
        : 'Safe Spend & Credit Health Copilot';
      break;
    case 'shake-shack':
      userQueryText = 'Ordering lunch at Shake Shack for $24. Which card should I swipe?';
      assistantHeadline = `Swipe your ${recommendationData.recommendedCardName || recommendationData.cardsComparison[0]?.cardName || 'American Express Gold'}.`;
      break;
    case 'headphones-starter':
      userQueryText = 'Can I buy $180 headphones? My card only has a $500 limit.';
      assistantHeadline = 'Yes, you can buy them. Here is how to keep your credit healthy.';
      break;
    case 'ambiguous-shack':
      userQueryText = 'Lunch at Shack for $24. Which card?';
      assistantHeadline = 'I found two merchants called Shack. Which one did you mean?';
      break;
    case 'flight-overlimit':
      userQueryText = 'Can I put a $640 flight on my card?';
      assistantHeadline = 'Not on a card this time.';
      break;
    case 'invalid-query':
      userQueryText = invalidQueryData?.prompt || 'Non-card question';
      assistantHeadline = "I couldn't detect a card or purchase question.";
      break;
    default:
      userQueryText = recommendationData.prompt;
      if (recommendationData.isUseAnyCard) {
        assistantHeadline = 'Use any card for this purchase.';
      } else {
        assistantHeadline = `Swipe your ${recommendationData.recommendedCardName || recommendationData.cardsComparison[0]?.cardName || 'American Express Gold'}.`;
      }
      break;
  }

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col h-full justify-between pb-4">
      {/* Scrollable Conversation Content */}
      <div className="space-y-4 px-4 pt-4 sm:pt-6">
        {/* Active Enrolled Cards Filter Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] text-xs shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-[#191919] dark:text-white truncate">
              Filtering against your {activeCards.length} enrolled card{activeCards.length === 1 ? '' : 's'}:
            </span>
            <span className="text-[#737373] dark:text-[#9e9e9e] truncate hidden sm:inline">
              {activeCards.map((c) => c.name).join(', ')}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenUploadCards}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#74455d] dark:text-[#c98bb1] hover:underline shrink-0 ml-2 cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            <span>Change</span>
          </button>
        </div>

        {/* User Question Bubble (only when query exists) */}
        {userQueryText && (
          <div className="flex justify-end">
            <div className="bg-[#f0ebe6] dark:bg-[#272528] text-[#191919] dark:text-[#f0f0f0] rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm font-medium leading-relaxed shadow-xs">
              {userQueryText}
            </div>
          </div>
        )}

        {/* Assistant Response Headline */}
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#191919] dark:text-white flex items-center gap-2">
            <span>{assistantHeadline}</span>
            {isEvaluating && (
              <span className="text-xs font-normal text-[#74455d] dark:text-[#c98bb1] animate-pulse">
                (Evaluating via Gemini...)
              </span>
            )}
          </h1>
        </div>

        {/* Interactive Scenario Card */}
        {scenario === 'welcome' ? (
          <WelcomeCard
            mode={mode}
            onSelectPrompt={onCustomQuery}
            activeCards={activeCards}
            onOpenUploadCards={onOpenUploadCards}
            onSelectScenario={onSelectScenario}
          />
        ) : scenario === 'invalid-query' ? (
          invalidQueryData ? (
            <InvalidQueryCard
              data={invalidQueryData}
              onSelectPrompt={onCustomQuery}
            />
          ) : (
            <div className="p-4 bg-white dark:bg-[#201f22] rounded-xl border border-[#e8e4df] dark:border-[#2f2d31] text-xs">
              No query parameters found. Please ask a question with a category, store, or dollar amount.
            </div>
          )
        ) : scenario === 'shake-shack' || scenario === 'custom' ? (
          <RecommendationCard
            data={recommendationData}
            isDark={isDark}
            onUseCard={onUseCard}
            onDifferentCard={onDifferentCard}
            used={usedCard}
            onUpdateAmount={(amt) => onCustomQuery(`${recommendationData.merchantName} for $${amt}`)}
          />
        ) : scenario === 'headphones-starter' ? (
          <SafeSpendCard
            data={safeSpendData}
            onSchedulePayment={onSchedulePayment}
            isScheduled={isPaymentScheduled}
          />
        ) : scenario === 'ambiguous-shack' ? (
          <AmbiguousMerchantCard onSelectOption={onSelectAmbiguousOption} />
        ) : (
          <OverLimitCard
            data={overLimitData}
            onCheckSmaller={() => onSelectScenario('headphones-starter')}
            onPaidAnotherWay={onPaidAnotherWay}
            isPaidAnotherWay={isPaidAnotherWay}
          />
        )}
      </div>

      {/* Bottom Controls: Scenario Presets & Chat Input */}
      <div className="px-4 pt-4 mt-6">
        {/* Gemini Status Chip Bar */}
        <div className="flex items-center justify-between mb-2 px-1 text-[11px]">
          <button
            type="button"
            onClick={onOpenGeminiStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              hasGeminiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" />
            {hasGeminiKey ? (
              <span>Gemini 3.8 Flash Active (100% LLM)</span>
            ) : (
              <span>⚡ Connect Gemini API Key to enable 100% LLM execution</span>
            )}
          </button>

          <span className="text-[10px] text-[#8c8c8c] hidden sm:inline">
            Paste API Key or type query
          </span>
        </div>

        {/* Quick prompt scenario chips */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#737373] dark:text-[#9e9e9e] mb-1.5 px-0.5">
            <span>Try another question</span>
            <span className="text-[10px] text-[#8c8c8c] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" /> Paper Scenarios
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectScenario('welcome')}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                scenario === 'welcome'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1] font-medium'
                  : 'bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
              }`}
            >
              👋 Welcome
            </button>

            <button
              type="button"
              onClick={() => onCustomQuery('stress test')}
              className="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] border-[#74455d]/30 dark:border-[#c98bb1]/30 hover:bg-[#74455d] hover:text-white dark:hover:bg-[#c98bb1] dark:hover:text-[#181517] cursor-pointer flex items-center gap-1 font-semibold shadow-2xs transition-all"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>⚡ 1,000 Stress Test</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectScenario('shake-shack')}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                scenario === 'shake-shack'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1] font-medium'
                  : 'bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
              }`}
            >
              Shake Shack · $24
            </button>

            <button
              type="button"
              onClick={() => onCustomQuery('lunch at burger king')}
              className="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#74455d] cursor-pointer"
            >
              Burger King Lunch
            </button>

            <button
              type="button"
              onClick={() => onCustomQuery('Donating $50 to church')}
              className="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#74455d] cursor-pointer flex items-center gap-1"
            >
              <span>⛪ Church Donation · $50</span>
            </button>

            <button
              type="button"
              onClick={() => onCustomQuery('i have an exam today')}
              className="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:border-amber-400 cursor-pointer flex items-center gap-1 font-medium"
              title="Test non-card question failsafe"
            >
              <span>⚠️ "i have an exam today"</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectScenario('headphones-starter')}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                scenario === 'headphones-starter'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1] font-medium'
                  : 'bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
              }`}
            >
              Headphones · $180
            </button>

            <button
              type="button"
              onClick={() => onSelectScenario('ambiguous-shack')}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                scenario === 'ambiguous-shack'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1] font-medium'
                  : 'bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
              }`}
            >
              "Shack" · $24
            </button>

            <button
              type="button"
              onClick={() => onSelectScenario('flight-overlimit')}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer ${
                scenario === 'flight-overlimit'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1] font-medium'
                  : 'bg-white dark:bg-[#201f22] text-[#404040] dark:text-[#d1d5db] border-[#e8e4df] dark:border-[#2f2d31] hover:border-[#cfc7be]'
              }`}
            >
              Flight · $640
            </button>
          </div>
        </div>

        {/* Chat Input Field */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              mode === 'optimizer'
                ? `Ask which card to swipe (or paste Gemini API key)...`
                : 'Ask if you can afford something (or paste Gemini API key)...'
            }
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] rounded-xl text-xs sm:text-sm text-[#191919] dark:text-white placeholder:text-[#8c8c8c] focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] shadow-xs transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-[#74455d] hover:bg-[#61364d] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] text-white dark:text-[#181517] flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
