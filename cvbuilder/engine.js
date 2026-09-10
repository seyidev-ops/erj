/* ═══════════════════════════════════════════════════════════════════
   ERJ CV ENGINE
   ═══════════════════════════════════════════════════════════════════
   Everything runs in the browser. No network calls, no uploads, no
   storage beyond this device's localStorage. That is deliberate: people
   paste salary history and personal contact details into this thing.

   The scorer implements the SAME ten points as the public CV Self-Scan,
   so a document built here and then run through that tool agrees with
   itself. If the scan rubric ever changes, change CHECKS below to match.

   Honest limits, stated here and in the UI:
     - We score against the ERJ rubric. We cannot score against Workday,
       Greenhouse or Taleo, none of which publish their scoring.
     - The humaniser rewrites phrasing only. It never invents a metric,
       a tool or an achievement.
═══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var $ = function (id) { return document.getElementById(id); };
var LS = 'erj_cv_engine_v1';
var LSGATE = 'erj_cv_gate_v1';

/* ─────────────────────────── GATE ─────────────────────────── */
function openApp() {
  $('gate').style.display = 'none';
  $('app').style.display = '';
  load();
  if (!jobsEl.children.length) addJob(true);   /* only seed a blank role if none were restored */
  render();
}
function fmtDay(iso) {
  if (!iso) return '';
  var M = ['January','February','March','April','May','June',
           'July','August','September','October','November','December'];
  var p = iso.split('-');
  return parseInt(p[2], 10) + ' ' + M[parseInt(p[1], 10) - 1] + ' ' + p[0];
}

/* A CV Engine pass is a rented month, so the person renting it should be
   able to see how much of it is left without having to work it out. */
function showPassBanner(r) {
  var el = $('passBar');
  if (!el) return;
  if (!r || r.tier !== 'CVPASS') { el.style.display = 'none'; return; }
  var urgent = r.daysLeft <= 5;
  el.style.display = '';
  el.className = 'passbar' + (urgent ? ' passbar-soon' : '');
  el.innerHTML = '<span><b>' + r.daysLeft + ' day' + (r.daysLeft === 1 ? '' : 's') +
    '</b> left on your CV Engine pass \u00b7 ends ' + fmtDay(r.ends) + '</span>' +
    (urgent
      ? '<a href="https://paystack.shop/pay/erj-cvpass" target="_blank" rel="noopener">Renew for \u20a65,000</a>'
      : '<a href="../register.html">See the full programme</a>');
}

function tryGate(code, quiet) {
  if (!window.ERJPasscode) {
    if (!quiet) msg('#F87171', 'Code checker did not load. Refresh and try again.');
    return false;
  }
  var r = window.ERJPasscode.validate(code);
  if (!r.ok) {
    /* An expired or dead CV pass is always explained, even on the silent
       auto-unlock attempt. Someone whose month has just run out deserves to
       be told that, not shown a login box with no reason given. */
    var loud = !quiet ||
               r.reason === 'cv-expired' || r.reason === 'cv-dead' || r.reason === 'cv-not-issued';
    if (loud) {
      if (r.reason === 'cv-expired') {
        msg('#F59E0B', 'That pass has finished its thirty days \u2014 it started on ' +
            fmtDay(r.activated) + ' and ended on ' + fmtDay(r.ends) +
            '. Buy another pass, or enrol for a stage and get a code that does not expire.');
        try { localStorage.removeItem(LSGATE); } catch (e) {}
      } else if (r.reason === 'cv-dead') {
        msg('#F59E0B', 'That pass is past its expiry date. Message us on WhatsApp and we will sort it out.');
        try { localStorage.removeItem(LSGATE); } catch (e) {}
      } else {
        msg('#F87171', ({
          'empty':          'Enter your access code.',
          'bad-month':      'The last two letters are not a month we recognise.',
          'unknown-cohort': 'That code is not for a cohort we run. Check it against your receipt.',
          'cv-bad-check':   'That pass code is not quite right \u2014 check it character by character.',
          'cv-bad-month':   'That pass code is not quite right \u2014 check it character by character.',
          'cv-not-issued':  'That pass has not been issued. Send us your payment receipt on WhatsApp and we will send your code.'
        }[r.reason]) || 'That code is not valid. Check it, or message us on WhatsApp.');
      }
    }
    return false;
  }
  try { localStorage.setItem(LSGATE, r.code); } catch (e) {}
  showPassBanner(r);
  openApp();
  return true;
}
function msg(c, t) { var m = $('gateMsg'); m.style.color = c; m.textContent = t; }

