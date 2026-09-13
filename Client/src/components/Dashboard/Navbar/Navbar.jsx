import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLoading } from '../../../Context/LoadingContext.jsx';
import ErrorAlert from '../../../utils/Alerts/ErrorAlert';
import SuccessAlert from '../../../utils/Alerts/SuccessAlert';
import axios from "axios";
import { useAuth } from '../../../Context/JwtAuthContext.jsx';


import { Calendar, Clock, User, Settings, LogOut, Globe, Palette, ShieldCheck, AlertTriangle } from 'lucide-react';

// Importing Components
import ThemeSwitcher from '../../../utils/ThemeSwitches'
import QuickCalculator from '../../Expense/QuickCalculator';
import { getGeoDateTime } from '../../../utils/geoDateTime';


function Navbar() {

    const {validToken, setvalidToken} = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const isExpensePage = location.pathname.toLowerCase().includes('/expense');
    const { setLoading } = useLoading();
    const [disableButton, setDisableButton] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");


    const [initials, setInitials] = useState('');
    const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePic') || '');
    const [displayName, setDisplayName] = useState(() => localStorage.getItem('fullName') || localStorage.getItem('username') || '');
    const [dateTime, setDateTime] = useState(() => getGeoDateTime());

    useEffect(() => {
        const updateTime = () => setDateTime(getGeoDateTime());
        const timer = setInterval(updateTime, 1000);

        window.addEventListener('user-timezone-updated', updateTime);

        return () => {
            clearInterval(timer);
            window.removeEventListener('user-timezone-updated', updateTime);
        };
    }, []);

    useEffect(() => {
        const syncProfile = () => {
            const pic = localStorage.getItem('profilePic') || '';
            setProfilePic(pic);

            let storedFullName = localStorage.getItem('fullName');
            let storedUser = localStorage.getItem('username');

            if (!storedFullName) {
                try {
                    const parsed = JSON.parse(localStorage.getItem('user_profile') || '{}');
                    if (parsed.fullName) storedFullName = parsed.fullName;
                    if (parsed.profilePic && !pic) setProfilePic(parsed.profilePic);
                } catch (e) {}
            }

            const name = storedFullName || storedUser || 'User';
            setDisplayName(name);

            if (name) {
                const words = name.trim().split(' ');
                let inits = '';
                if (words.length >= 2) {
                    inits = words[0][0] + words[1][0];
                } else if (words.length === 1) {
                    inits = words[0][0];
                }
                setInitials(inits.toUpperCase());
            }
        };

        syncProfile();

        // Listen to custom event when user updates profile in settings
        window.addEventListener('user-profile-updated', syncProfile);
        window.addEventListener('storage', syncProfile);

        // Global notification event listener
        const handleGlobalNotification = (e) => {
            if (e.detail?.message) {
                if (e.detail.type === 'error') {
                    setErrorMsg(e.detail.message);
                    setShowErrorAlert(true);
                    setTimeout(() => setShowErrorAlert(false), e.detail.duration || 4000);
                } else {
                    setSuccessMsg(e.detail.message);
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), e.detail.duration || 4000);
                }
            }
        };
        window.addEventListener('pulse-notify', handleGlobalNotification);

        return () => {
            window.removeEventListener('user-profile-updated', syncProfile);
            window.removeEventListener('storage', syncProfile);
            window.removeEventListener('pulse-notify', handleGlobalNotification);
        };
    }, []);

    const handleLogout = async () => {
        const username = localStorage.getItem("username");
        try {
            setDisableButton(true);
            setLoading(true);

            const formData = { username };
            await axios.post("/api/v1/users/logout", formData);
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            localStorage.removeItem("fullName");
            localStorage.removeItem("profilePic");
            localStorage.removeItem("user_profile");

            setSuccessMsg("User Logged Out Successfully");
            setShowSuccessAlert(true);
            setTimeout(() => {
                navigate("/");
                setLoading(false);
                setShowSuccessAlert(false);
                setTimeout(() => { 
                    setvalidToken(false);
                }, 1000);
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
            <div className="navbar bg-base-200 shadow-sm sticky top-0 px-3 sm:px-4 py-0 z-[1000] flex justify-between items-center">

                {/* Left: Progress Pulse Logo + Name + Live IST Date/Time */}
                <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                    <Link to="/" className="btn btn-ghost px-2 hover:bg-base-300/60 flex items-center gap-2.5 normal-case rounded-xl shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-base-100 border border-base-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                            <img
                                src="/favicon/favicon.svg"
                                alt="Progress Pulse Logo"
                                className="w-full h-full object-contain p-0.5"
                            />
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tight text-base-content">
                            Progress Pulse
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ThemeSwitcher />

                    {/* Geographic Location Date & Time (Placed after Theme Dropdown) */}
                    <div 
                        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-base-100/80 border border-base-300 shadow-2xs shrink-0 cursor-default"
                        title={`Geographic Location: ${dateTime.city} (${dateTime.timeZone})`}
                    >
                        <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-base-content/80 font-mono">
                            <Calendar size={13} className="text-primary shrink-0" />
                            <span>{dateTime.formattedDate}</span>
                        </div>
                        <span className="hidden md:inline text-base-content/30 text-xs">•</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary font-mono">
                            <Clock size={13} className="shrink-0" />
                            <span>{dateTime.formattedTime}</span>
                        </div>
                    </div>

                    {/* User Avatar */}
                    <div className="dropdown dropdown-end mr-2 z-[1002]">

                        {/* Avatar Button */}
                        <div 
                            tabIndex={0} 
                            role="button" 
                            className="btn btn-ghost btn-circle avatar p-0 ring-2 ring-primary/25 hover:ring-primary/60 transition-all overflow-hidden"
                            title="Account Settings & Profile"
                        >
                            {profilePic ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    <img
                                        src={profilePic}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="avatar avatar-online avatar-placeholder">
                                    <div className="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-black">
                                            {initials || "XX"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* DropDown List */}
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-300 rounded-2xl z-[1003] mt-3 w-60 p-2 shadow-2xl border border-base-100/30"
                        >
                            {/* User Header Summary Card */}
                            <li className="menu-title px-3 py-2 border-b border-base-content/10 mb-1">
                                <Link to="/dashboard/settings/profile" className="flex items-center gap-2.5 p-0 hover:bg-transparent">
                                    {profilePic ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-primary/40">
                                            <img src={profilePic} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                            {initials || "U"}
                                        </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-base-content truncate">
                                            {displayName || "User"}
                                        </span>
                                        <span className="text-[10px] text-base-content/60 font-mono truncate">
                                            @{localStorage.getItem("username") || "account"}
                                        </span>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link to="/dashboard/settings/profile" className="flex items-center justify-between py-2 rounded-xl">
                                    <span className="flex items-center gap-2 font-medium">
                                        <User size={15} className="text-primary" />
                                        Profile & Picture
                                    </span>
                                    <span className="badge badge-xs badge-primary">Edit</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/settings/preferences" className="flex items-center justify-between py-2 rounded-xl">
                                    <span className="flex items-center gap-2 font-medium">
                                        <Palette size={15} className="text-secondary" />
                                        Theme & Preferences
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/settings/security" className="flex items-center justify-between py-2 rounded-xl">
                                    <span className="flex items-center gap-2 font-medium">
                                        <ShieldCheck size={15} className="text-info" />
                                        Security & Password
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/settings/danger-zone" className="flex items-center justify-between py-2 rounded-xl text-error hover:bg-error/10">
                                    <span className="flex items-center gap-2 font-medium">
                                        <AlertTriangle size={15} className="text-error" />
                                        Danger Zone
                                    </span>
                                    <span className="badge badge-xs badge-error">Reset</span>
                                </Link>
                            </li>
                            <div className="divider my-1"></div>
                            <li>
                                <button 
                                    onClick={handleLogout} 
                                    disabled={disableButton}
                                    className="flex items-center gap-2 text-error hover:bg-error/10 py-2 rounded-xl font-medium"
                                >
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                {showSuccessAlert && <SuccessAlert message={successMsg} onClose={() => setShowSuccessAlert(false)} />}
                {showErrorAlert && <ErrorAlert message={errorMsg} onClose={() => setShowErrorAlert(false)} />}
            </div>
        </>
    )
}

export default Navbar
