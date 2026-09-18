/* PADANG · track.js — medição GA4 (G-355LVX96J2)
 * Carregado com defer nas 8 páginas públicas (NÃO em /admin/ nem /artist/).
 *
 * Eventos:
 *   outbound_click     {platform, page, release_slug, lang, link_url}
 *   language_selected  {lang, from_lang, page}
 *   embed_play         {platform, page, release_slug, album_id, lang}
 *   (demo_submit e newsletter_signup são disparados pelos próprios formulários)
 *
 * UTMs: todo link de saída para Bandcamp/Beatport recebe, em runtime,
 *   utm_source=padangrecords.net & utm_medium=<page> & utm_campaign=<release_slug|catalog> & utm_content=<lang>
 * Links que já têm utm_source não são tocados; query strings existentes são preservadas.
 */
(function () {
  'use strict';

  var PLATFORMS = [
    ['bandcamp',   function (h) { return /(^|\.)bandcamp\.com$/.test(h); }],
    ['beatport',   function (h) { return /(^|\.)beatport\.com$/.test(h); }],
    ['soundcloud', function (h) { return /(^|\.)soundcloud\.com$/.test(h); }],
    ['spotify',    function (h) { return /(^|\.)spotify\.com$/.test(h); }],
    ['youtube',    function (h) { return /(^|\.)(youtube\.com|youtu\.be)$/.test(h); }],
    ['spreadshop', function (h) { return h.indexOf('myspreadshop') >= 0; }]
  ];
  var UTM_PLATFORMS = { bandcamp: 1, beatport: 1 };
  var LANG_PREFIX = /^\/(en|es|de|fr|ja)(\/|$)/;

  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    params = params || {};
    params.transport_type = 'beacon';
    try { window.gtag('event', name, params); } catch (e) {}
  }

  function lang() {
    return (document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase();
  }

  // "index", "releases", "roster", ... ou "release" nas páginas /release/<slug>/
  function page() {
    var p = location.pathname.replace(LANG_PREFIX, '/');
    if (/^\/release\//.test(p)) return 'release';
    var file = p.split('/').pop() || 'index.html';
    return file.replace(/\.html?$/, '') || 'index';
  }

  // slug da página de release atual (/release/<slug>/), se houver
  function pageReleaseSlug() {
    var m = location.pathname.replace(LANG_PREFIX, '/').match(/^\/release\/([^\/]+)/);
    return m ? m[1] : null;
  }

  function platformOf(url) {
    var h = url.hostname.toLowerCase();
    for (var i = 0; i < PLATFORMS.length; i++) {
      if (PLATFORMS[i][1](h)) return PLATFORMS[i][0];
    }
    return null;
  }

  function slugFromUrl(url, platform) {
    var m;
    if (platform === 'bandcamp' && (m = url.pathname.match(/^\/(?:album|track)\/([^\/?#]+)/))) return m[1];
    if (platform === 'beatport' && (m = url.pathname.match(/^\/release\/([^\/?#]+)/))) return m[1];
    return null;
  }

  function releaseSlugFor(el, url, platform) {
    var s = url ? slugFromUrl(url, platform) : null;
    if (s) return s;
    var ctx = el && el.closest ? el.closest('[data-release]') : null;
    if (ctx) return ctx.getAttribute('data-release');
    return pageReleaseSlug() || 'catalog';
  }

  function parse(href) {
    try { return new URL(href, location.href); } catch (e) { return null; }
  }

  // ── UTMs em runtime ────────────────────────────────────────────
  // refresh=true (no clique): reescreve as UTMs que NÓS colocamos, para refletir
  // o idioma/página do momento; UTMs vindas de outra origem nunca são tocadas.
  function decorate(a, refresh) {
    if (!a || a.tagName !== 'A') return;
    var href = a.getAttribute('href');
    if (!href) return;
    var ours = href.indexOf('utm_source=padangrecords.net') >= 0;
    if (href.indexOf('utm_source=') >= 0 && !(refresh && ours)) return;
    var url = parse(href);
    if (!url || !/^https?:$/.test(url.protocol)) return;
    var platform = platformOf(url);
    if (!UTM_PLATFORMS[platform]) return;
    url.searchParams.set('utm_source', 'padangrecords.net');
    url.searchParams.set('utm_medium', page());
    url.searchParams.set('utm_campaign', releaseSlugFor(a, url, platform));
    url.searchParams.set('utm_content', lang());
    var next = url.toString();
    if (next !== href) a.setAttribute('href', next);
  }

  function decorateAll(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.tagName === 'A') decorate(root);
    var links = root.querySelectorAll('a[href*="bandcamp.com"], a[href*="beatport.com"]');
    for (var i = 0; i < links.length; i++) decorate(links[i]);
  }

  // ── outbound_click ─────────────────────────────────────────────
  function onClick(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    decorate(a, true); // garante UTM atualizada (idioma do momento) antes da navegação
    var url = parse(a.href);
    if (!url) return;
    var platform = platformOf(url);
    if (!platform) return;
    send('outbound_click', {
      platform: platform,
      page: page(),
      release_slug: releaseSlugFor(a, url, platform),
      lang: lang(),
      link_url: url.origin + url.pathname
    });
  }
  // capture: roda antes do handler do popup do Bandcamp (index.html), que faz preventDefault
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);

  // ── language_selected ──────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.lang-switch [data-lang]') : null;
    if (!b) return;
    var to = b.getAttribute('data-lang');
    if (!to || to === lang()) return;
    send('language_selected', { lang: to, from_lang: lang(), page: page() });
  }, true);

  // ── embed_play (heurística: a janela perde o foco para um iframe) ──
  // Não há API nos embeds do Bandcamp; quando o usuário clica num iframe,
  // a janela dispara "blur" e document.activeElement passa a ser o iframe.
  // Conta 1x por iframe por pageview (play/pause repetidos não inflam).
  var seen = typeof WeakSet === 'function' ? new WeakSet() : null;
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var f = document.activeElement;
      if (!f || f.tagName !== 'IFRAME') return;
      if (seen) { if (seen.has(f)) return; seen.add(f); }
      var src = f.getAttribute('src') || '';
      var url = parse(src);
      if (!url) return;
      var platform = /bandcamp\.com$/.test(url.hostname) ? 'bandcamp' : platformOf(url);
      if (!platform) return;
      var m = src.match(/album=(\d+)/);
      var card = f.closest ? f.closest('[data-release], .r, .ep, .news, article') : null;
      var cardLink = card ? card.querySelector('a[href*="bandcamp.com/album/"]') : null;
      var slug = cardLink ? slugFromUrl(parse(cardLink.href), 'bandcamp') : null;
      if (!slug && card && card.hasAttribute('data-release')) slug = card.getAttribute('data-release');
      send('embed_play', {
        platform: platform,
        page: page(),
        release_slug: slug || pageReleaseSlug() || 'catalog',
        album_id: m ? m[1] : '',
        lang: lang()
      });
    }, 0);
  });

  // ── init ───────────────────────────────────────────────────────
  function init() {
    decorateAll(document);
    if (typeof MutationObserver !== 'function') return;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'attributes') decorate(m.target);
        for (var j = 0; j < m.addedNodes.length; j++) {
          if (m.addedNodes[j].nodeType === 1) decorateAll(m.addedNodes[j]);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.PADANG_TRACK = { send: send, page: page, lang: lang };
})();
