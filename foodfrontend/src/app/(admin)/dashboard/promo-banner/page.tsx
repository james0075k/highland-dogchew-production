'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { FiFlag, FiArrowLeft, FiRefreshCw, FiCopy, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';

interface CodeOption {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountLabel: string;
  suggestedLeadText: string;
  status: 'active' | 'inactive' | 'expired' | 'used-up';
}

interface Settings {
  saved: boolean;
  enabled: boolean;
  leadText: string;
  promoCodeId: string | null;
  updatedAt: string | null;
}

const MAX_TEXT = 80;

// Flags text that promises a different discount from the chosen code,
// e.g. "20% off" with a 10% code — customers would be charged differently.
function mismatchWarning(text: string, code: CodeOption | undefined): string | null {
  if (!code) return null;
  const pct = text.match(/(\d+(?:\.\d+)?)\s*%/);
  const gbp = text.match(/£\s*(\d+(?:\.\d+)?)/);
  if (code.discountType === 'percentage') {
    if (pct && Number(pct[1]) !== code.discountValue) return `The text says ${pct[1]}% but ${code.code} gives ${code.discountValue}%.`;
    if (gbp) return `The text mentions £${gbp[1]} but ${code.code} is a percentage discount.`;
  } else {
    if (gbp && Number(gbp[1]) !== code.discountValue) return `The text says £${gbp[1]} but ${code.code} gives £${code.discountValue}.`;
    if (pct) return `The text mentions ${pct[1]}% but ${code.code} is a fixed £${code.discountValue} discount.`;
  }
  return null;
}

export default function PromoBannerPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
  const token = () => Cookies.get('token');

  const [codes, setCodes]       = useState<CodeOption[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [enabled, setEnabled]   = useState(true);
  const [leadText, setLeadText] = useState('');
  const [codeId, setCodeId]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [msg, setMsg]           = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/promo-banner/admin`, {
        headers: { Authorization: `Bearer ${token()}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Couldn't load banner settings (HTTP ${res.status}).`);
      const s: Settings = json.data.settings;
      setCodes(json.data.codes);
      setSettings(s);
      setEnabled(s.enabled);
      setLeadText(s.leadText);
      setCodeId(s.promoCodeId || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load banner settings.');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(() => codes.find((c) => c._id === codeId), [codes, codeId]);
  // The current code stays in the list even if it has since expired, so the
  // admin can see why the banner is hidden; other unusable codes are left out.
  const options = useMemo(
    () => codes.filter((c) => c.status === 'active' || c._id === settings?.promoCodeId),
    [codes, settings],
  );
  const warning = mismatchWarning(leadText, selected);
  const trimmed = leadText.trim();
  const selectedUnusable = !!selected && selected.status !== 'active';

  const canSave = !saving && !!codeId && trimmed.length > 0 && trimmed.length <= MAX_TEXT && !/[<>]/.test(leadText)
    && !(enabled && selectedUnusable);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/promo-banner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ enabled, leadText: trimmed, promoCodeId: codeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Save failed (HTTP ${res.status}).`);

      // Refresh the cached homepage + /discount-code now rather than in ≤5 min.
      const reval = await fetch('/api/revalidate-promo-banner', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      }).catch(() => null);
      setMsg({
        kind: 'ok',
        text: reval?.ok
          ? 'Saved. The homepage shows the new banner now.'
          : 'Saved. The homepage will show the new banner within 5 minutes.',
      });
      await load();
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white">
              <FiArrowLeft size={18} />
            </Link>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
              <FiFlag className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Homepage Banner</h1>
              <p className="text-sm text-gray-500">The discount strip under the homepage hero</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FiExternalLink size={14} /> View site
            </a>
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            msg.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading banner…</div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  enabled && selected && !selectedUnusable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {enabled && selected && !selectedUnusable ? 'Showing on homepage' : 'Hidden'}
                </span>
              </div>
              <div className={`flex items-center justify-center gap-x-2 rounded-xl bg-[#EFE6DA] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-[#2E1F14] ${enabled ? '' : 'opacity-40'}`}>
                <span>
                  {trimmed || 'Your text here'} <strong className="font-bold">{selected?.code || 'CODE'}</strong>
                </span>
                <FiCopy size={13} className="text-[#7A5C4F]" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Visitors can click the copy icon: it copies the code and adds it at checkout automatically.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <span>
                  <span className="block text-sm font-medium text-gray-900">Show the banner</span>
                  <span className="block text-xs text-gray-500">Turn off to hide the strip on the homepage and the code on /discount-code.</span>
                </span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-5 w-5 accent-amber-500"
                />
              </label>

              <div>
                <label htmlFor="banner-code" className="block text-sm font-medium text-gray-900 mb-1">Discount code</label>
                {options.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No active codes. Create one in <Link href="/dashboard/promo-codes" className="text-amber-600 underline">Promo Codes</Link> first.
                  </p>
                ) : (
                  <select
                    id="banner-code"
                    value={codeId}
                    onChange={(e) => setCodeId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="" disabled>Choose a code…</option>
                    {options.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} — {c.discountLabel}{c.status !== 'active' ? ` (${c.status.replace('-', ' ')})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {selectedUnusable && (
                  <p className="mt-2 text-xs text-red-600">
                    {selected!.code} is {selected!.status.replace('-', ' ')}, so customers can&apos;t use it and the banner is hidden. Pick an active code.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Only active codes from Promo Codes are listed.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="banner-text" className="block text-sm font-medium text-gray-900">Words before the code</label>
                  <span className={`text-xs ${leadText.length > MAX_TEXT ? 'text-red-600' : 'text-gray-400'}`}>
                    {leadText.length}/{MAX_TEXT}
                  </span>
                </div>
                <input
                  id="banner-text"
                  type="text"
                  value={leadText}
                  maxLength={MAX_TEXT}
                  onChange={(e) => setLeadText(e.target.value)}
                  placeholder="10% off every chew with code"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                {selected && (
                  <button
                    type="button"
                    onClick={() => setLeadText(selected.suggestedLeadText)}
                    className="mt-2 text-xs text-amber-600 hover:text-amber-700 underline"
                  >
                    Use suggested text: &ldquo;{selected.suggestedLeadText}&rdquo;
                  </button>
                )}
                {/[<>]/.test(leadText) && <p className="mt-2 text-xs text-red-600">The text can&apos;t contain &lt; or &gt;.</p>}
                {warning && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                    <FiAlertTriangle className="mt-0.5 shrink-0" size={12} /> {warning}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Shown in capitals on the site. Google reads this text too.</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {settings?.saved
                    ? `Last saved ${fmt(settings.updatedAt)}`
                    : 'Not saved yet: the site is showing the default FRANK10 banner.'}
                </p>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save banner'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
