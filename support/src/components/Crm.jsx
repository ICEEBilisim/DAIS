import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Mail, Phone, Briefcase, FileText, Plus, X, ArrowLeft } from 'lucide-react';

export default function Crm({ setViewMode }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', summary: '', budget_estimate: '' });

  useEffect(() => {
    fetchLeads();
    
    const channel = supabase
      .channel('crm_leads_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'icee_leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase.from('icee_leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
      
      // Update selected lead if it's currently open
      if (selectedLead) {
        const updatedSelected = data?.find(l => l.id === selectedLead.id);
        if (updatedSelected) setSelectedLead(updatedSelected);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async () => {
    if (!newReport.title || !selectedLead) return;
    
    const currentReports = selectedLead.reports_and_offers || [];
    const updatedReports = [...currentReports, { ...newReport, date: new Date().toISOString() }];

    try {
      const { error } = await supabase
        .from('icee_leads')
        .update({ reports_and_offers: updatedReports })
        .eq('id', selectedLead.id);
        
      if (error) throw error;
      
      setShowAddReport(false);
      setNewReport({ title: '', summary: '', budget_estimate: '' });
      fetchLeads(); // Refresh list
    } catch (err) {
      console.error("Rapor eklenemedi:", err);
      alert("Rapor eklenemedi.");
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Müşteriler Yükleniyor...</div>;

  return (
    <div className="flex h-full w-full bg-white">
      {/* Left List */}
      <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 flex flex-col gap-3">
          <button 
            onClick={() => setViewMode('chat')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Sohbetlere Dön
          </button>
          <div>
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Müşteri Havuzu
            </h2>
            <p className="text-xs text-slate-500 mt-1">{leads.length} kayıtlı potansiyel müşteri</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {leads.map(lead => (
            <button 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedLead?.id === lead.id ? 'bg-emerald-50/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-slate-900">{lead.name || 'İsimsiz Müşteri'}</span>
                <span className="text-xs text-slate-400">{formatDate(lead.created_at).split(' ')[0]}</span>
              </div>
              <div className="text-sm text-slate-500 truncate">{lead.company_project || lead.email || lead.phone || 'Detay girilmemiş'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {selectedLead ? (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">{selectedLead.name || 'İsimsiz Müşteri'}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>{selectedLead.email || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span>{selectedLead.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 md:col-span-2">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <span>{selectedLead.company_project || 'Proje / Firma belirtilmemiş'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-mono">
                Session ID: {selectedLead.session_id} <br/>
                Kayıt: {formatDate(selectedLead.created_at)}
              </div>
            </div>

            {/* Reports Section */}
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#06b6d4]" />
                Raporlar ve Teklifler
              </h3>
              <button 
                onClick={() => setShowAddReport(true)}
                className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Manuel Ekle
              </button>
            </div>

            {showAddReport && (
              <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-emerald-800">Yeni Teklif / Rapor Ekle</h4>
                  <button onClick={() => setShowAddReport(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <input 
                  type="text" placeholder="Rapor Başlığı (Örn: Web Tasarım Teklifi)" 
                  value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})}
                  className="w-full border border-slate-200 rounded p-2 text-sm outline-none focus:border-emerald-500"
                />
                <textarea 
                  placeholder="Detaylar / Özet" rows="3"
                  value={newReport.summary} onChange={e => setNewReport({...newReport, summary: e.target.value})}
                  className="w-full border border-slate-200 rounded p-2 text-sm outline-none focus:border-emerald-500"
                />
                <input 
                  type="text" placeholder="Bütçe Tahmini (Opsiyonel)" 
                  value={newReport.budget_estimate} onChange={e => setNewReport({...newReport, budget_estimate: e.target.value})}
                  className="w-full border border-slate-200 rounded p-2 text-sm outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={handleAddReport}
                  className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-600 w-full"
                >
                  Kaydet
                </button>
              </div>
            )}

            <div className="space-y-4">
              {(!selectedLead.reports_and_offers || selectedLead.reports_and_offers.length === 0) ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 border-dashed text-center text-slate-400">
                  Henüz bir ön analiz veya teklif oluşturulmamış.
                </div>
              ) : (
                selectedLead.reports_and_offers.map((report, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{report.title}</h4>
                      <span className="text-xs text-slate-400">{formatDate(report.date)}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{report.summary}</p>
                    {report.budget_estimate && (
                      <div className="mt-3 inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-medium border border-emerald-100">
                        Bütçe: {report.budget_estimate}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 p-8 text-center">
            Müşteri detaylarını, oluşturulan analizleri ve iletişim bilgilerini görmek için soldan bir müşteri seçin.
          </div>
        )}
      </div>
    </div>
  );
}
