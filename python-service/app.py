import io
import os
import time
import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_loader     import get_model, model_info, DEVICE
from inference        import predict_mask, is_floor_plan
from mask_to_geometry import mask_to_geometry


# Flask app

app = Flask(__name__)

# CORS — allow the dev frontends + the backend to call us
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173"
])


# /health  — used by frontend's "AI Online" badge
@app.get("/health")
def health():
    return jsonify({
        "ok":      True,
        "service": "quantrox-ai",
        "version": "2.0.0",
        "model":   model_info()
    })


# /detect-lines  — the main endpoint

@app.post("/detect-lines")
def detect_lines():
    t_start = time.time()

    # Parse request
    payload = request.get_json(silent=True) or {}
    image_url = payload.get("imageUrl") or payload.get("url")
    if not image_url:
        return jsonify({"success": False, "message": "imageUrl is required"}), 400

    # Download image
    try:
        resp = requests.get(image_url, timeout=15)
        if resp.status_code != 200:
            return jsonify({
                "success": False,
                "message": f"Could not download image (HTTP {resp.status_code})"
            }), 400
        img_bytes = resp.content
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Image download failed: {e}"
        }), 400

    # Decode image  (cv2 supports png/jpg; rejects pdf which is correct)
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return jsonify({
            "success": False,
            "message": "Unsupported image format. Please upload JPG or PNG (PDFs must be converted to image first)."
        }), 400

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # Run model inference
    try:
        t_inf = time.time()
        mask, probs, meta = predict_mask(img_rgb)
        infer_ms = (time.time() - t_inf) * 1000.0
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Model inference failed: {e}"
        }), 500

    # Validate it's actually a floor plan
    ok, reason, stats = is_floor_plan(probs, mask)
    if not ok:
        return jsonify({
            "success":    False,
            "message":    reason,
            "validation": stats
        }), 400

    # Convert mask -> geometry JSON
    try:
        geom = mask_to_geometry(mask)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Geometry extraction failed: {e}"
        }), 500

    total_ms = (time.time() - t_start) * 1000.0

    return jsonify({
        "success": True,
        "walls": geom["walls"],
        "rooms": geom["rooms"],
        "validation": stats,
        "timing_ms": {
            "inference": round(infer_ms, 1),
            "total":     round(total_ms, 1)
        },
        "image_size": {
            "width": int(meta["orig_w"]),
            "height": int(meta["orig_h"])
        }
    })


# Run
if __name__ == "__main__":
    # Eagerly load the model at startup (fail fast if missing)
    print("[startup] Pre-loading model...")
    try:
        get_model()
        print(f"[startup] Model ready on {DEVICE}")
    except FileNotFoundError as e:
        print("\n" + "=" * 60)
        print("MODEL FILE MISSING")
        print("=" * 60)
        print(str(e))
        print("\nThe service will start but /detect-lines will fail until\n"
              "you place the model file in the correct location.")
        print("=" * 60 + "\n")

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
