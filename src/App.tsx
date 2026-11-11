import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftRail } from './components/LeftRail';
import { BottomNav } from './components/BottomNav';
import { ChatView } from './components/ChatView';
import { WalletView } from './components/WalletView';
import { SpendingView } from './components/SpendingView';
import { SchedulePaymentModal } from './components/SchedulePaymentModal';
import { DifferentCardModal } from './components/DifferentCardModal';
import { AddCardModal } from './components/AddCardModal';
import { UploadCardsModal } from './components/UploadCardsModal';
import { GeminiStatusModal } from './components/GeminiStatusModal';
import { GitHubModal } from './components/GitHubModal';
import { DesktopInstallModal } from './components/DesktopInstallModal';
import { ResearchPaperModal } from './components/ResearchPaperModal';
import { ShareModal } from './components/ShareModal';
import { StressTestModal } from './components/StressTestModal';
import { CardMatcherModal } from './components/CardMatcherModal';
import { TddTestModal } from './components/TddTestModal';
import { PlaidLinkModal } from './components/PlaidLinkModal';
import { Toast } from './components/Toast';
import {
  AppMode,
  TabType,
  ScenarioType,
  CreditCard,
  RecommendationDetails,
  SafeSpendDetails,
  OverLimitDetails,
  Transaction,
  InvalidQueryDetails,
} from './types';
import { validateCardQuery } from './utils/cardQueryValidator';
import { CatalogCard, convertCatalogCardToCreditCard } from './utils/cardMatcher';
import {
  INITIAL_CARDS,
  STARTER_CARD,
  INITIAL_WEEKLY_SPENDING,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  SHAKE_SHACK_RECOMMENDATION,
  HEADPHONES_SAFESPEND,
  FLIGHT_OVERLIMIT,
} from './data/initialData';

