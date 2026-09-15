import mongoose from "mongoose";
import InvestmentPlan from "../../models/Investment-models/investmentPlan.model.js";

const formatPlan = (plan) => {
  if (!plan) return null;
  const obj = plan.toObject ? plan.toObject() : plan;
  const stringId = (obj._id || obj.id)?.toString();
  return {
    ...obj,
    id: stringId,
    _id: stringId,
    customId: obj.customId || stringId,
  };
};

const getFindQuery = (id, userId) => {
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $and: [
        { userId: userObjectId },
        {
          $or: [
            { _id: new mongoose.Types.ObjectId(id) },
            { customId: String(id) },
          ],
        },
      ],
    };
  }
  return { customId: String(id), userId: userObjectId };
};

// ----------------------------------------------------------------------
// 1. Get all Investment Plans for authenticated user
// ----------------------------------------------------------------------
export const getAllInvestmentPlans = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const plans = await InvestmentPlan.find({ userId }).sort({ order: 1, createdAt: -1 });
    const formatted = plans.map(formatPlan);

    return res.status(200).json({
      success: true,
      message: "Investment Plans retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAllInvestmentPlans:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch investment plans",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// 2. Create a new Investment Plan
// ----------------------------------------------------------------------
export const createInvestmentPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const planData = { ...req.body, userId };

    const customId = planData.id || planData.customId;
    delete planData.id;
    delete planData._id;

    if (!planData.title || !planData.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan title is required",
      });
    }

    const newObjectId = new mongoose.Types.ObjectId();
    planData._id = newObjectId;
    planData.customId = customId ? String(customId) : newObjectId.toString();

    const createdPlan = await InvestmentPlan.create(planData);

    return res.status(201).json({
      success: true,
      message: "Investment Plan created successfully",
      data: formatPlan(createdPlan),
    });
  } catch (error) {
    console.error("Error in createInvestmentPlan:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create investment plan",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// 3. Update an existing Investment Plan
// ----------------------------------------------------------------------
export const updateInvestmentPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const updateBody = { ...req.body };
    delete updateBody.id;
    delete updateBody._id;
    delete updateBody.userId;
    delete updateBody.createdAt;
    delete updateBody.updatedAt;

    const query = getFindQuery(id, userId);

    const updatedPlan = await InvestmentPlan.findOneAndUpdate(
      query,
      { $set: updateBody },
      { new: true, runValidators: false }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: "Investment Plan not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Investment Plan updated successfully",
      data: formatPlan(updatedPlan),
    });
  } catch (error) {
    console.error("Error in updateInvestmentPlan:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update investment plan",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// 4. Delete an Investment Plan
// ----------------------------------------------------------------------
export const deleteInvestmentPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const query = getFindQuery(id, userId);
    const deletedPlan = await InvestmentPlan.findOneAndDelete(query);

    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: "Investment Plan not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Investment Plan deleted successfully",
      data: { id, _id: deletedPlan._id?.toString() },
    });
  } catch (error) {
    console.error("Error in deleteInvestmentPlan:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete investment plan",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// 5. Clear all allocations for a specific plan
// ----------------------------------------------------------------------
export const clearPlanAllocations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const query = getFindQuery(id, userId);

    const clearedPlan = await InvestmentPlan.findOneAndUpdate(
      query,
      {
        $set: {
          allocations: {},
          projections: {},
          selectedBanks: [],
          allocatedBanks: [],
          selectedStocks: [],
          allocatedStocks: [],
          selectedMfs: [],
          allocatedMfs: [],
          selectedFds: [],
          allocatedFds: [],
          selectedRds: [],
          allocatedRds: [],
          includePf: false,
          pfAllocatedPercent: 0,
          pfAllocation: { enabled: false, percentage: 0 },
        },
      },
      { new: true }
    );

    if (!clearedPlan) {
      return res.status(404).json({
        success: false,
        message: "Investment Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan allocations cleared successfully",
      data: formatPlan(clearedPlan),
    });
  } catch (error) {
    console.error("Error in clearPlanAllocations:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear plan allocations",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// 6. Bulk Sync / Import Plans (Migrates local storage plans to DB)
// ----------------------------------------------------------------------
export const syncInvestmentPlans = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const { plans } = req.body;
    if (!Array.isArray(plans) || plans.length === 0) {
      const existing = await InvestmentPlan.find({ userId }).sort({ order: 1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "No plans to sync",
        data: existing.map(formatPlan),
      });
    }

    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      if (!p.title) continue;

      const customId = String(p.id || p.customId || `goal-${Date.now()}-${i}`);
      const planPayload = {
        userId,
        customId,
        title: p.title,
        icon: p.icon || "🎯",
        category: p.category || "custom",
        targetAmount: Number(p.targetAmount) || 0,
        targetDate: p.targetDate || "",
        notes: p.notes || "",
        allocations: p.allocations || {},
        selectedBanks: p.selectedBanks || p.allocatedBanks || [],
        allocatedBanks: p.allocatedBanks || p.selectedBanks || [],
        selectedStocks: p.selectedStocks || p.allocatedStocks || [],
        allocatedStocks: p.allocatedStocks || p.selectedStocks || [],
        selectedMfs: p.selectedMfs || p.allocatedMfs || [],
        allocatedMfs: p.allocatedMfs || p.selectedMfs || [],
        selectedFds: p.selectedFds || p.allocatedFds || [],
        allocatedFds: p.allocatedFds || p.selectedFds || [],
        selectedRds: p.selectedRds || p.allocatedRds || [],
        allocatedRds: p.allocatedRds || p.selectedRds || [],
        includePf: p.includePf ?? false,
        pfAllocatedPercent: Number(p.pfAllocatedPercent) || 0,
        pfAllocation: p.pfAllocation || { enabled: false, percentage: 0 },
        order: p.order !== undefined ? Number(p.order) : i,
      };

      const query = getFindQuery(customId, userId);

      await InvestmentPlan.findOneAndUpdate(query, { $set: planPayload }, { upsert: true, new: true });
    }

    const synced = await InvestmentPlan.find({ userId }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Investment Plans synced successfully",
      data: synced.map(formatPlan),
    });
  } catch (error) {
    console.error("Error in syncInvestmentPlans:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to sync investment plans",
      error: error.message,
    });
  }
};
