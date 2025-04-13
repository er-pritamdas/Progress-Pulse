import React from 'react';
import { Link } from "react-router-dom";

import AlarmClockCheck from '../../../utils/Icons/AlarmClockCheck';
import CreditCard from '../../../utils/Icons/CreditCard';
import Wallet from '../../../utils/Icons/Wallet';
import TableView from '../../../utils/Icons/TableView';
import TableEntry from '../../../utils/Icons/TableEntry';
import Dashboard from '../../../utils/Icons/Dashboard';

function FileTree({ open, setOpen }) {
    return (
        <>
            {/* Habit Tracker */}
            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            <AlarmClockCheck />
                            {open && <span className="ml-2">Habit Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/habit/table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit/dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit/table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
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
                        <summary className="btn btn-ghost justify-start">
                            <CreditCard />
                            {open && <span className="ml-2">Expense Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/expense/table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense/dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense/table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
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
                        <summary className="btn btn-ghost justify-start">
                            <Wallet />
                            {open && <span className="ml-2">Investment Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/investment/table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment/dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment/table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
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