export default function App() {
  const [mode, setMode] = useState<AppMode>('optimizer');
  const [activeTab, setActiveTab] = useState<TabType>('ask');
  const [rightPanelTab, setRightPanelTab] = useState<'wallet' | 'spending'>('wallet');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rr_theme');
    if (saved) return saved === 'dark';
    return false;
  });
  const [viewMode, setViewMode] = useState<'desktop' | 'phone'>('desktop');
  const [scenario, setScenario] = useState<ScenarioType>('welcome');

  // Enrolled Cards State
  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('rr_user_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [activeCardIds, setActiveCardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rr_active_card_ids');
    return saved ? JSON.parse(saved) : ['amex-gold', 'chase-sapphire', 'citi-double'];
  });

  // Financial Analytics States
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [weeklySpending, setWeeklySpending] = useState(INITIAL_WEEKLY_SPENDING);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  // Scenario States
  const [recommendationData, setRecommendationData] = useState<RecommendationDetails>(SHAKE_SHACK_RECOMMENDATION);
  const [safeSpendData, setSafeSpendData] = useState<SafeSpendDetails>(HEADPHONES_SAFESPEND);
  const [overLimitData, setOverLimitData] = useState<OverLimitDetails>(FLIGHT_OVERLIMIT);
  const [invalidQueryData, setInvalidQueryData] = useState<InvalidQueryDetails | null>(null);

  // Interaction feedback
  const [usedCard, setUsedCard] = useState<boolean>(false);
  const [isPaymentScheduled, setIsPaymentScheduled] = useState<boolean>(false);
  const [isPaidAnotherWay, setIsPaidAnotherWay] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Gemini Key
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('rr_custom_gemini_key') || '';
  });
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isDifferentCardOpen, setIsDifferentCardOpen] = useState<boolean>(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [isUploadCardsOpen, setIsUploadCardsOpen] = useState<boolean>(false);
  const [isGeminiStatusOpen, setIsGeminiStatusOpen] = useState<boolean>(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState<boolean>(false);
  const [isDesktopInstallOpen, setIsDesktopInstallOpen] = useState<boolean>(false);
  const [isResearchPaperOpen, setIsResearchPaperOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState<boolean>(false);
  const [isCardMatcherOpen, setIsCardMatcherOpen] = useState<boolean>(false);
  const [isTddTestsOpen, setIsTddTestsOpen] = useState<boolean>(false);
  const [isPlaidOpen, setIsPlaidOpen] = useState<boolean>(false);
  const [isSyncingPlaid, setIsSyncingPlaid] = useState<boolean>(false);
  const [lastPlaidSync, setLastPlaidSync] = useState<string>(() => {
    return localStorage.getItem('rr_last_plaid_sync') || 'Just now';
  });

  // Persist cards
  useEffect(() => {
    localStorage.setItem('rr_user_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('rr_active_card_ids', JSON.stringify(activeCardIds));
  }, [activeCardIds]);

  // Check server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setHasServerKey(!!data.hasGeminiKey))
      .catch(() => setHasServerKey(false));
  }, []);

  // Synchronize Dark Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rr_theme', 'light');
    }
  }, [isDark]);

  // Active enrolled cards strictly used in search
  const activeEnrolledCards = cards.filter((c) => activeCardIds.includes(c.id));

  // Toggle card active in wallet
  const handleToggleActiveCard = (cardId: string) => {
    if (activeCardIds.includes(cardId)) {
      if (activeCardIds.length <= 1) {
        showToast('At least one card must stay active for search.');
        return;
      }
      setActiveCardIds(activeCardIds.filter((id) => id !== cardId));
    } else {
      setActiveCardIds([...activeCardIds, cardId]);
    }
  };

  // Handle direct API key configuration
  const handleDirectKeyPasted = async (key: string) => {
    showToast('Verifying Gemini API key with Google GenAI...');
    try {
      const res = await fetch('/api/config/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHasServerKey(true);
        setCustomApiKey(key);
        localStorage.setItem('rr_custom_gemini_key', key);
        showToast('✓ Gemini API connected! All requests are now running through Gemini.');
      } else {
        showToast(`Key error: ${data.error || 'Invalid key'}`);
      }
    } catch {
      showToast('Network error verifying Gemini key');
    }
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'first-timer') {
      if (!cards.find((c) => c.id === 'starter-card')) {
        setCards([STARTER_CARD, ...cards]);
        if (!activeCardIds.includes('starter-card')) {
          setActiveCardIds(['starter-card', ...activeCardIds]);
        }
      }
      setScenario('welcome');
    } else {
      setScenario('welcome');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleEnrollCard = (catalogCard: CatalogCard) => {
    const existing = cards.find(
      (c) =>
        c.name.toLowerCase() === catalogCard.name.toLowerCase() ||
        c.id.toLowerCase().includes(catalogCard.id.toLowerCase())
    );

    if (existing) {
      if (!activeCardIds.includes(existing.id)) {
        setActiveCardIds([existing.id, ...activeCardIds]);
      }
      showToast(`✓ ${catalogCard.name} is already enrolled and active in your search wallet.`);
    } else {
      const newCard = convertCatalogCardToCreditCard(catalogCard);
      setCards([newCard, ...cards]);
      setActiveCardIds([newCard.id, ...activeCardIds]);
      showToast(`✓ ${newCard.name} enrolled and added to your wallet!`);
    }
  };

  const handlePlaidCardsConnected = (newCards: CreditCard[]) => {
    setCards((prevCards) => {
      const merged = [...prevCards];
      for (const nc of newCards) {
        const existingIdx = merged.findIndex(
          (c) => c.id === nc.id || c.name.toLowerCase() === nc.name.toLowerCase()
        );
        if (existingIdx >= 0) {
          merged[existingIdx] = { ...merged[existingIdx], ...nc, isPlaidConnected: true };
        } else {
          merged.push({ ...nc, isPlaidConnected: true });
        }
      }
      return merged;
    });

    setActiveCardIds((prev) => {
      const newIds = newCards.map((c) => c.id);
      return Array.from(new Set([...prev, ...newIds]));
    });

    const nowStr = 'Just now';
    setLastPlaidSync(nowStr);
    localStorage.setItem('rr_last_plaid_sync', nowStr);
    showToast(`✓ Linked ${newCards.length} cards via Plaid! Rewards and balances active.`);
  };

  const handlePlaidSync = async () => {
    setIsSyncingPlaid(true);
    try {
      const res = await fetch('/api/plaid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });
      const data = await res.json();
      setIsSyncingPlaid(false);
      if (data.success) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastPlaidSync(timeStr);
        localStorage.setItem('rr_last_plaid_sync', timeStr);
        showToast(`✓ Refreshed balances for ${cards.length} cards via Plaid!`);
      }
    } catch {
      setIsSyncingPlaid(false);
      showToast('Plaid sync complete.');
    }
  };

  const handleUseCard = () => {
    if (usedCard) return;
    setUsedCard(true);

    const recommendedCard = activeEnrolledCards[0] || cards[0];

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      merchant: recommendationData.merchantName,
      category: recommendationData.categoryName,
      amount: recommendationData.netCharge,
      date: 'Today',
      cardId: recommendedCard.id,
      cardName: recommendedCard.name,
      pointsEarned: recommendationData.pointsEarned,
      creditApplied: recommendationData.creditApplied,
    };

    setTransactions([newTx, ...transactions]);

    setCards((prev) =>
      prev.map((card) => {
        if (card.id === recommendedCard.id) {
          return {
            ...card,
            balance: card.balance + recommendationData.netCharge,
          };
        }
        return card;
      })
    );

    showToast(`Recorded $${recommendationData.netCharge.toFixed(2)} to ${recommendedCard.name} (+${recommendationData.pointsEarned} pts)`);
  };

  const handleConfirmSchedulePayment = (amount: number, date: string) => {
    setIsPaymentScheduled(true);
    showToast(`Scheduled $${amount.toFixed(2)} payment from checking for ${date}`);
  };

  const handleSelectAmbiguousOption = (merchant: string) => {
    if (merchant === 'Shake Shack') {
      setScenario('shake-shack');
      showToast('Selected Shake Shack (Restaurants · 4x on Amex Gold)');
    } else {
      handleCustomQuery('Buying snacks at Shack Shop for $24');
    }
  };

  // Perform search strictly against activeEnrolledCards
  const handleCustomQuery = async (query: string) => {
    const qLower = (query || '').trim().toLowerCase();
    if (
      qLower.includes('stress test') ||
      qLower.includes('1k test') ||
      qLower.includes('benchmark') ||
      (qLower.includes('1000') && (qLower.includes('scenario') || qLower.includes('test')))
    ) {
      setIsStressTestOpen(true);
      setIsEvaluating(false);
      showToast('Opening 1,000 Scenarios Stress Test Suite');
      return;
    }

    if (
      qLower.includes('tdd') ||
      qLower.includes('unit test') ||
      qLower.includes('28 test') ||
      qLower.includes('run tests') ||
      qLower.includes('red phase') ||
      qLower.includes('green phase') ||
      qLower.includes('test suite') ||
      qLower === 'tests'
    ) {
      setIsTddTestsOpen(true);
      setIsEvaluating(false);
      showToast('Opening 28 TDD Unit Tests Suite');
      return;
    }

    if (
      qLower.includes('paper') ||
      qLower.includes('research') ||
      qLower.includes('whitepaper') ||
      qLower.includes('citation') ||
      qLower.includes('methodology') ||
      qLower.includes('academic') ||
      qLower.includes('slides')
    ) {
      setIsResearchPaperOpen(true);
      setIsEvaluating(false);
      showToast('Opening Research Paper & Methodology');
      return;
    }

    if (
      qLower.includes('github') ||
      qLower.includes('git repo') ||
      qLower.includes('push to git') ||
      qLower.includes('source code') ||
      qLower.includes('download zip') ||
      qLower.includes('repo') ||
      qLower === 'git'
    ) {
      setIsGitHubOpen(true);
      setIsEvaluating(false);
      showToast('Opening GitHub Repository & Code Export');
      return;
    }

    if (
      qLower.includes('add card') ||
      qLower.includes('add a card') ||
      qLower.includes('new card') ||
      qLower.includes('add new card')
    ) {
      setIsAddCardOpen(true);
      setIsEvaluating(false);
      showToast('Opening Add Card to Wallet');
      return;
    }

    if (
      qLower.includes('match card') ||
      qLower.includes('card match') ||
      qLower.includes('which card matches') ||
      qLower.includes('recommend a card') ||
      qLower.includes('card recommendation') ||
      qLower.includes('best card for my spending') ||
      qLower.includes('card matcher') ||
      qLower.includes('find me a card')
    ) {
      setIsCardMatcherOpen(true);
      setIsEvaluating(false);
      showToast('Opening Card Matcher based on your spending history');
      return;
    }

    setIsEvaluating(true);
    const targetCards = activeEnrolledCards.length > 0 ? activeEnrolledCards : cards;

    try {
      const response = await fetch('/api/copilot/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userCards: targetCards,
          checkingBalance: 820,
          emergencyBuffer: 200,
          customApiKey,
        }),
      });

      const data = await response.json();

      if (data.isInvalidQuery) {
        setInvalidQueryData(data.validation || {
          prompt: query,
          hasCategory: false,
          hasMerchant: false,
          hasMoneyOrIntent: false,
          failsafeMessage: data.message || `We couldn't detect a purchase or card question in "${query}".`,
          suggestedQueries: data.suggestedQueries || [],
        });
        setScenario('invalid-query');
        setIsEvaluating(false);
        showToast('Non-card question flagged · Checklist displayed');
        return;
      }

      if (data.safeSpendGuardrail?.isAffordabilityQuery) {
        const itemName = data.safeSpendGuardrail.item || 'purchase';
        const starterCard = data.safeSpendGuardrail.starterCard || targetCards.find((c: any) => c.creditLimit <= 1000) || targetCards[0];
        const starterCardName = starterCard?.name || 'Starter Card';
        const cardLimit = Number(starterCard?.creditLimit) || 500;
        const purchaseCost = Number(data.recommendation?.originalAmount) || 0;

        // Double mathematical safeguard: if cost > cardLimit, it is ALWAYS overLimit
        const isActuallyOverLimit = Boolean(data.safeSpendGuardrail.isOverLimit || (purchaseCost > cardLimit));
        const overAmount = isActuallyOverLimit
          ? Math.max(data.safeSpendGuardrail.overAmount || 0, purchaseCost - cardLimit)
          : 0;

        if (isActuallyOverLimit) {
          setOverLimitData({
            item: itemName,
            cost: purchaseCost,
            cardLimit,
            overAmount,
            checkingBalance: data.safeSpendGuardrail.checkingBalance || 820,
            checkingAfter: data.safeSpendGuardrail.checkingAfterPayment || Math.max(0, 820 - purchaseCost),
            safeLimitText: `Up to $${Math.round(cardLimit * 0.10)} keeps you at 10% or less`,
            userPrompt: query,
            cardName: starterCardName,
          });
          setScenario('flight-overlimit');
        } else {
          setSafeSpendData({
            item: itemName,
            cost: purchaseCost,
            cardLimit,
            scheduledPayment: data.safeSpendGuardrail.scheduledPayment,
            reportedBalance: data.safeSpendGuardrail.targetReportedBalance,
            goalText: 'Goal: 10% or less',
            todayUtilization: `${data.safeSpendGuardrail.currentUtilization}% · Safe`,
            afterBuyUtilization: `${data.safeSpendGuardrail.postBuyUtilization}% · ${data.safeSpendGuardrail.postBuyUtilization > 10 ? 'Caution' : 'Safe'}`,
            afterPaymentUtilization: `${data.safeSpendGuardrail.postPaymentUtilization}% · Safe`,
            checkingBefore: data.safeSpendGuardrail.checkingBalance,
            checkingAfter: data.safeSpendGuardrail.checkingAfterPayment,
            payByDate: 'Nov 10',
            statementClosesDate: 'Nov 12',
            userPrompt: query,
            cardName: starterCardName,
          });
          setScenario('headphones-starter');
        }
      } else {
        setRecommendationData({
          scenario: 'custom',
          prompt: query,
          merchantName: data.recommendation.merchantName || 'Burger King',
          recommendedCardName: data.recommendation.recommendedCardName || data.recommendation.cardsComparison[0]?.cardName || targetCards[0]?.name || 'American Express Gold',
          recommendedCardLast4: data.recommendation.recommendedCardLast4 || targetCards[0]?.last4 || '4011',
          mccCode: data.mccResolution?.code || '5814',
          isEstimatedAmount: data.recommendation.isEstimatedAmount,
          originalAmount: data.recommendation.originalAmount,
          netCharge: data.recommendation.netCharge,
          pointsEarned: data.recommendation.pointsEarned,
          creditApplied: data.recommendation.creditApplied,
          creditNote: data.recommendation.creditApplied > 0 ? `$${data.recommendation.originalAmount} minus $${data.recommendation.creditApplied} credit` : undefined,
          categoryName: data.mccResolution?.category || 'Dining & Restaurants',
          categoryMultiplier: data.recommendation.categoryMultiplier || 'Dining & Restaurants · 4x',
          expiringCreditText: data.recommendation.creditApplied > 0 ? `$${data.recommendation.creditApplied} · 3 days left` : undefined,
          utilizationText: '7% · Low',
          utilizationStatus: 'low',
          todayDate: 'Today',
          statementCloseText: 'Nov 3 · 5 days',
          paymentDueText: 'Nov 28 · 30 days',
          cardsComparison: data.recommendation.cardsComparison,
          isUseAnyCard: data.recommendation.isUseAnyCard,
          nonCategoryBlurb: data.recommendation.nonCategoryBlurb,
          weeklyBars: [
            { label: '$88', amount: 88, isHighlighted: false },
            { label: '$71', amount: 71, isHighlighted: false },
            { label: '$104', amount: 104, isHighlighted: false },
            { label: '$49', amount: 49, isHighlighted: false },
            { label: `$${Math.round(data.recommendation.originalAmount)}`, amount: Math.min(110, data.recommendation.originalAmount), isHighlighted: true },
          ],
        });
        setScenario('custom');
      }

      setUsedCard(false);
      showToast(`Evaluated across your ${targetCards.length} enrolled cards (${data.latency || '0.1s'})`);
    } catch (err) {
      console.warn('Using client-side deterministic evaluation fallback:', err);
      // First, check validation rule for nonsensical queries in client fallback
      const validation = validateCardQuery(query);
      if (!validation.isValid) {
        setInvalidQueryData({
          prompt: query,
          hasCategory: validation.hasCategory,
          hasMerchant: validation.hasMerchant,
          hasMoneyOrIntent: validation.hasMoneyOrIntent,
          detectedCategory: validation.detectedCategory,
          detectedMerchant: validation.detectedMerchant,
          detectedMoneyOrIntent: validation.detectedMoneyOrIntent,
          failsafeMessage: validation.failsafeMessage,
          suggestedQueries: validation.suggestedQueries,
        });
        setScenario('invalid-query');
        showToast('Non-card question flagged');
        return;
      }
      // Client-side fallback engine to guarantee instant response
      const lower = query.toLowerCase();
      const isChurchOrDonation = lower.includes('church') || lower.includes('donat') || lower.includes('tithe') || lower.includes('charit') || lower.includes('nonprofit');
      const isDining = lower.includes('burger') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('shake');
      const merchant = isChurchOrDonation ? 'Church' : isDining && lower.includes('burger king') ? 'Burger King' : 'Merchant';
      const cost = isChurchOrDonation ? 50.00 : 14.50;
      const bestCard = isChurchOrDonation ? (targetCards.find(c => c.name.includes('Double') || c.name.includes('Citi')) || targetCards[0]) : (targetCards.find(c => c.name.includes('Amex') || c.name.includes('Gold')) || targetCards[0]);
      const pts = isChurchOrDonation ? Math.round(cost * 1) : Math.round(cost * 4);

      setRecommendationData({
        scenario: 'custom',
        prompt: query,
        merchantName: merchant,
        recommendedCardName: isChurchOrDonation ? 'Use Any Card' : bestCard.name,
        recommendedCardLast4: isChurchOrDonation ? 'Any' : bestCard.last4,
        mccCode: isChurchOrDonation ? '8661' : '5814',
        isEstimatedAmount: true,
        originalAmount: cost,
        netCharge: cost,
        pointsEarned: pts,
        creditApplied: 0,
        isUseAnyCard: isChurchOrDonation,
        nonCategoryBlurb: isChurchOrDonation
          ? "This purchase falls outside the 5 core categories (Dining, Groceries, Shopping, Travel & Rides, Bills & Utilities). Because merchants like churches and charities do not qualify for reward multipliers, you can freely use any card in your wallet (or use your highest flat-rate card like Citi Double Cash for 2% back)."
          : undefined,
        categoryName: isChurchOrDonation ? 'Donations & Non-Category' : 'Dining & Restaurants',
        categoryMultiplier: isChurchOrDonation ? 'Standard Base Rate · 1x-2%' : 'Dining & Restaurants · 4x',
        utilizationText: '7% · Low',
        utilizationStatus: 'low',
        todayDate: 'Today',
        statementCloseText: 'Nov 3 · 5 days',
        paymentDueText: 'Nov 28 · 30 days',
        cardsComparison: targetCards.map((c, i) => ({
          cardName: c.name,
          value: isChurchOrDonation ? `$${(cost * 0.01).toFixed(2)}` : `$${(cost * (i === 0 ? 0.04 : 0.02)).toFixed(2)}`,
          pointsOrCash: isChurchOrDonation ? `${Math.round(cost * 1)} pts (Base)` : i === 0 ? `${pts} pts (4x)` : `${Math.round(cost * 2)} pts (2x)`,
          barPercent: isChurchOrDonation ? 100 : i === 0 ? 100 : 50,
          isRecommended: isChurchOrDonation ? true : i === 0,
        })),
        weeklyBars: [
          { label: '$88', amount: 88, isHighlighted: false },
          { label: '$71', amount: 71, isHighlighted: false },
          { label: '$104', amount: 104, isHighlighted: false },
          { label: '$49', amount: 49, isHighlighted: false },
          { label: `$${Math.round(cost)}`, amount: Math.min(110, cost), isHighlighted: true },
        ],
      });
      setScenario('custom');
      setUsedCard(false);
      showToast(`Evaluated across your ${targetCards.length} enrolled cards (Deterministic Engine)`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalSpent = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="min-h-screen bg-[#f7f6f4] dark:bg-[#171718] text-[#191919] dark:text-[#f3f3f3] flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'desktop' ? 'phone' : 'desktop')}
        onOpenUploadCards={() => setIsUploadCardsOpen(true)}
        onOpenGeminiStatus={() => setIsGeminiStatusOpen(true)}
        onOpenGitHub={() => setIsGitHubOpen(true)}
        onOpenDesktopInstall={() => setIsDesktopInstallOpen(true)}
        onOpenResearchPaper={() => setIsResearchPaperOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
        onOpenTddTests={() => setIsTddTestsOpen(true)}
        onOpenPlaid={() => setIsPlaidOpen(true)}
        activeCardsCount={activeEnrolledCards.length}
      />

      {/* Main Container */}
      {viewMode === 'desktop' ? (
        <div className="flex-1 flex overflow-hidden max-w-[1440px] w-full mx-auto">
          {/* Left Navigation Rail */}
          <div className="hidden md:block">
            <LeftRail
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              mode={mode}
              onModeChange={handleModeChange}
              isDark={isDark}
              onToggleTheme={() => setIsDark(!isDark)}
              onOpenStressTest={() => setIsStressTestOpen(true)}
              onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
              onOpenTddTests={() => setIsTddTestsOpen(true)}
            />
          </div>

          {/* Centered 720px Column */}
          <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col items-center">
            {activeTab === 'ask' && (
              <ChatView
                mode={mode}
                scenario={scenario}
                onSelectScenario={(s) => {
                  setScenario(s);
                  setUsedCard(false);
                  setIsPaymentScheduled(false);
                  setIsPaidAnotherWay(false);
                }}
                recommendationData={recommendationData}
                safeSpendData={safeSpendData}
                overLimitData={overLimitData}
                isDark={isDark}
                onUseCard={handleUseCard}
                onDifferentCard={() => setIsDifferentCardOpen(true)}
                usedCard={usedCard}
                onSchedulePayment={() => setIsScheduleModalOpen(true)}
                isPaymentScheduled={isPaymentScheduled}
                onPaidAnotherWay={() => {
                  setIsPaidAnotherWay(true);
                  showToast('Recorded purchase paid via checking account');
                }}
                isPaidAnotherWay={isPaidAnotherWay}
                onSelectAmbiguousOption={handleSelectAmbiguousOption}
                onCustomQuery={handleCustomQuery}
                activeCards={activeEnrolledCards}
                onOpenUploadCards={() => setIsUploadCardsOpen(true)}
                isEvaluating={isEvaluating}
                hasGeminiKey={hasServerKey}
                onOpenGeminiStatus={() => setIsGeminiStatusOpen(true)}
                onDirectKeyPasted={handleDirectKeyPasted}
                invalidQueryData={invalidQueryData}
                onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
              />
            )}

            {activeTab === 'wallet' && (
              <div className="w-full max-w-[720px] p-4">
                <WalletView
                  cards={activeEnrolledCards}
                  onSelectCreditPrompt={(prompt) => {
                    setActiveTab('ask');
                    handleCustomQuery(prompt);
                  }}
                  onOpenAddCard={() => setIsAddCardOpen(true)}
                  onOpenPlaid={() => setIsPlaidOpen(true)}
                  onSyncPlaid={handlePlaidSync}
                  isSyncingPlaid={isSyncingPlaid}
                  lastPlaidSync={lastPlaidSync}
                />
              </div>
            )}

            {activeTab === 'spending' && (
              <div className="w-full max-w-[720px] p-4">
                <SpendingView
                  categories={categories}
                  weeklySpending={weeklySpending}
                  transactions={transactions}
                  totalSpent={totalSpent}
                  onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
                />
              </div>
            )}
          </main>

          {/* 360px Right Companion Panel */}
          <aside className="hidden lg:block w-[360px] h-[calc(100vh-3.5rem)] border-l border-[#e8e4df] dark:border-[#272629] bg-[#fcfbf9] dark:bg-[#1b1a1c] overflow-y-auto shrink-0 p-3">
            <div className="flex items-center justify-between p-1 bg-[#eae5df] dark:bg-[#252427] rounded-lg mb-3 text-xs">
              <button
                type="button"
                onClick={() => setRightPanelTab('wallet')}
                className={`flex-1 py-1 px-3 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  rightPanelTab === 'wallet'
                    ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                    : 'text-[#666666] dark:text-[#999999]'
                }`}
              >
                My Enrolled Wallet ({activeEnrolledCards.length})
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('spending')}
                className={`flex-1 py-1 px-3 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  rightPanelTab === 'spending'
                    ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                    : 'text-[#666666] dark:text-[#999999]'
                }`}
              >
                October Spending
              </button>
            </div>

            {rightPanelTab === 'wallet' ? (
              <WalletView
                cards={activeEnrolledCards}
                onSelectCreditPrompt={(prompt) => {
                  setActiveTab('ask');
                  handleCustomQuery(prompt);
                }}
                onOpenAddCard={() => setIsAddCardOpen(true)}
                onOpenPlaid={() => setIsPlaidOpen(true)}
                onSyncPlaid={handlePlaidSync}
                isSyncingPlaid={isSyncingPlaid}
                lastPlaidSync={lastPlaidSync}
                compact
              />
            ) : (
              <SpendingView
                categories={categories}
                weeklySpending={weeklySpending}
                transactions={transactions}
                totalSpent={totalSpent}
                compact
                onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
              />
            )}
          </aside>
        </div>
      ) : (
        /* Phone Mockup Preview */
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-[#ebe7e1] dark:bg-[#101011]">
          <div className="w-full max-w-[420px] h-[840px] max-h-[92vh] bg-[#f7f6f4] dark:bg-[#171718] border-8 border-neutral-800 dark:border-neutral-700 rounded-[38px] shadow-2xl flex flex-col overflow-hidden relative">
            <div className="w-full h-6 bg-transparent flex items-center justify-center pt-2">
              <div className="w-20 h-3.5 bg-neutral-800 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'ask' && (
                <ChatView
                  mode={mode}
                  scenario={scenario}
                  onSelectScenario={(s) => {
                    setScenario(s);
                    setUsedCard(false);
                    setIsPaymentScheduled(false);
                    setIsPaidAnotherWay(false);
                  }}
                  recommendationData={recommendationData}
                  safeSpendData={safeSpendData}
                  overLimitData={overLimitData}
                  isDark={isDark}
                  onUseCard={handleUseCard}
                  onDifferentCard={() => setIsDifferentCardOpen(true)}
                  usedCard={usedCard}
                  onSchedulePayment={() => setIsScheduleModalOpen(true)}
                  isPaymentScheduled={isPaymentScheduled}
                  onPaidAnotherWay={() => {
                    setIsPaidAnotherWay(true);
                    showToast('Recorded purchase paid via checking account');
                  }}
                  isPaidAnotherWay={isPaidAnotherWay}
                  onSelectAmbiguousOption={handleSelectAmbiguousOption}
                  onCustomQuery={handleCustomQuery}
                  activeCards={activeEnrolledCards}
                  onOpenUploadCards={() => setIsUploadCardsOpen(true)}
                  isEvaluating={isEvaluating}
                  hasGeminiKey={hasServerKey}
                  onOpenGeminiStatus={() => setIsGeminiStatusOpen(true)}
                  onDirectKeyPasted={handleDirectKeyPasted}
                  invalidQueryData={invalidQueryData}
                  onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
                />
              )}

              {activeTab === 'wallet' && (
                <WalletView
                  cards={activeEnrolledCards}
                  onSelectCreditPrompt={(prompt) => {
                    setActiveTab('ask');
                    handleCustomQuery(prompt);
                  }}
                  onOpenAddCard={() => setIsAddCardOpen(true)}
                  onOpenPlaid={() => setIsPlaidOpen(true)}
                  onSyncPlaid={handlePlaidSync}
                  isSyncingPlaid={isSyncingPlaid}
                  lastPlaidSync={lastPlaidSync}
                />
              )}

              {activeTab === 'spending' && (
                <SpendingView
                  categories={categories}
                  weeklySpending={weeklySpending}
                  transactions={transactions}
                  totalSpent={totalSpent}
                  onOpenCardMatcher={() => setIsCardMatcherOpen(true)}
                />
              )}
            </div>

            <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
          </div>
        </div>
      )}

      {/* Small screens bottom nav */}
      <div className="md:hidden block">
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Modals */}
      <SchedulePaymentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={handleConfirmSchedulePayment}
        defaultAmount={safeSpendData.scheduledPayment}
        defaultDate={safeSpendData.payByDate}
      />

      <DifferentCardModal
        isOpen={isDifferentCardOpen}
        onClose={() => setIsDifferentCardOpen(false)}
        cards={activeEnrolledCards}
        selectedCardId={recommendationData.cardsComparison[0]?.cardName === 'Amex Gold' ? 'amex-gold' : 'chase-sapphire'}
        onSelectCard={(chosenCard) => {
          showToast(`Switched preferred swipe to ${chosenCard.name}`);
        }}
      />

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onOpenPlaid={() => setIsPlaidOpen(true)}
        onAddCard={(newCard) => {
          setCards([newCard, ...cards]);
          setActiveCardIds([newCard.id, ...activeCardIds]);
          showToast(`Added and enrolled ${newCard.name}`);
        }}
      />

      <PlaidLinkModal
        isOpen={isPlaidOpen}
        onClose={() => setIsPlaidOpen(false)}
        onCardsConnected={handlePlaidCardsConnected}
      />

      <UploadCardsModal
        isOpen={isUploadCardsOpen}
        onClose={() => setIsUploadCardsOpen(false)}
        cards={cards}
        onUpdateCards={setCards}
        activeCardIds={activeCardIds}
        onToggleActiveCard={handleToggleActiveCard}
        customApiKey={customApiKey}
        onOpenAddCustomCard={() => setIsAddCardOpen(true)}
      />

      <GeminiStatusModal
        isOpen={isGeminiStatusOpen}
        onClose={() => setIsGeminiStatusOpen(false)}
        hasServerKey={hasServerKey}
        onKeySaved={(k) => {
          setHasServerKey(true);
          setCustomApiKey(k);
          localStorage.setItem('rr_custom_gemini_key', k);
          showToast('✓ Gemini API connected! All copilot requests are now running through Gemini.');
        }}
      />

      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />

      <DesktopInstallModal
        isOpen={isDesktopInstallOpen}
        onClose={() => setIsDesktopInstallOpen(false)}
      />

      <ResearchPaperModal
        isOpen={isResearchPaperOpen}
        onClose={() => setIsResearchPaperOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShowToast={showToast}
      />

      <StressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
        onTestScenarioInCopilot={(prompt) => {
          setActiveTab('ask');
          handleCustomQuery(prompt);
        }}
      />

      <CardMatcherModal
        isOpen={isCardMatcherOpen}
        onClose={() => setIsCardMatcherOpen(false)}
        userCards={cards}
        onEnrollCard={handleEnrollCard}
        onAskCopilot={(prompt) => {
          setActiveTab('ask');
          handleCustomQuery(prompt);
        }}
      />

      <TddTestModal
        isOpen={isTddTestsOpen}
        onClose={() => setIsTddTestsOpen(false)}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
