import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Navigation, TrendingUp, Wallet, CalendarCheck, Grid2x2Plus, Grid2x2Check, Settings2 } from 'lucide-react';
import Dashboard from '../../utils/Icons/Dashboard';

export default function ThemedBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean); // ['dashboard', 'habit', 'table-entry']

  const mainCategoryIcon = {
    Habit: <CalendarCheck className="w-4 h-4" />,
    Investment: <TrendingUp className="w-4 h-4" />,
    Expense: <Wallet className="w-4 h-4" />,
  };

  const subCategoryIcon = {
    'Table Entry': <Grid2x2Plus className="w-4 h-4" />,
    'Dashboard': <Dashboard />,
    'Table View': <Grid2x2Check className="w-4 h-4" />,
    'Settings' : <Settings2 className="w-4 h-4" />,
  };

  const mainCategoryRaw = pathnames[1]; // habit, expense, investment
  const subCategoryRaw = pathnames[2]; // table-entry, dashboard, table-view, settings

  const mainCategory = mainCategoryRaw
    ? mainCategoryRaw.charAt(0).toUpperCase() + mainCategoryRaw.slice(1)
    : null;

  const subCategory = subCategoryRaw
    ? subCategoryRaw
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : null;

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
              to={`/dashboard/${mainCategoryRaw}`}
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
