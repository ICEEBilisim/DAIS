import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Send, X, MessageSquare, Loader, AlertCircle } from 'lucide-react';

const SupportChat = ({ session, hasProfile, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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
          if (!current.find(m => m.id === payload.new.id)) {
            return [...current, payload.new];
          }
          return current;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      user_id: session.user.id,
      message: messageText,
      sender: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(current => [...current, optimisticMsg]);

    try {
      let locationData = {
        ip_address: null, city: null, country: null, latitude: null, longitude: null, isp: null, connection_type: null,
        device: {
          platform: 'Web',
          brand: 'Browser',
          model: navigator.userAgent,
          os_version: navigator.platform || 'Unknown'
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
      } catch (err) {
        console.error("Konum alinmadi", err);
      }

      const { data: insertedData, error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: session.user.id,
          message: messageText,
          location_data: locationData,
          sender: 'user'
        }])
        .select();
        
      if (error) throw error;
      
      const newMsg = insertedData && insertedData.length > 0 ? insertedData[0] : null;
      
      if (newMsg) {
        setMessages(current => current.map(m => m.id === tempId ? newMsg : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(current => current.filter(m => m.id !== tempId));
      setNewMessage(messageText);
      alert('Mesaj gönderilirken hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 flex justify-between items-center rounded-t-2xl">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          <h3 className="font-semibold text-lg">Canlı Destek</h3>
        </div>
        <button onClick={onClose} className="text-cyan-100 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3 flex flex-col">
        {!hasProfile ? (
          <div className="flex flex-col justify-center items-center h-full text-slate-500">
            <AlertCircle className="w-10 h-10 mb-2 text-orange-500 opacity-80" />
            <p className="text-sm text-center font-medium">Lütfen önce doğum tarihi ve cinsiyetinizi belirtiniz.</p>
            <p className="text-xs text-center mt-2 opacity-70">Profil bilgilerinizi tamamlamadan canlı desteğe bağlanamazsınız.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="w-6 h-6 text-cyan-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm text-center">Bize bir mesaj gönderin.<br/>Size en kısa sürede dönüş yapacağız.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl ${isUser ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
                <span className={`text-[10px] text-slate-400 mt-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatDate(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={hasProfile ? "Mesajınızı yazın..." : "Önce profilinizi tamamlayın..."}
          className="flex-1 bg-slate-100 border-transparent rounded-full py-2 px-4 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={sending || !hasProfile}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || sending || !hasProfile}
          className="ml-2 bg-cyan-600 text-white p-2.5 rounded-full hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default SupportChat;
