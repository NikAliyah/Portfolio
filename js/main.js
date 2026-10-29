(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme toggle (remembers the choice) ---------- */
  var themeBtn = document.getElementById('theme-toggle');

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncThemeButton() {
    var isDark = currentTheme() === 'dark';
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    syncThemeButton();
  });
  syncThemeButton();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function (a) {
          var active = a.getAttribute('href') === id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Project filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var projects = Array.prototype.slice.call(document.querySelectorAll('.project'));
  var emptyMsg = document.getElementById('no-projects');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      var shown = 0;

      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      projects.forEach(function (p) {
        var match = f === 'all' || p.getAttribute('data-cat') === f;
        p.hidden = !match;
        if (match) shown++;
      });

      emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- Diagram: trace relationships on hover or focus ---------- */
  var tables = Array.prototype.slice.call(document.querySelectorAll('.erd .tbl'));
  var rels = Array.prototype.slice.call(document.querySelectorAll('.erd .rel'));

  function relatedTo(name) {
    var set = {};
    set[name] = true;
    rels.forEach(function (r) {
      var pair = r.getAttribute('data-between').split(' ');
      if (pair.indexOf(name) !== -1) pair.forEach(function (p) { set[p] = true; });
    });
    return set;
  }

  function trace(name) {
    var related = relatedTo(name);
    tables.forEach(function (t) {
      t.classList.toggle('is-dim', !related[t.getAttribute('data-table')]);
    });
    rels.forEach(function (r) {
      var inPair = r.getAttribute('data-between').split(' ').indexOf(name) !== -1;
      r.classList.toggle('is-on', inPair);
      r.classList.toggle('is-dim', !inPair);
    });
  }

  function clearTrace() {
    tables.forEach(function (t) { t.classList.remove('is-dim'); });
    rels.forEach(function (r) { r.classList.remove('is-on', 'is-dim'); });
  }

  tables.forEach(function (t) {
    var name = t.getAttribute('data-table');
    t.addEventListener('mouseenter', function () { trace(name); });
    t.addEventListener('mouseleave', clearTrace);
    t.addEventListener('focus', function () { trace(name); });
    t.addEventListener('blur', clearTrace);
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');

    function done(ok) {
      showToast(ok ? 'Email address copied' : 'Could not copy. Select the address above instead.');
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallbackCopy(email)); });
    } else {
      done(fallbackCopy(email));
    }
  });

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById('to-top');

  function onScroll() {
    toTop.hidden = window.scrollY < 700;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
