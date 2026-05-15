import os
import threading
import torch

# Configuration (override with env vars in production)
MODEL_PATH = os.environ.get(
    "QUANTROX_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "models", "floorplan_unetpp_b4.torchscript")
)

# Force CPU unless a CUDA device is available AND env says use it
USE_CUDA = (
    os.environ.get("QUANTROX_USE_CUDA", "auto").lower() != "false"
    and torch.cuda.is_available()
)
DEVICE = torch.device("cuda" if USE_CUDA else "cpu")

# Classes (must match training exactly)
CLASSES = ["background", "wall", "door", "window", "room"]
NUM_CLASSES = len(CLASSES)
IMG_SIZE = 512  # Must match training IMG_SIZE


# Singleton: load model only once
_model = None
_model_lock = threading.Lock()


def get_model():
    """
    Return the loaded TorchScript model. Thread-safe lazy loader.

    Returns:
        torch.jit.ScriptModule in eval mode, on DEVICE.
    """
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:  # double-checked locking
                if not os.path.isfile(MODEL_PATH):
                    raise FileNotFoundError(
                        f"Model file not found at: {MODEL_PATH}\n"
                        f"Place 'floorplan_unetpp_b4.torchscript' in "
                        f"'python-service/models/' before starting the service."
                    )

                print(f"[model_loader] Loading model from {MODEL_PATH} ...")
                model = torch.jit.load(MODEL_PATH, map_location=DEVICE)
                model.eval()

                # Warm up — first inference is slow due to JIT specialisation
                with torch.no_grad():
                    dummy = torch.zeros(1, 3, IMG_SIZE, IMG_SIZE, device=DEVICE)
                    _ = model(dummy)

                _model = model
                print(f"[model_loader] Model loaded successfully on device={DEVICE}")

    return _model


def model_info():
    """Return a small dict describing the loaded model — for the /health endpoint."""
    loaded = _model is not None
    return {
        "loaded": loaded,
        "device": str(DEVICE),
        "model_path": MODEL_PATH,
        "file_exists": os.path.isfile(MODEL_PATH),
        "classes": CLASSES,
        "img_size": IMG_SIZE
    }
