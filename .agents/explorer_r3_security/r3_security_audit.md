# Logos: Kelime Avı ve Bulmaca — Security & Anti-Cheat QA Audit Report (Track R3)

**Audit Date**: 2026-08-31  
**Auditor**: Track R3 Security & Anti-Cheat Auditor  
**Application**: Logos: Kelime Avı ve Bulmaca (React Native / Expo SDK 52)  
**Package / Bundle ID**: `com.zovtex.logos`  
**Target Platform**: Android (API 35) & iOS  
**Audit Scope**: Static code analysis, configuration review, backend security rules, storage cryptography, anti-cheat mechanisms, and business logic integrity.

---

## 1. Executive Summary & Security Posture Assessment

A comprehensive security and anti-cheat code audit was conducted on the "Logos: Kelime Avı ve Bulmaca" mobile codebase. While the application implements structured client-side modules, multiple **Critical** and **High** severity vulnerabilities were identified that directly threaten the game economy, player authentication integrity, leaderboard fairness, and binary release security.

### Overall Security Posture: **HIGH RISK (Critical Issues Present)**

| Evaluation Area | Risk Level | Key Vulnerability Summary |
|---|---|---|
| **1. AsyncStorage & Local Storage** | **HIGH** | Plaintext game economy (`gems`, `premium`, `xp`); `allowBackup="true"` allows ADB extraction and tampering without root. |
| **2. API Keys & Secrets Exposure** | **CRITICAL** | Production release keystore passwords (`'logospassword'`) and keystore file hardcoded in source repository. |
| **3. Firestore Security Rules** | **HIGH** | Missing rules for `/referrals/`; unvalidated schema in `/cloud_saves/`; broken query permissions for referral lookups. |
| **4. Input Validation & Sanitization** | **HIGH** | Passwordless, tokenless email linking in `useCloudSync.ts` allows arbitrary Account Takeover and data overwrite. |
| **5. Leaderboard & Anti-Cheat** | **HIGH** | 100% client-authoritative score calculation and submission; lack of rate limits enables Sybil leaderboard hijacking. |
| **6. In-App Purchases (IAP)** | **CRITICAL** | `StoreModal.tsx` awards free gems and lifetime premium on purchase errors/cancellations in `catch` blocks. |
| **7. Android Security Settings** | **MEDIUM** | `android:allowBackup="true"`, missing default Proguard/R8 bytecode obfuscation. |

---

## 2. Findings Matrix

| Finding ID | Severity | Area | Affected File & Line | Summary |
|---|---|---|---|---|
| **R3-F01** | **CRITICAL** | IAP / Economy | `components/StoreModal.tsx:174-215` | Purchase failure/cancellation in `catch` block grants free gems and premium. |
| **R3-F02** | **CRITICAL** | Secrets Exposure | `android/app/build.gradle:105-110` | Hardcoded production release keystore password (`logospassword`) and embedded keystore. |
| **R3-F03** | **HIGH** | Local Storage | `services/storage.service.ts:17-88`, `AndroidManifest.xml:15` | Plaintext AsyncStorage game data coupled with `allowBackup="true"` enables zero-root tampering. |
| **R3-F04** | **HIGH** | Auth / Account | `hooks/useCloudSync.ts:23-52`, `services/cloud.service.ts:72-135` | Unauthenticated email linking allows arbitrary account takeover and cloud save overwrite. |
| **R3-F05** | **HIGH** | Leaderboard | `services/leaderboard.service.ts:16-48`, `firestore.rules:16-24` | Client-authoritative score calculation with unverified direct Firestore score injection. |
| **R3-F06** | **HIGH** | Cloud Storage | `firestore.rules:10-13`, `services/cloud.service.ts:30-49` | Unvalidated cloud save schema permits direct insertion of arbitrary gems and premium status. |
| **R3-F07** | **MEDIUM** | Firestore Rules | `firestore.rules:33-35`, `services/referral.service.ts:43-68` | Missing Firestore rules for `/referrals/` and restrictive `/users/` rules cause referral failure. |
| **R3-F08** | **MEDIUM** | Leaderboard | `services/leaderboard.service.ts:50-79`, `firestore.rules:16-24` | Sybil flooding and leaderboard denial-of-service via unrestricted anonymous submissions. |
| **R3-F09** | **MEDIUM** | Deep Linking | `services/deeplink.service.ts:11-18` | Deep link referral parameter automatically executed without user confirmation. |
| **R3-F10** | **LOW** | Compliance | `components/PrivacyPolicyModal.tsx:41-44` | Falsely claims to users that local storage data is encrypted. |
| **R3-F11** | **LOW** | Build Config | `android/app/build.gradle:68, 119` | Proguard/R8 code minification and obfuscation disabled by default in release builds. |

