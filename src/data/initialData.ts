import { CreditCard, SpendingCategory, WeeklySpending, Transaction, RecommendationDetails, SafeSpendDetails, OverLimitDetails } from '../types';

export const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'amex-gold',
    name: 'American Express Gold',
    issuer: 'American Express',
    last4: '4011',
    network: 'amex',
    balance: 842.16,
    creditLimit: 12000.00,
    statementCloseDate: 'Nov 3',
    statementCloseDays: 5,
    paymentDueDate: 'Nov 28',
    paymentDueDays: 30,
    colorHex: '#d4af37',
    multiplierCategories: [
      { category: 'Dining & Restaurants', multiplier: 4, description: '4x points worldwide' },
      { category: 'US Supermarkets', multiplier: 4, description: '4x points up to $25k/yr' },
      { category: 'Flights directly booked', multiplier: 3, description: '3x points' },
      { category: 'Other purchases', multiplier: 1, description: '1x points' },
    ],
    activeCredits: [
      {
        id: 'amex-dining-oct',
        title: '$10 dining credit',
        amount: 10,
        remaining: 10,
        expirationDate: 'Oct 31',
        daysLeft: 3,
        category: 'Dining',
      },
      {
        id: 'amex-uber-oct',
        title: '$10 Uber Cash credit',
        amount: 10,
        remaining: 10,
        expirationDate: 'Oct 31',
        daysLeft: 3,
        category: 'Rideshare & Dining',
      },
    ],
  },
  {
    id: 'chase-sapphire',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    last4: '2288',
    network: 'visa',
    balance: 1170.00,
    creditLimit: 9000.00,
    statementCloseDate: 'Nov 16',
    statementCloseDays: 18,
    paymentDueDate: 'Dec 11',
    paymentDueDays: 43,
    colorHex: '#1d4ed8',
    multiplierCategories: [
      { category: 'Dining', multiplier: 3, description: '3x points on dining' },
      { category: 'Travel', multiplier: 2, description: '2x points on travel' },
      { category: 'Streaming Services', multiplier: 3, description: '3x points' },
      { category: 'General', multiplier: 1, description: '1x point on all else' },
    ],
  },
  {
    id: 'citi-double',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    last4: '6190',
    network: 'mastercard',
    balance: 265.30,
    creditLimit: 8000.00,
    statementCloseDate: 'Nov 21',
    statementCloseDays: 23,
    paymentDueDate: 'Dec 16',
    paymentDueDays: 48,
    colorHex: '#0284c7',
    multiplierCategories: [
      { category: 'All Purchases', multiplier: 2, description: '1% when you buy + 1% as you pay' },
    ],
  },
];

export const STARTER_CARD: CreditCard = {
  id: 'starter-card',
  name: 'Starter Card',
  issuer: 'Capital One',
  last4: '9012',
  network: 'mastercard',
  balance: 0.00,
  creditLimit: 500.00,
  statementCloseDate: 'Nov 12',
  statementCloseDays: 14,
  paymentDueDate: 'Dec 7',
  paymentDueDays: 39,
  colorHex: '#475569',
  multiplierCategories: [
    { category: 'All purchases', multiplier: 1, description: '1% cash back on all spending' },
  ],
};

export const INITIAL_WEEKLY_SPENDING: WeeklySpending[] = [
  { weekLabel: 'Oct 1-7', amount: 312 },
  { weekLabel: 'Oct 8-14', amount: 268 },
  { weekLabel: 'Oct 15-21', amount: 342 },
  { weekLabel: 'Oct 22-28', amount: 156 },
  { weekLabel: 'Oct 29-31', amount: 64, isCurrentWeek: true, isPartial: true },
];

