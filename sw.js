/* ═══════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB — SERVICE WORKER
   Cache-first for app shell, network-first for fonts
═══════════════════════════════════════════════════════ */
const CACHE = 'erj-site-20261113a';
const OFFLINE = '/offline.html';

/* SHELL is what a first-time visitor pays for before anything renders. It had
   grown to 50 entries and 2.1 MB, including eight marketing photographs, a
   duplicate JPEG of an image already listed as WebP, the sitemap, and a 500 KB
   blog page. Those are left to the runtime cache now: still cached the first
   time they are actually requested, they just no longer compete with first
   paint. Anything a cold visitor genuinely needs offline stays here.
   November 2026: cut again to the offline page, logos, fonts and the shared
   CSS/JS (about 20 small files). The old 1.9 MB list downloaded right after a
   visitor's first page, so on a slow phone connection the first menu tap
   waited behind it. Pages, photos and box art are cached when first used. */
const SHELL = [
  '/offline.html',
  '/manifest.json',
  '/erj-mark-dark-128.png',
  '/erj-mark-light-128.png',
  '/icon192.png',
  '/favicon.ico',
  '/favicon-96.png',
  '/fonts/space-grotesk-var.woff2',
  '/fonts/inter-300.woff2',
  '/fonts/inter-400.woff2',
  '/fonts/inter-500.woff2',
  '/erj-nav.js?v=20261113a',
  '/erj-track.js?v=20261104b',
  '/erj-theme.js?v=20260911a',
  '/erj-config.js?v=20261112c',
  '/product.css?v=20261004b',
  '/erj-alive.css?v=20261028b',
  '/erj-alive.js?v=20261004a',
  '/erj-future.css?v=20261104a',
  '/erj-future.js?v=20261101a',
  '/erj-world.js?v=20261111d',
  '/erj-alerts.js?v=20261112b'
];

self.addEventListener('install', e => {
  // Every new worker takes over as soon as it has cached the shell, on first
  // install AND on update. Waiting for every tab to close (the old rule) meant
  // phones and the installed app kept running an outdated worker for weeks,
  // still serving its old offline page with the old logo. Taking over is safe:
  // the mid-scroll white-out came from the page reloading itself when the
  // controller changed (and from clients.navigate()), and both are gone. The
  // new worker simply answers the next request; nothing on screen is reloaded.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(function(){ return null; }))
      ))
      .then(() => self.skipWaiting())
  );
});

// An explicit opt-in escape hatch: a page can ask for the update immediately
// (e.g. behind a "new version — refresh" button) instead of it being forced.
self.addEventListener('message', e => {
  if (e.data === 'ERJ_SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'ERJ_ALERTS_SET') e.waitUntil(setTopics(e.data.topics || {}, e.data.welcome));
  if (e.data && e.data.type === 'ERJ_ALERTS_CHECK') e.waitUntil(checkAlerts());
});

/* ── Alerts kept on the device (new jobs, new blog posts) ─────────
   Used when no push service is set up, or its script cannot load. The
   installed app asks the browser to wake this worker now and then (Periodic
   Background Sync, where the browser offers it); any visit with alerts on
   checks too. Each check reads the small feeds jobboard.py and
   generate-blog-archive.py write and tells the person about entries this
   device has not seen. Which topics are on, and what has been seen, live in
   their own cache, kept across updates. With OneSignal set up, erj-alerts.js
   turns every topic off here so nobody is told twice. */
const ALERT_CACHE = 'erj-alerts-v1';
const ALERT_TOPICS = {
  jobs: { feed: '/jobs/data/latest.json', seen: '/seen', tag: 'erj-jobs', url: '/jobs/?source=alert#board',
    on: ['Job alerts are on', 'This device will tell you when new remote roles open to Nigeria go up on the board.'],
    say: f => [f.length === 1 ? '1 new remote job open to Nigeria' : f.length + ' new remote jobs open to Nigeria',
      f.slice(0, 3).map(j => j.title + ' · ' + j.company).concat(f.length > 3 ? ['and ' + (f.length - 3) + ' more'] : []).join('\n'), null] },
  posts: { feed: '/blog/latest.json', seen: '/seen-posts', tag: 'erj-posts', url: '/blog.html',
    on: ['Blog alerts are on', 'This device will tell you when a new post goes up on the ERJ blog.'],
    say: f => f.length === 1 ? ['New on the ERJ blog', f[0].title, f[0].url]
      : [f.length + ' new posts on the ERJ blog', f.slice(0, 3).map(p => p.title).join('\n'), null] }
};
async function alertStore() { return caches.open(ALERT_CACHE); }
async function readJSON(store, key) { const r = await store.match(key); return r ? r.json().catch(() => null) : null; }
function writeJSON(store, key, val) { return store.put(key, new Response(JSON.stringify(val), { headers: { 'Content-Type': 'application/json' } })); }
function alertShow(t, title, body, url) {
  return self.registration.showNotification(title, { body: body, icon: '/icon192.png', badge: '/favicon-96.png', tag: t.tag, renotify: true, data: { url: url || t.url } });
}
async function setTopics(topics, welcome) {
  const store = await alertStore();
  await writeJSON(store, '/topics', { jobs: !!topics.jobs, posts: !!topics.posts });
  await checkAlerts(); // a topic just turned on has no seen list yet, so this only remembers what is there
  const t = ALERT_TOPICS[welcome];
  if (t && self.Notification && Notification.permission === 'granted') return alertShow({ tag: t.tag + '-on', url: t.url }, t.on[0], t.on[1]);
}
async function checkAlerts() {
  if (!self.Notification || Notification.permission !== 'granted') return;
  const store = await alertStore();
  // a device that turned job alerts on before topics existed has only its seen list
  const topics = (await readJSON(store, '/topics')) || { jobs: !!(await store.match('/seen')), posts: false };
  for (const name of Object.keys(ALERT_TOPICS)) {
    const t = ALERT_TOPICS[name];
    if (!topics[name]) { await store.delete(t.seen); continue; }
    let feed;
    try { const r = await fetch(t.feed + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) continue; feed = await r.json(); } catch (x) { continue; }
    if (!feed || !Array.isArray(feed.ids)) continue;
    const seen = await readJSON(store, t.seen);
    await writeJSON(store, t.seen, feed.ids);
    if (!seen) continue; // first look: remember, say nothing
    const had = new Set(seen), fresh = (feed['new'] || []).filter(x => !had.has(x.id));
    if (!fresh.length) continue;
    const m = t.say(fresh);
    await alertShow(t, m[0], m[1], m[2]);
  }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'erj-jobs' || e.tag === 'erj-alerts') e.waitUntil(checkAlerts()); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== ALERT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      // NOTE: the old clients.navigate() "self-heal" lived here and reloaded
      // every open tab on activation — a 2-5s white screen for anyone mid-page.
      // It was also redundant: the fetch handler below is network-first for
      // HTML, so a published change is already live on the next page view.
  );
});

