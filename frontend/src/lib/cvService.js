import axios from "axios";

const CV_SERVICE_URL =
  import.meta.env.VITE_CV_SERVICE_URL || "http://localhost:5000";

// Separate axios instance — this hits a DIFFERENT server than
// the Node backend, so it must not carry our auth cookies
const cvAxios = axios.create({
  baseURL: CV_SERVICE_URL,
  timeout: 60000, // CPU inference can take a few seconds; allow up to 60s
});

//  GET /health
export async function isCvServiceAlive() {
  try {
    const { data, status } = await cvAxios.get("/health", { timeout: 3000 });
    return status === 200 && data?.ok === true && data?.model?.loaded === true;
  } catch {
    return false;
  }
}

//  POST /detect-lines
export async function detectLines(imageUrl) {
  const { data } = await cvAxios.post("/detect-lines", { imageUrl });

  if (!data?.success) {
    throw new Error(data?.message || "Detection failed");
  }

  // The new API returns walls as [{ x1, y1, x2, y2, length }, ...]
  // Convert to the editor's expected shape [{ a, b }, ...]
  const walls = (data.walls || []).map((w) => ({
    a: { x: w.x1, y: w.y1 },
    b: { x: w.x2, y: w.y2 },
  }));

  return walls;
}

export async function detectFloorPlan(imageUrl) {
  const { data } = await cvAxios.post("/detect-lines", { imageUrl });

  if (!data?.success) {
    throw new Error(data?.message || "Detection failed");
  }

  return {
    walls: (data.walls || []).map((w) => ({
      a: { x: w.x1, y: w.y1 },
      b: { x: w.x2, y: w.y2 },
      length: w.length,
    })),
    rooms: data.rooms || [],
    validation: data.validation || null,
    timing: data.timing_ms || null,
    imageSize: data.image_size || null,
  };
}
