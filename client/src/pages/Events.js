import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { eventsAPI } from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

const EMPTY_FORM = {
  name:        '',
  date:        new Date().toISOString().slice(0, 10),
  notes:       '',
  activities:  [],  // array of IDs
  inputs:      [],  // [{name, type, value}]
  taskProgress:[],  // [{taskId, value}]
  outcomes:    [],  // [{name, value, frequency}]
  resources:   [],  // array of IDs
  people:      [],  // array of IDs
  financials:  [],  // [{accountId, amount, txType}]
};

export default function Events() {
  const {
    state: { events, activities, tasks, resources, people, accounts, loading, error },
    fetchEvents, fetchActivities, fetchTasks, fetchResources, fetchPeople, fetchAccounts,
    createEvent, updateEvent, deleteEvent, clearError,
  } = useApp();

  const [filter, setFilter]   = useState({ activity: '', dateFrom: '', dateTo: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailData,  setDetailData]  = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchActivities();
    fetchTasks();
    fetchResources();
    fetchPeople();
    fetchAccounts();
    // eslint-disable-next-line
  }, []);

  const filtered = events.filter((ev) => {
    const actMatch = !filter.activity ||
      (ev.activities || []).some((a) =>
        (a._id || a) === filter.activity
      );
    const d = new Date(ev.date || ev.createdAt);
    const fromMatch = !filter.dateFrom || d >= new Date(filter.dateFrom);
    const toMatch   = !filter.dateTo   || d <= new Date(filter.dateTo + 'T23:59:59');
    return actMatch && fromMatch && toMatch;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(ev) {
    setForm({
      name:        ev.name || '',
      date:        ev.date ? ev.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes:       ev.notes || '',
      activities:  (ev.activities || []).map((a) => a._id || a),
      inputs:      ev.inputs      || [],
      taskProgress:ev.taskProgress|| [],
      outcomes:    ev.outcomes    || [],
      resources:   (ev.resources  || []).map((r) => r._id || r),
      people:      (ev.people     || []).map((p) => p._id || p),
      financials:  ev.financials  || [],
    });
    setEditTarget(ev);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        inputs:   form.inputs.filter((i) => i.name),
        outcomes: form.outcomes.filter((o) => o.name),
      };
      if (editTarget) {
        await updateEvent(editTarget._id, payload);
      } else {
        await createEvent(payload);
      }
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
  }

  async function openDetail(ev) {
    setDetailEvent(ev);
    setDetailData(null);
    try {
      const res = await eventsAPI.getById(ev._id);
      setDetailData(res.data);
    } catch (_) {}
  }

  // ── multi-select helpers ──────────────────────────────────────────────────
  function toggleId(field, id) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter((x) => x !== id) : [...f[field], id],
    }));
  }

  // ── dynamic list helpers ──────────────────────────────────────────────────
  function addRow(field, blank) {
    setForm((f) => ({ ...f, [field]: [...f[field], { ...blank }] }));
  }
  function updateRow(field, idx, key, val) {
    setForm((f) => ({
      ...f,
      [field]: f[field].map((r, i) => i === idx ? { ...r, [key]: val } : r),
    }));
  }
  function removeRow(field, idx) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
        <button onClick={openCreate} className="btn-primary">+ Log Event</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <select className="input flex-1 min-w-36"
          value={filter.activity}
          onChange={(e) => setFilter({ ...filter, activity: e.target.value })}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <input type="date" className="input flex-1 min-w-36"
          value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
        <input type="date" className="input flex-1 min-w-36"
          value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
        <button onClick={() => setFilter({ activity:'', dateFrom:'', dateTo:'' })}
          className="btn-secondary text-xs">Clear</button>
      </div>

      {loading && !events.length ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name / Notes</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Activities</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">No events found.</td></tr>
              )}
              {[...filtered].reverse().map((ev) => (
                <tr key={ev._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(ev.date || ev.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(ev)}
                      className="font-medium text-indigo-600 hover:underline text-left">
                      {ev.name || ev.notes || '(no title)'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(ev.activities || []).slice(0, 3).map((a, i) => (
                        <span key={i} className="badge badge-indigo">{a.name || a}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(ev)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 mr-1">Edit</button>
                    <button onClick={() => handleDelete(ev._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editTarget ? 'Edit Event' : 'Log Event'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorMessage message={formErr} />

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name / Title">
                <input className="input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Date">
                <input type="date" className="input" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="input" rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>

            {/* Activities multi-select */}
            <Field label="Activities">
              <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                {activities.length === 0 && <span className="text-xs text-gray-400">No activities yet</span>}
                {activities.map((a) => (
                  <label key={a._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.activities.includes(a._id)}
                      onChange={() => toggleId('activities', a._id)} />
                    {a.name}
                  </label>
                ))}
              </div>
            </Field>

            {/* Inputs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Inputs</label>
                <button type="button" className="text-xs text-indigo-600 hover:underline"
                  onClick={() => addRow('inputs', { name: '', type: 'numeric', value: '' })}>+ Add</button>
              </div>
              {form.inputs.map((inp, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="Name"
                    value={inp.name} onChange={(e) => updateRow('inputs', i, 'name', e.target.value)} />
                  <select className="input w-28" value={inp.type}
                    onChange={(e) => updateRow('inputs', i, 'type', e.target.value)}>
                    <option value="numeric">Numeric</option>
                    <option value="text">Text</option>
                    <option value="boolean">Boolean</option>
                    <option value="duration">Duration</option>
                  </select>
                  <input className="input w-24" placeholder="Value"
                    value={inp.value} onChange={(e) => updateRow('inputs', i, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeRow('inputs', i)}
                    className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              ))}
            </div>

            {/* Task Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Task Progress</label>
                <button type="button" className="text-xs text-indigo-600 hover:underline"
                  onClick={() => addRow('taskProgress', { taskId: '', value: '' })}>+ Add</button>
              </div>
              {form.taskProgress.map((tp, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select className="input flex-1" value={tp.taskId}
                    onChange={(e) => updateRow('taskProgress', i, 'taskId', e.target.value)}>
                    <option value="">Select task…</option>
                    {tasks.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <input className="input w-28" placeholder="Value / %" type="number" min="0" max="100"
                    value={tp.value} onChange={(e) => updateRow('taskProgress', i, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeRow('taskProgress', i)}
                    className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Outcomes</label>
                <button type="button" className="text-xs text-indigo-600 hover:underline"
                  onClick={() => addRow('outcomes', { name: '', value: '', frequency: 'once' })}>+ Add</button>
              </div>
              {form.outcomes.map((oc, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="Name"
                    value={oc.name} onChange={(e) => updateRow('outcomes', i, 'name', e.target.value)} />
                  <input className="input w-24" placeholder="Value"
                    value={oc.value} onChange={(e) => updateRow('outcomes', i, 'value', e.target.value)} />
                  <select className="input w-28" value={oc.frequency}
                    onChange={(e) => updateRow('outcomes', i, 'frequency', e.target.value)}>
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <button type="button" onClick={() => removeRow('outcomes', i)}
                    className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              ))}
            </div>

            {/* Resources */}
            <Field label="Resources">
              <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                {resources.length === 0 && <span className="text-xs text-gray-400">No resources yet</span>}
                {resources.map((r) => (
                  <label key={r._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.resources.includes(r._id)}
                      onChange={() => toggleId('resources', r._id)} />
                    {r.name}
                  </label>
                ))}
              </div>
            </Field>

            {/* People */}
            <Field label="People">
              <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                {people.length === 0 && <span className="text-xs text-gray-400">No people yet</span>}
                {people.map((p) => (
                  <label key={p._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.people.includes(p._id)}
                      onChange={() => toggleId('people', p._id)} />
                    {p.name}
                  </label>
                ))}
              </div>
            </Field>

            {/* Financial Impact */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Financial Impact</label>
                <button type="button" className="text-xs text-indigo-600 hover:underline"
                  onClick={() => addRow('financials', { accountId: '', amount: '', txType: 'spent' })}>+ Add</button>
              </div>
              {form.financials.map((fi, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select className="input flex-1" value={fi.accountId}
                    onChange={(e) => updateRow('financials', i, 'accountId', e.target.value)}>
                    <option value="">Select account…</option>
                    {accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                  <input className="input w-28" type="number" placeholder="Amount"
                    value={fi.amount} onChange={(e) => updateRow('financials', i, 'amount', e.target.value)} />
                  <select className="input w-28" value={fi.txType}
                    onChange={(e) => updateRow('financials', i, 'txType', e.target.value)}>
                    <option value="spent">Spent</option>
                    <option value="earned">Earned</option>
                  </select>
                  <button type="button" onClick={() => removeRow('financials', i)}
                    className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Event</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailEvent && (
        <Modal title={detailEvent.name || detailEvent.notes || 'Event Details'} onClose={() => setDetailEvent(null)}>
          <div className="space-y-3 text-sm">
            <p className="text-gray-500">
              {new Date(detailEvent.date || detailEvent.createdAt).toLocaleDateString()}
            </p>
            {detailEvent.notes && <p className="text-gray-600">{detailEvent.notes}</p>}
            {detailData ? (
              <>
                <Detail label="Activities"
                  items={(detailData.activities || []).map((a) => a.name || a)} badge="indigo" />
                <Detail label="Resources"
                  items={(detailData.resources  || []).map((r) => r.name || r)} badge="yellow" />
                <Detail label="People"
                  items={(detailData.people     || []).map((p) => p.name || p)} badge="pink" />
                {(detailData.inputs || []).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Inputs:</span>
                    <ul className="ml-3 mt-1 space-y-1">
                      {detailData.inputs.map((inp, i) => (
                        <li key={i} className="text-gray-600">{inp.name}: <strong>{inp.value}</strong> ({inp.type})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(detailData.outcomes || []).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Outcomes:</span>
                    <ul className="ml-3 mt-1 space-y-1">
                      {detailData.outcomes.map((oc, i) => (
                        <li key={i} className="text-gray-600">{oc.name}: <strong>{oc.value}</strong></li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <LoadingSpinner message="Loading details…" />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ label, items, badge }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span className="font-medium text-gray-700">{label}: </span>
      {items.map((item, i) => (
        <span key={i} className={`badge badge-${badge} mr-1`}>{item}</span>
      ))}
    </div>
  );
}
