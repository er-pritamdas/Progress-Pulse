import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Context/AxiosInstance";
import dayjs from "dayjs";
import { message } from "antd";

const BASE_URL = "/v1/dashboard/expense";

export const enrichSourceWithCardDue = (s) => {
    if (!s) return s;
    const isCard = s.type === "Card";
    const bal = Number(s.balance) || 0;
    const cardDue = s.cardDue !== undefined && s.cardDue !== null
        ? Number(s.cardDue)
        : (isCard ? (bal < 0 ? Math.abs(bal) : 0) : 0);
    return {
        ...s,
        balance: bal,
        cardDue,
        currentBalance: s.currentBalance !== undefined ? s.currentBalance : bal,
        currentCardDue: s.currentCardDue !== undefined ? s.currentCardDue : cardDue,
    };
};

export const enrichSourcesList = (sources) => {
    if (!Array.isArray(sources)) return sources;
    return sources.map(enrichSourceWithCardDue);
};

// Async Thunks

export const fetchDashboardData = createAsyncThunk(
    "expense/fetchDashboardData",
    async (monthParam, { rejectWithValue }) => {
        try {
            let params = {};
            if (typeof monthParam === 'object' && monthParam !== null) {
                params = monthParam;
            } else if (monthParam === 'all') {
                params = { all: 'true' };
            } else if (monthParam) {
                params = { month: monthParam };
            }
            const response = await axiosInstance.get(`${BASE_URL}/get-all-data`, { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
        }
    }
);

export const fetchRangeData = createAsyncThunk(
    "expense/fetchRangeData",
    async ({ fromMonth, toMonth }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/get-all-data`, {
                params: { fromMonth, toMonth },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch range data");
        }
    }
);

export const updateSalary = createAsyncThunk(
    "expense/updateSalary",
    async ({ month, salary }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/salary`, { month, salary });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update salary");
        }
    }
);

export const deleteSalary = createAsyncThunk(
    "expense/deleteSalary",
    async ({ month }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/salary/${month}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete salary");
        }
    }
);

// Categories
export const createCategory = createAsyncThunk(
    "expense/createCategory",
    async ({ name, month, subCategories }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/category`, { name, month, subCategories });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create category");
        }
    }
);

export const updateCategory = createAsyncThunk(
    "expense/updateCategory",
    async ({ id, name, color }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/category/${id}`, { name, color });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update category");
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "expense/deleteCategory",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/category/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete category");
        }
    }
);

export const copyCategoriesFromLastMonth = createAsyncThunk(
    "expense/copyCategoriesFromLastMonth",
    async ({ currentMonth }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/category/copy-previous`, { currentMonth });
            return response.data.data; // Array of new categories
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to copy categories");
        }
    }
);

// SubCategories
export const addSubCategory = createAsyncThunk(
    "expense/addSubCategory",
    async ({ categoryId, name, budget, month }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/category/${categoryId}/subcategory`, { name, budget, month });
            return response.data.data; // Returns updated category
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add subcategory");
        }
    }
);

export const updateSubCategory = createAsyncThunk(
    "expense/updateSubCategory",
    async ({ categoryId, subId, name, budget }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/category/${categoryId}/subcategory/${subId}`, { name, budget });
            return response.data.data; // Returns updated category
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update subcategory");
        }
    }
);

export const deleteSubCategory = createAsyncThunk(
    "expense/deleteSubCategory",
    async ({ categoryId, subId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/category/${categoryId}/subcategory/${subId}`);
            return response.data.data; // Returns updated category
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete subcategory");
        }
    }
);

export const reorderCategories = createAsyncThunk(
    "expense/reorderCategories",
    async ({ categoryIds }, { rejectWithValue }) => {
        try {
            await axiosInstance.put(`${BASE_URL}/category/reorder`, { categoryIds });
            return categoryIds;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reorder categories");
        }
    }
);

export const reorderSubCategories = createAsyncThunk(
    "expense/reorderSubCategories",
    async ({ categoryId, subCategoryIds }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/category/${categoryId}/subcategory/reorder`, { subCategoryIds });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reorder subcategories");
        }
    }
);

// Sources
export const createSource = createAsyncThunk(
    "expense/createSource",
    async ({ name, type, balance, limit, color }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/source`, { name, type, balance, limit, color });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create source");
        }
    }
);

