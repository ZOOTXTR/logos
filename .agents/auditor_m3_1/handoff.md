# Forensic Audit Report: Milestone 3 (Build, ProGuard/R8 & Release Automation)

**Auditor**: auditor_m3_1 (Forensic Auditor)  
**Date**: 2026-08-29  
**Work Product**: Milestone 3 Release Artifacts & Gradle/ProGuard Configuration  
**Profile**: General Project  
**Verdict**: **CLEAN**

---

## 1. Observation

### 1.1 Android App Bundle (`app-release.aab`) Forensic Analysis
- **File Location**: `android/app/build/outputs/bundle/release/app-release.aab`
- **File Size**: `39,624,058` bytes (37.79 MB)
- **SHA-256 Checksum**: `D0774257F80BF801FD1CF28DAF6654A8FBA99D46B4E40DAED079267BEF976A31`
- **Archive Structure**: Total of `1,349` zip entries structured across standard Android App Bundle specification:
  - `BundleConfig.pb`: 628 bytes (BundleTool 1.16.0 configuration)
  - `BUNDLE-METADATA/`: 25 files containing native unstripped debug symbols across 4 architectures (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) for `libexpo-av.so`, `libexpo-modules-core.so`, `libreanimated.so`, `librnscreens.so`, `libworklets.so`.
  - `base/dex/`: Contains genuine Dalvik executable binaries:
    - `classes.dex`: 7,441,872 bytes (DEX v037 header magic `dex\n037\x00`)
    - `classes2.dex`: 6,308,780 bytes (DEX v037 header magic `dex\n037\x00`)
    - Verified contains application and framework symbols: `com/zovtex/logos`, `MainApplication`, `MainActivity`, `com/facebook/react`, `com/swmansion/reanimated`.
  - `base/assets/index.android.bundle`: 4,527,336 bytes of authentic compiled Hermes bytecode with magic header `\xc6\x1f\xbc\x03` (`c61fbc03c103191f60000000f46a69ee`).
  - `base/lib/`: 76 native `.so` shared libraries for all 4 supported ABIs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) including `libhermes.so`, `libreanimated.so`, `libexpo-av.so`, `libexpo-modules-core.so`, `libjsi.so`, `libfbjni.so`, `libc++_shared.so`.
  - `base/manifest/AndroidManifest.xml`: 25,388 bytes compiled XML protobuf.
  - `base/resources.pb`: 1,310,800 bytes resource table.
  - `base/res/`: 967 compiled Android resource assets.

### 1.2 Cryptographic Signing Verification
- `META-INF/MANIFEST.MF`: 171,463 bytes
- `META-INF/LOGOS-KE.SF`: 171,512 bytes (`Created-By: Signflinger`)
- `META-INF/LOGOS-KE.RSA`: 1,361 bytes PKCS#7 signature block
- `release.keystore` verification (`keytool -list -v`):
  - Alias: `logos-key-alias`
  - Keystore type: `PKCS12`
  - Certificate Fingerprint SHA-256: `99:1A:9C:8A:06:B2:66:6A:A5:EA:32:0B:E1:E4:47:47:D4:05:EC:DF:47:D7:42:57:5D:DE:D6:91:9C:25:A0:FC`
  - Validity: Aug 4, 2026 to Dec 20, 2053 (27 years)
  - Subject / Issuer: `CN=Logos, OU=Zovtex, O=Zovtex, L=Istanbul, ST=Istanbul, C=TR`

### 1.3 R8 / ProGuard Minification & Resource Shrinking Verification
- Output files in `android/app/build/outputs/mapping/release/`:
  - `mapping.txt`: 39,527,122 bytes (39.5 MB obfuscation/mapping symbol map)
  - `seeds.txt`: 5,902,895 bytes (classes preserved according to keep rules)
  - `usage.txt`: 4,250,092 bytes (classes/methods stripped by dead code elimination)
  - `configuration.txt`: 81,064 bytes (merged ProGuard rules applied)
  - `resources.txt`: 1,663,648 bytes (39,440 lines of resource shrinking logs)
- Custom Keep Rules in `android/app/proguard-rules.pro` verified present in `configuration.txt`:
  - `com.facebook.react.**` (React Native core)
  - `com.swmansion.reanimated.**` (Reanimated)
  - `com.swmansion.rnscreens.**` (Screens)
  - `com.swmansion.gesturehandler.**` (Gesture Handler)
  - `com.th3rdwave.safeareacontext.**` (Safe Area)
  - `com.horcrux.svg.**` (SVG)
  - `com.reactnativecommunity.asyncstorage.**` (Async Storage)
  - `com.dooboolab.rniap.**` & `com.android.billingclient.**` (In-App Purchases)
  - `io.sentry.**` (Sentry)
  - `expo.modules.**` (Expo Modules)

