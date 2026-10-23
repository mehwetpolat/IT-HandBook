# ITIL, Süreç Yönetimi ve Dokümantasyon Rehberi
**Ticket, değişiklik, envanter, bilgi tabanı ve şablonlar**

Teknik bilgi kadar **düzenli çalışmak** da IT desteğin değerini belirler. Bu rehber süreç kavramlarını ve kopyala-kullan şablonları içerir.

---

## 1. Temel Süreç Kavramları (ITIL Mantığı)

| Süreç | Soru | Örnek |
|---|---|---|
| **Incident** (Olay) | Bir şey bozuldu, hizmeti ne kadar çabuk geri getiririz? | "Yazıcı çalışmıyor" |
| **Service Request** (Hizmet talebi) | Standart bir şey isteniyor | "Yeni kullanıcı hesabı", "VPN erişimi" |
| **Problem** | Tekrar eden olayların kök nedeni ne? | "Her pazartesi VPN düşüyor, neden?" |
| **Change** (Değişiklik) | Üretim ortamında bir şeyi güvenle nasıl değiştiririz? | "Switch firmware güncellemesi" |
| **Knowledge** (Bilgi) | Çözümü kayıt altına alıp paylaş | Bilgi tabanı makalesi |

**Fark:** Incident = ateşi söndür. Problem = yangının neden çıktığını bul. Change = yapıyı güvenle değiştir.

## 2. Destek Seviyeleri

| Seviye | Kim | İş |
|---|---|---|
| L1 (Service Desk) | İlk karşılama | Kayıt aç, bilinen çözümleri uygula, yönlendir |
| L2 | Teknik destek | Daha derin analiz, yerinde müdahale, sunucu/ağ kontrolleri |
| L3 | Uzman/mühendis | Karmaşık sorunlar, tasarım, kök neden |
| Tedarikçi | Üçüncü taraf | Garanti, donanım, yazılım üreticisi desteği |

L1'de **doğru bilgiyi toplamak** ve **doğru kişiye devretmek** en önemli iş.

## 3. Öncelik Matrisi

Öncelik = **Etki × Aciliyet**

| | Aciliyet: Yüksek | Orta | Düşük |
|---|---|---|---|
| **Etki: Tüm firma/kritik hizmet** | P1 Kritik | P1/P2 | P2 |
| **Etki: Departman** | P2 Yüksek | P2/P3 | P3 |
| **Etki: Tek kullanıcı** | P3 Orta | P3 | P4 Düşük |

| Öncelik | Örnek | Örnek hedef süre (kuruma göre değişir) |
|---|---|---|
| P1 | Sunucu çöktü, internet yok, fidye yazılımı | Anında müdahale |
| P2 | Bir departman çalışamıyor | Birkaç saat içinde |
| P3 | Tek kullanıcı sorunu | Aynı/ertesi iş günü |
| P4 | Bilgi/talep, kozmetik | Plana göre |

**Kullanıcının "acil" demesi önceliği tek başına belirlemez.** Etkiyi sor.

## 4. SLA Kavramları
| Terim | Anlamı |
|---|---|
| SLA | Müşteriyle yapılan hizmet seviyesi sözleşmesi (yanıt/çözüm süresi) |
| OLA | Firma içi ekipler arası seviye anlaşması |
| UC (Underpinning Contract) | Tedarikçiyle sözleşme |
| İlk yanıt süresi | Kullanıcıya ilk dönüşün süresi |
| Çözüm süresi | Kaydın kapanma süresi |
| Ölçümler | İlk temasta çözüm oranı (FCR), yeniden açılma oranı, memnuniyet (CSAT), ortalama çözüm süresi |

## 5. İyi Ticket Yazımı

### 5.1 Ticket şablonu
```
BAŞLIK: [Kısa ve net] Örn: "Muhasebe 3. kat yazıcısı ağdan erişilemiyor"

KİM: Ad Soyad, departman, konum, iletişim
NE ZAMAN BAŞLADI: tarih-saat
SORUN: Ne oluyor, hata mesajı (aynen), ekran görüntüsü
ETKİ: Kaç kişi, iş durdu mu
DAHA ÖNCE ÇALIŞIYOR MUYDU: evet/hayır, son değişiklik
YAPILAN ADIMLAR:
  1. ...
  2. ...
SONUÇ/ÇÖZÜM: ne yapıldı, neden düzeldi
DOĞRULAMA: kullanıcı test etti mi
KAPANIŞ NOTU: kök neden / öneri
```

