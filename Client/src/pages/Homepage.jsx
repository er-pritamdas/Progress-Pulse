import React from 'react'
import Navbar from '../layouts/navBar'
import Footer from '../layouts/Footer'
import How from '../components/Home/How'
import Banner from '../components/Home/Banner'

function Homepage() {
  return (
    <>
      <Navbar/>
      <Banner/>
      <How/>
      <Footer/>
    </>
  )
}

export default Homepage
