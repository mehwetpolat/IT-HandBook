# Cisco Switch Rehberi (Packet Tracer)

Bu rehber iki bölümden oluşur:

- **Bölüm A:** Switch temel ayarları, şifreleme ve erişim güvenliği
- **Bölüm B:** Sunucu servisleri ve kurcalanabilecek ek senaryolar

Örnek topoloji:

| Cihaz | IP | Not |
|---|---|---|
| Switch (SW1) Vlan1 | 192.168.1.10 /24 | Yönetim IP'si |
| Sunucu | 192.168.1.20 /24 | Servisler burada |
| Laptop1 | 192.168.1.11 /24 | Sabit ya da DHCP |
| Laptop2 | 192.168.1.12 /24 | Sabit ya da DHCP |

---

# BÖLÜM A: Switch Ayarları ve Güvenlik

## A1. CLI modları

| Mod | Prompt | Nasıl girilir | Ne yapılır |
|---|---|---|---|
| User EXEC | `Switch>` | Açılışta | ping, sınırlı show |
| Privileged EXEC | `Switch#` | `enable` | Tüm show, kaydetme, reload, clear |
| Global Config | `Switch(config)#` | `configure terminal` | Genel ayarlar |
| Interface Config | `Switch(config-if)#` | `interface vlan 1` / `interface fa0/1` | IP, port ayarı |
| Line Config | `Switch(config-line)#` | `line console 0` / `line vty 0 15` | Console ve uzaktan erişim |
| VLAN Config | `Switch(config-vlan)#` | `vlan 10` | VLAN adı |

Geçişler:
- `exit`: bir üst moda çıkar
- `end` veya Ctrl+Z: doğrudan `Switch#` moduna döner
- `disable`: `#` modundan `>` moduna iner
- Config modunda show/ping için başına `do` ekle: `do show ip interface brief`

## A2. Temel yapılandırma

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW1
SW1(config)# no ip domain-lookup
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.1.10 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.1.1
```

- `no ip domain-lookup`: Yanlış yazılan komutlarda DNS aramasını engeller, bekleme olmaz.
- `ip default-gateway`: Switch'e başka ağlardan erişmek için gerekli.

## A3. Enable şifresi (hash'li saklanır)

```
SW1(config)# enable secret Sifre123
```

- `enable secret` şifreyi hash'leyerek saklar (config'de `$1$...` görünür).
- `enable password` düz metin saklar. **Kullanma.** İkisi birlikte tanımlıysa `secret` geçerli olur.

## A4. Console şifresi

```
SW1(config)# line console 0
SW1(config-line)# password Console123
SW1(config-line)# login
SW1(config-line)# logging synchronous
SW1(config-line)# exec-timeout 5 0
SW1(config-line)# exit
```

- `login` yazmazsan şifre sorulmaz. En sık yapılan hata budur.
- `logging synchronous`: Log mesajları yazdığın komutu bölmez.
- `exec-timeout 5 0`: 5 dakika işlem yapılmazsa oturum kapanır.

## A5. VTY (telnet/SSH) şifresi

```
SW1(config)# line vty 0 15
SW1(config-line)# password Vty123
SW1(config-line)# login
SW1(config-line)# exit
```

Telnet şifreyi ağda düz metin taşır. Bu yüzden A7'de SSH'a geçilir.

## A6. Config'deki şifreleri gizleme

```
SW1(config)# service password-encryption
```

- Console ve vty şifrelerini `password 7 0822455D0A16` gibi gizler.
- **Type 7 zayıftır**, kolayca çözülür. Sadece omuz üstünden bakmaya karşı korur.
- Gerçek koruma: `enable secret` ve `username ... secret`.

| Tür | Komut | Güvenlik |
|---|---|---|
| Düz metin | `enable password`, `password` (service password-encryption yokken) | Yok |
| Type 7 | `service password-encryption` | Çok zayıf, geri çevrilebilir |
| Type 5 | `enable secret`, `username ... secret` | MD5 hash, tek yönlü |

## A7. SSH kurulumu

```
SW1(config)# ip domain-name lab.local
SW1(config)# username admin secret Admin123
SW1(config)# crypto key generate rsa
```

Anahtar boyutunu sorarsa `1024` yaz (mümkünse 2048 daha iyi). Sonra:

```
SW1(config)# ip ssh version 2
SW1(config)# line vty 0 15
SW1(config-line)# login local
SW1(config-line)# transport input ssh
SW1(config-line)# exit
```

- Hostname ve domain-name olmadan RSA anahtarı üretilmez.
- `login local`: Yerel kullanıcı adı/şifre kullanılır.
- `transport input ssh`: Telnet'i kapatır.

Laptop'tan test: `C:\> ssh -l admin 192.168.1.10`

## A8. Banner

```
SW1(config)# banner motd #Yetkisiz erisim yasaktir!#
```

`#` işareti başlangıç ve bitiş ayracıdır. Mesajın içinde `#` kullanma.

