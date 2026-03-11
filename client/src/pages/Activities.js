import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { activitiesAPI } from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';

const EMPTY_FORM = { name: '', types: '', tags: '', description: '' };

export default function Activities() {
  const {
    state: { activities, loading, error },
    fetchActivities, createActivity, updateActivity, deleteActivity, clearError,
  } = useApp();

  const [filter, setFilter]   = useState({ name: '', type: '', tag: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [detail, setDetail]   = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchActivities(); /* eslint-disable-next-line */ }, []);

  const filtered = activities.filter((a) => {
    const nm = filter.name.toLowerCase();
    const tp = filter.type.toLowerCase();
    const tg = filter.tag.toLowerCase();
    return (
      (!nm || a.name?.toLowerCase().includes(nm)) &&
      (!tp || (a.types || []).some((t) => t.toLowerCase().includes(tp))) &&
      (!tg || (a.tags  || []).some((t) => t.toLowerCase().includes(tg)))
    );
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(a) {
    setForm({
      name:        a.name || '',
      types:       (a.types || []).join(', '),
      tags:        (a.tags  || []).join(', '),
      description: a.description || '',
    });
    setEditTarget(a);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    const payload = {
      name:        form.name.trim(),
      types:       form.types.split(',').map((s) => s.trim()).filter(Boolean),
      tags:        form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description.trim(),
    };
    try {
      if (editTarget) {
        await updateActivity(editTarget._id, payload);
      } else {
        await createActivity(payload);
      }
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this activity?')) return;
    await deleteActivity(id);
  }

  async function openDetail(a) {
    setDetail(a);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await activitiesAPI.getDetails(a._id);
      setDetailData(res.data);
    } catch (_) {}
    setDetailLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activities</h1>
        <button onClick={openCreate} className="btn-primary">+ New Activity</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-32" placeholder="Search name…"
          value={filter.name} onChange={(e) => setFilter({ ...filter, name: e.target.value })} />
        <input className="input flex-1 min-w-32" placeholder="Filter by type…"
          value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} />
        <input className="input flex-1 min-w-32" placeholder="Filter by tag…"
          value={filter.tag} onChange={(e) => setFilter({ ...filter, tag: e.target.value })} />
      </div>

      {loading && !activities.length ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">No activities found.</p>
          )}
          {filtered.map((a) => (
            <div key={a._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <button onClick={() => openDetail(a)}
                  className="text-base font-semibold text-indigo-700 hover:underline text-left">
                  {a.name}
                </button>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(a._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                </div>
              </div>
              {a.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{a.description}</p>}
              <div className="flex flex-wrap gap-1">
                {(a.types || []).map((t) => (
                  <span key={t} className="badge badge-indigo">{t}</span>
                ))}
                {(a.tags || []).map((t) => (
                  <span key={t} className="badge badge-gray">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editTarget ? 'Edit Activity' : 'New Activity'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Types (comma separated)">
              <input className="input" placeholder="e.g. exercise, work" value={form.types}
                onChange={(e) => setForm({ ...form, types: e.target.value })} />
            </Field>
            <Field label="Tags (comma separated)">
              <input className="input" placeholder="e.g. health, morning" value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className="input" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          {detailLoading ? <LoadingSpinner /> : (
            <div className="space-y-3 text-sm">
              {detail.description && <p className="text-gray-600">{detail.description}</p>}
              <DetailSection label="Types"  items={detail.types} badge="indigo" />
              <DetailSection label="Tags"   items={detail.tags}  badge="gray"   />
              {detailData && (
                <>
                  <DetailSection label="Linked Tasks"    items={(detailData.tasks    || []).map((t) => t.name)} badge="green" />
                  <DetailSection label="Linked Inputs"   items={(detailData.inputs   || []).map((i) => i.name)} badge="blue"  />
                  <DetailSection label="Linked Outcomes" items={(detailData.outcomes || []).map((o) => o.name)} badge="purple"/>
                  <DetailSection label="Resources"       items={(detailData.resources|| []).map((r) => r.name)} badge="yellow"/>
                  <DetailSection label="People"          items={(detailData.people   || []).map((p) => p.name)} badge="pink"  />
                </>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function DetailSection({ label, items, badge }) {
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

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// Custom utility classes (.input, .btn-*, .badge-*) are injected into <head>
// once by src/index.js via injectGlobalStyles() to avoid CDN Tailwind limitations.
