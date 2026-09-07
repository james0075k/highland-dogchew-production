'use client';

/**
 * Newsletter composer.
 *
 * The promotional counterpart to the review requests on the reviews page: this
 * one sells, that one asks. Kept as its own screen because the audience is
 * different (subscribers as well as customers) and the compose step needs room.
 *
 * The preview is rendered by the server from the real template, so what's shown
 * here is what actually lands in the inbox.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiMail, FiSend, FiArrowLeft, FiUsers, FiEye, FiRefreshCw,
  FiAlertCircle, FiCheckCircle, FiSlash, FiClock,
} from 'react-icons/fi';
import { authHeader, jsonAuthHeader } from '@/lib/auth';

interface Recipient {
  email: string;
  name: string;
  address: string;
  source: 'subscriber' | 'customer' | 'both';
}

interface Audience {
  source: string;
  count: number;
  suppressedCount: number;
  overCap: boolean;
  cap: number;
  recipients: Recipient[];
}

interface Campaign {
  _id: string;
  type: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: string;
  sentByEmail: string;
  createdAt: string;
}

const SOURCES = [
  { value: 'both', label: 'Subscribers + customers', hint: 'Everyone who opted in or has bought from you' },
  { value: 'subscribers', label: 'Newsletter subscribers', hint: 'Only people who signed up to the list' },
  { value: 'customers', label: 'Past customers', hint: 'Only people who have placed an order' },
];

const PRODUCT_TYPES = [
  { value: '', label: 'Any product' },
  { value: 'yak-milk', label: 'Yak Milk Chews' },
  { value: 'puff-treat', label: 'Puff Treats' },
  { value: 'highland-mix', label: 'Highland Mix' },
];

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_CHIP: Record<string, string> = {
  sent: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  test: 'bg-slate-100 text-slate-600',
};

export default function NewsletterPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Content
  const [subject, setSubject] = useState('');
  const [headline, setHeadline] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Shop our range');
  const [ctaUrl, setCtaUrl] = useState('https://highlanddogchew.co.uk/products');
  const [showRange, setShowRange] = useState(true);

  // Audience
  const [source, setSource] = useState('both');
  const [productType, setProductType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [audience, setAudience] = useState<Audience | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  // Preview / send
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const audienceParams = useMemo(() => {
    const p = new URLSearchParams({ source });
    if (productType) p.set('productType', productType);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    return p.toString();
  }, [source, productType, dateFrom, dateTo]);

  const fetchAudience = useCallback(async () => {
    try {
      setAudienceLoading(true);
      const res = await fetch(`${API}/admin/marketing/newsletter/audience?${audienceParams}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) setAudience(data.data);
    } catch {
      setAudience(null);
    } finally {
      setAudienceLoading(false);
    }
  }, [API, audienceParams]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/marketing/campaigns?limit=10`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setCampaigns(data.data || []);
    } catch { /* history is nice to have, not essential */ }
  }, [API]);

  useEffect(() => { fetchAudience(); }, [fetchAudience]);
  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const contentReady = subject.trim() && headline.trim() && bodyHtml.trim();

  const loadPreview = async () => {
    setPreviewing(true);
    try {
      const res = await fetch(`${API}/admin/marketing/newsletter/preview`, {
        method: 'POST',
        headers: jsonAuthHeader(),
        body: JSON.stringify({ headline, bodyHtml, ctaLabel, ctaUrl, showRange }),
      });
      const data = await res.json();
      if (data.success) setPreviewHtml(data.data.html);
    } catch {
      setNotice({ tone: 'bad', text: 'Could not render the preview.' });
    } finally {
      setPreviewing(false);
    }
  };

  const sendTest = async () => {
    if (!testTo || !contentReady) return;
    setTesting(true);
    setNotice(null);
    try {
      const res = await fetch(`${API}/admin/marketing/newsletter/send`, {
        method: 'POST',
        headers: jsonAuthHeader(),
        body: JSON.stringify({ subject, headline, bodyHtml, ctaLabel, ctaUrl, showRange, testTo }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // The API reports success for "the request was handled", which is not the
      // same as "the mail server accepted it" — check what actually went out.
      if (!data.data?.sent) {
        const why = data.data?.failures?.[0]?.error || 'the mail server rejected it';
        throw new Error(`Test NOT sent: ${why}`);
      }

      setNotice({
        tone: 'good',
        text: `Test sent to ${testTo}. If it isn't in the inbox, check Spam and Promotions — a first send from a new address often lands there.`,
      });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof Error ? err.message : 'Test send failed' });
    } finally {
      setTesting(false);
    }
  };

  const sendReal = async () => {
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`${API}/admin/marketing/newsletter/send`, {
        method: 'POST',
        headers: jsonAuthHeader(),
        body: JSON.stringify({
          subject, headline, bodyHtml, ctaLabel, ctaUrl, showRange,
          source, productType, dateFrom, dateTo,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setNotice({
        tone: data.data.sent > 0 ? 'good' : 'bad',
        text: `Sent to ${data.data.sent} recipient${data.data.sent === 1 ? '' : 's'}` +
          (data.data.failed ? ` · ${data.data.failed} failed` : '') +
          (data.data.truncated ? ' · list was longer than the batch cap, run again for the rest' : ''),
      });
      setConfirming(false);
      fetchCampaigns();
      fetchAudience();
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof Error ? err.message : 'Send failed' });
      setConfirming(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiMail className="text-amber-500" size={18} />
              Newsletter
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Write a promotional email and send it to subscribers and past customers</p>
          </div>
        </div>
      </div>

      {notice && (
        <div className={`mb-4 rounded-2xl border p-4 flex items-start gap-3 ${
          notice.tone === 'good' ? 'bg-white border-emerald-200 ring-1 ring-emerald-100' : 'bg-white border-red-200 ring-1 ring-red-100'
        }`}>
          {notice.tone === 'good'
            ? <FiCheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
            : <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />}
          <p className="text-sm text-gray-700">{notice.text}</p>
          <button onClick={() => setNotice(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-xs font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* ── Compose ─────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Content</h2>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject line</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="New flavour just landed 🐾"
              className="w-full mb-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <p className="text-[11px] text-gray-400 mb-4">
              {subject.length} characters — inboxes cut off around 45 on mobile.
            </p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Headline</label>
            <input
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="Meet the Pumpkin chew"
              className="w-full mb-4 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
            <textarea
              value={bodyHtml}
              onChange={e => setBodyHtml(e.target.value)}
              rows={9}
              placeholder={'<p>Hello!</p>\n<p>We have something new for autumn…</p>'}
              className="w-full mb-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-y"
            />
            <p className="text-[11px] text-gray-400 mb-4">
              Basic HTML — wrap paragraphs in <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code>. The branding, images and footer are added for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Button label</label>
                <input
                  value={ctaLabel}
                  onChange={e => setCtaLabel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Button link</label>
                <input
                  value={ctaUrl}
                  onChange={e => setCtaUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showRange}
                onChange={e => setShowRange(e.target.checked)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/30"
              />
              Include the product range strip
            </label>
          </section>

          {/* ── Audience ──────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Audience</h2>

            <div className="space-y-2 mb-4">
              {SOURCES.map(s => (
                <label
                  key={s.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    source === s.value ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-200' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    checked={source === s.value}
                    onChange={() => setSource(s.value)}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-[11px] text-gray-500">{s.hint}</p>
                  </div>
                </label>
              ))}
            </div>

            {source !== 'subscribers' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bought</label>
                  <select
                    value={productType}
                    onChange={e => setProductType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  >
                    {PRODUCT_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Ordered from</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">to</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500" />
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                <FiUsers size={13} className="text-amber-500" />
                {audienceLoading ? 'Counting…' : `${audience?.count ?? 0} will receive this`}
              </span>
              {!!audience?.suppressedCount && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FiSlash size={12} /> {audience.suppressedCount} unsubscribed and excluded
                </span>
              )}
              {audience?.overCap && (
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <FiAlertCircle size={12} /> Over the {audience.cap} cap — send again for the remainder
                </span>
              )}
              <button
                onClick={() => setShowRecipients(v => !v)}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                {showRecipients ? 'Hide' : 'Show'} recipient list
              </button>
              <button onClick={fetchAudience} className="ml-auto text-gray-400 hover:text-gray-700">
                <FiRefreshCw size={13} className={audienceLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {showRecipients && (
              <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
                {!audience?.recipients?.length ? (
                  <p className="text-xs text-gray-400 text-center py-8">Nobody matches this audience.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] uppercase tracking-wider text-gray-400">
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Name</th>
                          <th className="px-3 py-2 text-left font-semibold">Email</th>
                          <th className="px-3 py-2 text-left font-semibold">Address</th>
                          <th className="px-3 py-2 text-left font-semibold">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {audience.recipients.map((r, i) => (
                          <tr key={r.email} className="hover:bg-amber-50/30">
                            <td className="px-3 py-2 text-gray-300 tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{r.name || '—'}</td>
                            <td className="px-3 py-2 text-gray-600">{r.email}</td>
                            <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={r.address}>
                              {r.address || '—'}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.source === 'customer' ? 'bg-emerald-100 text-emerald-700'
                                  : r.source === 'both' ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {r.source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Send ──────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={testTo}
                onChange={e => setTestTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-52 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              <button
                onClick={sendTest}
                disabled={testing || !testTo || !contentReady}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiMail size={14} /> {testing ? 'Sending…' : 'Send test'}
              </button>

              <button
                onClick={() => setConfirming(true)}
                disabled={!contentReady || !audience?.count}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
              >
                <FiSend size={14} /> Send to {audience?.count ?? 0}
              </button>
            </div>
            {!contentReady && (
              <p className="text-[11px] text-gray-400 mt-3">Add a subject, headline and message to enable sending.</p>
            )}
          </section>
        </div>

        {/* ── Preview ─────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Preview</h2>
              <button
                onClick={loadPreview}
                disabled={previewing}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0c1e35] text-white rounded-lg text-xs font-semibold hover:bg-[#0f2744] disabled:opacity-50 transition-colors"
              >
                <FiEye size={12} /> {previewing ? 'Rendering…' : 'Refresh preview'}
              </button>
            </header>
            {previewHtml ? (
              <iframe
                title="Newsletter preview"
                srcDoc={previewHtml}
                sandbox=""
                className="w-full h-[640px] bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                <FiEye size={26} className="text-gray-300" />
                <p className="text-sm text-gray-400 font-medium">No preview yet</p>
                <p className="text-xs text-gray-400">Write your message, then refresh the preview to see the real email.</p>
              </div>
            )}
          </section>

          {/* ── History ───────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <header className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent sends</h2>
            </header>
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <FiClock size={22} className="text-gray-300" />
                <p className="text-xs text-gray-400">Nothing sent yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {campaigns.map(c => (
                  <li key={c._id} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CHIP[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.type.replace('-', ' ')}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.subject || '—'}</p>
                    <p className="text-[11px] text-gray-400">
                      {c.sentCount}/{c.recipientCount} delivered
                      {c.failedCount > 0 && <span className="text-red-500"> · {c.failedCount} failed</span>}
                      {' · '}{fmtDateTime(c.createdAt)}
                      {c.sentByEmail && ` · ${c.sentByEmail}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* ── Confirmation ──────────────────────────────────────── */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !sending && setConfirming(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FiSend className="text-amber-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Send to {audience?.count} people?</h3>
                <p className="text-xs text-gray-500">Email can&rsquo;t be unsent.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Subject: <span className="font-semibold text-gray-800">{subject}</span>
            </p>
            <p className="text-xs text-gray-500">
              Everyone who unsubscribed is excluded, and each email carries its own unsubscribe link.
              Send a test to yourself first if you haven&rsquo;t.
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
                onClick={sendReal}
                disabled={sending}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
