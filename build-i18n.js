#!/usr/bin/env node
/* PADANG · build-i18n.js — gera o site estático por idioma
 *
 *   node build-i18n.js        ← RODAR ANTES DE TODO PUSH (depois de qualquer edição
 *                               em HTML, i18n*.js ou data/*.json)
 *
 * O que faz (Node puro, sem dependências):
 *   1. Carrega os dicionários de i18n.js, i18n-extra.js, i18n-lab.js e i18n-bios.js
 *      numa sandbox (vm), exatamente como o navegador os monta.
 *   2. Para cada uma das 8 páginas × 6 idiomas aplica as traduções nos elementos
 *      [data-i18n] (mesma regra do apply() do navegador: valor com tag → innerHTML,
 *      senão texto), grava <html lang="xx" data-static-lang> e o bloco de SEO do
 *      <head> (title, description, canonical, hreflang ×6 + x-default, og:*).
 *        PT (idioma-fonte) → raiz, no próprio arquivo:  /releases.html
 *        demais            → /en/ /es/ /de/ /fr/ /ja/:  /de/releases.html
 *      Nas subpastas, caminhos de assets (./img, ./i18n*.js, ./track.js, ./send-*.php,
 *      ./data) viram absolutos; links entre páginas continuam relativos (ficam no idioma).
 *   3. Gera sitemap.xml (todas as URLs × 6 idiomas, com alternates hreflang) e robots.txt.
 *   4. Valida a sintaxe de todo <script> inline gerado; qualquer erro aborta o build.
 *
 * Idempotente: a raiz é ao mesmo tempo fonte e saída PT; rodar de novo dá o mesmo resultado.
 * O bloco entre <!-- seo:start --> e <!-- seo:end --> é gerado — não editar à mão.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const BASE = 'https://padangrecords.net';
const LANGS = ['pt', 'en', 'es', 'de', 'fr', 'ja'];
const SOURCE_LANG = 'pt';
const X_DEFAULT = 'en';
const PAGES = ['index.html', 'releases.html', 'roster.html', 'lab.html', 'events.html', 'about.html', 'demo.html', 'shop.html'];
const OG_LOCALE = { pt: 'pt_BR', en: 'en_US', es: 'es_ES', de: 'de_DE', fr: 'fr_FR', ja: 'ja_JP' };
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
function write(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (prev !== content) fs.writeFileSync(abs, content);
  return prev !== content;
}
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => escText(s).replace(/"/g, '&quot;');

// ── 1. dicionário ────────────────────────────────────────────────
function loadDict() {
  const noop = () => {};
  const html = { lang: 'pt', getAttribute: () => 'pt', hasAttribute: () => false, setAttribute: noop };
  const ctx = {
    document: { readyState: 'complete', documentElement: html, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null, addEventListener: noop },
    localStorage: { getItem: () => null, setItem: noop },
    navigator: { language: 'pt', languages: ['pt'] },
    location: { pathname: '/', search: '', hash: '', protocol: 'file:' },
    setTimeout: noop, clearTimeout: noop, console,
    MutationObserver: function () { this.observe = noop; },
    CustomEvent: function () {}
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['i18n.js', 'i18n-extra.js', 'i18n-lab.js', 'i18n-bios.js']) {
    vm.runInContext(read(f), ctx, { filename: f });
  }
  return ctx.window.PADANG_I18N.dict;
}

function t(dict, key, lang) {
  const e = dict[key];
  if (!e) return null;
  return e[lang] || e[X_DEFAULT] || null;
}

// ── 2. HTML ──────────────────────────────────────────────────────
// trechos onde data-i18n NÃO deve ser tocado: <script>, <style>, comentários
function maskedRanges(html) {
  const out = [];
  const re = /<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->/gi;
  let m;
  while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]);
  return out;
}
const inRanges = (i, ranges) => ranges.some(([a, b]) => i >= a && i < b);

// índice do fechamento que casa com a tag aberta em `from` (logo após o '>')
function findClose(html, tag, from) {
  const re = /<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (!m[2] || m[2].toLowerCase() !== tag) continue;
    if (m[1]) { if (--depth === 0) return m.index; }
    else if (!m[3]) depth++;
  }
  return -1;
}

function applyTranslations(html, dict, lang, stats) {
  const ranges = maskedRanges(html);
  const re = /<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = '', pos = 0, m;
  while ((m = re.exec(html))) {
    if (m.index < pos || inRanges(m.index, ranges)) continue;
    const tag = m[1].toLowerCase();
    if (VOID.has(tag)) continue;
    const val = t(dict, m[2], lang);
    const openEnd = m.index + m[0].length;
    const close = findClose(html, tag, openEnd);
    if (close < 0) throw new Error(`fechamento não encontrado para <${tag} data-i18n="${m[2]}">`);
    if (val == null) { stats.missing.add(m[2]); continue; }
    out += html.slice(pos, openEnd) + (/<[a-zA-Z]/.test(val) ? val : escText(val));
    pos = close;
    re.lastIndex = close;
    stats.applied++;
  }
  return out + html.slice(pos);
}

function urlOf(page, lang) {
  const file = page === 'index.html' ? '' : page;
  return BASE + (lang === SOURCE_LANG ? '/' : `/${lang}/`) + file;
}

const SEO_BLOCK = /[ \t]*<!-- seo:start[\s\S]*?seo:end -->\n?/;
const SEO_TAGS = [
  /[ \t]*<title>[\s\S]*?<\/title>[ \t]*\n?/gi,
  /[ \t]*<meta\s+name="description"[^>]*>[ \t]*\n?/gi,
  /[ \t]*<meta\s+property="og:(title|description|url|locale(:alternate)?)"[^>]*>[ \t]*\n?/gi,
  /[ \t]*<link\s+rel="canonical"[^>]*>[ \t]*\n?/gi,
  /[ \t]*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>[ \t]*\n?/gi
];

// head: bloco de SEO gerado. extraHead = tags adicionais (ex.: JSON-LD das páginas de release)
function seoHead(head, { title, desc, urls, lang, extraHead }) {
  head = head.replace(SEO_BLOCK, '');
  for (const re of SEO_TAGS) head = head.replace(re, '');
  const lines = [
    '<!-- seo:start · gerado por build-i18n.js — não editar à mão -->',
    `<title>${escText(title)}</title>`,
    `<meta name="description" content="${escAttr(desc)}" />`,
    `<link rel="canonical" href="${urls[lang]}" />`,
    ...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${urls[l]}" />`),
    `<link rel="alternate" hreflang="x-default" href="${urls[X_DEFAULT]}" />`,
    `<meta property="og:title" content="${escAttr(title)}" />`,
    `<meta property="og:description" content="${escAttr(desc)}" />`,
    `<meta property="og:url" content="${urls[lang]}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}" />`,
    ...LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    ...(extraHead || []),
    '<!-- seo:end -->'
  ];
  const block = lines.join('\n') + '\n';
  const anchor = head.match(/<meta\s+name="viewport"[^>]*>[ \t]*\n?/i) || head.match(/<meta\s+charset[^>]*>[ \t]*\n?/i) || head.match(/<head[^>]*>[ \t]*\n?/i);
  const at = anchor.index + anchor[0].length;
  return head.slice(0, at) + (anchor[0].endsWith('\n') ? '' : '\n') + block + head.slice(at);
}

function setHtmlLang(html, lang) {
  return html.replace(/<html\b([^>]*)>/i, (all, attrs) => {
    attrs = attrs.replace(/\s+lang="[^"]*"/i, '').replace(/\s+data-static-lang(="[^"]*")?/i, '');
    return `<html lang="${lang}" data-static-lang${attrs}>`;
  });
}

// nas subpastas de idioma, assets apontam para a raiz (./img, ./data e todo .js/.css/.php da raiz);
// links para páginas (./x.html, ./release/…) continuam relativos e ficam no idioma
const ASSET = /(["'(])\.\/(img\/|data\/|[\w-]+\.(?:js|css|php)\b)/g;
function absolutizeAssets(html) {
  return html.replace(ASSET, '$1/$2');
}

// roster.html: mapa album_id → slug para o modal linkar as páginas de release
function syncRelSlugs(html, releases) {
  const map = Object.fromEntries(releases.map(r => [r.album_id, r.slug]));
  const block = `<!-- relslug:start --><script>window.RELSLUG=${JSON.stringify(map)};</script><!-- relslug:end -->`;
  return html.replace(/<!-- relslug:start -->[\s\S]*?<!-- relslug:end -->/, block);
}

// contadores de catálogo que o build mantém em dia a partir do releases.json
function syncCounts(html, n) {
  return html.replace(/(<b class="pc-n">)\d+(<\/b>)/g, `$1${n}$2`)
             .replace(/(<span class="rel-count">)\d+(<\/span>)/g, `$1${n}$2`);
}

function renderPage(template, page, lang, dict, stats, byAlbum, bySlug) {
  template = template.replace(/href="\.\/index\.html(#[^"]*)?"/g, (m, h) => `href="./${h || ''}"`);
  const key = page.replace(/\.html$/, '');
  const urls = Object.fromEntries(LANGS.map(l => [l, urlOf(page, l)]));
  if (page === 'releases.html' || page === 'index.html') template = tagTypes(linkCards(template, byAlbum), bySlug);
  template = syncCounts(template, Object.keys(byAlbum).length);
  if (page === 'roster.html') template = syncRelSlugs(template, Object.values(byAlbum));
  let html = applyTranslations(template, dict, lang, stats);
  html = setHtmlLang(html, lang);
  const headEnd = html.search(/<\/head>/i);
  const title = t(dict, `seo_title_${key}`, lang);
  const desc = t(dict, `seo_desc_${key}`, lang);
  if (!title || !desc) throw new Error(`faltam seo_title_${key}/seo_desc_${key} no i18n.js`);
  const extraHead = page === 'index.html' ? [orgJsonLd(lang, dict)]
                  : page === 'events.html' ? [eventsJsonLd(html, lang, urls[lang])].filter(Boolean)
                  : [];
  html = seoHead(html.slice(0, headEnd), { title, desc, urls, lang, extraHead }) + html.slice(headEnd);
  if (lang !== SOURCE_LANG) html = absolutizeAssets(html);
  return html;
}

// ── 2b. cards de release (releases.html / index.html) ───────────
// O nome do artista no rodapé do card vira link para /release/<slug>/ e o card
// ganha data-release (usado pelo track.js). Idempotente: card já linkado não casa.
function linkCards(html, byAlbum) {
  return html.replace(/<div class="r( [^"]*)?">(<div class="cap">[^\n]*?album=(\d+)\/[^\n]*?<div class="ft">)<span>([^<]*)<\/span>/g,
    (all, cls, mid, id, artist) => {
      const r = byAlbum[id];
      if (!r) return all;
      return `<div class="r${cls || ''}" data-release="${r.slug}">${mid}<a class="rp" href="./release/${r.slug}/">${artist}</a>`;
    });
}
// data-type="EP|LP|VA" nos cards (o filtro do catálogo usa; o card ★ LATEST não tem o tipo no .cat)
function tagTypes(html, bySlug) {
  return html.replace(/<div class="r( [^"]*)?" data-release="([^"]+)"( data-type="[^"]*")?>/g, (all, cls, slug, had) => {
    const r = bySlug[slug];
    return r ? `<div class="r${cls || ''}" data-release="${slug}" data-type="${r.type}">` : all;
  });
}

// ── 2c. páginas de release: /release/<slug>/ (+ /xx/release/<slug>/) ──
const RELEASE_TYPE = {
  EP: { pt: 'EP', en: 'EP', es: 'EP', de: 'EP', fr: 'EP', ja: 'EP' },
  LP: { pt: 'álbum', en: 'album', es: 'álbum', de: 'Album', fr: 'album', ja: 'アルバム' },
  VA: { pt: 'coletânea', en: 'compilation', es: 'recopilatorio', de: 'Compilation', fr: 'compilation', ja: 'コンピレーション' }
};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// texto indexável: "ARTISTA — TÍTULO. Dark progressive EP on Padang Records, released DD Mon YYYY. N tracks."
// (nomes de gênero ficam em inglês em todos os idiomas)
const SENTENCE = {
  pt: (a, t, ty, d, n, va) => `${a} — ${t}. ${cap(ty)} de dark progressive pela Padang Records, ${va ? 'lançada' : 'lançado'} em ${d}. ${n} ${n === 1 ? 'faixa' : 'faixas'}.`,
  en: (a, t, ty, d, n) => `${a} — ${t}. Dark progressive ${ty} on Padang Records, released ${d}. ${n} ${n === 1 ? 'track' : 'tracks'}.`,
  es: (a, t, ty, d, n) => `${a} — ${t}. ${cap(ty)} de dark progressive en Padang Records, publicado el ${d}. ${n} ${n === 1 ? 'tema' : 'temas'}.`,
  de: (a, t, ty, d, n) => `${a} — ${t}. Dark progressive ${ty} auf Padang Records, veröffentlicht am ${d}. ${n} ${n === 1 ? 'Track' : 'Tracks'}.`,
  fr: (a, t, ty, d, n, va) => `${a} — ${t}. ${cap(ty)} dark progressive sur Padang Records, ${va ? 'sortie' : 'sorti'} le ${d}. ${n} ${n === 1 ? 'titre' : 'titres'}.`,
  ja: (a, t, ty, d, n) => `${a} — ${t}。Padang Records からの dark progressive ${ty}、${d}リリース。全${n}曲。`
};
const LISTEN_BUY = {
  pt: bp => `Ouça e compre no Bandcamp${bp ? ' e no Beatport' : ''}.`,
  en: bp => `Listen and buy on Bandcamp${bp ? ' and Beatport' : ''}.`,
  es: bp => `Escucha y compra en Bandcamp${bp ? ' y Beatport' : ''}.`,
  de: bp => `Anhören und kaufen auf Bandcamp${bp ? ' und Beatport' : ''}.`,
  fr: bp => `Écoutez et achetez sur Bandcamp${bp ? ' et Beatport' : ''}.`,
  ja: bp => `Bandcamp${bp ? ' と Beatport' : ''} で試聴・購入。`
};
const DATE_LOCALE = { pt: 'pt-BR', es: 'es-ES', de: 'de-DE', fr: 'fr-FR', ja: 'ja-JP' };

function fmtDate(r, lang) {
  if (lang === 'en') return r.released_label; // "02 Sep 2026"
  const d = new Date(r.released + 'T00:00:00Z');
  const opt = lang === 'ja' ? { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
                            : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], opt).format(d);
}
const fmtDur = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const isoDur = s => `PT${Math.floor(s / 60)}M${s % 60}S`;
const artistSlug = n => n.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fold = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function rosterIndex() {
  const names = [...read('roster.html').matchAll(/^\{n:"([^"]+)"/gm)].map(m => m[1]);
  return new Map(names.map(n => [fold(n), n]));
}
// artistas do release que estão no roster (nome inteiro primeiro; senão cada parte de "A & B")
function rosterArtists(artist, roster) {
  if (!artist) return [];
  if (roster.has(fold(artist))) return [roster.get(fold(artist))];
  return artist.split(/\s+(?:&|x|vs\.?|and|feat\.?)\s+|,\s*/i).map(p => roster.get(fold(p))).filter(Boolean);
}

