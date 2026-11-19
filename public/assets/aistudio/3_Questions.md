Current moats:

All math (rewards, utilization, safe-spend) is computed in code, not by the LLM, so no number hallucinations
Safe-spend guardrail for first-time cardholders (keeps utilization under 10%, checks checking balance)
1,000-scenario stress test and 28 unit assertions that verify correctness
Recommendations limited to the cards the user actually has
