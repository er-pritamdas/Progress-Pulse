import React from 'react'
import { Outlet } from 'react-router-dom';

function Habit() {
  return (
    <div>
      This is Habit Page
      <Outlet />
    </div>
  )
}

export default Habit
