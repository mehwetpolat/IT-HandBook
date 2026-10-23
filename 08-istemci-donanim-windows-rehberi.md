# İstemci, Donanım ve Windows Yönetimi Rehberi

Çalışan bilgisayarlarının kurulumu, bakımı ve sorun giderilmesi: imaj, sürücü, güncelleme, şifreleme, donanım teşhisi ve uzak destek.

---

# 1. WINDOWS KURULUMU

## 1.1 Temiz kurulum adımları
1. **Yedek al** (kullanıcı verisi, lisans/anahtarlar, tarayıcı profili).
2. Windows ISO'sunu resmi kaynaktan indir (Media Creation Tool), USB'ye yaz (Rufus/MCT).
3. BIOS/UEFI: **Boot** sırası USB, **Secure Boot** ve **TPM 2.0** açık (Windows 11 için).
4. Kurulum sırasında diski bölümlendir; eski verileri silmeden önce emin ol.
5. Bilgisayar adı ver (standart isimlendirme), yönetici hesabını yapılandır.
6. Windows Update + üretici sürücüleri.
7. Domain/Entra ID'ye katıl, politika ve uygulamalar gelsin.
8. Envantere kaydet, zimmet tutanağı hazırla.

## 1.2 İsimlendirme örneği
`<Konum>-<Tür>-<Seri/No>` → `IST-LT-0042` (İstanbul, Laptop, 42). Standardı **ilk günden** belirle.

## 1.3 Toplu kurulum yöntemleri
| Yöntem | Ne zaman |
|---|---|
| Elle kurulum | Tek tük cihaz, lab |
| Referans imaj (Sysprep + WIM) | Aynı donanımda çok cihaz |
| **Windows Autopilot** (Intune) | Modern, imajsız, uzaktan dağıtım |
| MDT/SCCM/Configuration Manager | Büyük şirket içi altyapı |
| Provizyon paketi (PPKG) | Küçük ortamlar, hızlı yapılandırma |

---

# 2. SÜRÜCÜ VE GÜNCELLEME YÖNETİMİ

## 2.1 Sürücü
- Önce **üretici sürücüsü** (Dell, HP, Lenovo vb. destek sayfaları ve araçları).
- Aygıt Yöneticisi'nde sarı ünlem olan aygıtları kontrol et.
- Sorunlu sürücü: **Sürücüyü geri al** ya da kaldırıp yeniden yükle.
- Kurumsal ortamda sürücü paketlerini merkezi dağıt.

```
pnputil /enum-drivers          # Yüklü sürücüler
driverquery                    # Sürücü listesi
```

## 2.2 Windows Update stratejisi
- Güncellemeleri **halkalara (ring)** böl: Pilot (IT) → Erken kullanıcılar → Tüm şirket.
- Kritik güvenlik güncellemelerini hızlı uygula, özellik güncellemelerini test ettikten sonra.
- Mesai içinde zorunlu yeniden başlatmalardan kaçın; **aktif saat** tanımla.
- Intune **Update Rings** veya WSUS/Windows Update for Business kullan.

```
Get-HotFix
Get-WindowsUpdateLog
usoclient StartScan
```

**Güncelleme takılırsa:**
```
net stop wuauserv
net stop bits
ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
net start wuauserv
net start bits
```
Ardından `sfc /scannow` ve `DISM /Online /Cleanup-Image /RestoreHealth` çalıştır.

---

# 3. DİSK ŞİFRELEME VE VERİ KORUMA

## 3.1 BitLocker
- **TPM** ile otomatik açılır, kullanıcı fark etmez.
- Kurtarma anahtarlarını **merkezi yedekle** (AD veya Entra ID/Intune).
- Kullanıcıya anahtarı e-postayla gönderme; kimlik doğrulaması sonrası güvenli ilet.

```
manage-bde -status
manage-bde -protectors -get C:
# AD'ye yedek: manage-bde -protectors -adbackup C: -id {KeyProtectorID}
```

## 3.2 Diğer önlemler
- Uzaktan silme (Intune Wipe/Retire) süreci hazır olsun (kayıp/çalıntı laptop).
- USB depolama kısıtlamasını politikayla yönet.
- Tam disk şifreleme **dizüstülerde zorunlu** olmalı.
- Yerel yönetici hesabı için **LAPS** (parola rotasyonu) kullan.

---

# 4. YEREL YÖNETİM VE POLİTİKALAR