// peças do layout, extraídas do releases.html (a página de release herda a identidade dele)
function releaseLayout() {
  const src = read('releases.html');
  const head = src.slice(src.search(/<head>/i) + 6, src.search(/<\/head>/i));
  const style = head.match(/<style>([\s\S]*?)<\/style>/)[1];
  const nav = src.match(/<nav>[\s\S]*?<\/nav>/)[0].replace(/href="\.\/index\.html(#[^"]*)?"/g, (m, h) => `href="./${h || ''}"`);
  const footer = src.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const scripts = [...src.matchAll(/<script>[\s\S]*?<\/script>/g)].map(m => m[0])
    .filter(s => /padang\.bandcamp\.com → abre popup|MOBILE NAV — hamburger toggle/.test(s));
  if (scripts.length !== 2) throw new Error('releases.html: scripts do popup/menu mobile não encontrados');
  const headBase = head
    .replace(/<style>[\s\S]*?<\/style>\n?/, '<link rel="stylesheet" href="/release/release.css" />\n')
    .replace(/<link rel="stylesheet" href="\.\/blocks\.css" \/>\n?/, '')
    .replace(/(<\/?head>)?\s*$/, '\n<link rel="stylesheet" href="/blocks.css" />\n<script src="/newsletter.js" defer></script>\n');
  // blocos de conversão: mesma marcação da home (fonte única), sem a animação .rv
  const home = read('index.html');
  const block = id => {
    const m = home.match(new RegExp(`<section id="${id}" class="[^"]*"[^>]*>`));
    if (!m) throw new Error(`index.html: <section id="${id}"> não encontrada`);
    const end = findClose(home, 'section', m.index + m[0].length);
    return home.slice(m.index, end + '</section>'.length).replace(/ rv"/, '"');
  };
  return { style, headBase, nav, footer, scripts, blocks: block('pc') + '\n\n' + block('nl') };
}

