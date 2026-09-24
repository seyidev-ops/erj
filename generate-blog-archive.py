#!/usr/bin/env python3
"""
EVERYTHING REMOTE JOB — BLOG ARCHIVE GENERATOR

Keeps the archive page (blog/index.html) in step with the blog. Every post in
blog.html that has its own page at blog/<slug>/index.html gets an entry under
its month, newest first. Future-dated posts are added too: the archive's own
script hides each entry until its date arrives (Africa/Lagos), so a scheduled
post appears on its publish day without another upload.

    python3 generate-blog-archive.py           # add missing entries
    python3 generate-blog-archive.py --check   # exit 1 if any are missing

Runs automatically from .github/workflows/sitemap.yml on every push to main.
Existing entries are never rewritten or removed.
"""

import html
import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
BLOG = os.path.join(ROOT, "blog.html")
ARCHIVE = os.path.join(ROOT, "blog", "index.html")
BASE = "https://everythingremotejob.com/blog/"

ENTRY_RE = re.compile(
    r"\{id:'([^']+)',featured:(?:true|false),published:(?:true|false),\s*"
    r"title:'((?:[^'\\]|\\.)*)',\s*category:'((?:[^'\\]|\\.)*)'.*?"
    r"date:'(\d{4}-\d{2}-\d{2})',readTime:(\d+)", re.S)
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]


def js_unescape(s):
    return re.sub(r"\\(.)", r"\1", s)


def posts():
    """Every post in blog.html that has a static page, as dicts."""
    src = open(BLOG, encoding="utf-8").read()
    slugs = json.loads(re.search(r"const POST_SLUGS=(\{.*?\});", src).group(1))
    out = []
    for pid, title, category, day, minutes in ENTRY_RE.findall(src):
        slug = slugs.get(pid)
        if not slug or not os.path.isfile(os.path.join(ROOT, "blog", slug, "index.html")):
            continue
        out.append({"slug": slug, "title": js_unescape(title), "category": js_unescape(category),
                    "date": day, "minutes": int(minutes)})
    return out


def label(day):
    d = date.fromisoformat(day)
    return "%d %s %d" % (d.day, MONTHS[d.month - 1], d.year)


def li(p):
    return ('<li hidden=""><a href="%s/"><span class="t">%s</span>'
            '<span class="d">%s · %s · %d min read</span></a></li>'
            % (p["slug"], html.escape(p["title"], quote=False), label(p["date"]),
               html.escape(p["category"], quote=False), p["minutes"]))


def entry_date(li_html):
    m = re.search(r'<span class="d">(\d{1,2}) ([A-Za-z]+) (\d{4})', li_html)
    if not m or m.group(2) not in MONTHS:
        return "0000-00-00"
    return "%s-%02d-%02d" % (m.group(3), MONTHS.index(m.group(2)) + 1, int(m.group(1)))


def build(text, all_posts):
    missing = [p for p in all_posts if 'href="%s/"' % p["slug"] not in text]
    missing.sort(key=lambda p: p["date"], reverse=True)
    for p in missing:
        month_id = "m" + p["date"][:7]
        if 'id="%s"' % month_id not in text:
            d = date.fromisoformat(p["date"])
            name = "%s %d" % (MONTHS[d.month - 1], d.year)
            section = ('<section class="mon" hidden=""><h2 id="%s">%s<span class="n">0 articles</span></h2>'
                       '<ul></ul></section>' % (month_id, name))
            # months are newest first: insert before the first older month
            later = [m for m in re.finditer(r'<section class="mon"[^>]*><h2 id="(m\d{4}-\d{2})"', text)
                     if m.group(1) < month_id]
            at = later[0].start() if later else text.index('<div id="archive">') + len('<div id="archive">')
            text = text[:at] + section + text[at:]
            jump = '<a hidden="" href="#%s">%s</a>\n' % (month_id, name)
            older_jump = [m for m in re.finditer(r'<a[^>]*href="#(m\d{4}-\d{2})"', text) if m.group(1) < month_id]
            if older_jump:
                text = text[:older_jump[0].start()] + jump + text[older_jump[0].start():]
        # insert the entry before the first older entry in its month
        h2 = text.index('id="%s"' % month_id)
        ul_open = text.index("<ul>", h2) + len("<ul>")
        ul_close = text.index("</ul>", ul_open)
        at = ul_close
        for m in re.finditer(r"<li[^>]*>.*?</li>", text[ul_open:ul_close], re.S):
            if entry_date(m.group(0)) < p["date"]:
                at = ul_open + m.start()
                break
        text = text[:at] + li(p) + text[at:]

    # structured data: keep the ItemList complete, newest first
    m = re.search(r'(<script type="application/ld\+json">)(\{"@context".*?"CollectionPage".*?)(</script>)', text, re.S)
    if m and missing:
        data = json.loads(m.group(2))
        items = data["mainEntity"]["itemListElement"]
        have = {it["url"] for it in items}
        for p in sorted(missing, key=lambda p: p["date"]):
            url = BASE + p["slug"] + "/"
            if url not in have:
                items.insert(0, {"@type": "ListItem", "position": 0, "url": url, "name": p["title"]})
        for n, it in enumerate(items, 1):
            it["position"] = n
        data["mainEntity"]["numberOfItems"] = len(items)
        text = text[:m.start(2)] + json.dumps(data, ensure_ascii=False) + text[m.end(2):]
    return text, missing


def main():
    check = "--check" in sys.argv
    text = open(ARCHIVE, encoding="utf-8").read()
    new, added = build(text, posts())
    if not added:
        print("blog/index.html is up to date.")
        return 0
    if check:
        print("blog/index.html is missing %d post(s). Run: python3 generate-blog-archive.py" % len(added))
        for p in added:
            print("  missing: %s  %s" % (p["date"], p["slug"]))
        return 1
    open(ARCHIVE, "w", encoding="utf-8").write(new)
    print("blog/index.html updated: %d post(s) added." % len(added))
    for p in sorted(added, key=lambda p: p["date"]):
        print("  + %s  %s" % (p["date"], p["slug"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
