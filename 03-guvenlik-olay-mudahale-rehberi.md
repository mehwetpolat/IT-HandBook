# Bilgi Güvenliği ve Olay Müdahale Rehberi
**IT destek ve sistem yönetimi için savunma odaklı notlar**

> Bu rehber savunma ve müdahale amaçlıdır. Tarama/test araçlarını **sadece yetkin olduğun ve izin aldığın** ağlarda kullan. Yetkisiz tarama suçtur.

---

## 1. Temel İlkeler

| İlke | Anlamı |
|---|---|
| **CIA üçlüsü** | Gizlilik (Confidentiality), Bütünlük (Integrity), Erişilebilirlik (Availability) |
| Defense in depth | Tek önleme güvenme, çok katmanlı koruma |
| Least privilege | Kullanıcıya sadece işi için gereken yetki |
| Zero trust | "Asla güvenme, her zaman doğrula" |
| Need to know | Bilgiye yalnızca ihtiyacı olan erişir |
| Separation of duties | Kritik işler tek kişide toplanmaz |

## 2. Yaygın Tehditler ve Savunma

| Tehdit | Nedir | Savunma |
|---|---|---|
| Phishing | Sahte e-posta/site ile bilgi çalma | Farkındalık, e-posta filtreleme, MFA |
| BEC (iş e-postası dolandırıcılığı) | Yönetici/tedarikçi gibi davranıp para/bilgi isteme | Ödeme doğrulama prosedürü (telefonla geri arama) |
| Fidye yazılımı | Dosyaları şifreleyip fidye isteme | Güncel yedek (çevrimdışı dahil), yama, MFA, ağ bölümleme |
| Kaba kuvvet / şifre deneme | Çok sayıda şifre deneme | Hesap kilitleme, MFA, güçlü şifre |
| Kimlik bilgisi doldurma | Sızan şifreleri başka sitede deneme | Her yerde farklı şifre, MFA |
| Kötü amaçlı yazılım | Virüs, trojan, casus yazılım | Antivirüs/EDR, güncelleme, kullanıcı yetkisini kısma |
| Sosyal mühendislik | İnsanı kandırma (telefon, yüz yüze) | Kimlik doğrulama prosedürü, eğitim |
| İç tehdit | Yetkili kullanıcının kötüye kullanımı | Loglama, yetki gözden geçirme |
| DDoS | Hizmeti aşırı yükle durdurma | Sağlayıcı koruması, hız sınırlama |
| Güncellenmemiş sistem | Bilinen açıklardan saldırı | Düzenli yama yönetimi |

## 3. Şüpheli E-posta (Phishing) Müdahalesi

### 3.1 Kullanıcı bildirdiğinde
1. Kullanıcıya **tıklamamasını**, eki açmamasını, yanıtlamamasını söyle.
2. Tıkladı/şifre girdiyse hemen **Bölüm 5** (hesap ele geçirilmesi) adımlarına geç.
3. E-postayı ek olarak (başlıklarıyla) topla, ekran görüntüsü al.
4. Aynı e-postayı **başka kimler aldı?** Mesaj izleme/arama ile bul.
5. Gönderen/alan adı ve bağlantıları engelle, e-postaları tüm kutulardan temizle (yetkin varsa).
6. Güvenlik sorumlusunu bilgilendir, olayı kaydet.
7. Kullanıcıya teşekkür et, geri bildirim ver (bildirimi teşvik et).

### 3.2 Phishing işaretleri
- Aciliyet/korku ("hesabınız kapanacak", "hemen ödeme")
- Gönderen adresi şirketle benzer ama farklı (`firma-destek.com`, `rnicrosoft`)
- Bağlantının üzerine gelince görünen adres farklı
- Beklenmeyen ek (özellikle .zip, .iso, .html, makrolu Office, .exe, .lnk)
- Genel hitap ("Sayın müşteri"), yazım/dil hataları
- Şifre, kart, kod isteği

