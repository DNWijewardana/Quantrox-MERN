//  Converts a project's rooms + walls + user-defined rates
//  into a full Bill-of-Quantities-style estimate.

export const CONSTRUCTION_NORMS = {
  // Geometry assumptions
  DEFAULT_WALL_HEIGHT_M: 3.0, // Typical floor-to-ceiling height
  DEFAULT_WALL_THICKNESS_M: 0.2, // 200 mm block wall (with plaster)

  // Cement blocks (6-inch / 150 mm × 200 mm × 400 mm)
  // Block face area (with 10 mm mortar joint) ≈ 0.41 × 0.21 = 0.086 m²,
  // so practical coverage with mortar is ≈ 13 blocks per m².
  BLOCKS_PER_M2_WALL: 13,

  // Mortar for masonry (1:5 cement:sand)
  // Per 1 m² of wall:  ≈ 0.030 m³ mortar
  // 1 m³ mortar (1:5) needs ≈ 7.4 bags cement + 1.0 m³ sand
  // →  per m² wall:  cement = 0.030 × 7.4 = 0.222 bags
  //                    sand   = 0.030 × 1.0 = 0.030 m³
  CEMENT_BAGS_PER_M2_MASONRY: 0.222,
  SAND_M3_PER_M2_MASONRY: 0.03,

  // Plaster (12 mm thick, 1:5 mix, two faces of every wall)
  // Volume per m² plaster face = 0.012 m³
  // Per m² plaster:  cement ≈ 0.090 bags, sand ≈ 0.012 m³
  CEMENT_BAGS_PER_M2_PLASTER: 0.09,
  SAND_M3_PER_M2_PLASTER: 0.012,

  // Foundation + slab aggregate (rough estimate)
  // ~100 mm of stone aggregate over the full floor area
  AGGREGATE_M3_PER_M2_FLOOR: 0.1,

  // Steel reinforcement
  // Typical residential RCC ≈ 85 kg / m² of floor area
  STEEL_TONS_PER_M2_FLOOR: 0.0085,

  // Paint coverage
  // 1 litre of emulsion covers ~12 m² (single coat)
  PAINT_M2_PER_LITRE: 12,

  // Labour productivity (m² OR m³ per worker per day)
  MASON_M2_WALL_PER_DAY: 8, // Mason productivity for block work
  HELPER_PER_MASON_RATIO: 0.6, // ~6 helpers per 10 masons
  PLASTER_M2_PER_DAY: 15, // Plasterer productivity
  PAINT_M2_PER_DAY: 30, // Painter productivity
  CARPENTRY_M2_PER_DAY: 18, // Doors, windows, roof, fittings
  PLUMBER_M2_PER_DAY: 35, // Plumbing per m² of floor area
};

// round
// Helper to round numbers to a sensible number of places
function round(n, places = 2) {
  const k = Math.pow(10, places);
  return Math.round((n + Number.EPSILON) * k) / k;
}

// computeGeometry
// Sums room areas and wall lengths/areas.
//
// Input:
//   project.rooms[]:  { area, perimeter }
//   project.walls[]:  { length, height }
//
// Output:
//   { totalFloorArea, totalWallLength, totalWallArea }

export function computeGeometry(project) {
  const rooms = project?.rooms || [];
  const walls = project?.walls || [];

  const totalFloorArea = rooms.reduce(
    (sum, r) => sum + (Number(r.area) || 0),
    0,
  );

  const totalWallLength = walls.reduce(
    (sum, w) => sum + (Number(w.length) || 0),
    0,
  );

  // Sum each wall's area individually (wall.height may differ per wall)
  const totalWallArea = walls.reduce((sum, w) => {
    const h = Number(w.height) || CONSTRUCTION_NORMS.DEFAULT_WALL_HEIGHT_M;
    return sum + (Number(w.length) || 0) * h;
  }, 0);

  return {
    totalFloorArea: round(totalFloorArea, 2),
    totalWallLength: round(totalWallLength, 2),
    totalWallArea: round(totalWallArea, 2),
  };
}

// computeMaterials
// Calculates each material's quantity, applies wastage,
// then multiplies by the user's rate.
//
// Returns an array of rows:
//   { item, quantity, unit, rate, total, wastage }

