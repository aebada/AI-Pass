import { Tabs } from 'expo-router';
import { tokens } from '@ai-pass/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.colors.bgElevated },
        headerTintColor: tokens.colors.text,
        tabBarStyle: { backgroundColor: tokens.colors.bgElevated, borderTopColor: tokens.colors.border },
        tabBarActiveTintColor: tokens.colors.accent,
        tabBarInactiveTintColor: tokens.colors.textMuted,
      }}
    >
      <Tabs.Screen name="files" options={{ title: 'Files', tabBarLabel: 'Files' }} />
      <Tabs.Screen name="editor" options={{ title: 'Editor', tabBarLabel: 'Editor' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarLabel: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
    </Tabs>
  );
}
