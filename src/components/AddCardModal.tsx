import React, { useState } from 'react';
import {
  X,
  Plus,
  CreditCard as CardIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Wifi,
  Lock,
  Check,
  HelpCircle,
} from 'lucide-react';
import { CreditCard } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CreditCard) => void;
  onOpenPlaid?: () => void;
}

interface CardColorTheme {
  id: string;
  name: string;
  gradientClass: string;
  hex: string;
}

const CARD_THEMES: CardColorTheme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    gradientClass: 'bg-gradient-to-br from-[#1e2025] via-[#15171b] to-[#0d0e11] text-white border-white/10',
    hex: '#1e2025',
  },
  {
    id: 'burgundy',
    name: 'Plum',
    gradientClass: 'bg-gradient-to-br from-[#591c3c] via-[#43142d] to-[#260918] text-white border-[#c98bb1]/20',
    hex: '#591c3c',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    gradientClass: 'bg-gradient-to-br from-[#153462] via-[#0e2444] to-[#081528] text-white border-blue-400/20',
    hex: '#153462',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    gradientClass: 'bg-gradient-to-br from-[#134434] via-[#0d2f24] to-[#061a14] text-white border-emerald-400/20',
    hex: '#134434',
  },
  {
    id: 'gold',
    name: 'Gold',
    gradientClass: 'bg-gradient-to-br from-[#7d5f2a] via-[#5c441b] to-[#36270d] text-white border-amber-300/20',
    hex: '#7d5f2a',
  },
];

