# From Intent to Offer: book launch assets

The Zoom registration cover and advert fliers for the book launch.

## Files

- `Launch Assets.dc.html` + `support.js`: the original Claude Design file, unchanged. `support.js` is its runtime. The page loads React from a CDN, so it needs a network connection to render.
- `index.html`: a standalone static build of the same design, with no runtime. It shows all four pieces: the Zoom cover (1a), the portrait flier (1b), the square flier (1c) and the A4 flier (1d).
- `config.js`: the event date, time, registration URL and CTA label. Set them here once. You can also override them with URL params `?date=&time=&url=&cta=`.
- `export.mjs`: renders each piece from `index.html` to `out/` (gitignored).
- `assets/`: the logo, book cover, founder photo and fonts. Both HTML files use them.

## Export

```sh
NODE_PATH="$(npm root -g)" node export.mjs
# or override details without editing config.js:
NODE_PATH="$(npm root -g)" node export.mjs --date "Sat 18 Oct 2026" --time "6:00 PM WAT" --url "everythingremotejob.com/launch"
```

All PNGs are 24-bit RGB with no alpha channel, as Zoom requires. The Zoom covers are checked against the 1024 KB limit.

| File | Size |
|---|---|
| `zoom-cover-640x200.png` | 640 × 200 (Zoom's suggested size) |
| `zoom-cover-1280x400.png` | 1280 × 400 (Zoom's maximum width) |
| `flier-portrait-1080x1350.png` | Instagram portrait |
| `flier-square-1080x1080.png` | Square |
| `flier-a4-300dpi.png` | 2481 × 3509 (A4 at 300 dpi) |
| `flier-a4.pdf` | A4 print PDF with vector text |

## Still to fill in

- The launch date, time and registration link are placeholders.
- Confirm whether registration is free. If it isn't, change `ctaLabel`.
