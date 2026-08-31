# Google Play Developer Program Policy Compliance Audit Report
**Project**: Logos: Kelime Avı ve Bulmaca (Package: `com.zovtex.logos`)  
**Track**: R5 — Policy Compliance & Store Readiness Audit  
**Auditor**: Track R5 Google Play Policy Auditor Subagent  
**Date**: August 31, 2026  
**Target Platform**: Android (API Level 35 / Android 15, compileSdkVersion 35, minSdkVersion 24)  
**Deliverable File**: `r5_policy_audit.md`

---

## Executive Summary

This comprehensive audit evaluates the "Logos: Kelime Avı ve Bulmaca" React Native / Expo mobile application against the current **Google Play Developer Program Policies**, **Data Safety Guidelines**, **Families Policy & COPPA**, **Permissions & User Data Policies**, **Monetization & In-App Billing Guidelines**, and **IARC Content Rating Requirements**.

### Compliance Status Summary
- **Overall Readiness**: ⚠️ **CONDITIONAL NO-GO (Requires Remediation Before Production Release)**
- **Total Policy Findings**: **8 Findings**
  - 🔴 **Critical Severity**: 1 finding (Privacy Policy misrepresentation vs. email/data collection)
  - 🟠 **High Severity**: 3 findings (Unfiltered hate speech/extreme profanity in dictionary; missing Account Deletion path; Families/COPPA age gate missing)
  - 🟡 **Medium Severity**: 2 findings (Simulated IAP bypass/fake restore alert; hardcoded keystore passwords in build.gradle)
  - 🟢 **Low Severity**: 2 findings (Manifest/app.json permission divergence; contact email & version metadata mismatch)

---

## 1. Data Safety Declarations vs. Actual Collection

### 1.1 Data Inventory & Tracking Map

| Data Category | Data Element | Actual Mechanism / Code Location | Transmitted To | Declared in `PLAY_STORE_LISTING.md`? | Disclosed in `privacy-policy.html`? | Compliance Status |
|---|---|---|---|---|---|---|
| **Personal Info** | Email Address | `services/auth.service.ts` (`linkEmail`), `services/cloud.service.ts` (`syncStorageToCloud`), `hooks/useCloudSync.ts`, `components/FeedbackForm.tsx` | Firebase Firestore (`users`, `cloud_saves`, `feedback`), Sentry | YES | ❌ **DENIED ("We do not collect email")** | 🔴 **VIOLATION (R5-F01)** |
| **Personal Info** | User Identifiers / Display Name | Firebase Auth Anonymous UID, `displayName` (`Player_<uid>`) in `services/auth.service.ts:60` | Firebase Firestore (`users`, `scores`) | YES | Partial | ⚠️ Needs accurate disclosure |
| **Financial Info** | Purchase History / IAP | `react-native-iap` in `services/iap.service.ts` & `StoreModal.tsx` (consumables, non-consumables, subscriptions) | Google Play Billing Services | YES | YES | ✅ Compliant |
| **App Activity** | Gameplay Progress & Stats | `store/progressStore.ts`, `services/storage.service.ts` (XP, level, gems, streaks, achievements, stickers) | AsyncStorage (local), Firestore (`cloud_saves`) | YES | YES | ✅ Compliant |
| **User Content** | Feedback & Bug Reports | `components/FeedbackModal.tsx`, `services/cloud.service.ts:159` | Firebase Firestore (`feedback`) | YES | ❌ Missing in privacy policy | ⚠️ Disclose UGC collection |
| **User Content** | Public Scores & Ranks | `services/leaderboard.service.ts`, `services/cloud.service.ts:180` | Firebase Firestore (`scores`) | YES | YES | ✅ Compliant |
| **Device Identifiers** | Push Notification Token | `expo-notifications` in `services/notification.service.ts:17` | AsyncStorage (`gq_push_token`) | YES | ❌ Missing in privacy policy | ⚠️ Disclose in privacy policy |
| **Diagnostics** | Crash Logs, Stack Traces, App Performance | `@sentry/react-native` in `services/error-reporting.service.ts` (`Sentry.init`, `Sentry.captureException`, `Sentry.setUser`) | Sentry Cloud | YES | ❌ Missing in privacy policy | ⚠️ Disclose Sentry processor |
| **Advertising ID** | `AAID` / `AD_ID` | NOT USED. No AdMob / Ads SDK installed. | N/A | YES ("Ads SDK: YOK") | YES ("No third-party ads") | ✅ Compliant |

