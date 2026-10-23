# BT Yönetimi ve Operasyon Rehberi

BT ekibini yöneten, süreç kuran ya da küçük/orta ölçekli bir kurumda BT'yi tek başına yürüten kişiler için pratik yönetim notları. Teknik detaylar için diğer rehberlere, süreçlerin temeli için `05-itil-surec-dokumantasyon-rehberi.md` dosyasına bak.

---

# 1. BT'NİN DEĞER ÖNERİSİ

BT, **işin sürekliliğini** sağlayan bir hizmet sağlayıcıdır. Başarı ölçütü kaç ticket kapandığı değil, **iş birimlerinin kesintisiz çalışmasıdır**.

| Rol | Odak |
|---|---|
| Destek (L1/L2) | Hızlı çözüm, iyi iletişim |
| Sistem/ağ yöneticisi | Altyapı sağlığı, güvenlik, yedek |
| BT yöneticisi | Strateji, bütçe, risk, ekip, tedarikçi |
| Güvenlik sorumlusu | Risk azaltma, olay yönetimi |

---

# 2. HİZMET KATALOĞU VE SLA

## 2.1 Hizmet kataloğu
Kullanıcıların **ne isteyebileceğini** ve **ne kadar sürede** alacağını tanımla:

| Hizmet | Örnek hedef süre | Sahibi |
|---|---|---|
| Şifre sıfırlama | 15 dakika | Destek |
| Yeni kullanıcı hesabı | 1 iş günü | Destek + İK onayı |
| Yeni bilgisayar kurulumu | 2 iş günü | Destek |
| Yazılım talebi | 3 iş günü (onaylı listede) | Destek + yönetici |
| Uzaktan erişim (VPN) | 1 iş günü | Ağ yöneticisi |

## 2.2 SLA örnek tablosu

| Öncelik | Tanım | İlk yanıt | Çözüm hedefi |
|---|---|---|---|
| P1 Kritik | Tüm kurum etkileniyor, iş durdu | 15 dk | 4 saat |
| P2 Yüksek | Bir departman çalışamıyor | 1 saat | 8 saat |
| P3 Orta | Tek kullanıcı, kısmi etki | 4 saat | 2 iş günü |
| P4 Düşük | Soru, kozmetik, talep | 1 iş günü | 5 iş günü |

> SLA'yı **ölçemiyorsan** sözleşmek anlamsız. Önce ticket sisteminde zamanı ölç.

---

# 3. ÖLÇÜMLER (KPI)

| Gösterge | Nasıl hesaplanır | Ne söyler |
|---|---|---|
| İlk yanıt süresi | Açılıştan ilk yanıta | Kullanıcı ilgi görüyor mu |
| Çözüm süresi (MTTR) | Açılıştan çözüme ortalama | Operasyon hızı |
| SLA uyum oranı | SLA içinde kapanan / toplam | Hizmet güvenilirliği |
| İlk temasta çözüm oranı | Tek seferde çözülen / toplam | Bilgi ve yetki kalitesi |
| Tekrar eden ticket | Aynı konuda tekrar | Kök neden çözülmüyor |
| Kullanıcı memnuniyeti (CSAT) | Kapanış anketi | Algılanan kalite |
| Açık ticket yaşı | Bekleyen işlerin ortalama yaşı | Birikme riski |
| Değişiklik başarı oranı | Sorunsuz değişiklik / toplam | Süreç olgunluğu |

**Uyarı:** Sayıları tek başına hedef yapma. "Çok ticket kapatmak" için kalitesiz çözüm üretilebilir. Metrikleri **birlikte** oku.

---

# 4. İŞE GİRİŞ – ÇIKIŞ (ONBOARDING / OFFBOARDING)

## 4.1 İşe giriş akışı
1. İK, başlangıç tarihinden **en az 5 iş günü önce** talep açar (ad, bölüm, yönetici, ünvan, gerekli yetkiler).
2. BT hesap, e-posta, lisans, cihaz ve yetkileri hazırlar.
3. Zimmet tutanağı imzalanır, envantere işlenir.
4. İlk gün: şifre/MFA, güvenlik farkındalığı, destek kanalları tanıtılır.
5. Kapanış: yönetici her şeyin çalıştığını onaylar.

## 4.2 İşten ayrılış akışı
| Zaman | Yapılacak |
|---|---|
| Ayrılıştan önce | Devredilecek veri, posta yönlendirme, ekipman listesi |
| Ayrılış anı | Hesap devre dışı, oturumlar kapat, MFA iptal, VPN/uzaktan erişim kaldır |
| Sonrası | Cihaz teslim al, güvenli sil, lisansı geri al, zimmeti kapat |
| 30–90 gün | Posta/dosya arşivi sonrası hesabı sil (politikaya göre) |

> Kurumun **en sık atlanan güvenlik açığı**, ayrılan çalışanın aktif kalan hesaplarıdır. İK ile otomatik bildirim kur.

---

# 5. VARLIK YÖNETİMİ

