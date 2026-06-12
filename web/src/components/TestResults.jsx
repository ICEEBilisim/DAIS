import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Plus, Trash2, FileText, UploadCloud, AlertCircle, CheckCircle2, History as HistoryIcon, Calendar, X, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const TestResults = ({ session }) => {
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState('Kan Tahlili');
  
  // Pre-fill some common blood test fields, but allow them to be deleted/edited
  const [testValues, setTestValues] = useState([
    { id: 1, name: 'WBC (Beyaz Kan Hücresi)', value: '', unit: '10³/µL' },
    { id: 2, name: 'RBC (Kırmızı Kan Hücresi)', value: '', unit: '10⁶/µL' },
    { id: 3, name: 'HGB (Hemoglobin)', value: '', unit: 'g/dL' },
    { id: 4, name: 'PLT (Trombosit)', value: '', unit: '10³/µL' },
  ]);
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [pastResults, setPastResults] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (session) {
      fetchPastResults();
    }
  }, [session]);

  const fetchPastResults = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setPastResults(data || []);
    } catch (err) {
      console.error("Geçmiş tahliller alınamadı:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const addTestField = () => {
    const newId = testValues.length > 0 ? Math.max(...testValues.map(t => t.id)) + 1 : 1;
    setTestValues([...testValues, { id: newId, name: '', value: '', unit: '' }]);
  };

  const removeTestField = (id) => {
    setTestValues(testValues.filter(t => t.id !== id));
  };

  const updateTestField = (id, field, value) => {
    setTestValues(testValues.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const parseMedicalValues = (text) => {
    const knownTests = [
      { key: 'WBC', name: 'WBC (Beyaz Kan Hücresi)', regex: /WBC|Lökosit/i },
      { key: 'RBC', name: 'RBC (Kırmızı Kan Hücresi)', regex: /RBC|Eritrosit/i },
      { key: 'HGB', name: 'HGB (Hemoglobin)', regex: /HGB|Hemoglobin/i },
      { key: 'PLT', name: 'PLT (Trombosit)', regex: /PLT|Trombosit/i },
      { key: 'ALT', name: 'ALT', regex: /\bALT\b/i },
      { key: 'AST', name: 'AST', regex: /\bAST\b/i },
      { key: 'Glukoz', name: 'Glukoz', regex: /Glukoz/i },
      { key: 'Demir', name: 'Demir', regex: /\bDemir\b(?!.*BK)/i },
      { key: 'Ferritin', name: 'Ferritin', regex: /Ferritin/i },
      { key: 'Kolesterol', name: 'Kolesterol', regex: /Kolesterol/i },
      { key: 'Kalsiyum', name: 'Kalsiyum', regex: /Kalsiyum/i },
      { key: 'Kreatinin', name: 'Kreatinin', regex: /Kreatinin/i },
      { key: 'TSH', name: 'TSH', regex: /\bTSH\b/i },
      { key: 'Ürik Asit', name: 'Ürik Asit', regex: /Ürik Asit/i },
      { key: 'Üre', name: 'Üre Azotu', regex: /Üre/i },
      { key: 'B12', name: 'Vitamin B12', regex: /Vitamin B12/i },
      { key: 'Folat', name: 'Folat', regex: /Folat/i },
      { key: 'CRP', name: 'C-Reaktif Protein (CRP)', regex: /C-Reaktif Protein|CRP/i },
      { key: 'GGT', name: 'GGT', regex: /\bGGT\b/i }
    ];

    const newValues = [];
    let idCounter = 1;
    const foundNames = new Set();
    const tokens = text.replace(/\n/g, ' ').split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      for (const test of knownTests) {
        if (!foundNames.has(test.name) && test.regex.test(token)) {
          let val = null;
          let unit = '';
          
          for (let j = 1; j <= 8 && i + j < tokens.length; j++) {
            const nextToken = tokens[i + j];
            if (/^[\d.,]+$/.test(nextToken) && nextToken !== '.' && nextToken !== ',') {
              val = nextToken;
              
              const possibleUnits = [];
              for(let k = 1; k <= 3 && i + j + k < tokens.length; k++) {
                  possibleUnits.push(tokens[i+j+k]);
              }
              const unitStr = possibleUnits.join('').toUpperCase();
              
              if (unitStr.includes('10³/µL') || unitStr.includes('10^3') || unitStr.includes('103/')) {
                  unit = '10³/µL';
              } else if (unitStr.includes('10⁶/µL') || unitStr.includes('10^6') || unitStr.includes('106/')) {
                  unit = '10⁶/µL';
              } else if (unitStr.includes('MG/DL')) {
                  unit = 'mg/dL';
              } else if (unitStr.includes('UG/DL')) {
                  unit = 'µg/dL';
              } else if (unitStr.includes('UG/L')) {
                  unit = 'µg/L';
              } else if (unitStr.includes('U/L')) {
                  unit = 'U/L';
              } else if (unitStr.includes('G/DL')) {
                  unit = 'g/dL';
              } else if (unitStr.includes('%')) {
                  unit = '%';
              } else if (unitStr.includes('MIU/L')) {
                  unit = 'mIU/L';
              } else {
                  unit = possibleUnits[0] || '';
              }
              break;
            }
          }

          if (val !== null) {
            newValues.push({ id: idCounter++, name: test.name, value: val, unit: unit });
            foundNames.add(test.name);
          }
        }
      }
    }
    return newValues;
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Max 5MB check
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setError('');
      setParseSuccess(false);

      if (selectedFile.type === 'application/pdf') {
        setLoading(true);
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            let lastY = -1;
            let textWithNewlines = '';
            for (const item of textContent.items) {
               if (lastY !== item.transform[5] && lastY !== -1) {
                  textWithNewlines += '\n';
               }
               textWithNewlines += item.str + ' ';
               lastY = item.transform[5];
            }
            fullText += textWithNewlines + '\n';
          }
          
          const extractedValues = parseMedicalValues(fullText);
          if (extractedValues.length > 0) {
            setTestValues(extractedValues);
            setParseSuccess(true);
            setTimeout(() => setParseSuccess(false), 5000);
          } else {
            setError('PDF tarandı ancak bilinen bir tahlil değeri bulunamadı. Lütfen sonuçları manuel girin.');
          }
        } catch (err) {
          console.error("PDF okuma hatası:", err);
          setError('PDF okunurken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;

    // Filter out empty rows
    const validTestValues = testValues.filter(t => t.name.trim() !== '' && t.value.trim() !== '');

    if (validTestValues.length === 0 && !file) {
      setError("Lütfen en az bir tahlil değeri girin veya bir sonuç belgesi yükleyin.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let documentUrl = null;

      if (file) {
        // Upload to a generic 'documents' bucket or similar.
        // Assuming user created a 'documents' bucket. If not, it will fail and we'll see the error.
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        // Ensure you have a 'documents' storage bucket in Supabase!
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
             throw new Error("Storage bucket 'documents' bulunamadı. Lütfen Supabase Storage'da 'documents' adında public bir bucket oluşturun.");
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
          
        documentUrl = publicUrl;
      }

      // Prepare results JSON string
      const resultsJson = JSON.stringify(validTestValues);

      const { error: dbError } = await supabase
        .from('test_results')
        .insert([{
          user_id: session.user.id,
          test_date: testDate,
          test_type: testType,
          results: resultsJson,
          document_url: documentUrl
        }]);

      if (dbError) throw dbError;

      setSuccess(true);
      setFile(null);
      // Reset input file visually
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
      // Refresh history
      fetchPastResults();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      setError(err.message || "Tahlil sonuçları kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const parseResults = (jsonStr) => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tahlil Sonuçlarım</h2>
          <p className="text-slate-500 mt-1">Kan ve diğer tahlil sonuçlarınızı girin ve takip edin</p>
        </div>
        <FileText className="w-10 h-10 text-cyan-500 opacity-20" />
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-medium">Tahlil sonuçlarınız başarıyla kaydedildi.</p>
        </div>
      )}

      {parseSuccess && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-xl flex items-center shadow-sm">
          <Sparkles className="w-5 h-5 mr-3 flex-shrink-0 text-indigo-500" />
          <p className="font-medium">PDF analiz edildi ve bulunan değerler otomatik olarak dolduruldu! Lütfen kaydetmeden önce kontrol edin.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Alanı */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahlil Tarihi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahlil Türü</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all bg-white"
                >
                  <option value="Kan Tahlili">Kan Tahlili</option>
                  <option value="İdrar Tahlili">İdrar Tahlili</option>
                  <option value="Hormon">Hormon</option>
                  <option value="Görüntüleme">Görüntüleme (Röntgen, MR vb.)</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-800">Tahlil Değerleri</h3>
                <button
                  type="button"
                  onClick={addTestField}
                  className="text-sm flex items-center text-cyan-600 hover:text-cyan-700 font-medium px-3 py-1.5 bg-cyan-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" /> Yeni Değer Ekle
                </button>
              </div>
              
              <div className="space-y-3">
                {testValues.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Test Adı (Örn: Kolesterol)"
                        value={field.name}
                        onChange={(e) => updateTestField(field.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                    <div className="w-full sm:w-24">
                      <input
                        type="text"
                        placeholder="Sonuç"
                        value={field.value}
                        onChange={(e) => updateTestField(field.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                    <div className="w-full sm:w-24 flex gap-2">
                      <input
                        type="text"
                        placeholder="Birim"
                        value={field.unit}
                        onChange={(e) => updateTestField(field.id, 'unit', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeTestField(field.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {testValues.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    Hiç değer eklenmedi. Kutucuksuz sadece belge de yükleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-2">PDF'ten Otomatik Oku & Yükle</h3>
              <p className="text-xs text-slate-500 mb-3">E-Nabız veya hastane tahlil PDF'ini seçtiğinizde sistem otomatik olarak okuyup yukarıdaki kutucuklara doldurmaya çalışır. (Maks: 5MB)</p>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Yüklemek için tıklayın</span> veya sürükleyip bırakın</p>
                    <p className="text-xs text-slate-400">PDF, PNG, JPG veya JPEG</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
                </label>
              </div>
              {file && (
                <div className="mt-3 text-sm text-cyan-600 bg-cyan-50 p-3 rounded-lg flex items-center justify-between border border-cyan-100">
                  <span className="truncate pr-4">{file.name}</span>
                  <button type="button" onClick={() => {setFile(null); document.getElementById('file-upload').value = '';}} className="text-cyan-800 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
              >
                {loading ? (
                  <span className="animate-pulse">İşleniyor...</span>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Tahlili Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Geçmiş Tahliller */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <HistoryIcon className="w-5 h-5 mr-2 text-cyan-600" />
              Geçmiş Tahliller
            </h3>
            
            {loadingHistory ? (
              <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
            ) : pastResults.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm">Henüz tahlil sonucu girmediniz.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastResults.map((record) => {
                  const dataArr = parseResults(record.results);
                  const dateObj = new Date(record.test_date);
                  const formattedDate = dateObj.toLocaleDateString('tr-TR');
                  
                  return (
                    <div key={record.id} className="border border-slate-100 rounded-xl p-4 hover:border-cyan-200 transition-colors bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 bg-white border border-slate-200 text-xs font-semibold rounded-md text-slate-600 mb-1">
                            {record.test_type}
                          </span>
                          <div className="text-sm font-medium text-slate-800">{formattedDate}</div>
                        </div>
                        {record.document_url && (
                          <a href={record.document_url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors" title="Belgeyi Görüntüle">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      {dataArr.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {dataArr.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs items-center">
                              <span className="text-slate-500 truncate mr-2" title={item.name}>{item.name}</span>
                              <span className="font-semibold text-slate-700 whitespace-nowrap">{item.value} <span className="text-slate-400 font-normal">{item.unit}</span></span>
                            </div>
                          ))}
                          {dataArr.length > 3 && (
                            <div className="text-xs text-cyan-600 font-medium pt-1">+{dataArr.length - 3} değer daha...</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TestResults;
