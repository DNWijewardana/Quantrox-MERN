import cv2
import numpy as np


WALL_CLASS = 1
DOOR_CLASS = 2
WINDOW_CLASS = 3
ROOM_CLASS = 4


#   Skeletonization
def _skeletonize_cv2(binary_mask):
    """
    Morphological thinning to extract a 1-pixel-wide skeleton.

    Two strategies, in order of preference:
      1. cv2.ximgproc.thinning (Zhang-Suen)  — fast, in opencv-contrib
      2. Hand-rolled morphological skeleton  — works on plain opencv

    Both produce a 1-pixel-wide centreline that Hough lines can fit
    cleanly. Equivalent in quality to skimage.morphology.skeletonize.

    Args:
        binary_mask: (H, W) uint8 array with values 0 or 1.

    Returns:
        (H, W) uint8 array with values 0 or 255 (skeleton pixels).
    """
    # Make sure we have a uint8 binary image scaled to 0/255
    img = (binary_mask > 0).astype(np.uint8) * 255

    # Try opencv-contrib's thinning first
    try:
        thin = cv2.ximgproc.thinning(img, thinningType=cv2.ximgproc.THINNING_ZHANGSUEN)
        return thin
    except (AttributeError, cv2.error):
        pass

    # Fallback: classical morphological skeleton
    # Iteratively erodes the image and keeps the "ridge" pixels.
    skel = np.zeros(img.shape, np.uint8)
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    work = img.copy()

    while True:
        opened = cv2.morphologyEx(work, cv2.MORPH_OPEN, element)
        temp = cv2.subtract(work, opened)
        eroded = cv2.erode(work, element)
        skel = cv2.bitwise_or(skel, temp)
        work = eroded.copy()
        if cv2.countNonZero(work) == 0:
            break

    return skel


#   WALLS:   mask -> list of {x1,y1,x2,y2}
def extract_walls(mask, min_wall_length_px=20):
    """
    Convert the wall class mask into a list of straight line segments.
    """
    wall_mask = (mask == WALL_CLASS).astype(np.uint8)

    if wall_mask.sum() == 0:
        return []

    # 1. Light morphological close to bridge tiny gaps the model may leave.
    kernel = np.ones((3, 3), np.uint8)
    wall_mask = cv2.morphologyEx(wall_mask, cv2.MORPH_CLOSE, kernel, iterations=1)

    # 2. Skeletonize -> single-pixel-wide centreline of each wall.
    skel = _skeletonize_cv2(wall_mask)

    # 3. Probabilistic Hough on the skeleton.
    lines = cv2.HoughLinesP(
        skel,
        rho=1,
        theta=np.pi / 180,
        threshold=15,
        minLineLength=min_wall_length_px,
        maxLineGap=10
    )

    walls = []
    if lines is None:
        return walls

    for line in lines:
        x1, y1, x2, y2 = line[0].tolist()
        length = float(np.hypot(x2 - x1, y2 - y1))
        if length < min_wall_length_px:
            continue
        walls.append({
            "x1": int(x1), "y1": int(y1),
            "x2": int(x2), "y2": int(y2),
            "length": round(length, 2)
        })

    walls = _merge_collinear_walls(walls, angle_tol_deg=4, gap_tol_px=12)

    return walls


def _merge_collinear_walls(walls, angle_tol_deg=4, gap_tol_px=12):
    """
    Merge wall segments that share orientation and are nearly touching.
    """
    if not walls:
        return walls

    def angle_of(w):
        return np.degrees(np.arctan2(w["y2"] - w["y1"], w["x2"] - w["x1"])) % 180.0

    def endpoints(w):
        return np.array([[w["x1"], w["y1"]], [w["x2"], w["y2"]]], dtype=float)

    merged = []
    used = [False] * len(walls)

    for i, w in enumerate(walls):
        if used[i]:
            continue
        cur = dict(w)
        used[i] = True
        ang_i = angle_of(cur)

        changed = True
        while changed:
            changed = False
            for j, w2 in enumerate(walls):
                if used[j]:
                    continue
                ang_j = angle_of(w2)
                dang = min(abs(ang_i - ang_j), 180 - abs(ang_i - ang_j))
                if dang > angle_tol_deg:
                    continue

                eps_i = endpoints(cur)
                eps_j = endpoints(w2)
                dists = np.linalg.norm(eps_i[:, None, :] - eps_j[None, :, :], axis=2)
                min_d = float(dists.min())
                if min_d > gap_tol_px:
                    continue

                all_pts = np.vstack([eps_i, eps_j])
                D = np.linalg.norm(all_pts[:, None, :] - all_pts[None, :, :], axis=2)
                a, b = np.unravel_index(np.argmax(D), D.shape)
                p, q = all_pts[a], all_pts[b]
                cur = {
                    "x1": int(round(p[0])), "y1": int(round(p[1])),
                    "x2": int(round(q[0])), "y2": int(round(q[1])),
                    "length": round(float(np.linalg.norm(p - q)), 2)
                }
                used[j] = True
                changed = True
                ang_i = angle_of(cur)

        merged.append(cur)

    return merged


#   ROOMS:   mask -> list of polygons

def extract_rooms(mask, min_room_area_px=1500, polygon_eps_frac=0.01):
    """
    Convert the room class mask into a list of polygons.
    """
    room_mask = (mask == ROOM_CLASS).astype(np.uint8) * 255

    if room_mask.sum() == 0:
        return []

    kernel = np.ones((5, 5), np.uint8)
    room_mask = cv2.morphologyEx(room_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    room_mask = cv2.morphologyEx(room_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    n_labels, labels = cv2.connectedComponents(room_mask, connectivity=8)

    rooms = []
    for label in range(1, n_labels):
        comp = (labels == label).astype(np.uint8) * 255
        area = int(comp.sum() / 255)
        if area < min_room_area_px:
            continue

        contours, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue
        contour = max(contours, key=cv2.contourArea)

        epsilon = polygon_eps_frac * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) < 3:
            continue

        pts = [{"x": int(p[0][0]), "y": int(p[0][1])} for p in approx]
        rooms.append({
            "points":  pts,
            "area_px": area,
            "label":   "Room"
        })

    return rooms


# Public Entry Point
def mask_to_geometry(mask):
    """Convert a class-index mask into {walls, rooms} JSON."""
    walls = extract_walls(mask)
    rooms = extract_rooms(mask)
    return {"walls": walls, "rooms": rooms}