## 4.1 Yetki ilkeleri
- Kullanıcılara **standart yetki** ver, günlük işte yönetici olmasınlar.
- Yönetici işi için ayrı yönetici hesabı kullan (günlük hesaptan farklı).
- Yerel yönetici şifresi her cihazda benzersiz olsun (**LAPS / Windows LAPS**).

## 4.2 Sık kullanılan politika konuları
| Konu | Amaç |
|---|---|
| Şifre ve hesap kilitleme | Tahmin saldırılarını engelleme |
| Ekran kilidi zaman aşımı | Başıboş oturumu önleme |
| USB ve çıkarılabilir depolama | Veri sızıntısı |
| Windows Defender/Güvenlik Duvarı | Temel koruma zorunlu |
| Yazılım kısıtlama (AppLocker/WDAC) | Yetkisiz yazılımı engelleme |
| Başlangıç ve masaüstü | Tutarlı kullanıcı deneyimi |

```
gpresult /r            # Uygulanan politikalar
gpresult /h rapor.html # Detaylı HTML rapor
gpupdate /force
```

---

# 5. PERFORMANS VE SORUN GİDERME

## 5.1 Araçlar
| Araç | Kullanım |
|---|---|
| Görev Yöneticisi | Anlık CPU/RAM/Disk |
| Kaynak İzleyicisi (`resmon`) | Hangi süreç diski/ağı kullanıyor |
| Performans İzleyicisi (`perfmon`) | Uzun süreli sayaçlar |
| Olay Görüntüleyici (`eventvwr`) | Hata ve uyarı kayıtları |
| Güvenilirlik Geçmişi (`perfmon /rel`) | Çökme/hata zaman çizelgesi |
| Autoruns, Process Explorer | Sysinternals ile ayrıntılı analiz |
| Windows Memory Diagnostic (`mdsched`) | RAM testi |

## 5.2 Yavaşlık için kontrol sırası
1. Disk türü ve doluluğu (HDD mi, %90 dolu mu?)
2. Arka plan: antivirüs, güncelleme, OneDrive eşitleme
3. Başlangıç uygulamaları
4. RAM yeterli mi? (8 GB altı modern Windows için sınırda)
5. Isı ve güç planı (laptop yüksek performans/dengeli)
6. Zararlı yazılım

## 5.3 Bozuk Windows onarımı
```
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
chkdsk C: /f /r
```
Hâlâ olmazsa: **Bu bilgisayarı sıfırla** (verileri koru), olmazsa yedek alıp temiz kurulum.

---

# 6. DONANIM

## 6.1 Bileşenler ve belirtiler
| Bileşen | Arıza belirtisi | Kontrol |
|---|---|---|
| RAM | Mavi ekran, açılmama, bip | `mdsched`, tek modülle deneme |
| Disk (HDD/SSD) | Yavaşlık, tıkırtı, bozuk dosya | SMART, CrystalDiskInfo |
| Güç kaynağı/adaptör | Rastgele kapanma, şarj olmama | Başka adaptörle dene |
| Batarya | Hızlı bitme, şişme | `powercfg /batteryreport` |
| Isınma | Fan sesi, kapanma | Toz temizliği, termal macun |
| Ekran | Titreme, çizgi | Harici ekranla test |
| Ağ kartı | Bağlantı yok | Sürücü, başka adaptör |

```
powercfg /batteryreport     # Batarya sağlık raporu
wmic diskdrive get status   # Basit disk durumu
```

## 6.2 Yükseltme önerileri (en iyi fayda/maliyet)
1. HDD → **SSD** (en büyük hız farkı)
2. RAM 4 → 8/16 GB
3. Bakım: toz temizliği, termal macun
4. Eski laptopta batarya değişimi

## 6.3 Çevre birimleri
- **Monitör:** Doğru kablo (HDMI/DP), çözünürlük/yenileme hızı ayarı.
- **Dock:** Firmware ve sürücü güncel olsun; sorunların çoğu kablo veya firmware kaynaklıdır.
- **Yazıcı/tarayıcı:** Üretici sürücüsü, ağ IP'si, tarama klasörü izinleri (SMB).
- **Bluetooth:** Eşleşmeyi kaldırıp yeniden eşle, sürücüyü güncelle.

## 6.4 Garanti ve RMA
- Seri numarası ve servis etiketiyle garanti sorgula.
- Üretici destek ekibine hata kodu, yapılan testler ve ekran görüntüsüyle başvur.
- Cihazı göndermeden **veriyi yedekle/şifrele** ve varsa disk iadesi seçeneğini değerlendir.

---

# 7. UZAK DESTEK

