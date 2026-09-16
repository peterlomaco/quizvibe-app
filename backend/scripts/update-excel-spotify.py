import sys, os, re, unicodedata
import openpyxl

XLSX = r"C:\Users\46725\OneDrive\Dokument\Lomaco 231023\AI\Quizvibe\Content\Music.xlsx"
APPLY = '--apply' in sys.argv

def norm(s):
    s = (s or '')
    s = s.replace('\u2014','-').replace('\u2013','-').replace('\u2019',"'")
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not (0x300 <= ord(c) <= 0x36f))
    return re.sub(r'[^a-z0-9]+',' ', s.lower()).strip()

# load the pasted list (desc | trackId)
pairs = {}
with open('spotify-list.txt', encoding='utf-8') as f:
    for line in f:
        t = line.strip()
        if not t or '|' not in t: continue
        desc, tid = t.rsplit('|',1)
        tid = tid.strip()
        if re.fullmatch(r'[A-Za-z0-9]{22}', tid):
            pairs[norm(desc)] = tid

# writable check
try:
    wb = openpyxl.load_workbook(XLSX)   # data_only=False -> safe to save
except PermissionError:
    print("LOCKED: Music.xlsx is open in Excel. Close it and re-run."); sys.exit(2)
ws = wb['Music']

filled=[]; already=[]; unmatched=set(pairs.keys())
for row in ws.iter_rows(min_row=2):
    desc = row[1].value
    if not isinstance(desc,str): continue
    key = norm(desc)
    if key not in pairs: continue
    unmatched.discard(key)
    cell = row[6]  # column G = Spotify(url)
    url = f"https://open.spotify.com/track/{pairs[key]}"
    if cell.value:
        already.append(f"{desc}  (has: {cell.value})")
    else:
        if APPLY: cell.value = url
        filled.append(f"{desc}  -> {pairs[key]}")

if APPLY:
    wb.save(XLSX)

print(f"=== {'APPLIED' if APPLY else 'DRY-RUN'} ===")
print(f"filled empty Spotify cells: {len(filled)}")
for x in filled: print("  +", x)
print(f"already had a Spotify url (SKIPPED): {len(already)}")
for x in already: print("  =", x)
print(f"list entries with NO matching Excel row: {len(unmatched)}")
for k in unmatched: print("  ?", k)
