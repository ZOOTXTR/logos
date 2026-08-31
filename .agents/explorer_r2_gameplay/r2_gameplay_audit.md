# Track R2: Gameplay Logic & State Correctness Audit Report

**Application**: Logos: Kelime Avı ve Bulmaca (React Native / Expo SDK 52)  
**Audit Target**: Gameplay Logic, State Management, Game Modes (1-7), Scoring, Economy, Timers & Turkish Localization  
**Audit Mode**: Strict Read-Only Investigation  
**Date**: 2026-08-31  
**Auditor**: Track R2 Gameplay Logic & State Correctness Auditor  

---

## 1. Executive Summary

A comprehensive, adversarial quality assurance audit was conducted on all 7 game modes, shared progression systems, Turkish/English dictionary pipelines, gem economy, and timer engines within the "Logos: Kelime Avı ve Bulmaca" mobile codebase.

### Key Audit Highlights:
- **Catastrophic Level Progression Discontinuity**: Gaps in the `LEVELS` configuration table cause players with 4,000 XP to suddenly **demote from Level 10 to Level 7**, and later leap from Level 9 to Level 15 at 7,000 XP.
- **Uncompletable Levels in Word Connect**: Turkish Level 1 and Level 2 are mathematically impossible to complete due to impossible letter bank requirements (e.g. target word requires two 'E's or an 'L', but the letter wheel only supplies a single 'E' and no 'L').
- **Unsolvable Rounds in Blitz Mode**: Blitz assumes all target words are strictly 5 letters, but the word generator returns 4-letter and 6-letter words, locking the user in unwinnable rounds.
- **Lost Economy Rewards in Blitz**: Gems and XP displayed on the Blitz game-over screen are **never credited** to the player's account because rewards are bound to the `handleSubmit` event instead of timer expiration.
- **Premium User Gem Theft on Hints**: The `HintModal` UI displays hints as free for Premium subscribers, but internally executes a gem deduction of 50 Gems per hint.
- **Turkish Dotless/Dotted 'I'/'İ' Corruption**: Multiple game modes use standard JavaScript `.toUpperCase()` instead of `.toLocaleUpperCase('tr-TR')`, breaking Turkish dictionary lookups and character matching for words containing 'I' and 'İ'.
- **Flawed Wordle Duplicate Letter Coloring in Duel**: Naive single-pass letter matching marks all occurrences of duplicate letters as `present` (yellow) even when the target word only contains one occurrence.

---

## 2. Mode-by-Mode Audit Matrix

Every game mode was audited with a minimum of 3 to 7 distinct code files reviewed across screen components, game hooks, constants, services, and shared UI widgets:

| # | Game Mode | Primary Files Audited (>= 3 per mode) | Audit Status | Key Vulnerabilities Identified |
|---|-----------|---------------------------------------|--------------|--------------------------------|
| 1 | **Classic Wordle** | `app/(tabs)/index.tsx`<br>`hooks/useGame.ts`<br>`constants/words.ts`<br>`components/GameBoard.tsx`<br>`components/Keyboard.tsx`<br>`screens/GamePlayScreen.tsx`<br>`components/HintModal.tsx` | **AUDITED** | Premium hint gem deduction, word bank casing inconsistencies (`TIMSAH`), local timezone daily seed bypass. |
| 2 | **Blitz** | `app/blitz.tsx`<br>`hooks/useBlitz.ts`<br>`components/Timer.tsx`<br>`constants/words.ts`<br>`components/Keyboard.tsx` | **AUDITED** | 4/6-letter words unsolvable (locked at 5), end-game Gems/XP never awarded, stats/streak never updated. |
| 3 | **Anagram** | `app/anagram.tsx`<br>`hooks/useAnagram.ts`<br>`constants/words.ts`<br>`constants/validation_dictionary.ts`<br>`components/GameResultOverlay.tsx` | **AUDITED** | Non-Turkish uppercase casing corrupts `VALID_WORDS_TR_SET`, `shuffle` recursion stack overflow risk, no stats/win tracking. |
| 4 | **Dordle** | `app/dordle.tsx`<br>`hooks/useDordle.ts`<br>`components/Keyboard.tsx`<br>`constants/words.ts`<br>`components/GameResultOverlay.tsx` | **AUDITED** | 4/6-letter words break grid rendering & solve condition, zero dictionary validation (accepts gibberish), no stats/streak update. |
| 5 | **Word Connect** | `app/wordconnect.tsx`<br>`hooks/useWordConnect.ts`<br>`constants/theme.ts`<br>`components/GameResultOverlay.tsx` | **AUDITED** | **LEVEL 1 & 2 IMPOSSIBLE TO COMPLETE** (missing duplicate/required letters in wheel), no win/stats recording. |
| 6 | **Word Chain** | `app/chain.tsx`<br>`hooks/useWordChain.ts`<br>`constants/words.ts`<br>`constants/validation_dictionary.ts` | **AUDITED** | Plain `.toUpperCase()` breaks on Turkish 'i', tiny dictionary pool (~200 words) rejects 99.7% of valid words, hardcoded Turkish language. |
| 7 | **Duel (AI 1v1)** | `app/duel.tsx`<br>`hooks/useDuel.ts`<br>`components/Keyboard.tsx`<br>`constants/words.ts`<br>`components/GameResultOverlay.tsx` | **AUDITED** | Flawed duplicate letter coloring algorithm, zero dictionary validation, missing Turkish casing, no stats/streak recording. |
| * | **Cross-Cutting Systems** | `store/progressStore.ts`<br>`hooks/useProgress.ts`<br>`constants/levels.ts`<br>`constants/achievements.ts`<br>`services/storage.service.ts`<br>`services/dictionary.service.ts`<br>`services/cloud.service.ts`<br>`components/DailySpinModal.tsx`<br>`services/iap.service.ts`<br>`constants/products.ts`<br>`components/StoreModal.tsx` | **AUDITED** | Level XP demotion glitch, dual store desync (Zustand vs `useProgress`), daily spin clock exploit, IAP SKU mismatch, streak date loss bug. |