const RELEASE_CSS = `
/* ── página de release (gerado por build-i18n.js — não editar) ── */
.rel{max-width:1200px;margin:0 auto;padding:120px 32px 60px}
.rel .crumb{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:28px}
.rel .crumb a:hover{color:var(--neon-1)}
.rel-hero{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:48px;align-items:start}
.rel-cover{border:1px solid rgba(255,255,255,.08);background:var(--bg-2)}
.rel-cover img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover}
.rel-cat{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--neon-1);border:1px solid rgba(196,255,61,.4);padding:5px 10px}
.rel-info h1{margin:18px 0 10px;font-family:'Major Mono Display',monospace;font-weight:400;font-size:clamp(34px,5vw,64px);line-height:.95;letter-spacing:-.02em;text-transform:lowercase}
.rel-artist{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-dim)}
.rel-artist a{color:var(--ink)}.rel-artist a:hover{color:var(--neon-1)}
.rel-lead{margin:26px 0;font-size:17px;line-height:1.6;color:var(--ink)}
.rel-meta{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;gap:8px 36px;margin:0 0 30px;font-family:'JetBrains Mono',monospace}
.rel-meta dt{font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--ink-dim)}
.rel-meta dd{margin-top:4px;font-size:13px;letter-spacing:.08em;color:var(--ink)}
.rel-buy{display:flex;flex-wrap:wrap;gap:12px}
.rel-buy a{display:inline-flex;align-items:center;min-height:44px;padding:12px 22px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;border:1px solid rgba(255,255,255,.18);transition:border-color .2s,color .2s,background .2s}
.rel-buy a.bc{background:var(--neon-1);border-color:var(--neon-1);color:#0a0908}
.rel-buy a.bc:hover{background:transparent;color:var(--neon-1)}
.rel-buy a.bp:hover{border-color:var(--neon-1);color:var(--neon-1)}
.rel-profile{margin-top:18px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-dim)}
.rel-profile a{color:var(--neon-1)}.rel-profile a:hover{opacity:.7}
.rel h2{font-family:'Major Mono Display',monospace;font-weight:400;font-size:clamp(22px,3vw,32px);text-transform:lowercase;letter-spacing:-.01em;margin:64px 0 20px;display:flex;align-items:center;gap:16px}
.rel h2::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--neon-1),transparent);opacity:.4}
.rel-player{border:1px solid rgba(255,255,255,.08);background:#181a1b}
.rel-player iframe{display:block;border:0;width:100%;height:472px}
.rel-tracks ol{list-style:none;border-top:1px solid rgba(255,255,255,.08)}
.rel-tracks li{display:grid;grid-template-columns:3em 1fr auto;gap:16px;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,.06);font-size:15px}
.rel-tracks .n,.rel-tracks .d{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--ink-dim);letter-spacing:.1em;align-self:center}
.rel-about .note{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:14px}
.rel-about .txt{white-space:pre-line;line-height:1.7;color:var(--ink);max-width:760px}
.rel-about .cr{white-space:pre-line;margin-top:24px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.8;color:var(--ink-dim)}
.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
.ar-card{display:block;border:1px solid rgba(255,255,255,.08);background:var(--bg-2);transition:transform .25s,border-color .25s}
.ar-card:hover{transform:translateY(-3px);border-color:rgba(196,255,61,.5)}
.ar-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.ar-card .t{padding:12px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);line-height:1.5}
.ar-card .t small{display:block;color:var(--ink-dim);font-size:9px;letter-spacing:.25em;margin-top:4px}
@media(max-width:860px){.rel{padding:96px 16px 48px}.rel-hero{grid-template-columns:1fr;gap:28px}.rel-meta{gap:8px 24px}}
@media(max-width:480px){.rel-buy a{flex:1 1 100%;justify-content:center}.rel-meta{grid-template-columns:repeat(2,auto)}}
`;

