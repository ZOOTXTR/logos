import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Home, LayoutGrid, Trophy, Settings, User } from 'lucide-react-native';
import { ActiveTab } from '../types/game';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const { activeTheme } = useTheme();

  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'klasik', label: 'Klasik', icon: Home },
    { id: 'modlar', label: 'Modlar', icon: LayoutGrid },
    { id: 'skor', label: 'Skor', icon: Trophy },
    { id: 'ayarlar', label: 'Ayarlar', icon: Settings },
    { id: 'profil', label: 'Profil', icon: User }
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeTheme.surface,
          borderTopColor: activeTheme.border
        }
      ]}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        const tabColor = isActive ? activeTheme.primary : '#71717A';

        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              sounds.playClick();
              haptics.buttonTap();
              onChangeTab(tab.id);
            }}
            style={styles.tabButton}
          >
            <IconComponent
              size={20}
              color={tabColor}
              strokeWidth={isActive ? 2.5 : 1.75}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: tabColor,
                  fontWeight: isActive ? '700' : '500'
                }
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.2
  }
});