### 3.3 Başlık (header) analizi
Başlıkta bak:
- **Authentication-Results:** `spf=pass/fail`, `dkim=pass/fail`, `dmarc=pass/fail`
- **From** ile **Return-Path / Reply-To** uyuşuyor mu?
- **Received** zinciri: gerçek gönderici sunucu

| Kayıt | Görevi |
|---|---|
| SPF | Bu alan adı için hangi sunucular e-posta gönderebilir |
| DKIM | İmza ile e-postanın değişmediğini doğrular |
| DMARC | SPF/DKIM başarısızsa ne yapılacağını söyler (none/quarantine/reject) |

### 3.4 Güvenli kontrol
- Bağlantıyı tıklamadan kontrol: VirusTotal, urlscan.io (kurum politikası izin veriyorsa)
- Ek dosyayı **kullanıcının bilgisayarında açma**, izole ortamda/sandbox'ta incele
- Şüpheli dosyanın hash'ini kontrol et

## 4. Fidye Yazılımı (Ransomware) Müdahale Kartı

**Belirtiler:** Dosya uzantıları değişti, açılmıyor, fidye notu, ağ paylaşımlarında toplu değişiklik.

**İlk dakikalar:**
1. **Yayılmayı durdur:** Etkilenen cihazı ağdan ayır (kabloyu çek, Wi-Fi kapat, switch portunu kapat).
2. Cihazı kapatmadan önce yetkili kişiye danış (adli inceleme için bellek bilgisi önemli olabilir). Ağdan ayıramıyorsan talimatla kapatmayı değerlendir.
3. **Yöneticiyi/güvenlik sorumlusunu hemen ara.** Kendi başına fidye ödeme kararı verme.
4. Etkilenen cihaz/paylaşım listesi çıkar, **ne zaman başladı** not al.
5. Ağdaki diğer paylaşımları (dosya sunucusu) korumak için erişimi kes.
6. Yedeklerin **etkilenip etkilenmediğini** kontrol et (çevrimdışı/ayrı kopya).

**Sonra:**
- Kaynağı bul (hangi kullanıcı/e-posta/cihaz), ilk giriş noktasını kapat
- Ortamı temizle, **temiz yedekten** geri yükle (etkilenen sistemi yeniden kur, sadece "temizleme"ye güvenme)
- Tüm ilgili hesapların şifrelerini değiştir, oturumları iptal et
- Güvenlik açığını kapat (yama, MFA, ağ bölümleme)
- Yasal/kurumsal bildirim yükümlülüklerini yönetimle değerlendir (Bölüm 12)
- Olay sonrası değerlendirme yap

**Yapma:** Şifreli dosyaları silme/yeniden adlandırma, kanıt yok etme, acele ile temizleme, yönetime haber vermeden dış kişilerle iletişim.

## 5. Hesap Ele Geçirilmesi Şüphesi

**Belirtiler:** Kullanıcının bilmediği gönderilmiş e-postalar, olağandışı konumdan giriş, bilinmeyen MFA bildirimi, posta kuralları, şifre değişimi.

1. Şifreyi **sıfırla** (güçlü, rastgele), **tüm oturumları iptal et** (Revoke sessions).
2. MFA yöntemlerini gözden geçir, tanınmayan cihaz/yöntemi kaldır, gerekirse yeniden kaydettir.
3. **Posta kurallarını kontrol et:** Gizli yönlendirme (forwarding), "gelenleri sil/taşı" kuralları saldırganların bıraktığı yaygın izlerdir.
4. Giriş günlüklerini incele: Entra **Sign-in logs** (konum, IP, uygulama, başarı/başarısız).
5. Kullanıcının hesabıyla yetkilendirilmiş şüpheli uygulamaları/OAuth izinlerini kaldır.
6. Hesapla gönderilen e-postaların alıcılarını belirle, gerekirse uyar.
7. Aynı şifreyi başka yerlerde kullandıysa onları da değiştirtir.
8. Cihazda zararlı olup olmadığını tara.
9. Olayı kaydet ve bildir.

