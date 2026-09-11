/* ═══════════════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB · STORE CART
   Progressive enhancement. Every card still carries a direct
   "Buy now" link, so with JS off the store is a working shop.

   CHECKOUT PATHS, in order of preference:
     1. window.ERJ_CONFIG.paystackPublicKey set  → Paystack Inline,
        one popup for the whole basket, any number of items.
     2. Exactly one item in the basket            → straight to that
        product's own Paystack/Selar link.
     3. Two or more items, no key                 → itemised WhatsApp
        order to the Registrar, who sends one combined invoice.

   Path 3 is the honest fallback: Paystack payment LINKS are one
   product per link and cannot total a basket. Add the public key
   and path 1 takes over with no other change.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'erj_cart_v1';
  var cart = [];                      // [{id,name,price,link,contains,partof}]
  var PRODUCTS = {};                  // id -> record, read from the DOM

  var cfg = window.ERJ_CONFIG || {};
  var WA = cfg.whatsapp || '2348032925957';
  var CART_PAGE = cfg.cartPage || 'https://paystack.shop/pay/erjcart';

  function ngn(n) { return '\u20A6' + Number(n).toLocaleString('en-NG'); }

  /* ── read the catalogue out of the cards ─────────────────────── */
  function readCatalogue() {
    document.querySelectorAll('[data-p-id]').forEach(function (el) {
      var id = el.getAttribute('data-p-id');
      PRODUCTS[id] = {
        id: id,
        name: el.getAttribute('data-p-name'),
        price: parseInt(el.getAttribute('data-p-price') || '0', 10),
        link: el.getAttribute('data-p-link'),
        contains: (el.getAttribute('data-p-contains') || '').split(/\s+/).filter(Boolean),
        el: el
      };
    });
  }

  /* ── persistence (sessionStorage; falls back to memory) ──────── */
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(cart.map(function (i) { return i.id; }))); }
    catch (e) { /* private mode — cart simply does not survive reload */ }
  }
  function load() {
    try {
      var ids = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      ids.forEach(function (id) { if (PRODUCTS[id]) cart.push(PRODUCTS[id]); });
    } catch (e) { }
  }

  /* ── overlap guard ───────────────────────────────────────────────
     Foundation contains Stages 1-4; Dream Job contains everything.
     Nobody should be able to pay twice for the same stage, so adding
     a bundle removes what it already includes, and adding a part
     that a basket bundle already covers is refused with a reason. */
  function overlapRemovedBy(prod) {
    return cart.filter(function (i) { return prod.contains.indexOf(i.id) > -1; });
  }
  function coveredBy(prod) {
    return cart.filter(function (i) { return i.contains.indexOf(prod.id) > -1; })[0];
  }

  function add(id) {
    var p = PRODUCTS[id];
    if (!p) return;
    if (cart.some(function (i) { return i.id === id; })) { open(); return; }

    var covering = coveredBy(p);
    if (covering) {
      toast('Not added \u2014 \u201C' + covering.name + '\u201D already includes this.');
      open(); return;
    }
    var dropped = overlapRemovedBy(p);
    if (dropped.length) {
      cart = cart.filter(function (i) { return dropped.indexOf(i) === -1; });
      toast('\u201C' + p.name + '\u201D already includes ' +
            (dropped.length > 1 ? dropped.length + ' items' : '\u201C' + dropped[0].name + '\u201D') +
            ', so ' + (dropped.length > 1 ? 'they were' : 'it was') + ' taken out of your basket.');
    }
    cart.push(p);
    save(); render(); open();
  }

  function remove(id) {
    cart = cart.filter(function (i) { return i.id !== id; });
    save(); render();
  }

  function total() {
    return cart.reduce(function (s, i) { return s + i.price; }, 0);
  }

  /* ── toast ───────────────────────────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('cartToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 5200);
  }

  /* ── chrome ──────────────────────────────────────────────────── */
  function build() {
    var d = document.createElement('div');
    d.innerHTML =
      '<button class="cart-fab" id="cartFab" aria-label="Open your basket" hidden>' +
        '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>' +
        '<circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>' +
        '<span class="cart-fab-n" id="cartCount">0</span>' +
        '<span class="cart-fab-t" id="cartFabTotal"></span>' +
      '</button>' +
      '<div class="cart-scrim" id="cartScrim" hidden></div>' +
      '<aside class="cart-panel" id="cartPanel" aria-label="Your basket" aria-hidden="true" hidden>' +
        '<div class="cart-head">' +
          '<h2>Your basket</h2>' +
          '<button class="cart-x" id="cartClose" aria-label="Close basket">&times;</button>' +
        '</div>' +
        '<div class="cart-body" id="cartBody"></div>' +
        '<div class="cart-foot" id="cartFoot"></div>' +
      '</aside>' +
      '<div class="cart-toast" id="cartToast" role="status" aria-live="polite"></div>';
    while (d.firstChild) document.body.appendChild(d.firstChild);

    document.getElementById('cartFab').addEventListener('click', open);
    document.getElementById('cartClose').addEventListener('click', close);
    document.getElementById('cartScrim').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function open() {
    if (!cart.length) return;
    document.getElementById('cartPanel').hidden = false;
    document.getElementById('cartScrim').hidden = false;
    requestAnimationFrame(function () {
      document.getElementById('cartPanel').classList.add('on');
      document.getElementById('cartScrim').classList.add('on');
    });
    document.getElementById('cartPanel').setAttribute('aria-hidden', 'false');
  }
  function close() {
    var p = document.getElementById('cartPanel'), s = document.getElementById('cartScrim');
    if (!p) return;
    p.classList.remove('on'); s.classList.remove('on');
    p.setAttribute('aria-hidden', 'true');
    setTimeout(function () { p.hidden = true; s.hidden = true; }, 260);
  }

  /* ── render ──────────────────────────────────────────────────── */
  function render() {
    var fab = document.getElementById('cartFab');
    var body = document.getElementById('cartBody');
    var foot = document.getElementById('cartFoot');
    if (!fab) return;

    fab.hidden = cart.length === 0;
    document.getElementById('cartCount').textContent = cart.length;
    document.getElementById('cartFabTotal').textContent = cart.length ? ngn(total()) : '';

    // reflect state on the cards
    Object.keys(PRODUCTS).forEach(function (id) {
      var inCart = cart.some(function (i) { return i.id === id; });
      var btn = PRODUCTS[id].el.querySelector('.p-add');
      if (btn) {
        btn.classList.toggle('in', inCart);
        btn.querySelector('span').textContent = inCart ? 'In your basket' : 'Add to basket';
      }
    });

    if (!cart.length) { close(); return; }

    body.innerHTML = cart.map(function (i) {
      return '<div class="cart-row">' +
        '<div><div class="cart-n">' + i.name + '</div>' +
        '<div class="cart-p">' + ngn(i.price) + '</div></div>' +
        '<button class="cart-rm" data-rm="' + i.id + '" aria-label="Remove ' + i.name + '">Remove</button>' +
      '</div>';
    }).join('');
    body.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () { remove(b.getAttribute('data-rm')); });
    });

    var one = cart.length === 1;
    var key = cfg.paystackPublicKey;
    var note = key
      ? 'One payment, all items, secured by Paystack.'
      : (one ? 'Takes you straight to the secure Paystack page for this item.'
             : 'One secure Paystack payment for all ' + cart.length +
               ' items. Send us the receipt and access follows the same day.');

    foot.innerHTML =
      '<div class="cart-total"><span>Total</span><b>' + ngn(total()) + '</b></div>' +
      '<button class="cart-go btn-primary-ui" id="cartGo"><span>' +
        'Pay ' + ngn(total()) +
      '</span><span class="arrow-wrap"><span class="arrow">\u2192</span></span></button>' +
      '<p class="cart-note">' + note + '</p>';
    document.getElementById('cartGo').addEventListener('click', checkout);
  }

  /* ── checkout ────────────────────────────────────────────────── */
  function checkout() {
    var key = cfg.paystackPublicKey;

    if (key && window.PaystackPop) {
      window.PaystackPop.setup({
        key: key,
        email: (prompt('Your email address (your receipt goes here):') || '').trim(),
        amount: total() * 100,
        currency: 'NGN',
        metadata: {
          custom_fields: [{
            display_name: 'Items',
            variable_name: 'items',
            value: cart.map(function (i) { return i.name; }).join(' + ')
          }]
        },
        callback: function () {
          cart = []; save(); render();
          window.location.href = 'register.html#sec-paystack';
        },
        onClose: function () { }
      }).openIframe();
      return;
    }

    if (cart.length === 1 && cart[0].link) {
      window.location.href = cart[0].link;
      return;
    }

    /* Multi-item: one Paystack page that accepts a custom amount. The amount
       is passed in KOBO, which is what Paystack expects — sending naira would
       charge a hundredth of the total. */
    var kobo = total() * 100;
    window.location.href = CART_PAGE + '?amount=' + kobo;
  }

  /* ── boot ────────────────────────────────────────────────────── */
  function init() {
    readCatalogue();
    if (!Object.keys(PRODUCTS).length) return;   // not the store page
    build();
    load();
    document.querySelectorAll('.p-add').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        add(b.closest('[data-p-id]').getAttribute('data-p-id'));
      });
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
