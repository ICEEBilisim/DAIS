import React, { useState } from 'react';
import { Heart, Shield, Volume2 } from 'lucide-react';

const Brosur = () => {
  const [view, setView] = useState('inside'); // 'front' or 'inside'

  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://dais.iceebilisim.com";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Navigation & Info */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-[#439e9e]">D.A.I.S. Broşür</h1>
          <p className="text-gray-600">Broşür Tasarımı</p>
        </div>
        <div className="flex bg-white shadow-sm rounded-lg p-1 border border-[#439e9e]/30">
          <button 
            onClick={() => setView('front')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${view === 'front' ? 'bg-[#439e9e] text-white shadow-md' : 'text-[#439e9e] hover:bg-[#439e9e]/10'}`}
          >
            Dış Yüz (Kapaklar)
          </button>
          <button 
            onClick={() => setView('inside')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${view === 'inside' ? 'bg-[#439e9e] text-white shadow-md' : 'text-[#439e9e] hover:bg-[#439e9e]/10'}`}
          >
            İç Yüz (Detaylar)
          </button>
        </div>
      </div>

      {/* Brochure Display Area */}
      <div className="max-w-[1200px] mx-auto bg-[#52b1b3] shadow-2xl p-4 md:p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-[700px]">
          
          {view === 'inside' ? (
            <>
              {/* Inside Left Panel */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center border border-gray-100 h-1/2">
                  <div className="flex justify-between w-full mb-2 px-4">
                    <span className="text-5xl">🦸‍♂️</span>
                    <span className="text-5xl">🦸🏽‍♀️</span>
                  </div>
                  <h2 className="text-xl font-black text-center text-slate-800 leading-tight mb-3">
                    KÜÇÜK KAHRAMANLAR ARTIK ACI ÇEKMESİN!
                  </h2>
                  <p className="text-[13px] text-slate-700 font-medium mb-3 text-justify leading-snug">
                    Özellikle diyabet hastası minik dostlarımızın ve tansiyon takibi yapan büyüklerimizin her gün yaşadığı parmak delme/iğne acısını tamamen ortadan kaldırmak istiyoruz.
                  </p>
                  <p className="text-[13px] text-slate-800 font-bold mb-1 w-full text-left">
                    Hedefimiz Çok Büyük:
                  </p>
                  <p className="text-[13px] text-slate-700 text-justify leading-snug">
                    Geliştirdiğimiz Yapay Zeka ve Derin Öğrenme modelleri sayesinde, sadece 15-30 saniyelik bir kalp sesinden tansiyon ve şeker (glukoz) seviyelerini tahmin edebilen bir teknoloji üzerinde çalışıyoruz.
                  </p>
                  <div className="mt-auto flex justify-center pt-2">
                    <span className="text-6xl">🤖</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col h-1/2">
                  <div className="flex items-center gap-2 justify-center mb-3">
                    <Shield className="text-[#52b1b3] w-8 h-8" />
                    <h2 className="text-lg font-black text-center text-slate-800 leading-tight">
                      VERİLERİN BİZİMLE TAMAMEN GÜVENDE!
                    </h2>
                  </div>
                  <p className="text-[12px] text-slate-700 font-bold mb-3 text-center leading-snug">
                    Çocuklarımızın ve yetişkinlerimizin güvenliği bizim için her şeyden önemli.
                  </p>
                  <div className="space-y-3 flex-grow">
                    <p className="text-[12px] text-slate-700 text-justify leading-snug">
                      <strong className="text-slate-800">Tamamen Anonim:</strong> Sizden isim, soyisim veya kimlik bilgisi kesinlikle istemiyoruz. Sadece doğum tarihi ve cinsiyet bilgisi yeterli!
                    </p>
                    <p className="text-[12px] text-slate-700 text-justify leading-snug">
                      <strong className="text-slate-800">Sadece Akademi İçin:</strong> Toplanan kalp sesleri ve veriler asla reklamcılarla veya üçüncü taraflarla paylaşılmaz. Yalnızca bu akademik araştırmanın yapay zeka modellerini eğitmek için kullanılır.
                    </p>
                    <p className="text-[12px] text-slate-700 text-justify leading-snug">
                      <strong className="text-slate-800">Söz Hakkı Sende:</strong> İstediğin an sistemdeki verilerinin kalıcı olarak silinmesini talep edebilirsin.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inside Center Panel */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-[55%] flex flex-col">
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="bg-[#52b1b3] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">1</div>
                    <div className="bg-[#52b1b3] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">2</div>
                    <div className="bg-[#52b1b3] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">3</div>
                  </div>
                  <h2 className="text-xl font-black text-center text-slate-800 leading-tight mb-2">
                    SADECE İKİ ADIMDA BİLİME DESTEK OL!
                  </h2>
                  <p className="text-[13px] text-center font-bold text-slate-700 mb-4 leading-snug">
                    Süreç çok ama çok basit!<br/>İşte yapman gerekenler:
                  </p>
                  
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="text-3xl shrink-0 mt-1">🩺</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">ADIM 1: Ölçüm Yapın</p>
                        <p className="text-[13px] text-slate-700 leading-snug text-justify">Evdeki tansiyon aletinizle tansiyonunuzu veya şeker ölçüm cihazınızla şeker değerinizi her zamanki gibi normal şekilde ölçün.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-3xl shrink-0 mt-1">📱</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">ADIM 2: Kaydedin ve Paylaşın</p>
                        <p className="text-[13px] text-slate-700 leading-snug text-justify">Cep telefonunuzdan hemen <b>dais.iceebilisim.com</b> adresine girin. Telefonun mikrofon kısmını kalbinizin üzerine koyarak 15-30 saniye boyunca kalp sesinizi kaydedin ve ölçtüğünüz değerle birlikte sisteme gönderin.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col h-[45%]">
                  <h2 className="text-lg font-black text-center text-slate-800 leading-tight mb-3">
                    GELECEĞİ DEĞİŞTİRMEYE HAZIR MISIN?
                  </h2>
                  <p className="text-[13px] text-slate-700 text-justify mb-4 leading-snug">
                    Verdiğin her bir kayıt, iğnesiz ve acısız bir geleceğe giden yolda çok büyük bir adım. Katkıların için şimdiden çok teşekkür ederiz!
                  </p>
                  <p className="text-[13px] text-slate-700 text-justify mb-4 leading-snug">
                    <strong className="text-slate-800">Detaylı Bilgi İçin:</strong> Aklına takılan tüm sorular ve detaylı kullanım kılavuzu için web sitemizi ziyaret edebilirsin.
                  </p>
                  <div className="mt-auto space-y-1 text-[12px] font-semibold text-slate-800">
                    <p>Web Sitesi: <span className="font-normal text-slate-600">dais.iceebilisim.com</span></p>
                    <p>Kılavuz: <span className="font-normal text-slate-600">dais.iceebilisim.com/guide</span></p>
                    <p className="leading-tight mt-1">Çalışma Grubu: <span className="font-normal text-slate-600">ICEE Bilişim & Akademik Çalışma Ekibi.</span></p>
                  </div>
                </div>
              </div>

              {/* Inside Right Panel */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-grow flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3 mb-2 w-full">
                    <span className="text-4xl">🤫</span>
                    <h2 className="text-xl font-black text-center text-slate-800 leading-tight">
                      ŞŞŞT!<br/>EN İYİ KAYIT İÇİN<br/>GİZLİ İPUÇLARI
                    </h2>
                    <span className="text-4xl">🕵️‍♂️</span>
                  </div>
                  <p className="text-[13px] text-center text-slate-700 mb-6 font-medium px-2 leading-snug">
                    Yapay zekanın kalbinin sesini net duyabilmesi için bu kurallara dikkat etmelisin:
                  </p>
                  
                  <div className="space-y-6 w-full">
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 bg-[#e2f1f1] rounded-full flex items-center justify-center shrink-0">
                        <Volume2 className="text-[#52b1b3] w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">Sessiz Bir Oda Seç:</p>
                        <p className="text-[13px] text-slate-700 leading-snug text-justify">Televizyon, radyo veya çalışan fan gibi ses çıkaran her şeyi kapat. Tam bir sessizlik sağlayalım!</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 bg-[#e2f1f1] rounded-full flex items-center justify-center shrink-0 text-2xl">
                        🤫
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">Tam Temas Sağla:</p>
                        <p className="text-[13px] text-slate-700 leading-snug text-justify">Telefonunun alt kısmındaki mikrofonu doğrudan cildine (sol göğüs, kaburgaların arası, kalbinin tam üzerine) temas ettir. Kıyafet üzerinden kayıt yapmamaya özen göster.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 bg-[#e2f1f1] rounded-full flex items-center justify-center shrink-0 text-2xl">
                        🧘‍♂️
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">Kıpırdama:</p>
                        <p className="text-[13px] text-slate-700 leading-snug text-justify">Kayıt bitene kadar derin ve sakin nefes al, hiç konuşma ve kıpırdama.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-800 mt-6 mb-6 text-center w-full">
                    Sen bir bilim ajanısın!
                  </p>

                  <div className="mt-auto relative w-full flex justify-center items-center py-4">
                     <span className="absolute left-6 top-0 text-3xl animate-bounce">💖</span>
                     <span className="absolute right-6 bottom-0 text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>💖</span>
                     <div className="p-3 bg-white border-4 border-slate-200 rounded-xl shadow-md z-10">
                       <img src={qrUrl} alt="DAIS QR Code" className="w-32 h-32" />
                     </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Outside Left: Inside Flap */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col justify-center items-center">
                <div className="text-center">
                   <Heart className="w-16 h-16 text-[#52b1b3] mx-auto mb-4 opacity-50" />
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Teşekkürler!</h2>
                   <p className="text-sm text-slate-600 font-medium">Bu broşür çocukların yüzündeki gülümseme için tasarlandı.</p>
                </div>
              </div>

              {/* Outside Middle: Back Cover */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col items-center text-center justify-center bg-gradient-to-b from-white to-slate-50">
                 <h2 className="text-2xl font-black text-slate-800 mb-2">Hemen Başla</h2>
                 <p className="text-sm font-bold text-slate-500 mb-6">Kayıt Olmak İçin Okutun</p>
                 <div className="p-4 bg-white border-4 border-[#52b1b3] rounded-2xl shadow-lg mb-8">
                   <img src={qrUrl} alt="DAIS QR Code" className="w-40 h-40" />
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#52b1b3] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">
                      D
                    </div>
                    <span className="font-black text-2xl text-slate-800 tracking-wide">D.A.I.S.</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-2 font-medium">dais.iceebilisim.com</p>
              </div>

              {/* Outside Right: Front Cover */}
              <div className="bg-white rounded-3xl p-5 shadow-inner border-4 border-white flex flex-col items-center pt-8">
                <div className="text-center mb-6">
                  <p className="text-[12px] font-bold text-slate-700 leading-snug px-2">
                    Küçük parmaklar acımasız iğnelerden kurtuluyor, geleceğin akıllı sağlığı kalbinin sesinde saklanıyor!
                  </p>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-[#1e6061] text-center leading-[1.1] mb-8 tracking-tight">
                  KALP SESİYLE<br/>GELECEĞİN<br/>TEKNOLOJİSİNİ<br/>BİRLİKTE<br/>İNŞA EDELİM!
                </h1>

                <div className="relative mb-8 w-full flex justify-center mt-4">
                  {/* Hero Illustration Simulation */}
                  <div className="w-56 h-64 bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-end pb-6 border-4 border-slate-100 relative overflow-hidden shadow-inner">
                    <span className="text-[7rem] relative z-10 -mb-2">🦸‍♀️</span>
                    <div className="absolute bottom-12 right-2 bg-white px-3 py-4 rounded-2xl border-2 border-[#52b1b3] shadow-lg transform rotate-6 z-20 flex flex-col items-center">
                      <Heart className="w-6 h-6 text-[#52b1b3] fill-current mb-2" />
                      <span className="text-[10px] font-black text-slate-800">D.A.I.S.</span>
                      <span className="text-[7px] text-slate-500 font-bold">(Sağlık Asistanı)</span>
                      <div className="w-8 h-1 bg-slate-200 rounded-full mt-2"></div>
                    </div>
                  </div>
                  <span className="absolute top-0 right-8 text-3xl animate-pulse">💖</span>
                  <span className="absolute bottom-16 left-6 text-2xl animate-pulse" style={{animationDelay: '1s'}}>💖</span>
                </div>

                <div className="text-center mt-auto pb-4">
                  <p className="text-lg font-black text-slate-800 leading-tight mb-4">
                    Akıllı Telefonunla Sadece<br/>30 Saniyede<br/>Bilimsel Bir Devrimin Parçası<br/>Olmaya Ne Dersin?
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mb-3">
                    D.A.I.S. Bir Akademik Gönüllülük Projesidir.
                  </p>
                  <div className="flex justify-center w-full">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl border-2 border-slate-200">
                      🎓
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          .max-w-\\[1200px\\] { max-width: 100% !important; width: 100% !important; margin: 0 !important; box-shadow: none !important; padding: 0 !important; background: #52b1b3 !important;}
          .grid { gap: 1rem !important; }
          .bg-\\[\\#52b1b3\\] { background-color: #52b1b3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-white { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white !important; padding: 0 !important; }
          header { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default Brosur;
