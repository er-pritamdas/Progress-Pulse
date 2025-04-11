import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Navigation, TrendingUp, Wallet, CalendarCheck } from 'lucide-react'; // Add icons
import clsx from 'clsx'; // Optional: For cleaner conditional classNames
import Dashboard from '../../utils/Icons/Dashboard';

export default function ThemedBreadcrumbs() {
  const location = useLocation();

  const mainCategoryIcon = {
    Habit: <CalendarCheck className="w-4 h-4" />,
    Investment: <TrendingUp className="w-4 h-4" />,
    Expense: <Wallet className="w-4 h-4" />,
  };

  const subCategoryIcon = {
    'Table Entry': <BookOpen className="w-4 h-4" />,
    'Dashboard': <Dashboard />,
    'Table View': <BookOpen className="w-4 h-4" />,
  };

  const pathnames = location.pathname.split('/').filter(Boolean);

  // e.g., /sheet/Habit-table-entry => ["sheet", "Habit-table-entry"]
  const [mainSheet, ...subSheets] = pathnames[1]?.split('-') || [];

  const mainCategory = mainSheet
    ? mainSheet.charAt(0).toUpperCase() + mainSheet.slice(1).toLowerCase()
    : null;

  const subCategory = subSheets
    .map((sheet) => sheet.charAt(0).toUpperCase() + sheet.slice(1).toLowerCase())
    .join(' ');

  return (
    <div className="breadcrumbs text-sm p-4 bg-base-200 text-base-content rounded-box shadow-sm mb-4">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
        </li>

        {mainCategory && (
          <li>
            <Link
              to={`/dashboard/${mainSheet}`}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              {mainCategoryIcon[mainCategory] || <BookOpen className="w-4 h-4" />}
              {mainCategory}
            </Link>
          </li>
        )}

        {subCategory && (
          <li>
            <span className="text-primary font-medium flex items-center gap-1">
              {subCategoryIcon[subCategory] || <Navigation className="w-4 h-4" />}
              {subCategory}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
