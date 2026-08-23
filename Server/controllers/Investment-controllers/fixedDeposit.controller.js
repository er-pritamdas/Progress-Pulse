import mongoose from "mongoose";
import FixedDeposit from "../../models/Investment-models/fixedDeposit.model.js";
import FixedDepositGroup from "../../models/Investment-models/fixedDepositGroup.model.js";

const formatFd = (fd) => {
  if (!fd) return null;
  const obj = fd.toObject ? fd.toObject() : fd;
  return {
    ...obj,
    id: (obj._id || obj.id)?.toString(),
    _id: (obj._id || obj.id)?.toString(),
  };
};

// ----------------------------------------------------------------------
// Get all Fixed Deposits for authenticated user
// ----------------------------------------------------------------------
export const getAllFixedDeposits = async (req, res) => {
  try {
    const userId = req.user._id;
    const fds = await FixedDeposit.find({ userId }).sort({ createdAt: -1 });
    const formatted = fds.map(formatFd);

    return res.status(200).json({
      success: true,
      message: "Fixed Deposits retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAllFixedDeposits:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fixed deposits",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new Fixed Deposit
// ----------------------------------------------------------------------
export const createFixedDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const fdData = {
      ...req.body,
      userId,
    };

    delete fdData.id;
    delete fdData._id;

    const newFd = await FixedDeposit.create(fdData);

    return res.status(201).json({
      success: true,
      message: "Fixed Deposit created successfully",
      data: formatFd(newFd),
    });
  } catch (error) {
    console.error("Error in createFixedDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create fixed deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update existing Fixed Deposit
// ----------------------------------------------------------------------
export const updateFixedDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Fixed Deposit ID: ${id}`,
      });
    }

    const updateBody = { ...req.body };
    delete updateBody.id;
    delete updateBody._id;
    delete updateBody.userId;
    delete updateBody.createdAt;
    delete updateBody.updatedAt;

    const updatedFd = await FixedDeposit.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateBody },
      { new: true, runValidators: false }
    );

    if (!updatedFd) {
      return res.status(404).json({
        success: false,
        message: "Fixed Deposit not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fixed Deposit updated successfully",
      data: formatFd(updatedFd),
    });
  } catch (error) {
    console.error("Error in updateFixedDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update fixed deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete Fixed Deposit
// ----------------------------------------------------------------------
export const deleteFixedDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Fixed Deposit ID: ${id}`,
      });
    }

    const deletedFd = await FixedDeposit.findOneAndDelete({ _id: id, userId });

    if (!deletedFd) {
      return res.status(404).json({
        success: false,
        message: "Fixed Deposit not found",
      });
    }

    // Also remove from any user FD groups
    await FixedDepositGroup.updateMany(
      { userId },
      { $pull: { "groups.$[].fdIds": id } }
    );

    return res.status(200).json({
      success: true,
      message: "Fixed Deposit deleted successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error in deleteFixedDeposit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete fixed deposit",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Custom FD Groups: Get all groups
// ----------------------------------------------------------------------
export const getFixedDepositGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const userGroups = await FixedDepositGroup.findOne({ userId });

    return res.status(200).json({
      success: true,
      data: userGroups ? userGroups.groups : [],
    });
  } catch (error) {
    console.error("Error in getFixedDepositGroups:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Fixed Deposit groups",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Custom FD Groups: Update groups
// ----------------------------------------------------------------------
export const updateFixedDepositGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groups } = req.body;

    const updated = await FixedDepositGroup.findOneAndUpdate(
      { userId },
      { $set: { groups } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Fixed Deposit groups saved successfully",
      data: updated.groups,
    });
  } catch (error) {
    console.error("Error in updateFixedDepositGroups:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save Fixed Deposit groups",
      error: error.message,
    });
  }
};