---

## 3. Finding Breakdown by Severity

| Severity | Count | Primary Impact |
|:---|:---:|:---|
| 🔴 **CRITICAL** | 4 | Game progression breaks, impossible-to-complete game modes, level demotion, dictionary corruption |
| 🟠 **HIGH** | 5 | Economy exploits/losses, unsolvable game rounds, premium feature billing violations, game rule violations |
| 🟡 **MEDIUM** | 5 | Dictionary coverage gaps, stats/streak desynchronization, dual-store state divergence, infinite recursion crash risks |
| 🔵 **LOW** | 2 | Missing language parameter pass-through, obsolete/dead SKU definitions |
| **TOTAL** | **16** | **All 7 Game Modes & Global Progression Audited** |

---

## 4. Detailed Findings Catalog

```
================================================================================
FINDING ID: R2-F01
SEVERITY:   CRITICAL
CATEGORY:   Gameplay Logic & Progression / Level Calculation
LOCATION:   constants/levels.ts:9-24, 44-71
================================================================================
```
### Description
The `LEVELS` array defines discrete tiers with massive XP gaps (e.g., Level 10 ends at 4,000 XP, but Level 15 starts at 7,000 XP; Level 20 ends at 20,000 XP, while Level 30 starts at 30,000 XP).
When a player's XP falls into an unmapped range (such as 4,000 to 6,999 XP), `LEVELS.find(...)` returns `undefined`, triggering the fallback linear calculation loop:
```ts
let level = 1;
let accumulated = 0;
while (accumulated + level * 150 <= xp) {
  accumulated += level * 150;
  level++;
  if (level >= 50) break;
}
```
Because the fallback loop uses an incompatible scaling formula (`level * 150`), a player with 3,999 XP is calculated as Level 10 ("Usta"), but upon reaching 4,000 XP (+1 XP), the fallback loop evaluates them as **Level 7 ("Level 7")**. The player experiences an immediate **3-level demotion**. Furthermore, reaching 7,000 XP instantly jumps the player from Level 9 to Level 15.
Additionally, in `getXPProgress`, Level 50 has `maxXP: Infinity`. `(xp - 100000) / (Infinity - 100000)` produces `0`, displaying **0% progress** instead of 100% for max-level players.

### Reproduction Steps
1. In `storage.service.ts` or test console, set XP to `3999`. Call `getLevelFromXP(3999)`. Observe output: `{ level: 10, title: 'Usta', minXP: 3200, maxXP: 4000 }`.
2. Add 1 XP (total `4000`). Call `getLevelFromXP(4000)`.
3. Observe output: `{ level: 7, title: 'Level 7', minXP: 3150, maxXP: 4200 }`. The player's level dropped from 10 to 7.
4. Set XP to `100000`. Call `getXPProgress(100000)`. Observe `percent: 0`.

### Recommended Fix
Fill all intermediate levels 1-50 contiguously in `LEVELS` with monotonically increasing `minXP` and `maxXP` boundaries, or replace `LEVELS` with a continuous quadratic progression function `minXP(lvl) = Math.floor(50 * Math.pow(lvl, 1.8))`. For Level 50, clamp `percent` to `1.0`.

---

```
================================================================================
FINDING ID: R2-F02
SEVERITY:   CRITICAL
CATEGORY:   Dictionary Validation & Turkish Character Normalization
LOCATION:   hooks/useAnagram.ts:17-18, hooks/useWordChain.ts:15,44,48, hooks/useDuel.ts:28,145,229, constants/words.ts:26
================================================================================
```
### Description
JavaScript's standard `String.prototype.toUpperCase()` does not follow Turkish locale casing rules unless executed with `toLocaleUpperCase('tr-TR')`. In default JavaScript environments (V8 / Hermes on Android), lowercase `'i'` (U+0069) converts to Latin uppercase `'I'` (U+0049), instead of Turkish dotted capital `'İ'` (U+0130), and lowercase `'ı'` (U+0131) may produce unexpected casing.
1. In `hooks/useAnagram.ts:17`: `const VALID_WORDS_TR_SET = new Set(ALL_WORDS.map(w => w.toUpperCase().replace(/\s/g, '')));`
   This turns Turkish words like `"incir"` or `"tilki"` into `"INCIR"` and `"TILKI"`. When a user inputs `"İNCİR"`, `VALID_WORDS_TR_SET.has("İNCİR")` returns `false`, rejecting valid anagram solutions.
