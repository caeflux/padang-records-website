/* player.js — dock de reprodução compartilhado (home + catálogo).
 *
 * Os cards de release mostram só a capa (ver coverCards() no build-i18n.js).
 * Clicar no play NÃO troca a capa pelo iframe: abre/atualiza uma barra fixa no
 * rodapé com o embed compacto do Bandcamp (size=small, 42px), miniatura, álbum,
 * faixa atual e a tracklist completa (títulos e durações vêm de /data/releases.json).
 * Clicar numa faixa recarrega o embed já nela (parâmetro t=N — o player pequeno
 * passa a mostrar o nome da faixa). O embed não avisa quando avança sozinho para a
 * próxima faixa, então o destaque segue a última escolhida pelo usuário.
 * Um player por página; o card em reprodução recebe .playing. Esc ou × fecham.
 * Dispara embed_play no GA4 (track.js também conta o foco no iframe).
 */
(function () {
  'use strict';
  var dock = null, current = null, album = null, trackN = 1, tlOpen = true;
  var byAlbum = null, loading = null;

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
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + pad(s % 60); }
  function src(id, n) {
    return 'https://bandcamp.com/EmbeddedPlayer/album=' + id +
      '/size=small/bgcol=181a1b/linkcol=c4ff3d/artwork=none/transparent=true/t=' + (n || 1) + '/';
  }

  // tracklists: um fetch por página, só no primeiro play
  function load() {
    if (loading) return loading;
    loading = fetch('/data/releases.json').then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) {
        byAlbum = {};
        (list || []).forEach(function (r) { if (r && r.album_id) byAlbum[String(r.album_id)] = r; });
        return byAlbum;
      });
    return loading;
  }

  function fit() {
    if (dock) document.body.style.paddingBottom = (dock.offsetHeight + 16) + 'px';
  }
  function close() {
    if (!dock) return;
    dock.remove(); dock = null; album = null;
    document.body.classList.remove('has-dock');
    document.body.style.paddingBottom = '';
    if (current) { current.classList.remove('playing'); current = null; }
  }

  function markTrack() {
    if (!dock) return;
    var tr = null;
    album.tracks.forEach(function (t) { if (t.n === trackN) tr = t; });
    dock.querySelector('.dk-now').textContent = tr ? pad(trackN) + ' · ' + tr.title : album.title;
    dock.querySelectorAll('.dk-tl li').forEach(function (li) {
      li.classList.toggle('on', +li.dataset.n === trackN);
    });
  }
  function play(n) {
    trackN = n;
    var f = dock.querySelector('iframe');
    var next = src(album.id, n);
    if (f.src !== next) f.src = next;
    markTrack();
  }

  function build(slug, thumbSrc) {
    if (!dock) {
      dock = el('aside', 'dock');
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'player');
      document.body.appendChild(dock);
      document.body.classList.add('has-dock');
    }
    dock.dataset.release = slug || '';
    dock.classList.toggle('open', tlOpen && album.tracks.length > 0);
    dock.innerHTML = '';

    var bar = el('div', 'dk-bar');
    var th = el('img', 'dk-th'); th.alt = ''; th.width = 56; th.height = 56;
    if (thumbSrc) th.src = thumbSrc;
    var meta = el('div', 'dk-meta');
    var al = album.url ? el('a', 'dk-al', album.title) : el('span', 'dk-al', album.title);
    if (album.url) { al.href = album.url; al.target = '_blank'; al.rel = 'noopener'; }
    meta.appendChild(al);
    meta.appendChild(el('b', 'dk-now', ''));
    var emb = el('div', 'dk-emb');
    var f = document.createElement('iframe');
    f.src = src(album.id, trackN);
    f.setAttribute('seamless', ''); f.title = album.title; f.setAttribute('allow', 'autoplay');
    emb.appendChild(f);
    var tg = el('button', 'dk-tg', 'tracklist');
    tg.type = 'button'; tg.setAttribute('aria-label', 'tracklist');
    tg.setAttribute('aria-expanded', String(dock.classList.contains('open')));
    tg.addEventListener('click', function () {
      tlOpen = !dock.classList.contains('open');
      dock.classList.toggle('open', tlOpen);
      tg.setAttribute('aria-expanded', String(tlOpen));
      fit();
    });
    if (!album.tracks.length) tg.hidden = true;
    var x = el('button', 'dk-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'close');
    x.addEventListener('click', close);
    bar.appendChild(th); bar.appendChild(meta); bar.appendChild(emb); bar.appendChild(tg); bar.appendChild(x);
    dock.appendChild(bar);

    if (album.tracks.length) {
      var ol = el('ol', 'dk-tl');
      album.tracks.forEach(function (t) {
        var li = el('li'); li.dataset.n = t.n;
        var b = el('button'); b.type = 'button';
        b.appendChild(el('span', 'n', pad(t.n)));
        b.appendChild(el('span', 't', t.title));
        b.appendChild(el('span', 'd', fmt(t.duration)));
        b.addEventListener('click', function () { play(t.n); });
        li.appendChild(b); ol.appendChild(li);
      });
      dock.appendChild(ol);
    }
    markTrack();
    fit();
  }

  function open(btn) {
    var card = btn.closest('[data-release]') || btn.closest('.r');
    var id = btn.dataset.album, title = btn.dataset.title || '';
    if (!id) return;
    var img = btn.querySelector('img');
    var bc = card && card.querySelector('.ft a[href*="bandcamp.com"]');
    var slug = (card && card.dataset.release) || '';
    var same = album && album.id === id;

    if (current && current !== card) current.classList.remove('playing');
    current = card; if (current) current.classList.add('playing');

    load().then(function (map) {
      if (same && dock) return; // já está no dock: não reinicia a faixa
      var r = map[id];
      trackN = 1;
      album = {
        id: id,
        title: r ? ((r.artist || 'Various Artists') + ' — ' + r.title) : title,
        url: (bc && bc.href) || (r && r.url) || null,
        tracks: (r && r.tracklist) ? r.tracklist.slice() : []
      };
      build(slug, img ? (img.currentSrc || img.src) : '');
      if (typeof gtag === 'function') gtag('event', 'embed_play', {
        platform: 'bandcamp', page: page(), release_slug: slug, album_id: id,
        lang: document.documentElement.lang || 'pt'
      });
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.emb.cov .pbtn');
    if (b) { e.preventDefault(); open(b); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dock) close();
  });
  window.addEventListener('resize', fit);
})();
