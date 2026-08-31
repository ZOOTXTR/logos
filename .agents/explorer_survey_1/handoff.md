# Handoff Report — Codebase & Architecture Survey

**Agent**: `explorer_survey_1` (Codebase & Architecture Surveyor)  
**Date**: 2026-08-29  
**Recipient**: `parent` (ee549270-e616-4f01-8fe7-680ae6976255)  
**Detailed Report**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_survey_1\survey_codebase.md`  

---

## 1. Observation

1. **Framework & Target SDK Configuration**:
   - `package.json:9, 21, 23`: `expo` is `"~52.0.46"` (`52.0.49` installed), `react` is `"18.3.1"`, `react-native` is `"0.76.9"`.
   - `android/build.gradle:7-8`: `compileSdkVersion = 35`, `targetSdkVersion = 35`, `buildToolsVersion = '35.0.0'`, `kotlinVersion = '1.9.25'`.
   - `android/app/build.gradle:87, 94`: references rootProject SDK versions 35.
   - `app.json:28-29`: `"versionCode": 2`, `"targetSdkVersion": 35`.
2. **Android Permissions (`android/app/src/main/AndroidManifest.xml:2-11`)**:
   - `android.permission.READ_EXTERNAL_STORAGE` (Line 5)
   - `android.permission.RECORD_AUDIO` (Line 7)
   - `android.permission.SYSTEM_ALERT_WINDOW` (Line 8)
   - `android.permission.WRITE_EXTERNAL_STORAGE` (Line 10)
   - `app.json:30-35` only lists `["VIBRATE", "RECEIVE_BOOT_COMPLETED", "POST_NOTIFICATIONS", "com.android.vending.BILLING"]`.
3. **NPM Dependencies & Deprecations**:
   - `package.json:20`: `"puppeteer-core": "^25.3.0"` in `dependencies` rather than `devDependencies`.
   - `expo-in-app-purchases-14.0.0.tgz` exists in the root directory (deprecated package archive).
   - `app/dordle.tsx:4, 96` and `services/share.service.ts:1, 40`: `import { Clipboard } from 'react-native'` (deprecated/removed in RN core).
   - `patches/expo-modules-core+2.2.3.patch` (2.3 MB) and `patches/react-native-reanimated+3.16.7.patch` (4.3 MB) include `.cxx` CMake build cache artifacts.
4. **TypeScript Errors via `npx tsc --noEmit`**:
   - 10 errors detected: 6 in `components/design/*.tsx` (`extrabold`, `displayMedium`, `semibold`, `display` missing on `FONTS`), 2 in `components/LeaderboardModal.tsx` (`getTopScores`), 2 in `store/progressStore.ts:222-223` (`rewardGems`, `rewardXP` missing on `Achievement` interface).
5. **Audio & Asset Loading Hotspot**:
   - `services/audio.service.ts:7-12`: `click`, `win`, `loss`, `bgMusic` use remote HTTP URLs (`https://assets.mixkit.co/...`). Local wav files already exist in `assets/audio/` (`bg_music.wav`, `click.wav`, `loss.wav`, `win.wav`).
6. **Keyboard Layout Localization**:
   - `components/Keyboard.tsx:15-19`: `KEYBOARD_ROWS` hardcoded to Turkish layout; letters `Q`, `W`, `X` are completely missing when playing in English mode.

---

## 2. Logic Chain

1. **SDK 34/35 Compliance Logic**:
   - *Premise*: Google Play requires target SDK 34+ and enforces strict data minimization on Android 13+ (API 33) and 14/15 (API 34/35).
   - *Observation*: `AndroidManifest.xml` requests `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, and `SYSTEM_ALERT_WINDOW`.
   - *Deduction*: The app is a self-contained word game using `AsyncStorage` and audio playback. Requesting storage and microphone access violates Play Store privacy guidelines and will trigger app rejection or permission audit flags. Purging these unneeded permissions aligns native manifests with `app.json`.
2. **Audio & Memory Performance Logic**:
   - *Observation*: `audioService.play('click')` is executed on every keyboard stroke and requests a remote Mixkit URL over HTTP.
   - *Deduction*: Network requests per keystroke cause audio latency, intermittent failure in offline mode, and unnecessary memory allocations. Swapping to bundled local assets (`assets/audio/*.wav`) with an audio pool completely resolves latency and offline issues.
3. **Release Packaging & Dependency Hygiene Logic**:
   - *Observation*: `puppeteer-core` is in runtime dependencies; `expo-in-app-purchases` tarball is orphaned; `android.enableProguardInReleaseBuilds` is false in gradle properties.
   - *Deduction*: Moving test tools to devDependencies, removing the orphan `.tgz`, and enabling ProGuard/R8 in `gradle.properties` will optimize `.aab` output and prevent binary bloat.

---

## 3. Caveats

- Native Android Gradle builds (`gradlew bundleRelease`) were not executed in this exploration phase to preserve read-only constraints.
- Firestore credentials and Sentry DSN rely on environment variables (`.env`). Local offline fallbacks in `services/cloud.service.ts` allow offline execution.

---

## 4. Conclusion

The application architecture is well-structured around Expo SDK 52 and Expo Router 4 with 8 fully developed game modes.
The primary requirements for Android 14/15 readiness and optimization are:
1. Purge obsolete permissions (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`) from `AndroidManifest.xml`.
2. Refactor `services/audio.service.ts` to use local `assets/audio/` files.
3. Add English QWERTY keyboard support (with `Q`, `W`, `X`) in `components/Keyboard.tsx`.
4. Fix TypeScript errors in `store/progressStore.ts` and clean up `components/design/` / `components/LeaderboardModal.tsx`.
5. Clean dependencies (`puppeteer-core` to `devDependencies`, remove orphan `.tgz`, replace deprecated `Clipboard`).
6. Enable R8/ProGuard in `android/gradle.properties` for production release bundling.

---

## 5. Verification Method

1. **TypeScript Verification**:
   ```bash
   npx tsc --noEmit
   ```
2. **Unit Test Suite Execution**:
   ```bash
   npm test
   ```
3. **Dependency & Permission Inspection**:
   - Inspect `android/app/src/main/AndroidManifest.xml` to verify non-essential permissions are removed.
   - Verify `package.json` reflects clean separation of runtime vs dev dependencies.