2. In `hooks/useWordChain.ts:44,48`: Input text is uppercased via `.toUpperCase()`. When the user types `"inek"`, it becomes `"INEK"`. `validWords.has("INEK")` evaluates to `false` because the set contains `"İNEK"`. The player is falsely penalized with a lost heart.
3. In `constants/words.ts:26`: The word `'TIMSAH'` is hardcoded with dotless `'I'`. Turkish keyboard input submits `'TİMSAH'` (dotted `'İ'`), making it impossible for the player to get a 100% green match on the target word.

### Reproduction Steps
1. Launch Anagram mode with Turkish language.
2. When given a scrambled word containing the letter 'İ' (e.g., 'TİLKİ' scrambled as 'İ-T-L-K-İ'), select the letters to spell an alternate valid word containing 'İ'.
3. Submit the guess. Observe that `submitGuess()` marks the valid Turkish word as wrong because `VALID_WORDS_TR_SET` contains the corrupted ASCII `'I'` representation.
4. In Word Chain mode, enter `"inek"`. Observe the error banner: `"Geçersiz kelime!"` and heart deducted.

### Recommended Fix
Create a centralized helper `toTurkishUpper(str: string): string` and `toTurkishLower(str: string): string`:
```ts
export const toTurkishUpper = (s: string) =>
  s.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
```
Apply this helper uniformly across all word bank initializations, user input handlers, and dictionary lookups. Correct `'TIMSAH'` to `'TİMSAH'` in `constants/words.ts:26`.

---

```
================================================================================
FINDING ID: R2-F03
SEVERITY:   CRITICAL
CATEGORY:   Gameplay Logic & Game Breaking / Word Connect
LOCATION:   hooks/useWordConnect.ts:31-52
================================================================================
```
### Description
The Turkish level definitions for Word Connect in `hooks/useWordConnect.ts` contain impossible word requirements:
- **Level 1 (`LEVELS_TR[0]`)**:
  - Available wheel letters: `['K', 'A', 'L', 'E', 'M']`
  - Target words: `['KALEM', 'KALE', 'ELMA', 'LEKE']`
  - Problem: The target word `'LEKE'` requires two 'E' letters (`L-E-K-E`). The wheel provides only one `'E'`. Because `selectLetter` prevents re-selecting already chosen indices (`if (prev.selectedIndices.includes(index)) return prev;`), the word `'LEKE'` can NEVER be formed.
- **Level 2 (`LEVELS_TR[1]`)**:
  - Available wheel letters: `['T', 'A', 'S', 'M', 'A']`
  - Target words: `['TASMA', 'MASAT', 'SAAT', 'MALA']`
  - Problem: The target word `'MALA'` requires the letter `'L'`. The wheel letters contain `['T', 'A', 'S', 'M', 'A']` (no `'L'`).
Because level completion requires finding ALL target words (`nextFound.length === state.targetWords.length`), **both Turkish levels of Word Connect are 100% impossible to complete**.

### Reproduction Steps
1. Navigate to Word Connect in Turkish mode (`app/wordconnect.tsx`).
2. Complete `KALEM`, `KALE`, and `ELMA`.
3. Attempt to form `LEKE` on the wheel. Observe that after selecting `L-E-K`, there is no second `E` available on the wheel.
4. Level completion cannot be achieved. The player is permanently stuck.

### Recommended Fix
Update `LEVELS_TR` layout and target words with valid anagram subsets:
```ts
const LEVELS_TR: LevelConfig[] = [
  {
    letters: ['K', 'A', 'L', 'E', 'M'],
    targetWords: ['KALEM', 'KALE', 'ELMA', 'KAME'], // Replace LEKE with KAME or KELAM
    layout: [
      ['KALEM', 2, 1, 'H'],
      ['KALE', 2, 1, 'V'],
      ['ELMA', 4, 3, 'H'],
      ['KAME', 1, 3, 'V'],
    ]
  },
  {
    letters: ['T', 'A', 'S', 'M', 'A'],
    targetWords: ['TASMA', 'MASAT', 'SAAT', 'ASMA'], // Replace MALA with ASMA
    layout: [
      ['TASMA', 0, 1, 'H'],
      ['MASAT', 0, 4, 'V'],
      ['SAAT', 2, 2, 'H'],
      ['ASMA', 0, 1, 'V'],
    ]
  }
];
```

---