## A9. Brute-force koruması (ek güvenlik)

```
SW1(config)# security passwords min-length 8
SW1(config)# login block-for 60 attempts 3 within 30
SW1(config)# login on-failure log
SW1(config)# login on-success log
```

Bazı komutlar Packet Tracer'ın switch sürümünde desteklenmeyebilir. `?` ile kontrol et.

## A10. Port güvenliği

```
SW1(config)# interface fa0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 1
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation shutdown
```

- `sticky`: Portta ilk görülen MAC adresini otomatik öğrenip config'e yazar.
- `violation` modları:
  - `shutdown`: Port kapanır (err-disabled). Varsayılandır.
  - `restrict`: Paketleri düşürür ve log yazar.
  - `protect`: Paketleri sessizce düşürür.
- Kontrol: `show port-security`, `show port-security interface fa0/1`
- Port err-disabled olduysa kurtarma:
  ```
  SW1(config-if)# shutdown
  SW1(config-if)# no shutdown
  ```
- Test: Fa0/1'deki laptop'u çıkarıp başka bir cihaz tak, portun kapandığını gör.

## A11. Kullanılmayan portları kapatma

```
SW1(config)# interface range fa0/7 - 24
SW1(config-if-range)# shutdown
SW1(config-if-range)# description KULLANILMIYOR
```

Gerçek ağlarda kullanılmayan portlar kapatılır, ayrıca ayrı bir "kullanılmayan" VLAN'a alınır.

## A12. VLAN oluşturma ve port atama

```
SW1(config)# vlan 10
SW1(config-vlan)# name MUHASEBE
SW1(config-vlan)# exit
SW1(config)# vlan 20
SW1(config-vlan)# name IT
SW1(config-vlan)# exit
SW1(config)# interface fa0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
```

- Farklı VLAN'daki cihazlar, router veya Layer 3 olmadan birbirini ping'leyemez. Bunu denemek öğreticidir.
- Kontrol: `show vlan brief`

## A13. Kaydetme ve kontrol

```
SW1(config)# end
SW1# write memory
```

`write memory`, `copy running-config startup-config` ile aynıdır. Kaydetmezsen reload'da ayarlar kaybolur.

Kontrol komutları:

| Komut | Ne gösterir |
|---|---|
| `show running-config` | Çalışan config, şifrelerin gizli olduğunu doğrula |
| `show startup-config` | Kayıtlı config |
| `show ip interface brief` | Port ve Vlan IP durumu |
| `show interfaces status` | Port hızı, VLAN, durum |
| `show vlan brief` | VLAN ve port ilişkisi |
| `show mac address-table` | Hangi MAC hangi portta |
| `show arp` | IP-MAC eşlemeleri |
| `show ip ssh` | SSH durumu |
| `show users` | Bağlı oturumlar |
| `show version` | Model, IOS, çalışma süresi |
| `show port-security` | Port güvenliği durumu |

## A14. Console bağlantısı (laptop ile switch)

1. Connections (yıldırım) > **Console** kablosu (açık mavi, rollover).
2. Bir ucu laptop **RS 232**, diğer ucu switch **Console** portuna.
3. Laptop > Desktop > **Terminal**. Ayarlar:
   - Bits per second: `9600`
   - Data bits: `8`
   - Parity: `None`
   - Stop bits: `1`
   - Flow control: `None`
