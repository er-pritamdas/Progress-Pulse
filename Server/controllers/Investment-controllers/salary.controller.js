import Salary from "../../models/Investment-models/salary.model.js";

// ----------------------------------------------------------------------
// Get all salary records for the authenticated user
// ----------------------------------------------------------------------
export const getAllSalaries = async (req, res) => {
  try {
    const userId = req.user._id;
    const salaries = await Salary.find({ userId }).sort({ month: -1, createdAt: -1 });

    const formattedSalaries = salaries.map((item, idx) => ({
      ...item.toObject(),
      id: item._id.toString(),
      slNo: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      message: "Salaries retrieved successfully",
      data: formattedSalaries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch salaries",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Create new salary record
// ----------------------------------------------------------------------
export const createSalary = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      month,
      company,
      basicSalary = 0,
      hra = 0,
      flexi = 0,
      bonus = 0,
      erPf = 0,
      taxes = 0,
      gratuity = 0,
      variablePay = 0,
      ctc,
      notes = "",
    } = req.body;

    if (!month || !company) {
      return res.status(400).json({
        success: false,
        message: "Month and Company are required",
      });
    }

    const numBasic = Number(basicSalary) || 0;
    const numHra = Number(hra) || 0;
    const numFlexi = Number(flexi) || 0;
    const numBonus = Number(bonus) || 0;
    const numErPf = Number(erPf) || 0;
    const numTaxes = Number(taxes) || 0;
    const numGratuity = Number(gratuity) || 0;
    const numVarPay = Number(variablePay) || 0;

    // Gross(+E6e PF) = Basic + HRA + Flexi/RSA/Extras + Bonus
    const gross = numBasic + numHra + numFlexi + numBonus;
    // In Hand = Gross - (E6r PF + Taxes)
    const inHand = gross - (numErPf + numTaxes);
    // CTC = user provided or Gross + E6r PF + Gratuity + Variable Pay
    const calculatedCtc = ctc !== undefined && ctc !== null && ctc !== ""
      ? Number(ctc)
      : gross + numErPf + numGratuity + numVarPay;

    const newSalary = await Salary.create({
      userId,
      month,
      company,
      basicSalary: numBasic,
      hra: numHra,
      flexi: numFlexi,
      bonus: numBonus,
      gross,
      erPf: numErPf,
      taxes: numTaxes,
      inHand,
      gratuity: numGratuity,
      variablePay: numVarPay,
      ctc: calculatedCtc,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Salary record created successfully",
      data: {
        ...newSalary.toObject(),
        id: newSalary._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create salary record",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Update salary record
// ----------------------------------------------------------------------
export const updateSalary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const {
      month,
      company,
      basicSalary = 0,
      hra = 0,
      flexi = 0,
      bonus = 0,
      erPf = 0,
      taxes = 0,
      gratuity = 0,
      variablePay = 0,
      ctc,
      notes = "",
    } = req.body;

    const numBasic = Number(basicSalary) || 0;
    const numHra = Number(hra) || 0;
    const numFlexi = Number(flexi) || 0;
    const numBonus = Number(bonus) || 0;
    const numErPf = Number(erPf) || 0;
    const numTaxes = Number(taxes) || 0;
    const numGratuity = Number(gratuity) || 0;
    const numVarPay = Number(variablePay) || 0;

    const gross = numBasic + numHra + numFlexi + numBonus;
    const inHand = gross - (numErPf + numTaxes);
    const calculatedCtc = ctc !== undefined && ctc !== null && ctc !== ""
      ? Number(ctc)
      : gross + numErPf + numGratuity + numVarPay;

    const updated = await Salary.findOneAndUpdate(
      { _id: id, userId },
      {
        month,
        company,
        basicSalary: numBasic,
        hra: numHra,
        flexi: numFlexi,
        bonus: numBonus,
        gross,
        erPf: numErPf,
        taxes: numTaxes,
        inHand,
        gratuity: numGratuity,
        variablePay: numVarPay,
        ctc: calculatedCtc,
        notes,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary record updated successfully",
      data: {
        ...updated.toObject(),
        id: updated._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update salary record",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------
// Delete salary record
// ----------------------------------------------------------------------
export const deleteSalary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await Salary.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary record deleted successfully",
      data: { id: deleted._id.toString() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete salary record",
      error: error.message,
    });
  }
};
