import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';

const summaryCards = [
  { label: 'Activities', entity: 'activities', to: '/activities', icon: '🎯', color: 'bg-indigo-500' },
  { label: 'Tasks',      entity: 'tasks',      to: '/tasks',      icon: '✅', color: 'bg-green-500'  },
  { label: 'Events',     entity: 'events',     to: '/events',     icon: '📅', color: 'bg-yellow-500' },
  { label: 'Accounts',   entity: 'accounts',   to: '/accounts',   icon: '💰', color: 'bg-blue-500'   },
];

const quickLinks = [
  { to: '/activities', label: 'Manage Activities', icon: '🎯' },
  { to: '/events',     label: 'Log an Event',      icon: '📅' },
  { to: '/tasks',      label: 'Track Tasks',       icon: '✅' },
  { to: '/inputs',     label: 'View Inputs',       icon: '📥' },
  { to: '/resources',  label: 'Resources',         icon: '🗂️' },
  { to: '/people',     label: 'People',            icon: '👥' },
  { to: '/accounts',   label: 'Financial Accounts', icon: '💰' },
  { to: '/analytics',  label: 'Analytics',         icon: '📊' },
];

export default function Dashboard() {
  const {
    state: { activities, tasks, events, accounts, loading, error },
    fetchActivities, fetchTasks, fetchEvents, fetchAccounts, clearError,
  } = useApp();

  useEffect(() => {
    fetchActivities();
    fetchTasks();
    fetchEvents();
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !activities.length && !events.length) return <LoadingSpinner />;

  const counts = { activities: activities.length, tasks: tasks.length, events: events.length, accounts: accounts.length };
  const recentEvents = [...events].reverse().slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, entity, to, icon, color }) => (
          <Link
            key={entity}
            to={to}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`${color} text-white text-2xl w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{counts[entity]}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Events</h2>
            <Link to="/events" className="text-sm text-indigo-600 hover:underline">View all →</Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No events yet. <Link to="/events" className="text-indigo-500 hover:underline">Log your first event</Link></p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentEvents.map((ev) => (
                <li key={ev._id} className="py-3 flex items-start gap-3">
                  <span className="text-lg">📅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {ev.name || ev.notes || 'Event'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(ev.date || ev.createdAt).toLocaleDateString()} ·{' '}
                      {ev.activities?.length || 0} activit{ev.activities?.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
