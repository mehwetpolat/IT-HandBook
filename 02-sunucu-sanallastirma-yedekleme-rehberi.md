# Sunucu, Sanallaştırma, Yedekleme ve İzleme Rehberi
**Windows Server · Active Directory Lab · Hyper-V/Proxmox · Linux Sunucu · Yedekleme · İzleme**

Bu rehber, sunucu tarafı işlerin ortak notlarını tek yerde toplar. Sonunda kendi evinde kurabileceğin bir laboratuvar planı var.

---

## 1. Windows Server Rolleri

| Rol | Ne yapar | Kurulum (PowerShell) |
|---|---|---|
| AD DS | Kullanıcı/bilgisayar/kimlik yönetimi | `Install-WindowsFeature AD-Domain-Services -IncludeManagementTools` |
| DNS | İsim çözümleme | `Install-WindowsFeature DNS -IncludeManagementTools` |
| DHCP | Otomatik IP dağıtımı | `Install-WindowsFeature DHCP -IncludeManagementTools` |
| Dosya Sunucusu | Paylaşımlar, kota | `Install-WindowsFeature FS-FileServer` |
| Yazdırma Sunucusu | Merkezi yazıcı yönetimi | `Install-WindowsFeature Print-Server` |
| WSUS | Windows güncelleme yönetimi | `Install-WindowsFeature UpdateServices` |
| Hyper-V | Sanallaştırma | `Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart` |
| IIS | Web sunucusu | `Install-WindowsFeature Web-Server -IncludeManagementTools` |

Rol/özellik listesi: `Get-WindowsFeature`. Grafik arayüz: **Server Manager**.

## 2. Active Directory Laboratuvarı (Adım Adım)

