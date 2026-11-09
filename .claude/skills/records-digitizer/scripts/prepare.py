#!/usr/bin/env python3
"""Stage a zip or folder of record images for transcription.

Usage: prepare.py INPUT WORKDIR [--max-edge 1800] [--max-files 2000]

INPUT   a .zip file or a directory (searched recursively)
WORKDIR new or empty directory; receives pages/, manifest.json, extractions/

Pages are EXIF-rotated, flattened to RGB and saved as JPEG so Claude's image
reader gets a uniform size. Exact duplicates (same pixels) are skipped and
listed in the manifest. Nothing is sent over the network.
"""
import argparse, hashlib, json, re, sys, zipfile
from pathlib import Path
from PIL import Image, ImageOps

IMG = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".gif"}
MAX_ZIP_BYTES = 4 * 1024**3  # refuse zip bombs


def natural(p: Path):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", str(p))]


def safe_extract(zpath: Path, dest: Path):
    total = 0
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            total += info.file_size
            if total > MAX_ZIP_BYTES:
                sys.exit("zip expands beyond 4 GB; refusing")
            target = (dest / info.filename).resolve()
            if dest.resolve() not in target.parents and target != dest.resolve():
                sys.exit(f"unsafe path in zip: {info.filename}")
        z.extractall(dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("workdir")
    ap.add_argument("--max-edge", type=int, default=1800)
    ap.add_argument("--max-files", type=int, default=2000)
    a = ap.parse_args()

    src, work = Path(a.input), Path(a.workdir)
    if work.exists() and any(work.iterdir()):
        sys.exit(f"{work} is not empty; choose a new WORKDIR")
    (work / "pages").mkdir(parents=True, exist_ok=True)
    (work / "extractions").mkdir(exist_ok=True)

    if src.is_file() and src.suffix.lower() == ".zip":
        root = work / "_unzipped"
        root.mkdir()
        safe_extract(src, root)
    elif src.is_dir():
        root = src
    else:
        sys.exit("INPUT must be a .zip file or a directory")

    files = sorted(
        (p for p in root.rglob("*")
         if p.is_file() and p.suffix.lower() in IMG
         and "__MACOSX" not in p.parts and not p.name.startswith("._")),
        key=natural,
    )
    if not files:
        sys.exit("no images found (supported: " + ", ".join(sorted(IMG)) + ")")
    if len(files) > a.max_files:
        sys.exit(f"{len(files)} images exceeds --max-files {a.max_files}; split the batch")

    manifest, seen = [], {}
    for n, p in enumerate(files, 1):
        pid = f"p{n:04d}"
        entry = {"id": pid, "source": str(p.relative_to(root)), "status": "pending"}
        try:
            with Image.open(p) as im:
                im = ImageOps.exif_transpose(im)
                if getattr(im, "n_frames", 1) > 1:
                    entry["note"] = f"{im.n_frames} frames; only the first was staged"
                im = im.convert("RGB")
                entry["orig_size"] = list(im.size)
                digest = hashlib.sha256(im.tobytes()).hexdigest()
                if digest in seen:
                    entry.update(status="duplicate", duplicate_of=seen[digest])
                    manifest.append(entry)
                    continue
                seen[digest] = pid
                im.thumbnail((a.max_edge, a.max_edge))
                out = work / "pages" / f"{pid}.jpg"
                im.save(out, "JPEG", quality=88)
                entry["page"] = f"pages/{pid}.jpg"
        except Exception as e:  # unreadable image: record it, keep going
            entry.update(status="unreadable", error=str(e)[:200])
        manifest.append(entry)

    (work / "manifest.json").write_text(json.dumps(manifest, indent=2))
    c = {s: sum(e["status"] == s for e in manifest) for s in ("pending", "duplicate", "unreadable")}
    print(json.dumps({"workdir": str(work), "images": len(manifest), **c}))


if __name__ == "__main__":
    main()
