# Veri Merkezi, Fiziksel Altyapı, UPS ve Donanım Rehberi

Yazılım ve işletim sistemleri ne kadar mükemmel olursa olsun, fiziksel altyapı (elektrik, kablolama, iklimlendirme ve donanım sağlığı) sağlam değilse sistemlerin ayakta kalması imkansızdır. Bir IT uzmanı ve sistem yöneticisi için fiziksel katmanın eksiksiz rehberi.

---

# 1. YAPISAL KABLOLAMA VE RENK STANDARTLARI

## 1.1 Bakır Kablolama (Twisted Pair)
Kurumsal ağlarda en yaygın kullanılan UTP/STP kablo türleri:

| Kategori | Azami Hız | Azami Frekans | Azami Mesafe | Tipik Kullanım Alanı |
|---|---|---|---|---|
| **Cat5e** | 1 Gbps | 100 MHz | 100 metre | Eski kurulumlar, masaüstü uç kullanıcılar. |
| **Cat6** | 1 Gbps (10G 55m'ye kadar) | 250 MHz | 100 metre | Standart kurumsal ofis ve PoE uç noktalar. |
| **Cat6a** | 10 Gbps | 500 MHz | 100 metre | Veri merkezi, switch arası uplink ve modern omurga. |
| **Cat7 / Cat8**| 10G / 25G / 40G | 600 - 2000 MHz | 30 metre | Veri merkezinde sunucu-switch yüksek hızlı bağlantılar. |

> **Kritik Kural:** Ethernet kablolarında tek parça azami hat mesafesi **100 metredir** (90m sabit tesisat kablosu + her iki uçta 5'er metrelik patch kablo). 100 metreyi aşan mesafelerde sinyal zayıflar; araya switch veya **fiber optik** hat çekilmelidir.

## 1.2 RJ45 Renk Standartları (T568A ve T568B)
Kurumsal tesisatlarda dünya standardı olarak **T568B** kullanılır:

```
RJ45 Konnektör Pin Dizilimi (Tırnak arkada, pinler yukarı bakarken, Soldan Sağa 1'den 8'e):

Pin 1: Turuncu-Beyaz
Pin 2: Turuncu
Pin 3: Yeşil-Beyaz
Pin 4: Mavi
Pin 5: Mavi-Beyaz
Pin 6: Yeşil
Pin 7: Kahverengi-Beyaz
Pin 8: Kahverengi
```

- **Düz Kablo (Straight-Through):** İki ucu da T568B standardında çakılır. Farklı cihazlar arası kullanılır (PC -> Switch, Router -> Switch).
- **Çapraz Kablo (Crossover):** Bir ucu T568A, diğer ucu T568B standardındadır. Aynı tür cihazlar arası (Switch -> Switch, PC -> PC) için geçmişte gerekirdi; modern ağ kartlarında **Auto-MDIX** özelliği olduğundan düz kablolar da otomatik algılanır.

## 1.3 Patch Panel ve Keystone Jack Çakma
- Duvar prizleri ve kabinet içi sonlandırmalar daima **Keystone Jack** ve **Patch Panel** üzerine punch-down (kronalama) aletiyle çakılır.
- **Etiketleme Kuralı:** Kabinet tarafındaki her patch panel portu (örn. `PP1-Port 24`), odadaki duvar prizinde (örn. `Oda 204 - Data 1`) aynı kodla etiketlenmelidir. Etiketsiz bir kablolama altyapısı arıza durumunda saatlerce zaman kaybettirir.

---

# 2. FİBER OPTİK TEMELLERİ

Binalar arası, katlar arası veya switch uplink bağlantılarında elektromanyetik parazitten etkilenmeyen ve uzun mesafeleri destekleyen fiber optik hatlar kullanılır.

| Tür | Çekirdek Çapı | Işık Kaynağı | Azami Mesafe | Renk Kodu | Kullanım |
|---|---|---|---|---|---|
| **Multi-Mode (MMF)** OM3 / OM4 | 50 µm | LED / VCSEL Lazer | 300m - 550m (10G için) | Turkuaz (Aqua) / Menekşe (Violet) | Bina içi katlar arası omurga, kabinetler arası. |
| **Single-Mode (SMF)** OS2 | 9 µm | Lazer | 10 km - 40+ km | Sarı (Yellow) | Kampüs içi binalar arası, Metro Ethernet, ISP hatları. |

- **Konnektör Türleri:** En yaygın kurumsal tür **LC** (küçük, çiftli push-pull) ve eski tesisatlarda **SC** (kare) konektörlerdir.
- **SFP / SFP+ Modülleri:** Switch üzerindeki fiber yuvalarına takılan alıcı-verici (transceiver) modüller. Multi-mode için **SX** veya **SR**, Single-mode için **LX** veya **LR** modül seçilmelidir. (Multi-mode kabloya Single-mode modül takılamaz!).

---

# 3. SUNUCU RACK KABİNET DÜZENİ

Veri merkezinde ve sistem odalarında standart 19 inç kabinetler kullanılır:

- **Rack Unit (U Ölçüsü):** 1U = 1.75 inç (44.45 mm). Standart kabinetler genellikle **42U** veya **48U** yüksekliğindedir.
- **Sıcak / Soğuk Koridor Mantığı:**
  - Sunucular ve ağ cihazları havayı **önden emer, arkadan sıcak olarak dışarı üfler**.
  - Kabinetlerin ön yüzleri birbirine bakacak şekilde dizilirse soğuk hava kanalı oluşur (Soğuk Koridor).
  - Boş kalan U yuvalarına **Kör Panel (Blanking Panel)** takılmalıdır; aksi takdirde arka taraftaki sıcak hava ön tarafa sirküle ederek sunucuları ısıtır.
- **Ağırlık Dağılımı:** En ağır bileşenler (UPS, akü grupları ve disk dolu storage sunucuları) daima kabinetin **en altına** yerleştirilir. Switch ve patch paneller genellikle üst veya orta kısımdadır.

---

# 4. KESİNTİSİZ GÜÇ KAYNAĞI (UPS) VE ELEKTRİK

## 4.1 UPS Türleri
1. **Offline / Standby:** Şebeke varken doğrudan verir, elektrik kesilince 4-10 ms içinde aküye geçer. Hassas sunucular için uygun değildir.
2. **Line-Interactive:** Voltaj dalgalanmalarını AVR ile düzeltir, kesintide 2-4 ms içinde aküye geçer. Küçük ofis ve switch'ler için uygundur.
3. **Online (Çift Çevrim - True Online):** Şebeke elektriğini sürekli AC -> DC -> AC olarak yeniden üretir. Transfer süresi **0 ms**'dir (kesintisiz). Frekans ve voltaj dalgalanmalarından sunucuları tamamen izole eder. **Sistem odaları için zorunlu standarttır.**

## 4.2 Yük ve Güç Hesabı (VA vs Watt)
- Güç faktörü (Power Factor - PF) genellikle 0.8 veya 0.9'dur: `Watt = VA × PF`.
- Örneğin 10.000 VA (10 kVA) bir UPS, PF=0.9 ise azami **9.000 Watt** aktif yük taşıyabilir.
- **Kapasite Kuralı:** UPS hiçbir zaman %80'den fazla sürekli yükte çalıştırılmamalıdır (Ani kalkış akımları ve gelecekteki büyüme için %20-30 pay bırakılmalıdır).

## 4.3 Otomatik ve Sıralı Kapatma (Graceful Shutdown)
Uzun süreli elektrik kesintilerinde jeneratör devreye girmezse aküler tükenmeden önce sunucuların aniden kapanması veri tabanlarını bozar.
- UPS üzerinde bir **Ağ Yönetim Kartı (Network Management Card - NMC)** bulunmalıdır.
- NMC kartı şebeke kesildiğinde ve akü seviyesi %20'nin altına indiğinde ağ üzerinden sunuculara sinyal gönderir:
  1. Önce sanal makineler (VMware PowerChute / Proxmox NUT / Hyper-V agent) sırayla kapatılır.
  2. Ardından sanallaştırma ana makineleri (ESXi / Proxmox host) kapatılır.
  3. En son depolama ünitesi (SAN / NAS Storage) güvenli park moduna geçer.

## 4.4 Akü Bakımı ve Riskler
- Akülerin tipik ekonomik ömrü **3–5 yıldır**.
- Yılda en az iki kez UPS akü testi (self-test ve kontrollü şebeke kesintisi testi) yapılmalıdır.
- Akülerde şişme, aşırı ısınma, sülfatlaşma veya koku fark edildiğinde hemen değiştirilmelidir.

---

# 5. SUNUCU DONANIMI VE DAYANIKLILIK (HARDWARE RESILIENCE)

## 5.1 Out-of-Band Yönetim (iDRAC / iLO / IPMI)
Sunucunun işletim sistemi çökse, mavi ekranda kalsa veya sunucu kapalı bile olsa bağımsız çalışan anakart yönetim işlemcisi:
- **Dell:** iDRAC (Integrated Dell Remote Access Controller)
- **HPE:** iLO (Integrated Lights-Out)
- **Lenovo / Supermicro:** XClarity / IPMI
- **Neler Yapılabilir?**
  - Uzaktan sanal konsol (KVM) ile BIOS ekranına erişim.
  - Uzaktan ISO bağlayıp işletim sistemi kurma (Virtual Media).
  - Donanım sıcaklıkları, fan hızları, güç tüketimi ve PSU durumlarını izleme.
  - Fiziksel sunucuyu uzaktan açma/kapatma/yeniden başlatma.
  - Disk arızalarında anlık e-posta veya SNMP uyarısı alma.

> **Güvenlik Uyarısı:** iDRAC / iLO arayüzleri kesinlikle internete açılmamalı; yalnızca izole bir Yönetim VLAN'ı (Management VLAN) üzerinden ve VPN ile erişilebilir olmalıdır.

## 5.2 RAID Seviyeleri ve Arıza Toleransı
Sunucularda tek disk kullanılmaz; veriler donanımsal RAID denetleyicisi ile yedekli tutulur:

| RAID Seviyesi | Minimum Disk | Kullanılabilir Alan | Arıza Toleransı | Hız (Okuma / Yazma) | En İyi Kullanım |
|---|---|---|---|---|---|
| **RAID 0** (Striping) | 2 | %100 | **0 disk** (1 disk giderse her şey silinir!) | Çok Hızlı / Çok Hızlı | Sunucu ortamında **asla kullanılmaz**. |
| **RAID 1** (Mirroring) | 2 | %50 | 1 disk | Hızlı / Normal | İşletim sistemi diskleri (OS boot drives). |
| **RAID 5** (Parity) | 3 | (N - 1) disk | 1 disk | Hızlı / Yavaş (Parite hesabı) | Genel dosya paylaşımı (Büyük disklerde rebuild riski vardır!). |
| **RAID 6** (Dual Parity) | 4 | (N - 2) disk | **2 disk** | Hızlı / Yavaş | Büyük kapasiteli arşiv ve yedekleme sunucuları. |
| **RAID 10** (1+0 Striped Mirror) | 4 | %50 | Her gruptan 1 disk (azami N/2) | **Çok Hızlı / Hızlı** | Yüksek IOPS isteyen veritabanları (SQL, ERP, Sanallaştırma). |

## 5.3 Hot-Spare ve Hot-Swap Disk Değişimi
- **Hot-Swap:** Sunucuyu kapatmadan arızalı diski çekip yenisini takabilme özelliği.
- **Hot-Spare:** Kabinette hazırda dönen ancak boştaki yedek disk. Birincil disklerden biri arızalandığında RAID denetleyicisi insan müdahalesi beklemeden bu diski devreye sokar ve diziyi onarır (Auto-Rebuild).
- **Rebuild Riski:** RAID 5 dizisinde büyük kapasiteli (örn. 8TB) bir disk bozulduğunda yeni diskin rebuild işlemi günler sürebilir. Bu süreçte diğer diskler yoğun okuma stresine girer; ikinci bir disk bozulursa **tüm veri kaybedilir**. Bu nedenle kritik ortamlarda RAID 5 yerine **RAID 10** veya **RAID 6** tercih edilir.

## 5.4 Çift Güç Kaynağı (Redundant PSU)
- Kurumsal sunucularda en az **2 adet güç kaynağı (PSU)** bulunur.
- **Kritik Bağlantı Hatası:** Her iki güç kaynağını da aynı prize veya aynı UPS'e takmak yedekliliği bozar.
- **Doğru Uygulama:**
  - PSU 1 -> Kabinet PDU A -> UPS 1 (veya Şebeke/Jeneratör)
  - PSU 2 -> Kabinet PDU B -> UPS 2
  - Bu sayede UPS'lerden biri patlasa veya sigortası atsa dahi sunucu kapanmadan çalışmaya devam eder.

---

# 6. ORTAM İZLEME VE İKLİMLENDİRME

- **Sistem Odası Sıcaklık Standardı:** ASHRAE standardına göre önerilen sıcaklık **18°C – 24°C**, bağıl nem **%40 – %55** olmalıdır.
- **Sensörler:** Kabinette sıcaklık, bağıl nem, su sızıntı kablosu (klima drenaj borusu altı) ve duman detektörü bulunmalıdır.
- **Alarm Eşikleri:** Sıcaklık 27°C'yi geçtiğinde IT ekibine anlık SMS / WhatsApp / E-posta alarmı tetiklenmeli; 35°C'yi aştığında sunucular otomatik kapatılmalıdır.
- **Yangın Söndürme:** Sistem odalarında su fıskiyesi (sprinkler) yerine gazlı söndürme sistemleri (**FM-200 / NOVEC 1230**) kullanılır. Bu gazlar donanıma zarar vermez ve oksijeni boğmadan yangını kimyasal reaksiyonla söndürür.

---

# 7. SİSTEM ODASI KONTROL LİSTESİ

- [ ] Kabinet kapakları kilitli, sistem odasına girişler kartlı geçiş/parmak izi ve kamera ile izleniyor.
- [ ] Kablo karmaşası (spagetti) yok; tüm patch kabloları organizatörlerden geçirildi ve etiketlendi.
- [ ] Klimalar yedekli (2 klima dönüşümlü çalışıyor; biri arızalanırsa diğeri otomatik devreye giriyor).
- [ ] UPS akü göstergesi ve yük durumu haftalık fiziksel olarak kontrol ediliyor.
- [ ] Sunucu ön panelindeki arıza LED'leri (kehribar/turuncu arıza ışığı) periyodik taranıyor.
- [ ] Boş kabinet yuvalarına kör paneller takılarak sıcak/soğuk hava sirkülasyonu sağlandı.
