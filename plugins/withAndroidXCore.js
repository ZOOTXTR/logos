// TODO(android-build): Bu plugin bir WORKAROUND'dur.
// AGP 8.6.0, androidx.core 1.18+ sürümünü derleyemediği için androidx.core'u
// global olarak 1.15.0'a sabitliyoruz. Kalıcı çözüm: Android Gradle Plugin'i
// 8.9.1+ sürüme yükseltip bu `force` bloğunu kaldırmak; aksi halde daha yeni
// core isteyen bir kütüphane eklendiğinde çakışma tekrarlar.
const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidXCore(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;
      if (!buildGradle.includes('androidx.core:core-ktx:1.15.0')) {
        config.modResults.contents = buildGradle.replace(
          /allprojects\s*\{/,
          `allprojects {\n    configurations.all {\n        resolutionStrategy {\n            force 'androidx.core:core:1.15.0'\n            force 'androidx.core:core-ktx:1.15.0'\n        }\n    }`
        );
      }
    }
    return config;
  });
};
