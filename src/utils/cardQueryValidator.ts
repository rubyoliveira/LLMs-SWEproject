/**
 * Card Query Validation Engine
 * 
 * Enforces requirement:
 * Each question needs to have at least ONE of the following 3 criteria:
 * 1. A definitive category (dining, shopping, donating, groceries, travel, bills, etc.)
 * 2. A store or name of restaurant or something similar (lowes, target, shake shack, burger king, sephora, etc.)
 * 3. A numerical money value or phrase that dictates the use of money ("can i buy", $25, etc.)
 * 
 * Failsafe catches any phrase that does not make sense for card recommendations (e.g., "i have an exam today").
 */

export interface QueryValidationResult {
  isValid: boolean;
  userPrompt: string;
  hasCategory: boolean;
  hasMerchant: boolean;
  hasMoneyOrIntent: boolean;
  matchedCriteriaCount: number;
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

// 1. DEFINITIVE CATEGORIES (bonus and non-bonus categories)
export const CATEGORY_KEYWORDS: { [key: string]: string } = {
  // Dining & Restaurants
  'dining': 'Dining & Restaurants',
  'dinner': 'Dining & Restaurants',
  'lunch': 'Dining & Restaurants',
  'breakfast': 'Dining & Restaurants',
  'brunch': 'Dining & Restaurants',
  'supper': 'Dining & Restaurants',
  'snack': 'Dining & Restaurants',
  'snacks': 'Dining & Restaurants',
  'food': 'Dining & Restaurants',
  'eat': 'Dining & Restaurants',
  'eating': 'Dining & Restaurants',
  'restaurant': 'Dining & Restaurants',
  'restaurants': 'Dining & Restaurants',
  'fast food': 'Dining & Restaurants',
  'cafe': 'Dining & Restaurants',
  'coffee': 'Dining & Restaurants',
  'bakery': 'Dining & Restaurants',
  'bakeries': 'Dining & Restaurants',
  'bar': 'Dining & Restaurants',
  'drinks': 'Dining & Restaurants',
  'takeout': 'Dining & Restaurants',
  'delivery': 'Dining & Restaurants',
  'burger': 'Dining & Restaurants',
  'burgers': 'Dining & Restaurants',
  'pizza': 'Dining & Restaurants',
  'taco': 'Dining & Restaurants',
  'tacos': 'Dining & Restaurants',
  'sushi': 'Dining & Restaurants',
  'ice cream': 'Dining & Restaurants',

  // Groceries & Supermarkets
  'grocery': 'Groceries & Supermarkets',
  'groceries': 'Groceries & Supermarkets',
  'supermarket': 'Groceries & Supermarkets',
  'supermarkets': 'Groceries & Supermarkets',
  'market': 'Groceries & Supermarkets',
  'produce': 'Groceries & Supermarkets',

  // Shopping & Retail
  'shopping': 'Shopping & Retail',
  'retail': 'Shopping & Retail',
  'clothes': 'Shopping & Retail',
  'clothing': 'Shopping & Retail',
  'apparel': 'Shopping & Retail',
  'shoes': 'Shopping & Retail',
  'running shoes': 'Shopping & Retail',
  'electronic': 'Electronics & Tech',
  'electronics': 'Electronics & Tech',
  'gadget': 'Electronics & Tech',
  'gadgets': 'Electronics & Tech',
  'headphones': 'Electronics & Tech',
  'laptop': 'Electronics & Tech',
  'phone case': 'Electronics & Tech',
  'hardware': 'Home & Hardware',
  'hardware store': 'Home & Hardware',
  'department store': 'Department Store',
  'home improvement': 'Home Improvement',
  'furniture': 'Home & Furniture',
  'makeup': 'Beauty & Cosmetics',
  'cosmetics': 'Beauty & Cosmetics',
  'skincare': 'Beauty & Cosmetics',
  'books': 'Books & Media',
  'sports equipment': 'Sports & Fitness',
  'sports': 'Sports & Fitness',
  'camping gear': 'Outdoors & Camping',
  'camping': 'Outdoors & Camping',
  'flowers': 'Flowers & Gifts',
  'flower': 'Flowers & Gifts',
  'florist': 'Flowers & Gifts',
  'holiday decorations': 'Home & Holiday',
  'decorations': 'Home & Holiday',
  'wedding gift': 'Gifts & Celebrations',
  'birthday gift': 'Gifts & Celebrations',
  'gift': 'Gifts & Celebrations',
  'gifts': 'Gifts & Celebrations',
  'office supplies': 'Office & Business Supplies',
  'school supplies': 'School & Student Supplies',
  'household cleaners': 'Household & Cleaning',
  'cleaners': 'Household & Cleaning',

  // Donating, Charity & Religious (Non-Category Purchases)
  'donating': 'Donations & Charity',
  'donation': 'Donations & Charity',
  'donations': 'Donations & Charity',
  'donate': 'Donations & Charity',
  'donated': 'Donations & Charity',
  'charity': 'Donations & Charity',
  'charities': 'Donations & Charity',
  'charitable': 'Donations & Charity',
  'church': 'Donations & Religious',
  'tithe': 'Donations & Tithing',
  'tithing': 'Donations & Tithing',
  'offering': 'Donations & Religious',
  'synagogue': 'Donations & Religious',
  'mosque': 'Donations & Religious',
  'temple': 'Donations & Religious',
  'nonprofit': 'Non-Profit Organization',
  'non-profit': 'Non-Profit Organization',
  'philanthropy': 'Donations & Charity',
  'pledge': 'Donations & Charity',

  // Travel, Flights & Transit
  'travel': 'Travel & Transit',
  'traveling': 'Travel & Transit',
  'flight': 'Flights & Airlines',
  'flights': 'Flights & Airlines',
  'airline': 'Flights & Airlines',
  'airlines': 'Flights & Airlines',
  'airline tickets': 'Flights & Airlines',
  'hotel': 'Hotels & Lodging',
  'hotels': 'Hotels & Lodging',
  'motel': 'Hotels & Lodging',
  'airbnb': 'Hotels & Lodging',
  'lodging': 'Hotels & Lodging',
  'transit': 'Transit & Commute',
  'train': 'Transit & Commute',
  'train ticket': 'Transit & Commute',
  'subway': 'Transit & Commute',
  'bus': 'Transit & Commute',
  'metro': 'Transit & Commute',
  'ferry': 'Ferry & Marine Transit',
  'ferry ticket': 'Ferry & Marine Transit',
  'toll road': 'Tolls & Highways',
  'toll': 'Tolls & Highways',
  'tolls': 'Tolls & Highways',
  'parking meter': 'Parking & Meters',
  'parking': 'Parking & Meters',
  'rideshare': 'Rideshare & Taxis',
  'ride': 'Rideshare & Taxis',
  'taxi': 'Rideshare & Taxis',
  'cab': 'Rideshare & Taxis',
  'car rental': 'Rental Cars',
  'rental car': 'Rental Cars',
  'currency exchange': 'Travel Currency Exchange',
  'gas': 'Gas & Fuel',
  'fuel': 'Gas & Fuel',

  // Bills, Utilities & Subscriptions
  'bill': 'Bills & Utilities',
  'bills': 'Bills & Utilities',
  'utility': 'Bills & Utilities',
  'utilities': 'Bills & Utilities',
  'electric': 'Utilities (Electric)',
  'electricity': 'Utilities (Electric)',
  'water bill': 'Utilities (Water)',
  'gas bill': 'Utilities (Gas)',
  'wifi': 'Internet & Wifi',
  'internet': 'Internet & Wifi',
  'internet bill': 'Internet & Wifi',
  'cable': 'Cable & TV',
  'streaming': 'Streaming Subscriptions',
  'streaming subscription': 'Streaming Subscriptions',
  'subscription': 'Digital Subscriptions',
  'subscriptions': 'Digital Subscriptions',
  'subscription renewal': 'Digital Subscriptions',
  'software': 'Software & Cloud Services',
  'software license': 'Software & Cloud Services',
  'cloud storage': 'Software & Cloud Services',
  'phone bill': 'Phone & Wireless',
  'cellular': 'Phone & Wireless',

  // Entertainment & Recreation
  'entertainment': 'Entertainment',
  'movie': 'Entertainment & Cinema',
  'movies': 'Entertainment & Cinema',
  'movie tickets': 'Entertainment & Cinema',
  'cinema': 'Entertainment & Cinema',
  'theater': 'Entertainment & Arts',
  'theatre': 'Entertainment & Arts',
  'concert': 'Live Events & Concerts',
  'concert tickets': 'Live Events & Concerts',
  'tickets': 'Events & Ticketing',
  'museum': 'Museums & Culture',
  'museum admission': 'Museums & Culture',
  'theme park': 'Amusement & Theme Parks',
  'amusement park': 'Amusement & Theme Parks',
  'video game': 'Gaming & Digital Downloads',
  'game credits': 'Gaming & Digital Downloads',
  'digital download': 'Digital Downloads & Media',
  'e-book': 'Books & Digital Media',
  'ebook': 'Books & Digital Media',

  // Personal Care, Services, Health & Education
  'haircut': 'Personal Care & Salons',
  'barber': 'Personal Care & Salons',
  'nail salon': 'Personal Care & Salons',
  'massage': 'Health & Wellness (Spa)',
  'spa': 'Health & Wellness (Spa)',
  'car wash': 'Auto Services & Car Wash',
  'car repair': 'Auto Services & Repair',
  'oil change': 'Auto Services & Maintenance',
  'laundry': 'Laundry & Dry Cleaning',
  'laundromat': 'Laundry & Dry Cleaning',
  'childcare': 'Family & Childcare',
  'daycare': 'Family & Childcare',
  'babysitter': 'Family & Childcare',
  'school lunch': 'School & Dining',
  'seasonal produce': 'Groceries & Farmers Markets',
  'farmers market': 'Groceries & Farmers Markets',
  'vending machine': 'Convenience & Vending',
  'pharmacy': 'Pharmacy & Health',
  'medicine': 'Pharmacy & Health',
  'prescriptions': 'Pharmacy & Health',
  'over-the-counter': 'Pharmacy & Health',
  'dentist': 'Dental & Healthcare',
  'dentist visit': 'Dental & Healthcare',
  'doctor': 'Medical & Healthcare',
  'doctor copay': 'Medical & Healthcare',
  'vet visit': 'Veterinary & Pet Care',
  'pet food': 'Pet Supplies & Food',
  'medical': 'Medical & Healthcare',
  'gym': 'Fitness & Gyms',
  'fitness': 'Fitness & Gyms',
  'gym membership': 'Fitness & Gyms',
  'tuition': 'Education & Tuition',
  'tuition payment': 'Education & Tuition',
  'tax': 'Taxes & Government',
  'taxes': 'Taxes & Government',
  'tax payment': 'Taxes & Government',
  'dmv': 'Government & DMV Fees',
  'mortgage': 'Mortgage & Housing',
  'mortgage payment': 'Mortgage & Housing',
  'rent': 'Rent & Housing',
  'insurance': 'Insurance & Coverage',
  'insurance premium': 'Insurance & Coverage',
  'repair': 'Auto & Home Repair',
};

// 2. STORE, RESTAURANT OR MERCHANT NAMES
export const MERCHANT_KEYWORDS: string[] = [
  // Fast Food & Dining
  'shake shack',
  'burger king',
  'mcdonalds',
  'mcdonald\'s',
  'mcdonald',
  'wendys',
  'wendy\'s',
  'taco bell',
  'chick-fil-a',
  'chick fil a',
  'subway',
  'in-n-out',
  'five guys',
  'chipotle',
  'sweetgreen',
  'starbucks',
  'dunkin',
  'panera',
  'dominos',
  'domino\'s',
  'pizza hut',
  'olive garden',
  'nobu',
  'cheesecake factory',
  'popeyes',
  'panda express',

  // Retail & Stores
  'lowes',
  'lowe\'s',
  'home depot',
  'target',
  'walmart',
  'sephora',
  'ulta',
  'best buy',
  'apple',
  'amazon',
  'nike',
  'adidas',
  'zara',
  'h&m',
  'nordstrom',
  'macy\'s',
  'macys',
  'kohls',
  'kohl\'s',
  'tj maxx',
  'marshalls',
  'gap',
  'old navy',
  'lululemon',
  'costco',
  'sam\'s club',
  'sams club',
  'ikea',
  'cvs',
  'walgreens',
  'rite aid',
  '7-eleven',
  'seven eleven',
  'wawa',
  'sheetz',
  'shack shop',

  // Supermarkets
  'whole foods',
  'trader joe\'s',
  'trader joes',
  'trader joe',
  'kroger',
  'safeway',
  'aldi',
  'h-mart',
  'hmart',
  'wegmans',
  'publix',

  // Airlines & Rides
  'delta',
  'united',
  'american airlines',
  'southwest',
  'jetblue',
  'alaska airlines',
  'uber',
  'lyft',
  'airbnb',
  'marriott',
  'hilton',
  'hyatt',
  'expedia',
  'booking.com',
  'booking',

  // Gas & Service
  'shell',
  'chevron',
  'exxon',
  'bp',
  'mobil',
];

// Generic merchant descriptors
const GENERIC_MERCHANT_REGEX = /\b(store|stores|shop|shops|restaurant|restaurants|cafe|cafes|diner|diners|supermarket|supermarkets|bakery|bakeries|boutique|boutiques|outlet|outlets|mall|malls|pizzeria|pizzerias|bistro|steakhouse|pub|eatery|grocer|pharmacy|pharmacies|gas station|dealership|hotel|hotels|motel|motels|airline|airlines)\b/i;

// 3. MONEY INTENT PHRASES
const MONEY_INTENT_PATTERNS = [
  /\bcan i buy\b/i,
  /\bcan i afford\b/i,
  /\bshould i buy\b/i,
  /\bwant to buy\b/i,
  /\btrying to buy\b/i,
  /\blooking to buy\b/i,
  /\bhow to buy\b/i,
  /\bbuy(?:ing|s)?\b/i,
  /\bpurchas(?:e|es|ed|ing)?\b/i,
  /\bspend(?:s|ing|t)?\b/i,
  /\bafford(?:s|ing|able)?\b/i,
  /\bcosts?\b/i,
  /\bpriced?\b/i,
  /\b(?:pay|paying|pays|payment|paid)\b/i,
  /\bwhich card\b/i,
  /\bwhat card\b/i,
  /\bbest card\b/i,
  /\bwhich credit card\b/i,
  /\b(?:credit|debit|prepaid|virtual|rewards)\s+card\b/i,
  /\bswipe(?:s|d|ing)?\b/i,
  /\bcharge(?:s|d|ing)?\b/i,
  /\border(?:ing|s|ed)?\b/i,
  /\bcheckout\b/i,
  /\bbudget(?:s|ing)?\b/i,
  /\bsplurge\b/i,
  /\bcard\b/i,
  /\bfunds\b/i,
  /\bcash\b/i,
  /\bmobile pay\b/i,
  /\bmobile wallet\b/i,
  /\bpoints\b/i,
  /\bmiles\b/i,
  /\bcryptocurrency\b/i,
];

// Explicit Anomaly Patterns (Non-purchases, hardware errors, fantasy concepts)
export const EXPLICIT_ANOMALY_PATTERNS = [
  /cloud made of cheese/i,
  /damaged chip/i,
  /payment terminal is offline/i,
  /purchase was reversed/i,
  /purchase is fully reimbursed/i,
  /purchase requiring manual entry/i,
  /warehouse club sells gas and food/i,
  /exam today/i,
  /what('s| is) the weather/i,
  /hello/i,
  /how are you/i,
];

// 3. NUMERICAL MONEY VALUES
const NUMERICAL_MONEY_PATTERNS = [
  // $25, $100.50, $ 45
  /\$\s*\d+(?:\.\d{1,2})?/,
  // 25 dollars, 100 bucks, 50 cents, 20 usd
  /\b\d+(?:\.\d{1,2})?\s*(?:dollars?|bucks?|cents?|usd)\b/i,
  // "for 25", "costing 180", "price of 50"
  /\b(?:for|costing|spend|spending|amount|price|at)\s+\$?\d+(?:\.\d{1,2})?\b/i,
  // 5k, 1 grand
  /\b\d+\s*(?:k|grand)\b/i,
];

/**
 * Validates a user query against the 3 required criteria.
 * Returns isValid = true if at least ONE criterion is present and not an anomaly.
 * Returns isValid = false with detailed failsafe explanation if all 3 are missing or query is an anomaly.
 */
export function validateCardQuery(rawPrompt: string): QueryValidationResult {
  const prompt = (rawPrompt || '').trim();
  const lower = prompt.toLowerCase();

  // Immediate anomaly / non-purchase check
  for (const anomaly of EXPLICIT_ANOMALY_PATTERNS) {
    if (anomaly.test(lower)) {
      return {
        isValid: false,
        userPrompt: prompt,
        hasCategory: false,
        hasMerchant: false,
        hasMoneyOrIntent: false,
        matchedCriteriaCount: 0,
        failsafeMessage: `We flagged "${prompt}" because it describes an operational event, hardware error, or non-card phrase rather than an actionable credit card purchase question.`,
        suggestedQueries: [
          {
            label: 'Shake Shack · $24',
            query: 'Ordering lunch at Shake Shack for $24. Which card should I swipe?',
            type: 'merchant',
            description: 'Store + Category + Amount (All 3)',
          },
          {
            label: 'Lowe\'s Shopping',
            query: 'Shopping at Lowe\'s for home supplies',
            type: 'merchant',
            description: 'Store & Retail Category',
          },
          {
            label: 'Church Donation · $50',
            query: 'Donating $50 to church',
            type: 'category',
            description: 'Category (Donations) & Amount',
          },
          {
            label: 'Can I buy $180 headphones?',
            query: 'Can I buy $180 headphones? My card has a $500 limit.',
            type: 'money',
            description: 'Spend intent & Money limit check',
          },
        ],
      };
    }
  }

  let hasCategory = false;
  let detectedCategory: string | undefined;

  let hasMerchant = false;
  let detectedMerchant: string | undefined;

  let hasMoneyOrIntent = false;
  let detectedMoneyOrIntent: string | undefined;

  // 1. Check Definitive Category
  for (const [kw, catName] of Object.entries(CATEGORY_KEYWORDS)) {
    // Word boundary match to prevent false positives (e.g. "exam" matching "ex")
    const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      hasCategory = true;
      detectedCategory = catName;
      break;
    }
  }

  // 2. Check Store or Restaurant Name
  for (const merchant of MERCHANT_KEYWORDS) {
    if (lower.includes(merchant)) {
      hasMerchant = true;
      detectedMerchant = merchant.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }
  if (!hasMerchant && GENERIC_MERCHANT_REGEX.test(lower)) {
    const match = lower.match(GENERIC_MERCHANT_REGEX);
    hasMerchant = true;
    detectedMerchant = match ? match[0].charAt(0).toUpperCase() + match[0].slice(1) : 'Store / Merchant';
  }

  // 3. Check Numerical Money Value or Spending Intent
  // 3a. Numerical money value
  for (const pattern of NUMERICAL_MONEY_PATTERNS) {
    const match = prompt.match(pattern);
    if (match) {
      hasMoneyOrIntent = true;
      detectedMoneyOrIntent = match[0];
      break;
    }
  }

  // 3b. Spending intent phrase
  if (!hasMoneyOrIntent) {
    for (const pattern of MONEY_INTENT_PATTERNS) {
      const match = prompt.match(pattern);
      if (match) {
        hasMoneyOrIntent = true;
        detectedMoneyOrIntent = match[0];
        break;
      }
    }
  }

  const matchedCriteriaCount = (hasCategory ? 1 : 0) + (hasMerchant ? 1 : 0) + (hasMoneyOrIntent ? 1 : 0);
  const isValid = matchedCriteriaCount >= 1;

  const failsafeMessage = isValid
    ? 'Query contains valid purchase or financial parameters.'
    : `We couldn't detect a purchase or card question in "${prompt}". To get a card recommendation or check safe spend limits, your question needs at least a category, a store/restaurant, or a dollar amount.`;

  const suggestedQueries = [
    {
      label: 'Shake Shack · $24',
      query: 'Ordering lunch at Shake Shack for $24. Which card should I swipe?',
      type: 'merchant' as const,
      description: 'Store + Category + Amount (All 3)',
    },
    {
      label: 'Lowe\'s Shopping',
      query: 'Shopping at Lowe\'s for home supplies',
      type: 'merchant' as const,
      description: 'Store & Retail Category',
    },
    {
      label: 'Church Donation · $50',
      query: 'Donating $50 to church',
      type: 'category' as const,
      description: 'Category (Donations) & Amount',
    },
    {
      label: 'Can I buy $180 headphones?',
      query: 'Can I buy $180 headphones? My card has a $500 limit.',
      type: 'money' as const,
      description: 'Spend intent & Money limit check',
    },
    {
      label: 'Dining out tonight',
      query: 'Which card gives the best rewards for dining out?',
      type: 'category' as const,
      description: 'Definitive Category (Dining)',
    },
    {
      label: 'Target $45',
      query: 'Spending $45 at Target',
      type: 'merchant' as const,
      description: 'Store & Numerical Dollar Amount',
    },
  ];

  return {
    isValid,
    userPrompt: prompt,
    hasCategory,
    hasMerchant,
    hasMoneyOrIntent,
    matchedCriteriaCount,
    detectedCategory,
    detectedMerchant,
    detectedMoneyOrIntent,
    failsafeMessage,
    suggestedQueries,
  };
}
