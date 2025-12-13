import { configureStore } from '@reduxjs/toolkit'
import habitReducer from '../slice/habitSlice.js'
import expenseReducer from '../slice/ExpenseSlice.js';
// Add other reducers here

const store = configureStore({
  reducer: {
    habit: habitReducer,
    expense: expenseReducer,
  },
})

export default store
