# IT HandBook · Kurumsal BT, Sistem ve Ağ Operasyonları Kılavuzu

> 🚀 **Canlı Web Sitesi:** Rehberleri akıllı tam metin arama, akordeon menü, hızlı komut çözümleri ve mobil uyumlu modern arayüzle doğrudan web üzerinden incelemek için:  
> 👉 **[https://mehwetpolat.github.io/IT-HandBook/](https://mehwetpolat.github.io/IT-HandBook/)**

[![Canlı Web Sitesi](https://img.shields.io/badge/Canl%C4%B1%20Web%20S%C3%BCr%C3%BCm%C3%BC-Yay%C4%B1nda-2a56d6?style=flat&logo=google-chrome&logoColor=white)](https://mehwetpolat.github.io/IT-HandBook/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Topics](https://img.shields.io/badge/Topics-14%20Rehber%20%7C%20400%2B%20Konu-blueviolet)](00-rehber-dizini.md)

Bu depo; bilgi teknolojileri (BT) desteği, sistem mühendisliği, kurumsal ağ yönetimi ve altyapı operasyonları için hazırlanmış **Türkçe, kapsamlı ve sahada uygulanabilir bir başvuru kılavuzudur**.

Klasik teorik anlatımlardan farklı olarak, kurumsal ortamlarda karşılaşılan gerçek senaryolar, arıza teşhis adımları, komut satırı pratikleri ve BT süreç yönetimi standartları dikkate alınarak kurgulanmıştır.

---

## 📌 Kapsam ve Rehberler

| Kategori | Rehber | Kapsanan Konular |
|---|---|---|
| **Başlangıç** | [Rehber Dizini](00-rehber-dizini.md) | Konu haritası, senaryo yönlendirme tablosu ve önerilen çalışma sırası |
| | [IT Destek Cep Rehberi](it-destek-cep-rehberi.md) | Günlük sorun giderme, ağ/Windows komutları, AD, DHCP/DNS, Linux, ticket yönetimi |
| | [Sık Sorunlar ve Çözüm Senaryoları](06-sik-sorunlar-cozum-senaryolari.md) | Belirti → Teşhis → Çözüm → Önlem akışıyla gerçek saha arıza senaryoları |
| **Ağ ve Güvenlik Altyapısı** | [Ağ Temelleri](07-ag-temelleri-rehberi.md) | OSI/TCP-IP, subnet hesaplama, VLAN, rotalama, Wi-Fi 6, VPN mimarisi, ağ teşhisi |
| | [Kurumsal Güvenlik Duvarı ve VPN](10-guvenlik-duvari-firewall-vpn-rehberi.md) | Firewall kural mantığı, NAT (SNAT/DNAT/VIP), IPsec Site-to-Site, SSL VPN, SD-WAN, CLI |
| | [Cisco Switch Rehberi](cisco-switch-rehberi.md) | Switch temel ayarları, SSH, VLAN/Trunk, port güvenliği, Packet Tracer laboratuvarı |
| **Sistem ve Veri Merkezi** | [Sunucu ve Yedekleme](02-sunucu-sanallastirma-yedekleme-rehberi.md) | Windows Server, AD DS, DNS/DHCP, Hyper-V/Proxmox, 3-2-1 yedekleme, izleme |
| | [Veri Merkezi, UPS ve Donanım](11-veri-merkezi-donanim-ups-kablolama-rehberi.md) | Cat6/Cat6a/Fiber kablolama, T568B renkleri, kabinet düzeni, Online UPS, iDRAC/iLO, RAID |
| | [İstemci ve Donanım](08-istemci-donanim-windows-rehberi.md) | Windows kurulum/imaj, sürücü, güncelleme halkaları, BitLocker, donanım arıza teşhisi |
| **Kimlik ve Güvenlik** | [Bulut ve Kimlik (M365)](01-bulut-kimlik-m365-intune-rehberi.md) | Microsoft 365, Entra ID, Exchange Online, Intune MDM/MAM, hibrit kimlik |
| | [Güvenlik ve Olay Müdahale](03-guvenlik-olay-mudahale-rehberi.md) | Phishing analizi, fidye yazılımı (Ransomware), Event ID log analizi, sıkılaştırma |
| **Otomasyon ve Süreç** | [PowerShell ve Bash](04-powershell-bash-otomasyon-rehberi.md) | Otomasyon temelleri, AD/Exchange betikleri, cron görevleri ve pratik otomasyonlar |
| | [ITIL ve Dokümantasyon](05-itil-surec-dokumantasyon-rehberi.md) | Olay, Değişiklik ve Problem yönetimi, SLA, ticket kalitesi, envanter şablonları |
| | [BT Yönetimi ve Operasyon](09-bt-yonetimi-operasyon-rehberi.md) | SLA/KPI metrikleri, İşe Giriş/Çıkış akışları, Varlık Yaşam Döngüsü, BCP/DRP, bütçe |

---

## ⚡ Web Arayüzü Özellikleri

Proje, Markdown dosyalarının yanı sıra tarayıcı üzerinden hızlıca erişilip aranabilen tek sayfalık statik bir web arayüzü (`index.html`) barındırır:

* **Akıllı Arama Motoru:** Türkçe karakter duyarsız arama (`sifre` = `şifre`), eşanlamlı terim desteği (örn. *mavi ekran* araması *bsod* sonuçlarını getirir).
* **⚡ Hızlı Komut Kartları:** Sık kullanılan komutlar (`flushdns`, `spooler`, `sfc`, `dism`, `net user`, `test-netconnection` vb.) arandığında doğrudan panoya kopyalanabilir hızlı çözüm kutusu çıkar.
* **Katlanabilir Akordeon Menü:** Kategoriler ve doküman alt başlıkları genişletilip daraltılabilir, son durum tarayıcı hafızasında saklanır.
* **Akıllı Çapraz Linkleme:** Rehberler arasındaki referanslar ve sorun çözüm adımları tıklanabilirdir; ilgili başlığa pürüzsüz kayarak hedef konuyu anlık sarı vurgu efektiyle gösterir.
* **Mobil Uyumluluk:** Yatay kaydırılabilir tablolar, dokunmatik ekran optimizasyonu ve hafif yapı.
* **Sıfır Dış Bağımlılık:** Tüm içerik ve arama indeksi tek bir statik HTML dosyası içinde derlenmiştir; internet bağlantısı olmadan da yerel olarak çalıştırılabilir.

---

## 🛠️ Yerel Geliştirme ve Derleme

Rehberler üzerinde yapılan düzenlemelerin ardından statik web sitesini yeniden oluşturmak için:

```bash
# Bağımlılıkları yükle (Sadece marked markdown ayrıştırıcısı gereklidir)
npm install

# Dokümanları ve arama indeksini index.html içine derle
npm run build
```

---

## ⚖️ Sorumluluk Reddi (Disclaimer)

Bu repoda yer alan dokümanlar, senaryolar ve kod örnekleri eğitim, başvuru ve standart operasyon rehberi niteliğindedir. Örneklerde kullanılan IP adresleri, alan adları ve parolalar kurgusaldır. Canlı (üretim) sistemlerde işlem yapmadan önce test ortamlarında denenmeli ve kurumsal politikalara göre uyarlanmalıdır.
