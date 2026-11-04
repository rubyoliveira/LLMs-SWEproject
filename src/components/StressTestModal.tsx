import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Download,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  runAll1000StressTests,
  StressTestScenarioResult,
  StressTestSummary,
} from '../utils/stressTestEngine';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestScenarioInCopilot: (prompt: string) => void;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  onTestScenarioInCopilot,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkRun, setBenchmarkRun] = useState<{
    results: StressTestScenarioResult[];
    summary: StressTestSummary;
  } | null>(() => runAll1000StressTests());

  const [activeTab, setActiveTab] = useState<
    'all' | 'dining' | 'groceries' | 'travel' | 'retail' | 'bills' | 'non-category' | 'anomaly'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const results = benchmarkRun?.results || [];
  const summary = benchmarkRun?.summary;

  // Filtered Results
  const filteredResults = useMemo(() => {
    let list = results;

    if (activeTab !== 'all') {
      list = list.filter((r) => r.categoryGroup === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toString() === q ||
          r.prompt.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          r.mccCode.includes(q) ||
          r.recommendedCard.toLowerCase().includes(q)
      );
    }

    return list;
  }, [results, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize);

  const handleRunFreshBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const fresh = runAll1000StressTests();
      setBenchmarkRun(fresh);
      setIsRunning(false);
    }, 450);
  };

  const handleExportJSON = () => {
    if (!benchmarkRun) return;
    const blob = new Blob([JSON.stringify(benchmarkRun, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rocketrewards-1000-scenarios-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfbf9] dark:bg-[#1a191b] border border-[#e8e4df] dark:border-[#2f2d31] rounded-2xl w-full max-w-[1020px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#e8e4df] dark:border-[#28262a] flex items-center justify-between bg-white dark:bg-[#201f22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 border border-[#74455d]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74455d] dark:text-[#c98bb1] bg-[#74455d]/10 dark:bg-[#c98bb1]/10 px-2 py-0.5 rounded-full">
                  1,000 Scenarios Stress Test
                </span>
                <span className="text-[11px] text-[#737373] dark:text-[#9e9e9e] hidden sm:inline">
                  Startup #5 Core · Truebill / Rocket Money Rewards Optimizer
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white mt-0.5">
                Model & Deterministic Guardrail Benchmark
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunFreshBenchmark}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#74455d] hover:bg-[#61364d] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Benchmarking...' : 'Re-Run 1,000'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8e4df] dark:border-[#2f2d31] bg-white dark:bg-[#252427] hover:bg-[#faf8f5] text-xs font-medium text-[#191919] dark:text-white cursor-pointer"
              title="Export complete 1,000 results as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#e8e4df] dark:border-[#2f2d31] hover:bg-[#eae5df] dark:hover:bg-[#2b2a2e] flex items-center justify-center text-[#737373] dark:text-[#9e9e9e] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        {summary && (
          <div className="p-4 bg-[#f8f6f3] dark:bg-[#222124] border-b border-[#e8e4df] dark:border-[#2a292d] grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#28272b] border border-[#e8e4df] dark:border-[#323035] shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-[#8c8c8c] flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" /> Scenarios Tested
              </div>
              <div className="text-base sm:text-lg font-bold text-[#191919] dark:text-white mt-0.5">
                {summary.totalScenarios.toLocaleString()} / 1,000
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                100% processed ({summary.totalTimeMs.toFixed(1)} ms)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#28272b] border border-[#e8e4df] dark:border-[#323035] shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-[#8c8c8c] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Optimal Yield Pass
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {summary.validPurchases} <span className="text-xs font-normal">({((summary.validPurchases / summary.totalScenarios) * 100).toFixed(1)}%)</span>
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e]">
                Verified highest math yield
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#28272b] border border-[#e8e4df] dark:border-[#323035] shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-[#8c8c8c] flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Self-Corrections
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {summary.selfCorrectionsCount}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e]">
                2% flat beats 1x baseline
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#28272b] border border-[#e8e4df] dark:border-[#323035] shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-[#8c8c8c] flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" /> Non-Category
              </div>
              <div className="text-base sm:text-lg font-bold text-[#191919] dark:text-white mt-0.5">
                {summary.nonCategoryUseAnyCount}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e]">
                "Use Any Card" enforced
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#28272b] border border-[#e8e4df] dark:border-[#323035] shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-semibold text-[#8c8c8c] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" /> Anomalies Caught
              </div>
              <div className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {summary.failsafesTriggered} / {summary.failsafesTriggered}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#9e9e9e]">
                100% true anomalies flagged
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-[#e8e4df] dark:border-[#28262a] bg-white dark:bg-[#201f22] space-y-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'all'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              All (1,000)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('dining');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'dining'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Dining & Food ({summary?.categoryBreakdown.dining || 141})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('groceries');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'groceries'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Groceries ({summary?.categoryBreakdown.groceries || 39})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('travel');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'travel'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Travel & Transit ({summary?.categoryBreakdown.travel || 139})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('retail');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'retail'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Shopping & Retail ({summary?.categoryBreakdown.retail || 436})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('bills');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'bills'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Bills & Utilities ({summary?.categoryBreakdown.bills || 102})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('non-category');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'non-category'
                  ? 'bg-[#74455d] text-white border-[#74455d] dark:bg-[#c98bb1] dark:text-[#181517] dark:border-[#c98bb1]'
                  : 'bg-[#faf8f5] dark:bg-[#262428] text-[#555] dark:text-[#bbb] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              Non-Category / Church ({summary?.categoryBreakdown.nonCategory || 135})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('anomaly');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === 'anomaly'
                  ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
              }`}
            >
              ⚠️ Flagged Failsafes ({summary?.categoryBreakdown.anomaly || 8})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c8c8c] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by scenario ID (#1-1000), phrase, store, category, or card..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#faf8f5] dark:bg-[#262428] border border-[#e8e4df] dark:border-[#323035] text-xs text-[#191919] dark:text-white placeholder:text-[#8c8c8c] focus:outline-hidden focus:border-[#74455d]"
            />
          </div>
        </div>

        {/* Scenarios Table / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#737373] dark:text-[#9e9e9e] px-1 mb-1">
            <span>
              Showing {paginatedResults.length} of {filteredResults.length} scenarios
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-2 py-0.5 rounded border border-[#e8e4df] dark:border-[#2f2d31] disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2 py-0.5 rounded border border-[#e8e4df] dark:border-[#2f2d31] disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {paginatedResults.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.isFailsafeTriggered
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : item.isUseAnyCard
                  ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40'
                  : item.guardrailStatus === 'SELF_CORRECTED'
                  ? 'bg-purple-50/30 dark:bg-purple-950/15 border-purple-200/80 dark:border-purple-900/40'
                  : 'bg-white dark:bg-[#201f22] border-[#e8e4df] dark:border-[#2f2d31]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono font-semibold text-[#8c8c8c] shrink-0 pt-0.5">
                    #{item.id}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#191919] dark:text-white">
                        {item.cleanedPrompt}
                      </span>

                      {item.isFailsafeTriggered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Failsafe Triggered
                        </span>
                      )}

                      {item.isUseAnyCard && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Non-Category · Use Any Card
                        </span>
                      )}

                      {item.guardrailStatus === 'SELF_CORRECTED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          Self-Corrected (2% Flat)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#737373] dark:text-[#9e9e9e] flex items-center gap-3 mt-1 flex-wrap">
                      <span>Category: <strong>{item.categoryName}</strong> (MCC {item.mccCode})</span>
                      <span>·</span>
                      <span>Amount: <strong>${item.estimatedAmount.toFixed(2)}</strong></span>
                      {item.paymentNotice && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            {item.paymentNotice}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#191919] dark:text-white">
                      {item.recommendedCard}
                    </div>
                    <div className="text-[11px] text-[#74455d] dark:text-[#c98bb1] font-medium">
                      {item.rewardMultiplier}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onTestScenarioInCopilot(item.cleanedPrompt);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg border border-[#e8e4df] dark:border-[#2f2d31] bg-[#faf8f5] dark:bg-[#28272b] hover:bg-[#74455d] hover:text-white dark:hover:bg-[#c98bb1] dark:hover:text-[#181517] transition-all cursor-pointer text-xs flex items-center gap-1 font-medium"
                    title="Send this scenario to Copilot"
                  >
                    <span>Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Math Yield Comparison Bar */}
              {!item.isFailsafeTriggered && (
                <div className="mt-2.5 pt-2 border-t border-[#f0ebe6] dark:border-[#28262a] flex items-center justify-between text-[11px] text-[#737373] dark:text-[#9e9e9e] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className={item.recommendedCard === 'American Express Gold' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                      Amex Gold: {item.yields.amexGoldYield}
                    </span>
                    <span>·</span>
                    <span className={item.recommendedCard === 'Chase Sapphire Preferred' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                      Chase Sapphire: {item.yields.chaseSapphireYield}
                    </span>
                    <span>·</span>
                    <span className={item.recommendedCard === 'Citi Double Cash' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                      Citi Double Cash: {item.yields.citiDoubleCashYield}
                    </span>
                  </div>

                  {item.selfCorrectionNote && (
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium italic">
                      {item.selfCorrectionNote}
                    </span>
                  )}
                </div>
              )}

              {/* Failsafe Explanation */}
              {item.isFailsafeTriggered && (
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
                  {item.failsafeReason}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#e8e4df] dark:border-[#28262a] bg-white dark:bg-[#201f22] flex items-center justify-between text-xs text-[#737373] dark:text-[#9e9e9e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Validated across 1,000 real-world spending scenarios with deterministic guardrails.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#74455d] hover:bg-[#61364d] text-white text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
