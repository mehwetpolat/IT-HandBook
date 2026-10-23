(function(){
'use strict';
const DATA = JSON.parse(document.getElementById('data').textContent);
const docs = DATA.docs, cats = DATA.cats, START = DATA.start || [];
const QUICK = ['şifre','firewall','vpn','vlan','dhcp','dns','ping','ups','raid','gpo','mfa','fidye','yedek','bitlocker','powershell','sla','subnet'];
const SITE = 'IT Rehberleri';

// Eşanlamlılar Sözlüğü (Synonyms / Semantic Expansion)
const SYNONYMS = {
  'sifre': ['parola','password','reset','lock','kilit','aduc','4740','unlock'],
  'parola': ['sifre','password','reset','lock','kilit','aduc','4740'],
  'ag': ['network','vlan','subnet','ip','gateway','dhcp','dns','ping','switch','cisco','yonlendirme'],
  'network': ['ag','vlan','subnet','ip','gateway','dhcp','dns','ping'],
  'firewall': ['guvenlik duvari','fortigate','nat','vip','dnat','snat','kural','policy','pfsense','sophos','zone'],
  'vpn': ['ipsec','ssl vpn','tunnel','ike','phase 1','phase 2','wireguard','openvpn','split tunnel'],
  'mavi ekran': ['bsod','minidump','crash','dmp','bugcheck','sfc','mavi ekran'],
  'bsod': ['mavi ekran','minidump','crash','dmp','bugcheck','sfc'],
  'yedek': ['backup','restore','3-2-1','veeam','kurtarma','rpo','rto','golge kopya','vss'],
  'backup': ['yedek','restore','3-2-1','veeam','kurtarma','rpo','rto'],
  'posta': ['mail','outlook','exchange','spf','dkim','dmarc','pst','ost','5.1.1','5.7.1'],
  'mail': ['posta','outlook','exchange','spf','dkim','dmarc','pst','ost'],
  'yazici': ['printer','spooler','kuyruk','yazdirma','tcp/ip port'],
  'printer': ['yazici','spooler','kuyruk','yazdirma'],
  'ups': ['aku','kesintisiz guc','voltaj','jenerator','nmc','powerchute','nut','true online','kabin'],
  'donanim': ['hardware','ram','disk','cpu','tpm','anakart','kablo','cat6','rj45','t568b','raid','hot-swap','idrac','ilo'],
  'sunucu': ['server','active directory','domain','dc','gpo','hyper-v','proxmox','esxi','dc01'],
  'server': ['sunucu','active directory','domain','dc','gpo','hyper-v'],
  'otomasyon': ['powershell','bash','script','betik','cron','task scheduler']
};

// Hızlı Komut ve Kısayol Önerileri (Quick Commands)
const QUICK_COMMANDS = [
  { match: ['spooler','yazici kuyruk','print spooler'], cmd: 'net stop spooler && del /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*" && net start spooler', desc: 'Yazdırma Biriktiricisini (Spooler) Temizleme ve Yeniden Başlatma' },
  { match: ['flushdns','dns temizle','dns sifirla'], cmd: 'ipconfig /flushdns', desc: 'Windows DNS Önbelleğini Temizleme' },
  { match: ['ip yenile','renew','dhcp ip al'], cmd: 'ipconfig /release && ipconfig /renew', desc: 'DHCP\'den Yeni IP Adresi İsteme' },
  { match: ['sfc','scannow','bozuk sistem'], cmd: 'sfc /scannow', desc: 'Bozuk Windows Sistem Dosyalarını Tarama ve Onarma' },
  { match: ['dism','windows onar','restorehealth'], cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Windows İmajını ve Bileşen Deposunu Onarma' },
  { match: ['chkdsk','disk tara','disk onar'], cmd: 'chkdsk C: /f /r', desc: 'Disk Hatalarını ve Bozuk Sektörleri Tarayıp Onarma' },
  { match: ['gpupdate','gpo guncelle','police uygula'], cmd: 'gpupdate /force', desc: 'Grup İlkelerini (Group Policy) Hemen Zorla Uygulama' },
  { match: ['gpresult','uygulanan gpo','gpo rapor'], cmd: 'gpresult /r', desc: 'Bilgisayara ve Kullanıcıya Uygulanan GPO\'ları Listeleme' },
  { match: ['net user','sifre degistir','parola sifirla'], cmd: 'net user <kullaniciadi> <YeniSifre123!> /domain', desc: 'Domain Kullanıcı Parolasını Komut Satırından Sıfırlama' },
  { match: ['port test','port kontrol','test-netconnection'], cmd: 'Test-NetConnection <sunucu_ip> -Port 443', desc: 'PowerShell ile Port Açıklığı ve Ağ Erişimi Testi' },
  { match: ['bitlocker','bitlocker anahtar','manage-bde'], cmd: 'manage-bde -status', desc: 'Sürücülerin BitLocker Şifreleme Durumunu Görme' },
  { match: ['rdp','uzak masaustu','mstsc'], cmd: 'mstsc /v:<sunucu_ip_veya_ad>', desc: 'Uzak Masaüstü Bağlantısı Başlatma' },
  { match: ['pil','batarya','batteryreport'], cmd: 'powercfg /batteryreport', desc: 'Windows Laptop Ayrıntılı Batarya Sağlık Raporu Üretme' },
  { match: ['robocopy','dosya kopyala','yedek kopya'], cmd: 'robocopy C:\\kaynak D:\\hedef /E /COPYALL /R:2 /W:2', desc: 'İzinleri Koruyarak Güvenilir Toplu Dosya Kopyalama' },
];

// Türkçe karakterleri duyarsız arama: harf harf 1:1 eşleme (indeksler hizalı kalır)
const MAP = {'İ':'i','I':'i','ı':'i','Ş':'s','ş':'s','Ğ':'g','ğ':'g','Ü':'u','ü':'u','Ö':'o','ö':'o','Ç':'c','ç':'c'};
function fold(s){
  let o='';
  for(let i=0;i<s.length;i++){
    const c=s[i]; let m=MAP[c];
    if(!m){ m=c.toLowerCase(); if(m.length!==1) m=c; }
    o+=m;
  }
  return o;
}
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tokens = q => fold(q).split(/\s+/).filter(Boolean);

const bySlug={}, byFile={}, byPrefix={}, catOf={}, order=[];
docs.forEach(d=>{
  bySlug[d.slug]=d; byFile[d.file]=d;
  const m=d.file.match(/^(\d\d)-/); if(m) byPrefix[m[1]]=d;
  d.hasH1=d.sections.some(s=>s.level===1&&!s.isTitle);
  d.sections.forEach(s=>{ s.ft=fold(s.text); s.ftitle=fold(s.title); });
});
cats.forEach(c=>c.docs.forEach(sl=>{ catOf[sl]=c; order.push(bySlug[sl]); }));

// State & LocalStorage Yönetimi (Accordion / Collapsible Sidebar)
let collapsedCats = new Set();
let collapsedDocs = new Set();
try {
  const sc = localStorage.getItem('collapsed_cats');
  if(sc) collapsedCats = new Set(JSON.parse(sc));
  const sd = localStorage.getItem('collapsed_docs');
  if(sd) collapsedDocs = new Set(JSON.parse(sd));
} catch(e){}

function saveNavState(){
  try {
    localStorage.setItem('collapsed_cats', JSON.stringify([...collapsedCats]));
    localStorage.setItem('collapsed_docs', JSON.stringify([...collapsedDocs]));
  } catch(e){}
}

const main=$('main');
let cur={type:'home'}, lastRes=[], resFilter=null, marks=[], mi=-1;

function highlightHTML(text, terms){
  const f=fold(text), ranges=[];
  terms.forEach(t=>{ let i=0; while((i=f.indexOf(t,i))!==-1){ ranges.push([i,i+t.length]); i+=t.length; } });
  ranges.sort((a,b)=>a[0]-b[0]);
  let out='', pos=0;
  for(const r of ranges){
    if(r[1]<=pos) continue;
    const s=Math.max(r[0],pos);
    out+=esc(text.slice(pos,s))+'<mark>'+esc(text.slice(s,r[1]))+'</mark>';
    pos=r[1];
  }
  return out+esc(text.slice(pos));
}

/* ---------- Yönlendirme ---------- */
function parseHash(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  if(p[0]==='d' && bySlug[p[1]]) return {type:'doc',slug:p[1],sec:p[2]||null};
  return {type:'home'};
}
function go(h){ if(location.hash===h) route(); else location.hash=h; }
function route(){
  cur=parseHash();
  const q=$('q').value.trim();
  hideBar();

  if(cur.type==='doc'){
    // Aktif dokümanın kategorisini ve dokümanın alt bölümlerini otomatik aç
    const c = catOf[cur.slug];
    if(c && collapsedCats.has(c.id)){
      collapsedCats.delete(c.id);
      saveNavState();
    }
    if(collapsedDocs.has(cur.slug)){
      collapsedDocs.delete(cur.slug);
      saveNavState();
    }
  }

  if(cur.type==='home'){ if(q) runSearch(q); else showHome(); }
  else showDoc(cur.slug,cur.sec,q);
  renderNav();
  if(cur.type==='doc') spy();
  closeMenu();
  updateClear();
  toggleTop();
}

/* ---------- Kenar Menü (Collapsible Accordion) ---------- */
function renderNav(){
  let h='<div class="nav-tools">';
  h+='<a class="nav-home'+(cur.type==='home'?' active':'')+'" href="#/">Ana sayfa</a>';
  h+='<div><button id="expAll" class="nav-tool-btn" title="Tüm kategorileri genişlet">Genişlet</button>';
  h+='<button id="colAll" class="nav-tool-btn" title="Tüm kategorileri daralt">Daralt</button></div>';
  h+='</div>';

  cats.forEach(c=>{
    const isCatCol = collapsedCats.has(c.id);
    h+='<div class="nav-cat'+(isCatCol?' collapsed':'')+'" data-cat="'+c.id+'">';
    h+='<button class="nav-cat-h" data-cat-btn="'+c.id+'" aria-expanded="'+(!isCatCol)+'">';
    h+='<span class="cat-left"><span class="dot" style="background:'+c.color+'"></span>'+esc(c.name)+'</span>';
    h+='<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
    h+='</button>';

    h+='<div class="nav-cat-items">';
    c.docs.forEach(sl=>{
      const d=bySlug[sl];
      const isAct = cur.type==='doc' && cur.slug===sl;
      const isDocCol = collapsedDocs.has(sl);
      const hasSections = d.sections.some(s=>!s.isTitle && s.level<=2);

      h+='<div class="nav-doc-item'+(isDocCol?' collapsed':'')+'" data-doc-item="'+sl+'">';
      h+='<div class="nav-doc-row">';
      h+='<a class="nav-doc'+(isAct?' active':'')+'" href="#/d/'+sl+'">'+esc(d.short)+'</a>';
      if(hasSections){
        h+='<button class="nav-doc-toggle" data-doc-toggle="'+sl+'" aria-label="Bölümleri aç/kapat" title="Bölümleri aç/kapat">';
        h+='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
        h+='</button>';
      }
      h+='</div>';

      if(hasSections){
        h+='<div class="nav-secs">';
        d.sections.forEach(s=>{
          if(s.isTitle||s.level>2) return;
          const isSecCur = isAct && cur.sec===s.id;
          h+='<a class="nav-sec l'+s.level+(d.hasH1?' ind':'')+(isSecCur?' cur':'')+'" data-id="'+s.id+'" href="#/d/'+sl+'/'+s.id+'">'+esc(s.title)+'</a>';
        });
        h+='</div>';
      }
      h+='</div>';
    });
    h+='</div>'; // .nav-cat-items
    h+='</div>'; // .nav-cat
  });

  h+='<div class="side-foot">Rehberler kurumsal IT standartları ve saha uygulamaları dikkate alınarak hazırlanmıştır.</div>';
  $('nav').innerHTML=h;

  // Accordion Event Listener'ları
  $('expAll').onclick=()=>{
    collapsedCats.clear();
    collapsedDocs.clear();
    saveNavState();
    renderNav();
  };
  $('colAll').onclick=()=>{
    cats.forEach(c=>collapsedCats.add(c.id));
    docs.forEach(d=>collapsedDocs.add(d.slug));
    saveNavState();
    renderNav();
  };
  document.querySelectorAll('[data-cat-btn]').forEach(btn=>{
    btn.onclick=e=>{
      e.preventDefault();
      const cid = btn.dataset.catBtn;
      if(collapsedCats.has(cid)) collapsedCats.delete(cid);
      else collapsedCats.add(cid);
      saveNavState();
      renderNav();
    };
  });
  document.querySelectorAll('[data-doc-toggle]').forEach(btn=>{
    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      const sl = btn.dataset.docToggle;
      if(collapsedDocs.has(sl)) collapsedDocs.delete(sl);
      else collapsedDocs.add(sl);
      saveNavState();
      renderNav();
    };
  });
}

function keepVisible(el){
  const a=$('side'), r=el.getBoundingClientRect(), ar=a.getBoundingClientRect();
  if(r.top<ar.top+10) a.scrollTop-=(ar.top+10-r.top);
  else if(r.bottom>ar.bottom-10) a.scrollTop+=r.bottom-(ar.bottom-10);
}
function spy(){
  if(cur.type!=='doc') return;
  const ids=new Set([...document.querySelectorAll('.nav-sec')].map(a=>a.dataset.id));
  let id=null;
  for(const h of document.querySelectorAll('#doc h1[id],#doc h2[id],#doc h3[id]')){
    if(!ids.has(h.id)) continue;
    if(h.getBoundingClientRect().top<=100) id=h.id; else break;
  }
  document.querySelectorAll('.nav-sec').forEach(a=>{
    const on=a.dataset.id===id; a.classList.toggle('cur',on); if(on && !document.body.classList.contains('menu-open')) keepVisible(a);
  });
}
let tick=false;
function toggleTop(){ $('toTop').hidden = window.scrollY<800; }
window.addEventListener('scroll',()=>{ toggleTop(); if(tick||cur.type!=='doc') return; tick=true; requestAnimationFrame(()=>{ tick=false; spy(); }); },{passive:true});
function closeMenu(){ document.body.classList.remove('menu-open'); }

/* ---------- Ana Sayfa ---------- */
function showHome(){
  const nsec=docs.reduce((n,d)=>n+d.sections.filter(s=>!s.isTitle).length,0);
  const words=docs.reduce((n,d)=>n+d.words,0);
  let h='<section class="hero"><span class="eyebrow">Türkçe · Uygulamalı · Kurumsal</span>'
    +'<h1>IT Destekten <span>Altyapı ve BT Yönetimine</span> Eksiksiz Rehber</h1>'
    +'<p>Saha sorun giderme senaryoları, ağ ve güvenlik duvarı (Firewall/VPN), sunucu ve veri merkezi, Microsoft 365, siber güvenlik, otomasyon ve BT süreç yönetimi.</p>'
    +'<div class="stats"><div class="stat"><b>'+docs.length+'</b><small>kapsamlı rehber</small></div><div class="stat"><b>'+nsec+'</b><small>bölüm ve senaryo</small></div><div class="stat"><b>~'+Math.round(words/200)+' dk</b><small>toplam okuma süresi</small></div></div>'
    +'<div class="chips" aria-label="Hızlı arama konuları">';
  QUICK.forEach(w=>{ h+='<button class="chip" data-q="'+esc(w)+'">'+esc(w)+'</button>'; });
  h+='</div></section>';
  if(START.length){
    h+='<div class="sec-title">Buradan başla</div><div class="start">';
    START.forEach(s=>{ const d=bySlug[s.slug]; if(!d) return; h+='<a href="#/d/'+d.slug+'"><span class="ic">'+s.icon+'</span><b>'+esc(s.label)+'</b><small>'+esc(s.text)+'</small></a>'; });
    h+='</div>';
  }
  h+='<div class="sec-title" style="margin-bottom:-14px">Tüm rehber kategorileri</div><div class="grid">';
  cats.forEach(c=>{
    h+='<div class="card"><h3><span class="dot" style="background:'+c.color+'"></span>'+esc(c.name)+'</h3>';
    c.docs.forEach(sl=>{
      const d=bySlug[sl];
      h+='<a class="d" href="#/d/'+sl+'"><strong>'+esc(d.short)+'</strong><small>'+esc(d.desc)+'</small></a>';
    });
    h+='</div>';
  });
  h+='</div><div class="foot">Bu proje IT personeli, sistem ve ağ yöneticileri için pratik saha kılavuzudur. Örnek IP ve konfigürasyonlar kurgusaldır.</div>';
  main.innerHTML=h; document.title=SITE+' | Türkçe IT Destek, Sistem ve Ağ Yönetimi Kılavuzu'; window.scrollTo(0,0);
}

/* ---------- Akıllı Arama & Eşanlamlılar ---------- */
function runSearch(q){
  const userTerms=tokens(q);
  if(!userTerms.length){ route(); return; }

  // Eşanlamlı kelimeleri genişlet
  const expandedTerms = new Set(userTerms);
  userTerms.forEach(t=>{
    if(SYNONYMS[t]) SYNONYMS[t].forEach(s=>expandedTerms.add(fold(s)));
  });
  const allTerms = [...expandedTerms];

  const res=[];
  docs.forEach(d=>d.sections.forEach(s=>{
    let ok=false, score=0;
    for(const t of userTerms){
      const inT=s.ftitle.indexOf(t)!==-1;
      let c=0,i=0; while(c<6&&(i=s.ft.indexOf(t,i))!==-1){ c++; i+=t.length; }
      if(inT || c>0){ ok=true; score+=(inT?15:0)+(c*2); }
    }
    // Eşanlamlı katkısı
    if(!ok){
      for(const st of allTerms){
        if(s.ftitle.indexOf(st)!==-1 || s.ft.indexOf(st)!==-1){ ok=true; score+=3; break; }
      }
    }
    if(ok) res.push({d:d,s:s,score:score});
  }));
  res.sort((a,b)=>b.score-a.score);
  lastRes=res;
  renderResults();
}

function snippet(s,terms){
  let idx=-1;
  terms.forEach(t=>{ const i=s.ft.indexOf(t); if(i!==-1&&(idx===-1||i<idx)) idx=i; });
  if(idx===-1){ const t=s.text.slice(0,180).replace(/\s+/g,' '); return esc(t)+(s.text.length>180?'…':''); }
  const a=Math.max(0,idx-70), b=Math.min(s.text.length,idx+170);
  const t=s.text.slice(a,b).replace(/\s+/g,' ');
  return (a>0?'…':'')+highlightHTML(t,terms)+(b<s.text.length?'…':'');
}

function findQuickCommand(q){
  const fq = fold(q).trim();
  for(const item of QUICK_COMMANDS){
    for(const m of item.match){
      if(fq.includes(fold(m)) || fold(m).includes(fq)) return item;
    }
  }
  return null;
}

function renderResults(){
  const q=$('q').value.trim(), terms=tokens(q);
  const list=resFilter?lastRes.filter(r=>r.d.slug===resFilter):lastRes;
  const counts={}; lastRes.forEach(r=>{ counts[r.d.slug]=(counts[r.d.slug]||0)+1; });
  
  let h='<div class="res-head"><h2>“'+esc(q)+'” için '+lastRes.length+' sonuç</h2>';

  // ⚡ Hızlı Komut Eşleşmesi varsa en tepeye koy
  const quick = findQuickCommand(q);
  if(quick){
    h+='<div class="quick-box"><div class="quick-box-h">';
    h+='<span class="quick-box-tag">⚡ Hızlı Çözüm & Komut</span>';
    h+='</div>';
    h+='<p><strong>'+esc(quick.desc)+'</strong></p>';
    h+='<div class="quick-code"><code>'+esc(quick.cmd)+'</code><button class="quick-copy" data-quick-copy="'+esc(quick.cmd)+'">Kopyala</button></div>';
    h+='</div>';
  }

  if(lastRes.length){
    h+='<div class="chips"><button class="chip'+(!resFilter?' on':'')+'" data-f="">Tümü '+lastRes.length+'</button>';
    order.forEach(d=>{ if(counts[d.slug]) h+='<button class="chip'+(resFilter===d.slug?' on':'')+'" data-f="'+d.slug+'">'+esc(d.short)+' '+counts[d.slug]+'</button>'; });
    h+='</div>';
  }
  h+='</div>';

  if(!lastRes.length && !quick){
    h+='<p class="empty">Eşleşme bulunamadı. Daha genel bir arama terimi deneyebilirsin (Örn: vlan, dhcp, sifre, vpn, firewall, ping, disk, gpo).</p>';
  }
  
  list.slice(0,120).forEach(r=>{
    const c=catOf[r.d.slug];
    h+='<a class="res" href="#/d/'+r.d.slug+'/'+r.s.id+'"><div class="res-crumb"><span class="dot" style="background:'+c.color+'"></span>'+esc(r.d.short)+(r.s.path?' › '+esc(r.s.path):'')+'</div>'
      +'<div class="res-title">'+highlightHTML(r.s.title,terms)+'</div><div class="res-snip">'+snippet(r.s,terms)+'</div></a>';
  });
  if(list.length>120) h+='<p class="empty">İlk 120 sonuç gösteriliyor, aramayı daraltabilirsin.</p>';
  main.innerHTML=h; document.title='“'+q+'” · '+SITE; window.scrollTo(0,0);
}

/* ---------- Doküman Görüntüleme & Akıllı Link Vurgusu ---------- */
function showDoc(slug,sec,q){
  const d=bySlug[slug], c=catOf[slug], i=order.indexOf(d), prev=order[i-1], next=order[i+1];
  let h='<div class="crumb"><a href="#/">Ana sayfa</a> › <span>'+esc(c.name)+'</span></div>';
  h+='<div class="meta"><span>'+Math.max(1,Math.round(d.words/200))+' dk okuma</span><span>'+d.sections.filter(s=>!s.isTitle).length+' bölüm ve başlık</span><span><a href="'+d.file+'" style="color:inherit;text-decoration:none">Ham .md dosyası ↗</a></span></div>';
  h+='<article class="doc" id="doc">'+d.html+'</article>';
  h+='<nav class="pn" aria-label="Rehberler arası gezinme">'+(prev?'<a href="#/d/'+prev.slug+'"><small>Önceki</small>'+esc(prev.short)+'</a>':'<span></span>')
    +(next?'<a class="r" href="#/d/'+next.slug+'"><small>Sonraki</small>'+esc(next.short)+'</a>':'<span></span>')+'</nav>';
  main.innerHTML=h; document.title=d.short+' · '+SITE;
  decorate(d);
  const terms=tokens(q);
  marks=[]; mi=-1;
  if(terms.length) highlightDoc(terms);
  
  const el=sec?document.getElementById(sec):null;
  if(el){
    setTimeout(()=>{
      el.scrollIntoView({behavior:'smooth', block:'start'});
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }, 50);
  } else window.scrollTo(0,0);

  if(marks.length){
    let start=0;
    if(el){ const k=marks.findIndex(m=>el.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_FOLLOWING); start=k===-1?0:k; }
    focusMark(start,!el);
  }
}

function decorate(d){
  // Başlık çapraz anchor bağlantıları
  document.querySelectorAll('#doc h1[id],#doc h2[id],#doc h3[id]').forEach(h=>{
    const a=document.createElement('a'); a.className='anchor'; a.href='#/d/'+d.slug+'/'+h.id; a.textContent='#'; a.setAttribute('aria-label','Bu bölümün bağlantısı');
    h.appendChild(a);
  });

  // Kod blokları kopyalama butonu
  document.querySelectorAll('#doc pre').forEach(p=>{
    const b=document.createElement('button'); b.className='copy'; b.type='button'; b.textContent='Kopyala'; p.appendChild(b);
  });

  // Metin içindeki dosya isimlerini tıklanabilir linke çevir
  document.querySelectorAll('#doc code').forEach(c=>{
    if(c.parentElement.tagName==='PRE') return;
    const t=c.textContent.trim(); let target=byFile[t];
    if(!target){ const m=t.match(/^(\d\d)-\.\.\.$/); if(m) target=byPrefix[m[1]]; }
    if(target&&target.slug!==d.slug){ c.classList.add('doclink'); c.dataset.slug=target.slug; c.title='Rehberi aç: '+target.short; }
  });

  // Sayfa içi hash linklerine tıklama yakalama
  document.querySelectorAll('#doc a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(href.startsWith('#/d/')){
      a.addEventListener('click', e=>{
        const p = href.replace(/^#\/?/,'').split('/');
        if(p[1]===d.slug && p[2]){
          const targetEl = document.getElementById(p[2]);
          if(targetEl){
            e.preventDefault();
            history.pushState(null, '', href);
            targetEl.scrollIntoView({behavior:'smooth', block:'start'});
            targetEl.classList.remove('flash'); void targetEl.offsetWidth; targetEl.classList.add('flash');
          }
        }
      });
    }
  });
}

function highlightDoc(terms){
  const root=$('doc'), walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
    acceptNode:n=>(n.parentElement&&n.parentElement.closest('.copy,.anchor'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
  });
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const f=fold(n.data), ranges=[];
    terms.forEach(t=>{ let i=0; while((i=f.indexOf(t,i))!==-1){ ranges.push([i,i+t.length]); i+=t.length; } });
    if(!ranges.length) return;
    ranges.sort((a,b)=>a[0]-b[0]);
    const frag=document.createDocumentFragment(); let pos=0;
    ranges.forEach(r=>{
      if(r[1]<=pos) return;
      const s=Math.max(r[0],pos);
      if(s>pos) frag.appendChild(document.createTextNode(n.data.slice(pos,s)));
      const m=document.createElement('mark'); m.className='hl'; m.textContent=n.data.slice(s,r[1]); frag.appendChild(m);
      pos=r[1];
    });
    if(pos<n.data.length) frag.appendChild(document.createTextNode(n.data.slice(pos)));
    n.parentNode.replaceChild(frag,n);
  });
  marks=[...root.querySelectorAll('mark.hl')];
}