## 6. Kayıp/Çalıntı Cihaz

1. Kullanıcıdan ne zaman/nerede kaybolduğunu ve içeriğini (veri, erişimler) öğren.
2. Cihaz **BitLocker/şifreleme** ile korunuyor mu? (Evetse risk çok daha düşük.)
3. Intune ile **Remote lock** veya **Wipe** (kurum politikasına göre).
4. Hesap oturumlarını iptal et, şifreyi değiştir, saklı kimlik bilgilerini geçersiz kıl.
5. VPN/sertifika/uygulama erişimlerini kapat.
6. Gerekirse emniyete bildirim, yönetime rapor.
7. Cihazı envanterde "kayıp" olarak işaretle.

## 7. Olay Müdahale Aşamaları (NIST Modeli)

| Aşama | Ne yapılır |
|---|---|
| 1. Hazırlık | Politika, iletişim listesi, araçlar, yedek, eğitim |
| 2. Tespit ve analiz | Belirtiyi doğrula, kapsamı belirle, önceliklendir |
| 3. Sınırlama, yok etme, kurtarma | İzole et → nedeni kaldır → sistemleri güvenle geri getir |
| 4. Olay sonrası | Ders çıkarma, raporlama, önlem ekleme |

**İlk 15 dakika kontrol listesi:**
- [ ] Ne oldu, ne zaman fark edildi?
- [ ] Hangi sistem/kullanıcı etkilendi?
- [ ] Yayılıyor mu? → izole et
- [ ] Kanıtı koru (ekran görüntüsü, log, **hiçbir şeyi silme**)
- [ ] Doğru kişiyi/yöneticiyi bilgilendir
- [ ] Ticket/olay kaydı aç, saatleri not al

## 8. Log Okuma

### 8.1 Windows Güvenlik Olay Kimlikleri
| ID | Anlamı |
|---|---|
| 4624 | Başarılı oturum açma |
| 4625 | **Başarısız** oturum açma |
| 4634 / 4647 | Oturum kapatma |
| 4648 | Açık kimlik bilgisiyle giriş denemesi |
| 4672 | Özel (yönetici) yetkili oturum |
| 4688 | Yeni işlem (process) oluşturuldu |
| 4720 | Kullanıcı hesabı oluşturuldu |
| 4722 / 4725 | Hesap etkinleştirildi / devre dışı |
| 4724 / 4723 | Şifre sıfırlama / değiştirme denemesi |
| 4728 / 4732 | Kullanıcı gruba eklendi (global / yerel) |
| 4740 | Hesap kilitlendi |
| 1102 | Güvenlik günlüğü **temizlendi** (şüpheli!) |

**Oturum türleri (4624/4625 Logon Type):** 2 = yerel, 3 = ağ, 10 = uzak masaüstü (RDP).

**Hesap kilidinin kaynağını bulma:** DC'de `4740` olayı "Caller Computer Name" alanını gösterir.

**Çok sayıda başarısız oturum açma (PowerShell):**
```powershell
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} |
  Select-Object TimeCreated, @{n='Kullanici';e={$_.Properties[5].Value}}, @{n='KaynakIP';e={$_.Properties[19].Value}} |
  Group-Object Kullanici | Sort-Object Count -Descending | Select-Object -First 10
```
Yönetici olarak çalıştır. Tek kullanıcıya çok deneme = şifre deneme saldırısı olabilir.

### 8.2 Linux
```bash
sudo grep "Failed password" /var/log/auth.log | tail -20      # Başarısız SSH girişleri
sudo grep "Accepted" /var/log/auth.log | tail -20             # Başarılı girişler
last -n 20                                                    # Son girişler
sudo lastb | head                                             # Başarısız girişler
sudo journalctl -u ssh --since "1 hour ago"
```

