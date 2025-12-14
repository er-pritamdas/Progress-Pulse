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
        const { month } = req.query; // Format: "YYYY-MM"

        if (!month) {
            return res.status(400).json({ success: false, message: "Month is required (YYYY-MM)" });
        }

        const { startDate, endDate } = getMonthDateRange(month);

        // Check and Seed Default Data if user is new (has no categories)
        const categoryCount = await ExpenseCategory.countDocuments({ userId });
        if (categoryCount === 0) {
            const defaultCategories = [
                {
                    name: "Household & Living 🏠",
                    subCategories: [
                        { name: "House Rent", budget: 15000 },
                        { name: "Electricity Bill", budget: 1500 },
                        { name: "Water Bill", budget: 300 },
                        { name: "Gas (LPG)", budget: 1200 },
                        { name: "Maintenance", budget: 2000 },
                        { name: "Internet / WiFi", budget: 1000 }
                    ]
                },
                {
                    name: "Food & Daily Needs 🍽",
                    subCategories: [
                        { name: "Groceries", budget: 5000 },
                        { name: "Vegetables & Fruits", budget: 2000 },
                        { name: "Milk & Dairy", budget: 1200 },
                        { name: "Eating Outside", budget: 2000 }
                    ]
                },
                {
                    name: "Transport & Travel 🚗",
                    subCategories: [
                        { name: "Petrol / Diesel", budget: 3000 },
                        { name: "Public Transport", budget: 1000 },
                        { name: "Cab / Auto", budget: 1500 },
                        { name: "Vehicle Maintenance", budget: 1000 }
                    ]
                },
                {
                    name: "Utilities & Subscriptions 📱",
                    subCategories: [
                        { name: "Mobile Recharge", budget: 500 },
                        { name: "OTT Subscriptions", budget: 800 },
                        { name: "Cloud / App Subscriptions", budget: 500 }
                    ]
                },
                {
                    name: "Family & Personal 👨‍👩‍👧",
                    subCategories: [
                        { name: "Parents Support", budget: 5000 },
                        { name: "Kids Education", budget: 4000 },
                        { name: "Personal Care", budget: 1000 },
                        { name: "Gifts & Occasions", budget: 1000 }
                    ]
                },
                {
                    name: "Health & Insurance 💊",
                    subCategories: [
                        { name: "Medicines", budget: 1000 },
                        { name: "Doctor Visits", budget: 1000 },
                        { name: "Health Insurance", budget: 2000 }
                    ]
                },
                {
                    name: "Investments & Savings 💰",
                    subCategories: [
                        { name: "EPF / PPF", budget: 5000 },
                        { name: "SIP / Mutual Funds", budget: 10000 },
                        { name: "Stocks", budget: 5000 },
                        { name: "Emergency Fund", budget: 3000 }
                    ]
                },
                {
                    name: "Lifestyle & Fun 🎉",
                    subCategories: [
                        { name: "Movies & Entertainment", budget: 1000 },
                        { name: "Dining Out", budget: 2000 },
                        { name: "Shopping", budget: 3000 },
                        { name: "Trips / Travel", budget: 3000 }
                    ]
                }
            ];

            await ExpenseCategory.insertMany(
                defaultCategories.map(cat => ({ userId, ...cat }))
            );
        }

        const sourceCount = await PaymentSource.countDocuments({ userId });
        if (sourceCount === 0) {
            const defaultSources = [
                { name: "HDFC" },
                { name: "SBI" },
                { name: "Credit Card" },
                { name: "Cash" },
                { name: "Paytm Wallet" }
            ];
            await PaymentSource.insertMany(
                defaultSources.map(s => ({ userId, ...s }))
            );
        }


        // Fetch all data in parallel
        let [categories, sources, salaryData, transactions] = await Promise.all([
            // Find categories that are either Global (no month) OR match the specific month
            ExpenseCategory.find({
                userId,
                $or: [
                    { month: { $exists: false } },
                    { month: null },
                    { month: month }
                ]
            }).sort({ createdAt: 1 }).lean(),
            PaymentSource.find({ userId }).sort({ createdAt: 1 }),
            MonthlyBudget.findOne({ userId, month }),
            ExpenseTransaction.find({
                userId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: -1 }).populate('sourceId', 'name').populate('categoryId', 'name')
        ]);

        // Filter SubCategories by Month (Include Global + Selected Month)
        categories = categories.map(cat => ({
            ...cat,
            subCategories: cat.subCategories.filter(sub => !sub.month || sub.month === month)
        }));

        // Calculate "Spent" for Card type sources (This Month)
        const updatedSources = sources.map(source => {
            if (source.type === "Card") {
                // Calculate total debits for this source in the current month
                const monthlySpend = transactions
                    .filter(t => t.sourceId._id.toString() === source._id.toString() && t.type === "Debit")
                    .reduce((sum, t) => sum + t.amount, 0);
                return { ...source.toObject(), spent: monthlySpend };
            }
            return source.toObject(); // Bank/Wallet show native balance
        });

        res.status(200).json({
            success: true,
            data: {
                categories,
                sources: updatedSources,
                salary: salaryData ? salaryData.salary : 86500,
                transactions
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

        const budget = await MonthlyBudget.findOneAndUpdate(
            { userId, month },
            { salary },
            { new: true, upsert: true } // Create if not exists
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
        const { name, month } = req.body;

        // If month is provided, create for that month. If not, it's global.
        const category = await ExpenseCategory.create({ userId, name, month, subCategories: [] });
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
        const { name } = req.body;

        const category = await ExpenseCategory.findByIdAndUpdate(
            id,
            { name },
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

// ---------------------- Money Sources ----------------------

export const createSource = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { name, type, balance } = req.body;

        // If Credit Card, balance (spent) usually starts at 0.
        // If Bank/Wallet, user provides initial balance.
        const source = await PaymentSource.create({
            userId,
            name,
            type,
            balance: balance ? Number(balance) : 0
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
        const { name } = req.body;

        const source = await PaymentSource.findByIdAndUpdate(
            id,
            { name },
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
        const { date, description, sourceId, categoryId, subCategoryId, amount, type, isReimbursable } = req.body; // type: Credit | Debit

        const transactionType = type || "Debit";

        const transaction = await ExpenseTransaction.create({
            userId,
            date,
            description,
            sourceId,
            categoryId: transactionType === "Debit" ? categoryId : undefined, // Optional for Credit
            subCategoryId: transactionType === "Debit" ? subCategoryId : undefined, // Optional for Credit
            amount,
            type: transactionType,
            isReimbursable: isReimbursable || false
        });

        // Update Source Balance
        const source = await PaymentSource.findById(sourceId);
        if (source) {
            if (transactionType === "Credit") {
                source.balance += Number(amount);
            } else {
                // Debit
                source.balance -= Number(amount);
            }
            await source.save();
        }

        // Populate match the getDashboard format for immediate UI update
        await transaction.populate('sourceId', 'name type balance');
        if (transactionType === "Debit") {
            await transaction.populate('categoryId', 'name');
        }

        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const transaction = await ExpenseTransaction.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('sourceId', 'name').populate('categoryId', 'name');

        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
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

        // Revert Balance Logic
        const source = await PaymentSource.findById(transaction.sourceId);
        if (source) {
            if (transaction.type === "Credit") {
                // Was Added -> Subtract
                source.balance -= Number(transaction.amount);
            } else {
                // Was Debited -> Add Back
                source.balance += Number(transaction.amount);
            }
            await source.save();
        }

        await ExpenseTransaction.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Transaction deleted", data: { id, updatedSource: source } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
