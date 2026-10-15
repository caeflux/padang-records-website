/* player.js — dock de reprodução compartilhado (home + catálogo).
 *
 * Os cards de release mostram só a capa (ver coverCards() no build-i18n.js).
 * Clicar no play NÃO troca a capa pelo iframe: abre/atualiza uma barra fixa no
 * rodapé com o embed GRANDE do Bandcamp sem capa (size=large/artwork=none), que
 * traz play/pause, barra de progresso clicável, faixa anterior/próxima e a
 * tracklist (destaca a faixa atual e avança sozinho).
 *
 * Três estados (classe no .dock):
 *   compacto  — iframe com 120px: só os controles
 *   .open     — iframe com 320px: controles + tracklist (rola dentro do embed)
 *   .min      — iframe com 0px: sobra a barra; o áudio continua tocando
 * O × para de vez (remove o iframe). Um player por página; o card em reprodução
 * recebe .playing. Esc minimiza. Dispara embed_play no GA4 (track.js também conta
 * o foco no iframe).
 */
(function () {
  'use strict';
  var dock = null, current = null, albumId = null, open = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function page() {
    var p = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    return p || 'index';
  }
  function src(id) {
    return 'https://bandcamp.com/EmbeddedPlayer/album=' + id +
      '/size=large/bgcol=181a1b/linkcol=c4ff3d/tracklist=true/artwork=none/transparent=true/';
  }

  // padding do body acompanha a altura real do dock
  function fit() {
    if (!dock) return;
    document.body.style.paddingBottom = (dock.offsetHeight + 16) + 'px';
  }
  function setState() {
    if (!dock) return;
    var min = dock.classList.contains('min');
    dock.classList.toggle('open', open && !min);
    dock.querySelector('.dk-tg').setAttribute('aria-expanded', String(open && !min));
    dock.querySelector('.dk-tg').hidden = min;
    var mb = dock.querySelector('.dk-mn');
    mb.setAttribute('aria-label', min ? 'show player' : 'hide player');
    mb.title = min ? 'show player' : 'hide player (keeps playing)';
    fit();
  }
  function minimize(on) {
    if (!dock) return;
    dock.classList.toggle('min', on);
    setState();
  }
  function stop() {
    if (!dock) return;
    dock.remove(); dock = null; albumId = null;
    document.body.classList.remove('has-dock');
    document.body.style.paddingBottom = '';
    if (current) { current.classList.remove('playing'); current = null; }
  }

  function build(id, title, url, slug, thumbSrc) {
    if (!dock) {
      dock = el('aside', 'dock');
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'player');
      document.body.appendChild(dock);
      document.body.classList.add('has-dock');
    }
    dock.dataset.release = slug || '';
    dock.classList.remove('min');
    dock.innerHTML = '';

    var bar = el('div', 'dk-bar');
    var th = el('img', 'dk-th'); th.alt = ''; th.width = 56; th.height = 56;
    if (thumbSrc) th.src = thumbSrc;
    var meta = el('div', 'dk-meta');
    meta.appendChild(el('span', 'dk-np', 'now playing //'));
    var al = url ? el('a', 'dk-al', title) : el('span', 'dk-al', title);
    if (url) { al.href = url; al.target = '_blank'; al.rel = 'noopener'; }
    meta.appendChild(al);

    var tg = el('button', 'dk-tg', 'tracklist');
    tg.type = 'button'; tg.setAttribute('aria-label', 'tracklist');
    tg.addEventListener('click', function () { open = !open; setState(); });
    var mn = el('button', 'dk-mn', '');
    mn.type = 'button';
    mn.addEventListener('click', function () { minimize(!dock.classList.contains('min')); });
    var x = el('button', 'dk-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'stop'); x.title = 'stop';
    x.addEventListener('click', stop);
    bar.appendChild(th); bar.appendChild(meta); bar.appendChild(tg); bar.appendChild(mn); bar.appendChild(x);

    var emb = el('div', 'dk-emb');
    var f = document.createElement('iframe');
    f.src = src(id);
    f.setAttribute('seamless', ''); f.title = title; f.setAttribute('allow', 'autoplay');
    emb.appendChild(f);

    dock.appendChild(bar); dock.appendChild(emb);
    setState();
  }

  function play(btn) {
    var card = btn.closest('[data-release]') || btn.closest('.r');
    var id = btn.dataset.album, title = btn.dataset.title || '';
    if (!id) return;
    var img = btn.querySelector('img');
    var bc = card && card.querySelector('.ft a[href*="bandcamp.com"]');
    var slug = (card && card.dataset.release) || '';

    if (current && current !== card) current.classList.remove('playing');
    current = card; if (current) current.classList.add('playing');

    if (dock && albumId === id) { minimize(false); return; } // mesmo álbum: só traz o player de volta
    albumId = id;
    build(id, title, bc ? bc.href : null, slug, img ? (img.currentSrc || img.src) : '');
    if (typeof gtag === 'function') gtag('event', 'embed_play', {
      platform: 'bandcamp', page: page(), release_slug: slug, album_id: id,
      lang: document.documentElement.lang || 'pt'
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.emb.cov .pbtn');
    if (b) { e.preventDefault(); play(b); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dock && !dock.classList.contains('min')) minimize(true);
  });
  window.addEventListener('resize', fit);
})();
