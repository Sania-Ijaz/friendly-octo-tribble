import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard        from './pages/Dashboard';
import Activities       from './pages/Activities';
import Events           from './pages/Events';
import Tasks            from './pages/Tasks';
import Inputs           from './pages/Inputs';
import Resources        from './pages/Resources';
import People           from './pages/People';
import FinancialAccounts from './pages/FinancialAccounts';
import Analytics        from './pages/Analytics';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/events"    element={<Events />} />
                <Route path="/tasks"     element={<Tasks />} />
                <Route path="/inputs"    element={<Inputs />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/people"    element={<People />} />
                <Route path="/accounts"  element={<FinancialAccounts />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