### 1.4 Configuration & Version Synchronization
- `app.json`:
  - `version`: `"1.0.2"`
  - `android.versionCode`: `3`
  - `android.targetSdkVersion`: `35`
  - `android.package`: `"com.zovtex.logos"`
- `android/app/build.gradle`:
  - `versionCode`: `3`
  - `versionName`: `"1.0.2"`
  - `targetSdkVersion`: `35`
  - `compileSdk`: `35`
  - `minSdkVersion`: `24`
  - `minifyEnabled`: evaluates to `true`
  - `shrinkResources`: evaluates to `true`
  - `signingConfigs.release`: references `release.keystore` with alias `logos-key-alias`
- `android/gradle.properties`:
  - `android.enableProguardInReleaseBuilds=true`
  - `android.enableShrinkResourcesInReleaseBuilds=true`
  - `hermesEnabled=true`
  - `android.enablePngCrunchInReleaseBuilds=true`

### 1.5 Codebase Quality & Prohibited Patterns Scan
- Prohibited patterns scan (`return true; // fake`, facade implementations, dummy stubs): 0 matches.
- `npx tsc --noEmit`: 0 errors (Exit code 0).
- `npm test`: 7/7 test suites passed, 62/62 tests passed (Exit code 0).

---

## 2. Logic Chain

1. **Authentic Bundle Construction**:
   - The `.aab` file is not a renamed zip or empty dummy file. Bytecode analysis proves it contains genuine DEX v037 Dalvik bytecode (13.75 MB total across two dex files) and genuine Hermes JS engine bytecode (4.53 MB) matching the application's React Native components and assets.
   - The archive contains all 4 ABI shared libraries (76 `.so` files) and unstripped debug symbols for crash symbolication.

2. **R8 Execution & Rule Preservation**:
   - The generated 39.5 MB `mapping.txt` and 4.25 MB `usage.txt` prove that R8 compiler actively executed bytecode shrinking and tree shaking.
   - Cross-referencing `configuration.txt` against `proguard-rules.pro` confirms that all critical native modules, reflection points, and billing interfaces were preserved to prevent runtime failures.

3. **Cryptographic Integrity & Store Readiness**:
   - The bundle was signed by AGP's `Signflinger` using the verified PKCS12 `release.keystore` (valid until 2053).
   - Version attributes are synchronized across `app.json` (`1.0.2` / `3`) and `android/app/build.gradle` (`1.0.2` / `3`), meeting all Google Play upload requirements.

4. **Zero Prohibited Shortcuts**:
   - No mock bypasses, hardcoded test strings, or fake outputs were detected. All verification was conducted via direct empirical inspection of binary and source artifacts.

---

## 3. Caveats

- **No Caveats**: The audit covered binary inspection, bytecode header validation, cryptographic signatures, R8 mapping outputs, source configuration, TypeScript compilation, and test execution.

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone 3 has met all acceptance criteria with full integrity:
- `app-release.aab` is a 100% genuine, compiled, and cryptographically signed Android App Bundle ready for Google Play Console upload.
- ProGuard / R8 minification and resource shrinking are enabled and functioning correctly.
- Version numbers and API levels (target SDK 35, version 1.0.2, versionCode 3) are synchronized.
- Zero integrity violations or bypasses found.

---

## 5. Verification Method

To independently reproduce the forensic verification:

1. **Verify AAB File Size and SHA-256 Hash**:
   ```powershell
   Get-Item "android\app\build\outputs\bundle\release\app-release.aab" | Format-List FullName, Length
   Get-FileHash "android\app\build\outputs\bundle\release\app-release.aab" -Algorithm SHA256
   ```

2. **Verify Hermes Bytecode and DEX Headers**:
   ```powershell
   python -c "
   import zipfile
   with zipfile.ZipFile(r'android\app\build\outputs\bundle\release\app-release.aab', 'r') as z:
       print('Hermes Magic:', z.read('base/assets/index.android.bundle')[:4].hex())
       print('DEX1 Magic:', z.read('base/dex/classes.dex')[:8])
       print('DEX2 Magic:', z.read('base/dex/classes2.dex')[:8])
   "
   ```

3. **Verify Keystore Validity & Alias**:
   ```powershell
   & "C:\Users\mhmto\.jdks\jbr-21.0.11\bin\keytool.exe" -list -v -keystore android/app/release.keystore -storepass logospassword
   ```

4. **Verify TypeScript & Test Suite**:
   ```powershell
   npx tsc --noEmit
   npm test
   ```
