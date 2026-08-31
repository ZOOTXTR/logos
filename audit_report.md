# GemQuest Codebase Audit Report

## Executive Summary
A comprehensive read-only audit of the GemQuest (Logos) React Native codebase was performed. The core game loops, state management, and Firebase integration were analyzed. Several logic bugs were identified, particularly around language-specific handling (English vs. Turkish), cloud sync conflict resolution, and game logic edge cases. 

---

## 1. Logic Bugs

### 1.1 Cloud Sync Fallback Key Mismatch
**Severity**: Critical
**Location**: `services/cloud.service.ts` (Lines 117-134)
**Description**: In `restoreStorageFromCloud`, if Firestore fails, it attempts to load from `AsyncStorage`. However, it uses `gq_cloud_db_${email}` as the key. In the `syncStorageToCloud` method, the data is saved under `gq_cloud_db_${targetId}` (where `targetId` could be `uid` or `email`). If a user logs in with a UID, the sync saves to the UID key, but the restore fallback will check the email key and fail to recover offline data.
**Proposed Solution**: Change Line 127 in `restoreStorageFromCloud` to use `gq_cloud_db_${targetId}` instead of `gq_cloud_db_${email}`.

### 1.2 Cloud Sync Stats Overwrite
**Severity**: Warning
**Location**: `services/cloud.service.ts` (Lines 147-157)
**Description**: When merging `stats` from the cloud (`cloudStats`) with `localStats`, the logic explicitly states `// A simple max merge for primary stats` and merges primitive numbers using `Math.max`. However, it neglects array and object properties like `categoriesWon` and `guessDistribution`. By doing `{ ...localStats, ... (maxed primitives) }`, any unique categories or distribution data existing *only* in `cloudStats` are entirely discarded and overwritten by the local state arrays.
**Proposed Solution**: Deep merge `categoriesWon` (using a Set for uniqueness) and sum the values in `guessDistribution`.

### 1.3 Word Chain Fallback to Turkish Words
**Severity**: Warning
**Location**: `hooks/useWordChain.ts` (Line 17, 80)
**Description**: `START_WORDS` is hardcoded to map over `ALL_WORDS` (which contains exclusively Turkish words). If a user plays the Word Chain mode in English, the initial word will be Turkish, and if the English dictionary is not fully loaded, it will use the Turkish `START_WORDS` as the fallback validation pool.
**Proposed Solution**: Dynamically compute `START_WORDS` based on the active language (`ALL_WORDS` vs `ALL_WORDS_EN`).

### 1.4 Hardcoded Turkish Alphabet in Game Logic
**Severity**: Warning
**Location**: 
- `hooks/useGame.ts` (Line 254)
- `hooks/useDuel.ts` (Line 85)
**Description**: 
- In `useGame.ts`, the `useSweeper` function hardcodes the Turkish alphabet (`'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'`). When playing in English, the sweeper will eliminate Turkish-specific letters instead of standard English letters.
- In `useDuel.ts`, the bot opponent's guess generation also hardcodes the Turkish alphabet. The bot will guess Turkish characters (`Ğ`, `Ş`, etc.) while playing an English duel.
**Proposed Solution**: Select the alphabet array based on the `lang` parameter (`lang === 'en'` ? standard English alphabet : Turkish alphabet).

### 1.5 Anagram Game Rejects Valid Anagrams
**Severity**: Warning
**Location**: `hooks/useAnagram.ts` (Line 70)
**Description**: `submitGuess` only validates the guess by checking `state.currentGuess === state.targetWord`. If the user finds a different, valid dictionary word that uses the exact same letters (e.g., Target: "LEAK", Guess: "LAKE"), they are penalized as a wrong guess.
**Proposed Solution**: Check if the guess is in the dictionary (or word pool) and has the exact same character frequencies as the target word, rather than requiring an exact string match with the randomly chosen target.

---

## 2. Missing Features & Incomplete Implementations

### 2.1 Word Connect Levels Infinite Loop
**Severity**: Optimization
**Location**: `hooks/useWordConnect.ts` (Lines 31-75, 79)
**Description**: There are only 2 predefined crossword layouts for Turkish (`LEVELS_TR`) and 2 for English (`LEVELS_EN`). The hook determines the level via `config = levels[levelIndex % levels.length]`. After completing the first two levels, the game silently loops back to the beginning, presenting the exact same puzzles infinitely.
**Proposed Solution**: Implement a procedural crossword generator for endless play, or expand the hardcoded level list and show an "All Levels Completed" state when finished.

### 2.2 Word Connect Turkish Case Conversion
**Severity**: Warning
**Location**: `hooks/useWordConnect.ts` (Line 135)
**Description**: `submitWord` uses `state.currentGuess.toUpperCase()`. In Turkish, a lowercase `i` should become `İ`, but standard `.toUpperCase()` converts it to `I`. This causes a mismatch with target words containing `İ`.
**Proposed Solution**: Use `state.currentGuess.toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-US')`.

---

## 3. Dead Code & Static Analysis

No critical dead code or significantly unused heavy dependencies were found. Some findings:
- `expo-in-app-purchases-14.0.0.tgz` is present in the root directory but the app correctly uses `react-native-iap` in its `package.json`. The `.tgz` file is orphaned and can be deleted.
- Empty functions exist in `SettingsStore` interface defaults (`THEME_DEFAULTS`), but this is standard practice for React contexts and Zustand defaults.

## Verification Methods
- **Cloud Sync Fallback**: Review `services/cloud.service.ts:127`. Modify network state and force a Firestore throw to observe the AsyncStorage key failure.
- **Turkish Alphabet Issues**: Review `hooks/useGame.ts:254` and `hooks/useDuel.ts:85`. Switch app language to English, trigger the sweeper or watch the bot in Duel mode, and observe Turkish characters being processed.
- **Word Connect Levels**: Review `hooks/useWordConnect.ts:31`. Play 3 levels of Word Connect; observe level 3 is identical to level 1.
