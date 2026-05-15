import sys
import os
import json
import time
import cv2
import numpy as np

# Make sure we can import the local modules
sys.path.insert(0, os.path.dirname(__file__))

from model_loader import get_model, model_info, DEVICE, CLASSES
from inference import predict_mask, is_floor_plan
from mask_to_geometry import mask_to_geometry


# Visualization colours  (BGR for OpenCV)
COLORS_BGR = {
    0: (0,   0,   0),       # background -> black (invisible)
    1: (0,   0,   255),     # wall       -> red
    2: (255, 255, 0),       # door       -> cyan
    3: (255, 0,   255),     # window     -> magenta
    4: (0,   255, 0)        # room       -> green
}


def visualize(image_rgb, mask, geom, out_path):
    """Save a side-by-side: original + mask overlay + extracted geometry."""
    h, w = mask.shape

    # Mask overlay
    overlay = image_rgb.copy()
    for cls_idx, colour_bgr in COLORS_BGR.items():
        if cls_idx == 0:
            continue
        colour_rgb = (colour_bgr[2], colour_bgr[1], colour_bgr[0])
        overlay[mask == cls_idx] = colour_rgb
    blended = cv2.addWeighted(image_rgb, 0.5, overlay, 0.5, 0)

    # Geometry rendering on a copy of the original
    geom_img = image_rgb.copy()
    for w_seg in geom["walls"]:
        cv2.line(geom_img,
                 (w_seg["x1"], w_seg["y1"]),
                 (w_seg["x2"], w_seg["y2"]),
                 (255, 0, 0), 3)
    for room in geom["rooms"]:
        pts = np.array([[p["x"], p["y"]] for p in room["points"]],
                       dtype=np.int32).reshape(-1, 1, 2)
        cv2.polylines(geom_img, [pts], isClosed=True, color=(0, 200, 0), thickness=3)

    # Stack horizontally for easy comparison
    panel = np.hstack([image_rgb, blended, geom_img])

    # cv2 wants BGR
    panel_bgr = cv2.cvtColor(panel, cv2.COLOR_RGB2BGR)
    cv2.imwrite(out_path, panel_bgr)
    print(f"  visualization saved to: {out_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_model.py <image_path>")
        print("Example: python test_model.py samples/plan1.jpg")
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.isfile(image_path):
        print(f"ERROR: image not found: {image_path}")
        sys.exit(1)

    print("=" * 60)
    print("QUANTROX MODEL TEST")
    print("=" * 60)

    # Show model info
    print("\n[1] Model info:")
    info = model_info()
    for k, v in info.items():
        print(f"    {k:14s}: {v}")

    # Load model
    print("\n[2] Loading model...")
    t0 = time.time()
    get_model()
    print(f"    loaded in {time.time() - t0:.2f}s on device={DEVICE}")

    # Read image
    print(f"\n[3] Reading image: {image_path}")
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        print(f"    ERROR: cv2 could not decode {image_path}")
        sys.exit(1)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    print(f"    image shape: {img_rgb.shape}")

    # Predict
    print("\n[4] Running segmentation...")
    t0 = time.time()
    mask, probs, meta = predict_mask(img_rgb)
    print(f"    inference took {(time.time() - t0) * 1000:.1f} ms")
    print(f"    mask shape: {mask.shape}")
    print(f"    pixel counts per class:")
    for idx, name in enumerate(CLASSES):
        count = int((mask == idx).sum())
        frac = count / mask.size
        print(f"        {name:11s}: {count:>10,d}  ({frac:6.2%})")

    # Validate
    print("\n[5] Validating with is_floor_plan...")
    ok, reason, stats = is_floor_plan(probs, mask)
    print(f"    is_floor_plan = {ok}")
    if not ok:
        print(f"    reason: {reason}")
    print(f"    stats: {json.dumps(stats, indent=8)}")

    # Geometry
    print("\n[6] Extracting geometry from mask...")
    t0 = time.time()
    geom = mask_to_geometry(mask)
    print(f"    extraction took {(time.time() - t0) * 1000:.1f} ms")
    print(f"    walls extracted: {len(geom['walls'])}")
    print(f"    rooms extracted: {len(geom['rooms'])}")

    if geom["walls"]:
        first = geom["walls"][0]
        print(f"    sample wall:   ({first['x1']},{first['y1']}) -> "
              f"({first['x2']},{first['y2']})  length={first['length']}px")
    if geom["rooms"]:
        r = geom["rooms"][0]
        print(f"    sample room:   {len(r['points'])} vertices, area={r['area_px']}px²")

    # Visualize
    print("\n[7] Saving visualization...")
    out_path = os.path.splitext(image_path)[0] + "_quantrox_debug.png"
    visualize(img_rgb, mask, geom, out_path)

    print("\n" + "=" * 60)
    print("RESULT:", "OK ✓" if ok else "NOT A FLOOR PLAN ✗")
    print("=" * 60)


if __name__ == "__main__":
    main()
