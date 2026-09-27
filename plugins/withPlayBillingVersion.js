// Google Play, yeni surumlerde Play Billing Library 8.0.0+ zorunlu kilar.
// react-native-iap@12 varsayilan 7.0.0 kullanir; modulun `getExtOrDefault("playBillingSdkVersion")`
// override'ini destekledigi icin root ext'e bu degeri yazarak billing-ktx surumunu 8.0.0'a cikarir.
// (Native uyumluluk duzeltmesi: patches/react-native-iap+12.16.4.patch)
const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withPlayBillingVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }
    let gradle = config.modResults.contents;
    if (!gradle.includes('playBillingSdkVersion')) {
      gradle = gradle.replace(/ext\s*\{/, "ext {\n        playBillingSdkVersion = '8.0.0'");
    }
    config.modResults.contents = gradle;
    return config;
  });
};
