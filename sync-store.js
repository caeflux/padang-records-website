#!/usr/bin/env node
/* PADANG · sync-store.js — sincroniza o catálogo da Padang Store (Nuvemshop, padang-records-store.com.br)
 * em data/store.json. O build-i18n.js gera os cards do shop.html a partir desse arquivo (bloco
 * <!-- store:start --> … <!-- store:end -->) e o store.php confere estoque/preço ao vivo.
 *
 * Fontes (em ordem de preferência):
 *   api        — API oficial (https://api.nuvemshop.com.br/v1/<store_id>/products). Precisa de um app do
 *                Portal de Parceiros instalado na loja; o token fica FORA do repo, em ~/.padang/nuvemshop.json
 *                ({ client_id, client_secret, store_id, access_token }). Tokens da Nuvemshop não expiram.
 *   storefront — páginas públicas da loja (sitemap + bloco LS.variants de cada produto). Não precisa de token;
 *                é o fallback automático enquanto não houver access_token.
 *
 * Uso:
 *   node sync-store.js                       # api se houver token, senão storefront
 *   node sync-store.js --source storefront   # força a fonte
 *   node sync-store.js --authorize-url       # imprime a URL para instalar o app na loja (gera o code)
 *   node sync-store.js --auth "<code ou URL de redirect com ?code=…>"   # troca o code pelo access_token
 *
 * Sem dependências. Node 18+ (usa fetch). Idempotente: só reescreve data/store.json se o catálogo mudou.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'data', 'store.json');
const CONFIG = process.env.NUVEMSHOP_CONFIG || path.join(os.homedir(), '.padang', 'nuvemshop.json');
const STORE_URL = 'https://padang-records-store.com.br';
const DEFAULT_STORE_ID = 8175113;
const UA = 'PadangRecordsSite/1.0 (+https://padangrecords.net; contact@padangrecords.net)';
const API = id => `https://api.nuvemshop.com.br/v1/${id}`;

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

function loadConfig() {
  try { return Object.assign({ store_id: DEFAULT_STORE_ID }, JSON.parse(fs.readFileSync(CONFIG, 'utf8'))); }
  catch { return { store_id: DEFAULT_STORE_ID }; }
}
function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true, mode: 0o700 });
  fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
}

async function getText(url, headers) {
  const r = await fetch(url, { headers: Object.assign({ 'User-Agent': UA }, headers || {}), redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
  return r.text();
}
async function getJSON(url, headers) { return JSON.parse(await getText(url, headers)); }

// ── classificação dos produtos (o build usa kind/color para rótulo e tradução) ──
const kindOf = name => /moletom|hoodie|capuz/i.test(name) ? 'hoodie' : /camiseta|t-?shirt|\btee\b/i.test(name) ? 'tee' : 'item';
function colorOf(name, images) {
  const s = (name + ' ' + (images[0] || '')).toLowerCase();   // só a foto principal: a galeria pode ter outras cores
  if (/marrom|brown/.test(s)) return 'brown';
  if (/branc|white/.test(s)) return 'white';
  return 'black';
}
const num = v => (v === null || v === undefined || v === '') ? null : Number(v);

// ── fonte: API oficial ──────────────────────────────────────────
async function fromApi(cfg) {
  const headers = { Authentication: `bearer ${cfg.access_token}`, Authorization: `bearer ${cfg.access_token}`, 'Content-Type': 'application/json' };
  const list = await getJSON(`${API(cfg.store_id)}/products?per_page=200&published=true`, headers);
  const pick = o => o && typeof o === 'object' ? (o.pt || o.es || o.en || Object.values(o)[0] || '') : (o || '');
  return list.filter(p => p.published !== false).map(p => {
    const name = String(pick(p.name)).trim();
    const handle = String(pick(p.handle)).trim();
    const images = (p.images || []).slice().sort((a, b) => (a.position || 0) - (b.position || 0)).map(i => i.src);
    const variants = (p.variants || []).map(v => {
      const price = num(v.promotional_price) || num(v.price);
      const stock = v.stock_management === false ? null : num(v.stock);
      return {
        id: v.id,
        size: (v.values || []).map(pick).filter(Boolean).join(' / ') || null,
        price,
        compare_at: num(v.promotional_price) ? num(v.price) : null,
        stock,
        available: stock === null ? true : stock > 0
      };
    });
    return { id: p.id, handle, url: p.canonical_url || `${STORE_URL}/produtos/${handle}/`, name, images, variants };
  });
}

// ── fonte: vitrine pública ──────────────────────────────────────
const unJs = s => s.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
async function fromStorefront() {
  const sm = await getText(`${STORE_URL}/sitemap.xml`);
  const urls = [...sm.matchAll(/<loc>([^<]*\/produtos\/[^<]+)<\/loc>/g)].map(m => m[1].trim()).filter((v, i, a) => a.indexOf(v) === i);
  if (!urls.length) throw new Error('sitemap sem produtos');
  const products = [];
  for (const url of urls) {
    const full = await getText(url, { 'User-Agent': 'Mozilla/5.0 ' + UA });
    const cut = full.search(/>\s*Produtos similares\s*</i);   // ignora a vitrine de "similares" (só o título visível)
    const html = cut > 0 ? full.slice(0, cut) : full;
    const vm = html.match(/LS\.variants = (\[[\s\S]*?\]);\s*\n/);
    if (!vm) { console.warn(`  (sem LS.variants, pulando) ${url}`); continue; }
    const vs = JSON.parse(vm[1]);
    const pm = html.match(/LS\.product = \{([\s\S]*?)\};/);
    const id = Number((pm && (pm[1].match(/\bid\s*:\s*(\d+)/) || [])[1]) || vs[0].product_id);
    const name = unJs((pm && (pm[1].match(/\bname\s*:\s*'((?:[^'\\]|\\.)*)'/) || [])[1]) || '').trim()
              || (html.match(/<title>([^<]*?)\s+-\s+Comprar/i) || [])[1] || '';
    const seen = new Set(); const images = [];
    const push = u => { if (!u) return; let abs = u.startsWith('//') ? 'https:' + u : u.replace(/^http:/, 'https:'); const base = abs.replace(/-\d+-\d+\.(webp|jpe?g|png)(\?.*)?$/, ''); if (seen.has(base)) return; seen.add(base); images.push(base + '-1024-1024.webp'); };
    (html.match(/property="og:image" content="([^"]+)"/) || []).slice(1).forEach(push);
    for (const m of html.matchAll(/(?:https?:)?\/\/[a-z0-9.-]*mitiendanube\.com\/stores\/[^"'\s),]+\/products\/[^"'\s),]+?-\d+-\d+\.(?:webp|jpe?g|png)/g)) push(m[0]);
    const variants = vs.filter(v => v.is_visible !== false).map(v => ({
      id: v.id,
      size: [v.option0, v.option1, v.option2].filter(Boolean).join(' / ') || null,
      price: num(v.promotional_price_number) || num(v.price_number),
      compare_at: num(v.promotional_price_number) ? num(v.price_number) : null,
      stock: num(v.stock),
      available: !!v.available
    }));
    products.push({ id, handle: (url.match(/\/produtos\/([^/?#]+)/) || [])[1] || '', url, name, images, variants });
  }
  return products;
}

// ── normalização + gravação ─────────────────────────────────────
const KIND_ORDER = { hoodie: 0, tee: 1, item: 2 };
function normalize(products) {
  return products
    .filter(p => p.variants.length)
    .map(p => {
      const kind = kindOf(p.name);
      const prices = p.variants.map(v => v.price).filter(v => v != null);
      return {
        id: p.id, handle: p.handle, url: p.url, name: p.name, kind,
        color: kind === 'tee' ? colorOf(p.name, p.images) : null,
        price: prices.length ? Math.min(...prices) : null,
        compare_at: p.variants.find(v => v.compare_at)?.compare_at || null,
        currency: 'BRL',
        images: p.images.slice(0, 6),
        variants: p.variants,
        in_stock: p.variants.some(v => v.available)
      };
    })
    .sort((a, b) => (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) || (b.price - a.price) || a.name.localeCompare(b.name) || String(a.color).localeCompare(String(b.color)));
}

function writeOut(products, source, storeId) {
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { /* primeira vez */ }
  const same = prev && JSON.stringify(prev.products) === JSON.stringify(products) && prev.source === source;
  const data = {
    store_id: storeId, store_url: STORE_URL, source,
    synced_at: same ? prev.synced_at : new Date().toISOString(),
    buy_link: `${STORE_URL}/comprar/{variant_id}-{qty}`,
    products
  };
  if (!same) fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  const sizes = products.reduce((n, p) => n + p.variants.length, 0);
  console.log(`sync-store: ${products.length} produtos · ${sizes} variações · fonte ${source} · ${same ? 'sem mudanças' : 'data/store.json atualizado'}`);
  for (const p of products) console.log(`  ${p.kind.padEnd(6)} ${String(p.id).padEnd(10)} ${p.name}${p.color ? ' · ' + p.color : ''} · R$ ${p.price} · ${p.variants.map(v => `${v.size}${v.stock == null ? '' : ':' + v.stock}`).join(' ')}`);
}

