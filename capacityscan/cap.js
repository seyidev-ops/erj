"use strict";
/* ═══════════════════════════════════════════════════════════════
   ERJ CAPACITY AUDIT · the first finger, and the gate

   Capacity answers exactly one question: can this person perform
   the work they want to be hired to do, at a basic employable
   standard? It does not score the CV, the job search, eligibility
   or interviewing. Those are Representation, Supply, Aim and
   Conversion, and scoring them here would let Capacity swallow the
   whole model.

   Scoring. Five dimensions, two questions each, every question
   worth 0, 1 or 2. Raw 0–20 halves to the published 0–10 score, so
   each dimension reports out of 2 exactly as the standard states.

   The gate. Score ≥ 5 AND the profession's central task scored
   above zero. A zero on the core task fails the audit at any total,
   because 6/10 while unable to do the central work of the job is
   the one result this instrument must never produce.

   Nothing is uploaded and nothing is stored. The answers live in
   this tab and die with it.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var BANK = window.ERJ_CAPACITY_BANK;
  if (!BANK) return;

  var LEVELS = [
    { v: 0, label: 'Not yet', note: 'I could not do this on my own today' },
    { v: 1, label: 'With help', note: 'I understand it, or have done it with guidance' },
    { v: 2, label: 'Independently', note: 'I can do this alone to a basic professional standard' }
  ];
  /* The evidence questions ask what exists, not what you could do. */
  var EVIDENCE_LEVELS = [
    { v: 0, label: 'Nothing yet', note: 'I have no work I could show or talk through' },
    { v: 1, label: 'Practice work', note: 'Coursework, training, simulated or personal projects' },
    { v: 2, label: 'Real work', note: 'Work someone depended on, which I can explain end to end' }
  ];

  var state = { family: null, answers: [], i: 0 };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };

  /* ── scoring ───────────────────────────────────────────────── */
  function score() {
    var fam = BANK.families.filter(function (f) { return f.id === state.family; })[0];
    var raw = 0, dims = {}, coreScore = null, weak = [], strong = [];
    BANK.dims.forEach(function (d) { dims[d.k] = 0; });
    fam.q.forEach(function (q, i) {
      var a = state.answers[i] || 0;
      raw += a;
      dims[q.d] += a;
      if (q.core) coreScore = a;
    });
    BANK.dims.forEach(function (d) {
      var out = dims[d.k] / 2;                 /* 0–4 raw → 0–2 published */
      dims[d.k] = out;
      if (out <= 1) weak.push(d.label);
      if (out >= 1.5) strong.push(d.label);
    });
    var total = raw / 2;                        /* 0–10, half steps */
    var corePass = coreScore === null || coreScore > 0;
    var pass = total >= 5 && corePass;
    return { fam: fam, total: total, dims: dims, weak: weak, strong: strong,
             corePass: corePass, coreScore: coreScore, pass: pass };
  }

  /* The five published bands. Core-task failure overrides the band. */
  function band(r) {
    /* The core-task rule exists to stop a PASSING score hiding an incapable
       core. Below the threshold the score already says "build first" in
       plainer words, so the override only fires where it would otherwise
       have been a pass. The zero is still called out under the breakdown. */
    if (!r.corePass && r.total >= 5) {
      return {
        key: 'core', tag: 'Capacity development required',
        head: 'Some supporting skills are present, but not the central one.',
        body: 'You scored zero on the task the profession is built around. Whatever the total says, an employer hiring for this role is buying that task. Until it is there, everything downstream — the CV, the search, the interview — is repairing the wrong thing.',
        pass: false
      };
    }
    if (r.total < 3) return {
      key: 'build', tag: 'Capacity not yet present',
      head: 'Your first problem is not your CV, your job search or your applications.',
      body: 'This scan indicates you still need to build the underlying professional skill for the role you selected. ERJ does not recommend Foundation Training or job-application services for you yet. Your next step is career development: learn the skill, practise it, produce real work, and come back and scan again. Build the ability first. Then we can help you take that ability to the global market.',
      pass: false
    };
    if (r.total < 5) return {
      key: 'emerging', tag: 'Capacity emerging',
      head: 'You are close, but we would not start your remote-job campaign yet.',
      body: 'You already have part of the required capability, and the scan found specific functional gaps that would become a problem once you are hired. Strengthen the areas below, practise them, and scan again. Your objective is to reach at least 5 out of 10.',
      pass: false
    };
    if (r.total < 6) return {
      key: 'minimum', tag: 'Minimum capacity confirmed',
      head: 'You have crossed ERJ’s minimum capacity threshold.',
      body: 'This does not mean there is nothing left to learn. It means there is enough underlying professional ability for us to begin working on your remote-job pursuit. You may proceed to the next four checkpoints.',
      pass: true
    };
    if (r.total < 8) return {
      key: 'capable', tag: 'Work-capable',
      head: 'You can do the work.',
      body: 'Your scan shows sufficient occupational ability for the role you selected. Further development will still make you more competitive, but skill deficiency is unlikely to be the first reason your remote-job search is failing. Continue to Supply, Representation, Aim and Conversion.',
      pass: true
    };
    return {
      key: 'strong', tag: 'Strong capacity',
      head: 'Capacity is not where you should spend your time.',
      body: 'Your scan indicates strong functional ability for this role. If your search is stalled, the fault is downstream: whether you are seeing the right opportunities, whether employers can read your value, whether you are targeting correctly, and whether you convert employer interest into an offer.',
      pass: true
    };
  }

  /* ── views ─────────────────────────────────────────────────── */
  var mount = function () { return $('#capApp'); };

  function viewPick() {
    var box = mount();
    box.innerHTML = '';
    var h = el('div', 'csc-step');
    h.appendChild(el('p', 'csc-kicker', 'Step 1 of 2'));
    h.appendChild(el('h3', 'csc-q', 'What job do you want to be hired to do?'));
    h.appendChild(el('p', 'csc-help', 'Pick the family closest to the work itself. We are checking the skill, not the job title.'));
    box.appendChild(h);
    var grid = el('div', 'csc-roles');
    BANK.families.forEach(function (f) {
      var b = el('button', 'csc-role', esc(f.label));
      b.type = 'button';
      b.addEventListener('click', function () {
        state.family = f.id; state.answers = []; state.i = 0; viewQuestion();
      });
      grid.appendChild(b);
    });
    var other = el('a', 'csc-role is-other',
      'My role is not here — request a manual audit');
    other.href = 'https://wa.me/2348032925957?text=' + encodeURIComponent(
      'CAPACITY AUDIT\n\nMy target role is not in the list. The role I want to be hired for is: ');
    other.rel = 'noopener'; other.target = '_blank';
    grid.appendChild(other);
    box.appendChild(grid);
  }

  function viewQuestion() {
    var fam = BANK.families.filter(function (f) { return f.id === state.family; })[0];
    var q = fam.q[state.i];
    var levels = q.d === 'evidence' ? EVIDENCE_LEVELS : LEVELS;
    var box = mount();
    box.innerHTML = '';
    var pct = Math.round((state.i / fam.q.length) * 100);
    var bar = el('div', 'csc-bar');
    bar.innerHTML = '<span style="width:' + pct + '%"></span>';
    box.appendChild(bar);
    var head = el('div', 'csc-step');
    head.appendChild(el('p', 'csc-kicker',
      esc(fam.label) + ' · question ' + (state.i + 1) + ' of ' + fam.q.length));
    head.appendChild(el('h3', 'csc-q', esc(q.q)));
    box.appendChild(head);
    var opts = el('div', 'csc-opts');
    levels.forEach(function (lv) {
      var b = el('button', 'csc-opt',
        '<b>' + lv.label + '</b><span>' + lv.note + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        state.answers[state.i] = lv.v;
        state.i++;
        if (state.i >= fam.q.length) viewResult(); else viewQuestion();
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    var nav = el('div', 'csc-nav');
    if (state.i > 0) {
      var back = el('button', 'csc-back', '← Previous question');
      back.type = 'button';
      back.addEventListener('click', function () { state.i--; viewQuestion(); });
      nav.appendChild(back);
    }
    var restart = el('button', 'csc-back', 'Change role');
    restart.type = 'button';
    restart.addEventListener('click', viewPick);
    nav.appendChild(restart);
    box.appendChild(nav);
    box.scrollIntoView({ block: 'nearest' });
  }

  function viewResult() {
    var r = score(), b = band(r);
    var box = mount();
    box.innerHTML = '';
    var card = el('div', 'csc-result is-' + b.key);
    var shown = (r.total % 1 === 0) ? r.total : r.total.toFixed(1);
    card.appendChild(el('div', 'csc-score',
      '<b>' + shown + '</b><span>out of 10</span>'));
    card.appendChild(el('p', 'csc-tag', esc(b.tag)));
    card.appendChild(el('h3', 'csc-head', esc(b.head)));
    card.appendChild(el('p', 'csc-body', esc(b.body)));
    card.appendChild(el('p', 'csc-role-line',
      'Role family assessed: <b>' + esc(r.fam.label) + '</b>'));
    box.appendChild(card);

    var grid = el('div', 'csc-dims');
    BANK.dims.forEach(function (d) {
      var v = r.dims[d.k];
      var row = el('div', 'csc-dim' + (v <= 1 ? ' is-low' : ''));
      row.innerHTML = '<span class="csc-dim-l">' + esc(d.label) + '</span>' +
        '<span class="csc-dim-v">' + (v % 1 === 0 ? v : v.toFixed(1)) + ' / 2</span>';
      grid.appendChild(row);
    });
    box.appendChild(el('p', 'csc-sub', 'Where the score came from'));
    box.appendChild(grid);

    if (r.strong.length) {
      box.appendChild(el('p', 'csc-sub', 'What you already have'));
      box.appendChild(el('p', 'csc-note', 'Strongest: <b>' + esc(r.strong.join(', ')) + '</b>.'));
    }
    if (r.weak.length) {
      box.appendChild(el('p', 'csc-sub', 'What is still missing'));
      var ul = el('ul', 'csc-gaps');
      r.weak.forEach(function (w) { ul.appendChild(el('li', null, esc(w))); });
      box.appendChild(ul);
      box.appendChild(el('p', 'csc-note',
        'Strengthen these before you spend money on positioning. They are the areas that would become visible once you are hired.'));
    }
    if (!r.corePass) {
      box.appendChild(el('p', 'csc-note is-warn',
        'The central task of this profession scored zero. That is the one result the audit will not pass, at any total.'));
    }

    box.appendChild(el('p', 'csc-sub', 'Your next move'));
    var acts = el('div', 'csc-acts');
    if (b.pass) {
      acts.innerHTML =
        '<a class="btn-primary-ui btn-yes" href="../diagnose/"><span>Continue Your ERJ Diagnosis — Free</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>' +
        '<a class="btn-more btn-secondary-ui" href="../cvscan/"><span>Next: Can Employers Read You?</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>';
      box.appendChild(acts);
      box.appendChild(el('p', 'csc-note',
        'Capacity is the first of five. The next four checkpoints are Supply, Representation, Aim and Conversion — and the diagnostic names which one is costing you most.'));
    } else {
      acts.innerHTML =
        '<a class="btn-primary-ui btn-yes" href="../free.html"><span>Build The Skill — Free Resources</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>' +
        '<a class="btn-more btn-secondary-ui" href="' +
        'https://wa.me/2348032925957?text=' + encodeURIComponent(
          'CAPACITY\n\nI scanned for ' + r.fam.label + ' and scored ' + shown +
          '/10. I would like to know what to build first.') +
        '" rel="noopener" target="_blank"><span>Ask What To Build First</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>';
      box.appendChild(acts);
      box.appendChild(el('p', 'csc-note',
        'We are not going to sell you Foundation Training today. Positioning cannot compensate for a skill that is not there yet — and telling you so is cheaper for you than finding out after you have paid.'));
    }

    var again = el('button', 'csc-back', 'Scan a different role');
    again.type = 'button';
    again.addEventListener('click', viewPick);
    var nav = el('div', 'csc-nav');
    nav.appendChild(again);
    box.appendChild(nav);

    if (window.ERJ_TRACK && typeof window.ERJ_TRACK.event === 'function') {
      try { window.ERJ_TRACK.event('capacity_scan_complete',
        { role: r.fam.id, score: r.total, band: b.key }); } catch (e) {}
    }
    box.scrollIntoView({ block: 'nearest' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', viewPick);
  } else { viewPick(); }
})();
