import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { eventsAPI } from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

// Event schema fields: timestamp, activityIds, inputIds, taskProgress (Map),
// outcomeIds, resourceIds, peopleIds, financialImpact {accountId, amount, type}

const EMPTY_FORM = {
  timestamp:       new Date().toISOString().slice(0, 10),
  activityIds:     [],
  inputIds:        [],
  taskProgress:    {},  // { [taskId]: incrementValue }
  outcomeIds:      [],
  resourceIds:     [],
  peopleIds:       [],
  financialImpact: { accountId: '', amount: '', type: 'spent' },
};

export default function Events() {
  const {
    state: { events, activities, tasks, inputs, outcomes, resources, people, accounts, loading, error },
    fetchEvents, fetchActivities, fetchTasks, fetchInputs, fetchOutcomes,
    fetchResources, fetchPeople, fetchAccounts,
    createEvent, updateEvent, deleteEvent, clearError,
  } = useApp();

  const [filter, setFilter]     = useState({ activityId: '', dateFrom: '', dateTo: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErr, setFormErr]   = useState('');
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailData,  setDetailData]  = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchActivities();
    fetchTasks();
    fetchInputs();
    fetchOutcomes();
    fetchResources();
    fetchPeople();
    fetchAccounts();
    // eslint-disable-next-line
  }, []);

  const filtered = events.filter((ev) => {
    const actMatch = !filter.activityId ||
      (ev.activityIds || []).some((a) => (a._id || a) === filter.activityId);
    const d = new Date(ev.timestamp || ev.createdAt);
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
    // Reconstruct taskProgress as plain object from Map or plain object
    const tp = {};
    if (ev.taskProgress) {
      if (ev.taskProgress instanceof Map) {
        ev.taskProgress.forEach((v, k) => { tp[k] = v; });
      } else {
        Object.assign(tp, ev.taskProgress);
      }
    }
    const fi = ev.financialImpact || {};
    setForm({
      timestamp:       ev.timestamp ? ev.timestamp.slice(0, 10) : new Date().toISOString().slice(0, 10),
      activityIds:     (ev.activityIds  || []).map((a) => a._id || a),
      inputIds:        (ev.inputIds     || []).map((i) => i._id || i),
      taskProgress:    tp,
      outcomeIds:      (ev.outcomeIds   || []).map((o) => o._id || o),
      resourceIds:     (ev.resourceIds  || []).map((r) => r._id || r),
      peopleIds:       (ev.peopleIds    || []).map((p) => p._id || p),
      financialImpact: {
        accountId: fi.accountId?._id || fi.accountId || '',
        amount:    fi.amount ?? '',
        type:      fi.type || 'spent',
      },
    });
    setEditTarget(ev);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Clean up financialImpact — only include if accountId and amount are set
    const fi = form.financialImpact;
    const payload = {
      timestamp:    form.timestamp,
      activityIds:  form.activityIds,
      inputIds:     form.inputIds,
      taskProgress: form.taskProgress,
      outcomeIds:   form.outcomeIds,
      resourceIds:  form.resourceIds,
      peopleIds:    form.peopleIds,
    };
    if (fi.accountId && fi.amount !== '') {
      payload.financialImpact = {
        accountId: fi.accountId,
        amount:    Number(fi.amount),
        type:      fi.type,
      };
    }
    try {
      if (editTarget) await updateEvent(editTarget._id, payload);
      else            await createEvent(payload);
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

  function toggleId(field, id) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter((x) => x !== id) : [...f[field], id],
    }));
  }

  function setTaskProgress(taskId, value) {
    setForm((f) => ({
      ...f,
      taskProgress: { ...f.taskProgress, [taskId]: value === '' ? undefined : Number(value) },
    }));
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
        <select className="input flex-1 min-w-36" value={filter.activityId}
          onChange={(e) => setFilter({ ...filter, activityId: e.target.value })}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <input type="date" className="input flex-1 min-w-36"
          value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
        <input type="date" className="input flex-1 min-w-36"
          value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
        <button onClick={() => setFilter({ activityId: '', dateFrom: '', dateTo: '' })}
          className="btn-secondary text-xs">Clear</button>
      </div>

      {loading && !events.length ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Activities</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Financial</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">No events found.</td></tr>
              )}
              {[...filtered].reverse().map((ev) => {
                const fi = ev.financialImpact;
                return (
                  <tr key={ev._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <button onClick={() => openDetail(ev)}
                        className="font-medium text-indigo-600 hover:underline">
                        {new Date(ev.timestamp || ev.createdAt).toLocaleDateString()}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(ev.activityIds || []).slice(0, 3).map((a, i) => (
                          <span key={i} className="badge badge-indigo">{a.name || '…'}</span>
                        ))}
                        {(ev.activityIds || []).length > 3 && (
                          <span className="badge badge-gray">+{(ev.activityIds).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {fi && fi.amount != null && (
                        <span className={`font-medium ${fi.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                          {fi.type === 'earned' ? '+' : '-'}${fi.amount}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(ev)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 mr-1">Edit</button>
                      <button onClick={() => handleDelete(ev._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editTarget ? 'Edit Event' : 'Log Event'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorMessage message={formErr} />

            <Field label="Date">
              <input type="date" className="input" value={form.timestamp}
                onChange={(e) => setForm({ ...form, timestamp: e.target.value })} />
            </Field>

            {/* Activities */}
            <Field label="Activities">
              <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                {activities.length === 0 && <span className="text-xs text-gray-400">No activities yet</span>}
                {activities.map((a) => (
                  <label key={a._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.activityIds.includes(a._id)}
                      onChange={() => toggleId('activityIds', a._id)} />
                    {a.name}
                  </label>
                ))}
              </div>
            </Field>

            {/* Inputs (select existing) */}
            <Field label="Inputs (select existing)">
              <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                {inputs.length === 0 && <span className="text-xs text-gray-400">No inputs yet — create them on the Inputs page</span>}
                {inputs.map((inp) => (
                  <label key={inp._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.inputIds.includes(inp._id)}
                      onChange={() => toggleId('inputIds', inp._id)} />
                    {inp.name} ({inp.type}) = {inp.value}
                  </label>
                ))}
              </div>
            </Field>

            {/* Task Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Progress (add increment)</label>
              {tasks.length === 0 && <p className="text-xs text-gray-400">No tasks yet</p>}
              {tasks.map((t) => (
                <div key={t._id} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-700 flex-1 truncate">{t.name}</span>
                  <input
                    className="input w-24"
                    type="number"
                    placeholder="add"
                    value={form.taskProgress[t._id] ?? ''}
                    onChange={(e) => setTaskProgress(t._id, e.target.value)}
                  />
                  <span className="text-xs text-gray-400">{t.unit}</span>
                </div>
              ))}
            </div>

            {/* Outcomes (select existing) */}
            <Field label="Outcomes (select existing)">
              <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                {outcomes.length === 0 && <span className="text-xs text-gray-400">No outcomes yet</span>}
                {outcomes.map((oc) => (
                  <label key={oc._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.outcomeIds.includes(oc._id)}
                      onChange={() => toggleId('outcomeIds', oc._id)} />
                    {oc.name}
                  </label>
                ))}
              </div>
            </Field>

            {/* Resources */}
            <Field label="Resources">
              <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                {resources.length === 0 && <span className="text-xs text-gray-400">No resources yet</span>}
                {resources.map((r) => (
                  <label key={r._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.resourceIds.includes(r._id)}
                      onChange={() => toggleId('resourceIds', r._id)} />
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
                    <input type="checkbox" checked={form.peopleIds.includes(p._id)}
                      onChange={() => toggleId('peopleIds', p._id)} />
                    {p.name} {p.role ? `(${p.role})` : ''}
                  </label>
                ))}
              </div>
            </Field>

            {/* Financial Impact (single) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Impact</label>
              <div className="flex gap-2">
                <select className="input flex-1"
                  value={form.financialImpact.accountId}
                  onChange={(e) => setForm({ ...form, financialImpact: { ...form.financialImpact, accountId: e.target.value } })}>
                  <option value="">No account</option>
                  {accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
                <input className="input w-28" type="number" placeholder="Amount"
                  value={form.financialImpact.amount}
                  onChange={(e) => setForm({ ...form, financialImpact: { ...form.financialImpact, amount: e.target.value } })} />
                <select className="input w-28"
                  value={form.financialImpact.type}
                  onChange={(e) => setForm({ ...form, financialImpact: { ...form.financialImpact, type: e.target.value } })}>
                  <option value="spent">Spent</option>
                  <option value="earned">Earned</option>
                </select>
              </div>
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
        <Modal title={`Event — ${new Date(detailEvent.timestamp || detailEvent.createdAt).toLocaleDateString()}`}
          onClose={() => setDetailEvent(null)}>
          <div className="space-y-3 text-sm">
            {detailData ? (
              <>
                <Detail label="Activities"
                  items={(detailData.activityIds || []).map((a) => a.name || a)} badge="indigo" />
                <Detail label="Resources"
                  items={(detailData.resourceIds  || []).map((r) => r.name || r)} badge="yellow" />
                <Detail label="People"
                  items={(detailData.peopleIds    || []).map((p) => p.name || p)} badge="pink" />
                {detailData.financialImpact?.accountId && (
                  <div>
                    <span className="font-medium text-gray-700">Financial: </span>
                    <span className={detailData.financialImpact.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                      {detailData.financialImpact.type === 'earned' ? '+' : '-'}${detailData.financialImpact.amount}
                    </span>
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
