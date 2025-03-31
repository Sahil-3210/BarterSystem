// app/index.js
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import { useGlobalContext } from '../context/GlobalProvider';
import { View, ActivityIndicator } from 'react-native';
// import 'react-native-gesture-handler';

export default function Index() {
  const { session } = useAuth();
  const { skillsSelected, loading } = useGlobalContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Not authenticated - go to sign in
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Authenticated but skills not selected - go to onboarding
  if (session && !skillsSelected) {
    return <Redirect href="/onboarding/skill-selection" />;
  }

  // Authenticated with skills - go to home
  return <Redirect href="/(tabs)/home" />;
}