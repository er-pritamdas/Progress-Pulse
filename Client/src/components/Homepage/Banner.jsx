import React from 'react'
import Spline from '@splinetool/react-spline';


function Banner() {
    return (
        <>

            <div className="flex w-full h-screen border border-gray-500 p-4">
                <div className="card bg-base-300 rounded-box grid grow place-items-center w-[40%]">
                    <span>
                        PROGRESS PULSE
                    </span>
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="card bg-base-300 rounded-box grid grow place-items-center">
                    {/* <Spline scene="https://prod.spline.design/N4T5SkNQKyp5hsF3/scene.splinecode" /> */}
                </div>
            </div>

        </>
    )
}

export default Banner