## 5.1 Neleri takip et
- Donanım: bilgisayar, sunucu, ağ cihazı, yazıcı, telefon
- Yazılım ve lisans: sürüm, adet, bitiş tarihi, sahibi
- Bulut abonelikleri: kim ödüyor, kim yönetiyor
- Alan adları ve sertifikalar: **bitiş tarihleri**
- Yedekler ve kritik anahtarlar (konumu, sahibi)

## 5.2 Tablo şablonu (donanım envanteri)

| Alan | Örnek |
|---|---|
| Varlık no | IST-LT-0042 |
| Tür / model | Laptop / ThinkPad T14 |
| Seri no | ABC1234 |
| Kullanıcı / zimmet | Ad Soyad (Muhasebe) |
| Konum | İstanbul, 2. kat |
| Satın alma / garanti | 2025-03 / 2028-03 |
| Durum | Kullanımda / Depoda / Bakımda / Hurda |
| Not | Değişim planı: 2029 |

## 5.3 Yaşam döngüsü
Planla → Satın al → Hazırla → Kullan → Bakım → Yenile → **Güvenli elden çıkar**. Her cihazın bir **sahibi** ve bir **planlı yenileme tarihi** olsun.

## 5.4 Sertifika ve lisans bitişleri
Kurumlarda beklenmedik kesintilerin en sık nedenlerinden biri **süresi dolan sertifika, alan adı veya lisanstır.** Takvim hatırlatıcısı kur (60/30/7 gün önce).

---

# 6. İŞ SÜREKLİLİĞİ VE FELAKET KURTARMA

## 6.1 Temel kavramlar
| Terim | Anlamı |
|---|---|
| **RTO** (Recovery Time Objective) | Servisin en geç ne kadar sürede geri gelmesi gerekir |
| **RPO** (Recovery Point Objective) | En fazla ne kadar veri kaybı kabul edilebilir |
| BIA | İş etki analizi: hangi sistem durursa ne kaybedilir |
| BCP | İş sürekliliği planı (işin devamı) |
| DRP | Felaket kurtarma planı (BT sistemlerini geri getirme) |

## 6.2 Sistem öncelik tablosu (örnek)

| Sistem | RTO | RPO | Yedek yöntemi |
|---|---|---|---|
| Kimlik (AD/Entra) | 2 saat | 1 saat | Sistem durumu + 2. DC |
| E-posta | 4 saat | 0 (bulut) | M365 + üçüncü parti yedek |
| ERP/Finans | 4 saat | 1 saat | Veritabanı + VM yedeği |
| Dosya sunucusu | 8 saat | 24 saat | Günlük yedek + gölge kopya |
| Web sitesi | 24 saat | 24 saat | Haftalık yedek |

## 6.3 Felaket kurtarma testi
- Yılda en az bir kez **geri yükleme testi** yap, süreyi ölç.
- Test sonucunu ve çıkan aksaklıkları yaz, planı güncelle.
- Test senaryoları: tek dosya, tek sunucu, tüm ortam (masa başı tatbikat).
- Yedeklerin **bir kopyası ağdan ve ana yönetici hesaplarından bağımsız** (offline/immutable) olsun.

> "Yedeğimiz var" ile "geri yükleyebiliyoruz" aynı şey değildir.

---

# 7. DEĞİŞİKLİK, RİSK VE BAKIM

## 7.1 Değişiklik yönetimi özeti
| Tür | Örnek | Onay |
|---|---|---|
| Standart | Yeni kullanıcı, rutin yama | Önceden onaylı, hızlı |
| Normal | Sunucu güncellemesi, yeni sistem | Değişiklik kaydı + onay |
| Acil | Güvenlik yaması, çöken sistemin onarımı | Hızlandırılmış onay, sonradan inceleme |

Her değişiklikte: **ne, neden, ne zaman, etkisi, geri alma planı, test planı.**

## 7.2 Risk kaydı
| Risk | Olasılık | Etki | Önlem | Sahibi |
|---|---|---|---|---|
| Yedek sunucusu arızası | Orta | Yüksek | İkinci kopya, izleme | Sistem yön. |
| Tek kişiye bağımlılık | Yüksek | Yüksek | Dokümantasyon, çapraz eğitim | BT yöneticisi |
| Sertifika süresi dolması | Orta | Orta | Takvim hatırlatıcı | Ağ yön. |
| Fidye yazılımı | Orta | Çok yüksek | Yedek, MFA, eğitim, yama | Güvenlik |

## 7.3 Planlı bakım
- Bakım pencerelerini önceden duyur (ne, ne zaman, etkisi).
- Bakım öncesi yedek ve geri dönüş planı.
- Bakım sonrası doğrulama ve duyuru.

---

# 8. DOKÜMANTASYON VE BİLGİ TABANI

- **Runbook:** Sık yapılan işlerin adım adım prosedürü (yeni kullanıcı, yedek geri yükleme).
- **Ağ şeması, IP planı, sunucu listesi:** Güncel tutulan temel kayıtlar.
- **Bilgi tabanı (KB):** Çözülen sorunlar; kullanıcıya self-servis makaleler.
- **Acil durum rehberi:** Kritik arıza ve güvenlik olayında kimi arayacaksın.
- **Kimlik bilgileri:** Şifre yöneticisi/kasa (Bitwarden, KeePass, Keeper, Vault) kullan; dokümana düz yazma.