---

## 3. Detailed Audit Findings

---

### R3-F01: In-App Purchase Bypass & Free Fulfillment on Error/Cancellation (CRITICAL)
- **Vulnerability Type**: Business Logic Flaw / Broken Purchase Verification
- **Severity**: **CRITICAL** (CVSS 9.8)
- **Location**: `components/StoreModal.tsx` (Lines 174–193, 196–215, 241–246)
- **Description**:
  In `StoreModal.tsx`, the `handleBuyGems` and `handlePremium` functions wrap the in-app purchase request in a `try/catch` block. When `requestPurchase` or `requestSubscription` throws an error (which occurs on offline attempts, Google Play billing errors, user cancellations, or unconfigured store environments), the `catch` block unconditionally calls the success callbacks `onPurchase(pkg.id, pkg.gems)` and `onPurchasePremium()`.
  
  ```typescript
  // components/StoreModal.tsx:174-192
  const handleBuyGems = async (pkg: GemPackage) => {
    setPurchasing(pkg.id);
    try {
      await requestPurchase({ sku: pkg.id });
    } catch {
      try {
        // VULNERABILITY: Awards gems unconditionally on purchase exception/cancellation
        await onPurchase(pkg.id, pkg.gems);
        showCustomAlert('✅', language === 'en' ? 'Purchase Successful!' : 'Satın alma başarılı!');
      } catch { ... }
    }
    setPurchasing(null);
  };
  ```

- **Exploitation / Reproduction Steps**:
  1. Open the game on any physical device or emulator.
  2. Open the Shop modal and click to buy any Gem Pack (e.g. 3,000 Gems) or Premium.
  3. Cancel the Google Play purchase dialog, or enable Airplane Mode before tapping.
  4. The exception handler triggers `await onPurchase(...)`, immediately crediting 3,000 Gems or Lifetime Premium for free.
- **Defensive Remediation**:
  - Remove all fulfillment logic (`onPurchase`, `onPurchasePremium`) from the `catch` block.
  - Fulfill purchases **strictly** within the `purchaseUpdatedListener` event handler after verifying receipt validity and transaction acknowledgment (`purchase.isAcknowledgedAndroid`).
  - Implement server-side receipt validation using Google Play Developer API and App Store Server API.

---

### R3-F02: Hardcoded Production Release Keystore Credentials & File in Source Tree (CRITICAL)
- **Vulnerability Type**: Insecure Credential Storage / Private Key Exposure
- **Severity**: **CRITICAL** (CVSS 9.1)
- **Location**: `android/app/build.gradle` (Lines 105–110), `android/app/release.keystore`
- **Description**:
  The Android build configuration contains hardcoded production release signing credentials directly in source code:
  ```groovy
  // android/app/build.gradle:105-110
  release {
      storeFile file('release.keystore')
      storePassword 'logospassword'
      keyAlias 'logos-key-alias'
      keyPassword 'logospassword'
  }
  ```
  Furthermore, the `android/app/release.keystore` binary is committed directly in the project directory. Any party with read access to the repository can extract the private key, forge application updates, or sign malicious APK variants that overwrite the official app on user devices.

- **Defensive Remediation**:
  1. Immediately rotate the release keystore before public distribution on Google Play (or enroll in Google Play App Signing).
  2. Remove `release.keystore` from version control and add `*.keystore` / `*.jks` to `.gitignore`.
  3. Load signing credentials dynamically from secure CI/CD environment variables or `~/.gradle/gradle.properties`:
     ```groovy
     signingConfigs {
         release {
             storeFile file(System.getenv("KEYSTORE_PATH") ?: "release.keystore")
             storePassword System.getenv("KEYSTORE_PASSWORD")
             keyAlias System.getenv("KEY_ALIAS")
             keyPassword System.getenv("KEY_PASSWORD")
         }
     }
     ```

---

