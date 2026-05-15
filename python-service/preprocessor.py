import numpy as np
from PIL import Image

IMG_SIZE = 512

# ImageNet stats (must match training)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def preprocess_image(image_bgr_or_rgb, is_bgr=False):
    """
    Preprocess a single image for model input.

    Args:
        image_bgr_or_rgb: HxWx3 numpy uint8 array.
            If is_bgr=True, channels are BGR (e.g. from cv2.imread).
            Otherwise RGB is assumed.
        is_bgr: bool. True if input is BGR (OpenCV default).

    Returns:
        tensor_chw_nhwc: (1, 3, 512, 512) float32 numpy array,
                         normalized and padded.
        meta: dict with keys needed by postprocess_mask():
            'orig_h', 'orig_w'  : original image dims
            'resized_h', 'resized_w' : dims after LongestMaxSize
            'pad_top', 'pad_left'     : padding offsets
    """
    if image_bgr_or_rgb is None:
        raise ValueError("preprocess_image: input image is None")
    if image_bgr_or_rgb.ndim != 3 or image_bgr_or_rgb.shape[2] != 3:
        raise ValueError(
            f"preprocess_image: expected HxWx3 array, got shape "
            f"{image_bgr_or_rgb.shape}"
        )

    img = image_bgr_or_rgb
    if is_bgr:
        img = img[:, :, ::-1]  # BGR -> RGB

    orig_h, orig_w = img.shape[:2]

    # Step 1: LongestMaxSize(512) -- aspect-preserving resize so longest side = 512
    if orig_h >= orig_w:
        new_h = IMG_SIZE
        new_w = max(1, int(round(orig_w * IMG_SIZE / orig_h)))
    else:
        new_w = IMG_SIZE
        new_h = max(1, int(round(orig_h * IMG_SIZE / orig_w)))

    pil_img = Image.fromarray(img)
    pil_img = pil_img.resize((new_w, new_h), Image.BILINEAR)
    resized = np.asarray(pil_img)

    # Step 2: PadIfNeeded(512, 512) -- center pad with 0 to reach 512x512
    pad_h = IMG_SIZE - new_h
    pad_w = IMG_SIZE - new_w
    pad_top  = pad_h // 2
    pad_bot  = pad_h - pad_top
    pad_left = pad_w // 2
    pad_right = pad_w - pad_left

    padded = np.pad(
        resized,
        pad_width=((pad_top, pad_bot), (pad_left, pad_right), (0, 0)),
        mode="constant",
        constant_values=0
    )
    assert padded.shape == (IMG_SIZE, IMG_SIZE, 3), \
        f"After padding expected {(IMG_SIZE, IMG_SIZE, 3)}, got {padded.shape}"

    # Step 3: ImageNet normalisation 
    padded_f = padded.astype(np.float32) / 255.0
    padded_f = (padded_f - IMAGENET_MEAN) / IMAGENET_STD

    # Step 4: HWC -> CHW, add batch dim
    tensor = np.transpose(padded_f, (2, 0, 1)) # (3, 512, 512)
    tensor = tensor[None, ...]  # (1, 3, 512, 512)

    meta = {
        "orig_h":    orig_h,
        "orig_w":    orig_w,
        "resized_h": new_h,
        "resized_w": new_w,
        "pad_top":   pad_top,
        "pad_left":  pad_left
    }

    return tensor.astype(np.float32), meta


def unpad_and_resize_mask(mask_512, meta):
    """
    Inverse of preprocess_image() for a 2-D mask. Removes padding,
    then resizes back to the original image dimensions.

    Args:
        mask_512: (512, 512) numpy array (int or float).
        meta: dict returned by preprocess_image().

    Returns:
        (orig_h, orig_w) numpy array, same dtype as input.
    """
    pad_top  = meta["pad_top"]
    pad_left = meta["pad_left"]
    resized_h = meta["resized_h"]
    resized_w = meta["resized_w"]
    orig_h    = meta["orig_h"]
    orig_w    = meta["orig_w"]

    # 1. Crop the padded region away  ->  (resized_h, resized_w)
    cropped = mask_512[pad_top : pad_top + resized_h,
                       pad_left : pad_left + resized_w]

    # 2. Resize back to original dims using nearest-neighbour (preserves class labels)
    pil = Image.fromarray(cropped.astype(np.uint8))
    pil = pil.resize((orig_w, orig_h), Image.NEAREST)
    return np.asarray(pil)