// Hosts that must always go straight to the network. Serving a cached
// pixel script — or worse, a cached event beacon — silently breaks
// reporting in a way that is very hard to notice.
const NO_SW_HOSTS = [
  'connect.facebook.net',
  'facebook.com',
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'analytics.tiktok.com',
  'doubleclick.net',
  'onesignal.com'
];

const PRIVATE_PATHS = [
  '/dashboard.html', '/participant.html', '/login.html',
  '/admin.html', '/admin-login.html', '/instructor.html', '/instructor-login.html',
  '/cvbuilder/'
];
function isPrivatePath(pathname) {
  return PRIVATE_PATHS.some(function(p){ return p.endsWith('/') ? pathname.startsWith(p) : pathname === p; });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Analytics and pixels: bypass the service worker entirely.
  if (NO_SW_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  // Private/account pages must never be written to the service-worker cache.
  // In the current static architecture the browser must fetch them from the network.
  if (url.origin === self.location.origin && isPrivatePath(url.pathname)) return;

  if (url.hostname.includes('fonts.google') || url.hostname.includes('fonts.gstatic')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML pages: NETWORK-FIRST — published updates always show; cache is only the offline fallback.
  const isHTML = e.request.mode === 'navigate' ||
    (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // NETWORK-FIRST with a time limit: a fresh page whenever the network
    // answers in time; on a slow connection, the copy saved on the last visit
    // after 2.5 s instead of a blank wait. The network copy still lands in the
    // cache for next time.
    const net = fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (!cached) {
          // A phone that drops signal for a second should not land on the
          // offline page: try once more before falling back.
          return net
            .catch(() => new Promise(r => setTimeout(r, 1200)).then(() => fetch(e.request)))
            .catch(() => caches.match(OFFLINE));
        }
        const slow = new Promise(r => setTimeout(() => r(cached), 2500));
        return Promise.race([net.catch(() => cached), slow]);
      })
    );
    return;
  }

  // Static assets (css/js/images): STALE-WHILE-REVALIDATE — instant from cache, silently refreshed in background.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('push', e => {
  let data; try { data = e.data.json(); } catch (x) { data = { title: 'Everything Remote Job', body: 'You have an update!' }; }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon192.png',
      badge: '/icon192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/dashboard.html' },
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => 'focus' in c && new URL(c.url).pathname === new URL(url, self.location.origin).pathname);
    return open ? open.focus() : clients.openWindow(url);
  }));
});
