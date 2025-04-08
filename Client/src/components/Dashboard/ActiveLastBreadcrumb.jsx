import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Navigation } from 'lucide-react'; // Optional icons

export default function ThemedBreadcrumbs() {
  return (
    <div className="breadcrumbs text-sm p-4 bg-base-100 text-base-content rounded-box shadow-sm">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            MUI
          </Link>
        </li>
        <li>
          <Link to="/material-ui/getting-started/installation/" className="hover:text-primary transition-colors flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Core
          </Link>
        </li>
        <li>
          <span className="text-primary font-medium flex items-center gap-1">
            <Navigation className="w-4 h-4" />
            Breadcrumbs
          </span>
        </li>
      </ul>
    </div>
  );
}
