import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Users, LogOut, Send, MessageSquare, Clock, Globe } from 'lucide-react';

const Dashboard = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [sendError, setSendError] = useState(null);
  
  const [readTimestamps, setReadTimestamps] = useState(() => {
    const saved = localStorage.getItem('adminReadTimestamps');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('adminReadTimestamps', JSON.stringify(readTimestamps));
  }, [readTimestamps]);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('support_admin_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages'
      }, (payload) => {
        const currentUser = selectedUserRef.current;
        
        // Eğer kullanıcıdan yeni mesaj geldiyse ve şu an ona bakıyorsak, okundu olarak işaretle.
        // Bakmıyorsak yeni mesajın tarihi zaten son okunma tarihinden büyük olacağı için otomatik YENİ görünecektir.
        if (payload.new.sender === 'user' && payload.new.user_id === currentUser) {
          setReadTimestamps(prev => ({
            ...prev,
            [currentUser]: payload.new.created_at
          }));
        }
        
        setMessages(current => {
          if (currentUser && payload.new.user_id === currentUser) {
            if (!current.find(m => m.id === payload.new.id)) {
              return [...current, payload.new];
            }
          }
          return current;
        });
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('user_id, message, created_at, location_data, sender')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueUsers = [];
      const userMap = new Map();

      if (data) {
        data.forEach(msg => {
          if (!userMap.has(msg.user_id)) {
            userMap.set(msg.user_id, true);
            uniqueUsers.push({
              id: msg.user_id,
              lastMessage: msg.message,
              lastMessageTime: msg.created_at,
              location_data: msg.location_data,
              unread: msg.sender === 'user'
            });
          }
        });
      }
      
      setUsers(uniqueUsers);
      setFetchError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setFetchError(err.message || 'Bilinmeyen veritabanı hatası');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    setChatError(null);
    setSendError(null);
    
    const userObj = users.find(u => u.id === userId);
    if (userObj) {
      setReadTimestamps(prev => ({
        ...prev,
        [userId]: userObj.lastMessageTime
      }));
    }

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching chat:', err);
      setChatError(err.message || 'Mesajlar yüklenemedi.');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedUser) return;
    setSendError(null);

    try {
      const { data: newMsg, error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: selectedUser,
          message: reply.trim(),
          sender: 'admin'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setMessages(current => {
        if (!current.find(m => m.id === newMsg.id)) {
          return [...current, newMsg];
        }
        return current;
      });
      
      setReply('');
    } catch (err) {
      console.error('Error sending reply:', err);
      setSendError(err.message || 'Yanıt gönderilemedi.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const formatShortTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden select-none">
      {/* Sidebar */}
      <div 
        style={{ width: sidebarWidth }} 
        className="bg-white border-r border-slate-200 flex flex-col z-10 flex-shrink-0 relative"
      >
        {/* Kusursuz Resize Handle (Pointer Capture) */}
        <div 
          className="absolute top-0 -right-2 w-4 h-full cursor-col-resize z-50 flex justify-center items-center group touch-none"
          onPointerDown={(e) => {
            e.preventDefault();
            e.target.setPointerCapture(e.pointerId);
            setIsResizing(true);
          }}
          onPointerMove={(e) => {
            if (!isResizing) return;
            const newWidth = Math.max(250, Math.min(e.clientX, 600));
            setSidebarWidth(newWidth);
          }}
          onPointerUp={(e) => {
            setIsResizing(false);
            e.target.releasePointerCapture(e.pointerId);
          }}
        >
          <div className={`h-full w-1 transition-colors ${isResizing ? 'bg-cyan-500' : 'bg-transparent group-hover:bg-cyan-400'}`}></div>
        </div>

        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center font-bold text-lg">
            <Users className="w-5 h-5 mr-2 text-cyan-400" />
            Destek Merkezi
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div>
          ) : fetchError ? (
            <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              <span className="font-bold block mb-1">Veritabanı Hatası:</span>
              {fetchError}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Mesaj bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map(u => {
                const isSelected = selectedUser === u.id;
                const lastRead = readTimestamps[u.id];
                const isUnread = u.unread && (!lastRead || new Date(u.lastMessageTime) > new Date(lastRead));

                return (
                  <button 
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full text-left p-4 transition-all relative
                      ${isSelected ? 'bg-cyan-50 border-l-4 border-cyan-500' : 'border-l-4 border-transparent hover:bg-slate-50'}
                      ${isUnread ? 'bg-blue-50/40' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        {isUnread && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-md"></span>
                        )}
                        <span className={`text-sm font-mono truncate mr-2 ${isUnread ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {u.id.substring(0, 8)}...
                        </span>
                        {isUnread && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Yeni</span>
                        )}
                      </div>
                      <span className={`text-xs whitespace-nowrap ml-2 ${isUnread ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                        {formatShortTime(u.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {u.lastMessage}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-mono font-bold mr-3">
                  {selectedUser.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 font-mono text-sm">{selectedUser}</h2>
                  <div className="flex flex-col text-xs text-slate-500 mt-0.5 space-y-0.5">
                    {(() => {
                      const loc = users.find(u => u.id === selectedUser)?.location_data;
                      if (!loc) return <div className="flex items-center"><Globe className="w-3 h-3 mr-1 flex-shrink-0" /><span>Bilinmiyor</span></div>;
                      
                      const locParts = [];
                      if (loc.ip_address) locParts.push(`IP: ${loc.ip_address}`);
                      if (loc.city || loc.country) locParts.push(`${loc.city || ''}, ${loc.country || ''}`);
                      if (loc.isp) locParts.push(`${loc.isp} (${loc.connection_type || 'Unknown'})`);

                      const deviceParts = [];
                      if (loc.device) {
                        deviceParts.push(loc.device.platform);
                        if (loc.device.brand && loc.device.brand !== 'Unknown' && loc.device.brand !== 'Browser') deviceParts.push(loc.device.brand);
                        if (loc.device.os_version && loc.device.os_version !== 'Unknown') deviceParts.push(`OS: ${loc.device.os_version}`);
                      }

                      return (
                        <>
                          {deviceParts.length > 0 && (
                            <div className="flex items-center text-slate-600 font-medium">
                              <span className="mr-1">{loc.device.platform.includes('Web') ? '🌐' : '📱'}</span>
                              <span className="truncate max-w-[300px]">{deviceParts.join(' • ')}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate max-w-[300px]">{locParts.join(' • ') || 'Lokasyon Bilinmiyor'}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto relative">
              {chatError ? (
                <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm shadow-sm z-20">
                  <span className="font-bold block mb-1">Mesajlar Alınamadı:</span>
                  {chatError}
                </div>
              ) : null}
              <div className="space-y-4 max-w-4xl mx-auto flex flex-col">
                {messages.map(msg => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end' : 'self-start'}`}>
                      <div className={`p-4 rounded-2xl ${isAdmin ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white border border-slate-200 shadow-sm rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className={`flex items-center mt-1 text-[11px] text-slate-400 ${isAdmin ? 'justify-end mr-1' : 'ml-1'}`}>
                        {!isAdmin && msg.location_data && (
                          <span className="mr-2 px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 truncate max-w-xs flex items-center">
                            {msg.location_data.device && (
                              <span title={msg.location_data.device.model} className="mr-1">
                                {msg.location_data.device.platform.includes('Web') ? '🌐' : '📱'}
                              </span>
                            )}
                            <span>{msg.location_data.city ? `${msg.location_data.city}, ${msg.location_data.country} (${msg.location_data.isp})` : (msg.location_data.ip_address || 'IP Bilinmiyor')}</span>
                          </span>
                        )}
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(msg.created_at)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200 relative">
              {sendError && (
                <div className="absolute -top-12 left-0 right-0 text-center pointer-events-none">
                  <span className="inline-block bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {sendError}
                  </span>
                </div>
              )}
              <form onSubmit={handleReply} className="max-w-4xl mx-auto flex items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 min-h-[50px] resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!reply.trim()}
                  className="ml-3 bg-cyan-600 hover:bg-cyan-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="max-w-4xl mx-auto text-center mt-2">
                <span className="text-xs text-slate-400">Göndermek için Enter'a basın. Alt satır için Shift + Enter.</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-500">Destek Mesajı Seçin</p>
            <p className="text-sm mt-2">Mesajları görüntülemek ve yanıtlamak için soldaki listeden bir kullanıcı seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
