import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// Erişilebilirlik: sistem yazı boyutu büyütüldüğünde düzenin bozulmaması için
// varsayılan olarak ölçeklemeyi sınırlıyoruz. Çağıran taraf isterse override eder.
export function Text({ style, maxFontSizeMultiplier, allowFontScaling, ...props }: TextProps) {
  const { dyslexiaFont } = useTheme();

  const scaleProps = {
    allowFontScaling: allowFontScaling ?? true,
    maxFontSizeMultiplier: maxFontSizeMultiplier ?? 1.4,
  };

  if (!dyslexiaFont) return <RNText style={style} {...scaleProps} {...props} />;

  const dfStyle: TextStyle = { fontFamily: 'monospace', fontWeight: 'normal' };

  return <RNText style={[style, dfStyle]} {...scaleProps} {...props} />;
}
