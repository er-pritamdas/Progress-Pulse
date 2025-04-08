import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Footer from '../components/Homepage/Footer';
import Navbar from '../components/Homepage/Navbar';

function Layout() {
  const location = useLocation();
  const isOtpPage = location.pathname === "/otp";
  const allowOtp = localStorage.getItem("allowOtp");

  const hideNavFooter = ["/login", "/signup", "/otp"].includes(location.pathname);

  if (!isOtpPage){
    localStorage.setItem('allowOtp', false);
  }
  // OTP route protection
  if (isOtpPage && allowOtp !== "true") {
    return <Navigate to="/signup" replace />;
  }

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <Outlet />
      {!hideNavFooter && <Footer />}
    </>
  );
}

export default Layout;
