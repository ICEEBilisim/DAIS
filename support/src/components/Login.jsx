import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Activity } from 'lucide-react';

const Login = () => {
  const [adminUser, setAdminUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginEmail = adminUser.includes('@') ? adminUser : `${adminUser}@iceebilisim.com`;

      // 1. Adım: Supabase Auth Girişi
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 2. Adım: Admin yetkisi kontrolü
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error(`Şifre doğru fakat yetki yok! Supabase'den kopyaladığınız şu UUID'yi admin_users tablosuna eklemelisiniz: ${data.user.id}`);
      }
      
      // Başarılı giriş. App.jsx'teki onAuthStateChange listener'ı otomatik algılayıp paneli açacaktır.
      
    } catch (err) {
      console.error("Login Exception:", err);
      setError(`Hata: ${err.message || 'Bilinmeyen hata'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans">
      <div className="w-full max-w-sm p-10 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col items-center">
        
        {/* Minimal Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-cyan-600 mb-4 bg-cyan-50 p-4 rounded-full border border-cyan-100">
            <Activity size={32} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">D.A.I.S Admin</h1>
          <p className="text-sm text-gray-500 mt-2">Yetkili Girişi</p>
        </div>

        {error && (
          <div className="mb-6 w-full max-w-[250px] p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs text-center break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col items-center w-full">
          <div className="w-[250px] mb-4">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">Admin Kullanıcı Adı</label>
            <input
              type="text"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              required
              className="w-full border-2 border-gray-100 bg-gray-50 py-2.5 px-4 rounded-lg text-center text-gray-900 font-medium focus:bg-white focus:border-cyan-500 outline-none transition-all"
              placeholder="Admin"
            />
          </div>

          <div className="w-[250px] mb-6">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-gray-100 bg-gray-50 py-2.5 px-4 rounded-lg text-center text-gray-900 font-medium focus:bg-white focus:border-cyan-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="w-[250px]">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md shadow-cyan-600/20"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;
