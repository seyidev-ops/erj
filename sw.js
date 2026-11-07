/* ═══════════════════════════════════════════════════════
   EVERYTHING REMOTE JOB — SERVICE WORKER
   Cache-first for app shell, network-first for fonts
═══════════════════════════════════════════════════════ */
const CACHE = 'erj-site-20261107c';
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
  '/erj-nav.js?v=20261107c',
  '/erj-track.js?v=20261104b',
  '/erj-theme.js?v=20260911a',
  '/erj-config.js?v=20261107b',
  '/product.css?v=20261004b',
  '/erj-alive.css?v=20261028b',
  '/erj-alive.js?v=20261004a',
  '/erj-future.css?v=20261104a',
  '/erj-future.js?v=20261101a'
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
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
  'doubleclick.net'
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
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
