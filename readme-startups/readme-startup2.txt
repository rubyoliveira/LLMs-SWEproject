2. Codecademy (AI Interview Grader)

Solves one problem: Provides real-time, qualitative feedback for coding interview prep.

Target customers: CS students and tech job seekers.

Infrastructure: Basic web app and LLM API integration.

Reimagines space: Upgrades static pass/fail code execution to dynamic, interactive interview coaching.

LLM Core: LLM acts as the interviewer, evaluating code logic, readability, and edge-case handling.

Validation Guardrail: User code and LLM-generated hints must pass a deterministic compiler/linter before being shown.

Self-Correction: If the LLM generates syntactically invalid code hints, the linter catches it and prompts the LLM to rewrite the hint.

Deployability: Highly deployable via a standard web interface.
