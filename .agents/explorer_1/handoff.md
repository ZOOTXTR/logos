# Audit & Handoff Report: R1 & R4 (Game Modes, Categories, Levels, Architecture & Technical Bugs)

**Target Codebase**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52`  
**Auditor**: Explorer 1  
**Date**: 2026-08-04  

---

## 1. Observation

### 1.1 Codebase Inventory & Tech Stack
- **Framework & Runtime**: Expo `~52.0.46` / React Native `0.76.9` / React `18.3.1`
- **Navigation**: `expo-router` `~4.0.20` (File-based routing under `app/`)
- **State Management**: Zustand `^5.0.14` (`store/progressStore.ts`, `store/settingsStore.ts`)
- **Persistence**: `@react-native-async-storage/async-storage` (`services/storage.service.ts`)
- **UI & Graphics**: `react-native-reanimated` (`~3.16.7`), `react-native-svg` (`15.8.0`), `expo-linear-gradient` (`~14.0.2`), `@expo-google-fonts` (Fraunces, Bricolage Grotesque)
- **Audio & Haptics**: `expo-av` (`~15.0.2`), `expo-haptics` (`~14.0.1`)
- **Backend / Cloud / IAP**: Firebase JS SDK `^10.14.1` (Firestore, Auth), `react-native-iap` (`^12.16.4`), `expo-notifications` (`~0.29.14`)
- **Testing & Tooling**: Jest (`^29.7.0`), `jest-expo` (`~52.0.0`), `@testing-library/react-native` (`^12.9.0`), ESLint (`^10.8.0`), TypeScript (`~5.3.3`)

### 1.2 Directory Layout
```
gemquest52/
├── app/                      # Expo-Router Screen Routes
│   ├── (tabs)/               # Tab Screens: index (Classic/Game), modes, leaderboard, profile, settings
│   ├── _layout.tsx           # Root Navigation Layout & Providers
│   ├── anagram.tsx           # Anagram Game Mode Screen
│   ├── blitz.tsx             # Speed/Blitz Game Mode Screen
│   ├── chain.tsx             # Word Chain Game Mode Screen
│   ├── dordle.tsx            # Dordle (Dual Wordle) Game Mode Screen
│   ├── duel.tsx             # 1v1 AI Duel Game Mode Screen
│   ├── onboarding.tsx        # Onboarding Carousel Screen
│   └── wordconnect.tsx       # Word Connect / Crossword Mode Screen
├── components/               # UI & Game Components (GameBoard, Keyboard, Modals, SpinWheel, etc.)
├── constants/                # Data Definitions (words, words_en, levels, modes, achievements, themes)
├── hooks/                    # Custom Hooks & Game Loop Engines (useGame, useAnagram, useBlitz, etc.)
├── screens/                  # Sub-screens (GameMenuScreen, GamePlayScreen)
├── services/                 # Services (storage, cloud, auth, audio, dictionary, iap, notification)
└── store/                    # Zustand Stores (progressStore, settingsStore)
```

---

## 2. Logic Chain & Technical Audit

### 2.1 Inventory & Core Architecture Assessment
- **State Flow**: Centralized Zustand stores (`useProgressStore`, `useSettingsStore`) handle user progression (gems, XP, streaks, level calculation, unlocked categories/achievements) and user settings. UI hooks subcribe shallowly.
- **Game Engine Isolation**: Custom hooks (`useGame`, `useAnagram`, `useBlitz`, `useWordChain`, `useDordle`, `useWordConnect`, `useDuel`) act as isolated state machines powering individual game modes.
- **Dictionary & Validation System**: Words are loaded statically from `constants/words.ts` (Turkish, 5-letter base) and `constants/words_en.ts` (English). Full validation dictionaries are preloaded asynchronously via `services/dictionary.service.ts` referencing `VALIDATION_DICT_TR` from `constants/validation_dictionary.ts` (65,247 lines).

### 2.2 Game Modes, Categories, Levels & Difficulty Scaling
- **Game Modes**:
  1. **Classic Wordle** (`app/(tabs)/index.tsx` -> `hooks/useGame.ts`): Standard Wordle loop (4-7 attempts based on difficulty).
  2. **Speed / Blitz** (`app/blitz.tsx` -> `hooks/useBlitz.ts`): 60-second timed challenge; solves grant time bonuses and streak multipliers.
  3. **Daily Challenge** (`app/(tabs)/index.tsx` with mode='daily'): Seed-based date word (`constants/words.ts:157`), grants +100 Gem bonus.
  4. **Anagram** (`app/anagram.tsx` -> `hooks/useAnagram.ts`): Unscramble target letters into correct word within 5 attempts.
  5. **Word Chain** (`app/chain.tsx` -> `hooks/useWordChain.ts`): Form a chain of words where each word starts with the last letter of the previous word (3 lives).
  6. **Dordle** (`app/dordle.tsx` -> `hooks/useDordle.ts`): Solve 2 Wordle boards simultaneously within 7 guesses.
  7. **Word Connect** (`app/wordconnect.tsx` -> `hooks/useWordConnect.ts`): Circular letter wheel swipe to fill crossword grid.
  8. **1v1 AI Duel** (`app/duel.tsx` -> `hooks/useDuel.ts`): Real-time race against simulated AI bot with dynamic speech bubbles.
- **Categories**: 7 word categories defined in `constants/words.ts` (`random`, `hayvanlar`, `sehirler`, `yiyecek`, `meslekler`, `doga`, `spor`).
- **Leveling & XP System**: Defined in `constants/levels.ts`. Formula in `getLevelFromXP` (lines 70–89) calculates level dynamically based on step threshold `level * 150 XP`. Level titles range from Level 1 ("Çaylak") to Level 50 ("Logos Şampiyonu").
- **Difficulty Settings**:
  - `easy`: 7 guesses, +0 XP bonus
  - `normal`: 6 guesses, +25 XP bonus
  - `hard`: 5 guesses, +50 XP bonus
  - `expert`: 4 guesses, +100 XP bonus

---

### 2.3 Technical Bugs & Code Quality Findings

#### BUG-01: Hardcoded Turkish Alphabet in `useGame.ts` (Sweeper Hint)
- **File**: `hooks/useGame.ts` (Line 254)
- **Code Snippet**:
  ```ts
  254: const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  ```
- **Issue**: In `useGame.ts`, the `useSweeper` function removes incorrect keyboard letters. The alphabet array is hardcoded to Turkish letters regardless of the active language setting (`lang`). When playing in English (`lang: 'en'`), the sweeper picks from Turkish-specific letters (`Ç`, `Ğ`, `İ`, `Ö`, `Ş`, `Ü`), breaking the English sweeper feature.

#### BUG-02: Hardcoded Turkish Alphabet in `useDuel.ts` (Bot Opponent Guess Generation)
- **File**: `hooks/useDuel.ts` (Line 85)
- **Code Snippet**:
  ```ts
  85: const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  ```
- **Issue**: In AI Duel mode, the opponent bot generates random filler letters for guesses using a hardcoded Turkish alphabet array. When playing in English, the AI opponent generates Turkish characters (`Ğ`, `Ş`, `Ç`, etc.) on the opponent board.

#### BUG-03: Hardcoded Turkish Word Pool for Word Chain Mode Fallback
- **File**: `hooks/useWordChain.ts` (Lines 17, 80)
- **Code Snippet**:
  ```ts
  17: const START_WORDS = ALL_WORDS.map(w => w.toLocaleUpperCase('tr-TR').replace(/\s/g, ''));
  ...
  80: const isValid = dict ? dict.has(word) : START_WORDS.includes(word);
  ```
- **Issue**: `START_WORDS` statically references `ALL_WORDS` (Turkish word list). In English mode (`lang === 'en'`), the starting word generated is Turkish, and the fallback dictionary check validates against Turkish words.

#### BUG-04: Incorrect English Upper-Case Transformation in `useWordConnect.ts`
- **File**: `hooks/useWordConnect.ts` (Line 135)
- **Code Snippet**:
  ```ts
  135: const word = state.currentGuess.toUpperCase();
  ```
- **Issue**: `useWordConnect.ts` calls JavaScript standard `.toUpperCase()`. In Turkish, lowercase `i` becomes `I` instead of `İ`, breaking word validation for words containing `İ` (e.g. `KİLİS`, `BİTLİS`). `useDordle.ts` (line 99) and `useWordChain.ts` (line 45) correctly use `.toLocaleUpperCase(locale)`, but `useWordConnect.ts` lacks this locale-aware conversion.

#### BUG-05: Limited Hardcoded Levels in Word Connect Mode Loop
- **File**: `hooks/useWordConnect.ts` (Lines 31–75, Line 79)
- **Code Snippet**:
  ```ts
  79: const config = levels[levelIndex % levels.length];
  ```
- **Issue**: There are only 2 levels in `LEVELS_TR` and 2 in `LEVELS_EN`. On level 3, modulo wrapping silently resets the level puzzle back to level 1 without notifying the user or procedurally varying the layout.

#### BUG-06: Strict Target Match Bug in Anagram Mode
- **File**: `hooks/useAnagram.ts` (Line 70)
- **Code Snippet**:
  ```ts
  70: const result = state.currentGuess === state.targetWord ? 'correct' : 'wrong';
  ```
- **Issue**: `submitGuess` in Anagram mode only checks strict equality against `state.targetWord`. If a player enters a valid anagram dictionary word using the exact same scrambled letters (e.g. Target: `KALE`, Player guess: `LAKE`), the guess is incorrectly marked as `wrong`.

#### BUG-07: Potential Negative Time Elapsed Exploitation in `useGame.ts`
- **File**: `hooks/useGame.ts` (Lines 97–110)
- **Code Snippet**:
  ```ts
  97: const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
  ...
  102: if (elapsed < 0) { ... }
  ```
- **Observation**: `useGame.ts` guards against clock manipulation (`elapsed < 0`). However, `useBlitz.ts` (line 62–73) lacks this `elapsed < 0` check when returning from background state.

---

## 3. Caveats
- Audit was strictly read-only; no code files in `app/`, `components/`, `hooks/`, `services/`, `store/`, or `constants/` were modified.
- Network mode is `CODE_ONLY`. No live external Firebase or analytics endpoints were tested over the wire.

---

## 4. Conclusion
The GemQuest codebase has a solid modular React Native architecture with clean separation between Expo Router screens, Zustand stores, and game engine hooks. The core game modes, level progression, and category mechanisms are fully built out. However, several localized logic bugs affect multi-language support (Turkish vs. English alphabets, locale upper-casing, hardcoded Turkish word chain lists) and game logic validation (Anagram exact-match rule, Word Connect level repetition).

---

## 5. Verification Method

To verify the findings reported above:
1. **Hardcoded Alphabet in English Sweeper / Duel**:
   - Inspect `hooks/useGame.ts:254` and `hooks/useDuel.ts:85`. Note literal string `'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'`.
2. **WordConnect Upper-Casing**:
   - Inspect `hooks/useWordConnect.ts:135`. Note `.toUpperCase()` vs `.toLocaleUpperCase(locale)`.
3. **WordChain Word Pool**:
   - Inspect `hooks/useWordChain.ts:17`. Note static reference to `ALL_WORDS`.
4. **Anagram Strict Equivalence**:
   - Inspect `hooks/useAnagram.ts:70`. Note `state.currentGuess === state.targetWord`.
5. **Existing Jest Test Suite**:
   - Run `npm test` or `npx jest` to check current unit test coverage.
