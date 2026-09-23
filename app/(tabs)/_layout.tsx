import { Tabs } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import { Text } from '../../components/CustomText';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';

export default function TabLayout() {
  const { language } = useTheme();
  const t = TRANSLATIONS[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabClassic,
          tabBarAccessibilityLabel: t.tabClassic,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="modes"
        options={{
          title: t.tabModes,
          tabBarAccessibilityLabel: t.tabModes,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎮</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t.tabScore,
          tabBarAccessibilityLabel: t.tabScore,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabSettings,
          tabBarAccessibilityLabel: t.tabSettings,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabProfile,
          tabBarAccessibilityLabel: t.tabProfile,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