## 7.1 Araçlar
| Araç | Not |
|---|---|
| Hızlı Yardım (Quick Assist) | Windows ile gelir, tek seferlik |
| RDP (`mstsc`) | Aynı ağda/VPN ile kurumsal bilgisayarlara |
| Intune uzaktan yardım (Remote Help) | M365 ortamında rızaya dayalı |
| TeamViewer/AnyDesk/RustDesk | Üçüncü parti, kurum politikasına uygun olmalı |
| PowerShell Remoting | Betikle toplu müdahale |

## 7.2 Uzak destek etiği ve güvenliği
- Kullanıcının **açık onayını** al, oturum süresince ne yaptığını anlat.
- Kullanıcının kişisel verilerine (e-posta, dosyalar) gereksiz bakma.
- Oturumu bitirince bağlantıyı kapat, erişim kodunu paylaşma.
- Müşteri/kullanıcının kimliğini doğrula (sahte destek aramaları yaygındır).

```
# PowerShell Remoting
Enter-PSSession -ComputerName PC01
Invoke-Command -ComputerName PC01,PC02 -ScriptBlock { Get-Service Spooler }
```

---

# 8. YAZILIM DAĞITIMI

| Yöntem | Not |
|---|---|
| Intune (Win32 / Microsoft Store) | Bulut tabanlı, uzaktan çalışan cihazlar için ideal |
| GPO yazılım dağıtımı (MSI) | Domain ortamında basit |
| SCCM/MECM | Büyük kurumsal |
| **winget** | Komut satırı paket yöneticisi |
| Chocolatey | Betikle dağıtım için popüler |

```
winget search vlc
winget install --id VideoLAN.VLC -e
winget upgrade --all
```

**İlkeler:** Lisansları takip et, yetkisiz yazılımı kısıtla, standart yazılım listesi oluştur, sessiz kurulum parametrelerini dokümante et.

---

# 9. KULLANICI PROFİLİ VE VERİ TAŞIMA

## 9.1 Yeni bilgisayara geçiş kontrol listesi
- [ ] Masaüstü, Belgeler, İndirilenler (veya OneDrive Known Folder Move)
- [ ] Tarayıcı yer imleri ve parolalar (hesap eşitleme)
- [ ] Outlook profili / imza / PST dosyaları
- [ ] Yazıcılar ve ağ sürücüleri
- [ ] Özel uygulamalar ve lisans anahtarları
- [ ] Eski cihazın güvenli silinmesi (format/sıfırlama)

## 9.2 Araçlar
- **OneDrive Known Folder Move:** Kullanıcı klasörlerini buluta yönlendirir, cihaz değişimini kolaylaştırır.
- `robocopy`: Büyük veri kopyası, izinleri ve zaman damgalarını korur.

```
robocopy C:\Users\ali D:\Yedek\ali /E /COPYALL /R:2 /W:2 /LOG:C:\kopya.log
```

---

# 10. CİHAZ YAŞAM DÖNGÜSÜ VE ELDEN ÇIKARMA

| Aşama | Yapılacak |
|---|---|
| Satın alma | Standart modeller, garanti, uyumluluk |
| Hazırlık | İmaj/Autopilot, etiketleme, envanter |
| Kullanım | Güncellemeler, bakım, zimmet takibi |
| Yenileme | Genelde 3–5 yıl, bataryalı cihazlarda batarya sağlığı |
| Elden çıkarma | **Güvenli silme**, zimmet kapatma, geri dönüşüm/e-atık |

**Güvenli silme:** SSD'lerde "format" yeterli değildir; şifreli disk + kriptografik silme veya üretici güvenli silme aracını kullan. Hassas verili disklerde fiziksel imha değerlendirilebilir. Silme işlemini **tutanakla** kayıt altına al.

---

# 11. HIZLI KONTROL KARTI

| Soru | Cevap |
|---|---|
| Bilgisayar yavaş | Görev Yöneticisi → disk/RAM → başlangıç → SFC/DISM |
| Güncelleme takıldı | SoftwareDistribution sıfırla, wuauserv/bits |
| Sürücü sorunu | Sürücüyü geri al / üreticiden yeniden yükle |
| BitLocker anahtar istiyor | Entra ID/AD'den kurtarma anahtarı, kimlik doğrula |
| Domain güveni bozuk | `Test-ComputerSecureChannel -Repair` |
| Batarya hızlı bitiyor | `powercfg /batteryreport` |
| Disk bozuk şüphesi | SMART kontrol, **önce yedek** |
