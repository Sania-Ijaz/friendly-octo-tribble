import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-md z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide hover:text-indigo-300 transition-colors">
          <span className="text-indigo-400">⚡</span>
          LifeWork Manager
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
          <Link to="/events"    className="hover:text-white transition-colors">Log Event</Link>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-xs">MERN App</span>
        </div>
      </div>
    </nav>
  );
}
