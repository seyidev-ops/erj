/* ERJ · alive layer (site-wide). Decorative only: nothing on any page
   depends on this file, and nothing is hidden waiting for it.
   - a scroll progress bar (skipped if the page already has one)
   - a drifting light behind the first section, except in lite mode
     (<html data-alive="lite">: portals and tools) */
(function () {
  'use strict';
  var html = document.documentElement;

  if (!document.querySelector('.ha-progress,.erj-progress')) {
    var bar = document.createElement('div');
    bar.className = 'erj-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    var upd = function () {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  if (html.getAttribute('data-alive') === 'lite') return;
  var hero = document.querySelector('main section, body > section');
  if (!hero || hero.querySelector('.ha-aurora,.erj-aurora') || hero.closest('.home-hero')) return;
  var a = document.createElement('div');
  a.className = 'erj-aurora';
  a.setAttribute('aria-hidden', 'true');
  a.innerHTML = '<i class="a1"></i><i class="a2"></i><i class="a3"></i>';
  hero.classList.add('erj-lit');
  hero.insertBefore(a, hero.firstChild);
})();
