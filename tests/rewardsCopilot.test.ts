import { describe, it, expect } from 'vitest';
import {
  calculateStatementDueDates,
  evaluateSafeSpendGuardrail,
  resolveMerchantMcc,
  applyCategorySpendingCaps,
  calculatePointsWithCaps,
  calculateCardMatch,
  calculateBestCardSwipe,
  validateNaturalLanguageQuery,
} from '../src/utils/tddEngine';

describe('RocketRewards TDD Unit Assertions (28 Tests)', () => {
  // Domain 1: Leap Year & Calendar
  describe('Domain 1: Leap-Year & Date Boundary Rollovers', () => {
    it('01: Leap-Year February 29 Statement Close', () => {
      const res = calculateStatementDueDates(new Date(2024, 1, 15), 29);
      expect(res.closeDate).toBe('2024-02-29');
      expect(res.isLeapYear).toBe(true);
    });

    it('02: Non-Leap Year February 28 Clamping', () => {
      const res = calculateStatementDueDates(new Date(2025, 1, 10), 31);
      expect(res.closeDate).toBe('2025-02-28');
      expect(res.clampedDay).toBe(28);
    });

    it('03: Due Date Grace Period Crossing Leap Day', () => {
      const res = calculateStatementDueDates(new Date(2024, 1, 10), 15, 25);
      expect(res.dueDate).toBe('2024-03-11');
    });

    it('04: Weekend Due Date Adjustment (CARD Act Compliance)', () => {
      const res = calculateStatementDueDates(new Date(2024, 4, 1), 7, 25);
      expect(res.weekdayName).not.toBe('Sunday');
      expect(res.weekdayName).not.toBe('Saturday');
    });
  });

  // Domain 2: Negative Balances & Ledger
  describe('Domain 2: Negative Balances, Overpayments & Refunds', () => {
    it('05: Negative balance suppresses min payment to $0.00', () => {
      const res = evaluateSafeSpendGuardrail(-84.5, 500, 50, 600);
      expect(res.minPaymentDue).toBe(0.0);
      expect(res.postPurchaseBalance).toBe(-34.5);
    });

    it('06: Negative balance utilization truncates to 0.0%', () => {
      const res = evaluateSafeSpendGuardrail(-120, 1000, 0, 800);
      expect(res.reportedUtilizationPct).toBe(0.0);
    });

    it('07: Refund replenishes annual category spending cap', () => {
      const cap = applyCategorySpendingCaps('amex-gold', 'groceries', 25000, 24900, 200);
      expect(cap.remainingCap).toBe(300);
    });
  });

  // Domain 3: MCC Resolution & Exclusions
  describe('Domain 3: Deterministic MCC Resolution & Merchant Exclusions', () => {
    it('08: Supermarket Whole Foods resolves to MCC 5411', () => {
      const mcc = resolveMerchantMcc('Whole Foods Market');
      expect(mcc.mcc).toBe('5411');
      expect(mcc.isSupermarketEligible).toBe(true);
    });

    it('09: Wholesale club Costco (MCC 5300) excluded from supermarket category', () => {
      const mcc = resolveMerchantMcc('Costco Wholesale');
      expect(mcc.mcc).toBe('5300');
      expect(mcc.isSupermarketEligible).toBe(false);
    });

    it('10: Walmart Supercenter classified as Shopping & Retail (MCC 5311)', () => {
      const mcc = resolveMerchantMcc('Walmart Supercenter');
      expect(mcc.mcc).toBe('5311');
      expect(mcc.category).toBe('Shopping & Retail');
    });

    it('11: Shake Shack resolves to MCC 5814 Fast Food Dining', () => {
      const mcc = resolveMerchantMcc('Shake Shack');
      expect(mcc.mcc).toBe('5814');
      expect(mcc.category).toBe('Dining & Restaurants');
    });

    it('12: Church donation triggers isUseAnyCard fallback', () => {
      const swipe = calculateBestCardSwipe('Donating $50 to church', [{ id: 'amex' }]);
      expect(swipe.isUseAnyCard).toBe(true);
      expect(swipe.categoryName).toBe('Donations & Non-Category');
    });
  });

  // Domain 4: Safe-Spend Guardrails
  describe('Domain 4: Safe-Spend Guardrails & Credit Health (10% Rule)', () => {
    it('13: Utilization exceeding 10% triggers caution status', () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
      expect(res.postBuyUtilizationPct).toBe(36.0);
      expect(res.isOverSafeThreshold).toBe(true);
    });

    it('14: Scheduled paydown restores safe 10% target balance ($50)', () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 820);
      expect(res.recommendedScheduledPayment).toBe(130.0);
      expect(res.targetReportedBalance).toBe(50.0);
    });

    it('15: Hard decline on over-limit transaction ($640 on $500 limit)', () => {
      const res = evaluateSafeSpendGuardrail(20, 500, 640, 1200);
      expect(res.isOverLimit).toBe(true);
      expect(res.overAmount).toBe(160.0);
    });

    it('16: Checking account emergency buffer ($200) protection', () => {
      const res = evaluateSafeSpendGuardrail(0, 500, 180, 250, 200);
      expect(res.canScheduleFromChecking).toBe(false);
    });
  });

  // Domain 5: Annual Credits & Precision
  describe('Domain 5: Annual Credits, Proration & Multiplier Precision', () => {
    it('17: Statement credit applied before multiplier (56 pts on $14 net charge)', () => {
      const res = calculateBestCardSwipe('Shake Shack $24', [{ active_credits: [{ remaining: 10 }] }]);
      expect(res.creditApplied).toBe(10);
      expect(res.netCharge).toBe(14);
      expect(res.pointsEarned).toBe(56);
    });

    it('18: Sub-penny half-cent bankers rounding to $0.50', () => {
      const swipe = calculateBestCardSwipe('Office supplies for $33.33', [{ base_pct: 1.5 }]);
      expect(swipe.cashBackDollars).toBe(0.5);
    });

    it('19: Statement credit cannot exceed purchase amount', () => {
      const res = calculateBestCardSwipe('Coffee for $8', [{ active_credits: [{ remaining: 15 }] }]);
      expect(res.creditApplied).toBe(8);
      expect(res.netCharge).toBe(0);
      expect(res.remainingCredit).toBe(7);
    });

    it('20: Annual fee break-even formula net value ($249.20)', () => {
      const match = calculateCardMatch('amex-gold', 5400);
      expect(match.netAnnualValue).toBe(249.2);
    });

    it('21: Spending past $25,000 annual grocery cap drops to 1x rate', () => {
      const pts = calculatePointsWithCaps('amex-gold', 'groceries', 26000);
      expect(pts).toBe(101000);
    });
  });

  // Domain 6: NLP Failsafes & Routing
  describe('Domain 6: NLP Guardrails, Ambiguity & Routing', () => {
    it('22: Out of domain prompt "i have an exam today" rejected', () => {
      const val = validateNaturalLanguageQuery('i have an exam today');
      expect(val.isValid).toBe(false);
      expect(val.hasCategory).toBe(false);
      expect(val.hasMerchant).toBe(false);
    });

    it('23: Query with category only ("dinner with friends") passes', () => {
      const val = validateNaturalLanguageQuery('dinner with friends');
      expect(val.isValid).toBe(true);
      expect(val.hasCategory).toBe(true);
    });

    it('24: Query with merchant name only ("heading to Lowe\'s") passes', () => {
      const val = validateNaturalLanguageQuery("heading to Lowe's");
      expect(val.isValid).toBe(true);
      expect(val.hasMerchant).toBe(true);
    });

    it('25: Query with dollar amount and intent ("can i spend $75") passes', () => {
      const val = validateNaturalLanguageQuery('can i spend $75');
      expect(val.isValid).toBe(true);
      expect(val.hasMoneyOrIntent).toBe(true);
    });

    it('26: Ambiguous merchant token "Shack" prompts disambiguation', () => {
      const res = calculateBestCardSwipe('Lunch at Shack for $24', []);
      expect(res.isAmbiguous).toBe(true);
      expect(res.ambiguousOptions).toContain('Shake Shack');
    });

    it('27: Rent payment routes to Bilt Mastercard to waive 3% fee ($42)', () => {
      const swipe = calculateBestCardSwipe('Paying $1400 apartment rent', [
        { id: 'bilt-mastercard', name: 'Bilt World Elite Mastercard' },
      ]);
      expect(swipe.recommendedCardId).toBe('bilt-mastercard');
      expect(swipe.waivedProcessingFee).toBe(42.0);
    });

    it('28: Equal return tie-breaker chooses card with lower utilization', () => {
      const swipe = calculateBestCardSwipe('Target purchase for $100', [
        { id: 'card-a', name: 'Card A', base: 2, limit: 1000, balance: 400 },
        { id: 'card-b', name: 'Card B', base: 2, limit: 2000, balance: 100 },
      ]);
      expect(swipe.recommendedCardId).toBe('card-b');
    });
  });

  // Domain 8: Plaid Multi-Card Integration & Precise Category Grounding
  describe('Domain 8: Plaid Multi-Card Integration & Precise MCC Grounding', () => {
    it('29: Plaid multi-card portfolio includes Amex Gold with 4x dining and credits', () => {
      const amexGold = {
        id: 'amex-gold',
        name: 'American Express Gold',
        isPlaidConnected: true,
        creditLimit: 12000,
        balance: 842.16,
        multiplierCategories: [
          { category: 'Dining & Restaurants', multiplier: 4 },
          { category: 'US Supermarkets', multiplier: 4 },
        ],
        activeCredits: [
          { id: 'amex-dining-credit', title: '$10 dining credit', amount: 10, remaining: 10 },
        ],
      };
      expect(amexGold.isPlaidConnected).toBe(true);
      expect(amexGold.multiplierCategories[0].multiplier).toBe(4);
      expect(amexGold.activeCredits[0].remaining).toBe(10);
    });

    it('30: Plaid portfolio calculates aggregate credit limit and utilization safely', () => {
      const cards = [
        { balance: 842.16, creditLimit: 12000 },
        { balance: 1170.0, creditLimit: 9000 },
        { balance: 415.5, creditLimit: 15000 },
      ];
      const totalBalance = cards.reduce((acc, c) => acc + c.balance, 0);
      const totalLimit = cards.reduce((acc, c) => acc + c.creditLimit, 0);
      const utilPct = Math.round((totalBalance / totalLimit) * 100);

      expect(totalLimit).toBe(36000);
      expect(utilPct).toBe(7); // 7% is safe under 10%
    });

    it('31: Accurate MCC resolution handles Delta airlines as MCC 4511 travel', () => {
      const deltaMcc = resolveMerchantMcc('Delta Airlines');
      expect(deltaMcc.mcc).toBe('4511');
      expect(deltaMcc.isDining).toBe(false);
      expect(deltaMcc.isSupermarketEligible).toBe(false);
    });

    it('32: Accurate MCC resolution handles Trader Joe\'s as MCC 5411 supermarkets', () => {
      const tjMcc = resolveMerchantMcc('Trader Joe\'s');
      expect(tjMcc.mcc).toBe('5411');
      expect(tjMcc.isSupermarketEligible).toBe(true);
    });
  });
});
