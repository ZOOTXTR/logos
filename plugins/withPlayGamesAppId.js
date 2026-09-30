// Google Play Games Services için `com.google.android.gms.games.APP_ID` meta-data'sını
// AndroidManifest'e ekler. APP_ID, Play Console → Play Games Services kurulumundan alınır.
// `app.json` → expo.extra.playGamesAppId boşsa hiçbir şey eklenmez (buton da gizlenir).
const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

module.exports = function withPlayGamesAppId(config) {
  const appId = config?.extra?.playGamesAppId;
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const metas = application['meta-data'] || [];
    application['meta-data'] = metas.filter(
      (m) => m?.$?.['android:name'] !== 'com.google.android.gms.games.APP_ID'
    );
    if (appId) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.games.APP_ID',
          'android:value': String(appId),
        },
      });
    }
    return config;
  });
};
