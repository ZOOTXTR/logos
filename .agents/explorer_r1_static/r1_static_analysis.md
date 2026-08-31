# Track R1: Static Code Analysis & Type Safety Audit Report

**Target Project**: Logos: Kelime Avı ve Bulmaca (React Native / Expo Mobile App)  
**Auditor**: Track R1 Static Code Analysis Auditor  
**Audit Date**: 2026-08-31  
**Audit Scope**: TypeScript Type Checking, Strict Mode Readiness, ESLint Tooling, Manual AST/Code Review across `app/`, `components/`, `hooks/`, `services/`, `store/`, `constants/`, `screens/`, `config/`.  
**Integrity Mode**: Strict Read-Only Audit (No application code was modified).

---

## 1. Executive Summary

A comprehensive static code analysis and architectural audit was performed on the "Logos: Kelime Avı ve Bulmaca" React Native mobile app codebase.

### Key Audit Findings Overview
- **TypeScript Strict Mode**: The base `npx tsc --noEmit` succeeds under basic configurations, but `npx tsc --noEmit --strict --noImplicitReturns --noUnusedLocals` fails with multiple strict type errors:
  - `TS7030: Not all code paths return a value` in 3 key animation/toast components (`AchievementToast.tsx`, `AnimatedCell.tsx`, `GemShower.tsx`).
  - 70+ unused imports, unused local variables, and unused destructured variables (`TS6133`, `TS6192`, `TS6198`).
  - Over 36 explicit `any` and `as any` annotations bypassing TypeScript type safety across state containers, theme providers, board definitions, and external API mappings.
- **ESLint Tooling Broken Out-of-the-Box**: `npm run lint` fails immediately with an uncaught error because ESLint was upgraded to `v10.8.0` (which requires Flat Config `eslint.config.mjs` and removes the `--ext` flag), while the project retains a legacy `.eslintrc.json` and legacy scripts in `package.json`.
- **Word Bank Length Mismatch vs Game State Invariant**: `constants/words.ts` and `words_en.ts` contain 100+ words ranging from 3 to 8 letters (despite claiming `TÜMÜ KESİNLİKLE 5 HARFLİ`). When selected by `getRandomWord()`, they deadlock gameplay in `useDuel.ts`, `useBlitz.ts`, and `useDordle.ts` because these modes enforce fixed 5-column boards (`WORD_LENGTH = 5`).
- **Critical Infinite Recursion**: `shuffle()` in `hooks/useAnagram.ts` uses recursive self-invocation `if (a.join('') === arr.join('')) return shuffle(arr);`, which triggers a stack overflow crash on identical-letter words.
- **Architectural State Fragmentation & Dead Code**: Two distinct state management systems coexist in contradiction:
  - The application UI screens almost exclusively use `useProgress.ts` (isolated component-local `useState`), causing state desynchronization across tabs.
  - Meanwhile, `store/progressStore.ts` (a Zustand store) is only imported by `hooks/useGameSession.ts`, which is never used anywhere in the codebase.
  - `store/settingsStore.ts` is 100% dead code, completely bypassed in favor of `hooks/useTheme.tsx`.
- **Conflicting In-App Purchase SKUs**: `services/iap.service.ts` and `constants/products.ts` define two completely different, conflicting sets of Product IDs/SKUs with separate connection lifecycles.

### Severity Summary Table

| Severity Level | Count | Description |
| :--- | :---: | :--- |
| 🔴 **Critical** | 3 | Game-breaking deadlocks, runtime recursion crashes, broken CI lint runner |
| 🟠 **High** | 7 | Strict type violations, IAP SKU conflicts, crossword collision, corrupt storage crash risk, state desynchronization, Firestore index failure, Wordle evaluation bug |
| 🟡 **Medium** | 11 | `any` abuse, circular imports, silent catch blocks, missing Sentry error capture, memory leaks, duplicate XP grants, stale closures, missing localization |
| 🟢 **Low / Info** | 6 | 70+ unused variables, dead code modules, static theme bypassing dynamic context, React key anti-patterns, non-integer XP types |
| **Total Findings** | **27** | |

---

## 2. TypeScript Strict Mode Readiness Assessment

| Strict Flag | Status | Finding Summary |
| :--- | :---: | :--- |
| `"strict": true` | ⚠️ Partial | Passes baseline check in `tsconfig.json`, but bypassed via `any` casts in 36 places. |
| `"noImplicitReturns": true` | ❌ Fails | 3 functions fail with `TS7030` (`AchievementToast.tsx:15`, `AnimatedCell.tsx:64`, `GemShower.tsx:33`). |
| `"noUnusedLocals": true` | ❌ Fails | 50+ unused local variables (`TS6133`). |
| `"noUnusedParameters": true` | ❌ Fails | 15+ unused function/hook parameters (`TS6133`). |
| `"noFallthroughCasesInSwitch": true` | ✅ Passes | Switch statements have explicit `break` or `return`. |
| `"strictNullChecks": true` | ⚠️ Weak | Relies on unsafe non-null assertions (`!`, `null!`) to bypass null checking. |

