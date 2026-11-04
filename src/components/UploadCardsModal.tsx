import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CreditCard as CardIcon,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CreditCard } from '../types';

interface UploadCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  onUpdateCards: (updatedCards: CreditCard[]) => void;
  activeCardIds: string[];
  onToggleActiveCard: (cardId: string) => void;
  customApiKey?: string;
}

const CATALOG_PRESETS: Partial<CreditCard>[] = [
  {
    name: 'Capital One SavorOne',
    issuer: 'Capital One',
    last4: '7721',
    network: 'mastercard',
    balance: 140.0,
    creditLimit: 6000.0,
    statementCloseDate: 'Nov 18',
    statementCloseDays: 20,
    paymentDueDate: 'Dec 13',
    paymentDueDays: 45,
    colorHex: '#e11d48',
    multiplierCategories: [
      { category: 'Dining & Restaurants', multiplier: 3, description: '3% cash back on dining' },
      { category: 'US Supermarkets', multiplier: 3, description: '3% cash back on groceries' },
      { category: 'Entertainment', multiplier: 3, description: '3% on entertainment' },
      { category: 'General', multiplier: 1, description: '1% on other purchases' },
    ],
  },
  {
    name: 'Bilt World Elite Mastercard',
    issuer: 'Wells Fargo',
    last4: '3391',
    network: 'mastercard',
    balance: 420.0,
    creditLimit: 8500.0,
    statementCloseDate: 'Nov 25',
    statementCloseDays: 27,
    paymentDueDate: 'Dec 20',
    paymentDueDays: 52,
    colorHex: '#18181b',
    multiplierCategories: [
      { category: 'Rent Payments', multiplier: 1, description: '1x points on rent fee-free' },
      { category: 'Dining & Restaurants', multiplier: 3, description: '3x points on dining' },
      { category: 'Travel', multiplier: 2, description: '2x points on travel' },
    ],
  },
  {
    name: 'Apple Card',
    issuer: 'Goldman Sachs',
    last4: '8812',
    network: 'mastercard',
    balance: 85.0,
    creditLimit: 4500.0,
    statementCloseDate: 'Oct 31',
    statementCloseDays: 3,
    paymentDueDate: 'Nov 30',
    paymentDueDays: 32,
    colorHex: '#a1a1aa',
    multiplierCategories: [
      { category: 'Apple Purchases', multiplier: 3, description: '3% cash back on Apple' },
      { category: 'Apple Pay Swipes', multiplier: 2, description: '2% back using Apple Pay' },
    ],
  },
  {
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    last4: '5510',
    network: 'discover',
    balance: 92.0,
    creditLimit: 5000.0,
    statementCloseDate: 'Nov 14',
    statementCloseDays: 16,
    paymentDueDate: 'Dec 9',
    paymentDueDays: 41,
    colorHex: '#f97316',
    multiplierCategories: [
      { category: 'Rotating 5% Categories', multiplier: 5, description: '5% on quarterly categories' },
      { category: 'All other purchases', multiplier: 1, description: '1% flat cash back' },
    ],
  },
];

