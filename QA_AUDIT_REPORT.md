# Comprehensive Quality Assurance Audit Report & Production Go/No-Go Assessment
# "Logos: Kelime Avı ve Bulmaca" (GemQuest52)

**Document Version**: 1.0.0 (Authoritative Final QA Synthesis)  
**Audit Date**: August 31, 2026  
**Target Package / Application ID**: `com.zovtex.logos`  
**Application Title**: Logos: Kelime Avı ve Bulmaca  
**Target Framework**: React Native 0.76.9 / Expo SDK 52 (React 18.3.1)  
**Target Platform**: Android (compileSdkVersion 35, targetSdkVersion 35, minSdkVersion 24 / Android 15 Ready) & iOS (iOS 15.1+)  
**Audit Scope**: Track R1 (Static Code Analysis & Type Safety), Track R2 (Gameplay Logic & State Correctness), Track R3 (Security & Anti-Cheat), Track R4 (Performance, Memory & Dynamic Testing), Track R5 (Google Play Developer Policy & Store Readiness).  
**Integrity Mode**: Strict Read-Only Audit (Application codebase was not altered during audit).

---

# 1. Executive Summary & Audit Overview

A comprehensive, adversarial quality assurance and security audit of the mobile game application **"Logos: Kelime Avı ve Bulmaca"** was conducted across five independent investigation tracks. The evaluation encompassed TypeScript static type verification, complete state machine analysis of all seven game modes, full-stack threat modeling (local storage, Cloud Firestore, Firebase Authentication, in-app billing), automated memory/timer profiling, dynamic engine simulation under both win and loss execution paths, and rigorous Google Play Developer Program Policy benchmarking.

### Final Production Release Verdict:
# ⛔ NO-GO FOR PRODUCTION RELEASE (RELEASE BLOCKED)

The codebase exhibits multiple **Critical** and **High** severity vulnerabilities that directly compromise business monetization, expose production signing infrastructure, render multiple core game modes mathematically unsolvable, cause sudden player level demotions, permit arbitrary account takeover, and expose the developer account to immediate suspension under Google Play Hate Speech and Data Safety policies.

### Summary of Audit Metrics Across Tracks

| Track / Audit Domain | Critical | High | Medium | Low / Info | Total Findings |
|---|:---:|:---:|:---:|:---:|:---:|
| **Track R1: Static Code Analysis & Type Safety** | 3 | 7 | 11 | 6 | **27** |
| **Track R2: Gameplay Logic & State Correctness** | 4 | 5 | 5 | 2 | **16** |
| **Track R3: Security & Anti-Cheat** | 2 | 4 | 3 | 2 | **11** |
| **Track R4: Performance & Dynamic Testing** | 2 | 3 | 4 | 2 | **11** |
| **Track R5: Google Play Policy Compliance** | 1 | 3 | 2 | 2 | **8** |
| **TOTAL AUDIT FINDINGS** | **12** | **22** | **25** | **14** | **73** |

---

# 2. Master Prioritized Findings Table

The table below catalogs all 73 distinct findings identified during the audit, prioritized strictly by severity level (Critical $\rightarrow$ High $\rightarrow$ Medium $\rightarrow$ Low / Info).

