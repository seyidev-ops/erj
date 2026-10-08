#!/usr/bin/env python3
"""
ERJ Remote Job Board — the engine behind /jobs/.

Every listing on the board is written in the ERJ channel template, and only
roles open to someone living in Nigeria are published. Expired, closed and
not-eligible roles never feature.

Commands (run from the repo root):

  python3 jobboard.py daily              # what the GitHub Action runs every morning:
                                         # inbox -> fetch -> check -> build
  python3 jobboard.py import FILE.xlsx   # add rows from one sheet (--all = ignore the date window)
  python3 jobboard.py inbox              # import every sheet dropped in jobs/inbox/
  python3 jobboard.py fetch              # pull the public job feeds in jobs/data/config.json
  python3 jobboard.py check              # re-check every live link; close what has closed
  python3 jobboard.py build              # expire old rows and re-render jobs/index.html
  python3 jobboard.py build --check      # CI: fail if jobs/index.html is out of date
  python3 jobboard.py remove ID|URL      # take one listing down by hand
  python3 jobboard.py micro1-import P1.json [P2.json ...]
                                         # add today's micro1 roles from saved pages of
                                         # micro1's referral job list (used by the scheduled
                                         # task, because micro1 refuses GitHub's servers)

Data lives in jobs/data/:
  config.json    settings: date window, age limits, blocked sites, feeds, ATS boards
  listings.json  every live listing (this is what the page is built from)
  archive.json   closed / expired listings, kept so feeds never re-add them

Sheets: drop an .xlsx or .csv into jobs/inbox/ (GitHub: Add file > Upload files).
The run that starts on upload imports the rows dated today or yesterday (WAT)
and moves the file to jobs/inbox/done/. Name a file ..._ALL.xlsx to import
every eligible row regardless of date (a backfill). The three ERJ sheet layouts in use (Master, All-Fields,
monthly October-style) are recognised by their headers, as is the simple
board template jobs/ERJ_Job_Board_Upload_Template.xlsx.

Requires Python 3.9+. openpyxl only for .xlsx (pip install openpyxl).
"""
from __future__ import annotations

import csv
import datetime as dt
import hashlib
import html
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))
JOBS = os.path.join(ROOT, "jobs")
DATA = os.path.join(JOBS, "data")
INBOX = os.path.join(JOBS, "inbox")
PAGE = os.path.join(JOBS, "index.html")
F_CONFIG = os.path.join(DATA, "config.json")
F_LIVE = os.path.join(DATA, "listings.json")
F_ARCHIVE = os.path.join(DATA, "archive.json")

WAT = dt.timezone(dt.timedelta(hours=1))
UA = "Mozilla/5.0 (compatible; ERJ-JobBoard/1.0; +https://everythingremotejob.com/jobs/)"

FAMILIES = [
    "Virtual Assistant & Admin",
    "Executive & Personal Assistant",
    "Customer Service & Success",
    "Community Management",
    "Executive & Operations",
    "Legal",
    "Sales & Accounts",
    "Marketing & Creative",
    "Finance & Accounting",
    "Data & Product",
    "Tutoring & Teaching",
    "Tech & IT",
    "Volunteer & Internship",
]

# Sheet tab names -> board family.
TAB_FAMILY = {
    "virtual assistant": "Virtual Assistant & Admin",
    "va & admin": "Virtual Assistant & Admin",
    "virtual assistant & admin": "Virtual Assistant & Admin",
    "executive assistant": "Executive & Personal Assistant",
    "personal assistant": "Executive & Personal Assistant",
    "executive & personal assistant": "Executive & Personal Assistant",
    "customer support": "Customer Service & Success",
    "customer service & success": "Customer Service & Success",
    "community management": "Community Management",
    "executive & operations": "Executive & Operations",
    "legal": "Legal",
    "sales & accounts": "Sales & Accounts",
    "marketing & creative": "Marketing & Creative",
    "finance & accounting": "Finance & Accounting",
    "data & product": "Data & Product",
    "tutoring & teaching": "Tutoring & Teaching",
    "tech & travel": "Tech & IT",
    "tech & it": "Tech & IT",
    "volunteer & internship": "Volunteer & Internship",
}

# Title keywords -> family, for feed listings. First match wins, so the more
# specific families come first.
FAMILY_RULES = [
    ("Volunteer & Internship", r"\b(intern|internship|volunteer|graduate trainee|apprentice)\b"),
    ("Executive & Personal Assistant", r"\b(executive assistant|personal assistant|chief of staff|\bEA\b)"),
    ("Virtual Assistant & Admin", r"\b(virtual assistant|admin(istrative)?|data entry|office (manager|assistant)|receptionist|\bVA\b)"),
    ("Community Management", r"\b(community|moderator|moderation|discord)\b"),
    ("Customer Service & Success", r"\b(customer|client success|support (specialist|agent|representative|associate)|help ?desk|call cent(er|re)|cx\b|technical support|account manager)"),
    ("Legal", r"\b(legal|lawyer|attorney|paralegal|counsel|compliance|contract manager)\b"),
    ("Tutoring & Teaching", r"\b(tutor|teacher|teaching|instructor|lecturer|curriculum|educator)\b"),
    ("Finance & Accounting", r"\b(account(ant|ing)|bookkeep|finance|financial|payroll|audit|tax|controller|treasury|accounts (payable|receivable))"),
    ("Sales & Accounts", r"\b(sales|business development|\bsdr\b|\bbdr\b|account executive|lead gen|appointment sett|closer|partnerships?)\b"),
    ("Marketing & Creative", r"\b(market|seo|content|copywrit|writer|editor|social media|brand|design(er)?|graphic|video|motion|ui|ux|creative|growth|media buyer|pr\b|communications)"),
    ("Data & Product", r"\b(data|analyst|analytics|product (manager|owner|analyst)|\bbi\b|insights|research(er)?|scientist|machine learning|\bml\b|\bai\b trainer)"),
    ("Executive & Operations", r"\b(operations|ops\b|project (manager|coordinator)|program(me)? manager|coordinator|procurement|supply chain|logistics|hr\b|human resources|recruit|talent|people)"),
    ("Tech & IT", r"\b(engineer|developer|devops|sre\b|software|frontend|front-end|backend|back-end|full ?stack|qa\b|test(er|ing)|security|cloud|it\b|sysadmin|network|mobile|android|ios|web)"),
]

TEMPLATE = (
    "👨🏽‍💻 JOB TITLE: {title}\n\n"
    "🏢 Company: {company}\n"
    "🌍 Remote Region: {region}\n"
    "🇳🇬 Nigeria Eligible: YES\n"
    "⏰ Job Type: {jtype}\n\n"
    "💼 Experience: {experience}\n"
    "💰 Salary: {salary}\n\n"
    "📌 WHAT THEY'RE LOOKING FOR\n"
    "{bullets}\n\n"
    "*WHY IT MADE THE BOARD*\n"
    "{why}\n\n"
    "🔗 APPLY HERE:\n"
    "{apply}\n"
    "———\n\n"
    "🙋🏽‍♂️ *Unsure whether you qualify for this role?* Message ERJ us with this Job and your CV "
    "to check the requirements with you: {phone}\n\n"
    "Everything Remote Job\n"
    "Work Beyond Borders."
)


# ─────────────────────────────────────────────────────────────── utilities

def today():
    forced = os.environ.get("ERJ_TODAY")  # for tests: YYYY-MM-DD
    if forced:
        return dt.date.fromisoformat(forced)
    return dt.datetime.now(WAT).date()


def load(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=False)
        f.write("\n")
    os.replace(tmp, path)


def clean(s):
    if s is None:
        return ""
    s = str(s).replace(" ", " ")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip(" \t\n;,")


def dash(s):
    """Sheets use '—' for 'nothing here'."""
    s = clean(s)
    return "" if s in ("—", "-", "–", "n/a", "N/A", "None", "none") else s


TRACKING = re.compile(r"^(utm_|ref$|refs$|source$|src$|gh_src$|lever-source|trk$|trackingid$)", re.I)


def norm_url(u):
    u = clean(u)
    if not u:
        return ""
    if u.startswith("www."):
        u = "https://" + u
    try:
        p = urllib.parse.urlsplit(u)
    except ValueError:
        return u
    q = [(k, v) for k, v in urllib.parse.parse_qsl(p.query, keep_blank_values=True) if not TRACKING.match(k)]
    path = p.path.rstrip("/") or "/"
    return urllib.parse.urlunsplit((p.scheme.lower() or "https", p.netloc.lower(), path, urllib.parse.urlencode(q), ""))


def make_id(apply, title, company):
    key = norm_url(apply) or (clean(title).lower() + "|" + clean(company).lower())
    return hashlib.sha1(key.lower().encode()).hexdigest()[:10]


