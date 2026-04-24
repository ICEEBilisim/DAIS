import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import PrivacyPolicy from './components/PrivacyPolicy';

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .eq('id', userId)
        .single();
        
      if (data) {
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
        <header className="bg-white shadow-sm py-4 px-6 border-b border-slate-200">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-cyan-600 tracking-tight">D.A.I.S</h1>
              <p className="text-xs text-slate-500">ICEE Bilişim <span className="text-orange-500 font-medium">| dais.iceebilisim.com</span></p>
            </div>
            <div>
              <Link to="/privacy-policy" className="text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors">
                Gizlilik Politikası
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
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
              path="/privacy-policy" 
              element={<PrivacyPolicy />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
