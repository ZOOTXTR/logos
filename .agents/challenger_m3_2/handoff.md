# Challenger Report: Milestone 3 (Keystore Signing, ProGuard/R8 & Version Synchronization)

**Agent**: challenger_m3_2 (Empirical Challenger)
**Milestone**: Milestone 3
**Verdict**: **APPROVE**
**Timestamp**: 2026-08-29T09:51:30Z

---

## 1. Observation

### A. Keystore Integrity & Cryptographic Parameters
- Command: keytool -list -v -keystore android/app/release.keystore -storepass logospassword
  - Keystore Type: PKCS12
  - Keystore Provider: SUN
  - Alias Name: logos-key-alias
  - Entry Type: PrivateKeyEntry
  - Owner & Issuer: CN=Logos, OU=Zovtex, O=Zovtex, L=Istanbul, ST=Istanbul, C=TR
  - Serial Number: 9fe8943c0cc7b64d
  - Validity Period: Tue Aug 04 12:57:02 TRT 2026 until Sat Dec 20 12:57:02 TRT 2053 (10,000 days / ~27.4 years, exceeding Google Play 25-year requirement)
  - Key Algorithm: 2048-bit RSA key
  - Signature Algorithm: SHA256withRSA
  - SHA-256 Fingerprint: 99:1A:9C:8A:06:B2:66:6A:A5:EA:32:0B:E1:E4:47:47:D4:05:EC:DF:47:D7:42:57:5D:DE:D6:91:9C:25:A0:FC
  - SHA-1 Fingerprint: 5A:A8:49:AD:DE:04:63:CD:31:63:29:B8:33:4D:82:4F:04:63:A8:C6
- Gradle Wiring in android/app/build.gradle:
  - signingConfigs.release.storeFile: file('release.keystore') (line 106)
  - signingConfigs.release.storePassword: 'logospassword' (line 107)
  - signingConfigs.release.keyAlias: 'logos-key-alias' (line 108)
  - signingConfigs.release.keyPassword: 'logospassword' (line 109)
  - buildTypes.release.signingConfig: signingConfigs.release (line 117)

### B. ProGuard & R8 Release Configuration & Artifact Inspection
- Gradle Properties (android/gradle.properties):
  - android.enableProguardInReleaseBuilds=true (line 29)
  - android.enableShrinkResourcesInReleaseBuilds=true (line 30)
- ProGuard Configuration (android/app/build.gradle):
  - minifyEnabled enableProguardInReleaseBuilds (line 119)
  - shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false) (line 118)
  - proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro' (line 120)
- Keep Rules (android/app/proguard-rules.pro):
  - React Native core, TurboModules, and ReactMethod reflection (lines 10-19)
  - React Native Reanimated (com.swmansion.reanimated.**, lines 21-22)
  - Screens & Gesture Handler (com.swmansion.rnscreens.**, com.swmansion.gesturehandler.**, lines 24-27)
  - Safe Area Context (com.th3rdwave.safeareacontext.**, lines 28-30)
  - SVG (com.horcrux.svg.**, lines 31-33)
  - Async Storage (com.reactnativecommunity.asyncstorage.**, lines 34-36)
  - React Native IAP / Google Play Billing (com.dooboolab.rniap.**, com.android.billingclient.**, lines 37-40)
  - Sentry (io.sentry.**, lines 41-43)
  - Expo Modules (expo.modules.**, expo.modules.kotlin.modules.Module, lines 44-47)
  - Crash Symbolication Attributes: -keepattributes SourceFile,LineNumberTable (line 49)
- R8 Mapping Artifacts (android/app/build/outputs/mapping/release/):
  - configuration.txt: 81,064 bytes - contains all aggregated ProGuard flags and consumer rules.
  - mapping.txt: 39,527,122 bytes - R8 v8.6.17 mapping (Hash: 086e20726c0637b8690cf5c28c3d5d57ad7bc530a98aca3d02a58491534bb9fb).
  - seeds.txt: 5,902,895 bytes - verified seed entries for React Native, Reanimated, BillingClient, Sentry, and Expo Modules.
  - usage.txt: 4,250,092 bytes - comprehensive listing of dead/stripped classes and methods.
  - resources.txt: 1,663,648 bytes - resource shrinker analysis.

### C. Release Bundle Verification & Signature Validation
- Bundle Path: android/app/build/outputs/bundle/release/app-release.aab
- Bundle Size: 39,624,058 bytes (~37.79 MB)
- SHA-256 Checksum: D0774257F80BF801FD1CF28DAF6654A8FBA99D46B4E40DAED079267BEF976A31
- jarsigner -verify -verbose -certs:
  - jar verified.
  - Signer certificate: CN=Logos, OU=Zovtex, O=Zovtex, L=Istanbul, ST=Istanbul, C=TR
  - Algorithm: SHA256withRSA, 2048-bit key
