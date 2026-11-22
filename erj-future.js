/* ERJ · buttons stay on one line. Every button label is kept on a single line
   (nowrap) and, when the button is too narrow for it, the font steps down
   (never below 11.5px) until it fits. Runs on every screen size, also on
   buttons that appear later (scan results). Without JS a long label simply wraps. */
(function () {
  'use strict';
  var SEL = '.btn-primary-ui,.btn-secondary-ui,.btn-yes,.btn-more,.btn-block,.cap-go,.csc-go,.cap-dl-btn,.cap-btn,.iv-buy,.bn-cta,.eb-btn2,.p-add,.csc-start,.eb-btn,.cvfix-alt-btn';
  var MIN = 11.5, timer = 0;
  /* some pages set white-space:normal on the label span, so nowrap goes on the whole button, children included */
  var st = document.createElement('style');
  st.id = 'erjFitCss';
  st.textContent = SEL.split(',').map(function (x) { return x + ',' + x + ' *'; }).join(',') + '{white-space:nowrap!important;}';
  (document.head || document.documentElement).appendChild(st);
  function fitOne(el) {
    /* fit once per screen width: refitting on every page change made labels
       grow and shrink while counters ticked and bars slid in (it read as a zoom) */
    if (el.__erjFitW === window.innerWidth && el.__erjFitT === el.textContent) return;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || !el.getClientRects().length) return;
    el.__erjFitW = window.innerWidth; el.__erjFitT = el.textContent;
    el.style.removeProperty('font-size');
    var size = parseFloat(getComputedStyle(el).fontSize), guard = 0;
    var par = el.parentElement;
    var tooWide = function () {
      var r = el.getBoundingClientRect();
      return el.scrollWidth > el.clientWidth + 1 ||
        (par && r.width > par.getBoundingClientRect().width + 1) ||
        r.right > window.innerWidth - 4;
    };
    while (tooWide() && size > MIN && guard++ < 30) { size -= 0.5; el.style.setProperty('font-size', size + 'px', 'important'); }
  }
  function fitAll() {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) fitOne(list[i]);
  }
  function later() { clearTimeout(timer); timer = setTimeout(fitAll, 120); }
  window.erjFitButtons = fitAll;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fitAll); else fitAll();
  addEventListener('load', fitAll);
  addEventListener('resize', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  if (window.MutationObserver) {
    new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  }
})();

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