### 5.2 Kurallar
- Başlık sorunu anlatsın ("Sorun var" yetersiz)
- Hata mesajını **kopyala**, tahmin yazma
- Her işlemi zaman sırasıyla yaz (başkası devralabilsin)
- Çözümü yazmadan kapatma
- Kullanıcıya **kapatmadan önce** teyit ettir
- Aynı sorun 3. kez geliyorsa **Problem** kaydı aç

## 6. Değişiklik Yönetimi (Change Management)

### 6.1 Değişiklik türleri
| Tür | Anlamı | Örnek |
|---|---|---|
| Standard | Önceden onaylı, düşük riskli, rutin | Yeni kullanıcı oluşturma, yazıcı sürücü yükleme |
| Normal | İnceleme ve onay ister | Switch yapılandırması, sunucu güncellemesi |
| Emergency | Acil, hızlandırılmış onay | Aktif güvenlik açığına yama |

### 6.2 Değişiklik talep şablonu
```
DEĞİŞİKLİK TALEBİ
No / Tarih:
Talep eden:
Başlık:
Amaç/Gerekçe:
Etkilenen sistem ve kullanıcılar:
Risk (düşük/orta/yüksek) ve olası etkisi:
Planlanan tarih ve saat (bakım penceresi):
Uygulama adımları:
  1. ...
Test/doğrulama adımları:
Geri dönüş (rollback) planı:
  - Yedek/snapshot alındı mı:
  - Geri dönüş adımları:
Bilgilendirilecek kişiler:
Onaylayan(lar): ...
Sonuç (başarılı/başarısız/geri alındı):
```

### 6.3 Altın kurallar
- **Yedek/snapshot al**, geri dönüş planın olmadan başlama
- Mesai dışı veya bakım penceresinde yap (mümkünse)
- Aynı anda tek büyük değişiklik
- Etkilenen kullanıcıları **önceden** bilgilendir
- Sonucu ve gerçek süreyi kaydet
- Cuma akşamı büyük değişiklik yapma

## 7. Olay Sonrası İnceleme (Blameless Post-Mortem)

Ciddi kesintilerden sonra suçlu aramadan **neden olduğuna** ve **nasıl önleriz**e bakılır.
```
OLAY SONRASI İNCELEME
Olay özeti:
Etki: (kim, ne kadar süre, iş etkisi)
Zaman çizelgesi:
Kök neden:
Neyi iyi yaptık:
Neyi daha iyi yapabilirdik:
Önleyici aksiyonlar: (kim, ne zamana kadar)
```

## 8. Bilgi Tabanı (Knowledge Base) Makale Şablonu

```
BAŞLIK: Outlook sürekli şifre soruyor
GEÇERLİ OLDUĞU YER: Windows 10/11, Microsoft 365 Outlook
BELİRTİ: Kullanıcı sürekli kimlik bilgisi penceresi görüyor
NEDEN: Eski/bozuk kayıtlı kimlik bilgisi veya modern kimlik doğrulama sorunu
ÇÖZÜM:
  1. Outlook'u kapat
  2. Denetim Masası > Kimlik Bilgisi Yöneticisi > Windows Kimlik Bilgileri
  3. "MicrosoftOffice" ve "Outlook" ile ilgili kayıtları sil
  4. Outlook'u aç, yeniden giriş yap
DOĞRULAMA: Outlook şifre sormadan açılıyor
DAHA ÖNCE KARŞILAŞILAN: Ticket #1234
EKLER / EKRAN GÖRÜNTÜSÜ: ...
SON GÜNCELLEME: tarih / yazar
```
**Alışkanlık:** İlk kez çözdüğün her önemli sorunu 5 dakikada makaleye çevir. Bir yıl sonra en değerli varlığın olur.

## 9. Standart Operasyon Prosedürü (SOP) / Runbook Şablonu

```
PROSEDÜR: Yeni kullanıcı oluşturma
AMAÇ:
KİMLER KULLANIR:
ÖN KOŞULLAR: (onay, yetki, gerekli bilgi)
ADIMLAR:
  1. ...
  2. ...
  3. ...
DOĞRULAMA: (nasıl anlaşılır ki iş tamam)
SORUN OLURSA: (kime başvurulur, hangi log)
İLGİLİ BELGELER:
SON GÜNCELLEME / SÜRÜM:
```

## 10. İşe Giriş / Çıkış Kontrol Listeleri