$('gateGo').addEventListener('click', function () { tryGate($('gateIn').value); });
$('gateIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryGate($('gateIn').value); });
/* NB: the auto-unlock attempt lives at the very BOTTOM of this file.
   Running it here would call load() before FIELDS and jobsEl are
   initialised, which throws and kills every listener below. */

/* ─────────────────────────── STATE ─────────────────────────── */
var jobsEl = $('jobs');
var FIELDS = ['fName','fTitle','fEmail','fPhone','fCity','fTz','fLinkedin','fPortfolio',
              'fSummary','fSkills','fTools','fEdu','fJd','fJdCo','fJdRole'];
var jdPicked = [];
var tpl = 'intl';   /* chosen ATS template — see docx.js */

function addJob(silent, data) {
  var i = jobsEl.children.length;
  var d = data || {};
  var w = document.createElement('div');
  w.className = 'roleblk';
  w.innerHTML =
    '<div class="roleblk-top"><span class="roleblk-n">Role ' + (i + 1) + '</span>' +
    '<button class="xbtn" title="Remove">\u2715</button></div>' +
    '<div class="row2">' +
      '<div><label>Job title</label><input type="text" class="j-title" value="' + esc(d.title) + '" placeholder="Customer Support Officer"></div>' +
      '<div><label>Employer</label><input type="text" class="j-co" value="' + esc(d.co) + '" placeholder="Paystack"></div>' +
    '</div>' +
    '<div class="row2">' +
      '<div><label>Dates</label><input type="text" class="j-dates" value="' + esc(d.dates) + '" placeholder="Jan 2023 – Mar 2025"></div>' +
      '<div><label>Location / remote</label><input type="text" class="j-loc" value="' + esc(d.loc) + '" placeholder="Lagos, Nigeria · Hybrid"></div>' +
    '</div>' +
    '<label>Achievements — one per line, each with a number</label>' +
    '<textarea class="j-bul" rows="5" placeholder="Handled about 60 tickets a day across email and live chat&#10;Cut average first response from 8 hours to under 2&#10;Documented the top 5 issues into a help centre, removing about 30% of repeat tickets">' + esc(d.bul) + '</textarea>';
  w.querySelector('.xbtn').addEventListener('click', function () {
    w.remove(); renumber(); render(); save();
  });
  w.querySelectorAll('input,textarea').forEach(function (el) {
    el.addEventListener('input', function () { render(); save(); });
  });
  jobsEl.appendChild(w);
  if (!silent) { render(); save(); }
}
function renumber() {
  [].forEach.call(jobsEl.children, function (c, i) {
    c.querySelector('.roleblk-n').textContent = 'Role ' + (i + 1);
  });
}
function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function val(id) { var e = $(id); return e ? e.value.trim() : ''; }

function readJobs() {
  return [].map.call(jobsEl.children, function (c) {
    return {
      title: c.querySelector('.j-title').value.trim(),
      co:    c.querySelector('.j-co').value.trim(),
      dates: c.querySelector('.j-dates').value.trim(),
      loc:   c.querySelector('.j-loc').value.trim(),
      bul:   c.querySelector('.j-bul').value.trim()
    };
  }).filter(function (j) { return j.title || j.co || j.bul; });
}

function snapshot() {
  var o = { jobs: readJobs(), jd: jdPicked, tpl: tpl };
  FIELDS.forEach(function (f) { o[f] = val(f); });
  return o;
}
function save() { try { localStorage.setItem(LS, JSON.stringify(snapshot())); } catch (e) {} }
function load() {
  var raw; try { raw = localStorage.getItem(LS); } catch (e) { return; }
  if (!raw) return;
  var o; try { o = JSON.parse(raw); } catch (e) { return; }
  FIELDS.forEach(function (f) { if ($(f) && o[f]) $(f).value = o[f]; });
  jdPicked = o.jd || [];
  if (o.tpl && window.ERJDocx && window.ERJDocx.TEMPLATES[o.tpl]) tpl = o.tpl;
  jobsEl.innerHTML = '';
  (o.jobs || []).forEach(function (j) { addJob(true, j); });
}

/* ─────────────────────── THE TEN CHECKS ───────────────────────
   Same rubric as the public CV Self-Scan. Each returns:
     st  'pass' | 'part' | 'fail'
     why what to do about it, in one sentence
─────────────────────────────────────────────────────────────── */
var TOOL_WORDS = ['slack','zoom','notion','asana','jira','trello','clickup','teams','meet',
  'google workspace','loom','confluence','monday','basecamp','zendesk','intercom','hubspot',
  'salesforce','figma','github','gitlab','miro','airtable','linear','freshdesk','helpscout'];
var ASYNC_WORDS = ['document','documented','documentation','wrote','written','brief','handover',
  'async','asynchronous','process','sop','playbook','knowledge base','help centre','help center',
  'runbook','status update','without supervision','autonomous','autonomously','self-managed',
  'distributed team','remote team','cross-border','cross-functional','time zone','timezone'];
var STRONG_VERBS = ['built','architected','streamlined','delivered','spearheaded','led','launched',
  'reduced','increased','cut','grew','designed','implemented','automated','negotiated','resolved',
  'handled','managed','created','developed','trained','improved','rebuilt','introduced','shipped',
  'coordinated','owned','drove','established','scaled','recovered','migrated','documented'];
var WEAK_OPENERS = ['responsible for','duties included','tasked with','worked on','helped with',
  'assisted with','in charge of','involved in','participated in'];

function bullets(d) {
  var out = [];
  d.jobs.forEach(function (j) {
    j.bul.split('\n').forEach(function (b) { b = b.trim(); if (b) out.push(b); });
  });
  return out;
}
function allText(d) {
  /* Must mirror what render() actually puts in the document — including the
     keywords the user confirmed in step 3, which are appended to the skills
     line. Leaving them out meant the score contradicted the preview. */
  return [d.fSummary, d.fSkills, d.fTools, d.fEdu, d.fTitle, (d.jd || []).join(' ')]
    .concat(d.jobs.map(function (j) { return [j.title, j.co, j.loc, j.bul].join(' '); }))
    .join(' \n ').toLowerCase();
}

var CHECKS = [
  { id: 1, t: 'Clear timezone & location', run: function (d) {
      var hasCity = !!d.fCity, hasTz = /utc\s*[+\-]?\s*\d/i.test(d.fTz);
      if (hasCity && hasTz) return ok();
      if (hasCity || hasTz) return part('Add the missing half — you need <b>both</b> "Abuja, Nigeria" and "UTC+1" so an employer can work out overlap in one glance.');
      return bad('Add your city, country and UTC offset to the contact line. Remote employers screen for overlap before anything else.');
    }},
  { id: 2, t: 'Remote-ready summary', run: function (d) {
      var s = (d.fSummary || '').toLowerCase();
      if (s.length < 40) return bad('Write a three-to-four line summary. Without one, a recruiter has to assemble your value from bullets, and mostly will not.');
      var hits = ASYNC_WORDS.filter(function (w) { return s.indexOf(w) > -1; }).length;
      var seeking = /seeking|looking for an opportunity|opportunity to prove/.test(s);
      if (seeking) return part('Cut "seeking an opportunity" — it describes your need, not your value. Replace it with what you deliver.');
      if (hits >= 1) return ok();
      return part('Name your remote capability explicitly — working autonomously, distributed teams, or delivering across time zones.');
    }},
  { id: 3, t: 'Remote tool stack', run: function (d) {
      var t = (d.fTools || '').toLowerCase();
      var n = TOOL_WORDS.filter(function (w) { return t.indexOf(w) > -1; }).length;
      if (n >= 3) return ok();
      if (n >= 1) return part('Name at least three. One tool reads as incidental; three reads as someone who has actually worked this way.');
      return bad('Add a tools line — Slack, Zoom, Notion, Asana, Google Workspace. This is a scored point and it takes ten seconds.');
    }},
  { id: 4, t: 'ATS-safe formatting', run: function () {
      return ok('This engine only outputs a single-column layout with standard headings and no tables, graphics or text boxes — so this point is structurally guaranteed.');
    }},
  { id: 5, t: 'Quantifiable metrics', run: function (d) {
      var bs = bullets(d);
      if (!bs.length) return bad('Add your experience bullets in step 2.');
      var withNum = bs.filter(function (b) { return /\d/.test(b); }).length;
      var pct = withNum / bs.length;
      if (pct >= 0.6) return ok();
      if (pct >= 0.3) return part('Only ' + withNum + ' of ' + bs.length + ' bullets carry a number. Ask each one: <b>how many, and what changed?</b>');
      return bad(withNum + ' of ' + bs.length + ' bullets have a figure. Duties read the same as everyone else who held your job — numbers are what separate you.');
    }},
  { id: 6, t: 'Evidence of async work', run: function (d) {
      var txt = bullets(d).join(' ').toLowerCase() + ' ' + (d.fSummary || '').toLowerCase();
      var n = ASYNC_WORDS.filter(function (w) { return txt.indexOf(w) > -1; }).length;
      if (n >= 2) return ok();
      if (n === 1) return part('Add one more line showing you move work forward in writing — a process you documented, a handover, a status routine.');
      return bad('Nothing here shows you can work without live supervision. Add a bullet about something you documented or drove in writing.');
    }},
  { id: 7, t: 'Strong action verbs', run: function (d) {
      var bs = bullets(d);
      if (!bs.length) return bad('Add your experience bullets in step 2.');
      var weak = bs.filter(function (b) {
        var l = b.toLowerCase();
        return WEAK_OPENERS.some(function (w) { return l.indexOf(w) === 0; });
      }).length;
      var strong = bs.filter(function (b) {
        var first = b.toLowerCase().replace(/^[^a-z]+/, '').split(/\s+/)[0] || '';
        return STRONG_VERBS.indexOf(first) > -1;
      }).length;
      if (weak > 0) return bad(weak + ' bullet' + (weak > 1 ? 's start' : ' starts') + ' with a passive opener like "Responsible for". Step 4 will rewrite them.');
      if (strong / bs.length >= 0.6) return ok();
      return part('Open more bullets with a doing word — Built, Cut, Led, Documented, Resolved.');
    }},
  { id: 8, t: 'Keyword alignment', run: function (d) {
      if (!(d.fJd || '').trim()) return part('Paste the vacancy in step 3. Without a target, this point cannot be scored — and a generic CV is what most rejections are.');
      var need = extractJd(d.fJd);
      if (!need.length) return part('That job description produced no recognisable requirements. Check you pasted the full text.');
      var txt = allText(d);
      var got = need.filter(function (k) { return txt.indexOf(k.toLowerCase()) > -1; });
      var pct = got.length / need.length;
      if (pct >= 0.6) return ok(got.length + ' of ' + need.length + ' of their terms appear in your CV.');
      if (pct >= 0.3) return part('Only ' + got.length + ' of ' + need.length + ' of their terms appear. Step 3 shows exactly which are missing.');
      return bad('Just ' + got.length + ' of ' + need.length + ' of their terms appear. Mirror their wording for the things you genuinely have.');
    }},
  { id: 9, t: 'Professional links', run: function (d) {
      var li = !!d.fLinkedin, pf = !!d.fPortfolio;
      if (li && pf) return ok();
      if (li) return part('Add a portfolio or GitHub link. Proof beats claims, and it is a scored point.');
      if (pf) return part('Add your LinkedIn URL — recruiters check it, and a missing one reads as an incomplete candidate.');
      return bad('Add your LinkedIn and a portfolio link in step 2.');
    }},
  { id: 10, t: 'Universal file format', run: function () {
      return ok('Export with <b>Print / Save PDF</b> and your layout is locked on any device. Only send .doc when the employer asks for it.');
    }}
];
function ok(w)   { return { st: 'pass', why: w || 'Clear.' }; }
function part(w) { return { st: 'part', why: w }; }
function bad(w)  { return { st: 'fail', why: w }; }

/* ─────────────────────── JD EXTRACTION ─────────────────────── */
var JD_STOP = ('the and for with you your our are will have has that this from they their them a an of to in on at as be by or if it we us who what when '
  + 'able about across after all also am any because been being between both but can could did do does doing each else etc even ever every few first '
  + 'get give go good great had help here how into is its itself just keep know like look made make many may me more most much must my need new no not '
  + 'now off often once only other out over own per please really right same see should since so some such take than then there these thing think those '
  + 'through time too under up use used using very want was way well were which while who why work working works would year years role job candidate '
  + 'team teams company opportunity position responsibilities requirements experience skills strong excellent ability apply join looking ideal plus '
  + 'preferred required must-have nice benefits salary remote hybrid onsite full-time part-time contract '
  + 'emea apac amer latam anywhere worldwide global distributed hands comfortable familiar familiarity '
  + 'proficient proficiency knowledge understanding demonstrated exposure passion passionate eager keen '
  + 'join joining hiring hire seeking looking wanted apply application applicants candidates users customers '
  + 'client clients stakeholder stakeholders business product products service services support level senior '
  + 'junior mid lead manager management department organisation organization environment culture values '
  + 'plus bonus advantage desirable essential minimum maximum least well versed track record proven '
  + 'responsible responsibilities duty duties task tasks day days week weeks month months year years').split(/\s+/);

function extractJd(txt) {
  if (!txt) return [];
  var low = ' ' + txt.toLowerCase() + ' ';
  var found = {};
  /* named tools first — highest signal */
  TOOL_WORDS.forEach(function (t) { if (low.indexOf(t) > -1) found[t] = 1; });
  /* capitalised proper nouns from the original text (product names) */
  (txt.match(/\b[A-Z][A-Za-z0-9.+#]{2,}(?:\s[A-Z][A-Za-z0-9.+#]{2,})?/g) || []).forEach(function (w) {
    var l = w.toLowerCase().trim();
    if (l.length < 4 || l.length > 28) return;
    if (JD_STOP.indexOf(l.split(' ')[0]) > -1) return;
    if (/^(we|our|you|the|this|that|and|for|with|about|what|who|why|how|role|job)\b/.test(l)) return;
    found[l] = 1;
  });
  /* two-word skill phrases that repeat */
  var words = low.replace(/[^a-z0-9\s+#.\-]/g, ' ').split(/\s+/).filter(function (w) {
    return w.length > 2 && JD_STOP.indexOf(w) === -1;
  });
  var freq = {};
  for (var i = 0; i < words.length - 1; i++) {
    var bi = words[i] + ' ' + words[i + 1];
    freq[bi] = (freq[bi] || 0) + 1;
  }
  Object.keys(freq).forEach(function (k) { if (freq[k] >= 2) found[k] = 1; });
  return Object.keys(found).slice(0, 40);
}

/* ─────────────────────── HUMANISER ───────────────────────
   Rewrites phrasing only. Never adds a fact.
─────────────────────────────────────────────────────────── */
var RULES = [
  { re: /^responsible for\s+/i,      to: '',    note: 'Passive opener. Start with the doing word instead.', cap: true },
  { re: /^duties included\s+/i,      to: '',    note: 'Reads as a job description, not an achievement.', cap: true },
  { re: /^tasked with\s+/i,          to: '',    note: 'Passive. What did you actually do?', cap: true },
  { re: /^in charge of\s+/i,         to: 'Ran ', note: 'Vague. "Ran" is concrete.' },
  { re: /^worked on\s+/i,            to: 'Built ', note: '"Worked on" could mean anything.' },
  { re: /^helped (?:to |with )?/i,   to: '',    note: 'Helped how? Claim your own contribution.', cap: true },
  { re: /^assisted (?:with |in )?/i, to: 'Supported ', note: '"Assisted" understates you.' },
  { re: /^involved in\s+/i,          to: '',    note: 'Being involved is not doing.', cap: true },
  { re: /\bleverag(e|ed|ing)\b/gi,   to: 'used', note: 'Corporate filler. "Used" is a real word.' },
  { re: /\butilis(e|ed|ing)\b/gi,    to: 'used', note: 'Say "used".' },
  { re: /\butiliz(e|ed|ing)\b/gi,    to: 'used', note: 'Say "used".' },
  { re: /\bspearhead(ed|ing)?\b/gi,  to: 'led',  note: 'Overused. "Led" reads as a person, not a press release.' },
  { re: /\bsynerg(y|ies|istic)\b/gi, to: '',     note: 'Nobody has ever been hired for a synergy. Cut it.' },
  { re: /\bwear(ing)? many hats\b/gi,to: '',     note: 'Cliché. Name the actual jobs you did.' },
  { re: /\bthink outside the box\b/gi,to: '',    note: 'Appears on tens of thousands of CVs. Cut it.' },
  { re: /\bresults[- ]driven\b/gi,   to: '',     note: 'Show the result instead of claiming to be driven by them.' },
  { re: /\bhard[- ]working\b/gi,     to: '',     note: 'Everyone claims this. Numbers prove it.' },
  { re: /\bteam player\b/gi,         to: '',     note: 'Unfalsifiable filler.' },
  { re: /\bpassionate about\b/gi,    to: '',     note: 'Claimed passion persuades nobody. Evidence does.' },
  { re: /\bdynamic\b/gi,             to: '',     note: 'Means nothing on a CV.' },
  { re: /\bgo[- ]getter\b/gi,        to: '',     note: 'Cut it.' },
  { re: /\bdetail[- ]oriented\b/gi,  to: '',     note: 'Show it with an error rate instead.' },
  { re: /\btrack record of\b/gi,     to: '',     note: 'Just state the record.' },
  { re: /\bproven ability to\b/gi,   to: '',     note: 'Prove it with the next clause instead of claiming it.' },
  { re: /\bstate[- ]of[- ]the[- ]art\b/gi, to: '', note: 'Marketing language.' },
  { re: /\bcutting[- ]edge\b/gi,     to: '',     note: 'Marketing language.' },
  { re: /\bseamless(ly)?\b/gi,       to: '',     note: 'Nothing is seamless. Say what happened.' },
  { re: /\brobust\b/gi,              to: '',     note: 'Vague.' },
  { re: /\bvarious\b/gi,             to: '',     note: '"Various" hides the number. Give the number.' },
  { re: /\bnumerous\b/gi,            to: '',     note: 'Give the number instead.' },
  { re: /\bsuccessfully\b/gi,        to: '',     note: 'If it was not successful you would not list it.' },
  { re: /\bin order to\b/gi,         to: 'to',   note: 'Three words doing one word\u2019s job.' },
  { re: /\bdelve(d|s)? into\b/gi,    to: 'looked at', note: 'A word people rarely use out loud.' },
  { re: /\btapestry\b/gi,            to: '',     note: 'Reads as machine-written.' },
  { re: /\bmeticulous(ly)?\b/gi,     to: '',     note: 'Reads as machine-written.' },
  { re: /\bkindly revert\b/gi,       to: 'let me know', note: 'Regional; reads as archaic to an international reader.' },
  { re: /\bdo the needful\b/gi,      to: '',     note: 'Regional; state the specific action instead.' }
];

function humanise() {
  var d = snapshot();
  var out = $('humanOut');
  var items = [];

  function scan(label, text, apply) {
    if (!text) return;
    text.split('\n').forEach(function (line, li) {
      var t = line.trim(); if (!t) return;
      RULES.forEach(function (r) {
        if (!r.re.test(t)) return;
        r.re.lastIndex = 0;
        var fixed = t.replace(r.re, r.to);
        if (r.cap) fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
        fixed = fixed.replace(/\s{2,}/g, ' ').replace(/\s+([,.;])/g, '$1').trim();
        if (fixed === t || !fixed) return;
        items.push({ label: label, note: r.note, was: t, now: fixed, apply: apply, line: li });
        t = fixed;
      });
    });
  }

  scan('Summary', d.fSummary, function (v) { $('fSummary').value = v; });
  [].forEach.call(jobsEl.children, function (c, i) {
    scan('Role ' + (i + 1), c.querySelector('.j-bul').value, function (v) {
      c.querySelector('.j-bul').value = v;
    });
  });

  /* de-duplicate by original line, keeping the fully-rewritten version */
  var byLine = {};
  items.forEach(function (it) {
    var k = it.label + '::' + it.line;
    if (!byLine[k]) byLine[k] = { label: it.label, was: it.was, now: it.now, notes: [], apply: it.apply, line: it.line };
    byLine[k].now = it.now;
    if (byLine[k].notes.indexOf(it.note) === -1) byLine[k].notes.push(it.note);
  });
  var list = Object.keys(byLine).map(function (k) { return byLine[k]; });

  if (!list.length) {
    out.innerHTML = '<p class="clean">\u2713 Nothing flagged. No corporate filler, no passive openers, no phrases that read as machine-written. '
      + 'That is genuinely uncommon \u2014 most first drafts trip four or five of these.</p>'
      + '<div class="note"><b>One thing this cannot check.</b> Whether your bullets are true. '
      + 'Every number on this page has to survive an interviewer asking you about it, and you are the one who will be sitting there.</div>';
    return;
  }

  out.innerHTML = '<p class="hint" style="margin-bottom:0.9rem">Found <b>' + list.length + '</b> line'
    + (list.length > 1 ? 's' : '') + ' worth rewording. Each suggestion changes only the wording of a fact you already wrote.</p>'
    + list.map(function (it, i) {
        return '<div class="flag"><b>' + it.label + '</b> \u2014 ' + it.notes.join(' ')
          + '<br><span class="was">' + escHtml(it.was) + '</span>'
          + '<br><span class="now">' + escHtml(it.now) + '</span>'
          + '<br><button data-fix="' + i + '">Use the rewrite</button></div>';
      }).join('')
    + '<div class="note"><b>Read every rewrite before you accept it.</b> These rules are blunt on purpose. '
      + 'If cutting a word changes what you actually meant, keep your version \u2014 you know your work and the rule does not.</div>';

  out.querySelectorAll('button[data-fix]').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = list[+b.getAttribute('data-fix')];
      var el = (it.label === 'Summary') ? $('fSummary')
             : jobsEl.children[parseInt(it.label.replace('Role ', ''), 10) - 1].querySelector('.j-bul');
      var lines = el.value.split('\n');
      lines[it.line] = it.now;
      el.value = lines.join('\n');
      render(); save(); humanise();
    });
  });
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ─────────────────────── PARSER ─────────────────────── */
function parseCv() {
  var raw = $('pasteCv').value;
  if (!raw.trim()) { $('parseOut').innerHTML = '<b>Nothing pasted yet.</b> Copy your CV text into the box above first.'; return; }
  var lines = raw.split('\n').map(function (l) { return l.replace(/\s+$/, ''); });
  var found = [];

  var em = raw.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (em) { $('fEmail').value = em[0]; found.push('email'); }
  var ph = raw.match(/(\+?\d[\d\s().-]{8,}\d)/);
  if (ph) { $('fPhone').value = ph[1].trim(); found.push('phone'); }
  var li = raw.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,|]+/i);
  if (li) { $('fLinkedin').value = li[0]; found.push('LinkedIn'); }
  var gh = raw.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|behance\.net|dribbble\.com|notion\.site)\/[^\s,|]+/i);
  if (gh) { $('fPortfolio').value = gh[0]; found.push('portfolio'); }
  var tz = raw.match(/UTC\s*[+\-]\s*\d{1,2}/i);
  if (tz) { $('fTz').value = tz[0].replace(/\s+/g, ''); found.push('timezone'); }

  /* City / country. Split ONLY on pipes and bullets — never on commas,
     because "Lagos, Nigeria" is itself comma-separated. */
  var contactLine = lines.filter(function (l) { return /@/.test(l); })[0] || '';
  var PLACE = /^[A-Z][A-Za-z.'\-]+(?:[ ][A-Z][A-Za-z.'\-]+){0,2}(?:,[ ]*[A-Z][A-Za-z.'\-]+(?:[ ][A-Z][A-Za-z.'\-]+){0,2})?$/;
  function tryPlace(t) {
    if ($('fCity').value) return;
    t = (t || '').trim().replace(/[.,;]+$/, '');
    if (!t || /@|http|utc|\d/i.test(t)) return;
    if (t.split(/[ ]+/).length > 5) return;
    if (t === $('fName').value) return;
    if (!PLACE.test(t)) return;
    $('fCity').value = t; found.push('location');
  }
  contactLine.split(/[|\u2022\u00b7]/).forEach(tryPlace);
  /* fall back: a standalone "City, Country" line near the top */
  if (!$('fCity').value) {
    lines.slice(0, 8).forEach(function (l) { if (/,/.test(l)) tryPlace(l); });
  }

  /* name: first non-empty line that is not a contact detail */
  for (var i = 0; i < Math.min(lines.length, 6); i++) {
    var l = lines[i].trim();
    if (!l || /@|\d{4}|http/.test(l)) continue;
    if (l.length < 60 && /^[A-Za-z][A-Za-z .'\-]+$/.test(l)) { $('fName').value = l; found.push('name'); break; }
  }

  /* sections */
  var secs = {}, cur = null;
  var HEAD = /^\s*(professional\s+summary|summary|profile|objective|about|experience|work\s+experience|employment|professional\s+experience|education|qualifications|skills|core\s+skills|technical\s+skills|tools|technology|certifications?|projects?)\s*:?\s*$/i;
  lines.forEach(function (l) {
    var m = l.trim().match(HEAD);
    if (m) { cur = m[1].toLowerCase(); secs[cur] = []; return; }
    if (cur) secs[cur].push(l);
  });
  function pick() {
    for (var a = 0; a < arguments.length; a++) {
      var k = arguments[a];
      for (var s in secs) if (s.indexOf(k) > -1 && secs[s].join('').trim()) return secs[s].join('\n').trim();
    }
    return '';
  }
  var sum = pick('summary', 'profile', 'about', 'objective');
  if (sum) { $('fSummary').value = sum.replace(/\n+/g, ' ').trim(); found.push('summary'); }
  var sk = pick('skill');
  if (sk) { $('fSkills').value = sk.replace(/\n/g, ', ').replace(/[•\-–]\s*/g, '').replace(/,\s*,/g, ',').trim(); found.push('skills'); }
  var tl = pick('tool', 'technology');
  if (tl) { $('fTools').value = tl.replace(/\n/g, ', ').replace(/[•\-–]\s*/g, '').trim(); found.push('tools'); }
  var ed = pick('education', 'qualification', 'certification');
  if (ed) { $('fEdu').value = ed.replace(/^[•\-–]\s*/gm, '').trim(); found.push('education'); }

  /* experience: split on lines that look like a header (contain a year range) */
  var exp = pick('experience', 'employment');
  if (exp) {
    jobsEl.innerHTML = '';
    var blocks = [], b = null;
    exp.split('\n').forEach(function (l) {
      var t = l.trim(); if (!t) return;
      var isHead = /(19|20)\d{2}/.test(t) && t.length < 110 && !/^[•\-–*]/.test(t);
      if (isHead) { if (b) blocks.push(b); b = { head: t, bul: [] }; }
      else if (b) b.bul.push(t.replace(/^[•\-–*]\s*/, ''));
    });
    if (b) blocks.push(b);
    blocks.slice(0, 6).forEach(function (blk) {
      var dates = (blk.head.match(/((?:19|20)\d{2}|[A-Z][a-z]{2}\s*(?:19|20)\d{2})\s*[–\-—to]+\s*((?:19|20)\d{2}|[A-Z][a-z]{2}\s*(?:19|20)\d{2}|Present|Current)/i) || [])[0] || '';
      var rest = blk.head.replace(dates, '').replace(/[|,·]\s*$/, '').trim();
      var parts = rest.split(/\s*[|·,\u2013\u2014]\s*|\s+at\s+/i);
      addJob(true, { title: (parts[0] || '').trim(), co: (parts[1] || '').trim(), dates: dates.trim(), loc: (parts[2] || '').trim(), bul: blk.bul.join('\n') });
    });
    if (blocks.length) found.push(blocks.length + ' role(s)');
  }
  if (!jobsEl.children.length) addJob(true);

  $('parseOut').innerHTML = found.length
    ? '<b>Pulled out:</b> ' + found.join(', ') + '. <b>Now go to step 2 and check every field.</b> '
      + 'Parsers guess at where a job title ends and a date begins, and they guess wrong often enough that you should not trust this without reading it.'
    : '<b>Could not find much.</b> That usually means the text came out of a PDF with a two-column layout \u2014 which is also why employers\u2019 systems cannot read it. Fill step 2 by hand; it will be faster.';
  render(); save(); go('s2');
}

/* One normalised model. The preview, the plain-text export and the .docx
   all build from this, so they cannot disagree about what the CV says. */
function model() {
  var d = snapshot();
  var c = [];
  if (d.fCity) c.push(d.fCity + (d.fTz ? ' | ' + d.fTz : ''));
  else if (d.fTz) c.push(d.fTz);
  if (d.fEmail) c.push(d.fEmail);
  if (d.fPhone) c.push(d.fPhone);
  if (d.fLinkedin) c.push(d.fLinkedin);
  if (d.fPortfolio) c.push(d.fPortfolio);

  var skills = d.fSkills;
  if (jdPicked.length) {
    var extra = jdPicked.filter(function (k) { return (skills || '').toLowerCase().indexOf(k.toLowerCase()) === -1; });
    if (extra.length) skills = (skills ? skills + ', ' : '') + extra.join(', ');
  }
  return {
    name: d.fName, title: d.fTitle, contact: c.join(' | '), summary: d.fSummary,
    jobs: d.jobs.map(function (j) {
      return { title: j.title, co: j.co, dates: j.dates, loc: j.loc,
        bullets: (j.bul || '').split('\n').map(function (x) { return x.trim().replace(/^[\u2022\-\u2013*]\s*/, ''); }).filter(Boolean) };
    }),
    /* skills is now BOTH: the raw string (kept for the 10-point checks and
       for anything that still wants one line) and a split list, because
       CORE COMPETENCIES renders as separate lines like EXPERIENCE. */
    skills: skills,
    /* Capitalised because these are now standalone lines, not items mid-sentence
       in a comma run. "ticket triage" reads as a fragment on its own bullet. */
    skillList: (skills || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean)
      .map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }),
    tools: d.fTools,
    edu: (d.fEdu || '').split('\n').map(function (x) { return x.trim().replace(/^[\u2022\-\u2013*]\s*/, ''); }).filter(Boolean)
  };
}