export function computeMaterials(geometry, settings) {
  const { totalFloorArea, totalWallArea } = geometry;

  const rates = settings.materialRates || {};
  const wastage = settings.wastageFactors || {};
  const apply = settings.includeWastage !== false;

  // The plaster covers BOTH faces of every wall
  const plasterArea = totalWallArea * 2;

  // Helper: factor by which to multiply quantity (1 + wastage%)
  const wf = (key) => (apply ? 1 + (Number(wastage[key]) || 0) / 100 : 1);

  // 1. Cement blocks
  const blocksRaw = totalWallArea * CONSTRUCTION_NORMS.BLOCKS_PER_M2_WALL;
  const blocksFinal = blocksRaw * wf("blocks");

  // 2. Cement (50 kg bags)
  // used in masonry mortar + plaster
  const cementMasonry =
    totalWallArea * CONSTRUCTION_NORMS.CEMENT_BAGS_PER_M2_MASONRY;
  const cementPlaster =
    plasterArea * CONSTRUCTION_NORMS.CEMENT_BAGS_PER_M2_PLASTER;
  const cementRaw = cementMasonry + cementPlaster;
  const cementFinal = cementRaw * wf("cement");

  // 3. Sand (m³)
  const sandMasonry = totalWallArea * CONSTRUCTION_NORMS.SAND_M3_PER_M2_MASONRY;
  const sandPlaster = plasterArea * CONSTRUCTION_NORMS.SAND_M3_PER_M2_PLASTER;
  const sandRaw = sandMasonry + sandPlaster;
  const sandFinal = sandRaw * wf("sand");

  // 4. Aggregate (m³)
  const aggregateRaw =
    totalFloorArea * CONSTRUCTION_NORMS.AGGREGATE_M3_PER_M2_FLOOR;
  const aggregateFinal = aggregateRaw * wf("aggregate");

  // 5. Steel reinforcement (tons) ----
  const steelRaw = totalFloorArea * CONSTRUCTION_NORMS.STEEL_TONS_PER_M2_FLOOR;
  const steelFinal = steelRaw * wf("steel");

  // 6. Plaster work (m² — sold as a finished surface)
  // No wastage factor for plaster because the materials it consumes
  // (cement & sand) already have their own wastage applied above.
  const plasterFinal = plasterArea;

  // 7. Paint (liters) — single coat
  const paintRaw = plasterArea / CONSTRUCTION_NORMS.PAINT_M2_PER_LITRE;
  const paintFinal = paintRaw * wf("paint");

  // Build the table rows
  const rows = [
    {
      item: "Cement (50kg bags)",
      quantity: Math.ceil(cementFinal), // round UP — you can't buy half a bag
      unit: "bags",
      rate: Number(rates.cement) || 0,
      wastage: Number(wastage.cement) || 0,
    },
    {
      item: "River Sand",
      quantity: round(sandFinal, 2),
      unit: "m³",
      rate: Number(rates.sand) || 0,
      wastage: Number(wastage.sand) || 0,
    },
    {
      item: "Metal Aggregate (20mm)",
      quantity: round(aggregateFinal, 2),
      unit: "m³",
      rate: Number(rates.aggregate) || 0,
      wastage: Number(wastage.aggregate) || 0,
    },
    {
      item: 'Cement Blocks (6")',
      quantity: Math.ceil(blocksFinal), // whole blocks
      unit: "nos",
      rate: Number(rates.blocks) || 0,
      wastage: Number(wastage.blocks) || 0,
    },
    {
      item: "Steel Reinforcement",
      quantity: round(steelFinal, 3), // 3 dp because tons are tiny numbers
      unit: "tons",
      rate: Number(rates.steel) || 0,
      wastage: Number(wastage.steel) || 0,
    },
    {
      item: "Wall Plaster",
      quantity: round(plasterFinal, 2),
      unit: "m²",
      rate: Number(rates.plaster) || 0,
      wastage: 0,
    },
    {
      item: "Paint (Emulsion)",
      quantity: round(paintFinal, 2),
      unit: "liters",
      rate: Number(rates.paint) || 0,
      wastage: Number(wastage.paint) || 0,
    },
  ];

  // Compute totals
  rows.forEach((r) => {
    r.total = round(r.quantity * r.rate, 2);
  });

  return rows;
}


// computeLabour
// Estimates man-days for each labour category.
//
// Returns array of:
//  { task, days, workers, rate, total }

