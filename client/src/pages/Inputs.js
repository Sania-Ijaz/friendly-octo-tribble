import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

// Input schema: name, type (enum), value (Number), activityId, eventId
const INPUT_TYPES = ['time', 'money', 'effort', 'materials', 'data', 'custom'];

const TYPE_BADGE = {
  time:      'badge-blue',
  money:     'badge-green',
  effort:    'badge-yellow',
  materials: 'badge-purple',
  data:      'badge-indigo',
  custom:    'badge-gray',
};

const EMPTY_FORM = {
  name:       '',
  type:       'custom',
  value:      '',
  activityId: '',
};

export default function Inputs() {
  const {
    state: { inputs, activities, loading, error },
    fetchInputs, fetchActivities, createInput, updateInput, deleteInput, clearError,
  } = useApp();

  const [filterType, setFilterType]         = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [editTarget, setEditTarget]         = useState(null);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [formErr, setFormErr]               = useState('');

  useEffect(() => {
    fetchInputs();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const filtered = inputs.filter((inp) => {
    const tMatch = !filterType     || inp.type === filterType;
    const aMatch = !filterActivity || (inp.activityId?._id || inp.activityId) === filterActivity;
    return tMatch && aMatch;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(inp) {
    setForm({
      name:       inp.name || '',
      type:       inp.type || 'custom',
      value:      inp.value ?? '',
      activityId: inp.activityId?._id || inp.activityId || '',
    });
    setEditTarget(inp);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    if (form.value === '') { setFormErr('Value is required'); return; }
    const payload = {
      name:       form.name.trim(),
      type:       form.type,
      value:      Number(form.value),
      activityId: form.activityId || undefined,
    };
    try {
      if (editTarget) await updateInput(editTarget._id, payload);
      else            await createInput(payload);
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this input?')) return;
    await deleteInput(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inputs</h1>
        <button onClick={openCreate} className="btn-primary">+ New Input</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <select className="input flex-1 min-w-32" value={filterType}
          onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All types</option>
          {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input flex-1 min-w-36" value={filterActivity}
          onChange={(e) => setFilterActivity(e.target.value)}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        {(filterType || filterActivity) && (
          <button onClick={() => { setFilterType(''); setFilterActivity(''); }} className="btn-secondary text-xs">Clear</button>
        )}
      </div>

      {loading && !inputs.length ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Value</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Activity</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No inputs found.</td></tr>
              )}
              {filtered.map((inp) => (
                <tr key={inp._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{inp.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${TYPE_BADGE[inp.type] || 'badge-gray'}`}>{inp.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inp.value}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {inp.activityId?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(inp)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 mr-1">Edit</button>
                    <button onClick={() => handleDelete(inp._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Input' : 'New Input'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className="input" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Value *">
                <input className="input" type="number" value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </Field>
            </div>
            <Field label="Activity">
              <select className="input" value={form.activityId}
                onChange={(e) => setForm({ ...form, activityId: e.target.value })}>
                <option value="">None</option>
                {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
