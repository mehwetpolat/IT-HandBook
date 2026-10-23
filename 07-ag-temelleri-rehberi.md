# Ağ Temelleri Rehberi

Ağ sorunlarını tahmin ederek değil **katman katman** çözebilmek için gereken temel bilgiler. Cisco'ya özel komutlar için `cisco-switch-rehberi.md` dosyasına bak.

---

# 1. MODELLER

## 1.1 OSI ve TCP/IP karşılaştırması

| OSI katmanı | TCP/IP | Birim | Örnekler | Tipik sorun |
|---|---|---|---|---|
| 7 Uygulama | Uygulama | Veri | HTTP, DNS, SMTP, RDP | Servis kapalı, yanlış ayar |
| 6 Sunum | Uygulama | Veri | TLS, şifreleme | Sertifika hatası |
| 5 Oturum | Uygulama | Veri | Oturum yönetimi | Oturum kopması |
| 4 Taşıma | Taşıma | Segment | TCP, UDP | Port engelli |
| 3 Ağ | İnternet | Paket | IP, ICMP, yönlendirme | Yanlış IP, gateway |
| 2 Veri bağı | Ağ erişimi | Çerçeve | Ethernet, MAC, VLAN, Wi-Fi | VLAN/MAC/duplex |
| 1 Fiziksel | Ağ erişimi | Bit | Kablo, fiber, sinyal | Kopuk kablo |

**Pratik kural:** Alttan yukarı kontrol et. Kablo yoksa DNS'i inceleme.

## 1.2 TCP ve UDP

