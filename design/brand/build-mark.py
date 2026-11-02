"""Parametric builder for the QuizVibe Q mark, v2 (2026-11-02).

usage (from repo root):
  python -I design/brand/build-mark.py preview   -> design/logo-validation/mark-v2.html
  python -I design/brand/build-mark.py apply     -> rewrites the mark/logo SVGs (+ variants,
      in design/brand/ and design/logo-validation/) and quizvibe-mark-geometry.json;
      then run generate-rn-geometry.py for the app. apply only works on the v1
      files (it retargets their v1 viewBox/layout numbers) -- re-running it on
      v2 files is a no-op for the layout but still rewrites the geometry.

v2 spec (Peter's sketch 2026-11-02):
  - the ring ("O") is a closed circle, no slot, with a thinner stroke; the
    outer radius is kept so the silhouette stays the same size
  - the handle sits entirely OUTSIDE the ring along the 46.4 deg axis; the
    connector is gone
  - all three signal arcs sit entirely INSIDE the ring's inner edge

All coordinates use the master frame's units (the old viewBox was 965.46 x
1000); the final viewBox is a tight box around ring + handle.
"""
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_DIR = os.path.join(ROOT, 'design', 'logo-validation')

# Kept from v1.
RING_CX, RING_CY = 425.93, 523.93
RING_OUTER = 398.70
AXIS_DEG = 46.4          # handle axis (pointing down-right, y down)
ARC_BISECTOR_DEG = 311.0  # arcs open towards the upper right
ARC_SPANS = (89.5, 64.8, 41.8)  # innermost -> outermost, v1 values

DEFAULTS = dict(
    ring_w=80.0,         # ring stroke = handle width (Peter 2026-11-02, variant D; v1: 136.62)
    arc_w_ratio=0.65,    # arc stroke as a fraction of the ring stroke
    handle_gap_ratio=0.4,  # gap ring -> handle, as a fraction of the ring stroke
    handle_w=80.0,
    handle_len=200.0,
    handle_rx_ratio=0.3,   # corner radius as a fraction of handle width
    arc_offset_ratio=0.18,  # arc centre offset down-left, fraction of inner radius
    arc_radii=(1.0, 2.0, 3.0),  # relative radii innermost -> outermost
    arc_margin_ratio=0.5,  # free space arc -> ring inner edge, fraction of arc stroke
)


def f(v):
    return f'{v:.2f}'


def build(**overrides):
    """Build the mark and move it so its tight bounding box starts at (0, 0)
    (the app renders with viewBox `0 0 w h`)."""
    p = {**DEFAULTS, **overrides}
    first = _build(RING_CX, RING_CY, p)
    x0, y0 = first['viewBox'][:2]
    return _build(RING_CX - x0, RING_CY - y0, p)