---

## 3. Catalog of Detailed Audit Findings

### 🔴 Critical Severity Findings

#### [R1-F01] Word Bank Length Discrepancy Causes Gameplay Deadlock in Duel, Blitz & Dordle
- **File & Line**: `constants/words.ts:18-80, 102-108`, `constants/words_en.ts:4-39`, `hooks/useDuel.ts:25-38, 140, 185-192`, `hooks/useBlitz.ts:3, 90, 101`, `hooks/useDordle.ts:21, 46, 103`
- **Severity**: Critical
- **Description**: `constants/words.ts` states `// Kategorize edilmiş Türkçe kelime listesi (TÜMÜ KESİNLİKLE 5 HARFLİ)`, but contains over 80 words of lengths 3, 4, 6, 7, 8 (`AYI`, `KEDİ`, `HÜTHÜT`, `PENGUEN`, `SIRTLAN`, `ISPARTA`, `DOKTOR`, `AVUKAT`, `FUTBOL`). `constants/words_en.ts` contains 23 non-5-letter words (`BEAR`, `WOLF`, `COWBOY`, `POLICE`, `DENTIST`, `FOREST`).
  Furthermore, `filterWordList` explicitly permits 4 to 6 letter words (`len >= 4 && len <= 6`).
  However, `useDuel.ts`, `useBlitz.ts`, and `useDordle.ts` fix the board grid strictly to `WORD_LENGTH = 5`.
  - In `useDuel.ts`: When a 4-letter word is picked, `playerCol` reaches 4 and `playerCol < WORD_LENGTH` (5) evaluates to true, so `submitGuess` returns `'short'`, making it impossible to submit. When a 6- or 7-letter word is picked (`'ISPARTA'`), `prev.playerCol >= WORD_LENGTH` prevents typing the 6th character, making `guess === targetWord` impossible to satisfy.
  - In `useBlitz.ts`: 4-letter words cannot be submitted (returns `'short'`), and 6-letter words cannot be completed.
- **Code Snippet**:
  ```ts
  // constants/words.ts
  const filterWordList = (list: string[]): string[] => {
    const filtered = list.filter(w => {
      const len = w.replace(/\s/g, '').length;
      return len >= 4 && len <= 6;
    });
    return filtered.length > 0 ? filtered : list;
  };

  // hooks/useDuel.ts
  const [state, setState] = useState<DuelState>(() => ({
    targetWord,
    playerBoard: createEmptyBoard(), // Array(MAX_GUESSES).map(() => Array(WORD_LENGTH=5)...)
  }));
  ```
- **Reproduction Steps**:
  1. Start a Duel or Blitz game in Turkish or English.
  2. If `getRandomWord()` selects `'ISPARTA'` or `'BEAR'`, attempt to type and submit the word.
  3. Observe that typing stops at 5 letters for 7-letter words, or submit is rejected with `'short'` for 4-letter words, rendering the game unwinnable.
- **Remediation**:
  1. Strictly sanitize `constants/words.ts` and `constants/words_en.ts` so that every word bank entry is exactly 5 characters.
  2. Enforce length filtering in `filterWordList`: `return len === 5;`.
  3. In all mode hooks, decouple word length from hardcoded constants by using `targetWord.length` dynamically if multi-length support is intended.

---

#### [R1-F02] Unbounded Infinite Recursion in `shuffle()` Leading to Stack Overflow Crash
- **File & Line**: `hooks/useAnagram.ts:20-28`
- **Severity**: Critical
- **Description**: The `shuffle()` utility in `useAnagram.ts` shuffles letter arrays using Fisher-Yates. If the shuffled array happens to equal the input array (or if the input word consists of duplicate letters, or single-permutation sets), it recursively calls `shuffle(arr)` without any recursion depth limit or fallback. On words with identical letters or small permutations, this triggers a call stack overflow crash (`RangeError: Maximum call stack size exceeded`).
- **Code Snippet**:
  ```ts
  // hooks/useAnagram.ts:20-28
  const shuffle = (arr: string[]): string[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.join('') === arr.join('')) return shuffle(arr); // Unbounded recursion!
    return a;
  };
  ```
- **Reproduction Steps**:
  1. Pass an array of identical characters (e.g. `['A', 'A', 'A', 'A', 'A']`) or run `shuffle(['A', 'B'])` multiple times.
  2. Observe `RangeError: Maximum call stack size exceeded` crashing the JavaScript thread.
- **Remediation**:
  Use an iterative loop with a maximum retry counter (e.g., max 5 attempts). If all attempts produce the original string, swap adjacent letters or return the permutation directly:
  ```ts
  const shuffle = (arr: string[]): string[] => {
    if (arr.length <= 1) return [...arr];
    const a = [...arr];
    for (let attempt = 0; attempt < 5; attempt++) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      if (a.join('') !== arr.join('')) return a;
    }
    return a;
  };
  ```

---

