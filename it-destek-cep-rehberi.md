# IT Destek Cep Rehberi: Ağ, Sistem, Altyapı

IT destek ve sistem yönetimi çalışanları için hızlı başvuru notları. Önce neyi kontrol edeceğini, sonra hangi komutu yazacağını bul. Yeni başlayanlar için öğretici, deneyimliler için hatırlatıcı olacak şekilde hazırlanmıştır.

> **Altın kurallar**
> 1. Değiştirmeden önce mevcut durumu not al (ekran görüntüsü, `ipconfig /all`, config yedeği).
> 2. Aynı anda tek şey değiştir, sonra test et.
> 3. Yetkin olmayan, geri dönüşü olmayan işi (silme, format, toplu değişiklik) onaysız yapma.
> 4. Her işlemi ticket'a yaz: ne gördün, ne yaptın, sonuç ne oldu.

---

# 1. SORUN GİDERME YAKLAŞIMI

## 1.1 Önce sorular (kullanıcıya)
- Tam olarak ne oluyor? Hata mesajı var mı? (ekran görüntüsü iste)
- Ne zaman başladı? Öncesinde ne değişti? (güncelleme, yeni program, taşınma)
- Sadece sende mi, başkalarında da var mı?
- Daha önce çalışıyor muydu?
- Bilgisayarı yeniden başlattın mı?

## 1.2 Katman katman ilerle (OSI mantığı)
| Sıra | Kontrol | Nasıl |
|---|---|---|
| 1. Fiziksel | Kablo, port ışığı, Wi-Fi bağlı mı | Kabloyu çıkar tak, başka porta tak |
| 2. Ağ bağlantısı | IP alıyor mu | `ipconfig` |
| 3. Yerel ağ | Gateway'e ulaşıyor mu | `ping gateway` |
| 4. İnternet | Dışarı çıkıyor mu | `ping 8.8.8.8` |
| 5. İsim çözümleme | DNS çalışıyor mu | `ping google.com`, `nslookup google.com` |
| 6. Uygulama | Servis/program çalışıyor mu | Port testi, servis kontrolü |

**Yorumlama:**
- IP yok / `169.254.x.x` → DHCP'ye ulaşılamıyor
- Gateway'e ping yok → yerel ağ/kablo/switch/VLAN sorunu
- `8.8.8.8` var, `google.com` yok → DNS sorunu
- İkisi de var, site açılmıyor → proxy, tarayıcı, güvenlik duvarı

---

# 2. AĞ KOMUTLARI (Windows)

| Komut | Ne yapar |
|---|---|
| `ipconfig` | IP, maske, gateway |
| `ipconfig /all` | MAC, DHCP sunucusu, DNS, kira süresi (en çok işe yarayan) |
| `ipconfig /release` + `ipconfig /renew` | DHCP'den yeni IP al |
| `ipconfig /flushdns` | DNS önbelleğini temizle |
| `ipconfig /displaydns` | DNS önbelleğini göster |
| `ping adres` | Erişim testi |
| `ping -t adres` | Sürekli ping (Ctrl+C ile dur) |
| `ping -n 20 adres` | 20 paket gönder |
| `tracert adres` | Paketin geçtiği yolu göster |
| `pathping adres` | Tracert + kayıp analizi (uzun sürer) |
| `nslookup alan.adi` | DNS sorgusu |
| `nslookup alan.adi 8.8.8.8` | Belirli DNS sunucusundan sorgula |
| `arp -a` | IP-MAC tablosu |
| `netstat -ano` | Açık bağlantılar ve portlar + PID |
| `netstat -ano \| findstr :80` | 80 portunu kullanan işlem |
| `tasklist \| findstr PID` | PID'den program adını bul |
| `route print` | Yönlendirme tablosu |
| `netsh wlan show profiles` | Kayıtlı Wi-Fi'lar |
| `netsh int ip reset` | TCP/IP yığınını sıfırla (yeniden başlatma gerekir) |
| `netsh winsock reset` | Winsock'u sıfırla (yeniden başlatma gerekir) |
| `getmac` | MAC adresi |
| `hostname` | Bilgisayar adı |

**Port testi (PowerShell):**
```powershell
Test-NetConnection sunucu -Port 443
Test-NetConnection 192.168.1.20 -Port 3389
```
`TcpTestSucceeded : True` ise port açık ve erişilebilir.

**IP sorunu 3 adımlık hızlı çözüm:**
```
ipconfig /release
ipconfig /flushdns
ipconfig /renew
```

---

# 3. IP, SUBNET VE VLAN ÖZETİ

## 3.1 Özel (private) IP aralıkları
| Aralık | Sınıf |
|---|---|
| 10.0.0.0 – 10.255.255.255 | A |
| 172.16.0.0 – 172.31.255.255 | B |
| 192.168.0.0 – 192.168.255.255 | C |
| 169.254.0.0/16 | APIPA (DHCP bulunamadı) |
| 127.0.0.1 | Loopback (kendisi) |