def _build(cx, cy, p):
    R = RING_OUTER
    w = p['ring_w']
    ri = R - w
    # Ring: outer circle clockwise, inner counter-clockwise -> hole with nonzero fill.
    ring = (f'M {f(cx + R)} {f(cy)} A {f(R)} {f(R)} 0 1 1 {f(cx - R)} {f(cy)} '
            f'A {f(R)} {f(R)} 0 1 1 {f(cx + R)} {f(cy)} Z '
            f'M {f(cx + ri)} {f(cy)} A {f(ri)} {f(ri)} 0 1 0 {f(cx - ri)} {f(cy)} '
            f'A {f(ri)} {f(ri)} 0 1 0 {f(cx + ri)} {f(cy)} Z')

    # Handle: rounded rect along the axis, starting gap outside the ring.
    a = math.radians(AXIS_DEG)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    hw, hl = p['handle_w'], p['handle_len']
    rx = hw * p['handle_rx_ratio']
    d0 = R + w * p['handle_gap_ratio']
    sx, sy = cx + ux * d0, cy + uy * d0  # centre of the near end

    def pt(along, across):
        return sx + ux * along + nx * across, sy + uy * along + ny * across

    h2 = hw / 2
    seq = [
        ('M', pt(rx, -h2)), ('L', pt(hl - rx, -h2)), ('A', pt(hl, -h2 + rx)),
        ('L', pt(hl, h2 - rx)), ('A', pt(hl - rx, h2)), ('L', pt(rx, h2)),
        ('A', pt(0, h2 - rx)), ('L', pt(0, -h2 + rx)), ('A', pt(rx, -h2)),
    ]
    hp = []
    for cmd, (x, y) in seq:
        if cmd == 'A':
            hp.append(f'A {f(rx)} {f(rx)} 0 0 1 {f(x)} {f(y)}')
        else:
            hp.append(f'{cmd} {f(x)} {f(y)}')
    handle = ' '.join(hp) + ' Z'
    handle_corners = [pt(0, -h2), pt(0, h2), pt(hl, -h2), pt(hl, h2)]

    # Arcs: concentric, centre offset down-left of the ring centre, scaled so
    # the outermost arc clears the inner edge by the margin.
    aw = w * p['arc_w_ratio']
    b = math.radians(ARC_BISECTOR_DEG)
    o = ri * p['arc_offset_ratio']
    acx, acy = cx - math.cos(b) * o, cy - math.sin(b) * o
    limit = ri - aw * p['arc_margin_ratio']

    def max_dist(rad, span):
        # farthest point (incl. stroke + round caps) from the ring centre
        best = 0.0
        for i in range(61):
            t = b + math.radians(span) * (i / 60 - 0.5)
            x, y = acx + rad * math.cos(t), acy + rad * math.sin(t)
            best = max(best, math.hypot(x - cx, y - cy) + aw / 2)
        return best

    rel = p['arc_radii']
    lo, hi = 0.0, ri
    for _ in range(60):  # binary search the unit radius
        mid = (lo + hi) / 2
        if all(max_dist(mid * r, s) <= limit for r, s in zip(rel, ARC_SPANS)):
            lo = mid
        else:
            hi = mid
    unit = lo
    arcs = []
    for r_rel, span in zip(rel, ARC_SPANS):
        rad = unit * r_rel
        ro, rin, cap = rad + aw / 2, rad - aw / 2, aw / 2
        t0, t1 = b - math.radians(span) / 2, b + math.radians(span) / 2
        P = lambda r, t: (acx + r * math.cos(t), acy + r * math.sin(t))
        o0, o1, i1, i0 = P(ro, t0), P(ro, t1), P(rin, t1), P(rin, t0)
        large = 1 if span > 180 else 0
        arcs.append(
            f'M {f(o0[0])} {f(o0[1])} A {f(ro)} {f(ro)} 0 {large} 1 {f(o1[0])} {f(o1[1])} '
            f'A {f(cap)} {f(cap)} 0 0 1 {f(i1[0])} {f(i1[1])} '
            f'A {f(rin)} {f(rin)} 0 {large} 0 {f(i0[0])} {f(i0[1])} '
            f'A {f(cap)} {f(cap)} 0 0 1 {f(o0[0])} {f(o0[1])} Z')
    arcs.reverse()  # index 0 = outermost, as in v1

    # Checks.
    assert d0 > R, 'handle touches the ring'
    assert unit * rel[0] - aw / 2 > 0, 'innermost arc collapsed'
    assert all(max_dist(unit * r, s) <= limit + 0.01 for r, s in zip(rel, ARC_SPANS))

    xs = [cx - R, cx + R] + [c[0] for c in handle_corners]
    ys = [cy - R, cy + R] + [c[1] for c in handle_corners]
    x0, y0 = min(xs), min(ys)
    vb = (x0, y0, max(xs) - x0, max(ys) - y0)
    return dict(params=p, viewBox=vb, ring=ring, arcs=arcs, handle=handle,
                ring_center=(cx, cy), ring_inner=ri, arc_w=aw, arc_unit=unit)


GOLD_STOPS = [(0, '#FFE457'), (0.18, '#FEB221'), (0.36, '#EE9305'), (0.52, '#FDCE3F'),
              (0.62, '#FFF89C'), (0.78, '#FEB221'), (1, '#CB6A02')]


def mark_svg(m, uid, paint='metallic', height=116):
    x, y, vw, vh = m['viewBox']
    width = height * vw / vh
    paths = [m['ring'], *m['arcs'], m['handle']]
    geo = ''.join(f'<path d="{d}"/>' for d in paths)
    if paint == 'metallic':
        stops = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in GOLD_STOPS)
        defs = (f'<defs><linearGradient id="g{uid}" gradientUnits="userSpaceOnUse" '
                f'x1="{f(x)}" y1="{f(y)}" x2="{f(x + vw)}" y2="{f(y + vh)}">{stops}</linearGradient>'
                f'<linearGradient id="s{uid}" gradientUnits="userSpaceOnUse" x1="{f(x)}" y1="{f(y)}" '
                f'x2="{f(x + vw * 0.6)}" y2="{f(y + vh * 0.6)}"><stop offset="0" stop-color="#fff" '
                f'stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>'
                f'</linearGradient></defs>')
        body = (f'<g fill="#7A3E00" transform="translate(0 8)">{geo}</g>'
                f'<g fill="url(#g{uid})">{geo}</g><g fill="url(#s{uid})">{geo}</g>')
    else:
        defs, body = '', f'<g fill="{paint}">{geo}</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x)} {f(y)} {f(vw)} {f(vh)}" '
            f'width="{f(width)}" height="{f(height)}">{defs}{body}</svg>')


