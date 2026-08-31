# Android Native & Build System Survey Report

**Project**: Logos: Kelime Avı ve Bulmaca (`com.zovtex.logos`)  
**Surveyor**: explorer_survey_2  
**Date**: 2026-08-29  
**Target Platform**: Android (SDK 24 - 35)

---

## Executive Summary

The Android project is built on React Native 0.76.9 with Expo SDK 52 (prebuild native project structure). The project is already aligned with Android 15 (Target SDK 35, Compile SDK 35, Build-Tools 35.0.0, Min SDK 24). The release signing configuration is configured with a valid PKCS12 release keystore (`release.keystore` valid until 2053). 

However, critical remediation items were discovered:
1. **Manifest Permissions Risk**: `RECORD_AUDIO` (microphone) and `SYSTEM_ALERT_WINDOW` (overlay) are declared in `android/app/src/main/AndroidManifest.xml`. Audio recording is unused in the application (the game only performs playback and haptics), and `SYSTEM_ALERT_WINDOW` belongs strictly in debug. In release, these trigger high-risk permission warnings and potential Google Play rejection. Deprecated storage permissions (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`) are also declared unnecessarily.
2. **ProGuard / R8 Status**: Release minification (`minifyEnabled`) and resource shrinking (`shrinkResources`) are currently **disabled** because the corresponding flags are omitted from `gradle.properties`. Furthermore, `proguard-rules.pro` lacks comprehensive keep rules for `react-native-iap`, `@sentry/react-native`, Expo modules, and Async Storage.
3. **Build Environment & Tooling**: Gradle 8.10.2 requires Java 21 LTS (`C:\Users\mhmto\.jdks\jbr-21.0.11`) to compile smoothly.

---

## 1. Build System & Gradle Configuration

### 1.1 Gradle Wrapper & Environment
- **File**: `android/gradle/wrapper/gradle-wrapper.properties`
- **Gradle Version**: `8.10.2` (`distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip`)
- **Android Gradle Plugin (AGP)**: `8.6.0` (resolved via `com.android.tools.build:gradle`)
- **Kotlin Version**: `1.9.25`
- **JDK Requirement**: Gradle 8.10.2 + AGP 8.6.0 runs reliably on Java 21 LTS (`JAVA_HOME = C:\Users\mhmto\.jdks\jbr-21.0.11`). Verified via `./gradlew.bat help` (Build Successful).

### 1.2 Root Project Configuration
- **File**: `android/build.gradle`
- **Ext Block Configuration**:
  ```groovy
  buildToolsVersion = findProperty('android.buildToolsVersion') ?: '35.0.0'
  minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
  compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
  targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '35')
  kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.25'
  ndkVersion = "26.1.10909125"
  ```
- **Plugins**: `com.facebook.react.rootproject`
- **Repositories**: Google Maven, MavenCentral, local NPM React Native Android binaries, JSC Android binaries, JitPack.

### 1.3 App Module Configuration
- **File**: `android/app/build.gradle`
- **Namespace**: `com.zovtex.logos`
- **Application ID**: `com.zovtex.logos`
- **DefaultConfig**:
  - `missingDimensionStrategy "store", "play"` (Required for `react-native-iap`)
  - `minSdkVersion`: 24
  - `targetSdkVersion`: 35
  - `versionCode`: 2
  - `versionName`: "1.0.1"
- **React Configuration**:
  - `cliFile`: Resolved via `@expo/cli`
  - `bundleCommand`: `"export:embed"`
  - `autolinkLibrariesWithApp()`: Autolinks all native Expo and React Native packages.

### 1.4 Gradle Properties
- **File**: `android/gradle.properties`
- **Current Settings**:
  ```properties
  org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
  android.useAndroidX=true
  android.enablePngCrunchInReleaseBuilds=true
  reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
  newArchEnabled=false
  hermesEnabled=true
  expo.gif.enabled=true
  expo.webp.enabled=true
  expo.webp.animated=false
  EX_DEV_CLIENT_NETWORK_INSPECTOR=true
  expo.useLegacyPackaging=false
  ```
- **Missing Settings**:
  - `android.enableProguardInReleaseBuilds=true`
  - `android.enableShrinkResourcesInReleaseBuilds=true`
  - `android.buildToolsVersion=35.0.0`
  - `android.compileSdkVersion=35`
  - `android.targetSdkVersion=35`
  - `android.minSdkVersion=24`

---

## 2. Android Manifest & Permission Model Compliance (Android 14/15 / SDK 34/35)

### 2.1 Declared Permissions Audit (`android/app/src/main/AndroidManifest.xml`)

| Permission | Protection Level | Purpose in App | Compliance Status & Action |
|---|---|---|---|
| `android.permission.INTERNET` | Normal | API calls, cloud sync, Sentry | ✅ **Valid & Required** |
| `android.permission.MODIFY_AUDIO_SETTINGS` | Normal | Audio routing / volume (`expo-av`) | ✅ **Valid & Required** |
| `android.permission.POST_NOTIFICATIONS` | Runtime (API 33+) | Streak reminders & daily puzzles | ✅ **Valid & Required** (Compliant with Android 13+) |
| `android.permission.READ_EXTERNAL_STORAGE` | Dangerous (Legacy) | None (Storage is app-private) | ⚠️ **Redundant / Deprecated**. On API 33+, superseded. Should be removed. |
| `android.permission.RECEIVE_BOOT_COMPLETED` | Normal | Reschedule notifications on reboot | ✅ **Valid & Required** |
| `android.permission.RECORD_AUDIO` | Dangerous (Microphone) | **Unused** (Game only plays audio) | 🚨 **CRITICAL VIOLATION**: Unnecessary dangerous permission. Must be removed to prevent Play Store review rejection. |
| `android.permission.SYSTEM_ALERT_WINDOW` | Special App Access | RN Dev Menu (Debug only) | 🚨 **CRITICAL VIOLATION**: Special overlay permission in release manifest. Must be removed from `main` (kept in `debug` only). |
| `android.permission.VIBRATE` | Normal | Haptic feedback (`expo-haptics`) | ✅ **Valid & Required** |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Dangerous (Legacy) | None | ⚠️ **Redundant / Deprecated**. Obsolete on API 34/35. Should be removed. |
| `com.android.vending.BILLING` | Normal | Play Store In-App Purchases | ✅ **Valid & Required** (`react-native-iap`) |

### 2.2 Android 14/15 Permission & Architectural Compliance
1. **Foreground Services**:
   - Android 14 (API 34) mandates `FOREGROUND_SERVICE` type declarations (`mediaPlayback`, `dataSync`, etc.).
   - Survey Finding: Logos does not initiate any foreground service. All background actions run via standard Alarm/JobScheduler receivers (`NotificationsService`, `JobInfoSchedulerService`). No foreground service permissions required.
2. **Dynamic Broadcast Receivers (`RECEIVER_EXPORTED` / `RECEIVER_NOT_EXPORTED`)**:
   - Android 14 requires explicit export flags when registering runtime broadcast receivers.
   - Merged manifest incorporates `com.zovtex.logos.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (signature protection level) provided by `androidx.core`. All custom receivers in manifest explicitly set `android:exported="false"`.
