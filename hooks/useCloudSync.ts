import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { storageGet, storageSet, storageRemove } from '../services/storage.service';
import { useTheme } from '../hooks/useTheme';
import { cloudService } from '../services/cloud.service';
import { registerWithEmail, signInWithEmail, EmailAuthError } from '../services/auth.service';
import { audioService } from '../services/audio.service';

export function useCloudSync(visible: boolean, onClose: () => void) {
  const { language } = useTheme();
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (visible) {
      storageGet('gq_user_email').then(val => {
        setLinkedEmail(val);
      });
      setSyncStatus('idle');
    }
  }, [visible]);

  const persistAccount = async (email: string) => {
    await storageSet('gq_user_email', email);
    setLinkedEmail(email);
    // Ad yoksa e-postanın yerel kısmını varsayılan oyuncu adı yap
    const existingName = await storageGet('gq_user_name');
    if (!existingName) {
      const local = (email.split('@')[0] || 'Oyuncu').slice(0, 20);
      if (local) await storageSet('gq_user_name', local);
    }
  };

  const emailErrorText = (err?: EmailAuthError): string => {
    const tr: Record<EmailAuthError, string> = {
      'email-in-use': 'Bu e-posta zaten kayıtlı. "Giriş Yap"ı dene.',
      'weak-password': 'Şifre en az 6 karakter olmalı.',
      'invalid-email': 'Geçerli bir e-posta gir.',
      'wrong-credentials': 'E-posta veya şifre hatalı.',
      unknown: 'Bağlanamadı. Tekrar dene.',
    };
    const en: Record<EmailAuthError, string> = {
      'email-in-use': 'This email is already registered. Try "Sign in".',
      'weak-password': 'Password must be at least 6 characters.',
      'invalid-email': 'Please enter a valid email.',
      'wrong-credentials': 'Wrong email or password.',
      unknown: 'Could not connect. Try again.',
    };
    return (language === 'en' ? en : tr)[err ?? 'unknown'];
  };

  const handleRegister = async (email: string, password: string) => {
    if (!email.includes('@') || email.length < 5) {
      Alert.alert(language === 'en' ? 'Invalid Email' : 'Geçersiz E-posta', language === 'en' ? 'Please enter a valid email address!' : 'Lütfen geçerli bir e-posta adresi girin!');
      return;
    }
    if (password.length < 6) {
      Alert.alert(language === 'en' ? 'Weak Password' : 'Zayıf Şifre', language === 'en' ? 'Password must be at least 6 characters.' : 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    setSyncStatus('idle');
    audioService.triggerHaptic('medium');
    try {
      const res = await registerWithEmail(email, password);
      if (!mountedRef.current) return;
      if (!res.ok) {
        setSyncStatus('error');
        Alert.alert(language === 'en' ? 'Registration Failed' : 'Kayıt Başarısız', emailErrorText(res.error));
        return;
      }
      await persistAccount(email);
      setSyncStatus('success');
      Alert.alert(language === 'en' ? 'Account Created ✓' : 'Hesap Oluşturuldu ✓', language === 'en' ? `You are signed up as: ${email}` : `Şu hesapla kaydoldunuz: ${email}`);
    } catch {
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!email.includes('@') || email.length < 5) {
      Alert.alert(language === 'en' ? 'Invalid Email' : 'Geçersiz E-posta', language === 'en' ? 'Please enter a valid email address!' : 'Lütfen geçerli bir e-posta adresi girin!');
      return;
    }
    setLoading(true);
    setSyncStatus('idle');
    audioService.triggerHaptic('medium');
    try {
      const res = await signInWithEmail(email, password);
      if (!mountedRef.current) return;
      if (!res.ok) {
        setSyncStatus('error');
        Alert.alert(language === 'en' ? 'Sign-in Failed' : 'Giriş Başarısız', emailErrorText(res.error));
        return;
      }
      await persistAccount(email);
      setSyncStatus('success');
      Alert.alert(language === 'en' ? 'Signed In ✓' : 'Giriş Yapıldı ✓', language === 'en' ? `Signed in as: ${email}` : `Şu hesapla giriş yapıldı: ${email}`);
    } catch {
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!linkedEmail) return;
    setLoading(true);
    setSyncStatus('idle');
    audioService.triggerHaptic('light');

    try {
      const success = await cloudService.syncStorageToCloud(linkedEmail || 'anonymous');
      if (!mountedRef.current) return;
      if (success) {
        setSyncStatus('success');
        Alert.alert(
          language === 'en' ? 'Backup Successful' : 'Yedekleme Başarılı',
          language === 'en' ? 'Your game data has been synced to cloud!' : 'Tüm verileriniz başarıyla buluta yedeklendi!'
        );
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!linkedEmail) return;

    const confirmRestore = () => {
      setLoading(true);
      setSyncStatus('idle');
      audioService.triggerHaptic('warning');

      cloudService.restoreStorageFromCloud(linkedEmail || 'anonymous').then(success => {
        if (!mountedRef.current) return;
        if (success) {
          setSyncStatus('success');
          Alert.alert(
            language === 'en' ? 'Restore Successful' : 'Geri Yükleme Başarılı',
            language === 'en'
              ? 'Your cloud progress has been restored! Please restart the app.'
              : 'Verileriniz buluttan geri yüklendi! Lütfen uygulamayı yeniden başlatın.',
            [{ text: 'Tamam', onPress: onClose }]
          );
        } else {
          setSyncStatus('error');
          Alert.alert(
            language === 'en' ? 'Restore Failed' : 'Geri Yükleme Başarısız',
            language === 'en' ? 'No backup found on cloud for this email!' : 'Bu e-posta adresi için bulutta yedek bulunamadı!'
          );
        }
        setLoading(false);
      }).catch(() => {
        setSyncStatus('error');
        Alert.alert(
          language === 'en' ? 'Restore Failed' : 'Geri Yükleme Başarısız',
          language === 'en' ? 'Failed to restore backup from cloud.' : 'Buluttan yedek geri yüklenemedi.'
        );
        setLoading(false);
      });
    };

    if (Platform.OS === 'web') {
      const conf = window.confirm(
        language === 'en'
          ? 'Are you sure? This will overwrite your current local progress!'
          : 'Emin misiniz? Bu işlem mevcut yerel ilerlemenizin üzerine yazılacaktır!'
      );
      if (conf) confirmRestore();
    } else {
      Alert.alert(
        language === 'en' ? 'Restore Progress 🔄' : 'İlerlemeyi Geri Yükle 🔄',
        language === 'en'
          ? 'Are you sure? This will overwrite your current local progress!'
          : 'Emin misiniz? Bu işlem mevcut yerel ilerlemenizin üzerine yazılacaktır!',
        [
          { text: language === 'en' ? 'Cancel' : 'İptal' },
          { text: language === 'en' ? 'Restore' : 'Geri Yükle', onPress: confirmRestore }
        ]
      );
    }
  };

  const handleUnlink = async () => {
    audioService.triggerHaptic('warning');
    await storageRemove('gq_user_email');
    await storageRemove('gq_user_name');
    await storageRemove('gq_user_photo');
    setLinkedEmail(null);
    setSyncStatus('idle');
  };

  const handlePlayGamesSignIn = async () => {
    setLoading(true);
    setSyncStatus('idle');
    audioService.triggerHaptic('medium');

    try {
      const { signInWithGooglePlayGames } = require('../services/googleAuth.service');
      const player = await signInWithGooglePlayGames();
      
      if (player && player.id) {
        const fakeEmail = `playgames_${player.id}`;
        await storageSet('gq_user_email', fakeEmail);
        
        if (player.displayName) await storageSet('gq_user_name', player.displayName);
        if (player.hiResImageUri || player.iconImageUri) {
          await storageSet('gq_user_photo', player.hiResImageUri || player.iconImageUri || '');
        }
        
        setLinkedEmail(fakeEmail);
        setSyncStatus('success');
        
        Alert.alert(
          language === 'en' ? 'Play Games Linked ✓' : 'Play Oyunlar Bağlandı ✓',
          language === 'en'
            ? `Welcome ${player.displayName || ''}! Your progress is linked to Play Games.`
            : `Hoş geldin ${player.displayName || ''}! İlerlemeniz Play Oyunlar'a bağlandı.`
        );
      } else {
        setSyncStatus('idle');
      }
    } catch {
      setSyncStatus('error');
      Alert.alert(
        language === 'en' ? 'Login Error' : 'Giriş Hatası',
        language === 'en' ? 'Could not sign in with Google Play Games.' : 'Google Play Oyunlar ile giriş yapılamadı.'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    linkedEmail,
    loading,
    syncStatus,
    handleRegister,
    handleSignIn,
    handlePlayGamesSignIn,
    handleBackup,
    handleRestore,
    handleUnlink,
  };
}
