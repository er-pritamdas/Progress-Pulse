import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  settings: {
    burned: { min: 0, max: 500 },
    water: { min: 0, max: 5 },
    sleep: { min: 0, max: 12 },
    read: { min: 0, max: 5 },
    intake: { min: 0, max: 3000 },
    selfcare: [],
    mood: [],
  },
  isSettingsVisible: false,
}

const habitSlice = createSlice({
  name: 'habit',
  initialState,
  reducers: {
    // Update min/max range of a specific field
    setFieldRange: (state, action) => {
      const { field, min, max } = action.payload
      if (state.settings[field]) {
        state.settings[field].min = min
        state.settings[field].max = max
      }
    },

    // Set selfcare habits array
    setSelfcareHabits: (state, action) => {
      state.settings.selfcare = action.payload
    },

    // Set mood list array
    setMoodList: (state, action) => {
      state.settings.mood = action.payload
    },

    // Toggle the visibility of settings panel (if used later in UI)
    toggleSettingsVisibility: (state) => {
      state.isSettingsVisible = !state.isSettingsVisible
    },
  },
})

export const {
  setFieldRange,
  setSelfcareHabits,
  setMoodList,
  toggleSettingsVisibility
} = habitSlice.actions

export default habitSlice.reducer
