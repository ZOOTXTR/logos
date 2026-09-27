import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { X, Swords, Bot, User, Gem } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';

interface DuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDuel: () => void;
}

export const DuelModal: React.FC<DuelModalProps> = ({ isOpen, onClose, onStartDuel }) => {
  const { activeTheme } = useTheme();
  const [selectedBet, setSelectedBet] = useState(50);

  const bets = [25, 50, 100, 250];

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: activeTheme.canvas, borderColor: activeTheme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${activeTheme.primary}20` }]}>
                <Swords size={18} color={activeTheme.primary} />
              </View>
              <Text style={styles.title}>1v1 Canlı Düello</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              onPress={() => {
                sounds.playClick();
                haptics.buttonTap();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <X size={20} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Matchup Graphic */}
          <View style={[styles.matchupRow, { backgroundColor: activeTheme.surface, borderColor: activeTheme.border }]}>
            <View style={styles.playerCol}>
              <View style={[styles.avatarCircle, { backgroundColor: `${activeTheme.primary}25` }]}>
                <User size={24} color={activeTheme.primary} />
              </View>
              <Text style={styles.playerName}>Sen</Text>
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerCol}>
              <View style={[styles.avatarCircle, { backgroundColor: '#EF444425' }]}>
                <Bot size={24} color="#EF4444" />
              </View>
              <Text style={styles.playerName}>Zeka Botu</Text>
            </View>
          </View>

          {/* Bet Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bahis Miktarı (Elmas)</Text>
            <View style={styles.betsRow}>
              {bets.map((bet) => {
                const isSelected = selectedBet === bet;
                return (
                  <Pressable
                    key={bet}
                    onPress={() => {
                      sounds.playClick();
                      haptics.buttonTap();
                      setSelectedBet(bet);
                    }}
                    style={[
                      styles.betBtn,
                      {
                        backgroundColor: isSelected ? activeTheme.primary : activeTheme.card,
                        borderColor: isSelected ? activeTheme.primary : activeTheme.border
                      }
                    ]}
                  >
                    <Gem size={12} color={isSelected ? '#FFFFFF' : activeTheme.accent} />
                    <Text style={[styles.betText, { color: isSelected ? '#FFFFFF' : '#F4F4F5' }]}>{bet}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Start Duel Button */}
          <Pressable
            onPress={() => {
              sounds.playVictory();
              haptics.winGame();
              onStartDuel();
            }}
            style={[styles.startBtn, { backgroundColor: activeTheme.primary }]}
          >
            <Swords size={16} color="#FFFFFF" />
            <Text style={styles.startBtnText}>Düelloyu Başlat ({selectedBet * 2} 💎 Ödül)</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    gap: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  closeBtn: {
    padding: 4
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  playerCol: {
    alignItems: 'center',
    gap: 6
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F4F4F5'
  },
  vsBadge: {
    backgroundColor: '#26272B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  vsText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900'
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA'
  },
  betsRow: {
    flexDirection: 'row',
    gap: 8
  },
  betBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  betText: {
    fontSize: 12,
    fontWeight: '800'
  },
  startBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
