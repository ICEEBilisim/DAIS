import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mic, Square, Activity, Save, History as HistoryIcon, AlertCircle, CheckCircle2, HeartPulse } from 'lucide-react';
import WaveformPlayer from './WaveformPlayer';

const Dashboard = ({ session }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [glucose, setGlucose] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [calculatedBpm, setCalculatedBpm] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && recordingTime >= 30) {
      stopRecording();
    }
  }, [recordingTime, isRecording]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Tarayıcınız mikrofon erişimini desteklemiyor veya güvenli bağlantı (HTTPS) kullanılmıyor.");
        return;
      }
      if (typeof MediaRecorder === 'undefined') {
        setError("Tarayıcınız ses kaydetme özelliğini desteklemiyor. Lütfen güncel bir Chrome veya Safari kullanın.");
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
      } catch (constraintErr) {
        console.warn("Gelişmiş ses ayarları desteklenmiyor, varsayılan ayarlarla deneniyor:", constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        analyzeAudio(audioBlob, finalMimeType);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(`Mikrofona erişilemedi: ${err.message || 'Lütfen izinleri kontrol edin.'}`);
    }
  };

  const analyzeAudio = async (blob, mimeType = 'audio/webm') => {
    setAnalyzing(true);
    setError('');
    
    try {
      const ext = mimeType.includes('mp4') ? 'm4a' : (mimeType.includes('ogg') ? 'ogg' : 'webm');
      const formData = new FormData();
      formData.append('file', blob, `recording.${ext}`);

      // VITE_API_URL ortam değişkeni varsa onu, yoksa Render üretim adresini kullan
      // Railway'den alacağımız ortam değişkenini (VITE_API_URL) kullanacağız
      // Şimdilik boş bırakıyoruz, Vercel/Render iptal.
      const API_URL = import.meta.env.VITE_API_URL || 'https://dais-production.up.railway.app';
      const response = await fetch(`${API_URL}/analyze-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.detail || errorData.message || `Sunucu hatası: ${response.status}`;
        throw new Error(serverError);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        setError(result.message || 'Nabız alınamadı. Lütfen steteskopu/mikrofonu daha iyi konumlandırıp tekrar deneyin.');
        setAudioBlob(null);
        setAudioUrl(null);
      } else {
        setCalculatedBpm(result.bpm);
        setWaveformData(result.waveform_data || []);
      }
    } catch (err) {
      console.error("API Hatası:", err);
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        setError("Sunucuya bağlanılamadı (Fetch Failed). Eski bir cihaz veya tarayıcı kullanıyorsanız güvenlik sertifikası desteklenmiyor olabilir veya internetiniz kesilmiş olabilir.");
      } else {
        const errorMsg = err.message || 'Ses analiz sunucusuna ulaşılamadı.';
        setError(`Hata: ${errorMsg}`);
      }
      setAudioBlob(null);
      setAudioUrl(null);
    }
    setAnalyzing(false);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 15) {
        setError("Kayıt süresi en az 15 saniye olmalıdır. Hedefimiz 30 saniyeye yakın bir kalp sesidir. Lütfen tekrar kaydedin.");
      } else {
        setError('');
      }
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasGlucose = glucose.trim() !== '';
    const hasBp = systolicBp.trim() !== '' && diastolicBp.trim() !== '';

    if (!audioBlob || !session) {
      setError("Lütfen ses kaydını tamamlayın.");
      return;
    }
    
    if (!hasGlucose && !hasBp) {
      setError("Lütfen en az bir ölçüm değeri (Glukoz veya Tansiyon) girin.");
      return;
    }

    if ((systolicBp.trim() !== '' && diastolicBp.trim() === '') || (systolicBp.trim() === '' && diastolicBp.trim() !== '')) {
      setError("Tansiyon girecekseniz lütfen hem büyük hem küçük tansiyonu doldurun.");
      return;
    }

    if (recordingTime < 15) {
      setError("Ses kaydı yetersiz. En az 15 saniyelik bir kayıt gerekiyor.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Upload Original Audio to Supabase Storage
      const ext = audioBlob.type.includes('mp4') ? 'm4a' : (audioBlob.type.includes('ogg') ? 'ogg' : 'webm');
      const fileName = `${session.user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || 'audio/webm'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      let locationData = {
        ip_address: null, city: null, country: null, latitude: null, longitude: null, isp: null, connection_type: null
      };
      try {
        const ipRes = await fetch('https://ipwhois.app/json/');
        const ipData = await ipRes.json();
        if (ipData.success) {
          locationData = {
            ip_address: ipData.ip, city: ipData.city, country: ipData.country,
            latitude: ipData.latitude, longitude: ipData.longitude,
            isp: ipData.isp, connection_type: ipData.type
          };
        }
      } catch (e) {
        console.error("Konum bilgileri alınamadı:", e);
      }

      // Save Data to Supabase Database
      const recordData = {
        user_id: session.user.id,
        audio_url: publicUrl,
        bpm: calculatedBpm,
        recording_duration: recordingTime,
        waveform_data: waveformData.length > 0 ? waveformData : null,
        location_data: locationData
      };

      if (hasGlucose) recordData.glucose_level = parseFloat(glucose);
      if (hasBp) {
        recordData.systolic_bp = parseInt(systolicBp, 10);
        recordData.diastolic_bp = parseInt(diastolicBp, 10);
      }

      const { error: dbError } = await supabase
        .from('health_records')
        .insert([recordData]);

      if (dbError) throw dbError;

      setSuccess(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setCalculatedBpm(null);
      setWaveformData([]);
      setGlucose('');
      setSystolicBp('');
      setDiastolicBp('');
      setRecordingTime(0);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting data:", err);
      setError("Veriler kaydedilirken bir hata oluştu.");
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Yeni Ölçüm Kaydı</h2>
          <p className="text-sm text-slate-500">Kalp sesi ve anlık glukoz değeri</p>
        </div>
        <Link to="/history" className="flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-4 py-2 rounded-lg transition-colors">
          <HistoryIcon className="w-4 h-4 mr-2" />
          Geçmiş Veriler
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-medium">Teşekkürler! Verileriniz başarıyla kaydedildi.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
        
        {/* Audio Recording Section */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">1. Kalp Sesi Kaydı</h3>
          <p className="text-sm text-slate-500 mb-4">Lütfen telefonunuzun veya bilgisayarınızın mikrofonunu göğsünüze yaklaştırarak 15 ile 30 saniye arası kalp sesinizi kaydedin. (Minimum 15 saniye zorunludur.)</p>
          
          <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-200">
            <div className={`text-4xl font-mono font-bold mb-6 ${isRecording ? 'text-orange-500' : 'text-slate-700'}`}>
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex space-x-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-full transition-colors shadow-md"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Kaydı Başlat
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  disabled={recordingTime < 15}
                  className={`flex items-center justify-center font-medium py-3 px-6 rounded-full transition-colors shadow-md ${recordingTime < 15 ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse'}`}
                >
                  <Square className="w-5 h-5 mr-2" />
                  Kaydı Bitir {recordingTime < 15 ? `(${15 - recordingTime}s)` : ''}
                </button>
              )}
            </div>

            {analyzing && (
              <div className="mt-4 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-2"></div>
                <span className="text-sm font-medium text-slate-500 animate-pulse">Ses analiz ediliyor, nabız aranıyor...</span>
              </div>
            )}

            {audioUrl && !isRecording && !analyzing && (
              <div className="mt-6 w-full max-w-md space-y-4">
                {waveformData.length > 0 && (
                  <WaveformPlayer 
                    audioUrl={audioUrl} 
                    waveformData={waveformData} 
                    bpm={calculatedBpm} 
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Health Metrics Section */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">2. Ölçüm Değerleri</h3>
          <p className="text-sm text-slate-500 mb-4">Lütfen glukoz ve/veya tansiyon değerlerinizi girin. En az bir veri girmek zorunludur.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Glucose */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Anlık Glukoz Değeri</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-5 w-5 text-cyan-500" />
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Örn: 105"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">mg/dL</span>
                </div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tansiyon (Büyük / Küçük)</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeartPulse className="h-5 w-5 text-rose-500" />
                  </div>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(e.target.value)}
                    className="block w-full pl-10 pr-2 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Büyük (120)"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Küçük (80)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || !audioBlob || (!glucose.trim() && !(systolicBp.trim() && diastolicBp.trim())) || recordingTime < 15 || analyzing || !calculatedBpm}
            className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-colors shadow-sm"
          >
            {loading ? (
              <span className="animate-pulse">Kaydediliyor... Lütfen bekleyin.</span>
            ) : analyzing ? (
              <span className="animate-pulse">Ses Analiz Ediliyor...</span>
            ) : !calculatedBpm ? (
              <span>Önce Geçerli Bir Nabız Kaydedin</span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Verileri Veritabanına Gönder
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Dashboard;
