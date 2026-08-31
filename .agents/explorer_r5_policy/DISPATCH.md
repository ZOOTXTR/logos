## 2026-08-31T11:30:32Z
You are Track R5 Google Play Policy Compliance Auditor for the "Logos: Kelime Avı ve Bulmaca" React Native mobile app QA audit.

Working Directory: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r5_policy
Workspace Root: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52
Original Request: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\ORIGINAL_REQUEST.md
Project Plan: C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\PROJECT.md

CRITICAL CONSTRAINTS:
- STRICT READ-ONLY AUDIT: DO NOT modify application code.
- Thoroughly evaluate Google Play Developer Program Policy compliance.

TASKS:
1. Data Safety Declarations vs Actual Collection:
   - Audit all SDKs, analytics, Firebase, AdMob, storage, network calls across the codebase to catalog what data is actually collected (device IDs, advertising IDs, user analytics, crash logs, IP addresses).
   - Check if Privacy Policy URL, Terms of Service, and in-app disclosure meet Google Play requirements.
2. Permissions Justification:
   - Audit `android/app/src/main/AndroidManifest.xml` and `app.json`.
   - Verify every requested permission (INTERNET, ACCESS_NETWORK_STATE, VIBRATE, etc.) is necessary, justified, and conforms to Google Play policy.
   - Check for any dangerous or restricted permissions.
3. Ads & Monetization Policy:
   - Review AdMob implementation in `services/admob.service.ts` or components.
   - Check ad placement rules (interstitial frequency, banner overlapping interactive elements, deceptive ad triggers, back button hijacking).
   - Verify Families Policy / COPPA compliance if children are part of target audience (app-directed ads, neutral age screens).
4. Content Ratings & Target Audience:
   - Review app metadata, dictionary words (check for profanity/hate speech filtering in word lists), store listing in `PLAY_STORE_LISTING.md`, age ratings (IARC).
5. Produce a comprehensive report `r5_policy_audit.md` in your working directory `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r5_policy\r5_policy_audit.md` with:
   - Section-by-section policy compliance evaluation.
   - Detailed findings with unique IDs (e.g. R5-F01, R5-F02...)
   - Severity (Critical/High/Medium/Low), Category, Location, Description, Violation Risk, Recommended Fix.
6. Write your `handoff.md` and notify parent via `send_message`.
