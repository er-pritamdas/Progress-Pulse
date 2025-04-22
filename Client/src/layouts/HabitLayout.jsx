import React from 'react'
import { Outlet } from 'react-router-dom';

function HabitLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default HabitLayout
