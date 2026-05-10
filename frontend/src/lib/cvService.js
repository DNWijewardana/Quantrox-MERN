import axios from "axios";

const CV_SERVICE_URL =
  import.meta.env.VITE_CV_SERVICE_URL || "http://localhost:5000";

// We use a separate axios instance (not axiosInstance from /lib/axios.js)
// because this hits a DIFFERENT server than the Node backend.
const cvAxios = axios.create({
  baseURL: CV_SERVICE_URL,
  timeout: 30000, // OpenCV processing can take a few seconds
});

export async function isCvServiceAlive() {
  try {
    const { data, status } = await cvAxios.get("/health", { timeout: 2000 });
    return status === 200 && data?.status === "ok";
  } catch {
    return false;
  }
}

//  Detect-lines
//  Sends a publicly-reachable image URL to the Python
//  service and returns an array of detected line segments.
//
//  Each line: { a: {x, y}, b: {x, y} }

export async function detectLines(imageUrl, options = {}) {
  const {
    cannyLow = 50,
    cannyHigh = 150,
    houghThreshold = 80,
    minLineLength = 40,
    maxLineGap = 10,
  } = options;

  const { data } = await cvAxios.post("/detect-lines", {
    imageUrl,
    cannyLow,
    cannyHigh,
    houghThreshold,
    minLineLength,
    maxLineGap,
  });

  if (!data?.success) {
    throw new Error(data?.message || "Line detection failed");
  }

  // data.lines: [{ a: {x, y}, b: {x, y} }, ...]
  return data.lines || [];
}
