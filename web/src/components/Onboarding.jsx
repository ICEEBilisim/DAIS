import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserCircle } from 'lucide-react';

const Onboarding = ({ session, onComplete }) => {
  const [bird, setBird] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bird || !gender || !session) return;

    setLoading(true);
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
      } catch (e) {
        console.error("Konum bilgileri alınamadı:", e);
      }

      const { error } = await supabase
        .from('users')
        .insert([
          { 
            id: session.user.id, 
            bird: bird, 
            gender: gender,
            location_data: locationData // locationData bir JSON (Object) olarak gidecek
          }
        ]);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Hata detayı: " + (error.message || JSON.stringify(error)));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4">
          <UserCircle className="w-8 h-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Hoş Geldiniz</h2>
        <p className="text-sm text-slate-500 text-center mt-2">D.A.I.S projesine katkıda bulunmak için lütfen bilgilerinizi girin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Doğum Tarihiniz</label>
          <input
            type="date"
            required
            value={bird}
            onChange={(e) => setBird(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Cinsiyetiniz</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setGender('Kadin')}
              className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                gender === 'Kadin' 
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Kadın
            </button>
            <button
              type="button"
              onClick={() => setGender('Erkek')}
              className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                gender === 'Erkek' 
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Erkek
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !bird || !gender}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet ve Başla'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
