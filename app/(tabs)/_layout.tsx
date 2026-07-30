import { Tabs } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import { Text } from 'react-native';

export default function TabLayout() {
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
          title: 'Klasik',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="modes"
        options={{
          title: 'Modlar',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎮</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Skor',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
