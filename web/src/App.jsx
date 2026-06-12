import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import PrivacyPolicy from './components/PrivacyPolicy';
import Guide from './components/Guide';
import SupportChat from './components/SupportChat';
import Brosur from './components/Brosur';
import TestResults from './components/TestResults';
import { Menu, X } from 'lucide-react';
import daisIcon from './assets/dais_icon.png';
import iceeIcon from './assets/icee_icon.jpg';

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Supabase'de anonim giriş var (Sign in anonymously)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session) {
        const { data, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          console.error("Supabase anonymous auth error:", signInError);
        } else {
          setSession(data.session);
          checkProfile(data.user?.id);
        }
      } else {
        setSession(session);
        checkProfile(session.user?.id);
      }
    };

    const checkProfile = async (userId) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId);
        
      if (data && data.length > 0) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !session.user) return;

    // Listen for new admin messages
    const channel = supabase
      .channel(`app_support_notifications_${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${session.user.id}` }, payload => {
        if (payload.new.sender === 'admin') {
          // Add a small delay to avoid false positives if they just opened the chat
          setTimeout(() => {
            setHasUnreadSupport(prev => true);
          }, 500);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-cyan-600 font-medium">Güvenli bağlantı kuruluyor...</p></div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="bg-white shadow-sm py-4 px-6 border-b border-slate-200 relative z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <div className="flex flex-col">
              <Link to="/" className="text-2xl font-bold text-cyan-600 tracking-tight flex items-center hover:opacity-90 transition-opacity">
                <img src={daisIcon} alt="DAIS" className="w-8 h-8 mr-2 rounded-md object-cover" />
                D.A.I.S
                <div className="ml-3 pl-3 border-l border-slate-200 flex items-center text-sm text-slate-500 font-normal">
                  <img src={iceeIcon} alt="ICEE" className="w-4 h-4 mr-1.5 rounded-sm object-cover" />
                  ICEE Bilişim
                </div>
              </Link>
              <div className="text-xs text-slate-500 flex items-center mt-2">
                <a href="https://chat.whatsapp.com/C63NIlH1vimLtGCM3pqzbm" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  WhatsApp Grubu
                </a>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 flex items-center shadow-sm relative"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                {hasUnreadSupport && !isMenuOpen && !showSupport && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-xl border border-slate-100 w-56 py-3 z-50 overflow-hidden transform origin-top-right transition-all">
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    Ana Sayfa
                  </Link>
                  <Link 
                    to="/tahliller" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    Tahlil Sonuçları
                  </Link>
                  <Link 
                    to="/guide" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    Uygulama Rehberi
                  </Link>
                  <Link 
                    to="/brosur" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    Broşür
                  </Link>
                  <Link 
                    to="/privacy-policy" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-b border-slate-100 mb-1 pb-4"
                  >
                    Gizlilik Politikası
                  </Link>
                  
                  {session && (
                    <div className="px-3 pt-1">
                      <button 
                        onClick={() => { 
                          setShowSupport(!showSupport); 
                          setHasUnreadSupport(false);
                          setIsMenuOpen(false);
                        }} 
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors shadow-sm flex items-center justify-between"
                      >
                        Yardım / Destek
                        {hasUnreadSupport && !showSupport && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 relative z-10">
          <Routes>
            <Route 
              path="/" 
              element={
                !session ? <div className="text-center py-10 text-slate-500">Güvenli bağlantı kurulamadı...</div> :
                hasProfile ? <Dashboard session={session} /> : <Onboarding session={session} onComplete={() => setHasProfile(true)} />
              } 
            />
            <Route 
              path="/history" 
              element={
                !session || !hasProfile ? <Navigate to="/" /> : <History session={session} />
              } 
            />
            <Route 
              path="/tahliller" 
              element={
                !session || !hasProfile ? <Navigate to="/" /> : <TestResults session={session} />
              } 
            />
            <Route 
              path="/guide" 
              element={<Guide />} 
            />
            <Route 
              path="/privacy-policy" 
              element={<PrivacyPolicy />} 
            />
            <Route 
              path="/brosur" 
              element={<Brosur />} 
            />
          </Routes>
          
          {showSupport && session && (
            <SupportChat session={session} hasProfile={hasProfile} onClose={() => setShowSupport(false)} />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
