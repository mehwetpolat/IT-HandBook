# Kurumsal Güvenlik Duvarı (Firewall) ve VPN Rehberi

Bir kurumun dış dünyaya açılan kapısı ve en kritik güvenlik hattı: Güvenlik Duvarı (Firewall), NAT mimarileri, Web/Uygulama filtreleme, SSL Inspection, IPsec Site-to-Site VPN ve SSL VPN uzaktan erişim yapılandırmaları.

> **Önemli Kural:** Güvenlik duvarında "önce izin ver, sonra engelle" mantığı **yoktur**. Kurallar yukarıdan aşağıya (top-to-bottom) taranır; ilk eşleşen kural çalışır ve tarama biter (First-Match). En altta daima gizli bir "Tümünü Reddet" (Implicit Deny) kuralı vardır.

---

# 1. TEMEL MİMARİ VE KURALLAR

## 1.1 Zone (Bölge) Mantığı
Kurumsal güvenlik duvarlarında (FortiGate, pfSense, Palo Alto, Sophos, Check Point) arayüzler mantıksal **Zone**'lara ayrılır:

| Zone Adı | Tipik Arayüz / VLAN | Güven Seviyesi | Açıklama |
|---|---|---|---|
| **WAN** (Untrusted) | İnternet çıkışı (Fiber, Metro Ethernet, VDSL) | 0 (En düşük) | Doğrudan internete açık, tüm gelen trafik varsayılan olarak kapalı. |
| **LAN** (Trusted) | Ofis bilgisayarları, kullanıcı cihazları | 100 (Yüksek) | İnternete çıkışına kontrollü izin verilir. |
| **DMZ** (Demilitarized) | Web sunucu, Mail sunucu, VPN Gateway | 50 (Orta) | Dış dünyadan erişilebilen ancak iç LAN'a doğrudan erişimi engellenmiş izole bölge. |
| **Server** (DataCenter) | DC, Veritabanı, Dosya sunucusu | 90 (Çok Yüksek) | Yalnızca yetkili portlardan ve yetkili istemcilerden erişime izin verilen bölge. |
| **Guest** (Misafir) | Misafir Wi-Fi ağı | 10 (Düşük) | Yalnızca doğrudan internete çıkabilir; iç ağlara kesinlikle erişemez (İstemci İzolasyonu açık). |

## 1.2 Kural Yazma İlkeleri (Firewall Policy)
1. **Asla Any-to-Any kuralı yazma:** Kaynak (Source), Hedef (Destination), Servis (Service/Port) ve Zaman (Schedule) net olarak tanımlanmalıdır.
2. **Kural Açıklaması (Comment):** Her kurala *neden açıldığı*, *hangi ticket/talep numarasıyla ilişkili olduğu*, *kimin onayladığı* ve *tarihi* yazılmalıdır.
3. **Kural Sıralaması:** En özel (spesifik) kurallar en üste, daha genel kurallar alta konmalıdır.

---

# 2. NAT (NETWORK ADDRESS TRANSLATION) TÜRLERİ

| NAT Türü | Terimler | Ne Yapar | Örnek Kullanım |
|---|---|---|---|
| **SNAT** (Source NAT) | Masquerade, Overload, PAT | İç ağdaki özel IP'leri (örn. `10.0.0.50`), tek bir genel WAN IP'si arkasına gizleyerek port bazlı çevirir. | Ofis bilgisayarlarının internete çıkışı. |
| **DNAT** (Destination NAT) | Virtual IP (VIP), Port Forwarding | Dışarıdan genel IP'nin belirli bir portuna gelen trafiği iç ağdaki sunucunun özel IP'sine yönlendirir. | `WAN_IP:443` isteğini `10.10.20.15:443` DMZ Web sunucusuna yönlendirme. |
| **1:1 NAT** | Static NAT | Bir genel IP'yi birebir bir özel yerel IP ile eşleştirir. | Özel mail sunucusu veya PBX santral için tahsis edilen statik IP. |

> **Güvenlik Uyarısı (Port Forwarding):** RDP (3389), SMB (445), SSH (22) veya web yönetim panellerini doğrudan genel IP'den internete açmak **ağır bir güvenlik ihlalidir**. Dışarıdan erişim gereken durumlarda port açmak yerine mutlaka **VPN + MFA** kullanılmalıdır.

---

# 3. İLERİ DÜZEY GÜVENLİK PROFİLLERİ (UTM / NGFW)

## 3.1 Web Filtreleme (Web Filtering)
- **Kategori Bazlı:** Kumar, zararlı yazılım (Malware/Phishing), yasa dışı içerik, oyun ve streaming kategorileri engellenir.
- **Güvenli Arama (SafeSearch):** Arama motorlarında müstehcen içeriklerin otomatik filtrelenmesi zorlanır.
- **Kullanıcı/Grup Yetkilendirmesi:** AD SSO (FSSO / User-ID) entegrasyonu ile muhasebe grubu bankacılık sitelerine girebilirken, diğer gruplara kısıtlama uygulanabilir.

