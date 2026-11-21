// Paper clips play while they're on screen; clicking one opens the full video.
(function () {
  'use strict';

  var teasers = Array.prototype.slice.call(document.querySelectorAll('video.teaser'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster frame stays */ });
  }

  if (!reduceMotion && teasers.length) {
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) play(e.target); else e.target.pause();
        });
      }, { threshold: 0.25 });
      teasers.forEach(function (v) { seen.observe(v); });
    } else {
      teasers.forEach(play);
    }
  }

  var player = document.getElementById('player');
  if (!player || typeof player.showModal !== 'function') return;

  var video = player.querySelector('video');
  var title = document.getElementById('player-title');
  var opener = null;

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-video]');
    if (!link) return;
    e.preventDefault();
    opener = link;
    title.textContent = link.getAttribute('data-title') || '';
    video.setAttribute('poster', link.getAttribute('data-poster') || '');
    video.src = link.getAttribute('data-video');
    player.showModal();
    video.focus();
    play(video);
  });

  // Close with the button, a click on the dark area around the player, or Esc.
  player.addEventListener('click', function (e) {
    if (e.target === player || e.target.closest('[data-close]')) player.close();
  });

  // Stop playback and the download whenever the player closes.
  player.addEventListener('close', function () {
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (opener) opener.focus();
  });
})();
