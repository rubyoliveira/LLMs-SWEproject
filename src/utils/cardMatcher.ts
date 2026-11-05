/**
 * RocketRewards Card Matcher Engine (For New Users)
 * 
 * Analyzes spending history across categories and deterministically computes 
 * annual rewards, fee offsets, and net value across leading cards to find 
 * the mathematically optimal card match.
 */

import { CreditCard } from '../types';

export interface MonthlySpendingProfile {
  name: string;
  description: string;
  dining: number;
  groceries: number;
  travel: number;
  streamingAndBills: number;
  shoppingAndRetail: number;
  gas: number;
  rent: number;
}

export interface CatalogCard {
  id: string;
  name: string;
  issuer: string;
  network: 'amex' | 'visa' | 'mastercard' | 'discover';
  annualFee: number;
  annualCredits: number;
  creditDetails: string;
  colorHex: string;
  bestFor: string;
  isStarterFriendly: boolean;
  pointValuationCents: number; // e.g. 1.0 for cash back, 1.3 for Amex MR, 1.25 for Chase UR
  multipliers: {
    dining: number;
    groceries: number;
    travel: number;
    streamingAndBills: number;
    shoppingAndRetail: number;
    gas: number;
    rent: number;
    baseline: number;
  };
  caps?: {
    groceriesCapAnnual?: number;
    gasCapAnnual?: number;
    onlineRetailCapAnnual?: number;
  };
  keyPerks: string[];
}

export interface CardMatchResult {
  card: CatalogCard;
  matchScore: number; // 0 - 100
  annualSpendTotal: number;
  annualGrossRewardsDollars: number;
  annualCreditsApplied: number;
  annualFee: number;
  netAnnualValueDollars: number;
  pointsEarnedAnnual: number;
  monthlyAverageRewards: number;
  gainVersusDebit: number; // Dollar gain compared to 0% debit card
  gainVersusFlatRate: number; // Dollar gain compared to standard 1% or 1.5% card
  topEarningCategory: string;
  categoryBreakdownAnnual: {
    dining: number;
    groceries: number;
    travel: number;
    streamingAndBills: number;
    shoppingAndRetail: number;
    gas: number;
    rent: number;
  };
  recommendationReason: string;
}

// Preset Spending Archetypes for New Users
export const PRESET_SPENDING_PROFILES: MonthlySpendingProfile[] = [
  {
    name: 'Foodie & Delivery Lover',
    description: 'High dining, takeout, fast casual, and supermarket spend',
    dining: 450,
    groceries: 380,
    travel: 120,
    streamingAndBills: 80,
    shoppingAndRetail: 220,
    gas: 90,
    rent: 0,
  },
  {
    name: 'Frequent Traveler & Commuter',
    description: 'Airlines, hotels, rideshare, transit, and road trips',
    dining: 320,
    groceries: 200,
    travel: 450,
    streamingAndBills: 90,
    shoppingAndRetail: 200,
    gas: 160,
    rent: 0,
  },
  {
    name: 'Everyday Household & Retail',
    description: 'Supermarkets, department stores, Amazon, hardware, and utilities',
    dining: 220,
    groceries: 550,
    travel: 80,
    streamingAndBills: 150,
    shoppingAndRetail: 420,
    gas: 180,
    rent: 0,
  },
  {
    name: 'Student / Budget Starter',
    description: 'Low overhead, campus dining, subscriptions, and zero-annual-fee focus',
    dining: 180,
    groceries: 160,
    travel: 40,
    streamingAndBills: 45,
    shoppingAndRetail: 110,
    gas: 50,
    rent: 0,
  },
  {
    name: 'Renter & Urban Young Pro',
    description: 'High monthly apartment rent, urban dining, and rideshare',
    dining: 380,
    groceries: 260,
    travel: 160,
    streamingAndBills: 75,
    shoppingAndRetail: 210,
    gas: 40,
    rent: 1400,
  },
];

// Actual October Spending in RocketRewards ($1,450.40/mo)
export const USER_CURRENT_SPENDING_PROFILE: MonthlySpendingProfile = {
  name: 'Your October Spending History',
  description: 'Calculated from your actual $1,450.40 monthly account history',
  dining: 412.60,
  groceries: 284.10,
  travel: 245.00,
  streamingAndBills: 148.50,
  shoppingAndRetail: 260.20,
  gas: 100.00,
  rent: 0,
};

