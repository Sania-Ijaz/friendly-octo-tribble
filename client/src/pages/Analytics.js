import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';

export default function Analytics() {
  const {
    state: { events, activities, resources, people, accounts, loading, error },
    fetchEvents, fetchActivities, fetchResources, fetchPeople, fetchAccounts, clearError,
  } = useApp();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  useEffect(() => {
    fetchEvents();
    fetchActivities();
    fetchResources();
    fetchPeople();
    fetchAccounts();
    // eslint-disable-next-line
  }, []);

  // Filter events by date range
  const filteredEvents = events.filter((ev) => {
    const d = new Date(ev.date || ev.createdAt);
    const fromOk = !dateFrom || d >= new Date(dateFrom);
    const toOk   = !dateTo   || d <= new Date(dateTo + 'T23:59:59');
    return fromOk && toOk;
  });

  // ── Aggregate stats ────────────────────────────────────────────────────────
  let totalInputs   = 0;
  let totalOutcomes = 0;
  let totalSpent    = 0;
  let totalEarned   = 0;

  const resourceUsage = {};
  const peopleUsage   = {};

  filteredEvents.forEach((ev) => {
    // Inputs
    (ev.inputs || []).forEach((inp) => {
      const v = parseFloat(inp.value);
      if (!isNaN(v)) totalInputs += v;
    });
    // Outcomes
    (ev.outcomes || []).forEach((oc) => {
      const v = parseFloat(oc.value);
      if (!isNaN(v)) totalOutcomes += v;
    });
    // Financials
    (ev.financials || []).forEach((fi) => {
      const amt = parseFloat(fi.amount);
      if (!isNaN(amt)) {
        if (fi.txType === 'earned') totalEarned += amt;
        else                        totalSpent  += amt;
      }
    });
    // Resource usage
    (ev.resources || []).forEach((r) => {
      const id   = r._id || r;
      const name = r.name || resources.find((x) => x._id === id)?.name || id;
      if (!resourceUsage[id]) resourceUsage[id] = { name, count: 0 };
      resourceUsage[id].count++;
    });
    // People frequency
    (ev.people || []).forEach((p) => {
      const id   = p._id || p;
      const name = p.name || people.find((x) => x._id === id)?.name || id;
      if (!peopleUsage[id]) peopleUsage[id] = { name, count: 0 };
      peopleUsage[id].count++;
    });
  });

  const topResources = Object.values(resourceUsage).sort((a, b) => b.count - a.count).slice(0, 10);
  const topPeople    = Object.values(peopleUsage).sort((a, b) => b.count - a.count).slice(0, 10);

  // Activity event frequency
  const activityFreq = {};
  filteredEvents.forEach((ev) => {
    (ev.activities || []).forEach((a) => {
      const id   = a._id || a;
      const name = a.name || activities.find((x) => x._id === id)?.name || id;
      if (!activityFreq[id]) activityFreq[id] = { name, count: 0 };
      activityFreq[id].count++;
    });
  });
  const topActivities = Object.values(activityFreq).sort((a, b) => b.count - a.count).slice(0, 10);

  const netBalance = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0);

  if (loading && !events.length) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Date range filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Date range:</span>
        <input type="date" className="input w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" className="input w-40" value={dateTo}   onChange={(e) => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="btn-secondary text-xs">Clear</button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {filteredEvents.length} of {events.length} event(s) shown
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Input Value"  value={totalInputs.toFixed(2)}   color="bg-blue-500"   icon="📥" />
        <StatCard label="Total Outcome Value" value={totalOutcomes.toFixed(2)} color="bg-green-500"  icon="📤" />
        <StatCard label="Total Spent"         value={`$${totalSpent.toFixed(2)}`}  color="bg-red-500"    icon="💸" />
        <StatCard label="Total Earned"        value={`$${totalEarned.toFixed(2)}`} color="bg-yellow-500" icon="💰" />
      </div>

      {/* Account net balance */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Net Balance</h2>
        <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {netBalance >= 0 ? '+' : ''}{netBalance.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Across {accounts.length} account(s)</p>
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Inputs vs Outcomes Over Time</h2>
        <div className="border-2 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center text-gray-400 text-sm">
          📈 Chart placeholder — integrate Recharts or Chart.js here
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Activities */}
        <FreqTable title="Most Active Activities" rows={topActivities} icon="🎯" />
        {/* Resource utilization */}
        <FreqTable title="Resource Utilization"   rows={topResources}  icon="🗂️" />
        {/* People frequency */}
        <FreqTable title="People Interaction"     rows={topPeople}     icon="👥" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`${color} text-white text-2xl w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function FreqTable({ title, rows, icon }) {
  const max = rows[0]?.count || 1;
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-700 mb-3">{icon} {title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-2 text-gray-700 truncate max-w-0 w-full pr-3">{r.name}</td>
                <td className="py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 bg-indigo-500 rounded-full"
                        style={{ width: `${(r.count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{r.count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
