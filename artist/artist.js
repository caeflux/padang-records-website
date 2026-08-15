/* ═══════════════════════════════════════════════════════════════
   PADANG RECORDS · PORTAL DO ARTISTA
   Vanilla JS + supabase-js@2 + Chart.js@4 (CDN)
   Fontes de dados: APENAS as RPCs padang_my_report,
   padang_my_monthly e padang_is_admin (nenhum select em tabela).
   Segurança: apenas publishable key; RLS default-deny no banco;
   toda string dinâmica passa por esc()/textContent antes do DOM.
   i18n: PT/EN via dicionário I18N + [data-i18n]; escolha persiste
   em localStorage ('padang_artist_lang'); default = EN, exceto
   navegador em pt-*.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ───────────── Config ───────────── */
const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';

/* ───────────── Helpers ───────────── */
const $ = (s) => document.querySelector(s);

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ═════════════ I18N ═════════════ */
const I18N = {
  pt: {
    title: 'Padang Records · Portal do Artista',
    loading: 'Carregando',
    /* login */
    auth_sub: '// portal do artista',
    auth_hint: 'Use o e-mail cadastrado junto à label. Se ainda não tem conta, crie uma com esse mesmo e-mail.',
    auth_email_lbl: 'E-mail',
    auth_email_ph: 'voce@exemplo.com',
    auth_pass_lbl: 'Senha',
    btn_login: 'Entrar',
    btn_signup: 'Criar conta',
    auth_back: '← voltar ao site',
    /* não vinculado */
    ul_msg: 'Sua conta ainda não está vinculada a um artista do roster.',
    ul_contact_pre: 'Fale com a label (',
    ul_contact_post: ') para vincular o e-mail ',
    admin_hint_pre: 'você é admin — ',
    admin_hint_link: 'ir para /admin/',
    btn_logout: 'Sair',
    /* erro */
    err_title: 'Não foi possível carregar seus dados.',
    btn_retry: 'Tentar de novo',
    err_unknown: 'Erro desconhecido.',
    cdn_err: 'Não foi possível carregar as bibliotecas necessárias. Verifique sua conexão e tente de novo.',
    /* painel */
    tb_role: '· artista',
    hello_sub: '// seu relatório de vendas na padang records',
    hello: 'olá, ',
    artist_fallback: 'artista',
    badge_roster: 'roster',
    badge_off: 'fora do roster',
    card_net_lbl: 'receita líquida (net)',
    card_net_sub: 'vendas bandcamp após taxas',
    card_share_lbl: 'seu valor',
    share_suffix: ' da receita líquida',
    card_paid_lbl: 'já pago',
    card_paid_sub: 'repasses já feitos pela label',
    card_due_lbl: 'saldo a receber',
    card_due_sub: 'seu valor − já pago',
    meta_sales: 'vendas',
    meta_items: 'itens vendidos',
    meta_first: 'primeira venda',
    meta_last: 'última venda',
    /* gráfico */
    chart_title: '// evolução mensal · receita líquida',
    chart_empty: 'sem dados mensais ainda',
    chart_series: 'Receita líquida',
    tt_sales: 'vendas: ',
    tt_items: ' · itens: ',
    chart_load_err: 'Erro ao carregar a evolução mensal: ',
    chart_build_err: 'Erro ao montar o gráfico: ',
    chart_lib_err: 'A biblioteca do gráfico não carregou. Recarregue a página.',
    /* auth erros */
    auth_invalid: 'E-mail ou senha incorretos.',
    auth_unconfirmed: 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
    auth_exists: 'Este e-mail já tem conta. Use "Entrar".',
    auth_rate: 'Muitas tentativas. Aguarde um instante e tente de novo.',
    auth_fail: 'Falha na autenticação: ',
    signup_missing: 'Informe e-mail e uma senha com pelo menos 6 caracteres.',
    signup_ok: 'Conta criada. Verifique seu e-mail para confirmar antes de entrar.',
    /* rodapé */
    footnote: 'valores baseados nos relatórios brutos do bandcamp importados pela label · 60% do net é repassado a artistas do roster',
    footer: '© padang records · portal do artista · dados confidenciais',
    lang_switch: 'Switch to English'
  },
  en: {
    title: 'Padang Records · Artist Portal',
    loading: 'Loading',
    /* login */
    auth_sub: '// artist portal',
    auth_hint: 'Use the email registered with the label. If you don\'t have an account yet, create one with that same email.',
    auth_email_lbl: 'Email',
    auth_email_ph: 'you@example.com',
    auth_pass_lbl: 'Password',
    btn_login: 'Sign in',
    btn_signup: 'Create account',
    auth_back: '← back to site',
    /* unlinked */
    ul_msg: 'Your account isn\'t linked to a roster artist yet.',
    ul_contact_pre: 'Contact the label (',
    ul_contact_post: ') to link the email ',
    admin_hint_pre: 'you\'re an admin — ',
    admin_hint_link: 'go to /admin/',
    btn_logout: 'Sign out',
    /* error */
    err_title: 'We couldn\'t load your data.',
    btn_retry: 'Try again',
    err_unknown: 'Unknown error.',
    cdn_err: 'The required libraries failed to load. Check your connection and try again.',
    /* panel */
    tb_role: '· artist',
    hello_sub: '// your sales report at padang records',
    hello: 'hello, ',
    artist_fallback: 'artist',
    badge_roster: 'roster',
    badge_off: 'off roster',
    card_net_lbl: 'net revenue',
    card_net_sub: 'bandcamp sales after fees',
    card_share_lbl: 'your share',
    share_suffix: ' of net revenue',
    card_paid_lbl: 'paid out',
    card_paid_sub: 'payouts already made by the label',
    card_due_lbl: 'balance due',
    card_due_sub: 'your share − paid out',
    meta_sales: 'sales',
    meta_items: 'items sold',
    meta_first: 'first sale',
    meta_last: 'last sale',
    /* chart */
    chart_title: '// monthly evolution · net revenue',
    chart_empty: 'no monthly data yet',
    chart_series: 'Net revenue',
    tt_sales: 'sales: ',
    tt_items: ' · items: ',
    chart_load_err: 'Couldn\'t load the monthly breakdown: ',
    chart_build_err: 'Couldn\'t render the chart: ',
    chart_lib_err: 'The chart library failed to load. Please reload the page.',
    /* auth errors */
    auth_invalid: 'Incorrect email or password.',
    auth_unconfirmed: 'Email not confirmed yet. Check your inbox.',
    auth_exists: 'This email already has an account. Use "Sign in".',
    auth_rate: 'Too many attempts. Wait a moment and try again.',
    auth_fail: 'Authentication failed: ',
    signup_missing: 'Enter an email and a password with at least 6 characters.',
    signup_ok: 'Account created. Check your inbox to confirm your email before signing in.',
    /* footer */
    footnote: 'figures based on the raw bandcamp reports imported by the label · 60% of net is paid out to roster artists',
    footer: '© padang records · artist portal · confidential data',
    lang_switch: 'Mudar para português'
  }
};

