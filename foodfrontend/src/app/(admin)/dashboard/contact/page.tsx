'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  FiMail, FiEye, FiTrash2, FiRefreshCw, FiSearch,
  FiInbox, FiCheckCircle, FiMessageCircle, FiX,
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

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
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
    } catch (err: any) {
      setError(err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchContacts();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selected?._id === id) setSelected(null);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const openMessage = (contact: Contact) => {
    setSelected(contact);
    if (contact.status === 'new') updateStatus(contact._id, 'read');
  };

  const filtered = contacts.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
  };

  const statusStyle: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-amber-100 text-amber-700',
    replied: 'bg-emerald-100 text-emerald-700',
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c1e35] via-[#132f4f] to-[#0e2640] px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FiMail className="text-rose-400" />
              Contact Messages
            </h1>
            <p className="text-blue-200/60 mt-1">Manage all contact form submissions</p>
          </div>
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total', value: counts.total, icon: FiInbox, color: 'from-blue-500 to-blue-700', iconBg: 'bg-blue-400/30' },
            { label: 'New', value: counts.new, icon: FiMail, color: 'from-cyan-500 to-cyan-700', iconBg: 'bg-cyan-400/30' },
            { label: 'Read', value: counts.read, icon: FiEye, color: 'from-amber-500 to-amber-700', iconBg: 'bg-amber-400/30' },
            { label: 'Replied', value: counts.replied, icon: FiCheckCircle, color: 'from-emerald-500 to-emerald-700', iconBg: 'bg-emerald-400/30' },
          ].map(s => (
            <div key={s.label} className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-4 overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-medium">{s.label}</p>
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.iconBg}`}>
                  <s.icon className="text-white" size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'new', 'read', 'replied'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                  ${filterStatus === tab
                    ? 'bg-[#0c1e35] text-white border-[#0c1e35]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none text-sm"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchContacts} className="px-6 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition">Retry</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-400">No messages found</td>
                    </tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openMessage(c)}>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{c.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[c.status]}`}>{c.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => openMessage(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <FiEye size={16} />
                            </button>
                            <select
                              value={c.status}
                              onChange={e => updateStatus(c._id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none"
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                            </select>
                            <button onClick={() => deleteContact(c._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in Message Preview */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#0c1e35] to-[#132f4f]">
              <div>
                <h2 className="text-lg font-bold text-white">Message Details</h2>
                <span className={`mt-1 inline-flex text-xs font-bold px-2.5 py-0.5 rounded-full ${statusStyle[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline">{selected.email}</a>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</label>
                <p className="mt-1 text-gray-900 font-medium">{selected.subject}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
              </div>

              <div className="flex gap-4 text-xs text-gray-400">
                <span>Received: {formatDate(selected.createdAt)}</span>
                {selected.repliedAt && <span>Replied: {formatDate(selected.repliedAt)}</span>}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                onClick={() => { updateStatus(selected._id, 'replied'); setSelected(null); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c1e35] text-white rounded-xl hover:bg-[#0f2744] transition text-sm font-semibold"
              >
                <FiMessageCircle size={16} />
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
          <style jsx>{`
            @keyframes slide-in-right {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slide-in-right 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  );
}
