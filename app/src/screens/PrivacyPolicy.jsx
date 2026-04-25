import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicy({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#06b6d4" />
        </TouchableOpacity>
        <Shield size={24} color="#06b6d4" style={{ marginRight: 8 }} />
        <Text style={styles.title}>Gizlilik Politikası</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.mainTitle}>D.A.I.S Sağlık Asistanı Gizlilik Politikası</Text>
        <Text style={styles.date}>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</Text>

        <Text style={styles.paragraph}>
          ICEE Bilişim ("biz", "bizim" veya "şirketimiz") olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu gizlilik politikası, D.A.I.S mobil uygulaması ve web platformunun (birlikte "Hizmet" olarak anılacaktır) kullanımı sırasında toplanan verileri, bu verilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
        </Text>

        <Text style={styles.sectionTitle}>1. Toplanan Veriler ve İzinler</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Mikrofon İzni (RECORD_AUDIO):</Text> Uygulamamız, ana işlevi olan kalp atış hızı (BPM) analizini gerçekleştirebilmek için cihazınızın mikrofonuna erişim izni talep eder.{'\n\n'}
          <Text style={styles.bold}>Sağlık Verileri:</Text> Uygulama içerisine kendi isteğinizle girdiğiniz tansiyon, glukoz ve kalp ritmi verileriniz tamamen anonim olarak toplanmaktadır. Hiçbir şekilde isminiz, kimliğiniz veya sizi tanımlayabilecek herhangi bir kişisel bilgi talep edilmemekte ve saklanmamaktadır.
        </Text>

        <Text style={styles.sectionTitle}>2. Verilerin Kullanımı</Text>
        <Text style={styles.paragraph}>
          Mikrofonunuz aracılığıyla kaydedilen ses dosyaları, yalnızca dijital sinyal işleme algoritmalarımızla kalp atış hızınızı (nabzınızı) hesaplamak amacıyla kullanılır. Elde edilen anonim analiz sonuçları (BPM) ve yüklenen ham ses kayıtları, akademik bir çalışmada kullanılmak üzere yapay zeka derin öğrenme (deep learning) modellerinin eğitiminde kullanılacaktır. Verileriniz tamamen bilimsel araştırmalara ve yapay zeka gelişimine katkı sağlamak amacıyla anonim olarak işlenmektedir.
        </Text>

        <Text style={styles.sectionTitle}>3. Veri Paylaşımı</Text>
        <Text style={styles.paragraph}>
          Toplanan sağlık verileriniz ve ses kayıtlarınız <Text style={styles.bold}>kesinlikle üçüncü taraf reklamcılarla, pazarlama şirketleriyle veya diğer harici kurumlarla paylaşılmaz.</Text> Verileriniz yalnızca uygulamanın temel işlevlerini yerine getirmesi amacıyla işlenir.
        </Text>

        <Text style={styles.sectionTitle}>4. Veri Güvenliği</Text>
        <Text style={styles.paragraph}>
          Kişisel verilerinizin kaybolmasını, kötüye kullanılmasını veya yetkisiz erişimini engellemek için endüstri standardı güvenlik önlemleri (örneğin Supabase şifreleme ve RLS politikaları) kullanmaktayız. Ancak, internet üzerinden yapılan veri aktarımlarının %100 güvenli olamayacağını hatırlatmak isteriz.
        </Text>

        <Text style={styles.sectionTitle}>5. Kullanıcı Hakları</Text>
        <Text style={styles.paragraph}>
          Hesabınıza ait tüm verilerin silinmesini talep etme hakkına sahipsiniz. Silme işlemi talebiniz üzerine sunucularımızdaki kayıtlarınız kalıcı olarak yok edilecektir.
        </Text>

        <Text style={styles.sectionTitle}>6. İletişim</Text>
        <Text style={styles.paragraph}>
          Bu gizlilik politikası hakkında sorularınız veya endişeleriniz varsa, bizimle iletişime geçebilirsiniz:{'\n'}
          E-posta: dais@iceebilisim.com{'\n'}
          Web: dais.iceebilisim.com
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#ecfeff',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#334155',
  },
});