## 3.2 Subnet hızlı tablo
| CIDR | Maske | Kullanılabilir host |
|---|---|---|
| /24 | 255.255.255.0 | 254 |
| /25 | 255.255.255.128 | 126 |
| /26 | 255.255.255.192 | 62 |
| /27 | 255.255.255.224 | 30 |
| /28 | 255.255.255.240 | 14 |
| /29 | 255.255.255.248 | 6 |
| /30 | 255.255.255.252 | 2 |
| /16 | 255.255.0.0 | 65.534 |

Kural: Host sayısı = 2^(host bitleri) − 2 (ağ ve broadcast adresi hariç).

## 3.3 Sık kullanılan portlar
| Port | Servis | Port | Servis |
|---|---|---|---|
| 20/21 | FTP | 110 | POP3 |
| 22 | SSH | 123 | NTP (UDP) |
| 23 | Telnet | 143 | IMAP |
| 25 | SMTP | 161/162 | SNMP (UDP) |
| 53 | DNS (UDP/TCP) | 389 | LDAP |
| 67/68 | DHCP (UDP) | 443 | HTTPS |
| 69 | TFTP (UDP) | 445 | SMB (dosya paylaşımı) |
| 80 | HTTP | 514 | Syslog (UDP) |
| 3389 | RDP (uzak masaüstü) | 3306 | MySQL |
| 1433 | MS SQL | 5432 | PostgreSQL |

---

# 4. SIK KARŞILAŞILAN SORUNLAR ve ÇÖZÜMLERİ

## 4.1 "İnternet yok"
1. Kablo/Wi-Fi bağlı mı? Uçak modu kapalı mı?
2. `ipconfig`: IP var mı? `169.254` ise DHCP sorunu → `ipconfig /renew`
3. `ping gateway`: gitmiyorsa kablo/port/VLAN
4. `ping 8.8.8.8`: gidiyor ama site açılmıyorsa DNS → `ipconfig /flushdns`, DNS'i elle `8.8.8.8` yap
5. Başkalarında da yoksa: switch, router, modem, hat sorunu
6. Proxy kontrolü: Ayarlar > Ağ > Proxy

## 4.2 "Bilgisayar yavaş"
1. Görev Yöneticisi (Ctrl+Shift+Esc): CPU, RAM, disk, hangi program?
2. Disk %100 ise: Windows Update, antivirüs taraması, arızalı disk olabilir
3. Başlangıç programlarını azalt (Görev Yöneticisi > Başlangıç)
4. Disk doluluk: `cleanmgr`, geçici dosyalar (`%temp%`)
5. Disk sağlığı: `wmic diskdrive get status`, `chkdsk C: /f` (yeniden başlatma ister)
6. RAM yetersizse artır, HDD ise SSD'ye geçmek en büyük farkı yaratır
7. Zararlı yazılım taraması yap

## 4.3 "Yazıcı çalışmıyor"
1. Yazıcı açık, kağıt/toner var mı, ekranda hata var mı?
2. Yazıcı ağda mı: yazıcının IP'sine `ping` at
3. Yazdırma kuyruğunda takılı iş: Hizmetler > **Print Spooler** > durdur
   ```
   net stop spooler
   del /Q /F /S "%systemroot%\System32\spool\PRINTERS\*.*"
   net start spooler
   ```
4. Sürücüyü kaldırıp yeniden yükle
5. Doğru yazıcı varsayılan mı, "çevrimdışı çalış" işaretli mi?
6. Ağ yazıcısını IP ile ekle (Standard TCP/IP Port): ad ile eklemeden daha kararlıdır
7. Yazıcıya sabit IP ver veya DHCP rezervasyonu yap

## 4.4 "Şifremi unuttum / hesap kilitlendi"
**Active Directory'de:**
- Active Directory Users and Computers (ADUC) > kullanıcıya sağ tık > **Reset Password**
- Kilitliyse **Unlock Account** kutusunu işaretle
- "User must change password at next logon" seçeneğini işaretle
- Kimlik doğrulaması yap (kullanıcı gerçekten o mu?). Telefonla gelen talepleri doğrulamadan işleme koyma, sosyal mühendislik riskidir.

**Yerel hesapta:**
```
net user kullaniciadi YeniSifre123!
net user kullaniciadi /active:yes
```

## 4.5 "Uzak masaüstüne bağlanamıyorum" (RDP)
1. Hedef bilgisayar açık mı, ağda mı? `ping`
2. Port açık mı? `Test-NetConnection IP -Port 3389`
3. Hedefte: Sistem > Uzak Masaüstü **açık** olmalı
4. Kullanıcı "Remote Desktop Users" grubunda mı?
5. Güvenlik duvarı 3389'u engelliyor olabilir
6. Win Home sürümü RDP sunucusu olamaz (Pro ve üstü gerekir)
7. Bağlantı komutu: `mstsc /v:IP`

