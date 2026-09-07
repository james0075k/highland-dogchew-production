'use client';

/**
 * The "Requests" tab: pick delivered orders, send each customer a review request.
 *
 * Lives in its own file because it has nothing to do with moderating reviews —
 * it works off orders, not reviews — and folding it into the page component
 * would have doubled that file for no shared state.
 *
 * Sending email to customers can't be undone, so the flow is deliberately
 * unhurried: filter, see exactly who is selected, test it on yourself, then
 * confirm against a recipient count.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiSend, FiRefreshCw, FiCheckCircle, FiSlash, FiMail,
  FiAlertCircle, FiClock, FiUsers, FiInbox,
} from 'react-icons/fi';
import { authHeader, jsonAuthHeader } from '@/lib/auth';

interface Candidate {
  _id: string;
  orderNumber: string;
  name: string;
  fullName: string;
  email: string;
  address: string;
  products: string[];
  orderStatus: string;
  deliveredAt: string | null;
  createdAt: string;
  alreadySentAt: string | null;
  sentCount: number;
  optedOut: boolean;
}

interface SendResult {
  sent: number;
  failed: number;
  skipped: { orderNumber: string; reason: string }[];
  failures: { to: string; error?: string }[];
}

const ORDER_STATUSES = ['delivered', 'shipped', 'processing', 'confirmed'] as const;
const PRODUCT_TYPES = [
  { value: '', label: 'All products' },
  { value: 'yak-milk', label: 'Yak Milk Chews' },
  { value: 'puff-treat', label: 'Puff Treats' },
  { value: 'highland-mix', label: 'Highland Mix' },
];

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function ReviewRequestsPanel() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderStatus, setOrderStatus] = useState<string>('delivered');
  const [productType, setProductType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ orderStatus, limit: '200' });
      if (productType) params.set('productType', productType);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`${API}/admin/marketing/review-candidates?${params}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load orders');

      setCandidates(data.data.candidates || []);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [API, orderStatus, productType, dateFrom, dateTo]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  // An order with no email, an opt-out, or a request already sent can't be
  // picked — showing it greyed out explains the absence better than hiding it.
  const sendable = useMemo(
    () => candidates.filter(c => !c.optedOut && !c.alreadySentAt && c.email),
    [candidates]
  );

  const allSelected = sendable.length > 0 && selected.size === sendable.length;

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(sendable.map(c => c._id)));

  const send = async (asTest = false) => {
    // A test needs one order to build a realistic email from, but the admin
    // shouldn't have to tick a customer just to preview their own template —
    // fall back to the first order on the list.
    const orderIds = asTest
      ? [[...selected][0] ?? sendable[0]?._id ?? candidates[0]?._id].filter(Boolean)
      : [...selected];

    if (orderIds.length === 0) return;

    if (asTest) setTesting(true);
    else setSending(true);
    setTestMsg(null);

    try {
      const res = await fetch(`${API}/admin/marketing/review-requests/send`, {
        method: 'POST',
        headers: jsonAuthHeader(),
        body: JSON.stringify(asTest ? { orderIds, testTo, resend: true } : { orderIds }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Send failed');

      if (asTest) {
        // data.success only means the request was handled — check what the mail
        // server actually accepted before telling the admin it went out.
        if (!data.data?.sent) {
          const why = data.data?.failures?.[0]?.error
            || data.data?.skipped?.[0]?.reason
            || 'the mail server rejected it';
          throw new Error(`Test NOT sent: ${why}`);
        }
        setTestMsg(`Test sent to ${testTo}. If it isn't in the inbox, check Spam and Promotions.`);
      } else {
        setResult(data.data);
        setConfirming(false);
        await fetchCandidates();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Send failed';
      if (asTest) setTestMsg(msg);
      else setError(msg);
    } finally {
      if (asTest) setTesting(false);
      else setSending(false);
    }
  };

  const stats = useMemo(() => ({
    total: candidates.length,
    sendable: sendable.length,
    contacted: candidates.filter(c => c.alreadySentAt).length,
    optedOut: candidates.filter(c => c.optedOut).length,
  }), [candidates, sendable]);

  return (
    <div className="space-y-4">

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Order status</label>
            <select
              value={orderStatus}
              onChange={e => setOrderStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Product line</label>
            <select
              value={productType}
              onChange={e => setProductType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              {PRODUCT_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Ordered from</label>
            <input
              type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">to</label>
            <input
              type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <button
            onClick={fetchCandidates}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors ml-auto"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
          <span className="flex items-center gap-1.5 text-gray-500"><FiUsers size={12} /> {stats.total} orders</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><FiMail size={12} /> {stats.sendable} can be emailed</span>
          <span className="flex items-center gap-1.5 text-gray-400"><FiCheckCircle size={12} /> {stats.contacted} already asked</span>
          <span className="flex items-center gap-1.5 text-gray-400"><FiSlash size={12} /> {stats.optedOut} unsubscribed</span>
        </div>
      </div>

      {/* ── Result banner ───────────────────────────────────────── */}
      {result && (
        <div className="bg-white rounded-2xl border border-emerald-200 ring-1 ring-emerald-100 p-4">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                Sent {result.sent} review request{result.sent === 1 ? '' : 's'}
                {result.failed > 0 && <span className="text-red-600"> · {result.failed} failed</span>}
              </p>
              {result.skipped?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Skipped {result.skipped.length}: {[...new Set(result.skipped.map(s => s.reason))].join(', ')}
                </p>
              )}
              {result.failures?.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                  {result.failures.map(f => <li key={f.to}>{f.to} — {f.error}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => setResult(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-xs font-semibold">Dismiss</button>
          </div>
        </div>
      )}

      {/* ── Action bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">
          <span className="font-bold text-gray-900 tabular-nums">{selected.size}</span> selected
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="email"
            placeholder="your@email.com"
            value={testTo}
            onChange={e => setTestTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-52 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          <button
            onClick={() => send(true)}
            disabled={testing || !testTo || candidates.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Sends one real email to you, built from a selected order — or the first order listed if none is ticked. The customer is not emailed."
          >
            <FiMail size={14} /> {testing ? 'Sending…' : 'Send test'}
          </button>

          <button
            onClick={() => setConfirming(true)}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend size={14} /> Send review requests
          </button>
        </div>

        {testMsg && (
          <p className="w-full text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{testMsg}</p>
        )}

        <p className="w-full text-[11px] text-gray-400">
          The test goes only to the address above, using a real order so the products and
          review links are exactly what a customer would receive. Nobody else is emailed
          and no order is marked as asked.
        </p>
      </div>

      {/* ── Candidate table ─────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading orders…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={fetchCandidates} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors">
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiInbox size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No orders match those filters</p>
          <p className="text-xs text-gray-400">Orders appear here once they&rsquo;re marked delivered.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={sendable.length === 0}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/30"
                    aria-label="Select all sendable orders"
                  />
                </th>
                <th className="px-3 py-3 text-left font-semibold">Customer</th>
                <th className="px-3 py-3 text-left font-semibold hidden xl:table-cell">Address</th>
                <th className="px-3 py-3 text-left font-semibold hidden md:table-cell">Products</th>
                <th className="px-3 py-3 text-left font-semibold hidden lg:table-cell">Order</th>
                <th className="px-3 py-3 text-left font-semibold hidden lg:table-cell">Delivered</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidates.map(c => {
                const blocked = c.optedOut || !!c.alreadySentAt || !c.email;
                return (
                  <tr key={c._id} className={blocked ? 'bg-gray-50/40' : 'hover:bg-amber-50/30 transition-colors'}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c._id)}
                        onChange={() => toggle(c._id)}
                        disabled={blocked}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/30 disabled:opacity-30"
                        aria-label={`Select order ${c.orderNumber}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className={`font-semibold truncate ${blocked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {c.fullName || c.name || '—'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{c.email || 'No email on order'}</p>
                    </td>
                    <td className="px-3 py-3 hidden xl:table-cell">
                      <p className="text-xs text-gray-500 truncate max-w-[16rem]" title={c.address}>
                        {c.address || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-600 truncate max-w-xs" title={c.products.join(', ')}>
                        {c.products.join(', ') || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-[11px] font-mono text-gray-500">{c.orderNumber}</span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500 tabular-nums">{fmtDate(c.deliveredAt || c.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {c.optedOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          <FiSlash size={10} /> Unsubscribed
                        </span>
                      ) : c.alreadySentAt ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                          title={`Sent ${fmtDate(c.alreadySentAt)}${c.sentCount > 1 ? ` · ${c.sentCount} times` : ''}`}
                        >
                          <FiClock size={10} /> Asked {fmtDate(c.alreadySentAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <FiMail size={10} /> Ready
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Confirmation ────────────────────────────────────────── */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !sending && setConfirming(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FiSend className="text-amber-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Send to {selected.size} customer{selected.size === 1 ? '' : 's'}?</h3>
                <p className="text-xs text-gray-500">Email can&rsquo;t be unsent.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Each customer gets one review request for their order, with an unsubscribe link.
              Anyone who has already been asked, or who unsubscribed, is skipped automatically.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={sending}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => send(false)}
                disabled={sending}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {sending ? 'Sending…' : `Send ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
