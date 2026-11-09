#!/usr/bin/env python3
"""Merge per-page extraction JSON into one workbook.

Usage: build_xlsx.py WORKDIR OUT.xlsx [--min-confidence 0.8]

Reads WORKDIR/schema.json, WORKDIR/manifest.json and WORKDIR/extractions/*.json.
Writes sheets: Records, Needs review, Sources, Schema, plus OUT.csv beside it.
"""
import argparse, csv, json, sys
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

AMBER = PatternFill("solid", fgColor="FFF2CC")
HEAD = PatternFill("solid", fgColor="1F2937")


def put(ws, row, col, value):
    """Write a value; text is always stored as text so '=1+1' never becomes a formula."""
    c = ws.cell(row=row, column=col)
    if isinstance(value, str):
        c.value = value
        c.data_type = "s"
    else:
        c.value = value
    return c


def header(ws, names):
    for i, n in enumerate(names, 1):
        c = ws.cell(row=1, column=i, value=n)
        c.font, c.fill = Font(bold=True, color="FFFFFF"), HEAD
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(names))}1"


def widths(ws, cap=48):
    for col in ws.columns:
        w = max((len(str(c.value)) for c in col if c.value is not None), default=8)
        ws.column_dimensions[col[0].column_letter].width = min(cap, max(10, w + 2))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("workdir")
    ap.add_argument("out")
    ap.add_argument("--min-confidence", type=float, default=0.8)
    a = ap.parse_args()
    w = Path(a.workdir)

    schema = json.loads((w / "schema.json").read_text())
    cols = [c["name"] for c in schema["columns"]]
    manifest = json.loads((w / "manifest.json").read_text())
    by_id = {m["id"]: m for m in manifest}

    rows, problems = [], []
    for f in sorted((w / "extractions").glob("*.json")):
        try:
            d = json.loads(f.read_text())
        except json.JSONDecodeError as e:
            problems.append(f"{f.name}: invalid JSON ({e})")
            continue
        pid = d.get("id") or f.stem
        if pid not in by_id:
            problems.append(f"{f.name}: id {pid} not in manifest")
            continue
        by_id[pid]["status"] = "done"
        by_id[pid]["model"] = d.get("model", "")
        by_id[pid]["page_notes"] = d.get("notes", "")
        for n, r in enumerate(d.get("rows", []), 1):
            vals = r.get("values", {})
            extra = [k for k in vals if k not in cols]
            if extra:
                problems.append(f"{f.name} row {n}: unknown columns {extra} ignored")
            conf = r.get("confidence")
            conf = 0.0 if conf is None else float(conf)
            flagged = set(r.get("uncertain_fields", []))
            rows.append({
                "vals": [vals.get(c, "") for c in cols],
                "src": by_id[pid]["source"], "page": pid, "row": n,
                "conf": conf, "flagged": flagged,
                "review": conf < a.min_confidence or bool(flagged),
                "note": r.get("note", ""), "model": d.get("model", ""),
            })

    for m in manifest:
        if m["status"] == "pending":
            problems.append(f"{m['id']} ({m['source']}): never transcribed")
        elif m["status"] == "unreadable":
            problems.append(f"{m['id']} ({m['source']}): file could not be opened; rescan or retype it")

    meta = ["Source file", "Page", "Row on page", "Confidence", "Needs review", "Model", "Note"]
    wb = Workbook()
    ws = wb.active
    ws.title = "Records"
    header(ws, cols + meta)
    rv = wb.create_sheet("Needs review")
    header(rv, cols + meta)

    def emit(sheet, i, r):
        for j, v in enumerate(r["vals"], 1):
            c = put(sheet, i, j, v)
            if cols[j - 1] in r["flagged"] or (r["review"] and not r["flagged"]):
                c.fill = AMBER
        for k, v in enumerate([r["src"], r["page"], r["row"], round(r["conf"], 2),
                               "YES" if r["review"] else "", r["model"], r["note"]], len(cols) + 1):
            put(sheet, i, k, v)

    i = j = 1
    for r in rows:
        i += 1
        emit(ws, i, r)
        if r["review"]:
            j += 1
            emit(rv, j, r)

    sj = wb.create_sheet("Sources")
    header(sj, ["Id", "Source file", "Status", "Model", "Page notes", "Duplicate of"])
    for n, m in enumerate(manifest, 2):
        for k, v in enumerate([m["id"], m["source"], m["status"], m.get("model", ""),
                               m.get("page_notes", "") or m.get("error", "") or m.get("note", ""),
                               m.get("duplicate_of", "")], 1):
            put(sj, n, k, v)

    sc = wb.create_sheet("Schema")
    header(sc, ["Column", "Type", "Description"])
    for n, c in enumerate(schema["columns"], 2):
        for k, v in enumerate([c["name"], c.get("type", "text"), c.get("description", "")], 1):
            put(sc, n, k, v)

    for sheet in (ws, rv, sj, sc):
        widths(sheet)
        for row in sheet.iter_rows(min_row=2):
            for c in row:
                c.alignment = Alignment(vertical="top", wrap_text=True)

    out = Path(a.out)
    wb.save(out)
    with open(out.with_suffix(".csv"), "w", newline="", encoding="utf-8-sig") as fh:
        cw = csv.writer(fh)
        cw.writerow(cols + meta)
        for r in rows:
            cw.writerow(r["vals"] + [r["src"], r["page"], r["row"], round(r["conf"], 2),
                                     "YES" if r["review"] else "", r["model"], r["note"]])

    summary = {"workbook": str(out), "rows": len(rows),
               "needs_review": sum(r["review"] for r in rows),
               "pages_done": sum(m["status"] == "done" for m in manifest),
               "pages_total": len(manifest), "problems": problems}
    print(json.dumps(summary, indent=2))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
