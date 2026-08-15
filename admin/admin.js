/* ═══════════════════════════════════════════════════════════════
   PADANG RECORDS · ÁREA RESTRITA (admin)
   Vanilla JS + supabase-js@2 + PapaParse@5 + Chart.js@4 (CDN)
   Segurança: apenas publishable key; RLS default-deny no banco;
   toda string do banco/CSV passa por esc() antes de entrar no DOM.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ───────────── Config ───────────── */
const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';
const sb = window.supabase.createClient(SB_URL, SB_KEY);

/* ───────────── Helpers ───────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const nfInt = new Intl.NumberFormat('pt-BR');
function fmtInt(v) { return nfInt.format(Math.round(Number(v) || 0)); }

let DOM_CUR = 'USD';
let MULTI_CUR = false;
function money(v) {
  const n = Number(v) || 0;
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: DOM_CUR, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch (e) {
    return DOM_CUR + ' ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
function moneyShort(v) {
  const n = Number(v) || 0;
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: DOM_CUR, notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch (e) { return String(Math.round(n)); }
}

function fmtDateOnly(s) {
  if (!s) return '—';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[3] + '/' + m[2] + '/' + m[1];
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}
function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmtMonth(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})/);
  if (!m) return String(s || '');
  return MESES[parseInt(m[2], 10) - 1] + '/' + m[1].slice(2);
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function errMsg(error) {
  if (!error) return 'Erro desconhecido.';
  return String(error.message || error.error_description || error).slice(0, 300);
}

let toastTimer = null;
function toast(msg, isErr) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('err', !!isErr);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

/* Modal de confirmação genérico (Promise<boolean>) */
let cfResolve = null;
function askConfirm(title, msg, okLabel) {
  $('#cfTitle').textContent = title;
  $('#cfMsg').innerHTML = msg; /* msg é montada internamente, nunca com dado cru */
  $('#cfOk').textContent = okLabel || 'Confirmar';
  $('#confirmModal').hidden = false;
  return new Promise((resolve) => { cfResolve = resolve; });
}
function cfDone(v) {
  $('#confirmModal').hidden = true;
  if (cfResolve) { cfResolve(v); cfResolve = null; }
}
$('#cfOk').addEventListener('click', () => cfDone(true));
$('#cfCancel').addEventListener('click', () => cfDone(false));
$('#cfClose').addEventListener('click', () => cfDone(false));

/* ───────────── Estado global ───────────── */
const state = {
  session: null,
  loaded: { overview: false, artists: false, upload: false, insights: false },
  dirty: { overview: false, artists: false, upload: false, insights: false },
  artistsCache: null, // [{id, stage_name}] para dropdowns
  curDetected: false
};
function markDirty(tabs) {
  tabs.forEach((t) => { state.dirty[t] = true; });
  const cur = currentTab();
  if (tabs.includes(cur)) loadTab(cur, true);
}

/* ═════════════ AUTENTICAÇÃO ═════════════ */
const authView = $('#authView'), deniedView = $('#deniedView'),
  appView = $('#appView'), bootView = $('#bootView');

function showOnly(el) {
  [authView, deniedView, appView, bootView].forEach((v) => { v.hidden = (v !== el); });
}

let routing = false;
async function route() {
  if (routing) return;
  routing = true;
  try {
    const { data: { session } } = await sb.auth.getSession();
    state.session = session;
    if (!session) { showOnly(authView); return; }
    const { data: isAdmin, error } = await sb.rpc('padang_is_admin');
    if (error || isAdmin !== true) {
      $('#deniedEmail').textContent = session.user && session.user.email ? session.user.email : '';
      showOnly(deniedView);
      return;
    }
    $('#tbEmail').textContent = session.user.email || '';
    showOnly(appView);
    loadTab(currentTab());
  } finally { routing = false; }
}

sb.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    Object.keys(state.loaded).forEach((k) => { state.loaded[k] = false; });
    state.artistsCache = null;
    state.curDetected = false;
  }
  // setTimeout evita deadlock do supabase-js ao chamar a API dentro do callback
  setTimeout(route, 0);
});

$('#authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  authFeedback(null, null);
  const email = $('#authEmail').value.trim();
  const password = $('#authPass').value;
  $('#btnLogin').disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  $('#btnLogin').disabled = false;
  if (error) authFeedback(translateAuthErr(error), null);
});

/* Signup removido de proposito: contas de admin sao criadas apenas
   pelo dashboard do Supabase (Authentication > Users > Add user). */

function translateAuthErr(error) {
  const m = String((error && error.message) || '');
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(m)) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  if (/already registered/i.test(m)) return 'Este e-mail já tem conta. Use "Entrar".';
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Aguarde um instante e tente de novo.';
  return 'Falha na autenticação: ' + errMsg(error);
}
function authFeedback(err, info) {
  const e = $('#authError'), i = $('#authInfo');
  e.hidden = !err; if (err) e.textContent = err;
  i.hidden = !info; if (info) i.textContent = info;
}

$('#btnLogout').addEventListener('click', () => sb.auth.signOut());
$('#btnDeniedLogout').addEventListener('click', () => sb.auth.signOut());

/* ═════════════ ABAS ═════════════ */
function currentTab() {
  const on = $('.tab.on');
  return on ? on.dataset.tab : 'overview';
}
$$('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach((b) => { b.classList.toggle('on', b === btn); b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    $$('.tabpane').forEach((p) => { p.hidden = (p.id !== 'tab-' + btn.dataset.tab); });
    loadTab(btn.dataset.tab);
  });
});
function loadTab(tab, force) {
  const need = force || !state.loaded[tab] || state.dirty[tab];
  if (!need) return;
  state.dirty[tab] = false;
  state.loaded[tab] = true;
  if (tab === 'overview') loadOverview();
  else if (tab === 'artists') loadArtists();
  else if (tab === 'upload') { loadHistory(); loadUnmatched(); }
  else if (tab === 'insights') loadInsights();
}

/* ───────────── Moeda dominante ───────────── */
async function detectCurrency() {
  if (state.curDetected) return;
  try {
    const [a, b] = await Promise.all([
      sb.from('padang_bandcamp_sales').select('currency').not('currency', 'is', null).order('currency', { ascending: true }).limit(1),
      sb.from('padang_bandcamp_sales').select('currency').not('currency', 'is', null).order('currency', { ascending: false }).limit(1)
    ]);
    const lo = a.data && a.data[0] && a.data[0].currency;
    const hi = b.data && b.data[0] && b.data[0].currency;
    if (lo && hi) {
      MULTI_CUR = (lo !== hi);
      DOM_CUR = MULTI_CUR ? 'USD' : String(lo).toUpperCase();
    }
    state.curDetected = true;
  } catch (e) { /* mantém USD */ }
}

