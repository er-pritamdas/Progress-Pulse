import React from 'react'
import { Outlet } from 'react-router-dom';

function Expense() {
  return (
    <div>
      Expense Page
      <Outlet />

    </div>
  )
}

export default Expense
