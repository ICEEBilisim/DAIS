import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto mt-4 pb-12">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-cyan-600 hover:text-cyan-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Ekrana Dön
        </Link>
        <h2 className="text-xl font-bold text-slate-800 ml-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-cyan-600" />
          Gizlilik Politikası
        </h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
        <h3 className="text-lg font-bold text-slate-800 mb-4">D.A.I.S Sağlık Asistanı Gizlilik Politikası</h3>
        
        <p className="mb-4 text-slate-600">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </p>

        <p className="mb-4 text-slate-600">
          ICEE Bilişim ("biz", "bizim" veya "şirketimiz") olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu gizlilik politikası, D.A.I.S mobil uygulaması ve web platformunun (birlikte "Hizmet" olarak anılacaktır) kullanımı sırasında toplanan verileri, bu verilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">1. Toplanan Veriler ve İzinler</h4>
        <p className="mb-4 text-slate-600">
          <strong>Mikrofon İzni (RECORD_AUDIO):</strong> Uygulamamız, ana işlevi olan kalp atış hızı (BPM) analizini gerçekleştirebilmek için cihazınızın mikrofonuna erişim izni talep eder.
          <br/>
          <strong>Sağlık Verileri:</strong> Uygulama içerisine kendi isteğinizle girdiğiniz tansiyon, glukoz ve kalp ritmi verileriniz toplanmaktadır.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">2. Verilerin Kullanımı</h4>
        <p className="mb-4 text-slate-600">
          Mikrofonunuz aracılığıyla kaydedilen ses dosyaları, yalnızca dijital sinyal işleme algoritmalarımızla kalp atış hızınızı (nabzınızı) hesaplamak amacıyla kullanılır. Elde edilen analiz sonuçları (BPM) ve varsa yüklenen ham ses kayıtları, sadece sizin geçmiş sağlık kayıtlarınızı görebilmeniz amacıyla güvenli bulut sunucularımızda saklanır.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">3. Veri Paylaşımı</h4>
        <p className="mb-4 text-slate-600">
          Toplanan sağlık verileriniz ve ses kayıtlarınız <strong>kesinlikle üçüncü taraf reklamcılarla, pazarlama şirketleriyle veya diğer harici kurumlarla paylaşılmaz.</strong> Verileriniz yalnızca uygulamanın temel işlevlerini yerine getirmesi amacıyla işlenir.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">4. Veri Güvenliği</h4>
        <p className="mb-4 text-slate-600">
          Kişisel verilerinizin kaybolmasını, kötüye kullanılmasını veya yetkisiz erişimini engellemek için endüstri standardı güvenlik önlemleri (örneğin Supabase şifreleme ve RLS politikaları) kullanmaktayız. Ancak, internet üzerinden yapılan veri aktarımlarının %100 güvenli olamayacağını hatırlatmak isteriz.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">5. Kullanıcı Hakları</h4>
        <p className="mb-4 text-slate-600">
          Hesabınıza ait tüm verilerin silinmesini talep etme hakkına sahipsiniz. Silme işlemi talebiniz üzerine sunucularımızdaki kayıtlarınız kalıcı olarak yok edilecektir.
        </p>

        <h4 className="text-md font-bold text-slate-800 mt-6 mb-2">6. İletişim</h4>
        <p className="mb-4 text-slate-600">
          Bu gizlilik politikası hakkında sorularınız veya endişeleriniz varsa, bizimle iletişime geçebilirsiniz:
          <br/>
          E-posta: info@iceebilisim.com
          <br/>
          Web: dais.iceebilisim.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