/* ═════════════ VISÃO GERAL ═════════════ */
async function loadOverview() {
  const cards = $('#ovCards'), err = $('#ovError'), empty = $('#ovEmpty'), warn = $('#ovCurrencyWarn');
  err.hidden = true; empty.hidden = true; warn.hidden = true;
  cards.setAttribute('aria-busy', 'true');
  cards.innerHTML = '<div class="card"><span class="lbl">carregando…</span></div>';
  await detectCurrency();
  const { data, error } = await sb.from('padang_v_overview').select('*').maybeSingle();
  cards.setAttribute('aria-busy', 'false');
  if (error) {
    cards.innerHTML = '';
    err.textContent = 'Erro ao carregar visão geral: ' + errMsg(error);
    err.hidden = false;
    return;
  }
  if (!data || !Number(data.total_rows)) {
    cards.innerHTML = '';
    empty.hidden = false;
    return;
  }
  if (MULTI_CUR) {
    warn.textContent = '⚠ Há vendas em mais de uma moeda — os totais somam valores de moedas diferentes (exibidos como ' + DOM_CUR + ').';
    warn.hidden = false;
  }
  const d = data;
  cards.innerHTML =
    card('período coberto', esc(fmtDateOnly(d.period_start)) + ' — ' + esc(fmtDateOnly(d.period_end)), '', '') +
    card('receita líquida (net)', esc(money(d.net_total)), 'money', 'hero') +
    card('receita bruta', esc(money(d.gross_total)), '', '') +
    card('taxas (fees)', esc(money(d.fees_total)), '', '') +
    card('itens vendidos', esc(fmtInt(d.items_sold)), '', '') +
    card('vendas (linhas)', esc(fmtInt(d.total_rows)), '', '') +
    card('compradores únicos', esc(fmtInt(d.unique_buyers)), '', '') +
    card('países', esc(fmtInt(d.countries)), '', '') +
    card('artistas com venda', esc(fmtInt(d.artists_with_sales)), '', '') +
    card('último upload', esc(fmtDateTime(d.last_upload_at)), '', '');
  function card(lbl, val, valCls, cardCls) {
    return '<div class="card ' + cardCls + '"><span class="lbl">' + lbl + '</span><span class="val ' + valCls + '">' + val + '</span></div>';
  }
}

/* ═════════════ ARTISTAS ═════════════ */
const AR = { rows: [], sortKey: 'balance_due', sortDir: 'desc' };

async function loadArtists() {
  const body = $('#arBody'), err = $('#arError');
  err.hidden = true;
  body.innerHTML = '<tr><td colspan="13" class="td-loading">Carregando…</td></tr>';
  await detectCurrency();
  const { data, error } = await sb.from('padang_v_artist_report').select('*');
  if (error) {
    body.innerHTML = '<tr><td colspan="13" class="td-empty">—</td></tr>';
    err.textContent = 'Erro ao carregar artistas: ' + errMsg(error);
    err.hidden = false;
    return;
  }
  AR.rows = data || [];
  renderArtists();
}

function renderArtists() {
  const body = $('#arBody');
  const q = ($('#arFilter').value || '').trim().toLowerCase();
  const onlyRoster = $('#arOnlyRoster').checked;
  const onlySales = $('#arOnlySales').checked;
  let rows = AR.rows.filter((r) => {
    if (onlyRoster && !r.on_roster) return false;
    if (onlySales && !Number(r.sales_count)) return false;
    if (q && !String(r.stage_name || '').toLowerCase().includes(q) && !String(r.real_name || '').toLowerCase().includes(q)) return false;
    return true;
  });
  const k = AR.sortKey, dir = AR.sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    const va = a[k], vb = b[k];
    if (typeof va === 'string' || typeof vb === 'string') {
      return String(va || '').localeCompare(String(vb || ''), 'pt-BR', { sensitivity: 'base' }) * dir;
    }
    return ((Number(va) || 0) - (Number(vb) || 0)) * dir;
  });
  $$('#arTable thead th').forEach((th) => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sort === k) th.classList.add(AR.sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
  });
  $('#arCount').textContent = rows.length + ' de ' + AR.rows.length + ' artistas';
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="13" class="td-empty">nenhum artista encontrado</td></tr>';
    return;
  }
  body.innerHTML = rows.map((r) => {
    const id = esc(r.artist_id);
    const sharePct = Math.round((Number(r.revenue_share) || 0) * 10000) / 100;
    const bal = Number(r.balance_due) || 0;
    return '<tr data-id="' + id + '">' +
      '<td class="artist-name" title="' + esc(r.real_name || '') + '">' + esc(r.stage_name) + '</td>' +
      '<td><button type="button" class="badge ' + (r.on_roster ? 'roster' : 'off') + '" data-act="roster" title="Clique para alternar">' + (r.on_roster ? 'roster' : 'fora do roster') + '</button></td>' +
      '<td class="num">' + esc(fmtInt(r.sales_count)) + '</td>' +
      '<td class="num">' + esc(fmtInt(r.items_sold)) + '</td>' +
      '<td class="num muted">' + esc(money(r.gross_total)) + '</td>' +
      '<td class="num">' + esc(money(r.net_revenue)) + '</td>' +
      '<td class="num"><input type="number" class="share-input" data-act="share" value="' + esc(sharePct) + '" min="0" max="100" step="1" aria-label="Percentual do artista"> %</td>' +
      '<td class="num">' + esc(money(r.artist_share)) + '</td>' +
      '<td class="num muted">' + esc(money(r.total_paid)) + '</td>' +
      '<td class="num"><span class="balance' + (bal > 0.005 ? '' : ' zero') + '">' + esc(money(bal)) + '</span></td>' +
      '<td><span class="cell-toggle"><input type="checkbox" data-act="merch" ' + (r.merch_sent ? 'checked' : '') + ' aria-label="Merch enviado">' +
        (r.merch_sent ? '<input type="date" data-act="merchdate" value="' + esc(r.merch_sent_at || '') + '" aria-label="Data do envio do merch">' : '') + '</span></td>' +
      '<td><span class="cell-toggle"><input type="checkbox" data-act="emailok" ' + (r.email_created ? 'checked' : '') + ' aria-label="E-mail criado"></span></td>' +
      '<td><button type="button" class="btn btn-ghost btn-xs" data-act="pay">registrar pagamento</button></td>' +
      '</tr>';
  }).join('');
}

$('#arFilter').addEventListener('input', renderArtists);
$('#arOnlyRoster').addEventListener('change', renderArtists);
$('#arOnlySales').addEventListener('change', renderArtists);
$$('#arTable thead th.sortable').forEach((th) => {
  th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (AR.sortKey === k) AR.sortDir = AR.sortDir === 'asc' ? 'desc' : 'asc';
    else { AR.sortKey = k; AR.sortDir = (k === 'stage_name') ? 'asc' : 'desc'; }
    renderArtists();
  });
});

async function updateArtist(id, patch) {
  const { error } = await sb.from('padang_artists').update(patch).eq('id', id);
  if (error) { toast('Erro ao salvar: ' + errMsg(error), true); return false; }
  toast('Salvo.');
  return true;
}

$('#arBody').addEventListener('change', async (e) => {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const id = tr.dataset.id;
  const act = e.target.dataset.act;
  if (act === 'merch') {
    const on = e.target.checked;
    await updateArtist(id, { merch_sent: on, merch_sent_at: on ? todayISO() : null });
    await loadArtists();
  } else if (act === 'merchdate') {
    await updateArtist(id, { merch_sent_at: e.target.value || null });
  } else if (act === 'emailok') {
    await updateArtist(id, { email_created: e.target.checked });
  } else if (act === 'share') {
    let v = parseFloat(e.target.value);
    if (isNaN(v)) v = 60;
    v = Math.min(100, Math.max(0, v));
    if (await updateArtist(id, { revenue_share: v / 100 })) await loadArtists();
  }
});

$('#arBody').addEventListener('click', async (e) => {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const id = tr.dataset.id;
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  if (btn.dataset.act === 'roster') {
    const row = AR.rows.find((r) => String(r.artist_id) === id);
    if (!row) return;
    if (await updateArtist(id, { on_roster: !row.on_roster })) await loadArtists();
  } else if (btn.dataset.act === 'pay') {
    const row = AR.rows.find((r) => String(r.artist_id) === id);
    if (row) openPayModal(row);
  }
});

