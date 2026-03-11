import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage   from '../components/common/ErrorMessage';
import { Modal, Field } from './Activities';

// FinancialAccount schema: name, type (Bank|Wallet|Investment), balance, events[]
const ACCOUNT_TYPES = ['Bank', 'Wallet', 'Investment'];

const EMPTY_FORM = { name: '', type: 'Bank', balance: '' };

export default function FinancialAccounts() {
  const {
    state: { accounts, loading, error },
    fetchAccounts, createAccount, updateAccount, deleteAccount, clearError,
  } = useApp();

  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState('');

  useEffect(() => { fetchAccounts(); /* eslint-disable-next-line */ }, []);

  const filtered = accounts.filter((a) => !filterType || a.type === filterType);
  const totalBalance = filtered.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormErr('');
    setShowModal(true);
  }

  function openEdit(a) {
    setForm({ name: a.name || '', type: a.type || 'Bank', balance: a.balance ?? '' });
    setEditTarget(a);
    setFormErr('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormErr('Name is required'); return; }
    const payload = {
      name:    form.name.trim(),
      type:    form.type,
      balance: form.balance !== '' ? Number(form.balance) : 0,
    };
    try {
      if (editTarget) await updateAccount(editTarget._id, payload);
      else            await createAccount(payload);
      setShowModal(false);
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this account?')) return;
    await deleteAccount(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Accounts</h1>
        <button onClick={openCreate} className="btn-primary">+ New Account</button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          <select className="input w-40" value={filterType}
            onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All types</option>
            {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {filterType && (
            <button onClick={() => setFilterType('')} className="btn-secondary text-xs">Clear</button>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Net Balance: </span>
          <span className={`text-lg font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalBalance >= 0 ? '+' : ''}{totalBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {loading && !accounts.length ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">No accounts found.</p>
          )}
          {filtered.map((a) => {
            const bal = Number(a.balance) || 0;
            return (
              <div key={a._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">{a.name}</div>
                    <span className="badge badge-blue">{a.type}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
                    <button onClick={() => handleDelete(a._id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${bal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bal >= 0 ? '+' : ''}{bal.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{(a.events || []).length} linked event(s)</div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Account' : 'New Account'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={formErr} />
            <Field label="Name *">
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Type">
              <select className="input" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Balance">
              <input className="input" type="number" step="0.01" value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })} />
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
