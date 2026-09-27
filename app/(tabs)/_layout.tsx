import React from 'react';
import { Tabs } from 'expo-router';
import { Home, LayoutGrid, Trophy, Settings, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

export default function TabsLayout() {
  const { activeTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: activeTheme.surface,
          borderTopColor: activeTheme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: activeTheme.primary,
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700'
        }
      }}
      screenListeners={{
        tabPress: () => {
          sounds.playClick();
          haptics.buttonTap();
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Klasik',
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          )
        }}
      />
      <Tabs.Screen
        name="modes"
        options={{
          title: 'Modlar',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid size={20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          )
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Skor',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, focused }) => (
            <Settings size={20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <User size={20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          )
        }}
      />
    </Tabs>
  );
}
