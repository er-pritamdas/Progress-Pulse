import StockTrade from "../../models/Investment-models/stockTrade.model.js";

// ----------------------------------------------------------------------
// Get all stock trades for authenticated user
// ----------------------------------------------------------------------
export const getAllStockTrades = async (req, res) => {
  try {
    const userId = req.user._id;
    const trades = await StockTrade.find({ userId }).sort({ createdAt: -1 });

    // Format output with slNo and string id
    const formattedTrades = trades.map((trade, idx) => ({
      ...trade.toObject(),
      id: trade._id.toString(),
      slNo: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      message: "Stock trades retrieved successfully",
      data: formattedTrades,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock trades",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new stock trade entry
// ----------------------------------------------------------------------
export const createStockTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const tradeData = {
      ...req.body,
      userId,
    };

    delete tradeData.id; // Let Mongo generate _id

    const newTrade = await StockTrade.create(tradeData);

    return res.status(201).json({
      success: true,
      message: "Stock trade created successfully",
      data: {
        ...newTrade.toObject(),
        id: newTrade._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create stock trade",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update existing stock trade entry
// ----------------------------------------------------------------------
export const updateStockTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updatedTrade = await StockTrade.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTrade) {
      return res.status(404).json({
        success: false,
        message: "Stock trade entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock trade updated successfully",
      data: {
        ...updatedTrade.toObject(),
        id: updatedTrade._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update stock trade",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete stock trade entry
// ----------------------------------------------------------------------
export const deleteStockTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deletedTrade = await StockTrade.findOneAndDelete({ _id: id, userId });

    if (!deletedTrade) {
      return res.status(404).json({
        success: false,
        message: "Stock trade entry not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock trade deleted successfully",
      data: { id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete stock trade",
      error: error.message,
    });
  }
};