export function computeLabour(geometry, settings) {
  const { totalFloorArea, totalWallArea } = geometry;
  const plasterArea = totalWallArea * 2;
  const labourRates = settings.labourRates || {};

  // Mason days 
  const masonDaysRaw = totalWallArea / CONSTRUCTION_NORMS.MASON_M2_WALL_PER_DAY;

  // Helper days
  const helperDaysRaw =
    masonDaysRaw * CONSTRUCTION_NORMS.HELPER_PER_MASON_RATIO;

  // Plaster + paint
  const plasterDaysRaw = plasterArea / CONSTRUCTION_NORMS.PLASTER_M2_PER_DAY;
  const paintDaysRaw = plasterArea / CONSTRUCTION_NORMS.PAINT_M2_PER_DAY;

  // Carpentry & plumbing
  const carpentryDaysRaw =
    totalFloorArea / CONSTRUCTION_NORMS.CARPENTRY_M2_PER_DAY;
  const plumberDaysRaw = totalFloorArea / CONSTRUCTION_NORMS.PLUMBER_M2_PER_DAY;

  const round0 = (n) => Math.max(1, Math.ceil(n)); // at least 1 day, whole days

  const rows = [
    {
      task: "Foundation & Wall Construction",
      days: round0(masonDaysRaw),
      workers: 2, // typical 2-mason team
      rate: Number(labourRates.mason) || 0,
    },
    {
      task: "Helper / Labour Support",
      days: round0(helperDaysRaw),
      workers: 2,
      rate: Number(labourRates.helper) || 0,
    },
    {
      task: "Plastering",
      days: round0(plasterDaysRaw),
      workers: 2,
      rate: Number(labourRates.mason) || 0, // plastering done by masons
    },
    {
      task: "Painting",
      days: round0(paintDaysRaw),
      workers: 2,
      rate: Number(labourRates.painter) || 0,
    },
    {
      task: "Carpentry (Doors, Windows, Roof)",
      days: round0(carpentryDaysRaw),
      workers: 2,
      rate: Number(labourRates.carpenter) || 0,
    },
    {
      task: "Plumbing & Fittings",
      days: round0(plumberDaysRaw),
      workers: 1,
      rate: Number(labourRates.plumber) || 0,
    },
  ];

  // Total cost = days × workers × daily rate
  rows.forEach((r) => {
    r.total = round(r.days * r.workers * r.rate, 2);
  });

  return rows;
}

// computeEstimatedDays
// Some tasks run in parallel (mason + helper, painter on
// different room from plasterer). A realistic schedule is
// roughly the LONGEST single phase, not the sum of all.
//
// We approximate with the sum of the critical-path tasks:
//   masonry + plastering + painting   (sequential)
// carpentry + plumbing usually overlap, so we add only
// half of their total to the sequential time.

export function computeEstimatedDays(labour) {
  const find = (taskName) =>
    labour.find((l) => l.task.startsWith(taskName))?.days || 0;

  const masonry = find("Foundation");
  const plaster = find("Plastering");
  const painting = find("Painting");
  const carpentry = find("Carpentry");
  const plumbing = find("Plumbing");

  const critical = masonry + plaster + painting;
  const overlap = (carpentry + plumbing) * 0.5;
  return Math.ceil(critical + overlap);
}


// calculateEstimate
// The single public entry point. Pulls everything together.
export function calculateEstimate(project, settings) {
  const geometry = computeGeometry(project);
  const materials = computeMaterials(geometry, settings);
  const labour = computeLabour(geometry, settings);

  const totalMaterialCost = round(
    materials.reduce((s, m) => s + (m.total || 0), 0),
    2,
  );
  const totalLabourCost = round(
    labour.reduce((s, l) => s + (l.total || 0), 0),
    2,
  );
  const totalCost = round(totalMaterialCost + totalLabourCost, 2);
  const estimatedDays = computeEstimatedDays(labour);

  return {
    totalFloorArea: geometry.totalFloorArea,
    totalWallLength: geometry.totalWallLength,
    totalWallArea: geometry.totalWallArea,
    materials,
    labour,
    totalMaterialCost,
    totalLabourCost,
    totalCost,
    estimatedDays,
    settingsUsed: {
      materialRates: settings.materialRates,
      labourRates: settings.labourRates,
      wastageFactors: settings.wastageFactors,
      includeWastage: settings.includeWastage,
      region: settings.region,
    },
    calculatedAt: new Date(),
  };
}
