import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

import './index.css'
import Homepage from './pages/Homepage'

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path='/' element={<Homepage />}>
//       <Route path='about' element={<About />} />
//       <Route path='contact' element={<Contact />} />
//       <Route path='user/:userid' element={<User />} />
//     </Route>
//   )
// )

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div classname = "max-w-100vw">
      <Homepage/>
    </div>
  </StrictMode>,
)
