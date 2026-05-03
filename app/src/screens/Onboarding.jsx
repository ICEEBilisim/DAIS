import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../supabaseClient';
import { UserCircle } from 'lucide-react-native';
import * as Device from 'expo-device';

export default function Onboarding({ session, onComplete, navigation }) {
  const [bird, setBird] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Regex for basic date validation YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!bird || !dateRegex.test(bird)) {
      Alert.alert("Hata", "Lütfen geçerli bir doğum tarihi girin (YYYY-AA-GG formatında).");
      return;
    }
    if (!gender || !session) return;

    setLoading(true);
    try {
      let locationData = {
        ip_address: null, city: null, country: null, latitude: null, longitude: null, isp: null, connection_type: null,
        device: {
          platform: `Mobile (${Platform.OS})`,
          brand: Device.brand || 'Unknown',
          model: Device.modelName || 'Unknown',
          os_version: Device.osVersion || 'Unknown'
        }
      };

      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          locationData = {
            ...locationData,
            ip_address: ipData.ip || null, 
            city: ipData.city || null, 
            country: ipData.country_name || null,
            latitude: ipData.latitude || null, 
            longitude: ipData.longitude || null,
            isp: ipData.org || null, 
            connection_type: ipData.network || null
          };
        } else {
          const fallbackRes = await fetch('https://api.ipify.org?format=json');
          const fallbackData = await fallbackRes.json();
          locationData.ip_address = fallbackData.ip || null;
        }
      } catch (e) {
        console.error("Konum bilgileri alınamadı:", e);
      }

      const { error } = await supabase
        .from('users')
        .insert([
          { 
            id: session.user.id, 
            bird: bird, 
            gender: gender,
            location_data: locationData // locationData bir JSON (Object) olarak gidecek
          }
        ]);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Hata", "Hata detayı: " + (error.message || "Bir hata oluştu"));
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <UserCircle size={40} color="#06b6d4" />
        </View>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>D.A.I.S projesine katkıda bulunmak için lütfen bilgilerinizi girin.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Doğum Tarihiniz (YYYY-AA-GG)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 1980-05-15"
          value={bird}
          onChangeText={setBird}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Cinsiyetiniz</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'Kadin' && styles.genderButtonActive]}
            onPress={() => setGender('Kadin')}
          >
            <Text style={[styles.genderText, gender === 'Kadin' && styles.genderTextActive]}>Kadın</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'Erkek' && styles.genderButtonActive]}
            onPress={() => setGender('Erkek')}
          >
            <Text style={[styles.genderText, gender === 'Erkek' && styles.genderTextActive]}>Erkek</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (loading || !bird || !gender) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !bird || !gender}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Kaydet ve Başla</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ marginTop: 20, alignItems: 'center' }}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={{ fontSize: 13, color: '#64748b', textDecorationLine: 'underline' }}>
            Gizlilik Politikası'nı Okuyun
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ecfeff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  genderTextActive: {
    color: '#0369a1',
  },
  submitButton: {
    backgroundColor: '#f97316',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#fdba74',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
