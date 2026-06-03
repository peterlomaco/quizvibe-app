#!/usr/bin/env python3
"""
QuizVibe Logo/Trademark Blur Pipeline
======================================
Detects brand logos and trademarks in quiz images using OwL-v2 (zero-shot
object detection via HuggingFace) and applies Gaussian blur or pixelation
over detected regions.

WORKFLOW (recommended):
  1. python blur_logos.py --scan --limit 10   # quick smoke-test on 10 images
  2. python blur_logos.py --scan              # full scan → detections.json
  3. python blur_logos.py --review            # open HTML review in browser
  4. edit backend/output/logo-blur-detections.json  → set "blur": false on any false positives
  5. python blur_logos.py --blur              # apply blur → backend/output/logo-blur/*.webp
  6. manual QA: compare originals vs blurred, then copy/replace as needed

Single-pass (skips manual review step):
  python blur_logos.py --scan --blur --review

Key options:
  --threshold FLOAT   confidence cutoff (default 0.08; lower = more detections)
  --method            gaussian | pixelate (default: gaussian)
  --blur-radius INT   Gaussian blur radius px (default: 22)
  --margin FLOAT      expand bbox by this fraction (default: 0.12)
  --limit INT         only process first N images (for testing)
  --inplace           DANGER: overwrite source files in assets/quiz-images/
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[3]   # quizvibe-app/
DEFAULT_INPUT = REPO_ROOT / "assets" / "quiz-images"
DEFAULT_OUTPUT = REPO_ROOT / "backend" / "output" / "logo-blur"
DEFAULT_DETECTIONS = REPO_ROOT / "backend" / "output" / "logo-blur-detections.json"
DEFAULT_REVIEW = REPO_ROOT / "backend" / "output" / "logo-blur-review.html"

# ---------------------------------------------------------------------------
# Detection queries  (text prompts passed to OwL-v2)
# ---------------------------------------------------------------------------

# 6 queries: ~12s/image on CPU with owlvit-base-patch32.
# Covers visual logos that OCR misses (shield crests, swooshes, embroidered marks).
# Text-based trademarks (RANGERS, HESS, Adidas wordmark) are handled by --ocr.
LOGO_QUERIES = [
    "brand logo",
    "sports team logo crest badge on jersey",
    "manufacturer logo on clothing",
    "sponsor logo on sports gloves",
    "logo embroidered on sports equipment",
    "advertising sponsor logo",
    "ice hockey team logo on chest",
]

# ---------------------------------------------------------------------------
# Detection
# ---------------------------------------------------------------------------

def load_detector(model_id: str) -> object:
    """Load OwL-v2 pipeline (downloads ~600 MB on first run, cached after)."""
    try:
        import torch
        from transformers import pipeline as hf_pipeline
    except ImportError as exc:
        sys.exit(
            f"Missing dependency: {exc}\n"
            "Run: pip install -r backend/scripts/logo-blur/requirements.txt"
        )

    device = 0 if __import__("torch").cuda.is_available() else -1
    device_name = f"GPU (cuda:{device})" if device >= 0 else "CPU"
    print(f"Loading {model_id} on {device_name}…")
    if device < 0:
        print("  (No CUDA GPU detected — CPU inference is ~5-15 s/image)")

    detector = hf_pipeline(
        "zero-shot-object-detection",
        model=model_id,
        device=device,
    )
    print("Model ready.\n")
    return detector


def _run_detector_on_pil(detector, img_rgb, queries: list[str], threshold: float) -> list[dict]:
    """Run detector on a PIL image, return raw detection dicts."""
    raw = detector(img_rgb, candidate_labels=queries, threshold=threshold)
    return [
        {
            "label": r["label"],
            "score": round(float(r["score"]), 4),
            "box": [r["box"]["xmin"], r["box"]["ymin"], r["box"]["xmax"], r["box"]["ymax"]],
            "blur": True,
        }
        for r in raw
    ]


def detect_in_image(
    detector,
    image_path: Path,
    queries: list[str],
    threshold: float,
    tiles: int = 1,
) -> tuple[list[dict], int, int]:
    """
    Run detection on one image, optionally with tiled sub-regions.
    tiles=1  → single full-image pass (original behaviour)
    tiles=2  → full image + 2×2 overlapping crop tiles (catches small logos like boot swooshes)
    Returns (detections, width, height).
    """
    from PIL import Image

    with Image.open(image_path) as img:
        img_rgb = img.convert("RGB")
        w, h = img_rgb.size

    all_dets = _run_detector_on_pil(detector, img_rgb, queries, threshold)

    if tiles >= 2:
        # Split into a tiles×tiles grid with 20% overlap between neighbours
        overlap = 0.20
        cols = tiles
        rows = tiles
        tile_w = int(w / cols * (1 + overlap))
        tile_h = int(h / rows * (1 + overlap))

        for row in range(rows):
            for col in range(cols):
                x0 = int(col * w / cols)
                y0 = int(row * h / rows)
                x1 = min(w, x0 + tile_w)
                y1 = min(h, y0 + tile_h)

                tile_img = img_rgb.crop((x0, y0, x1, y1))
                tile_dets = _run_detector_on_pil(detector, tile_img, queries, threshold)

                # Translate tile-local coordinates back to full-image coordinates
                for d in tile_dets:
                    bx1, by1, bx2, by2 = d["box"]
                    d["box"] = [bx1 + x0, by1 + y0, bx2 + x0, by2 + y0]
                    all_dets.append(d)

    # Deduplicate overlapping boxes across full-image + tile passes
    all_dets = _nms(all_dets, iou_threshold=0.4)

    return all_dets, w, h


def _iou(a: list[int], b: list[int]) -> float:
    """Intersection over Union for two [xmin, ymin, xmax, ymax] boxes."""
    ix1 = max(a[0], b[0])
    iy1 = max(a[1], b[1])
    ix2 = min(a[2], b[2])
    iy2 = min(a[3], b[3])
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    inter = (ix2 - ix1) * (iy2 - iy1)
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0


def _nms(detections: list[dict], iou_threshold: float = 0.5) -> list[dict]:
    """Remove heavily-overlapping duplicate boxes (keep highest score)."""
    sorted_dets = sorted(detections, key=lambda d: d["score"], reverse=True)
    kept = []
    for det in sorted_dets:
        overlap = any(_iou(det["box"], k["box"]) > iou_threshold for k in kept)
        if not overlap:
            kept.append(det)
    return kept


# ---------------------------------------------------------------------------
# Scan phase
# ---------------------------------------------------------------------------

def run_scan(
    input_dir: Path,
    detections_path: Path,
    model_id: str,
    threshold: float,
    queries: list[str],
    limit: int | None,
    ids_file: Path | None = None,
    rescan_zero: bool = False,
    tiles: int = 1,
) -> dict:
    """Detect logos in all images. Resumes from existing detections.json."""
    if ids_file:
        # Filter to only filenames listed in ids_file (one filename per line)
        allowed = {l.strip() for l in ids_file.read_text(encoding="utf-8-sig").splitlines() if l.strip()}
        image_files = sorted(p for p in input_dir.glob("*.webp") if p.name in allowed)
        print(f"Filtering to {len(image_files)} images from {ids_file.name}")
    else:
        image_files = sorted(input_dir.glob("*.webp"))

    if not image_files:
        sys.exit(f"No .webp files found in {input_dir}")

    if limit:
        image_files = image_files[:limit]

    # Resume support: load any previously scanned results
    existing: dict = {}
    if detections_path.exists():
        with open(detections_path, encoding="utf-8") as f:
            prev = json.load(f)
            existing = prev.get("images", {})
        print(f"Resuming — {len(existing)} images already scanned.\n")

    detector = load_detector(model_id)

    images_data: dict = dict(existing)
    total = len(image_files)
    newly_scanned = 0
    t_all = time.time()

    for i, img_path in enumerate(image_files, 1):
        key = img_path.name

        if key in existing:
            n = len(existing[key].get("detections", []))
            # --rescan-zero: re-run images that previously returned 0 OwL detections
            if n == 0 and rescan_zero:
                print(f"[{i:4}/{total}] {key:<45} re-scanning (was 0 det)…")
            else:
                flag = "⚠" if n else "✓"
                print(f"[{i:4}/{total}] {key:<45} cached {n} det {flag}")
                continue

        t0 = time.time()
        try:
            dets, w, h = detect_in_image(detector, img_path, queries, threshold, tiles=tiles)
        except Exception as exc:
            print(f"[{i:4}/{total}] {key:<45} ERROR: {exc}")
            continue

        elapsed = time.time() - t0
        n = len(dets)
        flag = "⚠" if n else "✓"
        print(f"[{i:4}/{total}] {key:<45} {n} det  {elapsed:5.1f}s  {flag}")

        images_data[key] = {
            "path": str(img_path.relative_to(REPO_ROOT)).replace("\\", "/"),
            "width": w,
            "height": h,
            "detections": dets,
        }
        newly_scanned += 1

        # Save after every image so progress is not lost on interrupt
        _save_detections(detections_path, threshold, model_id, queries, images_data)

    total_elapsed = time.time() - t_all
    flagged = sum(1 for v in images_data.values() if v.get("detections"))
    total_det = sum(len(v.get("detections", [])) for v in images_data.values())

    print(f"\n{'─'*60}")
    print(f"Scan complete:  {newly_scanned} newly scanned, {len(images_data)} total")
    print(f"Flagged:        {flagged}/{len(images_data)} images")
    print(f"Detections:     {total_det} total")
    print(f"Time:           {total_elapsed/60:.1f} min")
    print(f"Saved to:       {detections_path}")

    return {"threshold": threshold, "model": model_id, "queries": queries, "images": images_data}


def _save_detections(path: Path, threshold: float, model_id: str, queries: list[str], images_data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            {"threshold": threshold, "model": model_id, "queries": queries, "images": images_data},
            f, indent=2,
        )


# ---------------------------------------------------------------------------
# OCR text detection  (second pass — finds team names, sponsor text, numbers)
# ---------------------------------------------------------------------------

def run_ocr_scan(
    input_dir: Path,
    detections_path: Path,
    min_score: float,
    limit: int | None,
    ids_file: Path | None,
) -> None:
    """
    Run EasyOCR on images and merge text detections into existing detections.json.
    Adds entries with label "text: <content>" — set blur=false in JSON to skip any.
    Install: pip install easyocr
    """
    try:
        import easyocr
        import numpy as np
        from PIL import Image as PILImage
    except ImportError as exc:
        sys.exit(f"Missing dependency: {exc}\nRun: pip install easyocr numpy Pillow")

    if ids_file:
        allowed = {l.strip() for l in ids_file.read_text(encoding="utf-8-sig").splitlines() if l.strip()}
        image_files = sorted(p for p in input_dir.glob("*.webp") if p.name in allowed)
        print(f"Filtering to {len(image_files)} images from {ids_file.name}")
    else:
        image_files = sorted(input_dir.glob("*.webp"))

    if limit:
        image_files = image_files[:limit]

    if not image_files:
        sys.exit(f"No images found in {input_dir}")

    # Load existing detections
    images_data: dict = {}
    meta: dict = {}
    if detections_path.exists():
        with open(detections_path, encoding="utf-8") as f:
            meta = json.load(f)
            images_data = meta.get("images", {})
        print(f"Loaded {len(images_data)} existing entries from detections.json\n")

    import torch
    gpu = torch.cuda.is_available()
    print(f"Loading EasyOCR on {'GPU' if gpu else 'CPU'} (first run downloads ~150 MB)…")
    reader = easyocr.Reader(["en", "sv"], gpu=gpu, verbose=False)
    print("EasyOCR ready.\n")

    total = len(image_files)
    t_all = time.time()

    for i, img_path in enumerate(image_files, 1):
        key = img_path.name

        # Skip if OCR already run (any detection starting with "text:")
        existing_dets = images_data.get(key, {}).get("detections", [])
        if any(d["label"].startswith("text:") for d in existing_dets):
            text_count = sum(1 for d in existing_dets if d["label"].startswith("text:"))
            print(f"[{i:4}/{total}] {key:<45} OCR cached ({text_count} text regions)")
            continue

        t0 = time.time()
        try:
            img_arr = np.array(PILImage.open(img_path).convert("RGB"))
            results = reader.readtext(img_arr)
        except Exception as exc:
            print(f"[{i:4}/{total}] {key:<45} ERROR: {exc}")
            continue

        new_dets = []
        for (bbox, text, score) in results:
            if score < min_score:
                continue
            xs = [int(p[0]) for p in bbox]
            ys = [int(p[1]) for p in bbox]
            new_dets.append({
                "label": f"text: {text}",
                "score": round(float(score), 4),
                "box": [min(xs), min(ys), max(xs), max(ys)],
                "blur": True,
            })

        # Merge into existing entry (keep OwL detections, add OCR on top)
        if key not in images_data:
            with PILImage.open(img_path) as im:
                w, h = im.size
            images_data[key] = {
                "path": str(img_path.relative_to(REPO_ROOT)).replace("\\", "/"),
                "width": w,
                "height": h,
                "detections": [],
            }

        images_data[key]["detections"].extend(new_dets)

        elapsed = time.time() - t0
        n = len(new_dets)
        flag = "⚠" if n else "✓"
        print(f"[{i:4}/{total}] {key:<45} +{n} text  {elapsed:.1f}s  {flag}")

        _save_detections(
            detections_path,
            meta.get("threshold", 0.08),
            meta.get("model", ""),
            meta.get("queries", []),
            images_data,
        )

    total_elapsed = time.time() - t_all
    text_images = sum(
        1 for v in images_data.values()
        if any(d["label"].startswith("text:") for d in v.get("detections", []))
    )
    print(f"\n{'─'*60}")
    print(f"OCR complete:   {text_images} images have text regions")
    print(f"Time:           {total_elapsed/60:.1f} min")
    print(f"Saved to:       {detections_path}")


# ---------------------------------------------------------------------------
# Face-protect mode  (blur everything except face)
# ---------------------------------------------------------------------------

_MP_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_detector/"
    "blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
)
_MP_MODEL_PATH = Path.home() / ".cache" / "mediapipe" / "blaze_face_short_range.tflite"


def _ensure_mp_model() -> Path:
    """Download the MediaPipe face-detector model once, cache in ~/.cache/mediapipe/."""
    if not _MP_MODEL_PATH.exists():
        import urllib.request
        _MP_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading MediaPipe face model (~1 MB) → {_MP_MODEL_PATH}")
        urllib.request.urlretrieve(_MP_MODEL_URL, _MP_MODEL_PATH)
    return _MP_MODEL_PATH


def _detect_face(img_rgb) -> tuple[int, int, int, int] | None:
    """
    Detect the primary face using the new MediaPipe Tasks API (mediapipe >= 0.10).
    Returns (x1, y1, x2, y2) pixel coords of the best face, or None.
    Falls back to OpenCV Haar cascade if mediapipe Tasks API is unavailable.
    """
    import numpy as np
    w, h = img_rgb.size
    arr = np.array(img_rgb)

    # ── MediaPipe Tasks API (mediapipe >= 0.10) ──────────────────────────────
    try:
        import mediapipe as mp
        model_path = _ensure_mp_model()
        base_opts = mp.tasks.BaseOptions(model_asset_path=str(model_path))
        options = mp.tasks.vision.FaceDetectorOptions(
            base_options=base_opts,
            min_detection_confidence=0.45,
        )
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=arr)
        with mp.tasks.vision.FaceDetector.create_from_options(options) as det:
            result = det.detect(mp_img)

        if result.detections:
            best = max(result.detections,
                       key=lambda d: d.bounding_box.width * d.bounding_box.height)
            bb = best.bounding_box
            return (
                max(0, bb.origin_x),
                max(0, bb.origin_y),
                min(w, bb.origin_x + bb.width),
                min(h, bb.origin_y + bb.height),
            )
        return None

    except Exception:
        pass  # fall through to OpenCV

    # ── OpenCV Haar cascade fallback ─────────────────────────────────────────
    try:
        import cv2
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        cascade = cv2.CascadeClassifier(cascade_path)
        faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        if len(faces) > 0:
            # Pick largest face
            x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            return int(x), int(y), int(x + fw), int(y + fh)
        return None
    except Exception:
        raise RuntimeError(
            "Face detection failed. Install MediaPipe (pip install mediapipe) "
            "or OpenCV (pip install opencv-python)."
        )


def _face_protect_image(
    img,
    face_box: tuple[int, int, int, int],
    blur_radius: int,
    head_margin: float,
    feather: int,
):
    """
    Blur the entire image, then composite the sharp face region back.
    Uses an elliptical feathered mask so the transition looks natural.
    """
    from PIL import ImageFilter, ImageDraw, Image as PILImage

    w, h = img.size
    x1, y1, x2, y2 = face_box
    fw = x2 - x1
    fh = y2 - y1

    # Expand box: more vertical space above for hair, generous sides
    mx = int(fw * head_margin)
    my = int(fh * head_margin)
    ex1 = max(0, x1 - mx)
    ey1 = max(0, y1 - int(my * 1.6))   # extra top for hair
    ex2 = min(w, x2 + mx)
    ey2 = min(h, y2 + int(my * 0.5))   # less bottom (chin)

    # Blur the whole image
    blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    # Soft elliptical mask — white = keep sharp, black = use blurred
    mask = PILImage.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((ex1, ey1, ex2, ey2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=feather))

    # Composite: sharp original where mask is bright, blurred elsewhere
    result = PILImage.composite(img, blurred, mask)
    return result


def run_face_protect(
    input_dir: Path,
    output_dir: Path,
    ids_file: Path | None,
    limit: int | None,
    blur_radius: int,
    head_margin: float,
    feather: int,
    inplace: bool,
) -> None:
    """
    For each image: detect the face, blur everything else.
    Falls back to full-image moderate blur when no face is detected.
    Install MediaPipe first: pip install mediapipe
    """
    from PIL import Image

    if ids_file:
        allowed = {l.strip() for l in ids_file.read_text(encoding="utf-8-sig").splitlines() if l.strip()}
        image_files = sorted(p for p in input_dir.glob("*.webp") if p.name in allowed)
        print(f"Filtering to {len(image_files)} images from {ids_file.name}")
    else:
        image_files = sorted(input_dir.glob("*.webp"))

    if limit:
        image_files = image_files[:limit]

    if not image_files:
        sys.exit(f"No images found in {input_dir}")

    dest_dir = input_dir if inplace else output_dir
    if inplace:
        print("⚠  --inplace: source files will be overwritten.")
    dest_dir.mkdir(parents=True, exist_ok=True)

    total = len(image_files)
    no_face_count = 0
    t_all = time.time()

    for i, img_path in enumerate(image_files, 1):
        t0 = time.time()
        img = Image.open(img_path).convert("RGB")

        face = _detect_face(img)

        if face:
            result = _face_protect_image(img, face, blur_radius, head_margin, feather)
            dest = dest_dir / img_path.name
            result.save(dest, "WEBP", quality=88)
            status = "face ✓"
        else:
            # No face detected — skip this image entirely, log for manual review
            no_face_count += 1
            status = "⚠ NO FACE — skipped (original unchanged)"
            # Do NOT write anything; original in input_dir is untouched

        elapsed = time.time() - t0
        print(f"[{i:4}/{total}] {img_path.name:<45} {status}  {elapsed:.1f}s")

    total_elapsed = time.time() - t_all
    print(f"\n{'─'*60}")
    print(f"Face-protect complete: {total - no_face_count} processed, {no_face_count} skipped (no face)")
    if no_face_count:
        print(f"⚠  Skipped images need manual review — use logo-detection --blur only for those.")
    print(f"Time:    {total_elapsed/60:.1f} min")
    print(f"Output:  {dest_dir}")


# ---------------------------------------------------------------------------
# Blur phase
# ---------------------------------------------------------------------------

def _blur_region(img, box: list[int], method: str, radius: int, margin: float):
    """Return a copy of img with one region blurred."""
    from PIL import ImageFilter

    w, h = img.size
    xmin, ymin, xmax, ymax = box

    # Expand box by margin fraction
    mx = int((xmax - xmin) * margin)
    my = int((ymax - ymin) * margin)
    xmin = max(0, xmin - mx)
    ymin = max(0, ymin - my)
    xmax = min(w, xmax + mx)
    ymax = min(h, ymax + my)

    if xmin >= xmax or ymin >= ymax:
        return img

    result = img.copy()
    region = result.crop((xmin, ymin, xmax, ymax))

    if method == "pixelate":
        rw, rh = region.size
        block_size = max(1, min(rw, rh) // 8)
        small = region.resize(
            (max(1, rw // block_size), max(1, rh // block_size)),
            resample=0,  # NEAREST
        )
        blurred = small.resize((rw, rh), resample=0)
    else:
        blurred = region.filter(ImageFilter.GaussianBlur(radius=radius))

    result.paste(blurred, (xmin, ymin))
    return result


def run_blur(
    input_dir: Path,
    output_dir: Path,
    detections_path: Path,
    blur_radius: int,
    margin: float,
    method: str,
    inplace: bool,
    ids_file: Path | None = None,
) -> None:
    """Apply blur to images with active detections."""
    from PIL import Image

    if not detections_path.exists():
        sys.exit(f"Detections file not found: {detections_path}\nRun --scan first.")

    with open(detections_path, encoding="utf-8") as f:
        data = json.load(f)

    images_data: dict = data.get("images", {})
    flagged = {k: v for k, v in images_data.items() if v.get("detections")}

    if ids_file:
        allowed = {l.strip() for l in ids_file.read_text(encoding="utf-8-sig").splitlines() if l.strip()}
        flagged = {k: v for k, v in flagged.items() if k in allowed}
        print(f"Filtering to {len(flagged)} images from {ids_file.name}")

    if not flagged:
        print("No detections in file — nothing to blur.")
        return

    dest_dir = input_dir if inplace else output_dir
    if inplace:
        print("⚠  --inplace: source files in assets/quiz-images/ will be overwritten.")
    dest_dir.mkdir(parents=True, exist_ok=True)

    blurred_count = 0
    skipped_count = 0
    region_count = 0

    for key, info in sorted(flagged.items()):
        active = [d for d in info["detections"] if d.get("blur", True)]
        if not active:
            skipped_count += 1
            continue

        src = input_dir / key
        if not src.exists():
            print(f"  MISSING SOURCE: {src}")
            continue

        img = Image.open(src).convert("RGB")
        for det in active:
            img = _blur_region(img, det["box"], method, blur_radius, margin)
            region_count += 1

        dest = dest_dir / key
        img.save(dest, "WEBP", quality=88)
        print(f"  {key:<45}  {len(active)} region(s) blurred  -> {dest.name}")
        blurred_count += 1

    print(f"\nBlur complete:  {blurred_count} images processed  ({region_count} regions)")
    print(f"Skipped:        {skipped_count} images (all detections had blur=false)")
    print(f"Output:         {dest_dir}")


# ---------------------------------------------------------------------------
# Review HTML
# ---------------------------------------------------------------------------

def run_review(detections_path: Path, review_path: Path, input_dir: Path) -> None:
    """Generate an interactive HTML review page with bounding-box overlays."""
    if not detections_path.exists():
        sys.exit(f"Detections file not found: {detections_path}\nRun --scan first.")

    with open(detections_path, encoding="utf-8") as f:
        data = json.load(f)

    images_data: dict = data.get("images", {})
    flagged = {k: v for k, v in images_data.items() if v.get("detections")}
    clean = {k: v for k, v in images_data.items() if not v.get("detections")}

    review_dir = review_path.parent

    def rel(img_path: Path) -> str:
        try:
            p = os.path.relpath(img_path, review_dir)
        except ValueError:
            p = str(img_path)
        return p.replace("\\", "/")

    cards_html = []
    for key, info in sorted(flagged.items(), key=lambda kv: -len(kv[1]["detections"])):
        img_abs = input_dir / key
        img_rel = rel(img_abs)
        w = info.get("width", 600)
        h = info.get("height", 400)
        boxes_js = json.dumps([
            {"label": d["label"], "score": d["score"], "box": d["box"], "active": d.get("blur", True)}
            for d in info["detections"]
        ])

        det_rows = "".join(
            f'<span class="det {"det-active" if d.get("blur", True) else "det-skip"}">'
            f'{d["label"]} <b>{d["score"]:.3f}</b>'
            f'{"" if d.get("blur", True) else " ✗"}'
            f"</span>"
            for d in info["detections"]
        )

        cards_html.append(f"""
