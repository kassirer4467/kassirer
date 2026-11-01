/* Gallery: reads data/paintings.json, builds the left menu, the 4-per-row grid and the viewer.
   This file never needs editing to add paintings or galleries. */
(function () {
  'use strict';

  var DATA_URL = 'data/paintings.json';
  var SALE_URL = 'data/sale.json';
  // sale.html sets <body data-list="sale">: it shows ONE list (data/sale.json) with no page limit.
  var SALE = document.body.getAttribute('data-list') === 'sale';
  var FULL_DIR = 'images/full/';
  var THUMB_DIR = 'images/thumbs/';
  var DEFAULT_PER_PAGE = 16;

  var galleries = [], gallery = null, paintings = [], perPage = DEFAULT_PER_PAGE, page = 1, current = -1, lastFocus = null;

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('gallery'), statusEl = $('status'), lb = $('lightbox'), menu = $('gallery-menu'), layout = $('layout');
  var lbImg = $('lb-img'), lbCap = $('lb-caption'), lbPrev = $('lb-prev'), lbNext = $('lb-next'), lbClose = $('lb-close');
  var pagers = document.querySelectorAll('.pager');

  // Wrap the large image in a frame so the "sold" marker can sit on the painting's corner.
  var lbFrame = document.createElement('div');
  lbFrame.className = 'lb-frame';
  lbImg.parentNode.insertBefore(lbFrame, lbImg);
  lbFrame.appendChild(lbImg);
  function isSold(p) { return p.sold === true; }

  // A bare filename is looked up in the images folder; a path or URL is used as-is.
  function resolve(dir, name) { return /^(https?:)?\/|^\.{0,2}\//.test(name) ? name : dir + encodeURI(name); }
  function dirFor(base, p) {
    var f = p && p._folder != null ? p._folder : (gallery && gallery.folder);
    return f ? base + String(f).replace(/^\/+|\/+$/g, '') + '/' : base;
  }
  function fullSrc(p) { return resolve(dirFor(FULL_DIR, p), p.image); }
  function thumbSrc(p) { return p.thumb ? resolve(dirFor(THUMB_DIR, p), p.thumb) : fullSrc(p); }
  function altText(p) { return p.alt || p.title || 'Painting'; }
  function pageCount() { return Math.max(1, Math.ceil(paintings.length / perPage)); }
  function params() { return new URLSearchParams(location.search); }
  function pageFromUrl() {
    var n = parseInt(params().get('page'), 10);
    return n >= 1 && n <= pageCount() ? n : 1;
  }
  function galleryFromUrl() {
    var id = params().get('gallery');
    return galleries.filter(function (g) { return g._id === id; })[0] || galleries[0];
  }
  function urlFor(n) {
    var q = new URLSearchParams();
    q.set('gallery', gallery._id);
    if (n > 1) q.set('page', n);
    return '?' + q.toString();
  }

  /* ---------- Left menu ---------- */
  function renderMenu(title) {
    menu.textContent = '';
    if (SALE) {
      var st = document.createElement('h2');
      st.className = 'side-title';
      st.textContent = gallery.title || 'Sale';
      menu.appendChild(st);
      return;
    }
    if (galleries.length < 2) { menu.hidden = true; layout.classList.add('no-menu'); return; }
    var h = document.createElement('h2');
    h.className = 'side-title';
    h.textContent = title;
    var ul = document.createElement('ul');
    galleries.forEach(function (g) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '?gallery=' + encodeURIComponent(g._id);
      a.textContent = g.title || g._id;
      a.dir = 'auto';
      if (g === gallery) a.setAttribute('aria-current', 'page');
      li.appendChild(a);
      ul.appendChild(li);
    });
    menu.appendChild(h);
    menu.appendChild(ul);
  }

  /* ---------- Grid ---------- */
  function renderGrid() {
    grid.textContent = '';
    var start = (page - 1) * perPage;
    paintings.slice(start, start + perPage).forEach(function (p, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.dataset.index = start + i;
      btn.setAttribute('aria-label', 'View larger: ' + (p.title || altText(p)) + (isSold(p) ? ' (sold)' : ''));
      if (isSold(p)) btn.classList.add('is-sold');
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = thumbSrc(p);
      img.alt = altText(p);
      if (p.focus) img.style.objectPosition = p.focus;   // optional crop focus, e.g. "50% 30%"
      btn.appendChild(img);
      li.appendChild(btn);
      grid.appendChild(li);
    });
    statusEl.textContent = paintings.length ? '' : 'No paintings yet. Add entries to ' + (SALE ? 'data/sale.json' : 'data/paintings.json') + '.';
    renderPagers();
  }

  function pageLink(n, label, extra) {
    var a = document.createElement('a');
    a.href = urlFor(n);
    a.dataset.page = n;
    a.textContent = label || n;
    if (extra) a.setAttribute('aria-label', extra);
    return a;
  }
  function disabled(label) {
    var s = document.createElement('span');
    s.className = 'is-disabled';
    s.textContent = label;
    return s;
  }
  function renderPagers() {
    var total = pageCount();
    pagers.forEach(function (nav) {
      nav.textContent = '';
      if (total < 2) return;
      nav.appendChild(page > 1 ? pageLink(page - 1, 'Previous', 'Previous page') : disabled('Previous'));
      for (var n = 1; n <= total; n++) {
        var a = pageLink(n, n, 'Page ' + n);
        if (n === page) a.setAttribute('aria-current', 'page');
        nav.appendChild(a);
      }
      nav.appendChild(page < total ? pageLink(page + 1, 'Next', 'Next page') : disabled('Next'));
    });
  }

  function goToPage(n, push) {
    page = n;
    renderGrid();
    if (push === 'push') history.pushState({}, '', urlFor(n));
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.pager a');
    if (link) {
      e.preventDefault();
      goToPage(parseInt(link.dataset.page, 10), 'push');
      window.scrollTo(0, 0);
      return;
    }
    var thumb = e.target.closest('.thumb');
    if (thumb) openViewer(parseInt(thumb.dataset.index, 10), thumb);
  });
  window.addEventListener('popstate', function () { goToPage(pageFromUrl()); });

  /* ---------- Viewer ---------- */
  function openViewer(index, trigger) {
    lastFocus = trigger || document.activeElement;
    lb.hidden = false;
    document.body.classList.add('lb-open');
    show(index);
    lbClose.focus();
  }

  function show(index) {
    if (index < 0 || index >= paintings.length) return;
    current = index;
    var p = paintings[index];
    lbImg.classList.add('is-loading');
    lbImg.onload = function () { lbImg.classList.remove('is-loading'); };
    lbImg.onerror = function () { lbImg.classList.remove('is-loading'); };
    lbImg.alt = altText(p) + (isSold(p) ? ' (sold)' : '');
    lbFrame.classList.toggle('is-sold', isSold(p));
    lbImg.src = fullSrc(p);              // the large file loads only now

    lbCap.textContent = '';
    if (p.title) { var t = document.createElement('span'); t.className = 'lb-title'; t.textContent = p.title; t.dir = 'auto'; lbCap.appendChild(t); }
    if (p.caption) { var c = document.createElement('span'); c.textContent = p.caption; c.dir = 'auto'; lbCap.appendChild(c); }

    lbPrev.disabled = index === 0;
    lbNext.disabled = index === paintings.length - 1;
    [index - 1, index + 1].forEach(function (i) { if (paintings[i]) new Image().src = fullSrc(paintings[i]); });
  }

  function closeViewer() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    lbImg.removeAttribute('src');
    // If the visitor browsed to a painting on another page of this gallery, follow it.
    var target = Math.floor(current / perPage) + 1;
    if (target !== page) goToPage(target, 'push');
    var el = grid.querySelector('[data-index="' + current + '"]');
    (el || lastFocus || document.body).focus();
  }

  function step(d) { show(current + d); }

  lbClose.addEventListener('click', closeViewer);
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (!e.target.closest('img, figcaption, button')) closeViewer(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {          // keep focus inside the viewer
      var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.disabled; });
      var i = f.indexOf(document.activeElement);
      var next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      f[next].focus();
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
  });

  var tx = 0, ty = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- Load ---------- */
  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }

  // Sale list: each entry is {"image": "..."} plus optional fields. If the image is also in a Gallery, that
  // painting's title/caption/alt/sold are used automatically; any non-empty field in the Sale entry overrides them.
  function buildSale(sale, gals) {
    var index = {};
    gals.forEach(function (g) {
      g.paintings.forEach(function (p) {
        if (!Object.prototype.hasOwnProperty.call(index, p.image)) index[p.image] = { p: p, folder: g.folder };
      });
    });
    var items = (Array.isArray(sale) ? sale : (sale.paintings || [])).filter(function (e) { return e && e.image; }).map(function (e) {
      var out = {}, base = Object.prototype.hasOwnProperty.call(index, e.image) ? index[e.image] : null, k;
      if (base) {
        for (k in base.p) out[k] = base.p[k];
        if (base.folder != null) out._folder = base.folder;
      }
      for (k in e) if (e[k] !== '' && e[k] != null) out[k] = e[k];
      return out;
    });
    return { _id: 'sale', title: (!Array.isArray(sale) && sale.title) || 'Sale', paintings: items };
  }

  Promise.all([getJSON(DATA_URL), SALE ? getJSON(SALE_URL) : null])
    .then(function (res) {
      var data = res[0];
      var list = Array.isArray(data.galleries) ? data.galleries
        : [{ id: 'all', title: 'Gallery', paintings: Array.isArray(data) ? data : (data.paintings || []) }];
      galleries = list.filter(Boolean).map(function (g, i) {
        g.paintings = (g.paintings || []).filter(function (p) { return p && p.image; });
        g._id = String(g.id != null ? g.id : i + 1);
        return g;
      });
      if (!galleries.length) throw new Error('no galleries');
      if (SALE) galleries = [buildSale(res[1], galleries)];
      perPage = SALE ? 1e9 : (parseInt(data.perPage, 10) || DEFAULT_PER_PAGE);   // Sale: everything on one page
      gallery = galleryFromUrl();
      paintings = gallery.paintings;
      page = pageFromUrl();
      $('gallery-title').textContent = gallery.title || 'Gallery';
      renderMenu(data.menuTitle || 'Galleries');
      renderGrid();
    })
    .catch(function () {
      statusEl.textContent = 'Could not load ' + (SALE ? 'data/sale.json or ' : '') + 'data/paintings.json. Check that the files exist and are valid JSON (and serve the site over http, not file://).';
    });
})();
