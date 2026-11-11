export type AppMode = 'optimizer' | 'first-timer';
export type TabType = 'ask' | 'wallet' | 'spending';

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  last4: string;
  network: 'amex' | 'visa' | 'mastercard' | 'discover';
  balance: number;
  creditLimit: number;
  statementCloseDate: string; // e.g. "Nov 3"
  statementCloseDays: number; // e.g. 5
  paymentDueDate: string; // e.g. "Nov 28"
  paymentDueDays: number; // e.g. 30
  colorHex: string;
  multiplierCategories: {
    category: string;
    multiplier: number;
    description: string;
  }[];
  activeCredits?: {
    id: string;
    title: string;
    amount: number;
    remaining: number;
    expirationDate: string;
    daysLeft: number;
    category: string;
  }[];
  isPlaidConnected?: boolean;
  institutionId?: string;
  institutionName?: string;
  lastSyncedAt?: string;
}

export interface PlaidInstitution {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  cardCount: number;
  popularCards: string[];
  description: string;
}

export interface PlaidSyncResult {
  success: boolean;
  message: string;
  syncedCardsCount: number;
  timestamp: string;
  cards: CreditCard[];
}

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  iconName: string;
}

export interface WeeklySpending {
  weekLabel: string;
  amount: number;
  isCurrentWeek?: boolean;
  isPartial?: boolean;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  cardId: string;
  cardName: string;
  pointsEarned?: number;
  creditApplied?: number;
}

export type ScenarioType = 
  | 'welcome'
  | 'shake-shack' 
  | 'headphones-starter' 
  | 'ambiguous-shack' 
  | 'flight-overlimit'
  | 'invalid-query'
  | 'custom';

export interface InvalidQueryDetails {
  prompt: string;
  hasCategory: boolean;
  hasMerchant: boolean;
  hasMoneyOrIntent: boolean;
  detectedCategory?: string;
  detectedMerchant?: string;
  detectedMoneyOrIntent?: string;
  failsafeMessage: string;
  suggestedQueries: {
    label: string;
    query: string;
    type: 'category' | 'merchant' | 'money';
    description: string;
  }[];
}

export interface RecommendationDetails {
  scenario: ScenarioType;
  prompt: string;
  merchantName: string;
  recommendedCardName?: string;
  recommendedCardLast4?: string;
  mccCode?: string;
  isEstimatedAmount?: boolean;
  originalAmount: number;
  netCharge: number;
  pointsEarned: number;
  creditApplied: number;
  creditNote?: string;
  categoryName: string;
  categoryMultiplier: string;
  expiringCreditText?: string;
  utilizationText: string;
  utilizationStatus: 'low' | 'moderate' | 'caution' | 'safe';
  todayDate: string;
  statementCloseText: string;
  paymentDueText: string;
  cardsComparison: {
    cardName: string;
    value: string;
    pointsOrCash: string;
    barPercent: number;
    isRecommended: boolean;
  }[];
  weeklyBars: {
    label: string;
    amount: number;
    isHighlighted: boolean;
  }[];
  isUseAnyCard?: boolean;
  nonCategoryBlurb?: string;
}

export interface SafeSpendDetails {
  item: string;
  cost: number;
  cardLimit: number;
  scheduledPayment: number;
  reportedBalance: number;
  goalText: string;
  todayUtilization: string;
  afterBuyUtilization: string;
  afterPaymentUtilization: string;
  checkingBefore: number;
  checkingAfter: number;
  payByDate: string;
  statementClosesDate: string;
  userPrompt?: string;
  cardName?: string;
}

export interface OverLimitDetails {
  item: string;
  cost: number;
  cardLimit: number;
  overAmount: number;
  checkingBalance: number;
  checkingAfter: number;
  safeLimitText: string;
  userPrompt?: string;
  cardName?: string;
}