const PRESET_PERKS = [
  { label: '🍽️ 4x Dining & 4x Groceries', cat: 'Dining & Restaurants', mult: 4, desc: '4x points on dining worldwide and US supermarkets' },
  { label: '✈️ 3x Flights & 3x Travel', cat: 'Flights & Travel', mult: 3, desc: '3x points on flights and prepaid hotels' },
  { label: '⚡ Flat 2% Cash Back', cat: 'All Purchases', mult: 2, desc: 'Unlimited 2% cash back on all everyday spend' },
  { label: '🛒 3x Online & Supermarkets', cat: 'US Supermarkets', mult: 3, desc: '3% cash back on groceries and online retail' },
  { label: '🚗 3x Gas & Transit', cat: 'Transit & Rideshare', mult: 3, desc: '3x points on gas stations, rideshare & subways' },
];

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard, onOpenPlaid }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardNickname, setCardNickname] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');
  const [selectedTheme, setSelectedTheme] = useState<CardColorTheme>(CARD_THEMES[0]);
  const [selectedPerkIndex, setSelectedPerkIndex] = useState(0);
  const [showCvv, setShowCvv] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      const month = parseInt(raw.slice(0, 2), 10);
      if (month > 12) {
        raw = '12' + raw.slice(2);
      } else if (month === 0 && raw.length === 2) {
        raw = '01';
      }
    }
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Format CVV (3-4 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  // Detect Network
  const detectNetwork = (num: string): { network: 'visa' | 'mastercard' | 'amex' | 'discover'; label: string } => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return { network: 'visa', label: 'VISA' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { network: 'mastercard', label: 'MASTERCARD' };
    if (/^(34|37)/.test(clean)) return { network: 'amex', label: 'AMEX' };
    if (/^(6011|65|64[4-9])/.test(clean)) return { network: 'discover', label: 'DISCOVER' };
    return { network: 'visa', label: 'VISA' };
  };

  const detected = detectNetwork(cardNumber);

  // Quick fill sample card helper
  const handleFillDemoCard = (type: 'chase' | 'amex' | 'apple') => {
    if (type === 'chase') {
      setCardholderName('ALEX MORGAN');
      setCardNumber('4147 2024 8839 5012');
      setExpiry('08/28');
      setCvv('389');
      setCardNickname('Chase Sapphire Preferred');
      setCreditLimit('10000');
      setSelectedTheme(CARD_THEMES[2]); // sapphire
      setSelectedPerkIndex(1); // 3x Flights & Travel
    } else if (type === 'amex') {
      setCardholderName('JORDAN LEE');
      setCardNumber('3782 822468 01005');
      setExpiry('11/27');
      setCvv('4219');
      setCardNickname('Amex Gold Card');
      setCreditLimit('15000');
      setSelectedTheme(CARD_THEMES[4]); // gold
      setSelectedPerkIndex(0); // 4x Dining & Groceries
    } else {
      setCardholderName('SAM TAYLOR');
      setCardNumber('5412 7512 3412 7721');
      setExpiry('04/29');
      setCvv('712');
      setCardNickname('Capital One Savor');
      setCreditLimit('7500');
      setSelectedTheme(CARD_THEMES[1]); // plum
      setSelectedPerkIndex(0); // Dining
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\D/g, '');
    const last4 = cleanNumber.length >= 4 ? cleanNumber.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
    const chosenPerk = PRESET_PERKS[selectedPerkIndex];

    const cardName = cardNickname.trim()
      ? cardNickname.trim()
      : `${detected.label} ${cardholderName ? cardholderName.split(' ')[0] : 'Rewards'}`;

    const newCard: CreditCard = {
      id: `card-${Date.now()}`,
      name: cardName,
      issuer: detected.label,
      last4,
      network: detected.network,
      balance: 0,
      creditLimit: parseFloat(creditLimit) || 5000,
      statementCloseDate: 'Nov 20',
      statementCloseDays: 18,
      paymentDueDate: 'Dec 15',
      paymentDueDays: 43,
      colorHex: selectedTheme.hex,
      multiplierCategories: [
        {
          category: chosenPerk.cat,
          multiplier: chosenPerk.mult,
          description: chosenPerk.desc,
        },
        {
          category: 'General',
          multiplier: 1,
          description: '1x base points on all other purchases',
        },
      ],
    };

    onAddCard(newCard);
    onClose();
  };

  // Format display card number
  const rawClean = cardNumber.replace(/\D/g, '');
  const displayBlocks = [
    rawClean.slice(0, 4).padEnd(4, '•'),
    rawClean.slice(4, 8).padEnd(4, '•'),
    rawClean.slice(8, 12).padEnd(4, '•'),
    rawClean.slice(12, 16).padEnd(4, '•'),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#191919] dark:text-white">
                Add Payment Card to Wallet
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Enter card number, expiry, and CVV for real-time rewards & safe spend matching
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PLAID INSTANT CONNECT OPTION */}
        {onOpenPlaid && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#191919] to-[#2a272e] dark:from-[#2a272e] dark:to-[#191919] text-white flex items-center justify-between gap-3 mb-4 shadow-sm border border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white text-[#111] flex items-center justify-center font-black text-xs shrink-0">
                ☵
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Connect with Plaid</span>
                  <span className="text-[9px] px-1 py-0.2 rounded-xs bg-amber-400 text-black font-extrabold uppercase">
                    Instant
                  </span>
                </div>
                <div className="text-[10px] text-white/75 truncate">
                  Auto-sync balances, limit & rewards from Chase, Amex, Citi, Capital One
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPlaid();
              }}
              className="py-1.5 px-3 rounded-lg bg-[#c98bb1] hover:bg-[#b57a9e] text-[#191919] font-bold text-xs tracking-tight shrink-0 transition-colors cursor-pointer"
            >
              Launch Plaid
            </button>
          </div>
        )}

        {/* Quick Demo Pre-fill Toolbar */}
        <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#fbfaf8] dark:bg-[#272529] border border-[#eee9e2] dark:border-[#333036] mb-4 text-[11px]">
          <span className="flex items-center gap-1 text-[#737373] dark:text-[#9e9e9e] font-medium shrink-0">
            <Sparkles className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" />
            Quick Demo:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemoCard('chase')}
              className="px-2 py-1 rounded-md bg-white dark:bg-[#343236] border border-[#e4dfd8] dark:border-[#423f46] text-[#333333] dark:text-[#e0e0e0] font-medium hover:border-[#74455d] dark:hover:border-[#c98bb1] transition-colors cursor-pointer text-[10px]"
            >
              Chase Sapphire
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoCard('amex')}
              className="px-2 py-1 rounded-md bg-white dark:bg-[#343236] border border-[#e4dfd8] dark:border-[#423f46] text-[#333333] dark:text-[#e0e0e0] font-medium hover:border-[#74455d] dark:hover:border-[#c98bb1] transition-colors cursor-pointer text-[10px]"
            >
              Amex Gold
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoCard('apple')}
              className="px-2 py-1 rounded-md bg-white dark:bg-[#343236] border border-[#e4dfd8] dark:border-[#423f46] text-[#333333] dark:text-[#e0e0e0] font-medium hover:border-[#74455d] dark:hover:border-[#c98bb1] transition-colors cursor-pointer text-[10px]"
            >
              SavorOne
            </button>
          </div>
        </div>

        {/* Live Interactive Card Graphic */}
        <div className="mb-5 perspective">
          <div
            className={`w-full aspect-[1.586/1] max-w-[340px] mx-auto rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all duration-300 border ${selectedTheme.gradientClass}`}
          >
            {/* Background subtle textures */}
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-30 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            {!isFlipped ? (
              /* Front of Card */
              <div className="flex flex-col justify-between h-full relative z-10">
                {/* Top Row: Chip, Contactless, Network */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Metallic EMV Chip SVG */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#e6c987] via-[#d4af37] to-[#aa8010] p-[1px] shadow-sm flex items-center justify-center">
                      <div className="w-full h-full rounded-[4px] border border-amber-800/40 grid grid-cols-2 gap-0.5 p-0.5">
                        <div className="border-r border-b border-amber-900/30" />
                        <div className="border-b border-amber-900/30" />
                        <div className="border-r border-amber-900/30" />
                        <div />
                      </div>
                    </div>
                    {/* NFC Waves */}
                    <Wifi className="w-4 h-4 text-white/60 rotate-90" />
                  </div>

                  {/* Network Logo Badge */}
                  <div className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs border border-white/20 font-black text-xs tracking-wider">
                    {detected.label}
                  </div>
                </div>

                {/* Card Number formatted in blocks */}
                <div className="my-auto py-2">
                  <div className="font-mono text-sm sm:text-lg tracking-[0.2em] font-semibold text-white/95 flex items-center justify-between">
                    <span>{displayBlocks[0]}</span>
                    <span>{displayBlocks[1]}</span>
                    <span>{displayBlocks[2]}</span>
                    <span>{displayBlocks[3]}</span>
                  </div>
                </div>

                {/* Bottom Row: Name, Expiry, and CVV Quick Peek */}
                <div className="flex items-end justify-between pt-1 text-[11px] font-mono">
                  <div>
                    <div className="text-[9px] text-white/60 uppercase tracking-widest font-sans font-medium">
                      Cardholder Name
                    </div>
                    <div className="font-semibold tracking-wider text-white truncate max-w-[170px] uppercase">
                      {cardholderName.trim() || 'YOUR NAME'}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-[9px] text-white/60 uppercase tracking-widest font-sans font-medium">
                        Expires
                      </div>
                      <div className="font-semibold text-white tracking-wider">
                        {expiry || 'MM/YY'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFlipped(true)}
                      className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white/80 font-sans cursor-pointer transition-colors"
                      title="Flip to back"
                    >
                      CVC ⟳
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Back of Card */
              <div className="flex flex-col justify-between h-full relative z-10 text-white">
                {/* Magnetic Strip */}
                <div className="-mx-5 -mt-2 h-9 bg-black/80" />

                {/* Signature and CVV Strip */}
                <div className="my-auto space-y-2">
                  <div className="flex items-center justify-end bg-white/90 text-black px-3 py-1.5 rounded-sm font-mono text-xs">
                    <span className="text-[10px] text-neutral-500 mr-2 font-sans">Authorized Signature</span>
                    <span className="font-bold tracking-widest bg-yellow-100 px-2 py-0.5 text-neutral-900 border border-neutral-300">
                      {cvv || '•••'}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/60 leading-tight">
                    This card is property of issuer. For customer service call the number on back.
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px] font-medium text-white cursor-pointer"
                  >
                    Front ⟳
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Cardholder Name */}
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs text-[#191919] dark:text-white uppercase focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] transition-colors"
            />
          </div>

          {/* Card Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e]">
                Card Number
              </label>
              <span className="text-[10px] font-medium text-[#74455d] dark:text-[#c98bb1]">
                {detected.label} Detected
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-full px-3 py-2 pr-9 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs font-mono text-[#191919] dark:text-white tracking-wider focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <CardIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Expiration Date and CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
                Expiration Date (MM/YY)
              </label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs font-mono text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e]">
                  Security Code (CVV)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="text-[10px] text-[#737373] dark:text-[#9e9e9e] hover:text-[#191919] dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showCvv ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showCvv ? 'text' : 'password'}
                  required
                  placeholder="3 or 4 digits"
                  value={cvv}
                  onChange={handleCvvChange}
                  maxLength={4}
                  className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs font-mono text-[#191919] dark:text-white tracking-widest focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card Nickname & Credit Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
                Card Nickname (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chase Sapphire"
                value={cardNickname}
                onChange={(e) => setCardNickname(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1">
                Credit Limit ($)
              </label>
              <input
                type="number"
                min="300"
                step="100"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbfaf8] dark:bg-[#272529] border border-[#e4dfd8] dark:border-[#38353a] rounded-xl text-xs text-[#191919] dark:text-white focus:outline-hidden focus:border-[#74455d] dark:focus:border-[#c98bb1]"
              />
            </div>
          </div>

          {/* Card Reward Category Selector */}
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1.5">
              Primary Reward Superpower (For Optimizer)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#fbfaf8] dark:bg-[#272529] rounded-xl border border-[#eee9e2] dark:border-[#333036]">
              {PRESET_PERKS.map((perk, idx) => (
                <button
                  key={perk.label}
                  type="button"
                  onClick={() => setSelectedPerkIndex(idx)}
                  className={`p-2 rounded-lg text-left text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                    selectedPerkIndex === idx
                      ? 'bg-white dark:bg-[#343236] border border-[#74455d] dark:border-[#c98bb1] shadow-xs text-[#191919] dark:text-white font-medium'
                      : 'border border-transparent text-[#666666] dark:text-[#9e9e9e] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{perk.label}</span>
                  {selectedPerkIndex === idx && (
                    <Check className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1] shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Card Color Theme Picker */}
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#9e9e9e] mb-1.5">
              Card Color Sheen
            </label>
            <div className="flex items-center gap-2">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer border ${
                    selectedTheme.id === theme.id
                      ? 'border-[#74455d] dark:border-[#c98bb1] bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1]'
                      : 'border-[#e4dfd8] dark:border-[#38353a] text-[#737373] dark:text-[#9e9e9e] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Security & Sandbox Reassurance Banner */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#f0ebe6]/60 dark:bg-[#252427] border border-[#e8e4df] dark:border-[#2f2d31] text-[10px] text-[#666666] dark:text-[#a0a0a0] leading-normal">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Local Sandbox Vault:</strong> Card numbers and codes are safely stored only in your browser for rewards calculation. No real card authorization or charges are ever performed.
            </span>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#666666] dark:text-[#a0a0a0] hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add & Enroll Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
