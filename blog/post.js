/* ERJ blog · shared behaviour for every post page and the archive (Oct 2026).
   Decorative and additive: the article reads the same without it.
   Reactions and comments go to the official WhatsApp line with a prefilled
   message (ERJ_CONFIG.messages.blogReact / blogComment), so they reach a
   person and register as a Lead in erj-track.js. */
(function () {
  'use strict';
  var d = document, cfg = window.ERJ_CONFIG || {}, msgs = cfg.messages || {};
  var line = (((cfg.canon || {}).lines) || {}).official || '';
  var art = d.querySelector('main article.wrap');
  var archive = d.getElementById('archive');
  var base = (window.ERJ_NAV && window.ERJ_NAV.base) || '../../';

  function el(tag, cls, html) { var e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fill(t, o) { return String(t || '').replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); }
  function wa(text) { return 'https://wa.me/' + line + '?text=' + encodeURIComponent(text); }
  function track(name) { try { if (window.erjTrack) window.erjTrack('Lead', { content_name: name }); } catch (e) {} }

  /* reading progress */
  var prog = el('div', 'pz-prog'); prog.setAttribute('aria-hidden', 'true'); d.body.appendChild(prog);
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = d.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      if (floatBack) floatBack.classList.toggle('on', scrollY > 700);
      ticking = false;
    });
  }, { passive: true });

  /* light behind the header */
  var host = art || (archive && d.querySelector('main.wrap'));
  if (host) host.insertBefore(el('div', 'pz-aur', '<i class="a1"></i><i class="a2"></i>'), host.firstChild);

  /* back to the blog: history when they came from it, the blog otherwise */
  var blogUrl = base + 'blog.html';
  function backLink(cls) {
    var a = el('a', 'pz-back ' + (cls || ''), '<b>←</b> All posts');
    a.href = blogUrl;
    a.addEventListener('click', function (e) {
      if (d.referrer && /\/blog\.html/.test(d.referrer) && history.length > 1) { e.preventDefault(); history.back(); }
    });
    return a;
  }
  var floatBack = null;

  if (art) {
    var title = (art.querySelector('h1') || {}).textContent || d.title;
    var url = (d.querySelector('link[rel="canonical"]') || {}).href || location.href;

    /* crumb row with a real back button, plus a floating one once you are reading */
    var crumb = art.querySelector('.crumb');
    if (crumb) { var top = el('div', 'pz-top'); crumb.parentNode.insertBefore(top, crumb); top.appendChild(backLink()); top.appendChild(crumb); }
    floatBack = backLink('pz-float'); d.body.appendChild(floatBack);

    /* category emoji + author avatar */
    var cat = art.querySelector('.cat');
    var EM = { 'Job Search': '🎯', 'Productivity': '⚡', 'Announcements': '📣', 'Success Stories': '🏆', 'CV & LinkedIn': '📄', 'Industry News': '📰' };
    if (cat) { var em = el('span', 'pz-emoji', EM[cat.textContent.trim()] || '📝'); em.setAttribute('aria-hidden', 'true'); cat.parentNode.insertBefore(em, cat); }
    var who = art.querySelector('.meta span');
    if (who) who.insertBefore(el('span', 'pz-av', 'OA'), who.firstChild);

    /* reactions, comment, share */
    var RX = [['🔥', 'Fire'], ['💡', 'Insightful'], ['👏', 'Helpful'], ['🤔', 'I have a question'], ['🚀', 'Doing this today']];
    var talk = el('section', 'pz-talk');
    talk.setAttribute('aria-label', 'Tell us what you think');
    talk.innerHTML = '<span class="pz-k">Your turn</span><h2>Did this help?</h2>' +
      '<p class="pz-note">Tap a reaction or write a comment. It comes straight to us on WhatsApp, and a person reads every one.</p>';
    var rx = el('div', 'pz-rx');
    RX.forEach(function (r) {
      var a = el('a', '', '<span aria-hidden="true">' + r[0] + '</span>' + r[1]);
      a.href = wa(fill(msgs.blogReact, { title: title, reaction: r[0] + ' ' + r[1], url: url }));
      a.target = '_blank'; a.rel = 'noopener';
      a.addEventListener('click', function () { track('Blog reaction: ' + r[1]); });
      rx.appendChild(a);
    });
    talk.appendChild(rx);
    var cm = el('div', 'pz-cm',
      '<label for="pzCm">Leave a comment or ask a question</label>' +
      '<textarea id="pzCm" placeholder="What did you think? What are you stuck on?"></textarea>' +
      '<div class="pz-cm-row"><button class="pz-wa" type="button">Send on WhatsApp →</button><small>Opens WhatsApp with your comment ready to send.</small></div>');
    cm.querySelector('button').addEventListener('click', function () {
      var t = cm.querySelector('textarea').value.trim();
      track('Blog comment');
      window.open(wa(fill(msgs.blogComment, { title: title, url: url, comment: t || '(I will type it here)' })), '_blank', 'noopener');
    });
    talk.appendChild(cm);
    var sh = el('div', 'pz-share', '<b>Share</b>');
    var enc = encodeURIComponent(url), et = encodeURIComponent(title);
    [['WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)],
     ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc],
     ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc],
     ['X', 'https://twitter.com/intent/tweet?text=' + et + '&url=' + enc]].forEach(function (s) {
      var a = el('a', '', s[0]); a.href = s[1]; a.target = '_blank'; a.rel = 'noopener'; sh.appendChild(a);
    });
    var cp = el('button', '', 'Copy link'); cp.type = 'button';
    cp.addEventListener('click', function () {
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { cp.textContent = 'Copied ✓'; }, function () { cp.textContent = url; });
    });
    sh.appendChild(cp); talk.appendChild(sh);
    var tags = art.querySelector('.tags'), door = art.querySelector('.door');
    var after = door || tags;
    if (after) after.parentNode.insertBefore(talk, after.nextSibling);

    /* read next: one more way back into the blog */
    var more = art.querySelector('nav.more');
    if (more) { var all = el('a', 'pz-all', 'See every post →'); all.href = blogUrl; more.appendChild(all); }
  }

  if (archive) {
    d.documentElement.classList.add('pz-arch');
    var head = d.querySelector('header.top h1');
    if (head) {
      var sw = el('nav', 'pz-switch', '<a href="../blog.html">Latest &amp; search</a><a class="on" href="./" aria-current="page">Every post by month</a>');
      sw.setAttribute('aria-label', 'Blog views');
      head.parentNode.insertBefore(sw, head);
    }
    var EM2 = { 'Job Search': '🎯', 'Productivity': '⚡', 'Announcements': '📣', 'Success Stories': '🏆', 'CV & LinkedIn': '📄', 'Industry News': '📰' };
    archive.querySelectorAll('.mon li a').forEach(function (a) {
      var dd = a.querySelector('.d'), cat = '';
      if (dd) Object.keys(EM2).some(function (k) { if (dd.textContent.indexOf(k) > -1) { cat = k; return true; } return false; });
      var i = el('span', 'pz-ai', EM2[cat] || '📝'); i.setAttribute('aria-hidden', 'true'); a.insertBefore(i, a.firstChild);
    });
    var c = el('aside', 'pz-cta', '<div><b>Not sure which post you need?</b><span>Five questions, ninety seconds. It tells you which part of your search to fix first.</span></div><a href="../diagnose/">Take the free diagnosis →</a>');
    archive.parentNode.insertBefore(c, archive.nextSibling);
  }
})();
