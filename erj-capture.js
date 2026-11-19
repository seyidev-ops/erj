"use strict";
/* ═══════════════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB · CAPTURE LAYER  (erj-capture.ts)
   Compile:  tsc erj-capture.ts --target es2017 --strict --lib es2017,dom

   WHY THIS FILE EXISTS
   The two busiest free assets on this site produce no reachable
   people. A WhatsApp CHANNEL is one-way broadcast — no member list,
   no replies. The CV self-scan runs entirely on-device and stores
   nothing, deliberately. Both promises are worth keeping, so this
   layer does NOT break them. It adds one identified action the
   visitor CHOOSES to take: a prefilled WhatsApp message they send
   themselves. They keep their privacy; we get a conversation.

   Four jobs, all driven by window.ERJ_CONFIG:
     1. scan   — "download your result" and a score-matched "I need your help" card on the CV scan result
     2. bridge — a reply route beside every one-way channel link
     3. evergreen — a door that opens today, under every countdown
     4. capacity — honest placement capacity, rendered from config
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const CFG = window.ERJ_CONFIG;
    if (!CFG)
        return;
    const base = (window.ERJ_NAV && typeof window.ERJ_NAV.base === 'string') ? window.ERJ_NAV.base : '';
    /* ── helpers ─────────────────────────────────────────────── */
    function fill(tpl, vars) {
        if (!vars)
            return tpl;
        return tpl.replace(/\{(\w+)\}/g, (m, k) => Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m);
    }
    function waLink(templateKey, vars) {
        const tpl = CFG.messages[templateKey] || '';
        return 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(fill(tpl, vars));
    }
    function el(tag, cls, html) {
        const n = document.createElement(tag);
        if (cls)
            n.className = cls;
        if (html !== undefined)
            n.innerHTML = html;
        return n;
    }
    /* ── self-contained styling ───────────────────────────────
       blog.html and testimonials.html carry bespoke stylesheets and
       do NOT load product.css — but they DO define the same custom
       properties. So the capture components ship their own CSS and
       inherit the host page's tokens, with literal fallbacks for any
       page that defines neither. Injected once, guarded by id. */
    const CSS = `
.cap-btn{display:inline-flex;align-items:center;gap:.6rem;padding:.95rem 1.5rem;
 background:var(--accent,#FF5722);color:#fff;border:1px solid var(--accent,#FF5722);border-radius:2px;
 font-family:var(--font-display,system-ui,sans-serif);font-size:.82rem;font-weight:700;
 text-decoration:none;cursor:pointer;transition:transform .25s cubic-bezier(.22,1,.36,1),background .25s ease;}
.cap-btn:hover{background:var(--accent-h,#ff6f43);transform:translateY(-2px);}
.cap-btn svg{width:17px;height:17px;fill:currentColor;flex:0 0 auto;}
/* .small is 0.75rem — far below the 18.66px that white-on-orange needs to
   pass WCAG. So it drops the solid fill and becomes an orange outline,
   which reads with the same weight and passes contrast at any size. */
.cap-btn.small{padding:.7rem 1.1rem;font-size:.75rem;margin-top:1rem;
  background:transparent;color:var(--accent,#FF5722);border-color:var(--accent,#FF5722);}
.cap-btn.small:hover{background:var(--accent,#FF5722);color:#fff;}
.cap-btn.ghost{background:transparent;color:var(--ink,#fff);border-color:var(--line,rgba(128,128,128,.3));}
.cap-btn.ghost:hover{background:transparent;border-color:var(--accent,#FF5722);color:var(--accent,#FF5722);}
.cap-send{margin:2.2rem 0 .4rem;padding:1.5rem 1.6rem;background:var(--card,rgba(128,128,128,.06));
 border:1px solid var(--card-line,rgba(128,128,128,.2));border-left:3px solid var(--accent,#FF5722);border-radius:2px;}
.cap-dl{margin:1.4rem 0 0;padding:1.4rem 1.6rem;border:1px solid var(--accent,#FF5722);border-radius:12px;
 background:var(--card,rgba(128,128,128,.06));display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.4rem;}
.cap-dl-copy{flex:1 1 260px;min-width:0;}
.cap-dl-k{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5722);margin-bottom:.4rem;}
.cap-dl-copy p{font-size:.92rem;line-height:1.6;color:var(--ink-soft,#a1a1a1);}
.cap-dl-copy p b{color:var(--ink,#fff);}
.cap-dl-copy small{display:block;margin-top:.4rem;font-size:.74rem;color:var(--ink-faint,#8a8a8a);}
.cap-dl-btn{flex:none;border-radius:999px;box-shadow:0 0 0 0 rgba(255,87,34,.5);animation:capPulse 2.6s ease-out infinite;}
@keyframes capPulse{0%{box-shadow:0 0 0 0 rgba(255,87,34,.5);}70%,100%{box-shadow:0 0 0 14px rgba(255,87,34,0);}}
.cap-help-k{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5722);margin-bottom:.5rem;}
.cap-help-head{font-family:var(--font-display,system-ui,sans-serif);font-weight:800;font-size:1.2rem;line-height:1.3;color:var(--ink,#fff);margin-bottom:.4rem;}
.cap-help-lead{font-size:.92rem;line-height:1.65;color:var(--ink-soft,#a1a1a1);max-width:60ch;}
.cap-opts{display:grid;gap:.9rem;margin-top:1.2rem;}
.cap-opt{padding:1.1rem 1.15rem 1.15rem;border:1px solid var(--card-line,rgba(128,128,128,.25));border-radius:16px;
 background:var(--paper-2,rgba(128,128,128,.04));}
.cap-opt-top{display:flex;align-items:flex-start;gap:.85rem;}
.cap-let{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--accent,#FF5722);
 color:var(--accent,#FF5722);font-weight:800;font-size:.9rem;}
.cap-opt-tx{flex:1;min-width:0;}
.cap-opt-t{display:block;font-weight:700;font-size:1.02rem;color:var(--ink,#fff);}
.cap-opt-d{display:block;margin-top:.2rem;font-size:.84rem;line-height:1.55;color:var(--ink-soft,#a1a1a1);}
.cap-go{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:.7rem;width:100%;min-height:54px;
 margin-top:1rem;padding:.9rem 1.2rem;border:0;border-radius:999px;cursor:pointer;text-decoration:none;color:#fff;
 font-family:var(--font-display,system-ui,sans-serif);font-weight:800;font-size:1.05rem;line-height:1.1;
 background:linear-gradient(135deg,#FF6A2B,#FF5722 55%,#D93D0C);
 box-shadow:0 14px 30px -12px rgba(255,87,34,.8),inset 0 1px 0 rgba(255,255,255,.35);
 transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease;-webkit-tap-highlight-color:transparent;}
.cap-go:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 20px 40px -12px rgba(255,87,34,.95),inset 0 1px 0 rgba(255,255,255,.4);}
.cap-go:active{transform:scale(.97);}
.cap-go:focus-visible{outline:3px solid var(--ink,#fff);outline-offset:3px;}
.cap-go svg{flex:none;width:21px;height:21px;fill:#fff;}
.cap-go .arrow{display:inline-block;transition:transform .25s cubic-bezier(.22,1,.36,1);}
.cap-go:hover .arrow{transform:translateX(5px);}
.cap-go::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:38%;pointer-events:none;
 background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);
 animation:capShine 3.6s ease-in-out infinite;}
.cap-opt:nth-child(2) .cap-go::after{animation-delay:.9s;}
@keyframes capShine{0%,55%{left:-60%;}100%{left:135%;}}
.cap-more{display:flex;align-items:center;justify-content:center;gap:.6rem;width:100%;min-height:50px;margin-top:1rem;padding:.8rem 1.1rem;
 border:2px solid var(--accent,#FF5722);border-radius:999px;background:rgba(255,87,34,.1);color:var(--accent,#FF5722);
 font-family:var(--font-display,system-ui,sans-serif);font-weight:800;font-size:.95rem;line-height:1.2;text-align:center;text-decoration:none;
 transition:transform .25s cubic-bezier(.22,1,.36,1),background .25s ease,color .25s ease;}
.cap-more:hover{transform:translateY(-2px);background:var(--accent,#FF5722);color:#fff;}
.cap-more svg{flex:none;width:19px;height:19px;fill:currentColor;}
@media print{.cap-dl,.cap-send{display:none!important;}}
@media(prefers-reduced-motion:reduce){.cap-dl-btn{animation:none;}.cap-go,.cap-more{transition:none;}.cap-go::after{animation:none;display:none;}}
.cap-note{margin-top:.9rem;font-size:.78rem;line-height:1.65;color:var(--ink-faint,#8a8a8a);max-width:56ch;}
.cap-note b{color:var(--ink-soft,#a1a1a1);font-weight:600;}
.cap-bridge{margin-top:.7rem;padding-left:.9rem;border-left:2px solid var(--accent,#FF5722);
 font-size:.84rem;line-height:1.6;}
.cap-bridge-k{display:block;font-size:.63rem;letter-spacing:.18em;text-transform:uppercase;
 color:var(--ink-faint,#8a8a8a);margin-bottom:.25rem;}
.cap-bridge a{color:var(--accent,#FF5722);font-weight:600;text-decoration:none;
 border-bottom:1px solid transparent;transition:border-color .2s ease;}
.cap-bridge a:hover{border-bottom-color:var(--accent,#FF5722);}
.evergreen{margin-top:1.6rem;padding:1.4rem 1.5rem;border:1px dashed var(--line,rgba(128,128,128,.3));
 border-radius:2px;background:var(--paper-2,rgba(128,128,128,.05));}
.eg-k{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5722);margin-bottom:.55rem;}
.eg-lead{font-size:.9rem;line-height:1.65;color:var(--ink-soft,#a1a1a1);}
.eg-lead b{color:var(--ink,#fff);font-weight:600;}
.eg-doors{display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;margin-top:.9rem;}
/* When the block sits inside a centred section (register hero, home countdown),
   the kicker and lead already centre by inheritance — the flex row of doors did
   not, which left it visibly tilted to the left. eg-center is set in JS from the
   host's real computed text-align, so left-aligned pages are untouched. */
.evergreen.eg-center{text-align:center;}
.evergreen.eg-center .eg-lead{margin-left:auto;margin-right:auto;}
.evergreen.eg-center .eg-doors{justify-content:center;}
.eg-doors a{font-size:.82rem;font-weight:600;color:var(--accent,#FF5722);text-decoration:none;
 border-bottom:1px solid transparent;transition:border-color .2s ease;}
.eg-doors a:hover{border-bottom-color:var(--accent,#FF5722);}
.cap-bar{margin-top:1.6rem;padding:1.4rem 1.5rem;background:var(--card,rgba(128,128,128,.06));
 border:1px solid var(--card-line,rgba(128,128,128,.2));border-radius:2px;}
.cb-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.5rem;}
.cb-k{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5722);}
.cb-n{font-size:.88rem;color:var(--ink-soft,#a1a1a1);}
.cb-n b{font-family:var(--font-display,system-ui,sans-serif);font-size:1.5rem;font-weight:800;
 color:var(--ink,#fff);margin-right:.15rem;}
.cb-track{height:5px;background:var(--line-soft,rgba(128,128,128,.15));border-radius:3px;
 overflow:hidden;margin:.9rem 0 .8rem;}
.cb-track span{display:block;height:100%;background:var(--accent,#FF5722);border-radius:3px;
 transition:width .8s cubic-bezier(.22,1,.36,1);}
.cb-why{font-size:.8rem;line-height:1.65;color:var(--ink-faint,#8a8a8a);max-width:60ch;}
.cap-read{margin-top:2.4rem;padding:1.8rem;background:var(--card,rgba(128,128,128,.06));
 border:1px solid var(--card-line,rgba(128,128,128,.2));border-top:3px solid var(--accent,#FF5722);border-radius:2px;}
.cr-k{font-family:var(--font-display,system-ui,sans-serif);font-weight:800;font-size:1.05rem;
 color:var(--ink,#fff);margin-bottom:.5rem;}
.cap-read p{font-size:.9rem;line-height:1.7;color:var(--ink-soft,#a1a1a1);max-width:62ch;}
.cr-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.2rem;}
.cap-btn .arrow{display:inline-block;transition:transform .25s cubic-bezier(.22,1,.36,1);}
.cap-btn:hover .arrow{transform:translateX(4px);}
@media(prefers-reduced-motion:reduce){.cap-btn,.cb-track span,.cap-btn .arrow{transition:none;}}
`;
    function injectCss() {
        if (document.getElementById('erj-capture-css'))
            return;
        const style = document.createElement('style');
        style.id = 'erj-capture-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }
    const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>';
    /* ═══ 1 · CV SCAN CAPTURE ═════════════════════════════════
       The scan re-renders whenever the job description changes, so
       the button is (re)injected by observer rather than once. We
       read the score straight out of the rendered DOM — the scan
       module keeps its own state private and we do not touch it. */
    function scanCapture() {
        const results = document.getElementById('results');
        if (!results)
            return;
        /* The guard below must look where the node actually LANDS. The button is
           inserted as a SIBLING before .results-actions, never inside it, so the
           old check (actions.querySelector) could never find it. Every insertion
           therefore re-fired this observer, which injected again, forever — an
           infinite loop that locked the main thread and produced Chrome's "Page
           Unresponsive" dialog the moment a CV finished parsing. The score dial
           animates its own text for ~900ms too, so the observer fires on every
           frame regardless; the guard has to be cheap and correct. */
        let mo = null;
        const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const tierFor = (score) => {
            const tiers = (CFG.scanHelp && CFG.scanHelp.tiers) || [];
            for (let i = 0; i < tiers.length; i++)
                if (score >= tiers[i].min)
                    return tiers[i];
            return tiers[tiers.length - 1];
        };
        const inject = () => {
            const actions = results.querySelector('.results-actions');
            if (!actions || results.querySelector('.cap-send'))
                return;
            const dial = results.querySelector('.dial-num');
            const score = dial ? (dial.dataset.target || '0') : '0';
            const defaults = Array.from(results.querySelectorAll('.default-list li'))
                .map(li => (li.textContent || '').replace(/^\d+/, '').trim())
                .filter(Boolean);
            const left = defaults.length ? defaults.join('; ') : 'none, I cleared all ten';
            const tier = tierFor(Number(score));
            // 1 · the result is on the page: say so, and make the download impossible to miss
            const dl = el('div', 'cap-dl');
            dl.innerHTML =
                '<div class="cap-dl-copy"><div class="cap-dl-k">Your result is ready</div>' +
                    '<p><b>This is your result.</b> Download it to keep: your score, the points to fix and how to fix each one.</p>' +
                    '<small>On the print screen, choose \u201cSave as PDF\u201d.</small></div>' +
                    '<button type="button" class="cap-btn cap-dl-btn"><span>Download my result</span> <span class="arrow">\u2193</span></button>';
            dl.querySelector('button').addEventListener('click', () => window.print());
            // 2 · ask for help with the problem the score points to, one tap per route
            const wrap = el('div', 'cap-send');
            let opts = '';
            let list = '';
            tier.options.forEach((o, i) => {
                const letter = String.fromCharCode(65 + i);
                list += letter + '. ' + o.label + '\n';
                const href = waLink('scanHelp', { score: score, defaults: left, want: o.label + ': ' + o.want.replace(/^[^:]*:\s*/, '') });
                opts += '<div class="cap-opt"><div class="cap-opt-top"><span class="cap-let">' + letter + '</span>' +
                    '<span class="cap-opt-tx"><span class="cap-opt-t">' + esc(o.label) + '</span><span class="cap-opt-d">' + esc(o.what) + '</span></span></div>' +
                    '<a class="cap-go" href="' + href + '" target="_blank" rel="noopener">' + WA_ICON +
                    '<span>' + esc(o.cta || ('Choose ' + o.label)) + '</span><span class="arrow">\u2192</span></a></div>';
            });
            const unsure = tier.options.length > 1
                ? '<a class="cap-more" href="' + waLink('scanChoose', { score: score, defaults: left, options: list.trim() }) +
                    '" target="_blank" rel="noopener">' + WA_ICON + '<span>Not sure which? Message us and we will help you choose</span></a>'
                : '';
            wrap.innerHTML =
                '<div class="cap-help-k">What next</div>' +
                    '<div class="cap-help-head">' + esc(tier.head) + '</div>' +
                    '<p class="cap-help-lead">' + esc(tier.lead) + '</p>' +
                    '<div class="cap-opts">' + opts + '</div>' + unsure +
                    '<p class="cap-note">Your CV stays on this device \u2014 always. Tapping a choice opens your own WhatsApp with ' +
                    'your <b>score</b> and the point names filled in. You decide whether to send it.</p>';
            // Stop watching while we mutate, so our own insertion cannot re-enter.
            if (mo)
                mo.disconnect();
            const panel = results.querySelector('.score-panel');
            if (panel && panel.parentNode) {
                panel.parentNode.insertBefore(dl, panel.nextSibling);
                dl.parentNode.insertBefore(wrap, dl.nextSibling);
            }
            else
                actions.parentNode.insertBefore(wrap, actions);
            if (mo)
                mo.observe(results, { childList: true, subtree: true });
        };
        mo = new MutationObserver(inject);
        inject();
        mo.observe(results, { childList: true, subtree: true });
    }
    /* ═══ 2 · CHANNEL BRIDGE ══════════════════════════════════
       Campaign rule only. "Jobs are the feed. Diagnosis is the next step."
       belongs in the internal conversion playbook, not in permanent public
       navigation or the Free For You menu. AUDIT remains available through
       diagnosis results, job-post footers, campaign posts and clinic flows. */
    function channelBridge() { return; }
    /* ═══ 3 · EVERGREEN DOORS ═════════════════════════════════
       A countdown tells a ready buyer to wait. Most who wait never
       return. Every countdown panel now names a door that is open
       today — the gate becomes one option, not the only one. */
    function evergreenDoors() {
        const panels = Array.from(document.querySelectorAll('[data-deadline]'));
        if (!panels.length)
            return;
        const seen = new Set();
        const pending = [];
        panels.forEach(panel => {
            if (panel.hasAttribute('data-no-evergreen'))
                return;
            const host = panel.closest('section, .timer-card, .cd-card, div') || panel;
            if (seen.has(host) || host.querySelector('.evergreen'))
                return;
            seen.add(host);
            const doors = CFG.evergreen.doors
                .map(d => '<a href="' + base + d.href + '">' + d.label + ' <span class="arrow">\u2192</span></a>')
                .join('');
            /* Follow the host's alignment. A centred hero (register.html) or a
               centred countdown section should centre the doors too; a
               left-aligned page must stay left. Read it, never assume it.

               READ NOW, WRITE LATER. Reading getComputedStyle and inserting a
               node in the same iteration forces a synchronous style-and-layout
               pass on every loop, because each insertion dirties the DOM that
               the next read has to resolve. Lighthouse measured 2.8 SECONDS of
               main-thread time against this file for 23ms of actual script.
               Every read is done first, against a clean DOM; the writes are
               batched afterwards. */
            let centred = false;
            try {
                const ref = (panel.parentNode && panel.parentNode.nodeType === 1)
                    ? panel.parentNode : panel;
                centred = getComputedStyle(ref).textAlign === 'center';
            }
            catch (e) { }
            pending.push({ panel: panel, centred: centred, doors: doors });
        });
        pending.forEach(function (job) {
            const box = el('div', 'evergreen reveal in' + (job.centred ? ' eg-center' : ''));
            box.innerHTML =
                '<div class="eg-k">Not waiting for a gate?</div>' +
                    '<p class="eg-lead"><b>' + CFG.evergreen.lead + '</b> ' + CFG.evergreen.body + '</p>' +
                    '<div class="eg-doors">' + job.doors + '</div>';
            job.panel.parentNode.insertBefore(box, job.panel.nextSibling);
        });
    }
    /* ═══ 4 · HONEST CAPACITY ═════════════════════════════════
       The placement promise costs human hours per student, so the
       scarcity is real. Any element with data-erj-capacity renders
       its live figure from config — one place to update. */
    function capacityLines() {
        const nodes = Array.from(document.querySelectorAll('[data-erj-capacity]'));
        /* CFG.capacity was removed deliberately — the figures were static and
           shown as a live reading. Guard so a re-added host node renders
           nothing rather than a stale number. */
        if (!nodes.length || !CFG.capacity)
            return;
        nodes.forEach(node => {
            const kind = node.dataset.erjCapacity === 'innercircle' ? 'innercircle' : 'placement';
            const total = kind === 'innercircle' ? CFG.capacity.innerCircleTotal : CFG.capacity.placementTotal;
            const taken = kind === 'innercircle' ? CFG.capacity.innerCircleTaken : CFG.capacity.placementTaken;
            const open = Math.max(0, total - taken);
            const noun = kind === 'innercircle' ? 'residency seats' : 'placement engagements';
            const why = kind === 'innercircle'
                ? 'The room co-applies with you in real time. That is a number of people, not a marketing figure.'
                : 'That is how many people we can source, apply and prep for while keeping the promise \u2014 not a marketing figure.';
            const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
            node.classList.add('cap-bar');
            node.innerHTML =
                '<div class="cb-head"><span class="cb-k">Live capacity</span>' +
                    '<span class="cb-n"><b>' + open + '</b> of ' + total + ' ' + noun + ' open</span></div>' +
                    '<div class="cb-track"><span style="width:' + pct + '%"></span></div>' +
                    '<p class="cb-why">' + why + ' When it fills, the honest answer is a waitlist \u2014 never a quieter promise.</p>' +
                    (open > 0
                        ? '<a class="cap-btn small" href="' + waLink('capacity') + '" target="_blank" rel="noopener">' +
                            WA_ICON + '<span>Ask for one of the open places</span></a>'
                        : '<a class="cap-btn small" href="' + waLink('capacity') + '" target="_blank" rel="noopener">' +
                            WA_ICON + '<span>Join the waitlist</span></a>');
        });
    }
    /* ═══ 5 · READING CTA ═════════════════════════════════════
       A reader who finishes something is warm for a few seconds.
       Any element with data-erj-cta gets one action — not a menu. */
    function readingCta() {
        const nodes = Array.from(document.querySelectorAll('[data-erj-cta]'));
        nodes.forEach(node => {
            if (node.querySelector('.cap-read'))
                return;
            const box = el('div', 'cap-read');
            box.innerHTML =
                '<div class="cr-k">Before you close this tab</div>' +
                    '<p>Score your CV free in 90 seconds \u2014 it runs on your own device \u2014 then send me the ' +
                    'number and I\u2019ll tell you the single fix that moves it most.</p>' +
                    '<div class="cr-actions">' +
                    '<a class="cap-btn" href="' + base + 'cvscan/">Score my CV free <span class="arrow">\u2192</span></a>' +
                    '<a class="cap-btn ghost" href="' + waLink('blog') + '" target="_blank" rel="noopener">' +
                    WA_ICON + '<span>Ask me where to start</span></a></div>';
            node.appendChild(box);
        });
    }
    /* ── boot ────────────────────────────────────────────────── */
    function boot() {
        try {
            injectCss();
        }
        catch (e) { /* never break the page */ }
        try {
            scanCapture();
        }
        catch (e) { }
        try {
            channelBridge();
        }
        catch (e) { }
        try {
            evergreenDoors();
        }
        catch (e) { }
        try {
            capacityLines();
        }
        catch (e) { }
        try {
            readingCta();
        }
        catch (e) { }
    }
    window.ERJ_CAPTURE = {
        waLink: waLink,
        refresh: boot
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    }
    else {
        boot();
    }
})();
