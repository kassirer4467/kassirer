/* Site chrome: title, top menu and footer are read from data/site.json.
   To add a page later, add an entry to "menu" there. */
(function () {
  'use strict';
  fetch('data/site.json')
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      var title = document.getElementById('site-title');
      var nav = document.getElementById('site-nav');
      var footer = document.getElementById('site-footer');
      if (cfg.siteTitle) { title.textContent = cfg.siteTitle; document.title = 'Gallery — ' + cfg.siteTitle; }
      if (footer && cfg.footer) footer.textContent = cfg.footer;
      var here = location.pathname.split('/').pop() || 'index.html';
      (cfg.menu || []).forEach(function (item) {
        var a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        if (item.href === here) a.setAttribute('aria-current', 'page');
        nav.appendChild(a);
      });
    })
    .catch(function () { /* header keeps its fallback text */ });
})();
