#!/usr/bin/env node
/* PADANG · sync-lab.js — completa data/lab-series.json com o que está publicado no SoundCloud de cada
 * episódio da Lab Series: duração, texto da descrição (EN e, quando houver, a parte em PT), tracklist e
 * vídeo da PadangTV citado na descrição. O build-i18n.js gera /lab/<slug>/ a partir desse arquivo.
 *
 * Só preenche campos AUSENTES da entrada (description_en, description_pt, tracklist, youtube,
 * duration_sec/artwork null) — uma tracklist escrita à mão no JSON não é sobrescrita. `--force` refaz tudo.
 *
 * Uso:
 *   node sync-lab.js            # completa o que falta
 *   node sync-lab.js --force    # relê todos os episódios e sobrescreve os campos acima
 *   node sync-lab.js --ep 24    # só um episódio
 *
 * Sem dependências. Node 18+ (usa fetch). Idempotente: só reescreve o JSON se algo mudou.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'data', 'lab-series.json');
// UA de navegador completo: o SoundCloud serve a página sem o JSON de hidratação para UAs curtos
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--ep') ? Number(args[args.indexOf('--ep') + 1]) : null;

async function soundOf(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/window\.__sc_hydration = (\[[\s\S]*?\]);<\/script>/);
  if (!m) throw new Error(`${url}: JSON de hidratação não encontrado`);
  const sound = JSON.parse(m[1]).find(x => x.hydratable === 'sound');
  if (!sound) throw new Error(`${url}: faixa não encontrada na página`);
  return sound.data;
}

// regras da label para o texto: nada de "psytechno" (usa "psy tech")
const tidy = s => s.replace(/psy[\s-]?techno/gi, 'psy tech');

// linha de tracklist: "Artista - Faixa", "1 - A – B", "11.A - B", "O1 - A - B"…
const TRACK = /^\s*(?:[O0]?\d{1,2}\s*[.)]\s*|[O0]?\d{1,2}\s+[-–]\s+)?\S.{0,110}?\s*[-–]\s*\S/;
const NUM = /^\s*(?:[O0]?\d{1,2}\s*[.)]\s*|[O0]?\d{1,2}\s+[-–]\s+)/;
const HEADER = /^\s*(?:tracklist|track list|title\s*-\s*artist|full padang set)\s*:?\s*$/i;

function parseDescription(desc) {
  const out = { description_en: null, description_pt: null, tracklist: null, youtube: null };
  if (!desc || !desc.trim()) return out;
  let [en, pt] = desc.replace(/\r/g, '').split(/\n\s*_{3,}\s*\n\s*PT\s*-\s*Br\s*\n/i);
  // tracklist numa linha só, separada por " / " (ex.: EP.6) → uma faixa por linha
  const lines = en.split('\n').map(l => l.replace(/[\t ]+$/, '').replace(/\t/g, ' '))
    .flatMap(l => { const p = l.split(' / '); return p.length >= 4 && p.every(x => TRACK.test(x)) ? p : [l]; });

  // tracklist = a maior sequência de ≥4 linhas com cara de faixa
  let best = null;
  for (let i = 0; i < lines.length; i++) {
    if (!TRACK.test(lines[i]) || HEADER.test(lines[i]) || lines[i].length > 140) continue;
    let j = i;
    while (j < lines.length && TRACK.test(lines[j]) && !HEADER.test(lines[j]) && lines[j].length <= 140) j++;
    if (j - i >= 4 && (!best || j - i > best[1] - best[0])) best = [i, j];
    i = j;
  }
  const drop = new Set();
  if (best) {
    out.tracklist = lines.slice(best[0], best[1]).map(l => l.replace(NUM, '').replace(/\s+/g, ' ').trim());
    for (let k = best[0]; k < best[1]; k++) drop.add(k);
    for (let k = best[0] - 1; k >= 0 && (HEADER.test(lines[k]) || !lines[k].trim()); k--) if (HEADER.test(lines[k])) drop.add(k);
  }
  // links soltos: o do YouTube vira botão da PadangTV (e some com a chamada "watch … youtube" logo acima)
  lines.forEach((l, k) => {
    const u = l.trim();
    if (!/^https?:\/\/\S+$/.test(u)) return;
    drop.add(k);
    const yt = u.match(/youtube\.com\/watch\?v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
    if (yt) {
      out.youtube = yt[1] || yt[2];
      if (k > 0 && /watch|youtube|padangtv/i.test(lines[k - 1])) drop.add(k - 1);
    }
  });
  const text = s => tidy(s).replace(/\n{3,}/g, '\n\n').trim() || null;
  out.description_en = text(lines.filter((_, k) => !drop.has(k)).join('\n'));
  if (pt) out.description_pt = text(pt.split('\n').map(l => l.replace(/[\t ]+$/, '')).join('\n').replace(/  +/g, ' '));
  return out;
}

async function main() {
  const raw = fs.readFileSync(OUT, 'utf8');
  const eps = JSON.parse(raw);
  for (const e of eps) {
    if (ONLY && e.ep !== ONLY) continue;
    const need = FORCE || e.duration_sec == null || !e.artwork || !('description_en' in e) || !('tracklist' in e);
    if (!need) continue;
    let s;
    try { s = await soundOf(e.sc_url); }
    catch (err) { console.warn(`  EP.${e.ep}: ${err.message}`); continue; }
    if (FORCE || e.duration_sec == null) e.duration_sec = Math.round(s.duration / 1000);
    if ((FORCE || !e.artwork) && s.artwork_url) e.artwork = s.artwork_url.replace(/-(?:large|t\d+x\d+)\./, '-t500x500.');
    const p = parseDescription(s.description);
    for (const k of ['description_en', 'description_pt', 'tracklist', 'youtube']) {
      if (FORCE || !(k in e)) e[k] = p[k];
    }
    console.log(`  EP.${e.ep} ${e.title}: ${e.duration_sec}s · descrição ${e.description_en ? e.description_en.length + ' car.' : '—'}${e.description_pt ? ' + PT' : ''} · tracklist ${e.tracklist ? e.tracklist.length : '—'}${e.youtube ? ' · youtube ' + e.youtube : ''}`);
  }
  const next = JSON.stringify(eps, null, 2) + '\n';
  if (next === raw) return console.log('sync-lab: nada mudou');
  fs.writeFileSync(OUT, next);
  console.log(`sync-lab: ${OUT} atualizado (${eps.length} episódios)`);
}

main().catch(e => { console.error('sync-lab: ERRO — ' + e.message); process.exit(1); });
