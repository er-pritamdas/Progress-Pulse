import React, { useRef, useEffect, useState } from 'react'

// Importing Components
import FileTree from './FileTree'


function Sidebar({ open, setOpen }) {

    // Pinned State
    const [pinned, setPinned] = useState(false)

    // Ref for sidebar to detect clicks outside
    const sidebarRef = useRef(null)

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !pinned) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setOpen, pinned])


    // ---------------------------------- Sidebar HTML Layout -------------------------
    return (
        <div
            ref={sidebarRef}
            className={`relative z-50 transition-all duration-300 ease-in-out bg-base-200 h-full overflow-y-auto scroll-hidden ${open ? 'w-64' : 'w-22'
                }`}>

            <ul className="menu p-2 space-y-2">
                <li className='flex flex-row justify-between items-center'>
                    {/* Hamburger Button */}
                    <button className="btn btn-ghost justify-start flex-1" onClick={() => setOpen(!open)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {open && <span className="ml-2">Menu</span>}
                    </button>

                    {/* Pin Button */}
                    {open && (
                        <button
                            className={`btn btn-ghost btn-sm btn-circle ${pinned ? 'text-primary' : 'text-base-content/50'}`}
                            onClick={() => setPinned(!pinned)}
                            title={pinned ? "Unpin Sidebar" : "Pin Sidebar"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="17" x2="12" y2="22"></line>
                                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                            </svg>
                        </button>
                    )}
                </li>

                <FileTree open={open} setOpen={setOpen} />
            </ul>
        </div>
    )
}

export default Sidebar
