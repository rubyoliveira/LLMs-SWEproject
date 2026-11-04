# RocketRewards: The AI Financial & Card Copilot

> **Re-engineering Rocket Money into an autonomous credit rewards optimizer and debit-style debt guardrail.**  
> *Ruby Oliveira, Beningno Rodriguez, Joshua Thirumalai (LLMS IN SOFTWARE ENGINEERING)*

Built using **Version C (Muted Plum)** with clean **Notion Sans** typography.

---

## Key Features

1. **Deterministic LLM Tool Calling & MCC Resolution**:
   - Resolves unstructured prompts into Merchant Category Codes (e.g. *Shake Shack* -> `MCC 5814: Fast Casual Dining`).
   - Mathematically verified point multipliers and net charges with 0% arithmetic hallucination.

2. **Safe-Spend Guardrails for First-Timers**:
   - **Debit Parity Verification**: Validates checking reserve ($820) exceeds charge without dipping below the $200 emergency buffer.
   - **Statement vs Due Date Shield**: Automatically calculates interim payments before statement closing to lock reported utilization below 10%.
   - **750+ Credit Score Pathway**: Zero APR interest exposure.

3. **Strict Enrolled Cards Filtering**:
   - Search bar evaluates **ONLY** cards you have uploaded or checked in your active wallet.
   - If you only have 1 or 2 cards enrolled, recommendations and progress comparisons are strictly scoped to your cards.
   - Supports CSV / JSON upload and Gemini AI statement text parsing.

4. **Gemini API Integration**:
   - Powered by `@google/genai` (`gemini-3.8-flash`).
   - Uses server-side proxy routes (`/api/copilot/*`) so your `GEMINI_API_KEY` is **never exposed to the browser client or git commits**.

5. **Desktop App (PWA) Support**:
   - Installable directly to your macOS Dock or Windows Desktop taskbar with dedicated standalone window and offline caching.

---

## Safe GitHub Deployment (Zero Secret Leakage)

Your `.gitignore` is pre-configured to strictly ignore secret files:
\`\`\`gitignore
node_modules/
dist/
.DS_Store
*.log
.env*
!.env.example
\`\`\`

To push to your GitHub repository:
\`\`\`bash
git init
git add .
git commit -m "feat: RocketRewards AI Financial Copilot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rocket-rewards.git
git push -u origin main
\`\`\`

---

## Local Setup & Development

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env and insert your GEMINI_API_KEY:
   # GEMINI_API_KEY="AIzaSy..."
   \`\`\`

3. **Start the Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser.
