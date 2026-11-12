#!/usr/bin/env python3
"""
EVERYTHING REMOTE JOB — PUSH ALERT SENDER

Sends one push through OneSignal when a feed gains entries:

    python3 push-alerts.py jobs  <feed-before.json> jobs/data/latest.json
    python3 push-alerts.py posts <feed-before.json> blog/latest.json

Run by the two workflows straight after they publish. It compares the feed as
it was before the run with the feed now and tells everyone subscribed to that
topic about what is new. It sends nothing when nothing is new, when there is
no earlier feed to compare with, or when OneSignal is not set up.

The App ID is read from erj-config.js (push.onesignalAppId, public). The REST
API key comes only from the ONESIGNAL_REST_API_KEY environment variable, which
the workflows fill from the repository's Actions secrets.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://everythingremotejob.com"


def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def message(topic, fresh):
    n = len(fresh)
    if topic == "jobs":
        head = "1 new remote job open to Nigeria" if n == 1 else "%d new remote jobs open to Nigeria" % n
        lines = ["%s · %s" % (j["title"], j["company"]) for j in fresh[:3]]
        if n > 3:
            lines.append("and %d more" % (n - 3))
        return head, "\n".join(lines), SITE + "/jobs/?source=alert#board"
    if n == 1:
        return "New on the ERJ blog", fresh[0]["title"], SITE + fresh[0]["url"]
    lines = [p["title"] for p in fresh[:3]] + (["and %d more" % (n - 3)] if n > 3 else [])
    return "%d new posts on the ERJ blog" % n, "\n".join(lines), SITE + "/blog.html"


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ("jobs", "posts"):
        sys.exit(__doc__)
    topic, before, after = sys.argv[1], load(sys.argv[2]), load(sys.argv[3])
    if not before or not after:
        print("push-alerts: no earlier %s feed to compare with; nothing sent." % topic)
        return
    had = set(before.get("ids") or [])
    fresh = [x for x in (after.get("new") or []) if x["id"] not in had]
    if not fresh:
        print("push-alerts: nothing new for %s." % topic)
        return
    cfg = open(os.path.join(ROOT, "erj-config.js"), encoding="utf-8").read()
    m = re.search(r"onesignalAppId:\s*'([^']*)'", cfg)
    app_id, key = (m.group(1).strip() if m else ""), os.environ.get("ONESIGNAL_REST_API_KEY", "").strip()
    if not app_id or not key:
        print("push-alerts: OneSignal is not set up (App ID in erj-config.js, key in Actions secrets); %d new %s not pushed."
              % (len(fresh), topic))
        return
    head, body, url = message(topic, fresh)
    payload = {
        "app_id": app_id, "target_channel": "push",
        "filters": [{"field": "tag", "key": topic, "relation": "=", "value": "1"}],
        "headings": {"en": head}, "contents": {"en": body}, "url": url,
        "chrome_web_icon": SITE + "/icon192.png", "ttl": 86400, "web_push_topic": "erj-" + topic,
    }
    req = urllib.request.Request(
        "https://api.onesignal.com/notifications", data=json.dumps(payload).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json; charset=utf-8",
                 "Authorization": ("Key " if key.startswith("os_v2_") else "Basic ") + key})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            out = json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        # never fail the publishing workflow over an alert, and never print the key
        print("push-alerts: OneSignal answered %s: %s" % (e.code, e.read().decode("utf-8", "replace")[:300]))
        return
    except (urllib.error.URLError, OSError) as e:
        print("push-alerts: could not reach OneSignal: %s" % e)
        return
    print("push-alerts: %s sent (%s). id=%s errors=%s" % (topic, head, out.get("id"), out.get("errors")))


if __name__ == "__main__":
    main()
