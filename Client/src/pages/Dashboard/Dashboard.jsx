import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Progress Pulse</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="https://via.placeholder.com/150" alt="User Avatar" />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Profile</a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-base-100 shadow-md h-screen p-4">
          <ul className="menu">
            <li>
              <a className="active">Dashboard</a>
            </li>
            <li>
              <a>Analytics</a>
            </li>
            <li>
              <a>Projects</a>
            </li>
            <li>
              <a>Settings</a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Card Title 1</h2>
                <p>Some description for card 1.</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Card Title 2</h2>
                <p>Some description for card 2.</p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Card Title 3</h2>
                <p>Some description for card 3.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;