/* Everything Remote Job · CV Scan · "Email me my full report"
   The score stays free on screen. The point-by-point fixes are shown
   blurred until the person asks for the full report by email. The request
   goes to ERJ's Google Apps Script (Leads sheet + follow-up emails).

   What is sent: first name, email, WhatsApp (optional), target role, the two
   answers, consent, the score and, for each of the ten points, its number,
   title, Yes/Partly/No and the standard fix text. What is never sent: the CV
   file, the CV text, the evidence lines quoted from it, or the advert text.

   Leave ENDPOINT empty and this file does nothing: the page keeps its old
   behaviour (PDF download), so the site can ship before the script is live.
   This is a convenience gate, not security: the fixes are in the page. */
(function () {
  'use strict';
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyYqhIyHmtoTmp7ZdK-k65oT4KPBJxgRpoeFEYwgDxL9kaF0IgZMJI5t_sNX7CyUMlluA/exec';

  if (!ENDPOINT) return;
  var results = document.getElementById('results');
  if (!results) return;

  var state = { sentSig: null, name: '', email: '', draft: {} };
  try {
    state.name = sessionStorage.getItem('erj-rq-name') || '';
    state.email = sessionStorage.getItem('erj-rq-email') || '';
  } catch (e) { /* storage blocked */ }

  var CSS =
    '#results.rq-locked .check-fix{filter:blur(5px);user-select:none;-webkit-user-select:none;pointer-events:none}' +
    '.rq-card{margin:1.4rem 0 0;padding:1.5rem 1.6rem;border:1px solid var(--accent,#FF5722);border-radius:12px;background:var(--card,transparent)}' +
    '.rq-k{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5722);margin-bottom:.45rem}' +
    '.rq-head{font-family:var(--font-display,system-ui,sans-serif);font-size:1.35rem;font-weight:700;line-height:1.25;color:var(--ink,#fff);margin:0 0 .35rem}' +
    '.rq-lead{font-size:.95rem;line-height:1.6;color:var(--ink-soft,#a1a1a1);margin:0 0 1.1rem}' +
    '.rq-form{display:grid;gap:.95rem}' +
    '.rq-row{display:grid;grid-template-columns:1fr 1fr;gap:.95rem}@media(max-width:620px){.rq-row{grid-template-columns:1fr}}' +
    '.rq-f label,.rq-f legend{display:block;font-size:.8rem;font-weight:600;color:var(--ink,#fff);margin-bottom:.35rem;padding:0}' +
    '.rq-f label span,.rq-f legend span{font-weight:400;color:var(--ink-faint,#8a8a8a)}' +
    '.rq-f input[type=text],.rq-f input[type=email],.rq-f input[type=tel]{width:100%;box-sizing:border-box;padding:.8rem .9rem;border-radius:8px;' +
      'border:1px solid var(--line,rgba(127,127,127,.35));background:transparent;color:var(--ink,#fff);font:inherit;font-size:1rem}' +
    '.rq-f input:focus{outline:2px solid var(--accent,#FF5722);outline-offset:1px}' +
    'fieldset.rq-f{border:0;margin:0;padding:0;min-width:0}' +
    '.rq-opts{display:flex;flex-wrap:wrap;gap:.5rem}' +
    '.rq-opts label{display:inline-flex;align-items:center;gap:.45rem;margin:0;padding:.6rem .85rem;border:1px solid var(--line,rgba(127,127,127,.35));' +
      'border-radius:999px;font-size:.88rem;font-weight:500;cursor:pointer}' +
    '.rq-opts input{accent-color:var(--accent,#FF5722);margin:0}' +
    '.rq-opts label:has(input:checked){border-color:var(--accent,#FF5722)}' +
    '.rq-consent{display:flex;gap:.6rem;align-items:flex-start;font-size:.86rem;line-height:1.5;color:var(--ink-soft,#a1a1a1)}' +
    '.rq-consent input{accent-color:var(--accent,#FF5722);margin-top:.2rem;flex:none;width:18px;height:18px}' +
    '.rq-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}' +
    '.rq-err{min-height:1.2em;font-size:.86rem;color:#E5484D;margin:0}' +
    '.rq-note{font-size:.78rem;line-height:1.55;color:var(--ink-faint,#8a8a8a);margin:.2rem 0 0}' +
    '.rq-form button[disabled]{opacity:.6;cursor:wait}' +
    '.rq-done .rq-head{color:var(--ink,#fff)}' +
    '@media print{.rq-card{display:none!important}}';

  function addCss() {
    if (document.getElementById('rqCss')) return;
    var s = document.createElement('style');
    s.id = 'rqCss';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function report() { return window.ERJ_CV && window.ERJ_CV.r; }
  function sig(r) { return r ? r.score + ':' + r.checks.map(function (c) { return c.verdict[0]; }).join('') : ''; }

  function d(k, fallback) { return esc(state.draft[k] != null ? state.draft[k] : (fallback || '')); }
  function chk(k, v) { return state.draft[k] === v ? ' checked' : ''; }

  function formHtml(r) {
    var passed = r.checks.filter(function (c) { return c.verdict === 'pass'; }).length;
    var head = passed === 10
      ? 'All ten cleared. Get your report by email.'
      : 'You cleared ' + passed + ' of 10. Get the full report by email.';
    return '' +
      '<div class="rq-k">Your full report</div>' +
      '<div class="rq-head">' + head + '</div>' +
      '<p class="rq-lead">It shows each point you missed and exactly how to fix it, so you can work through it at your own pace.</p>' +
      '<form class="rq-form" novalidate>' +
        '<div class="rq-row">' +
          '<div class="rq-f"><label for="rqName">First name</label><input id="rqName" name="firstName" type="text" autocomplete="given-name" maxlength="40" required value="' + d('firstName', state.name) + '"></div>' +
          '<div class="rq-f"><label for="rqEmail">Email</label><input id="rqEmail" name="email" type="email" autocomplete="email" maxlength="120" required value="' + d('email', state.email) + '"></div>' +
        '</div>' +
        '<div class="rq-row">' +
          '<div class="rq-f"><label for="rqWa">WhatsApp <span>(optional)</span></label><input id="rqWa" name="whatsapp" type="tel" autocomplete="tel" maxlength="20" placeholder="+234" value="' + d('whatsapp') + '"></div>' +
          '<div class="rq-f"><label for="rqRole">Target role</label><input id="rqRole" name="role" type="text" maxlength="80" placeholder="e.g. Customer Support" required value="' + d('role') + '"></div>' +
        '</div>' +
        '<fieldset class="rq-f"><legend>When do you want to start applying?</legend><div class="rq-opts">' +
          '<label><input type="radio" name="timeline" value="month"' + chk('timeline', 'month') + ' required> This month</label>' +
          '<label><input type="radio" name="timeline" value="quarter"' + chk('timeline', 'quarter') + '> In 1–3 months</label>' +
          '<label><input type="radio" name="timeline" value="exploring"' + chk('timeline', 'exploring') + '> Just exploring</label>' +
        '</div></fieldset>' +
        '<fieldset class="rq-f"><legend>Have you worked in this kind of role before? <span>(job, internship, volunteering or your own business)</span></legend><div class="rq-opts">' +
          '<label><input type="radio" name="experience" value="yes"' + chk('experience', 'yes') + ' required> Yes</label>' +
          '<label><input type="radio" name="experience" value="no"' + chk('experience', 'no') + '> No</label>' +
        '</div></fieldset>' +
        '<div class="rq-hp" aria-hidden="true"><label for="rqCo">Company</label><input id="rqCo" name="company" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<label class="rq-consent"><input type="checkbox" name="consent" required> <span>Send me my report and up to 3 short follow-up emails from ERJ. I can unsubscribe at any time.</span></label>' +
        '<p class="rq-err" role="alert" aria-live="polite"></p>' +
        '<div><button type="submit" class="btn-primary-ui"><span>Email me my full report</span><span class="arrow-wrap"><span class="arrow">→</span></span></button></div>' +
        '<p class="rq-note">Your CV stays on your device. We only receive your name, email, answers and score, never your CV.</p>' +
      '</form>';
  }

  function doneHtml() {
    return '' +
      '<div class="rq-k">Report sent</div>' +
      '<div class="rq-head">Done, ' + esc(state.name) + '. Your report is on its way.</div>' +
      '<p class="rq-lead" style="margin:0">We sent it to <b>' + esc(state.email) + '</b>. Check your inbox, and your Promotions or Spam folder, in the next few minutes. ' +
      'Every fix is also unlocked below.</p>';
  }

  function build(card) {
    var r = report();
    if (!r) return;
    var done = state.sentSig === sig(r);
    card.classList.toggle('rq-done', done);
    results.classList.toggle('rq-locked', !done);
    card.innerHTML = done ? doneHtml() : formHtml(r);
    if (!done) wire(card, r);
  }

  function wire(card, r) {
    var form = card.querySelector('form');
    var err = card.querySelector('.rq-err');
    var btn = form.querySelector('button[type=submit]');
    form.addEventListener('input', function (ev) {
      var t = ev.target;
      if (!t || !t.name || t.name === 'company' || t.name === 'consent') return;
      if (t.type === 'radio') { if (t.checked) state.draft[t.name] = t.value; }
      else state.draft[t.name] = t.value;
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements;
      var val = function (n) { return (f[n] && f[n].value || '').trim(); };
      var pick = function (n) { var c = form.querySelector('input[name=' + n + ']:checked'); return c ? c.value : ''; };
      var data = {
        v: 1,
        hp: val('company'),
        firstName: val('firstName'),
        email: val('email'),
        whatsapp: val('whatsapp'),
        role: val('role'),
        timeline: pick('timeline'),
        experience: pick('experience'),
        consent: !!(f.consent && f.consent.checked)
      };
      var problem =
        !data.firstName ? 'Please add your first name.' :
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) ? 'Please check your email address.' :
        !data.role ? 'Please add the role you are aiming for.' :
        !data.timeline ? 'Please choose when you want to start applying.' :
        !data.experience ? 'Please tell us whether you have worked in this kind of role.' :
        !data.consent ? 'Please tick the box so we can email your report.' : '';
      if (problem) { err.textContent = problem; return; }
      var jd = document.getElementById('jdInput');
      data.score = r.score;
      data.band = r.band && r.band.headline;
      data.jdUsed = !!(jd && jd.value.trim());
      data.checks = r.checks.map(function (c) { return { id: c.id, title: c.title, verdict: c.verdict, fix: c.fix }; });
      var sentFor = sig(r);

      err.textContent = '';
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending…';
      fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(data) })
        .then(function (res) { return res.json(); })
        .then(function (out) {
          if (!out || !out.ok) throw new Error((out && out.error) || 'send');
          state.sentSig = sentFor;
          state.name = data.firstName;
          state.email = data.email;
          try {
            sessionStorage.setItem('erj-rq-name', data.firstName);
            sessionStorage.setItem('erj-rq-email', data.email);
          } catch (e) { /* storage blocked */ }
          try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'cv_report_request', cv_score: r.score, lead_timeline: data.timeline });
          } catch (e) { /* no analytics */ }
          build(card);
        })
        .catch(function (e) {
          btn.disabled = false;
          btn.querySelector('span').textContent = 'Email me my full report';
          err.textContent = e && e.message === 'email'
            ? 'That email address was not accepted. Please check it and try again.'
            : 'We could not send your report just now. Check your connection and try again in a moment.';
        });
    });
  }

  var mo = null;
  function apply() {
    if (results.hidden) return;
    var panel = results.querySelector('.score-panel');
    if (!panel || !report()) return;
    if (mo) mo.disconnect();
    var dl = results.querySelector('.cap-dl');
    if (dl) dl.parentNode.removeChild(dl);
    var card = results.querySelector('.rq-card');
    var current = sig(report());
    if (!card) {
      card = document.createElement('div');
      card.className = 'rq-card';
      panel.parentNode.insertBefore(card, panel.nextSibling);
      card.dataset.sig = current;
      build(card);
    } else if (card.dataset.sig !== current) {
      card.dataset.sig = current;
      build(card);
    }
    if (panel.nextSibling !== card) panel.parentNode.insertBefore(card, panel.nextSibling);
    if (mo) mo.observe(results, { childList: true, subtree: true });
  }

  addCss();
  mo = new MutationObserver(apply);
  apply();
  mo.observe(results, { childList: true, subtree: true });
})();
