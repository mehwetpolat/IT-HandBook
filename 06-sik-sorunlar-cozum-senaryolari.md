# Sık Sorunlar ve Çözüm Senaryoları

Sahada en sık gelen talepler için **belirti → teşhis → çözüm → önlem** akışı. Her senaryo, ticket'a yazılabilecek şekilde kısa ve uygulanabilir adımlarla hazırlandı.

> **Yöntem:** Önce kapsamı belirle (tek kişi mi, herkes mi?), sonra en basit ve geri alınabilir adımdan başla. Her adımın sonucunu ticket'a not et. İlgili başlıklara veya adımlara tıklayarak doğrudan çözüme gidebilirsin.

---

# 1. HESAP VE ERİŞİM SENARYOLARI

## 1.1 Senaryo: "Sabah giriş yapamıyorum"
**Belirti:** Kullanıcı şifresini doğru yazdığını söylüyor, giriş reddediliyor.

**Teşhis:**
1. Caps Lock, klavye dili (TR/EN Q) kontrol et.
2. Hesap kilitli mi? ADUC veya PowerShell: `Get-ADUser kullanici -Properties LockedOut`
3. Şifre süresi dolmuş mu? `net user kullanici /domain` çıktısında "Password expires" satırı.
4. Hesap devre dışı mı, çalışma saati kısıtı var mı?
5. Bilgisayar domain ile konuşabiliyor mu? (VPN/ağ, saat farkı — saat farkı 5 dakikayı geçerse Kerberos bozulur).

**Çözüm:** Kilidi aç, gerekirse kimliği doğruladıktan sonra şifreyi sıfırla, "bir sonraki girişte değiştir" seçeneğini işaretle.

**Kök neden ara:** Hesap tekrar tekrar kilitleniyorsa kilidi tetikleyen cihazı bul (telefon posta uygulaması, eski kayıtlı bağlantı, eşlenmiş ağ sürücüsü). Domain Controller üzerinde Olay ID **4740** kaynağı gösterir. Detaylı log analizi için [Güvenlik ve Olay Müdahale Rehberi](03-guvenlik-olay-mudahale-rehberi.md) bölümüne bak.

