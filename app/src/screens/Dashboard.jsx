import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../supabaseClient';
import { Mic, Square, Activity, Save, History as HistoryIcon, PlayCircle, HeartPulse } from 'lucide-react-native';

export default function Dashboard({ navigation, session }) {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUri, setAudioUri] = useState(null);
  
  const [glucose, setGlucose] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [calculatedBpm, setCalculatedBpm] = useState(null);
  const [cleanAudioUri, setCleanAudioUri] = useState(null);
  
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef(null);
  const recordingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playRecordedAudio = async (uriToPlay) => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uriToPlay || audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.setPositionAsync(0);
        }
      });
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Hata', 'Mikrofon izni verilmedi');
        return;
      }

      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUri(null);
      setCleanAudioUri(null);
      setCalculatedBpm(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Hata', 'Kayıt başlatılamadı: ' + err.message);
    }
  }

  const analyzeAudio = async (uri) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: 'recording.m4a',
        type: 'audio/m4a'
      });

      const response = await fetch('http://192.168.0.12:8000/analyze-audio', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.status === 'error') {
        Alert.alert("Hata", result.message || 'Nabız alınamadı. Lütfen tekrar deneyin.');
        setAudioUri(null);
      } else {
        setCalculatedBpm(result.bpm);
        
        // Save base64 to local file
        const cleanPath = FileSystem.documentDirectory + Date.now() + '_clean.wav';
        await FileSystem.writeAsStringAsync(cleanPath, result.clean_audio_b64, {
          encoding: 'base64',
        });
        setCleanAudioUri(cleanPath);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Hata", "Ses analiz sunucusuna ulaşılamadı. Python API'sinin çalıştığından emin olun.");
      setAudioUri(null);
    }
    setAnalyzing(false);
  };

  async function stopRecording() {
    if (!recording) return;

    if (recordingTime < 15) {
      Alert.alert("Uyarı", "Kayıt süresi en az 15 saniye olmalıdır. Lütfen tekrar kaydedin.");
    }
    
    setIsRecording(false);
    clearInterval(timerRef.current);
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(undefined);

    if (recordingTime >= 15) {
      analyzeAudio(uri);
    }
  }

  const handleSubmit = async () => {
    const hasGlucose = glucose.trim() !== '';
    const hasBp = systolicBp.trim() !== '' && diastolicBp.trim() !== '';

    if (!audioUri) {
      Alert.alert("Uyarı", "Lütfen ses kaydını tamamlayın.");
      return;
    }
    
    if (!hasGlucose && !hasBp) {
      Alert.alert("Uyarı", "Lütfen en az bir ölçüm değeri (Glukoz veya Tansiyon) girin.");
      return;
    }

    if ((systolicBp.trim() !== '' && diastolicBp.trim() === '') || (systolicBp.trim() === '' && diastolicBp.trim() !== '')) {
      Alert.alert("Uyarı", "Tansiyon girecekseniz lütfen hem büyük hem küçük tansiyonu doldurun.");
      return;
    }

    if (recordingTime < 15) {
      Alert.alert("Uyarı", "Ses kaydı yetersiz. En az 15 saniyelik bir kayıt gerekiyor.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Original Audio
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileName = `${session.user.id}/${Date.now()}.m4a`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, arrayBuffer, {
          contentType: 'audio/m4a'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      // 2. Upload Clean Audio if exists
      let cleanPublicUrl = null;
      if (cleanAudioUri) {
        const cleanResponse = await fetch(cleanAudioUri);
        const cleanBlob = await cleanResponse.blob();
        const cleanArrayBuffer = await new Response(cleanBlob).arrayBuffer();
        
        const cleanFileName = `clean/${session.user.id}/${Date.now()}_clean.wav`;
        const { error: cleanUploadError } = await supabase.storage
          .from('recordings')
          .upload(cleanFileName, cleanArrayBuffer, {
            contentType: 'audio/wav'
          });
          
        if (!cleanUploadError) {
          cleanPublicUrl = supabase.storage.from('recordings').getPublicUrl(cleanFileName).data.publicUrl;
        }
      }

      // 3. Save Data to Supabase
      const recordData = {
        user_id: session.user.id,
        audio_url: publicUrl,
        clean_audio_url: cleanPublicUrl,
        bpm: calculatedBpm,
        recording_duration: recordingTime
      };

      if (hasGlucose) recordData.glucose_level = parseFloat(glucose);
      if (hasBp) {
        recordData.systolic_bp = parseInt(systolicBp, 10);
        recordData.diastolic_bp = parseInt(diastolicBp, 10);
      }

      const { error: dbError } = await supabase
        .from('health_records')
        .insert([recordData]);

      if (dbError) throw dbError;

      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);

      Alert.alert("Başarılı", "Verileriniz başarıyla kaydedildi.");
      setAudioUri(null);
      setCleanAudioUri(null);
      setCalculatedBpm(null);
      setGlucose('');
      setSystolicBp('');
      setDiastolicBp('');
      setRecordingTime(0);
      
    } catch (err) {
      console.error("Error submitting data:", err);
      Alert.alert("Hata", "Veriler kaydedilirken bir hata oluştu: " + err.message);
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Yeni Ölçüm Kaydı</Text>
          <Text style={styles.subtitle}>Kalp sesi, tansiyon ve glukoz</Text>
        </View>
        <TouchableOpacity 
          style={styles.historyBtn}
          onPress={() => navigation.navigate('History')}
        >
          <HistoryIcon size={16} color="#06b6d4" />
          <Text style={styles.historyBtnText}>Geçmiş</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Kalp Sesi Kaydı</Text>
        <Text style={styles.desc}>En az 30 saniyelik kalp sesinizi kaydedin. (Min: 15 sn)</Text>
        
        <View style={styles.recordBox}>
          <Text style={[styles.timer, isRecording && styles.timerActive]}>
            {formatTime(recordingTime)}
          </Text>
          
          {!isRecording ? (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <Mic color="#fff" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.recordBtnText}>Kaydı Başlat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Square color="#fff" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.recordBtnText}>Kaydı Bitir</Text>
            </TouchableOpacity>
          )}

          {analyzing && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#06b6d4" />
              <Text style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Ses analiz ediliyor, nabız aranıyor...</Text>
            </View>
          )}

          {audioUri && !isRecording && !analyzing && (
            <View style={{ marginTop: 16, width: '100%' }}>
              <TouchableOpacity style={styles.playRecordedBtn} onPress={() => playRecordedAudio(audioUri)}>
                {isPlaying ? (
                  <Square color="#10b981" size={20} style={{ marginRight: 8 }} />
                ) : (
                  <PlayCircle color="#10b981" size={20} style={{ marginRight: 8 }} />
                )}
                <Text style={styles.playRecordedText}>
                  {isPlaying ? "Durdur" : "Ham Sesi Dinle"}
                </Text>
              </TouchableOpacity>
              
              {cleanAudioUri && (
                <View style={styles.cleanAudioBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369a1' }}>İşlenmiş Net Ses</Text>
                    {calculatedBpm && (
                      <View style={{ backgroundColor: '#bae6fd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369a1' }}>Nabız: {calculatedBpm} BPM</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity style={[styles.playRecordedBtn, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd', marginTop: 0 }]} onPress={() => playRecordedAudio(cleanAudioUri)}>
                    {isPlaying ? (
                      <Square color="#0284c7" size={20} style={{ marginRight: 8 }} />
                    ) : (
                      <PlayCircle color="#0284c7" size={20} style={{ marginRight: 8 }} />
                    )}
                    <Text style={[styles.playRecordedText, { color: '#0284c7' }]}>
                      {isPlaying ? "Durdur" : "Net Sesi Dinle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>2. Ölçüm Değerleri</Text>
        <Text style={styles.desc}>Glukoz ve/veya tansiyon değerlerinizi girin. En az biri zorunludur.</Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.inputLabel}>Anlık Glukoz Değeri</Text>
          <View style={styles.inputContainer}>
            <Activity color="#06b6d4" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Örn: 105"
              keyboardType="numeric"
              value={glucose}
              onChangeText={setGlucose}
            />
            <Text style={styles.inputSuffix}>mg/dL</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.inputLabel}>Tansiyon (Büyük / Küçük)</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={[styles.inputContainer, { flex: 0.48 }]}>
              <HeartPulse color="#f43f5e" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Büyük"
                keyboardType="numeric"
                value={systolicBp}
                onChangeText={setSystolicBp}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 0.48 }]}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                placeholder="Küçük"
                keyboardType="numeric"
                value={diastolicBp}
                onChangeText={setDiastolicBp}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (loading || !audioUri || (!glucose.trim() && !(systolicBp.trim() && diastolicBp.trim())) || recordingTime < 15 || analyzing || !calculatedBpm) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !audioUri || (!glucose.trim() && !(systolicBp.trim() && diastolicBp.trim())) || recordingTime < 15 || analyzing || !calculatedBpm}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : analyzing ? (
            <Text style={styles.submitButtonText}>Analiz Ediliyor...</Text>
          ) : !calculatedBpm ? (
            <Text style={styles.submitButtonText}>Önce Nabız Alınmalı</Text>
          ) : (
            <>
              <Save color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Veritabanına Gönder</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfeff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  historyBtnText: { color: '#06b6d4', fontWeight: '600', marginLeft: 6, fontSize: 14 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 4 },
  desc: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  recordBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  timer: { fontSize: 36, fontWeight: 'bold', color: '#475569', marginBottom: 20, fontFamily: 'monospace' },
  timerActive: { color: '#f97316' },
  recordBtn: { flexDirection: 'row', backgroundColor: '#06b6d4', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center' },
  stopBtn: { flexDirection: 'row', backgroundColor: '#f97316', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center' },
  recordBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  playRecordedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: '#a7f3d0' },
  playRecordedText: { color: '#10b981', fontWeight: '600', fontSize: 15 },
  cleanAudioBox: { marginTop: 12, backgroundColor: '#f0f9ff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0f2fe' },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1e293b' },
  inputSuffix: { color: '#94a3b8', fontWeight: '500' },
  submitButton: { flexDirection: 'row', backgroundColor: '#0891b2', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  submitButtonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
