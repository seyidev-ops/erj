#!/usr/bin/env python3
"""
EVERYTHING REMOTE JOB — SITEMAP GENERATOR

Keeps sitemap.xml in step with the blog. Every post at blog/<slug>/index.html
whose datePublished has arrived (Africa/Lagos, WAT) gets an entry; posts that
were deleted, marked noindex or are still future-dated are left out. Every
non-blog entry is kept exactly as written.

    python3 generate-sitemap.py           # rewrite sitemap.xml if it changed
    python3 generate-sitemap.py --check   # exit 1 if sitemap.xml is out of date

Runs automatically from .github/workflows/sitemap.yml on every push to main
and once a day just after midnight WAT, so a scheduled post enters the sitemap
on the day it goes live. validate-facts.py fails the build if a published post
is missing.
"""

import os
import re
import sys
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.abspath(__file__))
SITEMAP = os.path.join(ROOT, "sitemap.xml")
BASE = "https://everythingremotejob.com/"
WAT = timezone(timedelta(hours=1))

ENTRY_RE = re.compile(r"[ \t]*<url>.*?</url>[ \t]*\n?", re.S)
LOC_RE = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>")
POST_LOC_RE = re.compile(r"^" + re.escape(BASE) + r"blog/([^/]+)/$")
DATE_RE = re.compile(r'"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})')
NOINDEX_RE = re.compile(r'<meta[^>]+name="robots"[^>]+noindex|<meta[^>]+noindex[^>]+name="robots"', re.I)


def today_wat():
    return datetime.now(WAT).date().isoformat()


def published_posts(today):
    """slug -> datePublished for every post that is live today."""
    posts = {}
    blog = os.path.join(ROOT, "blog")
    for slug in sorted(os.listdir(blog)):
        path = os.path.join(blog, slug, "index.html")
        if not os.path.isfile(path):
            continue
        html = open(path, encoding="utf-8", errors="replace").read()
        m = DATE_RE.search(html)
        if not m or m.group(1) > today or NOINDEX_RE.search(html):
            continue
        posts[slug] = m.group(1)
    return posts


def build(text, posts):
    head_end = text.index(">", text.index("<urlset")) + 1
    tail_start = text.rindex("</urlset>")
    body = text[head_end:tail_start]

    kept, seen = [], set()
    for entry in ENTRY_RE.findall(body):
        loc = LOC_RE.search(entry)
        slug = POST_LOC_RE.match(loc.group(1)).group(1) if loc and POST_LOC_RE.match(loc.group(1)) else None
        if slug is None:
            kept.append(entry)                      # not a blog post: keep as written
        elif slug in posts and slug not in seen:
            kept.append(entry)                      # existing post entry: keep its lastmod
            seen.add(slug)

    missing = sorted((d, s) for s, d in posts.items() if s not in seen)
    for date, slug in missing:
        kept.append(
            "<url><loc>%sblog/%s/</loc><lastmod>%s</lastmod>"
            "<changefreq>monthly</changefreq><priority>0.6</priority></url>\n" % (BASE, slug, date))

    out = text[:head_end] + "\n"
    for entry in kept:
        out += entry if entry.endswith("\n") else entry + "\n"
    return out + text[tail_start:], [s for _, s in missing]


def main():
    check = "--check" in sys.argv
    text = open(SITEMAP, encoding="utf-8").read()
    new, added = build(text, published_posts(today_wat()))
    if new == text:
        print("sitemap.xml is up to date.")
        return 0
    if check:
        print("sitemap.xml is out of date. Run: python3 generate-sitemap.py")
        for s in added:
            print("  missing: blog/%s/" % s)
        return 1
    open(SITEMAP, "w", encoding="utf-8").write(new)
    print("sitemap.xml updated: %d post(s) added." % len(added))
    for s in added:
        print("  + blog/%s/" % s)
    return 0


if __name__ == "__main__":
    sys.exit(main())
