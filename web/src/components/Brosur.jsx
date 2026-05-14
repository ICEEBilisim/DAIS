import React, { useState } from 'react';
import { Heart, Shield, Activity, Info, Phone, Mail, Globe, CheckCircle, Smartphone, Volume2, Mic, UserCheck } from 'lucide-react';

const Brosur = () => {
  const [view, setView] = useState('front'); // 'front' or 'back'

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white p-8 h-full flex flex-col border-x border-gray-100 ${className}`}>
      {children}
    </div>
  );

  const SectionTitle = ({ children, color = "text-teal-600" }) => (
    <h2 className={`text-2xl font-bold mb-4 ${color} flex items-center gap-2`}>
      {children}
    </h2>
  );

  const QRPlaceholder = () => (
    <div className="bg-white p-4 border-2 border-teal-500 rounded-xl inline-block mx-auto">
      <div className="w-32 h-32 bg-gray-100 flex items-center justify-center relative">
        {/* Simulating a QR code pattern */}
        <div className="grid grid-cols-4 gap-1 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-black"></div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center flex-col p-2 text-center">
          <Globe className="w-8 h-8 text-teal-600 mb-1" />
          <span className="text-[10px] font-bold text-gray-800 break-all leading-tight">dais.iceebilisim.com</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Navigation & Info */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-teal-700">D.A.I.S. Broşür Şablonu</h1>
          <p className="text-gray-600">Akademik Çalışma & Gönüllü Çağrısı</p>
        </div>
        <div className="flex bg-white shadow-sm rounded-lg p-1 border border-teal-100">
          <button 
            onClick={() => setView('front')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${view === 'front' ? 'bg-teal-600 text-white shadow-md' : 'text-teal-600 hover:bg-teal-50'}`}
          >
            Dış Yüz (Kapaklar)
          </button>
          <button 
            onClick={() => setView('back')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${view === 'back' ? 'bg-teal-600 text-white shadow-md' : 'text-teal-600 hover:bg-teal-50'}`}
          >
            İç Yüz (Detaylar)
          </button>
        </div>
      </div>

      {/* Brochure Display Area (A4 Landscape aspect ratio simulation) */}
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
          
          {view === 'front' ? (
            <>
              {/* Left Panel: Inside Flap */}
              <Card className="bg-teal-50/30">
                <SectionTitle><UserCheck className="text-orange-500" /> Neden Buradayız?</SectionTitle>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Özellikle diyabet hastası <b>küçük kahramanlarımızın</b> her gün yaşadığı parmak delme acısını dindirmek istiyoruz.
                </p>
                <div className="bg-white p-4 rounded-xl border-l-4 border-orange-400 shadow-sm mb-4">
                  <p className="text-sm italic text-gray-600">
                    "Geleceğin iğnesiz dünyasını senin kalbinin sesiyle inşa ediyoruz!"
                  </p>
                </div>
                <div className="mt-auto">
                   <div className="flex justify-center opacity-60">
                     <Activity className="w-16 h-16 text-teal-400 animate-pulse" />
                   </div>
                </div>
              </Card>

              {/* Middle Panel: Back Cover */}
              <Card className="text-center bg-gray-50">
                <SectionTitle color="text-gray-800" className="justify-center">İletişim & Destek</SectionTitle>
                <p className="text-sm text-gray-600 mb-6">
                  Desteğin, bilimsel bir devrimin parçası olabilir. Şimdiden teşekkürler!
                </p>
                
                <QRPlaceholder />
                
                <div className="mt-8 space-y-3 text-left inline-block">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Globe className="w-4 h-4 text-teal-600" /> dais.iceebilisim.com
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Info className="w-4 h-4 text-teal-600" /> dais.iceebilisim.com/guide
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">
                      ICEE Bilişim & Akademik Ekip
                    </p>
                  </div>
                </div>
              </Card>

              {/* Right Panel: Front Cover */}
              <Card className="bg-gradient-to-br from-teal-500 to-teal-700 text-white">
                <div className="mb-6 bg-white/20 p-3 rounded-full w-fit">
                   <Heart className="w-10 h-10 text-white fill-current" />
                </div>
                <h1 className="text-4xl font-black mb-4 leading-tight">
                  Kalbinin Sesiyle Geleceği İnşa Et!
                </h1>
                <p className="text-teal-50 text-lg mb-8">
                  Diyabetli çocuklarımız için acısız bir dünya mümkün.
                </p>
                <div className="mt-auto bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-2">D.A.I.S Sağlık Asistanı</p>
                  <p className="text-xs opacity-80 italic">Akademik Gönüllü Çağrısı</p>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Inside Left: How to volunteer */}
              <Card>
                <SectionTitle><Smartphone className="text-orange-500" /> Nasıl Gönüllü Olunur?</SectionTitle>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                    <p className="text-sm">Tansiyon veya şeker değerinizi her zamanki cihazınızla ölçün.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                    <p className="text-sm"><b>dais.iceebilisim.com</b> adresine girin.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                    <p className="text-sm">Telefonu kalbinize yaslayın ve 30 sn boyunca kaydedin!</p>
                  </div>
                </div>
              </Card>

              {/* Inside Middle: Recording Tips */}
              <Card className="bg-orange-50/30">
                <SectionTitle color="text-orange-600"><Mic /> En İyi Kayıt İçin</SectionTitle>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-sm">Sessiz Ortam</p>
                      <p className="text-xs text-gray-600">TV ve diğer gürültüleri kapatın.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-sm">Tam Temas</p>
                      <p className="text-xs text-gray-600">Mikrofonu cildinize tam temas ettirin.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-sm">Sakin Olun</p>
                      <p className="text-xs text-gray-600">Kayıt sırasında konuşmayın ve hareket etmeyin.</p>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Inside Right: Security */}
              <Card>
                <SectionTitle color="text-blue-600"><Shield /> Verileriniz Güvende</SectionTitle>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                    <p><b>Tamamen Anonim:</b> İsim veya kimlik bilgisi istemiyoruz.</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                    <p><b>Akademik Kullanım:</b> Veriler asla 3. taraflarla paylaşılmaz.</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                    <p><b>Şeffaflık:</b> İstediğiniz zaman verilerinizin silinmesini talep edebilirsiniz.</p>
                  </div>
                </div>
                <div className="mt-auto bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-[11px] text-blue-800 leading-tight">
                    Bu çalışma, derin öğrenme modellerinin eğitimi yoluyla sağlık teknolojilerini geliştirmeyi amaçlayan bir tez araştırmasıdır.
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Printing Instructions */}
      <div className="max-w-4xl mx-auto mt-12 bg-teal-50 p-6 rounded-2xl border border-teal-100">
        <h3 className="text-xl font-bold text-teal-800 mb-2 flex items-center gap-2">
          💡 Tasarım Notu & Canva İpucu
        </h3>
        <p className="text-gray-700 text-sm mb-4">
          Bu interaktif önizleme, broşürünüzün katlanmış halindeki panel dağılımını gösterir. Canva'ya aktarırken şu adımları izleyebilirsiniz:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <li className="bg-white p-3 rounded-lg shadow-sm">
            <b>1. Adım:</b> Canva'da <b>"A4 Broşür"</b> (Yatay) şablonu açın.
          </li>
          <li className="bg-white p-3 rounded-lg shadow-sm">
            <b>2. Adım:</b> Sayfayı 3 eşit parçaya bölen kılavuz çizgileri ekleyin.
          </li>
          <li className="bg-white p-3 rounded-lg shadow-sm">
            <b>3. Adım:</b> Görseldeki renkleri (Turkuaz: #0d9488, Turuncu: #f97316) kullanın.
          </li>
          <li className="bg-white p-3 rounded-lg shadow-sm">
            <b>4. Adım:</b> "dais.iceebilisim.com" için bir QR kod oluşturup Arka Kapak'a yerleştirin.
          </li>
        </ul>
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-teal-700 text-white px-8 py-3 rounded-full font-bold hover:bg-teal-800 transition-colors shadow-lg"
          >
            Sayfayı Yazdır (Referans İçin)
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          button, .mb-8 { display: none !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
          .min-h-[600px] { min-height: 100vh !important; }
          body { background: white !important; padding: 0 !important; }
          header { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default Brosur;
