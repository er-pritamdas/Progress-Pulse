import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

import './index.css'

import Homepage from './pages/Homepage'
import Login from './components/Authentication/Login.jsx'
import Signup from './components/Authentication/Signup.jsx'
import Layout from './layouts/layout.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route index element={<Homepage />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div>
      <RouterProvider router={router}/>
    </div>
  </StrictMode>,
)
