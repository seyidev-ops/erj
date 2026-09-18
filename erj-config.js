/* ═══════════════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB · CAPTURE CONFIG
   Single source of truth for everything the capture layer needs.
   Edit HERE only — erj-capture.js reads from this and nothing else
   hard-codes a number, a link, or a capacity figure.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  window.ERJ_CONFIG = {

    /* ── The one WhatsApp line. Every capture lands here. ─────── */
    whatsapp: '2348032925957',
    whatsappDisplay: '+234 803 292 5957',

    /* ── The free broadcast channel (one-way: cannot receive replies,
          which is exactly why every mention of it needs a bridge). ── */
    channel: 'https://whatsapp.com/channel/0029Vaym4DE3mFY2wCrC713S',

    /* ── Placement capacity. Real hours, not marketing scarcity.
          Update `taken` as engagements start and finish. ────────── */
    capacity: {
      placementTotal: 8,     // Job Application DFY engagements we can run at once
      placementTaken: 5,
      innerCircleTotal: 12,  // Inner Circle residency seats per intake
      innerCircleTaken: 7
    },

    /* ── The evergreen sentence. Shown under every countdown so a
          person who becomes ready mid-cycle is never told to wait. ── */
    evergreen: {
      lead: 'A cohort has a date. Your job hunt doesn\u2019t.',
      body: 'These doors open the day you walk through them \u2014 no gate, no waiting list.',
      doors: [
        { label: 'Job Application DFY \u2014 done for you, starts this week', href: 'jobapplication/' },
        { label: 'The free stack \u2014 CV scan, blog, job board, masterclass', href: 'free.html' }
      ]
    },

    /* ── Prefilled message templates. {tokens} are filled at runtime. ── */
    messages: {
      scan: 'Hello ERJ \u2014 I just scored {score}/10 on the free CV self-scan.\n\nThe points I did not clear: {defaults}\n\nPlease send me the fix list for my score.',
      scanClear: 'Hello ERJ \u2014 I scored {score}/10 on the free CV self-scan and cleared all ten points.\n\nMy CV is not the reason I am not getting interviews. Where should I look next?',
      channel: 'AUDIT\n\nI am on the ERJ free job channel and I have been applying for remote roles.\n\nTarget role:\nApplications in the last 30 days:\nInterviews in the last 30 days:\nCV/LinkedIn: I will attach or paste it here.\n\nPlease tell me which part of my search is leaking and what I should fix first.',
      diagnose: 'AUDIT\n\nMy diagnostic says: {joint} \u2014 {law}\n\nTarget role:\nApplications in the last 30 days:\nInterviews in the last 30 days:\nCV/LinkedIn: I will attach or paste it here.\n\nMy diagnostic answers: {answer}\n\nPlease tell me what I should fix first. If I do not need a paid ERJ service, please tell me that too.',
      blog: 'Hello ERJ \u2014 I have been reading the blog and I want to sort out my job hunt properly. Where do I start?',
      capacity: 'Hello ERJ \u2014 I would like one of the placement engagements. Are there still places open this month?'
    },

    /* ═══════════════════════════════════════════════════════════
       CANON — the single source of truth for every commercial fact
       on this site. Prices, dates, product names, the diagnostic
       model and the figures all live HERE and nowhere else.

       Two rules make this permanent:
         1. No page states a price, a date or a product name that
            disagrees with this block. Pages carry the figure as real
            text — so it is in the HTML for search engines and for
            readers without JavaScript — and the check below is what
            keeps that text honest.
         2. validate-facts.py reads this block, scans every file, and
            FAILS the build when a surface disagrees with it or uses
            anything listed under `retired`.

       Changing a price or a cohort date is therefore a one-line edit
       in this file. Everything downstream follows, and anything that
       did not follow is caught before it ships.
       ═══════════════════════════════════════════════════════════ */
    canon: {

      org: {
        brand: 'Everything Remote Job',
        legal: 'Business Play Limited',
        tagline: 'Work Beyond Borders.',
        domain: 'everythingremotejob.com',
        pledge: 'We will not let you go until you\u2019re hired.',
        footerSignature: 'Built for global career scale.',
        bank: 'GTBank \u00b7 0761646755 (Business Play Ltd)'
      },

      /* The official line is the ONLY number that may appear on a
         published page or in any template. The founder's personal
         line is deliberately not recorded here, so it cannot be
         rendered by accident. */
      lines: {
        official: '2348032925957',
        officialDisplay: '+234 803 292 5957'
      },

      figures: {
        trained: '446+',
        placed: '382+',
        cohortsCompleted: 9
      },

      /* The diagnostic model. Capacity is first and the order is
         load-bearing \u2014 ties resolve upstream. */
      model: {
        name: 'The Five-Finger Model',
        instruction: 'Find the problem. Fix it.',
        parts: [
          { n: '01', key: 'capacity',       label: 'Capacity',       line: 'You can\u2019t be hired for work you can\u2019t yet do.' },
          { n: '02', key: 'supply',         label: 'Supply',         line: 'You can\u2019t apply for a job you never saw.' },
          { n: '03', key: 'representation', label: 'Representation', line: 'If your CV can\u2019t be read, you were never really in the running.' },
          { n: '04', key: 'aim',            label: 'Aim',            line: 'Applying everywhere isn\u2019t the same as applying where you\u2019d get hired.' },
          { n: '05', key: 'conversion',     label: 'Conversion',     line: 'Interviews don\u2019t pay you. A signed offer does.' }
        ]
      },

      cohort: {
        number: 11,
        feeNaira: 250000,
        closes:  '2026-09-27T20:00:00+01:00',
        begins:  '2026-09-28T20:00:00+01:00',
        closesDisplay: 'Sun 27 Sep \u00b7 8:00 PM WAT',
        beginsDisplay: 'Mon 28 Sep \u00b7 8:00 PM WAT',
        instalmentWindowCloses: '2026-09-14',
        instalmentHref: 'earlybird.html',
        instalmentNote: 'It changes the payment timing, not the price.'
      },

      /* The store, cheapest first. `part` is the Five-Finger part the
         door addresses. `wasNaira` may only be set where that figure
         is a genuine separate-purchase total. */
      products: [
        { id:'book',       name:'Google Search: Best Kept Open Secret', naira:5000,   unit:'one-time', part:'supply',
          href:'register.html#book', pay:'https://paystack.com/buy/google-search-best-kept-open-secret', badge:'Start here' },
        { id:'cvpass',     name:'The CV Engine',                       naira:5000,   unit:'monthly',  part:'representation',
          href:'cvbuilder.html', pay:'https://paystack.shop/pay/84mjv4w4x7' },
        { id:'cvfix',      name:'CV Fix \u2014 one CV, one field',         naira:30000,  unit:'one-time', part:'representation',
          href:'register.html#cvfix', pay:'https://wa.me/2348032925957' },
        { id:'selflearn',  name:'The Self-Learn Pack',                 naira:35000,  unit:'one-time', part:'capacity',
          href:'selflearn/', pay:'https://selar.com/77v230274x' },
        { id:'dfy7',       name:'Done-For-You, 7 Days',                naira:50000,  unit:'one-time', part:'supply',
          href:'jobapplication/', pay:'https://paystack.shop/pay/dfy7days' },
        { id:'stage1',     name:'Stage 1 \u2014 Remote Mindset Blueprint',  naira:70000,  unit:'one-time', part:'capacity',
          href:'register.html#stage1', pay:'https://paystack.shop/pay/Stage1' },
        { id:'stage3',     name:'Stage 3 \u2014 Async Communication Mastery',naira:70000, unit:'one-time', part:'capacity',
          href:'register.html#stage3', pay:'https://paystack.shop/pay/stage3alony' },
        { id:'stage4',     name:'Stage 4 \u2014 Start Your Remote Career',  naira:100000, unit:'one-time', part:'representation',
          href:'register.html#stage4', pay:'https://paystack.shop/pay/stage4only' },
        { id:'stage2',     name:'Stage 2 \u2014 The Digital Toolkit',       naira:130000, unit:'one-time', part:'capacity',
          href:'register.html#stage2', pay:'https://paystack.shop/pay/stage2ai' },
        { id:'foundation', name:'Remote Job Foundation Training',      naira:250000, wasNaira:370000, unit:'one-time', part:'capacity',
          href:'foundationtraining/', pay:'https://paystack.shop/pay/rjmtstages1-4', badge:'Most recommended' },
        { id:'inner',      name:'The Inner Circle',                    naira:250000, unit:'one-time', part:'conversion',
          href:'innercircle/', pay:'https://paystack.shop/pay/erj-inner-circle' },
        { id:'placement',  name:'Done-For-You Placement Engine',       naira:300000, unit:'one-time', part:'aim',
          href:'jobapplication/', pay:'https://paystack.shop/pay/gtdj-stage5' },
        { id:'dreamjob',   name:'Get Your Dream Job Offer',            naira:500000, wasNaira:740000, unit:'one-time', part:'conversion',
          href:'jobapplication/', pay:'https://paystack.shop/pay/gydjo-stages1-5', badge:'Best value' }
      ],

      /* Published credits. A credit is never called a discount, and a
         credit that is not listed here does not exist \u2014 which is the
         whole point of recording it in one place. */
      credits: [
        { id:'selflearn-to-foundation', from:'selflearn', to:'foundation',
          naira:35000, days:90, word:'credit',
          line:'The full \u20a635,000 comes off Foundation Training if you upgrade within 90 days.' }
      ],

      /* Every term that must never appear anywhere in this repository
         again. validate-facts.py fails the build on any of them.
         Retiring something is a one-line addition here. */
      /* NOTE: these ban the MODEL term only. The four-stage curriculum
         (Stages 1 to 4) is legitimate and must survive \u2014 never run a
         blanket find-and-replace on the word "four". */
      retired: [
        'Four-Point', 'Four Point', 'Four Problem', 'four-point diagnostic', 'Four-Point Job Search',
        '4-point', '4 point', '4-Point Model',
        'Mastery Setup', 'Remote Job World Mastery', 'Mastery Training',
        'Private Remote Job Board',
        '2347033134979', '+234 703 313 4979',
        'Get A Remote Job \u2014 Stage 5'
      ]
    }
  };
})();