export const INITIAL_CATEGORIES: SpendingCategory[] = [
  { id: 'cat-dining', name: 'Dining', amount: 412.60, percentage: 36, color: '#74455d', iconName: 'Utensils' },
  { id: 'cat-groceries', name: 'Groceries', amount: 284.10, percentage: 25, color: '#10b981', iconName: 'ShoppingBag' },
  { id: 'cat-shopping', name: 'Shopping', amount: 198.50, percentage: 17, color: '#f59e0b', iconName: 'Tag' },
  { id: 'cat-travel', name: 'Travel & Rides', amount: 142.30, percentage: 12, color: '#3b82f6', iconName: 'Plane' },
  { id: 'cat-bills', name: 'Bills & Utilities', amount: 104.34, percentage: 10, color: '#6366f1', iconName: 'Receipt' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', merchant: 'Shake Shack', category: 'Dining', amount: 24.00, date: 'Oct 28', cardId: 'amex-gold', cardName: 'Amex Gold', pointsEarned: 96, creditApplied: 10.00 },
  { id: 'tx-2', merchant: 'Whole Foods Market', category: 'Groceries', amount: 84.15, date: 'Oct 27', cardId: 'amex-gold', cardName: 'Amex Gold', pointsEarned: 336 },
  { id: 'tx-3', merchant: 'Delta Air Lines', category: 'Travel', amount: 112.50, date: 'Oct 25', cardId: 'chase-sapphire', cardName: 'Sapphire Preferred', pointsEarned: 225 },
  { id: 'tx-4', merchant: 'Chipotle Mexican Grill', category: 'Dining', amount: 18.20, date: 'Oct 24', cardId: 'amex-gold', cardName: 'Amex Gold', pointsEarned: 72 },
  { id: 'tx-5', merchant: 'Apple Subscription', category: 'Bills', amount: 14.99, date: 'Oct 22', cardId: 'chase-sapphire', cardName: 'Sapphire Preferred', pointsEarned: 45 },
  { id: 'tx-6', merchant: 'Target Store', category: 'Shopping', amount: 48.60, date: 'Oct 20', cardId: 'citi-double', cardName: 'Citi Double Cash', pointsEarned: 97 },
];

export const SHAKE_SHACK_RECOMMENDATION: RecommendationDetails = {
  scenario: 'shake-shack',
  prompt: 'Ordering lunch at Shake Shack for $24. Which card should I swipe?',
  merchantName: 'Shake Shack',
  originalAmount: 24.00,
  netCharge: 14.00,
  pointsEarned: 96,
  creditApplied: 10.00,
  creditNote: '$24.00 minus $10.00 dining credit',
  categoryName: 'Dining',
  categoryMultiplier: 'Dining · 4x',
  expiringCreditText: '$10 · 3 days left',
  utilizationText: '7% · Low',
  utilizationStatus: 'low',
  todayDate: 'Oct 29',
  statementCloseText: 'Nov 3 · 5 days',
  paymentDueText: 'Nov 28 · 30 days',
  cardsComparison: [
    { cardName: 'Amex Gold', value: '$10.96', pointsOrCash: '96 pts + $10 credit', barPercent: 100, isRecommended: true },
    { cardName: 'Sapphire', value: '$0.72', pointsOrCash: '72 pts', barPercent: 18, isRecommended: false },
    { cardName: 'Citi Double Cash', value: '$0.48', pointsOrCash: '2% back', barPercent: 12, isRecommended: false },
  ],
  weeklyBars: [
    { label: '$88', amount: 88, isHighlighted: false },
    { label: '$71', amount: 71, isHighlighted: false },
    { label: '$104', amount: 104, isHighlighted: false },
    { label: '$49', amount: 49, isHighlighted: false },
    { label: '$101', amount: 101, isHighlighted: true },
  ],
};

export const HEADPHONES_SAFESPEND: SafeSpendDetails = {
  item: 'Headphones',
  cost: 180,
  cardLimit: 500,
  scheduledPayment: 130,
  reportedBalance: 50,
  goalText: 'Goal: 10% or less',
  todayUtilization: '0% · Safe',
  afterBuyUtilization: '36% · Caution',
  afterPaymentUtilization: '10% · Safe',
  checkingBefore: 820,
  checkingAfter: 690,
  payByDate: 'Nov 10',
  statementClosesDate: 'Nov 12',
};

export const FLIGHT_OVERLIMIT: OverLimitDetails = {
  item: '$640 flight',
  cost: 640,
  cardLimit: 500,
  overAmount: 140,
  checkingBalance: 820,
  checkingAfter: 180,
  safeLimitText: 'Up to $50 keeps you at 10% or less',
};
