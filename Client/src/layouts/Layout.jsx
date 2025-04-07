import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Homepage/Footer';
import Navbar from '../components/Homepage/Navbar';

function Layout() {
  const location = useLocation();
  const hideNavFooter = ["/login", "/signup", "/otp"].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <Outlet />
      {!hideNavFooter && <Footer />}
    </>
  );
}

export default Layout;
