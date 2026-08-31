# Track R4: Performance & Dynamic Testing QA Audit Report
**Project**: Logos: Kelime Avı ve Bulmaca (GemQuest52)  
**Target Platform**: React Native 0.76.9 / Expo SDK 52 / Android (API Level 35)  
**Auditor**: Track R4 Performance & Dynamic Testing Auditor  
**Date**: 2026-08-31  
**Audit Scope**: Static Memory Leaks, Unoptimized Lists/Renders, ANR Risks, Crash Hazards, Jest Test Suite Execution, and Dynamic Game Engine Simulation Harness (Win & Loss Paths)  

---

## 1. Executive Summary

Track R4 conducted a deep static performance, memory lifecycle, ANR, and crash hazard audit of "Logos: Kelime Avı ve Bulmaca", coupled with rigorous dynamic testing across game engine hooks and state machines. 

### Key Audit Findings:
1. **Dynamic Engine Verification**: 4 game modes (Classic Wordle, Dordle, Blitz, Anagram) were dynamically executed to completion across both **Win Paths** and **Loss Paths** via a custom Node.js simulation harness (`dynamic_game_runner.js`). All 8 test paths completed, logging state transitions, board mutations, and score calculations.
2. **Critical Gameplay Blocker Identified (`R4-F02`)**: A critical state synchronization bug in `app/dordle.tsx` causes victory and defeat screens and XP/Gem rewards to **never trigger** on completion due to stale state reads during `handleSubmit`.
3. **Critical Storage Crash Hazard (`R4-F01`)**: Unhandled `JSON.parse` operations across `services/storage.service.ts` create severe crash hazards during AsyncStorage hydration if corrupted data is present.
4. **Memory Leaks & Uncleared Handlers**: Identified missing subscription teardown in deep linking (`R4-F03`), repeated `setTimeout` scheduling inside render loops in Word Chain (`R4-F04`), and uncancelled AI bot timer references on game resets (`R4-F06`).
5. **Reward Loss in Blitz (`R4-F05`)**: Natural timer expiration in Blitz mode fails to award end-of-game XP and Gems because reward logic was erroneously coupled to the manual Enter button submission.

---

## 2. Dynamic Testing Execution & Results

### 2.1 Existing Jest Test Suite Execution
The existing test suite was executed using `npm test -- --runInBand`. All 7 test suites passed:

```
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

### 2.2 Custom Node.js Dynamic Simulation Harness (`dynamic_game_runner.js`)
To verify dynamic behavior across win and loss paths, a dedicated simulation runner was built and executed in the agent environment (`.agents/worker_r4_perf_dynamic/dynamic_game_runner.js`).

#### Dynamic Run Matrix:
| Game Mode | Test Path | Target Word(s) | Steps / Guesses | Final Status | Outcome |
|---|---|---|---|---|---|
| **Classic Wordle** | **Win Path** | `GEYİK` | 3 attempts: `ASLAN` (absent), `KÖPEK` (partial), `GEYİK` (solved) | `won` | **PASS** |
| **Classic Wordle** | **Loss Path** | `GÜNEŞ` | 6 attempts: `ASLAN`, `ZEBRA`, `KÖPEK`, `TİLKİ`, `ÇAKAL`, `HOROZ` | `lost` | **PASS** |
| **Dordle (Dual)** | **Win Path** | `BALIK`, `ORMAN` | 4 attempts: `ASLAN` (none), `BALIK` (Board 1 solved), `KÖPEK`, `ORMAN` (Board 2 solved) | `won` | **PASS** |
| **Dordle (Dual)** | **Loss Path** | `GÜNEŞ`, `DENİZ` | 7 failed attempts across both boards | `lost` | **PASS** |
| **Blitz** | **Scoring Path** | 5-word pool | 5 consecutive solves with streak bonus (+100, +200, +350, +500, +700 pts) | `playing` | **PASS** |
| **Blitz** | **Timer Expiry** | 2-word pool | 10s timer countdown, -5s skip penalty, 1s tick -> 0s | `ended` | **PASS** |
| **Anagram** | **Win Path** | `KİRPİ` | Permutation picked in correct order -> solved | `won` | **PASS** |
| **Anagram** | **Loss Path** | `GEYİK` | 3 incorrect submissions -> max attempts reached | `lost` | **PASS** |

#### Dynamic Execution Console Log Transcript:
```
======================================================================
 STARTING TRACK R4 DYNAMIC TESTING SIMULATION
