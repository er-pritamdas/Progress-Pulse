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
  const { validToken, isCheckingAuth } = useAuth();
  const isHabitPage = location.pathname.toLowerCase().includes('/habit');
  const isDashboardPage = isHabitPage || location.pathname.toLowerCase().includes('/dashboard');

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------- Conditions before Dashboard -----------------------
  if (!isOtpPage) {
    localStorage.setItem('allowOtp', false);
  }

  // If session is currently being checked or waking up, display connecting screen
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-300">
        <div className="flex flex-col items-center gap-4 p-8 bg-base-100/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <div className="space-y-1">
            <p className="text-base font-semibold text-base-content">
              Connecting to Progress Pulse...
            </p>
            <p className="text-xs text-base-content/60">
              Validating session. Waking up server if asleep...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated = validToken;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // --------------------- Dashboard HTML Layout -------------------------
  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      {/* Sidebar and Outlet */}
      <div className="flex h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
        <div className="hidden md:block h-full shrink-0">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>

        <main className={`flex-1 transition-all duration-300 overflow-y-auto w-full min-w-0 pb-28 md:pb-6 ${
          isDashboardPage ? "px-0 pt-0 md:px-4 md:pt-0 md:pb-6" : "p-2 sm:p-4"
        }`}>
          <ActiveLastBreadcrumb />
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    </>
  );
};

export default DashboardLayout

// NOTES:
// ------------
// Use in Div of Outleft if you want the content to be sliding When sidebar slides in and out
// className={`transition-all duration-300 mt-1 p-4 h-[calc(100vh-4rem)] overflow-y-auto ${sidebarOpen ? 'ml-64' : 'ml-16' }`}
// className={`mt-1 p-4 h-[calc(100vh-4rem)] ml-20` for the content to be fixed when sidebar slides in and out