// ── OAuth (one-shot) ────────────────────────────────────────────
async function exchangeCode(cfg, codeOrUrl) {
  if (!cfg.client_id || !cfg.client_secret) throw new Error(`faltam client_id/client_secret em ${CONFIG}`);
  const code = /code=/.test(codeOrUrl) ? new URL(codeOrUrl).searchParams.get('code') : codeOrUrl.trim();
  for (const host of ['https://www.nuvemshop.com.br', 'https://www.tiendanube.com']) {
    const r = await fetch(`${host}/apps/authorize/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
      body: JSON.stringify({ client_id: String(cfg.client_id), client_secret: cfg.client_secret, grant_type: 'authorization_code', code })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.access_token) {
      cfg.access_token = j.access_token;
      cfg.store_id = Number(j.user_id || j.store_id || cfg.store_id);
      cfg.scope = j.scope || null;
      saveConfig(cfg);
      console.log(`token salvo em ${CONFIG} · store_id ${cfg.store_id} · scope ${cfg.scope}`);
      return;
    }
    console.warn(`  ${host}: HTTP ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
  }
  throw new Error('não consegui trocar o code pelo token (ele expira em 5 min — instale o app de novo para gerar outro)');
}

async function main() {
  const cfg = loadConfig();
  if (flag('--authorize-url')) {
    if (!cfg.client_id) throw new Error(`defina client_id em ${CONFIG} primeiro`);
    console.log(`https://www.nuvemshop.com.br/apps/${cfg.client_id}/authorize`);
    return;
  }
  if (opt('--auth')) { await exchangeCode(cfg, opt('--auth')); return; }
  let source = opt('--source') || (cfg.access_token ? 'api' : 'storefront');
  let products;
  if (source === 'api') {
    try { products = await fromApi(cfg); }
    catch (e) {
      if (flag('--source')) throw e;
      console.warn(`sync-store: API falhou (${e.message}); usando a vitrine pública`);
      source = 'storefront';
    }
  }
  if (source === 'storefront') products = await fromStorefront();
  writeOut(normalize(products), source, Number(cfg.store_id) || DEFAULT_STORE_ID);
}

main().catch(e => { console.error('sync-store: ERRO — ' + e.message); process.exit(1); });