function focusMark(i,scroll){
  if(!marks.length) return;
  marks.forEach(m=>m.classList.remove('cur'));
  mi=((i%marks.length)+marks.length)%marks.length;
  const m=marks[mi]; m.classList.add('cur');
  if(scroll) m.scrollIntoView({behavior:'smooth', block:'center'});
  $('mInfo').textContent=(mi+1)+' / '+marks.length;
  $('matchbar').hidden=false;
}
function hideBar(){ $('matchbar').hidden=true; marks=[]; mi=-1; }
$('mPrev').onclick=()=>focusMark(mi-1,true);
$('mNext').onclick=()=>focusMark(mi+1,true);
$('mClose').onclick=()=>{ $('q').value=''; onQuery(); };

function copyCode(btn, customText){
  const text = customText !== undefined ? customText : (btn.parentElement.querySelector('code') ? btn.parentElement.querySelector('code').innerText : '');
  const done=()=>{ btn.textContent='Kopyalandı!'; setTimeout(()=>{ btn.textContent=customText!==undefined?'Kopyala':'Kopyala'; },1400); };
  const fallback=()=>{
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(e){} document.body.removeChild(ta);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done,fallback); else fallback();
}

/* ---------- Olaylar & Etkileşim ---------- */
main.addEventListener('click',e=>{
  const chip=e.target.closest('.chip');
  if(chip){
    if(chip.dataset.q!==undefined){ $('q').value=chip.dataset.q; onQuery(); }
    else if(chip.dataset.f!==undefined){ resFilter=chip.dataset.f||null; renderResults(); }
    return;
  }
  const qCopy = e.target.closest('[data-quick-copy]');
  if(qCopy){ copyCode(qCopy, qCopy.dataset.quickCopy); return; }

  const res=e.target.closest('a.res');
  if(res){ if(location.hash===res.getAttribute('href')){ e.preventDefault(); route(); } return; }
  const dl=e.target.closest('code.doclink'); if(dl){ go('#/d/'+dl.dataset.slug); return; }
  const cp=e.target.closest('button.copy'); if(cp) copyCode(cp);
});

