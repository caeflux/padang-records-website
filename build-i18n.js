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

// nas subpastas de idioma, assets apontam para a raiz
function absolutizeAssets(html) {
  return html.replace(/(["'(])\.\/(img\/|data\/|i18n[\w-]*\.js|track\.js|send-[\w-]+\.php)/g, '$1/$2');
}

function renderPage(template, page, lang, dict, stats) {
  const key = page.replace(/\.html$/, '');
  const urls = Object.fromEntries(LANGS.map(l => [l, urlOf(page, l)]));
  let html = applyTranslations(template, dict, lang, stats);
  html = setHtmlLang(html, lang);
  const headEnd = html.search(/<\/head>/i);
  const title = t(dict, `seo_title_${key}`, lang);
  const desc = t(dict, `seo_desc_${key}`, lang);
  if (!title || !desc) throw new Error(`faltam seo_title_${key}/seo_desc_${key} no i18n.js`);
  html = seoHead(html.slice(0, headEnd), { title, desc, urls, lang }) + html.slice(headEnd);
  if (lang !== SOURCE_LANG) html = absolutizeAssets(html);
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
  const stats = { applied: 0, missing: new Set() };
  const entries = [];
  let written = 0, scripts = 0, files = 0;

  for (const page of PAGES) {
    const template = read(page);
    for (const lang of LANGS) {
      const html = renderPage(template, page, lang, dict, stats);
      const rel = lang === SOURCE_LANG ? page : `${lang}/${page}`;
      scripts += checkScripts(rel, html);
      if (write(rel, html)) written++;
      files++;
    }
    const lastmod = (page === 'index.html' || page === 'releases.html') ? newestRelease : gitDate(page);
    entries.push({ urls: Object.fromEntries(LANGS.map(l => [l, urlOf(page, l)])), lastmod });
  }

  if (write('sitemap.xml', sitemap(entries))) written++;
  if (write('robots.txt', ROBOTS)) written++;

  console.log(`build-i18n: ${files} páginas (${PAGES.length} × ${LANGS.length} idiomas), ${written} arquivos alterados`);
  console.log(`  ${stats.applied} traduções aplicadas · ${scripts} scripts inline validados · sitemap: ${entries.length * LANGS.length} URLs`);
  if (stats.missing.size) console.log(`  chaves data-i18n sem tradução (mantêm o texto do HTML): ${[...stats.missing].sort().join(', ')}`);
}

try { main(); }
catch (e) { console.error('build-i18n: ERRO — ' + e.message); process.exit(1); }
