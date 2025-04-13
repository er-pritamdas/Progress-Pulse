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
// Habit Pages
import HabitTableEntry from './pages/Dashboard/Habit/HabitTableEntry.jsx'
import HabitDashboard from './pages/Dashboard/Habit/HabitDashboard.jsx'
import HabitTableView from './pages/Dashboard/Habit/HabitTableView.jsx'
// Expense Pages
import ExpTableEntry from './pages/Dashboard/Expense/ExpTableEntry.jsx'
import ExpDashboard from './pages/Dashboard/Expense/ExpDashboard.jsx'
import ExpTableView from './pages/Dashboard/Expense/ExpTableView.jsx'
// Investment Pages
import InvTableEntry from './pages/Dashboard/Investment/InvTableEntry.jsx'
import InvDashboard from './pages/Dashboard/Investment/InvDashboard.jsx'
import InvTableView from './pages/Dashboard/Investment/InvTableView.jsx'

// Layouts
import Layout from './layouts/Layout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Expense from './pages/Dashboard/Expense/Expense.jsx'
import Habit from './pages/Dashboard/Habit/Habit.jsx'
import Investment from './pages/Dashboard/Investment/Investment.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path='login' element={<Login />} />
        <Route path='signup' element={<Signup />} />
        <Route path='otp' element={<Otp />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/* Habit Routes */}
        <Route path="habit" element={<Habit />}>
          <Route path="table-entry" element={<HabitTableEntry />} />
          <Route path="dashboard" element={<HabitDashboard />} />
          <Route path="table-view" element={<HabitTableView />} />
        </Route>

        {/* Expense Routes */}
        <Route path="expense" element={<Expense />}>
          <Route path="table-entry" element={<ExpTableEntry />} />
          <Route path="dashboard" element={<ExpDashboard />} />
          <Route path="table-view" element={<ExpTableView />} />
        </Route>

        {/* Investment Routes */}
        <Route path="investment" element={<Investment />}>
          <Route path="table-entry" element={<InvTableEntry />} />
          <Route path="dashboard" element={<InvDashboard />} />
          <Route path="table-view" element={<InvTableView />} />
        </Route>
      </Route>


    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
