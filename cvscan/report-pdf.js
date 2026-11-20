/* Everything Remote Job · CV Scan report, a true client-side PDF.
   Built the same way as capacityscan/report-pdf.js: a hand-written PDF in
   standard Helvetica with the official LIGHT lockup (black globe, orange
   arrow) as a JPEG, so the paper looks the same whether the site was in
   night or day when it was made. Nothing is sent anywhere: the file is
   assembled in this tab and handed to the browser. */
(function () {
  'use strict';

  var W = 595, H = 842, L = 50, R = 545, TOP = 790, BOTTOM = 84;
  var ORANGE = '1 0.341 0.133', INK = '0.078 0.067 0.055', SOFT = '0.34 0.32 0.30', FAINT = '0.55 0.53 0.50';
  var GREEN = '0.10 0.50 0.25', AMBER = '0.72 0.42 0.02', RED = '0.78 0.18 0.14';
  var LINE = '0.86 0.84 0.81', PANEL = '0.965 0.955 0.94';
  var SITE = 'everythingremotejob.com', MAIL = 'info@everythingremotejob.com', WA = '+234 803 292 5957';
  var VERD = { pass: ['YES', GREEN], partial: ['PARTLY', AMBER], fail: ['NO', RED] };

  function ascii(v) {
    return String(v == null ? '' : v)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[–—−]/g, '-').replace(/…/g, '...')
      .replace(/·/g, '-').replace(/→/g, '->').replace(/±/g, '+/-').replace(/ /g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '');
  }
  function esc(v) { return ascii(v).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
  function wrap(text, size, width, bold) {
    var max = Math.max(10, Math.floor(width / (size * (bold ? 0.56 : 0.51))));
    var words = ascii(text).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean), out = [], line = '';
    words.forEach(function (w) { var n = line ? line + ' ' + w : w; if (n.length > max && line) { out.push(line); line = w; } else line = n; });
    if (line) out.push(line);
    return out.length ? out : [''];
  }
  function bytes(s) { return new TextEncoder().encode(s); }
  function concat(parts) {
    var len = parts.reduce(function (n, p) { return n + p.length; }, 0), out = new Uint8Array(len), o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }
  function titleCase(s) {
    return s.toLowerCase().replace(/(^|[\s'’-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  /* The person's name: the first short, letters-only line of the CV; failing
     that, the file name without its extension and the word CV or Resume. */
  var NOT_NAME = /\b(curriculum|vitae|resume|résumé|cv|profile|summary|contact|email|phone|address|objective|experience|education|skills|portfolio|linkedin|github|page|nigeria|abuja|lagos|london|remote|manager|analyst|developer|engineer|assistant|specialist|officer|writer|designer|accountant|consultant|executive|coordinator|administrator)\b/i;
  function findName(text, fileName) {
    var lines = String(text || '').split(/\r?\n/).map(function (s) { return s.replace(/\s+/g, ' ').trim(); }).filter(Boolean).slice(0, 8);
    for (var i = 0; i < lines.length; i++) {
      var s = lines[i];
      if (s.length < 5 || s.length > 40) continue;
      if (/[\d@:/|,]/.test(s) || NOT_NAME.test(s)) continue;
      var w = s.split(' ');
      if (w.length < 2 || w.length > 4) continue;
      if (!w.every(function (x) { return /^[A-Za-zÀ-ÿ.'’-]{1,20}$/.test(x); })) continue;
      return titleCase(s);
    }
    var f = String(fileName || '').replace(/\.[a-z0-9]+$/i, '').replace(/[_\-.]+/g, ' ')
      .replace(/\b(cv|resume|resumé|curriculum|vitae|final|updated|new|copy|\d+)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    return f.length >= 3 ? titleCase(f) : 'Your';
  }

  function layout(d, imgW, imgH) {
    var pages = [], c = null, y = 0;
    function text(t, x, yy, size, bold, color) {
      c.push((color || INK) + ' rg BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + x + ' ' + yy.toFixed(2) + ' Td (' + esc(t) + ') Tj ET');
    }
    function rule(yy, x1, x2) { c.push(LINE + ' RG 0.8 w ' + (x1 || L) + ' ' + yy.toFixed(2) + ' m ' + (x2 || R) + ' ' + yy.toFixed(2) + ' l S'); }
    function rect(x, yy, w, h, col) { c.push(col + ' rg ' + x + ' ' + yy.toFixed(2) + ' ' + w + ' ' + h.toFixed(2) + ' re f'); }
    function newPage(first) {
      c = []; pages.push(c);
      if (first) {
        var logoW = 215, logoH = logoW * (imgH / imgW);
        c.push('q ' + logoW + ' 0 0 ' + logoH.toFixed(2) + ' ' + L + ' ' + (TOP - logoH + 8).toFixed(2) + ' cm /Im1 Do Q');
        text('REMOTE CV SCAN REPORT', R - 138, TOP - 20, 8, true, FAINT);
        text(ascii(d.date), R - 138, TOP - 33, 8, false, FAINT);
        y = TOP - logoH - 10;
        rule(y); y -= 30;
      } else {
        text(d.name.toUpperCase() + '  |  REMOTE CV SCAN REPORT', L, TOP + 4, 7.5, true, FAINT);
        rule(TOP - 6); y = TOP - 32;
      }
    }
    function need(h) { if (y - h < BOTTOM) newPage(false); }
    function block(t, o) {
      o = o || {};
      var size = o.size || 10, lead = o.leading || size + 4, x = o.x || L, width = o.width || (R - x);
      wrap(t, size, width, o.bold).forEach(function (line) { need(lead); text(line, x, y, size, !!o.bold, o.color); y -= lead; });
      y -= o.after || 0;
    }
    function label(t) { need(60); y -= 8; block(t, { size: 8, bold: true, color: ORANGE, after: 6 }); }

    newPage(true);

    /* Title */
    wrap(d.title, 21, R - L, true).forEach(function (line) { text(line, L, y, 21, true); y -= 26; });
    block(d.file + '   |   ' + d.words + ' words   |   Scanned ' + d.date, { size: 8.5, color: SOFT, after: 14 });

    /* Score panel */
    var ph = 112;
    need(ph + 10);
    rect(L, y - ph + 14, R - L, ph, PANEL);
    rect(L, y - ph + 14, 5, ph, d.verdictColor);
    var score = String(d.score);
    text(score, L + 24, y - 40, 46, true, INK);
    text('out of 10', L + 24 + score.length * 26 + 8, y - 40, 11, false, SOFT);
    text(d.range.toUpperCase() + '  -  ' + d.headline.toUpperCase(), L + 24, y - 66, 8.5, true, d.verdictColor);
    var tx = L + 205, ty = y - 24;
    wrap(d.message, 10, R - tx - 14, false).slice(0, 4).forEach(function (ln) { text(ln, tx, ty, 10, false, INK); ty -= 14; });
    text(d.pass + ' Yes', tx, y - 90, 9.5, true, GREEN);
    text(d.partial + ' Partly', tx + 62, y - 90, 9.5, true, AMBER);
    text(d.fail + ' No', tx + 135, y - 90, 9.5, true, RED);
    y -= ph + 16;

    /* Where you default */
    if (d.defaults.length) {
      label('WHERE YOU DEFAULT');
      block(d.defaults.length + ' of the 10 points need work. Update ' + (d.defaults.length === 1 ? 'that section' : 'these sections') + ' before your next application.', { size: 10, color: SOFT, after: 6 });
      d.defaults.forEach(function (x) {
        need(15); text(x.n, L + 4, y, 9, true, ORANGE); text(x.t, L + 26, y, 10, false, INK); y -= 15;
      });
    } else {
      label('NO DEFAULTS');
      block('All ten points clear. Realign your keywords for each new advert and keep the file as PDF.', { size: 10, color: SOFT, after: 6 });
    }

    /* The ten points */
    label('THE TEN POINTS, SCORED AGAINST YOUR CV');
    d.checks.forEach(function (k) {
      var v = VERD[k.verdict] || VERD.fail;
      var qLines = wrap(k.question, 9, R - L - 36, false).length;
      var evLines = wrap(k.evidence, 9.5, R - L - 36, false).length;
      var fxLines = k.fix ? wrap(k.fix, 9, R - L - 60, false).length : 0;
      need(28 + qLines * 12 + evLines * 13 + (fxLines ? fxLines * 12 + 22 : 0) + 14);
      var top = y;
      rect(L, top - 3, 3, 16, v[1]);
      text(k.n, L + 10, top, 9, true, FAINT);
      text(k.title, L + 30, top, 11, true, INK);
      text(v[0], R - (v[0].length * 6.2) - 4, top, 8.5, true, v[1]);
      y -= 17;
      block(k.question, { x: L + 30, size: 9, leading: 12, color: FAINT, after: 3 });
      block(k.evidence, { x: L + 30, size: 9.5, leading: 13, color: INK, after: 4 });
      if (k.fix) {
        var fl = wrap(k.fix, 9, R - L - 60, false);
        var bh = fl.length * 12 + 20;
        need(bh + 4);
        rect(L + 30, y - bh + 12, R - L - 30, bh, PANEL);
        text('HOW TO FIX IT', L + 40, y - 1, 7, true, ORANGE);
        var fy = y - 14;
        fl.forEach(function (ln) { text(ln, L + 40, fy, 9, false, SOFT); fy -= 12; });
        y -= bh + 4;
      }
      y -= 12;
      rule(y, L + 30, R); y -= 26;
    });

    /* What it measures */
    label('WHAT THIS SCORE MEASURES');
    block('Your score measures one of the five parts a job search runs on: Representation, whether your CV can be read and trusted by a recruiter and an ATS. A 10 out of 10 CV still gets silence if you are aiming at companies that cannot hire you, or if interviews end without an offer. The other four parts are Capacity, Supply, Aim and Conversion.', { size: 9.5, leading: 14, color: SOFT, after: 6 });

    /* Next */
    label('YOUR NEXT STEP');
    block(d.next, { size: 10, leading: 14, after: 6 });
    block('Free every Saturday, 4:00 PM WAT: The Remote Job Launchpad. Bring your CV and we go through it live on Zoom. Register at ' + SITE + '/masterclass/', { size: 9.5, leading: 13, color: SOFT, after: 4 });
    block('This report is a self-scan of one document. It is not a promise of interviews, a job or a salary.', { size: 8.5, leading: 12, color: FAINT });

    /* footer on every page: who made it and how to reach us */
    pages.forEach(function (pc, i) {
      c = pc;
      rule(68);
      text('Everything Remote Job  |  Work Beyond Borders.', L, 50, 8.5, true, INK);
      text(SITE + '   |   ' + MAIL + '   |   WhatsApp ' + WA, L, 37, 8, false, SOFT);
      text('Page ' + (i + 1) + ' of ' + pages.length, R - 52, 50, 7.5, false, FAINT);
      text('Private to you. Scanned in your browser, never uploaded.', L, 26, 7, false, FAINT);
    });
    return pages.map(function (p) { return p.join('\n') + '\n'; });
  }

  function makePdf(d, jpeg, imgW, imgH) {
    var streams = layout(d, imgW, imgH), n = streams.length, objs = [], kids = [];
    for (var k = 0; k < n; k++) kids.push((6 + k * 2) + ' 0 R');
    objs[1] = bytes('<< /Type /Catalog /Pages 2 0 R >>');
    objs[2] = bytes('<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>');
    objs[3] = bytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs[4] = bytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    objs[5] = concat([bytes('<< /Type /XObject /Subtype /Image /Width ' + imgW + ' /Height ' + imgH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n'), jpeg, bytes('\nendstream')]);
    streams.forEach(function (s, i) {
      var sb = bytes(s), pid = 6 + i * 2, cid = pid + 1;
      objs[pid] = bytes('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents ' + cid + ' 0 R >>');
      objs[cid] = concat([bytes('<< /Length ' + sb.length + ' >>\nstream\n'), sb, bytes('endstream')]);
    });
    var info = objs.length;
    objs[info] = bytes('<< /Title (' + esc(d.title) + ') /Author (Everything Remote Job) /Subject (Remote CV Scan Report) /Creator (everythingremotejob.com) >>');
    var total = objs.length - 1, parts = [bytes('%PDF-1.4\n%ERJ\n')], offsets = [], pos = parts[0].length;
    for (var i = 1; i <= total; i++) {
      offsets[i] = pos;
      var head = bytes(i + ' 0 obj\n'), tail = bytes('\nendobj\n');
      parts.push(head, objs[i], tail); pos += head.length + objs[i].length + tail.length;
    }
    var xr = 'xref\n0 ' + (total + 1) + '\n0000000000 65535 f \n';
    for (var j = 1; j <= total; j++) xr += String(offsets[j]).padStart(10, '0') + ' 00000 n \n';
    xr += 'trailer\n<< /Size ' + (total + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + pos + '\n%%EOF';
    parts.push(bytes(xr));
    return new Blob(parts, { type: 'application/pdf' });
  }

  /* From the scan the page just ran (app.js leaves it in window.ERJ_CV). */
  function collect() {
    var s = window.ERJ_CV;
    if (!s || !s.r) return null;
    var r = s.r, f = s.f || {};
    var name = findName(f.text, f.fileName);
    var tally = { pass: 0, partial: 0, fail: 0 };
    r.checks.forEach(function (k) { tally[k.verdict]++; });
    var col = r.score >= 8 ? GREEN : r.score >= 5 ? AMBER : RED;
    var next = r.score >= 8
      ? 'Your CV is not the likely reason for silence. Look at the other four parts: run the free Capacity audit and the free five-question diagnosis at ' + SITE + '/diagnose/'
      : r.score >= 5
        ? 'Fix the points marked above, then scan again. If you want it done for you, see CV Fix at ' + SITE + '/register.html, or the Self-Learn Pack to do it yourself.'
        : r.score >= 3
          ? 'The CV needs rebuilding, and so does how you present your skills. See CV Fix or Foundation Training at ' + SITE + '/register.html'
          : 'Start with the skill and the document together. See Career Development at The Mentorine School, through ' + SITE + '/register.html';
    return {
      name: name,
      title: name + ' Remote CV Scan Report',
      file: f.fileName || 'CV',
      words: (r.wordCount || 0).toLocaleString('en-GB'),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      score: r.score, range: r.band.range, headline: r.band.headline, message: r.band.message,
      verdictColor: col, pass: tally.pass, partial: tally.partial, fail: tally.fail,
      defaults: r.checks.filter(function (k) { return k.verdict !== 'pass'; }).map(function (k) { return { n: String(k.id).padStart(2, '0'), t: k.title }; }),
      checks: r.checks.map(function (k) {
        return { n: String(k.id).padStart(2, '0'), title: k.title, verdict: k.verdict, question: k.question, evidence: k.evidence, fix: k.verdict === 'pass' ? '' : k.fix };
      }),
      next: next
    };
  }

  async function download() {
    var d = collect();
    if (!d) return false;
    try {
      var res = await fetch('../diagnose/erj-official-logo-light.jpg?v=126');
      if (!res.ok) throw new Error('logo');
      var jpeg = new Uint8Array(await res.arrayBuffer());
      var blob = makePdf(d, jpeg, 1400, 380);
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url;
      a.download = ascii(d.title).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      if (typeof window.erjTrack === 'function') { try { window.erjTrack('CvReportDownloaded', { content_name: 'CV Scan PDF', value: 0, method: 'download' }); } catch (e) {} }
      return true;
    } catch (err) {
      console.error('ERJ CV report PDF failed', err);
      window.print();
      return false;
    }
  }
  window.ERJCvPDF = { download: download, collect: collect, findName: findName, makePdf: makePdf };
})();
