import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Activity, Clock, PlayCircle, HeartPulse } from 'lucide-react';

const History = ({ session }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!session) return;
      try {
        const { data, error } = await supabase
          .from('health_records')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
      setLoading(false);
    };

    fetchRecords();
  }, [session]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-cyan-600 hover:text-cyan-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Ekrana Dön
        </Link>
        <h2 className="text-xl font-bold text-slate-800 ml-6">Ölçüm Geçmişiniz</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Geçmiş verileriniz yükleniyor...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800">Henüz Kayıt Yok</h3>
          <p className="text-slate-500 mt-2">Daha önce kaydedilmiş bir ölçüm bulunamadı. Yeni bir ölçüm yapmak için ana ekrana dönün.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tarih</span>
                  <div className="flex items-center text-slate-800 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-cyan-500" />
                    {formatDate(record.created_at)}
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Glukoz</span>
                  <div className="flex items-baseline">
                    <span className="text-xl font-bold text-orange-500">{record.glucose_level ? record.glucose_level : '-'}</span>
                    <span className="text-sm text-slate-500 ml-1">mg/dL</span>
                  </div>
                </div>

                {record.systolic_bp && record.diastolic_bp && (
                  <>
                    <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tansiyon</span>
                      <div className="flex items-baseline">
                        <HeartPulse className="w-4 h-4 mr-1 text-rose-500 self-center" />
                        <span className="text-xl font-bold text-rose-500">{record.systolic_bp}/{record.diastolic_bp}</span>
                        <span className="text-sm text-slate-500 ml-1">mmHg</span>
                      </div>
                    </div>
                  </>
                )}

                {record.bpm && (
                  <>
                    <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nabız (BPM)</span>
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-cyan-600">{record.bpm}</span>
                        <span className="text-sm text-slate-500 ml-1">atım/dk</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-full md:w-auto flex-shrink-0 flex flex-col space-y-2 mt-4 md:mt-0">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 w-full">
                  <span className="text-xs font-medium text-slate-500 block text-center mb-1">
                    Ham Kayıt ({record.recording_duration} sn)
                  </span>
                  <audio controls src={record.audio_url} className="h-8 w-full md:w-64" />
                </div>
                {record.clean_audio_url && (
                  <div className="bg-cyan-50 p-2 rounded-xl border border-cyan-100 w-full">
                    <span className="text-xs font-medium text-cyan-700 block text-center mb-1">
                      İşlenmiş Net Ses
                    </span>
                    <audio controls src={record.clean_audio_url} className="h-8 w-full md:w-64" />
                  </div>
                )}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