---

## 2. Permissions Justification & AndroidManifest Audit

### 2.1 Manifest Permissions Review

| Permission Name | Type | Code Location | Justification / Usage | Google Play Policy Status |
|---|---|---|---|---|
| `android.permission.INTERNET` | Normal | `AndroidManifest.xml:2` | Required for Firebase sync, leaderboard, Sentry reporting, IAP billing, and online TDK dictionary definition lookups. | ✅ **Justified & Compliant** |
| `android.permission.MODIFY_AUDIO_SETTINGS` | Normal | `AndroidManifest.xml:3` | Used by `expo-av` in `services/audio.service.ts` for background ambient music and sound effects management. | ⚠️ **Justified but missing in `app.json`** |
| `android.permission.POST_NOTIFICATIONS` | Dangerous / Runtime (API 33+) | `AndroidManifest.xml:4`, `app.json:33` | Requested conditionally via `notificationService.registerForPushNotificationsAsync()` in `_layout.tsx` for daily challenge reminders and streak notifications. | ✅ **Justified & Compliant** |
| `android.permission.RECEIVE_BOOT_COMPLETED` | Normal | `AndroidManifest.xml:5`, `app.json:32` | Reschedules scheduled local notifications after device restarts. | ✅ **Justified & Compliant** |
| `android.permission.VIBRATE` | Normal | `AndroidManifest.xml:6`, `app.json:31` | Used by `expo-haptics` in `services/audio.service.ts` for haptic feedback during gameplay key presses, successes, and errors. | ✅ **Justified & Compliant** |
| `com.android.vending.BILLING` | Normal | `AndroidManifest.xml:7`, `app.json:34` | Required by `react-native-iap` for in-app gem packages and premium upgrades. | ✅ **Justified & Compliant** |