4. Enter'a bas. Banner, ardından `Password:` gelir. Console şifresini gir.
5. `SW1>` gelir. `enable` yaz, enable şifresini gir.

Console'da denenecekler:
- Yanlış şifre girip reddedildiğini gör.
- `show running-config` ile şifrelerin hash'li/gizli olduğunu kontrol et.
- Bir portu `shutdown` yap, o porttaki laptop'tan ping at, kesildiğini gör, sonra `no shutdown`.
- `show mac address-table` ile MAC öğrenimini izle.
- Enable şifresini değiştir ve `write memory` ile kaydet.

## A15. Yaygın hatalar

| Belirti | Olası neden |
|---|---|
| `% Invalid input detected` | Yanlış modda ya da yanlış yazılmış komut |
| Şifre sormuyor | `login` komutu unutulmuş |
| SSH bağlanmıyor | RSA anahtarı yok, `ip domain-name`/hostname eksik, `login local` yok |
| İlk ping düşüyor | ARP çözülüyor, normaldir, tekrar dene |
| Port turuncu/kırmızı | STP bekleme süresi ya da port `shutdown` |
| Port err-disabled | Port güvenliği ihlali |
| Ayarlar reload sonrası gitti | `write memory` yapılmamış |
| Laptop IP alamıyor (169.254.x.x) | DHCP yok, elle IP ver |
| Aynı IP iki cihazda | IP çakışması, ping düzensiz |

---

# BÖLÜM B: Sunucu ve Kurcalanabilecek Senaryolar

Sunucuya tıkla: **Desktop > IP Configuration** ile IP ver (`192.168.1.20`). Servisler **Services** sekmesindedir.

## B1. HTTP (web sunucusu)
- Services > HTTP: HTTP **On**.
- `index.html` dosyasını **Edit** ile değiştir.
- Laptop > Web Browser: `http://192.168.1.20`

Kurcala: Yeni HTML dosyası ekle, iki laptop'tan aynı anda aç.

## B2. DNS
- Services > DNS: **On**.
- Name: `www.lab.local`, Address: `192.168.1.20`, **Add**.
- Laptop IP Configuration > DNS Server: `192.168.1.20`.
- Laptop'ta `ping www.lab.local` ya da tarayıcıda `www.lab.local`.
- Switch'te isimle ping için:
  ```
  SW1(config)# ip domain-lookup
  SW1(config)# ip name-server 192.168.1.20
  ```

Kurcala: Birden çok kayıt ekle (`mail.lab.local`, `ftp.lab.local`), yanlış IP girip ne olduğunu gör.

## B3. DHCP
- Services > DHCP: **On**.
  - Default Gateway: `192.168.1.1`
  - DNS Server: `192.168.1.20`
  - Start IP: `192.168.1.100`
  - Subnet Mask: `255.255.255.0`
  - Maximum Users: `50`
  - **Save**
- Laptop'ları **DHCP** moduna al.

Kurcala:
- Start IP'yi `.100`'den başlat ki switch (`.10`) ve sunucu (`.20`) ile çakışmasın.
- Maximum Users'ı `1` yap, ikinci laptop'un IP alamadığını gör.
- Switch'te DHCP snooping dene (gerçek cihazlarda): sahte DHCP sunucusuna karşı koruma.

## B4. TFTP (config yedeği)
- Services > TFTP: **On**.
- Yedek alma:
  ```
  SW1# copy running-config tftp
  Address or name of remote host []? 192.168.1.20
  Destination filename [SW1-confg]? (Enter)
  ```
- Geri yükleme: `copy tftp running-config`
- Startup config yedeği: `copy startup-config tftp`

Kurcala: Config'i yedekle, switch'te bir şey boz, yedekten geri yükle. Gerçek hayatta çok kullanılır.

## B5. Syslog
- Services > SYSLOG: **On**.
- Switch:
  ```
  SW1(config)# logging host 192.168.1.20
  SW1(config)# logging trap informational
  SW1(config)# service timestamps log datetime msec
  ```
- Bir portu `shutdown` / `no shutdown` yap, logları sunucuda izle.

Kurcala: Port güvenliği ihlali oluştur, yanlış şifre dene, log düşüyor mu bak.