- Internal Archive Inspection:
  - BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map (39,527,122 bytes) embedded for Google Play de-obfuscation.
  - Native symbols in BUNDLE-METADATA/com.android.tools.build.debugsymbols/ for arm64-v8a, armeabi-v7a, x86, x86_64.
  - Bytecode: base/dex/classes.dex (7,441,872 bytes) and base/dex/classes2.dex (6,308,780 bytes).
  - JS Bundle: base/assets/index.android.bundle (4,527,336 bytes).

### D. Version Synchronization
- app.json:
  - expo.version: 1.0.2
  - expo.android.versionCode: 3
  - expo.android.targetSdkVersion: 35
- android/app/build.gradle:
  - defaultConfig.versionCode: 3
  - defaultConfig.versionName: 1.0.2
  - compileSdk: 35
  - targetSdkVersion: 35
  - minSdkVersion: 24
- Synchronization Status: 100% synchronized (versionName: 1.0.2, versionCode: 3).

### E. Codebase Stability
- npx tsc --noEmit: 0 errors (Exit code 0)
- npm test: 7/7 test suites passed, 62/62 tests passed (Exit code 0)

---

## 2. Logic Chain

1. **Keystore Integrity & Compliance**:
   - Google Play Console requires upload keys with RSA >= 2048-bit, valid for at least 25 years. android/app/release.keystore fulfills all criteria with 2048-bit RSA, SHA256withRSA, and validity extending to December 2053 (27+ years).
   - The gradle release build configuration links directly to release.keystore using the exact alias and password.
   - jarsigner validation on app-release.aab confirmed cryptographic verification with the exact certificate subject and algorithm.

2. **R8/ProGuard & Resource Shrinking Verification**:
   - The existence, size, and contents of configuration.txt, mapping.txt (39.5 MB), seeds.txt, usage.txt, and resources.txt prove that R8 and resource shrinking executed in full during :app:minifyReleaseWithR8 and :app:shrinkBundleReleaseResources.
   - Inspection of seeds.txt confirmed that critical runtime reflection boundaries (React Native TurboModules, Reanimated worklets, Google Play BillingClient, Sentry crash handlers, and Expo Kotlin modules) are preserved.
   - ProGuard mappings are directly packaged in BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map inside the .aab file, enabling automated Google Play crash symbolication.

3. **Version Synchronization**:
   - In Expo Prebuild / Bare React Native workflows, app.json and build.gradle must be aligned so that both Expo updates/runtime and Google Play store ingestion interpret the identical version number (1.0.2) and versionCode (3). Both files are fully synchronized.

---

## 3. Caveats

- **CI/CD Keystore Storage**: The keystore and password credentials are currently located locally within android/app/release.keystore and build.gradle. For remote cloud CI/CD pipelines (e.g. GitHub Actions / EAS Build), store passwords and keystore files should be injected via environment secrets (KEYSTORE_BASE64, KEYSTORE_PASSWORD).
- The build process requires Java 21 LTS (C:\Users\mhmto\.jdks\jbr-21.0.11) to compile successfully with AGP 8.6.0.

---

## 4. Conclusion

Milestone 3 has been thoroughly tested, empirically verified, and meets all security, release, and packaging requirements.
- Keystore validity and cryptographic signing: **PASS**
- ProGuard / R8 rules & release mapping generation: **PASS**
- Production AAB packaging & signature: **PASS**
- Version synchronization (1.0.2 / 3): **PASS**
- Test suites & TypeScript compilation: **PASS**

**Final Verdict**: **APPROVE**

---

## 5. Verification Method

To independently reproduce all empirical verification checks:

1. **Verify Keystore Validity & Parameters**:
   powershell: & C:\Users\mhmto\.jdks\jbr-21.0.11\bin\keytool.exe -list -v -keystore android/app/release.keystore -storepass logospassword

2. **Verify AAB Signature with Jarsigner**:
   powershell: & C:\Users\mhmto\.jdks\jbr-21.0.11\bin\jarsigner.exe -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab

3. **Verify ProGuard / R8 Mapping Outputs**:
   powershell: Get-ChildItem -Path android/app/build/outputs/mapping/release

4. **Verify Version Synchronization**:
   powershell: Select-String -Path app.json -Pattern 'version|versionCode'
   powershell: Select-String -Path android/app/build.gradle -Pattern 'versionCode|versionName'

5. **Verify TypeScript & Test Suite**:
   powershell: npx tsc --noEmit
   powershell: npm test
