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
                            <AlarmClockCheck />
                            {open && <span className="ml-2">Habit Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </a>
                            </li>
                            <li>
                                <Link to="/dashboard/habit-dashboard" className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <Link to="/dashboard/habit-dashboard" className="ml-2">Dashboard</Link>}
                                </Link>
                            </li>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            {/* <CreditCard /> */}
                            <CreditCard />
                            {open && <span className="ml-2">Expense Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

            <ul>
                <li>
                    <details>
                        <summary className="btn btn-ghost justify-start">
                            <Wallet />
                            {open && <span className="ml-2">Investment Tracker</span>}
                        </summary>
                        <ul className='ml-0'>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableEntry />
                                    {open && <span className="ml-2">Table Entry</span>}
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <Dashboard />
                                    {open && <span className="ml-2">Dashboard</span>}
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-ghost justify-start">
                                    <TableView />
                                    {open && <span className="ml-2">Table View</span>}
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>

        </>

    )
}

export default FileTree