3. **Photo / Media Access**:
   - Android 14 introduces Selected Photos Access (`READ_MEDIA_VISUAL_USER_SELECTED`). The application does not access device media libraries, so no media permissions are declared or needed.

---

## 3. SDK Versioning & Naming Consistency

### 3.1 Version Comparison Table

| Property | `android/build.gradle` | `android/app/build.gradle` | `app.json` | `package.json` | Target Release Goal |
|---|---|---|---|---|---|
| `compileSdkVersion` | 35 | 35 | N/A | N/A | 35 (Android 15) |
| `targetSdkVersion` | 35 | 35 | 35 | N/A | 35 (Android 15) |
| `minSdkVersion` | 24 | 24 | N/A | N/A | 24 (Android 7.0) |
| `buildToolsVersion` | 35.0.0 | 35.0.0 | N/A | N/A | 35.0.0 |
| `versionCode` | N/A | 2 | 2 | N/A | 3 (Increment for release) |
| `versionName` | N/A | "1.0.1" | "1.0.1" | "1.0.0" | "1.0.2" (or "1.0.1") |

### 3.2 Key Finding
- Both `build.gradle` and `app.json` are currently in sync (`versionCode: 2`, `versionName: "1.0.1"`).
- Target SDK 35 satisfies Google Play's 2026 requirement (Target SDK 34+ mandatory, 35 recommended).
- When preparing the final production bundle, `versionCode` should be incremented (e.g. to `3`) and `versionName` to `"1.0.2"` across both `android/app/build.gradle` and `app.json`.

---

## 4. ProGuard / R8 Code & Resource Shrinking

