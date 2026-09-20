import React, { useEffect } from 'react';
import Banner from '../../components/Homepage/Banner.jsx';
import What from '../../components/Homepage/What.jsx';
import Why from '../../components/Homepage/Why.jsx';
import How from '../../components/Homepage/How.jsx';
import MobileHomepage from '../../components/Homepage/MobileHomepage.jsx';
import { TitleChanger } from '../../utils/TitleChanger.jsx';

function Homepage() {
  TitleChanger("Progress Pulse | Home");

  useEffect(() => {
    // Ping Render server in background so it warms up if asleep
    fetch('/api/v1/health').catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop View (md and up) - 100% Untouched Original Components */}
      <main className="flex-grow hidden md:block">
        <Banner />
        <What />
        <Why />
        <How />
      </main>

      {/* Phone View (< md) - Redesigned Mobile Experience */}
      <main className="flex-grow block md:hidden">
        <MobileHomepage />
      </main>
    </div>
  );
}

export default Homepage