// Comprehensive Catalog of Top Market Cards for New Users
export const CARD_CATALOG: CatalogCard[] = [
  {
    id: 'amex-gold-match',
    name: 'American Express Gold',
    issuer: 'American Express',
    network: 'amex',
    annualFee: 250,
    annualCredits: 240, // $120 dining + $120 uber cash
    creditDetails: '$120 annual dining credit + $120 Uber Cash ($240 total)',
    colorHex: '#d4af37',
    bestFor: 'Dining, Takeout & US Supermarkets',
    isStarterFriendly: false,
    pointValuationCents: 1.2, // Membership Rewards valuation
    multipliers: {
      dining: 4,
      groceries: 4,
      travel: 3, // Flights
      streamingAndBills: 1,
      shoppingAndRetail: 1,
      gas: 1,
      rent: 1,
      baseline: 1,
    },
    caps: {
      groceriesCapAnnual: 25000,
    },
    keyPerks: [
      '4x points on Dining worldwide + Takeout',
      '4x points at US Supermarkets (up to $25k/yr)',
      '3x points on Flights directly booked',
      '$120 Dining credit + $120 Uber Cash',
    ],
  },
  {
    id: 'chase-sapphire-match',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    network: 'visa',
    annualFee: 95,
    annualCredits: 50, // $50 hotel credit
    creditDetails: '$50 annual Chase Travel hotel credit',
    colorHex: '#1d4ed8',
    bestFor: 'Dining, Travel & Select Streaming',
    isStarterFriendly: false,
    pointValuationCents: 1.25, // Ultimate Rewards 1.25c portal redemption
    multipliers: {
      dining: 3,
      groceries: 3, // Online grocery
      travel: 2,
      streamingAndBills: 3,
      shoppingAndRetail: 1,
      gas: 1,
      rent: 1,
      baseline: 1,
    },
    keyPerks: [
      '3x points on Dining, Delivery & Takeout',
      '3x points on Select Streaming Services',
      '2x points on Travel & Transit worldwide',
      '25% points boost on Chase Travel bookings',
    ],
  },
  {
    id: 'capital-one-savor-match',
    name: 'Capital One SavorOne Cash Rewards',
    issuer: 'Capital One',
    network: 'mastercard',
    annualFee: 0,
    annualCredits: 0,
    creditDetails: 'No annual fee to offset',
    colorHex: '#e11d48',
    bestFor: 'No-Annual-Fee Dining, Groceries & Entertainment',
    isStarterFriendly: true,
    pointValuationCents: 1.0,
    multipliers: {
      dining: 3,
      groceries: 3,
      travel: 1,
      streamingAndBills: 3, // Popular streaming
      shoppingAndRetail: 1,
      gas: 1,
      rent: 1,
      baseline: 1,
    },
    keyPerks: [
      'Unlimited 3% Cash Back on Dining',
      'Unlimited 3% Cash Back on Grocery Stores',
      'Unlimited 3% on Entertainment & Popular Streaming',
      '$0 Annual Fee + 0% Foreign Transaction Fees',
    ],
  },
  {
    id: 'citi-double-match',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    network: 'mastercard',
    annualFee: 0,
    annualCredits: 0,
    creditDetails: 'No annual fee to offset',
    colorHex: '#0284c7',
    bestFor: 'Flat 2% Cash Back on Every Single Purchase',
    isStarterFriendly: true,
    pointValuationCents: 1.0,
    multipliers: {
      dining: 2,
      groceries: 2,
      travel: 2,
      streamingAndBills: 2,
      shoppingAndRetail: 2,
      gas: 2,
      rent: 2,
      baseline: 2,
    },
    keyPerks: [
      '1% when you buy + 1% as you pay',
      'Simple, guaranteed 2% cash back everywhere',
      'No category tracking or activation needed',
      '$0 Annual Fee',
    ],
  },
  {
    id: 'blue-cash-everyday-match',
    name: 'Blue Cash Everyday from Amex',
    issuer: 'American Express',
    network: 'amex',
    annualFee: 0,
    annualCredits: 84, // $7/mo Disney bundle credit ($84/yr)
    creditDetails: '$84 Disney Bundle credit ($7 back per month)',
    colorHex: '#2563eb',
    bestFor: 'US Supermarkets, Online Retail & Gas',
    isStarterFriendly: true,
    pointValuationCents: 1.0,
    multipliers: {
      dining: 1,
      groceries: 3,
      travel: 1,
      streamingAndBills: 1,
      shoppingAndRetail: 3, // US Online Retail
      gas: 3,
      rent: 1,
      baseline: 1,
    },
    caps: {
      groceriesCapAnnual: 6000,
      onlineRetailCapAnnual: 6000,
      gasCapAnnual: 6000,
    },
    keyPerks: [
      '3% Cash Back at US Supermarkets (up to $6k/yr)',
      '3% Cash Back on US Online Retail (up to $6k/yr)',
      '3% Cash Back at US Gas Stations (up to $6k/yr)',
      '$0 Annual Fee + $84 Disney Bundle Credit',
    ],
  },
  {
    id: 'bilt-mastercard-match',
    name: 'Bilt World Elite Mastercard',
    issuer: 'Wells Fargo',
    network: 'mastercard',
    annualFee: 0,
    annualCredits: 0,
    creditDetails: 'No transaction fee on apartment rent',
    colorHex: '#18181b',
    bestFor: 'Renters (Earn Points on Rent with Zero Fees)',
    isStarterFriendly: true,
    pointValuationCents: 1.25,
    multipliers: {
      dining: 3,
      groceries: 1,
      travel: 2,
      streamingAndBills: 1,
      shoppingAndRetail: 1,
      gas: 1,
      rent: 1, // 1x points on rent!
      baseline: 1,
    },
    keyPerks: [
      '1x points on Rent payments with $0 fee (up to 100k/yr)',
      '3x points on Dining worldwide',
      '2x points on Travel bookings',
      'Double points on Rent Day (1st of the month)',
    ],
  },
  {
    id: 'capital-one-venture-x-match',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    network: 'visa',
    annualFee: 395,
    annualCredits: 400, // $300 travel credit + 10,000 anniversary bonus miles ($100 value)
    creditDetails: '$300 annual travel credit + 10,000 anniversary bonus miles ($100 value)',
    colorHex: '#334155',
    bestFor: 'Premium Travel, Airport Lounges & Flat 2x Miles',
    isStarterFriendly: false,
    pointValuationCents: 1.2,
    multipliers: {
      dining: 2,
      groceries: 2,
      travel: 5, // Flights & hotels via portal
      streamingAndBills: 2,
      shoppingAndRetail: 2,
      gas: 2,
      rent: 1,
      baseline: 2,
    },
    keyPerks: [
      'Unlimited 2x miles on every purchase everywhere',
      '10x miles on Hotels & Rental Cars via Capital One Travel',
      '5x miles on Flights via Capital One Travel',
      'Unlimited Lounge access (Capital One & Priority Pass)',
    ],
  },
];