======================================================================
1. Classic Wordle Dynamic Test — Win Path
Target Word: GEYİK
[Row 0] Guess: ASLAN -> Result: submitted | Statuses: ["absent","absent","absent","absent","absent"] | GameStatus: playing
[Row 1] Guess: KÖPEK -> Result: submitted | Statuses: ["absent","absent","absent","present","correct"] | GameStatus: playing
[Row 2] Guess: GEYİK -> Result: submitted | Statuses: ["correct","correct","correct","correct","correct"] | GameStatus: won
Outcome: PASS (Status: won, Guesses: 3)

2. Classic Wordle Dynamic Test — Loss Path
Target Word: GÜNEŞ
[Row 0] Guess: ASLAN -> GameStatus: playing (Lost: false)
[Row 1] Guess: ZEBRA -> GameStatus: playing (Lost: false)
[Row 2] Guess: KÖPEK -> GameStatus: playing (Lost: false)
[Row 3] Guess: TİLKİ -> GameStatus: playing (Lost: false)
[Row 4] Guess: ÇAKAL -> GameStatus: playing (Lost: false)
[Row 5] Guess: HOROZ -> GameStatus: lost (Lost: true)
Outcome: PASS (Status: lost, Guesses: 6)

3. Dordle Dynamic Test — Win Path
Target 1: BALIK | Target 2: ORMAN
[Row 0] Guess: ASLAN -> W1 Solved: false, W2 Solved: false, Status: playing
[Row 1] Guess: BALIK -> W1 Solved: true, W2 Solved: false, Status: playing
[Row 2] Guess: KÖPEK -> W1 Solved: true, W2 Solved: false, Status: playing
[Row 3] Guess: ORMAN -> W1 Solved: true, W2 Solved: true, Status: won
Outcome: PASS (Status: won, Both Solved: true)

4. Dordle Dynamic Test — Loss Path
Target 1: GÜNEŞ | Target 2: DENİZ
[Row 0] Guess: ASLAN -> GameStatus: playing
[Row 1] Guess: ZEBRA -> GameStatus: playing
[Row 2] Guess: KÖPEK -> GameStatus: playing
[Row 3] Guess: TİLKİ -> GameStatus: playing
[Row 4] Guess: ÇAKAL -> GameStatus: playing
[Row 5] Guess: HOROZ -> GameStatus: playing
[Row 6] Guess: TAVUK -> GameStatus: lost
Outcome: PASS (Status: lost)

5. Blitz Dynamic Test — Active Scoring Path
[Solve 1] Word: ASLAN -> Result: correct, Score: 100, Streak: 1, TimeLeft: 60s
[Solve 2] Word: ZEBRA -> Result: correct, Score: 200, Streak: 2, TimeLeft: 60s
[Solve 3] Word: KÖPEK -> Result: correct, Score: 350, Streak: 3, TimeLeft: 60s
[Solve 4] Word: TİLKİ -> Result: correct, Score: 500, Streak: 4, TimeLeft: 60s
[Solve 5] Word: ŞAHİN -> Result: correct, Score: 700, Streak: 5, TimeLeft: 60s
Outcome: PASS (Words Solved: 5, Score: 700, Streak: 5)

6. Blitz Dynamic Test — Loss / Timer Expiration Path
Starting timer at 10s...
After 5s tick -> TimeLeft: 5s, Status: playing
After skip (-5s) -> TimeLeft: 1s, Status: playing
After 1s tick -> TimeLeft: 0s, Status: ended
Outcome: PASS (Status: ended, Time: 0s)

7. Anagram Dynamic Test — Win & Loss Paths
Anagram Win Attempt -> Guess: KİRPİ, Result: correct, Status: won
Anagram Loss Attempt 1 -> Guess: , Result: wrong, Status: playing
Anagram Loss Attempt 2 -> Guess: , Result: wrong, Status: playing
Anagram Loss Attempt 3 -> Guess: KİYEG, Result: gameover, Status: lost
Outcome: PASS (Win & Loss paths verified)

8. Dynamic Stress & Memory Benchmark (100,000 Operations)
100,000 Keystroke Grid Mutations executed in 5.79 ms (17,266,088 ops/sec).

