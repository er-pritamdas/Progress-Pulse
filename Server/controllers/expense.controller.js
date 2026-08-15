import ExpenseTransaction from "../models/Expense-models/expenseTransaction.model.js";
import ExpenseCategory from "../models/Expense-models/expenseCategory.model.js";
import PaymentSource from "../models/Expense-models/paymentSource.model.js";
import MonthlyBudget from "../models/Expense-models/monthlyBudget.model.js";

// Utility to get start and end of month
const getMonthDateRange = (monthStr) => {
    // monthStr format: "YYYY-MM"
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
};

// ---------------------- Dashboard Data ----------------------

export const getDashboardData = async (req, res) => {
    try {
        const { _id: userId } = req.user; // Assuming auth middleware adds user
        const { month, fromMonth, toMonth, all } = req.query; // Format: "YYYY-MM"

        let startDate, endDate, monthsList = [];

        if (all === 'true' || month === 'all') {
            startDate = new Date(0);
            endDate = new Date(2100, 0, 1);
            monthsList = [new Date().toISOString().slice(0, 7)];
        } else if (fromMonth && toMonth) {
            const [fromY, fromM] = fromMonth.split('-').map(Number);
            const [toY, toM] = toMonth.split('-').map(Number);
            startDate = new Date(fromY, fromM - 1, 1);
            endDate = new Date(toY, toM, 0, 23, 59, 59, 999);

            // Construct list of YYYY-MM months in date range
            let currYear = fromY;
            let currMonth = fromM;
            while (currYear < toY || (currYear === toY && currMonth <= toM)) {
                monthsList.push(`${currYear}-${String(currMonth).padStart(2, '0')}`);
                currMonth++;
                if (currMonth > 12) {
                    currMonth = 1;
                    currYear++;
                }
            }
        } else {
            const targetMonth = month || new Date().toISOString().slice(0, 7);
            monthsList = [targetMonth];
            const range = getMonthDateRange(targetMonth);
            startDate = range.startDate;
            endDate = range.endDate;
        }

        // Fetch all data in parallel
        let [categories, sources, salaryData, transactions] = await Promise.all([
            // Find all categories for user
            ExpenseCategory.find({ userId }).sort({ order: 1, createdAt: 1 }).lean(),
            PaymentSource.find({ userId }).sort({ createdAt: 1 }),
            MonthlyBudget.findOne({ userId, month: monthsList[monthsList.length - 1] }),
            ExpenseTransaction.find({
                userId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 }).populate('sourceId', 'name color type balance').populate('targetSourceId', 'name color type balance').populate('categoryId', 'name color')
        ]);

        // Keep full subcategories data intact for month-by-month analysis

        // Calculate "Spent" for Card type sources (in the date range)
        const updatedSources = sources.map(source => {
            if (source.type === "Card") {
                const monthlySpend = transactions
                    .filter(t => t.sourceId?._id?.toString() === source._id?.toString() && t.type === "Debit")
                    .reduce((sum, t) => sum + t.amount, 0);
                return { ...source.toObject(), spent: monthlySpend };
            }
            return source.toObject(); // Bank/Wallet show native balance
        });

        const targetMonth = monthsList[monthsList.length - 1];
        let effectiveSalary = 0;

        // Check if there is a previous month budget for this user
        const prevBudget = await MonthlyBudget.findOne({
            userId,
            month: { $lt: targetMonth }
        }).sort({ month: -1 });

        if (salaryData && salaryData.salary !== 86500) {
            effectiveSalary = salaryData.salary;
        } else if (prevBudget) {
            // Inherit from most recent previous month (overriding stale 86500 default)
            effectiveSalary = prevBudget.salary;
            await MonthlyBudget.findOneAndUpdate(
                { userId, month: targetMonth },
                { salary: effectiveSalary },
                { upsert: true, new: true }
            );
        } else if (salaryData) {
            effectiveSalary = salaryData.salary;
        } else {
            effectiveSalary = 0;
        }

        res.status(200).json({
            success: true,
            data: {
                categories,
                sources: updatedSources,
                salary: effectiveSalary,
                transactions,
                months: monthsList
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------- Salary / Budget ----------------------

export const updateSalary = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { month, salary } = req.body;

        if (!month || salary === undefined) {
            return res.status(400).json({ success: false, message: "Month and Salary are required" });
        }

        const newSalary = Number(salary);

        const budget = await MonthlyBudget.findOneAndUpdate(
            { userId, month },
            { salary: newSalary },
            { new: true, upsert: true }
        );

        // Update any future month documents in DB that carry the stale 86500 default
        await MonthlyBudget.updateMany(
            { userId, month: { $gt: month }, salary: 86500 },
            { salary: newSalary }
        );

        res.status(200).json({ success: true, data: budget });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------- Categories & SubCategories ----------------------

export const createCategory = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { name, month, color, subCategories } = req.body;

        const subs = Array.isArray(subCategories)
            ? subCategories
                .filter(s => s && s.name && s.name.trim())
                .map(s => ({
                    name: s.name.trim(),
                    budget: Number(s.budget) || 0,
                    month
                }))
            : [];

        // If month is provided, create for that month. If not, it's global.
        const category = await ExpenseCategory.create({ userId, name, month, color, subCategories: subs });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Category already exists in this month" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (color !== undefined) updateData.color = color;

        const category = await ExpenseCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Check if transactions exist for this category?
        // For now, just delete.
        await ExpenseCategory.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addSubCategory = async (req, res) => {
    try {
        const { id } = req.params; // Category ID
        const { name, budget, month } = req.body;

        const category = await ExpenseCategory.findById(id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        category.subCategories.push({ name, budget, month }); // Save month if provided
        await category.save();

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSubCategory = async (req, res) => {
    try {
        const { id, subId } = req.params; // Category ID, SubCategory ID
        const { name, budget } = req.body;

        const category = await ExpenseCategory.findOneAndUpdate(
            { _id: id, "subCategories._id": subId },
            {
                $set: {
                    "subCategories.$.name": name,
                    "subCategories.$.budget": budget
                }
            },
            { new: true }
        );

        if (!category) return res.status(404).json({ success: false, message: "Category or SubCategory not found" });

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSubCategory = async (req, res) => {
    try {
        const { id, subId } = req.params;

        const category = await ExpenseCategory.findByIdAndUpdate(
            id,
            { $pull: { subCategories: { _id: subId } } },
            { new: true }
        );

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderCategories = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { categoryIds } = req.body;

        if (!Array.isArray(categoryIds)) {
            return res.status(400).json({ success: false, message: "categoryIds must be an array" });
        }

        const bulkOps = categoryIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, userId },
                update: { $set: { order: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await ExpenseCategory.bulkWrite(bulkOps);
        }

        res.status(200).json({ success: true, message: "Categories reordered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderSubCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const { subCategoryIds } = req.body;

        if (!Array.isArray(subCategoryIds)) {
            return res.status(400).json({ success: false, message: "subCategoryIds must be an array" });
        }

        const category = await ExpenseCategory.findById(id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const subMap = new Map(category.subCategories.map(sub => [sub._id.toString(), sub]));

        const reorderedSubs = [];
        subCategoryIds.forEach((subId, index) => {
            const sub = subMap.get(subId.toString());
            if (sub) {
                sub.order = index;
                reorderedSubs.push(sub);
                subMap.delete(subId.toString());
            }
        });

        subMap.forEach(sub => reorderedSubs.push(sub));

        category.subCategories = reorderedSubs;
        await category.save();

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------- Money Sources ----------------------

export const createSource = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { name, type, balance, limit, color } = req.body;

        const source = await PaymentSource.create({
            userId,
            name,
            type,
            balance: balance ? Number(balance) : 0,
            limit: limit ? Number(limit) : 0,
            color: color || ""
        });
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Source already exists" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSource = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, balance, limit, color } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (balance !== undefined) updateData.balance = Number(balance);
        if (limit !== undefined) updateData.limit = Number(limit);
        if (color !== undefined) updateData.color = color;

        const source = await PaymentSource.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        res.status(200).json({ success: true, data: source });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSource = async (req, res) => {
    try {
        const { id } = req.params;
        await PaymentSource.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Source deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------- Transactions ----------------------

export const addTransaction = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { date, description, sourceId, targetSourceId, categoryId, subCategoryId, amount, type, isReimbursable } = req.body;

        const cleanSourceId = typeof sourceId === 'object' && sourceId !== null ? sourceId._id : sourceId;
        const cleanTargetId = typeof targetSourceId === 'object' && targetSourceId !== null ? targetSourceId._id : targetSourceId;
        const cleanCatId = typeof categoryId === 'object' && categoryId !== null ? categoryId._id : categoryId;
        const cleanSubCatId = typeof subCategoryId === 'object' && subCategoryId !== null ? subCategoryId._id : subCategoryId;

        const transactionType = type || "Debit";
        const numAmount = Number(amount || 0);

        const transaction = await ExpenseTransaction.create({
            userId,
            date: date || new Date(),
            description,
            sourceId: cleanSourceId,
            targetSourceId: transactionType === "Transfer" ? cleanTargetId : undefined,
            categoryId: transactionType === "Debit" ? cleanCatId : undefined,
            subCategoryId: transactionType === "Debit" ? cleanSubCatId : undefined,
            amount: numAmount,
            type: transactionType,
            isReimbursable: isReimbursable || false
        });

        // Atomic balance update
        if (transactionType === "Transfer") {
            if (cleanSourceId) await PaymentSource.findByIdAndUpdate(cleanSourceId, { $inc: { balance: -numAmount } });
            if (cleanTargetId) await PaymentSource.findByIdAndUpdate(cleanTargetId, { $inc: { balance: numAmount } });
        } else if (transactionType === "Credit") {
            if (cleanSourceId) await PaymentSource.findByIdAndUpdate(cleanSourceId, { $inc: { balance: numAmount } });
        } else {
            // Debit
            if (cleanSourceId) await PaymentSource.findByIdAndUpdate(cleanSourceId, { $inc: { balance: -numAmount } });
        }

        await transaction.populate('sourceId', 'name color type balance limit');
        if (transactionType === "Transfer") {
            await transaction.populate('targetSourceId', 'name color type balance limit');
        }
        if (transactionType === "Debit") {
            await transaction.populate('categoryId', 'name color');
        }

        const sources = await PaymentSource.find({ userId }).sort({ createdAt: 1 });

        res.status(201).json({ success: true, data: transaction, sources });
    } catch (error) {
        console.error("Add Transaction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, description, sourceId, targetSourceId, categoryId, subCategoryId, amount, type, isReimbursable } = req.body;

        const cleanSourceId = typeof sourceId === 'object' && sourceId !== null ? sourceId._id : sourceId;
        const cleanTargetId = typeof targetSourceId === 'object' && targetSourceId !== null ? targetSourceId._id : targetSourceId;
        const cleanCatId = typeof categoryId === 'object' && categoryId !== null ? categoryId._id : categoryId;
        const cleanSubCatId = typeof subCategoryId === 'object' && subCategoryId !== null ? subCategoryId._id : subCategoryId;

        const oldTransaction = await ExpenseTransaction.findById(id);
        if (!oldTransaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // 1. Revert old transaction balance changes
        const oldSrcId = oldTransaction.sourceId;
        const oldTrgId = oldTransaction.targetSourceId;
        const oldAmt = Number(oldTransaction.amount || 0);

        if (oldTransaction.type === "Transfer") {
            if (oldSrcId) await PaymentSource.findByIdAndUpdate(oldSrcId, { $inc: { balance: oldAmt } });
            if (oldTrgId) await PaymentSource.findByIdAndUpdate(oldTrgId, { $inc: { balance: -oldAmt } });
        } else if (oldTransaction.type === "Credit") {
            if (oldSrcId) await PaymentSource.findByIdAndUpdate(oldSrcId, { $inc: { balance: -oldAmt } });
        } else {
            // Debit
            if (oldSrcId) await PaymentSource.findByIdAndUpdate(oldSrcId, { $inc: { balance: oldAmt } });
        }

        // 2. Prepare update payload
        const newType = type || oldTransaction.type || "Debit";
        const newAmt = Number(amount !== undefined ? amount : oldTransaction.amount);

        const updateFields = {
            date: date || oldTransaction.date,
            description: description !== undefined ? description : oldTransaction.description,
            sourceId: cleanSourceId || oldTransaction.sourceId,
            targetSourceId: newType === "Transfer" ? (cleanTargetId || null) : null,
            categoryId: newType === "Debit" ? (cleanCatId || null) : null,
            subCategoryId: newType === "Debit" ? (cleanSubCatId || null) : null,
            amount: newAmt,
            type: newType,
            isReimbursable: isReimbursable !== undefined ? isReimbursable : oldTransaction.isReimbursable
        };

        const transaction = await ExpenseTransaction.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        // 3. Apply new transaction balance changes
        const newSrcId = transaction.sourceId;
        const newTrgId = transaction.targetSourceId;

        if (transaction.type === "Transfer") {
            if (newSrcId) await PaymentSource.findByIdAndUpdate(newSrcId, { $inc: { balance: -newAmt } });
            if (newTrgId) await PaymentSource.findByIdAndUpdate(newTrgId, { $inc: { balance: newAmt } });
        } else if (transaction.type === "Credit") {
            if (newSrcId) await PaymentSource.findByIdAndUpdate(newSrcId, { $inc: { balance: newAmt } });
        } else {
            // Debit
            if (newSrcId) await PaymentSource.findByIdAndUpdate(newSrcId, { $inc: { balance: -newAmt } });
        }

        // 4. Populate for UI response
        await transaction.populate('sourceId', 'name color type balance limit');
        if (transaction.type === "Transfer") {
            await transaction.populate('targetSourceId', 'name color type balance limit');
        }
        if (transaction.type === "Debit") {
            await transaction.populate('categoryId', 'name color');
        }

        const userId = oldTransaction.userId;
        const sources = await PaymentSource.find({ userId }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: transaction, sources });
    } catch (error) {
        console.error("Update Transaction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await ExpenseTransaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        const srcId = transaction.sourceId;
        const trgId = transaction.targetSourceId;
        const amt = Number(transaction.amount || 0);

        if (transaction.type === "Transfer") {
            if (srcId) await PaymentSource.findByIdAndUpdate(srcId, { $inc: { balance: amt } });
            if (trgId) await PaymentSource.findByIdAndUpdate(trgId, { $inc: { balance: -amt } });
        } else if (transaction.type === "Credit") {
            if (srcId) await PaymentSource.findByIdAndUpdate(srcId, { $inc: { balance: -amt } });
        } else {
            // Debit
            if (srcId) await PaymentSource.findByIdAndUpdate(srcId, { $inc: { balance: amt } });
        }

        await ExpenseTransaction.findByIdAndDelete(id);

        const sources = await PaymentSource.find({ userId: transaction.userId }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, message: "Transaction deleted", data: { id, sources } });
    } catch (error) {
        console.error("Delete Transaction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const copyCategoriesFromLastMonth = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { currentMonth } = req.body; // "YYYY-MM"

        if (!currentMonth) {
            return res.status(400).json({ success: false, message: "Target month is required" });
        }

        // Calculate Previous Month
        const [year, month] = currentMonth.split('-').map(Number);
        const previousDate = new Date(year, month - 2); // month is 1-indexed in split, Date is 0-indexed. month-1 is current, month-2 is previous.
        const prevYear = previousDate.getFullYear();
        const prevMonthVal = previousDate.getMonth() + 1;
        const previousMonthStr = `${prevYear}-${String(prevMonthVal).padStart(2, '0')}`;

        // Fetch Previous Month's Categories
        const prevCategories = await ExpenseCategory.find({ userId, month: previousMonthStr }).lean();

        if (prevCategories.length === 0) {
            return res.status(404).json({ success: false, message: `No categories found for ${previousMonthStr}` });
        }

        // Fetch Current Month's Categories to avoid duplicates
        const currentCategories = await ExpenseCategory.find({ userId, month: currentMonth }).select('name').lean();
        const existingNames = new Set(currentCategories.map(c => c.name));

        // Filter categories to copy
        const categoriesToCopy = prevCategories
            .filter(cat => !existingNames.has(cat.name))
            .map(cat => ({
                userId,
                name: cat.name,
                month: currentMonth,
                subCategories: cat.subCategories.map(sub => ({
                    name: sub.name,
                    budget: sub.budget,
                    month: currentMonth
                }))
            }));

        if (categoriesToCopy.length === 0) {
            return res.status(200).json({ success: true, message: "All categories already exist in the current month" });
        }

        // Insert New Categories
        await ExpenseCategory.insertMany(categoriesToCopy);

        res.status(200).json({ success: true, message: `Successfully copied ${categoriesToCopy.length} categories from ${previousMonthStr}`, data: categoriesToCopy });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