## 9. Sıkılaştırma Kontrol Listeleri

### 9.1 İş istasyonu
- [ ] Disk şifreleme (BitLocker), TPM aktif
- [ ] Windows Update ve uygulama güncellemeleri otomatik
- [ ] Defender/EDR açık ve güncel
- [ ] Günlük kullanımda **standart kullanıcı**, yönetici yetkisi ayrı hesapta
- [ ] Yerel yönetici şifresi her cihazda **farklı** (Windows LAPS)
- [ ] SMBv1 kapalı, gereksiz servisler kapalı
- [ ] Ekran kilidi (otomatik, 5-10 dk)
- [ ] USB depolama kısıtı (gerekirse)
- [ ] Güvenlik duvarı açık

### 9.2 Sunucu
- [ ] Gereksiz rol/servis/port kapalı
- [ ] Yönetici erişimi sınırlı, ayrı yönetici hesabı
- [ ] RDP: doğrudan internete açma, VPN arkasında, MFA, ağ düzeyi kimlik doğrulama (NLA)
- [ ] Yama ve yedek düzeni
- [ ] Günlükleme açık, merkezi log
- [ ] Varsayılan şifreleri değiştir

### 9.3 Ağ
- [ ] Varsayılan cihaz şifreleri değişmiş
- [ ] Telnet kapalı, **SSH** açık
- [ ] Kullanılmayan portlar kapalı, port güvenliği
- [ ] Yönetim arayüzü ayrı VLAN'da
- [ ] Misafir Wi-Fi ayrı VLAN/izole
- [ ] Wi-Fi: **WPA2/WPA3**, güçlü parola (kurumsalda 802.1X/RADIUS)
- [ ] Firmware güncel
- [ ] Config yedekleri güvenli yerde

### 9.4 Hesap ve kimlik
- [ ] MFA herkeste, özellikle yönetici ve e-posta
- [ ] Ortak hesap yok, paylaşılan şifre yok
- [ ] Ayrılan çalışanın hesabı derhal kapanır
- [ ] Yönetici gruplarının üyeleri düzenli gözden geçirilir
- [ ] Servis hesapları minimum yetkili, güçlü şifreli

## 10. Güvenlik Duvarı, VPN, Wi-Fi

**Güvenlik duvarı mantığı:** Varsayılan **gelen trafik reddedilir**, sadece gerekenlere izin verilir. Kurallar yukarıdan aşağı değerlendirilir, ilk eşleşen uygulanır. Kural ekleme nedenini not et.

```
netsh advfirewall show allprofiles                       # Windows güvenlik duvarı durumu
netsh advfirewall firewall show rule name=all | more
sudo ufw status verbose                                  # Ubuntu
```

| VPN türü | Not |
|---|---|
| IPsec / IKEv2 | Kurumsal, yaygın |
| SSL VPN | Tarayıcı/istemci tabanlı |
| WireGuard | Hızlı, basit, ev laboratuvarı için ideal |
| OpenVPN | Esnek, yaygın |
| Split tunnel | Sadece kurumsal trafik VPN'den, internet doğrudan (güvenlik/performans takası) |

## 11. Açık Yönetimi ve Savunma Araçları

- **Yama yönetimi:** Envanteri bil → yamaları öncelik sırasıyla uygula (internete açık ve kritik sistemler önce) → doğrula
- **Defender komutları:**
```powershell
Get-MpComputerStatus
Update-MpSignature
Start-MpScan -ScanType QuickScan
Get-MpThreatDetection
```
- **Kendi ağında** (izinli) cihaz keşfi: `nmap -sn 192.168.1.0/24` (canlı cihazlar), `nmap -sV 192.168.1.20` (açık portlar ve servis sürümü). Amaç: beklenmeyen açık port ve cihazları bulmak.
- Wireshark: ağ sorunlarını ve şüpheli trafiği analiz etmek için
- Sysinternals: Autoruns (başlangıçta çalışanlar), Process Explorer, TCPView

