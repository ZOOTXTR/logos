// react-native-iap `store` flavor (amazon/play) belirsizliğini çözer.
// `expo prebuild` android/app/build.gradle'ı yeniden ürettiği için, elle eklenen
// `missingDimensionStrategy "store", "play"` kaybolur. Bu plugin defaultConfig'e
// kalıcı olarak ekler.
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withIAPStoreFlavor(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }
    let gradle = config.modResults.contents;
    if (!gradle.includes('missingDimensionStrategy "store"')) {
      gradle = gradle.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        missingDimensionStrategy "store", "play"`
      );
    }
    config.modResults.contents = gradle;
    return config;
  });
};
