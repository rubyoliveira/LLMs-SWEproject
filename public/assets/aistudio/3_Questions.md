Current moats:

- All math (rewards, utilization, safe-spend) is computed in code, not by the LLM, so no number hallucinations
- Safe-spend guardrail for first-time cardholders (keeps utilization under 10%, checks checking balance)
- 1,000-scenario stress test and 28 unit assertions that verify correctness
- Recommendations limited to the cards the user actually has
- A maintained card terms database

How will we validate the output of the LLM we are using?
- Adding questions where the LLM asks if the actions it is doing are okay with the user.
- Reject any recommended card that isn’t in the user’s enrolled cards.
- Check the catalog against issuer terms and current usage, because stale multipliers make correct math give wrong advice.

How good is our system?
- We need trackers of the time it takes to run
- We need validators with real card data and user data
- We need correlation variables for the card matching

To tell if the LLM’s card pick is better, compute the answer in code:

For each purchase, calculate every card’s value (amount × multiplier × point value, plus credits, minus caps and fees). The highest-value card is the correct answer.
Count it correct if it matches the top card, and record the dollars lost if it doesn’t.
Test category errors (Costco treated as grocery) separately from ranking errors.
Verify multipliers and credits against issuer terms, and have a person review cases where the LLM and the calculation disagree.
Run a full month of transactions and report the share of maximum possible rewards captured, scored the same way for the plain-prompt LLM and the competitor.
