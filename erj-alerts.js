/* ERJ alerts: a bell button that turns on notifications for this device.
   Two topics: new jobs (the job board) and new blog posts (the blog). Put
   <span data-erj-alerts data-topic="jobs"></span> where the button should sit
   (data-topic="posts" on the blog; data-erj-alerts="icon" for the small round one).

   Two ways an alert reaches a device:
   1. OneSignal, when ERJ_CONFIG.push.onesignalAppId is filled. The publishing
      workflows call push-alerts.py, which pushes to everyone tagged with the
      topic the moment new entries go live, app open or closed. Its script
      loads only when someone has alerts on or taps the bell, and its worker
      lives in /push/onesignal/ so it never competes with /sw.js.
   2. On the device only, when no App ID is set or that script cannot load:
      sw.js reads the small feeds (jobs/data/latest.json, blog/latest.json) and
      notifies about entries this device has not seen, in the background where
      the browser allows Periodic Background Sync for the installed app,
      otherwise when a page of the site is opened.
   The panel says which of the two this device gets. No email, no sign-up.
   Decorative-safe: no page depends on it. */
(function () {
  'use strict';
  var mounts = document.querySelectorAll('[data-erj-alerts]');
  if (!mounts.length) return;
  var CFG = window.ERJ_CONFIG || {};
  var APP_ID = (CFG.push && CFG.push.onesignalAppId) || '';
  var CHANNEL = CFG.channel || 'https://whatsapp.com/channel/0029Vaym4DE3mFY2wCrC713S';
  var TOPICS = {
    jobs: { off: 'Get new-job alerts', on: 'Job alerts on', name: 'Job alerts', ask: 'Be told when new jobs go up', go: 'Turn on job alerts',
      what: 'The board is updated twice a day. Turn alerts on and this device will notify you when new remote roles open to Nigeria are added.',
      thing: 'new remote roles open to Nigeria', each: 'new roles', onTitle: 'Job alerts are on', onBody: 'This device will tell you when new remote roles open to Nigeria go up on the board.' },
    posts: { off: 'Get new-post alerts', on: 'Post alerts on', name: 'Blog alerts', ask: 'Be told when a new post goes up', go: 'Turn on post alerts',
      what: 'A new post goes up every day. Turn alerts on and this device will notify you when it does.',
      thing: 'a new post on the blog', each: 'new posts', onTitle: 'Blog alerts are on', onBody: 'This device will tell you when a new post goes up on the ERJ blog.' }
  };
  var canNotify = 'Notification' in window && 'serviceWorker' in navigator;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var background = false, installEvt = null, pop = null, openFrom = null, busy = false;
  var push = !!APP_ID; // false again if the OneSignal script cannot load
  function key(t) { return 'erj-alerts-' + t; }
  function flag(t) { try { return localStorage.getItem(key(t)) === '1'; } catch (e) { return false; } }
  function setFlag(t, on) { try { on ? localStorage.setItem(key(t), '1') : localStorage.removeItem(key(t)); } catch (e) {} }
  try { if (localStorage.getItem('erj-job-alerts') === '1') { localStorage.setItem(key('jobs'), '1'); localStorage.removeItem('erj-job-alerts'); } } catch (e) {}
  function isOn(t) { return canNotify && flag(t) && Notification.permission === 'granted'; }
  function anyOn() { return isOn('jobs') || isOn('posts'); }

  var css = document.createElement('style');
  css.textContent =
    '.ea-btn{position:relative;display:inline-flex;align-items:center;gap:.6rem;padding:.72rem 1.15rem .72rem .8rem;border-radius:999px;border:0;cursor:pointer;' +
    'font:700 .95rem/1.1 var(--font-body,Inter,system-ui,sans-serif);color:#fff;background:linear-gradient(135deg,#FF6A2B,#FF5722 50%,#D93D0C);' +
    'box-shadow:0 14px 34px -14px rgba(255,87,34,.8),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s;-webkit-tap-highlight-color:transparent;}' +
    '.ea-btn:hover{transform:translateY(-2px);box-shadow:0 20px 40px -14px rgba(255,87,34,.9),inset 0 1px 0 rgba(255,255,255,.4);}' +
    '.ea-btn:focus-visible{outline:3px solid #fff;outline-offset:3px;}' +
    '.ea-ic{position:relative;flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.55);}' +
    '.ea-ic svg{width:18px;height:18px;display:block;transform-origin:50% 10%;}' +
    '.ea-ic::after{content:"";position:absolute;inset:-1.5px;border-radius:50%;border:2px solid rgba(255,255,255,.75);transform:scale(1);}' +
    '.ea-dot{position:absolute;right:-1px;top:-1px;width:10px;height:10px;border-radius:50%;background:#25D366;box-shadow:0 0 0 2px #E8470F;display:none;}' +
    '.ea-btn.is-on{color:var(--ink,#fff);background:var(--card,rgba(255,255,255,.06));box-shadow:inset 0 0 0 1.5px rgba(37,211,102,.6);}' +
    'html[data-theme="day"] .ea-btn.is-on{background:#fff;color:#14110E;}' +
    '.ea-btn.is-on .ea-ic{background:rgba(37,211,102,.16);border-color:rgba(37,211,102,.6);color:#19C27A;}' +
    'html[data-theme="day"] .ea-btn.is-on .ea-ic{color:#0B7A47;}' +
    '.ea-btn.is-on .ea-ic::after{display:none;}.ea-btn.is-on .ea-dot{display:block;box-shadow:0 0 0 2px var(--bg,#000);}' +
    '.ea-btn.ea-mini{padding:0;gap:0;width:38px;height:38px;justify-content:center;box-shadow:0 8px 20px -10px rgba(255,87,34,.8);}' +
    '.ea-btn.ea-mini .ea-ic{width:38px;height:38px;border:0;background:none;}.ea-btn.ea-mini .ea-ic::after{inset:0;}.ea-btn.ea-mini .ea-t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}' +
    '@media(prefers-reduced-motion:no-preference){' +
    '.ea-btn:not(.is-on) .ea-ic svg{animation:eaRing 4.2s ease-in-out infinite;}' +
    '.ea-btn:not(.is-on) .ea-ic::after{animation:eaPing 2.1s ease-out infinite;}' +
    '.ea-btn.is-on .ea-dot{animation:eaLive 2s ease-out infinite;}}' +
    '@keyframes eaRing{0%,72%,100%{transform:rotate(0)}76%{transform:rotate(16deg)}82%{transform:rotate(-14deg)}88%{transform:rotate(9deg)}94%{transform:rotate(-5deg)}}' +
    '@keyframes eaPing{0%{transform:scale(1);border-color:rgba(255,255,255,.75)}100%{transform:scale(1.6);border-color:rgba(255,255,255,0)}}' +
    '@keyframes eaLive{0%{box-shadow:0 0 0 2px var(--bg,#000),0 0 0 2px rgba(37,211,102,.6)}100%{box-shadow:0 0 0 2px var(--bg,#000),0 0 0 9px rgba(37,211,102,0)}}' +
    '.ea-pop{position:fixed;z-index:1300;width:min(340px,calc(100vw - 24px));padding:1.05rem 1.1rem 1rem;border-radius:20px;font-family:var(--font-body,Inter,system-ui,sans-serif);' +
    'background:#111318;color:#F5F4F1;border:1px solid rgba(255,87,34,.45);box-shadow:0 30px 70px -20px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04);}' +
    'html[data-theme="day"] .ea-pop{background:#fff;color:#14110E;box-shadow:0 26px 60px -22px rgba(20,17,14,.35);}' +
    '.ea-pop[hidden]{display:none;}' +
    '.ea-pop h3{margin:0 1.6rem .4rem 0;font:800 1.08rem/1.25 var(--font-display,"Space Grotesk",system-ui,sans-serif);letter-spacing:-.01em;}' +
    '.ea-pop p{margin:0 0 .7rem;font-size:.88rem;line-height:1.5;opacity:.86;}' +
    '.ea-pop p.ea-note{font-size:.8rem;padding:.6rem .7rem;border-radius:12px;background:rgba(255,87,34,.1);opacity:1;}' +
    '.ea-pop a{color:#FF7A45;font-weight:700;}html[data-theme="day"] .ea-pop a{color:#AD350A;}' +
    '.ea-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.2rem;}' +
    '.ea-go,.ea-alt{border:0;cursor:pointer;padding:.7rem 1.05rem;border-radius:999px;font:700 .88rem/1 var(--font-body,Inter,system-ui,sans-serif);}' +
    '.ea-go{background:#FF5722;color:#fff;flex:1 1 auto;}.ea-alt{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor;opacity:.75;}' +
    '.ea-x{position:absolute;top:.55rem;right:.6rem;width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:inherit;opacity:.6;cursor:pointer;font-size:1rem;}' +
    '@media(max-width:600px){.ea-pop{left:12px!important;right:12px;top:auto!important;bottom:calc(12px + env(safe-area-inset-bottom,0px));width:auto;}}' +
    '@media print{.ea-btn,.ea-pop{display:none!important}}';
  document.head.appendChild(css);

  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>';
  var btns = [].map.call(mounts, function (m) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ea-btn' + (m.getAttribute('data-erj-alerts') === 'icon' ? ' ea-mini' : '');
    b.topic = TOPICS[m.getAttribute('data-topic')] ? m.getAttribute('data-topic') : 'jobs';
    b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span class="ea-ic">' + BELL + '<i class="ea-dot"></i></span><span class="ea-t"></span>';
    b.addEventListener('click', function () { pop && !pop.hidden && openFrom === b ? close() : open(b); });
    m.appendChild(b); return b;
  });
  function paint() {
    btns.forEach(function (b) { var on = isOn(b.topic), T = TOPICS[b.topic]; b.classList.toggle('is-on', on); b.querySelector('.ea-t').textContent = on ? T.on : T.off; });
    if (pop && !pop.hidden) fill();
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var chan = '<a href="' + esc(CHANNEL) + '" target="_blank" rel="noopener">the WhatsApp channel</a>';
  function fill() {
    var t = openFrom ? openFrom.topic : 'jobs', T = TOPICS[t], h, body, acts = '';
    var also = t === 'jobs' ? '<p class="ea-note">Meanwhile, new roles are also posted on ' + chan + '.</p>' : '';
    if (!canNotify) {
      h = 'Alerts need the app on this phone';
      body = isIOS
        ? '<p>On iPhone, first add this site to your Home Screen: tap <b>Share</b> in Safari, then <b>Add to Home Screen</b>. Open it from there and tap the bell again.</p>'
        : '<p>This browser cannot show notifications from a website.</p>';
      body += also;
    } else if (Notification.permission === 'denied') {
      h = 'Notifications are blocked';
      body = '<p>This browser is set to block notifications from this site. Allow them in the site settings (the padlock or the icon beside the address), then tap the bell again.</p>';
    } else if (isOn(t)) {
      h = T.name + ' are on for this device';
      if (push) body = '<p>You will get a notification as soon as ' + T.thing + (t === 'jobs' ? ' go up' : ' goes up') + ', even with this site closed.</p>';
      else body = background
        ? '<p>You will get a notification about ' + T.each + ', even with the app closed. Your phone or computer decides the exact moment it checks.</p>'
        : (standalone
          ? '<p>You will get a notification about ' + T.each + ' each time you open the app.</p>' + (t === 'jobs' ? '<p class="ea-note">This phone does not let the app check in the background. For new roles as they go up, follow ' + chan + '.</p>' : '')
          : '<p>You will get a notification about ' + T.each + ' whenever you open this site.</p><p class="ea-note"><b>Want them with the site closed?</b> ' + (installEvt ? 'Install the app: it checks for you in the background.' : (isIOS ? 'iPhone does not allow that yet.' + (t === 'jobs' ? ' Follow ' + chan + ' for new roles as they go up.' : '') : 'Install the app from your browser menu (Install app, or Add to Home screen) on Chrome or Edge.')) + '</p>');
      acts = (!push && installEvt && !standalone ? '<button class="ea-go" data-a="install" type="button">Install the app</button>' : '') + '<button class="ea-alt" data-a="off" type="button">Turn off</button>';
    } else {
      h = T.ask;
      body = '<p>' + T.what + '</p><p>No email, no sign-up. Turn it off here any time.</p>';
      acts = '<button class="ea-go" data-a="on" type="button"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Turning on…' : T.go) + '</button>';
    }
    pop.innerHTML = '<button class="ea-x" data-a="x" type="button" aria-label="Close">✕</button><h3>' + h + '</h3>' + body + (acts ? '<div class="ea-row">' + acts + '</div>' : '');
  }
  function place() {
    if (!openFrom || window.innerWidth <= 600) return;
    var r = openFrom.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
    var top = r.bottom + 10; if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 10);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  function open(b) {
    if (!pop) {
      pop = document.createElement('div'); pop.className = 'ea-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Alerts'); pop.hidden = true;
      document.body.appendChild(pop);
      pop.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('[data-a]'); if (!a) return;
        var k = a.getAttribute('data-a'), t = openFrom ? openFrom.topic : 'jobs';
        if (k === 'x') close(); else if (k === 'on') turnOn(t); else if (k === 'off') turnOff(t); else if (k === 'install') install();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) close(); });
      document.addEventListener('click', function (e) { if (!pop.hidden && document.contains(e.target) && !pop.contains(e.target) && btns.indexOf(e.target.closest && e.target.closest('.ea-btn')) < 0) close(); });
      window.addEventListener('scroll', function () { if (!pop.hidden) place(); }, { passive: true });
      window.addEventListener('resize', function () { if (!pop.hidden) place(); });
    }
    openFrom = b; fill(); pop.hidden = false; place();
    btns.forEach(function (x) { x.setAttribute('aria-expanded', x === b ? 'true' : 'false'); });
  }
  function close() { if (!pop) return; pop.hidden = true; btns.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); }); if (openFrom) openFrom.focus(); }

  /* ── on the device only ── */
  function tell(reg, msg) { var w = reg.active || reg.waiting || reg.installing; if (w) w.postMessage(msg); }
  /* which topics sw.js should watch itself: all of them off while OneSignal does the telling */
  function localTopics() { return push ? { jobs: false, posts: false } : { jobs: isOn('jobs'), posts: isOn('posts') }; }
  function arm(welcome) {
    return navigator.serviceWorker.ready.then(function (reg) {
      tell(reg, { type: 'ERJ_ALERTS_SET', topics: localTopics(), welcome: push ? null : (welcome || null) });
      if (!('periodicSync' in reg)) { background = false; return reg; }
      if (push || !anyOn()) { background = false; return reg.periodicSync.unregister('erj-alerts').catch(function () {}).then(function () { return reg.periodicSync.unregister('erj-jobs'); }).catch(function () {}).then(function () { return reg; }); }
      return reg.periodicSync.register('erj-alerts', { minInterval: 6 * 60 * 60 * 1000 }).then(function () { background = true; return reg; }, function () { background = false; return reg; });
    });
  }

  /* ── OneSignal ── */
  var osReady = null;
  function os() {
    if (osReady) return osReady;
    osReady = new Promise(function (resolve, reject) {
      var s = document.createElement('script'); s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'; s.defer = true;
      s.onerror = function () { reject(new Error('OneSignal script blocked')); };
      document.head.appendChild(s);
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function (OneSignal) {
        OneSignal.init({ appId: APP_ID, serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js', serviceWorkerParam: { scope: '/push/onesignal/' },
          notifyButton: { enable: false }, welcomeNotification: { disable: true } }).then(function () { resolve(OneSignal); }, reject);
      });
      setTimeout(function () { reject(new Error('OneSignal did not start')); }, 15000);
    });
    return osReady;
  }
  function osSync(OneSignal) { // tags say which topics this device wants; no topic at all means no pushes
    var want = { jobs: isOn('jobs'), posts: isOn('posts') };
    ['jobs', 'posts'].forEach(function (t) { want[t] ? OneSignal.User.addTag(t, '1') : OneSignal.User.removeTag(t); });
    return want.jobs || want.posts ? OneSignal.User.PushSubscription.optIn() : OneSignal.User.PushSubscription.optOut();
  }
  function welcomeHere(t) { // the "it is on" note, shown by this page so it is instant
    var T = TOPICS[t];
    return navigator.serviceWorker.ready.then(function (reg) { return reg.showNotification(T.onTitle, { body: T.onBody, icon: '/icon192.png', badge: '/favicon-96.png', tag: 'erj-' + t + '-on' }); }).catch(function () {});
  }

  function turnOn(t) {
    if (busy) return; busy = true; paint();
    var done = function () { busy = false; paint(); };
    Promise.resolve(Notification.requestPermission()).then(function (res) {
      if (res !== 'granted') return;
      setFlag(t, true);
      try { if (window.erjTrack) erjTrack('Lead', { content_name: TOPICS[t].name + ' on' }); } catch (e) {}
      if (!push) return arm(t);
      return os().then(function (OneSignal) { return Promise.resolve(osSync(OneSignal)).then(function () { return arm(); }).then(function () { welcomeHere(t); }); },
        function () { push = false; return arm(t); }); // script blocked: fall back to the device's own check
    }).then(done, done);
  }
  function turnOff(t) {
    setFlag(t, false);
    if (push) os().then(osSync).catch(function () {});
    arm().catch(function () {});
    paint();
  }
  function install() {
    if (!installEvt) return; var e = installEvt; installEvt = null;
    try { e.prompt(); } catch (x) {}
    paint();
  }
  window.addEventListener('beforeinstallprompt', function (e) { installEvt = e; paint(); });
  window.addEventListener('appinstalled', function () { installEvt = null; if (anyOn()) arm().then(paint); });

  paint();
  /* alerts already on: keep this device's subscription and background check current (the refresh button retires the worker) and look now */
  if (anyOn()) window.addEventListener('load', function () {
    setTimeout(function () {
      var go = function () { return arm().then(function (reg) { tell(reg, { type: 'ERJ_ALERTS_CHECK' }); paint(); }); };
      if (push) os().then(osSync).catch(function () { push = false; }).then(go).catch(function () {}); else go().catch(function () {});
    }, 2500);
  });
})();
