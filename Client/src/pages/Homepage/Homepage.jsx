import React from 'react'
import Banner from '../../components/Homepage/Banner.jsx'
import What from '../../components/Homepage/What.jsx';
import Why from '../../components/Homepage/Why.jsx';
import How from '../../components/Homepage/How.jsx'


function Homepage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Banner />
        <What />
        <Why />
        <How />
      </main>
    </div>
  );
}

export default Homepage
