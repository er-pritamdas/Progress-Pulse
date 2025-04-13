import React from 'react'
import { Outlet } from 'react-router-dom';

function ExpenseLayout() {
    return (
        <div>
            This is Expense Layout
            <Outlet />

        </div>
    )
}

export default ExpenseLayout
