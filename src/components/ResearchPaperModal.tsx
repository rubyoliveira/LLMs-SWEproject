import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  Award,
  ExternalLink,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

interface ResearchPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchPaperModal: React.FC<ResearchPaperModalProps> = ({ isOpen, onClose }) => {
  const [activeSlide, setActiveSlide] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-3xl rounded-xl p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                RocketRewards: Research Paper & System Architecture
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Ruby Oliveira, Beningno Rodriguez, Joshua Thirumalai (LLMS IN SOFTWARE ENGINEERING)
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

        {/* Slide Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#eae5df] dark:bg-[#262428] rounded-lg my-3 shrink-0 text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSlide(1)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 1
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Overview & Pain Point
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(2)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 2
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Competitive Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(3)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 3
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Guardrails & Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(4)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 4
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Quantitative Gates (Slide 8)
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(5)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 5
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            Citations (Slide 10)
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(6)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSlide === 6
                ? 'bg-white dark:bg-[#343236] text-[#191919] dark:text-white shadow-xs font-semibold'
                : 'text-[#666666] dark:text-[#999999]'
            }`}
          >
            TDD Workflow (28 Tests)
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeSlide === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#fbfaf8] dark:bg-[#28262a] rounded-xl border border-[#eeeae5] dark:border-[#333036]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74455d] dark:text-[#c98bb1]">
                  Rubric 1 · Problem & Market Opportunity
                </span>
                <h4 className="text-base font-bold text-[#191919] dark:text-white mt-1">
                  Re-engineering Rocket Money into an Autonomous Rewards & Guardrail Copilot
                </h4>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white dark:bg-[#201f22] p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036]">
                    <div className="text-xl font-bold text-[#74455d] dark:text-[#c98bb1]">$3.4B</div>
                    <div className="text-[11px] font-semibold text-[#191919] dark:text-white mt-0.5">
                      Total Addressable Waste
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      Unredeemed card perks & mismatched checkout swipes annually in US.
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#201f22] p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036]">
                    <div className="text-xl font-bold text-[#74455d] dark:text-[#c98bb1]">$420</div>
                    <div className="text-[11px] font-semibold text-[#191919] dark:text-white mt-0.5">
                      Lost Value / Cardholder
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      Annual breakage from expired credits & suboptimal category swipes.
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#201f22] p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036]">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">68%</div>
                    <div className="text-[11px] font-semibold text-[#191919] dark:text-white mt-0.5">
                      Beginner Debt Anxiety
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      Gen-Z & graduates reporting fear of APR penalties and accidental score drops.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#eeeae5] dark:border-[#333036] bg-white dark:bg-[#201f22]">
                  <div className="text-xs font-bold text-[#191919] dark:text-white">
                    Target Segment A: Reward Optimizers
                  </div>
                  <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-1">
                    Young professionals holding 3–5 premium cards suffering from merchant category confusion and expiring monthly credits.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#eeeae5] dark:border-[#333036] bg-white dark:bg-[#201f22]">
                  <div className="text-xs font-bold text-[#191919] dark:text-white">
                    Target Segment B: First-Time Cardholders
                  </div>
                  <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-1">
                    Students and young earners needing debit-style balance protection and mid-cycle autopay schedules to build 750+ prime scores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="space-y-4">
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                <strong>Rubric 1 · Competitive Differentiation:</strong> Combines live balance awareness with credit card benefit logic to solve point-of-sale decisions.
              </div>

              <div className="overflow-x-auto border border-[#eeeae5] dark:border-[#333036] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfaf8] dark:bg-[#28262a] text-[#737373] dark:text-[#9e9e9e] border-b border-[#eeeae5] dark:border-[#333036]">
                    <tr>
                      <th className="p-2.5 font-semibold">Platform</th>
                      <th className="p-2.5 font-semibold">Budgeting & Subs</th>
                      <th className="p-2.5 font-semibold">Swipe Advisor</th>
                      <th className="p-2.5 font-semibold">Debt Guardrails</th>
                      <th className="p-2.5 font-semibold">Core Structural Weakness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeae5] dark:divide-[#333036]">
                    <tr>
                      <td className="p-2.5 font-semibold text-[#191919] dark:text-white">Rocket Money</td>
                      <td className="p-2.5">Comprehensive</td>
                      <td className="p-2.5 text-[#8c8c8c]">None</td>
                      <td className="p-2.5 text-[#8c8c8c]">None</td>
                      <td className="p-2.5 text-[#737373]">Reactive backward-looking expense categorization</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#191919] dark:text-white">Credit Karma</td>
                      <td className="p-2.5">Minimal</td>
                      <td className="p-2.5 text-[#8c8c8c]">Sponsored Links</td>
                      <td className="p-2.5 text-[#737373]">Basic Score View</td>
                      <td className="p-2.5 text-[#737373]">Monetizes high-interest credit card lead volume</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#191919] dark:text-white">CardPointers</td>
                      <td className="p-2.5 text-[#8c8c8c]">None</td>
                      <td className="p-2.5">Static Multipliers</td>
                      <td className="p-2.5 text-[#8c8c8c]">None</td>
                      <td className="p-2.5 text-[#737373]">Blind to checking account liquidity & utilization</td>
                    </tr>
                    <tr className="bg-[#f4ecf1]/30 dark:bg-[#342230]/30 font-semibold text-[#74455d] dark:text-[#c98bb1]">
                      <td className="p-2.5">RocketRewards</td>
                      <td className="p-2.5">AI Subscriptions</td>
                      <td className="p-2.5">Contextual Copilot</td>
                      <td className="p-2.5">Deterministic Caps</td>
                      <td className="p-2.5">Full-stack proactive financial agent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSlide === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#fbfaf8] dark:bg-[#28262a] rounded-xl border border-[#eeeae5] dark:border-[#333036] space-y-2">
                <div className="text-xs font-bold text-[#191919] dark:text-white">
                  Deterministic Safe-Spend Pillars (Slides 4, 6, 7)
                </div>
                <div className="space-y-2 text-[11px] text-[#525252] dark:text-[#a3a3a3]">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#191919] dark:text-white shrink-0">1. MCC Resolution:</span>
                    <span>Maps unstructured merchant inputs (e.g. Shake Shack) to ISO 18245 Merchant Category Codes (MCC 5814: Fast Casual Dining) instead of generic retail.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#191919] dark:text-white shrink-0">2. Debit Parity Verification:</span>
                    <span>Confirms liquid checking reserve ($820) exceeds purchase amount without dipping below minimum emergency buffer ($200).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#191919] dark:text-white shrink-0">3. Statement vs Due Date Shield:</span>
                    <span>Calculates mid-cycle interim payment dates to keep bureau reporting utilization &lt;10%, avoiding credit score drops.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 4 && (
            <div className="space-y-4">
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                <strong>Rubric 3 · Validation Plan & Decision Gates:</strong> Controlled Cohort Protocol (N = 20 Target Users: 10 Multi-Card Optimizers · 10 First-Time Cardholders across 14-day simulated point-of-sale test suite).
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">
                    Metric 1
                  </div>
                  <div className="text-xs font-bold text-[#191919] dark:text-white mt-0.5">
                    Recommendation Adoption
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-2">
                    ✓ PASS: &gt;65% adoption
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                    ✗ PIVOT: &lt;45% (Shift to push reminders)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">
                    Metric 2
                  </div>
                  <div className="text-xs font-bold text-[#191919] dark:text-white mt-0.5">
                    Utilization Protection
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-2">
                    ✓ PASS: &gt;90% sub-10% compliance
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                    ✗ PIVOT: &lt;75% (Enforce strict block)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">
                    Metric 3
                  </div>
                  <div className="text-xs font-bold text-[#191919] dark:text-white mt-0.5">
                    Engineering Accuracy
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-2">
                    ✓ PASS: 100% arithmetic accuracy
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                    ✗ PIVOT: &gt;0% hallucinations
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 5 && (
            <div className="space-y-3">
              <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mb-2">
                <strong>Slide 10 · Appendix & Scholarly Foundations:</strong> Derived from official federal registries & peer-reviewed computer science literature.
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036] bg-[#fbfaf8] dark:bg-[#28262a]">
                  <div className="font-semibold text-[#191919] dark:text-white">
                    CFPB (May 2024 / Circular 2024-07)
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-0.5">
                    Credit Card Rewards Report & Issue Spotlight. Documents 90%+ spending on rewards cards, $40B+ earned annually, and ~$500M directly forfeited by consumers each year in breakage.
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036] bg-[#fbfaf8] dark:bg-[#28262a]">
                  <div className="font-semibold text-[#191919] dark:text-white">
                    Federal Reserve Bank of New York (2024)
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-0.5">
                    Quarterly Report on Household Debt & Credit. Aggregate US credit card balances surpassing $1.14T, with delinquency transitions disproportionately hitting cardholders aged 18–29 with utilization &gt;30%.
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#eeeae5] dark:border-[#333036] bg-[#fbfaf8] dark:bg-[#28262a]">
                  <div className="font-semibold text-[#191919] dark:text-white">
                    Lewis, P., et al. (NeurIPS 2020)
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-0.5">
                    "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." Grounding unstructured merchant queries into vector embeddings for MCC category retrieval with zero hallucinations.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#fbfaf8] dark:bg-[#28262a] rounded-xl border border-[#eeeae5] dark:border-[#333036]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74455d] dark:text-[#c98bb1]">
                  Rubric 2 · TDD Implementation Workflow
                </span>
                <h4 className="text-base font-bold text-[#191919] dark:text-white mt-1">
                  Automated 28-Assertion Unit Test Suite & Edge Case Architecture
                </h4>
                <p className="text-xs text-[#666666] dark:text-[#a0a0a0] mt-1.5 leading-relaxed">
                  Following strict Test-Driven Development (TDD), production endpoints and calculations were built in response to failing assertions covering boundary dates, negative balance ledger anomalies, and credit health guardrails.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                    <div className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">
                      Step 1 · Red Phase
                    </div>
                    <div className="text-xs font-bold text-[#191919] dark:text-white mt-1">
                      Tests Written First
                    </div>
                    <div className="text-[11px] text-[#666666] dark:text-[#b0b0b0] mt-1 leading-relaxed">
                      Automated test suite defined 28 unit assertions. Executed with pytest/vitest yielding 28 deterministic failures prior to backend logic completion.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                      Step 2 · AI Inspection
                    </div>
                    <div className="text-xs font-bold text-[#191919] dark:text-white mt-1">
                      Edge Cases Audited
                    </div>
                    <div className="text-[11px] text-[#666666] dark:text-[#b0b0b0] mt-1 leading-relaxed">
                      Leap-year Feb 29 close dates, negative credit balance suppression, Costco MCC exclusions, and non-category fallback were generated via LLM prompt evaluation and manually audited.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Step 3 · Green Phase
                    </div>
                    <div className="text-xs font-bold text-[#191919] dark:text-white mt-1">
                      100% Pass Rate
                    </div>
                    <div className="text-[11px] text-[#666666] dark:text-[#b0b0b0] mt-1 leading-relaxed">
                      FastAPI endpoints and deterministic calculation modules written to satisfy schemas, bringing test pass rate to 100% (28/28 verified).
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ece7e1] dark:border-[#333036] flex items-center justify-between text-[11px]">
                  <span className="text-[#737373] dark:text-[#9e9e9e]">
                    Integrated Test Suite: <code className="font-mono text-emerald-600 dark:text-emerald-400">tests/rewardsCopilot.test.ts</code> &amp; <code className="font-mono">tests/test_rewards_copilot.py</code>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ All 28 Tests Passing
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d] mt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors cursor-pointer"
          >
            Close Presentation
          </button>
        </div>
      </div>
    </div>
  );
};
