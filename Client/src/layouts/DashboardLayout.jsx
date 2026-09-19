import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react';


// Importing Components
import Navbar from '../components/Dashboard/Navbar/Navbar'
import Footer from '../components/Homepage/Footer'
import Sidebar from '../components/Dashboard/Sidebar/Sidebar';
import ActiveLastBreadcrumb from '../components/Dashboard/ActiveLastBreadcrumb';
import MobileBottomNav from '../components/Dashboard/MobileBottomNav/MobileBottomNav';
import { useAuth } from '../Context/JwtAuthContext';


const DashboardLayout = () => {
  const location = useLocation();

  // Variables
  const isOtpPage = location.pathname === "/otp";
  const { validToken } = useAuth();
  const isHabitPage = location.pathname.toLowerCase().includes('/habit');

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ------------------- Conditions before Dashboard -----------------------
  if (!isOtpPage) {
    localStorage.setItem('allowOtp', false);
  }
  const isAuthenticated = validToken

  // --------------------- Dashboard HTML Layout -------------------------
  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      {/* Sidebar and Outlet */}
      {isAuthenticated ? (
        <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
          {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
          <div className="hidden md:block h-full shrink-0">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          </div>

          <main className={`flex-1 transition-all duration-300 overflow-y-auto w-full min-w-0 pb-28 md:pb-6 ${
            isHabitPage ? "px-2 pt-0 md:px-4 md:pt-0 md:pb-6" : "p-2 sm:p-4"
          }`}>
            <ActiveLastBreadcrumb />
            <Outlet />
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomNav />
        </div>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  )
}

export default DashboardLayout

// NOTES:
// ------------
// Use in Div of Outleft if you want the content to be sliding When sidebar slides in and out
// className={`transition-all duration-300 mt-1 p-4 h-[calc(100vh-4rem)] overflow-y-auto ${sidebarOpen ? 'ml-64' : 'ml-16' }`}
// className={`mt-1 p-4 h-[calc(100vh-4rem)] ml-20` for the content to be fixed when sidebar slides in and out