/* ─────────────────────── RENDER ─────────────────────── */
function render() {
  var d = snapshot();

  /* checks */
  var results = CHECKS.map(function (c) {
    var r; try { r = c.run(d); } catch (e) { r = bad('Could not evaluate.'); }
    return { id: c.id, t: c.t, st: r.st, why: r.why };
  });
  var score = results.reduce(function (a, r) { return a + (r.st === 'pass' ? 1 : 0); }, 0);
  var partial = results.filter(function (r) { return r.st === 'part'; }).length;

  $('scoreN').innerHTML = score + '<small>/10</small>';
  var bar = $('scoreBar');
  bar.style.width = (score * 10) + '%';
  bar.style.background = score >= 8 ? 'var(--ok)' : (score >= 5 ? 'var(--warn)' : 'var(--bad)');
  $('verdict').innerHTML = score === 10
      ? 'Every point clear. This is the document to send.'
    : score >= 8
      ? 'Strong. ' + partial + ' point' + (partial === 1 ? '' : 's') + ' still partial \u2014 close ' + (partial === 1 ? 'it' : 'them') + ' and you are at 10.'
    : score >= 5
      ? 'Solid foundation. The amber and red points below are what is costing you callbacks.'
      : 'Structural work needed. Start with the red points \u2014 they are the ones that stop a human ever seeing this.';

  $('checks').innerHTML = results.map(function (r) {
    var mark = r.st === 'pass' ? '\u2713' : (r.st === 'part' ? '!' : '\u2715');
    return '<div class="chk"><span class="chk-dot ' + r.st + '">' + mark + '</span>'
      + '<span><span class="chk-t">' + String(r.id).padStart(2, '0') + ' \u00b7 ' + r.t + '</span>'
      + '<span class="chk-w">' + r.why + '</span></span></div>';
  }).join('');

  /* preview — uses the SAME model and the SAME headings as the .docx,
     so what a participant sees is what the exported file contains. */
  var m = model();
  var T = (window.ERJDocx && window.ERJDocx.TEMPLATES[tpl]) || { heads: {
    summary:'PROFESSIONAL SUMMARY', exp:'EXPERIENCE', skills:'CORE COMPETENCIES',
    tools:'TOOLS', edu:'EDUCATION & CERTIFICATIONS' }, showTitle: true };
  var H = T.heads;
  var html = '';
  html += '<h1>' + escHtml(m.name || 'Your Name') + '</h1>';
  if (T.showTitle && m.title) html += '<div class="cv-title">' + escHtml(m.title) + '</div>';
  if (m.contact) html += '<div class="cv-contact">' + escHtml(m.contact) + '</div>';
  if (m.summary) html += '<h2>' + H.summary + '</h2><p>' + escHtml(m.summary) + '</p>';
  if (m.jobs.length) {
    html += '<h2>' + H.exp + '</h2>';
    m.jobs.forEach(function (j) {
      html += '<div class="cv-job"><div class="cv-jt">' + escHtml(j.title || 'Role')
            + (j.co ? ' \u2014 ' + escHtml(j.co) : '') + '</div>';
      var meta = [j.dates, j.loc].filter(Boolean).map(escHtml).join(' | ');
      if (meta) html += '<div class="cv-jm">' + meta + '</div>';
      if (j.bullets.length) html += '<ul>' + j.bullets.map(function (x) { return '<li>' + escHtml(x) + '</li>'; }).join('') + '</ul>';
      html += '</div>';
    });
  }
  if (m.skillList.length) html += '<h2>' + H.skills + '</h2><ul class="cv-comp">'
    + m.skillList.map(function (x) { return '<li>' + escHtml(x) + '</li>'; }).join('') + '</ul>';
  if (m.tools)  html += '<h2>' + H.tools  + '</h2><p>' + escHtml(m.tools) + '</p>';
  if (m.edu.length) html += '<h2>' + H.edu + '</h2><ul>'
    + m.edu.map(function (x) { return '<li>' + escHtml(x) + '</li>'; }).join('') + '</ul>';

  $('preview').innerHTML = html;
  $('preview2').innerHTML = html;
}

