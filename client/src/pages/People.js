import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

const EMPTY_FORM = {
  name:        '',
  role:        '',
  email:       '',
  phone:       '',
  notes:       '',
};

export default function People() {
  const {
    state: { people, events, activities, loading, error },
    fetchPeople, fetchEvents, fetchActivities, createPerson, updatePerson, deletePerson, clearError,
  } = useApp();

  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErr, setFormErr]     = useState('');

  useEffect(() => {
    fetchPeople();
    fetchEvents();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  // Count event appearances per person
  const eventCount = {};
  events.forEach((ev) => {
    (ev.people || []).forEach((p) => {
      const id = p._id || p;
      eventCount[id] = (eventCount[id] || 0) + 1;
    });
  });

  const filtered = people.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
               p.role?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(p) {
    setForm({
      name:  p.name  || '',
      role:  p.role  || '',
      email: p.email || '',
      phone: p.phone || '',
      notes: p.notes || '',
    });
    setEditTarget(p);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    try {
      if (editTarget) await updatePerson(editTarget._id, form);
      else            await createPerson(form);
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this person?')) return;
    await deletePerson(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">People</h1>
        <button onClick={openCreate} className="btn-primary">+ New Person</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <input className="input max-w-sm" placeholder="Search by name or role…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && !people.length ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">No people found.</p>
          )}
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  {p.role && <span className="badge badge-pink">{p.role}</span>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                </div>
              </div>
              {p.email && <p className="text-xs text-gray-500">{p.email}</p>}
              {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
              {p.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.notes}</p>}
              <div className="mt-2 text-xs text-gray-400">
                Appeared in {eventCount[p._id] || 0} event(s)
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Person' : 'New Person'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Role">
              <input className="input" placeholder="e.g. coach, colleague, friend" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input className="input" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className="input" type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="input" rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