```
================================================================================
FINDING ID: R2-F04
SEVERITY:   HIGH
CATEGORY:   Gameplay Logic & Game Breaking / Blitz Mode
LOCATION:   hooks/useBlitz.ts:3, 90, 101, 102, constants/words.ts:102-108
================================================================================
```
### Description
In `constants/words.ts`, `getRandomWord()` uses `filterWordList()` which explicitly allows words of length 4, 5, and 6:
```ts
const filterWordList = (list: string[]): string[] => {
  const filtered = list.filter(w => {
    const len = w.replace(/\s/g, '').length;
    return len >= 4 && len <= 6;
  });
  return filtered.length > 0 ? filtered : list;
};
```
However, `hooks/useBlitz.ts` hardcodes `WORD_LENGTH = 5` and enforces strict 5-character constraints:
- Line 90: `if (prev.guess.length >= WORD_LENGTH) return prev;`
- Line 101: `if (s.guess.length < WORD_LENGTH) return 'short';`
- Line 102: `const correct = s.guess === s.currentWord;`
When `getRandomWord()` selects a 4-letter word (e.g. `'BOLU'`, `'UŞAK'`, `'KARS'`, `'AYI'`):
- The user inputs 4 letters. Pressing Submit returns `'short'` because `4 < 5`. The user cannot submit.
When `getRandomWord()` selects a 6-letter word (e.g. `'ANKARA'`, `'KAPLAN'`, `'MAYMUN'`):
- The user can type at most 5 letters (line 90 blocks the 6th letter). The 5-letter guess can never equal the 6-letter `currentWord`.
Every 4-letter and 6-letter word generated in Blitz mode is **unsolvable**, forcing the player to waste 5 seconds on a skip or fail the run.

### Reproduction Steps
1. Launch Blitz mode (`app/blitz.tsx`).
2. Play consecutive rounds until `currentWord` is a 4-letter city (e.g. `ORDU`) or 6-letter animal (e.g. `KAPLAN`).
3. For `ORDU`: type `O-R-D-U` and press Enter. Notice the app rejects submission as incomplete.
4. For `KAPLAN`: type `K-A-P-L-A`. Notice the keyboard will not accept the final `N`.

### Recommended Fix
Either:
1. Pass word length dynamically to Blitz (`currentWord.length` instead of constant `WORD_LENGTH = 5`), adjusting the grid cells and length checks accordingly; OR
2. Restrict Blitz word pool strictly to 5-letter words:
```ts
export const getBlitzWord = (category: Category, lang: 'tr' | 'en'): string => {
  const pool = get5LetterWordPool(category, lang);
  return pool[Math.floor(Math.random() * pool.length)];
};
```

---

```
================================================================================
FINDING ID: R2-F05
SEVERITY:   HIGH
CATEGORY:   Gem Economy & State Correctness / Blitz Mode
LOCATION:   app/blitz.tsx:33-47, 77-111
================================================================================
```
### Description
In `app/blitz.tsx`, end-of-game XP and Gem granting logic is placed exclusively inside the `handleSubmit` click handler:
```ts
const handleSubmit = async () => {
  const result = game.submitGuess();
  ...
  if (game.status === 'ended') {
    audioService.play('loss');
    await progress.earnXP(game.score / 10);
    await progress.addGems(Math.floor(game.wordsSolved * 5));
  }
};
```
However, Blitz games end when the countdown timer in `hooks/useBlitz.ts` reaches 0. Timer expiration transitions `status` to `'ended'` automatically via `setInterval`.
When the game ends naturally via timer expiration, `handleSubmit` is **NEVER CALLED**.
The result screen displays:
```tsx
<Text style={styles.resultXP}>+{Math.floor(game.wordsSolved * 5)} 💎  +{Math.floor(game.score / 10)} XP</Text>
```
However, `progress.earnXP` and `progress.addGems` were never executed. The player is presented with a reward screen but their actual balance in `progressStore` / `AsyncStorage` remains completely unchanged. Furthermore, `recordWin`/`recordLoss` is omitted, so stats for speed mode are never tracked.

### Reproduction Steps
1. Note current gem and XP count on the main menu (e.g., 150 Gems, 0 XP).
2. Start Blitz mode. Solve 3 words (e.g., score: 300, wordsSolved: 3).
3. Allow the timer to count down to 0 without pressing Submit.
4. The result screen displays `+15 💎 +30 XP`.
5. Return to the main menu. Observe that Gems remain 150 and XP remains 0 (or only incremental per-word XP was added). The 15 Gems were never credited.

### Recommended Fix
Add a `useEffect` in `app/blitz.tsx` that triggers upon `game.status === 'ended'`:
```ts
const rewardAwardedRef = useRef(false);

useEffect(() => {
  if (game.status === 'ended' && !rewardAwardedRef.current) {
    rewardAwardedRef.current = true;
    const gemsAward = Math.floor(game.wordsSolved * 5);
    const xpAward = Math.floor(game.score / 10);
    if (gemsAward > 0) progress.addGems(gemsAward);
    if (xpAward > 0) progress.earnXP(xpAward);
    progress.recordWin({
      guesses: game.wordsSolved,
      mode: 'speed',
      difficulty: 'normal',
      category: 'random',
      isSpeed: true,
      isExpert: false,
      isPerfect: false,
      isDaily: false,
      elapsedSeconds: 60,
      xpEarned: xpAward,
    });
  }
}, [game.status]);
```

---

