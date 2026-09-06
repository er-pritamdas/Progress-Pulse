import PfWithdrawal from "../../models/Investment-models/pfWithdrawal.model.js";

// ----------------------------------------------------------------------
// Get all PF withdrawals for the authenticated user
// ----------------------------------------------------------------------
export const getAllPfWithdrawals = async (req, res) => {
  try {
    const userId = req.user._id;
    const withdrawals = await PfWithdrawal.find({ userId }).sort({ date: -1, createdAt: -1 });

    const formatted = withdrawals.map((item, idx) => ({
      ...item.toObject(),
      id: item._id.toString(),
      slNo: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      message: "PF withdrawals retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch PF withdrawals",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new PF withdrawal
// ----------------------------------------------------------------------
export const createPfWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, amount, reason = "General", notes = "" } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive withdrawal amount is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal date is required",
      });
    }

    const newWithdrawal = await PfWithdrawal.create({
      userId,
      date,
      amount: numAmount,
      reason: reason.trim() || "General",
      notes: notes.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "PF withdrawal recorded successfully",
      data: {
        ...newWithdrawal.toObject(),
        id: newWithdrawal._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record PF withdrawal",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update PF withdrawal
// ----------------------------------------------------------------------
export const updatePfWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { date, amount, reason, notes = "" } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive withdrawal amount is required",
      });
    }

    const updated = await PfWithdrawal.findOneAndUpdate(
      { _id: id, userId },
      {
        date,
        amount: numAmount,
        reason: (reason || "General").trim(),
        notes: (notes || "").trim(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "PF withdrawal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PF withdrawal updated successfully",
      data: {
        ...updated.toObject(),
        id: updated._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update PF withdrawal",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete PF withdrawal
// ----------------------------------------------------------------------
export const deletePfWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await PfWithdrawal.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "PF withdrawal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PF withdrawal deleted successfully",
      data: { id: deleted._id.toString() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete PF withdrawal",
      error: error.message,
    });
  }
};
