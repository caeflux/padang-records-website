/* player.js — dock de reprodução compartilhado (home + catálogo).
 *
 * Os cards de release mostram só a capa (ver coverCards() no build-i18n.js).
 * Clicar no play NÃO troca a capa pelo iframe: abre/atualiza uma barra fixa no
 * rodapé com o embed compacto do Bandcamp (size=small, 42px), miniatura, título
 * e link. Um player por página; o card em reprodução recebe .playing.
 * Esc ou × fecham. Dispara embed_play no GA4 (track.js também conta o foco no iframe).
 */
(function () {
  'use strict';
  var dock = null, current = null;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function page() {
    var p = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    return p || 'index';
  }

  function close() {
    if (!dock) return;
    dock.remove(); dock = null;
    document.body.classList.remove('has-dock');
    if (current) { current.classList.remove('playing'); current = null; }
  }

  function open(btn) {
    var card = btn.closest('[data-release]') || btn.closest('.r');
    var id = btn.dataset.album, title = btn.dataset.title || '';
    if (!id) return;
    var img = btn.querySelector('img');
    var bc = card && card.querySelector('.ft a[href*="bandcamp.com"]');
    var slug = card && card.dataset.release || '';

    if (!dock) {
      dock = el('aside', 'dock');
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'player');
      document.body.appendChild(dock);
      document.body.classList.add('has-dock');
    }
    dock.dataset.release = slug;
    dock.innerHTML = '';
    var th = el('img', 'dk-th');
    th.alt = ''; th.width = 56; th.height = 56;
    if (img) th.src = img.currentSrc || img.src;
    var meta = el('div', 'dk-meta');
    var t = el('b', 'dk-t'); t.textContent = title; meta.appendChild(t);
    if (bc) {
      var a = el('a', 'dk-bc', '↳ bandcamp');
      a.href = bc.href; a.target = '_blank'; a.rel = 'noopener';
      meta.appendChild(a);
    }
    var emb = el('div', 'dk-emb');
    var f = document.createElement('iframe');
    f.src = 'https://bandcamp.com/EmbeddedPlayer/album=' + id + '/size=small/bgcol=181a1b/linkcol=c4ff3d/artwork=none/transparent=true/';
    f.setAttribute('seamless', ''); f.title = title; f.setAttribute('allow', 'autoplay');
    emb.appendChild(f);
    var x = el('button', 'dk-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'close');
    x.addEventListener('click', close);
    dock.appendChild(th); dock.appendChild(meta); dock.appendChild(emb); dock.appendChild(x);

    if (current) current.classList.remove('playing');
    current = card; if (current) current.classList.add('playing');

    if (typeof gtag === 'function') gtag('event', 'embed_play', {
      platform: 'bandcamp', page: page(), release_slug: slug, album_id: id,
      lang: document.documentElement.lang || 'pt'
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.emb.cov .pbtn');
    if (b) { e.preventDefault(); open(b); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dock) close();
  });
})();
