import React from 'react'
import { Outlet } from 'react-router-dom';

function InvestmentLayout() {
    return (
        <div>
            This is Investment Layout
            <Outlet />
        </div>
    )
}

export default InvestmentLayout
