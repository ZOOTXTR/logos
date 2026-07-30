import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { audioService } from '../services/audio.service';

export interface AlertButtonConfig {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'default' | 'destructive';
}

export function AlertButton({
  button,
  primary,
  primaryDark,
  textSecondary,
  border,
  onClose,
  layout,
}: {
  button: AlertButtonConfig;
  primary: string;
  primaryDark: string;
  textSecondary: string;
  border: string;
  onClose: () => void;
  layout: 'row' | 'column';
}) {
  const press = () => {
    audioService.triggerHaptic('light');
    (button.onPress || onClose)();
  };

  if (button.style === 'cancel') {
    return (
      <TouchableOpacity
        style={[styles.btn, layout === 'column' && styles.btnFull, styles.btnCancel, { borderColor: border }]}
        onPress={press}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnTextCancel, { color: textSecondary }]}>{button.text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.btn, layout === 'column' && styles.btnFull, styles.btnPrimaryWrap]}
      onPress={press}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={button.style === 'destructive' ? ['#EF4444', '#DC2626'] : [primary, primaryDark]}
        style={styles.btnPrimaryGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.btnTextPrimary}>{button.text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flex: 1, height: 46, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  btnFull: { width: '100%' },
  btnPrimaryWrap: { overflow: 'hidden' },
  btnPrimaryGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  btnCancel: { borderWidth: 1.5, backgroundColor: 'transparent' },
  btnTextPrimary: { color: '#FFFFFF', fontWeight: '900', fontSize: FONTS.size.md, letterSpacing: 0.5 },
  btnTextCancel: { fontWeight: '800', fontSize: FONTS.size.md, letterSpacing: 0.5 },
});
