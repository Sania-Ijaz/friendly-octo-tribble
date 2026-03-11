import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

const EMPTY_FORM = {
  name:        '',
  description: '',
  type:        '',
  cost:        '',
  url:         '',
};

export default function Resources() {
  const {
    state: { resources, events, loading, error },
    fetchResources, fetchEvents, createResource, updateResource, deleteResource, clearError,
  } = useApp();

  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    fetchResources();
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  // Count how many events reference each resource
  const usageMap = {};
  events.forEach((ev) => {
    (ev.resources || []).forEach((r) => {
      const id = r._id || r;
      usageMap[id] = (usageMap[id] || 0) + 1;
    });
  });

  const filtered = resources.filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(r) {
    setForm({
      name:        r.name || '',
      description: r.description || '',
      type:        r.type || '',
      cost:        r.cost ?? '',
      url:         r.url || '',
    });
    setEditTarget(r);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    const payload = { ...form, cost: form.cost !== '' ? Number(form.cost) : undefined };
    try {
      if (editTarget) await updateResource(editTarget._id, payload);
      else            await createResource(payload);
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this resource?')) return;
    await deleteResource(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
        <button onClick={openCreate} className="btn-primary">+ New Resource</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <input className="input max-w-sm" placeholder="Search resources…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && !resources.length ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">No resources found.</p>
          )}
          {filtered.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{r.name}</div>
                  {r.type && <span className="badge badge-yellow text-xs">{r.type}</span>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(r._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                </div>
              </div>
              {r.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-400">
                {r.cost != null && <span>Cost: ${r.cost}</span>}
                <span className="ml-auto">Used in {usageMap[r._id] || 0} event(s)</span>
              </div>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline mt-1 block truncate">
                  {r.url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Resource' : 'New Resource'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Type">
              <input className="input" placeholder="e.g. tool, book, service" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className="input" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost ($)">
                <input className="input" type="number" min="0" value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </Field>
              <Field label="URL">
                <input className="input" type="url" placeholder="https://…" value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </Field>
            </div>
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