/* ── modal de pagamento ── */
let payArtistId = null;
function openPayModal(row) {
  payArtistId = row.artist_id;
  $('#payArtist').textContent = row.stage_name || '';
  $('#payAmount').value = Number(row.balance_due) > 0 ? (Math.round(Number(row.balance_due) * 100) / 100) : '';
  $('#payCurrency').value = DOM_CUR;
  $('#payDate').value = todayISO();
  $('#payMethod').value = '';
  $('#payRef').value = '';
  $('#payNotes').value = '';
  $('#payError').hidden = true;
  $('#payModal').hidden = false;
  $('#payAmount').focus();
}
function closePayModal() { $('#payModal').hidden = true; payArtistId = null; }
$('#payClose').addEventListener('click', closePayModal);
$('#payCancel').addEventListener('click', closePayModal);
$('#payModal').addEventListener('click', (e) => { if (e.target === $('#payModal')) closePayModal(); });

$('#payForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!payArtistId) return;
  const amount = parseFloat($('#payAmount').value);
  if (!(amount > 0)) {
    $('#payError').textContent = 'Informe um valor maior que zero.';
    $('#payError').hidden = false;
    return;
  }
  $('#paySave').disabled = true;
  const { error } = await sb.from('padang_payments').insert({
    artist_id: payArtistId,
    amount: amount,
    currency: ($('#payCurrency').value.trim().toUpperCase() || 'USD'),
    paid_at: $('#payDate').value || todayISO(),
    method: $('#payMethod').value || null,
    reference: $('#payRef').value.trim() || null,
    notes: $('#payNotes').value.trim() || null,
    created_by: state.session && state.session.user ? state.session.user.email : null
  });
  $('#paySave').disabled = false;
  if (error) {
    $('#payError').textContent = 'Erro ao salvar: ' + errMsg(error);
    $('#payError').hidden = false;
    return;
  }
  closePayModal();
  toast('Pagamento registrado.');
  markDirty(['overview', 'insights']);
  await loadArtists();
});

/* ═════════════ UPLOAD DO CSV ═════════════ */
const HDR_MAP = {
  'date': 'sale_date', 'item type': 'item_type', 'item name': 'item_name',
  'artist': 'artist_name', 'currency': 'currency', 'item price': 'item_price',
  'quantity': 'quantity', 'discount code': 'discount_code', 'sub total': 'sub_total',
  'shipping': 'shipping', 'tax': 'tax', 'transaction fee': 'transaction_fee',
  'fee type': 'fee_type', 'item total': 'item_total', 'amount you received': 'amount_received',
  'net amount': 'net_amount', 'bandcamp transaction id': 'bandcamp_transaction_id',
  'paypal transaction id': 'paypal_transaction_id', 'package': 'package',
  'option': 'item_option', 'item url': 'item_url', 'catalog number': 'catalog_number',
  'upc': 'upc', 'isrc': 'isrc', 'buyer name': 'buyer_name', 'buyer email': 'buyer_email',
  'buyer phone': 'buyer_phone', 'buyer note': 'buyer_note', 'ship to name': 'ship_to_name',
  'ship to street': 'ship_to_street', 'ship to city': 'ship_to_city',
  'ship to state': 'ship_to_state', 'ship to zip': 'ship_to_zip',
  'ship to country': 'ship_to_country', 'country': 'country', 'country code': 'country_code',
  'transaction type': 'transaction_type', 'payment type': 'payment_type'
};
const NUM_COLS = { item_price: 1, sub_total: 1, shipping: 1, tax: 1, transaction_fee: 1, item_total: 1, amount_received: 1, net_amount: 1 };

function parseBcDate(s) {
  if (s == null) return null;
  s = String(s).trim();
  if (!s) return null;
  // "3/14/25 1:23pm" · "12/1/2024 11:05 am" · variações
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
  if (m) {
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    let hh = parseInt(m[4] || '0', 10);
    const ap = (m[7] || '').toLowerCase();
    if (ap === 'pm' && hh < 12) hh += 12;
    if (ap === 'am' && hh === 12) hh = 0;
    const dt = new Date(Date.UTC(y, parseInt(m[1], 10) - 1, parseInt(m[2], 10), hh, parseInt(m[5] || '0', 10), parseInt(m[6] || '0', 10)));
    return isNaN(dt) ? null : dt.toISOString();
  }
  const dt = new Date(s);
  return isNaN(dt) ? null : dt.toISOString();
}

function parseNum(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9eE.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function stableStringify(obj) {
  const keys = Object.keys(obj).sort();
  const o = {};
  for (const k of keys) o[k] = obj[k];
  return JSON.stringify(o);
}
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* — UI do upload — */
const csvInput = $('#csvFile'), fileBox = $('#fileBox'), fileHint = $('#fileHint'), btnUpload = $('#btnUpload');
csvInput.addEventListener('change', () => {
  const f = csvInput.files && csvInput.files[0];
  btnUpload.disabled = !f;
  fileHint.innerHTML = f ? '<b>' + esc(f.name) + '</b><br>' + esc((f.size / 1024).toFixed(1)) + ' KB' : 'Arraste o CSV aqui ou clique para escolher';
});
['dragover', 'dragenter'].forEach((ev) => fileBox.addEventListener(ev, (e) => { e.preventDefault(); fileBox.classList.add('drag'); }));
['dragleave', 'drop'].forEach((ev) => fileBox.addEventListener(ev, () => fileBox.classList.remove('drag')));

function upProgress(pct, label) {
  $('#upProgress').hidden = false;
  $('#upBar').style.width = Math.min(100, Math.max(0, pct)) + '%';
  $('#upLabel').textContent = label || '';
}
function upResult(html, isErr) {
  const el = $('#upResult');
  el.innerHTML = html;
  el.classList.toggle('err', !!isErr);
  el.hidden = false;
}

btnUpload.addEventListener('click', async () => {
  const file = csvInput.files && csvInput.files[0];
  if (!file) return;
  const mode = document.querySelector('input[name="upMode"]:checked').value;
  if (mode === 'replace_all') {
    const ok = await askConfirm('Substituir tudo?',
      'Isso vai <b>apagar TODOS os uploads e TODAS as vendas</b> já importadas antes de importar este CSV. Os pagamentos registrados não são afetados. Essa ação não pode ser desfeita.',
      'Sim, substituir tudo');
    if (!ok) return;
  }
  if (!window.crypto || !crypto.subtle) {
    upResult('<b>Erro:</b> este navegador/contexto não suporta crypto.subtle (necessário HTTPS).', true);
    return;
  }
  btnUpload.disabled = true;
  $('#upResult').hidden = true;
  try {
    await runUpload(file, mode);
  } catch (err) {
    upResult('<b>Erro na importação:</b> ' + esc(errMsg(err)), true);
  } finally {
    btnUpload.disabled = false;
    $('#upProgress').hidden = true;
  }
});

function papaParseFile(file) {
  return new Promise((resolve, reject) => {
    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (res) => resolve(res),
      error: (err) => reject(err)
    });
  });
}

