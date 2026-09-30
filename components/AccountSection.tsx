import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Text } from './CustomText';
import { User, LogIn, CloudUpload, CloudDownload, Unlink, Check } from 'lucide-react-native';
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
};

export function AccountSection() {
  const { theme, language } = useTheme();
  const tr = language !== 'en';
  const colors = theme.colors;

  const {
    linkedEmail,
    loading,
    handleLinkAccount,
    handlePlayGamesSignIn,
    handleBackup,
    handleRestore,
    handleUnlink,
  } = useCloudSync(true, () => {});

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [signed, setSigned] = useState(isSignedIn());

  useEffect(() => {
    storageGet('gq_user_name').then((v) => setName(v ?? '')).catch(() => {});
  }, []);
  useEffect(() => { setSigned(isSignedIn()); }, [linkedEmail, loading]);

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

  const onGoogleSignIn = async () => {
    const res = await signInWithGoogleFirebase();
    if (res.ok) {
      if (res.email) await storageSet('gq_user_email', res.email);
      if (res.displayName) { await storageSet('gq_user_name', res.displayName); setName(res.displayName); }
      setSigned(true);
    } else {
      Alert.alert(
        tr ? 'Giriş başarısız' : 'Sign-in failed',
        tr ? 'Google ile giriş yapılamadı.' : 'Could not sign in with Google.'
      );
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{tr ? 'HESAP & SIRALAMA' : 'ACCOUNT & LEADERBOARD'}</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Durum */}
        <View style={styles.statusRow}>
          <User size={16} color={signed ? C.green : colors.textMuted} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {signed
              ? (linkedEmail ? `${tr ? 'Giriş yapıldı' : 'Signed in'}: ${linkedEmail}` : (tr ? 'Giriş yapıldı' : 'Signed in'))
              : (tr ? 'Anonim — sıralamaya girmek için giriş yap' : 'Anonymous — sign in to join the leaderboard')}
          </Text>
        </View>

        {/* E-posta ile bağla */}
        {!linkedEmail && (
          <View style={{ gap: 8 }}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{tr ? 'E-posta ile giriş / bağla' : 'Sign in / link with email'}</Text>
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
              onPress={() => handleLinkAccount(email.trim(), password)}
            >
              <LogIn size={14} color="#fff" />
              <Text style={styles.btnText}>{tr ? 'Giriş yap / Bağla' : 'Sign in / Link'}</Text>
            </Pressable>
          </View>
        )}

        {/* Google ile giriş */}
        {!linkedEmail && (
          <Pressable
            style={[styles.btn, { backgroundColor: '#DB4437' }]}
            disabled={loading}
            onPress={onGoogleSignIn}
          >
            <LogIn size={14} color="#fff" />
            <Text style={styles.btnText}>{tr ? 'Google ile giriş' : 'Sign in with Google'}</Text>
          </Pressable>
        )}

        {/* Google Play Games */}
        {!linkedEmail && (
          <Pressable
            style={[styles.btn, { backgroundColor: C.green, opacity: loading ? 0.6 : 1 }]}
            disabled={loading}
            onPress={handlePlayGamesSignIn}
          >
            <Check size={14} color="#fff" />
            <Text style={styles.btnText}>{tr ? 'Google Play Games ile giriş' : 'Sign in with Google Play Games'}</Text>
          </Pressable>
        )}

        {/* Bağlıysa bulut işlemleri */}
        {linkedEmail && (
          <View style={{ gap: 8 }}>
            <Pressable style={[styles.btn, { backgroundColor: C.accent }]} onPress={handleBackup}>
              <CloudUpload size={14} color="#0B0C10" />
              <Text style={[styles.btnText, { color: '#0B0C10' }]}>{tr ? 'Buluta Yedekle' : 'Back up to cloud'}</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={handleRestore}>
              <CloudDownload size={14} color={colors.text} />
              <Text style={[styles.btnText, { color: colors.text }]}>{tr ? 'Geri Yükle' : 'Restore'}</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={handleUnlink}>
              <Unlink size={14} color={C.red} />
              <Text style={[styles.btnText, { color: C.red }]}>{tr ? 'Bağlantıyı Kaldır' : 'Unlink'}</Text>
            </Pressable>
          </View>
        )}

        {/* Görünen ad */}
        <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{tr ? 'Oyuncu adı (sıralamada görünür)' : 'Player name (shown on leaderboard)'}</Text>
          <TextInput
            style={inputStyle}
            placeholder={tr ? 'Örn: KelimeUstasi' : 'e.g. WordMaster'}
            placeholderTextColor={colors.textMuted}
            maxLength={DISPLAY_NAME_MAX}
            value={name}
            onChangeText={(t) => { setName(t); setNameMsg(null); }}
          />
          {nameMsg && (
            <Text style={{ fontSize: 12, color: nameMsg.ok ? C.green : C.red }}>{nameMsg.text}</Text>
          )}
          <Pressable style={[styles.btn, { backgroundColor: C.primary }]} onPress={onSaveName}>
            <Text style={styles.btnText}>{tr ? 'Adı Kaydet' : 'Save name'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 13, fontWeight: '600', flex: 1 },
  label: { fontSize: 11, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, paddingVertical: 11 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