```
================================================================================
FINDING ID: R2-F06
SEVERITY:   HIGH
CATEGORY:   Gem Economy & Premium Monetization Correctness
LOCATION:   components/HintModal.tsx:73-80, screens/GamePlayScreen.tsx:155-162
================================================================================
```
### Description
In `components/HintModal.tsx`, when `isPremium` is `true`, the modal presents a VIP card promising unlimited free hints:
```tsx
{isPremium ? (
  <HintOptionCard
    emoji="👑"
    title="Premium — Ücretsiz"
    description="Sınırsız ipucu hakkın var!"
    onPress={handleSpendGems}
    disabled={loading !== null}
    loading={loading === 'gem'}
  />
) : ...
```
However, the button's `onPress` is bound to `handleSpendGems`, which invokes `onSpendGems()` passed from `screens/GamePlayScreen.tsx`:
```ts
const handleSpendGems = async (): Promise<boolean> => {
  const ok = await onSpendGems(HINT_GEM_COST);
  if (ok) {
    const hint = game.useHint();
    showCustomAlert('💡 İpucu', hint ?? ...);
  }
  return ok;
};
```
`onSpendGems(HINT_GEM_COST)` unconditionally deducts 50 Gems.
As a result:
1. Premium subscribers who paid real money are silently charged 50 Gems per hint.
2. If a Premium subscriber has fewer than 50 Gems, `onSpendGems` fails (`ok = false`), and the Premium subscriber is **denied the hint completely**.

### Reproduction Steps
1. Unlock Premium status in the app (via store or `setPremium(true)`).
2. Set Gem balance to 10 Gems (less than `HINT_GEM_COST = 50`).
3. Enter a Classic game and open the Hint modal.
4. Observe the card says `"Premium — Ücretsiz / Sınırsız ipucu hakkın var!"`.
5. Tap the Premium Hint button.
6. Observe that no hint is given because the app attempts to deduct 50 Gems and fails due to insufficient balance.
7. Set Gem balance to 200 Gems and tap the button. Observe the hint is shown but Gem balance decreases to 150 Gems.

### Recommended Fix
Update `HintModal.tsx` to call a dedicated `onUseFreeHint` handler when `isPremium` is active, or branch in `GamePlayScreen.tsx`:
```ts
const handleSpendGems = async (): Promise<boolean> => {
  if (premium) {
    const hint = game.useHint();
    showCustomAlert('💡 İpucu', hint ?? ...);
    return true;
  }
  const ok = await onSpendGems(HINT_GEM_COST);
  if (ok) {
    const hint = game.useHint();
    showCustomAlert('💡 İpucu', hint ?? ...);
  }
  return ok;
};
```

---

```
================================================================================
FINDING ID: R2-F07
SEVERITY:   HIGH
CATEGORY:   Gameplay Logic & Game Rules / Duel Mode
LOCATION:   hooks/useDuel.ts:108-114, 197-204
================================================================================
```
### Description
The tile coloring evaluation algorithm in `hooks/useDuel.ts` uses a naive single-pass `targetWord.includes(cell.char)` check for both player and AI bot guesses:
```ts
let status: LetterStatus = 'absent';
if (prev.targetWord[cIdx] === cell.char) {
  status = 'correct';
} else if (prev.targetWord.includes(cell.char)) {
  status = 'present';
}
return { ...cell, status: status as LetterStatus };
```
Under official Wordle rules (and correctly implemented in `useGame.ts`), letter frequency must be respected. If the target word has ONE instance of a letter (e.g. `ASLAN` with one `S`), and the player guesses `MASSA` (two `S`s):
- Index 2 (`S`) is not in the correct position -> `targetWord.includes('S')` is `true` -> marked `present` (yellow).
- Index 3 (`S`) is not in the correct position -> `targetWord.includes('S')` is `true` -> marked `present` (yellow).
Both `S` tiles turn yellow, falsely signaling to the player that the target word contains at least two `S`s.
If the guess is `ÖÖÖÖÖ` against target `KÖPEK`:
- Index 1 matches `Ö` -> `correct` (green).
- Indices 0, 2, 3, 4 all evaluate `targetWord.includes('Ö') === true` -> **all 4 remaining tiles turn yellow**.

### Reproduction Steps
1. Launch Duel mode (`app/duel.tsx`).
2. Assume the target word is `KAVUN`.
3. Submit the guess `KAYIK` (which has two `K`s).
4. Observe that the first `K` turns green (`correct`) and the second `K` turns yellow (`present`), giving false gameplay telemetry.

### Recommended Fix
Implement the standard two-pass letter frequency allocation algorithm in `useDuel.ts`:
```ts
const targetChars = prev.targetWord.split('');
const guessChars = guess.split('');
const statuses: LetterStatus[] = Array(WORD_LENGTH).fill('absent');

// Pass 1: Mark exact matches
guessChars.forEach((c, i) => {
  if (c === targetChars[i]) {
    statuses[i] = 'correct';
    targetChars[i] = '#';
  }
});

// Pass 2: Mark misplaced matches up to remaining frequency
guessChars.forEach((c, i) => {
  if (statuses[i] === 'correct') return;
  const matchIdx = targetChars.indexOf(c);
  if (matchIdx !== -1) {
    statuses[i] = 'present';
    targetChars[matchIdx] = '#';
  }
});
```