#### [R1-F03] ESLint v10 Tooling Configuration Incompatibility Crashing CI Runner
- **File & Line**: `package.json:39, 57`, `.eslintrc.json:1-23`
- **Severity**: Critical
- **Description**: `package.json` installs `"eslint": "^10.8.0"`. Starting in ESLint v9/v10, ESLint defaults to Flat Config (`eslint.config.mjs` / `eslint.config.js`) and deprecated/removed the `--ext` flag. Furthermore, legacy `.eslintrc.json` files are rejected. Running `npm run lint` fails immediately with `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` and fatal error code 1.
- **Code Snippet**:
  ```json
  // package.json:57
  "lint": "eslint . --ext .ts,.tsx --max-warnings 50"
  ```
- **Reproduction Steps**:
  1. Execute `npm run lint` in the workspace root.
  2. Observe immediate crash output from ESLint 10.8.0.
- **Remediation**:
  1. Migrate `.eslintrc.json` to flat config `eslint.config.mjs` using `@eslint/js` and `typescript-eslint`.
  2. Update `package.json` script to: `"lint": "eslint ."` without `--ext`.

---

### 🟠 High Severity Findings

#### [R1-F04] TypeScript Strict `TS7030` Inconsistent Return Path Errors in Effects
- **File & Line**: `components/AchievementToast.tsx:15-31`, `components/AnimatedCell.tsx:64-70`, `components/GemShower.tsx:33-59`
- **Severity**: High
- **Description**: When TypeScript strict option `noImplicitReturns` is enabled, arrow functions passed to `useEffect` must return either a cleanup function or `undefined` across all branches. In these 3 components, an `if` statement conditionally returns `() => clearTimeout(timer)` while the implicit fall-through returns `undefined`, triggering `error TS7030: Not all code paths return a value`.
- **Code Snippet**:
  ```tsx
  // components/AchievementToast.tsx:15-31
  useEffect(() => {
    if (achievement) {
      // ...
      const timer = setTimeout(...);
      return () => clearTimeout(timer);
    }
  }, [achievement]);
  ```
- **Reproduction Steps**:
  1. Run `npx tsc --noEmit --noImplicitReturns`.
  2. Observe 3 compilation errors: `components/AchievementToast.tsx(15,13)`, `components/AnimatedCell.tsx(64,13)`, `components/GemShower.tsx(33,13)`.
- **Remediation**:
  Ensure cleanup functions are returned unconditionally or structure the effect without conditional return branching:
  ```tsx
  useEffect(() => {
    if (!achievement) return;
    // ...
    const timer = setTimeout(...);
    return () => clearTimeout(timer);
  }, [achievement]);
  ```

---

#### [R1-F05] Conflicting In-App Purchase SKU / Product ID Declarations & Connection Lifecycle Collisions
- **File & Line**: `services/iap.service.ts:5-11, 27-37, 97-105`, `constants/products.ts:4-15`, `components/StoreModal.tsx:111-172`
- **Severity**: High
- **Description**: Two conflicting sets of In-App Purchase product identifiers are declared:
  1. `services/iap.service.ts` defines: `'com.logos.premium'`, `'com.logos.gems100'`, `'com.logos.gems500'`, `'com.logos.gems1200'`, `'com.logos.gems3000'`.
  2. `constants/products.ts` defines: `'com.zovtex.logos.gems.small'`, `'com.zovtex.logos.gems.medium'`, `'com.zovtex.logos.gems.large'`, `'com.zovtex.logos.premium.lifetime'`, `'com.zovtex.logos.premium.monthly'`.
  In addition, `components/StoreModal.tsx` calls `initConnection()` and `endConnection()` directly on modal open/close, while `services/iap.service.ts` maintains its own `connectionEstablished` flag. Opening and closing the store modal closes the native billing connection behind `iap.service.ts`.
- **Code Snippet**:
  ```ts
  // services/iap.service.ts:5-11
  export const PRODUCT_IDS = {
    PREMIUM: 'com.logos.premium',
    GEMS_100: 'com.logos.gems100',
    // ...
  };

  // constants/products.ts:4-15
  export const PRODUCT_IDS = {
    GEM_SMALL: 'com.zovtex.logos.gems.small',
    PREMIUM_LIFETIME: 'com.zovtex.logos.premium.lifetime',
    // ...
  };
  ```
- **Reproduction Steps**:
  1. Compare SKUs between `services/iap.service.ts` and `constants/products.ts`.
  2. Attempt purchase query with mismatching SKUs on Google Play / App Store.
- **Remediation**:
  Consolidate all IAP SKU declarations into a single canonical source of truth in `constants/products.ts` matching Google Play Console. Route all store purchases exclusively through `services/iap.service.ts`.

---

