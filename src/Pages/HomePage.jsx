import React from 'react'
import LandingPage from '../Components/Home/Landing'
import Footer from '../Components/Home/Footer'
import What from '../Components/Home/What'
import Why from '../Components/Home/Why'
import How from '../Components/Home/How'
import './HomePage.css'

function HomePage() {
  return (
    <div className='HomePageContainer'>
      <LandingPage/>
      <What />
      <Why />
      <How />
      <Footer />
    </div>
  )
}

export default HomePage
