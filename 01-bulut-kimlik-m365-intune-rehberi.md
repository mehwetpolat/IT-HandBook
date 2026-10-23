# Bulut ve Kimlik Yönetimi Rehberi
**Microsoft 365 · Entra ID · Exchange Online · Intune · Azure Temelleri**

Günümüzde birçok firmada kullanıcı, posta ve cihaz yönetimi artık bulutta yapılıyor. Bu rehber, IT destek olarak günlük işlerde hızlıca bakacağın notları içerir.

> Portal arayüzleri ve menü isimleri sık değişir. Menü birebir aynı değilse arama kutusunu kullan. Komut ve kavramlar daha kalıcıdır.

---

## 1. Büyük Resim

| Ürün | Ne işe yarar |
|---|---|
| **Microsoft 365** | Lisans paketi: Office uygulamaları, Exchange (posta), Teams, SharePoint, OneDrive |
| **Entra ID** (eski adı Azure AD) | Bulut kimlik servisi: kullanıcılar, gruplar, MFA, oturum açma, Conditional Access |
| **Exchange Online** | Bulut e-posta sunucusu |
| **Intune** | Cihaz ve uygulama yönetimi (MDM/MAM): bilgisayar, telefon, tablet |
| **Defender** | Güvenlik: antivirüs, e-posta koruması, uç nokta güvenliği |
| **Azure** | Genel bulut platformu: sanal makine, depolama, ağ |

**Mantık:** Kullanıcı Entra ID'de tanımlanır → lisans atanır → lisansa göre servisler (posta, Teams, OneDrive) açılır → cihaz Intune ile yönetilir.

## 2. Yönetim Portalları

| Portal | Adres | Kullanım |
|---|---|---|
| Microsoft 365 admin center | `admin.microsoft.com` | Kullanıcı, lisans, faturalama |
| Entra admin center | `entra.microsoft.com` | Kimlik, MFA, gruplar, oturum günlükleri |
| Exchange admin center | `admin.exchange.microsoft.com` | Posta kutuları, mail akışı |
| Intune admin center | `intune.microsoft.com` | Cihaz, uygulama, politika |
| Teams admin center | `admin.teams.microsoft.com` | Teams ayarları |
| Defender portalı | `security.microsoft.com` | Güvenlik, karantina, olaylar |
| Azure portalı | `portal.azure.com` | Azure kaynakları |
| Kullanıcı hesabım | `myaccount.microsoft.com` | Kullanıcının kendi güvenlik ayarları |

## 3. Günlük Kullanıcı İşleri

| İş | Nerede / Nasıl | Not |
|---|---|---|
| Yeni kullanıcı | M365 admin > Users > Active users > Add a user | Önce **kullanım konumu (usage location)** seçilmeli, yoksa lisans atanmaz |
| Lisans atama/alma | Kullanıcı > Licenses and apps | Lisans boşaltınca posta kutusu silinebilir, dikkat (bkz. Bölüm 5) |
| Şifre sıfırlama | Kullanıcı > Reset password | Kimlik doğrulamayı unutma |
| MFA sıfırlama | Entra > Users > kullanıcı > Authentication methods > **Require re-register MFA** ve **Revoke MFA sessions** | Telefon kaybında |
| Hesabı engelleme | Kullanıcı > Block sign-in | Silmek yerine önce engelle |
| Gruba ekleme | Kullanıcı > Groups, ya da grup > Members | Dinamik grupta elle ekleme olmaz |
| Takma e-posta (alias) | Kullanıcı > Manage username and email | |
| Silinen kullanıcıyı geri alma | Users > Deleted users | Silindikten sonra yaklaşık 30 gün içinde |
| Yönetici rolü verme | Kullanıcı > Assigned roles | **En az yetki:** gerekmedikçe Global Admin verme |

## 4. İşe Giriş (Onboarding) Adımları

1. Yöneticiden onay ve bilgi al (ad, departman, başlangıç tarihi, yönetici, hangi erişimler).
2. Kullanıcıyı oluştur, doğru **grupları** ekle (izinler gruplarla verilir).
3. Lisansı ata (kullanım konumunu unutma).
4. İlk şifreyi güvenli ilet (ilk girişte değiştirme zorunlu), MFA kaydını yaptır.
5. Posta kutusu, Teams, ortak klasör ve gerekli uygulama erişimlerini ver.
6. Bilgisayarı hazırla (Autopilot ya da elle kurulum), Intune'a kaydet.
7. Kullanıcıya kısa bir kullanım notu ve destek iletişim bilgisini ver.
8. Ticket'a yaz: ne verildi, ne zaman, kim onayladı.