---

```
================================================================================
FINDING ID: R2-F08
SEVERITY:   MEDIUM
CATEGORY:   Dictionary Validation & Game Integrity
LOCATION:   hooks/useDordle.ts:102-182, hooks/useDuel.ts:180-224
================================================================================
```
### Description
Both `hooks/useDordle.ts` and `hooks/useDuel.ts` perform **zero dictionary validation** upon guess submission.
In `useDordle.ts`:
```ts
const submitGuess = useCallback((): 'short' | 'submitted' => {
  if (state.currentCol < WORD_LENGTH) return 'short';
  // Directly evaluates guess against word1 and word2 without dictionary lookup
```
In `useDuel.ts`:
```ts
const submitGuess = useCallback((): 'short' | 'correct' | 'wrong' | 'gameover' => {
  if (prev.playerCol < WORD_LENGTH) { result = 'short'; return prev; }
  // Directly evaluates guess without dictionary lookup
```
Players can submit arbitrary strings such as `"AAAAA"`, `"ZZZZZ"`, `"QWERT"`, or any invalid consonant clusters to quickly probe for target letters without using valid vocabulary words.

### Reproduction Steps
1. Open Dordle or Duel mode.
2. Type `A-A-A-A-A` and press Enter.
3. Observe the game immediately accepts the submission and reveals whether 'A' is present.

### Recommended Fix
Integrate `getDictionary(lang)` and `ALL_WORDS` validation before processing the submission in both hooks, returning `'not_valid'` if the guess is not in the dictionary.

---

```
================================================================================
FINDING ID: R2-F09
SEVERITY:   MEDIUM
CATEGORY:   State Management & Statistics Recording
LOCATION:   app/anagram.tsx:42-84, app/dordle.tsx:169-216, app/wordconnect.tsx:120-163, app/chain.tsx:23-36, app/duel.tsx:91-133
================================================================================
```
### Description
Across 5 of the 7 game modes (Anagram, Dordle, Word Connect, Word Chain, and Duel), completing a game calls direct reward helpers (`earnXP` / `addGems`), but **never calls `progress.recordWin` or `progress.recordLoss`**:
- `stats.gamesPlayed` and `stats.gamesWon` are never incremented.
- `stats.guessDistribution` is never recorded.
- Daily win streaks and max streaks are never tracked for these modes.
- `getNewAchievements()` is never evaluated, meaning players who play exclusively non-Classic modes can never unlock achievements like `first_game`, `first_win`, `veteran`, or `streak_X`.
- Leaderboard scores are not submitted to Cloud Firestore for these modes.

### Reproduction Steps
1. Reset stats to 0.
2. Play and win 5 games in Dordle, Anagram, or Duel.
3. Open Profile / Statistics screen.
4. Observe `gamesPlayed = 0`, `gamesWon = 0`, `streak = 0`, and achievements remain locked.

### Recommended Fix
Invoke `progress.recordWin(...)` and `progress.recordLoss()` on game completion across all 5 modes with mode-appropriate parameters.

---

```
================================================================================
FINDING ID: R2-F10
SEVERITY:   MEDIUM
CATEGORY:   Dictionary Completeness & Playability / Word Chain
LOCATION:   hooks/useWordChain.ts:15-20
================================================================================
```
### Description
In `hooks/useWordChain.ts`, the valid word set is populated exclusively from `ALL_WORDS`:
```ts
const VALID_WORDS_TR_ARRAY = ALL_WORDS.map(w => w.toUpperCase().replace(/\s/g, '')).filter(w => w.length >= 3);
const VALID_WORDS_TR = new Set(VALID_WORDS_TR_ARRAY);
```
`ALL_WORDS` contains only the thematic category bank words (~200 total 5-letter words). It completely ignores `VALIDATION_DICT_TR` from `constants/validation_dictionary.ts` which contains 65,247 legitimate Turkish words.
As a consequence:
- Common words like `"ARABA"`, `"MASA"`, `"KAPI"`, `"OKUL"`, `"DEFTER"`, `"BİLGİSAYAR"`, `"KALEM"`, `"ÇANTA"` are rejected as `"Geçersiz kelime!"`.
- The player loses a life on 99.7% of authentic Turkish vocabulary words.

### Reproduction Steps
1. Start Word Chain mode (`app/chain.tsx`).
2. If starting word is `ASLAN` (ends with 'N'), enter a basic valid Turkish word like `NAR` or `NEHİR` or `NOKTA`.
3. If not present in the ~200 thematic words, the game rejects it and deducts a life.

### Recommended Fix
Preload and query `VALIDATION_DICT_TR` (via `getDictionary('tr')`) in `useWordChain.ts`:
```ts
const dictionary = getDictionary(lang);
const isValid = (dictionary && dictionary.has(word)) || validWords.has(word);
```

---

