import { Navigate, Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  const isAuthenticated = localStorage.getItem('token') // or useContext/Auth state
  console.log(isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default DashboardLayout