const LANG_KEY = 'padang_artist_lang';
function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch (e) { /* localStorage indisponível */ }
  const nav = String((navigator.language || (navigator.languages && navigator.languages[0]) || '')).toLowerCase();
  return nav.indexOf('pt') === 0 ? 'pt' : 'en';
}
let LANG = detectLang();
function t(k) { return (I18N[LANG] && I18N[LANG][k]) || I18N.pt[k] || k; }
function loc() { return LANG === 'pt' ? 'pt-BR' : 'en-US'; }

/* Caches pra re-render ao trocar idioma (sem refetch de RPC). */
let lastReport = null;       // { row, session, isAdmin }
let lastMonthlyRows = null;  // rows do padang_my_monthly
let lastAuthFeedback = null; // () => [err, info] — re-renderizado ao trocar idioma
let lastChartErr = null;     // () => string — idem, pro erro do gráfico

function applyLang() {
  document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  const em = $('#authEmail');
  if (em) em.placeholder = t('auth_email_ph');
  const sp = document.querySelector('.boot-spinner');
  if (sp) sp.setAttribute('aria-label', t('loading'));
  document.querySelectorAll('.lang-toggle').forEach((bt) => {
    const p = bt.querySelector('.lt-pt'), e = bt.querySelector('.lt-en');
    if (p) p.classList.toggle('lt-on', LANG === 'pt');
    if (e) e.classList.toggle('lt-on', LANG === 'en');
    bt.setAttribute('aria-label', t('lang_switch'));
    bt.title = t('lang_switch');
  });
  // Mensagens dinâmicas montadas com t(): re-renderiza no idioma novo.
  if (lastAuthFeedback) authFeedback(lastAuthFeedback);
  if (lastChartErr) $('#chError').textContent = lastChartErr();
}

function setLang(l) {
  if (l === LANG || (l !== 'pt' && l !== 'en')) return;
  LANG = l;
  try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ok sem persistência */ }
  applyLang();
  if (lastReport) renderPanel(lastReport.row, lastReport.session, lastReport.isAdmin);
  if (lastMonthlyRows && lastMonthlyRows.length) buildChart(lastMonthlyRows);
}

document.querySelectorAll('.lang-toggle').forEach((bt) => {
  bt.addEventListener('click', () => setLang(LANG === 'pt' ? 'en' : 'pt'));
});
applyLang();