VARIANTS = [
    ('A', 'Ring = handtag 95 · bågar 0.5×', dict(ring_w=95, handle_w=95, arc_w_ratio=0.5)),
    ('B', 'Ring = handtag 95 · bågar 0.65×', dict(ring_w=95, handle_w=95, arc_w_ratio=0.65)),
    ('C', 'Ring = handtag 95 · bågar 0.8×', dict(ring_w=95, handle_w=95, arc_w_ratio=0.8)),
    ('D', 'Ring = handtag 80 · bågar 0.65×', dict(ring_w=80, handle_w=80, arc_w_ratio=0.65)),
]


def preview():
    wordmark = open(os.path.join(ROOT, 'design', 'brand', 'quizvibe-wordmark.svg'),
                    encoding='utf-8').read()
    cards = []
    uid = 0

    def card(title, mark_html_fn):
        rows = []
        for bg in ('#0B1220', '#000000', '#FFFFFF'):
            sizes = ''.join(f'<div class="cell">{mark_html_fn(h, bg)}<span>{h}</span></div>'
                            for h in (116, 83, 34, 24))
            rows.append(f'<div class="row" style="background:{bg}">{sizes}</div>')
        logo = (f'<div class="logo">{mark_html_fn(116, "#0B1220")}'
                f'<div class="wm">{wordmark}</div></div>')
        return f'<section><h2>{title}</h2>{"".join(rows)}{logo}</section>'

    v1 = open(os.path.join(ROOT, 'design', 'brand', 'quizvibe-mark.svg'), encoding='utf-8').read()
    v1 = v1.replace('<svg ', '<svg height="%s" ', 1)
    cards.append(card('Nuvarande master (design/brand)', lambda h, bg: v1 % h))
    for key, label, ov in VARIANTS:
        m = build(**ov)

        def fn(h, bg, m=m):
            nonlocal uid
            uid += 1
            paint = '#0B1220' if bg == '#FFFFFF' else ('metallic' if h >= 34 else '#F5A623')
            return mark_svg(m, uid, paint, h)
        cards.append(card(f'{key} — {label}', fn))

    html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Q mark v2</title><style>