/**
 * Deterministically computes the annual rewards, fee offsets, and net value
 * of a given catalog card for a specific monthly spending profile.
 */
export function calculateCardMatch(
  card: CatalogCard,
  profile: MonthlySpendingProfile
): CardMatchResult {
  const annualDining = profile.dining * 12;
  const annualGroceries = profile.groceries * 12;
  const annualTravel = profile.travel * 12;
  const annualStreaming = profile.streamingAndBills * 12;
  const annualRetail = profile.shoppingAndRetail * 12;
  const annualGas = profile.gas * 12;
  const annualRent = profile.rent * 12;

  const totalAnnualSpend =
    annualDining +
    annualGroceries +
    annualTravel +
    annualStreaming +
    annualRetail +
    annualGas +
    annualRent;

  // Handle category spending caps if card has them
  let eligibleGroceries = annualGroceries;
  let excessGroceries = 0;
  if (card.caps?.groceriesCapAnnual && annualGroceries > card.caps.groceriesCapAnnual) {
    eligibleGroceries = card.caps.groceriesCapAnnual;
    excessGroceries = annualGroceries - card.caps.groceriesCapAnnual;
  }

  let eligibleRetail = annualRetail;
  let excessRetail = 0;
  if (card.caps?.onlineRetailCapAnnual && annualRetail > card.caps.onlineRetailCapAnnual) {
    eligibleRetail = card.caps.onlineRetailCapAnnual;
    excessRetail = annualRetail - card.caps.onlineRetailCapAnnual;
  }

  let eligibleGas = annualGas;
  let excessGas = 0;
  if (card.caps?.gasCapAnnual && annualGas > card.caps.gasCapAnnual) {
    eligibleGas = card.caps.gasCapAnnual;
    excessGas = annualGas - card.caps.gasCapAnnual;
  }

  // Calculate annual points per category
  const diningPoints = annualDining * card.multipliers.dining;
  const groceriesPoints =
    eligibleGroceries * card.multipliers.groceries + excessGroceries * card.multipliers.baseline;
  const travelPoints = annualTravel * card.multipliers.travel;
  const streamingPoints = annualStreaming * card.multipliers.streamingAndBills;
  const retailPoints =
    eligibleRetail * card.multipliers.shoppingAndRetail + excessRetail * card.multipliers.baseline;
  const gasPoints =
    eligibleGas * card.multipliers.gas + excessGas * card.multipliers.baseline;
  const rentPoints = Math.min(100000, annualRent * card.multipliers.rent);

  const totalPoints =
    diningPoints +
    groceriesPoints +
    travelPoints +
    streamingPoints +
    retailPoints +
    gasPoints +
    rentPoints;

  // Calculate gross dollar value based on point valuation
  const pointValueRate = (card.pointValuationCents || 1.0) / 100;
  const diningDollars = diningPoints * pointValueRate;
  const groceriesDollars = groceriesPoints * pointValueRate;
  const travelDollars = travelPoints * pointValueRate;
  const streamingDollars = streamingPoints * pointValueRate;
  const retailDollars = retailPoints * pointValueRate;
  const gasDollars = gasPoints * pointValueRate;
  const rentDollars = rentPoints * pointValueRate;

  const grossRewardsDollars = totalPoints * pointValueRate;

  // Net annual profit = gross rewards + credits - fee
  const creditsApplied = Math.min(card.annualCredits, card.annualFee > 0 ? card.annualFee : card.annualCredits);
  const netAnnualValueDollars = grossRewardsDollars + creditsApplied - card.annualFee;

  // Debit card comparison (debit yields $0)
  const gainVersusDebit = netAnnualValueDollars;

  // Standard flat 1.5% comparison
  const standardFlatRateValue = totalAnnualSpend * 0.015;
  const gainVersusFlatRate = netAnnualValueDollars - standardFlatRateValue;

  // Top category determination
  const categoryYields = [
    { cat: 'Dining', dollars: diningDollars },
    { cat: 'Groceries', dollars: groceriesDollars },
    { cat: 'Travel', dollars: travelDollars },
    { cat: 'Streaming & Bills', dollars: streamingDollars },
    { cat: 'Shopping & Retail', dollars: retailDollars },
    { cat: 'Gas & Fuel', dollars: gasDollars },
    { cat: 'Rent', dollars: rentDollars },
  ];
  categoryYields.sort((a, b) => b.dollars - a.dollars);
  const topEarningCategory = categoryYields[0].cat;

  // Generate specific recommendation rationale
  let recommendationReason = '';
  if (card.id.includes('gold')) {
    recommendationReason = `Your monthly food spending ($${profile.dining} dining + $${profile.groceries} groceries) earns ${(diningPoints + groceriesPoints).toLocaleString()} Amex points/yr ($${(diningDollars + groceriesDollars).toFixed(2)} value), easily eclipsing the $250 fee.`;
  } else if (card.id.includes('sapphire')) {
    recommendationReason = `Captures 3x points on dining ($${annualDining}) & streaming ($${annualStreaming}) plus 2x on travel ($${annualTravel}) with high 1.25¢ redemption power on flights and hotels.`;
  } else if (card.id.includes('savor')) {
    recommendationReason = `Zero annual fee powerhouse earning 3% unlimited cash back across all dining, groceries, and streaming without paying a single dollar in maintenance fees.`;
  } else if (card.id.includes('double')) {
    recommendationReason = `Guaranteed 2% return on all $${totalAnnualSpend.toLocaleString()} of your annual spending, providing top cash back for non-category retail and general expenses.`;
  } else if (card.id.includes('blue-cash')) {
    recommendationReason = `3% cash back across US supermarkets ($${annualGroceries}), gas ($${annualGas}), and online shopping ($${annualRetail}) with $0 annual fee.`;
  } else if (card.id.includes('bilt')) {
    recommendationReason = `Unlocks points on your $${profile.rent}/mo rent payment without convenience fees, turning housing overhead into ${(rentPoints).toLocaleString()} points per year.`;
  } else if (card.id.includes('venture-x')) {
    recommendationReason = `Effective -$5 fee ($395 fee offset by $300 travel credit + 10k miles) gives you flat 2x miles everywhere and free airport lounge access.`;
  } else {
    recommendationReason = `Strong match providing $${netAnnualValueDollars.toFixed(2)} in net value per year based on your spending distribution.`;
  }

  return {
    card,
    matchScore: 0, // Assigned relative to peers below
    annualSpendTotal: totalAnnualSpend,
    annualGrossRewardsDollars: grossRewardsDollars,
    annualCreditsApplied: creditsApplied,
    annualFee: card.annualFee,
    netAnnualValueDollars,
    pointsEarnedAnnual: totalPoints,
    monthlyAverageRewards: netAnnualValueDollars / 12,
    gainVersusDebit,
    gainVersusFlatRate,
    topEarningCategory,
    categoryBreakdownAnnual: {
      dining: diningDollars,
      groceries: groceriesDollars,
      travel: travelDollars,
      streamingAndBills: streamingDollars,
      shoppingAndRetail: retailDollars,
      gas: gasDollars,
      rent: rentDollars,
    },
    recommendationReason,
  };
}