## 5. İşten Ayrılma (Offboarding) Adımları

Sırayla:
1. **Hesabı engelle** (Block sign-in) ve **oturumları sonlandır** (Revoke sessions).
2. Şifreyi sıfırla (bilinmeyen rastgele bir şifre).
3. MFA yöntemlerini kaldır.
4. Posta kutusunu **Shared mailbox**'a çevir, **sonra** lisansı al (posta kutusu verisi korunur, 50 GB'a kadar lisans gerekmez).
5. Gerekirse e-postayı yöneticiye devret (yetki ver) ya da yönlendir.
6. Gruplardan çıkar, ekip/dosya sahipliğini devret (Teams, SharePoint).
7. OneDrive verisini yöneticiye devret (kullanıcı silinince OneDrive belirli süre saklanır, varsayılan 30 gün).
8. Cihazı geri al, Intune'dan **Retire** veya **Wipe** yap.
9. Telefon, kart, anahtar, VPN, üçüncü taraf uygulama erişimlerini kapat.
10. Bir süre sonra (kurum politikasına göre) hesabı sil.

## 6. Entra ID Kavramları

| Kavram | Anlamı |
|---|---|
| Tenant | Firmanın bulut kimlik alanı (örn. `firma.onmicrosoft.com`) |
| Kullanıcı türleri | Member (çalışan), Guest (dış kullanıcı/misafir) |
| Gruplar | Security grup (izin), Microsoft 365 grup (Teams/ortak posta ile), Dynamic (kurala göre otomatik) |
| Roller | Global Administrator, User Administrator, **Helpdesk Administrator**, Password Administrator, Exchange Administrator |
| MFA | Şifrenin yanında ikinci doğrulama (uygulama bildirimi, kod, FIDO anahtarı) |
| SSPR | Kullanıcının şifresini kendi sıfırlaması (Self-Service Password Reset) |
| Conditional Access | Koşullu erişim: "Ofis dışından giriş için MFA şart", "uyumsuz cihaz erişemez" |
| Cihaz türleri | Entra joined (sadece bulut), Hybrid joined (hem yerel AD hem Entra), Registered (kişisel cihaz) |
| Entra Connect | Yerel AD ile Entra ID arasında kullanıcı/şifre eşitleme aracı |

**Eşitlemeyi hemen başlatma (Entra Connect sunucusunda):**
```powershell
Start-ADSyncSyncCycle -PolicyType Delta
```

**Oturum açma sorunlarında ilk bakılacak yer:**
Entra admin center > **Monitoring > Sign-in logs**. Kullanıcıyı filtrele; hatanın nedenini (MFA, Conditional Access, yanlış şifre, engelli hesap) orada görürsün.

## 7. Exchange Online İşleri

| İş | Nasıl |
|---|---|
| Paylaşılan posta kutusu | EAC > Recipients > Mailboxes > Add a shared mailbox |
| Yetki verme | Mailbox > Delegation: **Read and manage** (Full Access), **Send as**, **Send on behalf** |
| E-posta yönlendirme | Mailbox > Mail flow settings > Email forwarding |
| Otomatik yanıt (OOF) | Kullanıcı Outlook'tan ya da yönetici EAC'den |
| Dağıtım listesi | Recipients > Groups |
| Posta izleme | Mail flow > **Message trace** (mail nerede kaldı?) |
| Karantina | `security.microsoft.com` > Email & collaboration > Review > Quarantine |
| Silinen öğeleri kurtarma | Outlook > Deleted Items > "Recover items recently removed" |

**PowerShell (Exchange Online):**
```powershell
Connect-ExchangeOnline
Get-Mailbox -Identity ali@firma.com
Set-Mailbox ali@firma.com -Type Shared
Add-MailboxPermission -Identity ortak@firma.com -User ali@firma.com -AccessRights FullAccess -AutoMapping $true
Add-RecipientPermission -Identity ortak@firma.com -Trustee ali@firma.com -AccessRights SendAs
Set-Mailbox ali@firma.com -ForwardingSmtpAddress yonetici@firma.com -DeliverToMailboxAndForward $true
Get-MailboxStatistics ali@firma.com | Select DisplayName, TotalItemSize
```

## 8. Teams, SharePoint, OneDrive