### 10.1 Yeni çalışan (IT tarafı)
- [ ] İK/yönetici onayı ve bilgi formu alındı
- [ ] Kullanıcı hesabı (AD/Entra) oluşturuldu, doğru gruplar eklendi
- [ ] E-posta ve lisans atandı
- [ ] Bilgisayar/telefon hazırlandı (kurulum, imaj, güncellemeler, şifreleme)
- [ ] Gerekli yazılımlar ve erişimler (paylaşımlar, uygulamalar, VPN) verildi
- [ ] Yazıcı, telefon hattı, kart/rozet
- [ ] MFA ve şifre politikası anlatıldı
- [ ] Zimmet formu imzalandı
- [ ] Kısa oryantasyon: destek nasıl istenir (ticket, telefon)
- [ ] Ticket kapatıldı

### 10.2 Ayrılan çalışan
- [ ] Ayrılış tarihi ve talep onayı
- [ ] Hesap engellendi, oturumlar iptal, şifre sıfırlandı
- [ ] E-posta/OneDrive verisi yöneticiye devredildi
- [ ] Gruplar ve erişimler kaldırıldı
- [ ] Cihazlar iade alındı, veri aktarıldı, cihaz silindi/yeniden kuruldu
- [ ] Telefon, kart, anahtar, token, VPN, üçüncü taraf hesaplar
- [ ] Lisanslar serbest bırakıldı (veri devri sonrası)
- [ ] Envanter güncellendi

### 10.3 Yeni bilgisayar kurulum kontrol listesi
- [ ] Doğru imaj/işletim sistemi, güncellemeler
- [ ] Bilgisayar adı standardı, domain/Entra katılımı
- [ ] Sürücüler, BIOS/UEFI güncellemesi, TPM ve Secure Boot
- [ ] BitLocker açık, kurtarma anahtarı kaydedildi
- [ ] Antivirüs/EDR, güvenlik duvarı
- [ ] Standart yazılım paketi (Office, tarayıcı, PDF, VPN, uzak destek ajanı)
- [ ] Yazıcılar ve ağ sürücüleri
- [ ] Yerel yönetici şifresi (LAPS) ve kullanıcı yetkisi (standart)
- [ ] Envanter kaydı, etiket

## 11. Varlık/Envanter Yönetimi

### 11.1 Yaşam döngüsü
**Satın alma → Kurulum/dağıtım → Kullanım/bakım → Yenileme → Hurdaya ayırma**

### 11.2 Envanter tablosu şablonu
| Alan | Örnek |
|---|---|
| Varlık no | PC-0042 |
| Tür/Model | Dizüstü, Dell Latitude |
| Seri no | ... |
| Zimmetli kişi / konum | Ali Veli, Muhasebe |
| IP / MAC | 192.168.1.42 / ... |
| İşletim sistemi | Windows 11 Pro |
| Alış tarihi / garanti bitişi | ... |
| Durum | Kullanımda / depoda / arızalı / hurda |
| Notlar | RAM yükseltmesi yapıldı |

### 11.3 Güvenli imha
- Disk silme: standartlara uygun güvenli silme (NIST 800-88) ya da fiziksel imha
- Sadece "sil + biçimlendir" yetmez
- Silme/imha belgesi tut, e-atık yönetmeliğine uy

### 11.4 Lisans takibi
- Hangi yazılım, kaç lisans, kimde, ne zaman bitiyor
- Kullanılmayan lisansı geri al (maliyet)
- Lisanssız yazılım kullanımı hukuki risktir

## 12. Dokümantasyon: Neler Mutlaka Bulunmalı

| Belge | İçerik |
|---|---|
| Ağ şeması | Cihazlar, bağlantılar, VLAN'lar (draw.io / diagrams.net ile çizilebilir) |
| IP planı | Alt ağlar, VLAN'lar, DHCP aralıkları, sabit IP'ler |
| Sunucu envanteri | Ad, rol, IP, işletim sistemi, sorumlu, yedek durumu |
| Kimlik bilgisi kasası | Şifre yöneticisi (Bitwarden, KeePass), **Excel/Word'de değil** |
| Yedek planı | Ne, ne zaman, nereye, saklama, geri yükleme prosedürü |
| Felaket kurtarma planı | Öncelik sırası, iletişim, adımlar |
| Tedarikçi iletişimi | ISS, donanım desteği, lisans sağlayıcı, sözleşme bitiş tarihleri |
| Prosedürler/SOP | Tekrarlanan işlerin adımları |
| Değişiklik günlüğü | Ne zaman, kim, ne değiştirdi |

