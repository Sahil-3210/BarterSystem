// app/onboarding/_layout.jsx
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="skill-selection" />
    </Stack>
  );
}