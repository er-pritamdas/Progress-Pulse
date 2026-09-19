import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Navigation, TrendingUp, Wallet, CalendarCheck, Grid2x2Plus, Grid2x2Check, Settings2, Target, User, AlertTriangle, Palette, ShieldCheck, Bell, Download } from 'lucide-react';
import Dashboard from '../../utils/Icons/Dashboard';
import QuickCalculator from '../Expense/QuickCalculator';

export default function ThemedBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean); // ['dashboard', 'habit', 'table-entry']

  const mainCategoryIcon = {
    Habit: <CalendarCheck className="w-4 h-4" />,
    Investment: <TrendingUp className="w-4 h-4" />,
    Expense: <Wallet className="w-4 h-4" />,
    Settings: <Settings2 className="w-4 h-4" />,
    Profile: <User className="w-4 h-4" />,
  };

  const subCategoryIcon = {
    'Table Entry': <Grid2x2Plus className="w-4 h-4" />,
    'Dashboard': <Dashboard />,
    'Table View': <Grid2x2Check className="w-4 h-4" />,
    'Portfolio': <Grid2x2Check className="w-4 h-4" />,
    'Settings': <Settings2 className="w-4 h-4" />,
    'Logging': <Grid2x2Check className="w-4 h-4" />,
    'Planner': <Target className="w-4 h-4" />,
    'Profile': <User className="w-4 h-4" />,
    'Preferences': <Palette className="w-4 h-4" />,
    'Security': <ShieldCheck className="w-4 h-4" />,
    'Reminders': <Bell className="w-4 h-4" />,
    'Notifications': <Bell className="w-4 h-4" />,
    'Exports': <Download className="w-4 h-4" />,
    'Danger Zone': <AlertTriangle className="w-4 h-4 text-error" />,
  };

  const mainCategoryRaw = pathnames[1]; // habit, expense, investment
  const subCategoryRaw = pathnames[2]; // table-entry, dashboard, table-view, settings

  const isExpensePage = location.pathname.toLowerCase().includes('/expense');

  const mainCategory = mainCategoryRaw
    ? mainCategoryRaw.charAt(0).toUpperCase() + mainCategoryRaw.slice(1)
    : null;

  let subCategory = subCategoryRaw
    ? subCategoryRaw
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    : null;

  if (mainCategoryRaw === 'investment' && (subCategoryRaw === 'table-view' || subCategoryRaw === 'portfolio')) {
    subCategory = 'Portfolio';
  }

  if (mainCategoryRaw === 'investment' && (subCategoryRaw === 'settings' || subCategoryRaw === 'planner')) {
    subCategory = 'Planner';
  }

  return (
    <>
      <div className="hidden md:flex items-center justify-between gap-3 px-4 py-2 bg-base-200 text-base-content rounded-box shadow-sm mt-3 mb-4 relative z-10 min-h-[46px]">
        {/* DaisyUI Breadcrumb navigation bar */}
        <div className="breadcrumbs text-sm p-0 flex-1 min-w-0">
          <ul className="flex items-center gap-2">
            <li>
              <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </li>

            {mainCategory && (
              <li>
                <Link
                  to={`/dashboard/${mainCategoryRaw}`}
                  className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  {mainCategoryIcon[mainCategory] || <BookOpen className="w-4 h-4" />}
                  {mainCategory}
                </Link>
              </li>
            )}

            {subCategory && (
              <li>
                <span className="text-primary font-bold flex items-center gap-1">
                  {subCategoryIcon[subCategory] || <Navigation className="w-4 h-4" />}
                  {subCategory}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Extreme Right Action Slot for Breadcrumbs Navigation Bar */}
        <div id="breadcrumb-actions" className="flex items-center gap-2 shrink-0"></div>
      </div>

      {/* Floating Action Quick Calculator for Expense Pages */}
      {isExpensePage && <QuickCalculator />}
    </>
  );
}
