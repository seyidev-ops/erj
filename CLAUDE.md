# CLAUDE.md

Guidance for Claude Code when working in this repository. `README.md` is the
business and structure reference; this file covers how to change the code
safely.

## What this is

The static website for **Everything Remote Job (ERJ)**, served by GitHub Pages
at everythingremotejob.com (`CNAME`). Plain HTML/CSS/JS, no framework, no
package manager, no build step. Every file in the repo root is publicly
served, so treat everything you commit as published.

The history is all "Add files via upload": changes are made elsewhere and
uploaded. Keep diffs small and self-contained so they survive that workflow.

## The one command

```bash
python3 validate-facts.py          # must pass before every commit (exit 1 on failure)
python3 validate-facts.py --warn   # report only
```

Needs `python3` and `node` (it loads `erj-config.js` via node). The only CI is
`.github/workflows/sitemap.yml` (sitemap + this validator). To preview locally: `python3 -m http.server` from
the repo root (the service worker needs `http://localhost`, not `file://`).

## Commercial facts: canon

`erj-config.js` → `window.ERJ_CONFIG.canon` holds every price, cohort date,
product name, payment link, the diagnostic model, the official phone line,
published figures and credits, plus a `retired` list of banned terms.

- **Pages hard-code facts as real text** (for SEO and no-JS readers). The
  validator is what keeps that text in line with canon. No page renders
  facts from canon at runtime, so don't assume a page updates itself when
  canon changes.
- To change a price, date or product: edit canon, then grep for and update
  every page that states it, then run the validator.
- To retire a term: add it to `canon.retired`. Never blanket find-and-replace
  the word "four": the four-stage curriculum (Stages 1 to 4) is legitimate.
- `canon-ok` on a line exempts it from every check. Use rarely.
- The validator scans `.md` files too, including this one. Any naira figure,
  cohort number, retired term or `234…` phone number written in docs must
  agree with canon.

Validator scoping (see `validate-facts.py`): portal pages (`PORTAL` set) are
exempt from price and cohort checks; `blog.html`, `testimonials.html` and
`blog/**` are archives, so drift there only warns.

## Business rules the code must keep true

- **Five-Finger Model**, always five parts in this order: Capacity, Supply,
  Representation, Aim, Conversion. Never list the model without Capacity.
- **One phone number**: the official line in `canon.lines`. The founder's
  personal number must never appear in any file.
- Cold traffic goes to `starthere.html` / `diagnose/`, never straight to
  `register.html`.
- No guaranteed placement, timeline or salary estimates. "Remote" is never
  implied to mean Nigeria-eligible.
- The Self-Learn credit is always a **credit**, never a "discount".
  Struck-through prices only where `wasNaira` is a real separate-purchase total.
- Campaign dates live only on the pages that carry them and are removed when
  the campaign ends.
- When the commercial picture changes, update `README.md` in the same commit
  (the validator checks it names the current cohort, model and parts).

## Cache busting (easy to get wrong)

Shared assets are loaded with a `?v=YYYYMMDD<letter>` query, and `sw.js`
precaches specific versioned URLs.

When you change a shared JS/CSS file:
1. Bump its `?v=` in **every** page that loads it (grep for the filename;
   `blog/*/index.html` has ~140 copies of the nav/theme/track tags).
2. Update the matching entry in `SHELL` in `sw.js`.
3. Bump `CACHE` in `sw.js` (`erj-site-YYYYMMDD<letter>`).
4. Every `SHELL` entry must exist on disk. `install` swallows per-file errors,
   so a missing file fails silently rather than loudly. Check with:
   `grep -oP "'\K/[^']+(?=')" sw.js | while read u; do [ -e ".${u%%\?*}" ] || echo MISSING $u; done`

Changing an on-page image's content needs a **new filename**, not an overwrite.
Open Graph / Twitter images must stay evergreen: no cohort numbers or dates.
Link-preview cards are the exception: they are always `preview-<page>.jpg`
(1200 × 630), with **no version suffix** in the filename or in any page. A
replacement card overwrites the same file; afterwards ask Facebook's Sharing
Debugger and LinkedIn's Post Inspector to re-scrape the page. The Action
repoints uploaded pages that still name an old suffixed card, and the validator
fails on any page naming a preview image that does not exist.

Every new `sw.js` calls `skipWaiting()` once its shell is cached, so an
update takes over on the next request. Never add a `controllerchange` reload
or `clients.navigate()`: those, not the take-over, caused the white-out.
`offline.html` is self-contained (inline styles, real logo files) and
precached; keep it free of shared scripts so it renders with no network.

`sw.js` also has `PRIVATE_PATHS` (never cached) and `NO_SW_HOSTS`
(analytics bypass). Add new private pages to `PRIVATE_PATHS`.

## Layout