## 4.6 "Paylaşılan klasöre erişemiyorum"
1. `ping sunucu`, sonra `\\sunucu` veya `\\IP` yaz
2. Kimlik bilgisi: Windows Kimlik Bilgisi Yöneticisi'nde eski kayıt varsa sil
3. İki izin katmanı vardır, **ikisi de** uygun olmalı: Paylaşım izni + NTFS (Güvenlik sekmesi)
4. Ağ sürücüsü bağlama: `net use Z: \\sunucu\paylasim /persistent:yes`
5. Mevcut bağlantıları gör/sil: `net use`, `net use * /delete`
6. SMB portu 445 engelli olabilir

## 4.7 "Outlook / e-posta sorunu"
1. İnternet var mı? Başka cihazdan webmail çalışıyor mu? (çalışıyorsa sunucu sorunu değil)
2. Outlook'u kapat, `outlook /safe` ile aç (eklenti sorunu mu)
3. Profili yeniden oluştur: Denetim Masası > Posta > Profilleri Göster
4. Posta kutusu dolu mu?
5. Şifre yakın zamanda değiştiyse kayıtlı şifreyi güncelle
6. OST dosyasını yeniden oluştur (eşitleme sorunlarında)

## 4.8 "Wi-Fi bağlanmıyor / sürekli kopuyor"
1. Wi-Fi sürücüsünü güncelle veya kaldırıp yeniden yükle
2. Ağı unut, yeniden bağlan
3. `netsh wlan show wlanreport` rapor oluşturur
4. Sinyal zayıfsa AP'ye yakınlaş, kanal çakışması olabilir
5. Güç tasarrufu: Aygıt Yöneticisi > Wi-Fi adaptörü > Güç Yönetimi > "Gücü korumak için kapatabilir" işaretini kaldır
6. 2.4 GHz / 5 GHz farkı: 5 GHz hızlı ama menzili kısa

## 4.9 "Mavi ekran (BSOD)"
1. Hata kodunu not al (örn. `IRQL_NOT_LESS_OR_EQUAL`, `0x0000007E`)
2. Yeni takılan donanım/sürücü/güncelleme var mı? Geri al
3. Güvenli modda aç (açılışta F8 veya Shift + Yeniden Başlat)
4. `sfc /scannow` ve `DISM /Online /Cleanup-Image /RestoreHealth`
5. RAM testi: `mdsched`
6. Olay Görüntüleyici ve `C:\Windows\Minidump` kayıtları
7. Disk (`chkdsk`) ve sıcaklık kontrolü

## 4.10 "Bilgisayar açılmıyor"
1. Güç kablosu, priz, ekran kablosu, ekran açık mı?
2. Bip sesi/ışık var mı? (BIOS bip kodları RAM/ekran kartı sorununu işaret eder)
3. Çevre birimlerini çıkar (USB, harici disk), sadece güç ve ekranla dene
4. Windows açılmıyorsa: kurtarma ortamı, Başlangıç Onarımı
5. Disk görünmüyorsa BIOS'ta kontrol et, kablo/disk arızası olabilir
6. Veri kritikse **format atmadan önce** diski çıkarıp başka bilgisayarla yedekle

---

# 5. WINDOWS SİSTEM YÖNETİMİ

