import React from 'react';
import { Text as RNText, TextProps, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function Text({ style, ...props }: TextProps) {
  const { dyslexiaFont } = useTheme();
  
  if (!dyslexiaFont) return <RNText style={style} {...props} />;
  
  const dfStyle = { fontFamily: 'monospace', fontWeight: 'normal' };
  
  return <RNText style={[style, dfStyle as any]} {...props} />;
}