async function runUpload(file, mode) {
  upProgress(2, 'Lendo CSV…');
  const parsed = await papaParseFile(file);
  const rawRows = (parsed.data || []).filter((r) => Object.values(r).some((v) => String(v == null ? '' : v).trim() !== ''));
  if (!rawRows.length) throw new Error('O CSV não tem linhas de dados.');

  // normaliza cabeçalhos: chave minúscula/trim → valor
  upProgress(6, 'Mapeando ' + fmtInt(rawRows.length) + ' linhas…');
  const records = [];
  let minDate = null, maxDate = null;
  const ALL_COLS = Object.values(HDR_MAP);
  for (const row of rawRows) {
    // todas as colunas mapeadas começam null: garante objetos com chaves
    // idênticas no lote (PostgREST exige) mesmo se o CSV tiver linha curta
    const rec = { raw: row };
    for (const c of ALL_COLS) rec[c] = null;
    for (const key of Object.keys(row)) {
      const col = HDR_MAP[String(key).trim().toLowerCase()];
      if (!col) continue;
      let v = row[key];
      v = (v == null) ? null : String(v).trim();
      if (v === '') v = null;
      if (col === 'sale_date') rec.sale_date = parseBcDate(v);
      else if (col === 'quantity') { const q = parseNum(v); rec.quantity = (q == null) ? null : Math.round(q); }
      else if (NUM_COLS[col]) rec[col] = parseNum(v);
      else rec[col] = v;
    }
    if (rec.sale_date) {
      if (!minDate || rec.sale_date < minDate) minDate = rec.sale_date;
      if (!maxDate || rec.sale_date > maxDate) maxDate = rec.sale_date;
    }
    records.push(rec);
  }

  if (mode === 'replace_all') {
    upProgress(10, 'Apagando dados anteriores…');
    const { error: delErr } = await sb.from('padang_sales_uploads').delete().not('id', 'is', null);
    if (delErr) throw delErr;
  }

  upProgress(12, 'Registrando upload…');
  const { data: up, error: upErr } = await sb.from('padang_sales_uploads').insert({
    filename: file.name,
    mode: mode,
    period_start: minDate ? minDate.slice(0, 10) : null,
    period_end: maxDate ? maxDate.slice(0, 10) : null,
    row_count: 0,
    uploaded_by: state.session && state.session.user ? state.session.user.email : null
  }).select('id').single();
  if (upErr) throw upErr;
  const uploadId = up.id;

  // hashes (com chaves ordenadas do objeto raw)
  for (let i = 0; i < records.length; i++) {
    records[i].upload_id = uploadId;
    records[i].row_hash = await sha256Hex(stableStringify(records[i].raw));
    if (i % 200 === 0) upProgress(12 + (i / records.length) * 18, 'Calculando hashes… ' + fmtInt(i) + '/' + fmtInt(records.length));
  }

  // upsert em lotes de 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { count, error } = await sb.from('padang_bandcamp_sales')
      .upsert(batch, { onConflict: 'row_hash', ignoreDuplicates: true, count: 'exact' });
    if (error) throw error;
    inserted += (count || 0);
    upProgress(30 + ((i + batch.length) / records.length) * 60,
      'Enviando… ' + fmtInt(Math.min(i + batch.length, records.length)) + '/' + fmtInt(records.length));
  }

  upProgress(92, 'Atualizando registro do upload…');
  await sb.from('padang_sales_uploads').update({ row_count: inserted }).eq('id', uploadId);

  upProgress(96, 'Vinculando vendas a artistas…');
  const { data: matchData, error: matchErr } = await sb.rpc('padang_match_sales');
  const match = (!matchErr && matchData && matchData[0]) ? matchData[0] : null;

  upProgress(100, 'Concluído.');
  const dup = records.length - inserted;
  upResult(
    'Linhas no CSV: <b>' + esc(fmtInt(records.length)) + '</b><br>' +
    'Novas inseridas: <b>' + esc(fmtInt(inserted)) + '</b> · duplicadas ignoradas: <b>' + esc(fmtInt(dup)) + '</b><br>' +
    'Período: <b>' + esc(fmtDateOnly(minDate)) + ' — ' + esc(fmtDateOnly(maxDate)) + '</b><br>' +
    (match
      ? 'Vinculadas a artistas: <b>' + esc(fmtInt(match.matched)) + '</b> · sem vínculo: <b>' + esc(fmtInt(match.still_unmatched)) + '</b>'
      : 'Vinculação automática falhou — rode de novo na seção "nomes sem vínculo".')
  );
  csvInput.value = '';
  btnUpload.disabled = true;
  fileHint.textContent = 'Arraste o CSV aqui ou clique para escolher';
  state.curDetected = false;
  markDirty(['overview', 'artists', 'insights']);
  loadHistory();
  loadUnmatched();
}

/* ── histórico de uploads ── */
async function loadHistory() {
  const body = $('#upHistBody');
  const { data, error } = await sb.from('padang_sales_uploads').select('*').order('created_at', { ascending: false });
  if (error) {
    body.innerHTML = '<tr><td colspan="6" class="td-empty">erro: ' + esc(errMsg(error)) + '</td></tr>';
    return;
  }
  if (!data || !data.length) {
    body.innerHTML = '<tr><td colspan="6" class="td-empty">nenhum upload ainda — suba o primeiro CSV acima</td></tr>';
    return;
  }
  body.innerHTML = data.map((u) =>
    '<tr data-id="' + esc(u.id) + '">' +
    '<td>' + esc(u.filename || '—') + '</td>' +
    '<td class="muted">' + esc(fmtDateOnly(u.period_start)) + ' — ' + esc(fmtDateOnly(u.period_end)) + '</td>' +
    '<td class="num">' + esc(fmtInt(u.row_count)) + '</td>' +
    '<td class="muted">' + (u.mode === 'replace_all' ? 'substituir tudo' : 'adicionar') + '</td>' +
    '<td class="muted">' + esc(fmtDateTime(u.created_at)) + '</td>' +
    '<td><button type="button" class="btn btn-ghost btn-xs" data-act="delup">apagar</button></td>' +
    '</tr>'
  ).join('');
}

$('#upHistBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act="delup"]');
  if (!btn) return;
  const tr = btn.closest('tr[data-id]');
  const id = tr.dataset.id;
  const ok = await askConfirm('Apagar upload?',
    'Isso apaga o upload e <b>todas as vendas importadas por ele</b> (cascata). Essa ação não pode ser desfeita.',
    'Sim, apagar');
  if (!ok) return;
  const { error } = await sb.from('padang_sales_uploads').delete().eq('id', id);
  if (error) { toast('Erro ao apagar: ' + errMsg(error), true); return; }
  toast('Upload apagado.');
  state.curDetected = false;
  markDirty(['overview', 'artists', 'insights']);
  loadHistory();
  loadUnmatched();
});

/* ── nomes sem vínculo ── */
async function ensureArtistsCache(force) {
  if (state.artistsCache && !force) return state.artistsCache;
  const { data, error } = await sb.from('padang_artists').select('id,stage_name').order('stage_name', { ascending: true });
  if (!error) state.artistsCache = data || [];
  return state.artistsCache || [];
}

async function loadUnmatched() {
  const body = $('#unmatchedBody');
  body.innerHTML = '<tr><td colspan="5" class="td-loading">Carregando…</td></tr>';
  await detectCurrency();
  const [{ data, error }, artists] = await Promise.all([
    sb.from('padang_v_unmatched').select('*'),
    ensureArtistsCache()
  ]);
  if (error) {
    body.innerHTML = '<tr><td colspan="5" class="td-empty">erro: ' + esc(errMsg(error)) + '</td></tr>';
    return;
  }
  if (!data || !data.length) {
    body.innerHTML = '<tr><td colspan="5" class="td-empty">✓ todos os nomes estão vinculados</td></tr>';
    return;
  }
  const opts = '<option value="">— escolher artista —</option>' +
    artists.map((a) => '<option value="' + esc(a.id) + '">' + esc(a.stage_name) + '</option>').join('');
  body.innerHTML = data.map((r) =>
    '<tr data-name="' + esc(r.artist_name) + '">' +
    '<td class="artist-name">' + esc(r.artist_name) + '</td>' +
    '<td class="num">' + esc(fmtInt(r.sales_count)) + '</td>' +
    '<td class="num">' + esc(money(r.net_revenue)) + '</td>' +
    '<td><select class="link-select" data-role="target" aria-label="Vincular a artista">' + opts + '</select></td>' +
    '<td><button type="button" class="btn btn-ghost btn-xs" data-act="link">vincular</button> ' +
    '<button type="button" class="btn btn-ghost btn-xs" data-act="create">criar artista</button></td>' +
    '</tr>'
  ).join('');
}