## 1.2 Senaryo: "Yeni telefon aldım, MFA kodları gelmiyor"
1. Kullanıcının kimliğini **ikinci bir kanaldan** doğrula (yönetici onayı, şirket dahili hattından geri arama).
2. Eski kimlik doğrulayıcı yöntemini sıfırla (Entra ID > Kullanıcı > Kimlik doğrulama yöntemleri > MFA'yı yeniden kaydettir).
3. Kullanıcıyı `https://aka.ms/mysecurityinfo` adresinden yeni cihazı eklemesi için yönlendir.
4. Mümkünse **birden fazla yöntem** kaydettir (Microsoft Authenticator uygulaması + SMS/Telefon).

**Önlem:** Telefon değişimi öncesinde kullanıcıların mevcut Authenticator'dan yeni cihazı eklemeleri için oryantasyon kılavuzu paylaş. M365 detayları için [Bulut ve Kimlik Rehberi](01-bulut-kimlik-m365-intune-rehberi.md).

## 1.3 Senaryo: "Klasöre erişimim yok"
1. Hangi dosya yolu ve tam hata mesajı? (Erişim engellendi / yol bulunamadı).
2. Kullanıcı hangi güvenlik gruplarında? `whoami /groups` komutunu çalıştır.
3. Hem **Paylaşım İzni (Share Permission)** hem de **NTFS İzni (Security Tab)** kontrol edilir; ikisinin kesişimi (en kısıtlayıcı olan) geçerlidir.
4. Kullanıcı yeni bir gruba eklendiyse Kerberos biletinin yenilenmesi için **oturumu kapatıp yeniden açmalıdır** (veya `klist purge`).

**Önlem:** İzinleri asla şahıs hesaplarına tek tek verme; departman güvenlik gruplarına (Security Group) ata.

---

# 2. YAZICI SENARYOLARI

## 2.1 Senaryo: "Yazdırıyorum ama çıktı gelmiyor"
1. Yazıcının ekranında hata/kağıt sıkışması/toner uyarısı var mı?
2. Yazıcı ağda mı? Yazıcının IP adresine ping at: `ping yazici-ip`
3. Kuyrukta takılı iş var mı? Yazdırma biriktiricisini (Spooler) temizle ve yeniden başlat:

```cmd
net stop spooler
del /Q /F /S "%systemroot%\System32\spool\PRINTERS\*.*"
net start spooler
```

4. Doğru yazıcı varsayılan mı, "çevrimdışı çalış" seçeneği işaretli mi?
5. Yazıcıyı bilgisayar adı yerine **doğrudan IP (Standard TCP/IP Port)** ile ekle.

**Önlem:** Tüm kurumsal yazıcılara DHCP üzerinden MAC rezervasyonu yap veya DHCP havuzu dışından sabit IP ver.

## 2.2 Senaryo: "Sadece benim bilgisayarımda yazıcı kayboldu"
- Yazıcı sunucusundan yeniden eşle: `\\printserver\yazici-adi`
- Sürücü uyumsuzluğu: Windows güncellemeleri sonrası Point and Print kısıtlaması nedeniyle sürücü düşebilir; sürücüyü üretici sitesinden temiz kur.
- GPO ile dağıtılan yazıcı ise: `gpupdate /force` çalıştırıp oturumu kapat aç.

---

# 3. AĞ VE FIREWALL SENARYOLARI

## 3.1 Senaryo: "Sadece bir bölümde internet yok"
| Gözlem | Olası Neden | Yapılacak İlk Adım |
|---|---|---|
| Aynı switch'e bağlı herkes etkileniyor | Switch arızası, uplink kablosu, VLAN | Switch güç ışığını ve uplink port ışığını kontrol et. |
| Sadece Wi-Fi etkileniyor | AP askıda, DHCP havuzu dolmuş, RADIUS | AP'yi yeniden başlat, DHCP scope doluluğuna bak. |
| Sadece belirli siteler açılmıyor | DNS, proxy, kurumsal firewall filtreleme | `nslookup` yap, [10-guvenlik-duvari-firewall-vpn-rehberi.md](10-guvenlik-duvari-firewall-vpn-rehberi.md) loglarına bak. |
| Bilgisayar IP adresi `169.254.x.x` | DHCP'ye ulaşılamıyor (APIPA) | Kabloyu/portu test et: `ipconfig /release` ve `ipconfig /renew`. |

**Adım Adım OSI Teşhisi:**
1. [Fiziksel Kontrol]: Kablo takılı mı, switch port ışığı yeşil mi?
2. [IP Kontrolü]: `ipconfig /all` çalıştır. IP ve Gateway doğru mu?
3. [Yerel Ağ]: `ping <Gateway_IP>` gitmiyorsa kablo/VLAN sorunu.
4. [Dış Ağ]: `ping 8.8.8.8` gidiyorsa internet hattı çalışıyor.
5. [DNS Kontrolü]: `nslookup google.com` çözmüyorsa DNS önbelleğini temizle: `ipconfig /flushdns`.

Ağ mantığı için [Ağ Temelleri Rehberi](07-ag-temelleri-rehberi.md) bölümüne bak.

## 3.2 Senaryo: "Ağ çok yavaş / internet sürünüyor"
1. Hız testi tek kullanıcıda mı, tüm şirkette mi? (Kablolu ve Wi-Fi karşılaştır).
2. `ping -n 50 <Gateway_IP>`: paket kaybı (% packet loss) veya dalgalanma (jitter) var mı?
3. Switch portunda CRC veya input error sayaçları artıyor mu? (`show interfaces fa0/1` — duplex uyumsuzluğu veya ezilmiş kablo).
4. Firewall bant genişliği izleme ekranında hangi IP'nin hattı tükettiğine bak (Torrent, büyük dosya indirme, bulut yedekleme).
5. Ağda döngü (Loop) şüphesi: Switch port ışıkları deli gibi aynı anda yanıp sönüyorsa Spanning Tree (STP) devreye girmemiş olabilir.

## 3.3 Senaryo: "Aynı IP adresi başka bir cihazda kullanılıyor" uyarısı
1. `arp -a` ve `ipconfig /all` ile çakışan IP'nin MAC adresini tespit et.
2. Switch üzerinde `show mac address-table | include <mac>` komutuyla cihazın hangi fiziksel porta bağlı olduğunu bul.
3. Cihazı bulup sabit IP'sini değiştir ya da DHCP havuzunda rezervasyon tanımla.

## 3.4 Senaryo: "Firewall üzerinden port açıldı ama dışarıdan ulaşılamıyor"
1. **Hedef Servis Dinliyor mu?** İçerideki sunucuda o port gerçekten açık mı? `netstat -ano | findstr :443`
2. **Yerel Güvenlik Duvarı:** Windows Defender Firewall gelen portu engelliyor mu? İlgili port için "Inbound Rule" açıldı mı?
3. **ISP Port Engeli:** İnternet Servis Sağlayıcısı (Türk Telekom, Superonline vb.) kurumsal statik IP olmayan hatlarda 80, 443 veya 25 portlarını güven gerekçesiyle engeller. ISP ile görüşüp port filtresini kaldırt.
4. **NAT / VIP Kontrolü:** Güvenlik duvarında Destination NAT (Virtual IP) kuralı ve WAN -> DMZ geçiş kuralı (Policy) tanımlı mı? Detaylar: [10-guvenlik-duvari-firewall-vpn-rehberi.md](10-guvenlik-duvari-firewall-vpn-rehberi.md).

## 3.5 Senaryo: "VPN başarıyla bağlandı ama iç sunuculara veya dosya paylaşımına ulaşılamıyor"
1. **Subnet Çakışması (En Sık Neden):** Kullanıcının evindeki modem IP bloğu `192.168.1.0/24` ve şirket iç ağı da `192.168.1.0/24` ise Windows paketleri ev ağına gönderir, tünelden geçirmez!
   * *Çözüm:* Kurumsal ağlarda asla `192.168.1.0/24` veya `192.168.0.0/24` kullanılmamalı; `10.x.x.x` veya `172.16.x.x` tercih edilmelidir.
2. **DNS Suffix:** Kullanıcı sunucuya `\\muhasebe-dc` yazarak erişemiyorsa tam adı (FQDN) dene: `\\muhasebe-dc.firma.local` veya doğrudan IP ile dene: `\\10.10.1.20\paylasim`.
3. **Split Tunnel Rotası:** VPN istemcisine şirket IP bloklarının rotası push edilmiş mi? Komut satırında `route print` ile kontrol et.

---

# 4. POSTA VE OFİS SENARYOLARI

## 4.1 Senaryo: "Outlook sürekli şifre soruyor / Bağlantı kesildi"
1. Şifre yakın zamanda değiştiyse Windows Kimlik Bilgisi Yöneticisi'ndeki (Credential Manager) eski Microsoft/Office kayıtlarını temizle.
2. Outlook'u eklentisiz güvenli modda açmayı dene: `Win+R` -> `outlook /safe`
3. Modern Kimlik Doğrulama (ADAL/OAuth) penceresi açılmıyorsa: Edge/Internet seçenekleri veya TPM anahtar sorunu olabilir.
4. Profili yeniden oluştur: Denetim Masası > Posta (Mail) > Profilleri Göster > Yeni Profil ekle.

## 4.2 Senaryo: "Gönderdiğim e-posta geri döndü (NDR Hata Kodu)"
- **5.1.1 (User unknown):** Alıcı e-posta adresi yanlış yazılmış veya alıcı şirketten ayrılmış.
- **5.7.1 (Access denied / SPF fail):** Gönderen IP SPF kaydında yok veya e-posta spam filtresine takılmış.
- **5.2.2 (Mailbox full):** Alıcının posta kutusu kotası dolmuş.
- SPF, DKIM ve DMARC kayıtlarını doğrulamak için `nslookup -type=TXT firma.com` sorgusu yap.

## 4.3 Senaryo: "Kullanıcı şüpheli e-postadaki linke tıkladı (Phishing)"
1. [Adım 1 - İzolasyon]: Bilgisayarın ağ kablosunu çek veya Wi-Fi'ı kapat (Cihazı kapatma, bellek kanıtı kaybolmasın!).
2. [Adım 2 - Kimlik Güvenliği]: Kullanıcının şifresini Active Directory / Entra ID üzerinden hemen değiştir ve tüm aktif oturumlarını zorla sonlandır (Revoke Sessions).
3. [Adım 3 - E-posta Analizi]: E-postanın başlık (Header) bilgilerini al: Gönderen IP, SPF/DKIM durumu ve tıklanan zararlı URL'yi tespit et.
4. [Adım 4 - Kurum Koruması]: Tıklanan zararlı URL'yi kurumsal firewall ve EDR üzerinde kara listeye (Blacklist) ekle; şirketteki diğer kullanıcılara gelen aynı e-postaları Exchange Message Trace ile bulup sil.
5. Detaylı adli analiz adımları için [Güvenlik ve Olay Müdahale Rehberi](03-guvenlik-olay-mudahale-rehberi.md).

---

# 5. WINDOWS VE İSTEMCİ SENARYOLARI

## 5.1 Senaryo: "Bilgisayar aşırı yavaşladı"
1. Görev Yöneticisi (`Ctrl+Shift+Esc`): CPU, RAM veya Disk %100 mü?
2. Disk %100 ise: Windows Update arka planda takılmış olabilir veya mekanik HDD ömrünü tamamlamaktadır.
3. Başlangıç programlarını devre dışı bırak (Startup sekmesi).
4. Bozuk sistem dosyalarını onar:
   ```cmd
   sfc /scannow
   DISM /Online /Cleanup-Image /RestoreHealth
   ```
5. Disk sağlığı kontrolü: PowerShell'de `wmic diskdrive get status` veya CrystalDiskInfo ile SMART verilerine bak. HDD ise SSD'ye yükseltmek en kesin çözümdür.

## 5.2 Senaryo: "Bu iş istasyonu ile etki alanı arasındaki güven ilişkisi başarısız"
Bilgisayarın etki alanı makine hesabı parolası DC ile senkronize değil.
```powershell
# Yönetici yetkili PowerShell ile onarma:
Test-ComputerSecureChannel -Repair -Credential (Get-Credential)

# Alternatif komut:
Reset-ComputerMachinePassword -Credential firma\domainadmin
```
Komut başarısız olursa: Yerel yönetici (Local Admin) ile oturum aç, bilgisayarı WORKGROUP'a al, yeniden başlat ve tekrar domaine dahil et.

## 5.3 Senaryo: "BitLocker kurtarma anahtarı (Recovery Key) istiyor"
1. Kullanıcının kimliğini doğrula.
2. 48 haneli kurtarma anahtarını Microsoft Entra ID (Azure AD), Intune veya Active Directory Users and Computers (Cihaz Özellikleri > BitLocker Recovery) üzerinden bul.
3. Neden tetiklendiğini araştır: BIOS güncellemesi yapıldı mı, harici USB takılıyken mi açıldı, anakart/TPM arızası mı var?
4. Detaylar için [İstemci ve Donanım Rehberi](08-istemci-donanim-windows-rehberi.md).

---

# 6. DONANIM, UPS VE VERİ MERKEZİ SENARYOLARI

## 6.1 Senaryo: "Sistem odasından / kabinetten sürekli acı bir bip sesi geliyor"
1. **UPS Alarmı mı?** UPS ekranına bak:
   - "Replace Battery" veya akü simgesi kırmızı yanıp sönüyorsa akü ömrü bitmiştir.
   - "Overload" uyarısı varsa UPS kapasitesi aşılmıştır; acil olmayan yükleri devreden çıkar.
   - Şebeke elektriği kesilmiş ve jeneratör devreye girmemiş olabilir.
2. **Sunucu Alarmı mı?** Sunucuların ön panelindeki LED'lere bak:
   - Kehribar (Amber/Turuncu) yanıp sönen disk veya güç kaynağı LED'i var mı?
   - Sunucunun iDRAC / iLO arayüzüne bağlanıp "System Event Log (SEL)" kayıtlarını oku.
3. Fiziksel altyapı standartları için [11-veri-merkezi-donanim-ups-kablolama-rehberi.md](11-veri-merkezi-donanim-ups-kablolama-rehberi.md) dokümanını incele.

## 6.2 Senaryo: "Sunucuda turuncu disk arıza ışığı yanıyor / RAID Degraded oldu"
1. **Asla Panik Yapıp Sunucuyu Kapatma!** Modern kurumsal sunucular Hot-Swap destekler.
2. iDRAC/iLO veya RAID yönetim yazılımına (MegaRAID, PERC CLI) girip hangi yuvadaki (Slot) diskin "Failed" olduğunu teyit et.
3. **Acil Yedek:** Kritik verilerin en güncel yedeğinin alındığından emin ol (Rebuild sırasında ikinci bir diskin bozulma riski vardır!).
4. Aynı model, boyutta ve hızda (RPM) yeni diski tak. RAID denetleyicisi otomatik olarak "Rebuild" sürecini başlatacaktır.
5. Rebuild tamamlanana kadar sunucuya ağır disk yazma yükü bindirme.

---

# 7. ÖRNEK PROFESYONEL TICKET KAYDI

```
Çağrı No: #IT-2026-8842
Talep Eden: Ahmet Yılmaz / Finans
Öncelik: Yüksek (P2 - Departman çalışamıyor)
Konu: Şube VPN tüneli koptu, ERP sunucusuna erişilemiyor

[Belirti]:
Şube çalışanları 14:15 itibarıyla merkezdeki ERP sunucusuna (10.10.1.20) bağlanamadıklarını bildirdi.

[Yapılan İnceleme ve Teşhis]:
1. Şube internet bağlantısı kontrol edildi; internete çıkışta sorun yok (ping 8.8.8.8 başarılı).
2. Merkez FortiGate firewall üzerinde IPsec tünel durumu kontrol edildi: Tünel "Down" durumdaydı.
3. IKE logları incelendi (`diagnose vpn ike log filter`): Karşı tarafın dinamik IP'si değiştiği için Phase 1 DPD zaman aşımına düşmüş.

[Uygulanan Çözüm]:
- Şube modeminin Dynamic DNS (DDNS) kaydı güncellendi.
- Merkez güvenlik duvarında IPsec tünel yeniden tetiklendi (`diagnose vpn ike restart`).
- Tünel "Up" durumuna geçti. Şube bilgisayarından 10.10.1.20 IP'sine erişim ve RDP testi başarıyla sağlandı.

[Alınan Önlem / Kök Neden]:
Şube internet hattı dinamik IP olduğu için kopma yaşanmıştır. ISP ile görüşülerek şubeye statik IP tahsis edilmesi için talep açıldı.
```

> **Altın Kural:** Sorunu yalnızca geçici olarak düzeltmek "teknisyenliktir"; kök nedeni bulup tekrarlanmasını engellemek "yöneticiliktir".
