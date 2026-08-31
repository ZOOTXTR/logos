# Original User Request

## QA Audit Request — 2026-08-31T11:29:37Z

You are the Project Orchestrator for the "Logos: Kelime Avı ve Bulmaca" React Native mobile app QA audit.

Working directory: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\orchestrator_qa
Workspace root: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52
Original request file: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\ORIGINAL_REQUEST.md
Deliverable target: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\QA_AUDIT_REPORT.md
Integrity mode: development

MISSION & CONSTRAINTS:
Conduct a comprehensive, adversarial quality assurance audit of "Logos: Kelime Avı ve Bulmaca" across all 5 requirements (R1 Static Code Analysis & Type Safety, R2 Gameplay Logic & State Correctness, R3 Security & Anti-Cheat, R4 Performance & Crash Risk with Dynamic Testing, R5 Google Play Policy Compliance).
CRITICAL CONSTRAINT: Do NOT fix any bugs in the codebase — this is a strict read-only audit. Document every finding with severity, reproduction steps, and recommended remediation.

REQUIREMENTS & ACCEPTANCE CRITERIA:
1. R1 Static Code Analysis: Run `npx tsc --noEmit --strict`, ESLint, manual code review. Catalog every finding with file, line, severity, explanation.
2. R2 Gameplay Logic: Audit all game modes (Classic Wordle, Blitz, Anagram, Dordle, Word Connect, Word Chain, Duel). Check scoring, XP, streaks, gem economy, dictionary validation (TR/EN), daily word determinism, timer logic, win/loss edge cases, race conditions. Review at least 3 distinct code files per game mode.
3. R3 Security & Anti-Cheat: Assess at least 5 security areas (AsyncStorage tampering, API keys/secrets exposure, Firestore rules, input validation, leaderboard integrity). Flag hardcoded keys/secrets as Critical.
4. R4 Performance & Crash Risk: Static analysis & dynamic testing (exercise at least 3 game modes to completion for win/loss paths, capture console output/runtime errors/warnings), identify memory leaks, unoptimized lists, ANRs, crash risks.
5. R5 Google Play Policy Compliance: Data safety declarations vs actual collection, permissions justification, content ratings, ads/monetization, target audience.
6. Deliverable `QA_AUDIT_REPORT.md`:
   - Prioritized summary table (Critical -> Low)
   - Detailed findings (ID, severity, category R1-R5, file/location, description, reproduction steps, recommended fix)
   - Risk matrix section (likelihood vs impact)
   - Go/No-Go recommendation for production release with clear justification
   - Total finding counts broken down by severity level

Decompose the work, dispatch explorer/worker/reviewer subagents, maintain BRIEFING.md and progress.md, compile the final QA_AUDIT_REPORT.md, and notify the Sentinel when complete.
