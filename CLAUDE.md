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
  validator is what keeps that text in line with canon. `erj-facts.js`
  (the `data-erj="..."` renderer described in the README) exists but is
  **not currently loaded by any page** and no page uses `data-erj`
  attributes. Don't assume a page updates itself when canon changes.
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

Changing an image's content needs a **new filename**, not an overwrite.
Open Graph / Twitter images must stay evergreen: no cohort numbers or dates.

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
  `erj-buttons.css`.
- Third-party code is vendored (`cvscan/vendor/`, `cvbuilder/vendor/`); don't
  add CDN dependencies for app logic.
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
- Scroll reveals: `.reveal` blocks are visible by default. Only
  `erj-product.js` hides one (class `.pre`) after measuring it off-screen.
  Never reintroduce CSS that hides content until JS un-hides it; that is
  what caused the blank-page glitch. The same `.reveal` rules are inlined
  in several root pages as well as `product.css`, so change them everywhere.
- The store (`register.html`) is grouped DIY / DWY / DFY. A new product
  goes into the right group, and each card's `h3` is the product name.
- WhatsApp prefill text lives in `ERJ_CONFIG.messages`; don't inline new
  copies in pages.
- Blog posts are scheduled by date (Africa/Lagos, WAT). Each post has one
  conversion job (diagnose, CV scan, Clinic, AUDIT, a named product).

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
