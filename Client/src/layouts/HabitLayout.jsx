import React from 'react'
import { Outlet } from 'react-router-dom';

function HabitLayout() {
  return (
    <div>
      This is Habit Layout
      <Outlet />
    </div>
  )
}

export default HabitLayout