#### [R1-F06] Crossword Matrix Coordinate Collision & Character Corruption in `useWordConnect`
- **File & Line**: `hooks/useWordConnect.ts:42-52, 81-103`
- **Severity**: High
- **Description**: In `LEVELS_TR` Level 2 of `useWordConnect.ts`:
  - Word `MASAT` is placed vertically at `(0, 4)`: cells are `(0,4)=M`, `(1,4)=A`, `(2,4)=S`, `(3,4)=A`, `(4,4)=T`.
  - Word `SAAT` is placed horizontally at `(2, 2)`: cells are `(2,2)=S`, `(2,3)=A`, `(2,4)=A`, `(2,5)=T`.
  At intersection coordinate `(2, 4)`, `MASAT` expects `'S'` while `SAAT` expects `'A'`.
  Because `buildCells()` deduplicates cells with `if (!seen.has(key))`, whichever word is processed first assigns its character. When the player enters `SAAT`, cell `(2,4)` is rendered with `'S'` instead of `'A'`, corrupting the crossword UI.
- **Code Snippet**:
  ```ts
  // hooks/useWordConnect.ts:42-52
  {
    letters: ['T', 'A', 'S', 'M', 'A'],
    targetWords: ['TASMA', 'MASAT', 'SAAT', 'MALA'],
    layout: [
      ['TASMA', 0, 1, 'H'],
      ['MASAT', 0, 4, 'V'], // (2,4) is 'S'
      ['SAAT', 2, 2, 'H'],  // (2,4) is 'A' -> Collision!
      ['MALA', 0, 1, 'V'],
    ]
  }
  ```
- **Reproduction Steps**:
  1. Open Word Connect mode level 2 (Turkish).
  2. Solve `SAAT` and `MASAT`.
  3. Observe conflicting letters rendered in cell `(2, 4)`.
- **Remediation**:
  Correct the crossword level layout coordinates in `LEVELS_TR` so intersecting coordinates share the exact same character.

---

#### [R1-F07] Unhandled `SyntaxError` Crash Risk on Corrupt AsyncStorage `JSON.parse` Deserialization
- **File & Line**: `services/storage.service.ts:101, 158, 187, 210, 220`, `store/settingsStore.ts:61`
- **Severity**: High
- **Description**: Multiple helper methods in `storage.service.ts` (`getStats`, `getUnlockedAchievements`, `getScores`, `storageGetJSON`, `getUnlockedCategories`) directly call `JSON.parse(v)` without wrapping it in a try/catch block. If AsyncStorage contains corrupt data (due to app termination during write, partial migrations, or storage tampering), `JSON.parse` throws an unhandled `SyntaxError` that terminates the application on startup.
- **Code Snippet**:
  ```ts
  // services/storage.service.ts:101
  export const getStats = async (): Promise<FullStats> => {
    const v = await AsyncStorage.getItem(KEYS.STATS);
    return v ? { ...DEFAULT_STATS, ...JSON.parse(v) } : DEFAULT_STATS; // Throws SyntaxError on malformed JSON
  };
  ```
- **Reproduction Steps**:
  1. Write an invalid JSON string (e.g. `"{malformed"`) to key `'gq_stats'` in AsyncStorage.
  2. Launch the app or call `getStats()`.
  3. Observe fatal app crash.
- **Remediation**:
  Wrap all JSON deserialization in try/catch with fallback to default structures:
  ```ts
  export const getStats = async (): Promise<FullStats> => {
    try {
      const v = await AsyncStorage.getItem(KEYS.STATS);
      return v ? { ...DEFAULT_STATS, ...JSON.parse(v) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  };
  ```

---

#### [R1-F08] Dual Redundant State Architecture Fragmentation
- **File & Line**: `hooks/useProgress.ts:12-194`, `store/progressStore.ts:29-268`, `app/(tabs)/*.tsx`, `app/*.tsx`
- **Severity**: High
- **Description**: The project has two separate state management implementations for player progress:
  1. `hooks/useProgress.ts`: A custom hook using standard React `useState`.
  2. `store/progressStore.ts`: A centralized Zustand store with atomic persistence.
  All application screens (`index.tsx`, `modes.tsx`, `profile.tsx`, `settings.tsx`, `blitz.tsx`, `anagram.tsx`, etc.) instantiate `useProgress()`. Because `useProgress` creates isolated `useState` instances per component, updating gems/XP in one screen does NOT update other mounted screens/tabs, causing stale state and visual discrepancies across the app.
- **Code Snippet**:
  ```tsx
  // app/(tabs)/index.tsx:30
  const progress = useProgress(); // Isolated useState!

  // app/(tabs)/modes.tsx:16
  const progress = useProgress(); // Separate isolated useState!
  ```
- **Reproduction Steps**:
  1. Earn gems in a game mode.
  2. Navigate back to Tabs (`modes.tsx` or `profile.tsx`).
  3. Observe that gem counter in other tabs remains stale until remounted.
- **Remediation**:
  Refactor all screens to use `useProgressStore` (the shared Zustand store) instead of `useProgress()`, ensuring single source of truth and global reactivity.

---

#### [R1-F09] Missing Firestore Composite Index Causing Silent Leaderboard Query Failures
- **File & Line**: `services/leaderboard.service.ts:81-111`
- **Severity**: High
- **Description**: `getMyBestScores()` constructs a Firestore query combining an equality filter and an ordering clause: `where('uid', '==', user.uid)` and `orderBy('score', 'desc')`. Firestore requires a deployed composite index for this query. Without this index, Firestore throws a `FirebaseError: The query requires an index` error, which is caught and silently returns `[]`.
- **Code Snippet**:
  ```ts
  // services/leaderboard.service.ts:87-92
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.SCORES),
    where('uid', '==', user.uid),
    orderBy('score', 'desc'),
    limit(10)
  );
  ```
