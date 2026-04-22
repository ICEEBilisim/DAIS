import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';
import { Clock, Activity, PlayCircle, HeartPulse, Square } from 'lucide-react-native';
import { Audio } from 'expo-av';

export default function History({ session }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    fetchRecords();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchRecords = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const playSound = async (id, url) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        if (playingId === id) {
          setPlayingId(null);
          setSound(null);
          return;
        }
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setPlayingId(id);
      await newSound.playAsync();
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Activity size={48} color="#cbd5e1" style={{marginBottom: 16}} />
          <Text style={styles.emptyTitle}>Henüz Kayıt Yok</Text>
          <Text style={styles.emptyText}>Daha önce kaydedilmiş bir ölçüm bulunamadı.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Clock size={16} color="#06b6d4" />
                  <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
              
              <View style={styles.metricsContainer}>
                {item.glucose_level !== null && (
                  <View style={styles.metricItem}>
                    <Activity size={16} color="#f97316" />
                    <View style={styles.metricValueContainer}>
                      <Text style={styles.metricValue}>{item.glucose_level}</Text>
                      <Text style={styles.metricUnit}>mg/dL</Text>
                    </View>
                  </View>
                )}
                
                {item.systolic_bp !== null && item.diastolic_bp !== null && (
                  <View style={styles.metricItem}>
                    <HeartPulse size={16} color="#f43f5e" />
                    <View style={styles.metricValueContainer}>
                      <Text style={[styles.metricValue, {color: '#f43f5e'}]}>{item.systolic_bp}/{item.diastolic_bp}</Text>
                      <Text style={styles.metricUnit}>mmHg</Text>
                    </View>
                  </View>
                )}

                {item.bpm !== null && (
                  <View style={styles.metricItem}>
                    <Activity size={16} color="#0369a1" />
                    <View style={styles.metricValueContainer}>
                      <Text style={[styles.metricValue, {color: '#0369a1'}]}>{item.bpm}</Text>
                      <Text style={styles.metricUnit}>BPM</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.audioControlsContainer}>
                <View style={styles.audioRow}>
                  <TouchableOpacity 
                    style={[styles.playBtn, playingId === item.id + '_raw' && styles.playBtnActive]}
                    onPress={() => playSound(item.id + '_raw', item.audio_url)}
                  >
                    {playingId === item.id + '_raw' ? (
                      <Square size={16} color="#fff" />
                    ) : (
                      <PlayCircle size={16} color={playingId === item.id + '_raw' ? "#fff" : "#06b6d4"} />
                    )}
                    <Text style={[styles.playBtnText, playingId === item.id + '_raw' && {color: '#fff'}]}>
                      Ham Sesi Dinle
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.durationText}>{item.recording_duration} sn kayıt</Text>
                </View>

                {item.clean_audio_url && (
                  <View style={[styles.audioRow, { marginTop: 8 }]}>
                    <TouchableOpacity 
                      style={[styles.playBtn, {backgroundColor: '#e0f2fe'}, playingId === item.id + '_clean' && {backgroundColor: '#0284c7'}]}
                      onPress={() => playSound(item.id + '_clean', item.clean_audio_url)}
                    >
                      {playingId === item.id + '_clean' ? (
                        <Square size={16} color="#fff" />
                      ) : (
                        <PlayCircle size={16} color="#0284c7" />
                      )}
                      <Text style={[styles.playBtnText, {color: '#0284c7'}, playingId === item.id + '_clean' && {color: '#fff'}]}>
                        Net Sesi Dinle
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: '#475569' },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 16 },
  metricItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', minWidth: '45%' },
  metricValueContainer: { marginLeft: 8, flexDirection: 'row', alignItems: 'baseline' },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#f97316' },
  metricUnit: { fontSize: 11, color: '#64748b', marginLeft: 4, fontWeight: '600' },
  audioControlsContainer: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  audioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfeff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  playBtnActive: { backgroundColor: '#06b6d4' },
  playBtnText: { marginLeft: 8, fontWeight: '600', color: '#06b6d4', fontSize: 13 },
  durationText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' }
});
