import React from 'react'
import { TitleChanger } from '../../../utils/TitleChanger'

function InvSettings() {
    TitleChanger("Progress Pulse | Invest Settings")
    return (
        <div>
            <div className="h-150 flex items-center justify-center bg-base-200">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-5xl font-bold mb-4">Coming Soon</h1>
                    <p className="text-lg mb-6">We're working on something amazing. Stay tuned!</p>
                    <button className="btn btn-primary">Notify Me</button>
                </div>
            </div>
        </div>
    )
}

export default InvSettings