function updateClear(){ $('clearQ').hidden=!$('q').value; }
function onQuery(){
  const q=$('q').value.trim(); resFilter=null; updateClear();
  hideBar();
  if(!q){ route(); return; }
  runSearch(q);
}
let timer;
$('q').addEventListener('input',()=>{ updateClear(); clearTimeout(timer); timer=setTimeout(onQuery,120); });
$('q').addEventListener('keydown',e=>{
  if(e.key==='Enter'){ clearTimeout(timer); onQuery(); $('q').blur(); }
  if(e.key==='Escape'){ $('q').value=''; onQuery(); $('q').blur(); }
});
$('clearQ').addEventListener('click',()=>{ $('q').value=''; onQuery(); $('q').focus(); });

// Klavye Kısayolları (Ctrl+K veya / ile arama)
document.addEventListener('keydown',e=>{
  if((e.key==='/' || (e.ctrlKey && e.key.toLowerCase()==='k')) && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){
    e.preventDefault();
    $('q').focus();
    $('q').select();
  }
});

$('menuBtn').addEventListener('click',()=>document.body.classList.toggle('menu-open'));
$('scrim').addEventListener('click',closeMenu);
$('toTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
$('themeBtn').addEventListener('click',()=>{
  const root=document.documentElement;
  const dark=root.getAttribute('data-theme')?root.getAttribute('data-theme')==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  const next=dark?'light':'dark'; root.setAttribute('data-theme',next);
  try{ localStorage.setItem('theme',next); }catch(e){}
});
window.addEventListener('hashchange',route);
route();
})();
