/* ERJ · Horizon (site-wide). Decorative only: nothing on any page
   depends on this file, and nothing is hidden waiting for it.
   - a soft light that follows the pointer (wide screens, fine pointer)
   - cards light up where the pointer is (sets --mx / --my on the card)
   - primary buttons lean towards the pointer
   Off for <html data-alive="lite"> and prefers-reduced-motion. */
(function () {
  'use strict';
  var html = document.documentElement;
  if (html.getAttribute('data-alive') === 'lite') return;
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)').matches) return;

  var CARDS = '.card,.price-card,.track-card,.pcard,.vc,.mini-t,.fc-proof-card,.ts-card,.cmp-row,' +
              '.jb-card,.jb-cat,.ld-row,.hs-item,.rt-block,.faq details,.jt-card,.stat-card,.hs-card,.htd-card,.tb,.pd';
  var MAGNETS = '.btn-primary-ui,.btn-yes,.btn-pay';

  var glow = document.createElement('div');
  glow.className = 'hz-cursor';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  var x = -999, y = -999, queued = false, card = null, magnet = null;
  function frame() {
    queued = false;
    glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (x - r.left) + 'px');
      card.style.setProperty('--my', (y - r.top) + 'px');
    }
    if (magnet) {
      var m = magnet.getBoundingClientRect();
      var dx = (x - (m.left + m.width / 2)) / m.width, dy = (y - (m.top + m.height / 2)) / m.height;
      magnet.style.translate = (dx * 6).toFixed(1) + 'px ' + (dy * 5).toFixed(1) + 'px';
    }
  }
  addEventListener('pointermove', function (e) {
    x = e.clientX; y = e.clientY;
    var t = e.target && e.target.closest ? e.target : null;
    var c = t && t.closest(CARDS);
    if (c !== card) {
      if (card) { card.style.removeProperty('--mx'); card.style.removeProperty('--my'); }
      card = c;
    }
    var m = t && t.closest(MAGNETS);
    if (m !== magnet) {
      if (magnet) magnet.style.translate = '';
      magnet = m;
    }
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { x = y = -999; if (!queued) { queued = true; requestAnimationFrame(frame); } });
})();
