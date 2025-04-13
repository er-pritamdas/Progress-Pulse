import React from 'react'
import { Outlet } from 'react-router-dom';


function Investment() {
  return (
    <div>
      Investment Page
      <Outlet />
    </div>
  )
}

export default Investment
