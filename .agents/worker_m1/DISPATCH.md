## 2026-08-29T09:17:48Z
You are worker_m1 (API Compliance & Hygiene Worker).
Your working directory is: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\worker_m1
Project root is: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52
Original request file: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\ORIGINAL_REQUEST.md
Project scope file: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\PROJECT.md
Survey reports:
- C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_survey_1\survey_codebase.md
- C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_survey_2\survey_android_build.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Milestone 1 (API Level, Dependency & Permission Compliance):
1. Read `ORIGINAL_REQUEST.md`, `PROJECT.md`, and the survey reports.
2. Edit `android/app/src/main/AndroidManifest.xml`:
   - Remove unused and risky permissions: `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`.
   - Ensure the manifest remains clean, valid XML with essential permissions only (`INTERNET`, `MODIFY_AUDIO_SETTINGS`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `com.android.vending.BILLING`).
3. Clean up `package.json`:
   - Move `"puppeteer-core"` to `devDependencies`.
   - Remove orphan file `expo-in-app-purchases-14.0.0.tgz` from project root if present.
   - Fix deprecated `Clipboard` imports in `app/dordle.tsx` and `services/share.service.ts` (use `@react-native-clipboard/clipboard` or safe clipboard fallback).
4. Fix all TypeScript compilation errors (`npx tsc --noEmit`):
   - In `store/progressStore.ts`: add `rewardGems?: number; rewardXP?: number;` to the `Achievement` interface or align properties.
   - In `components/LeaderboardModal.tsx`: ensure `getTopScores` typing/calls align with `cloud.service.ts`.
   - In `components/design/`: ensure font token mappings in `Typography.tsx` or `theme.ts` match the font constants (`FONTS.bold`, `FONTS.medium`, `FONTS.regular`, etc.).
5. Fix `components/Keyboard.tsx`:
   - Provide proper layout for English (`en`): full standard QWERTY rows (including Q, W, X, and standard English row distributions).
   - Retain Turkish (`tr`) layout with Turkish special characters.
6. Verification:
   - Run `npx tsc --noEmit` and confirm 0 errors.
   - Run `npm test` and confirm all test suites pass.
7. Write your changes and verification results to `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\worker_m1\handoff.md` and update `progress.md`.
8. Send a message to parent notifying completion.
