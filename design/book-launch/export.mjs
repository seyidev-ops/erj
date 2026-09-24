// Renders every [data-export] piece in index.html to a file in ./out.
//
//   node export.mjs                       # uses config.js
//   node export.mjs --date "Sat 18 Oct 2026" --time "6:00 PM WAT" --url "..." --cta "Register free"
//
// Needs Playwright (global install is fine: NODE_PATH="$(npm root -g)" node export.mjs).
// All PNGs are written as 24-bit RGB (no alpha), which is what Zoom asks for.

import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "out");

const ZOOM_MAX_BYTES = 1024 * 1024;

// piece → list of renders. scale is the device pixel ratio.
const JOBS = [
  { id: "zoom-cover", file: "zoom-cover-640x200.png", scale: 1, maxBytes: ZOOM_MAX_BYTES },
  { id: "zoom-cover", file: "zoom-cover-1280x400.png", scale: 2, maxBytes: ZOOM_MAX_BYTES },
  { id: "flier-portrait", file: "flier-portrait-1080x1350.png", scale: 1 },
  { id: "flier-square", file: "flier-square-1080x1080.png", scale: 1 },
  // 794 px × 3.125 = 2481 px ≈ 210 mm at 300 dpi
  { id: "flier-a4", file: "flier-a4-300dpi.png", scale: 3.125 },
];

function parseArgs(argv) {
  const keys = { "--date": "date", "--time": "time", "--url": "url", "--cta": "cta" };
  const params = new URLSearchParams();
  for (let i = 0; i < argv.length; i += 2) {
    const k = keys[argv[i]];
    if (!k || argv[i + 1] === undefined) throw new Error(`Unknown or incomplete arg: ${argv[i]}`);
    params.set(k, argv[i + 1]);
  }
  return params;
}

// ---- Minimal PNG re-encoder: any 8-bit RGB/RGBA PNG → 8-bit RGB (24-bit) ----

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function toRgb24(png) {
  let pos = 8;
  let width, height, bitDepth, colorType;
  const idat = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("Interlaced PNG not supported");
    } else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Unsupported PNG: bitDepth ${bitDepth}, colorType ${colorType}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  const out = Buffer.alloc(height * (width * 3 + 1));

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
    // Artwork is fully opaque, so dropping alpha is lossless. Composite on black just in case.
    const o = y * (width * 3 + 1);
    out[o] = 0;
    for (let x = 0; x < width; x++) {
      const s = x * bpp;
      const alpha = bpp === 4 ? cur[s + 3] / 255 : 1;
      out[o + 1 + x * 3] = Math.round(cur[s] * alpha);
      out[o + 2 + x * 3] = Math.round(cur[s + 1] * alpha);
      out[o + 3 + x * 3] = Math.round(cur[s + 2] * alpha);
    }
    cur.copy(prev);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour, no alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(out, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Render ----

const params = parseArgs(process.argv.slice(2));
const pageUrl = pathToFileURL(path.join(here, "index.html")).href + (params.size ? `?${params}` : "");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const scales = [...new Set(JOBS.map((j) => j.scale))];
  for (const scale of scales) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: scale });
    await page.goto(pageUrl, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    for (const job of JOBS.filter((j) => j.scale === scale)) {
      const el = page.locator(`[data-export="${job.id}"]`);
      const png = toRgb24(await el.screenshot({ type: "png" }));
      const dest = path.join(outDir, job.file);
      fs.writeFileSync(dest, png);
      const kb = (png.length / 1024).toFixed(0);
      const over = job.maxBytes && png.length > job.maxBytes;
      console.log(`${over ? "✗" : "✓"} ${job.file}  ${png.readUInt32BE(16)}×${png.readUInt32BE(20)}  24-bit  ${kb} KB${over ? "  (over limit!)" : ""}`);
      if (over) process.exitCode = 1;
    }
    await page.close();
  }

  // Print-ready A4 PDF (vector text), using the @media print rules in index.html.
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(outDir, "flier-a4.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log("✓ flier-a4.pdf  A4");
} finally {
  await browser.close();
}
