/* ═══════════════════════════════════════════════════════════════
   PADANG RECORDS · DEMOS (a&r)
   Lista as demos recebidas (tabela padang_demos, RLS só admin),
   embeds para ouvir e resposta em um clique via demo-reply.php.
   Mesma sessão Supabase da área restrita (admin/index.html).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';
const sb = window.supabase.createClient(SB_URL, SB_KEY);
const UNDO_MS = 6000;

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function fmtDate(s) {
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
let toastTimer = null;
function toast(msg, isErr, undo) {
  const t = $('#toast');
  t.innerHTML = esc(msg);
  if (undo) {
    const b = document.createElement('button');
    b.textContent = 'desfazer';
    b.addEventListener('click', () => { undo(); t.hidden = true; });
    t.appendChild(b);
  }
  t.classList.toggle('err', !!isErr);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, undo ? UNDO_MS : 4000);
}

/* ───────────── Modelos de resposta ─────────────
   {name} = nome artístico. Tom da label: direto, caloroso, sem prometer o que não vai cumprir. */
const SIGN = '\n\nCarlos Dienstmann\nPadang Records · padangrecords.net';
const TPL = {
  interesse: {
    en: 'Hey {name},\n\nThanks for sending your music to Padang Records. We listened and we really liked it — it speaks the same language as the label.\n\nWe would love to talk about a release. Could you send us a private link with the WAV files, a short bio and a photo, and tell us how you imagine the release (single, EP, VA)?\n\nYou can also reach me directly on WhatsApp: +55 51 99566-9035.\n\nSpiritual beats,' + SIGN,
    pt: 'Olá {name},\n\nObrigado por mandar sua música para a Padang Records. Ouvimos e gostamos muito — fala a mesma língua da label.\n\nQueremos conversar sobre um lançamento. Pode nos mandar um link privado com os WAVs, uma bio curta e uma foto, e contar como você imagina o lançamento (single, EP, VA)?\n\nSe preferir, me chama direto no WhatsApp: +55 51 99566-9035.\n\nAbraço,' + SIGN,
    es: 'Hola {name},\n\nGracias por enviar tu música a Padang Records. La escuchamos y nos gustó mucho — habla el mismo idioma que el sello.\n\nNos encantaría hablar de un lanzamiento. ¿Nos puedes enviar un link privado con los WAV, una bio corta y una foto, y contarnos cómo imaginas el lanzamiento (single, EP, VA)?\n\nTambién puedes escribirme directo por WhatsApp: +55 51 99566-9035.\n\nUn abrazo,' + SIGN
  },
  talvez: {
    en: 'Hey {name},\n\nThanks for the demo — there are some really interesting ideas here. It may not be the right moment for a full EP yet, but it could fit one of our VA compilations.\n\nWe will share it with the artists curating our next VAs and get back to you. Meanwhile, feel free to send anything new you are working on.\n\nSpiritual beats,' + SIGN,
    pt: 'Olá {name},\n\nObrigado pela demo — tem ideias bem interessantes aqui. Talvez ainda não seja o momento de um EP, mas pode se encaixar em uma das nossas coletâneas (VA).\n\nVamos compartilhar com os artistas que estão compilando os próximos VAs e voltamos a falar com você. Enquanto isso, manda o que tiver de novo.\n\nAbraço,' + SIGN,
    es: 'Hola {name},\n\nGracias por la demo — hay ideas muy interesantes aquí. Quizás todavía no sea el momento de un EP, pero podría encajar en uno de nuestros VA.\n\nLa vamos a compartir con los artistas que están compilando los próximos VA y te escribimos. Mientras tanto, envíanos lo nuevo que tengas.\n\nUn abrazo,' + SIGN
  },
  recusado: {
    en: 'Hey {name},\n\nThank you for sending us your music and for thinking of Padang Records. We listened carefully, but this material is not the right fit for our catalogue at the moment.\n\nThis is about our curation, not about the quality of your work. Keep creating, and feel free to send us new music in the future — we are always listening.\n\nSave your ears from sameness,' + SIGN,
    pt: 'Olá {name},\n\nObrigado por mandar sua música e por pensar na Padang Records. Ouvimos com atenção, mas esse material não se encaixa no nosso catálogo neste momento.\n\nÉ uma questão de curadoria, não da qualidade do seu trabalho. Continue criando e fique à vontade para mandar músicas novas no futuro — estamos sempre ouvindo.\n\nAbraço,' + SIGN,
    es: 'Hola {name},\n\nGracias por enviarnos tu música y por pensar en Padang Records. La escuchamos con atención, pero este material no encaja en nuestro catálogo en este momento.\n\nEs una cuestión de curaduría, no de la calidad de tu trabajo. Sigue creando y no dudes en enviarnos música nueva en el futuro — siempre estamos escuchando.\n\nUn abrazo,' + SIGN
  }
};
const KIND_LABEL = { interesse: 'interesse', talvez: 'talvez / VA', recusado: 'recusada', novo: 'nova' };
function firstName(d) {
  return (d.artist || d.from_name || '').split(/\s+(?:&|x|and|,)\s+/i)[0].replace(/\s*\(.*\)\s*$/, '').trim() || 'there';
}
function tplFor(d, kind, lang) {
  return TPL[kind][lang].replace('{name}', firstName(d));
}