| | TCP | UDP |
|---|---|---|
| Bağlantı | Bağlantılı (3'lü el sıkışma) | Bağlantısız |
| Güvenilirlik | Teslim garantisi, sıralama | Garanti yok |
| Hız | Daha yavaş | Hızlı, hafif |
| Kullanım | Web, e-posta, dosya aktarımı | DNS sorguları, VoIP, video, DHCP |

---

# 2. ADRESLEME

## 2.1 MAC ve IP

- **MAC adresi:** Ağ kartının fiziksel adresi, aynı ağ (L2) içinde kullanılır.
- **IP adresi:** Mantıksal adres, ağlar arası (L3) kullanılır.
- **ARP:** IP'den MAC'i bulur. `arp -a`

## 2.2 Subnet hesabı (kısa yol)

Host sayısı = 2^(host bit) − 2

| CIDR | Maske | Host | Blok boyutu (son oktet) |
|---|---|---|---|
| /24 | 255.255.255.0 | 254 | 256 |
| /25 | 255.255.255.128 | 126 | 128 |
| /26 | 255.255.255.192 | 62 | 64 |
| /27 | 255.255.255.224 | 30 | 32 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 4 |

**Örnek:** `192.168.10.77/26` → blok boyutu 64 → ağ adresi `192.168.10.64`, ilk host `.65`, son host `.126`, broadcast `.127`.

**Aynı ağda mı?** İki IP'yi aynı maskeyle karşılaştır; ağ adresleri aynıysa aynı ağdadır, değilse trafik **gateway** üzerinden gider.

## 2.3 Özel IP aralıkları (RFC 1918)

| Aralık | CIDR |
|---|---|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 |

Özel adresler internete çıkarken **NAT** ile genel adrese çevrilir.

## 2.4 IP planı önerileri
- Bölümlere/VLAN'lara ayrı subnet ver: kullanıcılar, sunucular, yazıcılar, misafir Wi-Fi, yönetim.
- Sabit IP'leri DHCP aralığının dışında tut.
- Gateway için tutarlı bir kural kullan (ör. her ağın `.1` adresi).
- Planı **dokümante et** ve güncel tut.

Örnek plan:

| VLAN | Ad | Subnet | Amaç |
|---|---|---|---|
| 10 | Kullanıcı | 10.10.10.0/24 | Ofis bilgisayarları |
| 20 | Sunucu | 10.10.20.0/24 | Sunucular |
| 30 | Yazıcı | 10.10.30.0/24 | Yazıcı/IoT |
| 40 | Misafir | 10.10.40.0/24 | Misafir Wi-Fi (internet-only) |
| 99 | Yönetim | 10.10.99.0/24 | Switch/AP yönetimi |

---

# 3. TEMEL AĞ SERVİSLERİ

| Servis | Görev | Port |
|---|---|---|
| DHCP | Otomatik IP dağıtımı | UDP 67/68 |
| DNS | İsim → IP çözümleme | UDP/TCP 53 |
| NTP | Saat eşitleme | UDP 123 |
| HTTP/HTTPS | Web | TCP 80/443 |
| SSH | Güvenli uzak komut satırı | TCP 22 |
| RDP | Windows uzak masaüstü | TCP 3389 |
| SMB | Dosya paylaşımı | TCP 445 |
| LDAP/LDAPS | Dizin servisi (AD) | TCP 389/636 |
| Syslog | Merkezi log | UDP 514 |
| SNMP | İzleme | UDP 161/162 |

**Neden saat önemli?** Kerberos ve sertifikalar zamana bağlıdır. 5 dakikadan fazla saat farkı AD girişini bozar.

---

# 4. VLAN, TRUNK VE YÖNLENDİRME

## 4.1 VLAN neden kullanılır?
- Broadcast alanını küçültür.
- Bölümleri güvenlik amacıyla ayırır.
- Fiziksel olarak aynı switch'te farklı mantıksal ağlar sağlar.

## 4.2 Access ve trunk port
- **Access:** Tek VLAN'a ait uç cihaz portu (bilgisayar, yazıcı).
- **Trunk:** Birden çok VLAN'ı taşır (switch-switch, switch-router/firewall). 802.1Q etiketi kullanır.
- **Native VLAN:** Etiketlenmeden taşınan VLAN; iki uçta aynı olmalı.

## 4.3 VLAN'lar arası yönlendirme
- **Router-on-a-stick:** Tek fiziksel link üzerinde alt arayüzler.
- **L3 switch (SVI):** Her VLAN için `interface vlan X` ve IP; en yaygın kurumsal yöntem.

## 4.4 Yönlendirme temelleri
- **Statik rota:** Elle tanımlanır, basit ağlar için.
- **Dinamik yönlendirme:** OSPF (kurum içi), BGP (internet/ISS) gibi protokoller.
- **Varsayılan rota (0.0.0.0/0):** Bilinmeyen tüm hedefler için çıkış.

```
tracert 8.8.8.8     # Windows: paket hangi sıçramalardan geçiyor
traceroute 8.8.8.8  # Linux
```

---

# 5. NAT, GÜVENLİK DUVARI, PROXY

| Kavram | Açıklama |
|---|---|
| NAT / PAT | Özel IP'leri tek genel IP arkasında paylaştırır |
| Port yönlendirme | Dışarıdan gelen belirli portu içerideki cihaza iletir (riskli, dikkat) |
| Stateful güvenlik duvarı | Bağlantı durumunu izler, dönüş trafiğine otomatik izin verir |
| ACL | Kaynak/hedef/port bazlı izin veya engel kuralları |
| Proxy | İstemci adına web isteği yapar, filtreleme ve loglama sağlar |
| IDS/IPS | Saldırı imzalarını izler (IPS engeller) |

**Kural yazma ilkeleri:**
- Varsayılan olarak **reddet**, ihtiyaç olanı aç (least privilege).
- Kurallara açıklama yaz, sahibini ve tarihini belirt.
- Kuralları periyodik gözden geçir; kullanılmayanları kaldır.
- Yönetim arayüzlerini (SSH, RDP, web yönetimi) internete **açma**.

---

# 6. WI-FI

## 6.1 Temel bilgiler
| Konu | Not |
|---|---|
| 2.4 GHz | Menzil uzun, hız düşük, kalabalık (1, 6, 11 kanalları çakışmaz) |
| 5 GHz | Hız yüksek, menzil kısa, çok kanal |
| 6 GHz (Wi-Fi 6E/7) | Çok az kalabalık, menzil çok kısa |
| SSID | Ağ adı |
| WPA2/WPA3-Personal | Ortak parola (küçük ofis, ev) |
| WPA2/WPA3-Enterprise | Kişisel kimlik (802.1X/RADIUS), kurumsal ortam için önerilir |

## 6.2 Sık Wi-Fi sorunları
- **Sürekli kopma:** Kanal çakışması, zayıf sinyal, güç tasarrufu ayarı, sürücü.
- **Yavaşlık:** Çok istemci, eski cihazlar ağı yavaşlatır, AP yerleşimi.
- **Gezerken kopma:** Roaming/AP yerleşimi, aynı SSID ve güvenlik ayarı.
- **Misafir ağı:** Ayrı VLAN, internet-only, istemci izolasyonu.

## 6.3 Kurulum önerileri
- AP'leri tavana, açık alana yerleştir; kalın duvar/metal engellerinden kaçın.
- Komşu kanallarla çakışmayı Wi-Fi analiz uygulamasıyla ölç.
- Yönetim ve misafir trafiği ayrı VLAN'da olsun.

---

# 7. VPN VE UZAKTAN ERİŞİM

| Tür | Kullanım |
|---|---|
| Site-to-site VPN | İki ofisi/ağı birbirine bağlar (IPsec) |
| Remote access VPN | Çalışanın evden kuruma bağlanması (IPsec, SSL VPN, WireGuard) |
| Zero Trust / ZTNA | Ağa değil, uygulamaya kimlik ve cihaz sağlığıyla erişim |

**İyi uygulamalar:**
- VPN girişinde **MFA** zorunlu olsun.
- Split tunnel (yalnızca kurum trafiği VPN'den) / full tunnel kararını bilinçli ver.
- VPN erişimini gruplarla sınırla, kullanıcıların erişebildiği segmentleri daralt.
- İstemci ve sunucu yazılımlarını güncel tut.

---

# 8. AĞ SORUN GİDERME ARAÇLARI

| Araç | Ne için |
|---|---|
| `ping` | Erişim ve gecikme |
| `tracert` / `traceroute` | Yol ve hangi sıçramada takıldığı |
| `nslookup` / `dig` | DNS sorguları |
| `ipconfig /all` / `ip a` | IP, DNS, DHCP bilgisi |
| `arp -a` | IP-MAC eşlemesi |
| `netstat -ano` / `ss -tulpn` | Açık portlar ve bağlantılar |
| `Test-NetConnection -Port` | Belirli porta erişim |
| Wireshark | Paket analizi |
| Nmap | Port ve cihaz keşfi (yalnızca yetkin olduğun ağlarda) |
| iperf3 | Bant genişliği testi |

## 8.1 Ağ sorun giderme akışı

1. **Kapsam:** Tek cihaz mı, bir VLAN mı, herkes mi?
2. **Fiziksel:** Kablo, port ışığı, Wi-Fi bağlantısı.
3. **IP:** Doğru IP/maske/gateway/DNS? `169.254` = DHCP yok.
4. **Gateway:** `ping gateway`
5. **Dış ağ:** `ping 8.8.8.8`
6. **DNS:** `nslookup alan.adi`
7. **Port/servis:** `Test-NetConnection sunucu -Port 443`
8. **Güvenlik duvarı/proxy:** Kural, log, filtre.

## 8.2 Belirti → olası neden

| Belirti | Olası neden |
|---|---|
| Hiç IP yok | Kablo, DHCP, VLAN, port kapalı |
| IP var, gateway'e ping yok | Yanlış VLAN/maske, switch sorunu |
| IP ile gidiyor, isimle gitmiyor | DNS |
| Ping var, site/servis açılmıyor | Port, güvenlik duvarı, servis, proxy |
| Aralıklı kopma | Kablo, Wi-Fi, çakışan IP, döngü |
| Yavaşlık | Bant genişliği, duplex, hata sayaçları, DNS gecikmesi |
| Yalnızca belirli kişiler | Grup/politika/izin, istemci ayarı |

---

# 9. TEMEL AĞ GÜVENLİĞİ

- Varsayılan şifreleri değiştir (switch, AP, yazıcı, kamera).
- Telnet/HTTP yerine **SSH/HTTPS** kullan.
- Kullanılmayan portları kapat, port güvenliği/802.1X uygula.
- Yönetim ağını ayır, erişimi sınırla.
- Ağ cihazı yazılımlarını güncelle, yapılandırma yedeği al.
- Logları merkezi bir noktaya (syslog) topla.
- Misafir ve IoT cihazlarını kurumsal ağdan ayır.
- **Rogue DHCP** için DHCP snooping, **ARP spoofing** için dynamic ARP inspection düşün.

---

# 10. MİNİ ÇALIŞMA PLANI

| Hafta | Konu | Uygulama |
|---|---|---|
| 1 | OSI, IP, subnet | 10 farklı subnet hesabı çöz |
| 2 | DHCP, DNS | Lab'da Windows Server ile kur |
| 3 | VLAN, trunk | Packet Tracer ile iki VLAN, trunk |
| 4 | Yönlendirme, NAT | Router ile iki ağı bağla |
| 5 | Güvenlik duvarı/ACL | Belirli IP'lere erişimi kısıtla |
| 6 | Wi-Fi ve VPN | Wireguard/OpenVPN kurulumu |
| 7 | Wireshark | DHCP, DNS, TCP el sıkışmasını yakala |
