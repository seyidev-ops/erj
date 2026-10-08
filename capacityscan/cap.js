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

  /* ── advice ──────────────────────────────────────────────────
     Each question already names a concrete piece of the job, so the
     advice is written per DIMENSION and per ANSWER LEVEL and is shown
     beside the question it answers. Nothing here invents a skill the
     person did not select; it only says how to move one level up. */
  var FIX = {
    knowledge: {
      0: 'Learn the concept before anything else. Take one beginner course, guide or official documentation on exactly this, then write a one-page explanation in your own words. If you cannot write the page, you have not learnt it yet.',
      1: 'Explain it out loud or in writing without notes, to someone who does not know the field. The point where you stall is the exact thing to study next.'
    },
    execution: {
      0: 'Complete it once from start to finish on a practice version — a sample file, a mock brief, a simulated inbox or ticket queue. Follow a guide the first time; finishing is the goal, not perfection.',
      1: 'Do it again without guidance and against the clock, then compare your output with a professional example. Repeat until you can do it alone and the result would survive a manager reading it.'
    },
    tools: {
      0: 'Open a free account or trial of the tool and complete its official getting-started tutorial. Most of these tools publish their own free training — use it.',
      1: 'Use the tool for a real piece of your own work for two weeks, without a tutorial open. Fluency is doing it without looking it up.'
    },
    judgement: {
      0: 'Find three real examples of this situation (case studies, forum threads, interviews with practitioners). Write down what you would decide and why, then compare with what experienced people actually did.',
      1: 'Talk the scenario through with someone who does this job for a living and note where your call differs from theirs. Judgement is built from those differences.'
    },
    evidence: {
      0: 'Produce one small, finished piece of practice work you can show and explain end to end. Small and finished beats large and half-done.',
      1: 'Turn practice work into real work: do it for a small business, a community group or a short freelance brief, so someone depends on the result. That is the difference an employer is looking for.'
    }
  };

  function answerLabel(q, v) {
    var lv = q.d === 'evidence' ? EVIDENCE_LEVELS : LEVELS;
    return lv[v] ? lv[v].label : '—';
  }

  function gaps(r) {
    var dimLabel = {};
    BANK.dims.forEach(function (d) { dimLabel[d.k] = d.label; });
    var list = [];
    r.fam.q.forEach(function (q, i) {
      var v = state.answers[i] || 0;
      if (v < 2) list.push({ i: i, q: q.q, core: !!q.core, v: v, d: q.d,
        dim: dimLabel[q.d], answer: answerLabel(q, v), fix: FIX[q.d][v] });
    });
    /* Central task first, then the lowest answers, then question order. */
    list.sort(function (a, b) {
      if (a.core !== b.core) return a.core ? -1 : 1;
      if (a.v !== b.v) return a.v - b.v;
      return a.i - b.i;
    });
    return list;
  }

  function coreQuestion(r) {
    var q = r.fam.q.filter(function (x) { return x.core; })[0];
    return q ? q.q : '';
  }

  function gateLine(r) {
    if (r.pass) return 'The gate is 5 out of 10 with the central task of the profession above zero. You cleared both.';
    if (!r.corePass && r.total >= 5) return 'The gate is 5 out of 10 with the central task above zero. Your total cleared it; the central task did not, and that alone holds the gate shut.';
    var need = Math.max(0, 5 - r.total);
    return 'The gate is 5 out of 10 with the central task above zero. You are ' +
      (need % 1 === 0 ? need : need.toFixed(1)) + ' point' + (need === 1 ? '' : 's') + ' short' +
      (r.corePass ? '.' : ', and the central task scored zero.') +
      ' Each answer moved up one level adds half a point.';
  }

  /* Three steps, in order. Written per band so the plan always matches
     the verdict above it. */
  function plan(r, b, g) {
    var first = g[0], second = g[1];
    var fixLine = function (x) { return x ? '“' + x.q + '” You answered ' + x.answer.toLowerCase() + '. The exact fix is in the list below.' : ''; };
    if (b.key === 'core') return [
      { title: 'Build the central task first', body: fixLine(g[0]) },
      { title: 'Produce one worked sample of it', body: 'One finished example of the central task you could show a stranger and explain. That single piece is what moves this result from “not yet” to a pass.' },
      { title: 'Scan again once the sample exists', body: 'The rest of your score is already above the line. When the central task is above zero, the audit passes and the next four checkpoints open.' }
    ];
    if (b.key === 'build') return [
      { title: 'Start with one skill, not the whole role', body: first ? fixLine(first) : 'Choose the central task of the role and learn only that first.' },
      { title: 'Learn, practise, produce', body: 'Use the free resources to learn it, practise it on a sample until you can do it alone, then produce one small finished piece of work. Do not buy positioning, CV or application help yet — there is nothing for it to position.' },
      { title: 'Scan again when you have something to show', body: 'Your target is 5 out of 10 with the central task above zero. Scan again after the first finished piece of work, not before.' }
    ];
    if (b.key === 'emerging') return [
      { title: 'Close your two weakest answers', body: [first, second].filter(Boolean).map(function (x) { return '“' + x.q + '”'; }).join(' and ') + ' — the exact fix for each is in the list below.' },
      { title: 'Turn practice into evidence', body: 'Produce one piece of work that uses what you just strengthened, and be able to explain every decision in it. Evidence is the fastest half-point on this scale.' },
      { title: 'Scan again, aiming for 5 out of 10', body: gateLine(r) }
    ];
    var gapStep = first
      ? { title: 'Keep closing your weakest answer in parallel', body: fixLine(first) }
      : { title: 'Keep your edge current', body: 'No gaps showed up. Keep producing real work in this role so your evidence stays recent.' };
    return [
      { title: 'Find the next weak point — run the free diagnosis', body: 'Capacity is cleared, so the question moves downstream: can you find enough suitable work, can employers read you, are you aiming correctly, and do you convert interest into offers? The diagnosis names the earliest one that is failing.' },
      { title: 'Check how you are represented', body: 'Run the free 10-Point CV Self-Scan. Capacity you cannot show on paper is capacity an employer never sees.' },
      gapStep
    ];
  }

  function viewResult() {
    var r = score(), b = band(r), g = gaps(r), p = plan(r, b, g);
    var box = mount();
    box.innerHTML = '';
    var shown = (r.total % 1 === 0) ? String(r.total) : r.total.toFixed(1);
    var fmt = function (v) { return v % 1 === 0 ? String(v) : v.toFixed(1); };

    var card = el('div', 'csc-result is-' + b.key);
    card.appendChild(el('div', 'csc-score',
      '<b>' + shown + '</b><span>out of 10</span>'));
    card.appendChild(el('p', 'csc-tag', esc(b.tag)));
    card.appendChild(el('p', 'csc-gate ' + (b.pass ? 'is-pass' : 'is-fail'),
      '<b>Capacity gate: ' + (b.pass ? 'passed' : 'not yet passed') + '</b><span>' + esc(gateLine(r)) + '</span>'));
    card.appendChild(el('h3', 'csc-head', esc(b.head)));
    card.appendChild(el('p', 'csc-body', esc(b.body)));
    card.appendChild(el('p', 'csc-role-line',
      'Role family assessed: <b>' + esc(r.fam.label) + '</b>'));
    box.appendChild(card);

    /* the report button sits high, where people look for it */
    var dl = el('div', 'csc-dl');
    dl.innerHTML = '<button class="btn-primary-ui btn-yes" type="button" id="capPdf"><span>Download Your Report (PDF)</span><span class="arrow-wrap"><span class="arrow is-down">↓</span></span></button>' +
      '<span class="csc-dl-note">Your score, your gaps and your action plan. Made on this device — nothing is uploaded.</span>';
    box.appendChild(dl);

    box.appendChild(el('p', 'csc-sub', 'Where the score came from'));
    var grid = el('div', 'csc-dims');
    BANK.dims.forEach(function (d) {
      var v = r.dims[d.k];
      var row = el('div', 'csc-dim' + (v <= 1 ? ' is-low' : ''));
      row.innerHTML = '<span class="csc-dim-l">' + esc(d.label) + '</span>' +
        '<span class="csc-dim-bar" aria-hidden="true"><i style="width:' + (v / 2 * 100) + '%"></i></span>' +
        '<span class="csc-dim-v">' + fmt(v) + ' / 2</span>';
      grid.appendChild(row);
    });
    box.appendChild(grid);

    if (!r.corePass) {
      box.appendChild(el('p', 'csc-note is-warn',
        'The central task of this profession — <b>' + esc(coreQuestion(r)) + '</b> — scored zero. That is the one result the audit will not pass, at any total.'));
    }

    box.appendChild(el('p', 'csc-sub', 'Your action plan'));
    var ol = el('ol', 'csc-plan');
    p.forEach(function (s) {
      ol.appendChild(el('li', null, '<b>' + esc(s.title) + '</b><span>' + esc(s.body) + '</span>'));
    });
    box.appendChild(ol);

    if (g.length) {
      box.appendChild(el('p', 'csc-sub', 'What to build, question by question'));
      box.appendChild(el('p', 'csc-help',
        'Every answer below the top level, the central task first, then lowest first. Move each one up a level and your score rises by half a point.'));
      var list = el('div', 'csc-fixes');
      g.forEach(function (x) {
        var it = el('div', 'csc-fix' + (x.core ? ' is-core' : ''));
        it.innerHTML =
          '<p class="csc-fix-k">' + (x.core ? 'Central task · ' : '') + esc(x.dim) +
          ' · you answered <b>' + esc(x.answer) + '</b></p>' +
          '<p class="csc-fix-q">' + esc(x.q) + '</p>' +
          '<p class="csc-fix-a"><b>Do this:</b> ' + esc(x.fix) + '</p>';
        list.appendChild(it);
      });
      box.appendChild(list);
    }

    if (r.strong.length) {
      box.appendChild(el('p', 'csc-sub', 'What you already have'));
      box.appendChild(el('p', 'csc-note', 'Strongest: <b>' + esc(r.strong.join(', ')) + '</b>.'));
    }

    box.appendChild(el('p', 'csc-sub', 'Your next move'));
    var acts = el('div', 'csc-acts');
    var nextLine;
    if (b.pass) {
      acts.innerHTML =
        '<a class="btn-primary-ui btn-yes" href="../diagnose/"><span>Continue Your ERJ Diagnosis — Free</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>' +
        '<a class="btn-more btn-secondary-ui" href="../cvscan/"><span>Next: Can Employers Read You?</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>';
      nextLine = 'Capacity is the first of five. The next four checkpoints are Supply, Representation, Aim and Conversion — and the diagnostic names which one is costing you most.';
    } else {
      acts.innerHTML =
        '<a class="btn-primary-ui btn-yes" href="../free.html"><span>Build The Skill — Free Resources</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>' +
        '<a class="btn-more btn-secondary-ui" href="' +
        'https://wa.me/2348032925957?text=' + encodeURIComponent(
          'CAPACITY\n\nI scanned for ' + r.fam.label + ' and scored ' + shown +
          '/10. I would like to know what to build first.') +
        '" rel="noopener" target="_blank"><span>Ask What To Build First</span><span class="arrow-wrap"><span class="arrow">→</span></span></a>';
      nextLine = 'We are not going to sell you Foundation Training today. Positioning cannot compensate for a skill that is not there yet — and telling you so is cheaper for you than finding out after you have paid.';
    }
    box.appendChild(acts);
    box.appendChild(el('p', 'csc-note', esc(nextLine)));
    /* A paid route to build the skill, offered only below the threshold and
       only where The Mentorine School actually has a matching track. The free
       route stays first. '' = several tracks fit, so nothing is preselected. */
    var CD_TRACK = { admin:'Virtual Assistant', support:'Customer Support Specialist', marketing:'Digital Marketer',
      writing:'Copywriter', data:'Data Analyst', dev:'', pm:'Project Manager', design:'', product:'Product Manager' };
    if (!b.pass && r.fam && CD_TRACK.hasOwnProperty(r.fam.id)) {
      var t = CD_TRACK[r.fam.id];
      box.appendChild(el('p', 'csc-note',
        'Want a structured way to build it? <a href="../register.html' + (t ? '?track=' + encodeURIComponent(t) : '') +
        '#careerdev">Career Development — Self-Study</a> gives you ' + (t ? 'the ' + esc(t) + ' track' : 'a career track of your choice') +
        ' at The Mentorine School for 90 days: a roadmap, courses and practical exercises. It is paid; the free route above is not.'));
    }

    var nav = el('div', 'csc-nav');
    var redo = el('button', 'csc-back', 'Retake for the same role');
    redo.type = 'button';
    redo.addEventListener('click', function () { state.answers = []; state.i = 0; viewQuestion(); });
    nav.appendChild(redo);
    var again = el('button', 'csc-back', 'Scan a different role');
    again.type = 'button';
    again.addEventListener('click', viewPick);
    nav.appendChild(again);
    box.appendChild(nav);

    var dimRows = BANK.dims.map(function (d) {
      return { label: d.label, value: r.dims[d.k], shown: fmt(r.dims[d.k]) };
    });
    $('#capPdf', box).addEventListener('click', function () {
      if (!window.ERJCapacityPDF) return;
      window.ERJCapacityPDF.download({
        score: shown, tag: b.tag, head: b.head, body: b.body, pass: b.pass,
        gate: gateLine(r), family: r.fam.label, familyShort: r.fam.label.split('·')[0].trim(),
        dims: dimRows, plan: p,
        gaps: g.map(function (x) { return { q: x.q, core: x.core, dim: x.dim, answer: x.answer, fix: x.fix }; }),
        strong: r.strong,
        answers: r.fam.q.map(function (q, i) { var v = state.answers[i] || 0; return { q: q.q, v: v, answer: answerLabel(q, v) }; }),
        next: nextLine,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      });
      if (typeof window.erjTrack === 'function') {
        try { window.erjTrack('CapacityReportDownloaded', { content_name: 'Capacity PDF - ' + r.fam.label, value: 0, method: 'download' }); } catch (e) {}
      }
    });

    if (typeof window.erjTrack === 'function') {
      try { window.erjTrack('CapacityScanComplete', { content_name: 'Capacity - ' + r.fam.label + ' - ' + b.key, value: 0, method: 'capacity_audit' }); } catch (e) {}
    }
    box.scrollIntoView({ block: 'start' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', viewPick);
  } else { viewPick(); }
})();
