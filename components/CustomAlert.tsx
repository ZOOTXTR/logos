import { Modal, View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { AlertButton, AlertButtonConfig } from './AlertButton';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: AlertButtonConfig[];
}

export function CustomAlert({ visible, title, message, onClose, buttons }: CustomAlertProps) {
  const { theme } = useTheme();
  const btns: AlertButtonConfig[] = buttons?.length ? buttons : [{ text: 'Tamam', onPress: onClose }];
  const layout = btns.length > 2 ? 'column' as const : 'row' as const;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primaryLight, shadowColor: theme.colors.primary }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.glowLine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View style={styles.content}>
            {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : null}
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
            <View style={[styles.buttonRow, layout === 'column' && styles.buttonColumn]}>
              {btns.map((btn, i) => (
                <AlertButton
                  key={i}
                  button={btn}
                  primary={theme.colors.primary}
                  primaryDark={theme.colors.primaryDark}
                  textSecondary={theme.colors.textSecondary}
                  border={theme.colors.border}
                  onClose={onClose}
                  layout={layout}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,5,16,0.85)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  container: { width: Math.min(width - 40, 360), borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, overflow: 'hidden', elevation: 24, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 16 },
  glowLine: { height: 4, width: '100%' },
  content: { padding: SPACING.lg },
  title: { fontSize: FONTS.size.lg, fontWeight: '900', textAlign: 'center', marginBottom: SPACING.md, letterSpacing: 0.5 },
  message: { fontSize: FONTS.size.md, fontWeight: '600', textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  buttonRow: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'center' },
  buttonColumn: { flexDirection: 'column', width: '100%' },
});