// BreadcrumbList: home → seção → página (nomes na língua da página)
function breadcrumbLd(lang, items) {
  const home = `${BASE}${lang === SOURCE_LANG ? '' : '/' + lang}/`;
  const list = [{ name: 'Padang Records', item: home }, ...items];
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item }))
  };
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

function releaseJsonLd(r, url) {
  const byArtist = r.artist
    ? r.artist.split(/\s+&\s+/).map(n => ({ '@type': 'MusicGroup', name: n }))
    : [{ '@type': 'MusicGroup', name: 'Various Artists' }];
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: r.title,
    url,
    image: r.cover_url,
    datePublished: r.released,
    numTracks: r.tracklist.length,
    genre: ['Dark progressive', 'Psytech', 'Zenonesque', 'Minimal psy'],
    albumProductionType: r.type === 'VA' ? 'https://schema.org/CompilationAlbum' : 'https://schema.org/StudioAlbum',
    albumReleaseType: r.type === 'EP' ? 'https://schema.org/EPRelease' : 'https://schema.org/AlbumRelease',
    byArtist: byArtist.length === 1 ? byArtist[0] : byArtist,
    recordLabel: { '@type': 'Organization', name: 'Padang Records', url: BASE + '/' },
    sameAs: [r.url, r.beatport_url].filter(Boolean),
    track: {
      '@type': 'ItemList',
      numberOfItems: r.tracklist.length,
      itemListElement: r.tracklist.map(tk => ({
        '@type': 'ListItem', position: tk.n,
        item: { '@type': 'MusicRecording', name: tk.title, duration: isoDur(tk.duration) }
      }))
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

function renderRelease(r, lang, dict, layout, roster, stats) {
  const P = lang === SOURCE_LANG ? '' : '/' + lang;
  const urls = Object.fromEntries(LANGS.map(l => [l, `${BASE}${l === SOURCE_LANG ? '' : '/' + l}/release/${r.slug}/`]));
  const artistText = r.artist || 'Various Artists';
  const type = RELEASE_TYPE[r.type][lang];
  const date = fmtDate(r, lang);
  const n = r.tracklist.length;
  const sentence = SENTENCE[lang](artistText, r.title, type, date, n, r.type === 'VA');
  const inRoster = rosterArtists(r.artist, roster);
  let artistHtml = escText(artistText);
  for (const name of inRoster) {
    const re = new RegExp(escText(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    artistHtml = artistHtml.replace(re, m => `<a href="${P}/artists/${artistSlug(name)}/">${m}</a>`);
  }
  const cover700 = r.cover_url.replace(/_10\.jpg$/, '_16.jpg');
  const more = r.artist ? layout.releases.filter(x => x.slug !== r.slug && x.artist && fold(x.artist) === fold(r.artist)).slice(0, 6) : [];
  const moreHtml = more.length ? `
  <section class="rel-more">
    <h2>${escText((t(dict, 'rel_more_by', lang) || 'more from {artist}').replace('{artist}', artistText))}</h2>
    <div class="ar-grid">
${more.map(x => `      <a class="ar-card" href="${P}/release/${x.slug}/"><img src="${x.cover_url.replace(/_10\.jpg$/, '_7.jpg')}" alt="${escAttr(x.title)}" loading="lazy" width="350" height="350" /><div class="t">${escText(x.title)}<small>${escText(x.released_label)} · ${x.type}</small></div></a>`).join('\n')}
    </div>
  </section>
` : '';
  const L = key => escText(t(dict, key, lang) || key);

  const body = `<main class="rel" data-release="${r.slug}">
  <div class="crumb"><a href="${P}/releases.html" data-i18n="rel_back">${L('rel_back')}</a></div>
  <article class="rel-hero">
    <div class="rel-cover"><img src="${cover700}" width="700" height="700" alt="${escAttr(artistText + ' — ' + r.title)}" /></div>
    <div class="rel-info">
      <span class="rel-cat">${escText(type)}</span>
      <h1>${escText(r.title)}</h1>
      <div class="rel-artist">${artistHtml}</div>
      <p class="rel-lead">${escText(sentence)}</p>
      <dl class="rel-meta">
        <div><dt data-i18n="rel_released">${L('rel_released')}</dt><dd><time datetime="${r.released}">${escText(date)}</time></dd></div>
        <div><dt data-i18n="rel_tracks">${L('rel_tracks')}</dt><dd>${n}</dd></div>
        <div><dt data-i18n="rel_label">${L('rel_label')}</dt><dd>Padang Records</dd></div>
      </dl>
      <div class="rel-buy">
        <a class="bc" href="${r.url}" target="_blank" rel="noopener" data-i18n="rel_buy_bc">${L('rel_buy_bc')}</a>${r.beatport_url ? `
        <a class="bp" href="${r.beatport_url}" target="_blank" rel="noopener" data-i18n="rel_buy_bp">${L('rel_buy_bp')}</a>` : ''}
      </div>${inRoster.map(name => `
      <div class="rel-profile">↳ <a href="${P}/artists/${artistSlug(name)}/">${escText(name)} · <span data-i18n="rel_roster">${L('rel_roster')}</span></a></div>`).join('')}
    </div>
  </article>

  <h2 data-i18n="rel_listen">${L('rel_listen')}</h2>
  <section class="rel-player">
    <iframe loading="lazy" src="https://bandcamp.com/EmbeddedPlayer/album=${r.album_id}/size=large/bgcol=181a1b/linkcol=c4ff3d/tracklist=true/artwork=small/transparent=true/" seamless title="${escAttr(artistText + ' — ' + r.title)}"><a href="${r.url}">${escText(r.title)}</a></iframe>
  </section>

  <section class="rel-tracks">
    <h2 data-i18n="rel_tracklist">${L('rel_tracklist')}</h2>
    <ol>
${r.tracklist.map(tk => `      <li><span class="n">${String(tk.n).padStart(2, '0')}</span><span class="t">${escText(tk.title)}</span><span class="d">${fmtDur(tk.duration)}</span></li>`).join('\n')}
    </ol>
  </section>
${r.description_en || r.credits ? `
  <section class="rel-about">
    <h2 data-i18n="rel_about">${L('rel_about')}</h2>${r.description_en ? `
    <div class="note" data-i18n="rel_about_note">${L('rel_about_note')}</div>
    <div class="txt">${escText(r.description_en)}</div>` : ''}${r.credits ? `
    <div class="cr">${escText(r.credits)}</div>` : ''}
  </section>
` : ''}${moreHtml}
${layout.blocks}
</main>`;

  const title = `${artistText} — ${r.title} (${type}) · PADANG RECORDS`;
  const desc = `${sentence} ${LISTEN_BUY[lang](!!r.beatport_url)}`;
  let head = '<head>\n' + layout.headBase
    .replace(/<meta property="og:type" content="[^"]*"/, '<meta property="og:type" content="music.album"')
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${r.cover_url}"`);
  head = seoHead(head, { title, desc, urls, lang, extraHead: [
    releaseJsonLd(r, urls[lang]),
    breadcrumbLd(lang, [{ name: t(dict, 'nav_releases', lang) || 'Releases', item: urlOf('releases.html', lang) }, { name: `${artistText} — ${r.title}`, item: urls[lang] }])
  ] });

  let html = `<!DOCTYPE html>
<html lang="${lang}" data-static-lang>
${head}</head>
<body>

${layout.nav}

${body}

${layout.footer}

<script src="/i18n.js" defer></script>
<script src="/i18n-extra.js" defer></script>
${layout.scripts.join('\n')}
</body>
</html>
`;
  html = applyTranslations(html, dict, lang, stats);          // nav, rodapé e blocos
  html = syncCounts(html, layout.total);
  html = absolutizeAssets(html);
  html = html.replace(/(href|src|action)="\.\//g, `$1="${P}/`); // links entre páginas ficam no idioma
  return html;
}

// ── 2c'. JSON-LD das páginas principais ──────────────────────────
const SAME_AS = [
  'https://padang.bandcamp.com/',
  'https://www.beatport.com/label/padang-records/76105',
  'https://soundcloud.com/padangrec',
  'https://www.youtube.com/channel/UCOFQWuWtL1njucmHIXf0R3A',
  'https://www.instagram.com/padangrecords/'
];
const LD_LANG = { pt: 'pt-BR', en: 'en', es: 'es', de: 'de', fr: 'fr', ja: 'ja' };
const ldScript = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// home: a organização (o que alimenta o painel "Padang Records" no Google) + o site
function orgJsonLd(lang, dict) {
  return ldScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': BASE + '/#org',
        name: 'Padang Records', alternateName: 'Padang', url: BASE + '/',
        logo: { '@type': 'ImageObject', url: BASE + '/img/logo-full.png' },
        image: BASE + '/img/logo-full.png',
        description: t(dict, 'seo_desc_index', lang),
        foundingDate: '2013',
        foundingLocation: { '@type': 'Place', name: 'Novo Hamburgo, Rio Grande do Sul, Brazil' },
        email: 'contact@padangrecords.net',
        sameAs: SAME_AS,
        knowsAbout: ['Dark progressive', 'Psytech', 'Zenonesque', 'Minimal psy', 'Psytrance']
      },
      {
        '@type': 'WebSite', '@id': BASE + '/#website',
        name: 'Padang Records', url: `${BASE}${lang === SOURCE_LANG ? '' : '/' + lang}/`,
        inLanguage: LD_LANG[lang], publisher: { '@id': BASE + '/#org' }
      }
    ]
  });
}

// eventos: um MusicEvent por card futuro da events.html (nomes/locais já traduzidos)
const MONTHS = { jan: 1, fev: 2, feb: 2, mar: 3, abr: 4, apr: 4, mai: 5, may: 5, jun: 6, jul: 7, ago: 8, aug: 8, set: 9, sep: 9, out: 10, oct: 10, nov: 11, dez: 12, dec: 12 };
function loadEvData(html) {
  const m = html.match(/const EVDATA = (\{[\s\S]*?\});\n/);
  try { return m ? JSON.parse(m[1]) : {}; } catch (e) { return {}; }
}
function eventsJsonLd(html, lang, pageUrl) {
  const evdata = loadEvData(html);
  const today = new Date().toISOString().slice(0, 10);
  const events = [];
  const re = /<div class="ev">([\s\S]*?)<span class="arr">/g;
  let m;
  while ((m = re.exec(html))) {
    const c = m[1];
    const day = ((c.match(/class="day">([^<]*)/) || [])[1] || '').trim();
    const mo = c.match(/class="mo"([^>]*)>([^<]*)</);
    if (!mo || !/^\d{1,2}$/.test(day)) continue;
    const [mon, yy] = mo[2].trim().toLowerCase().split('/');
    const mm = MONTHS[mon];
    if (!mm || !/^\d\d$/.test(yy || '')) continue;
    const start = `20${yy}-${String(mm).padStart(2, '0')}-${day.padStart(2, '0')}`;
    const end = (mo[1].match(/data-end="([^"]+)"/) || [])[1] || start;
    if (end < today) continue;
    const key = (c.match(/class="name" data-i18n="ev_([^"]+)_n"/) || [])[1];
    const name = stripTags((c.match(/class="name"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '');
    const loc = stripTags((c.match(/class="loc"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '');
    if (!name) continue;
    const parts = loc.split('·').map(s => s.trim()).filter(Boolean);
    const performers = [...c.matchAll(/class="av" title="([^"]+)"/g)].map(x => x[1].replace(/\s*\(.*$/, '').trim());
    const d = (key && evdata['ev_' + key]) || {};
    const ev = {
      '@type': 'MusicEvent', name, startDate: start, endDate: end,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      image: BASE + '/img/logo-full.png',
      url: d.site || pageUrl,
      location: { '@type': 'Place', name: parts.slice(1).join(', ') || loc || name, address: { '@type': 'PostalAddress', addressLocality: parts[1] || parts[0] || '', addressCountry: parts[0] || '' } }
    };
    if (d.about) ev.description = d.about;
    if (performers.length) ev.performer = performers.map(n => ({ '@type': 'MusicGroup', name: n }));
    if (d.tickets) ev.offers = { '@type': 'Offer', url: d.tickets, availability: 'https://schema.org/InStock' };
    events.push(ev);
  }
  return events.length ? ldScript({ '@context': 'https://schema.org', '@graph': events }) : '';
}

// ── 2d. páginas de artista: /artists/<slug>/ (+ /xx/artists/<slug>/) ──
// (/artist/ sem "s" é o portal restrito — não confundir)
function loadRoster() {
  const src = read('roster.html');
  const a = src.indexOf('const D="demos@padangrecords.net";');
  const b = src.indexOf('\n];', a);
  if (a < 0 || b < 0) throw new Error('roster.html: array roster não encontrado');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src.slice(a, b + 3) + '\nthis.__roster = roster;', ctx, { filename: 'roster.html' });
  return ctx.__roster;
}
function loadBios() {
  const noop = () => {};
  const ctx = { document: { readyState: 'complete', documentElement: { lang: 'pt' }, getElementById: () => null, querySelectorAll: () => [], addEventListener: noop }, setTimeout: noop, MutationObserver: function () { this.observe = noop; }, console };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(read('i18n-bios.js'), ctx, { filename: 'i18n-bios.js' });
  return ctx.window.PADANG_BIOS || {};
}
const PALETTE = [['#ff2bd6', '#42e8ff'], ['#c4ff3d', '#ff2bd6'], ['#42e8ff', '#ff7a18'], ['#ff7a18', '#c4ff3d'], ['#ff2bd6', '#c4ff3d'], ['#42e8ff', '#ff2bd6'], ['#c4ff3d', '#42e8ff'], ['#ff7a18', '#ff2bd6']];
const initials = n => n.replace(/[^A-Za-zÀ-ÿ&]/g, ' ').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2);
const stripTags = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function excerpt(s, max) {
  s = stripTags(s);
  if (s.length <= max) return s;
  const cut = s.slice(0, max).replace(/[,;:\s]+\S*$/, '');
  return cut + '…';
}

function artistLayout() {
  const src = read('roster.html');
  const head = src.slice(src.search(/<head>/i) + 6, src.search(/<\/head>/i));
  const style = head.match(/<style>([\s\S]*?)<\/style>/)[1];
  const nav = src.match(/<nav>[\s\S]*?<\/nav>/)[0].replace(/href="\.\/index\.html(#[^"]*)?"/g, (m, h) => `href="./${h || ''}"`).replace(/ class="on"/g, '').replace(/<a href="\.\/roster\.html"/, '<a href="./roster.html" class="on"');
  const footer = src.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const scripts = [...src.matchAll(/<script>[\s\S]*?<\/script>/g)].map(m => m[0]).filter(s => /MOBILE NAV — hamburger toggle/.test(s));
  if (scripts.length !== 1) throw new Error('roster.html: script do menu mobile não encontrado');
  const headBase = head
    .replace(/<style>[\s\S]*?<\/style>\n?/, '<link rel="stylesheet" href="/artists/artist.css" />\n')
    .replace(/<link rel="stylesheet" href="\.\/blocks\.css" \/>\n?/, '')
    .replace(/\s*$/, '\n<link rel="stylesheet" href="/blocks.css" />\n');
  const home = read('index.html');
  const m = home.match(/<section id="pc" class="[^"]*"[^>]*>/);
  const end = findClose(home, 'section', m.index + m[0].length);
  const pcomp = home.slice(m.index, end + '</section>'.length).replace(/ rv"/, '"');
  return { style, headBase, nav, footer, scripts, pcomp };
}

const ARTIST_CSS = `
/* ── página de artista (gerado por build-i18n.js — não editar) ── */
.ar{max-width:1100px;margin:0 auto;padding:120px 32px 60px}
.ar .crumb{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:28px}
.ar .crumb a:hover{color:var(--neon-1)}
.ar-head{display:grid;grid-template-columns:220px 1fr;gap:40px;align-items:center;padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,.08)}
.ar-av{position:relative;width:220px;height:220px;border-radius:50%;overflow:hidden;background-color:#1a1a2a;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15),0 0 60px -14px rgba(196,255,61,.35);display:flex;align-items:center;justify-content:center;font-family:'Major Mono Display',monospace;font-size:64px;color:#fff;text-transform:lowercase;letter-spacing:-.02em}
.ar-av img{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(.15) contrast(1.05)}
.ar-av .ini{display:none}.ar-av.nf .ini{display:block}
.ar-info h1{font-family:'Major Mono Display',monospace;font-weight:400;font-size:clamp(36px,6vw,72px);line-height:.95;letter-spacing:-.02em;text-transform:lowercase;color:var(--ink)}
.ar-cy{margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--neon-1)}
.ar-cy span{color:var(--ink-dim)}
.ar-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.ar-links a{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:11px 18px;border:1px solid rgba(255,255,255,.18);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink);transition:border-color .2s,color .2s}
.ar-links a:hover{border-color:var(--neon-1);color:var(--neon-1)}
.ar h2{font-family:'JetBrains Mono',monospace;font-weight:400;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--neon-2);margin:48px 0 18px;display:flex;align-items:center;gap:16px}
.ar h2::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(196,255,61,.5),transparent)}
.ar-bio p{font-size:16px;line-height:1.7;font-weight:300;color:var(--ink);max-width:760px}
.ar-bio p b{font-weight:500}
.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.ar-card{display:block;border:1px solid rgba(255,255,255,.08);background:var(--bg-2);transition:transform .25s,border-color .25s}
.ar-card:hover{transform:translateY(-3px);border-color:rgba(196,255,61,.5)}
.ar-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.ar-card .t{padding:12px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);line-height:1.5}
.ar-card .t small{display:block;color:var(--ink-dim);font-size:9px;letter-spacing:.25em;margin-top:4px}
.ar-card.emb iframe{display:block;border:0;width:100%;height:380px}
.ar-sc iframe{display:block;border:0;width:100%;height:380px;background:#181a1b}
.ar-tv{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.ar-tv a{display:block;border:1px solid rgba(255,255,255,.08);background:var(--bg-2)}
.ar-tv a:hover{border-color:rgba(196,255,61,.5)}
.ar-tv img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.ar-tv span{display:block;padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-dim)}
.ar .pcomp{max-width:none;padding:0;margin-top:72px}
@media(max-width:720px){.ar{padding:96px 16px 48px}.ar-head{grid-template-columns:1fr;gap:24px;text-align:center;justify-items:center}.ar-links{justify-content:center}.ar .pcomp{margin-top:56px}}
`;

function artistJsonLd(a, url, photo, bio, albums) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: a.n,
    url,
    description: excerpt(bio, 300),
    genre: ['Dark progressive', 'Psytech', 'Zenonesque', 'Minimal psy'],
    memberOf: { '@type': 'Organization', name: 'Padang Records', url: BASE + '/' }
  };
  if (photo) ld.image = photo;
  const same = [a.sc, a.bc].filter(u => u && /^https?:/.test(u) && !/\/search\//.test(u));
  if (same.length) ld.sameAs = same;
  if (albums.length) ld.album = albums.map(r => ({ '@type': 'MusicAlbum', name: r.title, url: `${BASE}/release/${r.slug}/`, image: r.cover_url, datePublished: r.released }));
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

function renderArtist(a, i, lang, dict, bios, layout, byAlbum, stats) {
  const P = lang === SOURCE_LANG ? '' : '/' + lang;
  const slug = artistSlug(a.n);
  const urls = Object.fromEntries(LANGS.map(l => [l, `${BASE}${l === SOURCE_LANG ? '' : '/' + l}/artists/${slug}/`]));
  const bio = (bios[a.n] && bios[a.n][lang]) || a.b || '';
  const L = key => escText(t(dict, key, lang) || key);
  const photoRel = a.p ? (a.p.startsWith('./') ? a.p.slice(1) : a.p) : null;   // ./img/… → /img/…
  const photoAbs = photoRel ? (photoRel.startsWith('/') ? BASE + photoRel : photoRel) : null;
  const grad = `linear-gradient(135deg,${PALETTE[i % PALETTE.length][0]},${PALETTE[i % PALETTE.length][1]})`;
  // releases do artista = r: da entry ∪ releases.json cujo campo artist cita o nome (o r: de
  // vários artistas está incompleto); ordem: data desc
  const fromCatalog = layout.releases.filter(x => x.artist && rosterArtists(x.artist, layout.roster).includes(a.n));
  const seen = new Set(fromCatalog.map(x => x.album_id));
  const rel = fromCatalog.concat((a.r || []).filter(([id]) => !seen.has(id)).map(([id, title]) => byAlbum[id] || { title, album_id: id }))
    .sort((x, y) => (y.released || '').localeCompare(x.released || ''));
  const vas = (a.va || []).map(([id, title]) => byAlbum[id] || { title, album_id: id });
  const albums = rel.filter(r => r.slug);
  const card = r => r.slug
    ? `<a class="ar-card" href="${P}/release/${r.slug}/"><img src="${r.cover_url.replace(/_10\.jpg$/, '_7.jpg')}" alt="${escAttr(r.title)}" loading="lazy" width="350" height="350" /><div class="t">${escText(r.title)}<small>${escText(r.released_label)} · ${r.type}</small></div></a>`
    : `<div class="ar-card emb"><iframe loading="lazy" src="https://bandcamp.com/EmbeddedPlayer/album=${r.album_id}/size=large/bgcol=181a1b/linkcol=c4ff3d/tracklist=false/artwork=small/transparent=true/" seamless title="${escAttr(r.title)}"></iframe></div>`;
  const email = a.e === 'D' || !a.e ? 'demos@padangrecords.net' : a.e;
  const scOk = a.s && a.sc && !/\/search\//.test(a.sc);

  const body = `<main class="ar" data-artist="${slug}">
  <div class="crumb"><a href="${P}/roster.html" data-i18n="ar_back">${L('ar_back')}</a></div>
  <header class="ar-head">
    <div class="ar-av${photoRel ? '' : ' nf'}" style="background:${grad}">${photoRel ? `<img src="${escAttr(photoRel)}" alt="${escAttr(a.n)}" width="220" height="220" onerror="this.parentNode.classList.add('nf');this.remove()" />` : ''}<span class="ini">${escText(initials(a.n)).toLowerCase()}</span></div>
    <div class="ar-info">
      <h1>${escText(a.n)}</h1>
      <div class="ar-cy">↳ ${escText(a.c)} · <span data-i18n="ar_label_artist">${L('ar_label_artist')}</span></div>
      <div class="ar-links">${scOk ? `
        <a href="${escAttr(a.sc)}" target="_blank" rel="noopener">soundcloud →</a>` : ''}${a.bc ? `
        <a href="${escAttr(a.bc)}" target="_blank" rel="noopener">bandcamp →</a>` : ''}
        <a href="mailto:${escAttr(email)}?subject=booking%20-%20${encodeURIComponent(a.n)}"><span data-i18n="ar_booking">${L('ar_booking')}</span> →</a>
      </div>
    </div>
  </header>

  <section class="ar-bio">
    <h2 data-i18n="ar_bio">${L('ar_bio')}</h2>
    <p>${bio}</p>
  </section>
${rel.length ? `
  <section>
    <h2 data-i18n="ar_releases">${L('ar_releases')}</h2>
    <div class="ar-grid">
${rel.map(r => '      ' + card(r)).join('\n')}
    </div>
  </section>
` : ''}${vas.length ? `
  <section>
    <h2 data-i18n="ar_va">${L('ar_va')}</h2>
    <div class="ar-grid">
${vas.map(r => '      ' + card(r)).join('\n')}
    </div>
  </section>
` : ''}${scOk ? `
  <section class="ar-sc">
    <h2 data-i18n="ar_sc">${L('ar_sc')}</h2>
    <iframe loading="lazy" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(a.sc)}&color=%23c4ff3d&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true" allow="autoplay" title="${escAttr(a.n)} — SoundCloud"></iframe>
  </section>
` : ''}${a.yt && a.yt.length ? `
  <section>
    <h2 data-i18n="ar_tv">${L('ar_tv')}</h2>
    <div class="ar-tv">
${a.yt.map(([label, id]) => `      <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${escAttr(label)}" loading="lazy" /><span>${escText(label)}</span></a>`).join('\n')}
    </div>
  </section>
` : ''}
${layout.pcomp}
</main>`;

  const title = `${a.n} · ${t(dict, 'ar_title_suffix', lang)}`;
  const desc = `${excerpt(bio, 120)} ${t(dict, 'ar_desc_suffix', lang)}`;
  let head = '<head>\n' + layout.headBase
    .replace(/<meta property="og:type" content="[^"]*"/, '<meta property="og:type" content="profile"')
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${photoAbs || BASE + '/img/logo-full.png'}"`);
  head = seoHead(head, { title, desc, urls, lang, extraHead: [
    artistJsonLd(a, urls[lang], photoAbs, bio, albums),
    breadcrumbLd(lang, [{ name: t(dict, 'nav_roster', lang) || 'Roster', item: urlOf('roster.html', lang) }, { name: a.n, item: urls[lang] }])
  ] });

  let html = `<!DOCTYPE html>
<html lang="${lang}" data-static-lang>
${head}</head>
<body>

${layout.nav}

${body}

${layout.footer}

<script src="/i18n.js" defer></script>
<script src="/i18n-extra.js" defer></script>
${layout.scripts.join('\n')}
</body>
</html>
`;
  html = applyTranslations(html, dict, lang, stats);
  html = syncCounts(html, layout.total);
  html = absolutizeAssets(html);
  html = html.replace(/(href|src|action)="\.\//g, `$1="${P}/`);
  return html;
}

// ── 3. validação: todo <script> inline precisa compilar ─────────
function checkScripts(file, html) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m, n = 0;
  while ((m = re.exec(html))) {
    if (/\bsrc=/.test(m[1])) continue;
    const type = (m[1].match(/type="([^"]+)"/) || [])[1];
    if (type === 'application/ld+json') { JSON.parse(m[2]); n++; continue; }
    if (type && !/javascript|module/.test(type)) continue;
    try { new vm.Script(m[2], { filename: file }); n++; }
    catch (e) { throw new Error(`JS inválido em ${file}: ${e.message}`); }
  }
  return n;
}

// ── 4. sitemap / robots ──────────────────────────────────────────
function gitDate(file) {
  try { return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT }).toString().trim() || null; }
  catch (e) { return null; }
}

function sitemap(entries) {
  const x = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  for (const { urls, lastmod } of entries) {
    for (const l of LANGS) {
      x.push('  <url>', `    <loc>${urls[l]}</loc>`);
      if (lastmod) x.push(`    <lastmod>${lastmod}</lastmod>`);
      for (const a of LANGS) x.push(`    <xhtml:link rel="alternate" hreflang="${a}" href="${urls[a]}"/>`);
      x.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${urls[X_DEFAULT]}"/>`, '  </url>');
    }
  }
  x.push('</urlset>', '');
  return x.join('\n');
}

const ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /artist/

Sitemap: ${BASE}/sitemap.xml
`;

// ── main ─────────────────────────────────────────────────────────
function main() {
  const dict = loadDict();
  const releases = JSON.parse(read('data/releases.json'));
  const newestRelease = releases.map(r => (r.lastmod || r.released || '').slice(0, 10)).sort().pop();
  const byAlbum = Object.fromEntries(releases.map(r => [r.album_id, r]));
  const bySlug = Object.fromEntries(releases.map(r => [r.slug, r]));
  const stats = { applied: 0, missing: new Set() };
  const entries = [];
  let written = 0, scripts = 0, files = 0;

  for (const page of PAGES) {
    const template = read(page);
    for (const lang of LANGS) {
      const html = renderPage(template, page, lang, dict, stats, byAlbum, bySlug);
      const rel = lang === SOURCE_LANG ? page : `${lang}/${page}`;
      scripts += checkScripts(rel, html);
      if (write(rel, html)) written++;
      files++;
    }
    const lastmod = (page === 'index.html' || page === 'releases.html') ? newestRelease : gitDate(page);
    entries.push({ urls: Object.fromEntries(LANGS.map(l => [l, urlOf(page, l)])), lastmod });
  }

  // páginas de release
  const layout = releaseLayout();
  layout.total = releases.length;
  layout.releases = releases;
  const roster = rosterIndex();
  const rosterData = loadRoster();
  const artistSlugs = new Set(rosterData.map(a => artistSlug(a.n)));
  if (write('release/release.css', layout.style + '\n' + RELEASE_CSS)) written++;
  const pagesBefore = files;
  for (const r of releases) {
    for (const lang of LANGS) {
      const html = renderRelease(r, lang, dict, layout, roster, stats);
      const rel = `${lang === SOURCE_LANG ? '' : lang + '/'}release/${r.slug}/index.html`;
      scripts += checkScripts(rel, html);
      if (write(rel, html)) written++;
      files++;
    }
    entries.push({
      urls: Object.fromEntries(LANGS.map(l => [l, `${BASE}${l === SOURCE_LANG ? '' : '/' + l}/release/${r.slug}/`])),
      lastmod: (r.lastmod || r.released).slice(0, 10)
    });
  }
  const releaseFiles = files - pagesBefore;

  // páginas de artista
  const aLayout = artistLayout();
  aLayout.total = releases.length;
  aLayout.releases = releases;
  aLayout.roster = roster;
  const bios = loadBios();
  if (write('artists/artist.css', aLayout.style + '\n' + ARTIST_CSS)) written++;
  const rosterLastmod = gitDate('roster.html');
  const artistsBefore = files;
  rosterData.forEach((a, i) => {
    const slug = artistSlug(a.n);
    for (const lang of LANGS) {
      const html = renderArtist(a, i, lang, dict, bios, aLayout, byAlbum, stats);
      const rel = `${lang === SOURCE_LANG ? '' : lang + '/'}artists/${slug}/index.html`;
      scripts += checkScripts(rel, html);
      if (write(rel, html)) written++;
      files++;
    }
    entries.push({ urls: Object.fromEntries(LANGS.map(l => [l, `${BASE}${l === SOURCE_LANG ? '' : '/' + l}/artists/${slug}/`])), lastmod: rosterLastmod });
  });
  const artistFiles = files - artistsBefore;

  if (write('sitemap.xml', sitemap(entries))) written++;
  if (write('robots.txt', ROBOTS)) written++;

  console.log(`build-i18n: ${files - releaseFiles - artistFiles} páginas (${PAGES.length} × ${LANGS.length} idiomas) + ${releaseFiles} de release (${releases.length} × ${LANGS.length}) + ${artistFiles} de artista (${rosterData.length} × ${LANGS.length}), ${written} arquivos alterados`);
  console.log(`  ${stats.applied} traduções aplicadas · ${scripts} scripts inline validados · sitemap: ${entries.length * LANGS.length} URLs`);
  if (stats.missing.size) console.log(`  chaves data-i18n sem tradução (mantêm o texto do HTML): ${[...stats.missing].sort().join(', ')}`);
}

try { main(); }
catch (e) { console.error('build-i18n: ERRO — ' + e.message); process.exit(1); }
