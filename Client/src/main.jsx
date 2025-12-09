
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

// CSS
import './index.css'

// Context Providers
import Providers from './utils/Providers.jsx'

// Pages
import Homepage from './pages/Homepage/Homepage.jsx'
import Login from './pages/Authentication/Login.jsx'
import Signup from './pages/Authentication/Signup.jsx'
import Otp from './pages/Authentication/Otp.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'

import ForgotPasswordVerification from './pages/Authentication/ForgotPasswordVerification.jsx'
import ForgotPasswordOTPverification from './pages/Authentication/ForgotPasswordOTPverification.jsx'
// Habit Pages
import Habit from './pages/Dashboard/Habit/Habit.jsx'
import HabitTableEntry from './pages/Dashboard/Habit/HabitTableEntry.jsx'
import HabitDashboard from './pages/Dashboard/Habit/HabitDashboard.jsx'
import HabitLogging from './pages/Dashboard/Habit/HabitLogging.jsx'
import HabitSettings from './pages/Dashboard/Habit/HabitSettings.jsx'

// Expense Pages
import ExpTableEntry from './pages/Dashboard/Expense/ExpTableEntry.jsx'
import ExpDashboard from './pages/Dashboard/Expense/ExpDashboard.jsx'
import ExpTableView from './pages/Dashboard/Expense/ExpTableView.jsx'
import ExpSettings from './pages/Dashboard/Expense/ExpSettings.jsx'

// Investment Pages
import InvTableEntry from './pages/Dashboard/Investment/InvTableEntry.jsx'
import InvDashboard from './pages/Dashboard/Investment/InvDashboard.jsx'
import InvTableView from './pages/Dashboard/Investment/InvTableView.jsx'
import InvSettings from './pages/Dashboard/Investment/InvSettings.jsx'

// Layouts
import Layout from './layouts/Layout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Expense from './pages/Dashboard/Expense/Expense.jsx'
import Investment from './pages/Dashboard/Investment/Investment.jsx'
import HabitLayout from './layouts/HabitLayout.jsx'
import ExpenseLayout from './layouts/ExpenseLayout.jsx'
import InvestmentLayout from './layouts/InvestmentLayout.jsx'
import ResetPassword from './pages/Authentication/ResetPassword.jsx'



const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path='login' element={<Login />} />
        <Route path='signup' element={<Signup />} />
        <Route path='otp' element={<Otp />} />
        <Route path='forgot_Password_Verify' element={<ForgotPasswordVerification />} />
        <Route path='forgot_Password-otp' element={<ForgotPasswordOTPverification />} />
        <Route path='reset-password' element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/* Habit Routes */}
        <Route path="habit" element={<HabitLayout />}>
          <Route index element={<Habit />} />
          <Route path="table-entry" element={<HabitTableEntry />} />
          <Route path="dashboard" element={<HabitDashboard />} />
          <Route path="logging" element={<HabitLogging />} />
          <Route path="settings" element={<HabitSettings />} />
        </Route>

        {/* Expense Routes */}
        <Route path="expense" element={<ExpenseLayout />}>
          <Route index element={<Expense />} />
          <Route path="table-entry" element={<ExpTableEntry />} />
          <Route path="dashboard" element={<ExpDashboard />} />
          <Route path="table-view" element={<ExpTableView />} />
          <Route path="settings" element={<ExpSettings />} />
        </Route>

        {/* Investment Routes */}
        <Route path="investment" element={<InvestmentLayout />}>
          <Route index element={<Investment />} />
          <Route path="table-entry" element={<InvTableEntry />} />
          <Route path="dashboard" element={<InvDashboard />} />
          <Route path="table-view" element={<InvTableView />} />
          <Route path="settings" element={<InvSettings />} />
        </Route>
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </>,
)