/* ─────────────────────── JD PANEL ─────────────────────── */
function runJd() {
  var jd = val('fJd');
  if (!jd) { $('jdPanel').style.display = 'none'; $('tailorPanel').style.display = 'none'; return; }
  $('tailorPanel').style.display = '';
  var need = extractJd(jd);
  var txt = allText(snapshot());
  $('jdPanel').style.display = '';
  if (!need.length) {
    $('jdChips').innerHTML = '';
    $('jdNote').innerHTML = '<b>Nothing recognisable came out of that.</b> Paste the full vacancy text including the requirements list.';
    return;
  }
  var have = need.filter(function (k) { return txt.indexOf(k.toLowerCase()) > -1; });
  $('jdChips').innerHTML = need.map(function (k, i) {
    var isHave = have.indexOf(k) > -1;
    var isPicked = jdPicked.indexOf(k) > -1;
    return '<button class="chip ' + (isHave ? 'have' : (isPicked ? 'on' : '')) + '" data-k="' + i + '">'
      + (isHave ? '\u2713 ' : (isPicked ? '+ ' : '')) + escHtml(k) + '</button>';
  }).join('');
  $('jdChips').querySelectorAll('.chip').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = need[+b.getAttribute('data-k')];
      if (have.indexOf(k) > -1) return;
      var i = jdPicked.indexOf(k);
      if (i > -1) jdPicked.splice(i, 1); else jdPicked.push(k);
      runJd(); render(); save(); tailorPreview();
    });
  });
  tailorPreview();
  $('jdNote').innerHTML = '<b>' + have.length + ' of ' + need.length + '</b> of their terms already appear in your CV. '
    + 'Green ones are covered. Tap a grey chip only if you have genuinely done it \u2014 '
    + '<b>adding a tool you have never used is discovered in the interview, and it ends the process.</b>';
}


