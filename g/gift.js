/* Padang Records · link-presente (/g/<token>)
   Um token na URL decide a tela: ticket = página do amigo, painel = página do DJ.
   O distribuidor fica no Supabase (funções padang_gift_*); o código do Bandcamp só sai no toque em "resgatar".
   Tokens "demo-…" usam um distribuidor simulado no próprio navegador (localStorage). */
(() => {
'use strict';

const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';
const YUM = 'https://padang.bandcamp.com/yum';
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/* ───────── textos ───────── */
const T = {
  pt: {
    forName: 'para {name}', forYou: 'para você', from: 'um presente de {giver}', various: 'vários artistas', tracks: 'faixas', album: 'álbum',
    code: 'código', gift: 'presente', redeem: 'resgatar no bandcamp', open: 'abrir o bandcamp',
    fine: 'link de uso único · sem prazo para resgatar', opening: 'abrindo o bandcamp com o seu código…',
    claimedOn: 'resgate iniciado em {when}', listen: 'ouça antes', how: 'como funciona',
    how1: 'Toque em resgatar. O código já vai preenchido.',
    how2: 'Entre no Bandcamp ou crie uma conta gratuita.',
    how3: 'O álbum completo vai para a sua coleção: streaming ilimitado no app e download em qualquer formato.',
    noneT: 'esse presente não existe', noneP: 'Confira o link com quem te mandou.',
    errT: 'não deu para abrir agora', errP: 'Confira a conexão e tente de novo.', retry: 'tentar de novo',
    demo: 'demonstração · códigos de exemplo',
    demoNote: 'Demonstração: no link real, este toque leva direto ao Bandcamp com o código preenchido.',
    panel: 'painel de presentes', hello: 'olá,',
    lead: 'Você tem {total} cópias de {album} para dar. Cada link vale o álbum completo no Bandcamp.',
    sLeft: 'livres', sSent: 'enviados', sOpen: 'abertos', sClaim: 'resgatados',
    toLabel: 'para quem?', optional: '(opcional)', toPh: 'nome do amigo', send: 'mandar para um amigo',
    sendFine: 'cada toque usa um link único · whatsapp, telegram, direct, onde quiser',
    shareTo: '{name}, ', share: 'um presente pra você: {album} completo no Bandcamp. É só abrir:', mailSubj: 'Um presente pra você',
    chat: 'como chega no chat', ogT: 'Um presente de {giver}: {album}', ogD: 'Álbum completo no Bandcamp · Padang Records',
    sentH: 'enviados', empty: 'Nenhum presente enviado ainda.', stSent: 'enviado', stOpen: 'aberto', stClaim: 'resgatado',
    anon: 'sem nome', again: 'reenviar', out: 'Acabaram os presentes. Fale com a Padang se precisar de mais.',
    sheetH: 'enviar por', copy: 'copiar link', copied: 'link copiado', mail: 'e-mail', sentOk: 'presente enviado',
    err: 'não deu certo, tente de novo', close: 'fechar'
  },
  en: {
    forName: 'for {name}', forYou: 'for you', from: 'a gift from {giver}', various: 'various artists', tracks: 'tracks', album: 'album',
    code: 'code', gift: 'gift', redeem: 'redeem on bandcamp', open: 'open bandcamp',
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
  },
  es: {
    forName: 'para {name}', forYou: 'para ti', from: 'un regalo de {giver}', various: 'varios artistas', tracks: 'temas', album: 'álbum',
    code: 'código', gift: 'regalo', redeem: 'canjear en bandcamp', open: 'abrir bandcamp',
    fine: 'enlace de un solo uso · sin fecha de caducidad', opening: 'abriendo bandcamp con tu código…',
    claimedOn: 'canje iniciado el {when}', listen: 'escucha antes', how: 'cómo funciona',
    how1: 'Pulsa canjear. El código ya va rellenado.',
    how2: 'Entra en Bandcamp o crea una cuenta gratuita.',
    how3: 'El álbum completo va a tu colección: streaming ilimitado en la app y descarga en cualquier formato.',
    noneT: 'este regalo no existe', noneP: 'Revisa el enlace con quien te lo envió.',
    errT: 'no se pudo abrir ahora', errP: 'Revisa tu conexión e inténtalo de nuevo.', retry: 'reintentar',
    demo: 'demostración · códigos de ejemplo',
    demoNote: 'Demostración: en un enlace real, este toque lleva directo a Bandcamp con el código rellenado.',
    panel: 'panel de regalos', hello: 'hola,',
    lead: 'Tienes {total} copias de {album} para regalar. Cada enlace vale el álbum completo en Bandcamp.',
    sLeft: 'libres', sSent: 'enviados', sOpen: 'abiertos', sClaim: 'canjeados',
    toLabel: '¿para quién?', optional: '(opcional)', toPh: 'nombre de tu amigo', send: 'enviar a un amigo',
    sendFine: 'cada toque usa un enlace único · whatsapp, telegram, dm, donde quieras',
    shareTo: '{name}, ', share: 'un regalo para ti: {album} completo en Bandcamp. Solo tienes que abrir:', mailSubj: 'Un regalo para ti',
    chat: 'cómo llega al chat', ogT: 'Un regalo de {giver}: {album}', ogD: 'Álbum completo en Bandcamp · Padang Records',
    sentH: 'enviados', empty: 'Todavía no has enviado ningún regalo.', stSent: 'enviado', stOpen: 'abierto', stClaim: 'canjeado',
    anon: 'sin nombre', again: 'reenviar', out: 'Se acabaron los regalos. Habla con Padang si necesitas más.',
    sheetH: 'enviar por', copy: 'copiar enlace', copied: 'enlace copiado', mail: 'e-mail', sentOk: 'regalo enviado',
    err: 'no funcionó, inténtalo de nuevo', close: 'cerrar'
  },
  de: {
    forName: 'für {name}', forYou: 'für dich', from: 'ein geschenk von {giver}', various: 'verschiedene künstler', tracks: 'tracks', album: 'album',
    code: 'code', gift: 'geschenk', redeem: 'auf bandcamp einlösen', open: 'bandcamp öffnen',
    fine: 'einmal gültiger link · kein ablaufdatum', opening: 'bandcamp wird mit deinem code geöffnet…',
    claimedOn: 'einlösung gestartet am {when}', listen: 'erst reinhören', how: 'so funktioniert es',
    how1: 'Tippe auf Einlösen. Der Code ist schon eingetragen.',
    how2: 'Melde dich bei Bandcamp an oder erstelle ein kostenloses Konto.',
    how3: 'Das komplette Album landet in deiner Sammlung: unbegrenztes Streaming in der App und Download in jedem Format.',
    noneT: 'dieses geschenk gibt es nicht', noneP: 'Frag die Person, die dir den Link geschickt hat.',
    errT: 'das ging gerade nicht', errP: 'Prüfe deine Verbindung und versuch es noch einmal.', retry: 'noch einmal',
    demo: 'demo · beispielcodes',
    demoNote: 'Demo: Bei einem echten Link führt dieser Tipp direkt zu Bandcamp, mit eingetragenem Code.',
    panel: 'geschenke-panel', hello: 'hallo,',
    lead: 'Du hast {total} Exemplare von {album} zu verschenken. Jeder Link steht für das komplette Album auf Bandcamp.',
    sLeft: 'frei', sSent: 'gesendet', sOpen: 'geöffnet', sClaim: 'eingelöst',
    toLabel: 'für wen?', optional: '(optional)', toPh: 'name deines freundes', send: 'an einen freund senden',
    sendFine: 'jeder tipp nutzt einen eigenen link · whatsapp, telegram, dm, wo du willst',
    shareTo: '{name}, ', share: 'ein Geschenk für dich: {album}, das komplette Album auf Bandcamp. Einfach öffnen:', mailSubj: 'Ein Geschenk für dich',
    chat: 'so kommt es im chat an', ogT: 'Ein Geschenk von {giver}: {album}', ogD: 'Komplettes Album auf Bandcamp · Padang Records',
    sentH: 'gesendet', empty: 'Noch keine Geschenke gesendet.', stSent: 'gesendet', stOpen: 'geöffnet', stClaim: 'eingelöst',
    anon: 'ohne name', again: 'erneut senden', out: 'Alle Geschenke sind weg. Melde dich bei Padang, wenn du mehr brauchst.',
    sheetH: 'senden über', copy: 'link kopieren', copied: 'link kopiert', mail: 'e-mail', sentOk: 'geschenk gesendet',
    err: 'das hat nicht geklappt, versuch es noch einmal', close: 'schließen'
  },
  fr: {
    forName: 'pour {name}', forYou: 'pour toi', from: 'un cadeau de {giver}', various: 'artistes variés', tracks: 'titres', album: 'album',
    code: 'code', gift: 'cadeau', redeem: 'récupérer sur bandcamp', open: 'ouvrir bandcamp',
    fine: "lien à usage unique · sans date d'expiration", opening: 'ouverture de bandcamp avec ton code…',
    claimedOn: 'récupération lancée le {when}', listen: 'écoute avant', how: 'comment ça marche',
    how1: 'Appuie sur récupérer. Le code est déjà rempli.',
    how2: 'Connecte-toi à Bandcamp ou crée un compte gratuit.',
    how3: "L'album complet rejoint ta collection : streaming illimité dans l'app et téléchargement dans tous les formats.",
    noneT: "ce cadeau n'existe pas", noneP: "Vérifie le lien avec la personne qui te l'a envoyé.",
    errT: "impossible d'ouvrir pour l'instant", errP: 'Vérifie ta connexion et réessaie.', retry: 'réessayer',
    demo: "démo · codes d'exemple",
    demoNote: 'Démo : sur un vrai lien, ce geste mène directement à Bandcamp avec le code déjà rempli.',
    panel: 'panneau de cadeaux', hello: 'salut,',
    lead: "Tu as {total} exemplaires de {album} à offrir. Chaque lien vaut l'album complet sur Bandcamp.",
    sLeft: 'restants', sSent: 'envoyés', sOpen: 'ouverts', sClaim: 'récupérés',
    toLabel: 'pour qui ?', optional: '(facultatif)', toPh: 'prénom de ton ami', send: 'envoyer à un ami',
    sendFine: 'chaque envoi utilise un lien unique · whatsapp, telegram, dm, où tu veux',
    shareTo: '{name}, ', share: "un cadeau pour toi : {album}, l'album complet sur Bandcamp. Il suffit d'ouvrir :", mailSubj: 'Un cadeau pour toi',
    chat: 'comment ça arrive dans le chat', ogT: 'Un cadeau de {giver} : {album}', ogD: 'Album complet sur Bandcamp · Padang Records',
    sentH: 'envoyés', empty: "Aucun cadeau envoyé pour l'instant.", stSent: 'envoyé', stOpen: 'ouvert', stClaim: 'récupéré',
    anon: 'sans nom', again: 'renvoyer', out: "Il n'y a plus de cadeaux. Contacte Padang s'il t'en faut d'autres.",
    sheetH: 'envoyer par', copy: 'copier le lien', copied: 'lien copié', mail: 'e-mail', sentOk: 'cadeau envoyé',
    err: "ça n'a pas marché, réessaie", close: 'fermer'
  },
  ja: {
    forName: '{name}さんへ', forYou: 'あなたへ', from: '{giver}からの贈り物', various: 'ヴァリアス・アーティスト', tracks: '曲', album: 'アルバム',
    code: 'コード', gift: 'ギフト', redeem: 'bandcampで受け取る', open: 'bandcampを開く',
    fine: '1回限りのリンク · 有効期限なし', opening: 'コード入力済みのbandcampを開いています…',
    claimedOn: '{when} に受け取りを開始', listen: 'まずは試聴', how: '受け取り方',
    how1: '「受け取る」をタップ。コードは入力済みです。',
    how2: 'Bandcampにログイン、または無料アカウントを作成。',
    how3: 'アルバム全曲がコレクションに追加されます。アプリで無制限ストリーミング、好きなフォーマットでダウンロード。',
    noneT: 'このギフトは存在しません', noneP: 'リンクを送ってくれた人に確認してください。',
    errT: 'いまは開けませんでした', errP: '接続を確認して、もう一度お試しください。', retry: '再試行',
    demo: 'デモ · サンプルコード',
    demoNote: 'デモ：実際のリンクでは、このタップでコード入力済みのBandcampに移動します。',
    panel: 'ギフトパネル', hello: 'こんにちは、',
    lead: '{album} を {total} 枚プレゼントできます。リンク1つでBandcampのアルバム全曲が届きます。',
    sLeft: '残り', sSent: '送信', sOpen: '開封', sClaim: '受取',
    toLabel: '誰に送る？', optional: '（任意）', toPh: '友だちの名前', send: '友だちに送る',
    sendFine: 'タップごとに専用リンク · whatsapp、telegram、dm、どこでも',
    shareTo: '{name}さん、', share: 'あなたへの贈り物：{album}（Bandcampのアルバム全曲）。リンクを開くだけ：', mailSubj: 'あなたへの贈り物',
    chat: 'チャットでの見え方', ogT: '{giver}からの贈り物：{album}', ogD: 'Bandcampのアルバム全曲 · Padang Records',
    sentH: '送信済み', empty: 'まだギフトを送っていません。', stSent: '送信済み', stOpen: '開封', stClaim: '受取済み',
    anon: '名前なし', again: '再送', out: 'ギフトがなくなりました。追加が必要な場合はPadangにご連絡ください。',
    sheetH: '送信方法', copy: 'リンクをコピー', copied: 'リンクをコピーしました', mail: 'メール', sentOk: 'ギフトを送りました',
    err: 'うまくいきませんでした。もう一度お試しください', close: '閉じる'
  }
};
const LANGS = Object.keys(T);

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
    load: (tok, lg) => /^[a-z0-9]{12,64}$/.test(tok) ? rpc('padang_gift_load', {p_token: tok, p_lang: lg || null}) : Promise.resolve({kind: 'none'}),
    sent: (k, t, name, lg) => rpc('padang_gift_sent', {p_panel: k, p_ticket: t, p_name: name || null, p_lang: lg || null}),
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
      return wait({kind: 'ticket', demo: true, giver: p.giver, album: ALBUMS[p.slug], total: p.total, n: x.n, name: x.name, claimed: x.claimed});
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
const app = $('#app'), sheet = $('#sheet'), toastEl = $('#toast'), langSel = $('#lang');
let lang, L, data = null, nameDraft = '', toastTimer = 0;

function pickLang() {
  let saved = null;
  try { saved = localStorage.getItem('padang-gift-lang'); } catch (e) {}
  const cands = [saved].concat(navigator.languages || [navigator.language || 'en']);
  for (const c of cands) { const l = String(c || '').slice(0, 2).toLowerCase(); if (T[l]) return l; }
  return 'en';
}
function setLang(l, chosen) {
  lang = l; L = T[l];
  document.documentElement.lang = l;
  langSel.innerHTML = LANGS.map(x => `<option value="${x}"${x === l ? ' selected' : ''}>${x}</option>`).join('');
  if (chosen) {
    try { localStorage.setItem('padang-gift-lang', l); } catch (e) {}
    /* o próximo link do painel sai com a prévia no idioma escolhido */
    if (data && data.kind === 'panel') api.load(token, l).catch(() => {});
  }
  if (data) render();
}
const pad3 = n => ('00' + n).slice(-3);
const cover = (a, size) => a.cover.replace(/_\d+\.jpg$/, '_' + size + '.jpg');
const typeLine = a => (a.type === 'VA' ? 'V/A' : a.type === 'LP' ? L.album : 'EP') + ' · ' + a.tracks + ' ' + L.tracks;
const when = ts => new Date(ts).toLocaleString(lang, {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'});
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
        <div class="ser"><span class="lb">${esc(L.gift)}</span><span class="num">${pad3(data.n)}<i> / ${data.total}</i></span></div>
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
    <div class="tm">${esc(new Date().toLocaleTimeString(lang, {hour: '2-digit', minute: '2-digit'}))}</div>
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
  const done = () => api.sent(token, t, name, lang).then(d => {
    if (d && d.kind === 'panel') data = d;
    if (fresh) nameDraft = '';
    render();
    toast(L.sentOk);
  }).catch(() => { toast(L.err); });
  if (NATIVE_SHARE) {
    navigator.share({text, url}).then(done).catch(e => { if (!e || e.name !== 'AbortError') openSheet(url, text, done); });
  } else openSheet(url, text, done);
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
      const fin = () => { close(); done().then(() => toast(L.copied)); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fin, fin); else fin();
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
  api.load(token, lang).then(d => { data = d || {kind: 'none'}; render(); }, () => { data = {kind: 'error'}; render(); });
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
langSel.addEventListener('change', () => setLang(langSel.value, true));
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !data || data.kind !== 'panel' || !sheet.hidden) return;
  api.load(token, lang).then(d => {
    if (!d || d.kind !== 'panel') return;
    const f = document.activeElement && document.activeElement.id === 'to';
    data = d; render();
    if (f) { const i = $('#to'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }).catch(() => {});
});

setLang(pickLang(), false);
boot();
})();
