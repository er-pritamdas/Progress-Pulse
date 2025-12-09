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
  subscribeToNewsletter: false,
  emailNotification: false,
  darkMode: false,
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
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchHabitSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHabitSettings.fulfilled, (state, action) => {
        return {
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
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(resetHabitSettings.rejected, (state, action) => {
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
} = habitSlice.actions

export default habitSlice.reducer
