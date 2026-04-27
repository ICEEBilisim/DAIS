import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { Mic, Smartphone, Info, AlertTriangle, ShieldAlert, HeartPulse } from 'lucide-react-native';

export default function Guide() {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <HeartPulse color="#cffafe" size={48} style={{ marginBottom: 12 }} />
        <Text style={styles.heroTitle}>D.A.I.S. Kalp Sesi Kayıt Rehberi</Text>
        <Text style={styles.heroSubtitle}>Kalbinizin Sesi, Sizin Sağlık Kimliğiniz.</Text>
      </View>

      {/* Section 1: Giriş */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>1</Text></View>
          <Text style={styles.sectionTitle}>Giriş: Kayıt Öncesi Hazırlık</Text>
        </View>
        <Text style={styles.paragraph}>D.A.I.S. ile en iyi deneyimi yaşamanız için kalp seslerinizin net bir şekilde kaydedilmesi kritik önem taşır. Kayıt işlemini başlatmadan önce aşağıdaki adımları dikkatlice okuyun.</Text>

        <View style={styles.alertBoxOrange}>
          <View style={styles.alertHeader}>
            <ShieldAlert color="#ea580c" size={20} />
            <Text style={styles.alertTitleOrange}>En Önemli Adım: Sessiz Bir Ortam!</Text>
          </View>
          <Text style={styles.paragraphSmall}>Kalp sesleri son derece kısık seslidir. Herhangi bir arka plan gürültüsü, kaydınızın doğruluğunu bozabilir.</Text>
          
          <View style={styles.listItem}><Text style={styles.listBullet}>📺</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Elektronik Cihazları Kapatın:</Text> TV, radyo, fan gibi ses kaynaklarını uzaklaştırın.</Text></View>
          <View style={styles.listItem}><Text style={styles.listBullet}>🔇</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Sessiz Saatler:</Text> Ortamın en sessiz olduğu anları seçin.</Text></View>
          <View style={styles.listItem}><Text style={styles.listBullet}>🚪</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Kapıları Kapatın:</Text> Dışarıdan gelecek sesleri minimize edin.</Text></View>
        </View>

        <View style={styles.alertBoxSlate}>
          <View style={styles.alertHeader}>
            <Info color="#06b6d4" size={20} />
            <Text style={styles.alertTitleSlate}>Kullanım İpuçları</Text>
          </View>
          <View style={styles.listItem}><Text style={styles.listBullet}>🩺</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Rahat Bir Pozisyon:</Text> Oturarak veya yatarak en rahat pozisyonu bulun. Kayıt süresince hareket etmemeniz gerekmektedir.</Text></View>
          <View style={styles.listItem}><Text style={styles.listBullet}>⏱️</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Kayıt Süresi:</Text> En az 15 saniye, en fazla 30 saniye sürmesi gerekmektedir.</Text></View>
          <View style={styles.listItem}><Text style={styles.listBullet}>👂</Text><Text style={styles.listText}><Text style={{fontWeight: 'bold'}}>Nefesinizi Tutun:</Text> Kaydın başında nefesinizi birkaç saniye tutmak sesi netleştirir ancak zorlayıcı olmamalıdır.</Text></View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageCaption}>📸 Doğru Konumlandırma</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsZoomed(true)}>
            <Image source={require('../../assets/uygulama.png')} style={styles.uygulamaImage} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isZoomed} transparent={true} animationType="fade" onRequestClose={() => setIsZoomed(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsZoomed(false)} activeOpacity={1}>
            <Image source={require('../../assets/uygulama.png')} style={styles.zoomedImage} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsZoomed(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.divider} />

      {/* Section 2: Harici Mikrofon */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>2</Text></View>
          <Text style={styles.sectionTitle}>Senaryo 1: Harici Mikrofon ile Kayıt</Text>
        </View>
        <Text style={styles.paragraph}>Bu yöntem, harici bir stetoskop mikrofonu veya hassas bir kayıt mikrofonu kullanarak en yüksek ses kalitesini elde etmenizi sağlar.</Text>
        
        <View style={styles.badge}>
          <Mic color="#64748b" size={16} />
          <Text style={styles.badgeText}>Uyumlu Cihazlar: Masaüstü, Dizüstü, Akıllı Telefon/Tablet (adaptörlü)</Text>
        </View>

        <View style={styles.stepsCard}>
          <View style={styles.stepsCardHeader}><Text style={styles.stepsCardTitle}>🛠️ Adım Adım Kayıt İşlemi</Text></View>
          <View style={styles.stepsCardBody}>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Mikrofonu Bağlayın</Text>
                <Text style={styles.stepDesc}>Harici mikrofonunuzu cihaza bağlayın.</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Uygulamayı Açın</Text>
                <Text style={styles.stepDesc}>D.A.I.S. "Yeni Kayıt" bölümüne gidin.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumberActive}><Text style={styles.stepNumberActiveText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitleActive}>Mikrofonu Yerleştirin</Text>
                <Text style={styles.stepDesc}>Hassas ucu, göğüs kafesinizin sol alt kısmına, kaburgaların arasına, tam kalbinizin üzerine yerleştirin.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Teması Sağlayın</Text>
                <Text style={styles.stepDesc}>Cildinize tam temas ettiğinden ve hareket etmediğinden emin olun. Aşırı baskı yapmayın.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Kaydı Başlatın & Bekleyin</Text>
                <Text style={styles.stepDesc}>"Kaydı Başlat" butonuna tıklayın (gerekirse izin verin). 15-30 sn kıpırdamadan bekleyin.</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section 3: Mobil Mikrofon */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>3</Text></View>
          <Text style={styles.sectionTitle}>Senaryo 2: Mobil Cihaz Mikrofonu ile Kayıt</Text>
        </View>
        <Text style={styles.paragraph}>Bu yöntem, ek donanıma ihtiyaç duymadan kalp sesinizi kaydetmenizi sağlar. Mikrofon hassasiyetine bağlı olarak sessiz ortam daha kritik hale gelir.</Text>
        
        <View style={styles.badge}>
          <Smartphone color="#64748b" size={16} />
          <Text style={styles.badgeText}>Uyumlu Cihazlar: Akıllı Telefon / Tablet</Text>
        </View>

        <View style={styles.stepsCard}>
          <View style={styles.stepsCardHeader}><Text style={styles.stepsCardTitle}>🛠️ Adım Adım Kayıt İşlemi</Text></View>
          <View style={styles.stepsCardBody}>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Uygulamayı Açın</Text>
                <Text style={styles.stepDesc}>D.A.I.S. "Yeni Kayıt" bölümüne gidin.</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Mikrofonu Bulun</Text>
                <Text style={styles.stepDesc}>Telefonunuzun birincil mikrofonunun nerede olduğunu (genellikle alt kısımda) kontrol edin.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumberActive}><Text style={styles.stepNumberActiveText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitleActive}>Telefonu Yerleştirin</Text>
                <Text style={styles.stepDesc}>Telefonunuzun mikrofon kısmını tam kalbinizin üzerine, sol alt göğüs kafesine yerleştirin.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Teması Sağlayın</Text>
                <Text style={styles.stepDesc}>Hafifçe bastırmak daha net bir kayıt almanıza yardımcı olabilir. Hareket ettirmemeye özen gösterin.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Kaydı Başlatın & Bekleyin</Text>
                <Text style={styles.stepDesc}>"Kaydı Başlat" butonuna tıklayın. 15-30 sn kıpırdamadan bekleyin.</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section 4: Sonuçlar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>4</Text></View>
          <Text style={styles.sectionTitle}>Kayıt Sonrası ve Sonuçlar</Text>
        </View>
        <Text style={styles.paragraph}>D.A.I.S., kaydınızı analiz edecek ve kalp ritmini bulduğunda Ham Ses ve Temiz Ses olarak size sunacaktır. Sonuçlar sizin için görselleştirilmiş bir rapor halinde sunulur.</Text>

        <View style={styles.resultBox}>
          <View style={styles.resultIconRed}><HeartPulse color="#f43f5e" size={24} /></View>
          <View style={{flex:1}}>
            <Text style={styles.resultTitle}>Kalp Ritim Grafiği</Text>
            <Text style={styles.resultDesc}>Kayıt süresindeki kalp ritminizin grafiksel gösterimi.</Text>
          </View>
        </View>

        <View style={styles.resultBox}>
          <View style={styles.resultIconCyan}><HeartPulse color="#0ea5e9" size={24} /></View>
          <View style={{flex:1}}>
            <Text style={styles.resultTitle}>Nabız Sayısı</Text>
            <Text style={styles.resultDesc}>Analiz edilen sesten elde edilen ortalama nabız (BPM) değeri.</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <View style={styles.alertHeader}>
            <AlertTriangle color="#b45309" size={20} />
            <Text style={styles.warningTitle}>Önemli Not: Kayıt Kalitesi</Text>
          </View>
          <Text style={styles.warningDesc}>Aldığınız kaydın kalitesi, analiz sonuçlarını doğrudan etkiler. Arka plan gürültüsü veya kalbe yetersiz temas gibi faktörler sonuçların güvenilirliğini bozabilir. Kayıt kalitesi düşükse, sessiz bir ortamda tekrar deneyin.</Text>
        </View>

        <Text style={styles.footerText}>Bu kılavuz, D.A.I.S. kullanıcıları için bir referans niteliğindedir.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroSection: { backgroundColor: '#0891b2', padding: 30, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { color: '#cffafe', fontSize: 14, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#cffafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionNumberText: { color: '#0891b2', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  paragraph: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 20 },
  paragraphSmall: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },
  alertBoxOrange: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', borderRadius: 12, padding: 16, marginBottom: 16 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  alertTitleOrange: { color: '#ea580c', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  alertBoxSlate: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 },
  alertTitleSlate: { color: '#1e293b', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  listItem: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  listBullet: { fontSize: 16, marginRight: 8 },
  listText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginHorizontal: 20, marginVertical: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 20 },
  badgeText: { fontSize: 12, color: '#475569', fontWeight: '500', marginLeft: 6 },
  stepsCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden' },
  stepsCardHeader: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  stepsCardTitle: { fontWeight: '600', color: '#334155' },
  stepsCardBody: { padding: 16 },
  stepItem: { flexDirection: 'row', marginBottom: 20 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  stepNumberText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
  stepNumberActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#a5f3fc', backgroundColor: '#cffafe', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  stepNumberActiveText: { color: '#0891b2', fontSize: 12, fontWeight: 'bold' },
  stepContent: { flex: 1 },
  stepTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 15, marginBottom: 4 },
  stepTitleActive: { fontWeight: 'bold', color: '#0891b2', fontSize: 15, marginBottom: 4 },
  stepDesc: { color: '#64748b', fontSize: 13, lineHeight: 18 },
  resultBox: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  resultIconRed: { backgroundColor: '#ffe4e6', padding: 8, borderRadius: 8, marginRight: 16 },
  resultIconCyan: { backgroundColor: '#e0f2fe', padding: 8, borderRadius: 8, marginRight: 16 },
  resultTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 15, marginBottom: 4 },
  resultDesc: { color: '#64748b', fontSize: 13 },
  warningBox: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a', borderLeftWidth: 4, borderLeftColor: '#f59e0b', borderRadius: 8, padding: 16, marginTop: 8 },
  warningTitle: { color: '#92400e', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  warningDesc: { color: '#b45309', fontSize: 13, lineHeight: 20 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: 12, marginTop: 32 },
  imageContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  imageCaption: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', color: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  uygulamaImage: { width: '100%', height: 250, resizeMode: 'contain', backgroundColor: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  closeButton: { position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});