| Finding ID | Track | Severity | Subsystem / Location | Issue Summary & Root Cause |
|---|---|:---:|---|---|
| **R1-F01** | R1 / R2 | 🔴 CRITICAL | `constants/words.ts:18-108`<br>`hooks/useDuel.ts`<br>`hooks/useBlitz.ts`<br>`hooks/useDordle.ts` | **Word Bank Length Mismatch**: 100+ words of length 3, 4, 6, 7, 8 in word banks deadlock fixed 5-letter board modes. |
| **R1-F02** | R1 / R2 | 🔴 CRITICAL | `hooks/useAnagram.ts:20-28` | **Infinite Recursion Crash**: `shuffle()` unbounded recursive self-invocation triggers call stack overflow on duplicate letters. |
| **R1-F03** | R1 | 🔴 CRITICAL | `package.json:39,57`<br>`.eslintrc.json:1-23` | **Broken ESLint Tooling**: ESLint v10.8.0 requires Flat Config; `--ext` flag and `.eslintrc.json` crash CI runner with fatal exit code. |
| **R2-F01** | R2 | 🔴 CRITICAL | `constants/levels.ts:9-24,44-71` | **Catastrophic Level Demotion**: Gaps in `LEVELS` table cause players at 4,000 XP to suddenly demote from Level 10 to Level 7. |
| **R2-F02** | R2 | 🔴 CRITICAL | `hooks/useAnagram.ts:17-18`<br>`hooks/useWordChain.ts:44`<br>`constants/words.ts:26` | **Turkish Character Casing Corruption**: Plain `.toUpperCase()` corrupts dotted/dotless 'I'/'İ', invalidating valid dictionary words. |
| **R2-F03** | R2 | 🔴 CRITICAL | `hooks/useWordConnect.ts:31-52` | **Unsolvable Word Connect Levels**: Turkish Levels 1 & 2 demand letters missing from the wheel (e.g. 2nd 'E' or 'L'), blocking completion. |
| **R3-F01** | R3 / R5 | 🔴 CRITICAL | `components/StoreModal.tsx:174-215` | **Free IAP Fulfillment in Catch Block**: Purchasing exceptions/cancellations automatically grant free gems and lifetime premium. |
| **R3-F02** | R3 / R5 | 🔴 CRITICAL | `android/app/build.gradle:105-110`<br>`android/app/release.keystore` | **Hardcoded Production Keystore & Passwords**: Plaintext password `'logospassword'` and binary keystore committed in repo. |
| **R4-F01** | R4 / R1 | 🔴 CRITICAL | `services/storage.service.ts:101-220` | **Unhandled JSON.parse Crash Risk**: AsyncStorage deserialization lacks try/catch, causing immediate app startup crash on corrupt data. |
| **R4-F02** | R4 | 🔴 CRITICAL | `app/dordle.tsx:177,198` | **Dordle Victory/Reward Blocker**: Asynchronous state closure prevents win/loss modals and rewards from firing upon completion. |
| **R5-F01** | R5 / R3 | 🔴 CRITICAL | `privacy-policy.html:31,57`<br>`services/cloud.service.ts:101` | **Data Safety Policy Discrepancy**: Policy explicitly denies collecting personal emails while app transmits emails to Firestore and Sentry. |
| **R1-F04** | R1 | 🟠 HIGH | `components/AchievementToast.tsx`<br>`components/AnimatedCell.tsx`<br>`components/GemShower.tsx` | **TypeScript TS7030 Strict Error**: Effects fail `noImplicitReturns` with inconsistent return paths on cleanup functions. |
| **R1-F05** | R1 / R2 | 🟠 HIGH | `services/iap.service.ts:5-11`<br>`constants/products.ts:4-15` | **Conflicting IAP SKU Declarations**: Divergent SKU packages (`com.logos.*` vs `com.zovtex.logos.*`) cause store billing failure. |
| **R1-F06** | R1 | 🟠 HIGH | `hooks/useWordConnect.ts:42-52` | **Crossword Coordinate Overlap**: Word Connect Level 2 layout places conflicting letters ('S' vs 'A') at intersection coordinate (2,4). |
| **R1-F07** | R1 | 🟠 HIGH | `services/storage.service.ts:101-220` | **Unprotected Storage Deserialization**: Raw `JSON.parse` without fallback on stats, achievements, unlocked categories, and scores. |
| **R1-F08** | R1 / R2 | 🟠 HIGH | `hooks/useProgress.ts:12-194`<br>`store/progressStore.ts:29-268` | **Dual State Architecture Fragmentation**: Isolated `useState` in `useProgress` causes cross-screen state desynchronization. |
| **R1-F09** | R1 | 🟠 HIGH | `services/leaderboard.service.ts:81-111` | **Missing Firestore Composite Index**: `getMyBestScores` equality + sort query throws index error, silently returning empty results. |
| **R1-F10** | R1 / R2 | 🟠 HIGH | `hooks/useDuel.ts:108-113,197-202` | **Flawed Wordle Letter Coloring in Duel**: Single-pass `includes()` marks all duplicate letters present, violating Wordle rules. |
| **R2-F04** | R2 | 🟠 HIGH | `hooks/useBlitz.ts:3,90,101-102` | **Unsolvable Rounds in Blitz**: Generator outputs 4- and 6-letter words that cannot be submitted on fixed 5-letter grid. |
| **R2-F05** | R2 / R4 | 🟠 HIGH | `app/blitz.tsx:33-47,77-111` | **Lost Economy Rewards in Blitz**: Natural timer expiration skips `handleSubmit`, resulting in 0 Gems and 0 XP credited to player. |
| **R2-F06** | R2 | 🟠 HIGH | `components/HintModal.tsx:73-80`<br>`screens/GamePlayScreen.tsx` | **Premium User Gem Theft**: UI advertises hints as free for Premium users, but internally deducts 50 Gems per hint. |
| **R2-F07** | R2 | 🟠 HIGH | `hooks/useDuel.ts:108-114,197-204` | **Single-Pass Letter Frequency Violation**: AI bot and player evaluations fail Wordle frequency rules on duplicate letters. |
| **R3-F03** | R3 | 🟠 HIGH | `services/storage.service.ts:17-88`<br>`AndroidManifest.xml:15` | **Plaintext Storage & Zero-Root ADB Backup**: `allowBackup="true"` allows extracting and editing gems/premium via ADB without root. |
| **R3-F04** | R3 | 🟠 HIGH | `hooks/useCloudSync.ts:23-52`<br>`services/cloud.service.ts:72-135` | **Account Takeover via Passwordless Email**: Unauthenticated email linking allows overwriting or stealing any user's cloud save. |
| **R3-F05** | R3 | 🟠 HIGH | `services/leaderboard.service.ts:16-48`<br>`firestore.rules:16-24` | **Client-Authoritative Score Injection**: Unsigned, client-computed points directly written to Firestore leaderboard. |
| **R3-F06** | R3 | 🟠 HIGH | `firestore.rules:10-13`<br>`services/cloud.service.ts:30-49` | **Unvalidated Cloud Save Schema**: Firestore rules permit arbitrary direct insertion of 999,999 gems and lifetime premium. |
| **R4-F03** | R4 / R1 | 🟠 HIGH | `services/deeplink.service.ts:4-9`<br>`app/_layout.tsx:34` | **Memory Leak in Deep Link Listener**: `Linking.addEventListener` lacks cleanup subscription removal, accumulating listeners. |
| **R4-F04** | R4 | 🟠 HIGH | `app/chain.tsx:84` | **Repeated setTimeout in ScrollView Ref Callback**: Ref callback schedules uncancelled timeouts on every single keystroke render. |
| **R4-F05** | R4 | 🟠 HIGH | `app/blitz.tsx:42-46` | **Timer Expiration Reward Dropout**: Disconnect between timer state and reward dispatcher drops earned gameplay currency. |
| **R5-F02** | R5 | 🟠 HIGH | `constants/validation_dictionary.ts` | **Extreme Hate Speech & Slurs in Bundled Dictionary**: Contains racial slurs (`NIGGER`, `SPIC`), homophobic slurs, and explicit obscenities. |
| **R5-F03** | R5 | 🟠 HIGH | `services/auth.service.ts`<br>`CloudSyncStatus.tsx:44-49` | **Missing Account & Data Deletion Pathway**: No in-app or web-based account deletion mechanism, violating Google Play policy. |
| **R5-F04** | R5 | 🟠 HIGH | `PLAY_STORE_LISTING.md`<br>`CloudSyncModal.tsx` | **Families & COPPA Policy Violation**: Targets all ages (3+) but collects personal emails without a neutral age gate. |
| **R1-F11** | R1 | 🟡 MEDIUM | 36 locations in `app/`, `components/` | **Pervasive `any` Type Annotations**: 36 `any` annotations bypass compiler type checks in themes, boards, and dictionaries. |
| **R1-F12** | R1 | 🟡 MEDIUM | `constants/words.ts`<br>`constants/words_en.ts` | **Circular Module Dependency**: Runtime value cycle between `words.ts` and `words_en.ts` risks undefined exports in Metro. |
| **R1-F13** | R1 | 🟡 MEDIUM | `store/progressStore.ts:241`<br>`services/audio.service.ts:173` | **Silent Error Catch Blocks**: Empty catch blocks swallow cloud sync and audio failures without Sentry reporting. |
| **R1-F14** | R1 | 🟡 MEDIUM | `components/ErrorBoundary.tsx:24-26` | **Missing ErrorBoundary Sentry Reporting**: Component tree rendering exceptions are logged to console but never sent to Sentry. |
| **R1-F15** | R1 | 🟡 MEDIUM | `services/deeplink.service.ts:4-9` | **Missing Event Listener Cleanup**: Deep link listener subscription cannot be cleaned up on layout unmount. |
| **R1-F16** | R1 | 🟡 MEDIUM | `services/audio.service.ts:134-152` | **Audio Instance Allocation Race Condition**: Concurrent rapid taps spawn redundant `Audio.Sound` native players. |
| **R1-F17** | R1 | 🟡 MEDIUM | `app/(tabs)/index.tsx:69,86-90` | **Duplicate XP Award Calculation**: `handleGameEnd` calls both `earnXP` and `recordWin`, awarding double XP on every win. |
| **R1-F18** | R1 | 🟡 MEDIUM | `app/blitz.tsx:50-70` | **Stale Closure in Web Keyboard Listener**: Missing dependencies in keydown effect capture stale `game.status`. |
| **R1-F19** | R1 | 🟡 MEDIUM | `hooks/useWordChain.ts`<br>`app/(tabs)/_layout.tsx` | **Missing Localization in Layout & Chain**: Hardcoded Turkish strings ignore user's selected English language setting. |
| **R1-F20** | R1 | 🟡 MEDIUM | `services/leaderboard.service.ts`<br>`services/cloud.service.ts` | **Inconsistent Leaderboard Formulas**: Three separate formulas used across codebase to compute leaderboard score. |
| **R1-F21** | R1 | 🟡 MEDIUM | `app/(tabs)/leaderboard.tsx:75` | **Oldest Score Submission Glitch**: Submits `scores[scores.length - 1]` (oldest historical game) instead of index 0 (newest). |
| **R2-F08** | R2 | 🟡 MEDIUM | `hooks/useDordle.ts:102-182`<br>`hooks/useDuel.ts:180-224` | **Zero Dictionary Validation in Dordle & Duel**: Accepts arbitrary non-words (`"AAAAA"`, `"ZZZZZ"`), breaking game integrity. |
| **R2-F09** | R2 | 🟡 MEDIUM | `app/anagram.tsx`<br>`app/dordle.tsx`<br>`app/duel.tsx` | **Missing Stats Recording in Non-Classic Modes**: Modes award XP/Gems but never invoke `recordWin` or evaluate achievements. |
| **R2-F10** | R2 | 🟡 MEDIUM | `hooks/useWordChain.ts:15-20` | **Word Chain Tiny Dictionary Pool**: Restricts valid words to ~200 thematic words, rejecting 99.7% of authentic Turkish words. |
| **R2-F11** | R2 | 🟡 MEDIUM | `hooks/useProgress.ts:13-43`<br>`store/progressStore.ts` | **Dual Progression Store Divergence**: Cloud restore updates AsyncStorage but leaves active `useProgress` screens stale. |
| **R2-F12** | R2 | 🟡 MEDIUM | `constants/words.ts:143-151`<br>`services/storage.service.ts` | **Daily Word Clock Manipulation**: Client timestamp seeding allows users to advance device clock to farm daily rewards. |
| **R2-F13** | R2 | 🟡 MEDIUM | `hooks/useAnagram.ts:20-28` | **Anagram Shuffle Recursion Risk**: Repeated collisions during array shuffling risk stack overflow exceptions. |
| **R3-F07** | R3 | 🟡 MEDIUM | `firestore.rules:33-35`<br>`services/referral.service.ts` | **Broken Referral System**: Missing Firestore rules for `/referrals/` cause permission-denied errors on referral claims. |
| **R3-F08** | R3 | 🟡 MEDIUM | `services/leaderboard.service.ts`<br>`firestore.rules:16-24` | **Leaderboard Sybil Flooding**: Anonymous accounts can flood global top 50 leaderboard without rate limits. |
| **R3-F09** | R3 | 🟡 MEDIUM | `services/deeplink.service.ts:11-18` | **Unconfirmed Deep Link Execution**: Referral deep link parameter automatically executes mutation without user consent. |
| **R4-F06** | R4 | 🟡 MEDIUM | `hooks/useDuel.ts:51-66,228-243` | **AI Bot Timer Retention on Match Reset**: Resetting a Duel match fails to clear pending `botTimerRef`, mutating new board. |
| **R4-F07** | R4 | 🟡 MEDIUM | `hooks/useWordConnect.ts:181`<br>`hooks/useDordle.ts:219` | **Memoization Invalidation on Keystrokes**: `state` listed in callback dependencies invalidates child component memoization. |
| **R4-F08** | R4 | 🟡 MEDIUM | `app/(tabs)/leaderboard.tsx:87`<br>`components/StickerAlbumModal.tsx` | **Unbounded ScrollView & O(N) Array Searches**: 100+ items rendered in non-virtualized ScrollView with linear lookups. |
| **R4-F09** | R4 | 🟡 MEDIUM | `app/(tabs)/index.tsx:69-90` | **Redundant Async Mutations on Win**: Standalone storage and cloud calls duplicate operations inside `recordWin`. |
| **R5-F05** | R5 | 🟡 MEDIUM | `components/StoreModal.tsx`<br>`app/(tabs)/settings.tsx` | **Deceptive Restore Alert & Simulated Purchases**: "Restore Purchases" shows fake success alert without checking active purchases. |
| **R5-F06** | R5 | 🟡 MEDIUM | `android/app/build.gradle:106-110` | **Keystore Credentials Exposure**: Keystore passwords in build file violate Google Play release integrity guidelines. |
| **R1-F22** | R1 | 🟢 LOW | 28 files across codebase | **70+ Unused Imports & Variables**: Unused variables and destructured elements trigger `TS6133`, `TS6192`, `TS6198` warnings. |
| **R1-F23** | R1 | 🟢 LOW | `store/settingsStore.ts`<br>`hooks/useGameSession.ts` | **Dead Code Modules**: Unreferenced store and session hooks increase bundle size and maintenance overhead. |
| **R1-F24** | R1 | 🟢 LOW | `app/(tabs)/_layout.tsx:11-20`<br>`components/Keyboard.tsx` | **Static Color References Bypass Theme Context**: Hardcoded `COLORS` ignore user-selected Light or Gold themes. |
| **R1-F25** | R1 | 🟢 LOW | `app/(tabs)/leaderboard.tsx:181`<br>`components/GemShower.tsx` | **Array Index Used as React Key**: Mapping items with index keys causes subtle UI reconciliation anomalies. |
| **R1-F26** | R1 | 🟢 LOW | `app/blitz.tsx:44` | **Non-Integer Floating-Point XP**: `game.score / 10` writes non-integer decimal numbers to player XP storage. |
| **R1-F27** | R1 | 🟢 LOW | `hooks/useGame.ts:38,79` | **Unsafe Non-Null Assertions**: `useRef<GameState>(null!)` passes `null!` to bypass strict null checks. |
| **R2-F14** | R2 | 🟢 LOW | `app/chain.tsx:15`<br>`hooks/useWordChain.ts:26` | **Missing Language Pass-Through in Word Chain**: Word Chain defaults to Turkish regardless of active language setting. |
| **R2-F15** | R2 | 🟢 LOW | `services/iap.service.ts:5-11` | **Obsolete Product SKU Definitions**: Legacy `com.logos.*` SKUs remain defined as dead code in IAP service. |
| **R2-F16** | R2 | 🟢 LOW | `services/storage.service.ts:119-153` | **Streak Reset Calendar Edge Case**: Losing a game locks `STREAK_DATE`, preventing starting a new streak on same day. |
| **R3-F10** | R3 | 🟢 LOW | `components/PrivacyPolicyModal.tsx:41-44` | **Misleading Policy Statement on Encryption**: In-app policy falsely claims local storage is encrypted. |
| **R3-F11** | R3 | 🟢 LOW | `android/app/build.gradle:68,119` | **Disabled Bytecode Obfuscation**: Proguard/R8 code minification and obfuscation disabled by default in release builds. |
| **R4-F10** | R4 | 🟢 LOW | `hooks/useAnagram.ts:17-18`<br>`constants/words.ts:110` | **Cold Start Set Construction Overhead**: Synchronous Set creation during bundle evaluation adds to startup TTI. |
| **R4-F11** | R4 | 🟢 LOW | `constants/words.ts:135-139` | **Unchecked String Indexing in Word Generator**: `getRandomWord` risks TypeError if empty category pool is returned. |
| **R5-F07** | R5 | 🟢 LOW | `AndroidManifest.xml:3`<br>`app.json:30-35` | **Manifest vs app.json Permission Divergence**: `MODIFY_AUDIO_SETTINGS` missing in `app.json` risks loss on clean prebuild. |
| **R5-F08** | R5 | 🟢 LOW | `privacy-policy.html:47`<br>`AboutModal.tsx:38` | **Contact Email & App Version Metadata Mismatch**: Email and version string discrepancies across listing, policy, and modal. |

