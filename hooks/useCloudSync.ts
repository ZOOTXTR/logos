import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { storageGet, storageSet, storageRemove } from '../services/storage.service';
import { useTheme } from '../hooks/useTheme';
import { cloudService } from '../services/cloud.service';
import { audioService } from '../services/audio.service';

export function useCloudSync(visible: boolean, onClose: () => void) {
  const { language } = useTheme();
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (visible) {
      storageGet('gq_user_email').then(val => {
        setLinkedEmail(val);
      });
      setSyncStatus('idle');
    }
  }, [visible]);

  const handleLinkAccount = async (email: string) => {
    if (!email.includes('@') || email.length < 5) {
      Alert.alert(
        language === 'en' ? 'Invalid Email' : 'Geçersiz E-posta',
        language === 'en' ? 'Please enter a valid email address!' : 'Lütfen geçerli bir e-posta adresi girin!'
      );
      return;
    }

    setLoading(true);
    setSyncStatus('idle');
    audioService.triggerHaptic('medium');

    try {
      await new Promise(r => setTimeout(r, 1200));
      await storageSet('gq_user_email', email);
      setLinkedEmail(email);
      setSyncStatus('success');
      Alert.alert(
        language === 'en' ? 'Account Linked ✓' : 'Hesap Bağlandı ✓',
        language === 'en'
          ? `Your progress is now linked to: ${email}`
          : `İlerlemeniz başarıyla şu hesaba bağlandı: ${email}`
      );
    } catch (e) {
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
      const success = await cloudService.syncStorageToCloud(linkedEmail);
      if (success) {
        setSyncStatus('success');
        Alert.alert(
          language === 'en' ? 'Backup Successful' : 'Yedekleme Başarılı',
          language === 'en' ? 'Your game data has been synced to cloud!' : 'Tüm verileriniz başarıyla buluta yedeklendi!'
        );
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
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

      cloudService.restoreStorageFromCloud(linkedEmail).then(success => {
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
    setLinkedEmail(null);
    setSyncStatus('idle');
  };

  return {
    linkedEmail,
    loading,
    syncStatus,
    handleLinkAccount,
    handleBackup,
    handleRestore,
    handleUnlink,
  };
}