- **Reproduction Steps**:
  1. Invoke `getMyBestScores()` with a signed-in user against a Firestore instance without manual composite indexes configured.
  2. Observe that the query always fails and returns an empty array `[]`.
- **Remediation**:
  Document required Firestore composite indexes in `firestore.rules` / `firebase.json` or perform local sorting on user-filtered docs:
  ```json
  {
    "collectionGroup": "scores",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "uid", "order": "ASCENDING" },
      { "fieldPath": "score", "order": "DESCENDING" }
    ]
  }
  ```

---

#### [R1-F10] Flawed Wordle Duplicate-Letter Frequency Logic in `useDuel.ts`
- **File & Line**: `hooks/useDuel.ts:108-113, 197-202`
- **Severity**: High
- **Description**: In `useDuel.ts`, both bot simulation and player guess evaluation color letters yellow (`'present'`) based on `prev.targetWord.includes(cell.char)`. This violates Wordle's two-pass frequency rule. For instance, if the target word is `'TIGER'` (containing one `'E'`), and the player guesses `'SPEED'` (two `'E'`s), BOTH `'E'`s will be marked yellow/green even though only one exists in the target word.
- **Code Snippet**:
  ```ts
  // hooks/useDuel.ts:197-202
  if (prev.targetWord[cIdx] === cell.char) {
    status = 'correct';
  } else if (prev.targetWord.includes(cell.char)) {
    status = 'present'; // Flawed: doesn't account for letter frequency!
  }
  ```
- **Reproduction Steps**:
  1. Play Duel mode where target is `'TIGER'`.
  2. Submit `'SPEED'`.
  3. Observe both `'E'` characters marked present.
- **Remediation**:
  Adopt the standard two-pass Wordle evaluation algorithm implemented in `useGame.ts:154-166`.

---

### 🟡 Medium Severity Findings

#### [R1-F11] Pervasive `any` Type Annotations Bypassing Type Safety
- **File & Line**: 36 occurrences across `app/(tabs)/index.tsx:128`, `app/(tabs)/modes.tsx:34`, `app/dordle.tsx:30, 33`, `app/duel.tsx:35`, `app/wordconnect.tsx:38`, `components/AnimatedCell.tsx:27, 30, 41`, `components/CloudLoginForm.tsx:10`, `components/CloudSyncStatus.tsx:15`, `components/DailySpinModal.tsx:48`, `components/DefinitionCard.tsx:9`, `components/FeedbackForm.tsx:11`, `components/FeedbackTypeSelector.tsx:10`, `components/FilterChips.tsx:15`, `components/GameEndCertificate.tsx:13`, `components/GameResultOverlay.tsx:21`, `components/GuessDistributionChart.tsx:6`, `components/HintOptionCard.tsx:12`, `components/ScoreRow.tsx:9`, `components/SpinPrizeTable.tsx:8`, `components/SpinWheel.tsx:10`, `components/SpinWheelCanvas.tsx:39`, `components/StickerFlipCard.tsx:16`, `components/StickerGridCard.tsx:16`, `components/StoreModal.tsx:51`, `components/TimeHistoryChart.tsx:6`, `services/definition.service.ts:16, 35, 36`, `screens/GameMenuScreen.tsx:19`, `screens/GamePlayScreen.tsx:26, 30, 54, 279`.
- **Severity**: Medium
- **Description**: 20+ UI components define `theme: any` in their props instead of importing `Theme` from `constants/themes.ts`. `GamePlayScreen` declares `board: any[][]` and `newAchievement: any`. `definition.service.ts` uses `item: any`, `meaning: any`, `def: any`. This disables IDE autocomplete, refactoring safety, and static type checking.
- **Code Snippet**:
  ```tsx
  // components/GuessDistributionChart.tsx:6
  export function GuessDistributionChart({ distribution, theme }: { distribution: Record<number, number>; theme: any })

  // screens/GamePlayScreen.tsx:30
  board: any[][];
  ```
- **Remediation**: Replace all `theme: any` with `Theme` from `constants/themes.ts` and type board as `Board` from `constants/words.ts`.

---

#### [R1-F12] Circular Module Dependency Between `words.ts` and `words_en.ts`
- **File & Line**: `constants/words.ts:1-2`, `constants/words_en.ts:1`
- **Severity**: Medium
- **Description**: `constants/words.ts` imports runtime values `WORD_BANK_EN` and `ALL_WORDS_EN` from `./words_en`. Meanwhile, `constants/words_en.ts` imports `Category` from `./words`. Because `words_en.ts` uses a standard runtime import rather than a type-only import (`import type { Category }`), a circular dependency cycle (`words.ts -> words_en.ts -> words.ts`) is created. In Metro bundler builds, this can lead to `undefined` exports during module evaluation.
- **Code Snippet**:
  ```ts
  // constants/words_en.ts:1
  import { Category } from './words'; // Creates circular import cycle
  ```
