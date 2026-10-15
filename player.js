/* player.js — player dentro do card + dock fino (home + catálogo).
 *
 * Os cards de release mostram só a capa (ver coverCards() no build-i18n.js).
 * Clicar no play troca a capa pelo embed grande do Bandcamp (controles, seek,
 * prev/next e a tracklist inteira — ele destaca a faixa atual e avança sozinho);
 * o card ganha .playing e ocupa 2×2 na grade para a lista caber.
 * Só um embed existe por vez: abrir outro card devolve a capa ao anterior (o que
 * para o áudio dele). O dock é uma faixa fina no rodapé com a capa pequena e
 * "now playing // artista — álbum"; clicar nela rola até o card; × para e fecha.
 * O embed não expõe a faixa atual à página (só manda "playerinited"), por isso o
 * dock mostra o álbum. Dispara embed_play no GA4 (track.js também conta o foco no iframe).
 */
(function () {
  'use strict';
  var dock = null, current = null, saved = null; // saved = HTML da capa do card atual

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
      '/size=large/bgcol=0e0c0a/linkcol=c4ff3d/tracklist=true/artwork=none/transparent=true/';
  }

  function restore() {
    if (!current) return;
    var box = current.querySelector('.emb.cov');
    if (box && saved != null) { box.innerHTML = saved; box.classList.remove('on'); }
    current.classList.remove('playing');
    current = null; saved = null;
  }
  function stop() {
    restore();
    if (dock) { dock.remove(); dock = null; }
    document.body.classList.remove('has-dock');
  }

  function showDock(title, thumbSrc) {
    if (!dock) {
      dock = el('aside', 'dock');
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'now playing');
      document.body.appendChild(dock);
      document.body.classList.add('has-dock');
    }
    dock.innerHTML = '';
    var th = el('img', 'dk-th'); th.alt = ''; th.width = 32; th.height = 32;
    if (thumbSrc) th.src = thumbSrc;
    var go = el('button', 'dk-go'); go.type = 'button'; go.title = 'go to album';
    go.appendChild(el('span', 'dk-np', 'now playing //'));
    go.appendChild(el('b', 'dk-al', title));
    go.addEventListener('click', function () {
      if (current) current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    var x = el('button', 'dk-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'stop'); x.title = 'stop';
    x.addEventListener('click', stop);
    dock.appendChild(th); dock.appendChild(go); dock.appendChild(x);
  }

  function play(btn) {
    var card = btn.closest('[data-release]') || btn.closest('.r');
    var box = btn.closest('.emb.cov');
    var id = btn.dataset.album, title = btn.dataset.title || '';
    if (!id || !card || !box) return;
    var img = btn.querySelector('img');
    var thumb = img ? (img.currentSrc || img.src) : '';
    var slug = card.dataset.release || '';

    if (current && current !== card) restore();
    saved = box.innerHTML;
    current = card;

    var f = document.createElement('iframe');
    f.src = src(id);
    f.setAttribute('seamless', ''); f.title = title; f.setAttribute('allow', 'autoplay');
    box.innerHTML = ''; box.appendChild(f); box.classList.add('on');
    card.classList.add('playing');
    showDock(title, thumb);
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (typeof gtag === 'function') gtag('event', 'embed_play', {
      platform: 'bandcamp', page: page(), release_slug: slug, album_id: id,
      lang: document.documentElement.lang || 'pt'
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.emb.cov .pbtn');
    if (b) { e.preventDefault(); play(b); }
  });
})();