def dupe_key(title, company):
    t = re.sub(r"[^a-z0-9]+", " ", clean(title).lower()).strip()
    c = re.sub(r"[^a-z0-9]+", " ", clean(company).lower()).strip()
    c = re.sub(r"\b(ltd|limited|inc|llc|plc|careers|group)\b", "", c).strip()
    return t + "|" + c


def domain(u):
    try:
        return urllib.parse.urlsplit(u).netloc.lower().removeprefix("www.")
    except Exception:
        return ""


def search_page(u):
    """A board's search-results page is not a job: nothing to apply to."""
    d, low = domain(u), u.lower()
    if "indeed." in d:
        return not re.search(r"[?&](v?jk)=|viewjob", low)
    if "glassdoor." in d:
        return "srch_" in low or "/job/" in low and "-jobs-" in low
    if "linkedin." in d:
        return "/jobs/view/" not in low
    return bool(re.search(r"jooble\.|/search\?|[?&](q|keywords?)=", low))


def blocked(u, cfg):
    d = domain(u)
    return any(d == b or d.endswith("." + b) for b in cfg["blocked_domains"])


MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def parse_date(s, ref=None):
    """'25 Sep 2026', '~23 Sep 2026', '1 Oct 2026, 21:02 WAT', 'Sep 21', 'apply by 20 Nov',
    '2026-10-01', datetime objects. Ranges take the first day. Returns a date or None."""
    if s is None or s == "":
        return None
    if isinstance(s, dt.datetime):
        return s.date()
    if isinstance(s, dt.date):
        return s
    if isinstance(s, (int, float)):
        if s > 10**11:  # epoch ms
            return dt.datetime.fromtimestamp(s / 1000, WAT).date()
        if s > 10**8:
            return dt.datetime.fromtimestamp(s, WAT).date()
        return None
    t = str(s).strip()
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", t)
    if m:
        try:
            return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    ref = ref or today()
    m = re.search(r"(\d{1,2})(?:\s*[–-]\s*\d{1,2})?\s+([A-Za-z]{3,9})\.?,?\s*(\d{4})?", t)
    if m and m.group(2)[:3].lower() in MONTHS:
        d, mon, y = int(m.group(1)), MONTHS[m.group(2)[:3].lower()], m.group(3)
    else:
        m = re.search(r"([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?", t)
        if not (m and m.group(1)[:3].lower() in MONTHS):
            return None
        mon, d, y = MONTHS[m.group(1)[:3].lower()], int(m.group(2)), m.group(3)
    year = int(y) if y else ref.year
    try:
        out = dt.date(year, mon, d)
    except ValueError:
        return None
    if not y and (out - ref).days > 200:  # 'Dec 30' read in January
        out = out.replace(year=year - 1)
    return out


def fmt_date(d):
    return f"{d.day} {d.strftime('%b')} {d.year}" if d else ""


def html_text(h):
    if not h:
        return ""
    h = html.unescape(str(h))
    h = re.sub(r"(?is)<(script|style).*?</\1>", " ", h)
    h = re.sub(r"(?i)<br\s*/?>|</p>|</li>|</h\d>|</div>", "\n", h)
    h = re.sub(r"<[^>]+>", " ", h)
    h = html.unescape(h)
    h = re.sub(r"[ \t ]+", " ", h)
    return re.sub(r"\n\s*\n+", "\n", h).strip()


# ──────────────────────────────────────────────── field writers (template)

def job_type(*texts):
    t = " ".join(clean(x).lower() for x in texts if x)
    if re.search(r"intern", t):
        return "Internship"
    if re.search(r"part[\s_-]?time", t):
        return "Part-Time"
    if re.search(r"contract|freelance|consult|independent|temporary|fixed[\s-]?term", t):
        return "Contract"
    if re.search(r"full[\s_-]?time|fulltime|permanent", t):
        return "Full-Time"
    return ""


def experience_from(text, level=""):
    t = html_text(text)
    m = re.search(r"(\d{1,2})\s*(?:\+|plus)?\s*(?:[–\-to]+\s*(\d{1,2})\s*\+?)?\s*(?:years?|yrs?)\b", t, re.I)
    if m:
        a, b = int(m.group(1)), m.group(2)
        if a <= 20:
            return f"{a}–{b} years" if b and int(b) > a else f"{a}+ year{'s' if a != 1 else ''}"
    lv = clean(level).lower()
    for k, v in (("intern", "Internship / no experience required"), ("entry", "Entry level"), ("junior", "Junior"),
                 ("mid", "Mid-level"), ("senior", "Senior"), ("lead", "Lead"), ("manager", "Manager level"),
                 ("director", "Director level"), ("executive", "Executive level")):
        if k in lv:
            return v
    return ""


MONEY = re.compile(
    r"((?:US)?\$|USD\s?|₦|NGN\s?|N(?=\d{2,3},\d{3})|£|€|GBP\s?|EUR\s?)\s?\d[\d,\.]*\s?[kK]?"
    r"(?:\s?(?:[–\-]|to)\s?(?:(?:US)?\$|₦|£|€)?\s?\d[\d,\.]*\s?[kK]?)?"
    r"(?:\s?(?:/|per|a)\s?(?:hour|hr|h|month|mo|year|yr|annum|week|wk|day))?",
    re.I)


def salary_from(*texts):
    for t in texts:
        if not t:
            continue
        m = MONEY.search(html_text(t))
        if m:
            s = m.group(0).strip()
            if re.search(r"\d", s) and not re.fullmatch(r"\$?\d{1,2}", s):
                return s
    return ""


def fmt_money(lo, hi, cur, period):
    if not lo and not hi:
        return ""
    sym = {"USD": "$", "GBP": "£", "EUR": "€", "NGN": "₦"}.get((cur or "USD").upper(), (cur or "") + " ")
    def n(x):
        x = float(x)
        return f"{sym}{x:,.0f}" if x >= 100 else f"{sym}{x:,.2f}".rstrip("0").rstrip(".")
    per = {"yearly": "year", "year": "year", "annual": "year", "monthly": "month", "month": "month",
           "hourly": "hour", "hour": "hour", "weekly": "week", "daily": "day"}.get(clean(period).lower(), "")
    body = f"{n(lo)} – {n(hi)}" if lo and hi and float(hi) > float(lo) else n(lo or hi)
    return body + (f" / {per}" if per else "")


SPLIT = re.compile(r";\s*|\n+|,\s+(?![^()]*\))")


