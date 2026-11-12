/* Padang Records · link-presente (/g/<token>)
   Um token na URL decide a tela: ticket = página do amigo, painel = página do DJ.
   O distribuidor fica no Supabase (funções padang_gift_*); o código do Bandcamp só sai no toque em "redeem".
   A página do amigo não recebe nem mostra números da campanha (quantos existem, enviados, resgatados): isso é só do painel.
   Tokens "demo-…" usam um distribuidor simulado no próprio navegador (localStorage). */
(() => {
'use strict';

const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';
const YUM = 'https://padang.bandcamp.com/yum';
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/* ───────── textos (só inglês, por decisão da label) ───────── */
const LOCALE = 'en-GB';
const L = {
  forName: 'for {name}', forYou: 'for you', from: 'a gift from {giver}', various: 'various artists', tracks: 'tracks', album: 'album',
  code: 'code', redeem: 'redeem on bandcamp', open: 'open bandcamp',
  fine: 'single-use link · no expiry date', opening: 'opening bandcamp with your code…',
  claimedOn: 'redeem started on {when}', listen: 'listen first', how: 'how it works',
  how1: 'Tap redeem. The code is already filled in.',
  how2: 'Sign in to Bandcamp or create a free account.',
  how3: 'The full album goes to your collection: unlimited streaming in the app and download in any format.',
  noneT: 'this gift does not exist', noneP: 'Check the link with whoever sent it to you.',
  errT: 'could not open it right now', errP: 'Check your connection and try again.', retry: 'try again',
  demo: 'demo · sample codes',
  demoNote: 'Demo: on a real link, this tap goes straight to Bandcamp with the code filled in.',
  panel: 'gift panel', hello: 'hi,',
  lead: 'You have {total} copies of {album} to give away. Each link is worth the full album on Bandcamp.',
  sLeft: 'left', sSent: 'sent', sOpen: 'opened', sClaim: 'redeemed',
  toLabel: 'who is it for?', optional: '(optional)', toPh: "friend's name", send: 'send to a friend',
  sendFine: 'each tap uses a unique link · whatsapp, telegram, dm, anywhere',
  shareTo: '{name}, ', share: 'a gift for you: {album}, the full album on Bandcamp. Just open:', mailSubj: 'A gift for you',
  chat: 'how it lands in the chat', ogT: 'A gift from {giver}: {album}', ogD: 'Full album on Bandcamp · Padang Records',
  sentH: 'sent', empty: 'No gifts sent yet.', stSent: 'sent', stOpen: 'opened', stClaim: 'redeemed',
  anon: 'no name', again: 'send again', out: 'You are out of gifts. Talk to Padang if you need more.',
  sheetH: 'send via', copy: 'copy link', copied: 'link copied', mail: 'e-mail', sentOk: 'gift sent',
  err: 'that did not work, try again', close: 'close'
};

/* ───────── token e links ───────── */
const qs = new URLSearchParams(location.search);
let token = qs.get('t') || '';
const PATHMODE = !token;
if (!token) { const m = location.pathname.match(/\/g\/([A-Za-z0-9_-]+)\/?$/); token = m ? m[1] : ''; }
const linkFor = t => location.origin + (PATHMODE ? '/g/' + t : location.pathname + '?t=' + encodeURIComponent(t));
const NATIVE_SHARE = !!navigator.share && !qs.has('sheet') && !!window.matchMedia && matchMedia('(pointer:coarse)').matches;

/* ───────── distribuidor real (Supabase) ───────── */
function liveApi() {
  const rpc = (fn, args) => fetch(SB_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST', cache: 'no-store',
    headers: {'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY},
    body: JSON.stringify(args)
  }).then(r => { if (!r.ok) throw new Error('rpc ' + r.status); return r.json(); });
  return {
    load: tok => /^[a-z0-9]{12,64}$/.test(tok) ? rpc('padang_gift_load', {p_token: tok, p_lang: 'en'}) : Promise.resolve({kind: 'none'}),
    sent: (k, t, name) => rpc('padang_gift_sent', {p_panel: k, p_ticket: t, p_name: name || null, p_lang: 'en'}),
    claim: t => rpc('padang_gift_claim', {p_ticket: t})
  };
}

/* ───────── distribuidor simulado (demo) ───────── */
const ALBUMS = {
  'nyctophilia-iii': {title: 'Nyctophilia III', artist: null, type: 'VA', tracks: 17, album_id: '3459826971', cover: 'https://f4.bcbits.com/img/a2482166501_10.jpg'},
  'the-forge': {title: 'The Forge', artist: 'Ubik', type: 'LP', tracks: 9, album_id: '1480387288', cover: 'https://f4.bcbits.com/img/a3057276317_10.jpg'}
};
const DEMO_PANELS = {
  'demo-rhabia': {giver: 'Rhabia', slug: 'nyctophilia-iii', total: 100},
  'demo-ubik': {giver: 'Ubik', slug: 'the-forge', total: 100}
};
function demoApi() {
  const KEY = 'padang-gift-demo-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {tk: {}}; } catch (e) { return {tk: {}}; } };
  const write = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const rid = () => 'demo-' + Math.random().toString(36).slice(2, 8);
  const wait = v => new Promise(r => setTimeout(() => r(v), 140));
  function seed(s, k) {
    if (Object.keys(s.tk).some(t => s.tk[t].k === k)) return;
    const h = 3600e3, base = Date.now();
    [['Ana', 26 * h, 25 * h, 24 * h], ['Leo', 5 * h, 2 * h, 0], ['', 40 * 60e3, 0, 0]].forEach((r, i) => {
      s.tk[rid()] = {k, n: i + 1, name: r[0], sent: base - r[1], opened: r[2] ? base - r[2] : 0, claimed: r[3] ? base - r[3] : 0};
    });
  }
  function panel(s, k) {
    const p = DEMO_PANELS[k];
    seed(s, k);
    const all = Object.keys(s.tk).filter(t => s.tk[t].k === k).map(t => Object.assign({t}, s.tk[t]));
    let next = all.find(x => !x.sent) || null;
    if (!next && all.length < p.total) {
      const t = rid();
      s.tk[t] = {k, n: all.length + 1, name: '', sent: 0, opened: 0, claimed: 0};
      next = Object.assign({t}, s.tk[t]);
    }
    write(s);
    return {kind: 'panel', demo: true, giver: p.giver, album: ALBUMS[p.slug], total: p.total,
      next: next ? {t: next.t, n: next.n} : null,
      sent: all.filter(x => x.sent).sort((a, b) => b.n - a.n)};
  }
  return {
    load(tok) {
      const s = read();
      if (DEMO_PANELS[tok]) return wait(panel(s, tok));
      let x = s.tk[tok];
      /* link de demonstração aberto em outro aparelho: vira um presente de exemplo */
      if (!x) { x = s.tk[tok] = {k: 'demo-rhabia', n: 7, name: '', sent: Date.now(), opened: 0, claimed: 0}; }
      if (x.sent && !x.opened) { x.opened = Date.now(); write(s); }
      const p = DEMO_PANELS[x.k];
      return wait({kind: 'ticket', demo: true, giver: p.giver, album: ALBUMS[p.slug], name: x.name, claimed: x.claimed});
    },
    sent(k, t, name) {
      const s = read(), x = s.tk[t];
      if (x && x.k === k) { if (!x.sent) x.sent = Date.now(); if (name) x.name = name; write(s); }
      return wait(panel(read(), k));
    },
    claim(t) {
      const s = read(), x = s.tk[t];
      if (!x) return wait(null);
      if (!x.opened) x.opened = Date.now();
      if (!x.claimed) x.claimed = Date.now();
      write(s);
      return wait({code: 'demo-code'});
    }
  };
}
const DEMO = /^demo-/.test(token);
const api = DEMO ? demoApi() : liveApi();

/* ───────── estado e utilidades ───────── */
const app = $('#app'), sheet = $('#sheet'), toastEl = $('#toast');
let data = null, nameDraft = '', toastTimer = 0;
const pad3 = n => ('00' + n).slice(-3);
const cover = (a, size) => a.cover.replace(/_\d+\.jpg$/, '_' + size + '.jpg');
const typeLine = a => (a.type === 'VA' ? 'V/A' : a.type === 'LP' ? L.album : 'EP') + ' · ' + a.tracks + ' ' + L.tracks;
const when = ts => new Date(ts).toLocaleString(LOCALE, {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'});
const shortUrl = u => u.replace(/^https?:\/\//, '');
function shareText(name) {
  const base = L.share.replace('{album}', data.album.title);
  return name ? L.shareTo.replace('{name}', name) + base : base.charAt(0).toUpperCase() + base.slice(1);
}
function toast(msg) {
  toastEl.textContent = msg; toastEl.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

/* ───────── página do amigo ───────── */
function viewTicket() {
  const a = data.album, done = !!data.code;
  document.title = L.ogT.replace('{giver}', data.giver).replace('{album}', a.title);
  const yum = data.demo ? YUM : YUM + '?code=' + encodeURIComponent(data.code || '');
  const action = done
    ? `<a class="btn" id="go" href="${esc(yum)}"${data.demo ? ' target="_blank" rel="noopener"' : ''}>${esc(L.open)} <span>→</span></a>
       ${data.demo ? `<p class="note">${esc(L.demoNote)}</p>` : `<p class="fine go">${esc(L.opening)}</p>`}`
    : `<button type="button" class="btn js-redeem">${esc(L.redeem)} <span>→</span></button>
       <p class="fine">${esc(data.claimed ? L.claimedOn.replace('{when}', when(data.claimed)) : L.fine)}</p>`;
  /* barra fixa: o botão fica à mão enquanto o do ingresso não está na tela */
  const bar = done ? '' : `<div class="bar" id="bar" hidden><button type="button" class="btn js-redeem">${esc(L.redeem)} <span>→</span></button></div>`;
  return `
  ${data.demo ? `<div class="demo">${esc(L.demo)}</div>` : ''}
  <p class="eyebrow">${esc(data.name ? L.forName.replace('{name}', data.name) : L.forYou)}</p>
  <h1>${esc(L.from).replace('{giver}', `<b>${esc(data.giver)}</b>`)}</h1>
  <article class="tk${tkShown ? '' : ' rise'}">
    <div class="tk-cover"><img src="${esc(cover(a, 16))}" width="700" height="700" alt="${esc((a.artist ? a.artist + ' — ' : '') + a.title)}"></div>
    <div class="tk-info">
      <div class="tk-type">${esc(typeLine(a))}</div>
      <h2>${esc(a.title)}</h2>
      <div class="tk-artist">${esc(a.artist || L.various)} · padang records</div>
    </div>
    <div class="perf"></div>
    <div class="tk-stub">
      <div class="tk-row">
        <div><span class="lb">${esc(L.code)}</span><span class="code${done ? '' : ' hid'}">${done ? esc(data.code) : '••••-••••'}</span></div>
      </div>
      ${action}
    </div>
  </article>
  <section class="listen">
    <h3>${esc(L.listen)}</h3>
    <div class="pl"><iframe loading="lazy" title="${esc(a.title)}" src="https://bandcamp.com/EmbeddedPlayer/album=${esc(a.album_id)}/size=large/bgcol=181a1b/linkcol=c4ff3d/tracklist=false/artwork=none/transparent=true/" seamless></iframe></div>
  </section>
  <section class="how">
    <h3>${esc(L.how)}</h3>
    <ol><li>${esc(L.how1)}</li><li>${esc(L.how2)}</li><li>${esc(L.how3)}</li></ol>
  </section>${bar}`;
}
let barWatch = null, tkShown = false;
function watchBar() {
  if (barWatch) { barWatch.disconnect(); barWatch = null; }
  const bar = $('#bar'), main = $('.tk .js-redeem');
  document.body.classList.toggle('has-bar', !!bar);
  if (!bar || !main || !('IntersectionObserver' in window)) return;
  barWatch = new IntersectionObserver(es => { bar.hidden = es[0].isIntersecting; }, {threshold: 0.6});
  barWatch.observe(main);
}
async function redeem() {
  const btns = app.querySelectorAll('.js-redeem');
  btns.forEach(b => { b.disabled = true; });
  let r = null;
  try { r = await api.claim(token); } catch (e) {}
  if (!r || !r.code) { btns.forEach(b => { b.disabled = false; }); toast(L.err); return; }
  data.code = r.code; data.claimed = data.claimed || Date.now();
  render();
  const stub = $('.tk-stub'); if (stub) stub.scrollIntoView({block: 'center', behavior: 'smooth'});
  if (!data.demo) setTimeout(() => { location.href = YUM + '?code=' + encodeURIComponent(r.code); }, 900);
}

/* ───────── painel do DJ ───────── */
function chatPreview() {
  const a = data.album, t = data.next ? data.next.t : 'xxxxxxxxxxxx';
  return `<div class="chat"><div class="bub">
    <div class="card"><img src="${esc(cover(a, 7))}" width="150" height="150" alt="">
      <div><b>${esc(L.ogT.replace('{giver}', data.giver).replace('{album}', a.title))}</b><span>${esc(L.ogD)}</span><i>padangrecords.net</i></div></div>
    <div class="msg"><span id="pv-msg">${esc(shareText(nameDraft.trim()))}</span> <u>${esc(shortUrl(linkFor(t)))}</u></div>
    <div class="tm">${esc(new Date().toLocaleTimeString(LOCALE, {hour: '2-digit', minute: '2-digit'}))}</div>
  </div></div>`;
}
function viewPanel() {
  const a = data.album, s = data.sent;
  document.title = L.panel + ' · ' + data.giver;
  const rows = s.map(x => {
    const st = x.claimed ? ['claimed', L.stClaim, x.claimed] : x.opened ? ['opened', L.stOpen, x.opened] : ['', L.stSent, x.sent];
    return `<li><span class="n">${pad3(x.n)}</span><span class="who${x.name ? '' : ' anon'}">${esc(x.name || L.anon)}</span><span class="pill ${st[0]}">${esc(st[1])}</span>
      <span class="when"><span>${esc(when(st[2]))}</span><button type="button" class="again" data-again="${esc(x.t)}">${esc(L.again)}</button></span></li>`;
  }).join('');
  return `
  ${data.demo ? `<div class="demo">${esc(L.demo)}</div>` : ''}
  <p class="eyebrow">${esc(L.panel)}</p>
  <h1>${esc(L.hello)} <b>${esc(data.giver)}</b></h1>
  <div class="pa">
    <img class="pa-cover" src="${esc(cover(a, 2))}" width="350" height="350" alt="">
    <div><div class="tk-type">${esc(typeLine(a))}</div><div class="pa-title">${esc(a.title)}</div><div class="tk-artist">${esc(a.artist || L.various)}</div></div>
  </div>
  <p class="lead">${esc(L.lead.replace('{total}', data.total).replace('{album}', a.title))}</p>
  <div class="stats">
    <div><b>${data.total - s.length}</b><span>${esc(L.sLeft)}</span></div>
    <div><b>${s.length}</b><span>${esc(L.sSent)}</span></div>
    <div><b>${s.filter(x => x.opened).length}</b><span>${esc(L.sOpen)}</span></div>
    <div><b>${s.filter(x => x.claimed).length}</b><span>${esc(L.sClaim)}</span></div>
  </div>
  <div class="send">
    <label for="to">${esc(L.toLabel)} <i>${esc(L.optional)}</i></label>
    <input id="to" type="text" maxlength="24" autocomplete="off" autocapitalize="words" placeholder="${esc(L.toPh)}" value="${esc(nameDraft)}">
    <button type="button" class="btn" id="send"${data.next ? '' : ' disabled'}>${esc(L.send)} <span>→</span></button>
    <p class="fine">${esc(data.next ? L.sendFine : L.out)}</p>
  </div>
  <section class="prev"><h3>${esc(L.chat)}</h3>${chatPreview()}</section>
  <section class="sent"><h3>${esc(L.sentH)}</h3>${rows ? `<ul>${rows}</ul>` : `<p class="empty">${esc(L.empty)}</p>`}</section>`;
}
function shareTicket(t, name, fresh) {
  const url = linkFor(t), text = shareText(name);
  const done = () => api.sent(token, t, name).then(d => {
    if (d && d.kind === 'panel') data = d;
    if (fresh) nameDraft = '';
    render();
    toast(L.sentOk);
  }).catch(() => { toast(L.err); });
  if (NATIVE_SHARE) {
    navigator.share({text, url}).then(done).catch(e => { if (!e || e.name !== 'AbortError') openSheet(url, text, done); });
  } else openSheet(url, text, done);
}
/* Copia sem depender só da API nova: se ela recusar ou não responder, usa o método antigo. */
function copyText(text) {
  const legacy = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  };
  if (!navigator.clipboard || !navigator.clipboard.writeText) return Promise.resolve(legacy());
  return Promise.race([
    navigator.clipboard.writeText(text).then(() => true, () => legacy()),
    new Promise(r => setTimeout(() => r(legacy()), 1200))
  ]);
}
function openSheet(url, text, done) {
  const full = text + ' ' + url;
  sheet.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true">
    <div class="sheet-hd"><span>${esc(L.sheetH)}</span><button type="button" data-x>${esc(L.close)}</button></div>
    <div class="sheet-url">${esc(shortUrl(url))}</div>
    <div class="opts">
      <a class="opt" data-ch target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(full)}">whatsapp</a>
      <a class="opt" data-ch target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}">telegram</a>
      <a class="opt" data-ch href="mailto:?subject=${encodeURIComponent(L.mailSubj)}&body=${encodeURIComponent(text + '\n' + url)}">${esc(L.mail)}</a>
      <button type="button" class="opt" data-copy>${esc(L.copy)}</button>
    </div></div>`;
  sheet.hidden = false;
  const close = () => { sheet.hidden = true; sheet.innerHTML = ''; sheet.onclick = null; };
  sheet.onclick = ev => {
    const el = ev.target;
    if (el === sheet || el.closest('[data-x]')) return close();
    if (el.closest('[data-copy]')) {
      copyText(url).then(ok => {
        if (!ok) { toast(L.err); return; }   /* a folha fica aberta, com o link à vista para copiar à mão */
        close(); done().then(() => toast(L.copied));
      });
      return;
    }
    if (el.closest('[data-ch]')) { close(); done(); }
  };
}

/* ───────── render e eventos ───────── */
function render() {
  if (!data || data.kind === 'none' || data.kind === 'error') {
    const er = data && data.kind === 'error';
    document.body.classList.remove('has-bar');
    app.innerHTML = `<div class="none"><h1>${esc(er ? L.errT : L.noneT)}</h1><p>${esc(er ? L.errP : L.noneP)}</p>
      ${er ? `<button type="button" class="btn" id="retry">${esc(L.retry)}</button>` : ''}</div>`;
    return;
  }
  app.innerHTML = data.kind === 'panel' ? viewPanel() : viewTicket();
  if (data.kind === 'ticket') tkShown = true;
  watchBar();
}
function boot() {
  app.innerHTML = '<div class="load"><span></span></div>';
  api.load(token).then(d => { data = d || {kind: 'none'}; render(); }, () => { data = {kind: 'error'}; render(); });
}
app.addEventListener('click', ev => {
  const el = ev.target;
  if (el.closest('#retry')) return boot();
  if (el.closest('.js-redeem')) return redeem();
  if (el.closest('#send') && data && data.next) return shareTicket(data.next.t, nameDraft.trim(), true);
  const again = el.closest('[data-again]');
  if (again) { const x = data.sent.find(y => y.t === again.dataset.again); if (x) shareTicket(x.t, x.name || '', false); }
});
app.addEventListener('input', ev => {
  if (ev.target.id !== 'to') return;
  nameDraft = ev.target.value;
  const pv = $('#pv-msg'); if (pv) pv.textContent = shareText(nameDraft.trim());
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !data || data.kind !== 'panel' || !sheet.hidden) return;
  api.load(token).then(d => {
    if (!d || d.kind !== 'panel') return;
    const f = document.activeElement && document.activeElement.id === 'to';
    data = d; render();
    if (f) { const i = $('#to'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }).catch(() => {});
});

boot();
})();