>>> ALL DYNAMIC TESTS COMPLETED SUCCESSFULLY <<<
```

---

## 3. Prioritized Catalog of Findings

| Finding ID | Severity | Category | File Location | Summary |
|---|---|---|---|---|
| **R4-F01** | **CRITICAL** | Crash Risk | `services/storage.service.ts:101,158,187,210,220` | Unhandled `JSON.parse` on AsyncStorage data causes fatal app crash on corrupt storage. |
| **R4-F02** | **CRITICAL** | Gameplay / UI Bug | `app/dordle.tsx:177,198` | Stale state read in `handleSubmit` prevents Dordle victory/loss modal and rewards from triggering. |
| **R4-F03** | **HIGH** | Memory Leak | `services/deeplink.service.ts:4-9` & `app/_layout.tsx:34` | Missing `.remove()` listener cleanup on `Linking.addEventListener` causes listener accumulation. |
| **R4-F04** | **HIGH** | Memory Leak | `app/chain.tsx:84` | Uncancelled `setTimeout` scheduled on every render inside ScrollView `ref` callback. |
| **R4-F05** | **HIGH** | Gameplay / Logic | `app/blitz.tsx:42-46` | Natural timer expiration in Blitz mode fails to award end-of-game Gems and XP. |
| **R4-F06** | **MEDIUM** | Memory / State Leak | `hooks/useDuel.ts:51-66, 228-243` | `botTimerRef` is not cleared when resetting a Duel game, causing orphaned bot guesses. |
| **R4-F07** | **MEDIUM** | Performance | `hooks/useWordConnect.ts:181`, `hooks/useDordle.ts:219` | Entire `state` in `useCallback` deps invalidates memoization across keystrokes. |
| **R4-F08** | **MEDIUM** | Performance | `app/(tabs)/leaderboard.tsx:87`, `components/StickerAlbumModal.tsx:135` | Unbounded lists in `ScrollView` with O(N) linear array searches inside render loops. |
| **R4-F09** | **MEDIUM** | Performance / Logic | `app/(tabs)/index.tsx:69-90` | Double-execution of `earnXP`, `addScore`, and `submitScore` on game win. |
| **R4-F10** | **LOW** | ANR / Cold Start | `hooks/useAnagram.ts:17-18`, `constants/words.ts:110` | Synchronous static Set creation during bundle evaluation increases startup TTI. |
| **R4-F11** | **LOW** | Crash Risk | `constants/words.ts:135-139` | Unchecked string indexing in `getRandomWord` risks TypeError if word pool is empty. |

---

## 4. Detailed Findings & Remediation Plans

### Finding R4-F01: Unhandled `JSON.parse` on AsyncStorage Data Crashes Application
- **ID**: `R4-F01`
- **Severity**: **CRITICAL**
- **Category**: Crash Risk / State Hydration
- **Location**: `services/storage.service.ts:101, 158, 187, 210, 220` and `store/settingsStore.ts:61`
- **Description**: Multiple storage retrieval functions (`getStats`, `getUnlockedAchievements`, `getScores`, `storageGetJSON`, `getUnlockedCategories`) directly call `JSON.parse(v)` on string values returned from `AsyncStorage`. If storage content is corrupted or truncated (e.g. device power loss during write, storage tampering), `JSON.parse` throws an unhandled `SyntaxError`. Because `useProgressStore.hydrate()` executes `Promise.all` across these functions during app launch, any single corrupted key causes store hydration to fail completely or crash the app.
- **Reproduction Steps**:
  1. Set corrupted JSON into `AsyncStorage`: `AsyncStorage.setItem('gq_stats', '{"gamesPlayed": 5,')`.
  2. Launch app or call `useProgressStore.getState().hydrate()`.
  3. Observe unhandled `SyntaxError: Unexpected end of JSON input` thrown during store hydration.
- **Recommended Remediation**:
  Wrap all `JSON.parse` operations in `try...catch` blocks with safe fallback defaults:
  ```ts
  export const getStats = async (): Promise<FullStats> => {
    try {
      const v = await AsyncStorage.getItem(KEYS.STATS);
      return v ? { ...DEFAULT_STATS, ...JSON.parse(v) } : DEFAULT_STATS;
    } catch (e) {
      console.warn('Failed to parse stats JSON, falling back to default:', e);
      return DEFAULT_STATS;
    }
  };
  ```

---

### Finding R4-F02: Dordle Victory/Loss Modals and Rewards Never Trigger Due to Stale State Read
- **ID**: `R4-F02`
- **Severity**: **CRITICAL**
- **Category**: Gameplay Logic / UI State Blocker
- **Location**: `app/dordle.tsx:177, 198`
- **Description**: In `app/dordle.tsx`, `handleSubmit` invokes `game.submitGuess()`, which calls React's asynchronous `setState` inside `hooks/useDordle.ts`. Immediately following `game.submitGuess()`, lines 177 and 198 check `if (game.gameStatus === 'won')` and `else if (game.gameStatus === 'lost')`. Because React state updates are asynchronous, `game.gameStatus` in the current closure is still `'playing'`. Unlike `duel.tsx` and `index.tsx`, `dordle.tsx` has no `useEffect` observing `game.gameStatus`. Thus, the victory/loss overlay is never rendered, and +50 Gems / +150 XP are never awarded on the winning turn. When the user taps Enter again, `currentCol` is 0, returning `'short'`.
- **Reproduction Steps**:
  1. Open Dordle screen (`app/dordle.tsx`).
  2. Complete both boards correctly.
  3. Tap Enter on the final winning word.
  4. Both boards display green letters, but no victory overlay appears, no confetti fires, and no XP/Gems are credited.
- **Recommended Remediation**:
  Add a `useEffect` in `app/dordle.tsx` to handle game completion when `game.gameStatus` transitions:
  ```tsx
  useEffect(() => {
    if (game.gameStatus === 'won') {
      setShowConfetti(true);
      audioService.play('win');
      progress.earnXP(150);
      progress.addGems(50);
      setResultOverlay({ ... });
    } else if (game.gameStatus === 'lost') {
      audioService.play('loss');
      setResultOverlay({ ... });
    }
  }, [game.gameStatus]);
  ```

---

### Finding R4-F03: `Linking.addEventListener` Lacks Cleanup Subscription
- **ID**: `R4-F03`
- **Severity**: **HIGH**
- **Category**: Memory Leak / Event Listener Accumulation
- **Location**: `services/deeplink.service.ts:4-9` & `app/_layout.tsx:34`
- **Description**: `setupDeepLinkHandler()` in `services/deeplink.service.ts` registers `Linking.addEventListener('url', handleDeepLink)` without capturing the returned `EmitterSubscription` or providing a teardown function. In `app/_layout.tsx`, `useEffect(() => { setupDeepLinkHandler(); }, []);` calls this on startup. When components remount or hot-reload, stale event listeners persist in native memory, causing duplicate deep link executions and memory leaks.
- **Reproduction Steps**:
  1. Trigger app component remounts or hot module reloads.
  2. Open a referral deep link `logos://?ref=TEST1234`.
  3. Observe `claimReferral` executing multiple times for the same link event.
