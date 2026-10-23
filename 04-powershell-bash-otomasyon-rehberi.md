# PowerShell ve Bash Otomasyon Rehberi
**Tekrarlayan IT işlerini betiğe dökmek için hazır kalıplar**

Amaç: Aynı işi üçüncü kez elle yapıyorsan betiğe dök. Bu rehberde temel mantık, güvenlik kuralları ve kopyala-uyarla örnekler var.

> **Altın kurallar**
> 1. Önce **test ortamında** veya 1-2 nesne üzerinde dene.
> 2. Silme/değiştirme yapan komutlarda önce `-WhatIf` ile ne olacağını gör.
> 3. Şifreyi betiğin içine **yazma**.
> 4. Betiğe yorum satırı ve log ekle, 6 ay sonra kendin de anlayasın.
> 5. Betiklerini Git ile sürüm kontrolünde tut.

---

## 1. PowerShell Temelleri

### 1.1 Çalışma mantığı
- Komutlar **Fiil-İsim** biçimindedir: `Get-Service`, `Set-ADUser`, `Remove-Item`
- PowerShell **nesne** döndürür, metin değil. Boru (`|`) ile nesneleri bir komuttan diğerine aktarırsın.
- .NET üzerine kuruludur, .NET sınıflarını doğrudan çağırabilirsin: `[System.IO.File]::ReadAllText("C:\a.txt")`
- Windows PowerShell 5.1 (`powershell.exe`, Windows'ta yerleşik) ve PowerShell 7 (`pwsh`, ayrı kurulur, çok platformlu) farklı sürümlerdir.

### 1.2 Yardım ve keşif
```powershell
Get-Help Get-Service -Examples      # Örneklerle yardım
Get-Help Get-Service -Online
Get-Command *service*               # Komut ara
Get-Service | Get-Member            # Nesnenin özellik ve metotları
Update-Help                         # Yardım dosyalarını güncelle (yönetici)
```

### 1.3 En çok kullanılan kalıplar
| Amaç | Komut |
|---|---|
| Filtrele | `Where-Object { $_.Status -eq 'Running' }` veya `Where-Object Status -eq Running` |
| Sütun seç | `Select-Object Name, Status` |
| Sırala | `Sort-Object CPU -Descending` |
| İlk N | `Select-Object -First 10` |
| Her biri için | `ForEach-Object { ... }` |
| Say | `Measure-Object` / `.Count` |
| Grupla | `Group-Object Status` |
| CSV'ye yaz | `Export-Csv rapor.csv -NoTypeInformation -Encoding UTF8` |
| CSV'den oku | `Import-Csv liste.csv` |
| Ekranda tablo | `Format-Table -AutoSize` |
| Ekranda liste | `Format-List *` |
| Dosyaya yaz | `Out-File sonuc.txt` |

### 1.4 Değişken, koşul, döngü
```powershell
$ad = "Ali"
$liste = @("PC01","PC02","PC03")

if ($ad -eq "Ali") { "Merhaba Ali" } elseif ($ad -like "A*") { "A ile başlıyor" } else { "Diğer" }

foreach ($pc in $liste) { Write-Host "$pc kontrol ediliyor" }

try {
    Get-Item "C:\olmayan.txt" -ErrorAction Stop
} catch {
    Write-Warning "Hata: $($_.Exception.Message)"
}
```
**Karşılaştırma:** `-eq` eşit, `-ne` farklı, `-gt` büyük, `-lt` küçük, `-like` joker, `-match` regex, `-contains` listede var.

### 1.5 Fonksiyon ve parametre
```powershell
function Get-DiskBilgi {
    param(
        [Parameter(Mandatory)] [string]$Bilgisayar,
        [int]$EsikYuzde = 15
    )
    Get-CimInstance Win32_LogicalDisk -ComputerName $Bilgisayar -Filter "DriveType=3" |
        Where-Object { ($_.FreeSpace / $_.Size * 100) -lt $EsikYuzde }
}
Get-DiskBilgi -Bilgisayar PC01
```

### 1.6 Betik çalıştırma izni
```powershell
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser      # İnternetten indirilenler imzalı olmalı
.\betik.ps1                                              # Çalıştır
```
`Bypass` kullanımı sadece bilinçli, tek seferlik durumlarda.

### 1.7 Güvenlik anahtarları
| Parametre | Ne yapar |
|---|---|
| `-WhatIf` | Çalıştırmadan ne olacağını gösterir |
| `-Confirm` | Her adımda onay ister |
| `-ErrorAction Stop` | Hatada durdurur, `try/catch` yakalar |
| `Start-Transcript -Path log.txt` | Oturumun tüm çıktısını kaydeder |
| `Get-Credential` | Şifreyi güvenle sorar (betiğe yazmaz) |

## 2. Hazır Betikler (Windows)

### 2.1 CSV'den toplu kullanıcı oluşturma (AD)
`kullanicilar.csv`:
```
Ad,Soyad,KullaniciAdi,Departman
Ali,Veli,aveli,Muhasebe
Ayse,Kaya,akaya,IT
```
Betik:
```powershell
Import-Module ActiveDirectory
$ou = "OU=Kullanicilar,DC=lab,DC=local"
$sifre = Read-Host "Gecici sifre" -AsSecureString
$liste = Import-Csv .\kullanicilar.csv

foreach ($u in $liste) {
    $params = @{
        Name                  = "$($u.Ad) $($u.Soyad)"
        GivenName             = $u.Ad
        Surname               = $u.Soyad
        SamAccountName        = $u.KullaniciAdi
        UserPrincipalName     = "$($u.KullaniciAdi)@lab.local"
        Department            = $u.Departman
        Path                  = $ou
        AccountPassword       = $sifre
        Enabled               = $true
        ChangePasswordAtLogon = $true
    }
    try {
        New-ADUser @params -WhatIf          # Önce -WhatIf ile dene, sonra kaldır
        Write-Host "OK: $($u.KullaniciAdi)"
    } catch {
        Write-Warning "HATA $($u.KullaniciAdi): $($_.Exception.Message)"
    }
}
```
Gerçek ortamda herkese aynı geçici şifre vermek yerine rastgele şifre üret ve güvenle ilet.

### 2.2 Birden çok bilgisayarın disk raporu
```powershell
$pcler = Get-Content .\bilgisayarlar.txt
$sonuc = foreach ($pc in $pcler) {
    try {
        Get-CimInstance Win32_LogicalDisk -ComputerName $pc -Filter "DriveType=3" -ErrorAction Stop |
        Select-Object @{n='PC';e={$pc}}, DeviceID,
            @{n='ToplamGB';e={[math]::Round($_.Size/1GB,1)}},
            @{n='BosGB';e={[math]::Round($_.FreeSpace/1GB,1)}},
            @{n='BosYuzde';e={[math]::Round($_.FreeSpace/$_.Size*100,1)}}
    } catch { Write-Warning "$pc ulasilamadi" }
}
$sonuc | Export-Csv .\disk-raporu.csv -NoTypeInformation -Encoding UTF8
```

### 2.3 AD hesap bakımı
```powershell
Search-ADAccount -LockedOut | Select Name, SamAccountName                # Kilitli hesaplar
Unlock-ADAccount -Identity aveli                                          # Kilidi aç
Search-ADAccount -AccountInactive -UsersOnly -TimeSpan 90.00:00:00 |      # 90 gündür girmeyenler
    Select Name, LastLogonDate, Enabled
Search-ADAccount -PasswordExpired -UsersOnly | Select Name                # Şifresi dolanlar
Get-ADUser -Identity aveli -Properties * | Format-List Name,Enabled,LastLogonDate,MemberOf
Get-ADGroupMember -Identity "Muhasebe" | Select Name
```

### 2.4 Yüklü yazılım envanteri
```powershell
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
                 "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" |
    Where-Object DisplayName |
    Select-Object DisplayName, DisplayVersion, Publisher |
    Sort-Object DisplayName | Export-Csv .\yazilimlar.csv -NoTypeInformation -Encoding UTF8
```

### 2.5 Servis izleme ve otomatik başlatma
```powershell
$servisler = "Spooler","W32Time"
foreach ($s in $servisler) {
    $svc = Get-Service $s
    if ($svc.Status -ne 'Running') {
        Start-Service $s
        Write-Host "$(Get-Date -Format s) $s yeniden baslatildi"
    }
}
```

### 2.6 Geçici dosya temizliği
```powershell
Get-ChildItem $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -WhatIf     # Test sonrası -WhatIf'i kaldır
```

### 2.7 Büyük dosyaları bulma
```powershell
Get-ChildItem D:\ -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending | Select-Object -First 20 FullName,
    @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
```

### 2.8 Ağ: ping taraması ve port testi
```powershell
1..254 | ForEach-Object {
    $ip = "192.168.1.$_"
    if (Test-Connection $ip -Count 1 -Quiet) { $ip }
}
# PowerShell 7'de hızlı: 1..254 | ForEach-Object -Parallel { ... } -ThrottleLimit 50

Test-NetConnection 192.168.1.20 -Port 443
```
Sadece kendi/yetkili ağında kullan.

### 2.9 Robocopy ile yedekleme betiği
```powershell
$kaynak = "D:\Veri"
$hedef  = "\\yedek-nas\Veri"
$log    = "C:\Logs\yedek_$(Get-Date -Format yyyyMMdd).log"
New-Item -ItemType Directory -Path C:\Logs -Force | Out-Null

robocopy $kaynak $hedef /MIR /R:2 /W:5 /NP /LOG:$log

if ($LASTEXITCODE -ge 8) {
    Write-Warning "Yedekleme HATA ile bitti (kod $LASTEXITCODE). Log: $log"
} else {
    Write-Host "Yedekleme tamam (kod $LASTEXITCODE)"
}
```
- `/MIR` hedefi kaynakla **eşitler**, kaynakta silinen dosya hedeften de silinir. Dikkatli kullan.
- Robocopy çıkış kodları: 0-7 başarı/bilgi, **8 ve üstü hata**.

### 2.10 Zamanlanmış görev olarak kaydetme
```powershell
$eylem    = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -File C:\Scripts\yedek.ps1"
$tetik    = New-ScheduledTaskTrigger -Daily -At 02:00
Register-ScheduledTask -TaskName "GunlukYedek" -Action $eylem -Trigger $tetik -User "SYSTEM" -RunLevel Highest
Get-ScheduledTask -TaskName GunlukYedek
```

### 2.11 Uzak bilgisayarda komut çalıştırma
```powershell
Enable-PSRemoting -Force                                   # Hedefte (yönetici), bir kez
Invoke-Command -ComputerName PC01,PC02 -ScriptBlock { Get-Service Spooler } -Credential (Get-Credential)
Enter-PSSession -ComputerName PC01                         # Etkileşimli oturum, çıkış: exit
```

### 2.12 Olay günlüğünden hata özeti
```powershell
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2; StartTime=(Get-Date).AddDays(-1)} |
    Select-Object TimeCreated, Id, ProviderName, Message -First 20
```
`Level`: 1 Kritik, 2 Hata, 3 Uyarı.

### 2.13 Microsoft 365 / Graph
```powershell
Connect-MgGraph -Scopes "User.Read.All"
Get-MgUser -All -Property DisplayName,UserPrincipalName,AccountEnabled |
    Select DisplayName,UserPrincipalName,AccountEnabled |
    Export-Csv .\m365-kullanicilar.csv -NoTypeInformation -Encoding UTF8
```

### 2.14 E-posta ile rapor gönderme
Şirketin SMTP ve güvenlik politikasına bağlıdır. `Send-MailMessage` eski ve kullanımdan kalkma yolunda, güncel yaklaşım için kuruluşun yöntemine veya Graph API'ye bak.

## 3. Bash Temelleri (Linux)

### 3.1 Betik iskeleti
```bash
#!/bin/bash
set -euo pipefail        # Hatada dur, tanımsız değişkende dur, boru hatlarında hatayı yakala

ISIM="Ali"
echo "Merhaba $ISIM"

if [ -f /etc/passwd ]; then
    echo "Dosya var"
fi

for dosya in /var/log/*.log; do
    echo "$dosya"
done
```
Çalıştırma: `chmod +x betik.sh && ./betik.sh`

### 3.2 Faydalı kalıplar
| Amaç | Komut |
|---|---|
| Sonuç kodu | `$?` (0 = başarı) |
| Tarih etiketi | `$(date +%F_%H-%M)` |
| Dosyaya ekle | `echo "metin" >> log.txt` |
| Hata ve çıktıyı birlikte | `komut >> log.txt 2>&1` |
| Satır say | `wc -l dosya` |
| Sütun al | `awk '{print $1}' dosya` |
| Değiştir | `sed -i 's/eski/yeni/g' dosya` |
| Sırala/tekil | `sort dosya \| uniq -c \| sort -nr` |

### 3.3 rsync ile yedekleme
```bash
#!/bin/bash
set -euo pipefail
KAYNAK="/home/veri/"
HEDEF="/mnt/yedek/veri/"
LOG="/var/log/yedek.log"

echo "$(date '+%F %T') yedek basladi" >> "$LOG"
rsync -avh --delete "$KAYNAK" "$HEDEF" >> "$LOG" 2>&1
echo "$(date '+%F %T') yedek bitti" >> "$LOG"
```
`--delete` hedefte kaynakta olmayan dosyaları siler, ilk denemede `--dry-run` ekle.

### 3.4 Disk doluluk uyarısı
```bash
#!/bin/bash
ESIK=85
df -h --output=pcent,target | tail -n +2 | while read -r yuzde nokta; do
    kullanim=${yuzde%\%}
    if [ "$kullanim" -ge "$ESIK" ]; then
        echo "UYARI: $nokta %$kullanim dolu"
    fi
done
```

### 3.5 Başarısız SSH girişlerini özetleme
```bash
sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head
```
(Log biçimi dağıtıma göre değişebilir, alan numarasını kendi çıktına göre ayarla.)

### 3.6 cron'a ekleme
```
crontab -e
# dakika saat gün ay haftanın_günü komut
30 2 * * * /home/yonetici/yedek.sh
```
Cron ortamında PATH kısıtlıdır, betikte **tam yol** kullan.

## 4. Diğer Otomasyon Araçları (Kısa)
| Araç | Ne için |
|---|---|
| Toplu iş (`.bat`) | Basit, eski usul işler; yeni işlerde PowerShell tercih |
| Python | Çok platformlu otomasyon, API entegrasyonu, raporlama |
| Görev Zamanlayıcı / cron | Betikleri zamanlamak |
| Ansible | Birçok sunucuya aynı yapılandırmayı uygulama |
| Power Automate | Düşük kodlu iş akışları (M365 ile) |
| Git | Betik sürümleri ve geri dönüş |

C#/.NET geçmişin PowerShell'de doğrudan avantaj: .NET nesne ve sınıflarını biliyorsan betiklerin çok daha güçlü olur. Python'a da bir göz at, API ve rapor işlerinde çok kullanışlı.

## 5. İyi Betik Alışkanlıkları

- Başa **amaç, yazar, tarih, kullanım** yorumu koy
- Parametre kullan, sabit değerleri betiğin başında değişkene al
- Hata yakala (`try/catch`), anlamlı mesaj ver
- **Log tut** (ne zaman, ne yapıldı, kaç kayıt etkilendi)
- Yıkıcı işlemlerden önce `-WhatIf` / `--dry-run`
- Gizli bilgi (şifre, token) betiğe yazılmaz: `Get-Credential`, `SecretManagement`, ortam değişkeni veya kasa
- Betiği önce test OU'sunda / test makinesinde çalıştır
- Çalıştırmadan önce kodu **kendin oku**, internetten kopyaladığın betiği anlamadan çalıştırma
- Betik klasörünü Git'e koy, sürüm notu yaz

## 6. Betik Başlık Şablonu
```powershell
<#
.SYNOPSIS
    Kısa açıklama
.DESCRIPTION
    Ne yapar, hangi ön koşullar gerekir
.PARAMETER Bilgisayar
    Hedef bilgisayar adı
.EXAMPLE
    .\betik.ps1 -Bilgisayar PC01
.NOTES
    Yazar: ...  Tarih: ...  Sürüm: 1.0
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string]$Bilgisayar
)
```

## 7. Alıştırma Önerileri
1. Bilgisayar listesinden ping atıp ulaşılamayanları CSV'ye yazan betik
2. Her sabah disk doluluğunu kontrol edip %85 üstünü rapor eden zamanlanmış görev
3. CSV'den toplu kullanıcı oluşturan betik (lab'da, `-WhatIf` ile)
4. 90 gündür girmeyen hesapları listeleyen aylık rapor
5. Bir klasörü yedekleyip log tutan ve hata kodunu kontrol eden betik
6. Bash ile `/var/log/auth.log` içinden başarısız giriş özeti çıkaran betik
7. Betiklerini bir Git deposunda sürümle, README'ye ne işe yaradığını ve nasıl çalıştırılacağını yaz
