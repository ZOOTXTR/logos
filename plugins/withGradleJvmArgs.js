// Gradle JVM heap'ini yükseltir. Expo'nun varsayılanı -Xmx2048m olup bu proje
// (R8 + resource shrinking + 7 native modül) için yetmez; paketleme OOM ile ölür.
// `expo prebuild` gradle.properties'i yeniden ürettiği için bu plugin kalıcı kılar.
const { withGradleProperties } = require('expo/config-plugins');

const JVM_ARGS = '-Xmx4g -XX:MaxMetaspaceSize=1g';

module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;
    const existing = props.find((p) => p.type === 'property' && p.key === 'org.gradle.jvmargs');
    if (existing) {
      existing.value = JVM_ARGS;
    } else {
      props.push({ type: 'property', key: 'org.gradle.jvmargs', value: JVM_ARGS });
    }
    return config;
  });
};
