#!/usr/bin/env python3
"""
Dump Content/Music.xlsx -> backend/scripts/music-portfolio.json

Regenerates the flat snapshot the TS import scripts read. The Excel lives outside
the repo (OneDrive); pass its path as argv[1] or rely on the default below.

Columns (A-O): Item typ | Beskrivning | Ar | Paket 1/2/3 | Spotify(url) |
YT ja/nej | YT-klipp #1/2/3 | Hints ja/nej | inbasecatalogue | region | Parent control
"""
import json
import sys
import os

DEFAULT_XLSX = r"C:\Users\46725\OneDrive\Dokument\Lomaco 231023\AI\Quizvibe\Content\Music.xlsx"


def main() -> None:
    import openpyxl

    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    ws = wb["Music"]
    rows = [r for r in ws.iter_rows(values_only=True)][1:]  # skip header
    rows = [r for r in rows if any(c is not None for c in r)]

    def s(v):
        if v is None:
            return None
        v = str(v).strip()
        return v or None

    out = []
    for r in rows:
        pkgs = [p.strip() for p in (r[3], r[4], r[5]) if isinstance(p, str) and p.strip()]
        year = None
        if r[2] not in (None, ""):
            try:
                year = int(str(r[2]).strip())
            except ValueError:
                year = None  # non-numeric year -> treated as missing, flagged later
        out.append(
            {
                "desc": s(r[1]),
                "year": year,
                "pkgs": pkgs,
                "spotify": s(r[6]),
                "yt": (s(r[7]) or "").lower() or None,
                "yt1": s(r[8]),
                "yt2": s(r[9]),
                "yt3": s(r[10]),
                "hints": (s(r[11]) or "").lower() or None,
                "inbase": s(r[12]),
                "region": s(r[13]),
                "parent": s(r[14]),
            }
        )

    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "music-portfolio.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"Wrote {len(out)} rows -> {dest}")


if __name__ == "__main__":
    main()