### R3-F03: Plaintext AsyncStorage Data Storage with ADB Backup Enabled (HIGH)
- **Vulnerability Type**: Insecure Local Data Storage / Lack of Integrity Checks
- **Severity**: **HIGH** (CVSS 7.5)
- **Location**: `services/storage.service.ts` (Lines 17–88), `android/app/src/main/AndroidManifest.xml` (Line 15)
- **Description**:
  The application uses standard `@react-native-async-storage/async-storage` for core game economy variables:
  - `gq_gems` (integer string)
  - `gq_premium` (`'true'` / `'false'`)
  - `gq_xp`, `gq_stats`, `gq_achievements`, `gq_unlocked_categories`
  
  In Android, these keys are stored unencrypted in `/data/data/com.zovtex.logos/databases/RKStorage` or shared preferences.
  
  Critically, `AndroidManifest.xml` defines `android:allowBackup="true"`. On any standard Android device with USB debugging enabled, a user or malicious computer can extract the entire database without rooting the device using:
  `adb backup -f app_backup.ab -noapk com.zovtex.logos`
  The extracted archive can be unpacked, edited to set `gq_gems` to `"999999"` and `gq_premium` to `"true"`, repacked, and restored via `adb restore`.

- **Defensive Remediation**:
  1. Set `android:allowBackup="false"` in `android/app/src/main/AndroidManifest.xml`.
  2. Store sensitive entitlements (`gq_gems`, `gq_premium`, `gq_xp`) using hardware-backed secure storage via `expo-secure-store` (backed by Android Keystore and iOS Keychain).
  3. Implement an HMAC integrity signature (SHA-256 with device-specific salt) over local game progress to detect external tampering before loading state.

---

### R3-F04: Account Takeover & Cloud Save Overwrite via Passwordless Email Linking (HIGH)
- **Vulnerability Type**: Broken Authentication / Insecure Direct Object Reference (IDOR)
- **Severity**: **HIGH** (CVSS 8.5)
- **Location**: `hooks/useCloudSync.ts` (Lines 23–52), `services/cloud.service.ts` (Lines 72–135)
- **Description**:
  The "Cloud Save Sync" portal allows players to link an email address. However, `handleLinkAccount(email)` performs zero authentication:
  ```typescript
  // hooks/useCloudSync.ts:23-40
  const handleLinkAccount = async (email: string) => {
    if (!email.includes('@') || email.length < 5) { ... return; }
    // No password, OTP, Magic Link, or Firebase Auth verification
    await storageSet('gq_user_email', email);
    setLinkedEmail(email);
  };
  ```
  When the user taps "Restore", `cloudService.restoreStorageFromCloud(email)` attempts to fetch the cloud save associated with that email and overwrites the local device data. Conversely, tapping "Backup" overwrites the victim's save in the database. Any user can target another user's email to steal or overwrite their progress.