def bullets_from_text(text, limit=4):
    """Short sheet text like 'SQL, Python, Airflow; core hours 10am–3pm' -> list."""
    out = []
    for part in SPLIT.split(clean(text)):
        p = clean(part)
        if not p or MONEY.fullmatch(p) or len(p) < 3:
            continue
        if re.fullmatch(r"[$₦£€]?[\d,\.–\- k/]+(month|hour|hr|year|yr)?", p, re.I):
            continue
        out.append(p[0].upper() + p[1:])
    # Short comma lists (tools) read better merged two-by-two.
    if len(out) > limit and all(len(x) < 28 for x in out):
        merged, i = [], 0
        per = -(-len(out) // limit)
        while i < len(out):
            merged.append(", ".join(out[i:i + per]))
            i += per
        out = merged
    return out[:limit]


SECTION_HINT = re.compile(
    r"(requirement|qualification|what you('|’)?ll (need|bring)|what we('|’)?re looking for|"
    r"about you|you (have|bring|are)|skills|must have|who you are|ideal candidate|experience)", re.I)


REQ_WORDS = re.compile(r"\b(experience|proficien|skill|abilit|knowledge|familiar|degree|strong|excellent|"
                       r"must|you have|understanding|comfortable|fluent|track record|background)", re.I)
PERK_WORDS = re.compile(r"\b(salary|compensation|bonus|stipend|benefit|equity|pto|vacation|leave|insurance|"
                        r"401k|pension|health|we offer|perks?)\b", re.I)


def tidy_item(it):
    it = clean(re.sub(r"\s+", " ", it)).rstrip(".")
    # 'Bold lead. Long explanation…' -> keep the bold lead.
    m = re.match(r"(.{12,110}?)[.:]\s+[A-Z]", it)
    if m and len(it) > 110:
        it = m.group(1)
    if len(it) > 140:
        cut = max(it.rfind("; ", 0, 140), it.rfind(", ", 0, 140), it.rfind(" (", 0, 140), it.rfind(" and ", 0, 140))
        it = it[:cut].rstrip(" ,;(") if cut > 60 else it[:137].rsplit(" ", 1)[0] + "…"
    return it[:1].upper() + it[1:]


def bullets_from_html(desc, limit=4):
    """Pick up to four requirement lines from a job description: the list under a
    requirements heading if there is one, else the list that reads most like
    requirements. Pay and perks lines are never used."""
    if not desc:
        return []
    h = html.unescape(str(desc))
    lists = []
    for m in re.finditer(r"(?is)<ul[^>]*>(.*?)</ul>", h):
        items = [html_text(x) for x in re.findall(r"(?is)<li[^>]*>(.*?)</li>", m.group(1))]
        items = [x for x in items if 8 <= len(x) <= 400 and not PERK_WORDS.search(x)]
        if not items:
            continue
        before = html_text(h[max(0, m.start() - 400):m.start()])[-160:]
        score = 5 * bool(SECTION_HINT.search(before)) + sum(bool(REQ_WORDS.search(x)) for x in items)
        score -= 4 * bool(re.search(r"(benefit|perk|what we offer|you('|’)?ll get|why (join|work)|responsibilit|you will do|day to day)", before, re.I))
        lists.append((score, items))
    if lists:
        items = max(lists, key=lambda t: t[0])[1]
    else:
        sents = re.split(r"(?<=[.!?])\s+", html_text(h))
        items = [x for x in sents if REQ_WORDS.search(x) and not PERK_WORDS.search(x)]
    out = []
    for it in items:
        it = tidy_item(it)
        if len(it) < 8 or it.lower() in (o.lower() for o in out) or re.fullmatch(
                r"(eligibility |minimum |key )?(requirements?|qualifications?|skills|responsibilities)", it, re.I):
            continue
        out.append(it)
        if len(out) == limit:
            break
    return out


def why_line(j):
    """'WHY IT MADE THE BOARD' — written from the listing's own facts, never invented."""
    region = j["region"].lower()
    parts = []
    if "nigeria" in region or "lagos" in region or "abuja" in region:
        parts.append("Open to candidates in Nigeria by name")
    elif "africa" in region:
        parts.append("Open across Africa, Nigeria included")
    elif re.search(r"worldwide|anywhere|global|all countries|any country", region):
        parts.append("Open worldwide with no country exclusion, so you can apply from Nigeria")
    else:
        parts.append("Open to remote applicants in Nigeria")
    sal = j["salary"]
    if sal and sal != "Undisclosed" and MONEY.search(sal):
        if re.search(r"\$|usd|£|€", sal, re.I):
            parts.append(f"pays in foreign currency ({sal})")
        else:
            parts.append(f"pay is stated upfront ({sal})")
    first = parts[0] + (", and " + parts[1] if len(parts) > 1 else "") + "."
    extra = []
    exp = j["experience"].lower()
    if re.search(r"intern|entry|no experience|junior|\b0[–\-+]|\b1\+ year\b", exp):
        extra.append("A realistic entry point if you are early in your remote career")
    if j["type"] == "Part-Time":
        extra.append("Part-time, so it can sit beside a current job")
    elif j["type"] == "Contract":
        extra.append("Contract work: a fast way to earn a first remote reference")
    if j.get("direct"):
        extra.append("You apply directly on the employer's own page")
    return first + (" " + extra[0] + "." if extra else "")


PHONE = re.compile(r"(?:\+?234|\b0)[\s-]?[789][01]\d(?:[\s-]?\d){7}\b")


def scrub(s):
    """Phone numbers in employer text never reach the page: the site carries one line only."""
    return PHONE.sub("[number on the employer's page]", s) if isinstance(s, str) else s


def finalise(j, cfg):
    """Fill defaults, write the WHY line and the copy text."""
    for k in ("title", "company", "region", "experience", "salary", "why"):
        j[k] = scrub(j.get(k))
    j["bullets"] = [scrub(b) for b in (j.get("bullets") or [])]
    j["title"] = clean(j["title"])
    j["company"] = clean(j["company"]) or "Not stated"
    j["region"] = clean(j["region"]) or "Remote"
    j["type"] = j.get("type") or "Not stated"
    j["experience"] = clean(j.get("experience")) or "Not stated"
    sal = clean(j.get("salary"))
    if not sal or re.match(r"(not stated|not disclosed|undisclosed|competitive|n/?a|tbd|negotiable)\b", sal, re.I):
        sal = "Undisclosed"
    j["salary"] = sal
    def pay_only(b):
        m = MONEY.search(b)
        return bool(m) and len(m.group(0)) >= 0.45 * len(b)
    j["bullets"] = [b for b in (j.get("bullets") or []) if b and not pay_only(b)][:4] or ["Full requirements are on the employer's page"]
    d = domain(j["apply"])
    j["direct"] = bool(re.search(r"greenhouse|lever\.co|ashbyhq|breezy|workable|smartrecruiters|bamboohr|recruitee|rippling|polymer|zohorecruit|teamtailor|careers", d))
    if not j.get("why"):
        j["why"] = why_line(j)
    j["family"] = j.get("family") if j.get("family") in FAMILIES else classify(j["title"])
    return j


def copy_text(j, cfg):
    return TEMPLATE.format(
        title=j["title"], company=j["company"], region=j["region"], jtype=j["type"],
        experience=j["experience"], salary=j["salary"],
        bullets="\n".join("◽ " + b for b in j["bullets"]),
        why=j["why"], apply=j["apply"], phone=cfg["phone"])


def classify(title):
    for fam, rx in FAMILY_RULES:
        if re.search(rx, title, re.I):
            return fam
    return "Executive & Operations"


# ───────────────────────────────────────────────────── eligibility rules

OTHER_COUNTRIES = (r"kenya|ghana|zambia|uganda|jamaica|caribbean|south africa|\bsa\b|canada|\bus\b|usa|united states|"
                   r"\buk\b|united kingdom|europe|\beu\b|mauritius|namibia|cameroon|india|philippines|latam|"
                   r"brazil|mexico|australia|germany|france|spain|portugal|egypt|morocco|rwanda|tanzania|ethiopia|"
                   r"myanmar|burmese|vietnam|indonesia|thailand|japan|korea|china|turkey|poland|romania|ukraine|"
                   r"argentina|colombia|chile|peru|ireland|netherlands|italy|sweden|new zealand|singapore|malaysia|"
                   r"israel|uae|dubai|saudi|qatar|mauritius|seychelles|madagascar|mozambique|angola|sudan|somalia|tunisia|"
                   r"algeria|libya|benin|togo|mali\b|burkina|liberia|sierra leone|gambia|lesotho|eswatini|congo|drc\b|gabon|"
                   r"zimbabwe|botswana|malawi|senegal|ivory coast|côte|pakistan|bangladesh|apac|asia")


def region_open_to_nigeria(region):
    """A region that names a country other than Nigeria must also say Nigeria,
    Africa-wide or worldwide. 'Mauritius remote' fails; 'Kenya, Nigeria, South Africa' passes."""
    r = clean(region).lower()
    if re.search(r"restriction (is )?(not )?stated|not stated|unconfirmed|per board|per listing", r):
        return False  # silence on country is not the employer opening the role to Nigeria
    if not r or re.search(r"nigeria|lagos|abuja|worldwide|anywhere|global|all countries|any country", r):
        return True
    if re.search(r"\bafrica\b", r.replace("south africa", "")) and not re.search(r"other african", r):
        return True
    if re.search(OTHER_COUNTRIES, r):
        return False
    return not re.search(r"\b(only|based|residents?)\b", r)


def sheet_eligible(text):
    """The sheet's own 'Nigeria eligible?' column. Only clear yeses pass."""
    t = clean(text).lower()
    if not t:
        return False
    if re.search(r"appears|per listing|verif|not established|historically|potentially|was |needs|confirm|"
                 r"listed for|no evidence|^no\b|no for ng|nigeria no|if you can", t):
        return False
    if "nigeria" in t or "lagos" in t:
        return True
    if not t.startswith("yes"):
        return False
    if re.search(OTHER_COUNTRIES, t):
        return "worldwide" in t or "africa" in t and "south africa" not in t
    return True


POSITIVE = re.compile(
    r"\b(worldwide|anywhere|global(ly)?|international|all countries|any country|any location|"
    r"nigeria|lagos|abuja|africa|emea \(incl(uding)? africa\))\b", re.I)
NEGATIVE = re.compile(
    r"(\b(us|u\.s\.|usa|united states|uk|u\.k\.|united kingdom|canada|eu|europe|european|latam|philippines|india|"
    r"australia|germany|brazil|mexico)[- ]?(only|residents? only|citizens? only|based (candidates|applicants|residents|talent) only)\b"
    r"|(open|available) (only )?to (candidates|applicants|residents) (in|of|from) (the\s+)?(us|usa|united states|uk|canada|europe|eu|latam|philippines|india)\b"
    r"|(candidates|applicants) must (be|reside|live) (located |based )?in (the\s+)?(us|usa|united states|uk|canada|europe|eu|latam|philippines|india)\b"
    r"|must (be|reside|live|be located|be based)\s+(in|within)\s+(the\s+)?(us|u\.s\.|usa|united states|uk|united kingdom|canada|europe|eu|latam|india|philippines|australia|brazil|mexico)"
    r"|authori[sz]ed to work in (the\s+)?(us|u\.s\.|usa|united states|uk|united kingdom|canada|eu|europe)"
    r"|(us|u\.s\.) work authori[sz]ation|right to work in the uk|w-?2 (employee|only)|\bsecurity clearance\b"
    r"|(exclud|except)\w*[^.]{0,80}nigeria|not (able|eligible)[^.]{0,60}nigeria"
    r"|only (hire|accept|consider)[^.]{0,40}(in|from) (the\s+)?(us|usa|united states|uk|canada|europe|eu|latam))", re.I)


GLOBAL_PROOF = re.compile(
    r"\b(hire (globally|worldwide|anywhere|internationally)|work from anywhere|anywhere in the world|from any country|"
    r"open to (candidates|applicants|talent) (from |in )?(anywhere|any country|all countries|worldwide)|"
    r"fully distributed|location[- ]independent|globally distributed|nigeria|africa)\b", re.I)


def location_ok(location, desc="", strict=False):
    """Feed listings: the employer's own location text must open the role to Nigeria,
    and the description must not shut it. 'Remote' on its own never counts."""
    loc = clean(location).lower()
    body = html_text(desc)[:20000]
    if NEGATIVE.search(body) or NEGATIVE.search(loc):
        return False, "description restricts the country"
    if re.search(r"nigeria|lagos|abuja", loc):
        return True, ""
    if "south africa" in loc and not re.search(r"\bafrica\b(?!.*south)", loc.replace("south africa", "")):
        return False, "location is South Africa"
    if re.search(r"\bafrica\b", loc):
        return True, ""
    if re.search(r"worldwide|anywhere|global|international|all countries|any location", loc):
        if re.search(OTHER_COUNTRIES, loc) and not re.search(r"worldwide|anywhere", loc):
            return False, "location names other countries"
        if strict and not GLOBAL_PROOF.search(body):
            return False, "board says worldwide but the employer's text never says so"
        return True, ""
    if "emea" in loc:
        # EMEA covers Nigeria on a map, not always on a payroll: it needs Nigeria or Africa named.
        if re.search(OTHER_COUNTRIES + r"|americas|london", loc.replace("emea", "")):
            return False, "location lists other regions alongside EMEA"
        if re.search(r"\b(nigeria|africa)\b", body, re.I) and not re.search(r"south africa", body, re.I):
            return True, ""
        return False, "location says EMEA without naming Nigeria or Africa"
    if loc in ("remote", "fully remote", "100% remote", "remote-first", ""):
        if re.search(r"\b(nigeria|africa)\b", body, re.I) or re.search(
                r"\b(work from anywhere|anywhere in the world|worldwide|from any country|location[- ]independent)\b", body, re.I):
            return True, ""
        return False, "location only says remote; no country rule stated"
    return False, f"location is {clean(location)[:60]}"


# ─────────────────────────────────────────────────────────── sheet import

HEAD = {
    "title": ("role", "job title", "title", "position"),
    "company": ("company", "employer", "organisation", "organization"),
    "region": ("remote geography", "remote region", "who can apply", "geography", "region"),
    "location": ("location",),
    "eligible": ("nigeria eligible", "eligible"),
    "experience": ("experience", "level"),
    "jtype": ("job type", "type"),
    "reqs": ("key requirements", "recurring requirements", "requirements", "looking for"),
    "salary": ("pay", "salary", "compensation"),
    "deadline": ("deadline", "closing date", "closes"),
    "posted": ("date posted", "posted"),
    "howto": ("how to apply",),
    "apply": ("apply link", "apply / source link", "apply here", "link", "url"),
    "found": ("found on", "source"),
    "status": ("status",),
    "checked": ("checked",),
    "notes": ("notes", "note", "why excluded if excluded", "why excluded", "why"),
    "why": ("why it made the board",),
    "family": ("job family", "field", "category"),
    "b1": ("looking for 1", "bullet 1"), "b2": ("looking for 2", "bullet 2"),
    "b3": ("looking for 3", "bullet 3"), "b4": ("looking for 4", "bullet 4"),
}
SKIP_TABS = re.compile(r"summary|request|excluded|archive|readme|how to|instructions|rules", re.I)


def map_header(cells):
    labels = [clean(c).lower() for c in cells]
    if not ("role" in labels or "job title" in labels or "title" in labels) or not any("company" in l for l in labels):
        return None
    col = {}
    # Exact names first so 'why it made the board' is not taken by 'why'.
    for key, names in HEAD.items():
        for i, l in enumerate(labels):
            if i in col.values():
                continue
            if l in names:
                col[key] = i
                break
    for key, names in HEAD.items():
        if key in col:
            continue
        for i, l in enumerate(labels):
            if i in col.values() or not l:
                continue
            if any(l.startswith(n) for n in names):
                col[key] = i
                break
    return col


def read_rows(path):
    """Yield (tab_name, header_map, values, links) for every data row."""
    if path.lower().endswith(".csv"):
        with open(path, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
        hm = None
        for r in rows:
            if hm is None:
                hm = map_header(r)
                continue
            yield os.path.splitext(os.path.basename(path))[0], hm, r, [None] * len(r)
        return
    import openpyxl  # noqa: needed only for xlsx
    wb = openpyxl.load_workbook(path, data_only=True)
    for ws in wb.worksheets:
        if SKIP_TABS.search(ws.title):
            continue
        hm = None
        for row in ws.iter_rows():
            vals = [c.value for c in row]
            if hm is None:
                hm = map_header(vals)
                continue
            links = [(c.hyperlink.target if c.hyperlink is not None else None) for c in row]
            yield ws.title, hm, vals, links


def row_to_listing(tab, hm, vals, links, cfg, source_name):
    g = lambda k: vals[hm[k]] if k in hm and hm[k] < len(vals) else None
    title = dash(g("title"))
    if not title or len(title) < 3 or title.lower().startswith(("no qualifying", "▸", "add ")):
        return None, None
    company = dash(g("company"))
    if not company:
        return None, None
    reasons = []
    apply = ""
    if "apply" in hm:
        i = hm["apply"]
        apply = (links[i] if i < len(links) and links[i] else None) or dash(vals[i] if i < len(vals) else "")
    if not apply:
        for k, v in enumerate(vals):  # any hyperlink on the row
            if k < len(links) and links[k] and str(links[k]).startswith("http"):
                apply = links[k]
                break
    apply = clean(apply)
    if not apply.startswith("http") and "@" not in apply:
        return None, "no apply link"
    status = dash(g("status")).lower()
    if status and not (status.startswith("live") or status.startswith("closing soon") or status.startswith("open")):
        return None, f"status: {dash(g('status'))}"
    loc = dash(g("location"))
    region = dash(g("region")) or loc
    if "eligible" in hm:
        if not sheet_eligible(g("eligible")):
            return None, f"eligibility not confirmed ({dash(g('eligible'))})"
    else:
        ok, why = location_ok(region)
        if not ok:
            return None, why
    if loc and "region" in hm and not re.match(r"\W*(nigeria|worldwide|africa\s*[—-]\s*multi|global|anywhere)", loc, re.I):
        return None, f"filed under {loc}"
    if not region_open_to_nigeria(region):
        return None, f"region names another country ({region[:60]})"
    if blocked(apply, cfg) and domain(apply) not in cfg.get("sheet_allowed_domains", []):
        return None, f"sign-up-to-apply board ({domain(apply)})"
    if search_page(apply):
        return None, "search results page, not a single job"
    notes = dash(g("notes"))
    posted = parse_date(g("posted"))
    if not posted and notes:
        m = re.search(r"(posted|published|re-?posted)\s*~?\s*([A-Za-z]{3,9}\s+\d{1,2}|\d{1,2}\s+[A-Za-z]{3,9})", notes, re.I)
        if m:
            posted = parse_date(m.group(2))
    deadline = parse_date(dash(g("deadline")))
    if not deadline:
        m = re.search(r"(closes?|closing|apply by|deadline)\s*:?\s*([0-9]{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?|[A-Za-z]{3,9}\s+\d{1,2}(?:,?\s*\d{4})?)",
                      notes + " " + dash(g("reqs")), re.I)
        if m:
            deadline = parse_date(m.group(2))
    checked = parse_date(g("checked"))
    exp_raw = dash(g("experience"))
    jt = job_type(dash(g("jtype")), exp_raw, title)
    experience = exp_raw
    if exp_raw and job_type(exp_raw) and re.fullmatch(r"(full|part)[\s-]?time|contract(or)?|freelance|internship|not stated", exp_raw, re.I):
        experience = ""
    reqs = dash(g("reqs"))
    salary = dash(g("salary")) or salary_from(reqs, notes)
    if salary.lower() in ("not stated", "not disclosed", "competitive"):
        salary = ""
    bullets = [dash(g(k)) for k in ("b1", "b2", "b3", "b4") if dash(g(k))] or bullets_from_text(reqs)
    howto = dash(g("howto"))
    if howto and len(bullets) < 4 and not re.match(r"(employer|apply on|ats|form)\b", howto, re.I):
        bullets.append("How to apply: " + howto[0].lower() + howto[1:])
    fam = dash(g("family"))
    family = fam if fam in FAMILIES else TAB_FAMILY.get(tab.strip().lower(), "")
    j = {
        "title": title, "company": company, "region": region,
        "type": jt, "experience": experience, "salary": salary, "bullets": bullets,
        "why": dash(g("why")), "apply": apply, "family": family,
        "posted": posted.isoformat() if posted else None,
        "deadline": deadline.isoformat() if deadline else None,
        "checked": checked.isoformat() if checked else None,
        "listed": (checked or today()).isoformat(),
        "source": dash(g("found")) or source_name, "origin": "sheet",
    }
    return j, None


def import_sheet(path, cfg, window_days=None):
    """window_days=None imports every eligible row; 2 = rows posted today or yesterday."""
    live = load(F_LIVE, {"listings": []})
    archive = load(F_ARCHIVE, {"listings": []})
    have = {j["id"] for j in live["listings"]} | {j["id"] for j in archive["listings"]}
    have_keys = {dupe_key(j["title"], j["company"]) for j in live["listings"]}
    added, skipped = [], []
    t0 = today()
    name = os.path.basename(path)
    for tab, hm, vals, links in read_rows(path):
        j, why = row_to_listing(tab, hm, vals, links, cfg, "ERJ research")
        if not j:
            if why and clean(vals[hm.get("title", 0)] if hm.get("title", 0) < len(vals) else ""):
                skipped.append({"title": clean(vals[hm["title"]]), "reason": why, "file": name})
            continue
        if window_days is not None:
            p = parse_date(j["posted"])
            if not p or (t0 - p).days >= window_days or p > t0:
                continue
        j["id"] = make_id(j["apply"], j["title"], j["company"])
        k = dupe_key(j["title"], j["company"])
        if j["id"] in have or k in have_keys:
            continue
        j["added"] = t0.isoformat()
        finalise(j, cfg)
        live["listings"].append(j)
        have.add(j["id"]); have_keys.add(k)
        added.append(j["title"] + " — " + j["company"])
    save(F_LIVE, live)
    return added, skipped


def cmd_inbox(cfg):
    os.makedirs(INBOX, exist_ok=True)
    done = os.path.join(INBOX, "done")
    report = []
    for f in sorted(os.listdir(INBOX)):
        p = os.path.join(INBOX, f)
        if not os.path.isfile(p) or not f.lower().endswith((".xlsx", ".csv")) or f.startswith(("~$", ".")):
            continue
        # A file named ..._ALL.xlsx or ..._BACKFILL.xlsx imports every eligible row, whatever its date.
        everything = re.search(r"(^|[_\- ])(all|backfill)([_\- .]|$)", f, re.I)
        added, skipped = import_sheet(p, cfg, window_days=None if everything else cfg["sheet_window_days"])
        report.append({"file": f, "added": added, "skipped": skipped[:200]})
        os.makedirs(done, exist_ok=True)
        stamp = today().isoformat()
        shutil.move(p, os.path.join(done, f"{stamp}_{f}"))
        print(f"inbox: {f}: {len(added)} added, {len(skipped)} turned away")
    return report


# ─────────────────────────────────────────────────────────────── feeds

BROWSER_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get_json(url, timeout=30, tries=3):
    """GET JSON, retrying twice: one slow or refused answer should not empty a source for the day."""
    headers = {"User-Agent": BROWSER_UA, "Accept": "application/json, text/plain, */*"}
    if "micro1.ai" in url:
        headers.update({"Origin": "https://refer.micro1.ai", "Referer": "https://refer.micro1.ai/", "x-custom-lang": "en"})
    last = None
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (400, 401, 404, 410):
                break
        except Exception as e:  # timeouts, resets
            last = e
        __import__("time").sleep(4 * (n + 1))
    raise last


AGGREGATORS = {"Remotive", "Jobicy"}


def feed_remotive(cfg):
    d = get_json("https://remotive.com/api/remote-jobs?limit=300")
    for x in d.get("jobs", []):
        yield {
            "title": x.get("title"), "company": x.get("company_name"),
            "location": x.get("candidate_required_location"), "desc": x.get("description"),
            "type": job_type(x.get("job_type")), "salary": clean(x.get("salary")),
            "posted": parse_date(x.get("publication_date")), "apply": x.get("url"),
            "source": "Remotive", "category": x.get("category"),
        }


def feed_jobicy(cfg):
    d = get_json("https://jobicy.com/api/v2/remote-jobs?count=100")
    for x in d.get("jobs", []):
        yield {
            "title": html.unescape(x.get("jobTitle") or ""), "company": x.get("companyName"),
            "location": x.get("jobGeo"), "desc": x.get("jobDescription"),
            "type": job_type(" ".join(x.get("jobType") or [])), "level": x.get("jobLevel"),
            "salary": fmt_money(x.get("salaryMin"), x.get("salaryMax"), x.get("salaryCurrency"), x.get("salaryPeriod")),
            "posted": parse_date(x.get("pubDate")), "apply": x.get("url"), "source": "Jobicy",
        }


def feed_greenhouse(slug, eu=False):
    host = "boards-api.eu.greenhouse.io" if eu else "boards-api.greenhouse.io"
    d = get_json(f"https://{host}/v1/boards/{slug}/jobs?content=true")
    for x in d.get("jobs", []):
        offices = " / ".join(o.get("name", "") for o in (x.get("offices") or []))
        yield {
            "title": x.get("title"), "company": x.get("company_name") or slug,
            "location": ((x.get("location") or {}).get("name") or "") + (" / " + offices if offices else ""),
            "desc": x.get("content"), "posted": parse_date(x.get("first_published") or x.get("updated_at")),
            "deadline": parse_date(x.get("application_deadline")),
            "apply": x.get("absolute_url"), "source": "Greenhouse", "ats_id": str(x.get("id")),
        }


def feed_lever(slug):
    d = get_json(f"https://api.lever.co/v0/postings/{slug}?mode=json")
    for x in d:
        c = x.get("categories") or {}
        lists = "".join(f"<h3>{l.get('text','')}</h3><ul>{l.get('content','')}</ul>" for l in x.get("lists") or [])
        sr = x.get("salaryRange") or {}
        yield {
            "title": x.get("text"), "company": slug,
            "location": " / ".join(c.get("allLocations") or [c.get("location") or ""]),
            "desc": (x.get("description") or "") + lists, "type": job_type(c.get("commitment")),
            "salary": fmt_money(sr.get("min"), sr.get("max"), sr.get("currency"), sr.get("interval", "").replace("per-", "")),
            "posted": parse_date(x.get("createdAt")), "apply": x.get("hostedUrl"),
            "source": "Lever", "ats_id": x.get("id"),
        }


def feed_ashby(slug):
    d = get_json(f"https://api.ashbyhq.com/posting-api/job-board/{urllib.parse.quote(slug)}?includeCompensation=true")
    for x in d.get("jobs", []):
        if x.get("isListed") is False:
            continue
        locs = [x.get("location") or ""] + [s.get("location", "") for s in (x.get("secondaryLocations") or []) if isinstance(s, dict)]
        comp = (x.get("compensation") or {}).get("scrapeableCompensationSalarySummary") or \
               (x.get("compensation") or {}).get("compensationTierSummary") or ""
        yield {
            "title": x.get("title"), "company": slug,
            "location": " / ".join(l for l in locs if l), "desc": x.get("descriptionHtml"),
            "type": job_type(x.get("employmentType")), "salary": clean(comp),
            "posted": parse_date(x.get("publishedAt")), "apply": x.get("jobUrl"),
            "source": "Ashby", "ats_id": x.get("id"),
        }


def feed_breezy(slug):
    d = get_json(f"https://{slug}.breezy.hr/json")
    for x in d:
        locs = x.get("locations") or [x.get("location") or {}]
        loc = " / ".join(clean((l or {}).get("name")) for l in locs)
        yield {
            "title": re.sub(r"^[A-Z]-?CPT-\d+\s*|^CPT-\d+\s*", "", x.get("name") or ""),
            "company": ((x.get("company") or {}).get("name")) or slug, "location": loc, "desc": "",
            "type": job_type(((x.get("type") or {}).get("name"))), "salary": clean(x.get("salary")),
            "posted": parse_date(x.get("published_date")), "apply": x.get("url"),
            "source": "Breezy", "ats_id": x.get("id"),
        }


MICRO1_FAMILY = {
    "law": "Legal", "software-engineering": "Tech & IT", "ai-machine-learning": "Tech & IT", "robotics": "Tech & IT",
    "applied-engineering": "Tech & IT", "cybersecurity": "Tech & IT", "data-analysis": "Data & Product",
    "sciences-research": "Data & Product", "finance": "Finance & Accounting", "business-operations": "Executive & Operations",
    "sales-marketing": "Marketing & Creative", "arts-design": "Marketing & Creative", "education": "Tutoring & Teaching",
    "humanities": "Tutoring & Teaching", "language-audio": "Tutoring & Teaching",
}
FOREIGN_LANGUAGE = re.compile(
    r"\b(korean|japanese|chinese|mandarin|cantonese|hindi|bengali|urdu|arabic|hebrew|turkish|russian|ukrainian|polish|"
    r"german|dutch|swedish|norwegian|danish|finnish|italian|spanish|portuguese|vietnamese|thai|indonesian|malay|tagalog|"
    r"filipino|greek|czech|romanian|hungarian|persian|farsi|swahili|amharic|zulu|afrikaans|tamil|telugu|marathi|gujarati|"
    r"punjabi|burmese|khmer|lao|nepali|sinhala|serbian|croatian|bulgarian|slovak)\b", re.I)
LICENSED = re.compile(r"\b(attorney|litigator|bar[- ]admitted|licensed|board[- ]certified|cpa\b|us gov|government|federal|"
                      r"(british|american|australian|canadian|irish|scottish) english)\b", re.I)


def feed_micro1(code):
    """micro1 jobs straight from the public list behind ERJ's referral page. Every apply
    link carries the referral code, so applications are credited to ERJ automatically."""
    page, seen = 1, 0
    while True:
        d = get_json(f"https://prod-api.micro1.ai/api/v1/job/portal/referral/{code}/jobs?page={page}&limit=100")
        rows = d.get("data") or []
        for x in rows:
            hr = x.get("ideal_hourly_rate") or {}
            sal = fmt_money(hr.get("min"), hr.get("max"), "USD", "hour") if hr else ""
            if not sal and x.get("ideal_yearly_compensation"):
                yc = x["ideal_yearly_compensation"]
                sal = fmt_money(yc.get("min"), yc.get("max"), "USD", "year")
            skills = [clean(k) for k in (x.get("skills") or []) if clean(k)]
            yield {
                "title": x.get("job_name"), "company": "micro1",
                "location": "Remote — worldwide (micro1 global expert network)",
                "location_type": x.get("location_type"),
                "desc": "", "skills": skills[:4], "domain": x.get("domain_slug"),
                "type": job_type(x.get("engagement_type") or "") or "Contract",
                "salary": sal, "posted": parse_date(x.get("date_posted")),
                "apply": x.get("apply_url"), "source": "micro1 (ERJ referral)", "ats_id": x.get("job_id"),
                "openings": x.get("no_of_openings"),
            }
        seen += len(rows)
        if not rows or seen >= (d.get("total") or 0):
            break
        page += 1


def feed_workable(slug):
    d = get_json(f"https://apply.workable.com/api/v1/widget/accounts/{slug}?details=true")
    for x in d.get("jobs", []):
        locs = x.get("locations") or [{"country": x.get("country"), "city": x.get("city")}]
        where = " / ".join(clean(", ".join(v for v in (l.get("city"), l.get("country")) if v)) for l in locs)
        remote = str(x.get("telecommuting")).lower() == "true"
        yield {
            "title": x.get("title"), "company": d.get("name") or slug,
            "location": ("Remote — " if remote else "") + where, "desc": x.get("description") or "",
            "type": job_type(x.get("employment_type")), "posted": parse_date(x.get("published_on") or x.get("created_at")),
            "apply": x.get("url") or x.get("shortlink"), "source": "Workable", "remote": remote,
        }


def iter_feeds(cfg, log):
    f = cfg["feeds"]
    jobs = []
    plan = []
    if f.get("remotive"):
        plan.append(("Remotive", lambda: feed_remotive(cfg)))
    if f.get("jobicy"):
        plan.append(("Jobicy", lambda: feed_jobicy(cfg)))
    for b in f.get("greenhouse", []):
        name, eu = (b[:-3], True) if b.endswith("@eu") else (b, False)
        plan.append((f"greenhouse:{b}", lambda n=name, e=eu: feed_greenhouse(n, e)))
    for b in f.get("lever", []):
        plan.append((f"lever:{b}", lambda n=b: feed_lever(n)))
    for b in f.get("ashby", []):
        plan.append((f"ashby:{b}", lambda n=b: feed_ashby(n)))
    for b in f.get("breezy", []):
        plan.append((f"breezy:{b}", lambda n=b: feed_breezy(n)))
    for b in f.get("workable", []):
        plan.append((f"workable:{b}", lambda n=b: feed_workable(n)))
    if (f.get("micro1") or {}).get("referral_code"):
        plan.append(("micro1", lambda c=f["micro1"]["referral_code"]: feed_micro1(c)))

    def run(item):
        name, fn = item
        try:
            return name, list(fn()), None
        except Exception as e:  # one dead feed never stops the run
            return name, [], f"{type(e).__name__}: {e}"[:200]

    with ThreadPoolExecutor(max_workers=6) as ex:
        for name, items, err in ex.map(run, plan):
            log["feeds"][name] = err or f"{len(items)} listings read"
            jobs.extend(items)
    return jobs


def page_description(url):
    """Some boards (Breezy) list jobs without the description: read it off the job page."""
    if "breezy.hr/p/" not in url:
        return ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            page = r.read(600_000).decode("utf-8", "replace")
        m = re.search(r'(?is)<div class="description">(.*?)</div>\s*</div>', page)
        return m.group(1) if m else ""
    except Exception:
        return ""


def company_name(raw, cfg):
    raw = clean(raw)
    return cfg.get("company_names", {}).get(raw, raw.replace("-", " ").title() if raw.islower() else raw)


def cmd_fetch(cfg, log):
    live = load(F_LIVE, {"listings": []})
    archive = load(F_ARCHIVE, {"listings": []})
    have = {j["id"] for j in live["listings"]} | {j["id"] for j in archive["listings"]}
    have_keys = {dupe_key(j["title"], j["company"]) for j in live["listings"]}
    t0 = today()
    added, turned = 0, {}
    per_co = {}
    for j in live["listings"]:
        if j.get("added") == t0.isoformat() and j.get("origin") == "feed":
            per_co[j["company"]] = per_co.get(j["company"], 0) + 1
    feed = sorted(iter_feeds(cfg, log), key=lambda x: x.get("posted") or dt.date.min, reverse=True)
    for x in feed:
        title, apply = clean(x.get("title")), clean(x.get("apply"))
        if not title or not apply:
            continue
        posted = x.get("posted")
        max_age = cfg.get("company_max_age_days", {}).get(company_name(x.get("company"), cfg), cfg["feed_max_age_days"])
        if not posted or (t0 - posted).days > max_age:
            continue  # feeds carry old evergreen posts; only fresh roles go on the board
        jid = make_id(apply, title, x.get("company"))
        if jid in have:
            continue
        ok, why = location_ok(x.get("location"), x.get("desc"), strict=x["source"] in AGGREGATORS)
        if ok and (blocked(apply, cfg) or search_page(apply)):
            ok, why = False, "sign-up-to-apply board"
        if ok and re.search(r"\b(" + OTHER_COUNTRIES + r")\b", title, re.I) and not re.search(r"nigeria|africa|worldwide|global", title, re.I):
            ok, why = False, "title names another country or region"
        if ok and re.search(r"\b(english to|to english)\b", title, re.I) and not re.search(r"yoruba|igbo|hausa|pidgin|french", title, re.I):
            ok, why = False, "translation role for another language"
        if ok and x.get("source", "").startswith("micro1"):
            if x.get("location_type") in ("hybrid", "onsite", "on-site"):
                ok, why = False, "micro1 role is not fully remote"
            elif FOREIGN_LANGUAGE.search(title):
                ok, why = False, "needs another language"
            elif LICENSED.search(title):
                ok, why = False, "needs a licence or clearance from another country"
        if ok and x.get("source") == "Workable" and not x.get("remote"):
            ok, why = False, "Workable role is not remote"
        if ok and re.search(cfg["title_exclude"], title, re.I):
            ok, why = False, "outside the board's scope"
        if x.get("deadline") and x["deadline"] < t0:
            ok, why = False, "deadline passed"
        if not ok:
            turned[why] = turned.get(why, 0) + 1
            continue
        company = company_name(x.get("company"), cfg)
        k = dupe_key(title, company)
        if k in have_keys:
            continue
        per_co[company] = per_co.get(company, 0) + 1
        cap = cfg.get("company_daily_caps", {}).get(company, cfg.get("feed_max_per_company", 4))
        if per_co[company] > cap:
            continue
        desc = x.get("desc") or page_description(apply)
        j = {
            "id": jid, "title": title, "company": company,
            "region": clean(x.get("location")) or "Worldwide",
            "type": x.get("type") or job_type(title, html_text(desc)[:600]),
            "experience": experience_from(desc, x.get("level", "")),
            "salary": x.get("salary") or salary_from(desc),
            "bullets": x.get("skills") or bullets_from_html(desc),
            "apply": apply, "posted": posted.isoformat(),
            "deadline": x["deadline"].isoformat() if x.get("deadline") else None,
            "checked": t0.isoformat(), "added": t0.isoformat(), "listed": t0.isoformat(),
            "source": x["source"], "origin": "feed", "ats_id": x.get("ats_id"),
            "family": MICRO1_FAMILY.get(x.get("domain") or "", ""),
        }
        if x.get("openings"):
            j["bullets"] = (j["bullets"] + [f"{x['openings']} openings"])[:4]
        finalise(j, cfg)
        live["listings"].append(j)
        have.add(jid); have_keys.add(k)
        added += 1
        log["added"].append(f"{title} — {company} ({x['source']})")
        if added >= cfg["feed_max_new_per_day"]:
            break
    log["turned_away"] = turned
    save(F_LIVE, live)
    print(f"fetch: {added} added; turned away: {sum(turned.values())}")


# ─────────────────────────────────────────────── link check and expiry

CLOSED_TEXT = re.compile(
    r"(no longer accepting applications|this job (has )?(expired|is closed|is no longer)|job (has been )?closed|"
    r"position (has been )?filled|no longer available|this (posting|position|vacancy) (has )?(closed|expired)|"
    r"job not found|page not found|the job you are looking for|applications? (are|is) (now )?closed|"
    r"listing (has )?expired|vacancy (has )?(closed|expired))", re.I)


_MICRO1_CACHE = {}


def micro1_ids(code):
    if code not in _MICRO1_CACHE:
        _MICRO1_CACHE[code] = {x["ats_id"] for x in feed_micro1(code)}
    return _MICRO1_CACHE[code]


def ats_open_ids(j):
    """For ATS links, ask the board API whether the job is still listed."""
    u = j["apply"]
    try:
        m = re.search(r"greenhouse\.io/([^/]+)/jobs/(\d+)", u)
        if m:
            eu = ".eu." in u
            ids = {str(x["id"]) for x in get_json(
                f"https://boards-api{'.eu' if eu else ''}.greenhouse.io/v1/boards/{m.group(1)}/jobs")["jobs"]}
            return m.group(2) in ids
        m = re.search(r"jobs\.lever\.co/([^/]+)/([0-9a-f-]{36})", u)
        if m:
            return m.group(2) in {x["id"] for x in get_json(f"https://api.lever.co/v0/postings/{m.group(1)}?mode=json")}
        m = re.search(r"jobs\.ashbyhq\.com/([^/]+)/([0-9a-f-]{36})", u)
        if m:
            slug = urllib.parse.unquote(m.group(1))
            ids = {x["id"] for x in get_json(f"https://api.ashbyhq.com/posting-api/job-board/{urllib.parse.quote(slug)}")["jobs"]}
            return m.group(2) in ids
        m = re.search(r"jobs\.micro1\.ai/post/([0-9a-f-]{36})\?referralCode=([0-9a-f-]{36})", u)
        if m:
            return m.group(1) in micro1_ids(m.group(2))
        m = re.search(r"https?://([^.]+)\.breezy\.hr/p/([0-9a-f]+)", u)
        if m:
            return m.group(2) in {x["id"] for x in get_json(f"https://{m.group(1)}.breezy.hr/json")}
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return False
        return None
    except Exception:
        return None
    return "n/a"


def link_state(j):
    """True = open, False = closed, None = could not tell (kept)."""
    if not j["apply"].startswith("http"):
        return None
    a = ats_open_ids(j)
    if a is not True and a is not False and a != "n/a":
        a = None
    if a in (True, False):
        return a
    try:
        req = urllib.request.Request(j["apply"], headers={"User-Agent": UA, "Accept": "text/html"})
        with urllib.request.urlopen(req, timeout=25) as r:
            body = r.read(400_000).decode("utf-8", "replace")
            final = r.geturl()
        if re.search(r"[?&]error=true|/jobs/?$|/careers/?$", final) and final.rstrip("/") != j["apply"].rstrip("/"):
            return False
        return not CLOSED_TEXT.search(html_text(body)[:60000])
    except urllib.error.HTTPError as e:
        return False if e.code in (404, 410) else None
    except Exception:
        return None


def cmd_check(cfg, log):
    live = load(F_LIVE, {"listings": []})
    archive = load(F_ARCHIVE, {"listings": []})
    t0 = today().isoformat()
    with ThreadPoolExecutor(max_workers=8) as ex:
        states = list(ex.map(link_state, live["listings"]))
    keep = []
    for j, s in zip(live["listings"], states):
        if s is False:
            j["closed"] = t0
            j["closed_reason"] = "employer page closed"
            archive["listings"].append(j)
            log["closed"].append(f"{j['title']} — {j['company']}")
        else:
            if s is True:
                j["checked"] = t0
            keep.append(j)
    live["listings"] = keep
    save(F_LIVE, live)
    save(F_ARCHIVE, archive)
    unknown = sum(1 for s in states if s is None)
    print(f"check: {len(states)} checked, {len(log['closed'])} closed, {unknown} could not be read (kept)")


def board_date(j):
    """The date a card shows and sorts by: when the employer posted it, else when it
    first went on the board. The daily link check never moves it."""
    return j.get("posted") or j.get("listed") or j["added"]


def expiry(j, cfg):
    """The day a listing comes off the board."""
    if j.get("deadline"):
        return dt.date.fromisoformat(j["deadline"])
    if j.get("posted"):
        return dt.date.fromisoformat(j["posted"]) + dt.timedelta(days=cfg["max_age_days"])
    return dt.date.fromisoformat(j.get("listed") or j["added"]) + dt.timedelta(days=cfg["max_age_unknown_days"])


def cmd_expire(cfg, log):
    live = load(F_LIVE, {"listings": []})
    archive = load(F_ARCHIVE, {"listings": []})
    t0 = today()
    keep = []
    for j in live["listings"]:
        if expiry(j, cfg) < t0:
            j["closed"] = t0.isoformat()
            j["closed_reason"] = "deadline passed" if j.get("deadline") else "older than the board's age limit"
            archive["listings"].append(j)
            log["expired"].append(f"{j['title']} — {j['company']}")
        else:
            keep.append(j)
    live["listings"] = keep
    # Archive only needs ids long enough to stop feeds re-adding a closed role.
    cutoff = (t0 - dt.timedelta(days=120)).isoformat()
    archive["listings"] = [a for a in archive["listings"] if (a.get("closed") or "") >= cutoff]
    save(F_LIVE, live)
    save(F_ARCHIVE, archive)
    print(f"expire: {len(log['expired'])} came off; {len(keep)} live")


def cmd_remove(arg):
    live = load(F_LIVE, {"listings": []})
    archive = load(F_ARCHIVE, {"listings": []})
    n = norm_url(arg)
    hit = [j for j in live["listings"] if j["id"] == arg or norm_url(j["apply"]) == n]
    if not hit:
        sys.exit(f"remove: no live listing matches {arg}")
    for j in hit:
        j["closed"] = today().isoformat()
        j["closed_reason"] = "removed by hand"
        archive["listings"].append(j)
    live["listings"] = [j for j in live["listings"] if j not in hit]
    save(F_LIVE, live)
    save(F_ARCHIVE, archive)
    print(f"remove: took down {len(hit)} listing(s)")


# ─────────────────────────────────────────────────────────────── render

def e(s):
    return html.escape(str(s), quote=True)


def card(j, cfg):
    pd_ = dt.date.fromisoformat(j["posted"]) if j.get("posted") else None
    ld = dt.date.fromisoformat(board_date(j))
    when = ("Posted " if pd_ else "Listed ") + f"{ld.day} {ld.strftime('%b')}"
    dl = ""
    if j.get("deadline"):
        d = dt.date.fromisoformat(j["deadline"])
        dl = f'<span class="jb-dl" data-closes="{d.isoformat()}">Closes {d.day} {d.strftime("%b")}</span>'
    link = j["apply"]
    href = link if link.startswith("http") else ("mailto:" + link if "@" in link else link)
    bullets = "".join(f"<li>{e(b)}</li>" for b in j["bullets"])
    src = e(j.get("source") or "")
    chk = dt.date.fromisoformat(j["checked"]) if j.get("checked") else None
    chk_txt = f" · Link checked {chk.day} {chk.strftime('%b')}" if chk else ""
    return f'''<article class="jb-card" id="job-{j["id"]}" data-id="{j["id"]}" data-family="{e(j["family"])}" data-date="{ld.isoformat()}" data-q="{e((j["title"] + " " + j["company"] + " " + j["family"] + " " + " ".join(j["bullets"])).lower())}">
<header class="jb-head"><span class="jb-fam">{e(j["family"])}</span><span class="jb-when"><time datetime="{ld.isoformat()}">{when}</time>{dl}</span></header>
<h3 class="jb-title"><span class="jb-e" aria-hidden="true">👨🏽‍💻</span>{e(j["title"])}</h3>
<dl class="jb-meta">
<div><dt><span aria-hidden="true">🏢</span> Company</dt><dd>{e(j["company"])}</dd></div>
<div><dt><span aria-hidden="true">🌍</span> Remote Region</dt><dd>{e(j["region"])}</dd></div>
<div><dt><span aria-hidden="true">🇳🇬</span> Nigeria Eligible</dt><dd class="jb-yes">YES</dd></div>
<div><dt><span aria-hidden="true">⏰</span> Job Type</dt><dd>{e(j["type"])}</dd></div>
<div><dt><span aria-hidden="true">💼</span> Experience</dt><dd>{e(j["experience"])}</dd></div>
<div><dt><span aria-hidden="true">💰</span> Salary</dt><dd>{e(j["salary"])}</dd></div>
</dl>
<h4 class="jb-h"><span aria-hidden="true">📌</span> What they&#8217;re looking for</h4>
<ul class="jb-list">{bullets}</ul>
<div class="jb-why"><b>Why it made the board</b><p>{e(j["why"])}</p></div>
<div class="jb-actions">
<a class="jb-apply" href="{e(href)}" target="_blank" rel="noopener nofollow"><span>Apply here</span><span class="jb-arrow" aria-hidden="true">→</span></a>
<button class="jb-copy" type="button" data-copy="{j["id"]}" hidden>Copy post</button>
<a class="jb-ask" data-ask="{j["id"]}" href="https://wa.me/{cfg["phone"].lstrip("+")}" target="_blank" rel="noopener">Unsure you qualify? Ask ERJ</a>
</div>
<p class="jb-src">Source: {src}{chk_txt}</p>
</article>'''


def render(cfg):
    live = load(F_LIVE, {"listings": []})["listings"]
    t0 = today()
    live = [j for j in live if expiry(j, cfg) >= t0]
    key = lambda j: (board_date(j), j.get("added", ""))
    live.sort(key=key, reverse=True)
    cards = "\n".join(card(j, cfg) for j in live)
    payload = {j["id"]: {"t": copy_text(j, cfg), "title": j["title"], "company": j["company"]} for j in live}
    fams = [f for f in FAMILIES if any(j["family"] == f for j in live)]
    counts = {f: sum(1 for j in live if j["family"] == f) for f in fams}
    chips = '<button class="jb-chip is-on" type="button" data-fam="">All <span>' + str(len(live)) + "</span></button>" + "".join(
        f'<button class="jb-chip" type="button" data-fam="{e(f)}">{e(f)} <span>{counts[f]}</span></button>' for f in fams)
    empty = '<p class="jb-empty">No live roles right now. New ones are added every morning.</p>' if not live else ""
    data = json.dumps(payload, ensure_ascii=False).replace("</", "<\\/")
    block = (
        "<!--JOBS:START (generated by jobboard.py — edit jobs/data, not this block)-->\n"
        f'<div class="jb-chips" role="group" aria-label="Filter by field">{chips}</div>\n'
        f'<div class="jb-grid" id="jbGrid">\n{cards}\n</div>\n{empty}\n'
        f'<script type="application/json" id="jbData">{data}</script>\n'
        "<!--JOBS:END-->")
    with open(PAGE, encoding="utf-8") as f:
        page = f.read()
    out = re.sub(r"<!--JOBS:START.*?<!--JOBS:END-->", lambda m: block, page, flags=re.S)
    out = re.sub(r'(<b id="jbCount">)[^<]*(</b>)', rf"\g<1>{len(live)}\g<2>", out)
    out = re.sub(r'(<b id="jbFields">)[^<]*(</b>)', rf"\g<1>{len(fams)}\g<2>", out)
    out = re.sub(r'(<time id="jbUpdated" datetime=")[^"]*(">)[^<]*(</time>)',
                 rf"\g<1>{t0.isoformat()}\g<2>{fmt_date(t0)}\g<3>", out)
    return page, out, len(live)


def touch_sitemap():
    """Tell search engines the board changed today."""
    p = os.path.join(ROOT, "sitemap.xml")
    try:
        s = open(p, encoding="utf-8").read()
    except FileNotFoundError:
        return
    out = re.sub(r"(<loc>https://everythingremotejob\.com/jobs/</loc><lastmod>)[^<]*(</lastmod>)",
                 rf"\g<1>{today().isoformat()}\g<2>", s)
    if out != s:
        open(p, "w", encoding="utf-8").write(out)


def cmd_build(cfg, check=False):
    page, out, n = render(cfg)
    if check:
        if page != out:
            sys.exit("jobs/index.html is out of date: run python3 jobboard.py build")
        print("build: jobs/index.html is current")
        return
    if out != page:
        with open(PAGE, "w", encoding="utf-8") as f:
            f.write(out)
        touch_sitemap()
    print(f"build: {n} live listings rendered")


# ──────────────────────────────────────────────────────────────── main

def write_summary(log):
    """One-paragraph report used as the Action's commit message, so every run's
    result is readable in the repo history."""
    adds = log.get("added") or []
    micro = sum("micro1" in a for a in adds)
    errs = [f"{k}: {v}" for k, v in (log.get("feeds") or {}).items() if not str(v).endswith("listings read")]
    lines = [f"Job board: daily update — {len(adds)} added ({micro} micro1), "
             f"{len(log.get('closed') or [])} closed, {len(log.get('expired') or [])} expired"]
    if errs:
        lines += ["", "Feed errors:"] + [f"- {e}" for e in errs]
    feeds = log.get("feeds") or {}
    if "micro1" in feeds:
        lines += ["", f"micro1: {feeds['micro1']}"]
    path = os.environ.get("JOBBOARD_SUMMARY")
    if path:
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")


def print_log(log):
    """The run report goes to the Action log (Actions tab), not into the repo."""
    print("── run report ──")
    for k in ("feeds", "turned_away"):
        for a, b in log[k].items():
            print(f"{k}: {a}: {b}")
    for k in ("added", "closed", "expired"):
        for x in log[k]:
            print(f"{k}: {x}")
    for r in log.get("inbox") or []:
        for x in r["skipped"]:
            print(f"inbox turned away: {r['file']}: {x['title']}: {x['reason']}")


def main(argv):
    cfg = load(F_CONFIG, None)
    if cfg is None:
        sys.exit("missing jobs/data/config.json")
    cmd = argv[1] if len(argv) > 1 else "build"
    log = {"run": dt.datetime.now(WAT).isoformat(timespec="minutes"), "feeds": {}, "added": [],
           "closed": [], "expired": [], "turned_away": {}, "inbox": []}
    if cmd == "daily":
        log["inbox"] = cmd_inbox(cfg)
        if cfg["feeds"].get("enabled", True):
            cmd_fetch(cfg, log)
        cmd_check(cfg, log)
        cmd_expire(cfg, log)
        cmd_build(cfg)
        print_log(log)
        write_summary(log)
    elif cmd == "import":
        if len(argv) < 3:
            sys.exit("usage: jobboard.py import FILE.xlsx [--all]")
        win = None if "--all" in argv else cfg["sheet_window_days"]
        added, skipped = import_sheet(argv[2], cfg, window_days=win)
        print(f"import: {len(added)} added, {len(skipped)} turned away")
        cmd_expire(cfg, log)
        cmd_build(cfg)
    elif cmd == "inbox":
        cmd_inbox(cfg); cmd_expire(cfg, log); cmd_build(cfg)
    elif cmd == "fetch":
        cmd_fetch(cfg, log); cmd_build(cfg); print_log(log)
    elif cmd == "check":
        cmd_check(cfg, log); cmd_expire(cfg, log); cmd_build(cfg)
    elif cmd == "build":
        if "--check" in argv:
            cmd_build(cfg, check=True)
        else:
            cmd_expire(cfg, log); cmd_build(cfg)
    elif cmd == "micro1-import":
        pages = [json.load(open(f, encoding="utf-8")) for f in argv[2:]]
        rows = [x for p in pages for x in (p.get("data") or [])]
        global get_json
        get_json = lambda url, timeout=30, tries=3: {"data": rows, "total": len(rows)}
        only = dict(cfg, feeds={"micro1": cfg["feeds"]["micro1"]})
        cmd_fetch(only, log)
        cmd_expire(cfg, log)
        cmd_build(cfg)
        print_log(log)
        write_summary(log)
    elif cmd == "remove":
        cmd_remove(argv[2]); cmd_build(cfg)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
