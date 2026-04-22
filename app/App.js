import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from './src/supabaseClient';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';
import History from './src/screens/History';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session) {
        const { data, error: signInError } = await supabase.auth.signInAnonymously();
        if (!signInError && data.session) {
          setSession(data.session);
          checkProfile(data.user?.id);
        } else {
          setLoading(false);
        }
      } else {
        setSession(session);
        checkProfile(session.user?.id);
      }
    };

    const checkProfile = async (userId) => {
      if (!userId) return;
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (data) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    };

    checkUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 10, color: '#06b6d4', fontWeight: '500' }}>Güvenli bağlantı kuruluyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#06b6d4',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!session || !hasProfile ? (
          <Stack.Screen 
            name="Onboarding" 
            options={{ title: 'D.A.I.S - Kayıt' }}
          >
            {(props) => <Onboarding {...props} session={session} onComplete={() => setHasProfile(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              options={{ title: 'D.A.I.S - Ana Ekran' }}
            >
              {(props) => <Dashboard {...props} session={session} />}
            </Stack.Screen>
            <Stack.Screen 
              name="History" 
              options={{ title: 'Ölçüm Geçmişi' }}
            >
              {(props) => <History {...props} session={session} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