- Root `*.html`: public pages (`index`, `starthere`, `register` = store and
  basket, `free`, `earlybird`, `testimonials`, `blog`, legal) and private
  surfaces (`login`, `dashboard`, `participant`, `admin*`, `instructor*`,
  `blog-admin`, `erj-surge-console`).
- Directory pages use `<dir>/index.html`: `diagnose/` (diagnostic + PDF
  report), `capacityscan/`, `cvscan/`, `cvbuilder/` (the CV Engine app),
  and product pages (`selflearn/`, `foundationtraining/`, `jobapplication/`,
  `innercircle/`, `masterclass/`, `fromintenttooffer/`).
  `cvbuilder.html` is the public sales page; `cvbuilder/` is the gated tool.
- Shared modules in root: `erj-config.js` (canon + capture config),
  `erj-nav.js`, `erj-theme.js`, `erj-track.js`, `erj-capture.js`,
  `erj-product.js`, `erj-schema.js`, `erj-cart.js`, `erj-passcode.js`,
  `erj-ascend.js`, `erj-private-protection.js`, `product.css`,
  `erj-buttons.css`, the site-wide visual layer `erj-alive.css` +
  `erj-alive.js` (loaded last on every page except `blog/**`), and the
  Horizon design system `erj-future.css` + `erj-future.js` (after the alive
  tags on every page; `blog/post.css` imports the CSS for every post) with
  `erj-future-home.css` for the home page only.
  `erj-world.js` draws a soft grey Earth behind public pages (not `blog/**`,
  portals or tools). The home page sets `window.ERJ_WORLD.stations` so the
  scroll flies the camera (orbit, Nigeria, the hiring world, home); other
  pages get a quiet globe in the first screen. A station with `anchor`
  fits the globe into that element (the home hero uses `#hsGlobe`); `turn`
  rotates it steadily and `spots` lights hiring cities as they come round. It is a fixed canvas at
  `z-index:-1`, redraws only on scroll or while a move settles, and is
  decorative: no page may depend on it. The link-preview cards use the same
  globe.
- `erj-alerts.js` is the alert bell: topic `jobs` on `jobs/index.html`, topic
  `posts` on `blog.html` (`<span data-erj-alerts data-topic="…">`; `="icon"`
  for the small one). The feeds are `jobs/data/latest.json` (`jobboard.py`)
  and `blog/latest.json` (`generate-blog-archive.py`, published posts only).
  With `ERJ_CONFIG.push.onesignalAppId` filled, alerts go through OneSignal:
  its script is the one allowed CDN dependency, loaded only for people who
  use the bell; its worker is `push/onesignal/OneSignalSDKWorker.js` in its
  own scope; the two workflows run `push-alerts.py` after publishing, which
  pushes to devices tagged with the topic. The REST API key exists only as
  the `ONESIGNAL_REST_API_KEY` Actions secret, never in a file. With the App
  ID empty, or that script blocked, `sw.js` (`checkAlerts`) does it on the
  device: in the background where the browser allows Periodic Background
  Sync for the installed app, otherwise when the site is opened. Keep the
  panel's wording honest about which one a device gets. `sw.js` keeps the
  `erj-alerts-v1` cache across updates.
- Third-party code is vendored (`cvscan/vendor/`, `cvbuilder/vendor/`); don't
  add CDN dependencies for app logic.
- `foundationtraining/motion/` is the page's motion graphic, built the Null
  Motion way: one 1920×1080 (or 1080×1920 with `?v` / a tall frame) scene on a
  single paused GSAP timeline (`window.__timelines.root`, vendored
  `gsap.min.js`). The page embeds it in an iframe; `?render` turns off
  scaling and autoplay so a headless browser can seek it frame by frame for
  MP4 export. Its facts (stages, assets, class times, fee) are the page's:
  change them together. No cohort numbers or dates in it.
  Its sound is `score.m4a`, an original score synthesised for this film
  (no samples, no third-party audio). It is off until the viewer taps
  Sound, plays through Web Audio (no `<audio>` element or file link) and
  follows the timeline clock. Cue times in the score match the timeline:
  retime both together. Never publish the rendered MP4s on the site.
- `blog/<slug>/index.html`: static, canonical post pages. `blog.html` is the
  in-browser reader (query form `?p=` is blocked in `robots.txt`).

## Conventions

- Theme: `data-theme="night"|"day"` on `<html>`, stored in
  `localStorage['rjt-theme']`. Brand tokens: night `#000000`, day `#FAFAF8`,
  orange `#FF5722`, day accent `#E8470F`, small day text `#AD350A`.
  Fonts are self-hosted in `fonts/` (Space Grotesk display, Inter body).
- Use the supplied logo files (`erj-mark-*`, `erj-lockup-*`). Never redraw
  the logo.
