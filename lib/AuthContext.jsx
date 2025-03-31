import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const signUp = async (email, password, username) => {
    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: undefined, // Disable email confirmation
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Step 2: Use RLS policy for insertion
      // Note: You need to have the RLS policy described above for this to work
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            username: username,
            email: email,
            skills_selected: false,
            role: 'user',
          },
        ]);

      if (userError) {
        Alert.alert('Error', userError.message);
        // If this fails, you should implement the Edge Function approach
        return;
      }

      Alert.alert('Success', 'Account created! Signing you in...');
      
      // Step 3: Sign in the user automatically
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      try {
        // Check if skills are selected - use maybeSingle() instead of single()
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('skills_selected')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError) {
          console.error('User data error:', userError);
          Alert.alert('Error', 'Failed to retrieve user data.');
          return;
        }

        // Handle case where user might not have a profile yet
        if (!userData) {
          // Create user profile if missing
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                username: data.user.user_metadata?.username || email.split('@')[0],
                email: email,
                skills_selected: false,
                role: 'user',
              },
            ]);

          if (insertError) {
            Alert.alert('Error', 'Failed to create user profile: ' + insertError.message);
            return;
          }
          
          router.replace('/onboarding/skill-selection');
        } else {
          // Navigate based on whether skills have been selected
          if (userData.skills_selected) {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding/skill-selection');
          }
        }
      } catch (error) {
        console.error('Error in user data handling:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const value = {
    session,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;