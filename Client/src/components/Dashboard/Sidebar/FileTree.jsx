
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from '@mui/material';

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

    // DaisyUI style for MUI Tooltip
    const tooltipSlotProps = {
        tooltip: {
            className: "bg-neutral text-neutral-content rounded px-2 py-1 text-sm font-medium shadow-lg"
        },
        arrow: {
            className: "text-neutral"
        }
    };

    return (
        <>
            {/* Habit Tracker */}
            <ul>
                <li>
                    <details>
                        <summary
                            className="btn btn-ghost justify-start m-1"
                        >
                            <Tooltip title={!open ? "Habit Tracker" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                <div className="flex items-center">
                                    <AlarmClockCheck />
                                    {open && <span className="ml-2">Habit Tracker</span>}
                                </div>
                            </Tooltip>
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Tooltip title={!open ? "Table Entry" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/habit/table-entry"
                                        className={getLinkClass("/dashboard/habit/table-entry")}
                                    >
                                        <TableEntry />
                                        {open && <span className="ml-2">Table Entry</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Dashboard" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/habit/dashboard"
                                        className={getLinkClass("/dashboard/habit/dashboard")}
                                    >
                                        <Dashboard />
                                        {open && <span className="ml-2">Dashboard</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Logging" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/habit/logging"
                                        className={getLinkClass("/dashboard/habit/logging")}
                                    >
                                        <TableView />
                                        {open && <span className="ml-2">Logging</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Settings" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/habit/settings"
                                        className={getLinkClass("/dashboard/habit/settings")}
                                    >
                                        <Settings />
                                        {open && <span className="ml-2">Settings</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            {/* Expense Tracker */}
            <ul>
                <li>
                    <details>
                        <summary
                            className="btn btn-ghost justify-start m-1"
                        >
                            <Tooltip title={!open ? "Expense Tracker" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                <div className="flex items-center">
                                    <CreditCard />
                                    {open && <span className="ml-2">Expense Tracker</span>}
                                </div>
                            </Tooltip>
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Tooltip title={!open ? "Table Entry" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/expense/table-entry"
                                        className={getLinkClass("/dashboard/expense/table-entry")}
                                    >
                                        <TableEntry />
                                        {open && <span className="ml-2">Table Entry</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Dashboard" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/expense/dashboard"
                                        className={getLinkClass("/dashboard/expense/dashboard")}
                                    >
                                        <Dashboard />
                                        {open && <span className="ml-2">Dashboard</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Table View" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/expense/table-view"
                                        className={getLinkClass("/dashboard/expense/table-view")}
                                    >
                                        <TableView />
                                        {open && <span className="ml-2">Table View</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Settings" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/expense/settings"
                                        className={getLinkClass("/dashboard/expense/settings")}
                                    >
                                        <Settings />
                                        {open && <span className="ml-2">Settings</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            {/* Investment Tracker */}
            <ul>
                <li>
                    <details>
                        <summary
                            className="btn btn-ghost justify-start m-1"
                        >
                            <Tooltip title={!open ? "Investment Tracker" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                <div className="flex items-center">
                                    <Wallet />
                                    {open && <span className="ml-2">Investment Tracker</span>}
                                </div>
                            </Tooltip>
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Tooltip title={!open ? "Table Entry" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/investment/table-entry"
                                        className={getLinkClass("/dashboard/investment/table-entry")}
                                    >
                                        <TableEntry />
                                        {open && <span className="ml-2">Table Entry</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Dashboard" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/investment/dashboard"
                                        className={getLinkClass("/dashboard/investment/dashboard")}
                                    >
                                        <Dashboard />
                                        {open && <span className="ml-2">Dashboard</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Table View" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/investment/table-view"
                                        className={getLinkClass("/dashboard/investment/table-view")}
                                    >
                                        <TableView />
                                        {open && <span className="ml-2">Table View</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                            <li>
                                <Tooltip title={!open ? "Settings" : ""} placement="right" arrow slotProps={tooltipSlotProps}>
                                    <Link
                                        to="/dashboard/investment/settings"
                                        className={getLinkClass("/dashboard/investment/settings")}
                                    >
                                        <Settings />
                                        {open && <span className="ml-2">Settings</span>}
                                    </Link>
                                </Tooltip>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
        </>
    );
}

export default FileTree;
