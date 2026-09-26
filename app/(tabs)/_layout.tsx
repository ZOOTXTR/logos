import { Tabs } from 'expo-router';
import { Home, LayoutGrid, Trophy, Settings, User } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';

export default function TabLayout() {
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabClassic,
          tabBarAccessibilityLabel: t.tabClassic,
          tabBarIcon: ({ focused, color }) => <Home size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />,
        }}
      />
      <Tabs.Screen
        name="modes"
        options={{
          title: t.tabModes,
          tabBarAccessibilityLabel: t.tabModes,
          tabBarIcon: ({ focused, color }) => <LayoutGrid size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t.tabScore,
          tabBarAccessibilityLabel: t.tabScore,
          tabBarIcon: ({ focused, color }) => <Trophy size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabSettings,
          tabBarAccessibilityLabel: t.tabSettings,
          tabBarIcon: ({ focused, color }) => <Settings size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabProfile,
          tabBarAccessibilityLabel: t.tabProfile,
          tabBarIcon: ({ focused, color }) => <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />,
        }}
      />
    </Tabs>
  );
}
