import React, { useState } from 'react';
import { ArrowLeft, Mic, Smartphone, Info, AlertTriangle, CheckCircle2, ShieldAlert, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import uygulamaImg from '../assets/uygulama.png';

const Guide = () => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4 mb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Uygulama Rehberi</h2>
            <p className="text-sm text-slate-500">D.A.I.S. Kalp Sesi Kayıt Kılavuzu</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-cyan-600 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="relative z-10">
            <HeartPulse className="w-16 h-16 mx-auto mb-4 text-cyan-100" />
            <h1 className="text-3xl font-bold mb-2 tracking-tight">D.A.I.S. Kalp Sesi Kayıt Rehberi</h1>
            <p className="text-cyan-100 max-w-2xl mx-auto text-lg">
              Kalbinizin Sesi, Sizin Sağlık Kimliğiniz.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-12 text-slate-700">
          
          {/* Section 1: Giriş */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">1</div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Giriş: Kayıt Öncesi Hazırlık</h2>
            </div>
            <p className="mb-6 text-slate-600 leading-relaxed text-lg">
              D.A.I.S. ile en iyi deneyimi yaşamanız için kalp seslerinizin net bir şekilde kaydedilmesi kritik önem taşır. Kayıt işlemini başlatmadan önce aşağıdaki adımları dikkatlice okuyun.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                <div className="flex items-center space-x-2 text-orange-600 font-bold mb-4">
                  <ShieldAlert className="w-5 h-5" />
                  <h3>En Önemli Adım: Sessiz Bir Ortam!</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Kalp sesleri son derece kısık seslidir. Herhangi bir arka plan gürültüsü, kaydınızın doğruluğunu bozabilir.
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="mr-2">📺</span>
                    <span><strong>Elektronik Cihazları Kapatın:</strong> TV, radyo, bilgisayar fanı gibi ses kaynaklarını uzaklaştırın.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🔇</span>
                    <span><strong>Sessiz Saatler:</strong> Ortamın en sessiz olduğu anları seçin.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🚪</span>
                    <span><strong>Kapıları Kapatın:</strong> Dışarıdan gelecek sesleri minimize edin.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                <div className="flex items-center space-x-2 text-slate-800 font-bold mb-4">
                  <Info className="w-5 h-5 text-cyan-500" />
                  <h3>Kullanım İpuçları</h3>
                </div>
                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="mr-2">🩺</span>
                    <span><strong>Rahat Bir Pozisyon:</strong> Oturarak veya yatarak en rahat pozisyonu bulun. Kayıt süresince hareket etmemeniz gerekmektedir.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">⏱️</span>
                    <span><strong>Kayıt Süresi:</strong> En az <strong>15 saniye</strong>, en fazla <strong>30 saniye</strong> sürmesi gerekmektedir.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">👂</span>
                    <span><strong>Nefesinizi Tutun (Opsiyonel):</strong> Kaydın başında nefesinizi birkaç saniye tutmak sesi netleştirir ancak zorlayıcı olmamalıdır.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-3 font-semibold text-slate-800 border-b border-slate-200 flex items-center">
                <span className="mr-2">📸</span> Doğru Konumlandırma
              </div>
              <div className="p-4 bg-white flex justify-center overflow-hidden">
                <img 
                  src={uygulamaImg} 
                  alt="Uygulama Rehberi Görseli" 
                  className="rounded-lg max-w-full h-auto object-contain max-h-96 cursor-zoom-in transition-transform duration-300 hover:scale-105" 
                  onClick={() => setIsZoomed(true)}
                />
              </div>
            </div>

            {/* Image Zoom Modal */}
            {isZoomed && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-12 cursor-zoom-out"
                onClick={() => setIsZoomed(false)}
              >
                <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
                  <button 
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                    onClick={() => setIsZoomed(false)}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img 
                    src={uygulamaImg} 
                    alt="Uygulama Rehberi Görseli (Büyütülmüş)" 
                    className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* Section 2: Harici Mikrofon */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">2</div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Senaryo 1: Harici Mikrofon ile Kayıt</h2>
            </div>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Bu yöntem, harici bir stetoskop mikrofonu veya hassas bir kayıt mikrofonu kullanarak en yüksek ses kalitesini elde etmenizi sağlar.
            </p>
            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm mb-6 font-medium">
              <Mic className="w-4 h-4 text-slate-500" />
              <span>Uyumlu Cihazlar: Masaüstü, Dizüstü, Akıllı Telefon/Tablet (adaptörlü)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-semibold text-slate-800 flex items-center">
                <span className="mr-2">🛠️</span> Adım Adım Kayıt İşlemi
              </div>
              <div className="p-6">
                <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">1</span>
                    <h4 className="font-bold text-slate-800">Mikrofonu Bağlayın</h4>
                    <p className="text-sm text-slate-600 mt-1">Harici mikrofonunuzu cihaza bağlayın.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">2</span>
                    <h4 className="font-bold text-slate-800">Uygulamayı Açın</h4>
                    <p className="text-sm text-slate-600 mt-1">D.A.I.S. "Yeni Kayıt" bölümüne gidin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-cyan-100 rounded-full -left-3 ring-4 ring-white border border-cyan-200 text-xs font-bold text-cyan-600">3</span>
                    <h4 className="font-bold text-cyan-700">Mikrofonu Yerleştirin</h4>
                    <p className="text-sm text-slate-600 mt-1">Hassas ucu, göğüs kafesinizin sol alt kısmına, kaburgaların arasına, tam kalbinizin üzerine yerleştirin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">4</span>
                    <h4 className="font-bold text-slate-800">Teması Sağlayın</h4>
                    <p className="text-sm text-slate-600 mt-1">Cildinize tam temas ettiğinden ve kayıt süresince hareket etmediğinden emin olun. Aşırı baskı yapmayın.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">5</span>
                    <h4 className="font-bold text-slate-800">Kaydı Başlatın & Bekleyin</h4>
                    <p className="text-sm text-slate-600 mt-1">"Kaydı Başlat" butonuna tıklayın (gerekirse mikrofon izni verin). 15-30 saniye kıpırdamadan bekleyin.</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3: Mobil Cihaz */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">3</div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Senaryo 2: Mobil Cihaz Mikrofonu ile Kayıt</h2>
            </div>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Bu yöntem, ek bir donanıma ihtiyaç duymadan kalp sesinizi kaydetmenizi sağlar. Telefonunuzun mikrofon hassasiyetine bağlı olarak sessiz ortam daha da kritik hale gelir.
            </p>
            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm mb-6 font-medium">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Uyumlu Cihazlar: Akıllı Telefon / Tablet</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-semibold text-slate-800 flex items-center">
                <span className="mr-2">🛠️</span> Adım Adım Kayıt İşlemi
              </div>
              <div className="p-6">
                <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">1</span>
                    <h4 className="font-bold text-slate-800">Uygulamayı Açın</h4>
                    <p className="text-sm text-slate-600 mt-1">D.A.I.S. "Yeni Kayıt" bölümüne gidin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">2</span>
                    <h4 className="font-bold text-slate-800">Mikrofonu Bulun</h4>
                    <p className="text-sm text-slate-600 mt-1">Telefonunuzun birincil mikrofonunun nerede olduğunu (genellikle alt kısımda, şarj girişinin yanında) kontrol edin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-cyan-100 rounded-full -left-3 ring-4 ring-white border border-cyan-200 text-xs font-bold text-cyan-600">3</span>
                    <h4 className="font-bold text-cyan-700">Telefonu Yerleştirin</h4>
                    <p className="text-sm text-slate-600 mt-1">Telefonunuzun mikrofon kısmını tam kalbinizin üzerine, göğüs kafesinizin sol alt kısmına, kaburgaların arasına yerleştirin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">4</span>
                    <h4 className="font-bold text-slate-800">Teması Sağlayın</h4>
                    <p className="text-sm text-slate-600 mt-1">Hafifçe bastırmak daha net bir kayıt almanıza yardımcı olabilir, ancak zorlayıcı olmamalıdır. Telefonu hareket ettirmemeye özen gösterin.</p>
                  </li>
                  <li className="pl-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-500">5</span>
                    <h4 className="font-bold text-slate-800">Kaydı Başlatın & Bekleyin</h4>
                    <p className="text-sm text-slate-600 mt-1">"Kaydı Başlat" butonuna tıklayın (gerekirse mikrofon izni verin). 15-30 saniye kıpırdamadan bekleyin.</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4: Sonuçlar */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">4</div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kayıt Sonrası ve Sonuçlar</h2>
            </div>
            <p className="mb-6 text-slate-600 leading-relaxed">
              D.A.I.S., aldığınız kalp sesi kaydını analiz edecek ve kalp ritmini bulduğunda Ham Ses ve Temiz Ses olarak size sunacaktır. Kalp ritmini bulamazsa yeni kayıt için sizi uyaracaktır. Sonuçlar sizin için görselleştirilmiş bir rapor halinde sunulur.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-start space-x-4">
                <div className="bg-rose-50 p-2 rounded-lg text-rose-500 mt-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Kalp Ritim Grafiği</h4>
                  <p className="text-sm text-slate-500">Kayıt süresindeki kalp ritminizin grafiksel gösterimi.</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-start space-x-4">
                <div className="bg-cyan-50 p-2 rounded-lg text-cyan-500 mt-1">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Nabız Sayısı</h4>
                  <p className="text-sm text-slate-500">Analiz edilen sesten elde edilen ortalama nabız (BPM) değeri.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
              <div className="flex items-center space-x-2 text-amber-800 font-bold mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3>Önemli Not: Kayıt Kalitesi</h3>
              </div>
              <p className="text-sm text-amber-700">
                Aldığınız kaydın kalitesi, analiz sonuçlarını doğrudan etkiler. Arka plan gürültüsü veya kalbe yetersiz temas gibi faktörler, kaydın kalitesini düşürebilir ve analiz sonuçlarının güvenilirliğini bozabilir. Kayıt kalitesi düşükse, sessiz bir ortamda tekrar deneyin.
              </p>
            </div>
            
            <p className="mt-8 text-center text-sm text-slate-400 italic">
              Bu kılavuz, D.A.I.S. kullanıcıları için bir referans niteliğindedir.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Guide;
