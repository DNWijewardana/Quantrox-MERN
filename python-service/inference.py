import numpy as np
import torch
import torch.nn.functional as F

from model_loader import get_model, DEVICE, NUM_CLASSES, IMG_SIZE
from preprocessor import preprocess_image, unpad_and_resize_mask


# Class index lookup (must match training)
CLS = {"background": 0, "wall": 1, "door": 2, "window": 3, "room": 4}


#  predict_mask
@torch.no_grad()
def predict_mask(image_rgb):
    """
    Run segmentation on a single image.

    Args:
        image_rgb: HxWx3 numpy uint8 array (RGB).

    Returns:
        mask_orig: (orig_h, orig_w) int64 numpy array of class indices.
        probs_512: (5, 512, 512) float32 numpy array of softmax probs
                   (used by is_floor_plan validator).
        meta:      dict with original dims & padding info.
    """
    # 1. Preprocess  ->  (1, 3, 512, 512) float32
    tensor_np, meta = preprocess_image(image_rgb, is_bgr=False)

    # 2. To torch, send to device
    tensor = torch.from_numpy(tensor_np).to(DEVICE)

    # 3. Forward pass
    model = get_model()
    logits = model(tensor) # (1, 5, 512, 512)

    # 4. Softmax + argmax at 512x512 resolution
    probs_512 = F.softmax(logits, dim=1)[0]  # (5, 512, 512)
    mask_512  = probs_512.argmax(dim=0)  # (512, 512) int64

    # 5. Move to CPU numpy
    probs_np = probs_512.detach().cpu().numpy().astype(np.float32)
    mask_np  = mask_512.detach().cpu().numpy().astype(np.uint8)

    # 6. Undo pad+resize so mask matches original image dims
    mask_orig = unpad_and_resize_mask(mask_np, meta).astype(np.int64)

    return mask_orig, probs_np, meta


#  is_floor_plan validator
def is_floor_plan(probs_512, mask_orig,
                  min_wall_room_ratio=0.05,
                  min_confidence=0.55,
                  max_background_ratio=0.92):
    """
    Heuristic gate: decide whether the input image is actually a
    floor plan or not (a cat photo, a screenshot, etc.).

    The checks come straight from the Colab is_floor_plan() function:

      1. CONFIDENCE  — mean of the max-class probability across the
                       central 512x512 region must be >= min_confidence.
                       A model that's uncertain everywhere is probably
                       looking at out-of-distribution content.

      2. BACKGROUND  — fraction of original-resolution pixels classified
                       as background must be <= max_background_ratio.
                       A picture that's nearly all "background" has no
                       structure to interpret.

      3. STRUCTURE   — fraction classified as wall OR room must be
                       >= min_wall_room_ratio. A floor plan always has
                       a sensible amount of both.

    Args:
        probs_512: (5, 512, 512) float32 softmax output.
        mask_orig: (H, W) int array of class indices at original dims.

    Returns:
        ok:     bool   — True if image looks like a floor plan.
        reason: str    — Human-readable rejection reason ('' if ok).
        stats:  dict   — All measured metrics for debugging.
    """
    H, W = mask_orig.shape

    # Confidence
    max_probs = probs_512.max(axis=0) # (512, 512)
    mean_conf = float(max_probs.mean())

    # Pixel-fraction metrics on original-resolution mask
    total = H * W
    bg_frac    = float((mask_orig == CLS["background"]).sum()) / total
    wall_frac  = float((mask_orig == CLS["wall"]).sum()) / total
    room_frac  = float((mask_orig == CLS["room"]).sum()) / total
    door_frac  = float((mask_orig == CLS["door"]).sum()) / total
    window_frac= float((mask_orig == CLS["window"]).sum()) / total
    structure_frac = wall_frac + room_frac

    stats = {
        "mean_confidence": round(mean_conf, 4),
        "background_frac": round(bg_frac, 4),
        "wall_frac": round(wall_frac, 4),
        "room_frac": round(room_frac, 4),
        "door_frac": round(door_frac, 4),
        "window_frac": round(window_frac, 4),
        "structure_frac": round(structure_frac, 4)
    }

    # Apply thresholds
    if mean_conf < min_confidence:
        return False, (
            f"Low model confidence ({mean_conf:.2f} < {min_confidence:.2f}). "
            f"This does not look like a floor plan."
        ), stats

    if bg_frac > max_background_ratio:
        return False, (
            f"Image is mostly background ({bg_frac:.0%} > "
            f"{max_background_ratio:.0%}). No floor-plan structure detected."
        ), stats

    if structure_frac < min_wall_room_ratio:
        return False, (
            f"Too little wall/room structure ({structure_frac:.1%} < "
            f"{min_wall_room_ratio:.1%}). This may not be a floor plan."
        ), stats

    return True, "", stats
