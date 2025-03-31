import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/AuthContext';
import { GlobalProvider } from '../context/GlobalProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GlobalProvider>
    </AuthProvider>
  );
}