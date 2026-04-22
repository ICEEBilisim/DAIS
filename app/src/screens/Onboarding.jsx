import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';
import { UserCircle } from 'lucide-react-native';

export default function Onboarding({ session, onComplete }) {
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
      const { error } = await supabase
        .from('users')
        .insert([
          { 
            id: session.user.id, 
            bird: bird, 
            gender: gender 
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
