import mongoose from "mongoose";

// A 2D point on the plan canvas, in pixel coordinates
const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

// One room (a closed polygon of points)
const roomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "Room" },
    type: {
      type: String,
      enum: [
        "living",
        "bedroom",
        "kitchen",
        "bathroom",
        "dining",
        "corridor",
        "garage",
        "other",
      ],
      default: "other",
    },
    points: { type: [pointSchema], default: [] },
    area: { type: Number, default: 0 }, // m²
    perimeter: { type: Number, default: 0 }, // m
  },
  { _id: false },
);

// One wall (a line segment between two points)
const wallSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    a: { type: pointSchema, required: true },
    b: { type: pointSchema, required: true },
    length: { type: Number, default: 0 }, // m
    thickness: { type: Number, default: 0.2 }, // m  (200 mm typical)
    height: { type: Number, default: 3.0 }, // m  (default ceiling)
  },
  { _id: false },
);

// One opening (door or window in a wall)
const openingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["door", "window"], required: true },
    wallId: { type: String, required: true },
    width: { type: Number, default: 0.9 }, // m
    height: { type: Number, default: 2.1 }, // m
  },
  { _id: false },
);

// One row in the materials table
const materialItemSchema = new mongoose.Schema(
  {
    item: String,
    quantity: Number,
    unit: String,
    rate: Number,
    total: Number,
    wastage: Number,
  },
  { _id: false },
);

// One row in the labour table
const labourItemSchema = new mongoose.Schema(
  {
    task: String,
    days: Number,
    workers: Number,
    rate: Number,
    total: Number,
  },
  { _id: false },
);

// One estimate (computed by Day 3's QTO engine)
const estimateSchema = new mongoose.Schema(
  {
    totalFloorArea: { type: Number, default: 0 }, // m²
    totalWallLength: { type: Number, default: 0 }, // m
    totalWallArea: { type: Number, default: 0 }, // m²
    materials: { type: [materialItemSchema], default: [] },
    labour: { type: [labourItemSchema], default: [] },
    totalMaterialCost: { type: Number, default: 0 },
    totalLabourCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 0 },
    settingsUsed: { type: Object, default: {} }, // snapshot of rates at calc time
    calculatedAt: { type: Date },
  },
  { _id: false },
);

//  THE MAIN PROJECT SCHEMA

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    name: { type: String, required: true, default: "Untitled Project" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "analyzing", "completed"],
      default: "draft",
    },

    // The uploaded image / PDF file info
    planFile: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      width: Number,
      height: Number,
    },

    // The scale the user calibrated on the Scale page
    scale: {
      pixelsPerMeter: { type: Number, default: 100 },
      metersPerPixel: { type: Number, default: 0.01 },
      method: {
        type: String,
        enum: ["manual", "reference", "pixel"],
        default: "pixel",
      },
      manualScale: { type: String, default: "1:100" },
      referenceLength: { type: Number, default: 0 }, // meters known
      referencePixels: { type: Number, default: 0 }, // pixels measured
    },

    // Geometry (drawn / detected)
    rooms: { type: [roomSchema], default: [] },
    walls: { type: [wallSchema], default: [] },
    openings: { type: [openingSchema], default: [] },

    // The estimate (filled in on Day 3)
    estimate: { type: estimateSchema, default: () => ({}) },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

const projectModel =
  mongoose.models.project || mongoose.model("project", projectSchema);

export default projectModel;
