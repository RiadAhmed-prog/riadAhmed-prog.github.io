// Riad Ahmed — site behavior: theme toggle, phone menu, active nav link,
// and the video dialog. Everything degrades gracefully without JavaScript:
// video triggers are plain links to the .mp4 files.
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return systemDark && systemDark.matches ? 'dark' : 'light';
  }

  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = effectiveTheme() === 'dark';
    themeBtn.classList.toggle('is-dark', dark);
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      syncThemeButton();
    });
    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener('change', syncThemeButton);
    }
    syncThemeButton();
  }

  /* ---------- Phone menu ---------- */
  var nav = document.getElementById('site-nav');
  var menuBtn = document.querySelector('.menu-toggle');

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenu(false);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  /* ---------- Highlight the nav link of the section in view ---------- */
  if ('IntersectionObserver' in window && nav) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.remove('active'); });
        var link = links[entry.target.id];
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Video dialog ---------- */
  var modal = document.getElementById('video-modal');
  var canUseDialog = modal && typeof modal.showModal === 'function';

  if (canUseDialog) {
    var video = modal.querySelector('video');
    var title = modal.querySelector('#video-modal-title');
    var download = modal.querySelector('[data-download]');
    var lastTrigger = null;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-video]');
      if (!trigger) return;
      e.preventDefault();
      lastTrigger = trigger;
      var src = trigger.getAttribute('data-video');
      title.textContent = trigger.getAttribute('data-title') || 'Video';
      download.setAttribute('href', src);
      var poster = trigger.getAttribute('data-poster');
      if (poster) video.setAttribute('poster', poster); else video.removeAttribute('poster');
      video.src = src;
      modal.showModal();
      video.focus(); // keyboard users land on the player, so Space toggles playback
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { /* autoplay blocked; controls remain */ });
    });

    // Close on the X button or a click on the dark backdrop.
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close]')) modal.close();
    });

    // Stop playback and the download whenever the dialog closes (X, backdrop, Esc).
    modal.addEventListener('close', function () {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (lastTrigger) lastTrigger.focus();
    });
  }
})();
