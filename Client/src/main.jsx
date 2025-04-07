import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

// CSS
import './index.css'

// Pages
import Homepage from './pages/Homepage/Homepage.jsx'
import Login from './pages/Authentication/Login.jsx'
import Signup from './pages/Authentication/Signup.jsx'
import Otp from './pages/Authentication/Otp.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'

// Layouts
import Layout from './layouts/Layout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'


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
      <Route path="/dashboard" element={<DashboardLayout/>}>
        <Route index element={<Dashboard />} />
      </Route>

    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div>
      <RouterProvider router={router} />
    </div>
  </StrictMode>,
)