/**
 * Matches and ranks all cards in the catalog against the user's spending profile.
 * Computes calibrated match scores (e.g. 98% for winner, down to 60%).
 */
export function matchCardsForProfile(
  profile: MonthlySpendingProfile,
  filterNoAnnualFeeOnly: boolean = false
): CardMatchResult[] {
  let cards = CARD_CATALOG;
  if (filterNoAnnualFeeOnly) {
    cards = cards.filter((c) => c.annualFee === 0);
  }

  const results = cards.map((c) => calculateCardMatch(c, profile));

  // Sort by net annual value descending
  results.sort((a, b) => b.netAnnualValueDollars - a.netAnnualValueDollars);

  // Normalize match scores (winner gets 98%, subsequent scaled)
  const maxNet = results[0]?.netAnnualValueDollars || 1;
  const minNet = results[results.length - 1]?.netAnnualValueDollars || 0;
  const spread = Math.max(1, maxNet - minNet);

  return results.map((r, idx) => {
    let score = 98;
    if (idx > 0) {
      const ratio = (r.netAnnualValueDollars - minNet) / spread;
      score = Math.max(55, Math.round(65 + ratio * 30));
    }
    return {
      ...r,
      matchScore: score,
    };
  });
}

/**
 * Converts a matched catalog card into an enrolled CreditCard format
 * so the user can immediately add it to their RocketRewards wallet.
 */
