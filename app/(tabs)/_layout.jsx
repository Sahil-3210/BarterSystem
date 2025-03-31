// app/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="create"/>
      <Tabs.Screen name="bookmark"/>
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}