import React, { useRef, useEffect, useState } from 'react'

// Importing Components
import FileTree from './FileTree'


function Sidebar({ open, setOpen }) {

    // Ref for sidebar to detect clicks outside
    const sidebarRef = useRef(null)

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setOpen])


    // ---------------------------------- Sidebar HTML Layout -------------------------
    return (
        <div
            ref={sidebarRef}
            className={`transition-all duration-300 ease-in-out bg-base-200 h-full overflow-y-auto scroll-hidden ${open ? 'w-64' : 'w-22'
                }`}>

            <ul className="menu p-2 space-y-2">
                <li>
                    {/* Hamburger Button */}
                    <button className="btn btn-ghost justify-start" onClick={() => setOpen(!open)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {open && <span className="ml-2">Menu</span>}
                    </button>
                </li>
                
                <FileTree open={open} setOpen={setOpen} />
            </ul>
        </div>
    )
}

export default Sidebar
