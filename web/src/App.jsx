import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import PrivacyPolicy from './components/PrivacyPolicy';
import Guide from './components/Guide';
import SupportChat from './components/SupportChat';
import daisIcon from './assets/dais_icon.png';
import iceeIcon from './assets/icee_icon.jpg';

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

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
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-auto flex flex-col">
              <h1 className="text-2xl font-bold text-cyan-600 tracking-tight flex items-center">
                <img src={daisIcon} alt="DAIS" className="w-8 h-8 mr-2 rounded-md object-cover" />
                D.A.I.S
              </h1>
              <div className="text-xs text-slate-500 flex flex-wrap items-center mt-2 gap-y-2">
                <div className="flex items-center">
                  <img src={iceeIcon} alt="ICEE" className="w-4 h-4 mr-1 rounded-sm object-cover" />
                  ICEE Bilişim 
                  <span className="text-orange-500 font-medium ml-1">| dais@iceebilisim.com</span>
                </div>
                <span className="mx-2 text-slate-300 hidden sm:inline">|</span>
                <a href="https://chat.whatsapp.com/C63NIIH1vimLtGCM3pqzbm" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1 w-full sm:w-auto mt-1 sm:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  WhatsApp Grubu
                </a>
              </div>
            </div>
            
            <div className="hidden md:flex flex-1 justify-center space-x-3">
              <Link to="/guide" className="text-sm font-semibold text-cyan-700 bg-cyan-50 px-5 py-2 rounded-full hover:bg-cyan-100 hover:text-cyan-800 transition-colors border border-cyan-100 shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Uygulama Rehberi
              </Link>
              
              {session && (
                <div className="relative">
                  <button 
                    onClick={() => { setShowSupport(!showSupport); setHasUnreadSupport(false); }} 
                    className="text-sm font-semibold text-white bg-cyan-600 px-5 py-2 rounded-full hover:bg-cyan-700 transition-colors shadow-sm flex items-center h-full relative"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Yardım / Destek
                    {hasUnreadSupport && !showSupport && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                      </span>
                    )}
                  </button>
                  {hasUnreadSupport && !showSupport && (
                    <div className="absolute top-full mt-2 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg whitespace-nowrap animate-bounce pointer-events-none">
                      Yeni Mesajınız Var!
                      <div className="absolute -top-1 right-5 w-2 h-2 bg-red-500 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-100 md:border-t-0">
              <Link to="/privacy-policy" className="text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors block">
                Gizlilik Politikası
              </Link>
              {/* Mobile links */}
              <Link to="/guide" className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors md:hidden block">
                Rehber
              </Link>
              {session && (
                <div className="relative">
                  <button 
                    onClick={() => { setShowSupport(!showSupport); setHasUnreadSupport(false); }} 
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors md:hidden block relative"
                  >
                    Yardım
                    {hasUnreadSupport && !showSupport && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </button>
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
              path="/guide" 
              element={<Guide />} 
            />
            <Route 
              path="/privacy-policy" 
              element={<PrivacyPolicy />} 
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
