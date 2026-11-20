"use strict";
/* ═══════════════════════════════════════════════════════════════
   FIND WHAT IS HOLDING YOU BACK · five-part diagnostic  (dx.ts)
   Compile: tsc diagnose/dx.ts --target es2017 --strict --lib es2017,dom

   Five questions, weighted. Each answer adds to one or two parts;
   the highest total wins, with an explicit tie-break that prefers
   the EARLIEST joint in the pipe — because a weak point upstream makes
   every downstream reading unreliable. Someone who cannot find
   real roles has no meaningful conversion data yet.

   Nothing is stored by the diagnostic. No email field and no answer payload is
   sent to ERJ unless the person chooses WhatsApp. Completion/click events may
   be counted by the site analytics so the funnel can be improved.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const QUESTIONS = [
        {
            topic: 'whether you can do the work today',
            q: 'Thinking about the remote roles you want \u2014 could you do the job itself today, without training first?',
            why: 'This is the one question people skip. A CV rewrite cannot close a skill gap, and no amount of applying fixes work you cannot yet deliver.',
            answers: [
                { label: 'Not yet \u2014 I am still learning the actual skill', note: 'the honest answer, and a common one', weight: { capacity: 6 } },
                { label: 'I can do the work, but never remotely', note: 'no experience being managed at a distance', weight: { capacity: 4 } },
                { label: 'Yes \u2014 I have done this work, in an office', weight: { capacity: 1, representation: 1 } },
                { label: 'Yes, and I have delivered it remotely before', weight: { representation: 1, aim: 1 } }
            ]
        },
        {
            topic: 'how many real roles you found last month',
            q: 'In the last month, how many remote roles have you found that you were genuinely eligible for?',
            why: 'Eligible means the company can actually pay someone in your country \u2014 not just that the advert said \u201Cremote\u201D.',
            answers: [
                { label: 'Almost none \u2014 I can barely find real ones', note: 'or everything looks like a scam', weight: { supply: 3 } },
                { label: 'A few, but I am not sure they were real', weight: { supply: 2 } },
                { label: 'Plenty \u2014 finding them is not my problem', weight: { aim: 1, representation: 1 } },
                { label: 'I have a steady feed I trust', weight: { aim: 1, conversion: 1 } }
            ]
        },
        {
            topic: 'replies to your last twenty applications',
            q: 'Of your last twenty applications, how many got any reply at all \u2014 even a rejection?',
            why: 'Total silence and a stream of rejections mean completely different things. Silence usually means you were never read.',
            answers: [
                { label: 'Zero \u2014 complete silence', weight: { representation: 3 } },
                { label: 'One or two', weight: { representation: 2, aim: 1 } },
                { label: 'A handful, mostly rejections', weight: { aim: 2 } },
                { label: 'Several, including interviews', weight: { conversion: 3 } }
            ]
        },
        {
            topic: 'how you choose which roles to apply to',
            q: 'How do you choose which roles to apply to?',
            why: 'This separates effort from aim. A good document sent in the wrong direction produces exactly the same silence as a bad one.',
            answers: [
                { label: 'I apply to whatever reaches me', note: 'forwarded links, adverts, whatever appears', weight: { supply: 2, aim: 2 } },
                { label: 'I apply to as many as I can, quickly', weight: { aim: 3 } },
                { label: 'I check the company first, then tailor', weight: { conversion: 1 } },
                { label: 'I have not been applying much lately', note: 'honest answer, very common', weight: { aim: 2, supply: 1, capacity: 1 } }
            ]
        },
        {
            topic: 'what happens when you meet an employer',
            q: 'When you get in front of a human \u2014 a call, an interview, a real conversation \u2014 what usually happens?',
            why: 'A CV cannot hire you. It buys about twenty minutes. What happens in those minutes is a separate, learnable skill.',
            answers: [
                { label: 'I never get that far', weight: { representation: 2, aim: 1 } },
                { label: 'It goes well, then they go quiet', weight: { conversion: 3 } },
                { label: 'I freeze on the money question', weight: { conversion: 3 } },
                { label: 'I get offers \u2014 they are just too small', weight: { conversion: 2, aim: 1 } }
            ]
        }
    ];
    const ORDER = ['capacity', 'supply', 'representation', 'aim', 'conversion'];
    const JOINTS = {
        capacity: {
            n: '01', name: 'Capacity', tag: 'Being able to do the work', ask: 'Can you already do the job itself?', law: 'You can\u2019t be hired for work you can\u2019t yet do.',
            verdict: 'The gap here is the work itself, not the paperwork \u2014 either the skill the role needs, or the habits that let someone trust you to deliver it unsupervised. This is the honest place to start, because a rewritten CV cannot close it and applying harder will only produce faster rejections. It is also the most fixable, and nobody sees you learning it.',
            free: {
                text: 'Measure it before you spend anything. The free Capacity Audit asks ten questions about the work itself \u2014 not your CV \u2014 and scores it out of ten against the role family you are targeting. It is the gate for the other four parts, and it will tell you plainly if no ERJ product is the right purchase this month.',
                href: '../capacityscan/', label: 'Run the free Capacity Audit'
            },
            paid: {
                text: 'Only if the audit says the occupational skill is already there and it is the remote half that is missing: Stages 1 and 2 of Foundation Training are the remote operating system \u2014 deep work, daily KPIs, end-of-day reporting \u2014 and the digital toolkit a distributed team assumes you know. If the audit says the profession itself is the gap, build that first and buy nothing here yet.',
                href: '../foundationtraining/', label: 'See Foundation Training'
            },
            tonight: [
                'Write the job description of the role you want, from memory. Every line you cannot honestly claim is your real list.',
                'Pick the single most-repeated tool across five adverts for that role. Learn that one first, not all of them.',
                'Do one piece of the work nobody asked for and keep the artifact. Evidence you created is still evidence.'
            ]
        },
        supply: {
            n: '02', name: 'Supply', tag: 'Finding real jobs you can apply for', ask: 'Are you finding enough real jobs you can apply for from here?', law: 'You can\u2019t apply for a job you never saw.',
            verdict: 'You are not seeing enough real, eligible roles to have a job search yet. Everything downstream \u2014 your CV, your aim, your interviews \u2014 is being judged on far too little evidence. Fix this one first and the rest becomes measurable.',
            free: {
                text: 'Use the free Remote Job Board. New roles go up twice a day, and every one is open to someone living in Nigeria or Africa, so you stop wasting applications on jobs you were never allowed to get.',
                href: '../jobs/', label: 'Open the free job board'
            },
            paid: {
                text: 'If sourcing, tailoring and submitting applications is the part you cannot keep up with, ERJ can run that work for you. The Done-For-You Application Service finds verified roles, tailors the application to the opportunity and submits on your behalf.',
                href: '../jobapplication/', label: 'See Done-For-You Application'
            },
            tonight: [
                'Check the age of the last five listings you applied to. Anything over two weeks old was probably decided already.',
                'For each company, find one piece of evidence they have paid someone outside their own country.',
                'Put two fixed hours in your calendar this week for sourcing. Motivation collapses; appointments survive.'
            ]
        },
        representation: {
            n: '03', name: 'Representation', tag: 'How your CV and LinkedIn present you', ask: 'Do your CV and LinkedIn show employers what you can do?', law: 'If your CV can\u2019t be read, you were never really in the running.',
            verdict: 'You are real and competent, and the document representing you is not readable \u2014 by software first, by a stranger second. Total silence almost always means you were never actually read. This is the fastest of the five to fix.',
            free: {
                text: 'Run the free CV Scan. It takes ninety seconds, runs entirely on your own device, and shows exactly which points you default on.',
                href: '../cvscan/', label: 'Score my CV free'
            },
            paid: {
                text: 'Foundation Training rebuilds every asset with you \u2014 ATS-readable CV, searchable LinkedIn, proof of work, async writing \u2014 and you keep the skill for the rest of your career.',
                href: '../foundationtraining/', label: 'See Foundation Training'
            },
            tonight: [
                'Count how many bullets on your CV contain an actual number. Under half is the usual problem.',
                'Rewrite your LinkedIn headline: the role you want, three searchable skills, one proof number. No \u201Cpassionate\u201D, no \u201Caspiring\u201D.',
                'Open your CV and ask: is anything important trapped inside a table, a text box or a second column?'
            ]
        },
        aim: {
            n: '04', name: 'Aim', tag: 'Applying to the right jobs', ask: 'Are you applying to the jobs most likely to hire you?', law: 'Applying everywhere isn\u2019t the same as applying where you\u2019d get hired.',
            verdict: 'Your effort is not the problem \u2014 your direction is. Applications sent is a measure of effort, not of aim, and a big number with no replies is evidence of a problem rather than proof of trying. There is no feedback loop in job hunting, so the lesson never arrives on its own.',
            free: {
                text: 'Start a one-page tracker tonight: date, company, role, source, whether they can hire across borders, what you tailored, what came back. After thirty rows, patterns appear that no advice could have given you.',
                href: '../blog.html', label: 'Read the targeting guides'
            },
            paid: {
                text: 'Foundation Training installs a weekly targeting and application system. Or have the aiming carried entirely: the placement engine sources roles, tailors with you, and applies alongside you until an offer lands.',
                href: '../jobapplication/', label: 'See the placement engine'
            },
            tonight: [
                'Try ten aimed applications this week instead of forty hopeful ones. Each one checked, each one tailored.',
                'Put the advert\u2019s exact job title in the top three lines of your CV before you send it.',
                'Sort your last twenty applications by outcome. One role type or one source is almost certainly outperforming the rest.'
            ]
        },
        conversion: {
            n: '05', name: 'Conversion', tag: 'Turning interviews into offers', ask: 'Do your interviews turn into job offers?', law: 'Interviews don\u2019t pay you. A signed offer does.',
            verdict: 'Here is the good news hiding in your answers: your CV is working and your aim is close enough to get you into rooms. The hard parts are already fixed. What is slipping is the twenty minutes after the document \u2014 and that is the most learnable part of the whole process.',
            free: {
                text: 'Write your answer to the question that ends most remote interviews \u2014 \u201Chow do you work when nobody is watching?\u201D \u2014 as a description of your system, not a list of adjectives. Four sentences, tonight, before anyone asks.',
                href: '../blog.html', label: 'Read the interview guides'
            },
            paid: {
                text: 'Interview rehearsal and salary negotiation sit inside Foundation Training, and go furthest in the Inner Circle, the year-long one-to-one residency for Foundation graduates \u2014 where we prepare with you in real time. One improved answer to the money question often outweighs the entire fee.',
                href: '../innercircle/', label: 'See the Inner Circle'
            },
            tonight: [
                'Send the follow-up you did not send. Restate their problem, name what you would do about it in month one, thank them without grovelling.',
                'Never answer the salary question first. Ask what range they budgeted \u2014 they always have one.',
                'Plan what you would deliver in week one of the job. People who have planned it interview differently from people hoping to survive it.'
            ]
        }
    };
    /* ── state ───────────────────────────────────────────────── */
    const scores = { capacity: 0, supply: 0, representation: 0, aim: 0, conversion: 0 };
    const chosen = [];
    const picked = [];
    let step = 0;
    const stepEl = document.getElementById('dxStep');
    const barEl = document.getElementById('dxBar');
    const resultEl = document.getElementById('dxResult');
    const boxEl = document.getElementById('dxBox');
    const dots = Array.from(document.querySelectorAll('.dx-dots i'));
    function paintDots(n) {
        dots.forEach(function (d, i) {
            d.style.background = i <= n ? 'var(--accent)' : 'var(--line)';
        });
    }
    if (!stepEl || !barEl || !resultEl || !boxEl)
        return;
    function esc(s) {
        return s.replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    }
    function recompute() {
        ORDER.forEach(k => { scores[k] = 0; });
        picked.forEach(a => { if (a) Object.keys(a.weight).forEach(k => { scores[k] += a.weight[k] || 0; }); });
    }
    function answered() { return QUESTIONS.filter((q, i) => picked[i]).length; }
    function renderStep() {
        const doneEl = document.getElementById('dxDone');
        stepEl.innerHTML = QUESTIONS.map((q, qi) =>
            '<div class="dxq" data-q="' + qi + '">' +
                '<div class="dxq-top"><span class="dxq-n">0' + (qi + 1) + '</span><div>' +
                '<h3 class="dx-q">' + esc(q.q) + '</h3><p class="dx-why">' + esc(q.why) + '</p></div></div>' +
                '<button type="button" class="dxd-btn" id="dxb' + qi + '" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="dxl' + qi + '">' +
                '<span class="dxd-val ph">Choose your answer</span><i aria-hidden="true"></i></button>' +
                '<ul class="dxd-list" id="dxl' + qi + '" role="listbox" hidden>' +
                q.answers.map((a, i) => '<li class="dxd-opt" role="option" aria-selected="false" data-i="' + i + '" id="dxo' + qi + '_' + i + '">' + esc(a.label) +
                    (a.note ? '<small>' + esc(a.note) + '</small>' : '') + '</li>').join('') +
                '</ul></div>').join('') +
            '<div class="dxq-go"><button type="button" class="dx-submit" id="dxGo" disabled>Show my result</button>' +
            '<span id="dxHint">Answer all five to see your result</span></div>';
        const rows = Array.from(stepEl.querySelectorAll('.dxq'));
        const go = document.getElementById('dxGo');
        const hint = document.getElementById('dxHint');
        function sync() {
            const n = answered();
            barEl.style.width = Math.round((n / QUESTIONS.length) * 100) + '%';
            paintDots(n - 1);
            if (doneEl) doneEl.textContent = String(n);
            go.disabled = n < QUESTIONS.length;
            hint.textContent = n < QUESTIONS.length ? 'Answer all five to see your result (' + (QUESTIONS.length - n) + ' to go)' : 'Ready. Your result is one tap away.';
        }
        function close(row) {
            row.classList.remove('open');
            row.querySelector('.dxd-btn').setAttribute('aria-expanded', 'false');
            row.querySelector('.dxd-list').hidden = true;
        }
        function open(row) {
            rows.forEach(r => { if (r !== row) close(r); });
            row.classList.add('open');
            row.querySelector('.dxd-btn').setAttribute('aria-expanded', 'true');
            row.querySelector('.dxd-list').hidden = false;
        }
        function choose(row, i) {
            const qi = Number(row.dataset.q);
            picked[qi] = QUESTIONS[qi].answers[i];
            chosen[qi] = picked[qi].label;
            const val = row.querySelector('.dxd-val');
            val.textContent = picked[qi].label;
            val.classList.remove('ph');
            Array.from(row.querySelectorAll('.dxd-opt')).forEach((o, k) => o.setAttribute('aria-selected', k === i ? 'true' : 'false'));
            row.classList.add('done');
            close(row);
            sync();
            const next = rows.find((r, k) => !picked[k]);
            if (next) {
                open(next);
                next.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            else {
                go.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        rows.forEach(row => {
            const btn = row.querySelector('.dxd-btn');
            const opts = Array.from(row.querySelectorAll('.dxd-opt'));
            let act = -1;
            const mark = (k) => { act = (k + opts.length) % opts.length; opts.forEach((o, x) => o.classList.toggle('act', x === act)); btn.setAttribute('aria-activedescendant', opts[act].id); };
            btn.addEventListener('click', () => { row.classList.contains('open') ? close(row) : open(row); });
            btn.addEventListener('keydown', e => {
                const isOpen = row.classList.contains('open');
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!isOpen) open(row); mark(act < 0 ? 0 : act + (e.key === 'ArrowDown' ? 1 : -1)); }
                else if ((e.key === 'Enter' || e.key === ' ') && isOpen && act >= 0) { e.preventDefault(); choose(row, act); }
                else if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(row); }
            });
            opts.forEach(o => o.addEventListener('click', () => choose(row, Number(o.dataset.i))));
        });
        go.addEventListener('click', () => {
            if (answered() < QUESTIONS.length) return;
            recompute();
            step = QUESTIONS.length;
            renderResult();
        });
        sync();
        open(rows[0]);
    }
    function winner() {
        // highest score; ties resolve UPSTREAM — an early weak point makes
        // every later reading unreliable, so fix the earliest one first.
        let best = 'capacity';
        let bestScore = -1;
        ORDER.forEach(k => {
            if (scores[k] > bestScore) {
                bestScore = scores[k];
                best = k;
            }
        });
        return best;
    }
    function renderResult() {
        barEl.style.width = '100%';
        const key = winner();
        const j = JOINTS[key];
        const total = ORDER.reduce((s, k) => s + scores[k], 0) || 1;
        const scoreData = ORDER.map(k => ({ name: JOINTS[k].name, tag: JOINTS[k].tag, pct: Math.round((scores[k] / total) * 100) }));
        /* Show the person their own answers that point here, so the result reads
           as something they recognise rather than a label to take on trust. */
        const strongest = Math.max(0, ...picked.map(a => (a && a.weight[key]) || 0));
        const evidence = QUESTIONS.map((q, i) => ({ q: q, a: picked[i] }))
            .filter(x => x.a && (x.a.weight[key] || 0) >= (strongest >= 2 ? 2 : 1))
            .sort((x, y) => (y.a.weight[key] || 0) - (x.a.weight[key] || 0))
            .slice(0, 3)
            .map(x => 'Asked about ' + x.q.topic + ', you said: \u201C' + x.a.label + '\u201D');
        const bars = scoreData.map(row => {
            const k = ORDER.find(x => JOINTS[x].name === row.name);
            return '<div class="dxs-row' + (k === key ? ' is-win' : '') + '">' +
                '<span class="dxs-l">' + row.name + '<small>' + esc(row.tag) + '</small></span>' +
                '<span class="dxs-t"><span style="width:' + row.pct + '%"></span></span>' +
                '<span class="dxs-p">' + row.pct + '%</span></div>';
        }).join('');
        boxEl.setAttribute('hidden', '');
        resultEl.removeAttribute('hidden');
        resultEl.innerHTML =
            '<div class="dxr-head">' +
                '<div class="dxr-n">' + j.n + '</div>' +
                '<div>' +
                '<div class="section-label"><span class="mark"></span>What is holding you back most</div>' +
                '<h2 class="dxr-name">' + j.name + '</h2>' +
                '<p class="dxr-plain">In plain words: <b>' + esc(j.ask) + '</b> Right now, this is the part most likely to be stopping you.</p>' +
                '<p class="dxr-law">' + esc(j.law) + '</p>' +
                '</div>' +
                '</div>' +
                (evidence.length ? '<div class="dxr-why"><div class="dxr-k">Why we think so</div><ul>' +
                    evidence.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></div>' : '') +
                '<p class="dxr-verdict">' + esc(j.verdict) + '</p>' +
                /* More than one part can be weak at once, so the result names the
                   EARLIEST one worth acting on and points at the breakdown
                   rather than claiming a single cause. */
                '<p class="dxr-note">More than one part can be weak at the same time. This is the earliest one worth acting on \u2014 the breakdown below shows how the other four scored.</p>' +
                '<div class="dxr-export"><button type="button" class="dx-pdf-btn" id="dxPdf">Download my diagnostic PDF <span aria-hidden="true">↓</span></button><span>Your result, score breakdown and next action in one branded report.</span></div>' +

                '<div class="cap-read dxr-send dxr-human">' +
                '<div class="cr-k">Get your CV audited live, free</div>' +
                '<p><strong>The quiz names the weak point. To see what to fix first in your actual CV, join the Launchpad.</strong> ' +
                'Every Saturday at 4:00 PM WAT, live on Zoom, we go through CVs one at a time and name the one thing to fix first. Bring this result and your CV.</p>' +
                '<div class="cr-actions">' +
                '<a class="cap-btn" id="dxAudit" href="../masterclass/"><span>Join the free Launchpad</span></a>' +
                '</div>' +
                '<p class="dxr-privacy">No payment is required for the diagnosis or the Launchpad. If you do not need a paid ERJ service, we will tell you that too.</p>' +
                '</div>' +

                '<div class="dxr-scores"><div class="dxs-k">How your answers fell</div>' + bars +
                '<p class="dxs-note">A second point close behind is normal. Fix the earliest weak point first: an upstream failure can make every later reading unreliable.</p></div>' +
                '<div class="dxr-tonight"><div class="dxr-k">One useful step before Saturday</div><ol><li>' + esc(j.tonight[0]) + '</li></ol></div>' +
                '<div class="dxr-doors">' +
                '<div class="dxr-door"><div class="dxr-door-k">Free door</div><p>' + esc(j.free.text) + '</p>' +
                '<a class="btn-more btn-secondary-ui dx-rec" data-rec="free-' + key + '" href="' + j.free.href + '"' + (j.free.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '><span>' + esc(j.free.label) + '</span><span class="arrow-wrap"><span class="arrow">\u2192</span></span></a></div>' +
                '<div class="dxr-door"><div class="dxr-door-k">Paid door, only if it fits</div><p>' + esc(j.paid.text) + '</p>' +
                '<a class="btn-yes btn-primary-ui dx-rec" data-rec="paid-' + key + '" href="' + j.paid.href + '"><span>' + esc(j.paid.label) + '</span><span class="arrow-wrap"><span class="arrow">\u2192</span></span></a></div>' +
                '</div>' +
                '<div class="cr-actions dxr-reset"><button type="button" class="cap-btn ghost" id="dxRedo">Start again</button></div>';
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (window.erjTrack) {
            window.erjTrack('DiagnosisComplete', { content_name: 'Diagnosis - ' + j.name, value: 0, method: 'diagnostic' });
        }
        const audit = document.getElementById('dxAudit');
        if (audit) {
            audit.addEventListener('click', () => {
                if (window.erjTrack) window.erjTrack('LaunchpadClick', { content_name: 'Launchpad - ' + j.name, value: 0, method: 'diagnostic' });
            });
        }
        const pdf = document.getElementById('dxPdf');
        if (pdf) {
            pdf.addEventListener('click', () => {
                if (window.ERJDiagnosticPDF && window.ERJDiagnosticPDF.download) {
                    window.ERJDiagnosticPDF.download({
                        number: j.n,
                        joint: j.name,
                        ask: j.ask,
                        evidence: evidence,
                        law: j.law,
                        verdict: j.verdict,
                        scores: scoreData,
                        actions: j.tonight,
                        date: new Date().toLocaleDateString('en-GB')
                    });
                    if (window.erjTrack) window.erjTrack('DiagnosticReportDownloaded', { content_name: 'Diagnostic PDF - ' + j.name, value: 0, method: 'download' });
                }
            });
        }
        Array.from(resultEl.querySelectorAll('.dx-rec')).forEach(link => {
            link.addEventListener('click', () => {
                if (window.erjTrack) window.erjTrack('ProductRecommendationClick', { content_name: link.dataset.rec || j.name, value: 0, method: 'diagnostic_recommendation' });
            });
        });
        const redo = document.getElementById('dxRedo');
        if (redo) {
            redo.addEventListener('click', () => {
                ORDER.forEach(k => { scores[k] = 0; });
                chosen.length = 0;
                picked.length = 0;
                step = 0;
                resultEl.setAttribute('hidden', '');
                resultEl.innerHTML = '';
                boxEl.removeAttribute('hidden');
                renderStep();
                boxEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    }
    renderStep();
})();