```
================================================================================
FINDING ID: R2-F11
SEVERITY:   MEDIUM
CATEGORY:   State Synchronization & Memory Architecture
LOCATION:   hooks/useProgress.ts:13-43, store/progressStore.ts:56-93, services/cloud.service.ts:137-154
================================================================================
```
### Description
The application maintains two parallel, uncoordinated progression state management layers:
1. `store/progressStore.ts` (Global Zustand store)
2. `hooks/useProgress.ts` (Component-local `useState` hook)
When screens use `useProgress()`, each screen creates its own isolated React state that reads from `AsyncStorage` on mount. If one screen modifies gems or XP, other active components or hooks do not receive reactive updates until re-mounted.
Furthermore:
- `services/cloud.service.ts:restoreStorageFromCloud` writes restored data into `AsyncStorage` keys, but does not notify either `progressStore` or active `useProgress` hooks, leaving stale UI on screen.
- `hooks/useProgress.ts:recordWin` (lines 150-157) unlocks achievements in storage but **fails to award `rewardGems` and `rewardXP`**, unlike `store/progressStore.ts` (lines 225-226) which properly credits them.

### Reproduction Steps
1. Open Menu Screen (rendered with `useProgress`).
2. In a sub-screen or modal, trigger a cloud restore with new Gem balances.
3. Return to Menu Screen. Observe the old Gem balance is displayed until app restart.

### Recommended Fix
Deprecate the local `useState` in `hooks/useProgress.ts` and refactor it into a thin wrapper around the global Zustand store:
```ts
export const useProgress = () => useProgressStore();
```

---

```
================================================================================
FINDING ID: R2-F12
SEVERITY:   MEDIUM
CATEGORY:   Daily Determinism & Clock Manipulation
LOCATION:   constants/words.ts:143-151, services/storage.service.ts:168-182
================================================================================
```
### Description
The daily word generator `getDailyWord()` and completion check `hasDoneDaily()` rely strictly on local device timestamps:
```ts
const date = new Date();
const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
```
```ts
const today = new Date().toDateString();
return date === today && done === 'true';
```
Vulnerabilities:
1. **Timezone Desynchronization**: Players in UTC+12 see a different daily word and seed than players in UTC-8 at the exact same global moment.
2. **Clock Manipulation Exploit**: Users can set their device system clock forward by 1 day to play tomorrow's daily challenge early, or roll back their clock to bypass the `hasDoneDaily` flag and repeatedly farm the +100 Gem and +100 XP daily reward.

### Reproduction Steps
1. Complete the Daily Challenge and claim +100 Gems.
2. Close the app. Go to Android/iOS Settings > Date & Time > advance date by 1 day.
3. Reopen the app. Observe Daily Challenge is active again and grants +100 Gems.

### Recommended Fix
Compute the seed using UTC dates: `Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())`. Verify daily completion against server timestamp stored in Firebase Auth / Firestore user profile.

---

```
================================================================================
FINDING ID: R2-F13
SEVERITY:   MEDIUM
CATEGORY:   Crash Risk & Performance / Anagram Mode
LOCATION:   hooks/useAnagram.ts:20-28
================================================================================
```
### Description
In `hooks/useAnagram.ts`, the `shuffle` function uses uncontrolled recursion when the shuffled output matches the input:
```ts
const shuffle = (arr: string[]): string[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.join('') === arr.join('')) return shuffle(arr);
  return a;
};
```
If a target word contains identical letters (e.g. all identical characters, or two-letter repeats with high collision probability), or if random permutations repeatedly collide, the recursion depth is unbounded. For single-character repeated inputs (e.g. if test/custom words like `'AAA'` are loaded), this causes an immediate synchronous **`Maximum call stack size exceeded` crash**.

### Reproduction Steps
1. Call `shuffle(['A', 'A', 'A', 'A'])`.
2. Observe immediate runtime exception: `RangeError: Maximum call stack size exceeded`.

### Recommended Fix
Add a maximum iteration counter and fallback:
```ts
const shuffle = (arr: string[]): string[] => {
  let a = [...arr];
  let attempts = 0;
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    attempts++;
  } while (a.join('') === arr.join('') && attempts < 10);
  return a;
};
```

---

```
================================================================================
FINDING ID: R2-F14
SEVERITY:   LOW
CATEGORY:   Gameplay Logic & Internationalization
LOCATION:   app/chain.tsx:15, hooks/useWordChain.ts:26
================================================================================
```
### Description
In `app/chain.tsx`, `useWordChain()` is invoked with default arguments:
```ts
const game = useWordChain();
```
`useWordChain` defaults its `lang` parameter to `'tr'`. When the user switches app language to English in Settings, Word Chain continues to operate in Turkish with Turkish starting words and vocabulary checks.

### Reproduction Steps
1. Switch app language to English.
2. Open Word Chain mode (`app/chain.tsx`).
3. Observe title is in Turkish (`⛓️ Kelime Zinciri`) and starting word is Turkish (e.g. `ASLAN`).

### Recommended Fix
Pass `language` from `useTheme()` to `useWordChain(language)` and bind UI strings to `TRANSLATIONS[language]`.

---

