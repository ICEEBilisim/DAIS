import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { Send, MessageSquare } from 'lucide-react-native';

export default function SupportChat({ session }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:support_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        setMessages(current => {
          // Avoid duplicates if we already added it optimistically
          if (current.some(m => m.id === payload.new.id)) return current;
          return [...current, payload.new];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.user.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      let locationData = {
        ip_address: null, city: null, country: null, latitude: null, longitude: null, isp: null, connection_type: null
      };

      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          locationData = {
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
      } catch (err) {
        console.error("Konum alinmadi", err);
      }

      const { data: newMsg, error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: session.user.id,
          message: newMessage.trim(),
          location_data: locationData,
          sender: 'user'
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Web'deki gibi gönderdiğimiz mesajı bekletmeden anında ekrana ekliyoruz
      setMessages(current => {
        if (!current.some(m => m.id === newMsg.id)) {
          return [...current, newMsg];
        }
        return current;
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAdmin]}>
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAdmin]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAdmin]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAdmin]}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Bize bir mesaj gönderin.</Text>
          <Text style={styles.emptySubtext}>Size en kısa sürede dönüş yapacağız.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  listContent: { padding: 16 },
  messageWrapper: { maxWidth: '80%', marginBottom: 16 },
  messageWrapperUser: { alignSelf: 'flex-end' },
  messageWrapperAdmin: { alignSelf: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 20 },
  messageBubbleUser: { backgroundColor: '#06b6d4', borderBottomRightRadius: 4 },
  messageBubbleAdmin: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  messageText: { fontSize: 15 },
  messageTextUser: { color: '#ffffff' },
  messageTextAdmin: { color: '#1e293b' },
  timestamp: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  timestampUser: { textAlign: 'right', marginRight: 4 },
  timestampAdmin: { textAlign: 'left', marginLeft: 4 },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, paddingTop: 10, maxHeight: 100, fontSize: 15, color: '#1e293b' },
  sendButton: { backgroundColor: '#06b6d4', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: '#94a3b8' }
});
