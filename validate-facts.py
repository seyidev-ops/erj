#!/usr/bin/env python3
"""
EVERYTHING REMOTE JOB — FACTS VALIDATOR

Reads canon from erj-config.js, scans the whole repository, and fails
when any file disagrees with it.

This is the thing that makes the single source of truth permanent. A
config nobody checks is just another document that goes stale; a config
with a gate in front of it cannot.

    python3 validate-facts.py            # check, exit 1 on failure
    python3 validate-facts.py --warn     # report only, always exit 0

Run it before every deploy.
"""

import json
import os
import re
import subprocess
import sys
from datetime import date

# Loading generate-sitemap.py below must not leave a __pycache__ folder in
# the site: every file in this repository is published.
sys.dont_write_bytecode = True

ROOT = os.path.dirname(os.path.abspath(__file__))
SCAN_EXT = {".html", ".js", ".ts", ".css", ".md", ".json", ".txt", ".xml", ".webmanifest"}
SKIP_DIRS = {".git", "node_modules", ".github", "og-fonts"}
SKIP_FILES = {"validate-facts.py"}

# The config IS the definition — it names retired terms in order to ban them.
DEFINITION = "erj-config.js"

# Portal and operational surfaces legitimately hold cohort history: past
# passcodes, past enrolments, past class records. They are not campaign copy.
PORTAL = {
    "admin.html", "admin-login.html", "dashboard.html", "participant.html",
    "instructor.html", "instructor-login.html", "login.html", "blog-admin.html",
    "erj-surge-console.html", "erj-passcode.js", "erj-track.js",
}

# These quote salaries and member outcomes, not ERJ prices.
OUTCOME_PAGES = {"testimonials.html", "blog.html"}

# Dated archives. A 2025 post naming a 2025 cohort is a record, not a claim.
# Drift here is reported but does not block a deploy — retro-editing an
# archive is a content decision, not a release blocker.
ARCHIVE = {"blog.html", "testimonials.html"}


def is_archive(path):
    """The archive is the blog index, the testimonials wall and every dated
    post under blog/. A post announcing Cohort 6 in 2025 is a record of what
    happened, not a claim about what is open now. Drift is reported, not
    blocked."""
    return path in ARCHIVE or path.startswith("blog/")


def is_outcome_page(path):
    """Pages that quote member salaries and offers rather than ERJ prices."""
    return path in OUTCOME_PAGES or path.startswith("blog/")

# Any line carrying this marker is exempt from every check.
ESCAPE = "canon-ok"

NAIRA = "\u20a6"
RED, GREEN, YELL, DIM, OFF = "\033[31m", "\033[32m", "\033[33m", "\033[2m", "\033[0m"


def load_canon():
    cfg = os.path.join(ROOT, "erj-config.js")
    if not os.path.exists(cfg):
        sys.exit("erj-config.js not found — run this from the repository root.")
    script = (
        "global.window={};require(%s);"
        "process.stdout.write(JSON.stringify(window.ERJ_CONFIG.canon));" % json.dumps(cfg)
    )
    try:
        out = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True)
    except FileNotFoundError:
        sys.exit("node is required to read erj-config.js")
    except subprocess.CalledProcessError as e:
        sys.exit("could not parse erj-config.js:\n" + e.stderr)
    return json.loads(out.stdout)


def files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name in SKIP_FILES:
                continue
            if os.path.splitext(name)[1].lower() in SCAN_EXT:
                path = os.path.join(dirpath, name)
                try:
                    yield os.path.relpath(path, ROOT), open(path, encoding="utf-8", errors="replace").read()
                except OSError:
                    continue


def strip_comments(text):
    """Retired terms are allowed inside the comment that explains they are
    retired — otherwise the explanation trips its own guard."""
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    text = re.sub(r"(?m)^\s*//.*$", " ", text)
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    return text