/* ───────────── Embeds ───────────── */
function embedFor(link) {
  const u = link.url;
  let m;
  if (/soundcloud\.com\//.test(u) && !/on\.soundcloud\.com/.test(u)) {
    const path = u.replace(/^https?:\/\/(m\.|www\.)?soundcloud\.com\//, '').split('?')[0].replace(/\/$/, '');
    if (path.split('/').length < 2) return null; // perfil, não faixa
    const isSet = /\/sets\//.test(u);
    return { src: 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(u.split('?')[0]) +
      '&color=%23c4ff3d&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false',
      h: isSet ? 300 : 166 };
  }
  if ((m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) return { src: 'https://drive.google.com/file/d/' + m[1] + '/preview', h: 120 };
  if ((m = u.match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/|open\?id=)([\w-]+)/))) return { src: 'https://drive.google.com/embeddedfolderview?id=' + m[1] + '#list', h: 220 };
  if ((m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/))) return { src: 'https://www.youtube-nocookie.com/embed/' + m[1], h: 220 };
  if (/dropbox\.com\/.+\.(mp3|wav|m4a|aiff?|flac)(\?|$)/i.test(u)) return { audio: u.replace(/([?&])dl=0/, '$1raw=1') };
  return null;
}
function linkLabel(l) {
  const k = l.kind === 'link' ? (l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) : l.kind;
  return '↗ ' + k;
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const ph = e.target;
    io.unobserve(ph);
    if (ph.dataset.audio) {
      const a = document.createElement('audio');
      a.controls = true; a.preload = 'none'; a.src = ph.dataset.audio;
      ph.replaceWith(a);
    } else {
      const f = document.createElement('iframe');
      f.src = ph.dataset.src; f.height = ph.dataset.h; f.loading = 'lazy';
      f.allow = 'autoplay; encrypted-media';
      f.title = 'player';
      ph.replaceWith(f);
    }
  });
}, { rootMargin: '400px' });

/* ───────────── Estado ───────────── */
const state = { demos: [], status: 'novo', q: '', year: 'all', pending: {} };
// O artista respondeu/reenviou depois da última vez que você mexeu na demo (o sincronizador do contact@ anexa ao cartão).
const newFollow = (d) => !!d.followup_at && (!(d.handled_at || d.replied_at) || d.followup_at > (d.handled_at || d.replied_at));