### 4.1 Current Setup
- `android/app/build.gradle`:
  ```groovy
  def enableProguardInReleaseBuilds = (findProperty('android.enableProguardInReleaseBuilds') ?: false).toBoolean()
  ...
  buildTypes {
      release {
          signingConfig signingConfigs.release
          shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
          minifyEnabled enableProguardInReleaseBuilds
          proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
          crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)
      }
  }
  ```
- **Finding**: Currently, `minifyEnabled` evaluates to `false` and `shrinkResources` evaluates to `false` because `android.enableProguardInReleaseBuilds` is absent from `gradle.properties`.

### 4.2 ProGuard Rules File (`android/app/proguard-rules.pro`)
Currently only contains:
```proguard
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
```

### 4.3 Recommended ProGuard / R8 Rules for Release
To prevent runtime crashes when R8 minification is enabled, `android/app/proguard-rules.pro` should be expanded with rules for all linked libraries:

```proguard
# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactMethod ** *;
}

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# React Native Screens & Gesture Handler
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# React Native Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native IAP (Google Play Billing)
-keep class com.dooboolab.rniap.** { *; }
-keep class com.android.billingclient.** { *; }

# Sentry React Native
-keep class io.sentry.** { *; }

# Expo Modules
-keep class expo.modules.** { *; }
-keep class * extends expo.modules.kotlin.modules.Module { *; }

# Retain line numbers for crash symbolication
-keepattributes SourceFile,LineNumberTable
```

---

## 5. Signing Configurations & Keystores

### 5.1 Keystore Inventory

#### Debug Keystore
- **Path**: `android/app/debug.keystore`
- **Type**: JKS
- **Alias**: `androiddebugkey`
- **Store Password**: `android`
- **Key Password**: `android`
- **SHA-256**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
- **Validity**: Jan 1, 2014 – May 1, 2052

#### Release Keystore
- **Path**: `android/app/release.keystore`
- **Type**: PKCS12
- **Alias**: `logos-key-alias`
- **Store Password**: `logospassword`
- **Key Password**: `logospassword`
- **Certificate Owner**: `CN=Logos, OU=Zovtex, O=Zovtex, L=Istanbul, ST=Istanbul, C=TR`
- **SHA-1**: `5A:A8:49:AD:DE:04:63:CD:31:63:29:B8:33:4D:82:4F:04:63:A8:C6`
- **SHA-256**: `99:1A:9C:8A:06:B2:66:6A:A5:EA:32:0B:E1:E4:47:47:D4:05:EC:DF:47:D7:42:57:5D:DE:D6:91:9C:25:A0:FC`
- **Validity**: Aug 4, 2026 – Dec 20, 2053 (27 years)
- **Key Spec**: 2048-bit RSA, `SHA256withRSA` signature algorithm

### 5.2 Build Configuration Wiring
- `android/app/build.gradle` lines 98–123 correctly define `signingConfigs.release` pointing to `file('release.keystore')` and apply it to `buildTypes.release.signingConfig`.
- Release AAB (`bundleRelease`) and APK (`assembleRelease`) are fully configured to produce signed release artifacts out of the box.

---

## 6. Actionable Recommendations for Implementation Phase

1. **Manifest Clean-up (`android/app/src/main/AndroidManifest.xml`)**:
   - Remove `<uses-permission android:name="android.permission.RECORD_AUDIO"/>`
   - Remove `<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>` (keep only in `src/debug/AndroidManifest.xml`)
   - Remove `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>`
   - Remove `<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>`
2. **Enable R8 / ProGuard in `android/gradle.properties`**:
   - Add `android.enableProguardInReleaseBuilds=true`
   - Add `android.enableShrinkResourcesInReleaseBuilds=true`
   - Add explicit SDK version properties:
     - `android.compileSdkVersion=35`
     - `android.targetSdkVersion=35`
     - `android.minSdkVersion=24`
     - `android.buildToolsVersion=35.0.0`
3. **Update `android/app/proguard-rules.pro`**:
   - Add comprehensive keep rules for `react-native-iap`, `@sentry/react-native`, `expo.modules`, `async-storage`, `reanimated`, `screens`, and keep line numbers.
4. **Version Increment for Release**:
   - Increment `versionCode` to `3` and `versionName` to `"1.0.2"` in `android/app/build.gradle` and `app.json`.
5. **Build Automation**:
   - Build release bundle using:
     ```powershell
     $env:JAVA_HOME="C:\Users\mhmto\.jdks\jbr-21.0.11"
     .\gradlew.bat bundleRelease
     ```
   - Verify generated `.aab` in `android/app/build/outputs/bundle/release/app-release.aab`.
