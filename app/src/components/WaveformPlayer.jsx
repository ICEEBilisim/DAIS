import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Square } from 'lucide-react-native';

export default function WaveformPlayer({ audioUri, waveformData = [], bpm }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      
      if (status.durationMillis > 0) {
        setProgress(status.positionMillis / status.durationMillis);
      }
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          // Eğer en sondayken basıldıysa başa sar
          if (progress >= 1 || position >= duration) {
            await sound.setPositionAsync(0);
          }
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const formatTimeMillis = (millis) => {
    if (!millis || isNaN(millis)) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İŞLENMİŞ NET SES</Text>
        {bpm && (
          <View style={styles.bpmBadge}>
            <Text style={styles.bpmText}>Nabız: {bpm} BPM</Text>
          </View>
        )}
      </View>

      <View style={styles.playerRow}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {isPlaying ? (
            <Square size={20} color="#fff" />
          ) : (
            <Play size={20} color="#fff" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        <View style={styles.waveformContainer}>
          {waveformData && waveformData.length > 0 ? (
            waveformData.map((peak, idx) => {
              const isActive = (idx / waveformData.length) <= progress;
              return (
                <View
                  key={idx}
                  style={[
                    styles.bar,
                    { 
                      height: `${Math.max(10, peak * 100)}%`,
                      backgroundColor: isActive ? '#0891b2' : '#a5f3fc' // cyan-600 vs cyan-200
                    }
                  ]}
                />
              );
            })
          ) : (
            <View style={styles.fallbackBarContainer}>
              <View style={[styles.fallbackBarFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTimeMillis(position)}</Text>
        <Text style={styles.timeText}>{formatTimeMillis(duration || 15000)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ecfeff', // cyan-50
    borderColor: '#cffafe', // cyan-100
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#155e75', // cyan-800
    letterSpacing: 0.5,
  },
  bpmBadge: {
    backgroundColor: '#a5f3fc', // cyan-200
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bpmText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#155e75',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0891b2', // cyan-600
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
  },
  fallbackBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#a5f3fc',
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  fallbackBarFill: {
    height: '100%',
    backgroundColor: '#0891b2',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 60,
    marginTop: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#0891b2',
    fontFamily: 'monospace',
    fontWeight: '500',
  }
});