- Private pages carry `<meta name="robots" content="noindex">` and are
  **not** `Disallow`ed in `robots.txt` (a blocked URL's noindex is never read).
- New public pages must be added to `sitemap.xml` by hand. Blog posts are
  added automatically by `generate-sitemap.py` (run by
  `.github/workflows/sitemap.yml` on push to `main` and daily at 00:05 WAT);
  run it locally with `python3 generate-sitemap.py`. The validator fails if a
  published post is missing.
- The blog archive (`blog/index.html`) is generated the same way by
  `generate-blog-archive.py` from `blog.html`; the validator fails if a post
  page is missing from it. `blog.html` belongs at the root, never in `blog/`.
- Countdowns (`[data-deadline]`, handled in `erj-product.js`) can roll onto a
  next gate: `data-next-deadline`, `-label`, `-date`, `-for`, and
  `data-next-from` to delay the switch. Keep cohort numbers out of `data-next-*`
  text; the validator checks every "Cohort N" against canon.
- Scroll reveals: `.reveal` blocks are visible by default. Only
  `erj-product.js` hides one (class `.pre`) after measuring it off-screen.
  Never reintroduce CSS that hides content until JS un-hides it; that is
  what caused the blank-page glitch. Since October 2026 `.reveal.pre` only moves a
  block (transform); it never sets opacity:0, and nothing may start at
  opacity:0 waiting for a `forwards` animation. `validate-facts.py` check 12
  fails the build if either comes back. Large animated layers (glows,
  sweeps, drifting blobs) run on desktop widths only: on phones they starve
  the GPU and Chrome paints blank tiles mid-scroll. The same `.reveal` rules are inlined
  in several root pages as well as `product.css`, so change them everywhere.
- The alive layer (`erj-alive.css/.js`) adds a scroll progress bar, a
  drifting light behind each page's first section, glowing accent words in
  `h1/h2 em`, lit and tilted photo frames, and hover feedback on cards.
  Portals and tools carry `<html data-alive="lite">` (no hero light). It is
  decorative only: no page may depend on it. New pages get the same two
  tags before `</head>` and `</body>`.
- Horizon (`erj-future.css`) is the site's look: colour tokens, the canvas
  (`html::before/::after`), the floating glass menu dock, lit buttons, glass
  cards, chip labels, horizon dividers and the footer. It loads
  render-blocking (a normal `<link>`, not the print/onload trick) so the old
  look never flashes. The dock floats 10px down, so `body` carries a 12px
  transparent top border; anything pinned under the menu needs the same
  allowance (see `.jb-pin`). `erj-future.js` only adds pointer light and
  magnetic buttons on wide screens with a fine pointer; nothing depends on
  it. Its card list and the CSS card list should name the same classes.
- Photos of the founder are `photo-seyi-<pose>.webp` (suit, welcome, invite,
  thumbsup, typing, headset, desk). A new photo gets a new name; delete the
  file it replaces so no residue ships.
- The store (`register.html`) is grouped DIY / DWY / DFY. A new product
  goes into the right group, and each card's `h3` is the product name.
- WhatsApp prefill text lives in `ERJ_CONFIG.messages`; don't inline new
  copies in pages.
- The job board (`jobs/index.html`) is generated: the block between
  `<!--JOBS:START-->` and `<!--JOBS:END-->` is rewritten by `jobboard.py`
  from `jobs/data/listings.json`. Edit the page chrome freely; edit listings
  through the data, the inbox or `jobboard.py remove`, never by hand.
- The Launchpad (`masterclass/index.html`, the URL is kept) runs every Saturday
  at 4:00 PM WAT. Its countdown computes the next Saturday in the browser, so
  no date is edited by hand; the Zoom registration link must be for a
  recurring meeting. Older blog posts still say "Clinic" and are left as the
  archive they are.
- Blog posts are scheduled by date (Africa/Lagos, WAT). Each post has one
  conversion job (diagnose, CV scan, Launchpad, a named product).
- AUDIT (a private review of someone's search) is only for Foundation Training
  participants and above. Free routes that used to say "send AUDIT" (job
  listings, the diagnosis, Start Here, Free For You) now point to the
  Launchpad, where CVs are audited live. The job listing footer lives in
  `TEMPLATE` in `jobboard.py`; change it there, then run `jobboard.py build`.

## Security reality

There is no backend. Accounts, sessions, progress and blog drafts all live
in `localStorage` (`rjm_users`, `rjm_session`, `rjm_*`), and login, admin
and instructor checks run in the browser. Passcodes in `erj-passcode.js`
are a convenience gate, not security.

- **Never** add credentials, passwords, access codes, personal emails or
  personal phone numbers to any file, including in comments ("a comment
  explaining a code was removed still publishes the code").
- Don't describe any of these gates as secure in copy or comments.
- Real access control would require a server; flag it rather than
  pretending to solve it client-side.

## Repo hygiene

- Don't commit internal notes, patch logs, test reports or old versioned
  copies of files. The README is the only narrative doc besides this file.
- Keep `CNAME` in the root.
