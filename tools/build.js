// Markdown rehberlerinden tek dosyalık statik site (index.html) üretir.
// Kullanım: npm install && npm run build
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const CATS = [
  { id: 'baslangic', name: 'Başlangıç', color: '#64748b', docs: [
    { slug: 'dizin', file: '00-rehber-dizini.md', short: 'Rehber Dizini', desc: 'Tüm rehberlerin haritası, ne zaman hangisine bakılacağı ve öğrenme sırası' },
    { slug: 'cep', file: 'it-destek-cep-rehberi.md', short: 'IT Destek Cep Rehberi', desc: 'Günlük sorun giderme, ağ ve Windows komutları, AD, DHCP/DNS, Linux, ticket' },
    { slug: 'sorunlar', file: '06-sik-sorunlar-cozum-senaryolari.md', short: 'Sık Sorunlar ve Çözümler', desc: 'Hesap, yazıcı, ağ, posta, Windows, firewall ve donanım için belirti → teşhis → çözüm senaryoları' },
  ]},
  { id: 'ag', name: 'Ağ ve Güvenlik Altyapısı', color: '#2a56d6', docs: [
    { slug: 'agtemel', file: '07-ag-temelleri-rehberi.md', short: 'Ağ Temelleri', desc: 'OSI/TCP-IP, subnet, VLAN, yönlendirme, Wi-Fi, VPN, ağ teşhisi' },
    { slug: 'firewall', file: '10-guvenlik-duvari-firewall-vpn-rehberi.md', short: 'Güvenlik Duvarı ve VPN', desc: 'FortiGate/pfSense kural mantığı, NAT (SNAT/DNAT/VIP), Site-to-Site IPsec, SSL VPN, SD-WAN, CLI' },
    { slug: 'cisco', file: 'cisco-switch-rehberi.md', short: 'Cisco Switch Rehberi', desc: 'Switch temel ayarları, SSH, VLAN, port güvenliği, Packet Tracer laboratuvarı' },
  ]},
  { id: 'sistem', name: 'Sistem, Donanım ve Veri Merkezi', color: '#ea7a10', docs: [
    { slug: 'sunucu', file: '02-sunucu-sanallastirma-yedekleme-rehberi.md', short: 'Sunucu ve Yedekleme', desc: 'Windows Server, AD lab, Hyper-V/Proxmox, Linux sunucu, 3-2-1 yedekleme, izleme' },
    { slug: 'donanim', file: '11-veri-merkezi-donanim-ups-kablolama-rehberi.md', short: 'Veri Merkezi, UPS ve Donanım', desc: 'Cat6/Fiber kablolama, T568B renkleri, kabinet düzeni, Online UPS hesabı, iDRAC/iLO, RAID' },
    { slug: 'istemci', file: '08-istemci-donanim-windows-rehberi.md', short: 'İstemci ve Donanım', desc: 'Windows kurulum/imaj, sürücü, güncelleme halkaları, BitLocker, donanım teşhisi, uzak destek' },
  ]},
  { id: 'kimlik', name: 'Kimlik, Bulut ve Siber Güvenlik', color: '#dc2626', docs: [
    { slug: 'bulut', file: '01-bulut-kimlik-m365-intune-rehberi.md', short: 'Bulut ve Kimlik (M365)', desc: 'Microsoft 365, Entra ID, Exchange Online, Intune, Azure temelleri' },
    { slug: 'guvenlik', file: '03-guvenlik-olay-mudahale-rehberi.md', short: 'Güvenlik ve Olay Müdahale', desc: 'Phishing analizi, fidye yazılımı, hesap ele geçirme, Event ID logları, sıkılaştırma' },
  ]},
  { id: 'surec', name: 'Otomasyon ve BT Yönetimi', color: '#0d9488', docs: [
    { slug: 'otomasyon', file: '04-powershell-bash-otomasyon-rehberi.md', short: 'PowerShell ve Bash', desc: 'Otomasyon temelleri ve tekrarlayan işler için kurumsal hazır betikler' },
    { slug: 'surec', file: '05-itil-surec-dokumantasyon-rehberi.md', short: 'ITIL ve Dokümantasyon', desc: 'Incident, change, problem, ticket kalitesi, şablonlar, envanter' },
    { slug: 'yonetim', file: '09-bt-yonetimi-operasyon-rehberi.md', short: 'BT Yönetimi ve Operasyon', desc: 'SLA/KPI, onboarding/offboarding, varlık yönetimi, BCP/DRP süreklilik planı, bütçe' },
  ]},
];

const START = [
  { slug: 'sorunlar', icon: '🛠️', label: 'Bir arıza var', text: 'Belirti → teşhis → çözüm senaryoları' },
  { slug: 'cep', icon: '⚡', label: 'Hızlı komut ve kontrol', text: 'Günlük işlerin cep rehberi' },
  { slug: 'firewall', icon: '🛡️', label: 'Firewall & VPN', text: 'Kural mantığı, NAT, IPsec ve SSL VPN' },
  { slug: 'donanim', icon: '🔌', label: 'Veri merkezi & UPS', text: 'Kablolama, T568B, kabinet, UPS ve RAID' },
  { slug: 'agtemel', icon: '🌐', label: 'Ağı anlamak', text: 'Subnet, VLAN, DNS, VPN, teşhis akışı' },
  { slug: 'yonetim', icon: '📊', label: 'BT yöneticisiyim', text: 'SLA, KPI, süreklilik, bütçe, devralma' },
];