/* ─────────────────── SAFE TARGET ALIGNMENT ───────────────────
   The target job description is used as a comparison surface, not as a
   licence to rewrite history. Automatic alignment may change only:
   - the professional headline (a target position, not a historical title)
   - the order of skills and tools already supplied by the user
   It never changes employers, employment dates, historical role titles,
   achievement wording, or the order of experience bullets. */
var tailorBackup = null;

function jdTerms() {
  var jd = val('fJd');
  if (!jd) return [];
  var t = extractJd(jd).slice(0, 40);
  jdPicked.forEach(function (k) { if (t.indexOf(k) === -1) t.push(k); });
  return t;
}

var jdStemCache = { src: null, stems: null };
function stemsOf(text) {
  var out = {};
  (text || '').toLowerCase().replace(/[^a-z0-9\s+#.]/g, ' ').split(/\s+/).forEach(function (w) {
    if (w.length < 4 || JD_STOP.indexOf(w) > -1) return;
    out[w.slice(0, 5)] = 1;
  });
  return out;
}
function jdStems() {
  var jd = val('fJd') || '';
  if (jdStemCache.src === jd) return jdStemCache.stems;
  jdStemCache = { src: jd, stems: stemsOf(jd) };
  return jdStemCache.stems;
}
function relevance(line, terms) {
  if (!line) return 0;
  var low = ' ' + line.toLowerCase() + ' ', score = 0;
  terms.forEach(function (k) {
    if (!k) return;
    if (low.indexOf(k.toLowerCase()) > -1) score += (k.indexOf(' ') > -1 ? 4 : 3);
  });
  var stems = jdStems(), seen = {};
  Object.keys(stemsOf(line)).forEach(function (st) {
    if (stems[st] && !seen[st]) { seen[st] = 1; score += 1; }
  });
  if (/\d/.test(line)) score += 2;
  return score;
}
function byRelevance(arr, terms) {
  return arr.map(function (v, i) { return { v:v, i:i, s:relevance(v, terms) }; })
    .sort(function (a,b) { return b.s - a.s || a.i - b.i; })
    .map(function (o) { return o.v; });
}
function splitComma(v) {
  return (v || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}
function strongestEvidence(d, terms) {
  var out = [];
  (d.jobs || []).forEach(function (j) {
    (j.bul || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (b, i) {
      var s = relevance(b, terms);
      if (s > 0) out.push({ score:s, order:i, bullet:b, role:j.title || 'Role', co:j.co || '' });
    });
  });
  return out.sort(function (a,b) { return b.score-a.score || a.order-b.order; }).slice(0,5);
}
function targetCoverage(d, terms) {
  var txt = allText(d).toLowerCase();
  return {
    have: terms.filter(function (k) { return txt.indexOf(k.toLowerCase()) > -1; }),
    missing: terms.filter(function (k) { return txt.indexOf(k.toLowerCase()) === -1; })
  };
}
function safeTargetPreview() {
  var terms = jdTerms(), box = $('tailorNote');
  if (!box) return;
  if (!terms.length) {
    box.innerHTML = '<b>Paste the vacancy above first.</b> The engine needs the employer\'s own requirements before it can compare them with your CV.';
    $('tailorBtn').disabled = true;
    return;
  }
  $('tailorBtn').disabled = false;
  var d = snapshot(), cov = targetCoverage(d, terms), evidence = strongestEvidence(d, terms), adv = val('fJdRole');
  var ev = evidence.length ? '<br><br><b>Strongest evidence already in your CV:</b><ul style="margin:.55rem 0 0 1.1rem">' + evidence.map(function (e) {
    return '<li>' + escHtml(e.role + (e.co ? ' · ' + e.co : '')) + ': ' + escHtml(e.bullet) + '</li>';
  }).join('') + '</ul>' : '<br><br><b>Strongest evidence:</b> none of your current experience bullets clearly overlaps the vacancy yet.';
  var miss = cov.missing.length ? '<br><br><b>Target terms not yet evidenced:</b> ' + cov.missing.slice(0,8).map(escHtml).join(', ') + '.' : '<br><br><b>Coverage:</b> the main extracted target terms already appear somewhere in your CV.';
  box.innerHTML = '<b>' + cov.have.length + ' of ' + terms.length + '</b> extracted target terms already appear in your CV.'
    + (adv ? ' The advertised role is <b>' + escHtml(adv) + '</b>.' : ' Add the advertised role title above if you want the professional headline aligned too.')
    + ev + miss
    + '<br><br><b>Safe alignment changes only the professional headline and the order of skills/tools you already supplied.</b> It does not touch your employment history or achievement bullets.';
}
function tailorPreview() { safeTargetPreview(); }

function applyTailor() {
  var terms = jdTerms();
  if (!terms.length) return;
  tailorBackup = { title: val('fTitle'), skills: val('fSkills'), tools: val('fTools') };
  var adv = val('fJdRole').trim();
  if (adv) $('fTitle').value = adv;
  var sk = splitComma(val('fSkills'));
  if (sk.length > 1) $('fSkills').value = byRelevance(sk, terms).join(', ');
  var tl = splitComma(val('fTools'));
  if (tl.length > 1) $('fTools').value = byRelevance(tl, terms).join(', ');
  render(); save(); safeTargetPreview();
  $('untailorBtn').style.display = '';
  $('tailorBtn').textContent = 'Re-apply safe target alignment';
  $('tailorNote').insertAdjacentHTML('afterbegin','<b>Aligned safely.</b> Your target headline, skills and tools now lead with the employer-relevant items. Your job history and achievement bullets were not edited.<br><br>');
}
function undoTailor() {
  if (!tailorBackup) return;
  $('fTitle').value = tailorBackup.title;
  $('fSkills').value = tailorBackup.skills;
  $('fTools').value = tailorBackup.tools;
  tailorBackup = null;
  render(); save(); safeTargetPreview();
  $('untailorBtn').style.display = 'none';
  $('tailorBtn').textContent = 'Apply safe target alignment';
  $('tailorNote').insertAdjacentHTML('afterbegin','<b>Restored.</b> Your headline, skills and tools are back to their pre-alignment values.<br><br>');
}

/* ─────────────────────── EXPORT ─────────────────────── */
function plainText() {
  var m = model();
  var T = (window.ERJDocx && window.ERJDocx.TEMPLATES[tpl]) || { heads: {
    summary:'PROFESSIONAL SUMMARY', exp:'EXPERIENCE', skills:'CORE COMPETENCIES',
    tools:'TOOLS', edu:'EDUCATION & CERTIFICATIONS' }, showTitle: true };
  var H = T.heads, L = [];
  L.push(m.name || 'Your Name');
  if (T.showTitle && m.title) L.push(m.title);
  if (m.contact) L.push(m.contact);
  if (m.summary) { L.push('', H.summary, m.summary); }
  if (m.jobs.length) {
    L.push('', H.exp);
    m.jobs.forEach(function (j) {
      L.push('', (j.title || 'Role') + (j.co ? ' - ' + j.co : ''));
      var meta = [j.dates, j.loc].filter(Boolean).join(' | ');
      if (meta) L.push(meta);
      j.bullets.forEach(function (b) { L.push('- ' + b); });
    });
  }
  if (m.skillList.length) { L.push('', H.skills); m.skillList.forEach(function (x) { L.push('- ' + x); }); }
  if (m.tools)  L.push('', H.tools, m.tools);
  if (m.edu.length) { L.push('', H.edu); m.edu.forEach(function (e) { L.push('- ' + e); }); }
  return L.join('\n');
}

function fileName(ext) {
  var d = snapshot();
  var n = (d.fName || 'Your_Name').replace(/[^A-Za-z0-9]+/g, '_');
  var r = (d.fTitle || 'CV').replace(/[^A-Za-z0-9]+/g, '_');
  return n + '_' + r + '_CV.' + ext;
}
function dl(blob, name) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ─────────────────────── WIRING ─────────────────────── */
function renderTpl() {
  var host = $('tplPick'); if (!host || !window.ERJDocx) return;
  var T = window.ERJDocx.TEMPLATES;
  host.innerHTML = Object.keys(T).map(function (k) {
    return '<button class="chip ' + (k === tpl ? 'on' : '') + '" data-tpl="' + k + '">'
      + (k === tpl ? '\u2713 ' : '') + T[k].name + '</button>';
  }).join('');
  host.querySelectorAll('[data-tpl]').forEach(function (b) {
    b.addEventListener('click', function () {
      tpl = b.getAttribute('data-tpl'); renderTpl(); render(); save();
    });
  });
  $('tplNote').innerHTML = '<b>' + T[tpl].name + '.</b> ' + T[tpl].blurb;
}

window.go = function (id) {
  document.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('on', s.id === id); });
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-step') === id); });
  if (id === 's4') humanise();
  if (id === 's3') runJd();
  if (id === 's5') renderTpl();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
