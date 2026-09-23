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