- **Teams:** Ekip (Team) → kanallar; bir Team arkada bir Microsoft 365 grubudur, sahip/üye ayrımı vardır. Sahipsiz kalan ekibe sahip ata.
- **SharePoint:** Site koleksiyonları ve kitaplıklar. İzni mümkünse **gruplara** ver, tek tek kullanıcıya değil.
- **OneDrive:** Kişisel depolama; **Known Folder Move** ile Masaüstü/Belgeler/Resimler otomatik OneDrive'a yedeklenir.
- **Paylaşım sorunu:** Dış paylaşım yönetici tarafından kapatılmış olabilir (SharePoint admin center > Policies > Sharing).

## 9. Intune (Cihaz Yönetimi)

### 9.1 Kayıt yöntemleri
| Yöntem | Ne zaman |
|---|---|
| **Autopilot** | Yeni cihaz kutudan çıkar, kullanıcı giriş yapar, ayarlar ve uygulamalar otomatik gelir |
| Elle kayıt | Ayarlar > Hesaplar > İş veya okul erişimi > Bağlan |
| Toplu kayıt (bulk) | Çok sayıda cihaz için paket |
| BYOD | Kişisel telefon, sınırlı yönetim (uygulama koruma) |

**Autopilot için** cihazın donanım karması (hardware hash) Intune'a eklenir. Üretici/bayi de ekleyebilir.

### 9.2 Temel bileşenler
| Bileşen | Görevi |
|---|---|
| Compliance policy | "Uyumlu cihaz" kuralları: BitLocker açık, antivirüs aktif, minimum işletim sistemi |
| Configuration profile | Ayarları dağıtma: Wi-Fi, VPN, güvenlik duvarı, masaüstü kısıtları |
| App deployment | Uygulama dağıtımı: Microsoft Store, Win32 (`.intunewin` paketi), M365 Apps |
| Update rings | Windows güncellemelerinin ne zaman/nasıl uygulanacağı |
| Company Portal | Kullanıcının kendi uygulamalarını yüklediği/cihazını gördüğü uygulama |

### 9.3 Uzaktan işlemler (cihaz > actions)
| İşlem | Anlamı |
|---|---|
| Sync | Cihazı politikaları hemen çekmeye zorlar (ilk deneyeceğin şey) |
| Restart | Uzaktan yeniden başlat |
| Remote lock | Cihazı kilitle |
| **Retire** | Firma verisini ve yönetimi kaldırır, kişisel veriye dokunmaz |
| **Wipe** | Cihazı fabrika ayarlarına döndürür (çalıntı/kayıp, devir) |
| Fresh Start | Windows'u yeniler, yönetimi korur |
| Collect diagnostics | Tanılama günlüğü toplar |

**Wipe geri dönüşsüzdür**, onay almadan çalıştırma.

### 9.4 BitLocker kurtarma anahtarı
Kullanıcı kurtarma anahtarı isterse: Entra/Intune > Devices > cihaz > **Recovery keys** ya da kullanıcı kendi hesabında `myaccount.microsoft.com` > Devices. Kimliği doğrulamadan anahtarı verme.

## 10. Sık Sorunlar ve İlk Adımlar