document.querySelectorAll('.tab').forEach(function (t) {
  t.addEventListener('click', function () { go(t.getAttribute('data-step')); });
});
FIELDS.forEach(function (f) {
  var e = $(f); if (e) e.addEventListener('input', function () { render(); save(); });
});
$('btnAddJob').addEventListener('click', function () { addJob(); });
$('btnParse').addEventListener('click', parseCv);
$('btnJd').addEventListener('click', function () { runJd(); render(); save(); });
$('fJdRole').addEventListener('input', function () { safeTargetPreview(); });
$('tailorBtn').addEventListener('click', applyTailor);
$('untailorBtn').addEventListener('click', undoTailor);
$('btnPdf').addEventListener('click', function () { window.print(); });
$('btnTxt').addEventListener('click', function () {
  navigator.clipboard.writeText(plainText()).then(
    function () { toast('Plain text copied \u2014 paste it into the portal box'); },
    function () { toast('Could not copy. Select the preview and copy by hand.'); });
});
$('btnDocx').addEventListener('click', function () {
  if (!window.ERJDocx) { toast('Export module did not load \u2014 refresh the page.'); return; }
  dl(window.ERJDocx.docxBlob(model(), tpl), fileName('docx'));
  toast('Real .docx downloaded \u2014 opens in Word, Google Docs and Pages.');
});