- **Remediation**: Change to `import type { Category } from './words';` or extract shared types to a dedicated `types/game.ts` file.

---

#### [R1-F13] Silent Error Catch Blocks Swallowing Failures Without Logging or Reporting
- **File & Line**: `app/dordle.tsx:164`, `services/audio.service.ts:173`, `services/notification.service.ts:55`, `services/share.service.ts:34, 44`, `store/progressStore.ts:241`
- **Severity**: Medium
- **Description**: Multiple critical asynchronous operations use empty `catch {}` or `catch (_) {}` blocks that discard errors without logging to `console.warn`/`console.error` or reporting to Sentry. For example, `progressStore.ts:241` silently ignores cloud leaderboard score sync failures.
- **Code Snippet**:
  ```ts
  // store/progressStore.ts:241
  try {
    const { cloudService } = require('../services/cloud.service');
    const scoreVal = opts.xpEarned + streakXpBonus;
    await cloudService.submitScore(scoreVal, opts.mode || 'classic', opts.category || 'random');
  } catch(e) {
    // silently ignore cloud score failure
  }
  ```
- **Remediation**: Log all non-fatal errors with context and invoke `captureError(e)` from `services/error-reporting.service.ts`.

---

#### [R1-F14] Incomplete ErrorBoundary Sentry Integration
- **File & Line**: `components/ErrorBoundary.tsx:24-26`, `services/error-reporting.service.ts:14-20`
- **Severity**: Medium
- **Description**: `components/ErrorBoundary.tsx` implements `componentDidCatch(error, errorInfo)` by calling only `console.error('ErrorBoundary caught:', error, errorInfo)`. It fails to import or call `captureError` from `services/error-reporting.service.ts`. Consequently, unhandled React component tree rendering crashes in production are never transmitted to Sentry.
- **Code Snippet**:
  ```tsx
  // components/ErrorBoundary.tsx:24-26
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo); // Never reported to Sentry!
  }
  ```
- **Remediation**: Import `captureError` and forward the error with component stack details:
  ```tsx
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    captureError(error, { componentStack: errorInfo.componentStack });
  }
  ```

---

#### [R1-F15] Missing Event Listener Cleanup in DeepLink and Auth Services
- **File & Line**: `services/deeplink.service.ts:4-9`, `services/auth.service.ts:10-21`, `app/_layout.tsx:34`
- **Severity**: Medium
- **Description**: `setupDeepLinkHandler()` attaches an event listener via `Linking.addEventListener('url', handleDeepLink)`. It returns `void` without exposing the returned `EmitterSubscription.remove()` method. In `app/_layout.tsx`, `useEffect(() => { setupDeepLinkHandler(); }, [])` cannot clean up the listener, creating an uncollectable subscription if the layout remounts.
- **Code Snippet**:
  ```ts
  // services/deeplink.service.ts:4-9
  export function setupDeepLinkHandler() {
    Linking.addEventListener('url', handleDeepLink); // Subscription discarded!
    // ...
  }
  ```
- **Remediation**: Return the unsubscribe function from `setupDeepLinkHandler()` and invoke it in the `useEffect` cleanup.

---

#### [R1-F16] Concurrent Audio Instance Allocation Race Condition
- **File & Line**: `services/audio.service.ts:134-152`
- **Severity**: Medium
- **Description**: In `audioService.play(type)`: `if (!sound) { const result = await Audio.Sound.createAsync(...); this.soundPool[type] = sound; }`. When user taps keyboard buttons rapidly, multiple `play('click')` calls execute concurrently before `this.soundPool[type]` is populated. This causes multiple redundant `Audio.Sound` instances to be created in parallel, leaking native media player handles.
- **Code Snippet**:
  ```ts
  // services/audio.service.ts:138-146
  let sound = this.soundPool[type];
  if (!sound) {
    const result = await Audio.Sound.createAsync(
      SOUNDS[type],
      { shouldPlay: true, volume: 0.7 }
    );
    sound = result.sound;
    this.soundPool[type] = sound; // Race condition if multiple calls are in-flight!
  }
  ```
- **Remediation**: Protect sound creation with a promise cache or ensure all sounds are strictly preloaded on app startup via `preloadSounds()`.

---

#### [R1-F17] Duplicate XP Award Calculation in `handleGameEnd`
- **File & Line**: `app/(tabs)/index.tsx:69, 86-90`, `store/progressStore.ts:195`
- **Severity**: Medium
- **Description**: In `app/(tabs)/index.tsx`, when a game is won:
  1. Line 69: `await progress.earnXP(xp);` adds `xp` to total XP storage.
  2. Line 86-90: `await progress.recordWin({ ..., xpEarned: xp });` is called.
  3. Inside `progressStore.ts:195`, `recordWin` computes `totalXP: stats.totalXP + opts.xpEarned + streakXpBonus`, adding `opts.xpEarned` a second time to statistics. This causes total XP to double-count on every win.
