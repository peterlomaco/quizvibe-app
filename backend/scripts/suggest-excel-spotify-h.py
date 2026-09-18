"""
Fill Music.xlsx column H ("Spotify url Claude") with SUGGESTED Spotify URLs for
song rows that are missing a canonical URL in column G ("Spotify (url)").

Peter reviews column H and promotes approved URLs into column G himself; this script
NEVER touches column G. Sibling of update-excel-spotify.py (which writes column G).

Input: a batch file of "desc | trackId" lines (default scripts/spotify-suggest-h.txt),
same format as spotify-list.txt. desc is matched (normalized) against column B.

A row is filled ONLY when column G is empty AND column H is empty (never overwrites).

Dry-run by default; --apply to save. Music.xlsx must be closed (else LOCKED error).
"""
import sys, re, unicodedata
import openpyxl

XLSX = r"C:\Users\46725\OneDrive\Dokument\Lomaco 231023\AI\Quizvibe\Content\Music.xlsx"
APPLY = '--apply' in sys.argv
OVERWRITE = '--overwrite' in sys.argv  # also replace an already-filled column H (G still never touched)
BATCH = 'spotify-suggest-h.txt'
for a in sys.argv[1:]:
    if a not in ('--apply', '--overwrite'):
        BATCH = a

def norm(s):
    s = (s or '')
    s = s.replace('\u2014', '-').replace('\u2013', '-').replace('\u2019', "'")
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not (0x300 <= ord(c) <= 0x36f))
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

# load the batch list (desc | trackId)
pairs = {}
with open(BATCH, encoding='utf-8') as f:
    for line in f:
        t = line.strip()
        if not t or '|' not in t:
            continue
        desc, tid = t.rsplit('|', 1)
        tid = tid.strip()
        if re.fullmatch(r'[A-Za-z0-9]{22}', tid):
            pairs[norm(desc)] = tid

try:
    wb = openpyxl.load_workbook(XLSX)
except PermissionError:
    print("LOCKED: Music.xlsx is open in Excel. Close it and re-run."); sys.exit(2)
ws = wb['Music']

filled = []; skip_g = []; skip_h = []; unmatched = set(pairs.keys())
for row in ws.iter_rows(min_row=2):
    desc = row[1].value            # column B
    if not isinstance(desc, str):
        continue
    key = norm(desc)
    if key not in pairs:
        continue
    unmatched.discard(key)
    gcell = row[6]                  # column G = Spotify (url)
    hcell = row[7]                  # column H = Spotify url Claude
    url = f"https://open.spotify.com/track/{pairs[key]}"
    if gcell.value:
        skip_g.append(f"{desc}  (G has: {gcell.value})")
    elif hcell.value and not OVERWRITE:
        skip_h.append(f"{desc}  (H has: {hcell.value})")
    else:
        if hcell.value and str(hcell.value) == url:
            skip_h.append(f"{desc}  (H already correct)")
            continue
        if APPLY:
            hcell.value = url
        filled.append(f"{desc}  -> {pairs[key]}")

if APPLY:
    wb.save(XLSX)

print(f"=== {'APPLIED' if APPLY else 'DRY-RUN'} (column H only; G untouched) ===")
print(f"filled column H: {len(filled)}")
for x in filled: print("  +", x)
print(f"skipped (column G already has a url): {len(skip_g)}")
for x in skip_g: print("  =", x)
print(f"skipped (column H already filled): {len(skip_h)}")
for x in skip_h: print("  ~", x)
print(f"batch entries with NO matching Excel row: {len(unmatched)}")
for k in unmatched: print("  ?", k)
