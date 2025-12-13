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
    async ({ name, month }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/category`, { name, month });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create category");
        }
    }
);

export const updateCategory = createAsyncThunk(
    "expense/updateCategory",
    async ({ id, name }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/category/${id}`, { name });
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

// Sources
export const createSource = createAsyncThunk(
    "expense/createSource",
    async ({ name, type, balance }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/source`, { name, type, balance });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create source");
        }
    }
);

export const updateSource = createAsyncThunk(
    "expense/updateSource",
    async ({ id, name }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/source/${id}`, { name });
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
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/transaction`, transactionData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add transaction");
        }
    }
);

export const updateTransaction = createAsyncThunk(
    "expense/updateTransaction",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/transaction/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update transaction");
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    "expense/deleteTransaction",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/transaction/${id}`);
            return id;
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
                state.transactions.unshift(action.payload); // Add new to top
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) state.transactions[index] = action.payload;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.transactions = state.transactions.filter(t => t._id !== action.payload);
            });
    },
});

export const { setMonth } = expenseSlice.actions;
export default expenseSlice.reducer;
