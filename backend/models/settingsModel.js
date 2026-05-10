import mongoose from "mongoose";

//  One Settings document per user. Stores their custom
//  material rates, labour rates, wastage % and region.
//  Defaults match Sri Lankan market prices (LKR) as of 2026,

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true,
    },

    // Material unit rates in LKR
    materialRates: {
      cement: { type: Number, default: 1200 }, // per 50 kg bag
      sand: { type: Number, default: 8500 }, // per m³
      aggregate: { type: Number, default: 7200 }, // per m³
      blocks: { type: Number, default: 85 }, // per 6" block
      steel: { type: Number, default: 180000 }, // per ton
      plaster: { type: Number, default: 450 }, // per m²
      paint: { type: Number, default: 650 }, // per liter
    },

    // Labour daily rates in LKR
    labourRates: {
      mason: { type: Number, default: 2500 },
      helper: { type: Number, default: 1500 },
      carpenter: { type: Number, default: 2200 },
      painter: { type: Number, default: 1800 },
      plumber: { type: Number, default: 2000 },
    },

    // Wastage factors as percentages
    wastageFactors: {
      cement: { type: Number, default: 5 },
      sand: { type: Number, default: 10 },
      aggregate: { type: Number, default: 8 },
      blocks: { type: Number, default: 3 },
      steel: { type: Number, default: 5 },
      paint: { type: Number, default: 10 },
    },

    includeWastage: { type: Boolean, default: true },

    region: {
      type: String,
      enum: [
        "western",
        "central",
        "southern",
        "northern",
        "eastern",
        "northwestern",
        "northcentral",
        "uva",
        "sabaragamuwa",
      ],
      default: "western",
    },
  },
  { timestamps: true },
);

const settingsModel =
  mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default settingsModel;