### 2.2 Restricted & Dangerous Permissions Check
- **Location Permissions** (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`): ❌ NOT REQUESTED (Compliant)
- **Media & Storage Permissions** (`READ_MEDIA_IMAGES`, `MANAGE_EXTERNAL_STORAGE`): ❌ NOT REQUESTED (Compliant)
- **Camera & Microphone** (`CAMERA`, `RECORD_AUDIO`): ❌ NOT REQUESTED (Compliant)
- **Telephony & Contacts** (`READ_PHONE_STATE`, `READ_CONTACTS`, `READ_SMS`): ❌ NOT REQUESTED (Compliant)
- **Package Visibility** (`QUERY_ALL_PACKAGES`): ❌ NOT REQUESTED (Compliant)
- **Advertising Identifier** (`com.google.android.gms.permission.AD_ID`): ❌ NOT REQUESTED (Compliant; appropriate since no Ads SDK is included)

---

## 3. Ads & Monetization Policy

### 3.1 Ads SDK & Placement Audit
- **Codebase Ads Integration**: An exhaustive search of `package.json`, `services/`, `components/`, and `app/` confirms that **NO AdMob SDK or third-party advertising network** (`react-native-google-mobile-ads`, AppLovin, Unity Ads) is installed in the application.
- **Deceptive Ad Triggers / Overlay Hijacking**: None present.
- **Banner Overlaps / Back Button Hijacking**: None present.
- **Store Listing Consistency**: `PLAY_STORE_LISTING.md` accurately states "Ads SDK: YOK" and "Free to play with no third-party ads."

### 3.2 In-App Purchases (IAP) & Google Play Billing Policy
- **Billing Provider**: Standard `react-native-iap` 12.16.4 integrated for Google Play Billing API.
- **Monetization Mechanics**:
  - Consumables: Gem Packs (100, 500, 1500 Gems).
  - Non-consumables: Lifetime Premium Unlock.
  - Subscriptions: Monthly Premium.
- **Billing Policy Violations Identified (R5-F05)**:
  1. **Simulated Fallback Exploits**: In `components/StoreModal.tsx` lines 179-192 and 201-213, if `requestPurchase` or `requestSubscription` encounters an error, the `catch` block executes fallback code that unconditionally awards gems and premium access to the user without validating a receipt with Google Play.
  2. **Deceptive Restore Alert**: In `app/(tabs)/settings.tsx` lines 221-225, the "Restore Purchases" button displays a hardcoded success alert ("Your purchases have been successfully restored!") without querying `RNIap.getAvailablePurchases()`.
  3. **Product SKU Inconsistency**: `services/iap.service.ts` defines SKUs as `com.logos.premium` and `com.logos.gems100`, whereas `constants/products.ts` defines `com.zovtex.logos.premium.lifetime` and `com.zovtex.logos.gems.small`.

---

## 4. Content Ratings, Target Audience & Families Policy

### 4.1 IARC Content Rating & Dictionary Moderation Audit
- **Declared IARC Rating**: **3+ (Everyone / PEGI 3 / USK 0)**
- **IARC Questionnaire Declarations**: "Şiddet: Yok | Kaba dil: Yok | Cinsellik: Yok | Uyuşturucu: Yok | Kumar: Yok | Korku: Yok"
- **Actual Content in Bundled Dictionary (`constants/validation_dictionary.ts`)**:
  - **Severe Racial & Homophobic Slurs (Hate Speech)**: Contains `NIGGER`, `FAGGOT`, `DYKE`, `SPIC`, `CHINK`, `KAFIR`.
  - **Extremist & Hate Group Ideology**: Contains `NAZI`, `HITLER`, `JIHAD`.
  - **Sexual Violence & Severe Crimes**: Contains `RAPE`, `RAPIST`, `RAPED`, `MURDER`, `KILL`.
  - **Illicit Narcotics & Substances**: Contains `HEROIN`, `COCAINE`, `EROİN`, `KOKAİN`, `ESRAR`, `WEED`.
  - **Explicit Profanity & Sexual Anatomy**: Contains `OROSPU`, `İBNE`, `KAHPE`, `FAHİŞE`, `FUCK`, `FUCKER`, `SHIT`, `BITCH`, `CUNT`, `DICK`, `COCK`, `SLUT`, `WHORE`, `PENIS`, `VAGINA`, `PUSSY`, `TITS`, `BOOBS`, `ANUS`.
- **Policy Violation (R5-F02)**: The game validates these words as acceptable inputs and allows users to look up their full definitions via `services/definition.service.ts`. Shipping an app rated 3+ (Everyone) with unmoderated racial slurs, hate speech, sexual violence, and hard profanity is a **direct violation of Google Play Inappropriate Content Policy, Hate Speech Policy, and IARC Content Rating Accuracy rules**.

### 4.2 Target Audience & COPPA Compliance (R5-F04)
- `PLAY_STORE_LISTING.md` markets the game under "TÜM AİLE İÇİN" ("Suitable for all ages").
- If the app targets children under 13 or is a mixed-audience family game:
  - **Missing Neutral Age Screen**: The app does not ask user age before allowing email registration in `CloudSyncModal.tsx` or `FeedbackModal.tsx`.
  - **Children's PII Collection**: Under COPPA and Google Play Families Policy, collecting email addresses or passing user IDs/emails to Sentry from children without verifiable parental consent is prohibited.

---

## 5. Google Play Account Deletion Policy Compliance

- **Requirement**: Google Play policy mandates that any app offering account creation must:
  1. Provide an easily accessible in-app pathway for users to delete their account and all associated data.
  2. Provide a web-based URL where users can request account and data deletion without reinstalling the app.
- **Audit Findings (R5-F03)**:
  - In `hooks/useCloudSync.ts:135-140` and `components/CloudSyncStatus.tsx:44-49`, the only option provided is "Unlink Account" (`handleUnlink`), which simply deletes `gq_user_email` from local `AsyncStorage`.
  - The user's account in Firebase Auth and their documents in Firestore (`users/{uid}`, `cloud_saves/{uid}`, `cloud_saves/{email}`) are **never deleted**.
  - No dedicated web deletion form exists on `https://zovtex.com` or `https://zootxtr.github.io/logos/`.

---

## 6. Detailed Policy Findings Catalog

```
================================================================================
R5-F01: Privacy Policy Explicitly Denies Email Collection While App Collects & Transmits Emails
--------------------------------------------------------------------------------
Severity:         CRITICAL
Category:         Data Safety & Privacy Policy
Location:         privacy-policy.html:31,57; components/PrivacyPolicyModal.tsx:50-52;
                  services/auth.service.ts:75; services/cloud.service.ts:101,159;
                  services/error-reporting.service.ts:24
Description:      The hosted Privacy Policy and in-app modal explicitly state:
                  "Uygulama içinde doğrudan kişisel bilgileri (isim, e-posta adresi, telefon vb.) toplamıyoruz." /
                  "We do not directly collect personal identifying information (such as name, email, or phone number)."
                  However, the app implements email-based account linking (linkEmail), stores user emails in
                  Firestore cloud_saves/{email} and feedback/{feedbackId}, and transmits user emails to Sentry
                  via Sentry.setUser({ id: uid, email }).
Violation Risk:   Immediate rejection or policy suspension during Google Play Store review under User Data
                  and Privacy Policy Accuracy requirements.
Recommended Fix:  Rewrite Section 1 of privacy-policy.html and PrivacyPolicyModal.tsx to accurately disclose
                  that email addresses are collected for optional cloud sync, feedback, and error diagnostics,
                  specifying third-party processors (Firebase, Sentry) and data retention terms.
================================================================================
```

```
================================================================================
R5-F02: Extreme Hate Speech, Racial Slurs, Sexual Violence & Illegal Drug Words in Validation Dictionary
--------------------------------------------------------------------------------
Severity:         HIGH
Category:         Content Ratings (IARC) & Inappropriate Content Policy
Location:         constants/validation_dictionary.ts (contains NIGGER, FAGGOT, SPIC, CHINK, NAZI,
                  HITLER, RAPE, RAPIST, HEROIN, COCAINE, EROİN, KOKAİN, ESRAR, OROSPU, İBNE, KAHPE,
                  FAHİŞE, FUCK, CUNT, BITCH, DICK, COCK, SLUT, WHORE, PENIS, VAGINA, PUSSY)
Description:      The app is rated 3+ (Everyone) with claims of zero violence, profanity, drugs, or vulgarity.
                  However, the bundled validation dictionary contains over 50+ instances of severe hate speech,
                  racial slurs, homophobic slurs, extremist ideology, sexual violence, illegal drugs, and explicit
                  sexual anatomy words. These words are validated as legal guesses and can be queried via the in-app
                  dictionary definition service (TDK / dictionaryapi.dev).
Violation Risk:   App removal, age rating invalidation, and developer account strikes under Google Play
                  Hate Speech, Inappropriate Content, and IARC Content Rating Accuracy policies.
Recommended Fix:  Execute an automated blocklist sanitization script on validation_dictionary.ts to purge all
                  hate speech, racial/homophobic slurs, explicit sexual terms, sexual violence, and illicit drug terms
                  before creating release bundles.
================================================================================
```

```
================================================================================
R5-F03: Missing In-App and Web-Based Account & Data Deletion Pathway
--------------------------------------------------------------------------------
Severity:         HIGH
Category:         Google Play Account Deletion Policy
Location:         services/auth.service.ts; services/cloud.service.ts;
                  hooks/useCloudSync.ts:135-140; components/CloudSyncStatus.tsx:44-49;
                  privacy-policy.html:87
Description:      Google Play requires apps enabling account creation to provide both an in-app deletion button
                  and a web-based URL for deleting accounts and associated server data. The app only provides
                  "Unlink Account" which removes local AsyncStorage, leaving user records intact in Firebase Auth
                  and Firestore.
Violation Risk:   Play Console Data Safety rejection and app release blocking under Google Play Account Deletion Policy.
Recommended Fix:  (1) Add a "Delete Account & All Data" button in CloudSyncStatus.tsx that invokes Firebase Auth
                  deleteUser() and deletes user documents in Firestore (users/{uid}, cloud_saves/{uid},
                  cloud_saves/{email}).
                  (2) Host a web deletion request form at https://zovtex.com/account-deletion and provide this URL
                  in the Play Console Data Safety declaration.
================================================================================
```

```
================================================================================
R5-F04: Family & Child Protection Policy Violation (COPPA & Missing Neutral Age Screen)
--------------------------------------------------------------------------------
Severity:         HIGH
Category:         Families Policy & COPPA Compliance
Location:         PLAY_STORE_LISTING.md:34,58,67; services/auth.service.ts;
                  components/CloudSyncModal.tsx; components/FeedbackModal.tsx;
                  services/error-reporting.service.ts:24
Description:      The app targets all ages ("TÜM AİLE İÇİN / Family Friendly / 3+") and collects personal
                  identifying information (email addresses in Cloud Sync and Feedback) without implementing a
                  neutral age gate. Passing child personal identifiers to third-party services (Sentry/Firebase)
                  without verifiable parental consent violates COPPA and Google Play Families Policy.
Violation Risk:   App rejection under Google Play Designed for Families and COPPA requirements.
Recommended Fix:  (1) If children are included in target audience, implement a neutral age screen before allowing
                  email registration or feedback entry.
                  (2) Prevent sending email addresses of child users to Sentry and Firebase.
                  (3) Enable IP address anonymization/scrubbing in Sentry configuration.
================================================================================
```

```
================================================================================
R5-F05: Simulated Purchase Fallbacks and Inconsistent IAP Restoration Logic
--------------------------------------------------------------------------------
Severity:         MEDIUM
Category:         Google Play Payments & In-App Billing Policy
Location:         components/StoreModal.tsx:179-192, 201-213, 244;
                  app/(tabs)/settings.tsx:221-225;
                  services/iap.service.ts:5-11; constants/products.ts:4-15
Description:      (1) StoreModal.tsx catches IAP purchase errors and automatically grants gems and premium status
                  to the user for free as a simulated fallback.
                  (2) In settings.tsx, "Restore Purchases" displays an unverified success alert without calling
                  react-native-iap's getAvailablePurchases().
                  (3) Product IDs in services/iap.service.ts (com.logos.premium) differ from constants/products.ts
                  (com.zovtex.logos.premium.lifetime).
Violation Risk:   Non-compliance with Google Play Billing integrity requirements and potential deceptive UI flags.
Recommended Fix:  Remove automatic free-grant fallbacks in production builds; display standard purchase failure
                  alerts. Hook "Restore Purchases" in settings.tsx to RNIap.getAvailablePurchases(). Unify product
                  SKUs across all files to match Google Play Console.
================================================================================
```

```
================================================================================
R5-F06: Hardcoded Keystore Passwords in build.gradle & Repository-Committed Keystore
--------------------------------------------------------------------------------
Severity:         MEDIUM
Category:         Security & Release Integrity Policy
Location:         android/app/build.gradle:106-110; android/app/release.keystore
Description:      The release signing configuration in build.gradle specifies plain-text credentials
                  (storePassword 'logospassword', keyPassword 'logospassword') and references a release.keystore
                  file committed directly to the repository.
Violation Risk:   Security vulnerability; compromise of app signing key could allow unauthorized app updates.
Recommended Fix:  Move signing passwords to environment variables or local gradle.properties (added to .gitignore),
                  and enroll in Google Play App Signing with upload keys.
================================================================================
```

```
================================================================================
R5-F07: Manifest vs. app.json Permission Divergence
--------------------------------------------------------------------------------
Severity:         LOW
Category:         Android Permissions & Configuration
Location:         android/app/src/main/AndroidManifest.xml:3; app.json:30-35
Description:      android.permission.MODIFY_AUDIO_SETTINGS is present in AndroidManifest.xml but omitted
                  from the permissions list in app.json. If npx expo prebuild --clean is executed, the audio
                  setting permission will be lost.
Violation Risk:   Build inconsistency / subtle runtime audio permission regression.
Recommended Fix:  Add "MODIFY_AUDIO_SETTINGS" to the android.permissions array in app.json.
================================================================================
```

```
================================================================================
R5-F08: Privacy Policy Contact Email and App Version Metadata Discrepancy
--------------------------------------------------------------------------------
Severity:         LOW
Category:         Store Metadata & Legal Transparency
Location:         privacy-policy.html:47,73; PLAY_STORE_LISTING.md:13,37;
                  components/PrivacyPolicyModal.tsx:70; components/AboutModal.tsx:38
Description:      The hosted privacy policy lists contact email mhmto.gemini@gmail.com, whereas the Play Store
                  listing and in-app privacy modal specify support@zovtex.com. In addition, AboutModal.tsx displays
                  "Version 3.0.0 (Premium Update)", while app.json and build.gradle state version 1.0.2 (versionCode 3).
Violation Risk:   Store listing metadata inconsistency during manual Google Play review.
Recommended Fix:  Harmonize developer contact emails to support@zovtex.com across all documents and bind the version
                  display in AboutModal.tsx to native application constants.
================================================================================
```

---

## 7. Actionable Remediation Checklist for Production Release

To achieve 100% compliance with Google Play Developer Program Policies:

- [ ] **1. Privacy Policy & In-App Disclosures**:
  - Update `privacy-policy.html` and `PrivacyPolicyModal.tsx` to clearly state that email addresses, game progress, crash logs (Sentry), and push tokens are collected for account management, cloud sync, feedback, and diagnostics.
  - Align contact email to `support@zovtex.com` everywhere.
- [ ] **2. Dictionary Sanitization**:
  - Run an automated scrubber script to remove all hate speech, racial/homophobic slurs (`NIGGER`, `FAGGOT`, etc.), explicit sexual words, violence, and illicit drugs from `constants/validation_dictionary.ts`.
- [ ] **3. Account Deletion Implementation**:
  - Implement a true "Delete Account & Data" flow in `CloudSyncStatus.tsx` that calls `auth.currentUser.delete()` and deletes Firestore documents.
  - Create and host a web-based data deletion request form at `https://zovtex.com/account-deletion` and link it in Play Console Data Safety.
- [ ] **4. Families / COPPA Compliance**:
  - Implement a neutral age gate prior to displaying cloud sync / email prompt if targeting all ages.
  - Configure Sentry with `sendDefaultPii: false` and enable server-side IP scrubbing.
- [ ] **5. In-App Billing Hardening**:
  - Remove fake simulated purchase grants in `StoreModal.tsx` catch blocks.
  - Wire `settings.tsx` "Restore Purchases" button to actual `RNIap.getAvailablePurchases()` API.
  - Synchronize product IDs between `services/iap.service.ts` and `constants/products.ts`.
- [ ] **6. Keystore & Credentials Security**:
  - Remove hardcoded keystore passwords from `android/app/build.gradle` and use environment variables.

---
*Report compiled by Track R5 Policy Compliance Subagent for inclusion in `QA_AUDIT_REPORT.md`.*
