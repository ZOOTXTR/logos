// Release imzalama plugin'i.
// `expo prebuild --clean` android/app/build.gradle'ı yeniden ürettiği için,
// elle eklenen release signingConfig kaybolur. Bu plugin, ortam değişkenleri
// verildiğinde env'den beslenen bir `signingConfigs.release` bloğu enjekte eder
// ve release buildType'unu bu imzaya bağlar (lokal ve CI'da aynı davranış).
//
// Gerekli ortam değişkenleri (yoksa plugin no-op olur):
//   ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_BLOCK = `
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }`;

module.exports = function withReleaseSigning(config) {
  if (!process.env.ANDROID_KEYSTORE_PATH) {
    return config;
  }
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }
    let gradle = config.modResults.contents;

    if (!gradle.includes('System.getenv("ANDROID_KEY_ALIAS")')) {
      gradle = gradle.replace(/signingConfigs\s*\{/, (match) => `${match}\n${RELEASE_BLOCK}`);
    }

    gradle = gradle.replace(
      /(\/\/ Caution! In production[\s\S]*?\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\s*\n\s*)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = gradle;
    return config;
  });
};