## 12. Şifre, Kimlik ve Veri Koruma

**Şifre:** Uzunluk, karmaşıklıktan daha önemli. Uzun parola ibareleri (passphrase) önerilir. Sızıntı/şüphe olmadıkça düzenli zorunlu değişim eskisi kadar önerilmiyor. **Her hesap için farklı şifre** + **şifre yöneticisi** (Bitwarden, KeePass vb.).

**MFA güç sırası (genelde):** FIDO2/güvenlik anahtarı > kimlik doğrulama uygulaması (numara eşleştirme) > SMS (en zayıf, yine de hiç olmamasından iyi).

**KVKK / veri koruma farkındalığı (Türkiye):**
- Kişisel veri: kimlik, iletişim, sağlık, finans, çalışan bilgileri
- Veri ihlalinde ilgili makama bildirim süresi kısadır (mevzuata göre **72 saat** gibi); bu karar yönetim/hukuk/KVKK sorumlusuna aittir. Sen ihlali **hemen** yukarı bildir.
- Ulusal siber olaylar için USOM (TR-CERT) bildirim kanalı vardır; kurumun prosedürüne bak.
- Kişisel veriyi kendi cihazına/kişisel e-postana kopyalama; gereksiz veri toplama/saklama

## 13. Kullanıcı Farkındalığı İçin Kısa Kurallar

- Tanımadığın bağlantıya/ekte tıklama, şüpheliyi **IT'ye ilet**
- Şifreni **kimseyle paylaşma**, IT sana şifreni sormaz
- Bilmediğin USB'yi bilgisayara takma
- Ekranı kilitle (Win+L)
- Yabancıya kapıyı açma, rozetsiz kişiyi sor
- Masada şifre notu bırakma
- Para/ödeme taleplerini ikinci kanaldan (telefon) doğrula
- Kişisel ve iş verisini ayır

## 14. Kimlik Doğrulama Prosedürü (IT Destek İçin)

Telefonla gelen şifre/MFA sıfırlama talebinde:
1. Kullanıcı adı ve çalışan numarası/doğum tarihi gibi **bilgi** sor
2. Kayıtlı telefon numarasından/yöneticiden **geri arama** veya yönetici onayı
3. Şüphe varsa işlem **yapma**, yöneticiye danış
4. İşlemi ve doğrulama yöntemini ticket'a yaz

Saldırganlar sık sık "acil toplantıdayım, hemen lazım" baskısı kullanır. **Baskı bir uyarı işaretidir.**

## 15. Olay Raporu Şablonu

```
OLAY RAPORU
Olay No / Tarih-Saat:
Bildiren kişi:
Olay türü: (phishing / hesap ele geçirme / zararlı yazılım / veri kaybı / kayıp cihaz / diğer)
Etkilenen sistem/kullanıcılar:
Özet:
Zaman çizelgesi:
  - hh:mm  ...
  - hh:mm  ...
Alınan önlemler:
Kök neden (biliniyorsa):
Durum: (açık / sınırlandı / çözüldü)
Veri etkisi: (kişisel/gizli veri var mı)
Kimler bilgilendirildi:
Alınan dersler / önleyici aksiyonlar:
```

## 16. Öğrenme Yolu

| Kaynak | Not |
|---|---|
| CompTIA Security+ | Genel güvenlik temeli, sektörde yaygın |
| Microsoft SC-900 | Microsoft güvenlik ve kimlik temelleri |
| TryHackMe (SOC Level 1, Pre-Security) | Uygulamalı, savunma odaklı yollar |
| Blue team laboratuvarları | Log analizi, Wazuh/Security Onion gibi araçlar |
| NIST Cybersecurity Framework | Çerçeve düşüncesi |

Sertifika ve platform içerikleri değişebilir, güncel bilgi için resmi sitelere bak.
