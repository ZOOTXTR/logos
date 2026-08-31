# Handoff Report — Milestone 1: API Compliance, Dependency & Permission Hygiene

**Agent**: `worker_m1` (API Compliance & Hygiene Worker)  
**Date**: 2026-08-29  
**Handoff Type**: Hard (Milestone 1 Complete)

---

## 1. Observation

Direct observations and findings prior to and after changes:
1. **Manifest Permissions**:
   - `android/app/src/main/AndroidManifest.xml` previously declared `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, and `WRITE_EXTERNAL_STORAGE`.
   - On Android 14/15 (API 34/35) and Google Play policy, `RECORD_AUDIO` is a sensitive permission unsupported by the app's audio playback use case; `SYSTEM_ALERT_WINDOW` is dangerous in release (already present in `src/debug/AndroidManifest.xml`); storage permissions are deprecated and forbidden without core file management.
2. **Dependencies & Orphan Packages**:
   - `package.json:20` placed `"puppeteer-core": "^25.3.0"` in `dependencies` instead of `devDependencies`.
   - `expo-in-app-purchases-14.0.0.tgz` was present as an orphan binary tarball at the project root (`C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\expo-in-app-purchases-14.0.0.tgz`).
   - Deprecated `import { Clipboard } from 'react-native'` was imported in `app/dordle.tsx:4` and `services/share.service.ts:1`.
3. **TypeScript Errors (`npx tsc --noEmit`)**:
   - `components/design/AppButton.tsx(80,23)`: Property `'extrabold'` does not exist on `FONTS`.
   - `components/design/GemPill.tsx(42,23)`: Property `'extrabold'` does not exist on `FONTS`.
   - `components/design/PlayerCard.tsx(150,23)`: Property `'displayMedium'` does not exist on `FONTS`.
   - `components/design/PlayerCard.tsx(184,36)`: Property `'semibold'` does not exist on `FONTS`.
   - `components/design/ScreenHeader.tsx(52,23)`: Property `'display'` does not exist on `FONTS`.
   - `components/design/SectionTitle.tsx(36,23)`: Property `'extrabold'` does not exist on `FONTS`.
   - `components/LeaderboardModal.tsx(19,20)`: Property `'getTopScores'` does not exist on type `'CloudService'`.
   - `components/LeaderboardModal.tsx(19,40)`: Parameter `'data'` implicitly has an `'any'` type.
   - `store/progressStore.ts(222,27)`: Property `'rewardGems'` does not exist on type `'Achievement'`.
   - `store/progressStore.ts(223,25)`: Property `'rewardXP'` does not exist on type `'Achievement'`.
4. **Keyboard Component**:
   - `components/Keyboard.tsx` hardcoded `KEYBOARD_ROWS` to Turkish only, omitting English letters (`Q`, `W`, `X`) when playing in English mode.

---

## 2. Logic Chain

1. **Manifest Sanitization**:
   - Removed `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, and `WRITE_EXTERNAL_STORAGE` from `android/app/src/main/AndroidManifest.xml`.
   - Retained only 6 essential permissions: `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, and `com.android.vending.BILLING`.
   - `src/debug/AndroidManifest.xml` already maintains `SYSTEM_ALERT_WINDOW` for React Native debug tooling.
2. **Dependency & Clean-up**:
   - Moved `puppeteer-core` from `dependencies` to `devDependencies` in `package.json`.
   - Deleted root file `expo-in-app-purchases-14.0.0.tgz`.
   - Removed deprecated `Clipboard` imports from `app/dordle.tsx` and `services/share.service.ts`, implementing safe fallback checks (`navigator.clipboard` on web, `Share.share` with safe error catching).
3. **TypeScript Resolution**:
   - In `constants/achievements.ts`: Added optional `rewardGems?: number; rewardXP?: number;` to the `Achievement` interface.
   - In `services/cloud.service.ts`: Added `CloudScoreEntry` interface, implemented `submitScore(score, mode, category)` and `getTopScores(limitCount)` with Firestore query and fallback.
   - In `components/LeaderboardModal.tsx`: Typed `scores` state as `CloudScoreEntry[]` and aligned calls to `cloudService.getTopScores()`.
   - In `constants/theme.ts`: Added `medium`, `semibold`, `extrabold`, `display`, and `displayMedium` font constant mappings.
4. **Bilingual Keyboard**:
   - In `components/Keyboard.tsx`: Implemented `KEYBOARD_ROWS_TR` and `KEYBOARD_ROWS_EN` (`Q`, `W`, `E`, `R`, `T`, `Y`, `U`, `I`, `O`, `P` / `A`, `S`, `D`, `F`, `G`, `H`, `J`, `K`, `L` / `ENTER`, `Z`, `X`, `C`, `V`, `B`, `N`, `M`, `DEL`).
   - Dynamically resolves language from prop or `useTheme()` context with safe fallback.
   - Updated action handlers to support `ENTER`/`DEL` alongside `GÖNDER`/`SİL`.
   - Extended `__tests__/Keyboard.test.tsx` to verify English QWERTY rendering and key press interactions.

---

## 3. Caveats

- Native compilation (`bundleRelease`) requires JDK 21 (`C:\Users\mhmto\.jdks\jbr-21.0.11`) and ProGuard rules configuration, which is scheduled for Milestone 3.
- Performance memory profiling and audio asset bundling will be addressed in Milestone 2.

---

## 4. Conclusion

All Milestone 1 objectives are fully completed and validated:
- Android manifest is clean, compliant with Android 15 / API 35 Google Play policies.
- Package dependencies are clean; deprecated Clipboard imports and orphan archives are eliminated.
- TypeScript compiler passes with **0 errors** (`npx tsc --noEmit`).
- All test suites pass with **100% success** (3 suites, 19 tests).

---

## 5. Verification Method

To independently verify:

1. **TypeScript Typecheck**:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected result*: Exits with code 0 and no output errors.

2. **Unit Test Suite**:
   ```powershell
   npm test
   ```
   *Expected result*: All 3 test suites pass (19 tests).

3. **Manifest Inspection**:
   Inspect `android/app/src/main/AndroidManifest.xml` to verify only the 6 required permissions are declared.