$('btnClear').addEventListener('click', function () {
  if (!confirm('Clear every field on this device? This cannot be undone.')) return;
  try { localStorage.removeItem(LS); } catch (e) {}
  FIELDS.forEach(function (f) { if ($(f)) $(f).value = ''; });
  jobsEl.innerHTML = ''; jdPicked = []; addJob(true);
  $('jdPanel').style.display = 'none'; render(); go('s1');
});
$('btnSample').addEventListener('click', function () {
  $('fName').value = 'Chidi Okafor';
  $('fTitle').value = 'Customer Support Specialist';
  $('fEmail').value = 'chidi.okafor@gmail.com';
  $('fPhone').value = '+234 803 000 0000';
  $('fCity').value = 'Abuja, Nigeria';
  $('fTz').value = 'UTC+1';
  $('fLinkedin').value = 'linkedin.com/in/chidiokafor';
  $('fPortfolio').value = 'chidiokafor.notion.site/support-portfolio';
  $('fSummary').value = 'Customer support specialist with four years handling high-volume queues for a Nigerian fintech. Cut average first-response time from eight hours to under two while holding satisfaction above 90 percent. Work written-first across distributed teams, documenting processes so colleagues in other time zones are never blocked waiting on me.';
  $('fSkills').value = 'Customer support, escalation management, ticket triage, technical troubleshooting, process documentation';
  $('fTools').value = 'Zendesk, Slack, Notion, Zoom, Google Workspace, Jira';
  $('fEdu').value = 'BSc Economics \u00b7 University of Lagos \u00b7 2019\nZendesk Support Administrator Certification \u00b7 2025';
  jobsEl.innerHTML = '';
  addJob(true, { title: 'Customer Support Officer', co: 'Paystack', dates: 'Jan 2023 \u2013 Mar 2025', loc: 'Lagos, Nigeria \u00b7 Hybrid',
    bul: 'Handled about 60 tickets a day across email and live chat for roughly 40,000 active users\nCut average first-response time from 8 hours to under 2 by rewriting reply templates and re-sorting the queue by issue type\nDocumented the five highest-volume issues into a help centre, removing about 30% of repeat tickets\nTrained four new support officers and wrote the onboarding runbook they still use' });
  addJob(true, { title: 'Bank Teller', co: 'First Bank', dates: 'Aug 2020 \u2013 Dec 2022', loc: 'Ibadan, Nigeria',
    bul: 'Processed about 120 customer transactions a day at an error rate under 1%\nResolved account disputes at first contact, escalating fewer than 5% to a supervisor' });
  render(); save(); go('s2');
  toast('Example loaded \u2014 a 10/10 document. Replace it with your own work.');
});

/* Auto-unlock last, once every function and variable above exists. */
try {
  var savedCode = localStorage.getItem(LSGATE);
  if (savedCode) tryGate(savedCode, true);
} catch (e) {}

function toast(t) {
  var el = document.createElement('div');
  el.textContent = t;
  el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9998;'
    + 'background:#111;color:#fff;padding:0.75rem 1.1rem;border-radius:10px;font-size:0.82rem;'
    + 'border:1px solid rgba(255,255,255,0.14);max-width:90vw;text-align:center;line-height:1.5;';
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 3800);
}
})();
