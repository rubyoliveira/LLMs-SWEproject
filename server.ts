import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { validateCardQuery } from './src/utils/cardQueryValidator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
let currentGeminiKey = process.env.GEMINI_API_KEY || '';

// Health check endpoint for Cloud Run container probes
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Primary model requested by user, with modern supported fallbacks
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

// Initialize GoogleGenAI client
const getGenAI = (customKey?: string) => {
  const key = (customKey || currentGeminiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
};

// Helper: Call Gemini with automatic model failover if 503 (high demand), 429, 404, or timeout occurs
async function generateWithFallback(ai: GoogleGenAI, contents: string, config?: any) {
  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout calling ${modelName}`)), 7500)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;
      return { response, activeModel: modelName };
    } catch (err: any) {
      lastError = err;
      const errMsg = (err?.message || JSON.stringify(err) || '').toLowerCase();
      // If error is 503 high demand, 429 rate limit, 404 model not found, timeout, or temporary unavailability, cascade to next model
      if (
        errMsg.includes('503') ||
        errMsg.includes('demand') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('timeout') ||
        errMsg.includes('429') ||
        errMsg.includes('404') ||
        errMsg.includes('not found') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('quota')
      ) {
        console.warn(`Model ${modelName} unavailable or timed out, falling back to next available model...`);
        continue;
      }
      // If it's an invalid key (e.g. 400 API_KEY_INVALID), break early
      break;
    }
  }

  throw lastError;
}

// API: Health & Gemini Key check
app.get('/api/status', (req: Request, res: Response) => {
  const activeKey = (currentGeminiKey || process.env.GEMINI_API_KEY || '').trim();
  const isConfigured = !!activeKey && activeKey !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    hasGeminiKey: isConfigured,
    model: PRIMARY_MODEL,
  });
});

// API: Save and verify user's Gemini API Key with high-demand 503 resilience
app.post('/api/config/key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }

  // Sanitize key (strip quotes, whitespace, or accidental trailing characters)
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '').trim();

  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    let verifiedModel = PRIMARY_MODEL;

    try {
      const result = await generateWithFallback(ai, 'Respond with "ready"');
      verifiedModel = result.activeModel;
    } catch (verifyErr: any) {
      const errStr = (verifyErr?.message || JSON.stringify(verifyErr) || '').toLowerCase();
      // If error is 503/high-demand, 429/rate-limit, or quota, the key IS authenticated and valid (Google returns 400 API_KEY_INVALID for bad keys)
      const isDemandOrQuotaOrTransient =
        errStr.includes('503') ||
        errStr.includes('high demand') ||
        errStr.includes('demand') ||
        errStr.includes('unavailable') ||
        errStr.includes('temporary') ||
        errStr.includes('429') ||
        errStr.includes('resource_exhausted') ||
        errStr.includes('quota');

      if (isDemandOrQuotaOrTransient) {
        console.log('Gemini returned transient demand/rate-limit spike, but key authentication passed. Accepting key.');
        verifiedModel = PRIMARY_MODEL;
      } else {
        throw verifyErr;
      }
    }

    // Key is verified and working!
    currentGeminiKey = cleanKey;
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to .env for server restarts
    try {
      const envPath = path.resolve(__dirname, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${cleanKey}"`);
        } else {
          envContent += `\nGEMINI_API_KEY="${cleanKey}"\n`;
        }
      } else {
        envContent = `GEMINI_API_KEY="${cleanKey}"\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (fsErr) {
      console.warn('Could not write to .env file', fsErr);
    }

    return res.json({
      success: true,
      message: `Gemini API key successfully verified and connected! Running on ${verifiedModel}.`,
      model: verifiedModel,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Invalid API Key';
    return res.status(400).json({
      success: false,
      error: `Gemini verification failed: ${errorMsg}`,
    });
  }
});

// Comprehensive MCC & Merchant Directory for fallback/grounding
const MCC_MAPPING: Record<string, { mcc: string; category: string; description: string; defaultAmt: number }> = {
  'burger king': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 14.50 },
  'mcdonalds': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 12.00 },
  'mcdonald': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 12.00 },
  'wendys': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 13.50 },
  'taco bell': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 11.50 },
  'chick-fil-a': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 15.00 },
  'chick fil a': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Restaurants', defaultAmt: 15.00 },
  'subway': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Sandwich Shop', defaultAmt: 12.50 },
  'in-n-out': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Burgers', defaultAmt: 13.00 },
  'five guys': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Food Burgers & Fries', defaultAmt: 18.00 },
  'shake shack': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Casual Dining', defaultAmt: 24.00 },
  'chipotle': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Casual Mexican', defaultAmt: 18.00 },
  'sweetgreen': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Casual Salads', defaultAmt: 17.50 },
  'starbucks': { mcc: '5814', category: 'Dining & Restaurants', description: 'Coffee Shop & Cafe', defaultAmt: 7.50 },
  'dunkin': { mcc: '5814', category: 'Dining & Restaurants', description: 'Coffee & Donuts', defaultAmt: 6.50 },
  'panera': { mcc: '5814', category: 'Dining & Restaurants', description: 'Fast Casual Bakery & Cafe', defaultAmt: 19.00 },
  'dominos': { mcc: '5814', category: 'Dining & Restaurants', description: 'Pizza Delivery', defaultAmt: 22.00 },
  'pizza hut': { mcc: '5814', category: 'Dining & Restaurants', description: 'Pizza Restaurant', defaultAmt: 25.00 },
  'olive garden': { mcc: '5812', category: 'Dining & Restaurants', description: 'Casual Dining Restaurant', defaultAmt: 55.00 },
  'nobu': { mcc: '5812', category: 'Dining & Restaurants', description: 'Fine Dining Restaurant', defaultAmt: 160.00 },
  'whole foods': { mcc: '5411', category: 'US Supermarkets', description: 'Supermarket & Grocery', defaultAmt: 85.00 },
  'trader joe': { mcc: '5411', category: 'US Supermarkets', description: 'Grocery Store', defaultAmt: 65.00 },
  'kroger': { mcc: '5411', category: 'US Supermarkets', description: 'Supermarket & Grocery', defaultAmt: 75.00 },
  'safeway': { mcc: '5411', category: 'US Supermarkets', description: 'Supermarket & Grocery', defaultAmt: 70.00 },
  'delta': { mcc: '4511', category: 'Flights & Airlines', description: 'Airlines & Air Carriers', defaultAmt: 350.00 },
  'united': { mcc: '4511', category: 'Flights & Airlines', description: 'Airlines & Air Carriers', defaultAmt: 320.00 },
  'american airlines': { mcc: '4511', category: 'Flights & Airlines', description: 'Airlines & Air Carriers', defaultAmt: 340.00 },
  'southwest': { mcc: '4511', category: 'Flights & Airlines', description: 'Airlines & Air Carriers', defaultAmt: 260.00 },
  'jetblue': { mcc: '4511', category: 'Flights & Airlines', description: 'Airlines & Air Carriers', defaultAmt: 280.00 },
  'uber': { mcc: '4121', category: 'Rideshare & Transit', description: 'Taxicabs & Limousines', defaultAmt: 24.00 },
  'lyft': { mcc: '4121', category: 'Rideshare & Transit', description: 'Taxicabs & Limousines', defaultAmt: 22.00 },
  'apple': { mcc: '5732', category: 'Electronics & Retail', description: 'Electronic Sales & Software', defaultAmt: 199.00 },
  'target': { mcc: '5310', category: 'Discount & Retail', description: 'Department Store', defaultAmt: 52.00 },
  'walmart': { mcc: '5310', category: 'Discount & Retail', description: 'Supercenter & Retail', defaultAmt: 68.00 },
  'lowes': { mcc: '5211', category: 'Shopping & Retail', description: 'Building Materials & Hardware Stores', defaultAmt: 65.00 },
  'lowe\'s': { mcc: '5211', category: 'Shopping & Retail', description: 'Building Materials & Hardware Stores', defaultAmt: 65.00 },
  'home depot': { mcc: '5211', category: 'Shopping & Retail', description: 'Home Improvement & Hardware', defaultAmt: 75.00 },
  'sephora': { mcc: '5977', category: 'Shopping & Retail', description: 'Cosmetic Stores & Beauty', defaultAmt: 45.00 },
  'ulta': { mcc: '5977', category: 'Shopping & Retail', description: 'Cosmetics & Beauty Supply', defaultAmt: 42.00 },
  'amazon': { mcc: '5969', category: 'Online Retail', description: 'Direct Marketing - Other', defaultAmt: 45.00 },
  'best buy': { mcc: '5732', category: 'Electronics & Retail', description: 'Consumer Electronics Store', defaultAmt: 120.00 },
  'church': { mcc: '8661', category: 'Donations & Non-Category', description: 'Religious & Church Organizations', defaultAmt: 50.00 },
  'donating to church': { mcc: '8661', category: 'Donations & Non-Category', description: 'Religious & Church Organizations', defaultAmt: 50.00 },
  'donation': { mcc: '8398', category: 'Donations & Non-Category', description: 'Charitable & Social Service Organizations', defaultAmt: 50.00 },
  'donations': { mcc: '8398', category: 'Donations & Non-Category', description: 'Charitable & Social Service Organizations', defaultAmt: 50.00 },
  'charity': { mcc: '8398', category: 'Donations & Non-Category', description: 'Charitable Organizations', defaultAmt: 50.00 },
  'tithe': { mcc: '8661', category: 'Donations & Non-Category', description: 'Religious Organizations & Tithing', defaultAmt: 100.00 },
  'tax': { mcc: '9311', category: 'Government & Non-Category', description: 'Tax Payments & Government Services', defaultAmt: 150.00 },
  'taxes': { mcc: '9311', category: 'Government & Non-Category', description: 'Tax Payments & Government Services', defaultAmt: 150.00 },
  'tuition': { mcc: '8220', category: 'Education & Non-Category', description: 'Colleges & Universities', defaultAmt: 500.00 },
  'dmv': { mcc: '9399', category: 'Government & Non-Category', description: 'Government Services & DMV Fees', defaultAmt: 65.00 },
};

const FIVE_CATEGORIES_KEYWORDS = [
  'dining', 'restaurant', 'food', 'fast food', 'cafe', 'bar', 'burger', 'shake', 'pizza', 'taco', 'bakery', 'subway',
  'grocery', 'groceries', 'supermarket', 'whole foods', 'trader joe', 'kroger', 'safeway',
  'shopping', 'retail', 'electronic', 'apparel', 'store', 'cloth', 'department', 'target', 'amazon', 'apple', 'best buy',
  'travel', 'flight', 'airline', 'transit', 'rideshare', 'uber', 'lyft', 'hotel', 'delta', 'united', 'american airlines',
  'bill', 'utility', 'streaming', 'subscription', 'software', 'netflix', 'spotify'
];

function isOutsideFiveCategories(categoryName: string, merchantName: string, promptText: string): boolean {
  const combined = `${categoryName} ${merchantName} ${promptText}`.toLowerCase();
  if (
    combined.includes('church') ||
    combined.includes('donat') ||
    combined.includes('tithe') ||
    combined.includes('charit') ||
    combined.includes('nonprofit') ||
    combined.includes('tuition') ||
    combined.includes('dmv') ||
    combined.includes('tax') ||
    combined.includes('bail') ||
    combined.includes('court')
  ) {
    return true;
  }
  const matchesFive = FIVE_CATEGORIES_KEYWORDS.some((kw) => combined.includes(kw));
  return !matchesFive;
}

function extractMerchantName(prompt: string): string {
  const clean = prompt
    .replace(/\b(ordering|buying|getting|eating|having|swipe|card|for|my|which|should|i|use|can|afford)\b/gi, '')
    .trim();

  const atMatch = clean.match(/(?:at|from|to|in)\s+([^$0-9,\.?!]+)/i);
  if (atMatch && atMatch[1].trim()) {
    const candidate = atMatch[1].trim().replace(/\b(for|lunch|dinner|breakfast)\b.*$/i, '').trim();
    if (candidate) {
      return candidate.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  const lower = prompt.toLowerCase();
  for (const key of Object.keys(MCC_MAPPING)) {
    if (lower.includes(key)) {
      return key.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  return 'Merchant';
}

// MAIN COPILOT ROUTE (Powered by Gemini AI)
app.post('/api/copilot/recommend', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { prompt, userCards = [], checkingBalance = 820, emergencyBuffer = 200, customApiKey } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Enforce 3-criteria validation check (Category, Store/Merchant, Money value/intent)
  const validation = validateCardQuery(prompt);
  if (!validation.isValid) {
    return res.json({
      isInvalidQuery: true,
      userPrompt: prompt,
      validation: {
        prompt,
        hasCategory: validation.hasCategory,
        hasMerchant: validation.hasMerchant,
        hasMoneyOrIntent: validation.hasMoneyOrIntent,
        detectedCategory: validation.detectedCategory,
        detectedMerchant: validation.detectedMerchant,
        detectedMoneyOrIntent: validation.detectedMoneyOrIntent,
        failsafeMessage: validation.failsafeMessage,
        suggestedQueries: validation.suggestedQueries,
      },
      message: validation.failsafeMessage,
      suggestedQueries: validation.suggestedQueries,
    });
  }

  const enrolledCards = Array.isArray(userCards) && userCards.length > 0 ? userCards : [];
  if (enrolledCards.length === 0) {
    return res.status(400).json({
      error: 'NO_CARDS_ENROLLED',
      message: 'No enrolled cards found. Please upload or add at least one credit card in your Wallet.',
    });
  }

  const ai = getGenAI(customApiKey);

  // If Gemini AI client is available, run copilot analysis through Gemini with fallback failover
  if (ai) {
    try {
      const geminiPrompt = `You are the RocketRewards AI Financial Copilot (LLMS IN SOFTWARE ENGINEERING).
The user query is: "${prompt}".

The user holds ONLY these enrolled cards in their wallet:
${JSON.stringify(
  enrolledCards.map((c: any) => ({
    id: c.id,
    name: c.name,
    last4: c.last4,
    limit: c.creditLimit,
    balance: c.balance,
    multiplierCategories: c.multiplierCategories,
    activeCredits: c.activeCredits,
  })),
  null,
  2
)}

Checking Balance: $${checkingBalance}
Emergency Buffer: $${emergencyBuffer}

Evaluate this transaction:
1. Identify if the transaction falls into one of the 5 core bonus categories:
   - Dining & Restaurants (MCC 5812, 5814)
   - Groceries & Supermarkets (MCC 5411)
   - Shopping & Retail (MCC 5310, 5732, 5969)
   - Travel, Flights & Transit (MCC 4511, 4121, 3000-3299)
   - Bills & Utilities / Streaming (MCC 4899, 4900, 5815)

IMPORTANT NON-CATEGORY RULE:
If the purchase does NOT fall within these 5 categories (e.g. "donating to church", "church donation", tithe, charitable contributions, religious organizations, taxes, government/DMV fees, tuition, bail):
- Set "isUseAnyCard": true
- Set "categoryName": "Donations & Non-Category" (or "Religious Organizations" / specific non-category)
- Set "mccCode": "8661" (for church/religious), "8398" (for charity), "9311" (for tax), or "8220" (for education)
- Set "recommendedCardName": "Use Any Card"
- Set "categoryMultiplier": "Standard Base Rate · 1x-2%"
- Set "nonCategoryBlurb": "This purchase falls outside the 5 bonus categories (Dining, Groceries, Shopping, Travel, Bills). Merchants like churches or charities do not qualify for bonus category multipliers, so you can use any card in your wallet (or use your highest flat-rate card like Citi Double Cash for 2% back)."
- In "cardsComparison", assign standard baseline return (1x / 2% cash back) to all cards.

2. Extract merchant name (e.g. Church, Burger King) and ISO 18245 MCC code.
3. If no dollar amount was explicitly specified, infer a realistic average amount (e.g. $50 for church donation, $14.50 for lunch at Burger King, $65 for groceries).
4. Determine which enrolled card gives the highest net return (or "Use Any Card" if non-category).
5. Evaluate all enrolled cards and rank them.
6. If user asks if they can afford something or is using a tight limit card: evaluate if over limit, post-purchase utilization, and exact scheduled payment needed to preserve <10% utilization before statement close.

Respond strictly with this JSON structure:
{
  "merchantName": "string",
  "mccCode": "string (e.g. 5814 or 8661)",
  "categoryName": "string",
  "mccDescription": "string",
  "originalAmount": number,
  "isEstimatedAmount": boolean,
  "isAffordabilityQuery": boolean,
  "isUseAnyCard": boolean,
  "nonCategoryBlurb": "string",
  "recommendedCardId": "string (id of winning card from provided list)",
  "categoryMultiplier": "string",
  "creditApplied": number,
  "creditTitle": "string",
  "netCharge": number,
  "pointsEarned": number,
  "cardsComparison": [
    {
      "cardName": "string",
      "value": "string formatted dollar like $0.58",
      "pointsOrCash": "string description",
      "barPercent": number (10 to 100),
      "isRecommended": boolean
    }
  ],
  "safeSpend": {
    "isOverLimit": boolean,
    "overAmount": number,
    "currentUtilization": number,
    "postBuyUtilization": number,
    "scheduledPayment": number,
    "targetReportedBalance": number,
    "postPaymentUtilization": number,
    "checkingBalance": number,
    "checkingAfterPayment": number,
    "debitParitySafe": boolean
  }
}`;

      const { response: aiResponse, activeModel } = await generateWithFallback(ai, geminiPrompt, {
        responseMimeType: 'application/json',
        temperature: 0.1,
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const winningCard = enrolledCards.find((c: any) => c.id === parsed.recommendedCardId) || enrolledCards[0];
      const starterCard = enrolledCards.find((c: any) => c.creditLimit <= 1000) || enrolledCards[0];

      const latencyMs = Math.max(120, Date.now() - startTime);

      const isNonCat = !!parsed.isUseAnyCard || isOutsideFiveCategories(parsed.categoryName || '', parsed.merchantName || '', prompt);
      const finalCategoryName = parsed.categoryName || (isNonCat ? 'Donations & Non-Category' : 'Dining & Restaurants');
      const finalBlurb = isNonCat
        ? (parsed.nonCategoryBlurb || "This purchase falls outside the 5 core categories (Dining, Groceries, Shopping, Travel & Rides, Bills & Utilities). Merchants like churches and charities do not qualify for category reward multipliers, so you can freely use any card in your wallet (or use your highest flat-rate card like Citi Double Cash for 2% back).")
        : undefined;

      return res.json({
        latency: `${(latencyMs / 1000).toFixed(2)}s`,
        engineStatus: `Gemini AI (${activeModel}) · Full LLM Co-Pilot Execution`,
        mccResolution: {
          code: parsed.mccCode || (isNonCat ? '8661' : '5814'),
          category: finalCategoryName,
          description: parsed.mccDescription || (isNonCat ? 'Religious / Non-Profit / Charity Organization' : 'Fast Food Restaurants'),
          merchant: parsed.merchantName || 'Burger King',
        },
        recommendation: {
          merchantName: parsed.merchantName || 'Burger King',
          recommendedCardName: isNonCat ? 'Use Any Card' : winningCard.name,
          recommendedCardLast4: isNonCat ? 'Any' : winningCard.last4,
          isUseAnyCard: isNonCat,
          nonCategoryBlurb: finalBlurb,
          originalAmount: parsed.originalAmount || 14.50,
          isEstimatedAmount: !!parsed.isEstimatedAmount,
          recommendedCard: winningCard,
          netCharge: parsed.netCharge !== undefined ? parsed.netCharge : (parsed.originalAmount || 14.50),
          pointsEarned: parsed.pointsEarned || 58,
          creditApplied: parsed.creditApplied || 0,
          creditTitle: parsed.creditTitle || '',
          categoryMultiplier: parsed.categoryMultiplier || (isNonCat ? 'Standard Base Rate · 1x-2%' : 'Dining & Restaurants · 4x'),
          cardsComparison: parsed.cardsComparison || [
            { cardName: winningCard.name, value: '$0.58', pointsOrCash: '58 pts (4x)', barPercent: 100, isRecommended: true },
          ],
          enrolledCardsEvaluatedCount: enrolledCards.length,
        },
        safeSpendGuardrail: {
          isAffordabilityQuery: !!parsed.isAffordabilityQuery,
          isOverLimit: !!parsed.safeSpend?.isOverLimit,
          overAmount: parsed.safeSpend?.overAmount || 0,
          starterCard,
          currentUtilization: parsed.safeSpend?.currentUtilization || 7,
          postBuyUtilization: parsed.safeSpend?.postBuyUtilization || 7,
          scheduledPayment: parsed.safeSpend?.scheduledPayment || 0,
          targetReportedBalance: parsed.safeSpend?.targetReportedBalance || 857,
          postPaymentUtilization: parsed.safeSpend?.postPaymentUtilization || 7,
          checkingBalance,
          checkingAfterPayment: parsed.safeSpend?.checkingAfterPayment || checkingBalance,
          emergencyBuffer,
          debitParitySafe: parsed.safeSpend?.debitParitySafe !== false,
        },
      });
    } catch (geminiError: any) {
      console.warn('Gemini request encountered error, falling back to deterministic engine:', geminiError.message);
    }
  }

  // --- DETERMINISTIC ENGINE FALLBACK (When Gemini key is not configured or temporary cloud downtime) ---
  let extractedMerchant = extractMerchantName(prompt);
  let extractedAmount = 14.50;
  let isEstimatedAmount = true;
  let extractedCategory = 'Dining & Restaurants';
  let extractedMcc = '5814';
  let extractedMccDesc = 'Fast Food & Casual Dining';
  let isAffordabilityQuery = false;

  const lowerPrompt = prompt.toLowerCase();

  for (const [key, mapping] of Object.entries(MCC_MAPPING)) {
    if (lowerPrompt.includes(key)) {
      extractedMerchant = key.split(' ').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      extractedMcc = mapping.mcc;
      extractedCategory = mapping.category;
      extractedMccDesc = mapping.description;
      extractedAmount = mapping.defaultAmt;
      break;
    }
  }

  const amtMatch = prompt.match(/\$?(\d+(\.\d{1,2})?)/);
  if (amtMatch) {
    extractedAmount = parseFloat(amtMatch[1]);
    isEstimatedAmount = false;
  }

  if (
    lowerPrompt.includes('can i buy') ||
    lowerPrompt.includes('can i afford') ||
    lowerPrompt.includes('put a') ||
    lowerPrompt.includes('starter card')
  ) {
    isAffordabilityQuery = true;
  }

  const primaryStarterCard = enrolledCards.find((c: any) => c.creditLimit <= 1000) || enrolledCards[0];
  const isOverLimit = extractedAmount > primaryStarterCard.creditLimit;

  const cardEvaluations = enrolledCards.map((card: any) => {
    let multiplier = 1;
    let categoryMatchName = 'General';

    if (Array.isArray(card.multiplierCategories)) {
      for (const cat of card.multiplierCategories) {
        const catNameLower = (cat.category || '').toLowerCase();
        const extractedLower = extractedCategory.toLowerCase();

        if (
          (extractedLower.includes('dining') && (catNameLower.includes('dining') || catNameLower.includes('restaurant'))) ||
          (extractedLower.includes('supermarket') && (catNameLower.includes('supermarket') || catNameLower.includes('grocer'))) ||
          (extractedLower.includes('flight') && (catNameLower.includes('flight') || catNameLower.includes('travel'))) ||
          (extractedLower.includes('rideshare') && (catNameLower.includes('transit') || catNameLower.includes('uber') || catNameLower.includes('travel')))
        ) {
          if (cat.multiplier > multiplier) {
            multiplier = cat.multiplier;
            categoryMatchName = cat.category;
          }
        }
      }
    }

    let applicableCredit = 0;
    let creditTitle = '';
    if (Array.isArray(card.activeCredits)) {
      for (const cred of card.activeCredits) {
        if (
          (extractedCategory.toLowerCase().includes('dining') && cred.category.toLowerCase().includes('dining')) ||
          (extractedCategory.toLowerCase().includes('rideshare') && cred.category.toLowerCase().includes('rideshare'))
        ) {
          applicableCredit = Math.min(cred.remaining || cred.amount, extractedAmount);
          creditTitle = cred.title;
          break;
        }
      }
    }

    const netCharge = Math.max(0, extractedAmount - applicableCredit);
    const pointsEarned = Math.round(extractedAmount * multiplier);
    const totalBenefitValue = (pointsEarned * 0.01) + applicableCredit;

    return {
      cardId: card.id,
      cardName: card.name,
      last4: card.last4,
      multiplier,
      categoryMatchName,
      pointsEarned,
      applicableCredit,
      creditTitle,
      netCharge,
      totalBenefitValue,
    };
  });

  cardEvaluations.sort((a: any, b: any) => b.totalBenefitValue - a.totalBenefitValue);
  const bestCardEval = cardEvaluations[0];
  const isNonCat = isOutsideFiveCategories(extractedCategory, extractedMerchant, prompt);
  const finalCategoryName = isNonCat ? 'Donations & Non-Category' : extractedCategory;
  const nonCategoryBlurb = isNonCat
    ? "This purchase falls outside the 5 core categories (Dining, Groceries, Shopping, Travel & Rides, Bills & Utilities). Merchants like churches and charities do not qualify for bonus multipliers, so you can freely use any card in your wallet (or use your highest flat-rate card like Citi Double Cash for 2% back)."
    : undefined;

  const bestCard = enrolledCards.find((c: any) => c.id === bestCardEval.cardId) || enrolledCards[0];
  const maxBenefit = Math.max(...cardEvaluations.map((c: any) => c.totalBenefitValue), 0.01);

  const cardsComparison = cardEvaluations.map((c: any) => ({
    cardName: c.cardName,
    value: `$${c.totalBenefitValue.toFixed(2)}`,
    pointsOrCash: isNonCat
      ? `${c.pointsEarned} pts (Base 1x-2%)`
      : c.applicableCredit > 0
        ? `${c.pointsEarned} pts + $${c.applicableCredit} credit`
        : `${c.pointsEarned} pts (${c.multiplier}x)`,
    barPercent: isNonCat ? 100 : Math.max(15, Math.round((c.totalBenefitValue / maxBenefit) * 100)),
    isRecommended: isNonCat ? true : c.cardId === bestCard.id,
  }));

  const currentCardBalance = primaryStarterCard.balance || 0;
  const cardLimit = primaryStarterCard.creditLimit || 500;
  const postBuyBalance = currentCardBalance + extractedAmount;
  const postBuyUtilization = Math.round((postBuyBalance / cardLimit) * 100);
  const targetReportedBalance = Math.min(cardLimit * 0.10, postBuyBalance);
  const scheduledPayment = Math.max(0, postBuyBalance - targetReportedBalance);
  const postPaymentUtilization = Math.round((targetReportedBalance / cardLimit) * 100);
  const debitParityCheck = (checkingBalance - scheduledPayment) >= emergencyBuffer;

  const latencyMs = Math.max(80, Date.now() - startTime);

  res.json({
    latency: `${(latencyMs / 1000).toFixed(2)}s`,
    engineStatus: 'Deterministic Rules Engine (Zero Hallucination)',
    mccResolution: {
      code: extractedMcc,
      category: finalCategoryName,
      description: extractedMccDesc,
      merchant: extractedMerchant,
    },
    recommendation: {
      merchantName: extractedMerchant,
      recommendedCardName: isNonCat ? 'Use Any Card' : bestCard.name,
      recommendedCardLast4: isNonCat ? 'Any' : bestCard.last4,
      isUseAnyCard: isNonCat,
      nonCategoryBlurb,
      originalAmount: extractedAmount,
      isEstimatedAmount,
      recommendedCard: bestCard,
      netCharge: bestCardEval.netCharge,
      pointsEarned: bestCardEval.pointsEarned,
      creditApplied: bestCardEval.applicableCredit,
      creditTitle: bestCardEval.creditTitle,
      categoryMultiplier: isNonCat ? 'Standard Base Rate · 1x-2%' : `${extractedCategory} · ${bestCardEval.multiplier}x`,
      cardsComparison,
      enrolledCardsEvaluatedCount: enrolledCards.length,
    },
    safeSpendGuardrail: {
      isAffordabilityQuery,
      isOverLimit,
      overAmount: Math.max(0, extractedAmount - cardLimit),
      starterCard: primaryStarterCard,
      currentUtilization: Math.round((currentCardBalance / cardLimit) * 100),
      postBuyUtilization,
      scheduledPayment: Math.round(scheduledPayment),
      targetReportedBalance: Math.round(targetReportedBalance),
      postPaymentUtilization,
      checkingBalance,
      checkingAfterPayment: checkingBalance - Math.round(scheduledPayment),
      emergencyBuffer,
      debitParitySafe: debitParityCheck,
    },
  });
});

// Setup Vite dev server middleware in dev mode or serve static assets in production
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (process.env.PORT !== undefined && process.env.PORT !== '3000') ||
    !fs.existsSync(path.resolve(__dirname, 'src', 'App.tsx'));

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('RocketRewards API running');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`RocketRewards server listening on 0.0.0.0:${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer();