### 12.1 IP planı örneği
| Ağ / VLAN | Alt ağ | Ağ geçidi | DHCP | Sabit IP aralığı |
|---|---|---|---|---|
| Yönetim (VLAN 1/99) | 192.168.1.0/24 | .1 | Yok | .2 - .50 |
| Kullanıcı (VLAN 10) | 192.168.10.0/24 | .1 | .100 - .200 | .2 - .99 |
| Sunucu (VLAN 20) | 192.168.20.0/24 | .1 | Yok | .2 - .254 |
| Misafir (VLAN 30) | 192.168.30.0/24 | .1 | .50 - .200 | Yok |

### 12.2 İsimlendirme standardı örneği
| Tür | Örnek |
|---|---|
| Bilgisayar | `PC-MUH-001`, `NB-IT-007` |
| Sunucu | `SRV-DC01`, `SRV-FILE01` |
| Switch | `SW-K1-01` (kat 1, no 1) |
| Yazıcı | `PRN-K2-MUH` |
| Kullanıcı adı | `ad.soyad` veya `asoyad` |

Standart **tutarlı** olmalı; ilk günden belirle.

## 13. Kesinti Duyuru Şablonları

### 13.1 Plansız kesinti
```
Konu: [BİLGİ] İnternet bağlantısında kesinti

Merhaba,
Saat 10:15 itibarıyla firmamızda internet erişiminde kesinti yaşanmaktadır.
IT ekibi konuyu inceliyor. Şu an iç ağ ve dosya paylaşımları etkilenmemektedir.
Bir sonraki bilgilendirme: 11:00.
Bu süreçte telefon hattıyla ve ticket sistemi üzerinden destek alabilirsiniz.

IT Destek
```
### 13.2 Planlı bakım
```
Konu: [PLANLI BAKIM] 25 Ekim Cumartesi 22:00-24:00 sunucu bakımı

Merhaba,
25 Ekim Cumartesi 22:00-24:00 arasında dosya sunucusunda güncelleme yapılacaktır.
Bu sürede paylaşılan klasörlere erişilemeyecektir.
Lütfen açık dosyalarınızı Cumartesi 21:30'a kadar kaydedip kapatın.
Bir sorun olursa: it@firma.com

IT Destek
```
### 13.3 Çözüm bildirimi
```
Konu: [ÇÖZÜLDÜ] İnternet bağlantısı normale döndü

Merhaba,
10:15'te başlayan internet kesintisi 11:40 itibarıyla giderilmiştir.
Neden: Hizmet sağlayıcı kaynaklı hat sorunu.
Sorun devam ederse lütfen ticket açın.

IT Destek
```

## 14. Ticket / ITSM Araçları

| Araç | Not |
|---|---|
| **GLPI** | Açık kaynak, ticket + envanter, Türkiye'de yaygın; ev laboratuvarında kurup öğrenmek için ideal |
| Jira Service Management | Yaygın, esnek, SLA ve iş akışı |
| Freshservice / Freshdesk | Bulut tabanlı, kolay |
| ServiceNow | Büyük kurumsal ITSM |
| Zendesk | Müşteri desteği odaklı |
| osTicket / Znuny (OTRS) | Açık kaynak alternatifler |

Hangisi olursa olsun mantık aynı: kategori, öncelik, atama, SLA, durum, çözüm notu, bilgi tabanı.

## 15. Sertifika / Öğrenme
- **ITIL 4 Foundation:** Süreç kavramları ve iş dünyasında ortak dil
- Microsoft/CompTIA sertifikaları teknik tarafı, ITIL süreç tarafını tamamlar
- Kendi notlarını düzenli tut: yarın "dün ne yaptım" sorusuna cevap verebil

## 16. Süreç Alışkanlıkları Özeti
1. Her şey ticket'ta başlar, ticket'ta biter
2. Önce yedek, sonra değişiklik
3. Önemli çözümü bilgi tabanına yaz
4. Tekrar eden sorun = problem kaydı
5. Değişiklikte geri dönüş planı
6. Kullanıcıyı bilgilendir, kapatmadan önce teyit et
7. Şifreleri kasada tut, kimseyle paylaşma
8. Dokümantasyonu güncel tut, eskimiş belge, belge yokluğundan kötüdür
