import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Context/AxiosInstance";
import dayjs from "dayjs";

const BASE_URL = "/v1/dashboard/expense";

// Async Thunks

export const fetchDashboardData = createAsyncThunk(
    "expense/fetchDashboardData",
    async (month, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/get-all-data`, {
                params: { month },
            });
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
    async (transactionData, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/transaction`, transactionData);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return response.data; // Contains { success: true, data: transaction, sources: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add transaction");
        }
    }
);

export const updateTransaction = createAsyncThunk(
    "expense/updateTransaction",
    async ({ id, data }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/transaction/${id}`, data);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return response.data; // Contains { success: true, data: transaction, sources: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update transaction");
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    "expense/deleteTransaction",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/transaction/${id}`);
            const month = getState().expense.currentMonth;
            if (month) {
                dispatch(fetchDashboardData(month));
            }
            return response.data.data; // Now returns { id, updatedSource }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete transaction");
        }
    }
);


const initialState = {
    categories: [],
    sources: [],
    transactions: [],
    salary: 0,
    currentMonth: dayjs().format("YYYY-MM"),
    loading: false,
    error: null,
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
                state.sources = action.payload.sources;
                state.salary = action.payload.salary;
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
                state.sources = action.payload.sources;
                state.salary = action.payload.salary;
                state.transactions = action.payload.transactions;
            })
            .addCase(fetchRangeData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Salary
            .addCase(updateSalary.fulfilled, (state, action) => {
                state.salary = action.payload.salary;
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
                state.sources.push(action.payload);
            })
            .addCase(updateSource.fulfilled, (state, action) => {
                const index = state.sources.findIndex(s => s._id === action.payload._id);
                if (index !== -1) state.sources[index] = action.payload;
            })
            .addCase(deleteSource.fulfilled, (state, action) => {
                state.sources = state.sources.filter(s => s._id !== action.payload);
            })

            // Transactions
            .addCase(addTransaction.fulfilled, (state, action) => {
                const transactionData = action.payload.data || action.payload;
                state.transactions.unshift(transactionData);

                if (action.payload.sources && Array.isArray(action.payload.sources)) {
                    state.sources = action.payload.sources;
                }
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const transactionData = action.payload.data || action.payload;
                const index = state.transactions.findIndex(t => t._id === transactionData._id);
                if (index !== -1) state.transactions[index] = transactionData;

                if (action.payload.sources && Array.isArray(action.payload.sources)) {
                    state.sources = action.payload.sources;
                }
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                const id = action.payload.id || action.payload.data?.id;
                if (id) {
                    state.transactions = state.transactions.filter(t => t._id !== id);
                }
                const sources = action.payload.sources || action.payload.data?.sources;
                if (sources && Array.isArray(sources)) {
                    state.sources = sources;
                }
            });
    },
});

export const { setMonth, setLocalCategoriesOrder, setLocalSubCategoriesOrder } = expenseSlice.actions;
export default expenseSlice.reducer;
