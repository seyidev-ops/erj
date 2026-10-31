"use strict";
/* ═══════════════════════════════════════════════════════
   ERJ UNIFIED NAVIGATION

   SEVEN top-level items, everywhere:
     Home ▾ · Remote Jobs · How We Help ▾ (free and paid, by DIY / DWY / DFY) ·
     Success Stories · Register · Blog
   Every dropdown shows the same list on every page; the current
   page is marked inside it. A page's own sections live in its
   in-page tour and the side arrows, never in the main menu.

   Each page sets, BEFORE this script loads:
     window.ERJ_NAV = {
       active: 'home'|'mastery'|'remote'|'inner'|'pricing'|
               'stories'|'blog'|'cvscan'|'diagnose'|'masterclass'|'login'|…,
       base:   '' (root) | '../' (one folder deep),
       portal: true          // admin/instructor surfaces only
       onPage: [{label,href,sub?}, …]   // optional anchors
     };
═══════════════════════════════════════════════════════ */
(() => {
    const cfg = window.ERJ_NAV || {};
    const active = cfg.active || '';
    const base = typeof cfg.base === 'string' ? cfg.base : '';
    const onPage = Array.isArray(cfg.onPage) ? cfg.onPage : [];
    const P = (href) => /^(https?:|mailto:|tel:|#|\/)/.test(href) ? href : base + href;
    /* ── The five items. Each group's title is itself the link to its
          page; the chevron opens the sub-menu. Titles only — detail lives
          on the Your Starting Line and Free For You pages. ── */
    const MENU = [
        {
            key: 'home', label: 'Home', href: 'index.html', keys: ['home'], children: [
                { label: 'Start Here · Quick Tour', href: 'index.html#tour' },
                { label: 'What We Can Do For You', href: 'index.html#promise' },
                { label: 'The Promise', href: 'index.html#pledge' },
                { label: 'Live Remote Jobs', href: 'index.html#jobs-live' },
                { label: 'Proof It Works', href: 'index.html#story' },
                { label: 'How We Help', href: 'index.html#help' },
                { label: 'Before You Decide', href: 'index.html#faq' },
                { label: 'Join Cohort 13', href: 'index.html#enrol' }
            ]
        },
        {
            /* The job board is a door of its own, not only an item under Free:
               supply is the second of the five parts and the first thing many
               visitors come for. The green dot says it is live. */
            key: 'jobs', label: 'Remote Jobs', href: 'jobs/', keys: ['jobboard'], live: true
        },
        {
            /* One door for every way we help, free and paid, grouped by how the
               work gets done. Menu only: every link is the page's existing URL. */
            key: 'g-help', label: 'How We Help', keys: [], mega: true, children: [
                { heading: 'Do it yourself', sub: 'You do the work' },
                { label: 'What\u2019s Holding You Back?', href: 'diagnose/', keys: ['diagnose'], free: true },
                { label: 'Capacity Audit', href: 'capacityscan/', keys: ['capacityscan'], free: true },
                { label: 'CV Scan', href: 'cvscan/', keys: ['cvscan'], free: true },
                { label: 'From Intent to Offer', href: 'fromintenttooffer/', keys: ['book'] },
                { label: 'CV Engine', href: 'cvbuilder.html', keys: ['cvpass'] },
                { label: 'Self-Learn Pack', href: 'selflearn/', keys: ['selflearn'] },
                { heading: 'Done with you', sub: 'We do it together' },
                { label: 'Free Live Clinic', href: 'masterclass/', keys: ['masterclass'], free: true },
                { label: 'Foundation Training', href: 'foundationtraining/', keys: ['mastery'] },
                { label: 'Inner Circle', href: 'innercircle/', keys: ['inner'] },
                { heading: 'Done for you', sub: 'We do it for you' },
                { label: 'Remote Job Board', href: 'jobs/', keys: [], free: true },
                { label: 'CV Fix', href: 'register.html#cvfix', keys: [] },
                { label: 'Job Application', href: 'jobapplication/', keys: ['remote'] },
                { all: true, label: 'See both shelves on the home page', href: 'index.html#help' }
            ]
        },
        { key: 'stories', label: 'Success Stories', href: 'testimonials.html', keys: ['stories', 'jobs'] },
        { key: 'pricing', label: 'Register', href: 'register.html', keys: ['pricing'] },
        { key: 'blog', label: 'Blog', href: 'blog.html', keys: ['blog'] }
    ];
    /* Admin-side menu: the surfaces NOT open to the public live here,
       and only here — Surge Console, the gated CV Engine, the consoles. */
    const PORTAL_MENU = [
        { label: 'Participant Dashboard', href: 'dashboard.html' },
        { label: 'Admin Console', href: 'admin.html' },
        { label: 'Instructor Console', href: 'instructor.html' },
        { label: 'Blog Admin', href: 'blog-admin.html' },
        { label: 'Surge Console', href: 'erj-surge-console.html' },
        { label: 'CV Engine · gated', href: 'cvbuilder/' },
        { label: 'CV Scan · public tool', href: 'cvscan/' },
        { label: 'Back to Website', href: 'index.html' }
    ];
    const IS_PORTAL = !!cfg.portal;
    const matches = (keys) => !!active && !!keys && keys.indexOf(active) !== -1;
    /* ── styles (injected once) ── */
    const css = [
        'html{scroll-padding-top:var(--erj-nav-h,64px);overflow-x:clip;}',
        '.erj-nav,.erj-panel,.erj-scrim{--enInk:var(--ink,#fff);--enPaper:var(--paper,#000);',
        '--enAccent:var(--accent,#FF5722);--enFaint:var(--ink-faint,#8a8a8a);--enSoft:var(--ink-soft,#a1a1a1);',
        '--enLine:var(--line,rgba(255,255,255,0.10));}',
        /* Some lightweight pages (notably blog articles) define --bg/--text rather than
           --paper/--ink. Make the shared navigation theme self-contained so Day mode
           cannot leave a black desktop header sitting on an off-white page. */
        'html[data-theme="night"] .erj-nav,html[data-theme="night"] .erj-panel{--enInk:#fff;--enPaper:#000;--enAccent:#FF5722;--enFaint:#8a8a8a;--enSoft:#a1a1a1;--enLine:rgba(255,255,255,.10);}',
        'html[data-theme="day"] .erj-nav,html[data-theme="day"] .erj-panel{--enInk:#14110E;--enPaper:#FAFAF8;--enAccent:#AD350A;--enFaint:#6E6C65;--enSoft:#52514C;--enLine:rgba(20,17,14,.12);}',
        '.erj-nav{font-family:var(--font-body,system-ui,sans-serif);position:fixed;top:0;left:0;right:0;z-index:1000;',
        'display:flex;align-items:center;justify-content:space-between;gap:1rem;',
        'padding:0.7rem clamp(1.1rem,4vw,2.2rem);background:var(--enPaper);',
        'border-bottom:1px solid var(--enLine);box-shadow:0 1px 0 var(--enLine),0 6px 24px -18px rgba(0,0,0,0.5);}',
        '.erj-nav *{box-sizing:border-box;}',
        '.erj-brand{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-display,"Space Grotesk",system-ui,sans-serif);',
        'font-weight:700;font-size:1rem;color:var(--enInk);letter-spacing:-0.3px;text-decoration:none;flex-shrink:0;}',
        '.erj-brand img{width:31px;height:30px;display:block;object-fit:contain;}',
        /* Default is night, which is what <html data-theme="night"> ships as,
           so the light mark stays hidden until the theme actually changes.

           These selectors are scoped to .erj-brand deliberately. A bare
           '.erj-mark-day' is specificity (0,1,0) and loses to the
           '.erj-brand img' rule above at (0,1,1) — which showed BOTH marks
           side by side in night theme. Matching the specificity fixes it. */
        '.erj-brand .erj-mark-day{display:none;}',
        'html[data-theme="day"] .erj-brand .erj-mark-night{display:none;}',
        'html[data-theme="day"] .erj-brand .erj-mark-day{display:block;}',
        '.erj-brand b{font-weight:700;}.erj-brand i{font-style:italic;color:var(--enAccent);font-weight:700;margin-left:-0.08em;}',
        '.erj-right{display:flex;align-items:center;gap:0.55rem;flex-shrink:0;}',
        '.erj-icon{width:40px;height:40px;flex-shrink:0;border-radius:9px;background:transparent;border:1px solid var(--enLine);',
        'color:var(--enInk);font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'transition:border-color .2s;line-height:1;}',
        '.erj-icon:hover{border-color:var(--enAccent);}',
        '.erj-burger svg{width:20px;height:20px;}',
        /* ── DESKTOP BAR (>=980px): the five items spread across the header ── */
        '.erj-bar{display:none;align-items:center;gap:0.15rem;margin-left:auto;margin-right:0.6rem;}',
        '.erj-bar-item{position:relative;display:flex;align-items:center;}',
        '.erj-bar-link{display:inline-flex;align-items:center;gap:0.3rem;color:var(--enInk);text-decoration:none;',
        'font-size:0.88rem;font-weight:600;letter-spacing:-0.1px;padding:0.55rem 0.7rem;border-radius:8px;',
        'white-space:nowrap;transition:background .15s,color .15s;}',
        '.erj-bar-link:hover{background:var(--enLine);color:var(--enAccent);}',
        '.erj-bar-item.is-current>.erj-bar-link{color:var(--enAccent);}',
        '.erj-bar-item.is-current>.erj-bar-link::before{content:"";width:6px;height:6px;border-radius:50%;',
        'background:var(--enAccent);margin-right:0.15rem;flex-shrink:0;}',
        '.erj-bar-chev{background:transparent;border:0;color:var(--enFaint);cursor:pointer;font-size:0.6rem;',
        /* WCAG 2.2 wants 24x24 for a tap target. The glyph is 0.6rem, so
           without a declared box this button was about 10px wide. The
           min-width/min-height and the flex centre grow the hit area to
           meet the rule without moving the chevron a pixel. */
        'min-width:24px;min-height:24px;display:inline-flex;align-items:center;justify-content:center;',
        'padding:0.55rem 0.4rem 0.55rem 0;line-height:1;transition:transform .22s,color .2s;}',
        '.erj-bar-item.open .erj-bar-chev{transform:rotate(180deg);color:var(--enAccent);}',
        '.erj-bar-item:hover .erj-bar-chev{color:var(--enAccent);}',
        '.erj-drop{position:absolute;top:calc(100% + 0.55rem);left:0;min-width:250px;background:var(--enPaper);',
        'border:1px solid var(--enLine);border-radius:12px;padding:0.4rem;z-index:1010;',
        'box-shadow:0 18px 44px -20px rgba(0,0,0,0.75);display:none;}',
        '.erj-bar-item.open .erj-drop{display:block;}',
        '.erj-drop a{display:block;color:var(--enSoft);font-size:0.85rem;text-decoration:none;padding:0.55rem 0.7rem;',
        'border-radius:8px;white-space:nowrap;transition:background .15s,color .15s;}',
        '.erj-drop a:hover{background:var(--enLine);color:var(--enAccent);}',
        '.erj-drop a.is-current{color:var(--enAccent);font-weight:700;}',
        '.erj-drop a.is-current::before{content:"\u2022 ";}',
        '.erj-drop .erj-drop-anchors{border-top:1px solid var(--enLine);margin-top:0.3rem;padding-top:0.3rem;}',
        '.erj-drop .erj-drop-anchors a{font-size:0.8rem;color:var(--enFaint);}',
        /* Pinned so the bar's height never depends on which font has finished
           loading. Pages reserve exactly this much room up front, which is why
           nothing jumps when the nav mounts. Change one, change the other:
           the reservation lives in each page's <style id="erjNavReserve">. */
        '.erj-nav{min-height:63px;}',
        '@media(min-width:980px){.erj-nav{min-height:65px;}}',
        '@media(min-width:980px){.erj-bar{display:flex;}.erj-burger{display:none;}}',
        /* seven items: tighten between 980 and 1240 so the bar never spills */
        '@media(min-width:980px) and (max-width:1240px){.erj-nav{gap:.5rem;padding-left:1rem;padding-right:1rem;}.erj-bar{margin-right:.2rem;gap:0;}.erj-bar-link{padding:.55rem .42rem;font-size:.8rem;}.erj-bar-chev{padding-right:.15rem;min-width:18px;}.erj-brand{font-size:.9rem;gap:7px;}}',
        /* ── MOBILE DRAWER (<980px) ── */
        '.erj-panel{position:fixed;top:0;right:0;bottom:0;width:min(86vw,380px);z-index:1100;',
        'background:var(--enPaper);border-left:1px solid var(--enLine);box-shadow:-16px 0 50px rgba(0,0,0,0.22);',
        'overflow-y:auto;transform:translateX(100%);transition:transform .32s cubic-bezier(0.22,1,0.36,1);',
        'display:flex;flex-direction:column;visibility:hidden;}',
        '.erj-panel.open{transform:translateX(0);visibility:visible;}',
        '.erj-panel-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;',
        'padding:1.1rem 1.3rem;border-bottom:1px solid var(--enLine);position:sticky;top:0;background:var(--enPaper);z-index:2;}',
        '.erj-panel-title{font-size:0.66rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--enFaint);font-weight:500;}',
        '.erj-panel-x{width:34px;height:34px;border-radius:8px;background:transparent;border:1px solid var(--enLine);',
        'color:var(--enInk);font-size:1.05rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}',
        '.erj-panel-x:hover{border-color:var(--enAccent);}',
        '.erj-list{display:flex;flex-direction:column;gap:0;margin:0;padding:0.6rem 0.8rem 1.5rem;}',
        '.erj-row{display:flex;align-items:center;gap:0.2rem;}',
        '.erj-link{flex:1;display:flex;align-items:center;gap:0.4rem;color:var(--enInk);',
        'font-family:var(--font-display,"Space Grotesk",system-ui,sans-serif);font-size:1.14rem;font-weight:600;letter-spacing:-0.3px;',
        'text-decoration:none;padding:0.85rem 0.6rem;border-radius:8px;transition:background .15s,color .15s;}',
        '.erj-link:hover{background:var(--enLine);}',
        /* the title itself IS the location marker */
        '.erj-item.is-current>.erj-row>.erj-link,.erj-item.is-current>.erj-link{color:var(--enAccent);}',
        '.erj-item.is-current>.erj-row>.erj-link::before,.erj-item.is-current>.erj-link::before{content:"";',
        'width:7px;height:7px;border-radius:50%;background:var(--enAccent);flex-shrink:0;}',
        '.erj-chev{background:transparent;border:0;color:var(--enFaint);cursor:pointer;font-size:0.7rem;',
        'padding:0.9rem 0.7rem;line-height:1;border-radius:8px;transition:transform .25s,color .2s;}',
        '.erj-chev:hover{color:var(--enAccent);background:var(--enLine);}',
        '.erj-item.open .erj-chev{transform:rotate(180deg);color:var(--enAccent);}',
        '.erj-kids{display:none;padding:0.1rem 0 0.5rem 0.55rem;margin-left:0.35rem;border-left:2px solid var(--enLine);}',
        '.erj-item.open .erj-kids{display:block;}',
        '.erj-sub-item{display:block;text-decoration:none;color:var(--enSoft);font-size:0.9rem;font-weight:500;',
        'padding:0.55rem 0.65rem;border-radius:8px;transition:background .15s,color .15s;}',
        '.erj-sub-item:hover{background:var(--enLine);color:var(--enAccent);}',
        '.erj-sub-item.is-current{color:var(--enAccent);font-weight:700;}',
        '.erj-sub-item.is-current::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;',
        'background:var(--enAccent);margin-right:0.45rem;vertical-align:middle;}',
        '.erj-anchors{display:flex;flex-direction:column;padding:0.1rem 0 0.3rem 0.2rem;margin:0;}',
        '.erj-sub-item+.erj-anchors{padding-left:0.7rem;border-left:1px solid var(--enLine);margin:0.1rem 0 0.2rem;}',
        '.erj-anchors a{display:block;color:var(--enFaint);font-size:0.82rem;text-decoration:none;',
        'padding:0.4rem 0.6rem;border-radius:7px;transition:background .15s,color .15s;}',
        '.erj-anchors a:hover{background:var(--enLine);color:var(--enAccent);}',
        '.erj-anchors a.is-here{color:var(--enAccent);}',
        '.f-stop.is-here .no{opacity:1;}.f-stop.is-here .lbl{color:var(--enAccent);}',
        '.erj-scrim{position:fixed;inset:0;z-index:1090;background:rgba(0,0,0,0.42);opacity:0;visibility:hidden;',
        'transition:opacity .3s,visibility .3s;}',
        '.erj-scrim.open{opacity:1;visibility:visible;}',
        '@media(max-width:400px){.erj-nav{gap:0.5rem;padding-left:0.85rem;padding-right:0.85rem;}',
        '.erj-brand{flex-shrink:1;min-width:0;font-size:0.9rem;gap:7px;overflow:hidden;white-space:nowrap;letter-spacing:-0.3px;}',
        '.erj-brand img{width:26px;height:26px;}.erj-right{gap:0.3rem;}.erj-icon{width:36px;height:36px;}}',
        '@media(prefers-reduced-motion:reduce){.erj-panel,.erj-scrim,.erj-chev,.erj-bar-chev{transition:none;}}',
        '.erj-live{display:inline-block;width:7px;height:7px;margin-left:.45rem;border-radius:50%;background:#25D366;vertical-align:middle;animation:erjLive 2s infinite;}',
        '@keyframes erjLive{0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)}70%{box-shadow:0 0 0 7px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}',
        '@media(prefers-reduced-motion:reduce){.erj-live{animation:none;}}',
        '.erj-toggle{background:none;border:0;font-family:inherit;line-height:inherit;color:inherit;cursor:pointer;text-align:left;-webkit-appearance:none;appearance:none;}',
        /* a group title in the drawer is a button, not a link: give it the same type as every other title */
        '.erj-free{display:inline-block;margin-left:.45rem;padding:.08rem .42rem;border-radius:999px;font-size:.6rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;vertical-align:middle;color:#1FAF55;border:1px solid rgba(31,175,85,.45);background:rgba(31,175,85,.1);}',
        'html[data-theme="day"] .erj-free{color:#0B6E3E;}',
        '.erj-h{padding:.55rem .7rem .3rem;}.erj-h b{display:block;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--enAccent);}',
        '.erj-h small{display:block;font-size:.72rem;color:var(--enFaint);margin-top:.1rem;}',
        '.erj-drop.erj-mega{min-width:0;width:320px;padding:.45rem;}','.erj-drop .erj-fold{margin:.3rem 0;}','.erj-drop .erj-fold-h b{font-size:.9rem;}','.erj-drop .erj-fold-b{padding:0 .3rem .4rem;}','.erj-drop .erj-fold-b a{white-space:normal;}',
        '.erj-mega-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.3rem;}',
        '.erj-col{padding:.2rem;border-radius:10px;}.erj-col+.erj-col{border-left:1px solid var(--enLine);}',
        '.erj-mega a{white-space:normal;}',
        '.erj-mega-foot{border-top:1px solid var(--enLine);margin-top:.4rem;padding-top:.4rem;}',
        '.erj-drop a.erj-all,.erj-sub-item.erj-all{color:var(--enAccent);font-weight:700;}',
        '.erj-kh{padding:.75rem .65rem .25rem;}.erj-kh b{display:block;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--enAccent);}',
        '.erj-kh small{display:block;font-size:.72rem;color:var(--enFaint);}',
        '.erj-fold{border:1px solid var(--enLine);border-radius:14px;margin:.45rem 0;overflow:hidden;transition:border-color .25s;}',
        '.erj-fold.open{border-color:var(--enAccent);}',
        '.erj-fold-h{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.8rem .85rem;}',
        '.erj-fold-h:focus-visible{outline:2px solid var(--enAccent);outline-offset:-2px;}',
        '.erj-fold-h b{display:block;font-size:.98rem;font-weight:700;color:var(--enInk);}',
        '.erj-fold-h small{display:block;font-size:.74rem;color:var(--enFaint);margin-top:.1rem;}',
        '.erj-fold-h i{font-style:normal;color:var(--enFaint);transition:transform .3s;}',
        '.erj-fold.open .erj-fold-h i{transform:rotate(180deg);color:var(--enAccent);}',
        '.erj-fold-b{display:none;padding:0 .4rem .5rem;}',
        '.erj-fold.open .erj-fold-b{display:block;}',
        '.erj-kids .erj-fold+.erj-all,.erj-kids .erj-fold+a.erj-sub-item{margin-top:.3rem;}',
        '.erj-link.erj-toggle{font-family:var(--font-display,"Space Grotesk",system-ui,sans-serif);font-size:1.14rem;font-weight:600;letter-spacing:-0.3px;}'
    ].join('');
    const style = document.createElement('style');
    style.id = 'erjNavCSS';
    style.textContent = css;
    document.head.appendChild(style);
    /* ── render helpers ── */
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const LIVE = '<span class="erj-live" aria-hidden="true"></span>';
    const extAttr = (c) => (c.external ? ' target="_blank" rel="noopener"' : '');
    const FREE = '<span class="erj-free">Free</span>';
    function dropItem(c) {
        if (c.heading) return '<div class="erj-h"><b>' + esc(c.heading) + '</b>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</div>';
        const cur = matches(c.keys);
        return '<a href="' + P(c.href) + '"' + extAttr(c) + ' class="' + (c.all ? 'erj-all' : '') + (cur ? ' is-current' : '') + '"' +
            (cur ? ' aria-current="page"' : '') + '>' + esc(c.label) + (c.free ? FREE : '') + (c.all ? ' \u2192' : '') + '</a>';
    }
    /* How We Help: three folds (DIY, DWY, DFY), one open at a time, in the
       desktop dropdown and the phone drawer alike. */
    function folds(kids, prefix, row) {
        const fs = []; let foot = '';
        kids.forEach(c => {
            if (c.all) { foot = row(c); return; }
            if (c.heading) { fs.push({ h: c, items: [] }); return; }
            if (fs.length) fs[fs.length - 1].items.push(c);
        });
        return fs.map((f, i) => {
            const cur = f.items.some(c => matches(c.keys));
            const id = prefix + i;
            return '<div class="erj-fold' + (cur ? ' open' : '') + '">' +
                '<button type="button" class="erj-fold-h" aria-expanded="' + (cur ? 'true' : 'false') + '" aria-controls="' + id + '">' +
                '<span><b>' + esc(f.h.heading) + '</b><small>' + esc(f.h.sub || '') + ' \u00b7 ' + f.items.length + '</small></span><i aria-hidden="true">\u25BE</i></button>' +
                '<div class="erj-fold-b" id="' + id + '">' + f.items.map(row).join('') + '</div></div>';
        }).join('') + (foot ? '<div class="erj-mega-foot">' + foot + '</div>' : '');
    }
    function megaDrop(kids) { return folds(kids, 'erjDFold', dropItem); }
    /* ── DESKTOP BAR ── */
    function buildBar() {
        return MENU.map(top => {
            const selfCurrent = matches(top.keys);
            const childCurrent = !!top.children && top.children.some(c => matches(c.keys));
            const isCurrent = selfCurrent || childCurrent;
            let html = '<div class="erj-bar-item' + (isCurrent ? ' is-current' : '') +
                '" data-bar="' + top.key + '">' +
                (top.href
                    ? '<a class="erj-bar-link" href="' + P(top.href) + '"' + (selfCurrent ? ' aria-current="page"' : '') + '>' + esc(top.label) + (top.live ? LIVE : '') + '</a>'
                    : '<button type="button" class="erj-bar-link erj-toggle" data-toggle>' + esc(top.label) + '</button>');
            if (top.children) {
                /* The same list on every page: a dropdown never swaps its
                   contents for the current page's sections. */
                const drop = top.mega ? megaDrop(top.children) : top.children.map(dropItem).join('');
                html += '<button type="button" class="erj-bar-chev" aria-label="Open ' + esc(top.label) +
                    ' menu" aria-expanded="false">\u25BC</button><div class="erj-drop' + (top.mega ? ' erj-mega' : '') + '">' + drop + '</div>';
            }
            return html + '</div>';
        }).join('');
    }
    /* ── top bar ── */
    const nav = document.createElement('header');
    nav.className = 'erj-nav';
    nav.innerHTML =
        '<a href="' + P('index.html') + '" class="erj-brand">' +
            /* Both marks ship; CSS shows one. Swapping an img src on the theme
               toggle means a network fetch mid-click and a blink where the logo
               used to be — this way the correct one is already decoded and the
               switch is instant. Same geometry, so nothing shifts.
               The 128px files, NOT the 1072px masters: both marks ship on
               every page, and the masters are 562 KB and 436 KB for a
               31x30 slot -- 998 KB per page view to draw two small icons.
               128px is still 4x for the 31px it renders at. */
            '<img class="erj-mark erj-mark-night" src="' + P('erj-mark-dark-128.png') + '" alt="ERJ" width="31" height="30">' +
            '<img class="erj-mark erj-mark-day" src="' + P('erj-mark-light-128.png') + '" alt="" aria-hidden="true" width="31" height="30">' +
            '<b>Everything</b><i>RemoteJob</i></a>' +
            (IS_PORTAL ? '' : '<nav class="erj-bar" aria-label="Main menu">' + buildBar() + '</nav>') +
            '<div class="erj-right">' +
            '<button class="erj-icon" data-erj-theme-btn title="Toggle theme" aria-label="Toggle theme">\uD83C\uDF19</button>' +
            '<button class="erj-icon erj-burger" id="erjBurger" aria-label="Open menu" aria-haspopup="true" aria-expanded="false">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
            '<line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>' +
            '</button></div>';
    /* On portal pages the burger is the only menu at every width. */
    if (IS_PORTAL) {
        const pcss = document.createElement('style');
        pcss.textContent = '@media(min-width:980px){.erj-burger{display:flex;}}';
        document.head.appendChild(pcss);
    }
    /* ── MOBILE DRAWER ── */
    function childRow(c) {
        if (c.heading) return '<div class="erj-kh"><b>' + esc(c.heading) + '</b>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</div>';
        if (c.free || c.all) return '<a class="erj-sub-item' + (c.all ? ' erj-all' : '') + (matches(c.keys) ? ' is-current' : '') + '" href="' + P(c.href) + '">' +
            esc(c.label) + (c.free ? FREE : '') + (c.all ? ' \u2192' : '') + '</a>';
        const cur = matches(c.keys);
        return '<a class="erj-sub-item' + (cur ? ' is-current' : '') + '" href="' + P(c.href) + '"' +
            extAttr(c) + (cur ? ' aria-current="page"' : '') + '>' + esc(c.label) + '</a>' +
            '';
    }
    /* How We Help in the drawer: three folds (DIY, DWY, DFY), one open at a
       time, all closed on arrival unless the current page sits inside one. */
    function megaKids(kids) { return folds(kids, 'erjFold', childRow); }
    function buildItems() {
        if (IS_PORTAL) {
            return PORTAL_MENU.map(c => '<div class="erj-item"><a class="erj-link" href="' + P(c.href) + '">' +
                esc(c.label) + '</a></div>').join('');
        }
        return MENU.map(top => {
            const selfCurrent = matches(top.keys);
            const childCurrent = !!top.children && top.children.some(c => matches(c.keys));
            const isCurrent = selfCurrent || childCurrent;
            const link = top.href
                ? '<a class="erj-link" href="' + P(top.href) + '"' + (selfCurrent ? ' aria-current="page"' : '') + '>' + esc(top.label) + (top.live ? LIVE : '') + '</a>'
                : '<button type="button" class="erj-link erj-toggle" data-toggle>' + esc(top.label) + '</button>';
            if (!top.children) {
                return '<div class="erj-item' + (selfCurrent ? ' is-current' : '') + '">' + link + '</div>';
            }
            /* Group: title links to its page, chevron opens the sub-menu.
               When the group's OWN page is current, its anchors sit directly
               under the title; when a child is current, they sit under that child. */
            const kids = top.mega ? megaKids(top.children) : top.children.map(childRow).join(''); /* the same list on every page */
            return '<div class="erj-item' + (isCurrent ? ' open' : '') +
                (selfCurrent ? ' is-current' : '') + '" data-group="' + top.key + '">' +
                '<div class="erj-row">' + link +
                '<button type="button" class="erj-chev" aria-label="Open ' + esc(top.label) +
                ' menu" aria-expanded="' + (isCurrent ? 'true' : 'false') + '">\u25BC</button></div>' +
                '<div class="erj-kids">' + kids + '</div>' +
                '</div>';
        }).join('');
    }
    const scrim = document.createElement('div');
    scrim.className = 'erj-scrim';
    scrim.id = 'erjScrim';
    const panel = document.createElement('aside');
    panel.className = 'erj-panel';
    panel.id = 'erjPanel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
        '<div class="erj-panel-head"><span class="erj-panel-title">Menu</span>' +
            '<button class="erj-panel-x" id="erjPanelX" aria-label="Close menu">\u2715</button></div>' +
            '<nav class="erj-list" aria-label="Site menu">' + buildItems() + '</nav>';
    function setOffset() {
        const h = nav.offsetHeight || 58;
        document.body.style.paddingTop = h + 'px';
        document.documentElement.style.setProperty('--erj-nav-h', h + 'px');
    }
    function wire() {
        const burger = document.getElementById('erjBurger');
        const open = () => {
            panel.classList.add('open');
            scrim.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            if (burger)
                burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            panel.classList.remove('open');
            scrim.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            if (burger)
                burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };
        if (burger)
            burger.addEventListener('click', open);
        const x = document.getElementById('erjPanelX');
        if (x)
            x.addEventListener('click', close);
        scrim.addEventListener('click', close);
        panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
        /* Drawer accordion: opening one group closes the others. */
        const groups = panel.querySelectorAll('.erj-item[data-group]');
        panel.querySelectorAll('.erj-chev').forEach(btn => {
            btn.addEventListener('click', () => {
                const g = btn.closest('.erj-item');
                if (!g)
                    return;
                const willOpen = !g.classList.contains('open');
                groups.forEach(other => {
                    other.classList.remove('open');
                    const c = other.querySelector('.erj-chev');
                    if (c)
                        c.setAttribute('aria-expanded', 'false');
                });
                if (willOpen) {
                    g.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
        /* How We Help folds: opening one closes the others. */
        [].concat([...panel.querySelectorAll('.erj-fold-h')], [...nav.querySelectorAll('.erj-fold-h')]).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const f = btn.closest('.erj-fold');
                const willOpen = !f.classList.contains('open');
                f.parentNode.querySelectorAll('.erj-fold').forEach(o => {
                    o.classList.remove('open');
                    o.querySelector('.erj-fold-h').setAttribute('aria-expanded', 'false');
                });
                if (willOpen) { f.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
            });
        });
        /* Desktop dropdowns: one at a time, close on outside click or Escape. */
        const barItems = nav.querySelectorAll('.erj-bar-item');
        const closeBar = () => {
            barItems.forEach(it => {
                it.classList.remove('open');
                const c = it.querySelector('.erj-bar-chev');
                if (c)
                    c.setAttribute('aria-expanded', 'false');
            });
        };
        nav.querySelectorAll('.erj-bar-chev').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const it = btn.closest('.erj-bar-item');
                if (!it)
                    return;
                const willOpen = !it.classList.contains('open');
                closeBar();
                if (willOpen) {
                    it.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
        document.addEventListener('click', e => {
            if (!nav.contains(e.target))
                closeBar();
        });
        /* A title with no page of its own opens its list. */
        document.querySelectorAll('.erj-toggle[data-toggle]').forEach(t => {
            t.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const host = t.closest('.erj-bar-item, .erj-item');
                const chev = host && host.querySelector('.erj-bar-chev, .erj-chev');
                if (chev)
                    chev.click();
            });
        });
        nav.querySelectorAll('.erj-drop a').forEach(a => a.addEventListener('click', closeBar));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                close();
                closeBar();
            }
        });
    }
    function mount() {
        const slot = document.getElementById('erjNavMount');
        if (slot && slot.parentNode)
            slot.parentNode.replaceChild(nav, slot);
        else
            document.body.insertBefore(nav, document.body.firstChild);
        /* setOffset() reads nav.offsetHeight, which forces a synchronous layout.
           Running it here — inside mount, before first paint — cost 64 ms on a
           throttled phone. The nav height is already reserved in CSS (59 px
           mobile / 65 px desktop), so nothing moves if the browser paints first
           and we correct the reserved value once the page has settled.
           Every consumer of --erj-nav-h carries its own fallback, so nothing
           depends on this having run. */
        window.addEventListener('load', setOffset);
        window.addEventListener('resize', setOffset);
        if (document.fonts && document.fonts.ready)
            document.fonts.ready.then(setOffset);
        document.body.appendChild(scrim);
        document.body.appendChild(panel);
        wire();
        if (window.erjApplyTheme) {
            try {
                window.erjApplyTheme(localStorage.getItem('rjt-theme') || 'system');
            }
            catch (e) { /* noop */ }
        }
    }
    /* ── in-page tour, rendered from the SAME onPage array ── */
    function mountTour() {
        const hosts = document.querySelectorAll('[data-erj-tour]');
        if (!hosts.length || !onPage.length)
            return;
        const title = cfg.tourTitle === '' ? '' : (cfg.tourTitle || 'On this page');
        const first = cfg.tourStart || 1;
        let html = (title ? '<div class="f-tour-t">' + title + '</div>' : '') + '<div class="f-stops">';
        onPage.filter(st => !st.tourSelf).forEach((st, i) => {
            const n = i + first;
            const no = n < 10 ? '0' + n : '' + n;
            html += '<a class="f-stop" href="' + st.href + '" data-tour-target="' + st.href + '">' +
                '<span class="no">' + no + '</span><span class="lbl">' + st.label +
                (st.sub ? '<small>' + st.sub + '</small>' : '') +
                '</span><span class="go">\u2192</span></a>';
        });
        html += '</div>';
        if (cfg.tourSkip) {
            html += '<a class="f-tour-skip" href="' + cfg.tourSkip.href + '">' +
                cfg.tourSkip.label + ' <span>\u2192</span></a>';
        }
        hosts.forEach(h => { h.innerHTML = html; });
        spyTour();
    }
    /* Highlight the section the reader is inside — tour + drawer anchors. */
    function spyTour() {
        const els = [];
        const seen = {};
        onPage.forEach(s => {
            const h = s.href;
            if (!h || h.charAt(0) !== '#' || seen[h])
                return;
            const el = document.getElementById(h.slice(1));
            if (el) {
                el.setAttribute('data-tour-id', h);
                els.push(el);
                seen[h] = 1;
            }
        });
        if (!els.length || !('IntersectionObserver' in window))
            return;
        const visible = {};
        const paint = () => {
            let cur = null;
            for (const el of els) {
                const h = el.getAttribute('data-tour-id') || '';
                if (visible[h]) {
                    cur = h;
                    break;
                }
            }
            if (!cur)
                return;
            document.querySelectorAll('[data-tour-target],.erj-anchors a').forEach(a => {
                const href = a.getAttribute('data-tour-target') || a.getAttribute('href');
                if (href === cur)
                    a.classList.add('is-here');
                else
                    a.classList.remove('is-here');
            });
        };
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => { visible[en.target.getAttribute('data-tour-id') || ''] = en.isIntersecting; });
            paint();
        }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
        els.forEach(el => io.observe(el));
    }
    const mountAll = () => { mount(); try {
        mountTour();
    }
    catch (e) { /* noop */ } };
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', mountAll);
    else
        mountAll();
})();
/* ── Tour navigator: floating up/down arrows stepping through
      ERJ_NAV.onPage anchors. Mounts on pages with 2+ stops. ── */
