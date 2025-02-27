import React from 'react'
import Spline from '@splinetool/react-spline';
import './HomeCss/Landing.css'

let Heading = "Progress"
let SubHeading = "PULSE"
let SplineLight = "https://prod.spline.design/gbADLQ11z0RPeaVH/scene.splinecode"
let SplineDark = "https://prod.spline.design/hjVrd6TKSwKDhqPc/scene.splinecode"
function LandingPage() {
  return (
    <>
    <div className="Main">
      <div className="Spline_Container">
        {/* <Spline scene={SplineLight} /> */}
      </div>

      <h1 className="Heading_Container">
        <div className="HC1">{Heading}</div>
        <div className="HC2">{SubHeading}</div>
      </h1>
    </div>
    </>
  )
}

export default LandingPage
