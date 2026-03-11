import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { tasksAPI } from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

const EMPTY_FORM = {
  name:                '',
  activityId:          '',
  quantitativeProgress:0,
  unit:                'units',
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
  const [progressDelta, setProgressDelta] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const filtered = tasks.filter((t) => {
    if (!filterActivity) return true;
    return (t.activityId?._id || t.activityId) === filterActivity;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(t) {
    setForm({
      name:                t.name || '',
      activityId:          t.activityId?._id || t.activityId || '',
      quantitativeProgress:t.quantitativeProgress ?? 0,
      unit:                t.unit || 'units',
    });
    setEditTarget(t);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    const payload = {
      name:                form.name.trim(),
      activityId:          form.activityId || undefined,
      quantitativeProgress:Number(form.quantitativeProgress) || 0,
      unit:                form.unit,
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
    const delta = Number(progressDelta);
    if (isNaN(delta)) return;
    try {
      await tasksAPI.updateProgress(progressModal._id, { progress: delta });
      await fetchTasks();
      setProgressModal(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        <button onClick={openCreate} className="btn-primary">+ New Task</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

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
            const progress = t.quantitativeProgress || 0;
            return (
              <div key={t._id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 truncate">{t.name}</span>
                    {t.activityId?.name && (
                      <span className="badge badge-indigo shrink-0">{t.activityId.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {progress} {t.unit || 'units'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setProgressModal(t); setProgressDelta(''); }}
                    className="text-xs px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                  >
                    +Progress
                  </button>
                  <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Activity">
              <select className="input" value={form.activityId}
                onChange={(e) => setForm({ ...form, activityId: e.target.value })}>
                <option value="">None</option>
                {activities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current Progress">
                <input className="input" type="number" min="0" value={form.quantitativeProgress}
                  onChange={(e) => setForm({ ...form, quantitativeProgress: e.target.value })} />
              </Field>
              <Field label="Unit">
                <input className="input" placeholder="units, km, hrs…" value={form.unit}
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

      {progressModal && (
        <Modal title={`Log Progress: ${progressModal.name}`} onClose={() => setProgressModal(null)}>
          <form onSubmit={handleUpdateProgress} className="space-y-4">
            <p className="text-sm text-gray-500">
              Current: <strong>{progressModal.quantitativeProgress || 0} {progressModal.unit}</strong>.
              Enter the amount to <em>add</em>.
            </p>
            <Field label={`Add to progress (${progressModal.unit || 'units'})`}>
              <input className="input" type="number" value={progressDelta}
                onChange={(e) => setProgressDelta(e.target.value)} placeholder="e.g. 5" />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setProgressModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