```
================================================================================
FINDING ID: R2-F15
SEVERITY:   LOW
CATEGORY:   Store & In-App Purchase Integrity
LOCATION:   services/iap.service.ts:5-11, constants/products.ts:4-15
================================================================================
```
### Description
`services/iap.service.ts` and `constants/products.ts` contain divergent, non-matching In-App Purchase product identifiers:
- `services/iap.service.ts`: `com.logos.premium`, `com.logos.gems100`, `com.logos.gems500`, `com.logos.gems1200`, `com.logos.gems3000`
- `constants/products.ts`: `com.zovtex.logos.gems.small`, `com.zovtex.logos.gems.medium`, `com.zovtex.logos.gems.large`, `com.zovtex.logos.premium.lifetime`
`StoreModal.tsx` queries Google Play using `constants/products.ts`, while `iap.service.ts` is orphaned dead code with outdated SKUs.

### Reproduction Steps
1. Inspect `services/iap.service.ts` SKU definitions vs `constants/products.ts`.
2. Observe conflicting package namespaces.

### Recommended Fix
Standardize on the official `com.zovtex.logos.*` product IDs across all files and remove the duplicate SKU map in `iap.service.ts`.

---

```
================================================================================
FINDING ID: R2-F16
SEVERITY:   LOW
CATEGORY:   Streak Reset Calendar Date Boundary Edge Case
LOCATION:   services/storage.service.ts:119-153
================================================================================
```
### Description
In `services/storage.service.ts`, `updateStreak` manages win streaks by saving `STREAK_DATE = today`.
If a player plays game 1 on Monday and loses:
- `newCurrent = 0`
- `STREAK_DATE = "Mon Aug 31 2026"`
If the player plays game 2 on Monday and wins:
- Line 128: `if (lastDate === today) { /* streak does not change */ }`
Because `lastDate === today` is `true`, `newCurrent` remains `0`. The player cannot start a streak of 1 on the same day they previously had a loss.

### Reproduction Steps
1. Play a game and lose. Streak becomes 0 and `STREAK_DATE` is set to today.
2. Play another game on the same day and win.
3. Observe streak remains 0 instead of advancing to 1.

### Recommended Fix
Distinguish between daily streaks and per-game win streaks, or allow a win to advance streak from 0 to 1 on the same day.

---

## 5. Turkish Character Handling Audit Matrix

| Character | Uppercase Target | Lowercase Target | Codebase Status | Impact |
|:---:|:---:|:---:|:---:|:---|
| **i** (dotted) | **İ** (U+0130) | **i** (U+0069) | ⚠️ **PARTIAL FAILURE** | Plain `.toUpperCase()` turns `'i'` into ASCII `'I'` in Anagram, Word Chain, and Duel, breaking dictionary matches. |
| **ı** (dotless) | **I** (U+0049) | **ı** (U+0131) | ⚠️ **PARTIAL FAILURE** | Keyboard input vs word bank casing mismatches for dotless I. |
| **ç / Ç** | **Ç** (U+00C7) | **ç** (U+00E7) | ✅ **PASS** | Correctly converted by `toLocaleUpperCase('tr-TR')`. |
| **ğ / Ğ** | **Ğ** (U+011E) | **ğ** (U+011F) | ✅ **PASS** | Correctly converted by `toLocaleUpperCase('tr-TR')`. |
| **ö / Ö** | **Ö** (U+00D6) | **ö** (U+00F6) | ✅ **PASS** | Correctly converted by `toLocaleUpperCase('tr-TR')`. |
| **ş / Ş** | **Ş** (U+015E) | **ş** (U+015F) | ✅ **PASS** | Correctly converted by `toLocaleUpperCase('tr-TR')`. |
| **ü / Ü** | **Ü** (U+00DC) | **ü** (U+00FC) | ✅ **PASS** | Correctly converted by `toLocaleUpperCase('tr-TR')`. |

---

## 6. Recommendations for Engineering Remediation

1. **Immediate Game-Breaker Fixes**:
   - Patch `hooks/useWordConnect.ts` `LEVELS_TR` layout so target words match available wheel letters.
   - Patch `constants/levels.ts` with contiguous level boundaries to eliminate player level demotions.
   - Patch `hooks/useBlitz.ts` to support dynamic target word lengths or filter word generator to 5 letters.
2. **Economy & Monetization Integrity**:
   - Fix `components/HintModal.tsx` to provide 100% free hints for Premium users without gem deduction.
   - Bind Blitz game-over rewards to timer completion in `app/blitz.tsx`.
3. **Dictionary & Rules Correctness**:
   - Enforce `toTurkishUpper` across Anagram, Word Chain, and Duel modes.
   - Refactor `useDuel.ts` to use two-pass letter frequency coloring.
   - Add dictionary validation to Dordle and Duel.
   - Preload `VALIDATION_DICT_TR` in Word Chain.
4. **State Architecture Unification**:
   - Consolidate all progression state into `store/progressStore.ts` (Zustand) and eliminate fragmented `useProgress` state.

---
*Report compiled by Track R2 Gameplay Logic & State Correctness Auditor.*