- **Defensive Remediation**:
  - Integrate proper Firebase Authentication for cloud sync using `signInWithEmailAndPassword`, `sendSignInLinkToEmail` (Magic Link), or Google Sign-In (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`).
  - Never allow linking an email to a cloud save document without verifying proof of ownership via a signed Firebase Auth token (`request.auth.token.email`).

---

### R3-F05: Client-Authoritative Leaderboard Score Submission (HIGH)
- **Vulnerability Type**: Client-Side Trust / Game Score Spoofing
- **Severity**: **HIGH** (CVSS 7.2)
- **Location**: `services/leaderboard.service.ts` (Lines 16–48), `firestore.rules` (Lines 16–24)
- **Description**:
  Scores submitted to the global leaderboard are computed purely on the client in `calculateScore(entry)`:
  ```typescript
  // services/leaderboard.service.ts:22-34
  const points = calculateScore(entry);
  await addDoc(collection(db, FIRESTORE_COLLECTIONS.SCORES), {
    uid: user.uid,
    displayName: `Player_${user.uid.slice(0, 6)}`,
    score: points,
    mode: entry.mode,
    guesses: entry.guesses,
    timeSeconds: entry.timeSeconds ?? 0,
    xpEarned: entry.xpEarned,
    date: entry.date,
    createdAt: serverTimestamp(),
  });
  ```
  The Firestore rule merely asserts `request.resource.data.score <= 5000`. An attacker can submit arbitrary scores up to `5000` with 0 guesses and 0 elapsed seconds directly via the Firebase REST API or modified client code.

- **Defensive Remediation**:
  - Implement a backend Cloud Function (or server endpoint) for score submission.
  - Require the client to submit the game session verification payload (e.g. target word hash, list of guesses, timestamp delta, and cryptographic nonce signed by the server at game start).
  - Compute the final score on the server rather than trusting client-provided numbers.

---

### R3-F06: Cloud Save Schema Unvalidated in Firestore Rules (HIGH)
- **Vulnerability Type**: Insecure Direct Object Write / Privilege Escalation
- **Severity**: **HIGH** (CVSS 7.5)
- **Location**: `firestore.rules` (Lines 10–13), `services/cloud.service.ts` (Lines 30–49)
- **Description**:
  In `firestore.rules`, the `cloud_saves` collection rule is:
  ```
  match /cloud_saves/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
  There is zero validation on the fields written to `cloud_saves/{userId}`. Any authenticated user (including anonymous accounts) can write `{ gems: 999999, isPremium: true, xp: 500000 }` to their cloud document. When `restoreFromCloud` is invoked, the client blindly parses and applies these values into local storage.
  
  Furthermore, `services/cloud.service.ts` line 101 attempts to use `email` as the document ID: `doc(db, 'cloud_saves', email)`. Because `request.auth.uid == userId` checks the Firebase UID, passing an email string causes an authorization failure in production, resulting in failed cloud syncs.

- **Defensive Remediation**:
  - Enforce strict data type and range validation in `firestore.rules`:
    ```
    match /cloud_saves/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
        && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['isPremium']))
        && request.resource.data.gems is number && request.resource.data.gems <= 100000;
    }
    ```
  - Standardize document keys to `request.auth.uid` across all services rather than mixing email and UID.

---

### R3-F07: Broken Referral Logic Due to Missing & Overly Restrictive Firestore Rules (MEDIUM)
- **Vulnerability Type**: Denial of Service / Authorization Misconfiguration
- **Severity**: **MEDIUM** (CVSS 5.3)
- **Location**: `firestore.rules` (Lines 6–8, 33–35), `services/referral.service.ts` (Lines 43–68)
- **Description**:
  1. `claimReferral` in `referral.service.ts` executes a collection query:
     `query(collection(db, 'users'), where('referralCode', '==', code))`
     However, `firestore.rules` only allows reading `/users/{userId}` if `request.auth.uid == userId`. Firestore denies collection queries across other users' documents when rule filters are not satisfied, causing referral code lookups to fail with `permission-denied`.
  2. `claimReferral` writes to `referrals/${referrer.id}_${user.uid}`. However, `firestore.rules` defines no rules for `/referrals/`, causing the fallback `match /{document=**} { allow read, write: if false; }` to block all referral creation.

- **Defensive Remediation**:
  - Implement a dedicated serverless Cloud Function `claimReferral({ code })` that executes in admin context to validate referral codes and award bonuses atomically.
  - Or, maintain a public lookup map `match /referral_codes/{code}` allowing read-only lookup of owner UIDs without exposing full user profiles.

---

### R3-F08: Leaderboard Flooding & Sybil Denial-of-Service (MEDIUM)
- **Vulnerability Type**: Resource Flooding / Lack of Rate Limiting
- **Severity**: **MEDIUM** (CVSS 5.3)
- **Location**: `services/leaderboard.service.ts` (Lines 50–79), `firestore.rules` (Lines 16–24)
- **Description**:
  `firestore.rules` permits any authenticated user to create documents in `/scores/{scoreId}` without per-user document caps or rate limits. Because anonymous authentication (`signInAnonymously`) creates new UIDs effortlessly, a bot script can register 50 anonymous accounts and submit maximum scores (5,000 pts) within seconds. Because `getGlobalLeaderboard` executes `orderBy('score', 'desc'), limit(50)`, the entire leaderboard display will be occupied by fake entries, hiding legitimate player achievements.

- **Defensive Remediation**:
  - Enforce a 1-score-per-user constraint by structuring documents as `/scores/{userId}` or using a Cloud Function that maintains a single best score per player.
  - Add rate limiting (e.g. maximum 1 submission per 60 seconds per user).

---

### R3-F09: Deep Link Parameter Execution Without User Confirmation (MEDIUM)
- **Vulnerability Type**: Insecure Deep Link Handling
- **Severity**: **MEDIUM** (CVSS 4.3)
- **Location**: `services/deeplink.service.ts` (Lines 11–18)
- **Description**:
  `setupDeepLinkHandler` registers a listener on `expo-linking`. When a URL matching `logos://*?ref=CODE` or `com.zovtex.logos://*?ref=CODE` is received (which can be triggered by any web page or malicious app via standard intent dispatch), `handleDeepLink` extracts the referral code and automatically executes `claimReferral(code)` in the background without prompting the user for confirmation.

- **Defensive Remediation**:
  - Parse the deep link parameter into application state and display a confirmation prompt (e.g. `CustomAlert` asking: "Claim invite from [User/Code]?") before executing mutations.

---

### R3-F10: Misleading Privacy Policy Statement Regarding Data Encryption (LOW)
- **Vulnerability Type**: Security Documentation / Compliance Inconsistency
- **Severity**: **LOW** (CVSS 3.1)
- **Location**: `components/PrivacyPolicyModal.tsx` (Lines 41–44)
- **Description**:
  The in-app privacy policy states:
  *"Logos oyunundaki tüm istatistikleriniz (seviyeniz, XP miktarınız, tamamladığınız başarımlar ve biriktirdiğiniz Gem bakiyesi) tamamen cihazınızda (Local Storage / AsyncStorage) şifrelenmiş olarak saklanır."*
  (Claims that all stats, XP, achievements, and Gems are stored in encrypted format in AsyncStorage).
  
  In reality, `services/storage.service.ts` stores these values as unencrypted plaintext JSON strings and raw integers. Making false claims regarding cryptographic storage creates compliance risks under consumer protection and store policy reviews.

- **Defensive Remediation**:
  - Either implement AES-256 hardware-backed secure storage via `expo-secure-store` / SQLCipher to match the claim, or accurately describe local storage security posture in policy documentation.

---

### R3-F11: Missing Release Build Bytecode Obfuscation (LOW)
- **Vulnerability Type**: Reverse Engineering Risk
- **Severity**: **LOW** (CVSS 3.1)
- **Location**: `android/app/build.gradle` (Lines 68, 119)
- **Description**:
  In `android/app/build.gradle`:
  `def enableProguardInReleaseBuilds = (findProperty('android.enableProguardInReleaseBuilds') ?: false).toBoolean()`
  Unless explicitly set to `true` in `gradle.properties`, release APKs/AABs are built without Proguard/R8 minification and obfuscation. Combined with plaintext JS strings, reverse-engineering decompilation (via JADX / Hermes decompilers) is trivial.

- **Defensive Remediation**:
  - Enable `android.enableProguardInReleaseBuilds=true` in `android/gradle.properties` and configure rules in `proguard-rules.pro`.

---

## 4. Remediation Roadmap & Recommendations

```
+-------------------------------------------------------------------------------+
| PHASE 1: IMMEDIATE CRITICAL FIXES (Pre-Launch Blockers)                       |
+-------------------------------------------------------------------------------+
  [x] R3-F01: Fix IAP catch blocks in StoreModal.tsx (remove free fulfillment).
  [x] R3-F02: Remove release.keystore and passwords from build.gradle & git.
  [x] R3-F03: Set android:allowBackup="false" in AndroidManifest.xml.
  [x] R3-F04: Require Firebase Auth credentials before linking cloud emails.

+-------------------------------------------------------------------------------+
| PHASE 2: SHORT-TERM ARCHITECTURAL HARDENING                                   |
+-------------------------------------------------------------------------------+
  [ ] R3-F05 & R3-F08: Migrate leaderboard submissions to Cloud Functions with  |
      session validation and 1-entry-per-user rate limiting.                   |
  [ ] R3-F06: Add schema and type validation to Firestore cloud_saves rules.    |
  [ ] R3-F07: Fix referral collection rules and query mechanisms.               |
  [ ] R3-F03: Migrate gem and premium state to expo-secure-store / HMAC check.  |

+-------------------------------------------------------------------------------+
| PHASE 3: COMPLIANCE & BUILD HARDENING                                         |
+-------------------------------------------------------------------------------+
  [ ] R3-F09: Add confirmation modal for deep link referral claims.             |
  [ ] R3-F10: Update Privacy Policy text to reflect actual storage architecture. |
  [ ] R3-F11: Enable Proguard/R8 bytecode obfuscation in release builds.       |
+-------------------------------------------------------------------------------+
```

---
*Report compiled by Track R3 Security & Anti-Cheat Auditor for Logos QA Audit.*