export const UploadCardsModal: React.FC<UploadCardsModalProps> = ({
  isOpen,
  onClose,
  cards,
  onUpdateCards,
  activeCardIds,
  onToggleActiveCard,
  customApiKey,
}) => {
  const [tab, setTab] = useState<'manage' | 'upload' | 'catalog'>('manage');
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle CSV or JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const formatted: CreditCard[] = parsed.map((item, idx) => ({
              id: `imported-${Date.now()}-${idx}`,
              name: item.name || 'Imported Card',
              issuer: item.issuer || 'Bank',
              last4: item.last4 || '1234',
              network: item.network || 'visa',
              balance: Number(item.balance) || 0,
              creditLimit: Number(item.creditLimit || item.limit) || 5000,
              statementCloseDate: item.statementCloseDate || 'Nov 15',
              statementCloseDays: 17,
              paymentDueDate: item.paymentDueDate || 'Dec 10',
              paymentDueDays: 42,
              colorHex: item.colorHex || '#64748b',
              multiplierCategories: item.multiplierCategories || [
                { category: 'General', multiplier: 1, description: '1% cash back' },
              ],
            }));
            onUpdateCards([...cards, ...formatted]);
            setUploadFeedback(`Successfully imported ${formatted.length} cards from JSON!`);
          }
        } else {
          // CSV Parsing: expects Name, Limit, Balance, Last4
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const newCards: CreditCard[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 2) {
              newCards.push({
                id: `csv-${Date.now()}-${i}`,
                name: cols[0] || `Card ${i}`,
                issuer: cols[1] || 'Bank',
                last4: cols[2] || '4000',
                network: 'visa',
                balance: parseFloat(cols[3]) || 0,
                creditLimit: parseFloat(cols[4]) || 5000,
                statementCloseDate: 'Nov 15',
                statementCloseDays: 17,
                paymentDueDate: 'Dec 10',
                paymentDueDays: 42,
                colorHex: '#475569',
                multiplierCategories: [
                  { category: 'General Spending', multiplier: 1.5, description: '1.5% flat back' },
                ],
              });
            }
          }
          if (newCards.length > 0) {
            onUpdateCards([...cards, ...newCards]);
            setUploadFeedback(`Successfully imported ${newCards.length} cards from CSV!`);
          }
        }
      } catch (err) {
        setUploadFeedback('Error reading file. Please check formatting.');
      }
    };
    reader.readAsText(file);
  };

  // Handle parsing pasted statements using backend Gemini API
  const handleParseStatementWithGemini = async () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    setUploadFeedback(null);

    try {
      const res = await fetch('/api/copilot/parse-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pastedText, customApiKey }),
      });
      const data = await res.json();
      if (Array.isArray(data.cards) && data.cards.length > 0) {
        const generated: CreditCard[] = data.cards.map((item: any, idx: number) => ({
          id: `ai-card-${Date.now()}-${idx}`,
          name: item.name || 'Extracted Card',
          issuer: item.issuer || 'Bank',
          last4: item.last4 || '5555',
          network: 'visa',
          balance: Number(item.balance) || 0,
          creditLimit: Number(item.creditLimit) || 5000,
          statementCloseDate: 'Nov 15',
          statementCloseDays: 17,
          paymentDueDate: 'Dec 10',
          paymentDueDays: 42,
          colorHex: '#3b82f6',
          multiplierCategories: [
            { category: 'General', multiplier: 1.5, description: item.primaryPerk || '1.5% back' },
          ],
        }));
        onUpdateCards([...cards, ...generated]);
        setPastedText('');
        setUploadFeedback(`Gemini AI successfully parsed & enrolled ${generated.length} card(s)!`);
      } else {
        setUploadFeedback('Could not find card details in text. Try adding manually.');
      }
    } catch (e) {
      setUploadFeedback('AI Parsing failed. Check API connection.');
    } finally {
      setIsParsing(false);
    }
  };

  // Add from popular catalog
  const handleAddPreset = (preset: Partial<CreditCard>) => {
    const newCard: CreditCard = {
      id: `preset-${Date.now()}`,
      name: preset.name || 'New Card',
      issuer: preset.issuer || 'Bank',
      last4: preset.last4 || '1234',
      network: preset.network || 'visa',
      balance: preset.balance || 0,
      creditLimit: preset.creditLimit || 5000,
      statementCloseDate: preset.statementCloseDate || 'Nov 15',
      statementCloseDays: preset.statementCloseDays || 17,
      paymentDueDate: preset.paymentDueDate || 'Dec 10',
      paymentDueDays: preset.paymentDueDays || 42,
      colorHex: preset.colorHex || '#475569',
      multiplierCategories: preset.multiplierCategories || [
        { category: 'General', multiplier: 1, description: '1% cash back' },
      ],
    };
    onUpdateCards([...cards, newCard]);
  };

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert('You must have at least one card enrolled for search recommendations.');
      return;
    }
    onUpdateCards(cards.filter((c) => c.id !== cardId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-xl rounded-xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                My Enrolled Credit Cards
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                The search bar will ONLY evaluate and recommend cards checked below
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-[#eae5df] dark:bg-[#262428] rounded-lg my-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setTab('manage')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all cursor-pointer ${
              tab === 'manage'
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Enrolled Cards ({activeCardIds.length}/{cards.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Upload CSV / Statement
          </button>
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all cursor-pointer ${
              tab === 'catalog'
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            + Card Catalog
          </button>
        </div>

        {uploadFeedback && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between">
            <span>{uploadFeedback}</span>
            <button
              type="button"
              onClick={() => setUploadFeedback(null)}
              className="text-xs hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Manage & Toggle Active Cards */}
        {tab === 'manage' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="p-2.5 bg-[#fbfaf8] dark:bg-[#28262a] rounded-lg border border-[#eeeae5] dark:border-[#333036] text-[11px] text-[#666666] dark:text-[#a0a0a0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Search Bar Filter:</strong> Only checked cards are considered when you ask "Which card should I swipe?". Unchecked cards are ignored.
              </span>
            </div>

            {cards.map((card) => {
              const isActive = activeCardIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'border-[#74455d] dark:border-[#c98bb1] bg-[#fdfbfd] dark:bg-[#282227]'
                      : 'border-[#eeeae5] dark:border-[#323035] bg-[#fbfaf8] dark:bg-[#272529] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => onToggleActiveCard(card.id)}
                      className="w-4 h-4 accent-[#74455d] rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#191919] dark:text-white">
                          {card.name}
                        </span>
                        <span className="text-[10px] text-[#8c8c8c] font-mono">•• {card.last4}</span>
                        {isActive ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium">
                            Active in search
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-0.5">
                        Limit: ${card.creditLimit.toLocaleString()} · Balance: ${card.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 rounded-md text-[#8c8c8c] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Upload CSV / Statement */}
        {tab === 'upload' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* File Drag and Drop */}
            <div className="border-2 border-dashed border-[#e4dfd8] dark:border-[#3a373d] rounded-xl p-5 text-center bg-[#fbfaf8] dark:bg-[#272529]">
              <Upload className="w-6 h-6 mx-auto text-[#74455d] dark:text-[#c98bb1] mb-2" />
              <div className="font-semibold text-[#191919] dark:text-white">
                Upload CSV or JSON Card Export
              </div>
              <p className="text-[11px] text-[#8c8c8c] mt-0.5">
                Columns: Card Name, Issuer, Last4, Balance, Credit Limit
              </p>
              <label className="mt-3 inline-block px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#74455d] text-white dark:bg-[#c98bb1] dark:text-[#181517] cursor-pointer hover:opacity-90">
                Browse Files
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Paste Statement with Gemini */}
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e]">
                Or Paste Statement / Card List (Parsed via Gemini AI)
              </label>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste account summary, e.g.:
Chase Sapphire Preferred •• 2288, Limit $9,000, 3x dining
Amex Gold •• 4011, Limit $12,000, $10 dining credit"
                className="w-full p-2.5 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-lg text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
              <button
                type="button"
                onClick={handleParseStatementWithGemini}
                disabled={isParsing || !pastedText.trim()}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsing ? 'Parsing with Gemini...' : 'Extract Cards with Gemini AI'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Catalog Presets */}
        {tab === 'catalog' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mb-1">
              Select any popular US card to add directly to your enrolled wallet:
            </p>
            {CATALOG_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-[#eeeae5] dark:border-[#323035] bg-[#fbfaf8] dark:bg-[#272529] hover:border-[#cfc7be]"
              >
                <div>
                  <div className="text-xs font-semibold text-[#191919] dark:text-white">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0]">
                    {preset.multiplierCategories?.[0]?.description}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] hover:bg-[#74455d]/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d] mt-3 shrink-0">
          <span className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
            {activeCardIds.length} of {cards.length} cards active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
