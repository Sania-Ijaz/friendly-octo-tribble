import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { tasksAPI } from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

const EMPTY_FORM = {
  name:         '',
  description:  '',
  activity:     '',
  targetValue:  '',
  currentValue: '',
  unit:         '',
};

export default function Tasks() {
  const {
    state: { tasks, activities, loading, error },
    fetchTasks, fetchActivities, createTask, updateTask, deleteTask, clearError,
  } = useApp();

  const [filterActivity, setFilterActivity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [progressModal, setProgressModal] = useState(null);
  const [progressVal, setProgressVal] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const filtered = tasks.filter((t) => {
    if (!filterActivity) return true;
    const aId = t.activity?._id || t.activity;
    return aId === filterActivity;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(t) {
    setForm({
      name:         t.name || '',
      description:  t.description || '',
      activity:     t.activity?._id || t.activity || '',
      targetValue:  t.targetValue ?? '',
      currentValue: t.currentValue ?? '',
      unit:         t.unit || '',
    });
    setEditTarget(t);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    const payload = {
      ...form,
      targetValue:  form.targetValue  !== '' ? Number(form.targetValue)  : undefined,
      currentValue: form.currentValue !== '' ? Number(form.currentValue) : undefined,
    };
    try {
      if (editTarget) await updateTask(editTarget._id, payload);
      else            await createTask(payload);
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
  }

  async function handleUpdateProgress(e) {
    e.preventDefault();
    try {
      await tasksAPI.updateProgress(progressModal._id, { currentValue: Number(progressVal) });
      // Refresh tasks
      await fetchTasks();
      setProgressModal(null);
    } catch (err) {
      console.error(err);
    }
  }

  function progressPct(t) {
    if (!t.targetValue || t.targetValue === 0) return 0;
    return Math.min(100, Math.round((t.currentValue || 0) / t.targetValue * 100));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        <button onClick={openCreate} className="btn-primary">+ New Task</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3">
        <select className="input flex-1 max-w-xs" value={filterActivity}
          onChange={(e) => setFilterActivity(e.target.value)}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        {filterActivity && (
          <button onClick={() => setFilterActivity('')} className="btn-secondary text-xs">Clear</button>
        )}
      </div>

      {loading && !tasks.length ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">No tasks found.</p>
          )}
          {filtered.map((t) => {
            const pct = progressPct(t);
            return (
              <div key={t._id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 truncate">{t.name}</span>
                    {t.activity?.name && (
                      <span className="badge badge-indigo shrink-0">{t.activity.name}</span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 100 ? '#22c55e' : '#6366f1',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {t.currentValue ?? 0} / {t.targetValue ?? '?'} {t.unit || ''} ({pct}%)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setProgressModal(t); setProgressVal(String(t.currentValue || 0)); }}
                    className="text-xs px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700">Progress</button>
                  <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editTarget ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className="input" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Activity">
              <select className="input" value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}>
                <option value="">None</option>
                {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Target Value">
                <input className="input" type="number" value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: e.target.value })} />
              </Field>
              <Field label="Current Value">
                <input className="input" type="number" value={form.currentValue}
                  onChange={(e) => setForm({ ...form, currentValue: e.target.value })} />
              </Field>
              <Field label="Unit">
                <input className="input" placeholder="km, hrs…" value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Progress Modal */}
      {progressModal && (
        <Modal title={`Update Progress: ${progressModal.name}`} onClose={() => setProgressModal(null)}>
          <form onSubmit={handleUpdateProgress} className="space-y-4">
            <Field label={`Current Value (target: ${progressModal.targetValue ?? '?'} ${progressModal.unit || ''})`}>
              <input className="input" type="number" value={progressVal}
                onChange={(e) => setProgressVal(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setProgressModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
