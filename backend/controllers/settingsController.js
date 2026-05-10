import settingsModel from "../models/settingsModel.js";


//  Returns the current user's settings.
//  If they don't have any yet, creates a default doc and returns it.

export const getSettings = async (req, res) => {
  try {
    const userId = req.userId;

    let settings = await settingsModel.findOne({ userId });

    if (!settings) {
      // First time this user opens settings — create with defaults.
      settings = new settingsModel({ userId });
      await settings.save();
    }

    return res.json({ success: true, settings });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//  Save / update the user's settings
export const saveSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      materialRates,
      labourRates,
      wastageFactors,
      includeWastage,
      region,
    } = req.body;

    // Build the update object, including only sent fields
    const update = {};
    if (materialRates !== undefined) update.materialRates = materialRates;
    if (labourRates !== undefined) update.labourRates = labourRates;
    if (wastageFactors !== undefined) update.wastageFactors = wastageFactors;
    if (includeWastage !== undefined) update.includeWastage = includeWastage;
    if (region !== undefined) update.region = region;

    // upsert: true → if no settings exist for this user, create one
    // new: true    → return the updated document, not the old one.
    const settings = await settingsModel.findOneAndUpdate(
      { userId },
      { $set: update, $setOnInsert: { userId } },
      { upsert: true, new: true, runValidators: true },
    );

    return res.json({ success: true, message: "Settings saved", settings });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//  Deletes the user's settings doc, so next GET returns defaults
export const resetSettings = async (req, res) => {
  try {
    const userId = req.userId;

    await settingsModel.deleteOne({ userId });

    // Create fresh defaults
    const settings = new settingsModel({ userId });
    await settings.save();

    return res.json({
      success: true,
      message: "Settings reset to defaults",
      settings,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