$('#unmatchedBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const tr = btn.closest('tr[data-name]');
  if (!tr) return;
  const name = tr.dataset.name;
  if (btn.dataset.act === 'link') {
    const sel = tr.querySelector('[data-role="target"]');
    const artistId = sel.value;
    if (!artistId) { toast('Escolha um artista para vincular.', true); return; }
    btn.disabled = true;
    const { error } = await sb.from('padang_artist_aliases').insert({ artist_id: artistId, alias: name });
    if (error) { btn.disabled = false; toast('Erro ao criar apelido: ' + errMsg(error), true); return; }
    await rematch();
  } else if (btn.dataset.act === 'create') {
    btn.disabled = true;
    const { error } = await sb.from('padang_artists').insert({ stage_name: name, on_roster: false });
    if (error) { btn.disabled = false; toast('Erro ao criar artista: ' + errMsg(error), true); return; }
    await ensureArtistsCache(true);
    await rematch();
  }
});

async function rematch() {
  const { data, error } = await sb.rpc('padang_match_sales');
  if (error) toast('Erro ao vincular vendas: ' + errMsg(error), true);
  else {
    const m = data && data[0];
    toast(m ? ('Vinculadas: ' + fmtInt(m.matched) + ' · ainda sem vínculo: ' + fmtInt(m.still_unmatched)) : 'Vinculação executada.');
  }
  markDirty(['overview', 'artists', 'insights']);
  loadUnmatched();
}

/* ═════════════ INSIGHTS ═════════════ */
/* Paleta categórica validada (CVD-safe, fundo escuro) — ordem fixa */
const PAL = ['#7aa513', '#3987e5', '#d55181', '#c98500', '#199e70', '#9085e9'];
const NEON = '#c4ff3d';
const TYPE_LBL = { album: 'álbum (digital)', track: 'faixa (digital)', package: 'físico / merch', merch: 'merch', bundle: 'bundle', 'digital album': 'álbum (digital)', 'digital track': 'faixa (digital)' };
const charts = {};
function mkChart(canvasId, cfg) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(el, cfg);
}
function chartDefaults() {
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 10;
  Chart.defaults.color = '#9a958b';
  Chart.defaults.borderColor = 'rgba(255,255,255,.07)';
  Chart.defaults.plugins.tooltip.backgroundColor = '#1d1a16';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(196,255,61,.35)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = '#e8e3d6';
  Chart.defaults.plugins.tooltip.bodyColor = '#e8e3d6';
  Chart.defaults.plugins.tooltip.padding = 10;
}
const moneyTick = (v) => moneyShort(v);
const moneyTip = (ctx) => {
  const v = (ctx.parsed && typeof ctx.parsed === 'object')
    ? (ctx.chart.config.type === 'bar' && ctx.chart.options.indexAxis === 'y' ? ctx.parsed.x : ctx.parsed.y)
    : ctx.parsed;
  return (ctx.dataset.label ? ctx.dataset.label + ': ' : '') + money(v);
};
function kpiHtml(lbl, val) {
  return '<div class="kpi"><span class="k-lbl">' + esc(lbl) + '</span><span class="k-val">' + esc(val) + '</span></div>';
}
function pctBR(x) {
  return String(Math.round((Number(x) || 0) * 10) / 10).replace('.', ',') + '%';
}
function ratioBR(x) {
  return String(Math.round((Number(x) || 0) * 10) / 10).replace('.', ',') + '×';
}

/* pills da sub-navegação (âncoras para os blocos) */
$$('.subnav .pill').forEach((a) => {
  a.addEventListener('click', () => {
    $$('.subnav .pill').forEach((p) => { p.classList.toggle('on', p === a); });
  });
});

/* Busca todas as linhas de uma view paginando em blocos de 1000.
   O PostgREST corta a resposta em 1000 linhas por request — sem isso,
   padang_v_payouts (~3,6k linhas) viria truncada e o acumulado final
   (total sacado / saldo estimado) sairia errado em silêncio. */
async function fetchAllRows(view, orderCols) {
  const PAGE = 1000, all = [];
  for (let from = 0; ; from += PAGE) {
    let q = sb.from(view).select('*');
    orderCols.forEach((c) => { q = q.order(c, { ascending: true }); });
    const { data, error } = await q.range(from, from + PAGE - 1);
    if (error) return { data: null, error: error };
    all.push.apply(all, data || []);
    if (!data || data.length < PAGE) return { data: all, error: null };
  }
}

