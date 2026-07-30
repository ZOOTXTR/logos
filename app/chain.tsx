import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useWordChain } from '../hooks/useWordChain';
import { useProgress } from '../hooks/useProgress';
import { LoadingView } from '../components/LoadingView';

export default function ChainScreen() {
  const router = useRouter();
  const game = useWordChain();
  const progress = useProgress();
  const inputRef = useRef<TextInput>(null);

  if (progress.loading) {
    return <LoadingView />;
  }

  const handleSubmit = async () => {
    const result = game.submitWord();
    if (result === 'ok') {
      const xp = game.chain.length * 5;
      await progress.earnXP(xp);
    }
    if (game.status === 'lost') {
      Alert.alert('💔 Oyun Bitti', `Skor: ${game.score}\nZincir: ${game.chain.length} kelime`, [
        { text: 'Tekrar', onPress: game.reset },
        { text: 'Menü', onPress: () => router.back() },
      ]);
    }
    inputRef.current?.clear();
  };

  const lastWord = game.chain[game.chain.length - 1] ?? '';
  const nextChar = lastWord[lastWord.length - 1] ?? '';

  const heartsDisplay = Array(game.maxLives).fill(null).map((_, i) =>
    i < game.lives ? '❤️' : '🖤'
  ).join('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LinearGradient colors={[COLORS.background, '#0F0F23']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⛓️ Kelime Zinciri</Text>
          <Text style={styles.heartsText}>{heartsDisplay}</Text>
        </View>

        {/* Skor */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Skor</Text>
            <Text style={styles.scoreValue}>{game.score}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Zincir</Text>
            <Text style={styles.scoreValue}>{game.chain.length}</Text>
          </View>
          <View style={[styles.scoreCard, styles.nextCharCard]}>
            <Text style={styles.scoreLabel}>Sonraki harf</Text>
            <Text style={[styles.scoreValue, { color: COLORS.primaryLight, fontSize: FONTS.size.xxxl }]}>{nextChar}</Text>
          </View>
        </View>

        {/* Hata mesajı */}
        {game.errorMessage !== '' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>❌ {game.errorMessage}</Text>
          </View>
        )}

        {/* Zincir Listesi */}
        <ScrollView
          style={styles.chainList}
          ref={ref => { if (ref) setTimeout(() => ref.scrollToEnd({ animated: true }), 100); }}
        >
          {game.chain.map((word, i) => (
            <View key={i} style={[styles.chainItem, i === game.chain.length - 1 && styles.chainItemLast]}>
              <Text style={styles.chainIndex}>{i + 1}.</Text>
              <Text style={styles.chainWord}>{word}</Text>
              {i < game.chain.length - 1 && (
                <Text style={styles.chainArrow}>→ {word[word.length - 1]}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <View style={styles.startChar}>
              <Text style={styles.startCharText}>{nextChar}</Text>
            </View>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Kelime yaz..."
              placeholderTextColor={COLORS.textMuted}
              value={game.currentInput}
              onChangeText={game.setInput}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={game.status === 'playing'}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit} disabled={game.status !== 'playing'}>
              <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.sendGrad}>
                <Text style={styles.sendText}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
  backBtn: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: '600' },
  title: { fontSize: FONTS.size.lg, fontWeight: '900', color: COLORS.text },
  heartsText: { fontSize: FONTS.size.lg },
  scoreRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  scoreCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  nextCharCard: { borderColor: COLORS.primaryLight },
  scoreLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, fontWeight: '600' },
  scoreValue: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: '900' },
  errorBanner: { backgroundColor: COLORS.error + '33', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontWeight: '700', textAlign: 'center' },
  chainList: { flex: 1, marginBottom: SPACING.md },
  chainItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.sm, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  chainItemLast: { borderColor: COLORS.primaryLight, backgroundColor: COLORS.primary + '22' },
  chainIndex: { color: COLORS.textMuted, fontSize: FONTS.size.sm, width: 24 },
  chainWord: { flex: 1, color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '700', letterSpacing: 1 },
  chainArrow: { color: COLORS.primaryLight, fontSize: FONTS.size.sm, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  startChar: { width: 44, height: 52, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  startCharText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: '900' },
  input: { flex: 1, height: 52, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: '700', borderWidth: 1, borderColor: COLORS.border, letterSpacing: 2 },
  sendBtn: { width: 52, height: 52, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  sendGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: '900' },
});