<div class="card">
  <div class="card-head">
    <span class="fname">{key}</span>
    <span class="badge">{len(info["detections"])} detection(s)</span>
  </div>
  <div class="img-wrap">
    <img src="{img_rel}" loading="lazy"
         data-nw="{w}" data-nh="{h}" data-boxes='{boxes_js}'
         onload="drawBoxes(this)">
    <canvas class="overlay"></canvas>
  </div>
  <div class="dets">{det_rows}</div>
</div>""")

    clean_list = "".join(f"<span>{k}</span>" for k in sorted(clean))

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>QuizVibe — Logo Blur Review</title>
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: system-ui, -apple-system, sans-serif; background: #0d0d1a; color: #e0e0e0; padding: 16px 20px; }}
h1 {{ color: #4DA3FF; font-size: 22px; margin-bottom: 4px; }}
.summary {{ color: #888; font-size: 13px; margin-bottom: 20px; }}
code {{ background: #1a1a2e; border: 1px solid #333; border-radius: 3px; padding: 1px 5px; font-size: 12px; }}
.card {{ background: #111827; border: 1px solid #2a2a3e; border-radius: 8px; margin-bottom: 20px; padding: 12px; }}
.card-head {{ display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }}
.fname {{ font-weight: 600; color: #4DA3FF; font-size: 14px; }}
.badge {{ background: #F5A623; color: #000; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700; }}
.img-wrap {{ position: relative; display: inline-block; max-width: 100%; }}
.img-wrap img {{ display: block; max-width: 640px; max-height: 480px; width: auto; height: auto; border-radius: 4px; }}
.img-wrap canvas {{ position: absolute; top: 0; left: 0; pointer-events: none; }}
.dets {{ margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }}
.det {{ border-radius: 4px; padding: 3px 10px; font-size: 12px; border: 1px solid #333; }}
.det-active {{ background: rgba(245,166,35,0.12); border-color: #F5A623; color: #F5A623; }}
.det-skip {{ background: #1a1a2e; color: #555; text-decoration: line-through; }}
h2 {{ color: #444; font-size: 14px; margin: 28px 0 8px; text-transform: uppercase; letter-spacing: 1px; }}
.clean-grid {{ display: flex; flex-wrap: wrap; gap: 4px; }}
.clean-grid span {{ background: #111827; border: 1px solid #1e1e30; border-radius: 3px; padding: 2px 8px; font-size: 11px; color: #444; }}
.workflow {{ background: #0a1628; border: 1px solid #1a3050; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.8; color: #8bb; }}
.workflow b {{ color: #4DA3FF; }}
</style>
</head>
<body>
<h1>QuizVibe — Logo Blur Review</h1>
<div class="summary">
  Model: <code>{data.get("model", "?")}</code> &nbsp;·&nbsp;
  Threshold: <code>{data.get("threshold", "?")}</code> &nbsp;·&nbsp;
  <b style="color:#F5A623">{len(flagged)} flagged</b> &nbsp;·&nbsp;
  {len(clean)} clean &nbsp;·&nbsp;
  {sum(len(v["detections"]) for v in flagged.values())} total detections
</div>

<div class="workflow">
  <b>Next steps:</b><br>
  1. Review each card below — orange boxes = detected regions that will be blurred.<br>
  2. If a detection is a <b>false positive</b>, open <code>logo-blur-detections.json</code>
     and set <code>"blur": false</code> for that entry.<br>
  3. Run <code>python blur_logos.py --blur</code> to generate blurred images in
     <code>backend/output/logo-blur/</code>.<br>
  4. Compare originals vs blurred, then replace source files as needed.
</div>

{"".join(cards_html) if cards_html else '<p style="color:#555;padding:20px 0">No detections — all images are clean.</p>'}

<h2>Clean — no detections ({len(clean)} images)</h2>
<div class="clean-grid">{clean_list}</div>

<script>
function drawBoxes(img) {{
  const wrap = img.parentElement;
  const canvas = wrap.querySelector('canvas');
  const dw = img.clientWidth, dh = img.clientHeight;
  const nw = +img.dataset.nw, nh = +img.dataset.nh;
  canvas.width = dw; canvas.height = dh;
  const sx = dw / nw, sy = dh / nh;
  const ctx = canvas.getContext('2d');
  const boxes = JSON.parse(img.dataset.boxes);

  boxes.forEach(b => {{
    const [x1, y1, x2, y2] = b.box;
    const bx = x1*sx, by = y1*sy, bw = (x2-x1)*sx, bh = (y2-y1)*sy;
    const color = b.active ? '#F5A623' : '#555';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    if (b.active) {{
      ctx.fillStyle = 'rgba(245,166,35,0.12)';
      ctx.fillRect(bx, by, bw, bh);
    }}

    ctx.fillStyle = b.active ? '#F5A623' : '#555';
    ctx.font = 'bold 11px system-ui';
    const label = b.label + ' ' + b.score.toFixed(2);
    const ty = by > 16 ? by - 4 : by + bh + 12;
    ctx.fillText(label, bx + 2, ty);
  }});
}}

// Re-draw on resize (image layout changes)
let resizeTimer;
window.addEventListener('resize', () => {{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {{
    document.querySelectorAll('.img-wrap img').forEach(img => {{
      if (img.complete && img.naturalWidth) drawBoxes(img);
    }});
  }}, 150);
}});
</script>
</body>
</html>
"""

    review_path.parent.mkdir(parents=True, exist_ok=True)
    review_path.write_text(html, encoding="utf-8")
    print(f"Review HTML: {review_path}")