export function convertCatalogCardToCreditCard(card: CatalogCard): CreditCard {
  return {
    id: `${card.id}-${Date.now().toString().slice(-4)}`,
    name: card.name,
    issuer: card.issuer,
    last4: Math.floor(1000 + Math.random() * 9000).toString(),
    network: card.network,
    balance: 0.0,
    creditLimit: card.annualFee > 0 ? 10000.0 : 6000.0,
    statementCloseDate: 'Nov 18',
    statementCloseDays: 14,
    paymentDueDate: 'Dec 13',
    paymentDueDays: 39,
    colorHex: card.colorHex,
    multiplierCategories: [
      {
        category: 'Top Matched Category',
        multiplier: Math.max(...Object.values(card.multipliers)),
        description: card.bestFor,
      },
      {
        category: 'All other purchases',
        multiplier: card.multipliers.baseline,
        description: `${card.multipliers.baseline}x base rate`,
      },
    ],
    activeCredits:
      card.annualCredits > 0
        ? [
            {
              id: `credit-${card.id}`,
              title: card.creditDetails,
              amount: Math.round(card.annualCredits / 12),
              remaining: Math.round(card.annualCredits / 12),
              expirationDate: 'Nov 30',
              daysLeft: 26,
              category: 'Welcome Credit',
            },
          ]
        : undefined,
  };
}
