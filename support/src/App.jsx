import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // İlk açılışta cachedAdmin varsa direkt true başlatıyoruz ki bekleme olmasın
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isSupabaseAdmin') === 'true');
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const withTimeout = (promise, ms) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
      ]);
    };

    const checkAdminRole = async (userId, isBackground = false) => {
      // Eğer localStorage'da onaylanmış bir admin varsa ve arka plan yenilemesiyse sorguya gerek yok
      if (localStorage.getItem('isSupabaseAdmin') === 'true' && isBackground) {
        setIsAdmin(true);
        if (!isBackground) setLoading(false);
        return;
      }

      try {
        const { data, error } = await withTimeout(
          supabase.from('admin_users').select('id').eq('id', userId).maybeSingle(),
          5000
        );
          
        if (data) {
          setIsAdmin(true);
          localStorage.setItem('isSupabaseAdmin', 'true');
        } else {
          setIsAdmin(false);
          localStorage.removeItem('isSupabaseAdmin');
          setInitError(`Güvenlik: Sisteme giriş yapıldı ancak admin yetkiniz yok. Lütfen Supabase'den kopyaladığınız UUID'nizi (${userId}) admin_users tablosuna ekleyin.`);
          await supabase.auth.signOut().catch(()=>{});
        }
      } catch (err) {
        console.error("Admin yetki kontrolü hatası:", err);
        if (!isBackground && localStorage.getItem('isSupabaseAdmin') !== 'true') {
          setIsAdmin(false);
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sessionObj) => {
      setSession(sessionObj);
      
      if (sessionObj) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (!isAdmin) {
            setLoading(true);
            await checkAdminRole(sessionObj.user.id, false);
          } else {
            // Zaten admin cache'i varsa loading yapmadan içeri al
            setLoading(false);
          }
        } else {
          // Arka plan token yenilemeleri
          checkAdminRole(sessionObj.user.id, true);
        }
      } else {
        setIsAdmin(false);
        localStorage.removeItem('isSupabaseAdmin');
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [isAdmin]);

  if (initError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-red-600 font-medium mb-4">Yetki Hatası</p>
        <p className="text-slate-500 text-sm max-w-md text-center bg-white p-4 rounded shadow">{initError}</p>
        <button onClick={() => { setInitError(null); window.location.href = '/login'; }} className="mt-6 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Tekrar Dene</button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-cyan-600 font-medium animate-pulse">Güvenli Bağlantı Kuruluyor...</p></div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route 
            path="/login" 
            element={
              session && isAdmin ? <Navigate to="/" /> : <Login />
            } 
          />
          <Route 
            path="/" 
            element={
              !session || !isAdmin ? <Navigate to="/login" /> : <Dashboard session={session} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
