import React from 'react'
import { Outlet } from 'react-router-dom';

function ExpenseLayout() {
    return (
        <div>
            <Outlet />
        </div>
    )
}

export default ExpenseLayout
