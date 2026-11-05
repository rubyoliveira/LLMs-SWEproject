/**
 * RocketRewards TDD Automated Test Suite
 * Contains all 28 Unit Assertions covering leap-years, negative balances,
 * MCC edge cases, safe-spend guardrails, annual credits, and NLP failsafes.
 */

import {
  calculateStatementDueDates,
  evaluateSafeSpendGuardrail,
  resolveMerchantMcc,
  applyCategorySpendingCaps,
  calculatePointsWithCaps,
  calculateCardMatch,
  calculateBestCardSwipe,
  validateNaturalLanguageQuery,
} from './tddEngine';

export interface TddTestCase {
  id: number;
  name: string;
  domain:
    | 'Leap Year & Calendar'
    | 'Negative Balances & Ledger'
    | 'MCC & Category Exclusions'
    | 'Safe-Spend & Credit Health'
    | 'Annual Credits & Precision'
    | 'NLP Failsafes & Routing';
  description: string;
  codeSnippet: string;
  expectedRedFailure: string;
  runGreen: () => { passed: boolean; message: string; details?: any };
}

export const TDD_TEST_SUITE: TddTestCase[] = [
  // 1. Leap Year & Calendar
  {
    id: 1,
    name: 'Leap-Year February 29 Statement Close',
    domain: 'Leap Year & Calendar',
    description: 'Statement closing on Feb 28 in a leap year (2024) must correctly advance to Feb 29.',
    codeSnippet: `const { closeDate } = calculateStatementDueDates(new Date(2024, 1, 15), 29);
assert(closeDate === "2024-02-29");`,
    expectedRedFailure: 'ValueError: day out of range for month or rolled to March 1',
    runGreen: () => {
      const res = calculateStatementDueDates(new Date(2024, 1, 15), 29);
      const passed = res.closeDate === '2024-02-29';
      return {
        passed,
        message: passed ? 'Successfully recognized Feb 29 leap day in 2024' : `Got ${res.closeDate}`,
        details: res,
      };
    },
  },
  {
    id: 2,
    name: 'Non-Leap Year February 28 Date Clamping',
    domain: 'Leap Year & Calendar',
    description: 'A 31st statement day in a non-leap year (2025) must clamp to Feb 28.',
    codeSnippet: `const { closeDate } = calculateStatementDueDates(new Date(2025, 1, 10), 31);
assert(closeDate === "2025-02-28");`,
    expectedRedFailure: 'ValueError: day out of range for month',
    runGreen: () => {
      const res = calculateStatementDueDates(new Date(2025, 1, 10), 31);
      const passed = res.closeDate === '2025-02-28';
      return {
        passed,
        message: passed ? 'Clamped 31st day to Feb 28 in non-leap year' : `Got ${res.closeDate}`,
        details: res,
      };
    },
  },
  {
    id: 3,
    name: 'Grace Period Calculation Crossing Leap Day',
    domain: 'Leap Year & Calendar',
    description: '25-day grace period starting Feb 15 in leap year 2024 must land exactly on March 11.',
    codeSnippet: `const { dueDate } = calculateStatementDueDates(new Date(2024, 1, 10), 15, 25);
assert(dueDate === "2024-03-11");`,
    expectedRedFailure: 'AssertionError: assert "2024-03-12" == "2024-03-11"',
    runGreen: () => {
      const res = calculateStatementDueDates(new Date(2024, 1, 10), 15, 25);
      const passed = res.dueDate === '2024-03-11';
      return {
        passed,
        message: passed ? 'Accurately accounted for 29th day in grace arithmetic' : `Got ${res.dueDate}`,
        details: res,
      };
    },
  },
  {
    id: 4,
    name: 'Weekend Due Date Adjustment (CARD Act)',
    domain: 'Leap Year & Calendar',
    description: 'Due date falling on Sunday must roll forward to Monday under CARD Act compliance.',
    codeSnippet: `const res = calculateStatementDueDates(new Date(2024, 4, 1), 7, 25);
assert(res.weekdayName !== "Sunday" && res.weekdayName !== "Saturday");`,
    expectedRedFailure: 'AssertionError: Due date fell on Sunday (no ACH processing)',
    runGreen: () => {
      const res = calculateStatementDueDates(new Date(2024, 4, 1), 7, 25);
      const passed = res.weekdayName !== 'Sunday' && res.weekdayName !== 'Saturday';
      return {
        passed,
        message: passed ? `Rolled Sunday due date forward to ${res.weekdayName}` : `Landed on ${res.weekdayName}`,
        details: res,
      };
    },
  },

  // 2. Negative Balances & Ledger
  {
    id: 5,
    name: 'Negative Balance Minimum Payment Suppression',
    domain: 'Negative Balances & Ledger',
    description: 'A -$84.50 credit balance from returns must set minimum payment due to $0.00.',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(-84.50, 500, 50, 600);
assert(res.minPaymentDue === 0.0 && res.postPurchaseBalance === -34.50);`,
    expectedRedFailure: 'AssertionError: Minimum payment charged $25.00 on negative balance',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(-84.5, 500, 50, 600);
      const passed = res.minPaymentDue === 0.0 && res.postPurchaseBalance === -34.5;
      return {
        passed,
        message: passed ? 'Suppressed minimum payment to $0.00 on credit balance' : `Min payment was $${res.minPaymentDue}`,
        details: res,
      };
    },
  },
  {
    id: 6,
    name: 'Credit Bureau Negative Utilization Truncation',
    domain: 'Negative Balances & Ledger',
    description: 'Credit bureau reporting rejects negative numbers; -$120 balance must report 0.0% utilization.',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(-120, 1000, 0, 800);
assert(res.reportedUtilizationPct === 0.0);`,
    expectedRedFailure: 'AssertionError: Reported utilization was -12.0%',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(-120, 1000, 0, 800);
      const passed = res.reportedUtilizationPct === 0.0;
      return {
        passed,
        message: passed ? 'Clamped credit balance utilization to 0.0%' : `Reported ${res.reportedUtilizationPct}%`,
        details: res,
      };
    },
  },
  {
    id: 7,
    name: 'Annual Category Spending Cap Replenishment on Refund',
    domain: 'Negative Balances & Ledger',
    description: '$200 refund on a grocery purchase must replenish $200 back to the annual bonus cap.',
    codeSnippet: `const cap = applyCategorySpendingCaps("amex-gold", "groceries", 25000, 24900, 200);
assert(cap.remainingCap === 300);`,
    expectedRedFailure: 'AssertionError: Remaining cap was 100 (refund ignored)',
    runGreen: () => {
      const cap = applyCategorySpendingCaps('amex-gold', 'groceries', 25000, 24900, 200);
      const passed = cap.remainingCap === 300;
      return {
        passed,
        message: passed ? 'Replenished $200 back to annual grocery cap (remaining: $300)' : `Remaining was $${cap.remainingCap}`,
        details: cap,
      };
    },
  },

  // 3. MCC & Category Exclusions
  {
    id: 8,
    name: 'Supermarket MCC 5411 Multiplier Resolution',
    domain: 'MCC & Category Exclusions',
    description: 'Whole Foods Market must resolve to MCC 5411 with supermarket eligibility enabled.',
    codeSnippet: `const mcc = resolveMerchantMcc("Whole Foods Market");
assert(mcc.mcc === "5411" && mcc.isSupermarketEligible === true);`,
    expectedRedFailure: 'KeyError: MCC mapping dictionary missing',
    runGreen: () => {
      const mcc = resolveMerchantMcc('Whole Foods Market');
      const passed = mcc.mcc === '5411' && mcc.isSupermarketEligible === true;
      return {
        passed,
        message: passed ? 'Resolved Whole Foods to MCC 5411 (Supermarket eligible)' : `MCC was ${mcc.mcc}`,
        details: mcc,
      };
    },
  },
  {
    id: 9,
    name: 'Wholesale Club (Costco MCC 5300) Supermarket Exclusion',
    domain: 'MCC & Category Exclusions',
    description: 'Costco Wholesale (MCC 5300) must NOT receive standard 4x supermarket multipliers.',
    codeSnippet: `const mcc = resolveMerchantMcc("Costco Wholesale");
assert(mcc.mcc === "5300" && mcc.isSupermarketEligible === false);`,
    expectedRedFailure: 'AssertionError: True is False (Costco improperly flagged as supermarket)',
    runGreen: () => {
      const mcc = resolveMerchantMcc('Costco Wholesale');
      const passed = mcc.mcc === '5300' && mcc.isSupermarketEligible === false;
      return {
        passed,
        message: passed ? 'Successfully excluded Costco (MCC 5300) from supermarket category' : `Got eligible=${mcc.isSupermarketEligible}`,
        details: mcc,
      };
    },
  },
  {
    id: 10,
    name: 'Superstore (Walmart Supercenter) Retail Classification',
    domain: 'MCC & Category Exclusions',
    description: 'Walmart Supercenters must code under MCC 5311 Discount Retail, not Grocery.',
    codeSnippet: `const mcc = resolveMerchantMcc("Walmart Supercenter");
assert(mcc.mcc === "5311" && mcc.category === "Shopping & Retail");`,
    expectedRedFailure: 'AssertionError: Walmart coded as Grocery',
    runGreen: () => {
      const mcc = resolveMerchantMcc('Walmart Supercenter');
      const passed = mcc.mcc === '5311' && mcc.category === 'Shopping & Retail';
      return {
        passed,
        message: passed ? 'Classified Walmart Supercenter as Shopping & Retail (MCC 5311)' : `Got category ${mcc.category}`,
        details: mcc,
      };
    },
  },
  {
    id: 11,
    name: 'Fast Food MCC 5814 Dining Category Mapping',
    domain: 'MCC & Category Exclusions',
    description: 'Shake Shack must resolve to MCC 5814 under Dining & Restaurants.',
    codeSnippet: `const mcc = resolveMerchantMcc("Shake Shack");
assert(mcc.mcc === "5814" && mcc.category === "Dining & Restaurants");`,
    expectedRedFailure: 'KeyError: Category empty in stub',
    runGreen: () => {
      const mcc = resolveMerchantMcc('Shake Shack');
      const passed = mcc.mcc === '5814' && mcc.category === 'Dining & Restaurants';
      return {
        passed,
        message: passed ? 'Resolved Shake Shack to Dining & Restaurants (MCC 5814)' : `Got ${mcc.category}`,
        details: mcc,
      };
    },
  },
  {
    id: 12,
    name: 'Non-Category Fallback ("Use Any Card" for Church Donations)',
    domain: 'MCC & Category Exclusions',
    description: 'Donations to church (MCC 8661) have no category bonus and must flag isUseAnyCard=True.',
    codeSnippet: `const swipe = calculateBestCardSwipe("Donating $50 to church", [{ id: "amex" }]);
assert(swipe.isUseAnyCard === true);`,
    expectedRedFailure: 'AssertionError: isUseAnyCard was False',
    runGreen: () => {
      const swipe = calculateBestCardSwipe('Donating $50 to church', [{ id: 'amex' }]);
      const passed = swipe.isUseAnyCard === true && swipe.categoryName.includes('Donations');
      return {
        passed,
        message: passed ? 'Flagged isUseAnyCard=True with non-category church donation blurb' : 'Failed fallback check',
        details: swipe,
      };
    },
  },

  // 4. Safe-Spend & Credit Health
  {
    id: 13,
    name: 'Safe-Spend Utilization Threshold Caution (>10%)',
    domain: 'Safe-Spend & Credit Health',
    description: '$180 swipe on $500 limit yields 36% utilization and must trigger caution flag.',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
assert(res.postBuyUtilizationPct === 36.0 && res.isOverSafeThreshold === true);`,
    expectedRedFailure: 'KeyError: postBuyUtilizationPct missing',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
      const passed = res.postBuyUtilizationPct === 36.0 && res.isOverSafeThreshold === true;
      return {
        passed,
        message: passed ? 'Triggered 36% utilization caution (threshold: 10%)' : `Got util=${res.postBuyUtilizationPct}%`,
        details: res,
      };
    },
  },
  {
    id: 14,
    name: 'Scheduled Payment Paydown to Exactly 10% Target',
    domain: 'Safe-Spend & Credit Health',
    description: 'Must recommend exact $130 scheduled payment to bring reported balance to $50 (10%).',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
assert(res.recommendedScheduledPayment === 130.0 && res.targetReportedBalance === 50.0);`,
    expectedRedFailure: 'AssertionError: Payment recommendation was None',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
      const passed = res.recommendedScheduledPayment === 130.0 && res.targetReportedBalance === 50.0;
      return {
        passed,
        message: passed ? 'Recommended exact $130 paydown to preserve $50 reported balance' : `Got $${res.recommendedScheduledPayment}`,
        details: res,
      };
    },
  },
  {
    id: 15,
    name: 'Hard Decline on Over-Limit Transactions',
    domain: 'Safe-Spend & Credit Health',
    description: '$640 purchase with $20 balance on $500 limit must trigger hard decline ($160 over).',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(20, 500, 640, 1200);
assert(res.isOverLimit === true && res.overAmount === 160.0);`,
    expectedRedFailure: 'AssertionError: Over-limit flag not raised',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(20, 500, 640, 1200);
      const passed = res.isOverLimit === true && res.overAmount === 160.0;
      return {
        passed,
        message: passed ? 'Issued hard decline: purchase exceeds credit limit by $160' : 'Over-limit check failed',
        details: res,
      };
    },
  },
  {
    id: 16,
    name: 'Checking Account $200 Emergency Buffer Protection',
    domain: 'Safe-Spend & Credit Health',
    description: 'Blocks payment if checking account would drop below mandatory $200 safety buffer.',
    codeSnippet: `const res = evaluateSafeSpendGuardrail(0, 500, 180, 250, 200);
assert(res.canScheduleFromChecking === false);`,
    expectedRedFailure: 'AssertionError: Allowed schedule that would deplete checking to $120',
    runGreen: () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 250, 200);
      const passed = res.canScheduleFromChecking === false;
      return {
        passed,
        message: passed ? 'Protected checking: refused paydown that breaches $200 emergency buffer' : 'Failed buffer protection',
        details: res,
      };
    },
  },

  // 5. Annual Credits & Precision
  {
    id: 17,
    name: 'Statement Credit Applied Prior to Point Multiplication',
    domain: 'Annual Credits & Precision',
    description: '$10 credit on $24 order leaves $14 net charge; points must earn on $14 only (56 pts).',
    codeSnippet: `const res = calculateBestCardSwipe("Shake Shack $24", [{ active_credits: [{ remaining: 10 }] }]);
assert(res.creditApplied === 10 && res.netCharge === 14 && res.pointsEarned === 56);`,
    expectedRedFailure: 'AssertionError: Points calculated on gross $24 (96 pts instead of 56 pts)',
    runGreen: () => {
      const res = calculateBestCardSwipe('Shake Shack $24', [{ active_credits: [{ remaining: 10 }] }]);
      const passed = res.creditApplied === 10 && res.netCharge === 14 && res.pointsEarned === 56;
      return {
        passed,
        message: passed ? 'Applied $10 credit first: $14 net charge yielded exactly 56 points (4x)' : `Got ${res.pointsEarned} pts`,
        details: res,
      };
    },
  },
  {
    id: 18,
    name: 'Sub-Penny Half-Cent Banker\'s Rounding Precision',
    domain: 'Annual Credits & Precision',
    description: '1.5% on $33.33 = $0.49995; must round bankers half-to-even to exactly $0.50.',
    codeSnippet: `const swipe = calculateBestCardSwipe("Office supplies for $33.33", [{ base_pct: 1.5 }]);
assert(swipe.cashBackDollars === 0.50);`,
    expectedRedFailure: 'AssertionError: Truncated to $0.49 instead of $0.50',
    runGreen: () => {
      const swipe = calculateBestCardSwipe('Office supplies for $33.33', [{ base_pct: 1.5 }]);
      const passed = swipe.cashBackDollars === 0.5;
      return {
        passed,
        message: passed ? 'Banker\'s rounding correctly evaluated $0.49995 to $0.50' : `Got $${swipe.cashBackDollars}`,
        details: swipe,
      };
    },
  },
  {
    id: 19,
    name: 'Statement Credit Cannot Exceed Purchase Amount',
    domain: 'Annual Credits & Precision',
    description: 'Applying a $15 credit to an $8 coffee must only consume $8 credit, leaving $7.',
    codeSnippet: `const res = calculateBestCardSwipe("Coffee for $8", [{ active_credits: [{ remaining: 15 }] }]);
assert(res.creditApplied === 8 && res.netCharge === 0 && res.remainingCredit === 7);`,
    expectedRedFailure: 'AssertionError: Consumed entire $15 credit and created negative charge',
    runGreen: () => {
      const res = calculateBestCardSwipe('Coffee for $8', [{ active_credits: [{ remaining: 15 }] }]);
      const passed = res.creditApplied === 8 && res.netCharge === 0 && res.remainingCredit === 7;
      return {
        passed,
        message: passed ? 'Consumed $8 credit on $8 purchase; preserved $7 credit balance' : `Got netCharge=$${res.netCharge}`,
        details: res,
      };
    },
  },
  {
    id: 20,
    name: 'Annual Fee Break-Even Net Value Formula',
    domain: 'Annual Credits & Precision',
    description: 'Net Annual Value = (Gross Points * Valuation) + Credits - Annual Fee.',
    codeSnippet: `const match = calculateCardMatch("amex-gold", 5400);
assert(match.netAnnualValue === 249.20);`,
    expectedRedFailure: 'ImportError: calculateCardMatch function missing',
    runGreen: () => {
      const match = calculateCardMatch('amex-gold', 5400);
      const passed = match.netAnnualValue === 249.2;
      return {
        passed,
        message: passed ? 'Evaluated Amex Gold net value to $249.20 (21,600 pts @ 1.2c + $240 - $250)' : `Got $${match.netAnnualValue}`,
        details: match,
      };
    },
  },
  {
    id: 21,
    name: 'Annual Category Spending Cap Overflow Fallback to 1x',
    domain: 'Annual Credits & Precision',
    description: 'Spend past $25,000 cap drops from 4x to 1x: $26k spend yields 101,000 points.',
    codeSnippet: `const pts = calculatePointsWithCaps("amex-gold", "groceries", 26000);
assert(pts === 101000);`,
    expectedRedFailure: 'AssertionError: Calculated uncapped 104,000 points',
    runGreen: () => {
      const pts = calculatePointsWithCaps('amex-gold', 'groceries', 26000);
      const passed = pts === 101000;
      return {
        passed,
        message: passed ? 'Awarded 100k pts on first $25k + 1k pts on $1k overflow (101,000 total)' : `Got ${pts} pts`,
        details: { spend: 26000, points: pts },
      };
    },
  },

  // 6. NLP Failsafes & Routing
  {
    id: 22,
    name: 'Natural Language Failsafe on Out-of-Domain Query',
    domain: 'NLP Failsafes & Routing',
    description: '"i have an exam today" lacks category, merchant, and money; must be flagged invalid.',
    codeSnippet: `const val = validateNaturalLanguageQuery("i have an exam today");
assert(val.isValid === false && val.hasCategory === false && val.hasMerchant === false);`,
    expectedRedFailure: 'AssertionError: Prompt passed through to recommendation engine',
    runGreen: () => {
      const val = validateNaturalLanguageQuery('i have an exam today');
      const passed = val.isValid === false && val.hasCategory === false && val.hasMerchant === false;
      return {
        passed,
        message: passed ? 'Flagged non-card query as invalid (0 category, 0 merchant, 0 currency signals)' : 'Failed to reject nonsense query',
        details: val,
      };
    },
  },
  {
    id: 23,
    name: 'Validation Passes with Category Keyword Only',
    domain: 'NLP Failsafes & Routing',
    description: '"dinner with friends" contains recognized bonus category and must pass validation.',
    codeSnippet: `const val = validateNaturalLanguageQuery("dinner with friends");
assert(val.isValid === true && val.hasCategory === true);`,
    expectedRedFailure: 'AssertionError: Query rejected due to missing merchant/price',
    runGreen: () => {
      const val = validateNaturalLanguageQuery('dinner with friends');
      const passed = val.isValid === true && val.hasCategory === true;
      return {
        passed,
        message: passed ? 'Accepted query based on category keyword "dinner"' : 'Failed category-only query',
        details: val,
      };
    },
  },
  {
    id: 24,
    name: 'Validation Passes with Merchant Name Only',
    domain: 'NLP Failsafes & Routing',
    description: '"heading to Lowe\'s" contains recognized merchant entity and must pass validation.',
    codeSnippet: `const val = validateNaturalLanguageQuery("heading to Lowe's");
assert(val.isValid === true && val.hasMerchant === true);`,
    expectedRedFailure: 'AssertionError: Query rejected due to missing dollar amount',
    runGreen: () => {
      const val = validateNaturalLanguageQuery("heading to Lowe's");
      const passed = val.isValid === true && val.hasMerchant === true;
      return {
        passed,
        message: passed ? 'Accepted query based on recognized merchant "LOWES"' : 'Failed merchant-only query',
        details: val,
      };
    },
  },
  {
    id: 25,
    name: 'Validation Passes with Currency / Intent Only',
    domain: 'NLP Failsafes & Routing',
    description: '"can i spend $75" contains purchasing intent and numeric dollar amount.',
    codeSnippet: `const val = validateNaturalLanguageQuery("can i spend $75");
assert(val.isValid === true && val.hasMoneyOrIntent === true);`,
    expectedRedFailure: 'AssertionError: Query rejected due to missing category/merchant',
    runGreen: () => {
      const val = validateNaturalLanguageQuery('can i spend $75');
      const passed = val.isValid === true && val.hasMoneyOrIntent === true;
      return {
        passed,
        message: passed ? 'Accepted query based on dollar amount "$75" and purchase intent' : 'Failed money-only query',
        details: val,
      };
    },
  },
  {
    id: 26,
    name: 'Ambiguous Merchant Disambiguation Prompting',
    domain: 'NLP Failsafes & Routing',
    description: '"Lunch at Shack for $24" must return selectable candidates (Shake Shack vs Shack Shop).',
    codeSnippet: `const res = calculateBestCardSwipe("Lunch at Shack for $24", []);
assert(res.isAmbiguous === true && res.ambiguousOptions.includes("Shake Shack"));`,
    expectedRedFailure: 'AssertionError: Engine guessed merchant without asking for user disambiguation',
    runGreen: () => {
      const res = calculateBestCardSwipe('Lunch at Shack for $24', []);
      const passed = res.isAmbiguous === true && (res.ambiguousOptions?.includes('Shake Shack') ?? false);
      return {
        passed,
        message: passed ? 'Returned disambiguation candidates: Shake Shack vs Shack Shop' : 'Ambiguity check failed',
        details: res,
      };
    },
  },
  {
    id: 27,
    name: 'Rent Fee Avoidance Routing to Bilt Mastercard',
    domain: 'NLP Failsafes & Routing',
    description: 'Rent payments must route to Bilt to earn 1x points while waiving the 3% convenience fee ($42).',
    codeSnippet: `const swipe = calculateBestCardSwipe("Paying $1400 apartment rent", [{ id: "bilt" }, { id: "citi-dc" }]);
assert(swipe.recommendedCardId === "bilt" && swipe.waivedProcessingFee === 42.0);`,
    expectedRedFailure: 'AssertionError: Engine naively chose 2% card which loses to 3% fee penalty',
    runGreen: () => {
      const swipe = calculateBestCardSwipe('Paying $1400 apartment rent', [
        { id: 'bilt-mastercard', name: 'Bilt World Elite Mastercard' },
        { id: 'citi-dc', name: 'Citi Double Cash' },
      ]);
      const passed = swipe.recommendedCardId === 'bilt-mastercard' && swipe.waivedProcessingFee === 42.0;
      return {
        passed,
        message: passed ? 'Routed rent to Bilt Mastercard: saved $42 in convenience fees + earned 1,400 pts' : `Got card ${swipe.recommendedCardId}`,
        details: swipe,
      };
    },
  },
  {
    id: 28,
    name: 'Equal-Multiplier Tie-Breaker Priority (Lowest Utilization)',
    domain: 'NLP Failsafes & Routing',
    description: 'When two cards earn identical flat 2%, tie-breaker selects the card with lower revolving utilization.',
    codeSnippet: `const swipe = calculateBestCardSwipe("Target purchase for $100", [
  { id: "card-a", limit: 1000, balance: 400 }, // 40% util
  { id: "card-b", limit: 2000, balance: 100 }, // 5% util
]);
assert(swipe.recommendedCardId === "card-b");`,
    expectedRedFailure: 'AssertionError: Card A selected based on array order instead of utilization',
    runGreen: () => {
      const swipe = calculateBestCardSwipe('Target purchase for $100', [
        { id: 'card-a', name: 'Card A', base: 2, limit: 1000, balance: 400 },
        { id: 'card-b', name: 'Card B', base: 2, limit: 2000, balance: 100 },
      ]);
      const passed = swipe.recommendedCardId === 'card-b';
      return {
        passed,
        message: passed ? 'Tie-breaker chose Card B (5% utilization vs Card A 40% utilization)' : `Chose ${swipe.recommendedCardId}`,
        details: swipe,
      };
    },
  },
];
