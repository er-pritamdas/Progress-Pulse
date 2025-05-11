import React from 'react';
import { Link, useLocation } from "react-router-dom";

import AlarmClockCheck from '../../../utils/Icons/AlarmClockCheck';
import CreditCard from '../../../utils/Icons/CreditCard';
import Wallet from '../../../utils/Icons/Wallet';
import TableView from '../../../utils/Icons/TableView';
import TableEntry from '../../../utils/Icons/TableEntry';
import Dashboard from '../../../utils/Icons/Dashboard';
import Settings from '../../../utils/Icons/Settings';

function FileTree({ open, setOpen }) {
    const location = useLocation();

    // Only apply 'btn-active' if pathname starts with /dashboard/
    const isActive = (path) => {
        return location.pathname === path && location.pathname.startsWith("/dashboard/");
    };

    const getLinkClass = (path) => {
        const baseClass = "btn btn-success btn-soft justify-start m-1";
        return isActive(path) ? `${baseClass} btn-active` : baseClass;
    };

    return (
        <>
            {/* Habit Tracker */}
            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start m-1">
                            <AlarmClockCheck />
                            {open && <span className="ml-2">Habit Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/habit/table-entry" className={getLinkClass("/dashboard/habit/table-entry")}>
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit/dashboard" className={getLinkClass("/dashboard/habit/dashboard")}>
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit/table-view" className={getLinkClass("/dashboard/habit/table-view")}>
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit/settings" className={getLinkClass("/dashboard/habit/settings")}>
                                    <Settings />
                                    {open && <span className="ml-2">Settings</span>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            {/* Expense Tracker */}
            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start m-1">
                            <CreditCard />
                            {open && <span className="ml-2">Expense Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/expense/table-entry" className={getLinkClass("/dashboard/expense/table-entry")}>
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense/dashboard" className={getLinkClass("/dashboard/expense/dashboard")}>
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense/table-view" className={getLinkClass("/dashboard/expense/table-view")}>
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense/settings" className={getLinkClass("/dashboard/expense/settings")}>
                                    <Settings />
                                    {open && <span className="ml-2">Settings</span>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            {/* Investment Tracker */}
            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start m-1">
                            <Wallet />
                            {open && <span className="ml-2">Investment Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/investment/table-entry" className={getLinkClass("/dashboard/investment/table-entry")}>
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment/dashboard" className={getLinkClass("/dashboard/investment/dashboard")}>
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment/table-view" className={getLinkClass("/dashboard/investment/table-view")}>
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment/settings" className={getLinkClass("/dashboard/investment/settings")}>
                                    <Settings />
                                    {open && <span className="ml-2">Settings</span>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
        </>
    );
}

export default FileTree;