- **Code Snippet**:
  ```ts
  // app/(tabs)/index.tsx:69-89
  await progress.earnXP(xp); // Adds XP once
  // ...
  await progress.recordWin({ ..., xpEarned: xp }); // Adds XP again in stats!
  ```
- **Remediation**: Remove `progress.earnXP(xp)` from `index.tsx` and allow `recordWin` to handle atomic XP increments, or pass `0` to stats XP increment if already handled.

---

#### [R1-F18] Stale Closure in Physical Keyboard Event Listener on Web
- **File & Line**: `app/blitz.tsx:50-70`
- **Severity**: Medium
- **Description**: `app/blitz.tsx` attaches a `window.addEventListener('keydown', handleKeyDown)` with dependency array `[]`. Because `handleKeyDown` captures `game.status` and `handleSubmit` at initial render, it holds stale state. If the game status changes to `'ended'`, `handleKeyDown` continues to call `handleSubmit` with stale parameters.
- **Code Snippet**:
  ```tsx
  // app/blitz.tsx:50-70
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return; // Stale game.status!
      // ...
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Missing game.status in dependencies
  ```
- **Remediation**: Use a `useRef` for latest game state or include `game.status` in the dependency array.

---

#### [R1-F19] Missing Localization in Game Modes & Tab Layout
- **File & Line**: `hooks/useWordChain.ts:56, 66, 76`, `app/chain.tsx:30, 52, 54`, `app/(tabs)/_layout.tsx:26, 33, 40, 47, 54`
- **Severity**: Medium
- **Description**: Multiple screens and hooks hardcode Turkish strings regardless of user's selected language (`'tr'` vs `'en'`). In `useWordChain.ts`, error messages (`'harfiyle başlamalı!'`, `'Bu kelime zaten kullanıldı!'`, `'Geçersiz kelime!'`) are hardcoded. In `app/(tabs)/_layout.tsx`, tab titles (`'Klasik'`, `'Modlar'`, `'Skor'`, `'Ayarlar'`, `'Profil'`) are static and do not react to language changes.
- **Remediation**: Wrap all user-facing strings with `TRANSLATIONS[language]`.

---

#### [R1-F20] Inconsistent Leaderboard Score Calculation Formulas
- **File & Line**: `app/(tabs)/index.tsx:80-84`, `services/leaderboard.service.ts:43-48`, `services/cloud.service.ts:180-195`
- **Severity**: Medium
- **Description**: Score submission is implemented inconsistently across 3 separate modules:
  1. `index.tsx` submits raw `xpEarned: xp` to `leaderboard.service.ts`.
  2. `leaderboard.service.ts:submitScore()` recalculates points via `calculateScore(entry)` (adding bonuses for guesses and speed).
  3. `cloud.service.ts:submitScore()` accepts a single raw `score: number` and writes it directly.
  4. `progressStore.ts:239` submits `scoreVal = opts.xpEarned + streakXpBonus` to `cloudService`.
- **Remediation**: Unify scoring into a single deterministic scoring engine in `services/leaderboard.service.ts`.

---

#### [R1-F21] `LeaderboardScreen` Submits Oldest Score Instead of Most Recent Score
- **File & Line**: `app/(tabs)/leaderboard.tsx:75`
- **Severity**: Medium
- **Description**: In `handleSubmitScore()`: `const ok = await submitScore(scores[scores.length - 1]);`. In `storage.service.ts:191`, scores are stored with newest at index 0: `[entry, ...scores]`. Therefore, `scores[scores.length - 1]` selects the user's oldest game from history instead of their most recent score.
- **Code Snippet**:
  ```ts
  // app/(tabs)/leaderboard.tsx:75
  const ok = await submitScore(scores[scores.length - 1]); // Submits oldest score!
  ```
- **Remediation**: Submit `scores[0]` (the most recent score).

---

### 🟢 Low & Informational Severity Findings

#### [R1-F22] Over 70 Unused Imports, Variables, and Destructured Elements
- **File & Line**: Project-wide across 28 files (`app/(tabs)/_layout.tsx:2`, `app/(tabs)/leaderboard.tsx:7, 10`, `app/(tabs)/modes.tsx:8`, `app/(tabs)/settings.tsx:4`, `app/anagram.tsx:1, 4, 33`, `app/blitz.tsx:3, 4`, `app/chain.tsx:1`, `app/dordle.tsx:8, 9, 94`, `app/duel.tsx:8, 19, 28`, `app/onboarding.tsx:4, 12`, `app/wordconnect.tsx:6, 9, 20`, `components/AlertButton.tsx:3`, `components/CloudSyncModal.tsx:19`, `components/DailySpinModal.tsx:6, 33`, `components/DefinitionCard.tsx:13`, `components/FilterChips.tsx:2`, `components/GameBoard.tsx:3`, `components/GameResultOverlay.tsx:4`, `components/GemShower.tsx:10`, `components/HelpModal.tsx:7, 10`, `components/HintOptionCard.tsx:22`, `components/InviteModal.tsx:4, 16`, `components/LoadingView.tsx:3`, `components/StickerAlbumModal.tsx:7`, `components/StickerFlipCard.tsx:10`, `components/StickerGridCard.tsx:3`, `components/StoreModal.tsx:65`, `components/StoreRestoreButton.tsx:8`, `components/WordDefinitionModal.tsx:6`, `constants/themes.ts:1`, `hooks/useBlitz.ts:3`, `hooks/useDuel.ts:106`, `hooks/useTheme.tsx:3`, `screens/GameMenuScreen.tsx:39, 114`, `services/notification.service.ts:4`, `services/referral.service.ts:1, 2, 8`, `store/progressStore.ts:2, 11`, `store/settingsStore.ts:2, 3`).
- **Severity**: Low
- **Description**: 70+ symbols are imported or declared but never read, causing `TS6133`, `TS6192`, and `TS6198` compiler warnings.
- **Remediation**: Run a clean-up pass to remove all unreferenced imports and variables.