(() => {
    function mount() {
        const nav = window.ERJ_NAV;
        if (!nav || nav.portal || !Array.isArray(nav.onPage))
            return;
        const stops = nav.onPage
            .filter(s => s && s.href && s.href.charAt(0) === '#')
            .map(s => document.querySelector(s.href))
            .filter((el) => !!el);
        if (stops.length < 2)
            return;
        const css = document.createElement('style');
        css.textContent =
            '.erj-tournav{position:fixed;left:clamp(0.6rem,1.6vw,1.1rem);top:50%;transform:translateY(-50%);' +
                'display:flex;flex-direction:column;gap:0.45rem;z-index:190;}' +
                '.erj-tournav button{width:38px;height:38px;border-radius:50%;border:1px solid var(--card-line,rgba(128,128,128,.28));' +
                'background:var(--card,#111);color:var(--ink,#fff);cursor:pointer;display:flex;align-items:center;justify-content:center;' +
                'box-shadow:0 6px 20px rgba(0,0,0,.28);transition:transform .25s,border-color .25s,opacity .3s;padding:0;opacity:.55;}' +
                '.erj-tournav:hover button,.erj-tournav button:focus-visible{opacity:1;}' +
                '.erj-tournav button:not(.erj-tournext):hover{transform:scale(1.08);border-color:var(--accent,#FF5722);opacity:1;}' +
                '.erj-tournav button:focus-visible{outline:2px solid var(--accent,#FF5722);outline-offset:2px;}' +
                '.erj-tournav button svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}' +
                '.erj-tournav button[disabled]{opacity:.16;cursor:default;transform:none;}' +
                '@media(max-width:768px){.erj-tournav{gap:0.4rem;left:0.5rem;}' +
                '.erj-tournav button{width:33px;height:33px;box-shadow:0 4px 14px rgba(0,0,0,.24);}' +
                '.erj-tournav button svg{width:13px;height:13px;}}' +
                '@media(max-width:380px){.erj-tournav{display:none;}}' +
                /* "Next · <stop>" pill beside the down arrow: says where the arrow goes. */
                '.erj-tournav button.erj-tournext{width:auto;height:auto;opacity:1;justify-content:flex-start;position:absolute;left:calc(100% + .5rem);bottom:2px;display:inline-flex;align-items:center;gap:.4rem;max-width:min(60vw,320px);' +
                'padding:.42rem .8rem .42rem .55rem;border-radius:100px;border:0;background:var(--accent-btn,#FF5722);color:#fff;font-family:inherit;font-size:.74rem;font-weight:700;line-height:1.2;cursor:pointer;' +
                'box-shadow:0 10px 26px rgba(255,87,34,.35);white-space:nowrap;visibility:hidden;transform:translateX(-10px) scale(.96);transition:transform .35s cubic-bezier(.22,1,.36,1),visibility 0s .35s;}' +
                '.erj-tournav .erj-tournext b{overflow:hidden;text-overflow:ellipsis;}' +
                '.erj-tournav .erj-tournext img{width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid #fff;margin:-.2rem 0 -.2rem -.3rem;flex:none;}' +
                '.erj-tournav .erj-tournext i{font-style:normal;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;opacity:.85;}' +
                '.erj-tournav button.erj-tournext.on{visibility:visible;transform:none;transition:transform .35s cubic-bezier(.22,1,.36,1),visibility 0s;}' +
                /* phones: see-through, and it tucks back into the arrow (slide + fade) instead of snapping off */
                '@media(max-width:768px){.erj-tournav button.erj-tournext{background:rgba(255,87,34,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 6px 18px rgba(255,87,34,.25);opacity:0;transform:translateX(-18px) scale(.9);transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s ease,visibility 0s .4s;}' +
                '.erj-tournav button.erj-tournext.on{opacity:1;transform:none;transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .25s ease,visibility 0s;}}' +
                '.erj-tournav button.is-hint{opacity:1;border-color:var(--accent,#FF5722);animation:erjHint 1.8s ease-out infinite;}' +
                '@keyframes erjHint{0%{box-shadow:0 0 0 0 rgba(255,87,34,.6)}75%{box-shadow:0 0 0 12px rgba(255,87,34,0)}100%{box-shadow:0 0 0 0 rgba(255,87,34,0)}}' +
                '@media(prefers-reduced-motion:reduce){.erj-tournav button.is-hint{animation:none;}.erj-tournext{transition:none;}}';
        document.head.appendChild(css);
        const box = document.createElement('div');
        box.className = 'erj-tournav';
        box.setAttribute('aria-label', 'Tour navigation');
        box.innerHTML =
            '<button type="button" data-dir="-1" aria-label="Previous section" title="Previous section">' +
                '<svg viewBox="0 0 24 24"><polyline points="6 15 12 9 18 15"></polyline></svg></button>' +
                '<button type="button" data-dir="1" aria-label="Next section" title="Next section">' +
                '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>';
        const labels = nav.onPage
            .filter(s => s && s.href && s.href.charAt(0) === '#' && document.querySelector(s.href))
            .map(s => s.label);
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'erj-tournext';
        pill.setAttribute('aria-label', 'Go to the next section');
        /* Seyi, the facilitator, points the way: the tour feels guided, not mechanical */
        pill.innerHTML = '<img src="' + (nav.base || '') + 'photo-seyi-face.webp" alt="" width="26" height="26" decoding="async"><i>Next</i><b></b>';
        box.appendChild(pill);
        document.body.appendChild(box);
        const upBtn = box.children[0];
        const downBtn = box.children[1];
        /* the down arrow glows until it has been used once */
        let hinted = false;
        try { hinted = localStorage.getItem('erj-tour-used') === '1'; } catch (e) { /* noop */ }
        if (!hinted) downBtn.classList.add('is-hint');
        const used = () => { downBtn.classList.remove('is-hint'); try { localStorage.setItem('erj-tour-used', '1'); } catch (e) { /* noop */ } };
        let pillTimer = 0, settleTimer = 0, lastShown = -2;
        /* Phones: the pill would sit over the text, so it waits until scrolling
           settles, shows only when the section has changed, and leaves after 1.8s.
           Desktop keeps it beside the arrows for 2.6s, in the empty margin. */
        const small = window.matchMedia ? window.matchMedia('(max-width:768px)') : { matches: false };
        const reveal = (idx) => {
            const nxt = labels[idx + 1];
            if (!nxt) { pill.classList.remove('on'); return; }
            pill.querySelector('b').textContent = nxt;
            pill.classList.add('on');
            lastShown = idx;
            clearTimeout(pillTimer);
            pillTimer = setTimeout(() => pill.classList.remove('on'), small.matches ? 1800 : 2600);
        };
        const showNext = (idx) => {
            if (!small.matches) { reveal(idx); return; }
            pill.classList.remove('on');
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => { if (idx !== lastShown) reveal(idx); }, 260);
        };
        const OFFSET = 84;
        const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        /* Cached: this ran getBoundingClientRect() for every stop on every scroll
           frame, forcing a re-layout each time. Recompute on resize instead. */
        let _tops = null;
        const tops = () => (_tops || (_tops = stops.map(el => el.getBoundingClientRect().top + window.pageYOffset - OFFSET)));
        window.addEventListener('resize', () => { _tops = null; }, { passive: true });
        /* sections that render lazily (content-visibility) change height as they
           come near the screen: forget the measurements whenever the page grows */
        if ('ResizeObserver' in window) new ResizeObserver(() => { _tops = null; }).observe(document.body);
        /* images and fonts move sections after the first measurement: measure again */
        window.addEventListener('load', () => { _tops = null; setTimeout(() => { _tops = null; }, 1500); }, { once: true });
        const currentIndex = () => {
            const y = window.pageYOffset;
            const t = tops();
            let idx = -1;
            for (let i = 0; i < t.length; i++)
                if (y >= t[i] - 4)
                    idx = i;
            return idx;
        };
        /* On the very first sync — which happens during load, before the user
           has scrolled anywhere — we deliberately do NOT call currentIndex().
           It measures every scroll stop on the page with getBoundingClientRect,
           forcing a full layout: 92 ms on a throttled phone, spent working out
           something we already know (at the top of the page, "down" is always
           available). Measure on the first real scroll instead. */
        let _measured = false;
        const sync = () => {
            const atTop = window.pageYOffset < 8;
            upBtn.disabled = atTop;
            if (!_measured && atTop) {
                downBtn.disabled = stops.length === 0;
                return;
            }
            _measured = true;
            const ci = currentIndex();
            downBtn.disabled = ci >= stops.length - 1;
            if (!atTop) showNext(ci);
        };
        const go = (dir) => {
            const idx = currentIndex();
            let next = Math.min(stops.length - 1, Math.max(0, idx + dir));
            if (idx === -1 && dir === 1)
                next = 0;
            if (idx === -1 && dir === -1) {
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
                return;
            }
            if (idx === 0 && dir === -1) {
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
                sync();
                return;
            }
            _tops = null;
            window.scrollTo({ top: tops()[next], behavior: reduced ? 'auto' : 'smooth' });
            /* land exactly: if sections above finished rendering on the way down,
               the target moved, so settle onto it once the scroll is done */
            const target = stops[next];
            setTimeout(() => {
                _tops = null;
                const off = target.getBoundingClientRect().top - OFFSET;
                if (Math.abs(off) > 24) window.scrollBy({ top: off, behavior: 'auto' });
                sync();
            }, reduced ? 60 : 900);
            setTimeout(sync, 350);
        };
        upBtn.addEventListener('click', () => go(-1));
        downBtn.addEventListener('click', () => { used(); go(1); });
        pill.addEventListener('click', () => { used(); go(1); });
        /* any link into the page tour (e.g. "Start the tour") counts as starting it */
        document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('#htStart,.f-stop'); if (a) used(); });
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking)
                return;
            ticking = true;
            requestAnimationFrame(() => { sync(); ticking = false; });
        }, { passive: true });
        /* Not sync() — even reading window.pageYOffset here forces the browser
           to finish laying out the page before it can answer, and that cost
           108 ms during load. The honest starting state needs no measurement:
           a page opens at the top, so "up" is off and "down" is on. The first
           scroll, or the load event, corrects it. */
        upBtn.disabled = true;
        downBtn.disabled = stops.length === 0;
        window.addEventListener('load', () => { requestAnimationFrame(sync); }, { once: true });
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', mount);
    else
        mount();
})();