## 3.2 Uygulama Denetimi (Application Control)
Port tabanlı engelleme yetersizdir (çünkü birçok uygulama standart 802/443 portunu kullanır).
- Uygulama denetimi ile paket içeriğindeki protokol imzaları incelenir:
  - **Tor, UltraSurf, Psiphon, VPN istemcileri:** Ağdan kaçış tünelleri engellenir.
  - **P2P / BitTorrent:** Dosya paylaşımı ve telif ihlali önlenir.
  - **Uzak Masaüstü:** AnyDesk, TeamViewer gibi programlar şirket politikasına göre engellenir veya yalnızca IT grubuna açılır.

## 3.3 SSL/TLS Inspection (Derin Paket İnceleme - DPI)
İnternet trafiğinin %95'i HTTPS ile şifrelidir. Şifreli trafik incelenmezse güvenlik duvarı zararlı yazılımları göremez.
- **Certificate Inspection (SNI Kontrolü):** Yalnızca ziyaret edilen alan adı sertifikasından hedefe bakar. Şifreyi çözmez, hafif ve sorunsuzdur.
- **Full Deep Inspection (DPI):** Firewall bağlantıyı kendi üzerinde sonlandırır (Man-in-the-Middle), paketi çözer, antivirüs/IPS taraması yapar ve istemciye kendi sertifikasıyla yeniden şifreler.
  - *Zorunluluk:* Firewall CA kök sertifikası Active Directory GPO veya Intune ile tüm şirket bilgisayarlarına "Güvenilen Kök Sertifika Yetkilisi" olarak dağıtılmalıdır.
  - *İstisna:* Bankacılık, sağlık ve kişisel veriler içeren kategoriler yasal ve teknik sebeplerle SSL Inspection'dan muaf (Bypass) tutulmalıdır.

---

# 4. SITE-TO-SITE IPSEC VPN

İki farklı ofisi veya fabrikayı internet üzerinden sanki aynı yerel ağdaymış gibi şifreli tünelle bağlar.

## 4.1 İki Aşamalı El Sıkışma Mantığı
```
[Merkez Firewall] <====== İnternet (Şifreli IPsec Tünel) ======> [Şube Firewall]
 10.10.0.0/16                                                     10.20.0.0/24
```

