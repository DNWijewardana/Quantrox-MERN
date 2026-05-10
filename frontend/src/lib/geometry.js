// Distance between two points (in pixels)
export function distancePx(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Convert pixels to meters
export function pxToMeters(px, pixelsPerMeter) {
  if (!pixelsPerMeter || pixelsPerMeter <= 0) return 0;
  return px / pixelsPerMeter;
}

// Convert square pixels to square meters
export function pxAreaToM2(pxArea, pixelsPerMeter) {
  if (!pixelsPerMeter || pixelsPerMeter <= 0) return 0;
  return pxArea / (pixelsPerMeter * pixelsPerMeter);
}

// Polygon area (Shoelace formula, in pixels²)
//
//  For a polygon with points [p1, p2, ..., pn], area is:
//
//      |Σ (xi * y(i+1) - x(i+1) * yi)| / 2
//
//  Always returns a positive number.
export function polygonAreaPx(points) {
  const n = points.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

// Polygon perimeter (in pixels)
export function polygonPerimeterPx(points) {
  const n = points.length;
  if (n < 2) return 0;

  let total = 0;
  for (let i = 0; i < n; i++) {
    total += distancePx(points[i], points[(i + 1) % n]);
  }
  return total;
}

// Convenience: area + perimeter in METERS
//
//  Returns:  { area: m², perimeter: m }
//  Use this when saving rooms back to the backend.
export function computeRoomMetrics(points, pixelsPerMeter) {
  const areaPx = polygonAreaPx(points);
  const perimPx = polygonPerimeterPx(points);
  return {
    area: pxAreaToM2(areaPx, pixelsPerMeter),
    perimeter: pxToMeters(perimPx, pixelsPerMeter),
  };
}

// Wall length in meters (for the wall.length field)
export function wallLengthMeters(wall, pixelsPerMeter) {
  return pxToMeters(distancePx(wall.a, wall.b), pixelsPerMeter);
}

// Check if a polygon is "closed enough" by distance
//
//  When the user clicks near the first point of a room, we want to
//  auto-close the polygon. Returns true if the test point is within
//  `tolerancePx` of the first point.
export function isNearFirstPoint(point, firstPoint, tolerancePx = 12) {
  return distancePx(point, firstPoint) <= tolerancePx;
}