---

#### [R1-F23] Completely Dead/Unused Store and Hook Modules
- **File & Line**: `store/settingsStore.ts:1-177`, `hooks/useGameSession.ts:1-98`
- **Severity**: Low
- **Description**: `store/settingsStore.ts` and `hooks/useGameSession.ts` are never imported or invoked anywhere in the application runtime. They increase bundle size and maintenance overhead.
- **Remediation**: Either wire them up to replace the fragmented local hooks or delete the dead files.

---

#### [R1-F24] Static `COLORS` Constants Bypassing Dynamic `useTheme()` Context
- **File & Line**: `app/(tabs)/_layout.tsx:11-20`, `app/chain.tsx:47-48`, `components/ErrorBoundary.tsx:53-64`, `components/Keyboard.tsx:39`
- **Severity**: Low
- **Description**: Components import static `COLORS` from `constants/theme.ts` instead of consuming `theme.colors` from `useTheme()`. When a user toggles to the Light or Gold theme, tab bars, error boundaries, and chain mode remain permanently dark.
- **Remediation**: Use `theme.colors` dynamically across all styled views.

---

#### [R1-F25] Array Index Used as React Key Anti-Pattern
- **File & Line**: `app/(tabs)/leaderboard.tsx:181`, `components/Confetti.tsx:104`, `components/GemShower.tsx:66`
- **Severity**: Low
- **Description**: `.map((score, i) => <ScoreRow key={i} ... />)` uses array indices as keys. If items reorder or filter dynamically, React reconciler can misidentify DOM nodes.
- **Remediation**: Use unique item IDs (e.g. `score.date + '-' + i` or `p.id`).

---

#### [R1-F26] Non-Integer Floating Point XP Assignment
- **File & Line**: `app/blitz.tsx:44`
- **Severity**: Low
- **Description**: In `app/blitz.tsx:44`: `await progress.earnXP(game.score / 10);`. If `game.score` is not a multiple of 10, fractional floating-point XP values are saved to storage.
- **Remediation**: Use `Math.floor(game.score / 10)`.

---

#### [R1-F27] Unsafe Non-Null Assertions (`!`)
- **File & Line**: `hooks/useGame.ts:38, 79`, `services/storage.service.ts:13`
- **Severity**: Low
- **Description**: `const stateRef = useRef<GameState>(null!)` passes `null!` to bypass initialization checks. In `storage.service.ts:13`, `release!()` asserts `release` is non-null.
- **Remediation**: Initialize `useRef` with appropriate optional or nullable types.

---

## 4. Remediation Prioritization Roadmap

1. **Immediate Release Blockers (P0 - Critical)**:
   - Fix `constants/words.ts` and `words_en.ts` to strictly contain 5-letter words so Duel, Blitz, and Dordle game modes do not deadlock.
   - Fix `shuffle()` in `hooks/useAnagram.ts` to prevent infinite recursion and stack overflow crashes.
   - Migrate ESLint configuration to `eslint.config.mjs` and update `package.json` lint scripts.
2. **High Priority Stability Fixes (P1 - High)**:
   - Resolve `TS7030` return path errors in `AchievementToast.tsx`, `AnimatedCell.tsx`, `GemShower.tsx`.
   - Align In-App Purchase SKUs across `services/iap.service.ts` and `constants/products.ts`.
   - Fix crossword coordinate overlap in `hooks/useWordConnect.ts` Level 2.
   - Wrap all `JSON.parse` operations in `services/storage.service.ts` with error-safe fallbacks.
   - Unify player progress state under `store/progressStore.ts` (Zustand) across all screens.
   - Correct two-pass Wordle letter coloring algorithm in `hooks/useDuel.ts`.
3. **Quality & Maintenance (P2 - Medium/Low)**:
   - Replace 36 `any` annotations with strong TypeScript interfaces.
   - Wire `ErrorBoundary` to report caught errors to Sentry.
   - Remove dead code files (`store/settingsStore.ts`, `hooks/useGameSession.ts`) and clean up 70+ unused imports.