function card(d) {
  const embeds = [], links = [];
  (d.links || []).forEach((l) => {
    const e = embedFor(l);
    if (e && embeds.length < 3) embeds.push(e.audio
      ? '<div class="dm-ph" data-audio="' + esc(e.audio) + '"></div>'
      : '<div class="dm-ph" style="height:' + e.h + 'px" data-src="' + esc(e.src) + '" data-h="' + e.h + '"></div>');
    links.push('<a class="dm-link" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(linkLabel(l)) + '</a>');
  });
  const replied = d.replied_at
    ? '<div class="dm-replied">respondido em ' + esc(fmtDate(d.replied_at)) + ' · ' + esc(KIND_LABEL[d.status] || d.status) + '</div>' : '';
  const isNew = d.status === 'novo';
  return '<article class="dm' + (state.pending[d.id] ? ' pending' : '') + '" data-id="' + d.id + '">' +
    '<div class="dm-head"><div>' +
      '<div class="dm-artist">' + esc(d.artist || d.from_name || d.from_email) + '</div>' +
      '<div class="dm-meta">' + esc(d.from_name ? d.from_name + ' · ' : '') + esc(d.from_email) + (d.genre ? ' · ' + esc(d.genre) : '') + '</div>' +
      '<span class="dm-badge ' + esc(d.status) + '">' + esc(KIND_LABEL[d.status] || d.status) + '</span>' +
      (d.source === 'form' ? ' <span class="dm-badge form">site</span>' : '') +
      (newFollow(d) ? ' <span class="dm-badge follow">↩ resposta nova · ' + esc(fmtDate(d.followup_at)) + '</span>' : '') +
    '</div><div class="dm-date">' + esc(fmtDate(d.received_at)) + '</div></div>' +
    '<div class="dm-subj">' + esc(d.subject || '') + '</div>' +
    (embeds.length ? '<div class="dm-embeds">' + embeds.join('') + '</div>' : '') +
    (links.length ? '<div class="dm-links">' + links.join('') + '</div>'
      : '<div class="dm-none">sem link — a música deve estar em anexo no e-mail</div>') +
    '<details><summary>ver e-mail</summary><div class="dm-body">' + esc(d.body || '') + '</div></details>' +
    (d.reply_text ? '<details><summary>resposta enviada</summary><div class="dm-body">' + esc(d.reply_text) + '</div></details>' : '') +
    replied +
    '<div class="dm-actions">' +
      '<button class="btn btn-sm btn-ok" data-act="interesse"' + (isNew ? '' : ' title="já respondida"') + '>✓ aceitar</button>' +
      '<button class="btn btn-sm btn-maybe" data-act="talvez">~ talvez</button>' +
      '<button class="btn btn-sm btn-no" data-act="recusado">✕ recusar</button>' +
      '<button class="btn btn-sm btn-edit" data-act="edit" aria-label="Editar resposta">✎</button>' +
    '</div></article>';
}

function filtered(status) {
  const q = state.q.toLowerCase();
  return state.demos.filter((d) =>
    (status === 'all' || d.status === status || (status === 'novo' && newFollow(d))) &&
    (state.year === 'all' || String(d.received_at).slice(0, 4) === state.year) &&
    (!q || [d.artist, d.from_name, d.from_email, d.subject, d.genre, d.body].join(' ').toLowerCase().includes(q)));
}
function render() {
  ['novo', 'interesse', 'talvez', 'recusado', 'all'].forEach((s) => {
    const n = $('.tab-n[data-n="' + s + '"]'); if (n) n.textContent = filtered(s).length;
  });
  const rows = filtered(state.status);
  $('#count').textContent = rows.length + ' demo' + (rows.length === 1 ? '' : 's');
  $('#list').innerHTML = rows.length ? rows.map(card).join('')
    : '<div class="empty-state"><div class="empty-num">0</div><p>Nada aqui.</p><p class="empty-sub">caixa em dia</p></div>';
  $$('#list .dm-ph').forEach((ph) => io.observe(ph));
}

async function load() {
  const { data, error } = await sb.from('padang_demos').select('*').order('received_at', { ascending: false });
  if (error) { $('#list').innerHTML = '<div class="pane-error">' + esc(error.message) + '</div>'; return; }
  state.demos = data || [];
  render();
}

/* ───────────── Enviar / marcar ───────────── */
async function sendReply(id, kind, text, send) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { toast('Sessão expirou — entre de novo.', true); return false; }
  const res = await fetch('./demo-reply.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: session.access_token, id, status: kind, text, send })
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) { toast('Falhou: ' + (out.error || res.status), true); return false; }
  const d = state.demos.find((x) => x.id === id);
  if (d) { d.status = kind; d.handled_at = new Date().toISOString(); if (send) { d.replied_at = new Date().toISOString(); d.reply_text = text; } }
  return true;
}
function queue(d, kind, text) {
  // Janela de 6 s para desfazer antes de o e-mail sair de verdade.
  state.pending[d.id] = true;
  render();
  const timer = setTimeout(async () => {
    const ok = await sendReply(d.id, kind, text, true);
    delete state.pending[d.id];
    render();
    if (ok) toast('Resposta enviada para ' + d.from_email);
  }, UNDO_MS);
  toast((kind === 'recusado' ? '✕ recusando ' : kind === 'talvez' ? '~ talvez: ' : '✓ aceitando ') + (d.artist || d.from_email) + '…', false, () => {
    clearTimeout(timer); delete state.pending[d.id]; render();
  });
}

