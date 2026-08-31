# Codebase & Architecture Survey Report: "Logos" (GemQuest)

**Author**: `explorer_survey_1` (Codebase & Architecture Surveyor)  
**Date**: 2026-08-29  
**Target Codebase**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52`  
**Target OS**: Android 14/15 (API 34/35) & iOS  
**Framework**: React Native 0.76.9 / Expo SDK 52.0.46 / Expo Router v4  

---

## 1. Executive Summary & Tech Stack Overview

"Logos: Kelime Avı ve Bulmaca" (codename GemQuest) is a full-featured word puzzle platform built using Expo SDK 52 and React Native 0.76. The application includes 8 gameplay modes (Classic Wordle, Daily Challenge, Speed/Blitz, Anagram, Word Chain, Dordle, Word Connect / Crossword, and 1v1 AI Duel), an economy system (Gems, XP, Level progression), sticker collection album, themes, offline local storage, cloud backup via Firebase Firestore, and in-app purchases (`react-native-iap`).

### Core Technology Stack

| Layer | Technology | Version | Location / Config |
|---|---|---|---|
| **Runtime Framework** | Expo SDK | `~52.0.46` (`52.0.49` installed) | `package.json:9`, `app.json` |
| **Mobile Core** | React Native | `0.76.9` | `package.json:23` |
| **UI Library** | React | `18.3.1` | `package.json:21` |
| **Navigation** | Expo Router | `~4.0.20` (`4.0.22` installed) | `app/_layout.tsx`, `app/(tabs)/` |
| **Global State** | Zustand | `^5.0.14` | `store/progressStore.ts`, `store/settingsStore.ts` |
| **Local Persistence** | AsyncStorage | `^1.23.1` | `services/storage.service.ts` |
| **Animations** | Reanimated / RN Animated | `~3.16.7` | `components/AnimatedCell.tsx`, `Confetti.tsx` |
| **Vector Graphics** | React Native SVG | `15.8.0` | `package.json:29`, `components/` |
| **Audio / Haptics** | Expo AV / Expo Haptics | `~15.0.2` / `~14.0.1` | `services/audio.service.ts` |
| **Notifications** | Expo Notifications | `~0.29.14` | `services/notification.service.ts` |
| **In-App Purchases** | React Native IAP | `^12.16.4` | `services/iap.service.ts` |
| **Backend & Cloud** | Firebase JS SDK | `^10.14.1` | `config/firebase.ts`, `services/cloud.service.ts` |
| **Android Build** | Gradle / AGP / Kotlin | Gradle 8.8 / AGP 8.2+ / Kotlin 1.9.25 | `android/build.gradle`, `android/gradle.properties` |

---

## 2. Project Architecture & Entry Points

### 2.1 Navigation & Screen Routing (`app/`)

The routing layer uses Expo Router v4 with file-based routing:

```
app/
├── _layout.tsx               # Root Layout: ThemeProvider, ErrorBoundary, Notification/Audio init
├── (tabs)/                   # 5 Tab Navigation Screens
│   ├── _layout.tsx           # Tab bar styling & tab definitions
│   ├── index.tsx             # Main Game Hub: switches between GameMenuScreen and GamePlayScreen
│   ├── modes.tsx             # Game Mode Selection Grid
│   ├── leaderboard.tsx       # Local & Global Firestore Leaderboards
│   ├── settings.tsx          # Settings, Themes, Audio toggles, Legal & Feedback modals
│   └── profile.tsx           # Player Stats, Level, XP, Stickers, Achievements, Cloud Sync
├── anagram.tsx               # Anagram Unscramble Mode Screen
├── blitz.tsx                 # 60s Speed/Blitz Mode Screen
├── chain.tsx                 # Word Chain Marathon Mode Screen
├── dordle.tsx                # Dordle (Dual Wordle) Mode Screen
├── duel.tsx                  # 1v1 AI Opponent Duel Mode Screen
├── wordconnect.tsx           # Word Connect / Crossword Wheel Mode Screen
└── onboarding.tsx            # First-Launch Tutorial & Onboarding Screen
```

#### Entry Point Lifecycle Flow (`app/_layout.tsx`):
1. `initErrorReporting()` initializes Sentry.
2. `notificationService.registerForPushNotificationsAsync()` checks `notifEnabled` and sets Android notification channels.
3. `notificationService.scheduleDailyNotifications(language)` sets calendar reminders for 10:00 (daily word) and 20:00 (streak protection).
4. `setupDeepLinkHandler()` captures referral/invite deep links.
5. `audioService.startBgMusic()` initializes background audio.
6. `preloadDictionaries()` asynchronously loads `constants/validation_dictionary.ts`.

---

## 3. Detailed Component & Subsystem Map

### 3.1 Gameplay Screens & Logic Hook Engines

| Game Mode | UI Entry Point | State Machine Hook Engine | Primary Game Loop & Validation |
|---|---|---|---|
| **Classic Wordle** | `app/(tabs)/index.tsx` → `screens/GamePlayScreen.tsx` | `hooks/useGame.ts` | 5-letter (or 4-6 letter dynamic) guess grid. Difficulty allows 4-7 attempts. Dictionary validation via `services/dictionary.service.ts`. |
| **Daily Challenge** | `app/(tabs)/index.tsx` (mode='daily') | `hooks/useGame.ts` | Deterministic daily word seeded from calendar date (`constants/words.ts:118`). Awards +100 Gems. |
| **Speed / Blitz** | `app/blitz.tsx` | `hooks/useBlitz.ts` | 60-second timer countdown. Correct word gives +5s bonus and multiplier streak. |
| **Anagram** | `app/anagram.tsx` | `hooks/useAnagram.ts` | Scrambled letters selection into target word slots. 5 attempts limit. |
| **Word Chain** | `app/chain.tsx` | `hooks/useWordChain.ts` | Successive words chained by the last letter of previous word. 3 lives. |
| **Dordle (Dual)** | `app/dordle.tsx` | `hooks/useDordle.ts` | Simultaneous 2-board solver. 7 maximum attempts. |
| **Word Connect** | `app/wordconnect.tsx` | `hooks/useWordConnect.ts` | Circular letter wheel gesture drag (SVG path) connecting letters to populate crossword layout. |
| **1v1 AI Duel** | `app/duel.tsx` | `hooks/useDuel.ts` | Real-time race against simulated AI bot with dynamic chat bubbles and adaptive difficulty. |

### 3.2 UI Components Inventory (`components/`)

The application contains 51 component files categorized as follows:
- **Core Game Board & Cells**: `GameBoard.tsx`, `AnimatedCell.tsx`, `Keyboard.tsx`
- **Game Feedback & Overlays**: `GameResultOverlay.tsx`, `GameEndCertificate.tsx`, `CustomAlert.tsx`, `AchievementToast.tsx`, `DefinitionCard.tsx`, `WordDefinitionModal.tsx`, `Confetti.tsx`, `GemShower.tsx`
- **Store & Economy**: `StoreModal.tsx`, `StoreGemPackCard.tsx`, `StorePremiumCard.tsx`, `StorePackList.tsx`, `StoreRestoreButton.tsx`, `DailySpinModal.tsx`, `SpinWheel.tsx`, `SpinWheelCanvas.tsx`, `StickerAlbumModal.tsx`, `StickerFlipCard.tsx`, `StickerGridCard.tsx`
- **Player Stats & Progression**: `LevelBar.tsx`, `StreakBanner.tsx`, `Timer.tsx`, `ScoreRow.tsx`, `ProfileStatsCard.tsx`, `ProfileAchievementList.tsx`, `GuessDistributionChart.tsx`, `TimeHistoryChart.tsx`
- **Cloud, Auth & Social**: `CloudSyncModal.tsx`, `CloudLoginForm.tsx`, `CloudSyncStatus.tsx`, `FeedbackModal.tsx`, `FeedbackForm.tsx`, `FeedbackTypeSelector.tsx`, `InviteModal.tsx`, `AboutModal.tsx`, `PrivacyPolicyModal.tsx`, `HelpModal.tsx`, `HintModal.tsx`, `HintOptionCard.tsx`, `ModeCard.tsx`, `ModeSelector.tsx`, `SettingToggle.tsx`, `FilterChips.tsx`, `ErrorBoundary.tsx`, `LoadingView.tsx`

---

## 4. State Management, Data Layer & Dictionaries

### 4.1 Global State Architecture (Zustand)

1. **`store/progressStore.ts`**:
   - Manages: `gems`, `premium`, `xp`, `levelInfo`, `streak` (`current`, `max`), `unlockedAchievements`, `unlockedCategories`, `dailyDone`, `newAchievement`.
   - Hydration: Reads atomic values from `services/storage.service.ts` at app startup.
   - Operations: `addGems`, `spendGems`, `earnXP`, `unlockPremium`, `unlockCategory`, `recordWin`, `recordLoss`.

2. **`store/settingsStore.ts` & `hooks/useTheme.tsx`**:
   - Manages: `themeId` (7 themes: Dark, Light, Neon, Nature, Fire, Ocean, Crystal), `unlockedThemes`, `colorBlind`, `soundEnabled`, `hapticEnabled`, `notifEnabled`, `language` (`'tr' | 'en'`), `dyslexiaFont`, `systemKeyboard`.

### 4.2 Word Databases & Validation Sets

- **Target Word Banks**:
  - `constants/words.ts`: 7 Turkish categories (`random`, `hayvanlar`, `sehirler`, `yiyecek`, `meslekler`, `doga`, `spor`).
  - `constants/words_en.ts`: English word banks.
- **Validation Dictionaries**:
  - `constants/validation_dictionary.ts`: 753 KB file with 65,247 lines generating two `Set<string>` instances (`VALIDATION_DICT_TR` and `VALIDATION_DICT_EN`).
  - `services/dictionary.service.ts`: Lazy imports `validation_dictionary.ts` via dynamic `import()` and exposes `getDictionary(lang)`.

---

## 5. Dependency & Android 14/15 (SDK 34/35) Compliance Audit

### 5.1 Android SDK & Build Configuration

| Setting | Configured Value | Compliance Status | Details |
|---|---|---|---|
| `compileSdkVersion` | `35` | ✅ Compliant | `android/build.gradle:7` and `android/app/build.gradle:87` |
| `targetSdkVersion` | `35` | ✅ Compliant | Meets Google Play requirement (Target API 34+ mandatory for 2024/2025/2026) |
| `minSdkVersion` | `24` | ✅ Compliant | Supports Android 7.0+ (98%+ active devices) |
| `buildToolsVersion`| `35.0.0` | ✅ Compliant | Matches SDK 35 build tools |
| `kotlinVersion` | `1.9.25` | ✅ Compliant | Compatible with Expo 52 & RN 0.76 |
| `hermesEnabled` | `true` | ✅ Compliant | Hermes JS engine enabled with 16KB page support |

### 5.2 Android Permissions Compliance Findings

Inspecting `android/app/src/main/AndroidManifest.xml` vs `app.json`:

```xml
<!-- AndroidManifest.xml lines 2-11 -->
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>       <!-- ⚠️ VIOLATION -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>               <!-- ⚠️ CRITICAL VIOLATION -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>        <!-- ⚠️ CRITICAL VIOLATION -->
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>      <!-- ⚠️ VIOLATION -->
<uses-permission android:name="com.android.vending.BILLING"/>
```

**Permission Violations & Risks for Android 14/15 & Play Store**:
1. **`READ_EXTERNAL_STORAGE` & `WRITE_EXTERNAL_STORAGE`**: Deprecated in Android 13+ (API 33+) and strictly blocked by Google Play Data Minimization policy for apps without explicit file management functionality. The app uses AsyncStorage and does not perform external file I/O.
2. **`RECORD_AUDIO`**: High-risk sensitive permission. Google Play will flag or reject the app if it declares microphone permissions without providing an in-app voice recording feature. The app only plays audio.
3. **`SYSTEM_ALERT_WINDOW`**: Overlay permission flagged by Google Play security scanners as potential malware/tapjacking vector unless specifically justified. Game modals are purely in-app React Native views.

### 5.3 Outdated, Conflicting & Misplaced NPM Packages

1. **`puppeteer-core` (`^25.3.0`) in `dependencies`**:
   - Location: `package.json:20`
   - Issue: Listed in production dependencies. Puppeteer is only used for dev test automation (`test_automation.js`).
   - Fix: Move to `devDependencies`.

2. **Deprecated `expo-in-app-purchases-14.0.0.tgz`**:
   - Location: Project root `expo-in-app-purchases-14.0.0.tgz`
   - Issue: Orphaned package archive. Expo deprecated `expo-in-app-purchases` in favor of `react-native-iap`. The app already uses `react-native-iap` `12.16.4`.
   - Fix: Remove the `.tgz` file.

3. **Deprecated React Native `Clipboard` Import**:
   - Location: `app/dordle.tsx:4, 96` and `services/share.service.ts:1, 40`
   - Issue: `import { Clipboard } from 'react-native'` is deprecated and removed in modern React Native.
   - Fix: Use `expo-clipboard` or browser fallback.

4. **Bloated Patches (`patches/`)**:
   - Location: `patches/expo-modules-core+2.2.3.patch` (2.3 MB) and `patches/react-native-reanimated+3.16.7.patch` (4.3 MB)
   - Issue: Contain CMake `.cxx` build artifacts accidentally captured during `patch-package`.
   - Fix: Clean patches to only include actual source diffs.

---

## 6. TypeScript Compilation & Static Analysis Errors

Running `tsc --noEmit` uncovered 10 compilation errors across the codebase:

| File | Line | Error Code | Description |
|---|---|---|---|
| `components/design/AppButton.tsx` | 80 | `TS2339` | Property `'extrabold'` does not exist on `FONTS` |
| `components/design/GemPill.tsx` | 42 | `TS2339` | Property `'extrabold'` does not exist on `FONTS` |
| `components/design/PlayerCard.tsx` | 150 | `TS2339` | Property `'displayMedium'` does not exist on `FONTS` |
| `components/design/PlayerCard.tsx` | 184 | `TS2339` | Property `'semibold'` does not exist on `FONTS` |
| `components/design/ScreenHeader.tsx` | 52 | `TS2339` | Property `'display'` does not exist on `FONTS` |
| `components/design/SectionTitle.tsx` | 36 | `TS2339` | Property `'extrabold'` does not exist on `FONTS` |
| `components/LeaderboardModal.tsx` | 19 | `TS2339` | Property `'getTopScores'` does not exist on `CloudService` |
| `components/LeaderboardModal.tsx` | 19 | `TS7006` | Parameter `'data'` implicitly has an `'any'` type |
| `store/progressStore.ts` | 222 | `TS2339` | Property `'rewardGems'` does not exist on type `'Achievement'` |
| `store/progressStore.ts` | 223 | `TS2339` | Property `'rewardXP'` does not exist on type `'Achievement'` |

*Note: Files in `components/design/` and `components/LeaderboardModal.tsx` are orphaned/unused components.*

---

## 7. Performance & Memory Hotspots

### 7.1 Remote Audio Streaming Per Keypress
- **Location**: `services/audio.service.ts:7-12, 75-92`
- **Issue**: `audioService.play('click')` is executed on every letter press. It currently calls `Audio.Sound.createAsync({ uri: 'https://assets.mixkit.co/...' })`, creating a network request and new audio instance per keystroke.
- **Impact**: Severe audio latency, high memory allocations, potential memory leaks if unloader callbacks lag, and zero audio when offline.
- **Remedy**: Switch to local bundled assets (`assets/audio/click.wav`, `assets/audio/win.wav`, `assets/audio/loss.wav`, `assets/audio/bg_music.wav`) and preload sound objects into a reusable pool.

### 7.2 Dictionary Heap Allocation
- **Location**: `constants/validation_dictionary.ts` & `services/dictionary.service.ts`
- **Issue**: Instantiates ~65,000 strings into two JS `Set` objects on app startup (~10-15 MB RAM overhead).
- **Remedy**: Maintain in compressed lookup format or load on-demand when user enters game modes.

### 7.3 Release Build Optimization (ProGuard / R8)
- **Location**: `android/gradle.properties` & `android/app/build.gradle:118-122`
- **Issue**: `android.enableProguardInReleaseBuilds` and `android.enableShrinkResourcesInReleaseBuilds` are disabled by default.
- **Remedy**: Enable ProGuard/R8 shrinking to reduce `.aab` package size by 30-50% and strip dead code.

---

## 8. Summary of Actionable Architectural Findings

1. **Android Permission Cleanup**: Remove `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW` from `AndroidManifest.xml` and align with `app.json`.
2. **Local Audio Integration**: Refactor `services/audio.service.ts` to utilize bundled `assets/audio/*.wav` instead of remote URLs.
3. **English Mode Keyboard Fix**: Update `components/Keyboard.tsx` to support English QWERTY (including `Q`, `W`, `X`) when `language === 'en'`.
4. **Clean Dependencies & Patches**: Move `puppeteer-core` to `devDependencies`, delete `expo-in-app-purchases-14.0.0.tgz`, replace deprecated `Clipboard` imports with `expo-clipboard`, and prune CMake cache from patches.
5. **Fix TypeScript Errors**: Resolve font property and interface discrepancies in `store/progressStore.ts` and clean/fix orphaned design components.
6. **Enable Release Shrinking**: Configure `android.enableProguardInReleaseBuilds=true` and `android.enableShrinkResourcesInReleaseBuilds=true` in `gradle.properties`.
