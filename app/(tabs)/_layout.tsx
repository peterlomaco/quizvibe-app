import { Colors } from '@/src/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="lobby"
        options={{
          title: 'Lobby',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>🎯</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboards"
        options={{
          title: 'Leaderboards',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>🏆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>🛒</Text>
          ),
        }}
      />
    </Tabs>
  );
}