---

# 3. Detailed Findings Catalog by Track

---

## 3.1 Track R1: Static Code Analysis & Type Safety

### [R1-F01] Word Bank Length Discrepancy Causes Gameplay Deadlock in Duel, Blitz & Dordle
- **Severity**: 🔴 Critical
- **Category**: Type Safety & Data Contract
- **Location**: `constants/words.ts:18-80, 102-108`, `constants/words_en.ts:4-39`, `hooks/useDuel.ts:25-38, 140, 185-192`, `hooks/useBlitz.ts:3, 90, 101`, `hooks/useDordle.ts:21, 46, 103`
- **Subsystem Impact**: Core Game Modes (Duel, Blitz, Dordle)
- **Detailed Description & Root Cause**:
  `constants/words.ts` contains a comment claiming `// TÜMÜ KESİNLİKLE 5 HARFLİ`, but defines over 80 words of lengths 3, 4, 6, 7, and 8 (e.g. `AYI`, `KEDİ`, `HÜTHÜT`, `PENGUEN`, `SIRTLAN`, `ISPARTA`, `DOKTOR`, `AVUKAT`, `FUTBOL`). Similarly, `constants/words_en.ts` includes `BEAR`, `WOLF`, `COWBOY`, `POLICE`, `DENTIST`, `FOREST`. In addition, `filterWordList` permits words with lengths between 4 and 6 (`len >= 4 && len <= 6`).
  However, `useDuel.ts`, `useBlitz.ts`, and `useDordle.ts` hardcode `WORD_LENGTH = 5` and fix their board matrices to 5 columns.
  - In `useDuel.ts`: When a 4-letter word is chosen, `playerCol` reaches 4 and `playerCol < WORD_LENGTH` evaluates to `true`, causing `submitGuess` to return `'short'`. When a 6- or 7-letter word is picked (`'ISPARTA'`), `prev.playerCol >= WORD_LENGTH` blocks typing past index 4, making matching `guess === targetWord` impossible.
  - In `useBlitz.ts`: 4-letter words cannot be submitted (returns `'short'`), and 6-letter words can never be completed.
- **Reproduction Steps**:
  1. Launch Duel or Blitz mode in Turkish or English.
  2. If `getRandomWord()` selects `'ISPARTA'` or `'BEAR'`, attempt to type and submit the word.
  3. Observe that typing stops at 5 letters for 7-letter words, or submission is rejected with `'short'` for 4-letter words, rendering the game unwinnable.
- **Remediation**:
  1. Sanitize `constants/words.ts` and `constants/words_en.ts` so every entry in 5-letter banks is strictly 5 characters.
  2. Update `filterWordList` in `constants/words.ts`: `return len === 5;`.
  3. Dynamically set grid dimensions from `targetWord.length` if multi-length support is intended.

---

