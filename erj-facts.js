/* ═══════════════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB · FACTS RENDERER

   Pages must never hard-code a price, a cohort date, a phone number,
   a product name or a line from the diagnostic model. They mark the
   spot and this module fills it from ERJ_CONFIG.canon at runtime:

     <span data-erj="price.foundation"></span>        → ₦250,000
     <span data-erj="was.foundation"></span>          → ₦370,000
     <span data-erj="save.foundation"></span>         → ₦120,000
     <span data-erj="name.selflearn"></span>          → The Self-Learn Pack
     <span data-erj="cohort.number"></span>           → 11
     <span data-erj="cohort.closesDisplay"></span>    → Sat 31 Oct · 8:00 PM WAT
     <span data-erj="model.03.label"></span>          → Representation
     <span data-erj="model.03.line"></span>           → If your CV can't be read…
     <span data-erj="figures.placed"></span>          → 382+
     <span data-erj="org.pledge"></span>              → We will not let you go…
     <span data-erj="credit.selflearn-to-foundation"></span>
     <a   data-erj-href="pay.foundation">Buy now</a>
     <a   data-erj-href="whatsapp">Message us</a>

   Change a price in erj-config.js and every surface follows on the
   next load. Nothing drifts, because nothing is written twice.

   Load AFTER erj-config.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var C = (window.ERJ_CONFIG || {}).canon;
  if (!C) return;

  var naira = '\u20a6';

  function money(n) {
    return naira + Number(n).toLocaleString('en-NG');
  }

  function product(id) {
    for (var i = 0; i < C.products.length; i++) {
      if (C.products[i].id === id) return C.products[i];
    }
    return null;
  }

  function part(n) {
    for (var i = 0; i < C.model.parts.length; i++) {
      if (C.model.parts[i].n === n || C.model.parts[i].key === n) return C.model.parts[i];
    }
    return null;
  }

  function credit(id) {
    for (var i = 0; i < C.credits.length; i++) {
      if (C.credits[i].id === id) return C.credits[i];
    }
    return null;
  }

  function resolve(key) {
    var bits = key.split('.');
    var head = bits[0], tail = bits.slice(1).join('.');
    var p;

    switch (head) {
      case 'price':
        p = product(tail);
        return p ? money(p.naira) : null;

      case 'was':
        p = product(tail);
        return (p && p.wasNaira) ? money(p.wasNaira) : null;

      case 'save':
        p = product(tail);
        return (p && p.wasNaira) ? money(p.wasNaira - p.naira) : null;

      case 'name':
        p = product(tail);
        return p ? p.name : null;

      case 'badge':
        p = product(tail);
        return (p && p.badge) ? p.badge : null;

      case 'part':
        p = product(tail);
        if (!p) return null;
        var mp = part(p.part);
        return mp ? mp.label : null;

      case 'cohort':
        return C.cohort[tail] != null ? String(C.cohort[tail]) : null;

      case 'figures':
        return C.figures[tail] != null ? String(C.figures[tail]) : null;

      case 'org':
        return C.org[tail] != null ? String(C.org[tail]) : null;

      case 'model':
        if (tail === 'name') return C.model.name;
        if (tail === 'instruction') return C.model.instruction;
        var seg = tail.split('.');
        var mm = part(seg[0]);
        return mm ? (mm[seg[1]] || null) : null;

      case 'credit':
        var c = credit(tail);
        return c ? c.line : null;

      case 'whatsapp':
        return C.lines.officialDisplay;

      default:
        return null;
    }
  }

  function resolveHref(key) {
    var bits = key.split('.');
    var head = bits[0], tail = bits.slice(1).join('.');
    var p;

    if (head === 'whatsapp') return 'https://wa.me/' + C.lines.official;
    if (head === 'pay')  { p = product(tail); return p ? p.pay  : null; }
    if (head === 'page') { p = product(tail); return p ? p.href : null; }
    if (head === 'instalment') return C.cohort.instalmentHref;
    return null;
  }

  function paint(root) {
    var scope = root || document;

    var nodes = scope.querySelectorAll('[data-erj]');
    for (var i = 0; i < nodes.length; i++) {
      var v = resolve(nodes[i].getAttribute('data-erj'));
      if (v !== null) nodes[i].textContent = v;
    }

    var links = scope.querySelectorAll('[data-erj-href]');
    for (var j = 0; j < links.length; j++) {
      var h = resolveHref(links[j].getAttribute('data-erj-href'));
      if (h !== null) links[j].setAttribute('href', h);
    }
  }

  /* Expose for pages that build markup after load (the store basket,
     the diagnostic report, the CV scan result block). */
  window.ERJFacts = {
    money: money,
    product: product,
    part: part,
    credit: credit,
    get: resolve,
    href: resolveHref,
    paint: paint
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { paint(); });
  } else {
    paint();
  }
})();
