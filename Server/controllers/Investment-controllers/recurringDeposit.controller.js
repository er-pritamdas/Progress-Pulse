import mongoose from "mongoose";
import RecurringDeposit from "../../models/Investment-models/recurringDeposit.model.js";
import RecurringDepositGroup from "../../models/Investment-models/recurringDepositGroup.model.js";

const formatRd = (rd) => {
  if (!rd) return null;
  const obj = rd.toObject ? rd.toObject() : rd;
  return {
    ...obj,
    id: (obj._id || obj.id)?.toString(),
    _id: (obj._id || obj.id)?.toString(),
    transactions: (obj.transactions || []).map((t) => ({
      ...t,
      id: (t._id || t.id)?.toString(),
      _id: (t._id || t.id)?.toString(),
    })),
  };
};

// ----------------------------------------------------------------------
// Get all Recurring Deposits for authenticated user
// ----------------------------------------------------------------------
export const getAllRecurringDeposits = async (req, res) => {
  try {
    const userId = req.user._id;
    const rds = await RecurringDeposit.find({ userId }).sort({ createdAt: -1 });
    const formatted = rds.map(formatRd);

    return res.status(200).json({
      success: true,
      message: "Recurring Deposits retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAllRecurringDeposits:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recurring deposits",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new Recurring Deposit
// ----------------------------------------------------------------------
export const createRecurringDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const rdData = {
      ...req.body,
      userId,
    };

    delete rdData.id;
    delete rdData._id;

    if (!rdData.transactions) {
      rdData.transactions = [];
    }

    const totalAmount = rdData.transactions.reduce(
      (sum, t) => sum + Number(t.amount || t.amtDeposit || 0),
      0
    );
    rdData.amount = totalAmount;

    const newRd = await RecurringDeposit.create(rdData);

    return res.status(201).json({
      success: true,
      message: "Recurring Deposit created successfully",
      data: formatRd(newRd),
    });
  } catch (error) {
    console.error("Error in createRecurringDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create recurring deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update existing Recurring Deposit
// ----------------------------------------------------------------------
export const updateRecurringDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Recurring Deposit ID: ${id}`,
      });
    }

    const updateBody = { ...req.body };
    delete updateBody.id;
    delete updateBody._id;
    delete updateBody.userId;
    delete updateBody.createdAt;
    delete updateBody.updatedAt;

    const updatedRd = await RecurringDeposit.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateBody },
      { new: true, runValidators: false }
    );

    if (!updatedRd) {
      return res.status(404).json({
        success: false,
        message: "Recurring Deposit not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recurring Deposit updated successfully",
      data: formatRd(updatedRd),
    });
  } catch (error) {
    console.error("Error in updateRecurringDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update recurring deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete Recurring Deposit
// ----------------------------------------------------------------------
export const deleteRecurringDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Recurring Deposit ID: ${id}`,
      });
    }

    const deletedRd = await RecurringDeposit.findOneAndDelete({ _id: id, userId });

    if (!deletedRd) {
      return res.status(404).json({
        success: false,
        message: "Recurring Deposit not found",
      });
    }

    // Also remove from any user RD groups
    await RecurringDepositGroup.updateMany(
      { userId },
      { $pull: { "groups.$[].rdIds": id } }
    );

    return res.status(200).json({
      success: true,
      message: "Recurring Deposit deleted successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error in deleteRecurringDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete recurring deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Add Deposit Transaction to RD
// ----------------------------------------------------------------------
export const addRdDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const txnData = { ...req.body };
    delete txnData.id;
    delete txnData._id;

    if (txnData.amount !== undefined && txnData.amtDeposit === undefined) {
      txnData.amtDeposit = Number(txnData.amount);
    }
    if (txnData.amtDeposit !== undefined && txnData.amount === undefined) {
      txnData.amount = Number(txnData.amtDeposit);
    }

    const updatedRd = await RecurringDeposit.findOneAndUpdate(
      { _id: id, userId },
      { $push: { transactions: { $each: [txnData], $position: 0 } } },
      { new: true, runValidators: false }
    );

    if (!updatedRd) {
      return res.status(404).json({
        success: false,
        message: "Recurring Deposit entry not found or unauthorized",
      });
    }

    // Recalculate total amount from transactions
    const totalAmount = (updatedRd.transactions || []).reduce(
      (sum, t) => sum + (Number(t.amount || t.amtDeposit || 0)),
      0
    );
    updatedRd.amount = totalAmount;
    await updatedRd.save();

    return res.status(200).json({
      success: true,
      message: "Deposit added successfully",
      data: formatRd(updatedRd),
    });
  } catch (error) {
    console.error("Error in addRdDeposit:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add deposit transaction",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update Deposit Transaction in RD
// ----------------------------------------------------------------------
export const updateRdDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, txnId } = req.params;

    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== "id" && key !== "_id") {
        updateFields[`transactions.$.${key}`] = value;
      }
    }

    if (req.body.amount !== undefined) {
      updateFields["transactions.$.amtDeposit"] = Number(req.body.amount);
    }
    if (req.body.amtDeposit !== undefined) {
      updateFields["transactions.$.amount"] = Number(req.body.amtDeposit);
    }

    const updatedRd = await RecurringDeposit.findOneAndUpdate(
      { _id: id, userId, "transactions._id": txnId },
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    if (!updatedRd) {
      return res.status(404).json({
        success: false,
        message: "Recurring Deposit or transaction not found",
      });
    }

    // Recalculate total amount
    const totalAmount = (updatedRd.transactions || []).reduce(
      (sum, t) => sum + (Number(t.amount || t.amtDeposit || 0)),
      0
    );
    updatedRd.amount = totalAmount;
    await updatedRd.save();

    return res.status(200).json({
      success: true,
      message: "Deposit transaction updated successfully",
      data: formatRd(updatedRd),
    });
  } catch (error) {
    console.error("Error in updateRdDeposit:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update deposit transaction",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete Deposit Transaction in RD
// ----------------------------------------------------------------------
export const deleteRdDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, txnId } = req.params;

    const updatedRd = await RecurringDeposit.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { transactions: { _id: txnId } } },
      { new: true }
    );

    if (!updatedRd) {
      return res.status(404).json({
        success: false,
        message: "Recurring Deposit entry not found",
      });
    }

    // Recalculate total amount
    const totalAmount = (updatedRd.transactions || []).reduce(
      (sum, t) => sum + (Number(t.amount || t.amtDeposit || 0)),
      0
    );
    updatedRd.amount = totalAmount;
    await updatedRd.save();

    return res.status(200).json({
      success: true,
      message: "Deposit transaction deleted successfully",
      data: formatRd(updatedRd),
    });
  } catch (error) {
    console.error("Error in deleteRdDeposit:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete deposit transaction",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Custom RD Groups: Get all groups
// ----------------------------------------------------------------------
export const getRecurringDepositGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const userGroups = await RecurringDepositGroup.findOne({ userId });

    return res.status(200).json({
      success: true,
      data: userGroups ? userGroups.groups : [],
    });
  } catch (error) {
    console.error("Error in getRecurringDepositGroups:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Recurring Deposit groups",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Custom RD Groups: Update groups
// ----------------------------------------------------------------------
export const updateRecurringDepositGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groups } = req.body;

    const updated = await RecurringDepositGroup.findOneAndUpdate(
      { userId },
      { $set: { groups } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Recurring Deposit groups saved successfully",
      data: updated.groups,
    });
  } catch (error) {
    console.error("Error in updateRecurringDepositGroups:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save Recurring Deposit groups",
      error: error.message,
    });
  }
};