| Belirti | Kontrol / Çözüm |
|---|---|
| Kullanıcı giriş yapamıyor | Sign-in logs; hesap engelli mi, şifre/MFA, Conditional Access, lisans |
| Outlook sürekli şifre soruyor | Windows Kimlik Bilgisi Yöneticisi'nde Office/Outlook kayıtlarını sil, oturumu kapatıp aç, gerekirse profili yeniden oluştur |
| Mail gelmiyor | Message trace, karantina, posta kutusu dolu mu, gönderici engelli mi, mail flow kuralları |
| Mail gönderemiyor | Alıcı adresi, kutu doluluğu, gönderme limiti, hesap ele geçirilmiş olabilir (spam gönderimi) |
| OneDrive eşitlemiyor | Disk dolu mu, dosya adı/yol çok uzun mu, simge hatası; sıfırlama: `%localappdata%\Microsoft\OneDrive\onedrive.exe /reset` |
| Teams açılmıyor/donuyor | Çıkış yap, önbelleği temizle, web sürümünü test et, güncelle |
| MFA telefonu kayıp | Kimliği doğrula, MFA'yı sıfırla (Bölüm 3), oturumları iptal et, yeni kayıt yaptır |
| "Lisans atanamıyor" | Kullanım konumu seçili mi, boş lisans var mı |
| Cihaz "uyumsuz" görünüyor | Cihazı Sync et; Compliance sekmesinde hangi kural başarısız bak (BitLocker, antivirüs, güncelleme) |
| Uygulama Intune'dan inmiyor | Cihaz internete bağlı mı, kullanıcı gruba dahil mi, atama türü (Required/Available) |
| Şirket hesabı eklenmiyor | Tarih/saat, ağ, kullanıcı cihaz limiti, eski kayıt (cihazı Entra'dan sil, yeniden ekle) |

## 11. PowerShell ile Yönetim (Microsoft Graph)

Eski `AzureAD` ve `MSOnline` modülleri kullanımdan kalkıyor, yerine **Microsoft Graph PowerShell** kullanılır.

```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
Connect-MgGraph -Scopes "User.ReadWrite.All","Group.ReadWrite.All"

Get-MgUser -All | Select DisplayName, UserPrincipalName, AccountEnabled
Get-MgUser -UserId ali@firma.com | Format-List
Update-MgUser -UserId ali@firma.com -AccountEnabled:$false      # Hesabı engelle
Revoke-MgUserSignInSession -UserId ali@firma.com                  # Oturumları sonlandır
Get-MgUserLicenseDetail -UserId ali@firma.com                     # Lisansları gör
Disconnect-MgGraph
```
Toplu işlemlerde önce 1-2 kullanıcıyla test et.

## 12. Lisans Mantığı (Kısa)

| Paket | Genel içerik |
|---|---|
| Business Basic | Web/mobil Office, Exchange, Teams, OneDrive |
| Business Standard | Basic + masaüstü Office uygulamaları |
| Business Premium | Standard + gelişmiş güvenlik + Intune/cihaz yönetimi |
| E3 / E5 | Kurumsal paketler, E5'te gelişmiş güvenlik ve analiz |

Fiyat ve içerik zamanla değişir, kesin bilgi için Microsoft'un güncel lisans sayfasına bak.

## 13. Azure ve Bulut Temelleri

| Kavram | Anlamı |
|---|---|
| IaaS / PaaS / SaaS | Altyapı (VM) / Platform (uygulama ortamı) / Yazılım (M365 gibi hazır hizmet) |
| Paylaşılan sorumluluk | Bulut sağlayıcı altyapıyı, **sen** verini, hesaplarını ve ayarlarını korursun |
| Subscription | Faturalama ve yönetim kapsamı |
| Resource Group | İlişkili kaynakların kutusu (VM, disk, ağ) |
| VM | Bulutta sanal sunucu |
| Storage Account | Blob, dosya, kuyruk, tablo depolama |
| VNet / NSG | Sanal ağ / ağ güvenlik kuralları |
| Region / Availability Zone | Coğrafi bölge / bölge içi fiziksel ayrım |
| RBAC | Rol tabanlı yetkilendirme (Owner, Contributor, Reader) |
| Cost Management | Harcama takibi, bütçe uyarısı (**kullanılmayan VM'i kapat/sil**) |

## 14. Öğrenme ve Sertifika Yolu

| Sertifika | Konu | Seviye |
|---|---|---|
| MS-900 | Microsoft 365 temelleri | Başlangıç |
| AZ-900 | Azure temelleri | Başlangıç |
| SC-900 | Güvenlik, uyumluluk, kimlik temelleri | Başlangıç |
| MD-102 | Endpoint Administrator (Intune) | Orta |
| SC-300 | Identity and Access Administrator (Entra) | Orta |
| AZ-104 | Azure Administrator | Orta |

Sınav kodları ve içerikler değişebilir, güncel durumu Microsoft Learn'den doğrula. Microsoft Learn ücretsiz eğitim yolları sunar.

**Pratik:** M365 deneme (trial) kiracısı aç, kullanıcı/grup/lisans/MFA/Intune kaydını kendin dene. Deneme ve geliştirici programı koşulları değişebilir, güncel durumu kontrol et.

## 15. Hızlı Kontrol Kartı

- Kullanıcı sorunu → **Sign-in logs**
- Mail sorunu → **Message trace**
- Cihaz sorunu → **Intune > Sync**, compliance detayı
- Lisans sorunu → **Kullanım konumu** + boş lisans
- Güvenlik şüphesi → Şifre sıfırla + **Revoke sessions** + mail kurallarına bak (gizli yönlendirme)
- Her işlemi ticket'a yaz