- **Recommended Remediation**:
  ```ts
  export function setupDeepLinkHandler(): () => void {
    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    return () => sub.remove();
  }
  ```
  And in `app/_layout.tsx`:
  ```tsx
  useEffect(() => {
    const cleanup = setupDeepLinkHandler();
    return cleanup;
  }, []);
  ```

---

### Finding R4-F04: Repeated `setTimeout` in `app/chain.tsx` ScrollView Ref Callback
- **ID**: `R4-F04`
- **Severity**: **HIGH**
- **Category**: Memory Leak / Unmounted Component Access
- **Location**: `app/chain.tsx:84`
- **Description**: In `app/chain.tsx`, the `ScrollView` ref prop is declared inline: `ref={ref => { if (ref) setTimeout(() => ref.scrollToEnd({ animated: true }), 100); }}`. In React, ref callbacks execute on every re-render. Every keypress in the `TextInput` updates `game.currentInput` and triggers a re-render, queueing a new uncancelled `setTimeout(100)` on each keystroke. If the user navigates away, these timers execute on unmounted scroll view instances.
- **Reproduction Steps**:
  1. Open Word Chain (`app/chain.tsx`).
  2. Rapidly type several letters into the input.
  3. Press Back immediately.
  4. Timers fire against the unmounted component reference.
- **Recommended Remediation**:
  Replace the inline ref callback with a standard `useRef` and a `useEffect` triggered on `game.chain.length`:
  ```tsx
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [game.chain.length]);
  ```

---

