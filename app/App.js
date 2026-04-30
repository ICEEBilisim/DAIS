import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { supabase } from './src/supabaseClient';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';
import History from './src/screens/History';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import Guide from './src/screens/Guide';

import SupportChat from './src/screens/SupportChat';

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
          <>
            <Stack.Screen 
              name="Onboarding" 
              options={{ title: 'D.A.I.S - Kayıt' }}
            >
              {(props) => <Onboarding {...props} session={session} onComplete={() => setHasProfile(true)} />}
            </Stack.Screen>
            <Stack.Screen 
              name="PrivacyPolicy" 
              component={PrivacyPolicy}
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              options={({ navigation }) => ({ 
                headerTitle: () => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('./assets/icon.png')} style={{ width: 28, height: 28, borderRadius: 6, marginRight: 8 }} />
                    <View style={{ justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#06b6d4' }}>D.A.I.S</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Image source={require('./assets/icee_icon.jpg')} style={{ width: 12, height: 12, borderRadius: 2, marginRight: 4 }} />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>dais.iceebilisim.com</Text>
                      </View>
                    </View>
                  </View>
                ),
                headerRight: () => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('SupportChat')} style={{ backgroundColor: '#06b6d4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Yardım</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Guide')} style={{ backgroundColor: '#ecfeff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#cffafe' }}>
                      <Text style={{ color: '#0e7490', fontSize: 12, fontWeight: 'bold' }}>Rehber</Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
            >
              {(props) => <Dashboard {...props} session={session} />}
            </Stack.Screen>
            <Stack.Screen 
              name="History" 
              options={{ title: 'Ölçüm Geçmişi' }}
            >
              {(props) => <History {...props} session={session} />}
            </Stack.Screen>
            <Stack.Screen 
              name="PrivacyPolicy" 
              component={PrivacyPolicy}
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Guide" 
              component={Guide}
              options={{ title: 'Uygulama Rehberi' }} 
            />
            <Stack.Screen 
              name="SupportChat" 
              options={{ title: 'Canlı Destek' }}
            >
              {(props) => <SupportChat {...props} session={session} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
