import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',           label: 'Dashboard',   icon: '🏠' },
  { to: '/activities', label: 'Activities',  icon: '🎯' },
  { to: '/events',     label: 'Events',      icon: '📅' },
  { to: '/tasks',      label: 'Tasks',       icon: '✅' },
  { to: '/inputs',     label: 'Inputs',      icon: '📥' },
  { to: '/resources',  label: 'Resources',   icon: '🗂️' },
  { to: '/people',     label: 'People',      icon: '👥' },
  { to: '/accounts',   label: 'Accounts',    icon: '💰' },
  { to: '/analytics',  label: 'Analytics',   icon: '📊' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-800 text-gray-200 flex flex-col py-4 shrink-0 overflow-y-auto">
      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