def main():
    warn_only = "--warn" in sys.argv
    canon = load_canon()
    failures, warnings = [], []

    def fail(check, path, detail):
        failures.append((check, path, detail))

    def warn(check, path, detail):
        warnings.append((check, path, detail))

    # allowed money figures: every canon price, every strike-through, every
    # saving those two imply, and every published credit
    allowed = set()
    for p in canon["products"]:
        allowed.add(p["naira"])
        if p.get("wasNaira"):
            allowed.add(p["wasNaira"])
            allowed.add(p["wasNaira"] - p["naira"])
    for c in canon.get("credits", []):
        allowed.add(c["naira"])
    allowed.add(canon["cohort"]["feeNaira"])
    allowed.add(canon["cohort"]["feeNaira"] - canon["credits"][0]["naira"])

    retired = [t for t in canon.get("retired", []) if t.strip()]
    official = canon["lines"]["official"]
    corpus = list(files())

    # ── 1. retired terms ────────────────────────────────────────────────
    for path, raw in corpus:
        if path == DEFINITION:
            continue
        body = strip_comments(raw)
        for term in retired:
            for line in body.splitlines():
                if term.lower() in line.lower() and ESCAPE not in line:
                    (warn if is_archive(path) else fail)(
                        "retired term", path, '"%s" must not appear anywhere' % term)
                    break

    # ── 2. only the official WhatsApp line ──────────────────────────────
    for path, raw in corpus:
        if path == DEFINITION:
            continue
        for found in set(re.findall(r"\b234\d{10}\b", raw)):
            if found != official:
                fail("phone", path, "%s is not the official line (%s)" % (found, official))

    # ── 3. no money figure outside canon ────────────────────────────────
    price_re = re.compile(NAIRA + r"\s?([0-9][0-9,]{3,})")
    for path, raw in corpus:
        if path == DEFINITION or is_outcome_page(path) or path in PORTAL:
            continue
        for line in raw.splitlines():
            if ESCAPE in line:
                continue
            for m in set(price_re.findall(line)):
                if "," not in m and len(m) < 4:
                    continue
                value = int(m.replace(",", ""))
                if value not in allowed:
                    fail("price", path, "%s%s is not a canon figure" % (NAIRA, m))

    # ── 4. the cohort in play is the cohort in canon ────────────────────
    current = canon["cohort"]["number"]
    for path, raw in corpus:
        if path == DEFINITION or path in PORTAL or is_archive(path):
            continue
        for line in raw.splitlines():
            if ESCAPE in line:
                continue
            for n in set(re.findall(r"Cohort\s+(\d+)", line)):
                if int(n) != current:
                    fail("cohort", path,
                         "Cohort %s referenced; canon is Cohort %d" % (n, current))

    # ── 5. an expired window is never advertised as open ────────────────
    window = canon["cohort"].get("instalmentWindowCloses")
    if window:
        y, mth, d = (int(x) for x in window.split("-"))
        if date(y, mth, d) < date.today():
            for path, raw in corpus:
                low = raw.lower()
                if "instalment" in low and ("window is open" in low or "instalments are open" in low
                                            or "window closes" in low):
                    warn("expired window", path,
                         "instalment window closed %s — check this page still reads correctly" % window)

    # ── 6. the model is five parts, everywhere ──────────────────────────
    labels = [p["label"] for p in canon["model"]["parts"]]
    downstream = [l for l in labels if l != "Capacity"]
    for path, raw in corpus:
        if path == DEFINITION or not path.endswith(".html") or path in PORTAL:
            continue
        # case-sensitive: these are the published labels, not css class names
        if all(re.search(r"\b%s\b" % l, raw) for l in downstream):
            if not re.search(r"\bCapacity\b", raw) and ESCAPE not in raw:
                (warn if is_archive(path) else fail)(
                    "model", path,
                    "enumerates the model without Capacity — the order starts at Capacity")

    # ── 7. README carries the current commercial picture ────────────────
    readme = dict(corpus).get("README.md")
    if readme is None:
        fail("README", "README.md", "missing")
    else:
        if "Cohort %d" % current not in readme:
            fail("README", "README.md", "does not name Cohort %d" % current)
        if canon["model"]["name"] not in readme:
            fail("README", "README.md", "does not name %s" % canon["model"]["name"])
        for p in canon["products"]:
            if p["name"] not in readme:
                warn("README", "README.md", "does not list the door: %s" % p["name"])
        for lab in labels:
            if lab not in readme:
                fail("README", "README.md", "does not name the part: %s" % lab)

    # ── 8. every payment link in canon actually appears on the site ─────
    joined = "\n".join(raw for _, raw in corpus)
    for p in canon["products"]:
        if p.get("pay") and p["pay"] not in joined:
            warn("link", "(site)", "%s: payment link is in canon but on no page" % p["name"])

    # ── 9. every published blog post is in the sitemap ──────────────────
    # generate-sitemap.py adds them; this makes sure nobody ships without it.
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("gensitemap", os.path.join(ROOT, "generate-sitemap.py"))
        gs = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gs)
        sitemap = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
        for slug in gs.published_posts(gs.today_wat()):
            if "%sblog/%s/" % (gs.BASE, slug) not in sitemap:
                fail("sitemap", "sitemap.xml",
                     "blog/%s/ is published but not listed — run generate-sitemap.py" % slug)
    except FileNotFoundError as e:
        fail("sitemap", "(site)", "cannot check sitemap: %s" % e)

    # ── 10. every blog post with a page is listed in the archive ────────
    # generate-blog-archive.py adds them; blog/index.html hides each until
    # its date, so future-dated posts are listed ahead of time.
    try:
        spec = importlib.util.spec_from_file_location("genarchive", os.path.join(ROOT, "generate-blog-archive.py"))
        ga = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ga)
        archive = open(ga.ARCHIVE, encoding="utf-8").read()
        for post in ga.posts():
            if 'href="%s/"' % post["slug"] not in archive:
                fail("archive", "blog/index.html",
                     "blog/%s/ is not in the archive — run generate-blog-archive.py" % post["slug"])
    except FileNotFoundError as e:
        fail("archive", "(site)", "cannot check blog archive: %s" % e)
    # ── 11. every link-preview image a page names actually exists ───────
    # Replaced cards get a new filename and the old one is deleted; a page
    # still naming the old file would show a broken preview when shared.
    prev_re = re.compile(r'(?:https://everythingremotejob\.com/|["\'/])(preview-[a-z0-9-]+\.(?:jpg|png|webp))')
    for path, raw in corpus:
        if not path.endswith(".html"):
            continue
        for img in set(prev_re.findall(raw)):
            if not os.path.exists(os.path.join(ROOT, img)):
                fail("image", path, "%s does not exist" % img)

    if os.path.exists(os.path.join(ROOT, "blog", "blog.html")):
        fail("blog", "blog/blog.html", "misplaced upload — blog.html belongs at the site root")

    # ── report ──────────────────────────────────────────────────────────
    for check, path, detail in warnings:
        print("%sWARN%s  %-16s %-34s %s" % (YELL, OFF, check, path, detail))
    for check, path, detail in failures:
        print("%sFAIL%s  %-16s %-34s %s" % (RED, OFF, check, path, detail))

    print()
    print("%s%d files scanned · %d checks%s" % (DIM, len(corpus), 11, OFF))
    if failures:
        print("%s%d failure(s)%s — the site disagrees with erj-config.js canon." % (RED, len(failures), OFF))
        print("Fix the page, or change canon and let every surface follow.")
        return 0 if warn_only else 1
    print("%sPASS%s — every surface agrees with canon.%s" % (GREEN, OFF,
          (" %d warning(s)." % len(warnings)) if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
