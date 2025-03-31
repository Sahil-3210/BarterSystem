import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const [skillsSelected, setSkillsSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth(); // Now properly accesses AuthContext
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const checkUserStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('skills_selected')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setSkillsSelected(data?.skills_selected || false);
        setLoading(false);
      } catch (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [session]);

  const value = {
    skillsSelected,
    setSkillsSelected,
    session,
    loading
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};