export const updateSource = createAsyncThunk(
    "expense/updateSource",
    async ({ id, name, type, balance, limit, color }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/source/${id}`, { name, type, balance, limit, color });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update source");
        }
    }
);

export const deleteSource = createAsyncThunk(
    "expense/deleteSource",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/source/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete source");
        }
    }
);

// Transactions
export const addTransaction = createAsyncThunk(
    "expense/addTransaction",
    async (payload, { dispatch, getState, rejectWithValue }) => {
        try {
            const actualData = payload?.transactionData ? payload.transactionData : payload;
            const isUndoRedo = Boolean(payload?.isUndoRedo);
            const response = await axiosInstance.post(`${BASE_URL}/transaction`, actualData);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return { ...response.data, isUndoRedo }; // Contains { success: true, data: transaction, sources: [...], isUndoRedo }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add transaction");
        }
    }
);

export const updateTransaction = createAsyncThunk(
    "expense/updateTransaction",
    async (param, { dispatch, getState, rejectWithValue }) => {
        try {
            const id = param.id;
            const data = param.data;
            const isUndoRedo = Boolean(param.isUndoRedo);

            const state = getState().expense;
            const oldTx = state.transactions.find(t => t._id === id);

            const response = await axiosInstance.patch(`${BASE_URL}/transaction/${id}`, data);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return { ...response.data, oldTx, isUndoRedo };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update transaction");
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    "expense/deleteTransaction",
    async (payload, { dispatch, getState, rejectWithValue }) => {
        try {
            const id = typeof payload === 'object' && payload !== null && payload.id ? payload.id : payload;
            const isUndoRedo = typeof payload === 'object' && payload !== null && Boolean(payload.isUndoRedo);

            const state = getState().expense;
            const oldTx = state.transactions.find(t => t._id === id);

            const response = await axiosInstance.delete(`${BASE_URL}/transaction/${id}`);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return { ...(response.data?.data || { id }), oldTx, isUndoRedo };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete transaction");
        }
    }
);

// Helper for extracting clean transaction payload for backend requests
const sanitizeTxPayload = (tx) => {
    return {
        date: tx.date ? dayjs(tx.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        description: tx.description || "",
        sourceId: typeof tx.sourceId === 'object' && tx.sourceId !== null ? tx.sourceId._id : tx.sourceId,
        targetSourceId: typeof tx.targetSourceId === 'object' && tx.targetSourceId !== null ? tx.targetSourceId._id : (tx.targetSourceId || undefined),
        categoryId: typeof tx.categoryId === 'object' && tx.categoryId !== null ? tx.categoryId._id : (tx.categoryId || undefined),
        subCategoryId: typeof tx.subCategoryId === 'object' && tx.subCategoryId !== null ? tx.subCategoryId._id : (tx.subCategoryId || undefined),
        amount: Number(tx.amount || 0),
        type: tx.type || "Debit",
        isReimbursable: Boolean(tx.isReimbursable)
    };
};

// Undo / Redo Thunks (Strict 5-Step Stack Limit)
export const performUndo = createAsyncThunk(
    "expense/performUndo",
    async (_, { dispatch, getState, rejectWithValue }) => {
        const state = getState().expense;
        if (!state.undoStack || state.undoStack.length === 0) {
            message.warning({
                content: "Nothing to undo (0/5)",
                key: "undo_redo_toast"
            });
            return rejectWithValue("Nothing to undo");
        }

        // Get the top action to undo
        const lastAction = state.undoStack[state.undoStack.length - 1];

        // Synchronously transfer item from undoStack -> redoStack BEFORE async network call
        dispatch(popUndoPushRedo());

        try {
            if (lastAction.actionType === "ADD_TRANSACTION") {
                const txId = lastAction.data._id;
                await dispatch(deleteTransaction({ id: txId, isUndoRedo: true })).unwrap();
            } else if (lastAction.actionType === "DELETE_TRANSACTION") {
                const txData = lastAction.data;
                const cleanPayload = sanitizeTxPayload(txData);
                const result = await dispatch(addTransaction({ transactionData: cleanPayload, isUndoRedo: true })).unwrap();
                const newTx = result?.data || result;
                if (newTx?._id) {
                    const updatedState = getState().expense;
                    const redoIndex = updatedState.redoStack.length - 1;
                    if (redoIndex >= 0) {
                        dispatch(updateRedoItem({ index: redoIndex, data: newTx }));
                    }
                }
            } else if (lastAction.actionType === "EDIT_TRANSACTION") {
                const { oldData } = lastAction;
                const cleanPayload = sanitizeTxPayload(oldData);
                await dispatch(updateTransaction({ id: oldData._id, data: cleanPayload, isUndoRedo: true })).unwrap();
            }

            message.info({
                content: `↺ Undid: ${lastAction.label}`,
                key: "undo_redo_toast",
                duration: 3
            });

            return lastAction;
        } catch (err) {
            console.error("Undo Error:", err);
            message.error("Failed to perform undo action");
            return rejectWithValue(err.message || "Failed to undo");
        }
    }
);

export const performRedo = createAsyncThunk(
    "expense/performRedo",
    async (_, { dispatch, getState, rejectWithValue }) => {
        const state = getState().expense;
        if (!state.redoStack || state.redoStack.length === 0) {
            message.warning({
                content: "Nothing to redo (0/5)",
                key: "undo_redo_toast"
            });
            return rejectWithValue("Nothing to redo");
        }

        // Get the top action to redo
        const nextAction = state.redoStack[state.redoStack.length - 1];

        // Synchronously transfer item from redoStack -> undoStack BEFORE async network call
        dispatch(popRedoPushUndo());

        try {
            if (nextAction.actionType === "ADD_TRANSACTION") {
                const txData = nextAction.data;
                const cleanPayload = sanitizeTxPayload(txData);
                const result = await dispatch(addTransaction({ transactionData: cleanPayload, isUndoRedo: true })).unwrap();
                const newTx = result?.data || result;
                if (newTx?._id) {
                    const updatedState = getState().expense;
                    const undoIndex = updatedState.undoStack.length - 1;
                    if (undoIndex >= 0) {
                        dispatch(updateUndoItem({ index: undoIndex, data: newTx }));
                    }
                }
            } else if (nextAction.actionType === "DELETE_TRANSACTION") {
                const txId = nextAction.data._id;
                await dispatch(deleteTransaction({ id: txId, isUndoRedo: true })).unwrap();
            } else if (nextAction.actionType === "EDIT_TRANSACTION") {
                const { newData } = nextAction;
                const cleanPayload = sanitizeTxPayload(newData);
                await dispatch(updateTransaction({ id: newData._id, data: cleanPayload, isUndoRedo: true })).unwrap();
            }

            message.info({
                content: `↻ Redid: ${nextAction.label}`,
                key: "undo_redo_toast",
                duration: 3
            });

            return nextAction;
        } catch (err) {
            console.error("Redo Error:", err);
            message.error("Failed to perform redo action");
            return rejectWithValue(err.message || "Failed to redo");
        }
    }
);


const initialState = {
    categories: [],
    sources: [],
    transactions: [],
    salary: 0,
    salariesByMonth: {},
    currentMonth: dayjs().format("YYYY-MM"),
    loading: false,
    error: null,
    undoStack: [], // Capped strictly at max 5 items
    redoStack: [], // Capped strictly at max 5 items
};

const expenseSlice = createSlice({
    name: "expense",
    initialState,
    reducers: {
        setMonth: (state, action) => {
            state.currentMonth = action.payload;
        },
        setLocalCategoriesOrder: (state, action) => {
            state.categories = action.payload;
        },
        setLocalSubCategoriesOrder: (state, action) => {
            const { categoryId, subCategories } = action.payload;
            const cat = state.categories.find(c => c._id === categoryId);
            if (cat) cat.subCategories = subCategories;
        },
        popUndoPushRedo: (state) => {
            if (state.undoStack && state.undoStack.length > 0) {
                const item = state.undoStack.pop();
                state.redoStack.push(item);
                if (state.redoStack.length > 5) {
                    state.redoStack = state.redoStack.slice(state.redoStack.length - 5);
                }
            }
        },
        popRedoPushUndo: (state) => {
            if (state.redoStack && state.redoStack.length > 0) {
                const item = state.redoStack.pop();
                state.undoStack.push(item);
                if (state.undoStack.length > 5) {
                    state.undoStack = state.undoStack.slice(state.undoStack.length - 5);
                }
            }
        },
        updateRedoItem: (state, action) => {
            const { index, data } = action.payload;
            if (state.redoStack && state.redoStack[index]) {
                state.redoStack[index].data = data;
            }
        },
        updateUndoItem: (state, action) => {
            const { index, data } = action.payload;
            if (state.undoStack && state.undoStack[index]) {
                state.undoStack[index].data = data;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Data
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories;
                state.sources = enrichSourcesList(action.payload.sources);
                state.salary = action.payload.salary;
                state.salariesByMonth = action.payload.salariesByMonth || { [state.currentMonth]: action.payload.salary };
                state.transactions = action.payload.transactions;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Range Data
            .addCase(fetchRangeData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRangeData.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories;
                state.sources = enrichSourcesList(action.payload.sources);
                state.salary = action.payload.salary;
                state.salariesByMonth = action.payload.salariesByMonth || {};
                state.transactions = action.payload.transactions;
            })
            .addCase(fetchRangeData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Salary
            .addCase(updateSalary.fulfilled, (state, action) => {
                const updatedSal = Number(action.payload.salary) || 0;
                if (state.currentMonth === action.payload.month) {
                    state.salary = updatedSal;
                }
                const updated = { ...(state.salariesByMonth || {}) };
                if (updatedSal <= 0) {
                    delete updated[action.payload.month];
                } else {
                    updated[action.payload.month] = updatedSal;
                }
                state.salariesByMonth = updated;
            })
            .addCase(deleteSalary.fulfilled, (state, action) => {
                if (state.currentMonth === action.payload.month) {
                    state.salary = 0;
                }
                const updated = { ...(state.salariesByMonth || {}) };
                delete updated[action.payload.month];
                state.salariesByMonth = updated;
            })

            // Categories
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) state.categories[index] = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            })
            .addCase(copyCategoriesFromLastMonth.fulfilled, (state, action) => {
                if (action.payload && Array.isArray(action.payload)) {
                    state.categories.push(...action.payload);
                }
            })

            // SubCategories (all return updated Category)
            .addCase(addSubCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) state.categories[index] = action.payload;
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) state.categories[index] = action.payload;
            })
            .addCase(deleteSubCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) state.categories[index] = action.payload;
            })
            .addCase(reorderSubCategories.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) state.categories[index] = action.payload;
            })

            // Sources
            .addCase(createSource.fulfilled, (state, action) => {
                state.sources.push(enrichSourceWithCardDue(action.payload));
            })
            .addCase(updateSource.fulfilled, (state, action) => {
                const index = state.sources.findIndex(s => s._id === action.payload._id);
                if (index !== -1) state.sources[index] = enrichSourceWithCardDue(action.payload);
            })
            .addCase(deleteSource.fulfilled, (state, action) => {
                state.sources = state.sources.filter(s => s._id !== action.payload);
            })

            // Transactions
            .addCase(addTransaction.fulfilled, (state, action) => {
                const transactionData = action.payload.data || action.payload;
                if (transactionData?._id) {
                    const index = state.transactions.findIndex(t => t._id === transactionData._id);
                    if (index !== -1) {
                        state.transactions[index] = transactionData;
                    } else {
                        state.transactions.unshift(transactionData);
                    }
                }

                if (action.payload.sources && Array.isArray(action.payload.sources)) {
                    state.sources = enrichSourcesList(action.payload.sources);
                }

                if (!action.payload.isUndoRedo && transactionData?._id) {
                    state.undoStack.push({
                        id: Date.now() + Math.random(),
                        actionType: "ADD_TRANSACTION",
                        label: `Added "${transactionData.description || 'Transaction'}" (₹${Number(transactionData.amount || 0).toLocaleString()})`,
                        data: transactionData
                    });
                    if (state.undoStack.length > 5) {
                        state.undoStack = state.undoStack.slice(state.undoStack.length - 5);
                    }
                    state.redoStack = [];
                }
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const transactionData = action.payload.data || action.payload;
                const oldTx = action.payload.oldTx;
                const index = state.transactions.findIndex(t => t._id === transactionData._id);
                if (index !== -1) state.transactions[index] = transactionData;

                if (action.payload.sources && Array.isArray(action.payload.sources)) {
                    state.sources = enrichSourcesList(action.payload.sources);
                }

                if (!action.payload.isUndoRedo && oldTx && transactionData?._id) {
                    state.undoStack.push({
                        id: Date.now() + Math.random(),
                        actionType: "EDIT_TRANSACTION",
                        label: `Edited "${transactionData.description || oldTx.description || 'Transaction'}"`,
                        oldData: oldTx,
                        newData: transactionData
                    });
                    if (state.undoStack.length > 5) {
                        state.undoStack = state.undoStack.slice(state.undoStack.length - 5);
                    }
                    state.redoStack = [];
                }
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                const id = action.payload.id || action.payload.data?.id;
                const oldTx = action.payload.oldTx;
                if (id) {
                    state.transactions = state.transactions.filter(t => t._id !== id);
                }
                const sources = action.payload.sources || action.payload.data?.sources;
                if (sources && Array.isArray(sources)) {
                    state.sources = enrichSourcesList(sources);
                }

                if (!action.payload.isUndoRedo && oldTx) {
                    state.undoStack.push({
                        id: Date.now() + Math.random(),
                        actionType: "DELETE_TRANSACTION",
                        label: `Deleted "${oldTx.description || 'Transaction'}" (₹${Number(oldTx.amount || 0).toLocaleString()})`,
                        data: oldTx
                    });
                    if (state.undoStack.length > 5) {
                        state.undoStack = state.undoStack.slice(state.undoStack.length - 5);
                    }
                    state.redoStack = [];
                }
            });
    },
});

export const {
    setMonth,
    setLocalCategoriesOrder,
    setLocalSubCategoriesOrder,
    popUndoPushRedo,
    popRedoPushUndo,
    updateRedoItem,
    updateUndoItem
} = expenseSlice.actions;

export default expenseSlice.reducer;
