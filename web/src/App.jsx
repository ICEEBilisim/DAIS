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

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-cyan-600 font-medium">Güvenli bağlantı kuruluyor...</p></div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="bg-white shadow-sm py-4 px-6 border-b border-slate-200 relative z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-cyan-600 tracking-tight flex items-center">
                <img src={daisIcon} alt="DAIS" className="w-8 h-8 mr-2 rounded-md object-cover" />
                D.A.I.S
              </h1>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <img src={iceeIcon} alt="ICEE" className="w-4 h-4 mr-1 rounded-sm object-cover" />
                ICEE Bilişim <span className="text-orange-500 font-medium ml-1">| dais@iceebilisim.com</span>
              </p>
            </div>
            
            <div className="hidden md:flex flex-1 justify-center space-x-3">
              <Link to="/guide" className="text-sm font-semibold text-cyan-700 bg-cyan-50 px-5 py-2 rounded-full hover:bg-cyan-100 hover:text-cyan-800 transition-colors border border-cyan-100 shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Uygulama Rehberi
              </Link>
              
              {session && (
                <button onClick={() => setShowSupport(!showSupport)} className="text-sm font-semibold text-white bg-cyan-600 px-5 py-2 rounded-full hover:bg-cyan-700 transition-colors shadow-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Yardım / Destek
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/privacy-policy" className="text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors hidden sm:block">
                Gizlilik Politikası
              </Link>
              {/* Mobile links */}
              <Link to="/guide" className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors md:hidden block">
                Rehber
              </Link>
              {session && (
                <button onClick={() => setShowSupport(!showSupport)} className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors md:hidden block">
                  Yardım
                </button>
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