/* CDN indisponível: sem isso a página ficaria no spinner pra sempre. */
if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  document.getElementById('bootView').hidden = true;
  document.getElementById('errDetail').textContent = t('cdn_err');
  document.getElementById('btnErrorLogout').hidden = true;
  document.getElementById('btnRetry').addEventListener('click', () => location.reload());
  document.getElementById('errorView').hidden = false;
  throw new Error('supabase-js não carregou (CDN indisponível)');
}
const sb = window.supabase.createClient(SB_URL, SB_KEY);

/* ───────────── Formatadores (locale segue o idioma) ───────────── */
function fmtInt(v) { return new Intl.NumberFormat(loc()).format(Math.round(Number(v) || 0)); }

/* Os agregados do banco somam vendas Bandcamp da label (USD). */
const CUR = 'USD';
function money(v) {
  const n = Number(v) || 0;
  try {
    return new Intl.NumberFormat(loc(), { style: 'currency', currency: CUR, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch (e) {
    return CUR + ' ' + n.toLocaleString(loc(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
function moneyShort(v) {
  const n = Number(v) || 0;
  try {
    return new Intl.NumberFormat(loc(), { style: 'currency', currency: CUR, notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch (e) { return String(Math.round(n)); }
}

function fmtDateOnly(s) {
  if (!s) return '—';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(s);
  if (isNaN(d)) return '—';
  try {
    const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
    if (m) opts.timeZone = 'UTC';
    return new Intl.DateTimeFormat(loc(), opts).format(d);
  } catch (e) {
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : '—';
  }
}
const MESES = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
};
function fmtMonth(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})/);
  if (!m) return String(s || '');
  return MESES[LANG][parseInt(m[2], 10) - 1] + '/' + m[1].slice(2);
}
function fmtPct(frac) {
  const pct = Math.round((Number(frac) || 0) * 10000) / 100;
  return pct.toLocaleString(loc(), { maximumFractionDigits: 2 }) + '%';
}
function errMsg(error) {
  if (!error) return t('err_unknown');
  return String(error.message || error.error_description || error).slice(0, 300);
}

/* ═════════════ TELAS ═════════════ */
const authView = $('#authView'), unlinkedView = $('#unlinkedView'),
  errorView = $('#errorView'), bootView = $('#bootView'), appView = $('#appView');

function showOnly(el) {
  [authView, unlinkedView, errorView, bootView, appView].forEach((v) => { v.hidden = (v !== el); });
}

/* ═════════════ AUTENTICAÇÃO ═════════════ */
let routing = false;
async function route() {
  if (routing) return;
  routing = true;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { showOnly(authView); return; }
    showOnly(bootView);
    const [rep, adm] = await Promise.all([
      sb.rpc('padang_my_report'),
      sb.rpc('padang_is_admin')
    ]);
    const isAdmin = !adm.error && adm.data === true;
    if (rep.error) {
      $('#errDetail').textContent = errMsg(rep.error);
      showOnly(errorView);
      return;
    }
    const row = Array.isArray(rep.data) ? rep.data[0] : rep.data;
    if (!row) {
      $('#ulEmail').textContent = (session.user && session.user.email) ? session.user.email : '';
      $('#ulAdminHint').hidden = !isAdmin;
      showOnly(unlinkedView);
      return;
    }
    renderPanel(row, session, isAdmin);
    showOnly(appView);
    loadMonthly().catch((e2) => {
      const che = $('#chError');
      $('.chart-box').style.display = 'none';
      lastChartErr = () => t('chart_build_err') + errMsg(e2);
      che.textContent = lastChartErr();
      che.hidden = false;
    });
  } catch (e) {
    $('#errDetail').textContent = errMsg(e);
    showOnly(errorView);
  } finally { routing = false; }
}

sb.auth.onAuthStateChange((event) => {
  // Refresh de token / update de user não mudam de tela: re-rotear aqui
  // causaria flash do spinner e refetch desnecessário a cada ~1h.
  if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
  if (event === 'SIGNED_OUT') {
    if (monthlyChart) { monthlyChart.destroy(); monthlyChart = null; }
    lastReport = null;
    lastMonthlyRows = null;
    lastChartErr = null;
  }
  // setTimeout evita deadlock do supabase-js ao chamar a API dentro do callback
  setTimeout(route, 0);
});

$('#authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  authFeedback(null);
  const email = $('#authEmail').value.trim();
  const password = $('#authPass').value;
  $('#btnLogin').disabled = true; $('#btnSignup').disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  $('#btnLogin').disabled = false; $('#btnSignup').disabled = false;
  if (error) authFeedback(() => [translateAuthErr(error), null]);
});

$('#btnSignup').addEventListener('click', async () => {
  authFeedback(null);
  const email = $('#authEmail').value.trim();
  const password = $('#authPass').value;
  if (!email || password.length < 6) {
    authFeedback(() => [t('signup_missing'), null]);
    return;
  }
  $('#btnSignup').disabled = true; $('#btnLogin').disabled = true;
  const { data, error } = await sb.auth.signUp({ email, password });
  $('#btnSignup').disabled = false; $('#btnLogin').disabled = false;
  if (error) { authFeedback(() => [translateAuthErr(error), null]); return; }
  if (data && data.user && !data.session) {
    authFeedback(() => [null, t('signup_ok')]);
  }
});

function translateAuthErr(error) {
  const m = String((error && error.message) || '');
  if (/invalid login credentials/i.test(m)) return t('auth_invalid');
  if (/email not confirmed/i.test(m)) return t('auth_unconfirmed');
  if (/already registered/i.test(m)) return t('auth_exists');
  if (/rate limit/i.test(m)) return t('auth_rate');
  return t('auth_fail') + errMsg(error);
}
/* Recebe um thunk () => [err, info] (ou null pra limpar) pra poder
   re-renderizar a mensagem no idioma certo quando o user troca PT/EN. */
function authFeedback(make) {
  lastAuthFeedback = make;
  const r = make ? make() : [null, null];
  const e = $('#authError'), i = $('#authInfo');
  e.hidden = !r[0]; if (r[0]) e.textContent = r[0];
  i.hidden = !r[1]; if (r[1]) i.textContent = r[1];
}

$('#btnLogout').addEventListener('click', () => sb.auth.signOut());
$('#btnUnlinkedLogout').addEventListener('click', () => sb.auth.signOut());
$('#btnErrorLogout').addEventListener('click', () => sb.auth.signOut());
$('#btnRetry').addEventListener('click', () => { showOnly(bootView); route(); });

/* ═════════════ PAINEL ═════════════ */
function renderPanel(r, session, isAdmin) {
  lastReport = { row: r, session: session, isAdmin: isAdmin };

  $('#tbEmail').textContent = (session.user && session.user.email) ? session.user.email : '';
  $('#appAdminHint').hidden = !isAdmin;

  $('#helloName').textContent = t('hello') + String(r.stage_name || t('artist_fallback'));

  const badge = $('#rosterBadge');
  badge.textContent = r.on_roster ? t('badge_roster') : t('badge_off');
  badge.className = 'badge ' + (r.on_roster ? 'roster' : 'off');

  $('#cNet').textContent = money(r.net_revenue);
  $('#cShare').textContent = money(r.artist_share);
  $('#cSharePct').textContent = fmtPct(r.revenue_share) + t('share_suffix');
  $('#cPaid').textContent = money(r.total_paid);
  $('#cDue').textContent = money(r.balance_due);

  $('#mSales').textContent = fmtInt(r.sales_count);
  $('#mItems').textContent = fmtInt(r.items_sold);
  $('#mFirst').textContent = fmtDateOnly(r.first_sale);
  $('#mLast').textContent = fmtDateOnly(r.last_sale);
}

/* ═════════════ GRÁFICO MENSAL ═════════════ */
const NEON = '#c4ff3d';
let monthlyChart = null;

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

function buildChart(rows) {
  if (typeof Chart === 'undefined') return;
  chartDefaults();
  if (monthlyChart) { monthlyChart.destroy(); monthlyChart = null; }
  monthlyChart = new Chart($('#chMonthly'), {
    type: 'line',
    data: {
      labels: rows.map((r) => fmtMonth(r.month)),
      datasets: [{
        label: t('chart_series'),
        data: rows.map((r) => Number(r.net_revenue) || 0),
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
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => t('chart_series') + ': ' + money(ctx.parsed.y),
            afterLabel: (ctx) => {
              const r = rows[ctx.dataIndex];
              return r ? (t('tt_sales') + fmtInt(r.sales_count) + t('tt_items') + fmtInt(r.items_sold)) : '';
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => moneyShort(v) } },
        x: { grid: { display: false } }
      }
    }
  });
}

async function loadMonthly() {
  const err = $('#chError'), empty = $('#chEmpty'), box = $('.chart-box');
  err.hidden = true; empty.hidden = true; box.style.display = '';
  lastChartErr = null;
  const { data, error } = await sb.rpc('padang_my_monthly');
  if (error) {
    box.style.display = 'none';
    lastChartErr = () => t('chart_load_err') + errMsg(error);
    err.textContent = lastChartErr();
    err.hidden = false;
    return;
  }
  const rows = (data || []).filter((r) => r && r.month);
  if (!rows.length) {
    box.style.display = 'none';
    empty.hidden = false;
    return;
  }
  if (typeof Chart === 'undefined') {
    box.style.display = 'none';
    lastChartErr = () => t('chart_lib_err');
    err.textContent = lastChartErr();
    err.hidden = false;
    return;
  }
  lastMonthlyRows = rows;
  buildChart(rows);
}

/* ═════════════ BOOT ═════════════ */
route();
