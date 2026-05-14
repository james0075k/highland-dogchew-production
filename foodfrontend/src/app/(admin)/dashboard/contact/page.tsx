'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  FiMail, FiEye, FiTrash2, FiRefreshCw, FiSearch,
  FiInbox, FiCheckCircle, FiMessageCircle, FiX,
  FiArrowLeft, FiFilter, FiAlertCircle,
} from 'react-icons/fi';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  repliedAt?: string;
}

type StatusKey = 'all' | 'new' | 'read' | 'replied';
const STATUSES: StatusKey[] = ['all', 'new', 'read', 'replied'];

const STATUS_META: Record<Exclude<StatusKey, 'all'>, { label: string; chip: string; ring: string; tint: string }> = {
  new:     { label: 'New',     chip: 'bg-blue-100 text-blue-700',         ring: 'ring-blue-200',     tint: 'from-blue-50 to-white' },
  read:    { label: 'Read',    chip: 'bg-amber-100 text-amber-700',       ring: 'ring-amber-200',    tint: 'from-amber-50 to-white' },
  replied: { label: 'Replied', chip: 'bg-emerald-100 text-emerald-700',   ring: 'ring-emerald-200',  tint: 'from-emerald-50 to-white' },
};
const SECTION_ORDER: Array<Exclude<StatusKey, 'all'>> = ['new', 'read', 'replied'];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function initials(s: string): string {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      const res = await fetch(`${API}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.data?.items || data.data || [];
        setContacts(Array.isArray(list) ? list : []);
      } else {
        throw new Error(data.message || 'Failed to load contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status: status as Contact['status'] } : c));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/contact/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selected?._id === deleteTarget._id) setSelected(null);
      setContacts(prev => prev.filter(c => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const openMessage = (contact: Contact) => {
    setSelected(contact);
    if (contact.status === 'new') updateStatus(contact._id, 'read');
  };

  const filtered = useMemo(() => contacts.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [contacts, filterStatus, searchTerm]);

  const grouped = useMemo(() => {
    const map = new Map<Exclude<StatusKey, 'all'>, Contact[]>();
    for (const c of filtered) {
      if (!map.has(c.status)) map.set(c.status, []);
      map.get(c.status)!.push(c);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return SECTION_ORDER.filter(k => map.has(k)).map(k => [k, map.get(k)!] as const);
  }, [filtered]);

  const counts = useMemo(() => ({
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
  }), [contacts]);

  const STAT_CARDS = [
    { label: 'Total',   value: counts.total,   icon: FiInbox,       text: 'text-slate-700',   bg: 'bg-slate-50',   ring: 'ring-slate-100' },
    { label: 'New',     value: counts.new,     icon: FiMail,        text: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-100' },
    { label: 'Read',    value: counts.read,    icon: FiEye,         text: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
    { label: 'Replied', value: counts.replied, icon: FiCheckCircle, text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  ];

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiMail className="text-amber-500" size={18} />
              Contact Messages
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              All contact-form submissions — grouped by status
            </p>
          </div>
        </div>
        <button
          onClick={fetchContacts}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ring-1 ${card.ring}`}>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon size={15} className={card.text} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold tabular-nums ${card.text}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {STATUSES.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${filterStatus === tab ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search name, email, subject…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading messages…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchContacts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiInbox size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No messages found</p>
          {(filterStatus !== 'all' || searchTerm) && (
            <button
              onClick={() => { setFilterStatus('all'); setSearchTerm(''); }}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([key, items]) => {
            const meta = STATUS_META[key];
            return (
              <section key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <header className={`flex items-center justify-between px-5 py-3 bg-gradient-to-r ${meta.tint} border-b border-gray-100`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.chip}`}>{meta.label}</span>
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'message' : 'messages'}
                    </span>
                  </div>
                </header>

                <ul className="divide-y divide-gray-50">
                  {items.map(c => (
                    <li
                      key={c._id}
                      onClick={() => openMessage(c)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-[1.5]">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ${meta.chip} ${meta.ring}`}>
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{c.email}</p>
                        </div>
                      </div>

                      <div className="hidden md:block min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate">{c.subject || '—'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{c.message?.slice(0, 80)}{c.message && c.message.length > 80 ? '…' : ''}</p>
                      </div>

                      <div className="hidden lg:flex flex-col items-end w-24 flex-shrink-0">
                        <p className="text-xs text-gray-600 tabular-nums">{fmtDate(c.createdAt)}</p>
                        <p className="text-[11px] text-gray-400 tabular-nums">{fmtTime(c.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openMessage(c)}
                          title="View"
                          className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <FiEye size={13} />
                        </button>
                        <select
                          value={c.status}
                          onChange={e => updateStatus(c._id, e.target.value)}
                          className="text-[11px] px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none bg-white"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Delete"
                          className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Slide-in Detail */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900">Message Details</h2>
                <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_META[selected.status].chip}`}>
                  {STATUS_META[selected.status].label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold ring-1 ${STATUS_META[selected.status].chip} ${STATUS_META[selected.status].ring}`}>
                    {initials(selected.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline truncate block">{selected.email}</a>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Subject</label>
                <p className="mt-1 text-gray-900 font-medium">{selected.subject || '—'}</p>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selected.message}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <span>Received: {fmtDate(selected.createdAt)} · {fmtTime(selected.createdAt)}</span>
                {selected.repliedAt && <span>Replied: {fmtDate(selected.repliedAt)}</span>}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                onClick={() => { updateStatus(selected._id, 'replied'); setSelected(null); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c1e35] text-white rounded-xl hover:bg-[#0f2744] transition text-sm font-semibold"
              >
                <FiMessageCircle size={15} />
                Reply via Email
              </a>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete message?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently delete the message from <span className="font-semibold">{deleteTarget.name}</span> ({deleteTarget.email})?
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
