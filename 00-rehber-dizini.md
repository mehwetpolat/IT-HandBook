# IT Rehberleri Dizini

IT destek, sistem ve ağ yönetimi için Türkçe, uygulamalı rehber koleksiyonu. Sahada hızlı cevap lazım olduğunda, laboratuvarda bir şey denerken ya da ekibine kurumsal süreç ve altyapı kurarken başvurabileceğin eksiksiz başvuru kaynağı.

> **Nasıl kullanılır?** Aradığın konu belliyse yukarıdaki arama kutusunu kullan (klavyede `/` veya `Ctrl+K`). Konu belli değilse aşağıdaki tablolardan veya doğrudan ilgili rehberden başla.

## Rehberler

| Rehber | İçerik | Ne Zaman Bak |
|---|---|---|
| `it-destek-cep-rehberi.md` | Günlük sorun giderme, ağ/Windows/Linux komutları, AD, DHCP/DNS, ticket, ilk günler listesi | Hızlı cevap gerektiğinde (ana el kitabı) |
| `06-sik-sorunlar-cozum-senaryolari.md` | Sık görülen arızalar için adım adım belirti → teşhis → çözüm → önlem senaryoları | Bir arıza karşında, "nereden başlayacağım?" dediğinde |
| `07-ag-temelleri-rehberi.md` | OSI/TCP-IP, adresleme, subnet hesabı, VLAN, yönlendirme, Wi-Fi, VPN, ağ teşhisi | Ağ mantığını oturtmak ve ağ sorunlarını analiz etmek için |
| `10-guvenlik-duvari-firewall-vpn-rehberi.md` | Güvenlik duvarı (NGFW), NAT (SNAT/DNAT/VIP), Site-to-Site IPsec VPN, SSL VPN, Web/App filtering, SD-WAN, CLI hata ayıklama | Kurumsal internet güvenliği, şube VPN ve uzaktan erişim yapılandırırken |
| `cisco-switch-rehberi.md` | Switch temel ayarları, şifreleme, SSH, VLAN, port güvenliği, sunucu servisleri (Packet Tracer) | Switch/ağ laboratuvarı ve pratik yaparken |
| `02-sunucu-sanallastirma-yedekleme-rehberi.md` | Windows Server, AD lab, Hyper-V/Proxmox, Linux sunucu, yedekleme (3-2-1), izleme | Sunucu kurulumu, lab, yedek ve felaket kurtarma |
| `11-veri-merkezi-donanim-ups-kablolama-rehberi.md` | Cat6/Cat6a/Fiber kablolama, RJ45 T568B renkleri, kabinet düzeni, Online UPS hesabı, iDRAC/iLO, RAID 0/1/5/6/10, Hot-Swap | Fiziksel altyapı, sunucu odası, elektrik ve donanım sağlığı için |
| `08-istemci-donanim-windows-rehberi.md` | Windows kurulumu ve imaj, sürücü, BitLocker, güncelleme halkaları, donanım teşhisi, uzak destek | Bilgisayar, laptop ve çevre birim yönetiminde |
| `01-bulut-kimlik-m365-intune-rehberi.md` | Microsoft 365, Entra ID, Exchange Online, Intune, Azure temelleri | Kullanıcı, lisans, posta, MFA, cihaz yönetimi |
| `03-guvenlik-olay-mudahale-rehberi.md` | Phishing, fidye yazılımı, hesap ele geçirme, log okuma (Event ID), sıkılaştırma | Güvenlik olayı ve siber tehdit önlemlerinde |
| `04-powershell-bash-otomasyon-rehberi.md` | PowerShell/Bash temelleri ve kurumsal hazır betikler | Tekrarlayan işleri otomatikleştirirken |
| `05-itil-surec-dokumantasyon-rehberi.md` | Incident/change/problem, ticket kalitesi, şablonlar, envanter, dokümantasyon | Düzenli, kurumsal ve profesyonel çalışmak için |
| `09-bt-yonetimi-operasyon-rehberi.md` | SLA/KPI, işe giriş-çıkış süreci, varlık yaşam döngüsü, süreklilik (BCP/DRP), bütçe, tedarikçi | BT ekibini yönetenler ve süreç kuran yöneticiler için |

## Soruna Göre Hızlı Yönlendirme

