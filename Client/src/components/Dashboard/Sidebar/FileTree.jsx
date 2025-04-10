import React from 'react'
import AlarmClockCheck from '../../../utils/Icons/AlarmClockCheck'
import CreditCard from '../../../utils/Icons/CreditCard'
import Wallet from '../../../utils/Icons/Wallet'
import TableView from '../../../utils/Icons/TableView'
import TableEntry from '../../../utils/Icons/TableEntry'
import Dashboard from '../../../utils/Icons/Dashboard'
import { Link } from "react-router-dom";


function FileTree({ open, setOpen }) {
    return (
        <>
            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            {/* Icon */}
                            <AlarmClockCheck />
                            {open && <Link to="/dashboard/habit" className="ml-2">Habit Tracker</Link>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/habit-table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <Link to="/dashboard/habit-table-entry" className="ml-2">Table Entry</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit-dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <Link to="/dashboard/habit-dashboard" className="ml-2">Dashboard</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/habit-table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <Link to="/dashboard/habit-table-view" className="ml-2">Table View</Link>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            {/* Icon */}
                            <CreditCard />
                            {open && <Link to="/dashboard/expense" className="ml-2">Expense Tracker</Link>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/expense-table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <Link to="/dashboard/expense-table-entry" className="ml-2">Table Entry</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense-dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <Link to="/dashboard/expense-dashboard" className="ml-2">Dashboard</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/expense-table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <Link to="/dashboard/expense-table-view" className="ml-2">Table View</Link>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            {/* Icon */}
                            <Wallet />
                            {open && <Link to="/dashboard/investment" className="ml-2">Investment Tracker</Link>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <Link to="/dashboard/investment-table-entry" className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <Link to="/dashboard/investment-table-entry" className="ml-2">Table Entry</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment-dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <Link to="/dashboard/investment-dashboard" className="ml-2">Dashboard</Link>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/investment-table-view" className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <Link to="/dashboard/investment-table-view" className="ml-2">Table View</Link>}
                                </Link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

        </>

    )
}

export default FileTree