let editing = null;
function guessLang(d) { return d.lang || 'en'; }
function openEditor(d, kind) {
  editing = d;
  $('#rmTitle').textContent = 'Resposta · ' + (d.artist || d.from_email);
  $('#rmKind').value = kind || 'interesse';
  $('#rmLang').value = guessLang(d);
  $('#rmTo').value = d.from_email;
  $('#rmText').value = tplFor(d, $('#rmKind').value, $('#rmLang').value);
  $('#replyModal').hidden = false;
  $('#rmText').focus();
}
function refillEditor() { if (editing) $('#rmText').value = tplFor(editing, $('#rmKind').value, $('#rmLang').value); }
$('#rmKind').addEventListener('change', refillEditor);
$('#rmLang').addEventListener('change', refillEditor);
$('#rmClose').addEventListener('click', () => { $('#replyModal').hidden = true; editing = null; });
$('#rmSend').addEventListener('click', () => {
  const d = editing, text = $('#rmText').value.trim();
  if (!d || !text) return;
  $('#replyModal').hidden = true; editing = null;
  queue(d, $('#rmKind').value, text);
});
$('#rmMark').addEventListener('click', async () => {
  const d = editing; if (!d) return;
  $('#replyModal').hidden = true; editing = null;
  if (await sendReply(d.id, $('#rmKind').value, '', false)) { render(); toast('Marcada como ' + KIND_LABEL[d.status] + ' (sem e-mail).'); }
});

$('#list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const el = b.closest('.dm'); const d = state.demos.find((x) => String(x.id) === el.dataset.id);
  if (!d || state.pending[d.id]) return;
  const act = b.dataset.act;
  if (act === 'edit') { openEditor(d, d.status === 'novo' ? 'interesse' : d.status); return; }
  if (d.replied_at && !confirm('Esta demo já foi respondida em ' + fmtDate(d.replied_at) + '. Enviar outra resposta?')) return;
  queue(d, act, tplFor(d, act, guessLang(d)));
});

$$('#statusTabs .tab').forEach((t) => t.addEventListener('click', () => {
  $$('#statusTabs .tab').forEach((x) => x.classList.toggle('on', x === t));
  state.status = t.dataset.status; render();
}));
$('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
$('#year').addEventListener('change', (e) => { state.year = e.target.value; render(); });

/* ───────────── Autenticação (igual à área restrita) ───────────── */
function showOnly(id) { ['authView', 'deniedView', 'appView', 'bootView'].forEach((v) => { $('#' + v).hidden = v !== id; }); }
async function route() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showOnly('authView'); return; }
  const { data: isAdmin, error } = await sb.rpc('padang_is_admin');
  if (error || isAdmin !== true) { showOnly('deniedView'); return; }
  showOnly('appView');
  load();
}
sb.auth.onAuthStateChange(() => setTimeout(route, 0));
$('#authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#btnLogin').disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: $('#authEmail').value.trim(), password: $('#authPass').value });
  $('#btnLogin').disabled = false;
  $('#authError').hidden = !error;
  if (error) $('#authError').textContent = /invalid login/i.test(error.message) ? 'E-mail ou senha incorretos.' : error.message;
});
$('#btnLogout').addEventListener('click', () => sb.auth.signOut());
$('#btnDeniedLogout').addEventListener('click', () => sb.auth.signOut());