/* ── REFRESH BUTTON ("cookie") ────────────────────────────────────
   Bottom-left, mirroring the WhatsApp button. For a visitor stuck on an
   old copy of the site: it empties the site's caches, retires the
   service worker and reloads. It never touches localStorage, so sign-in,
   progress and the theme survive. Decorative-safe: no page depends on it. */
(function () {
    if (window.ERJ_NO_REFRESH || document.getElementById('erjCk')) return;
    function mount() {
        try { var cu = new URL(location.href); if (cu.searchParams.has('fresh')) { cu.searchParams.delete('fresh'); history.replaceState(history.state, '', cu.toString()); } } catch (e) {}
        var css = document.createElement('style');
        css.id = 'erjCkCSS';
        css.textContent =
            '.erj-ck{position:fixed;left:22px;bottom:22px;z-index:49;width:50px;height:50px;border-radius:50%;border:0;cursor:pointer;padding:0;' +
            'background:#141210;display:flex;align-items:center;justify-content:center;isolation:isolate;' +
            'box-shadow:0 10px 28px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.06);transition:transform .35s cubic-bezier(.22,1,.36,1),bottom .3s,box-shadow .3s;}' +
            '.erj-ck::before{content:"";position:absolute;inset:-2px;border-radius:50%;z-index:-1;' +
            'background:conic-gradient(from 0deg,#FF5722,#FFB25C,#FF5722 40%,rgba(255,87,34,.15) 60%,#FF5722);' +
            '-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));}' +
            'html[data-theme="day"] .erj-ck{background:#fff;box-shadow:0 10px 26px rgba(20,17,14,.18);}' +
            '.erj-ck>svg{width:30px;height:30px;display:block;transition:transform .5s cubic-bezier(.22,1,.36,1);}' +
            '.erj-ck .erj-ck-b{position:absolute;right:-3px;bottom:-3px;width:20px;height:20px;border-radius:50%;background:#FF5722;color:#fff;' +
            'display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #141210;}' +
            'html[data-theme="day"] .erj-ck .erj-ck-b{box-shadow:0 0 0 2px #fff;}' +
            '.erj-ck .erj-ck-b svg{width:12px;height:12px;}' +
            '.erj-ck:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(255,87,34,.35);}' +
            '.erj-ck:hover>svg{transform:rotate(-20deg) scale(1.08);}' +
            '.erj-ck:focus-visible{outline:2px solid #FF5722;outline-offset:4px;}' +
            '@media(prefers-reduced-motion:no-preference){.erj-ck::before{animation:erjCkRing 6s linear infinite}.erj-ck>svg{animation:erjCkNib 7s ease-in-out 3s infinite}}' +
            '@keyframes erjCkRing{to{transform:rotate(360deg)}}' +
            '@keyframes erjCkNib{0%,86%,100%{transform:none}90%{transform:rotate(-14deg) scale(1.1)}94%{transform:rotate(8deg)}}' +
            '.erj-ck.spin .erj-ck-b svg{animation:erjCkSpin .7s linear infinite;}@keyframes erjCkSpin{to{transform:rotate(360deg)}}' +
            'body.sticky-on .erj-ck{bottom:72px;}' +
            '.erj-ck-pop{position:fixed;left:22px;bottom:86px;z-index:1200;width:min(290px,calc(100vw - 44px));padding:1rem 1rem .9rem;border-radius:16px;' +
            'background:#111;color:#fff;border:1px solid rgba(232,178,106,.6);box-shadow:0 22px 50px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;' +
            'transform:translateY(12px);opacity:0;visibility:hidden;transition:transform .3s,opacity .3s,visibility 0s .3s;}' +
            'html[data-theme="day"] .erj-ck-pop{background:#fff;color:#14110E;box-shadow:0 18px 44px rgba(20,17,14,.18);}' +
            '.erj-ck-pop.on{transform:none;opacity:1;visibility:visible;transition:transform .3s,opacity .3s;}' +
            'body.sticky-on .erj-ck-pop{bottom:136px;}' +
            '.erj-ck-pop b{display:block;font-size:.95rem;margin-bottom:.3rem;}.erj-ck-pop p{margin:0 0 .8rem;font-size:.8rem;line-height:1.45;opacity:.8;}' +
            '.erj-ck-go{border:0;cursor:pointer;width:100%;padding:.65rem;border-radius:999px;background:#FF5722;color:#fff;font:700 .86rem/1 Inter,system-ui,sans-serif;}' +
            '.erj-ck-x{position:absolute;top:6px;right:8px;border:0;background:none;color:inherit;opacity:.6;cursor:pointer;font-size:.9rem;}' +
            '.pz-float{left:84px!important;}' +
            '@media print{.erj-ck,.erj-ck-pop{display:none!important}}' +
            '@media(prefers-reduced-motion:reduce){.erj-ck,.erj-ck-pop{transition:none}.erj-ck.spin .erj-ck-b svg{animation:none}}';
        document.head.appendChild(css);
        var btn = document.createElement('button');
        btn.className = 'erj-ck'; btn.id = 'erjCk'; btn.type = 'button';
        btn.setAttribute('aria-label', 'Refresh the site');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('title', 'Seeing an old version? Tap to refresh the site');
        btn.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="erjCkG" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#FFB25C"/><stop offset="1" stop-color="#FF5722"/></linearGradient>' +
            '<mask id="erjCkM"><rect width="32" height="32" fill="#fff"/><circle cx="27" cy="6" r="6" fill="#000"/><circle cx="21.5" cy="3" r="3" fill="#000"/></mask></defs>' +
            '<circle cx="16" cy="16" r="13" fill="url(#erjCkG)" mask="url(#erjCkM)"/>' +
            '<g fill="#5A1E05"><circle cx="11" cy="12" r="1.9"/><circle cx="18" cy="18" r="2.1"/><circle cx="10.5" cy="20.5" r="1.6"/><circle cx="21" cy="11.5" r="1.4"/><circle cx="15.5" cy="24" r="1.3"/></g></svg>' +
            '<span class="erj-ck-b" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg></span>';
        var pop = document.createElement('div');
        pop.className = 'erj-ck-pop'; pop.id = 'erjCkPop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Refresh the site');
        pop.innerHTML = '<b>Refreshing\u2026</b><p>Loading the latest version of the site.</p>';
        document.body.appendChild(btn);
        document.body.appendChild(pop);
        var busy = false;
        btn.addEventListener('click', function () {
            if (busy) return; busy = true;
            pop.classList.add('on'); btn.classList.add('spin'); btn.setAttribute('aria-busy', 'true');
            var jobs = [];
            try { if (window.caches && caches.keys) jobs.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })); } catch (e) {}
            try { if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })); } catch (e) {}
            var gone = false, done = function () {
                if (gone) return; gone = true;
                var u = new URL(location.href);
                u.searchParams.set('fresh', Date.now().toString(36));
                location.replace(u.toString());
            };
            Promise.all(jobs).then(done, done);
            setTimeout(done, 4000);
        });
        /* sit level with the WhatsApp button, wherever a page puts it */
        var raf = 0;
        function sync() {
            raf = 0;
            var w = document.querySelector('.wa-float');
            if (!w) return;
            var r = w.getBoundingClientRect();
            if (!r.height || getComputedStyle(w).display === 'none') return;
            var size = btn.offsetHeight || 50;
            btn.style.bottom = Math.max(8, Math.round(innerHeight - r.bottom + (r.height - size) / 2)) + 'px';
            pop.style.bottom = (parseFloat(btn.style.bottom) + size + 12) + 'px';
        }
        function queue() { if (!raf) raf = requestAnimationFrame(sync); }
        addEventListener('scroll', queue, { passive: true });
        addEventListener('resize', queue);
        try { new MutationObserver(function () { queue(); setTimeout(queue, 350); }).observe(document.body, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
        addEventListener('load', queue); setTimeout(queue, 600); queue();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
})();
