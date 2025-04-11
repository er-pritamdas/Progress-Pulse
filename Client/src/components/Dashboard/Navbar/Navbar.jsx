import React, { useState } from 'react'

// Importing Components
import ThemeSwitcher from '../../../utils/ThemeSwitches'

function Navbar() {

    // --------------------- Navbar HTML Layout -------------------------
    return (
        <>
            {/* Fixed Navbar */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 p-0 z-1000">

                {/* Logo */}
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Progress Pulse</a>
                </div>

                <div className="flex justify-between items-center">

                    <ThemeSwitcher />

                    {/* SearchBar */}
                    <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto mr-2" />


                    {/* User Avatar */}
                    <div className="dropdown dropdown-end mr-2">

                        {/* AvatarImage */}
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div class="avatar avatar-online avatar-placeholder">
                                <div class="bg-neutral text-neutral-content w-10 rounded-full">
                                    <span class="text-l">JB</span>
                                </div>
                            </div>
                        </div>

                        {/* DropDown List */}
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li>
                                <a className="justify-between">
                                    Profile
                                    <span className="badge">New</span>
                                </a>
                            </li>
                            <li><a>Settings</a></li>
                            <li><a>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar
