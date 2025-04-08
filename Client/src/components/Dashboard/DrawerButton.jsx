import React, { useEffect } from 'react'

function DrawerButton() {
    // Toggle drawer manually using class on the drawer element
    const toggleDrawer = () => {
        const drawer = document.getElementById('drawer-panel')
        if (drawer.classList.contains('hidden')) {
            drawer.classList.remove('hidden')
        } else {
            drawer.classList.add('hidden')
        }
    }

    return (
        <button onClick={toggleDrawer} className="btn btn-circle">
            {/* Hamburger Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    )
}

export default DrawerButton
