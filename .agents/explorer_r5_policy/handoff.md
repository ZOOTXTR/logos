# Handoff Report — Track R5: Google Play Policy Compliance Audit

## 1. Observation
- **Data Collection vs. Privacy Policy**:
  - `privacy-policy.html:31`: "Uygulama içinde doğrudan kişisel bilgileri (isim, e-posta adresi, telefon vb.) toplamıyoruz."
  - `privacy-policy.html:57`: "We do not directly collect personal identifying information (such as name, email, or phone number)."
  - `services/auth.service.ts:75`: `export async function linkEmail(email: string, password: string)`
  - `services/cloud.service.ts:101`: `await setDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, email), ...)`
  - `services/cloud.service.ts:159`: `await addDoc(collection(db, FIRESTORE_COLLECTIONS.FEEDBACK), { email, message, rating, createdAt: serverTimestamp() })`
  - `services/error-reporting.service.ts:24`: `Sentry.setUser({ id: uid, email })`
- **Dictionary Moderation vs. IARC Rating**:
  - `PLAY_STORE_LISTING.md:65-67`: "Şiddet: Yok | Kaba dil: Yok | Cinsellik: Yok | Uyuşturucu: Yok | Sonuç: 3+ (E) — her yaş için uygun"
  - `constants/validation_dictionary.ts`: Node.js category scan confirmed 65,239 bundled words containing:
    - Hate Speech / Slurs: `NIGGER`, `FAGGOT`, `DYKE`, `SPIC`, `CHINK`, `KAFIR`, `NAZI`, `HITLER`, `JIHAD`
    - Explicit Profanity / Sexual: `FUCK`, `FUCKER`, `SHIT`, `BITCH`, `CUNT`, `DICK`, `COCK`, `SLUT`, `WHORE`, `PENIS`, `VAGINA`, `PUSSY`, `TITS`, `BOOBS`, `OROSPU`, `İBNE`, `KAHPE`, `FAHİŞE`
    - Sexual Violence / Crime: `RAPE`, `RAPIST`, `RAPED`, `MURDER`, `KILL`
    - Illicit Narcotics: `HEROIN`, `COCAINE`, `EROİN`, `KOKAİN`, `ESRAR`, `WEED`
- **Account Deletion & Data Retention**:
  - `hooks/useCloudSync.ts:135-140`: `handleUnlink` only calls `storageRemove('gq_user_email')`.
  - No call to Firebase Auth `deleteUser()` or Firestore deletion for `users/{uid}` or `cloud_saves/{uid}`.
  - No web-based account deletion URL exists on the hosted privacy policy page.
- **In-App Billing & Ads**:
  - Codebase search confirmed 0 references to AdMob / third-party ads SDKs.
  - `components/StoreModal.tsx:181,203`: Catch block contains fallback execution of `onPurchase(pkg.id, pkg.gems)` and `onPurchasePremium()`.
  - `app/(tabs)/settings.tsx:221-224`: "Restore Purchases" button displays static `Alert.alert('Your purchases have been successfully restored!')` without calling `getAvailablePurchases()`.
  - `services/iap.service.ts:5-11` uses SKUs `com.logos.premium` / `com.logos.gems100` while `constants/products.ts:4-15` uses `com.zovtex.logos.premium.lifetime` / `com.zovtex.logos.gems.small`.
- **Permissions & Security**:
  - `android/app/src/main/AndroidManifest.xml`: Requests `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `BILLING`. No location, camera, contacts, or storage permissions.
  - `app.json:30-35`: Missing `MODIFY_AUDIO_SETTINGS`.
  - `android/app/build.gradle:106-110`: Release signing block contains plaintext passwords (`'logospassword'`) and references committed `release.keystore`.

## 2. Logic Chain
1. **Privacy Policy Violation (R5-F01)**: The hosted privacy policy explicitly claims no personal data or email is collected (Observation 1), but the app provides email authentication, Firestore sync using email, feedback submission with email, and Sentry context with email (Observation 1). Because Google Play User Data policies mandate accurate disclosures of all collection, this discrepancy constitutes a critical policy violation.
2. **Hate Speech & Inappropriate Content (R5-F02)**: The app declares a 3+ IARC rating with zero profanity/violence/drugs (Observation 2). However, the app bundles raw word lists containing extreme racial/homophobic slurs, sexual violence, and illegal narcotics (Observation 2), which are validated and presented to players. This directly breaches Google Play's Hate Speech and IARC Content Rating Accuracy policies.
3. **Account Deletion Non-Compliance (R5-F03)**: Google Play Developer Policy requires apps that support account creation to provide both in-app and web-based account deletion. The app only unlinks local storage without deleting server records (Observation 3) and lacks a web deletion URL, failing Google Play's mandatory account deletion requirement.
4. **Families Policy & COPPA (R5-F04)**: The app is marketed as "Family Friendly / All Ages" (Observation 2) while collecting email identifiers (Observation 1) without an age gate. This violates COPPA and Google Play Families Policy regarding children's personal data collection.
5. **Monetization & Security (R5-F05, R5-F06)**: Simulated fallback purchase grants on error (Observation 4) and plaintext release keystore passwords in version control (Observation 5) breach store monetization integrity and release security best practices.

## 3. Caveats
- Production Firebase Firestore and Sentry backend console configurations were evaluated via client code and local rules files (`firestore.rules`, `config/firebase.ts`, `services/error-reporting.service.ts`), as remote live cloud consoles are not directly accessible.
- The IARC questionnaire results were assessed based on the documentation in `PLAY_STORE_LISTING.md`.

## 4. Conclusion
The application demonstrates excellent permission hygiene (zero dangerous/unjustified permissions, no ads SDK clutter) and targets modern Android 15 (API 35). However, **it is NOT currently ready for production release** due to 8 policy findings, notably:
1. **R5-F01 (Critical)**: Contradiction between Privacy Policy and actual email data collection.
2. **R5-F02 (High)**: Unmoderated hate speech, racial slurs, and drug terminology in the bundled dictionary under a 3+ rating.
3. **R5-F03 (High)**: Missing in-app and web-based account deletion mechanisms.
4. **R5-F04 (High)**: Families / COPPA non-compliance without a neutral age gate for email collection.

A full remediation checklist and catalog are delivered in `r5_policy_audit.md`.

## 5. Verification Method
1. **Verify Word List Profanity & Slurs**:
   ```bash
   node .agents/explorer_r5_policy/scan_categories.js
   ```
2. **Verify Privacy Policy Contradiction**:
   Inspect `privacy-policy.html` lines 31 & 57 and compare with `services/auth.service.ts:75` and `services/cloud.service.ts:101,159`.
3. **Verify Keystore Hardcoding**:
   Inspect `android/app/build.gradle` lines 106-110.
4. **Inspect Full Deliverable Report**:
   View `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_r5_policy\r5_policy_audit.md`.