const FOLD = { 'İ': 'i', 'I': 'i', 'ı': 'i', 'Ş': 's', 'ş': 's', 'Ğ': 'g', 'ğ': 'g', 'Ü': 'u', 'ü': 'u', 'Ö': 'o', 'o': 'o', 'Ç': 'c', 'ç': 'c' };
const slugify = s => [...s].map(c => FOLD[c] || c.toLowerCase()).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bolum';
const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const plain = html => decode(html
  .replace(/<\/(p|li|td|th|tr|h[1-6]|pre|blockquote)>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, ''))
  .replace(/\n{2,}/g, '\n').trim();

// Dosya eşleştirme sözlüğü (dosya adı -> slug)
const fileToSlug = {};
CATS.forEach(c => c.docs.forEach(d => { fileToSlug[d.file] = d.slug; }));

function renderDoc(md, currentSlug) {
  const used = new Set();
  const renderer = new marked.Renderer();
  
  renderer.heading = (text, level, raw) => {
    let id = 's-' + slugify(raw), n = 2; const base = id;
    while (used.has(id)) id = base + '-' + n++;
    used.add(id);
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  
  renderer.table = (header, body) => `<div class="tw"><table>\n<thead>\n${header}</thead>\n<tbody>${body}</tbody>\n</table></div>\n`;
  
  renderer.code = (code, info) => {
    const lang = (info || '').split(/\s+/)[0];
    return `<pre><code${lang ? ` class="language-${escHtml(lang)}"` : ''}>${escHtml(code)}\n</code></pre>\n`;
  };

  // Akıllı linkleme: Markdown linklerini uygulama içi route formatına çevir
  renderer.link = (href, title, text) => {
    let targetHref = href;
    let isInternal = false;

    // Örn: 03-guvenlik-olay-mudahale-rehberi.md veya 03-guvenlik...#s-id
    const mdMatch = href.match(/^([^#]+\.md)(#.+)?$/);
    if (mdMatch) {
      const fileName = mdMatch[1];
      const hash = mdMatch[2] ? '/' + mdMatch[2].replace(/^#/, '') : '';
      if (fileToSlug[fileName]) {
        targetHref = `#/d/${fileToSlug[fileName]}${hash}`;
        isInternal = true;
      }
    } else if (href.startsWith('#')) {
      // Aynı sayfa içi link
      targetHref = `#/d/${currentSlug}/${href.replace(/^#/, '')}`;
      isInternal = true;
    }

    const titleAttr = title ? ` title="${escHtml(title)}"` : '';
    const classAttr = isInternal ? ' class="smart-link"' : ' target="_blank" rel="noopener noreferrer"';
    return `<a href="${targetHref}"${classAttr}${titleAttr}>${text}</a>`;
  };

  marked.use({ gfm: true, breaks: false, mangle: false, headerIds: false });
  const tokens = marked.lexer(md);
  const html = marked.parser(tokens, { renderer });

  // Bölüm indeksi (arama ve gezinti için)
  const sections = []; let curSec = null; const stack = [];
  const ids = [...html.matchAll(/<h([1-6]) id="([^"]+)"/g)].map(m => m[2]);
  let hi = 0, firstH1 = true, title = '';
  for (const t of tokens) {
    if (t.type === 'heading') {
      const id = ids[hi++];
      while (stack.length && stack[stack.length - 1].level >= t.depth) stack.pop();
      const isTitle = t.depth === 1 && firstH1; if (isTitle) { firstH1 = false; title = t.text; }
      curSec = { id, title: t.text.replace(/`/g, ''), level: t.depth, path: stack.filter(s => !s.isTitle).map(s => s.title).join(' › '), isTitle, text: '' };
      stack.push(curSec); sections.push(curSec);
    } else if (curSec && t.type !== 'space' && t.type !== 'hr') {
      const tk = [t]; tk.links = tokens.links || {};
      curSec.text += (curSec.text ? '\n' : '') + plain(marked.parser(tk, { renderer }));
    }
  }
  const words = md.split(/\s+/).filter(Boolean).length;
  return { html, sections, title, words };
}

const docs = [];
for (const c of CATS) for (const d of c.docs) {
  const md = read(d.file);
  const r = renderDoc(md, d.slug);
  docs.push({ slug: d.slug, file: d.file, title: r.title, short: d.short, desc: d.desc, words: r.words, html: r.html, sections: r.sections });
  console.log(`${d.file.padEnd(48)} ${String(r.sections.length).padStart(3)} bölüm  ${r.words} kelime`);
}

const data = { docs, cats: CATS.map(c => ({ id: c.id, name: c.name, color: c.color, docs: c.docs.map(d => d.slug) })), start: START };
const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const tpl = read('tools/template.html');
const app = read('tools/app.js');
const out = tpl.replace('/*__DATA__*/', () => json).replace('/*__APP__*/', () => app);
fs.writeFileSync(path.join(ROOT, 'index.html'), out);
console.log(`\nindex.html başarıyla üretildi (${(out.length / 1024).toFixed(0)} KB)`);
