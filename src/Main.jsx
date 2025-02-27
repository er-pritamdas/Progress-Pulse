import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Index.css'
import HomePage from './Pages/HomePage'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
    <HomePage />
    </>
  </StrictMode>,
)