:root{{color-scheme:dark}} body{{margin:0;background:#0B1220;color:#E6EAF2;
font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;padding:16px}}
h1{{font-size:22px;margin:0 0 4px}} p{{color:#9AA4B8;margin:0 0 16px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}}
section{{border:1px solid #24304A;border-radius:12px;overflow:hidden}}
h2{{font-size:16px;margin:0;padding:10px 12px}}
.row{{display:flex;align-items:flex-end;gap:18px;padding:12px}}
.cell{{display:flex;flex-direction:column;align-items:center;gap:4px}}
.cell span{{font-size:11px;color:#8892a6}}
.logo{{display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;background:#0B1220}}
.wm svg{{width:209px;height:auto}}
</style></head><body><h1>Q-märke v2 — varianter</h1>
<p>Tunn sluten ring, handtaget utanför ringen, alla tre bågar inuti. Storlekar = märkets höjd i pt.</p>
<div class="grid">{"".join(cards)}</div></body></html>'''
    out = os.path.join(OUT_DIR, 'mark-v2.html')
    open(out, 'w', encoding='utf-8', newline='\n').write(html)
    print('wrote', os.path.relpath(out, ROOT))


WORDMARK_H_IN_LOGO = 495.71   # 2090 x (185 / 780), composition B
LOGO_W, LOGO_GAP = 2200.0, 160.0
V1_MARK_VB_H, V1_LOGO_MARK_H = 1000.0, 1160.0


def logo_mark_height(m):
    """Mark height in the 2200-unit logo so the RING keeps its v1 size."""
    return V1_LOGO_MARK_H * m['viewBox'][3] / V1_MARK_VB_H


def _geometry_group(m, gid):
    names = ['ring', 'arc0', 'arc1', 'arc2', 'handle']
    ds = [m['ring'], *m['arcs'], m['handle']]
    inner = ''.join(f'<path id="{gid}-{n}" d="{d}"/>' for n, d in zip(names, ds))
    return f'<g id="{gid}-geometry">{inner}</g>'


def _retarget_mark(svg, m, gid):
    """Rewrite one mark <svg> block (geometry group, viewBox, gradients)."""
    import re
    _, _, vw, vh = m['viewBox']
    svg = re.sub(rf'<g id="{gid}-geometry">.*?</g>', _geometry_group(m, gid), svg, flags=re.S)
    svg = svg.replace('viewBox="0 0 965.46 1000.00"', f'viewBox="0 0 {f(vw)} {f(vh)}"')
    svg = svg.replace('x2="965.5" y2="1000.0"', f'x2="{vw:.1f}" y2="{vh:.1f}"')
    svg = svg.replace('x2="579.3" y2="600.0"', f'x2="{vw * 0.6:.1f}" y2="{vh * 0.6:.1f}"')
    svg = svg.replace('transform="translate(0 8.0)"', f'transform="translate(0 {vh * 0.008:.1f})"')
    return svg


def _retarget_logo(svg, m):
    import re
    _, _, vw, vh = m['viewBox']
    mh = logo_mark_height(m)
    mw = mh * vw / vh
    total_h = mh + LOGO_GAP + WORDMARK_H_IN_LOGO
    svg = svg.replace('viewBox="0 0 2200.00 1815.71"', f'viewBox="0 0 2200.00 {f(total_h)}"', 1)
    svg = svg.replace('<svg x="540.03" y="0.00" width="1119.93" height="1160.00"',
                      f'<svg x="{f((LOGO_W - mw) / 2)}" y="0.00" width="{f(mw)}" height="{f(mh)}"')
    svg = svg.replace('<svg x="55.00" y="1320.00"', f'<svg x="55.00" y="{f(mh + LOGO_GAP)}"')
    return _retarget_mark(svg, m, 'qvlm')


def apply():
    import json
    m = build()
    p = m['params']
    _, _, vw, vh = m['viewBox']
    for base in ('design/brand', 'design/logo-validation'):
        d = os.path.join(ROOT, *base.split('/'))
        files = ['quizvibe-mark.svg', 'quizvibe-logo.svg'] + [
            'variants/' + n for n in os.listdir(os.path.join(d, 'variants'))
            if n.startswith(('quizvibe-mark', 'quizvibe-logo'))]
        for name in files:
            path = os.path.join(d, *name.split('/'))
            svg = open(path, encoding='utf-8').read()
            svg = _retarget_logo(svg, m) if 'logo' in name else _retarget_mark(svg, m, 'qvm')
            assert 'connector' not in svg, name
            open(path, 'w', encoding='utf-8', newline='').write(svg)
            print('wrote', os.path.relpath(path, ROOT))
    cx, cy = m['ring_center']
    geo = {
        'version': 2,
        'viewBox': [0, 0, round(vw, 2), round(vh, 2)],
        'ring': {'cx': round(cx, 2), 'cy': round(cy, 2), 'outer': RING_OUTER,
                 'inner': round(m['ring_inner'], 2), 'w': p['ring_w'], 'closed': True},
        'arcs': {'w': round(m['arc_w'], 2), 'unitRadius': round(m['arc_unit'], 2),
                 'relRadii': list(p['arc_radii']), 'spans': list(ARC_SPANS),
                 'bisectorDeg': ARC_BISECTOR_DEG, 'offsetRatio': p['arc_offset_ratio'],
                 'marginRatio': p['arc_margin_ratio']},
        'handle': {'axisDeg': AXIS_DEG, 'w': p['handle_w'], 'len': p['handle_len'],
                   'gapRatio': p['handle_gap_ratio'], 'rxRatio': p['handle_rx_ratio']},
        'logo': {'markHeight': round(logo_mark_height(m), 2), 'gap': LOGO_GAP, 'width': LOGO_W},
    }
    out = os.path.join(ROOT, 'design', 'brand', 'quizvibe-mark-geometry.json')
    open(out, 'w', encoding='utf-8', newline='\n').write(json.dumps(geo, indent=1) + '\n')
    print('wrote', os.path.relpath(out, ROOT))


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'preview':
        preview()
    elif len(sys.argv) > 1 and sys.argv[1] == 'apply':
        apply()
    else:
        m = build()
        print('viewBox', [round(v, 2) for v in m['viewBox']], 'inner', round(m['ring_inner'], 2),
              'arc unit', round(m['arc_unit'], 2))
