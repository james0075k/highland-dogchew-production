'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import {
  FiTag, FiRefreshCw, FiSearch, FiPlus, FiX, FiCheckCircle,
  FiSlash, FiClock, FiUsers, FiTrendingUp, FiArrowLeft, FiTrash2, FiEdit2,
} from 'react-icons/fi';

interface PromoCode {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  minOrderAmount: number;
  stripeCouponId: string | null;
  stripePromotionCodeId: string | null;
  redeemedEmails: string[];
  createdAt: string;
}

type FilterKey = 'all' | 'active' | 'inactive' | 'expired';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'expired',  label: 'Expired' },
];

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isExpired = (p: PromoCode) =>
  !!p.expiryDate && new Date(p.expiryDate).getTime() < Date.now();

const isLimitReached = (p: PromoCode) =>
  p.usageLimit !== null && p.usageCount >= p.usageLimit;

const statusOf = (p: PromoCode): { label: string; cls: string } => {
  if (!p.isActive)       return { label: 'Inactive', cls: 'bg-gray-100 text-gray-700' };
  if (isExpired(p))      return { label: 'Expired',  cls: 'bg-orange-100 text-orange-700' };
  if (isLimitReached(p)) return { label: 'Used Up',  cls: 'bg-red-100 text-red-700' };
  return { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' };
};

const discountLabel = (p: PromoCode) =>
  p.discountType === 'percentage'
    ? `${p.discountValue}% off`
    : `£${p.discountValue.toFixed(2)} off`;

export default function PromoCodesPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [promos, setPromos]         = useState<PromoCode[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<FilterKey>('all');
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [creating, setCreating]     = useState(false);
  const [actionMsg, setActionMsg]   = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [editing, setEditing]       = useState<PromoCode | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Form state
  const [form, setForm] = useState({
    code:           '',
    discountType:   'percentage' as 'percentage' | 'flat',
    discountValue:  '',
    minOrderAmount: '',
    usageLimit:     '',
    perUserLimit:   '1',
    expiryDate:     '',
  });

  // Edit form state — `code` is not editable (it's the customer-facing
  // identifier and the Stripe sync key).
  const [editForm, setEditForm] = useState({
    discountType:   'percentage' as 'percentage' | 'flat',
    discountValue:  '',
    minOrderAmount: '',
    usageLimit:     '',
    perUserLimit:   '',
    expiryDate:     '',
    isActive:       true,
  });

  const token = () => Cookies.get('token');

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/promo`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load promo codes');
      setPromos(Array.isArray(data.data) ? data.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return promos.filter((p) => {
      if (q && !p.code.includes(q)) return false;
      switch (filter) {
        case 'active':
          return p.isActive && !isExpired(p) && !isLimitReached(p);
        case 'inactive':
          return !p.isActive;
        case 'expired':
          return isExpired(p);
        default:
          return true;
      }
    });
  }, [promos, filter, search]);

  const stats = useMemo(() => {
    const total       = promos.length;
    const active      = promos.filter((p) => p.isActive && !isExpired(p) && !isLimitReached(p)).length;
    const redemptions = promos.reduce((sum, p) => sum + (p.usageCount || 0), 0);
    const top = promos.reduce<PromoCode | null>(
      (best, p) => (!best || p.usageCount > best.usageCount ? p : best),
      null
    );
    return { total, active, redemptions, top };
  }, [promos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setActionMsg(null);
    try {
      const body: Record<string, unknown> = {
        code:          form.code.trim().toUpperCase(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
      };
      if (form.minOrderAmount) body.minOrderAmount = Number(form.minOrderAmount);
      if (form.usageLimit)     body.usageLimit     = Number(form.usageLimit);
      // Empty perUserLimit input means "unlimited per customer"
      body.perUserLimit = form.perUserLimit ? Number(form.perUserLimit) : null;
      if (form.expiryDate)     body.expiryDate     = new Date(form.expiryDate).toISOString();

      const res = await fetch(`${apiBase}/promo/create`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');

      setActionMsg({ kind: 'ok', text: `Created "${body.code}"` });
      setShowForm(false);
      setForm({
        code: '', discountType: 'percentage', discountValue: '',
        minOrderAmount: '', usageLimit: '', perUserLimit: '1', expiryDate: '',
      });
      fetchPromos();
    } catch (e: unknown) {
      setActionMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Create failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Permanently DELETE "${code}"? This removes it from the database and Stripe — redemption history will be lost. Use Deactivate instead to keep the audit trail.`)) return;
    setActionMsg(null);
    try {
      const res = await fetch(`${apiBase}/promo/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setActionMsg({ kind: 'ok', text: `Deleted "${code}"` });
      fetchPromos();
    } catch (e: unknown) {
      setActionMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Delete failed' });
    }
  };

  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setEditForm({
      discountType:   p.discountType,
      discountValue:  String(p.discountValue),
      minOrderAmount: p.minOrderAmount ? String(p.minOrderAmount) : '',
      usageLimit:     p.usageLimit !== null ? String(p.usageLimit) : '',
      perUserLimit:   p.perUserLimit !== null ? String(p.perUserLimit) : '',
      expiryDate:     p.expiryDate ? p.expiryDate.slice(0, 10) : '',
      isActive:       p.isActive,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setActionMsg(null);
    try {
      const body: Record<string, unknown> = {
        discountType:  editForm.discountType,
        discountValue: Number(editForm.discountValue),
        isActive:      editForm.isActive,
      };
      body.minOrderAmount = editForm.minOrderAmount ? Number(editForm.minOrderAmount) : 0;
      body.usageLimit     = editForm.usageLimit     ? Number(editForm.usageLimit)     : null;
      body.perUserLimit   = editForm.perUserLimit   ? Number(editForm.perUserLimit)   : null;
      body.expiryDate     = editForm.expiryDate     ? new Date(editForm.expiryDate).toISOString() : null;

      const res = await fetch(`${apiBase}/promo/${editing._id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setActionMsg({ kind: 'ok', text: `Updated "${editing.code}"` });
      setEditing(null);
      fetchPromos();
    } catch (e: unknown) {
      setActionMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Update failed' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async (id: string, code: string) => {
    if (!window.confirm(`Deactivate "${code}"? This also disables it in Stripe.`)) return;
    setActionMsg(null);
    try {
      const res = await fetch(`${apiBase}/promo/${id}/deactivate`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deactivate failed');
      setActionMsg({ kind: 'ok', text: `Deactivated "${code}"` });
      fetchPromos();
    } catch (e: unknown) {
      setActionMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Deactivate failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white">
              <FiArrowLeft size={18} />
            </a>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
              <FiTag className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
              <p className="text-sm text-gray-500">Create, monitor and deactivate discount codes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPromos}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:from-amber-600 hover:to-orange-600"
            >
              <FiPlus size={14} /> New Promo Code
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            actionMsg.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {actionMsg.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<FiTag />}          label="Total Codes"        value={stats.total} />
          <StatCard icon={<FiCheckCircle />}  label="Active"             value={stats.active} accent="emerald" />
          <StatCard icon={<FiTrendingUp />}   label="Total Redemptions"  value={stats.redemptions} accent="amber" />
          <StatCard icon={<FiUsers />}        label="Top Code"           value={stats.top ? `${stats.top.code} (${stats.top.usageCount})` : '—'} accent="blue" />
        </div>

        {/* Filter + search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === f.key
                    ? 'bg-amber-100 text-amber-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading promo codes…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No promo codes match this view.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Code</th>
                    <th className="text-left px-4 py-3">Discount</th>
                    <th className="text-left px-4 py-3">Min Order</th>
                    <th className="text-left px-4 py-3">Used</th>
                    <th className="text-left px-4 py-3">Per User</th>
                    <th className="text-left px-4 py-3">Expiry</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Stripe</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => {
                    const st = statusOf(p);
                    return (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-900">{p.code}</td>
                        <td className="px-4 py-3 text-gray-700">{discountLabel(p)}</td>
                        <td className="px-4 py-3 text-gray-500">{p.minOrderAmount ? `£${p.minOrderAmount.toFixed(2)}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.usageCount}
                          {p.usageLimit !== null && <span className="text-gray-400"> / {p.usageLimit}</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.perUserLimit === null ? '∞' : p.perUserLimit}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {p.expiryDate ? <span className="inline-flex items-center gap-1"><FiClock size={12} /> {fmtDate(p.expiryDate)}</span> : '—'}
                        </td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.stripePromotionCodeId ? p.stripePromotionCodeId.slice(0, 10) + '…' : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded-md"
                              title="Edit (re-syncs Stripe coupon if discount changes)"
                            >
                              <FiEdit2 size={12} /> Edit
                            </button>
                            {p.isActive && (
                              <button
                                onClick={() => handleDeactivate(p._id, p.code)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50 rounded-md"
                              >
                                <FiSlash size={12} /> Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(p._id, p.code)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md"
                              title="Permanently delete (removes from Stripe too)"
                            >
                              <FiTrash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Promo Code</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Code <span className="font-mono font-semibold">{editing.code}</span> · changing
                  the discount value/type re-creates the Stripe coupon.
                </p>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount Type" required>
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (£)</option>
                  </select>
                </Field>
                <Field label="Discount Value" required>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    max={editForm.discountType === 'percentage' ? 100 : undefined}
                    required
                    value={editForm.discountValue}
                    onChange={(e) => setEditForm({ ...editForm, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Order Amount (£)">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editForm.minOrderAmount}
                    onChange={(e) => setEditForm({ ...editForm, minOrderAmount: e.target.value })}
                    placeholder="0 (no minimum)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
                <Field label="Expiry Date">
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Total Usage Limit">
                  <input
                    type="number"
                    min={1}
                    value={editForm.usageLimit}
                    onChange={(e) => setEditForm({ ...editForm, usageLimit: e.target.value })}
                    placeholder="blank = unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
                <Field label="Per Customer Limit">
                  <input
                    type="number"
                    min={1}
                    value={editForm.perUserLimit}
                    onChange={(e) => setEditForm({ ...editForm, perUserLimit: e.target.value })}
                    placeholder="blank = unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">New Promo Code</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Field label="Code (3–30 chars)" required>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE10"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount Type" required>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (£)</option>
                  </select>
                </Field>
                <Field label="Discount Value" required>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === 'percentage' ? '10' : '5.00'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Order Amount (£)">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 (no minimum)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
                <Field label="Expiry Date">
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Total Usage Limit">
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="blank = unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
                <Field label="Per Customer Limit">
                  <input
                    type="number"
                    min={1}
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                    placeholder="blank = unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </Field>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Per-customer limit is enforced by email <em>and</em> source IP. Leaving it blank disables the check.
                The code is also created in your Stripe Dashboard for visibility and dual-source validation.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  icon, label, value, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: 'emerald' | 'amber' | 'blue';
}) {
  const accentCls = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber:   'bg-amber-100 text-amber-600',
    blue:    'bg-blue-100 text-blue-600',
  }[accent || 'amber'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentCls}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