## 5.1 Sistem bilgisi ve onarım
| Komut | Ne yapar |
|---|---|
| `systeminfo` | Sürüm, RAM, son güncelleme, açılış zamanı |
| `winver` | Windows sürümü |
| `msinfo32` | Ayrıntılı sistem bilgisi |
| `sfc /scannow` | Bozuk sistem dosyalarını onar |
| `DISM /Online /Cleanup-Image /RestoreHealth` | Windows imajını onar (sfc'den önce/sonra) |
| `chkdsk C: /f /r` | Disk hatası tara ve onar |
| `gpupdate /force` | Grup ilkelerini hemen uygula |
| `gpresult /r` | Uygulanan grup ilkelerini göster |
| `whoami` / `whoami /groups` | Mevcut kullanıcı ve grupları |
| `shutdown /r /t 0` | Hemen yeniden başlat |
| `shutdown /s /t 60` | 60 sn sonra kapat |
| `shutdown /r /m \\PCADI` | Uzaktaki bilgisayarı yeniden başlat |

## 5.2 Sık kullanılan Windows kısayolları (Çalıştır: Win+R)
| Yaz | Açılan |
|---|---|
| `services.msc` | Hizmetler |
| `devmgmt.msc` | Aygıt Yöneticisi |
| `diskmgmt.msc` | Disk Yönetimi |
| `compmgmt.msc` | Bilgisayar Yönetimi |
| `eventvwr.msc` | Olay Görüntüleyici |
| `lusrmgr.msc` | Yerel kullanıcı ve gruplar |
| `gpedit.msc` | Yerel grup ilkesi |
| `taskschd.msc` | Görev Zamanlayıcı |
| `ncpa.cpl` | Ağ bağdaştırıcıları |
| `appwiz.cpl` | Program ekle/kaldır |
| `sysdm.cpl` | Sistem özellikleri (bilgisayar adı, etki alanı) |
| `regedit` | Kayıt Defteri (dikkat, yedek al) |
| `mstsc` | Uzak Masaüstü |
| `cmd` / `powershell` | Komut satırı (yönetici için sağ tık) |
| `\\sunucu\paylasim` | Ağ paylaşımı |

## 5.3 PowerShell hızlı komutlar
```powershell
Get-Service | Where-Object {$_.Status -eq "Stopped"}   # Duran servisler
Restart-Service -Name Spooler                            # Servisi yeniden başlat
Get-Process | Sort-Object CPU -Descending | Select -First 10   # En çok CPU kullananlar
Get-EventLog -LogName System -Newest 20 -EntryType Error      # Son 20 sistem hatası
Get-ComputerInfo                                         # Sistem bilgisi
Get-NetIPConfiguration                                   # IP bilgisi
Get-Disk; Get-Volume                                     # Disk ve bölümler
Get-HotFix                                               # Yüklü güncellemeler
Test-NetConnection google.com -Port 443                  # Port testi
Get-LocalUser                                            # Yerel kullanıcılar
Restart-Computer -ComputerName PCADI -Force              # Uzaktan yeniden başlat
```

## 5.4 Olay Görüntüleyici (Event Viewer)
- Yol: `eventvwr.msc` > Windows Günlükleri > **System** / **Application** / **Security**
- Önce **Hata (Error)** ve **Kritik** olanlara bak, sorunun yaşandığı zamana göre filtrele
- Önemli Olay Kimlikleri (Event ID):
  - **4624** başarılı oturum açma
  - **4625** başarısız oturum açma
  - **4740** hesap kilitlendi
  - **41** beklenmedik kapanma (Kernel-Power)
  - **6005 / 6006** olay günlüğü servisi başladı/durdu (açılış/kapanış)
  - **7036** servis durumu değişti

## 5.5 Yedekleme mantığı
- **3-2-1 kuralı:** 3 kopya, 2 farklı ortam, 1 tanesi dışarıda (bulut/farklı bina)
- Yedek alınıyor olması yetmez, **geri yüklemeyi düzenli test et**
- Yedek türleri: Tam (full), Artımlı (incremental, son yedekten beri), Fark (differential, son tamdan beri)
- Önemli: sunucu yedeği, veritabanı, switch/router config yedeği (TFTP/SCP)

---

# 6. ACTIVE DIRECTORY (AD) ve KULLANICI YÖNETİMİ

## 6.1 Temel kavramlar
| Kavram | Anlamı |
|---|---|
| Domain (Etki alanı) | Merkezi kullanıcı/bilgisayar yönetimi, ör. `firma.local` |
| DC (Domain Controller) | AD'yi tutan sunucu |
| OU | Kullanıcı/bilgisayarları gruplamak için klasör benzeri yapı |
| Group Policy (GPO) | OU'lara uygulanan ayarlar (şifre kuralı, masaüstü, kısıtlamalar) |
| Security Group | İzin yönetimi için kullanıcı grubu |

## 6.2 Günlük işler (ADUC: `dsa.msc`)
| İş | Nasıl |
|---|---|
| Yeni kullanıcı | OU'ya sağ tık > New > User, doğru gruplara ekle |
| Şifre sıfırlama | Kullanıcıya sağ tık > Reset Password |
| Hesap kilidi açma | Kullanıcı özellikleri > Account > Unlock |
| Gruba ekleme | Kullanıcı > Member Of > Add |
| Hesap devre dışı | Sağ tık > Disable Account (silme yerine önce devre dışı bırak) |
| Bilgisayarı domaine alma | `sysdm.cpl` > Değiştir > Etki alanı |

**İşten ayrılan kullanıcı:** Hesabı sil**me**, önce devre dışı bırak, gruplardan çıkar, e-postayı ve dosyaları devret, belirli bir süre sonra sil.

## 6.3 Komut satırı
```
net user kullanici /domain          # Domain kullanıcı bilgisi
net group "Domain Admins" /domain   # Gruptaki kullanıcılar
gpresult /r                         # Uygulanan GPO'lar
dcdiag                              # DC sağlık kontrolü (DC üzerinde)
nltest /dsgetdc:firma.local         # Hangi DC'ye bağlı
klist purge                         # Kerberos biletlerini temizle
```

## 6.4 "Bu iş istasyonu ile etki alanı güven ilişkisi başarısız" hatası
- Bilgisayarın makine hesabı şifresi uyumsuz. Çözüm: yerel yönetici ile girip domain'den çık, workgroup'a geç, yeniden başlat, tekrar domain'e katıl (veya PowerShell: `Reset-ComputerMachinePassword -Credential firma\yonetici`).

## 6.5 Doğrulama (güvenlik)
Şifre sıfırlamadan önce kullanıcının kimliğini doğrula (çalışan no, yönetici onayı, geri arama). Bu, en sık kullanılan sosyal mühendislik yöntemidir.

---

# 7. DHCP ve DNS

## 7.1 DHCP süreci (DORA)
1. **D**iscover: istemci "DHCP sunucusu var mı?" der
2. **O**ffer: sunucu IP teklif eder
3. **R**equest: istemci teklifi ister
4. **A**cknowledge: sunucu onaylar

## 7.2 DHCP sorunları
| Sorun | Kontrol |
|---|---|
| IP `169.254.x.x` | DHCP'ye ulaşılamıyor, kablo/VLAN/DHCP servisi kontrol et |
| Havuz dolu | DHCP scope'ta boş IP kalmamış, havuzu genişlet veya kira süresini kısalt |
| Çakışma | Sabit IP'li cihaz DHCP havuzunun içinde, havuzu böl veya **rezervasyon** yap |
| Yanlış IP alıyor | Ağa kaçak router/modem takılmış olabilir (rogue DHCP) |

**İpuçları:**
- Yazıcı, sunucu, kameralar için **DHCP rezervasyonu** (MAC'e sabit IP) kullan
- Sabit IP'leri DHCP aralığının dışında tut
- `ipconfig /all` içinde "DHCP Server" satırı, IP'yi hangi sunucunun verdiğini gösterir

## 7.3 DNS kayıt türleri
| Kayıt | Görevi |
|---|---|
| A | İsim → IPv4 |
| AAAA | İsim → IPv6 |
| CNAME | Takma ad (alias) |
| MX | Mail sunucusu |
| PTR | IP → isim (ters sorgu) |
| NS | Yetkili DNS sunucusu |
| TXT | Metin (SPF, doğrulama kayıtları) |
| SRV | Servis konumu (AD için kritik) |

## 7.4 DNS sorun giderme
```
nslookup firma.local              # Domain çözülüyor mu
nslookup -type=MX firma.com       # Mail kaydı
nslookup google.com 8.8.8.8       # Belirli sunucudan sor
ipconfig /flushdns                # İstemci önbelleğini temizle
ipconfig /registerdns             # Kaydı yeniden oluştur
```
- Domain'e bağlı bilgisayarların DNS'i **domain controller'ı** göstermeli. İstemciye `8.8.8.8` verirsen domain'i bulamaz.
- "Ping IP ile çalışıyor, isimle çalışmıyor" = DNS sorunudur.

---

# 8. SWITCH/ROUTER HIZLI CISCO KOMUTLARI

(Detaylı anlatım için `cisco-switch-rehberi.md` dosyasına bak.)

## 8.1 Moda göre
```
Switch> enable                    # Yönetici moda geç
Switch# configure terminal        # Ayar moduna geç
Switch(config)# interface fa0/1   # Porta gir
Switch(config-if)# end            # Direkt # moduna dön
Switch# write memory              # Kaydet
```

## 8.2 Sorun giderme show komutları
| Komut | Ne gösterir |
|---|---|
| `show ip interface brief` | Port ve IP durumu (en çok kullanılan) |
| `show interfaces status` | Port hızı, duplex, VLAN, durum |
| `show interfaces fa0/1` | Port detayı, hata/çarpışma sayaçları |
| `show vlan brief` | VLAN-port ilişkisi |
| `show mac address-table` | Hangi MAC hangi portta (cihazı bulmak için) |
| `show arp` | IP-MAC eşlemesi |
| `show running-config` | Çalışan ayarlar |
| `show version` | Model, IOS, çalışma süresi |
| `show cdp neighbors` | Bağlı komşu cihazlar |
| `show logging` | Switch logları |
| `show interfaces trunk` | Trunk portları |
| `show spanning-tree` | STP durumu |

## 8.3 Port işleri
**Bir cihaz hangi porta bağlı?**
```
show mac address-table | include 1a2b
```
(MAC adresinin bir kısmıyla ara)

**Port hata sayaçları:** `show interfaces fa0/1` çıktısında `CRC`, `input errors` artıyorsa kablo/konnektör sorunu olabilir, duplex uyumsuzluğuna da bak.

**Portu kapat/aç:**
```
interface fa0/5
 shutdown
 no shutdown
```

**Port err-disabled (kapanmış) ise:**
```
interface fa0/5
 shutdown
 no shutdown
```

## 8.4 Duplex/hız uyumsuzluğu
- Belirti: yavaşlık, çok sayıda hata
- Her iki uç da `auto` olmalı ya da aynı elle ayar yapılmalı
- `show interfaces status` ile hız/duplex kontrol et

---

# 9. LINUX TEMEL KOMUTLAR (Sunucu)

## 9.1 Dosya ve dizin
| Komut | Ne yapar |
|---|---|
| `pwd` | Bulunduğun dizin |
| `ls -la` | Dosyaları ayrıntılı listele (gizliler dahil) |
| `cd /yol` | Dizin değiştir |
| `cp kaynak hedef` | Kopyala |
| `mv kaynak hedef` | Taşı/yeniden adlandır |
| `rm dosya` | Sil (**geri dönüş yok**) |
| `rm -r klasor` | Klasörü sil (**dikkat**) |
| `mkdir klasor` | Klasör oluştur |
| `cat dosya` | İçeriği göster |
| `less dosya` | Sayfa sayfa oku (q ile çık) |
| `tail -f /var/log/syslog` | Logu canlı izle |
| `grep "aranan" dosya` | Dosyada ara |
| `find / -name "dosya"` | Dosya bul |
| `nano dosya` | Basit metin editörü (Ctrl+O kaydet, Ctrl+X çık) |

## 9.2 Sistem ve süreçler
| Komut | Ne yapar |
|---|---|
| `top` / `htop` | Canlı CPU/RAM kullanımı |
| `df -h` | Disk doluluğu |
| `du -sh klasor` | Klasör boyutu |
| `free -h` | RAM kullanımı |
| `uptime` | Ne kadar süredir açık |
| `ps aux \| grep isim` | Süreç ara |
| `kill PID` / `kill -9 PID` | Süreci sonlandır |
| `uname -a` | Çekirdek ve sistem bilgisi |
| `whoami` / `id` | Kullanıcı ve grup |
| `history` | Geçmiş komutlar |

## 9.3 Servis yönetimi (systemd)
```bash
sudo systemctl status nginx        # Durum
sudo systemctl start nginx         # Başlat
sudo systemctl stop nginx          # Durdur
sudo systemctl restart nginx       # Yeniden başlat
sudo systemctl enable nginx        # Açılışta otomatik başlat
journalctl -u nginx -n 50          # Servisin son 50 log satırı
journalctl -xe                     # Son hatalar
```

## 9.4 Ağ (Linux)
```bash
ip a                  # IP bilgileri (ifconfig yerine)
ip route              # Yönlendirme tablosu
ss -tulpn             # Dinlenen portlar ve süreçler
ping -c 4 adres       # 4 paket ping
traceroute adres      # Yol izleme
dig alan.adi          # DNS sorgusu
curl -I https://site  # HTTP başlıklarını getir
sudo ufw status       # Güvenlik duvarı (Ubuntu)
sudo ufw allow 22/tcp # Port aç
```

## 9.5 Paket yönetimi
| Dağıtım | Güncelle | Kur |
|---|---|---|
| Ubuntu/Debian | `sudo apt update && sudo apt upgrade` | `sudo apt install paket` |
| RHEL/CentOS | `sudo dnf update` | `sudo dnf install paket` |

## 9.6 Kullanıcı ve izinler
```bash
sudo adduser ali                   # Kullanıcı ekle
sudo passwd ali                    # Şifre belirle
sudo usermod -aG sudo ali          # sudo yetkisi ver (Ubuntu)
chmod 755 dosya                    # İzin ayarla
chown kullanici:grup dosya         # Sahip değiştir
```
**İzin sayıları:** r=4, w=2, x=1. `755` = sahip (rwx), grup (r-x), diğerleri (r-x).

## 9.7 SSH
```bash
ssh kullanici@192.168.1.20         # Bağlan
scp dosya kullanici@ip:/hedef/     # Dosya kopyala
ssh-keygen -t ed25519              # Anahtar çifti üret
ssh-copy-id kullanici@ip           # Genel anahtarı sunucuya kopyala
```
Güvenlik: root ile SSH girişini kapat, mümkünse anahtar tabanlı kimlik doğrulama kullan.

## 9.8 Önemli log dosyaları
- `/var/log/syslog` veya `/var/log/messages`: genel
- `/var/log/auth.log`: giriş denemeleri
- `/var/log/nginx/` ve `/var/log/apache2/`: web sunucusu

---

# 10. GÜVENLİK TEMELLERİ

## 10.1 Sıkça karşılaşılan tehditler
| Tehdit | Önlem |
|---|---|
| Phishing (oltalama) | Bağlantı/ekleri kontrol et, gönderici adresine bak, şüpheliyi IT'ye ilet |
| Fidye yazılımı (ransomware) | Güncel yedek (çevrimdışı kopya dahil), güncelleme, makro kısıtı |
| Zayıf şifre | Karmaşıklık/uzunluk kuralı, MFA |
| Güncellenmemiş sistem | Düzenli yama yönetimi |
| Sosyal mühendislik | Kimlik doğrulama prosedürü, farkındalık |
| Yetkisiz cihaz | Port güvenliği, NAC, kayıtlı cihaz listesi |

## 10.2 Şüpheli e-posta/virüs şüphesi gelince
1. Kullanıcıya bağlantıya **tıklamamasını**/eki açmamasını söyle
2. Tıkladıysa: bilgisayarı **ağdan ayır** (kabloyu çek/Wi-Fi kapat), **kapatma**
3. Güvenlik sorumlusuna/yöneticiye haber ver
4. Parola değişikliği gerekebilir, tam tarama yap
5. Olayı kaydet (saat, kullanıcı, e-posta başlığı, ekran görüntüsü)

## 10.3 Şifre politikası önerisi
- En az 12 karakter, kolay tahmin edilemeyen, her hesap için farklı
- Mümkün olan her yerde **MFA (çok faktörlü doğrulama)**
- Şifre yöneticisi kullanımı teşvik et
- Şifreleri e-posta/mesajla düz metin paylaşma

## 10.4 Genel güvenlik alışkanlıkları
- **En az yetki ilkesi:** Kullanıcıya sadece işi için gereken yetkiyi ver
- Yönetici hesabıyla günlük iş yapma, ayrı hesap kullan
- Ekran kilidi (Win+L), otomatik kilitleme
- Disk şifreleme (BitLocker), özellikle laptop'larda
- Kullanılmayan hesap ve portları kapat
- Yazılımları ve işletim sistemini güncel tut

---

# 11. DONANIM ve ENVANTER

## 11.1 Hızlı donanım tanısı
| Belirti | Olası neden |
|---|---|
| Açılmıyor, ışık yok | Güç kaynağı/kablo/priz |
| Bip sesleri | RAM/ekran kartı/BIOS (üretici kodlarına bak) |
| Ekran gelmiyor, fan dönüyor | RAM, ekran kablosu, ekran kartı |
| Aşırı ısınma | Toz, fan arızası, macun |
| Disk sesi (tıkırtı) | HDD arızası, **hemen yedekle** |
| Rastgele kapanma | Isınma, güç kaynağı, RAM |
| Yavaş + disk %100 | HDD yaşlanmış, SSD'ye geç |

## 11.2 Disk sağlığı
- Windows: `wmic diskdrive get status`, CrystalDiskInfo (SMART)
- Linux: `sudo smartctl -a /dev/sda`

## 11.3 Envanter kaydı için tutulması gerekenler
- Cihaz adı, seri no, model
- Kullanıcı/zimmet bilgisi, konum
- IP/MAC adresi
- Satın alma tarihi, garanti bitişi
- İşletim sistemi ve önemli yazılımlar
- Etiketleme: cihaza kolayca okunur bir numara yapıştır

---

# 12. TICKET ve İLETİŞİM

## 12.1 İyi bir ticket kaydı
- **Kim:** kullanıcı, departman, iletişim
- **Ne:** sorunun kısa özeti + hata mesajı
- **Ne zaman:** başlangıç zamanı
- **Etki:** tek kişi mi, birçok kişi mi, iş durdu mu
- **Yapılanlar:** denenen adımlar ve sonuçları
- **Çözüm:** ne yapıldı, neden düzeldi
- **Ekler:** ekran görüntüsü, log

## 12.2 Öncelik mantığı
| Öncelik | Örnek |
|---|---|
| Kritik | Tüm firma internetsiz, sunucu çökmüş, fidye yazılımı |
| Yüksek | Bir departman çalışamıyor, yönetici sorunu |
| Orta | Tek kullanıcı, işi kısmen etkileniyor |
| Düşük | Kozmetik, yeni talep, genel soru |

## 12.3 Kullanıcıyla iletişim
- Teknik terim kullanma, sade anlat
- Ne yapacağını ve tahmini süreyi söyle
- Çözdükten sonra kullanıcıya **test ettir**
- Bilmediğin bir şeyi bilmiyormuş gibi yapma: "Araştırıp dönüş yapacağım" demek yeterlidir
- Kullanıcıyı suçlama, sakin ve nazik ol
- Çözülemeyen işi zamanında üst seviyeye (L2/L3) devret, notlarla birlikte

## 12.4 Escalation (yükseltme)
Şu durumlarda kıdemli birine danış:
- Tüm firmayı etkileyen kesinti
- Güvenlik olayı şüphesi
- Veri kaybı riski
- Yetkin olmadığın bir sistem
- 30–60 dakikada ilerleme sağlayamadığın sorun

---

# 13. YENİ BİR ORTAMA UYUM (İlk Günler İçin Kontrol Listesi)

## 13.1 Öğrenilmesi gerekenler
- [ ] Ağ şeması (IP aralıkları, VLAN'lar, switch/router konumları)
- [ ] Sunucu listesi ve görevleri (DC, dosya, yazdırma, yedek, mail)
- [ ] Yönetici hesapları ve yetki prosedürü (şifreleri nerede, nasıl saklıyorlar)
- [ ] Ticket sistemi ve kullanım şekli
- [ ] Yedekleme politikası ve nerede tutulduğu
- [ ] Yazılım lisansları ve envanter
- [ ] Acil durum iletişim listesi (ISS, donanım destek, kıdemli yöneticiler)
- [ ] Mevcut dokümantasyon ve prosedürler
- [ ] Hangi işin kime devredileceği

## 13.2 Alışkanlık haline getir
- Her işlemi not et, kendi bilgi tabanını oluştur
- Çözdüğün sorunları ekran görüntüsüyle arşivle (tekrar karşına çıkar)
- Yönetici hesabı şifrelerini asla paylaşma, kendin sakla
- Anlamadığın şeyi sormaktan çekinme, ama önce araştır ve denediklerini anlat
- Yapılandırma değiştirmeden önce yedek al
- Bakım/güncelleme işlerini mesai dışında, haber vererek yap

## 13.3 Kendini geliştirme
- **Sertifikalar:** CompTIA A+, Network+, Security+; Cisco CCNA; Microsoft AZ-900, MD-102 (Endpoint), AZ-104; Linux için LPIC-1/RHCSA
- **Ev laboratuvarı:** Packet Tracer, VirtualBox/VMware ile Windows Server (AD, DHCP, DNS), Linux sunucu, Proxmox
- **Pratik:** Kendi ağında Pi-hole, Nextcloud, Wireguard, izleme (Zabbix, Grafana) kur
- Öğrendiklerini düzenli notlara ve betik arşivine dönüştür; bir sonraki sorunda zaman kazandırır

---

# 14. HIZLI BAŞVURU KARTLARI

## 14.1 "Hiçbir şey çalışmıyor" 60 saniye listesi
1. Kablo/Wi-Fi bağlı mı?
2. `ipconfig`: IP var mı, `169.254` mü?
3. `ping gateway` → `ping 8.8.8.8` → `ping google.com`
4. `ipconfig /release` → `/flushdns` → `/renew`
5. Yeniden başlat
6. Başka kullanıcılarda da var mı?
7. Son zamanda ne değişti?

## 14.2 En çok kullanılan 15 komut
```
ipconfig /all          ping                  tracert
nslookup               netstat -ano          arp -a
gpupdate /force        sfc /scannow          chkdsk
systeminfo             tasklist              taskkill /PID x /F
net use                net user              shutdown /r /t 0
```

## 14.3 Dosya kopyalama ve ağ paylaşımı
```
robocopy C:\kaynak D:\hedef /E /COPYALL /R:2 /W:2    # Güvenilir kopya (yedek için ideal)
xcopy kaynak hedef /E /I /H                           # Klasör kopyala
```

## 14.4 Zamanlanmış görev ve uzaktan yönetim
```
schtasks /query                                       # Zamanlanmış görevleri listele
psexec \\PCADI cmd                                    # Uzaktan komut (Sysinternals)
```
Sysinternals araç seti (Process Explorer, Autoruns, TCPView, PsTools) sistem yöneticisinin vazgeçilmezidir.

## 14.5 Faydalı araçlar
| Araç | Ne için |
|---|---|
| Wireshark | Ağ paket analizi |
| PuTTY / Windows Terminal | SSH, console, seri bağlantı |
| Advanced IP Scanner / Angry IP Scanner | Ağdaki cihazları tara |
| Nmap | Port taraması |
| WinSCP / FileZilla | SFTP/FTP dosya aktarımı |
| TeamViewer / AnyDesk / Quick Assist | Uzak destek |
| CrystalDiskInfo | Disk sağlığı |
| Rufus / Ventoy | Önyüklenebilir USB |
| Sysinternals Suite | Gelişmiş Windows araçları |
| Zabbix / PRTG / LibreNMS | Ağ izleme |
| Notepad++ / VS Code | Metin ve config düzenleme |

---

> **Not:** Komutları üretim ortamında çalıştırmadan önce test ortamında dene. Silme, format, toplu değişiklik gibi geri dönüşü olmayan işlerde mutlaka yedek al ve onay iste. Şirketin kendi prosedürleri bu rehberden önceliklidir.