| Durum | Bakılacak Rehber |
|---|---|
| "İnternet yok / bilgisayar yavaş / yazıcı bozuk" | `it-destek-cep-rehberi.md`, `06-sik-sorunlar-cozum-senaryolari.md` |
| "Ağ trafiği nasıl akar, subnet ve VLAN mantığı nedir?" | `07-ag-temelleri-rehberi.md` |
| "Firewall kuralı yazacağım, NAT yapacağım, VPN kuracağım" | `10-guvenlik-duvari-firewall-vpn-rehberi.md` |
| "Kullanıcı giriş yapamıyor, MFA, lisans, Outlook" | `01-bulut-kimlik-m365-intune-rehberi.md`, `06-sik-sorunlar-cozum-senaryolari.md` |
| "Sunucu/AD/DHCP kuracağım, yedek planlayacağım" | `02-sunucu-sanallastirma-yedekleme-rehberi.md` |
| "Kablolama yapacağım, T568B renkleri, UPS ve RAID hesabı" | `11-veri-merkezi-donanim-ups-kablolama-rehberi.md` |
| "Yeni bilgisayar kuracağım, disk şifreleyeceğim" | `08-istemci-donanim-windows-rehberi.md` |
| "Şüpheli e-posta, virüs, fidye yazılımı vakası" | `03-guvenlik-olay-mudahale-rehberi.md` |
| "Bunu 50 bilgisayarda betikle yapmam lazım" | `04-powershell-bash-otomasyon-rehberi.md` |
| "Ticket nasıl yazılır, değişiklik nasıl yönetilir" | `05-itil-surec-dokumantasyon-rehberi.md` |
| "SLA, KPI, onboarding/offboarding, felaket kurtarma" | `09-bt-yonetimi-operasyon-rehberi.md` |
| "Cisco switch temel ayarları, trunk, port güvenliği" | `cisco-switch-rehberi.md` |

## Önerilen Öğrenme Sırası (Yeni Başlayanlar & Kendini Geliştirenler)

1. `it-destek-cep-rehberi.md`: Ana el kitabı, önce bunu oku.
2. `07-ag-temelleri-rehberi.md`: Ağın mantığını oturt.
3. `11-veri-merkezi-donanim-ups-kablolama-rehberi.md`: Fiziksel altyapıyı, kablolamayı ve donanımı tanı.
4. `cisco-switch-rehberi.md`: Packet Tracer'da switch yapılandırarak pekiştir.
5. `10-guvenlik-duvari-firewall-vpn-rehberi.md`: Kurumsal firewall, NAT ve VPN mantığını kavra.
6. `02-sunucu-sanallastirma-yedekleme-rehberi.md`: AD/DHCP/DNS laboratuvarını kur.
7. `08-istemci-donanim-windows-rehberi.md`: İstemci tarafını ve Windows yönetimini öğren.
8. `01-bulut-kimlik-m365-intune-rehberi.md`: M365 deneme kiracısı ile kimlik ve cihaz yönetimini dene.
9. `04-powershell-bash-otomasyon-rehberi.md`: Lab'da yaptığın işleri betiğe dök.
10. `03-guvenlik-olay-mudahale-rehberi.md`: Güvenlik kontrollerini uygula.
11. `05-itil-surec-dokumantasyon-rehberi.md` ve `09-bt-yonetimi-operasyon-rehberi.md`: Süreç ve yönetim tarafını yönetici gözüyle öğren.
12. `06-sik-sorunlar-cozum-senaryolari.md`: Senaryoları sahada veya lab ortamında pratik et.

## Kullanım İpuçları
- Sitede arama kutusu **Türkçe karakter duyarsızdır** (`sifre` yazınca `şifre` de bulunur). Klavyede `/` veya `Ctrl+K` tuşu aramaya odaklanır.
- Kod bloklarının üzerindeki **Kopyala** düğmesiyle komutları anında panoya alabilirsin.
- Rehberlerdeki tüm adımlar ve çapraz başlıklar tıklanabilirdir.
- Komutları üretim ortamında çalıştırmadan önce test ortamında dene; geri dönüşsüz işlemlerde daima yedek al ve onay iste.

## Sorumluluk Reddi
Bu rehberler eğitim ve kurumsal başvuru amaçlıdır; "olduğu gibi" sunulur. Örnek IP adresleri, alan adları (`firma.local`, `lab.local`) ve şifreler kurgusaldır. Kendi ortamında kullanmadan önce kurumunun politikalarına ve resmi üretici dokümanlarına göre uyarla.