# ---------------------------------------------------------------------------
# Before/After compare HTML
# ---------------------------------------------------------------------------

def run_compare(
    original_dir: Path,
    blurred_dir: Path,
    compare_path: Path,
    logo_dir: Path | None = None,
) -> None:
    """
    Generate side-by-side HTML.
    Two-col mode: original | blurred
    Three-col mode (logo_dir set): original | face-protect | logo-only
    Only rows where at least one blurred version exists are shown.
    """
    review_dir = compare_path.parent

    def rel(p: Path) -> str:
        try:
            r = os.path.relpath(p, review_dir)
        except ValueError:
            r = str(p)
        return r.replace("\\", "/")

    # Collect all candidate keys from both blurred dirs
    keys = set()
    for p in blurred_dir.glob("*.webp"):
        keys.add(p.name)
    if logo_dir:
        for p in logo_dir.glob("*.webp"):
            keys.add(p.name)

    if not keys:
        sys.exit(f"No blurred images found in {blurred_dir}")

    rows = []
    for key in sorted(keys):
        orig = original_dir / key
        if not orig.exists():
            continue

        face_path = blurred_dir / key
        logo_path = (logo_dir / key) if logo_dir else None

        if logo_dir:
            # Three-column layout
            face_col = (f'<div class="col">'
                        f'<div class="tag face-tag">FACE-PROTECT</div>'
                        f'<img src="{rel(face_path)}" loading="lazy">'
                        f'</div>') if face_path.exists() else '<div class="col missing">no face-protect</div>'
            logo_col = (f'<div class="col">'
                        f'<div class="tag logo-tag">LOGO-ONLY</div>'
                        f'<img src="{rel(logo_path)}" loading="lazy">'
                        f'</div>') if (logo_path and logo_path.exists()) else '<div class="col missing">no logo-blur</div>'
            cols = f"""
    <div class="col">
      <div class="tag">ORIGINAL</div>
      <img src="{rel(orig)}" loading="lazy">
    </div>
    {face_col}
    {logo_col}"""
        else:
            if not face_path.exists():
                continue
            cols = f"""
    <div class="col">
      <div class="tag">ORIGINAL</div>
      <img src="{rel(orig)}" loading="lazy">
    </div>
    <div class="col">
      <div class="tag blurred-tag">BLURRED</div>
      <img src="{rel(face_path)}" loading="lazy">
    </div>"""

        rows.append(f"""
<div class="row">
  <div class="label">{key}</div>
  <div class="pair">{cols}
  </div>
</div>""")

    col_count = 3 if logo_dir else 2
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>QuizVibe — Blur Comparison</title>
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: system-ui, sans-serif; background: #0d0d1a; color: #e0e0e0; padding: 16px; }}
h1 {{ color: #4DA3FF; margin-bottom: 4px; font-size: 20px; }}
.summary {{ color: #888; font-size: 13px; margin-bottom: 8px; }}
.instructions {{ background: #0a1628; border: 1px solid #1a3050; border-radius: 6px;
  padding: 10px 14px; margin-bottom: 20px; font-size: 13px; color: #8bb; line-height: 1.7; }}
.instructions b {{ color: #4DA3FF; }}
.row {{ background: #111827; border: 1px solid #2a2a3e; border-radius: 8px;
  margin-bottom: 20px; padding: 10px 12px; }}
.label {{ color: #4DA3FF; font-size: 13px; font-weight: 600; margin-bottom: 8px; }}
.pair {{ display: flex; gap: 10px; }}
.col {{ flex: 1; min-width: 0; }}
.tag {{ font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #888;
  margin-bottom: 4px; text-transform: uppercase; }}
.face-tag {{ color: #4DA3FF; }}
.logo-tag {{ color: #F5A623; }}
.blurred-tag {{ color: #F5A623; }}
.col img {{ width: 100%; border-radius: 4px; display: block; }}
.missing {{ color: #444; font-size: 12px; padding-top: 24px; }}
</style>
</head>
<body>
<h1>QuizVibe — Blur Comparison ({col_count} versions)</h1>
<div class="summary">{len(rows)} images</div>
<div class="instructions">
  For each image, review all versions and tell Claude:<br>
  &bull; <b>Keep face-protect</b> — background blurred, face sharp<br>
  &bull; <b>Keep logo-only</b> — specific logos blurred, rest intact<br>
  &bull; <b>Remove</b> — neither version acceptable, delete from catalog<br>
  &bull; <b>Keep original</b> — no blur needed
</div>
{"".join(rows)}
</body>
</html>"""

    compare_path.parent.mkdir(parents=True, exist_ok=True)
    compare_path.write_text(html, encoding="utf-8")
    print(f"Compare HTML: {compare_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="QuizVibe logo/trademark blur pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, metavar="DIR",
                        help="source images dir (default: assets/quiz-images/)")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, metavar="DIR",
                        help="blurred images output dir")
    parser.add_argument("--detections", type=Path, default=DEFAULT_DETECTIONS, metavar="FILE",
                        help="JSON file for scan results")
    parser.add_argument("--review-path", type=Path, default=DEFAULT_REVIEW, metavar="FILE",
                        help="HTML review output path")
    parser.add_argument("--threshold", type=float, default=0.08, metavar="FLOAT",
                        help="minimum detection confidence (default: 0.08)")
    parser.add_argument("--blur-radius", type=int, default=22, metavar="INT",
                        help="Gaussian blur radius in pixels (default: 22)")
    parser.add_argument("--margin", type=float, default=0.12, metavar="FLOAT",
                        help="fractional bbox expansion (default: 0.12 = 12%%)")
    parser.add_argument("--model", type=str,
                        default="google/owlvit-base-patch32",
                        help="HuggingFace model ID (default: owlvit-base-patch32 ~30s/img CPU)")
    parser.add_argument("--method", choices=["gaussian", "pixelate"], default="gaussian",
                        help="blur effect type (default: gaussian)")
    parser.add_argument("--limit", type=int, default=None, metavar="N",
                        help="process only first N images (useful for testing)")
    parser.add_argument("--ids-file", type=Path, default=None, metavar="FILE",
                        help="text file with one image filename per line (e.g. athlete-image-ids.txt)")
    parser.add_argument("--inplace", action="store_true",
                        help="DANGER: overwrite source files instead of writing to output/")
    parser.add_argument("--scan", action="store_true",
                        help="run OwL-ViT logo detection, write detections.json")
    parser.add_argument("--rescan-zero", action="store_true",
                        help="with --scan: re-run images that previously got 0 detections")
    parser.add_argument("--tiles", type=int, default=1, metavar="N",
                        help="split image into N×N tiles for better small-logo detection (default: 1, try: 2)")
    parser.add_argument("--ocr", action="store_true",
                        help="run EasyOCR text detection, merge into detections.json (pip install easyocr)")
    parser.add_argument("--ocr-min-score", type=float, default=0.3, metavar="FLOAT",
                        help="minimum OCR confidence score (default: 0.3)")
    parser.add_argument("--blur", action="store_true",
                        help="apply blur from detections.json")
    parser.add_argument("--face-protect", action="store_true",
                        help="blur everything except detected face (requires: pip install mediapipe)")
    parser.add_argument("--head-margin", type=float, default=0.45, metavar="FLOAT",
                        help="fraction to expand face box for hair/neck (default: 0.45)")
    parser.add_argument("--feather", type=int, default=35, metavar="PX",
                        help="soft edge width in pixels between sharp/blurred zones (default: 35)")
    parser.add_argument("--review", action="store_true",
                        help="generate HTML review page")
    parser.add_argument("--compare", action="store_true",
                        help="generate side-by-side before/after HTML")
    parser.add_argument("--logo-dir", type=Path, default=None, metavar="DIR",
                        help="second blurred dir for 3-col compare (logo-only vs face-protect)")

    args = parser.parse_args()

    if not any([args.scan, args.ocr, args.blur, args.face_protect, args.review, args.compare]):
        parser.print_help()
        print("\nExample quick test:\n  python blur_logos.py --scan --limit 5 --review")
        sys.exit(0)

    if args.scan:
        run_scan(
            input_dir=args.input,
            detections_path=args.detections,
            model_id=args.model,
            threshold=args.threshold,
            queries=LOGO_QUERIES,
            limit=args.limit,
            ids_file=args.ids_file,
            rescan_zero=args.rescan_zero,
            tiles=args.tiles,
        )

    if args.ocr:
        run_ocr_scan(
            input_dir=args.input,
            detections_path=args.detections,
            min_score=args.ocr_min_score,
            limit=args.limit,
            ids_file=args.ids_file,
        )

    if args.face_protect:
        run_face_protect(
            input_dir=args.input,
            output_dir=args.output,
            ids_file=args.ids_file,
            limit=args.limit,
            blur_radius=args.blur_radius,
            head_margin=args.head_margin,
            feather=args.feather,
            inplace=args.inplace,
        )

    if args.blur:
        run_blur(
            input_dir=args.input,
            output_dir=args.output,
            detections_path=args.detections,
            blur_radius=args.blur_radius,
            margin=args.margin,
            method=args.method,
            inplace=args.inplace,
            ids_file=args.ids_file,
        )

    if args.review:
        run_review(
            detections_path=args.detections,
            review_path=args.review_path,
            input_dir=args.input,
        )

    if args.compare:
        run_compare(
            original_dir=args.input,
            blurred_dir=args.output,
            compare_path=args.review_path.parent / "logo-blur-compare.html",
            logo_dir=args.logo_dir,
        )


if __name__ == "__main__":
    main()
