import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Text } from './CustomText';
import { X, User, CloudUpload, CloudDownload, Unlink, Check, LogIn } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useCloudSync } from '../hooks/useCloudSync';
import { storageGet, storageSet } from '../services/storage.service';
import { isSignedIn } from '../services/auth.service';
import { signInWithGoogleFirebase } from '../services/googleAuth.service';
import { validateDisplayName, displayNameErrorText, DISPLAY_NAME_MAX } from '../utils/displayName';

const C = {
  primary: '#7C5CFF',
  green: '#22C55E',
  red: '#EF4444',
  accent: '#38BDF8',
  google: '#DB4437',
};

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AccountModal({ visible, onClose }: AccountModalProps) {
  const { theme, language } = useTheme();
  const tr = language !== 'en';
  const colors = theme.colors;

  const {
    linkedEmail,
    loading,
    handleRegister,
    handleSignIn,
    handlePlayGamesSignIn,
    handleBackup,
    handleRestore,
    handleUnlink,
  } = useCloudSync(visible, onClose);

  const [mode, setMode] = useState<'register' | 'signin'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [signed, setSigned] = useState(isSignedIn());

  useEffect(() => {
    if (visible) {
      storageGet('gq_user_name').then((v) => setName(v ?? '')).catch(() => {});
      setSigned(isSignedIn());
    }
  }, [visible, linkedEmail, loading]);

  const onSaveName = async () => {
    const r = validateDisplayName(name);
    if (!r.ok) {
      setNameMsg({ ok: false, text: displayNameErrorText(r.error, language) });
      return;
    }
    await storageSet('gq_user_name', r.value);
    setName(r.value);
    setNameMsg({ ok: true, text: tr ? 'Oyuncu adı kaydedildi.' : 'Player name saved.' });
  };

  const onGoogle = async () => {
    const res = await signInWithGoogleFirebase();
    if (res.ok) {
      if (res.email) await storageSet('gq_user_email', res.email);
      if (res.displayName) { await storageSet('gq_user_name', res.displayName); setName(res.displayName); }
      setSigned(true);
    } else {
      Alert.alert(tr ? 'Giriş başarısız' : 'Sign-in failed', tr ? 'Google ile giriş yapılamadı.' : 'Could not sign in with Google.');
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];
  const linked = Boolean(linkedEmail) || signed;
  // Play Games yalnızca APP_ID yapılandırıldıysa gösterilir (Play Console kurulumu gerekir).
  const playGamesConfigured = Boolean(
    (Constants.expoConfig?.extra as { playGamesAppId?: string } | undefined)?.playGamesAppId
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <User size={16} color={colors.text} />
              <Text style={[styles.title, { color: colors.text }]}>{tr ? 'Hesap' : 'Account'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={tr ? 'Kapat' : 'Close'} hitSlop={12} onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
            {!linked ? (
              <>
                {/* Mod: Kayıt Ol / Giriş Yap */}
                <View style={[styles.segmented, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Pressable onPress={() => setMode('register')} style={[styles.segBtn, mode === 'register' && { backgroundColor: C.primary }]}>
                    <Text style={[styles.segText, { color: mode === 'register' ? '#fff' : colors.textMuted }]}>{tr ? 'Kayıt Ol' : 'Sign up'}</Text>
                  </Pressable>
                  <Pressable onPress={() => setMode('signin')} style={[styles.segBtn, mode === 'signin' && { backgroundColor: C.primary }]}>
                    <Text style={[styles.segText, { color: mode === 'signin' ? '#fff' : colors.textMuted }]}>{tr ? 'Giriş Yap' : 'Sign in'}</Text>
                  </Pressable>
                </View>

                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  {mode === 'register'
                    ? (tr ? 'E-posta ve bir şifre belirle; hesabın oluşturulsun ve ilerlemen buluta bağlansın.' : 'Enter an email and a password to create your account and link your progress.')
                    : (tr ? 'Kayıtlı e-posta ve şifrenle giriş yap.' : 'Sign in with your registered email and password.')}
                </Text>

                <TextInput
                  style={inputStyle}
                  placeholder={tr ? 'E-posta' : 'Email'}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={inputStyle}
                  placeholder={tr ? 'Şifre (en az 6 karakter)' : 'Password (min 6 chars)'}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={[styles.btn, { backgroundColor: C.primary, opacity: loading ? 0.6 : 1 }]}
                  disabled={loading}
                  onPress={() => (mode === 'register' ? handleRegister(email.trim(), password) : handleSignIn(email.trim(), password))}
                >
                  <LogIn size={14} color="#fff" />
                  <Text style={styles.btnText}>{mode === 'register' ? (tr ? 'Kayıt Ol' : 'Create account') : (tr ? 'Giriş Yap' : 'Sign in')}</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.textMuted }]}>{tr ? 'veya' : 'or'}</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <Pressable style={[styles.btn, { backgroundColor: C.google }]} onPress={onGoogle}>
                  <LogIn size={14} color="#fff" />
                  <Text style={styles.btnText}>{tr ? 'Google ile devam et' : 'Continue with Google'}</Text>
                </Pressable>

                {playGamesConfigured && (
                  <Pressable style={[styles.btn, { backgroundColor: C.green, opacity: loading ? 0.6 : 1 }]} disabled={loading} onPress={handlePlayGamesSignIn}>
                    <Check size={14} color="#fff" />
                    <Text style={styles.btnText}>{tr ? 'Google Play Games ile devam et' : 'Continue with Google Play Games'}</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <View style={styles.statusRow}>
                  <User size={16} color={C.green} />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {(tr ? 'Giriş yapıldı' : 'Signed in') + (linkedEmail ? `: ${linkedEmail}` : '')}
                  </Text>
                </View>
                <Pressable style={[styles.btn, { backgroundColor: C.accent }]} onPress={handleBackup}>
                  <CloudUpload size={14} color="#0B0C10" />
                  <Text style={[styles.btnText, { color: '#0B0C10' }]}>{tr ? 'Buluta Yedekle' : 'Back up to cloud'}</Text>
                </Pressable>
                <Pressable style={[styles.btn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={handleRestore}>
                  <CloudDownload size={14} color={colors.text} />
                  <Text style={[styles.btnText, { color: colors.text }]}>{tr ? 'Geri Yükle' : 'Restore'}</Text>
                </Pressable>
                <Pressable style={[styles.btn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={handleUnlink}>
                  <Unlink size={14} color={C.red} />
                  <Text style={[styles.btnText, { color: C.red }]}>{tr ? 'Bağlantıyı Kaldır' : 'Unlink'}</Text>
                </Pressable>
              </>
            )}

            {/* Görünen ad */}
            <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
              <Text style={[styles.hint, { color: colors.textMuted }]}>{tr ? 'Oyuncu adı (sıralamada görünür)' : 'Player name (shown on leaderboard)'}</Text>
              <TextInput
                style={inputStyle}
                placeholder={tr ? 'Örn: KelimeUstasi' : 'e.g. WordMaster'}
                placeholderTextColor={colors.textMuted}
                maxLength={DISPLAY_NAME_MAX}
                value={name}
                onChangeText={(t) => { setName(t); setNameMsg(null); }}
              />
              {nameMsg && <Text style={{ fontSize: 12, color: nameMsg.ok ? C.green : C.red }}>{nameMsg.text}</Text>}
              <Pressable style={[styles.btn, { backgroundColor: C.primary }]} onPress={onSaveName}>
                <Text style={styles.btnText}>{tr ? 'Adı Kaydet' : 'Save name'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  segmented: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4 },
  segBtn: { flex: 1, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 13, fontWeight: '700' },
  hint: { fontSize: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 14, fontWeight: '600', flex: 1 },
});