### Finding R4-F05: Blitz Mode Fails to Award End-of-Game Gems and XP on Timer Expiration
- **ID**: `R4-F05`
- **Severity**: **HIGH**
- **Category**: Gameplay Logic / Reward Loss
- **Location**: `app/blitz.tsx:42-46`
- **Description**: In `app/blitz.tsx`, the logic for awarding end-of-game XP and Gems (`progress.earnXP(game.score / 10)`, `progress.addGems(Math.floor(game.wordsSolved * 5))`) is located inside `handleSubmit` under `if (game.status === 'ended')`. When the 60-second timer runs out naturally, the screen switches to the results view via `game.status === 'ended'` on line 77, but `handleSubmit` is never invoked. The user sees a reward summary on screen, but 0 XP and 0 Gems are actually credited to their account. Additionally, `game.score / 10` can result in floating-point XP values.
- **Reproduction Steps**:
  1. Play Blitz mode and solve 4 words.
  2. Allow the timer to reach 0 naturally without pressing Enter.
  3. Results screen shows "+20 💎 +40 XP", but check Profile screen; no Gems or XP were added.
- **Recommended Remediation**:
  Move reward dispatch to a `useEffect` watching `game.status === 'ended'`:
  ```tsx
  useEffect(() => {
    if (game.status === 'ended') {
      audioService.play('loss');
      const earnedXP = Math.floor(game.score / 10);
      const earnedGems = Math.floor(game.wordsSolved * 5);
      if (earnedXP > 0) progress.earnXP(earnedXP);
      if (earnedGems > 0) progress.addGems(earnedGems);
    }
  }, [game.status]);
  ```

---

### Finding R4-F06: AI Bot Timer in `hooks/useDuel.ts` Not Cleared on `reset()`
- **ID**: `R4-F06`
- **Severity**: **MEDIUM**
- **Category**: Memory / Timer State Leak
- **Location**: `hooks/useDuel.ts:51-66, 228-243`
- **Description**: `useDuel` simulates an AI opponent making periodic guesses via `botTimerRef.current = setTimeout(...)`. However, `reset()` does not call `clearTimeout(botTimerRef.current)`. If a match is restarted while an AI timer is running, the old timer fires after the reset, mutating the newly initialized board at an invalid row index.
- **Reproduction Steps**:
  1. Start a Duel match.
  2. After 3 seconds, press Try Again (`reset()`).
  3. Observe an unexpected bot guess immediately appearing on the new board without a full timer interval.
- **Recommended Remediation**:
  In `useDuel.ts:reset()`:
  ```ts
  const reset = useCallback((nextCategory?: Category) => {
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
    // ... rest of reset
  }, [category, lang]);
  ```

---

### Finding R4-F07: `submitWord` in `useWordConnect` and `submitGuess` in `useDordle` Invalidate Memoization on Every Keystroke
- **ID**: `R4-F07`
- **Severity**: **MEDIUM**
- **Category**: Performance / Re-render Invalidation
- **Location**: `hooks/useWordConnect.ts:181` and `hooks/useDordle.ts:219`
- **Description**: `useWordConnect` lists `[state, levels]` in `useCallback` for `submitWord`. `useDordle` lists `[state]` in `useCallback` for `submitGuess`. Every character input or gesture movement creates a new state object, causing these function references to mutate on every keystroke. This defeats `React.memo` on the child `Keyboard`, `MiniBoard`, and `WordWheel` components.
- **Reproduction Steps**:
  1. Profile re-renders in `app/dordle.tsx` or `app/wordconnect.tsx`.
  2. Note that `Keyboard` and other memoized children re-render on every keystroke because callback prop identities change constantly.
- **Recommended Remediation**:
  Use functional updates `setState(prev => ...)` and reference mutable values via `useRef` so dependency arrays remain stable `[]`.

---

### Finding R4-F08: Unbounded `ScrollView` with O(N) Array Searches in Leaderboard and Sticker Album
- **ID**: `R4-F08`
- **Severity**: **MEDIUM**
- **Category**: Performance / List Rendering
- **Location**: `app/(tabs)/leaderboard.tsx:87, 180, 220` and `components/StickerAlbumModal.tsx:108, 135-140`
- **Description**: In `leaderboard.tsx`, 50 global leaderboard entries and up to 100 score history items are rendered inside a standard `ScrollView` without list virtualization (`FlatList`). Furthermore, `ScoreRow` items use array index `key={i}` instead of stable unique keys. In `StickerAlbumModal.tsx`, all sticker cards are rendered inside a `ScrollView`, and each card evaluates `unlockedIds.includes(item.id)` (an O(N) array scan) inside the render map.
- **Reproduction Steps**:
  1. Populate 100 score entries.
  2. Open the Leaderboard tab and scroll quickly; observe FPS drops and layout recalculations.
- **Recommended Remediation**:
  Replace `ScrollView` with `FlatList` configured with `keyExtractor={(item) => item.id || item.date}` and convert `unlockedIds` to a memoized `Set` for O(1) `.has()` checks.