1. **Phase 1 (IKE SA - Güvenli İletişim Kanalının Kurulması):**
   - Karşılıklı kimlik doğrulama (Pre-Shared Key veya Sertifika).
   - IKE Sürümü: IKEv2 tercih edilmelidir (IKEv1'e göre daha hızlı, kararlı ve güvenlidir).
   - Şifreleme: AES-256 veya AES-GCM-256.
   - Hash / Integrity: SHA-256 veya SHA-384.
   - Diffie-Hellman (DH) Grubu: En az Group 14 (2048-bit), Group 19 (256-bit ECP) veya Group 20. (Group 1, 2, 5 artık güvensizdir!)
   - DPD (Dead Peer Detection): Karşı tarafın ayakta olup olmadığını kontrol eder, koparsa tüneli yeniden başlatır.

2. **Phase 2 (IPsec SA - Verinin Taşınacağı Tünel):**
   - Hangi alt ağlar birbiriyle konuşacak? (Local Subnet & Remote Subnet).
   - Teklifler (Proposals): AES-256, SHA-256.
   - PFS (Perfect Forward Secrecy): Açık tutulmalı (Anahtarın çalınması halinde geçmiş trafik çözülemez).

## 4.2 Site-to-Site VPN Kurulum Kontrol Listesi
- [ ] Her iki uçta da Phase 1 ve Phase 2 parametreleri (Şifreleme, Hash, DH Group, Lifetime) **birebir aynı** mı?
- [ ] Pre-Shared Key (Ortak parola) her iki cihazda hatasız girildi mi?
- [ ] Local ve Remote subnet tanımları ters simetrik mi? (Merkezin Local'i = Şubenin Remote'u).
- [ ] Tünel arayüzleri arasında Firewall Policy (geçiş izni) yazıldı mı? (Hem Merkez hem Şube tarafında gidiş-dönüş izinleri).
- [ ] Routing (Yönlendirme): Karşı şubenin subnet'ine giden paketler IPsec tünel arayüzüne yönlendirildi mi? (Statik Rota tanımlandı mı?).

---

# 5. UZAKTAN ERİŞİM: CLIENT-TO-SITE SSL VPN

Çalışanların evden veya seyahatteyken şirket içi kaynaklara güvenli erişmesi.

## 5.1 En İyi Güvenlik Uygulamaları
- **MFA / 2FA Zorunluluğu:** Sadece kullanıcı adı + şifre yeterli değildir; SMS, Authenticator OTP veya FIDO2 token şart koşulmalıdır.
- **Split Tunneling vs Full Tunneling:**
  - *Split Tunneling:* Yalnızca şirket içi IP'lere (`10.0.0.0/8`, `172.16.0.0/12`) giden trafik VPN'den akar, kullanıcının internet aramaları ve YouTube trafiği kendi ev internetinden gider. Kurum bant genişliğini korur.
  - *Full Tunneling:* Kullanıcının tüm internet trafiği şirket güvenlik duvarı üzerinden geçer. Yüksek güvenlik gerektiren kurumlar için uygundur, kurum internetini yoğun tüketir.
- **Host Check / Endpoint Compliance:** Bağlanan bilgisayarda antivirüs açık mı, Windows güncel mi, BitLocker aktif mi kontrol edilir (FortiClient EMS veya Intune Network Access).

---

# 6. DUAL-WAN, FAILOVER VE SD-WAN

Kurumsal süreklilik için tek bir internet hattı yeterli değildir (Metro Ethernet + Yedek VDSL / 4G LTE).

## 6.1 Link Health Check (Hat Sağlık İzleme)
Firewall sürekli olarak dış DNS'lere (`8.8.8.8`, `1.1.1.1`) veya ISP gateway'ine ping paketleri gönderir:
- Paket kaybı > %50 veya gecikme > 200ms olduğunda hattı "Ölü (Dead)" ilan eder.
- Varsayılan rotayı otomatik olarak yedek hatta (WAN2) geçirir (Failover).
- Birinci hat düzeldiğinde trafiği otomatik olarak ana hatta geri alır (Failback).

## 6.2 SD-WAN Kuralları
- VoIP ve Teams toplantı trafiği: Düşük gecikmeli ve en kaliteli hata yönlendirilir.
- ERP ve Finans yazılımları: Metro Ethernet üzerinden akar.
- Genel internet ve indirmeler: Yedek veya daha yüksek bant genişlikli geniş bant hattına verilir.

---

# 7. FIREWALL SORUN GİDERME SENARYOLARI VE KOMUTLARI

## 7.1 Senaryo: "Tünel Up Görünüyor Ama Ping Gitmiyor"
1. **Firewall Policy kontrolü:** Tünelden iç ağa (VPN -> LAN) kural var mı?
2. **Routing kontrolü:** Karşı ağın rotası tünel arayüzünü gösteriyor mu?
3. **Subnet çakışması:** Çalışanın ev ağı ile şirket ağı aynı subnet'te mi? (İkisi de `192.168.1.0/24` ise paketler hedefe gitmez!).
4. **Hedef sunucunun Güvenlik Duvarı:** Windows Defender Firewall farklı bir subnet'ten gelen ping/RDP isteklerini varsayılan olarak engeller. Sunucunun yerel güvenlik duvarını kontrol et.

## 7.2 CLI Teşhis Komutları (FortiGate & Linux/pfSense Örnekleri)

**FortiGate:**
```bash
# Oturum filtresi oluşturup belirli bir IP'nin trafiğini yakalama
diagnose sys session filter src 10.10.1.50
diagnose sys session filter dport 443
diagnose sys session list

# Paket seviyesinde kural takibi (Neden engellendiğini söyler!)
diagnose debug flow filter addr 10.10.1.50
diagnose debug flow show console enable
diagnose debug flow trace start 10
diagnose debug enable

# IPsec Tünel durumu ve logları
get vpn ipsec tunnel summary
diagnose vpn ike log filter dst-addr4 <Karşı_Genel_IP>
diagnose debug application ike -1
```

**Linux / pfSense / OPNsense:**
```bash
# Canlı paket akışını dinleme (tcpdump)
tcpdump -i wan0 -nn -s0 vrrp or icmp
tcpdump -i ipsec0 -nn host 10.20.0.15

# NAT ve bağlantı durum tablosu
conntrack -L -p tcp --dport 443
pfctl -s state | grep 10.10.1.50
```

---

# 8. YÖNETİCİ VE TEAM LEAD KONTROL LİSTESİ

- [ ] Güvenlik duvarının web yönetim arayüzü WAN tarafına kesinlikle **kapalı**.
- [ ] Yönetici girişlerinde **MFA** aktif, varsayılan `admin` kullanıcısı devre dışı bırakılmış.
- [ ] Yapılandırma yedeği (Config Backup) her değişiklikten sonra ve haftalık olarak otomatik alınıyor.
- [ ] Firmware güncellemeleri düzenli takip ediliyor ve bilinen CVE güvenlik açıklarına karşı yamalanıyor.
- [ ] Syslog kayıtları kurum dışı bir SIEM / Log sunucusuna anlık aktarılıyor (5651 sayılı kanun ve adli bilişim gereği zaman damgalı).
