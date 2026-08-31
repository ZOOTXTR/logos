# Handoff Report — Android Native & Build System Survey

**Agent**: explorer_survey_2  
**Role**: Android Native & Build System Surveyor  
**Date**: 2026-08-29  
**Full Report**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_survey_2\survey_android_build.md`

---

## 1. Observation

1. **Gradle Build Scripts & Versioning**:
   - `android/build.gradle` lines 5–9:
     ```groovy
     buildToolsVersion = findProperty('android.buildToolsVersion') ?: '35.0.0'
     minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
     compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
     targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '35')
     kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.25'
     ```
   - `android/app/build.gradle` lines 91–97:
     ```groovy
     missingDimensionStrategy "store", "play"
     applicationId 'com.zovtex.logos'
     minSdkVersion rootProject.ext.minSdkVersion
     targetSdkVersion rootProject.ext.targetSdkVersion
     versionCode 2
     versionName "1.0.1"
     ```
   - `app.json` lines 27–30:
     ```json
     "package": "com.zovtex.logos",
     "versionCode": 2,
     "targetSdkVersion": 35,
     ```
   - `android/gradle/wrapper/gradle-wrapper.properties` line 3:
     ```properties
     distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip
     ```

2. **Manifest Permissions**:
   - `android/app/src/main/AndroidManifest.xml` lines 2–11:
     ```xml
     <uses-permission android:name="android.permission.INTERNET"/>
     <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
     <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
     <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
     <uses-permission android:name="android.permission.RECORD_AUDIO"/>
     <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
     <uses-permission android:name="android.permission.VIBRATE"/>
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
     <uses-permission android:name="com.android.vending.BILLING"/>
     ```
   - `android/app/src/debug/AndroidManifest.xml` line 4:
     ```xml
     <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
     ```
   - Codebase search: Audio recording (`RECORD_AUDIO`) is not referenced in any `.ts`/`.tsx` file. `services/audio.service.ts` only implements sound effects playback (`Audio.Sound.createAsync`) and haptics (`expo-haptics`).

3. **ProGuard / R8 Configuration**:
   - `android/app/build.gradle` line 68 & lines 118–121:
     ```groovy
     def enableProguardInReleaseBuilds = (findProperty('android.enableProguardInReleaseBuilds') ?: false).toBoolean()
     ...
     shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
     minifyEnabled enableProguardInReleaseBuilds
     proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
     ```
   - `android/gradle.properties`: does NOT contain `android.enableProguardInReleaseBuilds` or `android.enableShrinkResourcesInReleaseBuilds`. Thus both default to `false`.
   - `android/app/proguard-rules.pro` only contains rules for `com.swmansion.reanimated` and `com.facebook.react.turbomodule`.

4. **Signing Configuration**:
   - `android/app/build.gradle` lines 105–110:
     ```groovy
     release {
         storeFile file('release.keystore')
         storePassword 'logospassword'
         keyAlias 'logos-key-alias'
         keyPassword 'logospassword'
     }
     ```
   - Keystore inspection via `keytool.exe`:
     - File: `android/app/release.keystore`
     - Type: `PKCS12`, Alias: `logos-key-alias`
     - Validity: Aug 4, 2026 to Dec 20, 2053
     - Owner: `CN=Logos, OU=Zovtex, O=Zovtex, L=Istanbul, ST=Istanbul, C=TR`
     - Fingerprint SHA256: `99:1A:9C:8A:06:B2:66:6A:A5:EA:32:0B:E1:E4:47:47:D4:05:EC:DF:47:D7:42:57:5D:DE:D6:91:9C:25:A0:FC`

5. **Gradle Evaluation & JDK Environment**:
   - Execution of `$env:JAVA_HOME="C:\Users\mhmto\.jdks\jbr-21.0.11"; .\gradlew.bat help` exited with code 0 (`BUILD SUCCESSFUL in 3m 23s`, 19 actionable tasks, AGP 8.6.0, Gradle 8.10.2, 17 Expo modules linked).

---

## 2. Logic Chain

1. **SDK Compliance**: Observation 1 confirms `compileSdkVersion: 35`, `targetSdkVersion: 35`, `minSdkVersion: 24`, and `buildToolsVersion: 35.0.0` in `android/build.gradle` and `app.json`. Therefore, the app already satisfies Google Play's 2026 Target SDK requirement (API 34/35).
2. **Permission Safety & Privacy Compliance**: Observation 2 shows `RECORD_AUDIO` and `SYSTEM_ALERT_WINDOW` in `src/main/AndroidManifest.xml`. Because the game has zero audio recording functionality and `SYSTEM_ALERT_WINDOW` is already in `src/debug/AndroidManifest.xml`, keeping them in `src/main/AndroidManifest.xml` creates high-risk Play Store policy review triggers and permission bloat. `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` are obsolete on API 34/35 and should also be stripped.
3. **Release Optimization (R8/ProGuard)**: Observation 3 shows R8 minification and resource shrinking are disabled because `gradle.properties` lacks `android.enableProguardInReleaseBuilds=true` and `android.enableShrinkResourcesInReleaseBuilds=true`. When enabled, `proguard-rules.pro` needs additional rules for `@react-native-async-storage`, `react-native-iap`, `@sentry/react-native`, and `expo.modules` to prevent runtime stripping.
4. **Release Signing**: Observation 4 confirms `release.keystore` is valid until 2053, matches the alias and password in `build.gradle`, and is linked to `buildTypes.release.signingConfig`.

---

## 3. Caveats

- **Active profiling / runtime execution**: Testing release APK / AAB on a physical device was not performed during this read-only survey.
- **Java Home Path**: The system default `JAVA_HOME` must point to JDK 21 (`C:\Users\mhmto\.jdks\jbr-21.0.11`) rather than the preview JDK 25 during builds.

---

## 4. Conclusion

The Android native build configuration is structurally sound and aligned with Target SDK 35, Gradle 8.10.2, and valid PKCS12 release signing. Prior to executing the release bundle build (`gradlew bundleRelease`), the implementer needs to:
1. Clean up unused permissions in `android/app/src/main/AndroidManifest.xml` (`RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`).
2. Add `android.enableProguardInReleaseBuilds=true` and `android.enableShrinkResourcesInReleaseBuilds=true` to `android/gradle.properties`.
3. Add comprehensive keep rules to `android/app/proguard-rules.pro`.
4. Increment `versionCode` (e.g. to 3) and `versionName` (e.g. to "1.0.2") in `android/app/build.gradle` and `app.json`.

---

## 5. Verification Method

1. **Inspect Survey Report**:
   - `view_file` on `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\.agents\explorer_survey_2\survey_android_build.md`.
2. **Verify Keystore Validity**:
   - Run: `& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore android/app/release.keystore -storepass logospassword`
3. **Verify Gradle Dry-Run**:
   - Run: `$env:JAVA_HOME="C:\Users\mhmto\.jdks\jbr-21.0.11"; .\gradlew.bat help` in `android/`.