### [R1-F02] Unbounded Infinite Recursion in `shuffle()` Leading to Stack Overflow Crash
- **Severity**: 🔴 Critical
- **Category**: Runtime Reliability / Call Stack Safety
- **Location**: `hooks/useAnagram.ts:20-28`
- **Subsystem Impact**: Anagram Game Mode (`useAnagram`)
- **Detailed Description & Root Cause**:
  The `shuffle()` helper shuffles an array using Fisher-Yates. If the shuffled array equals the input array (or if the input word consists of identical characters, e.g. `'AAAAA'`), it recursively invokes `shuffle(arr)` without any recursion depth limit:
  ```ts
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
  1. Pass an array of duplicate characters (e.g. `['A', 'A', 'A', 'A', 'A']`) to `shuffle()`.
  2. Observe `RangeError: Maximum call stack size exceeded` crashing the JavaScript thread.
- **Remediation**:
  Replace recursion with an iterative loop and maximum attempt threshold (e.g. 5 attempts), returning the array if all attempts collide:
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

### [R1-F03] ESLint v10 Tooling Configuration Incompatibility Crashing CI Runner
- **Severity**: 🔴 Critical
- **Category**: Developer Tooling & CI/CD Pipeline
- **Location**: `package.json:39, 57`, `.eslintrc.json:1-23`
- **Subsystem Impact**: Static Code Quality Gates & Automated CI Linting
- **Detailed Description & Root Cause**:
  `package.json` specifies `"eslint": "^10.8.0"`. Starting with ESLint v9/v10, Flat Config (`eslint.config.mjs`) is mandatory, the legacy `.eslintrc.json` is rejected by default, and the `--ext` CLI flag is completely removed. Executing `npm run lint` fails immediately with `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` and exits with code 1.
- **Reproduction Steps**:
  1. Execute `npm run lint` in workspace root.
  2. Observe immediate fatal error from ESLint 10.8.0.
- **Remediation**:
  Migrate `.eslintrc.json` to `eslint.config.mjs` using `@eslint/js` and `typescript-eslint`, and update `package.json` to `"lint": "eslint ."`.

---

### [R1-F04] TypeScript Strict `TS7030` Inconsistent Return Path Errors in Effects
- **Severity**: 🟠 High
- **Category**: Strict Type Checking (`noImplicitReturns`)
- **Location**: `components/AchievementToast.tsx:15-31`, `components/AnimatedCell.tsx:64-70`, `components/GemShower.tsx:33-59`
- **Subsystem Impact**: UI Animation & Toast Components
- **Detailed Description & Root Cause**:
  Under `noImplicitReturns: true`, `useEffect` callbacks must return `void | Destructor` consistently across all branches. In these 3 components, an `if` block conditionally returns `() => clearTimeout(timer)` while the implicit fall-through returns `undefined`, triggering `error TS7030: Not all code paths return a value`.
- **Reproduction Steps**:
  1. Run `npx tsc --noEmit --noImplicitReturns`.
  2. Observe 3 compilation errors in `AchievementToast.tsx`, `AnimatedCell.tsx`, and `GemShower.tsx`.
- **Remediation**:
  Guard effects early: `if (!achievement) return;` and return cleanup unconditionally.

---

### [R1-F05] Conflicting In-App Purchase SKU / Product ID Declarations
- **Severity**: 🟠 High
- **Category**: Monetization & IAP Subsystem
- **Location**: `services/iap.service.ts:5-11, 27-37`, `constants/products.ts:4-15`, `components/StoreModal.tsx:111-172`
- **Subsystem Impact**: In-App Store & Purchase Fulfillment
- **Detailed Description & Root Cause**:
  Two conflicting sets of Product IDs exist in the codebase:
  1. `services/iap.service.ts`: `com.logos.premium`, `com.logos.gems100`, `com.logos.gems500`, `com.logos.gems1200`, `com.logos.gems3000`.
  2. `constants/products.ts`: `com.zovtex.logos.gems.small`, `com.zovtex.logos.gems.medium`, `com.zovtex.logos.gems.large`, `com.zovtex.logos.premium.lifetime`, `com.zovtex.logos.premium.monthly`.
  Additionally, `StoreModal.tsx` calls `initConnection()` and `endConnection()` directly on modal mount/unmount, disconnecting native billing behind `iap.service.ts`.
- **Reproduction Steps**:
  1. Inspect SKUs queried in `StoreModal.tsx` vs `services/iap.service.ts`.
  2. Note mismatching product ID strings.
- **Remediation**:
  Standardize on `constants/products.ts` matching Google Play Console and route all store actions through `services/iap.service.ts`.

---

### [R1-F06] Crossword Matrix Coordinate Collision in `useWordConnect`
- **Severity**: 🟠 High
- **Category**: Game Board Rendering & State Logic
- **Location**: `hooks/useWordConnect.ts:42-52, 81-103`
- **Subsystem Impact**: Word Connect Game Mode
- **Detailed Description & Root Cause**:
  In `LEVELS_TR[1]` of `useWordConnect.ts`:
  - `MASAT` placed vertically at `(0, 4)`: `(2,4)` is `'S'`.
  - `SAAT` placed horizontally at `(2, 2)`: `(2,4)` is `'A'`.
  Intersection cell `(2, 4)` receives conflicting characters (`'S'` vs `'A'`). `buildCells()` deduplicates with `if (!seen.has(key))`, overwriting whichever word is processed second and corrupting the crossword layout.
- **Reproduction Steps**:
  1. Open Word Connect Level 2 (Turkish).
  2. Solve `SAAT` and `MASAT`.
  3. Observe conflicting letters rendered in cell `(2, 4)`.
- **Remediation**:
  Correct layout coordinates in `LEVELS_TR` so intersecting words share matching letters.

---

### [R1-F07] Unhandled `SyntaxError` Crash Risk on Corrupt AsyncStorage Deserialization
- **Severity**: 🟠 High
- **Category**: Crash Risk / State Hydration
- **Location**: `services/storage.service.ts:101, 158, 187, 210, 220`, `store/settingsStore.ts:61`
- **Subsystem Impact**: Storage Service & Progress Hydration
- **Detailed Description & Root Cause**:
  `getStats`, `getUnlockedAchievements`, `getScores`, `storageGetJSON`, and `getUnlockedCategories` invoke `JSON.parse(v)` without try/catch protection. Malformed JSON stored in AsyncStorage crashes the application during startup.
- **Reproduction Steps**:
  1. Store `"{invalid_json"` in `gq_stats`.
  2. Launch the app; observe unhandled `SyntaxError` crash.
- **Remediation**:
  Wrap all `JSON.parse` invocations with try/catch returning default structures on parse failure.

---

### [R1-F08] Dual Redundant State Architecture Fragmentation
- **Severity**: 🟠 High
- **Category**: State Management & Reactivity
- **Location**: `hooks/useProgress.ts:12-194`, `store/progressStore.ts:29-268`, `app/(tabs)/*.tsx`
- **Subsystem Impact**: Global Player Progression State
- **Detailed Description & Root Cause**:
  The app contains two disconnected progress systems: `useProgress.ts` (isolated `useState`) and `store/progressStore.ts` (centralized Zustand). UI screens instantiate `useProgress()`, creating separate state instances that do not reactively synchronize when gems or XP change across tabs.
- **Reproduction Steps**:
  1. Earn gems in a game mode.
  2. Switch to Profile tab.
  3. Observe gems remain stale until the screen remounts.
- **Remediation**:
  Refactor `useProgress` into a selector over `useProgressStore`.

---

### [R1-F09] Missing Firestore Composite Index Causing Silent Leaderboard Query Failures
- **Severity**: 🟠 High
- **Category**: Backend & Database Querying
- **Location**: `services/leaderboard.service.ts:81-111`
- **Subsystem Impact**: Leaderboard Personal Best Queries
- **Detailed Description & Root Cause**:
  `getMyBestScores()` queries `collection('scores')` with `where('uid', '==', user.uid)` and `orderBy('score', 'desc')`. Firestore requires a deployed composite index for equality + sort queries. Without it, Firestore throws an index error that is swallowed silently, returning `[]`.
- **Reproduction Steps**:
  1. Call `getMyBestScores()` with an authenticated user against Firestore.
  2. Query fails and returns empty array `[]`.
- **Remediation**:
  Deploy composite index in `firestore.indexes.json` or sort results client-side.

---

### [R1-F10] Flawed Wordle Duplicate-Letter Frequency Logic in `useDuel.ts`
- **Severity**: 🟠 High
- **Category**: Game Rules Evaluation
- **Location**: `hooks/useDuel.ts:108-113, 197-202`
- **Subsystem Impact**: Duel Mode Guess Evaluation
- **Detailed Description & Root Cause**:
  `useDuel.ts` marks letters yellow using naive `prev.targetWord.includes(cell.char)`. If the target word has one `'E'` (e.g. `'TIGER'`) and player guesses `'SPEED'`, both `'E'`s turn yellow, violating Wordle frequency rules.
- **Reproduction Steps**:
  1. In Duel, target word is `'TIGER'`. Guess `'SPEED'`.
  2. Both `'E'`s display as present/yellow.
- **Remediation**:
  Implement the standard two-pass frequency algorithm from `useGame.ts:154-166`.

---

### [R1-F11 to R1-F27] Summary of Medium & Low Findings in Track R1
- **[R1-F11] Medium**: 36 `any` annotations across components and services bypass TypeScript type checking.
- **[R1-F12] Medium**: Circular module import between `words.ts` and `words_en.ts`.
- **[R1-F13] Medium**: Silent `catch {}` blocks in `progressStore.ts:241`, `audio.service.ts:173`, `notification.service.ts:55`, `share.service.ts:34`.
- **[R1-F14] Medium**: `ErrorBoundary.tsx` fails to forward render errors to Sentry `captureError`.
- **[R1-F15] Medium**: `setupDeepLinkHandler` discards subscription handle, preventing cleanup on unmount.
- **[R1-F16] Medium**: Rapid keypresses cause concurrent `Audio.Sound.createAsync` calls, leaking media player handles.
- **[R1-F17] Medium**: `app/(tabs)/index.tsx` calls both `progress.earnXP` and `progress.recordWin`, awarding double XP on every win.
- **[R1-F18] Medium**: Web keyboard event listener in `app/blitz.tsx` holds stale `game.status` closure.
- **[R1-F19] Medium**: Hardcoded Turkish strings in `useWordChain.ts` and `(tabs)/_layout.tsx` ignore English setting.
- **[R1-F20] Medium**: Inconsistent score formulas across `index.tsx`, `leaderboard.service.ts`, and `cloud.service.ts`.
- **[R1-F21] Medium**: `leaderboard.tsx:75` submits oldest score (`scores[scores.length - 1]`) instead of most recent (`scores[0]`).
- **[R1-F22] Low**: 70+ unused imports, variables, and destructured elements across 28 files.
- **[R1-F23] Low**: Dead code modules `store/settingsStore.ts` and `hooks/useGameSession.ts`.
- **[R1-F24] Low**: Static `COLORS` constants in tab layouts bypass dynamic `useTheme()` context.
- **[R1-F25] Low**: Array indices used as React keys in `ScoreRow`, `Confetti`, and `GemShower`.
- **[R1-F26] Low**: `app/blitz.tsx:44` writes floating-point non-integer XP (`game.score / 10`) to storage.
- **[R1-F27] Low**: Unsafe non-null assertions (`!`, `null!`) in `useGame.ts` and `storage.service.ts`.

---

## 3.2 Track R2: Gameplay Logic & State Correctness

### [R2-F01] Catastrophic Level Progression Discontinuity & Level Demotion at 4,000 XP
- **Severity**: 🔴 Critical
- **Category**: Level Progression & Player XP Math
- **Location**: `constants/levels.ts:9-24, 44-71`
- **Subsystem Impact**: Progression Engine & Level Up System
- **Detailed Description & Root Cause**:
  `LEVELS` defines discrete tiers with large gaps (Level 10 ends at 4,000 XP; Level 15 starts at 7,000 XP). When XP falls in unmapped ranges (4,000 to 6,999 XP), `LEVELS.find(...)` returns `undefined`, triggering a fallback linear calculation loop `while (accumulated + level * 150 <= xp)`. Because this loop uses a non-matching scaling factor, a player with 3,999 XP is Level 10 ("Usta"), but upon reaching 4,000 XP (+1 XP), the fallback loop calculates them as **Level 7**. The player suffers an immediate **3-level demotion**. Reaching 7,000 XP jumps the player from Level 9 to Level 15. Furthermore, Level 50 sets `maxXP: Infinity`, causing `(xp - 100000) / (Infinity - 100000)` to output `0%` progress instead of 100%.
- **Reproduction Steps**:
  1. Call `getLevelFromXP(3999)` $\rightarrow$ Returns Level 10 ("Usta").
  2. Call `getLevelFromXP(4000)` $\rightarrow$ Returns Level 7 ("Level 7").
  3. Call `getXPProgress(100000)` $\rightarrow$ Returns `percent: 0`.
- **Remediation**:
  Define contiguous level entries 1-50 in `LEVELS` with monotonically increasing boundaries, or use quadratic formula `minXP(lvl) = Math.floor(50 * Math.pow(lvl, 1.8))`. Clamp Level 50 progress to `1.0`.

---

### [R2-F02] Turkish Dotless/Dotted 'I'/'İ' Normalization Corruption
- **Severity**: 🔴 Critical
- **Category**: Turkish Character Normalization
- **Location**: `hooks/useAnagram.ts:17-18`, `hooks/useWordChain.ts:15, 44, 48`, `hooks/useDuel.ts:28, 145, 229`, `constants/words.ts:26`
- **Subsystem Impact**: Turkish Dictionary Validation Across Modes
- **Detailed Description & Root Cause**:
  Standard JavaScript `String.prototype.toUpperCase()` converts lowercase `'i'` (U+0069) to Latin `'I'` (U+0049) instead of Turkish dotted capital `'İ'` (U+0130).
  1. In `useAnagram.ts:17`, Turkish words like `"incir"` become `"INCIR"`. Submitting `"İNCİR"` fails dictionary validation.
  2. In `useWordChain.ts:44`, entering `"inek"` converts to `"INEK"`, failing match against `"İNEK"` and falsely deducting a player life.
  3. In `constants/words.ts:26`, `'TIMSAH'` is hardcoded with dotless `'I'`, while Turkish keyboard submits `'TİMSAH'`, preventing 100% match.
- **Reproduction Steps**:
  1. Play Anagram in Turkish; submit a valid word with 'İ' (e.g. `İNCİR`). Word is rejected.
  2. In Word Chain, enter `inek`. App shows `"Geçersiz kelime!"` and deducts a life.
- **Remediation**:
  Create and use a centralized Turkish upper/lower helper across all dictionary sets and inputs:
  ```ts
  export const toTurkishUpper = (s: string) =>
    s.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
  ```

---

### [R2-F03] Mathematically Unsolvable Levels in Word Connect
- **Severity**: 🔴 Critical
- **Category**: Level Design & Game Completion Blocker
- **Location**: `hooks/useWordConnect.ts:31-52`
- **Subsystem Impact**: Word Connect Game Mode (`LEVELS_TR`)
- **Detailed Description & Root Cause**:
  Turkish level configurations contain impossible letter requirements:
  - **Level 1**: Wheel letters `['K', 'A', 'L', 'E', 'M']`. Target words: `['KALEM', 'KALE', 'ELMA', 'LEKE']`. Target word `'LEKE'` requires two `'E'`s, but the wheel provides only one `'E'`.
  - **Level 2**: Wheel letters `['T', 'A', 'S', 'M', 'A']`. Target words: `['TASMA', 'MASAT', 'SAAT', 'MALA']`. Target word `'MALA'` requires `'L'`, which is not present in the wheel.
  Because all target words must be found to complete a level, **both levels are 100% impossible to complete**.
- **Reproduction Steps**:
  1. Open Word Connect Turkish Level 1. Solve `KALEM`, `KALE`, `ELMA`.
  2. Attempt to form `LEKE`. Wheel lacks a second `'E'`. Level cannot be finished.
- **Remediation**:
  Replace `LEKE` with `KAME` in Level 1, and replace `MALA` with `ASMA` in Level 2.

---

### [R2-F04] Unsolvable Rounds in Blitz Mode on 4- and 6-Letter Words
- **Severity**: 🟠 High
- **Category**: Game Rules & Grid Invariants
- **Location**: `hooks/useBlitz.ts:3, 90, 101, 102`, `constants/words.ts:102-108`
- **Subsystem Impact**: Blitz Speed Mode
- **Detailed Description & Root Cause**:
  `getRandomWord()` permits 4- to 6-letter words, but Blitz enforces a strict 5-letter grid (`WORD_LENGTH = 5`). 4-letter words cannot be submitted (fails `guess.length < 5` $\rightarrow$ `'short'`), while 6-letter words cannot accept the 6th character. Every 4- and 6-letter word in Blitz is completely unsolvable.
- **Reproduction Steps**:
  1. Play Blitz until a 4-letter (`ORDU`) or 6-letter (`KAPLAN`) word is chosen.
  2. Submitting 4 letters fails with `'short'`; typing 6 letters is blocked at 5.
- **Remediation**:
  Filter the Blitz word bank strictly to 5-letter words or dynamically resize the input grid.

---

### [R2-F05] Economy Reward Loss in Blitz Mode on Timer Expiration
- **Severity**: 🟠 High
- **Category**: Economy & Reward Fulfillment
- **Location**: `app/blitz.tsx:33-47, 77-111`
- **Subsystem Impact**: Blitz Mode Gem & XP Economy
- **Detailed Description & Root Cause**:
  End-of-game rewards (`earnXP`, `addGems`) are called only within `handleSubmit`. When the 60-second countdown expires naturally, `handleSubmit` is never executed. The result screen displays `+15 💎 +30 XP`, but zero Gems and zero XP are credited to the player's balance.
- **Reproduction Steps**:
  1. Solve 3 words in Blitz. Allow the timer to reach 0 naturally.
  2. Results screen displays rewards, but main menu Gem/XP balance is unchanged.
- **Remediation**:
  Move reward dispatching to a `useEffect` observing `game.status === 'ended'`.

---

### [R2-F06] Premium User Gem Theft on Hint Purchases
- **Severity**: 🟠 High
- **Category**: Monetization & Premium Entitlement
- **Location**: `components/HintModal.tsx:73-80`, `screens/GamePlayScreen.tsx:155-162`
- **Subsystem Impact**: In-App Hint Economy
- **Detailed Description & Root Cause**:
  `HintModal.tsx` displays hints as free for Premium users (`"Premium — Ücretsiz / Sınırsız ipucu hakkın var!"`), but binds `onPress` to `handleSpendGems`, deducting 50 Gems. If a Premium user has under 50 Gems, the hint is denied entirely.
- **Reproduction Steps**:
  1. Enable Premium. Set Gems to 10. Tap Premium Hint $\rightarrow$ Request denied.
  2. Set Gems to 200. Tap Premium Hint $\rightarrow$ Hint shown, Gems drop to 150.
- **Remediation**:
  Bypass `onSpendGems` when `isPremium` is active and provide hint unconditionally.

---

### [R2-F07 to R2-F16] Summary of Medium & Low Findings in Track R2
- **[R2-F07] High**: Flawed duplicate letter coloring in Duel mode violates Wordle frequency rules.
- **[R2-F08] Medium**: Zero dictionary validation in Dordle and Duel allows submitting arbitrary strings (`"AAAAA"`).
- **[R2-F09] Medium**: Non-Classic game modes fail to call `recordWin`/`recordLoss`, leaving stats, streaks, and achievements unrecorded.
- **[R2-F10] Medium**: Word Chain restricts valid words to ~200 thematic words, rejecting valid words from the 65k dictionary.
- **[R2-F11] Medium**: Dual store desynchronization between `store/progressStore.ts` and `hooks/useProgress.ts`.
- **[R2-F12] Medium**: Daily challenge determinism uses local system clock, enabling time-travel reward exploits.
- **[R2-F13] Medium**: `shuffle()` recursion in Anagram mode risks call stack overflow on colliding permutations.
- **[R2-F14] Low**: Word Chain defaults to Turkish regardless of user's active English language setting.
- **[R2-F15] Low**: Dead SKU definitions in `services/iap.service.ts`.
- **[R2-F16] Low**: `updateStreak` locks streak date on loss, preventing starting a new streak on the same day.

---

## 3.3 Track R3: Security & Anti-Cheat

### [R3-F01] In-App Purchase Bypass & Free Fulfillment in Error/Cancellation Catch Block
- **Severity**: 🔴 Critical (CVSS 9.8)
- **Category**: Monetization Security & In-App Purchase Integrity
- **Location**: `components/StoreModal.tsx:174-193, 196-215, 241-246`
- **Subsystem Impact**: In-App Store & Purchase Validation
- **Detailed Description & Root Cause**:
  `handleBuyGems` and `handlePremium` in `StoreModal.tsx` wrap purchase requests in `try/catch`. When `requestPurchase` throws an exception (due to user cancellation, airplane mode, offline state, or billing error), the `catch` block unconditionally calls `onPurchase(pkg.id, pkg.gems)` or `onPurchasePremium()`:
  ```typescript
  const handleBuyGems = async (pkg: GemPackage) => {
    setPurchasing(pkg.id);
    try {
      await requestPurchase({ sku: pkg.id });
    } catch {
      try {
        // VULNERABILITY: Awards gems unconditionally on purchase error/cancellation
        await onPurchase(pkg.id, pkg.gems);
        showCustomAlert('✅', 'Purchase Successful!');
      } catch { ... }
    }
    setPurchasing(null);
  };
  ```
- **Reproduction Steps**:
  1. Open the Gem Store in the application.
  2. Tap to buy 3,000 Gems or Lifetime Premium.
  3. When Google Play dialog opens, cancel it or enable Airplane Mode.
  4. App catches exception and instantly awards 3,000 Gems or Lifetime Premium for free.
- **Remediation**:
  Remove all fulfillment logic from `catch` blocks. Fulfill purchases strictly within the `purchaseUpdatedListener` event stream upon verifying Google Play cryptographic purchase tokens.

---

### [R3-F02] Hardcoded Production Release Keystore Credentials & Binary in Git Repository
- **Severity**: 🔴 Critical (CVSS 9.1)
- **Category**: Secrets Management & Cryptographic Signing Security
- **Location**: `android/app/build.gradle:105-110`, `android/app/release.keystore`
- **Subsystem Impact**: Android Production Build & Release Artifacts
- **Detailed Description & Root Cause**:
  `android/app/build.gradle` contains hardcoded production signing passwords:
  ```groovy
  release {
      storeFile file('release.keystore')
      storePassword 'logospassword'
      keyAlias 'logos-key-alias'
      keyPassword 'logospassword'
  }
  ```
  The `release.keystore` file is committed directly to git. Any party with repository read access can extract the private key and sign malicious update APKs targeting existing users.
- **Reproduction Steps**:
  1. Inspect `android/app/build.gradle` lines 105-110.
  2. Verify `android/app/release.keystore` exists in git tree.
- **Remediation**:
  Rotate production keystore, remove keystore from git, add `*.keystore` to `.gitignore`, and load passwords from secure CI/CD environment variables.

---

### [R3-F03] Plaintext AsyncStorage Storage with ADB Backup Enabled
- **Severity**: 🟠 High (CVSS 7.5)
- **Category**: Data at Rest Protection
- **Location**: `services/storage.service.ts:17-88`, `android/app/src/main/AndroidManifest.xml:15`
- **Subsystem Impact**: Local Game Save Storage & ADB Extraction
- **Detailed Description & Root Cause**:
  Economy keys (`gq_gems`, `gq_premium`, `gq_xp`) are stored in plaintext in AsyncStorage. Because `AndroidManifest.xml` specifies `android:allowBackup="true"`, any user with USB debugging enabled can extract the database via `adb backup -noapk com.zovtex.logos`, edit `gq_gems` to `"999999"` in the SQLite/SharedPrefs file, and restore it via `adb restore` without root access.
- **Reproduction Steps**:
  1. Run `adb backup -f backup.ab -noapk com.zovtex.logos`.
  2. Unpack backup with `abe.jar`, modify `gq_gems` to `999999`, repack, and `adb restore backup.ab`.
  3. Launch game; observe 999,999 gems.
- **Remediation**:
  Set `android:allowBackup="false"` in `AndroidManifest.xml`, store sensitive entitlements in `expo-secure-store`, and sign local state with an HMAC integrity hash.

---

### [R3-F04] Account Takeover & Cloud Save Overwrite via Passwordless Email Linking
- **Severity**: 🟠 High (CVSS 8.5)
- **Category**: Authentication & Authorization (IDOR)
- **Location**: `hooks/useCloudSync.ts:23-52`, `services/cloud.service.ts:72-135`
- **Subsystem Impact**: Cloud Save Synchronization & User Identity
- **Detailed Description & Root Cause**:
  `handleLinkAccount(email)` associates an email address without requiring password, OTP, Magic Link, or Firebase Auth verification. Tapping "Restore" retrieves the victim's save file, while tapping "Backup" overwrites the victim's save file with attacker data.
- **Reproduction Steps**:
  1. In Cloud Sync, enter any known user email (e.g. `victim@example.com`).
  2. Tap Link Account. Tap "Restore" to download victim's progress, or tap "Backup" to overwrite their save.
- **Remediation**:
  Enforce Firebase Authentication (Google Sign-In, Email Link, or Password) before permitting cloud save read/write operations.

---

### [R3-F05] Client-Authoritative Leaderboard Score Submission
- **Severity**: 🟠 High (CVSS 7.2)
- **Category**: Anti-Cheat & Leaderboard Integrity
- **Location**: `services/leaderboard.service.ts:16-48`, `firestore.rules:16-24`
- **Subsystem Impact**: Global Leaderboard Subsystem
- **Detailed Description & Root Cause**:
  Leaderboard scores are calculated entirely on the client and written directly to Firestore (`addDoc`). Firestore rules only verify `score <= 5000`. An attacker can submit arbitrary scores up to 5,000 pts with 0 guesses and 0 elapsed seconds.
- **Reproduction Steps**:
  1. Using Firebase REST API with an anonymous token, write `{ score: 5000, guesses: 1, timeSeconds: 1 }` to `/scores/`.
  2. Observe the forged score appears at the top of the global leaderboard.
- **Remediation**:
  Move score evaluation to a Firebase Cloud Function that validates game move logs and cryptographic session nonces.

---

### [R3-F06] Unvalidated Cloud Save Schema in Firestore Rules
- **Severity**: 🟠 High (CVSS 7.5)
- **Category**: Authorization & Privilege Escalation
- **Location**: `firestore.rules:10-13`, `services/cloud.service.ts:30-49`
- **Subsystem Impact**: Firestore Security Rules
- **Detailed Description & Root Cause**:
  `firestore.rules` grants unrestricted writes to `match /cloud_saves/{userId}` for authenticated users without schema validation. Users can write `{ gems: 999999, isPremium: true, xp: 500000 }` directly to Firestore and restore it into local storage.
- **Reproduction Steps**:
  1. Authenticate anonymously. Send Firestore write to `/cloud_saves/<uid>` with `isPremium: true` and `gems: 999999`.
  2. Tap Cloud Restore in app; observe full unlock.
- **Remediation**:
  Enforce strict schema validation in `firestore.rules`, preventing direct writes to `isPremium` and capping numerical limits.

---

### [R3-F07 to R3-F11] Summary of Medium & Low Findings in Track R3
- **[R3-F07] Medium**: Missing Firestore rules for `/referrals/` and restrictive `/users/` rules cause referral claims to fail.
- **[R3-F08] Medium**: Leaderboard allows unrestricted anonymous submissions, enabling Sybil denial-of-service attacks.
- **[R3-F09] Medium**: Deep link referral parameters execute without user confirmation prompt.
- **[R3-F10] Low**: Privacy policy incorrectly asserts local storage data is cryptographically encrypted.
- **[R3-F11] Low**: Proguard/R8 bytecode obfuscation is disabled by default in release builds (`build.gradle`).

---

## 3.4 Track R4: Performance, Memory Lifecycle & Dynamic Testing

### [R4-F01] Unhandled `JSON.parse` Deserialization Crashes Application
- **Severity**: 🔴 Critical
- **Category**: Crash Risk / State Hydration
- **Location**: `services/storage.service.ts:101, 158, 187, 210, 220`, `store/settingsStore.ts:61`
- **Subsystem Impact**: App Startup & AsyncStorage Hydration
- **Detailed Description & Root Cause**:
  `getStats`, `getUnlockedAchievements`, `getScores`, and `storageGetJSON` invoke `JSON.parse(v)` without error handling. When `useProgressStore.hydrate()` executes `Promise.all` during app launch, any single corrupted storage key throws an unhandled `SyntaxError` that terminates the application.
- **Reproduction Steps**:
  1. Write `"{corrupt"` to `gq_stats` in AsyncStorage.
  2. Launch app; observe immediate fatal JavaScript crash.
- **Remediation**:
  Wrap all `JSON.parse` operations in try/catch blocks with fallback defaults.

---

### [R4-F02] Dordle Victory/Loss Modals and Rewards Blocked by Stale State Closure
- **Severity**: 🔴 Critical
- **Category**: Gameplay UI & State Machine Blocker
- **Location**: `app/dordle.tsx:177, 198`
- **Subsystem Impact**: Dordle Game Mode Completion
- **Detailed Description & Root Cause**:
  In `app/dordle.tsx`, `handleSubmit` calls `game.submitGuess()`, which triggers React's asynchronous `setState`. Immediately following `submitGuess()`, lines 177 and 198 inspect `if (game.gameStatus === 'won')`. Because state updates are asynchronous, `game.gameStatus` in the current execution closure is still `'playing'`. Unlike `index.tsx` and `duel.tsx`, `dordle.tsx` has no `useEffect` listening to `game.gameStatus`. The victory overlay never renders, confetti never fires, and +50 Gems / +150 XP are never awarded.
- **Reproduction Steps**:
  1. Open Dordle screen (`app/dordle.tsx`).
  2. Solve both target words correctly on the final turn.
  3. Both boards display green letters, but no victory overlay appears, no confetti triggers, and no rewards are awarded.
- **Remediation**:
  Add a `useEffect` in `app/dordle.tsx` watching `game.gameStatus` to trigger victory/loss overlays and reward dispatches.

---

### [R4-F03] Memory Leak: Uncleaned `Linking.addEventListener` Subscriptions
- **Severity**: 🟠 High
- **Category**: Memory Leak & Listener Accumulation
- **Location**: `services/deeplink.service.ts:4-9`, `app/_layout.tsx:34`
- **Subsystem Impact**: Native Deep Linking & Layout Mount Lifecycle
- **Detailed Description & Root Cause**:
  `setupDeepLinkHandler()` registers `Linking.addEventListener('url', handleDeepLink)` without capturing the `EmitterSubscription` or exposing a cleanup handler. In `_layout.tsx`, layout remounts accumulate orphaned listeners in native memory.
- **Reproduction Steps**:
  1. Trigger layout remounts or hot module reloads.
  2. Open a referral link; observe multiple duplicate executions of `claimReferral`.
- **Remediation**:
  Return `() => sub.remove()` from `setupDeepLinkHandler()` and invoke it in `_layout.tsx` cleanup.

---

### [R4-F04] Repeated `setTimeout` Inside ScrollView Ref Callback
- **Severity**: 🟠 High
- **Category**: Memory Leak & Render Loop Overhead
- **Location**: `app/chain.tsx:84`
- **Subsystem Impact**: Word Chain Game Screen
- **Detailed Description & Root Cause**:
  In `app/chain.tsx`, the `ScrollView` ref prop is declared inline: `ref={ref => { if (ref) setTimeout(() => ref.scrollToEnd({ animated: true }), 100); }}`. Ref callbacks execute on every re-render. Every keypress in `TextInput` triggers a re-render, queueing a new uncancelled `setTimeout(100)`. If the user navigates away, timers fire against unmounted native view instances.
- **Reproduction Steps**:
  1. Type rapidly in Word Chain and immediately navigate back.
  2. Timers execute against unmounted view handles.
- **Remediation**:
  Replace inline ref callback with a standard `useRef` and a `useEffect` keyed on `game.chain.length`.

---

### [R4-F05 to R4-F11] Summary of High, Medium & Low Findings in Track R4
- **[R4-F05] High**: Natural timer expiration in Blitz mode drops end-of-game XP and Gems.
- **[R4-F06] Medium**: Resetting a Duel game fails to clear `botTimerRef`, causing orphaned bot guesses on new boards.
- **[R4-F07] Medium**: Listing entire `state` in callback dependencies invalidates child component memoization on every keystroke.
- **[R4-F08] Medium**: 100+ items rendered in non-virtualized `ScrollView` with O(N) linear array lookups.
- **[R4-F09] Medium**: Redundant standalone storage and cloud mutations duplicate operations inside `recordWin`.
- **[R4-F10] Low**: Synchronous Set creation during bundle evaluation adds to startup cold-start TTI.
- **[R4-F11] Low**: `getRandomWord` risks TypeError if empty category word pool is returned.

---

## 3.5 Track R5: Google Play Policy Compliance & Store Readiness

### [R5-F01] Privacy Policy Explicitly Denies Email Collection While App Collects & Transmits Emails
- **Severity**: 🔴 Critical
- **Category**: Google Play User Data & Data Safety Policy
- **Location**: `privacy-policy.html:31, 57`, `components/PrivacyPolicyModal.tsx:50-52`, `services/auth.service.ts:75`, `services/cloud.service.ts:101, 159`, `services/error-reporting.service.ts:24`
- **Subsystem Impact**: Store Privacy Disclosures & Legal Compliance
- **Detailed Description & Root Cause**:
  The hosted `privacy-policy.html` and in-app `PrivacyPolicyModal.tsx` explicitly claim:
  *"Uygulama içinde doğrudan kişisel bilgileri (isim, e-posta adresi, telefon vb.) toplamıyoruz."* / *"We do not directly collect personal identifying information (such as name, email, or phone number)."*
  However, the application implements email-based account linking, stores user emails in Firestore collections (`cloud_saves/{email}`, `feedback/{feedbackId}`), and transmits user emails to Sentry via `Sentry.setUser({ id: uid, email })`. This direct contradiction violates Google Play User Data policies and triggers immediate app rejection during store review.
- **Reproduction Steps**:
  1. Inspect `privacy-policy.html` lines 31 & 57.
  2. Inspect `services/cloud.service.ts` and `services/error-reporting.service.ts`.
  3. Note contradiction between public legal claims and actual runtime telemetry.
- **Remediation**:
  Rewrite Section 1 of `privacy-policy.html` and `PrivacyPolicyModal.tsx` to accurately declare email collection for cloud sync, feedback, and diagnostics, naming Firebase and Sentry as processors.

---

### [R5-F02] Extreme Hate Speech, Racial Slurs, Sexual Violence & Illicit Drug Terms in Bundled Dictionary
- **Severity**: 🟠 High
- **Category**: IARC Content Ratings & Inappropriate Content Policy
- **Location**: `constants/validation_dictionary.ts`
- **Subsystem Impact**: Bundled Game Dictionary & TDK Definition Service
- **Detailed Description & Root Cause**:
  The game is declared as **IARC 3+ (Everyone / PEGI 3)** with zero violence, profanity, or vulgarity. However, `validation_dictionary.ts` contains 50+ instances of severe hate speech and slurs:
  - Racial & Homophobic Slurs: `NIGGER`, `FAGGOT`, `DYKE`, `SPIC`, `CHINK`, `KAFIR`.
  - Extremist Ideology: `NAZI`, `HITLER`, `JIHAD`.
  - Sexual Violence: `RAPE`, `RAPIST`, `RAPED`.
  - Illicit Narcotics: `HEROIN`, `COCAINE`, `EROİN`, `KOKAİN`, `ESRAR`.
  - Explicit Profanity: `OROSPU`, `İBNE`, `KAHPE`, `FAHİŞE`, `FUCK`, `CUNT`, `BITCH`, `DICK`, `COCK`, `SLUT`, `PENIS`, `VAGINA`.
  These words are validated as legal guesses and queried via `definition.service.ts`. Shipping an unmoderated 3+ app with hate speech violates Google Play Hate Speech and IARC Rating Accuracy policies.
- **Reproduction Steps**:
  1. Search for racial slurs in `constants/validation_dictionary.ts`.
  2. Enter them in Classic Wordle; observe the game accepts the guess and offers definition lookup.
- **Remediation**:
  Run an automated sanitization script against `validation_dictionary.ts` to purge all hate speech, slurs, explicit sexual terms, and illegal drug terms.

---

### [R5-F03] Missing In-App and Web-Based Account & Data Deletion Pathway
- **Severity**: 🟠 High
- **Category**: Google Play Account Deletion Policy
- **Location**: `services/auth.service.ts`, `services/cloud.service.ts`, `hooks/useCloudSync.ts:135-140`, `components/CloudSyncStatus.tsx:44-49`
- **Subsystem Impact**: Account Management & Data Privacy
- **Detailed Description & Root Cause**:
  Google Play mandates that any app supporting account creation must provide an in-app account deletion mechanism and a public web deletion URL. The app only provides "Unlink Account" (`handleUnlink`), which deletes `gq_user_email` from local AsyncStorage while leaving user documents intact in Firebase Auth and Firestore.
- **Reproduction Steps**:
  1. Link an email in Cloud Sync. Tap "Unlink Account".
  2. Check Firebase Console; user record and Firestore documents remain undeleted.
- **Remediation**:
  Add an in-app "Delete Account & Data" button calling `auth.currentUser.delete()` and Firestore batch deletions, and publish a web deletion form at `https://zovtex.com/account-deletion`.

---

### [R5-F04] Family & Child Protection Policy Violation (COPPA & Missing Age Gate)
- **Severity**: 🟠 High
- **Category**: Families Policy & COPPA Compliance
- **Location**: `PLAY_STORE_LISTING.md:34, 58`, `components/CloudSyncModal.tsx`, `services/error-reporting.service.ts:24`
- **Subsystem Impact**: Target Audience & Child Privacy
- **Detailed Description & Root Cause**:
  The app targets all ages ("TÜM AİLE İÇİN / 3+") and collects personal email addresses without a neutral age gate. Transmitting child personal identifiers to Sentry and Firebase without verifiable parental consent violates COPPA and Google Play Families Policy.
- **Reproduction Steps**:
  1. Open app as a child user. Open Cloud Sync; email registration is permitted with no age check.
- **Remediation**:
  Implement a neutral age gate prior to email entry, configure Sentry with `sendDefaultPii: false`, and enable server-side IP scrubbing.

---

### [R5-F05 to R5-F08] Summary of Medium & Low Findings in Track R5
- **[R5-F05] Medium**: Deceptive restore alert in `settings.tsx` displays success without checking active purchases, and IAP catch blocks grant free currency.
- **[R5-F06] Medium**: Keystore passwords hardcoded in `build.gradle` violate release security rules.
- **[R5-F07] Low**: `MODIFY_AUDIO_SETTINGS` permission in `AndroidManifest.xml` is missing from `app.json`.
- **[R5-F08] Low**: Privacy policy contact email (`mhmto.gemini@gmail.com`) and version strings mismatch Play Store listing (`support@zovtex.com`).

---

# 4. Dynamic Testing & Performance Execution Report

---

## 4.1 Jest Automated Test Suite Results

The full test suite was executed via `npm test -- --runInBand`. All 7 test suites passed cleanly:

```text
> jest --runInBand

PASS __tests__/Keyboard.stress.test.tsx
PASS __tests__/Keyboard.test.tsx
PASS __tests__/challenger_m2_2_stress.test.ts
PASS __tests__/memory_performance.test.ts
PASS __tests__/challenger_stress.test.ts
PASS __tests__/storage.service.test.ts
PASS __tests__/share.service.test.ts

Test Suites: 7 passed, 7 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Time:        2.335 s
```

---

## 4.2 Dynamic Game Engine Simulation Results (8 Test Paths)

A dedicated Node.js simulation harness (`dynamic_game_runner.js`) was executed to dynamically exercise all core game engine state machines across both **Win Paths** and **Loss Paths** for 4 primary game modes.

| Game Mode | Test Path | Target Word(s) | Steps / Guesses Executed | Final Status | Outcome |
|---|---|---|---|:---:|:---:|
| **Classic Wordle** | **Win Path** | `GEYİK` | 3 attempts: `ASLAN` (absent), `KÖPEK` (partial), `GEYİK` (solved) | `won` | ✅ **PASS** |
| **Classic Wordle** | **Loss Path** | `GÜNEŞ` | 6 attempts: `ASLAN`, `ZEBRA`, `KÖPEK`, `TİLKİ`, `ÇAKAL`, `HOROZ` | `lost` | ✅ **PASS** |
| **Dordle (Dual)** | **Win Path** | `BALIK`, `ORMAN` | 4 attempts: `ASLAN`, `BALIK` (Board 1 solved), `KÖPEK`, `ORMAN` (Board 2 solved) | `won` | ✅ **PASS** |
| **Dordle (Dual)** | **Loss Path** | `GÜNEŞ`, `DENİZ` | 7 failed attempts across both boards | `lost` | ✅ **PASS** |
| **Blitz** | **Scoring Path** | 5-word pool | 5 consecutive solves with streak bonus (+100, +200, +350, +500, +700 pts) | `playing` | ✅ **PASS** |
| **Blitz** | **Timer Expiration** | 2-word pool | 10s timer countdown, -5s skip penalty, 1s tick $\rightarrow$ 0s | `ended` | ✅ **PASS** |
| **Anagram** | **Win Path** | `KİRPİ` | Permutation selected in correct order $\rightarrow$ solved | `won` | ✅ **PASS** |
| **Anagram** | **Loss Path** | `GEYİK` | 3 incorrect submissions $\rightarrow$ max attempts reached | `lost` | ✅ **PASS** |

### Dynamic Benchmark Transcript
- **Keystroke Grid Mutation Throughput**: 100,000 grid cell mutations executed in **5.79 ms** (**17,266,088 operations/sec**).
- **Structural Sharing Verification**: 100% row reference immutability preserved for unmodified board rows.
- **Turkish Character Mapping**: 100% accuracy verified across all 12 Turkish character pairs (`İ/i`, `I/ı`, `Ğ/ğ`, `Ü/ü`, `Ş/ş`, `Ö/ö`, `Ç/ç`).

---

## 4.3 Memory Leak, Timer Lifecycle & ANR Analysis

1. **Event Listener Leaks (`R4-F03`)**: `services/deeplink.service.ts` registers `Linking.addEventListener` without returning the subscription's `.remove()` handle, causing uncollected listeners across layout remounts.
2. **Render Loop Timer Scheduling (`R4-F04`)**: `app/chain.tsx` schedules an uncancelled `setTimeout(100)` inside the `ScrollView` inline `ref` callback on every keystroke render.
3. **AI Bot Timer Retention (`R4-F06`)**: `hooks/useDuel.ts` fails to clear `botTimerRef` when `reset()` is invoked, allowing pending timers to mutate new match boards.
4. **Cold-Start TTI Impact (`R4-F10`)**: Synchronous Set creation during module bundle evaluation adds unnecessary CPU latency on low-end Android hardware.

---

# 5. Risk Matrix (Likelihood vs. Impact)

The risk matrix maps all findings according to their probability of occurrence and business/operational severity.

```text
+-------------------------------------------------------------------------------+
| CRITICAL RISK ZONE (Red - Immediate Release Blockers)                         |
|   R1-F01 (Word bank length deadlocks)       R1-F02 (Anagram recursion crash)   |
|   R1-F03 (ESLint v10 CI failure)            R2-F01 (Level demotion at 4k XP)  |
|   R2-F02 (Turkish casing corruption)        R2-F03 (Unsolvable Word Connect)  |
|   R3-F01 (Free IAP catch block bypass)      R3-F02 (Keystore passwords in git)|
|   R4-F01 (Unhandled JSON.parse crash)       R4-F02 (Dordle reward blocker)    |
|   R5-F01 (Privacy policy data discrepancy)                                    |
+-------------------------------------------------------------------------------+
| HIGH RISK ZONE (Orange - High Priority Functional & Security Defects)         |
|   R1-F04 (TS7030 strict effect returns)     R1-F05 (Conflicting IAP SKUs)     |
|   R1-F06 (Crossword coordinate overlap)     R1-F07 (Unprotected JSON parse)   |
|   R1-F08 (Dual state fragmentation)         R1-F09 (Missing Firestore index)  |
|   R1-F10 (Duel duplicate letter logic)      R2-F04 (Unsolvable Blitz rounds)  |
|   R2-F05 (Blitz reward loss on timer)       R2-F06 (Premium hint gem theft)   |
|   R2-F07 (Single-pass letter frequency)     R3-F03 (Plaintext storage / ADB)  |
|   R3-F04 (Account takeover via email)       R3-F05 (Client-side scores)       |
|   R3-F06 (Unvalidated cloud saves)          R4-F03 (Deep link memory leak)    |
|   R4-F04 (ScrollView ref timeout leak)      R4-F05 (Blitz timer reward drop)  |
|   R5-F02 (Hate speech in dictionary)        R5-F03 (Missing account deletion) |
|   R5-F04 (COPPA & neutral age gate missing)                                   |
+-------------------------------------------------------------------------------+
| MEDIUM RISK ZONE (Yellow - Quality, Architecture & Robustness)                |
|   R1-F11..F21 (any types, circular imports, silent catches, ErrorBoundary)     |
|   R2-F08..F13 (Dictionary validation, stats tracking, clock exploits)         |
|   R3-F07..F09 (Referral rules, Sybil flooding, deep link execution)           |
|   R4-F06..F09 (Duel bot timer, memoization invalidation, ScrollView lists)    |
|   R5-F05..F06 (Deceptive restore alert, hardcoded keystore in build)          |
+-------------------------------------------------------------------------------+
| LOW RISK ZONE (Green - Polish, Style & Minor Optimization)                     |
|   R1-F22..F27 (Unused imports, dead modules, theme context, React keys)       |
|   R2-F14..F16 (Word chain language, obsolete SKUs, streak calendar edge case) |
|   R3-F10..F11 (Misleading policy wording, disabled Proguard)                  |
|   R4-F10..F11 (Startup Set overhead, getRandomWord null check)                |
|   R5-F07..F08 (Manifest permission divergence, contact email mismatch)        |
+-------------------------------------------------------------------------------+
```

---

# 6. Total Finding Counts & Breakdown Metrics

### 6.1 Findings Breakdown by Requirement & Severity

| Audit Track / Subsystem | Critical (P0) | High (P1) | Medium (P2) | Low / Info (P3) | Total |
|---|:---:|:---:|:---:|:---:|:---:|
| **Track R1: Static Code Analysis & Type Safety** | 3 | 7 | 11 | 6 | **27** |
| **Track R2: Gameplay Logic & State Correctness** | 4 | 5 | 5 | 2 | **16** |
| **Track R3: Security & Anti-Cheat** | 2 | 4 | 3 | 2 | **11** |
| **Track R4: Performance & Dynamic Testing** | 2 | 3 | 4 | 2 | **11** |
| **Track R5: Google Play Policy Compliance** | 1 | 3 | 2 | 2 | **8** |
| **TOTAL** | **12** | **22** | **25** | **14** | **73** |

### 6.2 Findings by Core Architectural Subsystem

```text
Game Engine & Mode Logic (Wordle, Dordle, Blitz, Anagram, Connect, Chain, Duel): 22 findings
Monetization & In-App Purchases (SKUs, StoreModal, Premium Hints, Free Bypass):    8 findings
Authentication, Cloud Sync & Storage (Firebase, AsyncStorage, Account Takeover): 12 findings
Security, Keystore & Anti-Cheat (build.gradle, Firestore Rules, Leaderboard):     9 findings
Store Policy, Legal, Disclosures & Content (Privacy Policy, Dictionary Slurs):    8 findings
Type Safety, Performance & Tooling (TS Strict, ESLint v10, Memory Leaks, Sets):   14 findings
```

---

# 7. Final Production Go/No-Go Recommendation

### Final Release Verdict:
## ⛔ NO-GO FOR PRODUCTION RELEASE (RELEASE BLOCKED)

---

## 7.1 Detailed Justification for Release Blockers

1. **Security & Signing Key Compromise (`R3-F02`, `R5-F06`)**: Hardcoding production release keystore passwords (`'logospassword'`) in `build.gradle` and committing `release.keystore` directly to the source repository invalidates release binary integrity.
2. **Monetization Bypass Vulnerability (`R3-F01`, `R5-F05`)**: `StoreModal.tsx` catches purchase errors and cancellations and automatically grants free gems and lifetime premium access.
3. **Severe Hate Speech & Slurs in 3+ Rated App (`R5-F02`)**: Bundling racial slurs (`NIGGER`, `SPIC`), homophobic slurs, and explicit obscenities in `validation_dictionary.ts` for an app rated IARC 3+ violates Google Play Hate Speech and Inappropriate Content policies, risking developer account termination.
4. **Catastrophic Level Demotion Bug (`R2-F01`)**: Gaps in `LEVELS` table cause players reaching 4,000 XP to suffer an immediate demotion from Level 10 to Level 7.
5. **Mathematically Unsolvable Word Connect Levels (`R2-F03`)**: Turkish Levels 1 and 2 require letters missing from the wheel, permanently blocking game progression.
6. **Word Bank Length Mismatch Deadlocks (`R1-F01`, `R2-F04`)**: Over 100 non-5-letter words in `constants/words.ts` deadlock fixed 5-letter boards in Duel, Blitz, and Dordle.
7. **Turkish Character Normalization Corruption (`R2-F02`)**: Plain `.toUpperCase()` turns `'i'` into ASCII `'I'`, invalidating legitimate Turkish dictionary words across Anagram, Word Chain, and Duel.
8. **Account Takeover via Passwordless Email Linking (`R3-F04`)**: Anyone can link arbitrary email addresses without authentication, enabling unauthorized downloads or overwrites of victim cloud saves.
9. **Dordle Victory Screen & Rewards Never Triggering (`R4-F02`)**: Asynchronous state closures in `app/dordle.tsx` prevent victory modals and gem/XP rewards from triggering on game completion.
10. **Data Safety Policy Discrepancy & Missing Account Deletion (`R5-F01`, `R5-F03`)**: Hosted privacy policy falsely denies collecting email addresses while the app transmits emails to Firestore and Sentry. No account deletion mechanism is provided.
11. **Storage Deserialization App Crash Hazard (`R4-F01`, `R1-F07`)**: Unhandled `JSON.parse` operations in `services/storage.service.ts` crash the app on startup if corrupted data is present.
12. **Broken Out-of-the-Box ESLint Tooling (`R1-F03`)**: Incompatible ESLint v10 configuration causes `npm run lint` to fail immediately with fatal exit codes.

---

## 7.2 Phase-by-Phase Remediation Roadmap & Release Readiness Checklist

```
+===============================================================================+
| PHASE 1: IMMEDIATE CRITICAL RELEASE BLOCKERS (P0)                             |
+===============================================================================+
  [ ] 1. Keystore Security: Remove release.keystore from git; move credentials 
         to secure environment variables in build.gradle (R3-F02, R5-F06).
  [ ] 2. IAP Fulfillment: Remove free reward grants from StoreModal catch blocks;
         fulfill strictly via verified purchase listeners (R3-F01, R5-F05).
  [ ] 3. Dictionary Sanitization: Execute automated scrubber to remove all hate
         speech, slurs, and explicit obscenities from validation_dictionary.ts (R5-F02).
  [ ] 4. Level Progression: Fix gaps in constants/levels.ts to eliminate level
         demotions at 4,000 XP (R2-F01).
  [ ] 5. Word Connect Layout: Correct LEVELS_TR in useWordConnect.ts so target
         words match wheel letters (R2-F03, R1-F06).
  [ ] 6. Word Bank Lengths: Restrict constants/words.ts 5-letter banks strictly
         to 5-letter words (R1-F01, R2-F04).
  [ ] 7. Turkish Casing: Implement toTurkishUpper/toTurkishLower across all
         dictionary and input handlers (R2-F02).
  [ ] 8. Anagram Recursion: Replace recursive shuffle() with iterative loop (R1-F02, R2-F13).
  [ ] 9. Dordle UI State: Add useEffect in app/dordle.tsx watching gameStatus
         to trigger victory overlays and rewards (R4-F02).
  [ ] 10. Privacy Policy: Update privacy-policy.html and PrivacyPolicyModal.tsx
          to accurately declare email collection and Sentry telemetry (R5-F01).
  [ ] 11. Storage Safety: Wrap all JSON.parse calls in storage.service.ts in
          try/catch blocks (R4-F01, R1-F07).
  [ ] 12. ESLint Config: Migrate .eslintrc.json to eslint.config.mjs for ESLint v10 (R1-F03).

+===============================================================================+
| PHASE 2: HIGH PRIORITY FUNCTIONAL & POLICY HARDENING (P1)                     |
+===============================================================================+
  [ ] 13. Account Deletion: Add in-app account deletion flow calling
          auth.currentUser.delete() and host web form at zovtex.com/account-deletion (R5-F03).
  [ ] 14. Cloud Sync Auth: Require Firebase Authentication credentials before
          linking email addresses (R3-F04).
  [ ] 15. Premium Hints: Make hints 100% free for Premium users in HintModal.tsx (R2-F06).
  [ ] 16. Blitz Timer Rewards: Bind end-of-game rewards to timer expiration in blitz.tsx (R2-F05, R4-F05).
  [ ] 17. Wordle Duel Rules: Refactor useDuel.ts to two-pass letter frequency coloring (R1-F10, R2-F07).
  [ ] 18. ADB Backup: Set android:allowBackup="false" in AndroidManifest.xml (R3-F03).
  [ ] 19. Firestore Rules: Add schema validation to cloud_saves and fix referral rules (R3-F06, R3-F07).
  [ ] 20. TS Strict Returns: Fix TS7030 return path errors in AchievementToast, AnimatedCell, GemShower (R1-F04).
  [ ] 21. SKU Harmonization: Standardize com.zovtex.logos.* SKUs across all files (R1-F05, R2-F15).
  [ ] 22. Deep Link Cleanup: Add subscription removal cleanup in setupDeepLinkHandler (R1-F15, R4-F03).
  [ ] 23. ScrollView Timers: Replace inline ref callbacks with standard useRef in chain.tsx (R4-F04).
  [ ] 24. Families & COPPA: Add neutral age gate before email entry and configure Sentry PII scrubbing (R5-F04).

+===============================================================================+
| PHASE 3: ARCHITECTURE UNIFICATION & QUALITY REFINEMENT (P2/P3)                |
+===============================================================================+
  [ ] 25. State Unification: Migrate all screens from useProgress to useProgressStore (Zustand) (R1-F08, R2-F11).
  [ ] 26. Stats Recording: Call recordWin/recordLoss across all 5 non-Classic modes (R2-F09).
  [ ] 27. Word Chain Dictionary: Preload validation_dictionary.ts in useWordChain.ts (R2-F10).
  [ ] 28. Dordle/Duel Dictionary: Add dictionary validation to Dordle and Duel guesses (R2-F08).
  [ ] 29. Error Reporting: Forward ErrorBoundary errors to Sentry captureError (R1-F14).
  [ ] 30. Unused Symbols: Remove 70+ unused imports, variables, and dead store files (R1-F22, R1-F23).
  [ ] 31. Proguard/R8: Enable bytecode minification and obfuscation for release builds (R3-F11).
  [ ] 32. Leaderboard Virtualization: Replace non-virtualized ScrollViews with FlatLists (R4-F08).
+===============================================================================+
```

---
*Authoritative QA Audit Report compiled and verified by QA Synthesis & Compilation Auditor for "Logos: Kelime Avı ve Bulmaca".*