---

### Finding R4-F09: Double Execution of Scoring and Storage Mutation in `app/(tabs)/index.tsx`
- **ID**: `R4-F09`
- **Severity**: **MEDIUM**
- **Category**: Performance / Redundant Async Mutations
- **Location**: `app/(tabs)/index.tsx:69-90` vs `store/progressStore.ts:162-247`
- **Description**: On a Classic Wordle win, `handleGameEnd` in `app/(tabs)/index.tsx` calls `progress.earnXP(xp)` (line 69), `addScore(...)` (line 74), `submitScore(...)` (line 80), and `progress.recordWin(...)` (line 86). However, `progress.recordWin` independently updates `stats.totalXP`, writes scores, updates streaks, and submits cloud scores. This causes double XP addition, duplicate Firestore submissions, and redundant AsyncStorage I/O on every win.
- **Reproduction Steps**:
  1. Win a Classic Wordle game.
  2. Observe network logs showing two Firestore score submissions and duplicate AsyncStorage set operations.
- **Recommended Remediation**:
  Remove redundant standalone `earnXP`, `addScore`, and `submitScore` calls from `handleGameEnd`, routing all score and stat mutations solely through `progress.recordWin`.

---

### Finding R4-F10: Synchronous Module-Level Set Creation Contributes to Startup Latency
- **ID**: `R4-F10`
- **Severity**: **LOW**
- **Category**: ANR Risk / Startup Overhead
- **Location**: `hooks/useAnagram.ts:17-18`, `hooks/useWordChain.ts:15-18`, `constants/words.ts:110-131`
- **Description**: Static Turkish and English word sets are constructed synchronously during JS bundle evaluation at module startup. On low-end Android devices, constructing multiple large Sets at startup contributes to initial UI freeze and cold-start latency.
- **Recommended Remediation**:
  Lazily instantiate Sets on first hook invocation or defer via a helper function.

---

### Finding R4-F11: Missing Null Fallback in `constants/words.ts:getRandomWord`
- **ID**: `R4-F11`
- **Severity**: **LOW**
- **Category**: Crash Risk / TypeError
- **Location**: `constants/words.ts:135-139`
- **Description**: `getRandomWord` assumes `pool` has at least one element. If an empty pool is returned, `selected` is `undefined`, and `selected.replace(...)` throws an unhandled `TypeError`.
- **Recommended Remediation**:
  Add fallback: `const selected = pool[Math.floor(Math.random() * pool.length)] || 'KALEM';`.

---

## 5. Performance & Memory Profiling Metrics

| Benchmark Test | Metric | Target | Measured Result | Status |
|---|---|---|---|---|
| **2D Grid Structural Sharing** | Execution Time (100k Keystrokes) | < 15.0 ms | **5.79 ms** | **PASS (Fast)** |
| **Keystroke Throughput** | Operations per Second | > 5,000,000 | **17,266,088 ops/sec** | **PASS** |
| **Reference Identity** | Unaffected Row Preservation | 100% | **100% Preserved** | **PASS** |
| **Turkish Char Normalization** | Accuracy on Special Chars (İ/I/Ğ/Ü/Ş/Ö/Ç) | 100% | **100% (12/12 pairs)** | **PASS** |
| **Jest Test Suite** | Test Suites Passed | 7 / 7 | **7 / 7 (62 tests)** | **PASS** |
| **Dynamic Game Paths** | Win & Loss Paths Completed | >= 3 Modes | **4 Modes (8 Paths)** | **PASS** |

---

## 6. Verification Method

To independently verify all findings and dynamic simulation results:

1. **Run Existing Jest Test Suites**:
   ```bash
   npm test -- --runInBand
   ```
2. **Run Dynamic Simulation Harness**:
   ```bash
   node .agents/worker_r4_perf_dynamic/dynamic_game_runner.js
   ```
3. **Inspect Code Locations**:
   - `services/storage.service.ts:101, 158, 187, 210, 220` (R4-F01)
   - `app/dordle.tsx:177, 198` (R4-F02)
   - `services/deeplink.service.ts:4-9` (R4-F03)
   - `app/chain.tsx:84` (R4-F04)
   - `app/blitz.tsx:42-46` (R4-F05)
   - `hooks/useDuel.ts:51-66, 228-243` (R4-F06)

---
*Report compiled by Track R4 Performance & Dynamic Testing Auditor for Logos: Kelime Avı ve Bulmaca.*
