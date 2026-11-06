/* ═══════════════════════════════════════════════════════════════
   ERJ ASCENSION  ·  erj-ascend.js
   The participant portal is the warmest audience the business has —
   people who already paid, already trust the promise, and already
   know the delivery is real. It was showing them nothing to buy next.

   One rule: show exactly ONE next rung, decided by what they already
   own. Never a menu, never something they have already bought.

     owns 1–4 (a Foundation graduate)  →  the Inner Circle (alumni only)
     already in the Circle (Stage 6+)  →  the ERJ Ambassador programme

   The Ambassador rates below are placeholders until Oluwaseyi sets them.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA = (window.ERJ_CONFIG && window.ERJ_CONFIG.whatsapp) || '2348032925957';

  var LADDER = {

    /* ── Rung one: they finished Foundation Training (Stages 1–4) ──
       The Inner Circle is for Foundation graduates only, so this is the
       one door every graduate is shown. */
    inner: {
      key: 'inner',
      badge: 'Graduates only · your next step',
      kicker: 'The Inner Circle · twelve months, one to one',
      title: 'You finished Foundation Training. Now we stay with you for a year.',
      lead: 'Foundation Training built your assets. The Inner Circle deploys them: one-to-one work on ' +
            'your search for twelve months, starting where your cohort ended. It is open only to graduates, ' +
            'which is why a whole year of it costs what it does.',
      points: [
        '<b>Seven weeks of one-to-one build-up</b> &mdash; audit, profile, outreach, interviews, negotiation, launch.',
        '<b>Then ten more months as a resident</b> &mdash; weekly accountability on your pipeline.',
        '<b>Co-applying on the roles you go for</b>, a dry-run before every interview, and review of every offer.',
        '<b>The private partner directory</b> and the alumni network.'
      ],
      price: '&#8358;250,000',
      priceNote: 'one payment &middot; twelve months &middot; nothing renews automatically',
      cta: 'Request admission',
      href: 'innercircle/#apply',
      wa: 'Hello ERJ — I have finished Foundation Training and I want to join the Inner Circle. Please confirm my admission.'
    },

    /* ── Rung three: they hold everything ────────────────────────── */
    ambassador: {
      key: 'ambassador',
      badge: 'You have completed the ladder',
      kicker: 'ERJ Ambassador · Earn by referral',
      title: 'You are the proof. Now get paid for it.',
      lead: 'You went through every stage, and the people around you have noticed. ' +
            'The Ambassador programme turns the recommendations you are already making into income &mdash; ' +
            'with no cap, no quota and no selling you would be embarrassed by.',
      points: [
        /* CONFIRM: rates below are placeholders. Set them in one place — here. */
        '<b>&#8358;15,000 per confirmed enrolment</b> you refer into any paid stage.',
        '<b>Referrals from outside Nigeria pay in the currency they paid in</b> &mdash; if your person pays in dollars, pounds or euros, you are paid in that same currency, not its naira equivalent.',
        '<b>No cap and no quota.</b> Refer one person a year or twenty; the rate does not change.',
        '<b>Or gift it instead</b> &mdash; hand your commission to your person as their discount. Many alumni do.',
        '<b>You keep your alumni access</b> while you are an Ambassador, including the private community and current ERJ career-support resources.'
      ],
      price: 'Free to join',
      priceNote: 'paid per confirmed enrolment &middot; foreign referrals paid in foreign currency',
      cta: 'Become an Ambassador',
      href: null,
      wa: 'Hello ERJ — I have completed all the stages and I want to join the ERJ Ambassador referral programme. Please send me my referral details.'
    }
  };

  /* ── which rung? ──────────────────────────────────────────────── */
  function decide(owned) {
    var has = function (n) { return owned.indexOf(n) !== -1; };
    var core = has(1) && has(2) && has(3) && has(4);
    var beyond = core && has(6);          // Stage 6+ means they are already in the Circle

    if (beyond) return LADDER.ambassador;
    if (core) return LADDER.inner;        // every Foundation graduate: the Inner Circle
    return null;                          // still working through 1–4: sell nothing
  }

  /* ── styles (portal has its own stylesheet, so ship our own) ──── */
  var CSS = '' +
    '.asc{margin:2rem 0;padding:0;border:1px solid rgba(255,87,34,.28);border-radius:16px;' +
    'background:linear-gradient(160deg,rgba(255,87,34,.07),rgba(255,87,34,.01));overflow:hidden;}' +
    '.asc-top{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;' +
    'padding:.85rem 1.4rem;background:rgba(255,87,34,.12);border-bottom:1px solid rgba(255,87,34,.2);}' +
    '.asc-badge{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#FF5722;}' +
    '.asc-kick{font-size:.78rem;color:rgba(255,255,255,.66);}' +
    '.asc-body{padding:1.5rem 1.4rem 1.6rem;}' +
    '.asc-title{font-size:1.22rem;font-weight:800;line-height:1.32;margin-bottom:.6rem;}' +
    '.asc-lead{font-size:.92rem;line-height:1.68;color:rgba(255,255,255,.7);max-width:66ch;}' +
    '.asc-list{list-style:none;margin:1.15rem 0 0;padding:0;display:grid;gap:.6rem;}' +
    '.asc-list li{position:relative;padding-left:1.15rem;font-size:.88rem;line-height:1.6;' +
    'color:rgba(255,255,255,.72);}' +
    '.asc-list li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:5px;' +
    'border-radius:50%;background:#FF5722;}' +
    '.asc-list b{color:#fff;font-weight:600;}' +
    '.asc-foot{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;' +
    'margin-top:1.4rem;padding-top:1.2rem;border-top:1px solid rgba(255,255,255,.09);}' +
    '.asc-price{font-size:1.5rem;font-weight:800;color:#fff;line-height:1.1;}' +
    '.asc-price small{display:block;font-size:.74rem;font-weight:400;color:rgba(255,255,255,.5);' +
    'margin-top:.25rem;letter-spacing:.01em;}' +
    '.asc-acts{display:flex;flex-wrap:wrap;gap:.6rem;}' +
    '.asc-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.3rem;border-radius:10px;' +
    'font-size:.85rem;font-weight:700;text-decoration:none;cursor:pointer;border:1px solid #FF5722;' +
    'background:#FF5722;color:#fff;transition:transform .2s ease,background .2s ease;}' +
    '.asc-btn:hover{background:#ff6f43;transform:translateY(-2px);}' +
    '.asc-btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.22);}' +
    '.asc-btn.ghost:hover{background:transparent;border-color:#FF5722;color:#FF5722;}' +
    '@media(max-width:620px){.asc-body{padding:1.2rem 1.1rem 1.3rem;}.asc-title{font-size:1.08rem;}' +
    '.asc-foot{gap:.9rem;}.asc-btn{flex:1 1 100%;justify-content:center;}}' +
    '@media(prefers-reduced-motion:reduce){.asc-btn{transition:none;}}';

  function injectCss() {
    if (document.getElementById('erj-ascend-css')) return;
    var st = document.createElement('style');
    st.id = 'erj-ascend-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── render ───────────────────────────────────────────────────── */
  function render(target, owned) {
    var host = typeof target === 'string' ? document.getElementById(target) : target;
    if (!host) return;

    var rung = decide(owned || []);
    if (!rung) { host.innerHTML = ''; return; }   // mid-ladder: nothing to sell

    injectCss();

    var waHref = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(rung.wa);
    var primary = rung.href
      ? '<a class="asc-btn" href="' + rung.href + '">' + rung.cta + ' &rarr;</a>' +
        '<a class="asc-btn ghost" href="' + waHref + '" target="_blank" rel="noopener">Ask a question</a>'
      : '<a class="asc-btn" href="' + waHref + '" target="_blank" rel="noopener">' + rung.cta + ' &rarr;</a>';

    host.innerHTML =
      '<section class="asc" data-rung="' + rung.key + '">' +
        '<div class="asc-top">' +
          '<span class="asc-badge">' + rung.badge + '</span>' +
          '<span class="asc-kick">' + rung.kicker + '</span>' +
        '</div>' +
        '<div class="asc-body">' +
          '<h3 class="asc-title">' + rung.title + '</h3>' +
          '<p class="asc-lead">' + rung.lead + '</p>' +
          '<ul class="asc-list">' + rung.points.map(function (p) {
            return '<li>' + p + '</li>'; }).join('') + '</ul>' +
          '<div class="asc-foot">' +
            '<div class="asc-price">' + rung.price + '<small>' + rung.priceNote + '</small></div>' +
            '<div class="asc-acts">' + primary + '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  window.ERJ_ASCEND = { render: render, decide: decide, ladder: LADDER };
})();
