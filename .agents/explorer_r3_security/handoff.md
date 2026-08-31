# Handoff Report — Track R3 Security & Anti-Cheat Audit

**Agent**: Track R3 Security & Anti-Cheat Auditor  
**Date**: 2026-08-31  
**Status**: Hard Handoff (Task Complete)  
**Report Artifact**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r3_security\r3_security_audit.md`

---

## 1. Observation

Direct code and configuration observations from the codebase:

- **IAP Bypass in Catch Block**:
  `components/StoreModal.tsx:179-183`:
  ```typescript
  try {
    await requestPurchase({ sku: pkg.id });
  } catch {
    try {
      await onPurchase(pkg.id, pkg.gems);
      showCustomAlert('✅', language === 'en' ? 'Purchase Successful!' : 'Satın alma başarılı!');
    } catch { ... }
  }
  ```
  `components/StoreModal.tsx:201-205`:
  ```typescript
  try {
    await requestSubscription({ sku: PRODUCT_IDS.PREMIUM_MONTHLY });
  } catch {
    try {
      await onPurchasePremium();
      showCustomAlert('✅', language === 'en' ? 'Premium activated!' : 'Premium başarıyla aktifleştirildi!');
    } catch { ... }
  }
  ```

- **Hardcoded Keystore Credentials**:
  `android/app/build.gradle:105-110`:
  ```groovy
  release {
      storeFile file('release.keystore')
      storePassword 'logospassword'
      keyAlias 'logos-key-alias'
      keyPassword 'logospassword'
  }
  ```
  `android/app/release.keystore` binary file present on disk in project tree.

- **Unencrypted AsyncStorage & Android Backup Flag**:
  `services/storage.service.ts:17-29, 67-88`: Plaintext storage keys `gq_gems`, `gq_premium`, `gq_xp`, `gq_stats`, `gq_achievements`.
  `android/app/src/main/AndroidManifest.xml:15`: `android:allowBackup="true"`.

- **Passwordless Email Linking / Account Takeover**:
  `hooks/useCloudSync.ts:23-40`: `handleLinkAccount(email)` accepts arbitrary email without password/token/OTP and saves to `gq_user_email`.
  `services/cloud.service.ts:72-135`: `syncStorageToCloud(email)` and `restoreStorageFromCloud(email)` read/write cloud state by raw email identifier.

- **Client-Authoritative Leaderboard Score Submission**:
  `services/leaderboard.service.ts:22-34`: `points = calculateScore(entry)` calculated entirely on client and submitted directly to `scores` collection.
  `firestore.rules:16-24`: Allows client creation of scores up to 5000 with no server-side proof of play, move replay, or rate limiting.

- **Firestore Rules Inconsistencies**:
  `firestore.rules:10-13`: `match /cloud_saves/{userId}` lacks schema validation on `gems` and `isPremium`.
  `firestore.rules:33-35`: Default deny blocks `/referrals/` writes in `services/referral.service.ts:53-62`.

---

## 2. Logic Chain

1. **IAP Exploit (R3-F01)**: When `requestPurchase` or `requestSubscription` encounters an error or cancellation, execution shifts to the `catch` block. The catch block invokes `onPurchase(...)` / `onPurchasePremium()`, immediately mutating AsyncStorage state to grant gems and premium for free.
2. **Key Compromise (R3-F02)**: Storing the signing keystore and plaintext passwords in the repository allows anyone with codebase access to sign unauthorized APKs with the official developer identity.
3. **No-Root Economy Modification (R3-F03)**: `android:allowBackup="true"` allows ADB to back up app data (`/data/data/com.zovtex.logos`). Because `storage.service.ts` uses plaintext integers in SQLite/AsyncStorage, extracting `backup.ab`, modifying `gq_gems`, and running `adb restore` requires zero root privileges.
4. **Account Takeover (R3-F04)**: `useCloudSync.ts` binds cloud save documents to whatever email is entered without authentication. Calling `restoreStorageFromCloud` with a victim's email retrieves their data and overwrites local state.
5. **Leaderboard Spoofing (R3-F05, R3-F08)**: Direct Firestore writes with client-calculated points allow bots to register anonymous accounts and flood the top 50 leaderboard with max scores (5,000 pts).

---

## 3. Caveats

- Static analysis was performed based on source code and configuration files. Live Firestore backend rules deployment status was evaluated from the local `firestore.rules` file in repository root.
- In-app purchase backend server (Google Play Developer API / App Store Server API) is not currently implemented in this repository; all IAP handling currently resides purely on the client side.

---

## 4. Conclusion

The application exhibits critical security gaps that must be resolved prior to production launch:
- **Blockers**: R3-F01 (IAP free fulfillment on error), R3-F02 (Hardcoded release keystore credentials), R3-F03 (`allowBackup="true"` and unencrypted storage), and R3-F04 (Passwordless email linking).
- **High Priorities**: R3-F05 & R3-F08 (Leaderboard integrity), R3-F06 & R3-F07 (Firestore rules gaps).
- A complete remediation plan and CVSS breakdown are documented in `r3_security_audit.md`.

---

## 5. Verification Method

To verify these findings independently:

1. **Verify IAP Catch Bypass (R3-F01)**:
   - Inspect `components/StoreModal.tsx` lines 174–192 and 196–215. Observe `await onPurchase(...)` inside `catch`.
2. **Verify Hardcoded Keystore (R3-F02)**:
   - Inspect `android/app/build.gradle` lines 105–110. Observe `'logospassword'`.
3. **Verify ADB Backup Flag (R3-F03)**:
   - Inspect `android/app/src/main/AndroidManifest.xml` line 15. Observe `android:allowBackup="true"`.
4. **Verify Passwordless Account Takeover (R3-F04)**:
   - Inspect `hooks/useCloudSync.ts` lines 23–40 and `services/cloud.service.ts` lines 72–135.
5. **Verify Firestore Rule Gaps (R3-F06, R3-F07)**:
   - Inspect `firestore.rules` and trace collections used in `services/referral.service.ts` and `services/cloud.service.ts`.
