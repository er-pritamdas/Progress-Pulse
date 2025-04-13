import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from "react-router-dom";
import { useLoading } from '../../../Context/LoadingContext.jsx';
// import {useAuth} from "../../../Context/JwtAuthContext.jsx";
import useLogout from './logout.jsx';
import ErrorAlert from '../../../utils/Alerts/ErrorAlert';
import SuccessAlert from '../../../utils/Alerts/SuccessAlert';


// Importing Components
import ThemeSwitcher from '../../../utils/ThemeSwitches'

function Navbar() {

    const navigate = useNavigate();
    const logout = useLogout();
    const { setLoading } = useLoading();
    const [disableButton, setDisableButton] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");


    const [initials, setInitials] = useState('');

    // const {name} = useAuth();
    useEffect(() => {
        const name = localStorage.getItem('username'); // make sure the name is stored
        if (name) {
            const words = name.trim().split(' ');
            let initials = '';

            if (words.length >= 2) {
                initials = words[0][0] + words[1][0];
            } else if (words.length === 1) {
                initials = words[0][0];
            }

            setInitials(initials.toUpperCase());
        }
    }, []);

    const handleLogout = async () => {
        const username = localStorage.getItem("username");
        try {
            setDisableButton(true);
            setLoading(true);

            await logout(username);

            setSuccessMsg("User Logged Out Successfully");
            setShowSuccessAlert(true);

            setTimeout(() => {
                setLoading(false);
                setShowSuccessAlert(false);
                navigate("/");
            }, 3000);
        } catch (err) {
            setLoading(false);
            setDisableButton(false);
            const msg = err.response?.data?.message || "Something went wrong";
            setErrorMsg(msg);
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
        }
    };


    // --------------------- Navbar HTML Layout -------------------------
    return (
        <>

            {/* Fixed Navbar */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 p-0 z-1000">

                {/* Logo */}
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost text-xl">Progress Pulse</Link>
                </div>

                <div className="flex justify-between items-center">

                    <ThemeSwitcher />

                    {/* SearchBar */}
                    <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto mr-2" />

                    {showSuccessAlert && <SuccessAlert message={successMsg} />}
                    {showErrorAlert && <ErrorAlert message={errorMsg} />}


                    {/* User Avatar */}
                    <div className="dropdown dropdown-end mr-2">

                        {/* AvatarImage */}
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="avatar avatar-online avatar-placeholder">
                                <div className="bg-neutral text-neutral-content w-9 rounded-full">
                                    <span className="text-l">
                                        {initials || "XX"}
                                    </span>
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
                            <li><button onClick={handleLogout} disabled={disableButton}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar
