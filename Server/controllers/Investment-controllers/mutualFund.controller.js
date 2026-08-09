import MutualFund from "../../models/Investment-models/mutualFund.model.js";

// Helper to format fund object
const formatFund = (fund) => {
  const obj = fund.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    transactions: (obj.transactions || []).map((t) => ({
      ...t,
      id: t._id.toString(),
    })),
  };
};

// ----------------------------------------------------------------------
// Get all Mutual Funds for authenticated user
// ----------------------------------------------------------------------
export const getAllMutualFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const funds = await MutualFund.find({ userId }).sort({ createdAt: -1 });

    const formattedFunds = funds.map(formatFund);

    return res.status(200).json({
      success: true,
      message: "Mutual Funds retrieved successfully",
      data: formattedFunds,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mutual funds",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new Mutual Fund entry
// ----------------------------------------------------------------------
export const createMutualFund = async (req, res) => {
  try {
    const userId = req.user._id;
    const fundData = {
      ...req.body,
      userId,
    };

    delete fundData.id;
    delete fundData._id;

    const newFund = await MutualFund.create(fundData);

    return res.status(201).json({
      success: true,
      message: "Mutual Fund created successfully",
      data: formatFund(newFund),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create mutual fund",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update existing Mutual Fund entry
// ----------------------------------------------------------------------
export const updateMutualFund = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updateBody = { ...req.body };
    delete updateBody.id;
    delete updateBody._id;

    const updatedFund = await MutualFund.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateBody },
      { new: true, runValidators: true }
    );

    if (!updatedFund) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mutual Fund updated successfully",
      data: formatFund(updatedFund),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update mutual fund",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete Mutual Fund entry
// ----------------------------------------------------------------------
export const deleteMutualFund = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deletedFund = await MutualFund.findOneAndDelete({ _id: id, userId });

    if (!deletedFund) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mutual Fund deleted successfully",
      data: { id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete mutual fund",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Add SIP Transaction to Fund
// ----------------------------------------------------------------------
export const addSipTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const txnData = { ...req.body };
    delete txnData.id;
    delete txnData._id;

    const updatedFund = await MutualFund.findOneAndUpdate(
      { _id: id, userId },
      { $push: { transactions: { $each: [txnData], $position: 0 } } },
      { new: true, runValidators: true }
    );

    if (!updatedFund) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SIP transaction added successfully",
      data: formatFund(updatedFund),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add SIP transaction",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update SIP Transaction in Fund
// ----------------------------------------------------------------------
export const updateSipTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, txnId } = req.params;

    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== "id" && key !== "_id") {
        updateFields[`transactions.$.${key}`] = value;
      }
    }

    const updatedFund = await MutualFund.findOneAndUpdate(
      { _id: id, userId, "transactions._id": txnId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedFund) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund or transaction not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SIP transaction updated successfully",
      data: formatFund(updatedFund),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update SIP transaction",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete SIP Transaction from Fund
// ----------------------------------------------------------------------
export const deleteSipTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, txnId } = req.params;

    const updatedFund = await MutualFund.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { transactions: { _id: txnId } } },
      { new: true }
    );

    if (!updatedFund) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SIP transaction deleted successfully",
      data: formatFund(updatedFund),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete SIP transaction",
      error: error.message,
    });
  }
};
