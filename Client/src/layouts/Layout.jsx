import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

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