async function loadInsights() {
  const err = $('#inError'), empty = $('#inEmpty'), grid = $('#inGrid'), hero = $('#inHero');
  err.hidden = true; empty.hidden = true; grid.style.display = '';
  hero.setAttribute('aria-busy', 'true');
  await detectCurrency();
  chartDefaults();
  const [monthly, country, byType, topItems, buyers, discounts,
    weekday, byHour, season, yearly, bcf, cities, referrers, tips, prices,
    momentum, buyersMonthly, artistYearly, refunds, payouts, formatYearly, overview,
    buyersTotal, buyersReturning] = await Promise.all([
    sb.from('padang_v_monthly').select('*').order('month', { ascending: true }),
    sb.from('padang_v_sales_by_country').select('*').order('net_revenue', { ascending: false }),
    sb.from('padang_v_sales_by_type').select('*').order('net_revenue', { ascending: false }),
    sb.from('padang_v_top_items').select('*').order('net_revenue', { ascending: false }).limit(10),
    sb.from('padang_v_top_buyers').select('*').order('net_revenue', { ascending: false }).limit(15),
    sb.from('padang_v_discounts').select('*').order('uses', { ascending: false }),
    sb.from('padang_v_by_weekday').select('*').order('dow', { ascending: true }),
    sb.from('padang_v_by_hour').select('*').order('hora', { ascending: true }),
    sb.from('padang_v_seasonality').select('*').order('mes', { ascending: true }),
    sb.from('padang_v_yearly').select('*').order('ano', { ascending: true }),
    sb.from('padang_v_bandcamp_friday').select('*'),
    sb.from('padang_v_top_cities').select('*').order('net_revenue', { ascending: false }).limit(15),
    sb.from('padang_v_referrers').select('*').order('sales_count', { ascending: false }),
    sb.from('padang_v_tips').select('*').maybeSingle(),
    sb.from('padang_v_price_points').select('*').order('net_revenue', { ascending: false }).limit(10),
    sb.from('padang_v_release_momentum').select('*').order('net_30d', { ascending: false }).limit(12),
    sb.from('padang_v_buyers_monthly').select('*').order('month', { ascending: true }),
    sb.from('padang_v_artist_yearly').select('*').order('ano', { ascending: true }),
    sb.from('padang_v_refunds').select('*').order('ano', { ascending: true }),
    fetchAllRows('padang_v_payouts', ['data', 'acumulado']),
    sb.from('padang_v_format_yearly').select('*').order('ano', { ascending: true }),
    sb.from('padang_v_overview').select('*').maybeSingle(),
    sb.from('padang_v_top_buyers').select('*', { count: 'exact', head: true }),
    sb.from('padang_v_top_buyers').select('*', { count: 'exact', head: true }).gt('purchases', 1)
  ]);
  const results = [monthly, country, byType, topItems, buyers, discounts, weekday, byHour, season,
    yearly, bcf, cities, referrers, tips, prices, momentum, buyersMonthly, artistYearly, refunds,
    payouts, formatYearly, overview, buyersTotal, buyersReturning];
  const firstErr = results.find((r) => r.error);
  if (firstErr) {
    err.textContent = 'Erro ao carregar insights: ' + errMsg(firstErr.error);
    err.hidden = false;
    hero.setAttribute('aria-busy', 'false');
    return;
  }
  const mrows = monthly.data || [];
  if (!mrows.length) {
    grid.style.display = 'none';
    empty.hidden = false;
    hero.setAttribute('aria-busy', 'false');
    return;
  }

  const wrows = weekday.data || [];
  const yrows = yearly.data || [];
  const bcfRows = bcf.data || [];
  const bfRow = bcfRows.find((r) => /friday/i.test(String(r.grupo || '')));
  const nrRow = bcfRows.find((r) => !/friday/i.test(String(r.grupo || '')));

  /* horas 0-23 completas (fuso de Brasília, já convertido na view) */
  const hNet = new Array(24).fill(0), hCnt = new Array(24).fill(0);
  (byHour.data || []).forEach((r) => {
    const h = Number(r.hora);
    if (h >= 0 && h <= 23) { hNet[h] = Number(r.net_revenue) || 0; hCnt[h] = Number(r.sales_count) || 0; }
  });

  /* ── tira de destaques ── */
  function heroCard(lbl, val, sub) {
    return '<div class="card"><span class="lbl">' + esc(lbl) + '</span><span class="val money">' + esc(val) + '</span>' +
      (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</div>';
  }
  let heroHtml = '';
  if (wrows.length) {
    const bd = wrows.reduce((a, b) => ((Number(b.net_por_dia) || 0) > (Number(a.net_por_dia) || 0) ? b : a));
    heroHtml += heroCard('melhor dia da semana', String(bd.dia || '—'), money(bd.net_por_dia) + ' de média por dia');
  }
  let peakStart = 0, peakSum = -1;
  for (let h = 0; h <= 21; h++) {
    const s3 = hNet[h] + hNet[h + 1] + hNet[h + 2];
    if (s3 > peakSum) { peakSum = s3; peakStart = h; }
  }
  if (peakSum > 0) {
    heroHtml += heroCard('melhor horário (brt)', peakStart + 'h–' + (peakStart + 2) + 'h', money(peakSum) + ' somados na faixa');
  }
  if (bfRow && nrRow && (Number(nrRow.net_por_dia) || 0) > 0) {
    heroHtml += heroCard('efeito bandcamp friday',
      ratioBR((Number(bfRow.net_por_dia) || 0) / Number(nrRow.net_por_dia)) + ' a média diária',
      money(bfRow.net_por_dia) + '/dia vs ' + money(nrRow.net_por_dia) + '/dia');
  }
  if (yrows.length) {
    const by = yrows.reduce((a, b) => ((Number(b.net_revenue) || 0) > (Number(a.net_revenue) || 0) ? b : a));
    heroHtml += heroCard('melhor ano', String(by.ano || '—'), money(by.net_revenue) + ' · ' + fmtInt(by.sales_count) + ' vendas');
  }
  hero.innerHTML = heroHtml;
  hero.setAttribute('aria-busy', 'false');

  /* ═══ ⏱ TIMING ═══ */

  /* melhor dia da semana — barras (maior em neon) */
  const wVals = wrows.map((r) => Number(r.net_por_dia) || 0);
  const wMax = Math.max.apply(null, wVals.concat([0]));
  mkChart('chWeekday', {
    type: 'bar',
    data: {
      labels: wrows.map((r) => String(r.dia || '')),
      datasets: [{ label: 'Net por dia', data: wVals, backgroundColor: wVals.map((v) => (v === wMax && wMax > 0) ? NEON : PAL[0]), borderRadius: 3, maxBarThickness: 34 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: moneyTip, afterLabel: (ctx) => { const r = wrows[ctx.dataIndex]; return r ? fmtInt(r.sales_count) + ' vendas no total' : ''; } } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: moneyTick } }, x: { grid: { display: false } } }
    }
  });

  /* por hora (0-23, horário de Brasília) */
  mkChart('chHour', {
    type: 'bar',
    data: {
      labels: hNet.map((_, h) => h + 'h'),
      datasets: [{ label: 'Receita líquida', data: hNet, backgroundColor: PAL[1], borderRadius: 2, maxBarThickness: 18 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: moneyTip, afterLabel: (ctx) => fmtInt(hCnt[ctx.dataIndex]) + ' vendas' } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: moneyTick } }, x: { grid: { display: false }, ticks: { maxRotation: 0 } } }
    }
  });

  /* sazonalidade — mês do ano (todos os anos somados) */
  const sNet = new Array(12).fill(0), sCnt = new Array(12).fill(0);
  (season.data || []).forEach((r) => {
    const m = Number(r.mes);
    if (m >= 1 && m <= 12) { sNet[m - 1] = Number(r.net_revenue) || 0; sCnt[m - 1] = Number(r.sales_count) || 0; }
  });
  mkChart('chSeason', {
    type: 'bar',
    data: {
      labels: MESES.slice(),
      datasets: [{ label: 'Receita líquida', data: sNet, backgroundColor: PAL[2], borderRadius: 3, maxBarThickness: 26 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: moneyTip, afterLabel: (ctx) => fmtInt(sCnt[ctx.dataIndex]) + ' vendas' } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: moneyTick } }, x: { grid: { display: false } } }
    }
  });

  /* bandcamp friday vs dias normais — net por dia */
  const bcfOrder = [bfRow, nrRow].filter(Boolean);
  mkChart('chBcf', {
    type: 'bar',
    data: {
      labels: bcfOrder.map((r) => String(r.grupo || '')),
      datasets: [{
        label: 'Net por dia',
        data: bcfOrder.map((r) => Number(r.net_por_dia) || 0),
        backgroundColor: bcfOrder.map((r) => (/friday/i.test(String(r.grupo || '')) ? NEON : PAL[0])),
        borderRadius: 3, maxBarThickness: 90
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: moneyTip, afterLabel: (ctx) => { const r = bcfOrder[ctx.dataIndex]; return r ? fmtInt(r.sales_count) + ' vendas · ' + fmtInt(r.dias) + ' dias' : ''; } } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: moneyTick } }, x: { grid: { display: false } } }
    }
  });

  /* receita líquida por mês — linha (série única, cor da casa) */
  mkChart('chMonthly', {
    type: 'line',
    data: {
      labels: mrows.map((r) => fmtMonth(r.month)),
      datasets: [{
        label: 'Receita líquida',
        data: mrows.map((r) => Number(r.net_revenue) || 0),
        borderColor: NEON,
        backgroundColor: 'rgba(196,255,61,.10)',
        pointBackgroundColor: NEON,
        pointBorderColor: '#0a0908',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: moneyTip } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: moneyTick } },
        x: { grid: { display: false } }
      }
    }
  });

  /* ano a ano — barras de net + linha de novos compradores (eixo secundário) */
  mkChart('chYearly', {
    type: 'bar',
    data: {
      labels: yrows.map((r) => String(r.ano)),
      datasets: [
        { type: 'bar', label: 'Receita líquida', data: yrows.map((r) => Number(r.net_revenue) || 0), backgroundColor: PAL[0], borderRadius: 3, maxBarThickness: 34, yAxisID: 'y' },
        { type: 'line', label: 'Novos compradores', data: yrows.map((r) => Number(r.novos_compradores) || 0), borderColor: PAL[1], backgroundColor: PAL[1], pointRadius: 3, pointHoverRadius: 5, borderWidth: 2, tension: 0.3, yAxisID: 'y2' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
        tooltip: { callbacks: { label: (ctx) => ctx.dataset.yAxisID === 'y2' ? (ctx.dataset.label + ': ' + fmtInt(ctx.parsed.y)) : moneyTip(ctx) } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: moneyTick } },
        y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (v) => fmtInt(v), precision: 0 } },
        x: { grid: { display: false } }
      }
    }
  });

  /* ═══ 📀 CATÁLOGO & PREÇO ═══ */

  /* top 10 itens — barras horizontais */
  const irows = topItems.data || [];
  mkChart('chItems', {
    type: 'bar',
    data: {
      labels: irows.map((r) => {
        const n = String(r.item_name || '—');
        const a = String(r.artist_name || '');
        const full = a ? (a + ' — ' + n) : n;
        return full.length > 42 ? full.slice(0, 41) + '…' : full;
      }),
      datasets: [{ label: 'Receita líquida', data: irows.map((r) => Number(r.net_revenue) || 0), backgroundColor: PAL[4], borderRadius: 3, maxBarThickness: 22 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: moneyTip } } },
      scales: {
        x: { beginAtZero: true, ticks: { callback: moneyTick } },
        y: { grid: { display: false }, ticks: { autoSkip: false } }
      }
    }
  });

  /* momentum de lançamentos — top 12 por net 30d */
  const mmRows = momentum.data || [];
  $('#momentumBody').innerHTML = mmRows.length ? mmRows.map((r) => {
    const tot = Number(r.net_total) || 0;
    const n30 = Number(r.net_30d) || 0;
    return '<tr><td>' + esc(r.item_name || '—') +
      (r.catalogo ? ' <span class="muted">· ' + esc(r.catalogo) + '</span>' : '') + '</td>' +
      '<td>' + esc(r.artist_name || '—') + '</td>' +
      '<td class="muted">' + esc(fmtDateOnly(r.primeira_venda)) + '</td>' +
      '<td class="num">' + esc(money(r.net_7d)) + '</td>' +
      '<td class="num">' + esc(money(n30)) + '</td>' +
      '<td class="num">' + esc(money(tot)) + '</td>' +
      '<td class="num">' + esc(tot > 0 ? pctBR(n30 / tot * 100) : '—') + '</td></tr>';
  }).join('') : '<tr><td colspan="7" class="td-empty">sem lançamentos ainda</td></tr>';

  /* pontos de preço — top 10 por receita, ordenados por preço */
  const prows = (prices.data || []).slice().sort((a, b) => (Number(a.preco) || 0) - (Number(b.preco) || 0));
  mkChart('chPrices', {
    type: 'bar',
    data: {
      labels: prows.map((r) => '€/$ ' + (Number(r.preco) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
      datasets: [{ label: 'Receita líquida', data: prows.map((r) => Number(r.net_revenue) || 0), backgroundColor: PAL[3], borderRadius: 3, maxBarThickness: 30 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: moneyTip, afterLabel: (ctx) => { const r = prows[ctx.dataIndex]; return r ? fmtInt(r.sales_count) + ' vendas · ' + fmtInt(r.items_sold) + ' itens' : ''; } } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: moneyTick } }, x: { grid: { display: false }, ticks: { maxRotation: 45 } } }
    }
  });

  /* por tipo de item — rosquinha */
  const trows = (byType.data || []).filter((r) => Number(r.net_revenue) > 0);
  mkChart('chType', {
    type: 'doughnut',
    data: {
      labels: trows.map((r) => TYPE_LBL[String(r.item_type || '').toLowerCase()] || String(r.item_type || 'outro')),
      datasets: [{
        data: trows.map((r) => Number(r.net_revenue) || 0),
        backgroundColor: trows.map((_, i) => PAL[i % PAL.length]),
        borderColor: '#0a0908',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
        tooltip: { callbacks: { label: (ctx) => ctx.label + ': ' + money(ctx.parsed) } }
      }
    }
  });

  /* formato por ano — barras empilhadas por tipo */
  const frows = formatYearly.data || [];
  const fyYears = Array.from(new Set(frows.map((r) => String(r.ano)))).sort();
  const fyTypes = Array.from(new Set(frows.map((r) => String(r.item_type || 'outro'))));
  const fyMap = {};
  frows.forEach((r) => { fyMap[String(r.ano) + '|' + String(r.item_type || 'outro')] = Number(r.net_revenue) || 0; });
  mkChart('chFormatYear', {
    type: 'bar',
    data: {
      labels: fyYears,
      datasets: fyTypes.map((tp, i) => ({
        label: TYPE_LBL[tp.toLowerCase()] || tp,
        data: fyYears.map((y) => fyMap[y + '|' + tp] || 0),
        backgroundColor: PAL[i % PAL.length],
        maxBarThickness: 34
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
        tooltip: { callbacks: { label: moneyTip } }
      },
      scales: {
        y: { beginAtZero: true, stacked: true, ticks: { callback: moneyTick } },
        x: { stacked: true, grid: { display: false } }
      }
    }
  });

  /* artista destaque por ano (maior net do ano) */
  const ayRows = artistYearly.data || [];
  const ayBest = {};
  ayRows.forEach((r) => {
    const y = String(r.ano);
    if (!ayBest[y] || (Number(r.net_revenue) || 0) > (Number(ayBest[y].net_revenue) || 0)) ayBest[y] = r;
  });
  const ayList = Object.keys(ayBest).sort((a, b) => Number(b) - Number(a)).map((y) => ayBest[y]);
  $('#artistYearBody').innerHTML = ayList.length ? ayList.map((r) =>
    '<tr><td>' + esc(r.ano) + '</td>' +
    '<td class="artist-name">' + esc(r.artista || '—') + (r.on_roster ? ' <span class="muted">· roster</span>' : '') + '</td>' +
    '<td class="num">' + esc(fmtInt(r.sales_count)) + '</td>' +
    '<td class="num">' + esc(money(r.net_revenue)) + '</td></tr>'
  ).join('') : '<tr><td colspan="4" class="td-empty">sem dados por artista</td></tr>';

  /* ═══ 🌍 PÚBLICO & ALCANCE ═══ */

  /* por país — barras, top 12, série única */
  const crows = (country.data || []).filter((r) => r.country).slice(0, 12);
  mkChart('chCountry', {
    type: 'bar',
    data: {
      labels: crows.map((r) => String(r.country)),
      datasets: [{ label: 'Receita líquida', data: crows.map((r) => Number(r.net_revenue) || 0), backgroundColor: PAL[1], borderRadius: 3, maxBarThickness: 30 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: moneyTip } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: moneyTick } },
        x: { grid: { display: false }, ticks: { maxRotation: 60, minRotation: 0 } }
      }
    }
  });

  /* top 15 cidades — tabela */
  const ctRows = cities.data || [];
  $('#citiesBody').innerHTML = ctRows.length ? ctRows.map((r) =>
    '<tr><td>' + esc(r.cidade || '—') + '</td>' +
    '<td class="muted">' + esc(r.pais || '—') + '</td>' +
    '<td class="num">' + esc(fmtInt(r.sales_count)) + '</td>' +
    '<td class="num">' + esc(money(r.net_revenue)) + '</td></tr>'
  ).join('') : '<tr><td colspan="4" class="td-empty">sem dados de cidade</td></tr>';

  /* de onde vêm as vendas — referrers, top 12 por vendas + % do total */
  const rrAll = (referrers.data || []).filter((r) => r.origem);
  const rrTotal = rrAll.reduce((s, r) => s + (Number(r.sales_count) || 0), 0);
  const rrows = rrAll.slice(0, 12);
  mkChart('chReferrers', {
    type: 'bar',
    data: {
      labels: rrows.map((r) => { const o = String(r.origem); return o.length > 36 ? o.slice(0, 35) + '…' : o; }),
      datasets: [{ label: 'Vendas', data: rrows.map((r) => Number(r.sales_count) || 0), backgroundColor: PAL[4], borderRadius: 3, maxBarThickness: 22 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: (ctx) => fmtInt(ctx.parsed.x) + ' vendas' + (rrTotal ? ' · ' + pctBR((Number(ctx.parsed.x) || 0) / rrTotal * 100) + ' do total' : ''),
          afterLabel: (ctx) => { const r = rrows[ctx.dataIndex]; return r ? 'net ' + money(r.net_revenue) : ''; }
        } }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: { grid: { display: false }, ticks: { autoSkip: false } }
      }
    }
  });

  /* novos vs recorrentes por mês — barras empilhadas (últimos 36 meses) */
  const bmRows = (buyersMonthly.data || []).slice(-36);
  mkChart('chBuyersMonthly', {
    type: 'bar',
    data: {
      labels: bmRows.map((r) => fmtMonth(r.month)),
      datasets: [
        { label: 'Novos', data: bmRows.map((r) => Number(r.novos) || 0), backgroundColor: PAL[0], maxBarThickness: 22 },
        { label: 'Recorrentes', data: bmRows.map((r) => Number(r.recorrentes) || 0), backgroundColor: PAL[1], maxBarThickness: 22 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
        tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + fmtInt(ctx.parsed.y) } }
      },
      scales: {
        y: { beginAtZero: true, stacked: true, ticks: { precision: 0 } },
        x: { stacked: true, grid: { display: false } }
      }
    }
  });

  /* top compradores + recorrência */
  const brows = buyers.data || [];
  /* contagens via head+count: a lista vem limitada a 15 linhas para a
     tabela — contar sobre ela subestimaria compradores e inflaria o % */
  const totalBuyers = Number(buyersTotal.count) || 0;
  const returning = Number(buyersReturning.count) || 0;
  const retPct = totalBuyers ? (returning / totalBuyers) * 100 : 0;
  $('#buyerKpis').innerHTML =
    kpiHtml('compradores', fmtInt(totalBuyers)) +
    kpiHtml('voltam a comprar', pctBR(retPct)) +
    kpiHtml('receita top 10', money(brows.slice(0, 10).reduce((s, b) => s + (Number(b.net_revenue) || 0), 0)));
  $('#buyersBody').innerHTML = brows.slice(0, 15).map((b) =>
    '<tr><td>' + esc(b.buyer || b.buyer_email || '—') +
    (b.buyer && b.buyer_email ? ' <span class="muted">· ' + esc(b.buyer_email) + '</span>' : '') + '</td>' +
    '<td class="num">' + esc(fmtInt(b.purchases)) + '</td>' +
    '<td class="num">' + esc(money(b.net_revenue)) + '</td>' +
    '<td class="num">' + esc(fmtInt(b.artists_bought)) + '</td>' +
    '<td class="muted">' + esc(fmtDateOnly(b.first_purchase)) + '</td>' +
    '<td class="muted">' + esc(fmtDateOnly(b.last_purchase)) + '</td></tr>'
  ).join('') || '<tr><td colspan="6" class="td-empty">sem compradores ainda</td></tr>';

  /* ═══ 💶 FINANCEIRO ═══ */

  /* net vs taxas por mês — barras agrupadas (slots 1 e 2 da paleta) */
  mkChart('chFees', {
    type: 'bar',
    data: {
      labels: mrows.map((r) => fmtMonth(r.month)),
      datasets: [
        { label: 'Líquido (net)', data: mrows.map((r) => Number(r.net_revenue) || 0), backgroundColor: PAL[0], borderRadius: 3, maxBarThickness: 26 },
        { label: 'Taxas (fees)', data: mrows.map((r) => Number(r.fees) || 0), backgroundColor: PAL[1], borderRadius: 3, maxBarThickness: 26 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } }, tooltip: { callbacks: { label: moneyTip } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: moneyTick } },
        x: { grid: { display: false } }
      }
    }
  });

  /* gorjetas name-your-price — cards */
  const tp = tips.data;
  if (tp) {
    const vt = Number(tp.vendas_total) || 0;
    const vg = Number(tp.vendas_com_gorjeta) || 0;
    $('#tipsKpis').innerHTML =
      kpiHtml('total em gorjetas', money(tp.total_gorjetas)) +
      kpiHtml('gorjeta média', money(tp.gorjeta_media)) +
      kpiHtml('vendas com gorjeta', fmtInt(vg) + (vt ? ' (' + pctBR((vg / vt) * 100) + ')' : '')) +
      kpiHtml('downloads grátis', fmtInt(tp.downloads_gratis));
  } else {
    $('#tipsKpis').innerHTML = kpiHtml('gorjetas', 'sem dados');
  }

  /* refunds por ano — tabela compacta */
  const rfRows = refunds.data || [];
  $('#refundsBody').innerHTML = rfRows.length ? rfRows.map((r) =>
    '<tr><td>' + esc(r.ano) + '</td>' +
    '<td class="num">' + esc(fmtInt(r.refunds)) + '</td>' +
    '<td class="num">' + esc(money(r.valor)) + '</td></tr>'
  ).join('') : '<tr><td colspan="3" class="td-empty">nenhum refund registrado</td></tr>';

  /* saques do bandcamp — acumulado + saldo estimado em conta */
  const payRows = payouts.data || [];
  const lastAcc = payRows.length ? (Number(payRows[payRows.length - 1].acumulado) || 0) : 0;
  const ovNet = overview.data ? (Number(overview.data.net_total) || 0) : 0;
  $('#payoutKpis').innerHTML =
    kpiHtml('total sacado', money(lastAcc)) +
    kpiHtml('nº de saques', fmtInt(payRows.length)) +
    kpiHtml('saldo estimado em conta', money(ovNet - lastAcc));
  mkChart('chPayouts', {
    type: 'line',
    data: {
      labels: payRows.map((r) => fmtDateOnly(r.data)),
      datasets: [{
        label: 'Acumulado sacado',
        data: payRows.map((r) => Number(r.acumulado) || 0),
        borderColor: PAL[5],
        backgroundColor: 'rgba(144,133,233,.12)',
        stepped: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: moneyTip } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: moneyTick } },
        x: { grid: { display: false }, ticks: { maxRotation: 45 } }
      }
    }
  });

  /* descontos */
  const drows = (discounts.data || []).filter((d) => d.discount_code);
  $('#discountsBody').innerHTML = drows.length
    ? drows.map((d) =>
      '<tr><td>' + esc(d.discount_code) + '</td>' +
      '<td class="num">' + esc(fmtInt(d.uses)) + '</td>' +
      '<td class="num">' + esc(money(d.net_revenue)) + '</td></tr>').join('')
    : '<tr><td colspan="3" class="td-empty">nenhum código de desconto usado</td></tr>';
}

/* ═════════════ BOOT ═════════════ */
route();
