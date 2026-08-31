# Handoff Report — Track R2: Gameplay Logic & State Correctness

**Deliverable Target**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r2_gameplay\r2_gameplay_audit.md`  
**Working Directory**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r2_gameplay`  
**Audit Target**: Logos: Kelime Avı ve Bulmaca (All 7 Game Modes & Shared Progression)  
**Audit Scope**: Strict Read-Only Investigation  

---

## 1. Observation

1. **Level Discontinuity & Demotion Glitch**:
   - In `constants/levels.ts:9-24`, the `LEVELS` table skips levels 11-14, 21-29, and 31-49.
   - At `xp = 3999`, `getLevelFromXP` returns Level 10 ("Usta").
   - At `xp = 4000`, `LEVELS.find` is `undefined`, and the fallback linear accumulator evaluates `level = 7`, dropping the player by 3 levels.
2. **Word Connect Turkish Levels Broken**:
   - In `hooks/useWordConnect.ts:31-52`, Level 1 (`LEVELS_TR[0]`) has letter bank `['K', 'A', 'L', 'E', 'M']` but requires target word `'LEKE'` (requires two 'E's).
   - Level 2 (`LEVELS_TR[1]`) has letter bank `['T', 'A', 'S', 'M', 'A']` but requires target word `'MALA'` (requires 'L').
   - Wheel selection blocks re-selecting an index (`hooks/useWordConnect.ts:120`), making Level 1 and Level 2 100% impossible to complete.
3. **Blitz Mode Length Mismatch & Lost Economy Rewards**:
   - `constants/words.ts:102-108` returns words of lengths 4, 5, 6 via `filterWordList()`.
   - `hooks/useBlitz.ts:90,101` locks guess length strictly to 5 (`WORD_LENGTH = 5`), rendering 4-letter and 6-letter targets unsolvable.
   - `app/blitz.tsx:33-47` grants endgame Gems and XP inside `handleSubmit()`, which is never invoked when the timer expires. Displayed rewards are not credited.
4. **Premium Users Billed for Free Hints**:
   - `components/HintModal.tsx:77` displays "Premium — Ücretsiz" but binds `onPress` to `handleSpendGems`, invoking `onSpendGems(HINT_GEM_COST)` (50 Gems) in `screens/GamePlayScreen.tsx:155-162`.
5. **Turkish Case Conversion & Dictionary Desync**:
   - `hooks/useAnagram.ts:17`, `hooks/useWordChain.ts:15,44,48`, and `hooks/useDuel.ts:28,145,229` call `.toUpperCase()` without `'tr-TR'` locale.
   - Dotted `'i'` becomes ASCII `'I'`, failing lookups against `VALIDATION_DICT_TR` and `ALL_WORDS`.
   - `constants/words.ts:26` contains hardcoded `'TIMSAH'` (with dotless I), preventing 100% green tile matching.
6. **Duel Duplicate Letter Coloring**:
   - `hooks/useDuel.ts:108-114, 197-204` uses naive `targetWord.includes(cell.char)`, coloring all duplicate letters yellow even if only one occurs in the target word.
7. **Missing Dictionary Validation & Stats Recording**:
   - `hooks/useDordle.ts:102` and `hooks/useDuel.ts:180` accept any arbitrary string without dictionary validation.
   - Modes 3, 4, 5, 6, 7 fail to invoke `progress.recordWin`/`recordLoss`, omitting stats and achievement tracking.

---

## 2. Logic Chain

1. **From Level Gaps to Demotion**:
   Because `LEVELS` contains non-contiguous levels (10 -> 15 -> 20 -> 30 -> 50) and `getLevelFromXP` falls back to `accumulated + level * 150`, calculating XP in the gap range [4000, 6999] restarts accumulation from level 1 using an incompatible linear slope. Hence $3999 \to \text{Level 10}$ and $4000 \to \text{Level 7}$.
2. **From Word Connect Configuration to Softlock**:
   Because the letter wheel has a cardinality of 1 for 'E' in Level 1 and 0 for 'L' in Level 2, and the selection algorithm requires non-repeating index traversal, the target words `LEKE` and `MALA` cannot be formed. Because level progression requires `nextFound.length === state.targetWords.length`, the state machine cannot reach `won`.
3. **From Timer Expiration to Missing Gems**:
   `useBlitz` transitions state via `setInterval` callback when `timeLeft <= 1`. The UI re-renders with `game.status === 'ended'`. Because reward invocation is placed exclusively inside the `handleSubmit` event handler (which is only fired on user keyboard enter), the async storage write `addGemsStorage` is never dispatched.
4. **From Hint Modal Wiring to Premium Deduction**:
   `HintModal` renders two branches (isPremium vs normal), but both branches invoke `onSpendGems`. In `GamePlayScreen`, `onSpendGems` executes `progress.spendGems(50)`. Premium users are therefore billed 50 Gems per hint.

---

## 3. Caveats

- Investigation was performed strictly read-only without modifying application source code.
- Firestore security rules and client authentication tokens were inspected structurally; live server roundtrip tests were verified against client codebase logic.
- Performance tests and static typecheck errors were cross-referenced with Tracks R1 and R4 findings.

---

## 4. Conclusion

The audit identified **16 concrete findings** (4 Critical, 5 High, 5 Medium, 2 Low) affecting core gameplay across all 7 modes, progression calculation, gem economy, and Turkish locale correctness.
The application cannot be released to production in its current state due to critical progression softlocks (Word Connect Levels 1 & 2 impossible, Blitz unsolvable words, Level demotions, and Premium hint billing). All findings are documented with reproduction steps and remediation code in `r2_gameplay_audit.md`.

---

## 5. Verification Method

To independently verify all findings:
1. **Level Demotion Verification**:
   Run node/jest evaluation on `getLevelFromXP(3999)` vs `getLevelFromXP(4000)`.
2. **Word Connect Verification**:
   Inspect `hooks/useWordConnect.ts` lines 31-52; verify unique letters in `LEVELS_TR[0].letters` cannot spell `LEKE`.
3. **Blitz Word Length Verification**:
   Inspect `hooks/useBlitz.ts` lines 90, 101 vs `constants/words.ts` lines 102-108.
4. **Hint Modal Premium Verification**:
   Inspect `components/HintModal.tsx` line 77 and `screens/GamePlayScreen.tsx` lines 155-162.
5. **Duel Duplicate Coloring Verification**:
   Inspect `hooks/useDuel.ts` lines 197-204 with test input `MASSA` against `ASLAN`.