## B6. FTP
- Services > FTP: **On**, kullanıcı adı/şifre ve izinler (Write, Read, Delete, Rename, List).
- Laptop > Command Prompt: `ftp 192.168.1.20`, giriş yap.
- Komutlar: `dir`, `get dosya`, `put dosya`, `quit`.

Kurcala: Farklı izinlerle iki kullanıcı oluştur, sadece okuma yetkisi olanın dosya yükleyemediğini gör.

## B7. NTP (saat)
- Services > NTP: **On**.
- Switch: `ntp server 192.168.1.20`
- Kontrol: `show ntp status`, `show clock`
- Elle saat: `clock set 14:30:00 21 October 2026` (`SW1#` modunda)

## B8. E-posta
- Services > EMAIL: SMTP ve POP3 **On**, domain `lab.local`, kullanıcılar ekle.
- Laptop > Desktop > **Email**: hesabı kur, iki laptop arasında mail gönder.

## B9. AAA / RADIUS (ileri seviye, en sona)
- Services > AAA: kullanıcıları sunucuda tut.
- Switch:
  ```
  SW1(config)# aaa new-model
  SW1(config)# radius-server host 192.168.1.20 key RadiusAnahtar
  SW1(config)# aaa authentication login default group radius local
  ```
- `local` yedeği bırak, yoksa sunucuya erişemezsen kendini dışarıda bırakırsın.

## B10. Ek kurcalama fikirleri

**Ağ tasarımı**
- İkinci switch ekle, iki switch'i cross-over/straight kabloyla bağla, **trunk** yap:
  ```
  SW1(config)# interface gig0/1
  SW1(config-if)# switchport mode trunk
  ```
- VLAN'ları iki switch arasında taşı, farklı switch'lerdeki aynı VLAN cihazlarını ping'le.
- Router ekle, **router-on-a-stick** ile VLAN'lar arası yönlendirme kur (alt arayüzler `fa0/0.10`, `fa0/0.20`, `encapsulation dot1Q 10`).

**Güvenlik**
- Telnet ile SSH'ı karşılaştır. Packet Tracer simülasyon modunda telnet paketinde şifrenin düz metin olduğunu gör.
- ACL ile belirli IP'lerin sunucuya erişimini kısıtla (router üzerinde).
- Port güvenliğini test et (A10).

**Sorun giderme egzersizleri**
- Bilerek yanlış subnet maskesi ver, ping'in neden gitmediğini bul.
- Bir portu yanlış VLAN'a at, bağlantı kopmasını gözlemle.
- Aynı IP'yi iki cihaza ver, çakışmayı gör.
- Kabloyu çıkar, `show interfaces status` ve MAC tablosunun değişimine bak.

**Sertifika ve pratik odağı (IT destek ve sistem yönetimi)**
- DHCP, DNS, TFTP/Syslog, VLAN ve port güvenliği sahada en sık karşılaşılan konulardır.
- CCNA konularının büyük kısmı bu laboratuvarla pratik edilebilir.
- Yaptığın ayarların ekran görüntülerini ve `show run` çıktısını not olarak sakla; ileride referans olur.

---

## Önerilen çalışma sırası

1. A2: Temel IP ve hostname
2. A3-A8: Şifreler, SSH, banner
3. A13-A14: Kaydet ve console'dan test
4. B1-B3: HTTP, DNS, DHCP
5. B4-B5: TFTP yedeği ve Syslog
6. A10-A12: Port güvenliği ve VLAN
7. B6-B8: FTP, NTP, E-posta
8. B9-B10: AAA ve ileri senaryolar

## Hızlı komut özeti

```
enable
configure terminal
hostname SW1
no ip domain-lookup
enable secret Sifre123
service password-encryption
line console 0
 password Console123
 login
 logging synchronous
 exec-timeout 5 0
 exit
ip domain-name lab.local
username admin secret Admin123
crypto key generate rsa
ip ssh version 2
line vty 0 15
 login local
 transport input ssh
 exit
banner motd #Yetkisiz erisim yasaktir!#
end
write memory
```

> Not: Örnekteki şifreler sadece laboratuvar içindir. Gerçek cihazlarda uzun ve tahmin edilmesi zor şifreler kullan.