### 2.1 Gerekenler
- Sanallaştırma yazılımı (Hyper-V, VirtualBox, VMware Workstation, Proxmox)
- Windows Server ISO (Microsoft Evaluation Center'dan ücretsiz deneme sürümü) ve bir Windows 10/11 istemci
- Önerilen kaynak: DC için 2 vCPU / 2-4 GB RAM / 40+ GB disk, istemci için 2 vCPU / 4 GB RAM

### 2.2 Topoloji
| Makine | Ad | IP | Rol |
|---|---|---|---|
| Sunucu | DC01 | 192.168.1.20 | AD DS, DNS, DHCP |
| İstemci | PC01 | DHCP | Domaine katılacak |

İki makine aynı sanal ağda (internal/host-only) olmalı.

### 2.3 DC01 hazırlığı
```powershell
Get-NetAdapter                                   # Arayüz adını öğren (örn. Ethernet)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.20 -PrefixLength 24 -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1
Rename-Computer -NewName DC01 -Restart
```

### 2.4 Domain kurulumu
```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "lab.local" -InstallDns
```
Sihirbaz **DSRM (Directory Services Restore Mode) şifresi** ister, bir yere kaydet. Sunucu otomatik yeniden başlar; artık giriş `LAB\Administrator`.

### 2.5 OU, kullanıcı, grup
```powershell
New-ADOrganizationalUnit -Name "Kullanicilar" -Path "DC=lab,DC=local"
New-ADUser -Name "Ali Veli" -SamAccountName "aveli" -UserPrincipalName "aveli@lab.local" `
  -Path "OU=Kullanicilar,DC=lab,DC=local" -AccountPassword (Read-Host -AsSecureString "Sifre") -Enabled $true
New-ADGroup -Name "Muhasebe" -GroupScope Global -Path "OU=Kullanicilar,DC=lab,DC=local"
Add-ADGroupMember -Identity "Muhasebe" -Members aveli
```

### 2.6 DHCP
```powershell
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerInDC -DnsName "DC01.lab.local" -IPAddress 192.168.1.20   # AD'de yetkilendir
Add-DhcpServerv4Scope -Name "LAN" -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -Router 192.168.1.1 -DnsServer 192.168.1.20 -DnsDomain "lab.local"
```
AD ortamında DHCP sunucusunun **yetkilendirilmesi (authorize)** gerekir.

### 2.7 İstemciyi domaine alma
PC01'de: DNS sunucusu olarak `192.168.1.20` ver (DHCP verdiyse otomatik), sonra:
```powershell
Add-Computer -DomainName lab.local -Credential LAB\Administrator -Restart
```
Giriş: `LAB\aveli`.

### 2.8 Dosya paylaşımı ve izinler
```powershell
New-Item -Path D:\Paylasim\Muhasebe -ItemType Directory -Force
New-SmbShare -Name "Muhasebe" -Path "D:\Paylasim\Muhasebe" -FullAccess "LAB\Muhasebe"
```
**İzin mantığı:** Paylaşım izni ve NTFS izni birlikte değerlendirilir, **en kısıtlayıcı olan** geçerli olur. Mümkünse kullanıcıya değil **gruba** izin ver (AGDLP yaklaşımı: Account → Global group → Domain Local group → Permission).

### 2.9 Group Policy (GPO) örnekleri
`gpmc.msc` ile açılır. GPO'yu OU'ya bağla, `gpupdate /force` ile test et.
- Şifre politikası (uzunluk, karmaşıklık, kilitleme eşiği)
- Ağ sürücüsü eşleme (Group Policy Preferences > Drive Maps)
- Duvar kâğıdı, ekran kilidi süresi
- USB depolama kısıtı
- Yazılım kurulum ve güvenlik duvarı kuralları

**Hangi GPO uygulanıyor?** İstemcide `gpresult /r` veya `gpresult /h rapor.html`.

### 2.10 AD sağlık komutları
```
dcdiag                       # DC genel sağlık testi
repadmin /replsummary        # Çoklu DC'de replikasyon özeti
nltest /dsgetdc:lab.local    # Hangi DC'ye bağlı
netdom query fsmo            # FSMO rol sahipleri
```
**FSMO rolleri (5):** Schema Master, Domain Naming Master, PDC Emulator, RID Master, Infrastructure Master. Tek DC'li ortamda hepsi aynı sunucudadır.

## 3. Sunucuların Günlük/Haftalık Kontrol Listesi

**Günlük**
- [ ] Yedekleme işleri başarılı mı?
- [ ] Disk doluluğu (>%85 uyarı)
- [ ] Kritik servisler çalışıyor mu (AD, DNS, DHCP, dosya, yazdırma)
- [ ] Olay Görüntüleyici'de Hata/Kritik kayıtlar
- [ ] Antivirüs/Defender güncel mi
- [ ] UPS ve sıcaklık normal mi

**Haftalık/Aylık**
- [ ] Güncelleme/yama (Windows'ta Patch Tuesday = ayın 2. Salı günü)
- [ ] `dcdiag`, `repadmin /replsummary`
- [ ] Yedekten **geri yükleme testi**
- [ ] Kullanılmayan hesap ve bilgisayar temizliği
- [ ] Yönetici grubu üyeliklerinin gözden geçirilmesi

**Yama sırası:** Test ortamı → pilot grup → herkes. Sunucu güncellemesini bakım penceresinde yap, önce yedek/snapshot al.

## 4. Disk, RAID ve Donanım

| RAID | Min. disk | Ne sağlar |
|---|---|---|
| RAID 0 | 2 | Hız, **yedeklilik yok** (bir disk giderse hepsi gider) |
| RAID 1 | 2 | Ayna, 1 disk arızasına dayanır |
| RAID 5 | 3 | 1 disk arızasına dayanır, kapasite verimli |
| RAID 6 | 4 | 2 disk arızasına dayanır |
| RAID 10 | 4 | Hız + ayna, 1+1 mantığı |

> **RAID yedek değildir.** Silme, fidye yazılımı, yangın ve yazılım hatasına karşı koruma sağlamaz.

- Disk sağlığı: SMART (Windows: CrystalDiskInfo; Linux: `smartctl -a /dev/sda`)
- UPS: ani elektrik kesintisinde kontrollü kapanma; batarya ömrünü ve yük kapasitesini takip et
- Sunucu odası: sıcaklık, havalandırma, kablo düzeni, etiketleme, erişim kontrolü

## 5. Sanallaştırma

### 5.1 Kavramlar
| Kavram | Anlamı |
|---|---|
| Hypervisor Tip 1 | Doğrudan donanım üstünde (Hyper-V, ESXi, Proxmox/KVM) |
| Hypervisor Tip 2 | İşletim sistemi üstünde (VirtualBox, VMware Workstation) |
| VM | Sanal makine |
| Snapshot/Checkpoint | Anlık durum kaydı. **Yedek değildir**, uzun süre tutma (disk şişer, performans düşer) |
| Thin / Thick disk | Gerektikçe büyüyen / baştan ayrılmış disk |
| Sanal switch | VM'lerin ağ bağlantısı |
| Live migration | Çalışan VM'i kapatmadan başka konağa taşıma |

### 5.2 Hyper-V ağ türleri
| Tür | Anlamı |
|---|---|
| External | Fiziksel ağa/internete çıkış |
| Internal | Konak ile VM'ler arası |
| Private | Sadece VM'ler arası |

### 5.3 Hyper-V PowerShell
```powershell
Get-VM
New-VM -Name "DC01" -MemoryStartupBytes 4GB -Generation 2 -NewVHDPath "D:\VM\DC01.vhdx" -NewVHDSizeBytes 60GB -SwitchName "LabSwitch"
Start-VM DC01
Checkpoint-VM -Name DC01 -SnapshotName "Kurulum-oncesi"
Restore-VMSnapshot -Name "Kurulum-oncesi" -VMName DC01
Stop-VM DC01
```

### 5.4 Proxmox (ev laboratuvarı için güçlü seçenek)
- Web arayüzü: `https://SUNUCU_IP:8006`
- **KVM** (tam sanal makine) ve **LXC** (hafif konteyner) çalıştırır
- Komutlar: `qm list` (VM'ler), `pct list` (konteynerler), `qm start 100`
- Yedekleme: Datacenter > Backup; depolama: yerel disk, NFS, ZFS
- Şablon (template) oluşturup hızlı klonlama yap

### 5.5 Docker Temelleri (kısa)
```bash
docker ps                          # Çalışan konteynerler
docker ps -a                       # Hepsi
docker images                      # İmajlar
docker run -d -p 8080:80 nginx     # Web sunucusu başlat
docker logs konteyner_adi          # Loglar
docker exec -it konteyner_adi sh   # İçine gir
docker compose up -d               # compose dosyasından başlat
docker compose down
```
Veriyi **volume** ile dışarıda tut, konteyner silince veri gitmesin.

## 6. Linux Sunucu İşleri

### 6.1 İlk kurulum sonrası
```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone Europe/Istanbul
sudo hostnamectl set-hostname srv01
sudo adduser yonetici && sudo usermod -aG sudo yonetici
sudo ufw allow 22/tcp && sudo ufw enable
sudo apt install unattended-upgrades fail2ban -y
```

### 6.2 SSH sıkılaştırma (`/etc/ssh/sshd_config`)
```
PermitRootLogin no
PasswordAuthentication no     # Önce anahtar girişini test et!
PubkeyAuthentication yes
```
`sudo systemctl restart ssh`. **Dikkat:** Yeni bir oturumda anahtarla girişi doğrulamadan mevcut oturumu kapatma, kendini dışarıda bırakabilirsin.

### 6.3 Servisler
- Web: **Nginx** (`sudo apt install nginx`), yapılandırma `/etc/nginx/`, test `sudo nginx -t`
- Dosya paylaşımı: **Samba** (Windows ile uyumlu), yapılandırma `/etc/samba/smb.conf`
- Zamanlı işler: **cron** (`crontab -e`)

**cron formatı:**
```
# dakika saat gün ay haftanın_günü  komut
30 2 * * *   /home/yonetici/yedek.sh        # Her gün 02:30
0 */6 * * *  /home/yonetici/kontrol.sh      # 6 saatte bir
0 3 * * 0    /home/yonetici/haftalik.sh     # Her Pazar 03:00
```

### 6.4 Disk işleri
```bash
lsblk                      # Diskler ve bölümler
df -h                      # Doluluk
sudo fdisk -l              # Bölüm tablosu
sudo mount /dev/sdb1 /mnt  # Bağla
du -sh /var/log/*          # Hangi klasör yer kaplıyor
```
Kalıcı bağlama: `/etc/fstab` (yanlış satır açılışı bozabilir, önce yedek al, `sudo mount -a` ile test et).

## 7. Yedekleme ve Felaket Kurtarma

### 7.1 Temel kavramlar
| Terim | Anlamı |
|---|---|
| **3-2-1 kuralı** | 3 kopya, 2 farklı ortam, 1 tanesi dışarıda/çevrimdışı |
| RPO | En fazla ne kadar veri kaybı kabul edilir (örn. 1 saat) |
| RTO | Sistemin ne kadar sürede geri gelmesi gerekir (örn. 4 saat) |
| Tam yedek | Her şeyin kopyası |
| Artımlı | Son yedekten (türü fark etmeksizin) beri değişenler |
| Fark (differential) | Son **tam** yedekten beri değişenler |
| Immutable/offline yedek | Değiştirilemeyen veya ağdan kopuk kopya (fidye yazılımına karşı) |

### 7.2 Ne yedeklenir?
- Dosya sunucusu ve kullanıcı verileri
- AD (System State), DNS, DHCP ayarları
- Veritabanları ve uygulama verileri
- VM'ler (imaj yedeği)
- Ağ cihazı yapılandırmaları (TFTP/SCP ile)
- Bulut verisi de (M365 verisinin ayrı yedeği önerilir)

### 7.3 Araçlar
| Araç | Not |
|---|---|
| Windows Server Backup | Yerleşik, basit, tek sunucu için |
| Veeam Backup & Replication | Yaygın, VM ve fiziksel yedek; Community sürümü sınırlı kullanıma ücretsiz |
| robocopy / rsync | Dosya düzeyi kopyalama, betiklerle |
| Proxmox Backup / Hyper-V export | Sanallaştırma platformu yedekleri |

```powershell
wbadmin start systemstatebackup -backuptarget:E:    # AD System State yedeği
```

### 7.4 Yedek politikası şablonu
| Veri | Sıklık | Saklama | Konum |
|---|---|---|---|
| Dosya sunucusu | Günlük | 30 gün | NAS + bulut/dış disk |
| AD / sunucu imajı | Haftalık | 4 hafta | NAS + çevrimdışı |
| Veritabanı | Günlük + saatlik log | 30 gün | Ayrı sunucu |
| Ağ config | Değişiklik sonrası | Son 10 | TFTP/Git |

### 7.5 Geri yükleme testi
Yedek, **geri yüklenebildiği kadar** değerlidir.
1. Rastgele bir dosyayı geri yükle, aç, doğrula.
2. Üç ayda bir tüm bir VM/sunucuyu test ortamına geri getir.
3. Süreyi ölç (RTO'ya uyuyor mu?).
4. Sonucu belgele.

### 7.6 Felaket kurtarma planında olması gerekenler
- Kritik sistemler ve öncelik sırası
- Kim, neyi, hangi sırayla yapacak (sorumlular, iletişim listesi)
- Yedeklerin yeri ve erişim bilgisi (güvenli saklanan)
- Geri dönüş adımları (runbook)
- Planın düzenli test edilmesi

## 8. İzleme (Monitoring)

### 8.1 Neyi izlemeli?
- Cihaz ayakta mı (ping/uptime)
- CPU, RAM, disk doluluğu
- Ağ trafiği ve port hataları
- Kritik servisler (AD, DNS, DHCP, web, veritabanı)
- Yedek işlerinin başarısı
- Sertifika bitiş tarihleri
- Sıcaklık/UPS durumu

### 8.2 Örnek alarm eşikleri
| Metrik | Uyarı | Kritik |
|---|---|---|
| Disk doluluğu | %80 | %90 |
| CPU (sürekli) | %85 | %95 |
| RAM | %85 | %95 |
| Ping kaybı | %10 | Cihaz yanıt vermiyor |
| Sertifika bitişi | 30 gün | 7 gün |

### 8.3 Araçlar
| Araç | Not |
|---|---|
| **Zabbix** | Ücretsiz, güçlü, ajan ve SNMP destekli |
| **PRTG** | Kurulumu kolay, sınırlı ücretsiz sürüm |
| **LibreNMS** | Ağ cihazları için, SNMP odaklı |
| **Uptime Kuma** | Basit, hafif, servis ayakta mı kontrolü, ev laboratuvarı için ideal |
| **Grafana + Prometheus** | Esnek grafik ve metrik |

**SNMP:** Cihazlardan durum bilgisi çekme protokolü. v2c (topluluk dizesi, güvensiz), v3 (kimlik doğrulama + şifreleme, tercih et). Varsayılan "public" topluluk dizesini değiştir.

## 9. Önerilen Ev Laboratuvarı Planı (Aşamalı)

| Aşama | Yapılacak |
|---|---|
| 1 | Sanallaştırma kur (Hyper-V/VirtualBox/Proxmox), Windows Server + istemci VM'i |
| 2 | AD, DNS, DHCP kur; PC01'i domaine al |
| 3 | OU/kullanıcı/grup, paylaşım ve NTFS izinleri, 3-4 GPO |
| 4 | İkinci bir Linux VM: SSH, Nginx, Samba, cron |
| 5 | Yedekleme: Windows Server Backup + robocopy/rsync, geri yükleme testi |
| 6 | İzleme: Uptime Kuma veya Zabbix |
| 7 | Her aşamanın ekran görüntüsünü ve notlarını bir dokümana veya Git deposuna ekle |

## 10. Sorun Giderme Kısayolları

| Belirti | İlk bakış |
|---|---|
| Kullanıcı domaine giremiyor | DNS ayarı DC'yi gösteriyor mu, saat farkı (Kerberos 5 dk tolerans), hesap kilidi |
| Domain'e katılınamıyor | DNS, ağ erişimi, `ping DC01`, `nslookup lab.local` |
| GPO uygulanmıyor | `gpresult /r`, OU bağlantısı, güvenlik filtreleme, replikasyon |
| Paylaşıma erişim yok | Paylaşım + NTFS izni, `\\sunucu` ping/DNS, 445 portu |
| DHCP IP vermiyor | Servis çalışıyor mu, yetkilendirildi mi, havuz dolu mu |
| Sunucu yavaş | Görev Yöneticisi/`top`, disk gecikmesi, sanal konak kaynak yetersizliği |
| Disk doldu | Büyük dosya/klasörleri bul, log, temp, eski yedek, snapshot'lar |
| Yedek başarısız | Hedef alan, ağ/izin, VSS hataları, log |