> Tek kişide duran bilgi bir risktir. "Otobüs faktörü": Bir kişi yarın ayrılsa BT çalışmaya devam eder mi?

---

# 9. TEDARİKÇİ VE SÖZLEŞME YÖNETİMİ

| Konu | Dikkat |
|---|---|
| SLA ve destek saatleri | 7/24 mi, mesai içi mi? Yanıt ve çözüm süreleri |
| Yenileme tarihleri | Otomatik yenileme ve fesih bildirim süresi |
| Yedek tedarikçi | Kritik hizmetlerde alternatif |
| Veri konumu ve KVKK | Veri nerede, kimde, sözleşmede ne yazıyor |
| Acil iletişim | Bir isim ve telefon, genel destek hattı yetmez |
| Performans gözden geçirme | Üç/altı aylık değerlendirme |

---

# 10. BÜTÇE VE PLANLAMA

## 10.1 Bütçe kalemleri
| Kalem | Örnek |
|---|---|
| Donanım yenileme | Bilgisayar, sunucu, ağ cihazı |
| Lisanslar ve abonelikler | M365, antivirüs/EDR, yedekleme, izleme |
| Altyapı ve hizmet | İnternet hatları, bulut, güvenli e-posta |
| Güvenlik | EDR, MFA, güvenlik duvarı, eğitim, sızma testi |
| Eğitim ve personel | Sertifika, kurs |
| Beklenmeyen | Arıza yedeği (%5–10) |

## 10.2 Planlama ipuçları
- Donanımı **3–5 yıllık döngüyle** planla; yılda bir kısmını yenile (hepsini aynı yıl değil).
- Abonelikleri yılda bir gözden geçir: kullanılmayan lisansları kapat.
- Önceliği **risk** belirlesin: yedek ve güvenlik önce, konfor sonra.
- Yöneticilere teknik dil yerine **iş etkisi** ile anlat ("sunucu eskidi" yerine "ödeme sistemi 1 gün durabilir").

---

# 11. GÜVENLİK PROGRAMI (YÖNETİCİ ÖZETİ)

| Katman | Temel önlem |
|---|---|
| Kimlik | MFA, güçlü parola politikası, ayrıcalıklı hesap ayrımı |
| Cihaz | Şifreleme, EDR/antivirüs, güncel yama, yönetim (Intune/GPO) |
| Ağ | Segmentasyon, güvenlik duvarı, misafir ağı ayrımı |
| Veri | Yedek (3-2-1, offline kopya), erişim kontrolü, DLP |
| İnsan | Phishing farkındalık eğitimi ve simülasyonları |
| Olay | Yazılı olay müdahale planı, iletişim listesi, tatbikat |

**Standartlar (referans):** ISO/IEC 27001, CIS Controls, NIST CSF. Küçük ekipler için **CIS Controls IG1** pratik bir başlangıçtır.

---

# 12. EKİP YÖNETİMİ VE İLETİŞİM

## 12.1 Ekip
- **Nöbet ve devir:** Kritik sistemler için kim, ne zaman, nasıl ulaşılır.
- **Çapraz eğitim:** Her kritik sistemin en az iki sorumlusu olsun.
- **Geri bildirim:** Kritik olaylardan sonra suçlayıcı olmayan ("blameless") inceleme yap.
- **Gelişim:** Eğitim ve sertifika bütçesi, öğrenme süresi.

## 12.2 Yöneticilere raporlama
Aylık kısa rapor: **ticket hacmi ve SLA**, **kritik olaylar**, **tamamlanan projeler**, **riskler**, **sonraki ay planı**. Grafik ve 1 sayfa yeterlidir.

## 12.3 Kesinti duyurusu şablonu
```
Konu: [Planlı Bakım] E-posta servisi 23 Ekim 22:00–23:30
Etki: Bu saatler arasında e-posta gönderilip alınamayacak.
Neden: Güvenlik güncellemesi
Alternatif: Acil durumda telefon ile ulaşabilirsiniz (dahili 100)
Sorumlu: BT Destek
```

---

# 13. İLK 30 GÜN: BT ORTAMINI DEVRALMA LİSTESİ

- [ ] Kritik sistemlerin listesi ve sahipleri
- [ ] Yönetici hesapları ve parola kasası erişimi
- [ ] Yedek durumu: son başarılı yedek, **son geri yükleme testi**
- [ ] Sertifika, alan adı ve lisans bitiş tarihleri
- [ ] Ağ şeması, IP planı, güvenlik duvarı kuralları
- [ ] Açık ticket'lar ve tekrar eden sorunlar
- [ ] Tedarikçi sözleşmeleri ve iletişim listesi
- [ ] Güvenlik açıkları: MFA kapsamı, yama durumu, internete açık servisler
- [ ] Acil durum planı var mı, güncel mi?
- [ ] İlk iyileştirme planı (düşük maliyetli, yüksek etkili 5 madde)

**En hızlı kazanımlar:** MFA'yı yaygınlaştır, yedeği test et, yama durumunu görünür kıl, envanteri çıkar, dokümantasyona başla.
