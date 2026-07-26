import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosInstance from '../../../Context/AxiosInstance'

// ✅ Thunks
export const fetchHabitSettings = createAsyncThunk(
  'habit/fetchHabitSettings',
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get('/v1/dashboard/habit/settings') // adapt if your route is different
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

export const updateHabitSettings = createAsyncThunk(
  'habit/updateHabitSettings',
  async (updatedData, thunkAPI) => {
    try {
      // console.log("Updated Data : ",updatedData)
      const res = await axiosInstance.put('/v1/dashboard/habit/settings', { ...updatedData })
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update settings')
    }
  }
)

export const resetHabitSettings = createAsyncThunk(
  'habit/resetHabitSettings',
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.delete('/v1/dashboard/habit/settings')
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to reset settings')
    }
  }
)

export const fetchPhysicalLogs = createAsyncThunk(
  'habit/fetchPhysicalLogs',
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get('/v1/dashboard/habit/logging')
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch physical logs')
    }
  }
)

export const addPhysicalLog = createAsyncThunk(
  'habit/addPhysicalLog',
  async (logData, thunkAPI) => {
    try {
      const res = await axiosInstance.post('/v1/dashboard/habit/logging', logData)
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add physical log')
    }
  }
)

export const deletePhysicalLog = createAsyncThunk(
  'habit/deletePhysicalLog',
  async (logId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/v1/dashboard/habit/logging/${logId}`)
      return logId
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete physical log')
    }
  }
)

function formatDateLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultFromDate = () => {
  const now = new Date()
  return formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1))
}

const getDefaultToDate = () => {
  const now = new Date()
  return formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

const getInitialFilters = () => {
  let savedFromDate = localStorage.getItem('habit_from_date')
  let savedToDate = localStorage.getItem('habit_to_date')
  let savedItemPerPage = localStorage.getItem('habit_item_per_page')

  if (!savedFromDate || savedFromDate === 'undefined' || savedFromDate === 'null') {
    savedFromDate = getDefaultFromDate()
  }
  if (!savedToDate || savedToDate === 'undefined' || savedToDate === 'null') {
    savedToDate = getDefaultToDate()
  }

  const itemPerPage = savedItemPerPage ? Number(savedItemPerPage) : 7

  return {
    fromDate: savedFromDate,
    toDate: savedToDate,
    itemPerPage: isNaN(itemPerPage) || itemPerPage <= 0 ? 7 : itemPerPage,
  }
}

const initialState = {
  settings: {
    burned: { min: 300, max: 500 },
    water: { min: 2, max: 4 },
    sleep: { min: 7, max: 9 },
    read: { min: 2, max: 5 },
    intake: { min: 1500, max: 2500 },
    selfcare: ["Shower", "Brush", "Face"],
    mood: ["Amazing", "Good", "Average", "Sad", "Depressed", "Productive"],
  },
  filters: getInitialFilters(),
  subscribeToNewsletter: false,
  emailNotification: false,
  darkMode: false,
  streakReminders: false,
  age: 18,
  gender: "male",
  weight: 80,
  height: 180,
  activityLevel: "light",
  maintenanceCalories: 0,
  bmr: 0,
  bmi: 0,
  physicalLogs: [],
  loading: false,
  error: null,
}

const habitSlice = createSlice({
  name: 'habit',
  initialState,
  reducers: {
    setFieldRange: (state, action) => {
      const { field, min, max } = action.payload
      if (state.settings[field]) {
        state.settings[field].min = min
        state.settings[field].max = max
      }
    },
    setSelfcareHabits: (state, action) => {
      state.settings.selfcare = action.payload
    },
    setMoodList: (state, action) => {
      state.settings.mood = action.payload
    },

    toggleSubscribeToNewsletter: (state) => {
      state.subscribeToNewsletter = !state.subscribeToNewsletter
    },
    toggleEmailNotification: (state) => {
      state.emailNotification = !state.emailNotification
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    toggleStreakReminders: (state) => {
      state.streakReminders = !state.streakReminders
    },

    setHabitFilters: (state, action) => {
      const { fromDate, toDate, itemPerPage } = action.payload
      if (fromDate !== undefined) {
        state.filters.fromDate = fromDate
        localStorage.setItem('habit_from_date', fromDate)
      }
      if (toDate !== undefined) {
        state.filters.toDate = toDate
        localStorage.setItem('habit_to_date', toDate)
      }
      if (itemPerPage !== undefined) {
        state.filters.itemPerPage = itemPerPage
        localStorage.setItem('habit_item_per_page', itemPerPage)
      }
    },
    resetHabitFilters: (state) => {
      const defaultFrom = getDefaultFromDate()
      const defaultTo = getDefaultToDate()
      state.filters.fromDate = defaultFrom
      state.filters.toDate = defaultTo
      state.filters.itemPerPage = 7

      localStorage.setItem('habit_from_date', defaultFrom)
      localStorage.setItem('habit_to_date', defaultTo)
      localStorage.setItem('habit_item_per_page', '7')
    },
    setHabitYearAndMonth: (state, action) => {
      const { year, month } = action.payload
      const selectedYear = Number(year) || new Date().getFullYear()

      if (month === "all" || month === undefined || month === null) {
        const fromDate = `${selectedYear}-01-01`
        const toDate = `${selectedYear}-12-31`
        state.filters.fromDate = fromDate
        state.filters.toDate = toDate
        localStorage.setItem("habit_from_date", fromDate)
        localStorage.setItem("habit_to_date", toDate)
      } else {
        const selectedMonth = Number(month)
        const startOfMonth = new Date(selectedYear, selectedMonth, 1)
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0)

        const fromDate = formatDateLocal(startOfMonth)
        const toDate = formatDateLocal(endOfMonth)

        state.filters.fromDate = fromDate
        state.filters.toDate = toDate
        localStorage.setItem("habit_from_date", fromDate)
        localStorage.setItem("habit_to_date", toDate)
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchHabitSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHabitSettings.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchHabitSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateHabitSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateHabitSettings.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(updateHabitSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(resetHabitSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetHabitSettings.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(resetHabitSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchPhysicalLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPhysicalLogs.fulfilled, (state, action) => {
        state.physicalLogs = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchPhysicalLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(addPhysicalLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPhysicalLog.fulfilled, (state, action) => {
        state.physicalLogs.push(action.payload)
        state.loading = false
        state.error = null
      })
      .addCase(addPhysicalLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deletePhysicalLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePhysicalLog.fulfilled, (state, action) => {
        state.physicalLogs = state.physicalLogs.filter(log => log._id !== action.payload)
        state.loading = false
        state.error = null
      })
      .addCase(deletePhysicalLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setFieldRange,
  setSelfcareHabits,
  setMoodList,
  toggleSubscribeToNewsletter,
  toggleEmailNotification,
  toggleDarkMode,
  toggleStreakReminders,
  setHabitFilters,
  resetHabitFilters,
  setHabitYearAndMonth,
} = habitSlice.actions

export default habitSlice.reducer
