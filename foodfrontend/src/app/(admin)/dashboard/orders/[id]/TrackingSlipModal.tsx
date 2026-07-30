'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { FiPrinter, FiX, FiTag, FiScissors } from 'react-icons/fi';

// ─── Types ──────────────────────────────────────────────────────────────────
// Kept intentionally loose (same approach as ReceiptModal) so the page's own
// Order type satisfies it without a shared import. Only what the slip prints
// is declared here.

export interface SlipItem {
  _id?: string;
  name: string;
  size?: string;
  quantity: number;
  subscriptionInterval?: string | null;
}

export interface SlipOrder {
  _id: string;
  orderNumber: string;
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  items: SlipItem[];
  orderStatus?: string;
  trackingNumber?: string | null;
  courier?: string;
  shippedAt?: string | null;
  createdAt: string;
}

// ─── Dispatch / brand constants ─────────────────────────────────────────────
// Everything printer-facing lives here so a change to the sender details is a
// one-place edit. `fallbackAddress` mirrors the contact page's own fallback and
// is only used when GET /info is unavailable.

const DISPATCH = {
  brand: 'Highland Yak Chew',
  tagline: 'Himalayan Yak Milk Dog Chews',
  site: 'highlanddogchew.co.uk',
  logo: '/images/logo11.png',
  origin: 'https://highlanddogchew.co.uk',
  fallbackAddress: '2nd Floor, College House, 17 King Edwards Rd, Ruislip, HA4 7AE, UK',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const UK_COUNTRY = /^(uk|gb|united kingdom|england|scotland|wales|northern ireland)$/i;

interface ReturnAddress {
  streetLines: string[];
  town?: string;
  postcode?: string;
  country?: string;
}

/**
 * Turns the single comma-separated address string from /info into a Royal Mail
 * shaped return block. Splitting naively on every comma produces a tall stack of
 * one-word lines and buries the postcode — but the postcode is the only part a
 * sorting office reads when bouncing a parcel back, so it gets its own emphasised
 * line paired with the post town.
 *
 * Falls back to plain comma-split lines when no postcode can be identified, so an
 * overseas or unusually formatted address still prints something sane.
 */
function parseReturnAddress(address: string): ReturnAddress {
  const segs = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (!segs.length) return { streetLines: [] };

  let country: string | undefined;
  if (UK_COUNTRY.test(segs[segs.length - 1])) country = segs.pop();

  let postcode: string | undefined;
  let town: string | undefined;

  const last = segs[segs.length - 1];
  if (last && UK_POSTCODE.test(last)) {
    // "…, Ruislip, HA4 7AE"
    postcode = segs.pop();
    town = segs.pop();
  } else if (last) {
    // "…, Ruislip HA4 7AE" — town and postcode share a segment
    const m = last.match(/^(.*?)[\s,]+([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i);
    if (m) {
      segs.pop();
      town = m[1].trim();
      postcode = m[2];
    }
  }

  // Keep the block short: fold every leading segment except the final street
  // line onto one line ("2nd Floor, College House" / "17 King Edwards Rd").
  const streetLines =
    segs.length > 1 ? [segs.slice(0, -1).join(', '), segs[segs.length - 1]] : segs;

  return { streetLines, town, postcode, country };
}

/**
 * Code128 needs ~11 modules per character plus ~35 for start/checksum/stop.
 * Scaling the bar width to the value length keeps the barcode inside the
 * label's printable width no matter how long the tracking number is.
 *
 * The 205px target (rather than the full ~246px of a 65mm label) reserves the
 * ~10-module quiet zone either side that Code128 scanners require. Digit-heavy
 * values encode shorter than this estimate because Code128 auto-switches to
 * Code C, so the result errs towards narrower bars — never towards overflow.
 */
const barWidthFor = (value: string) =>
  Math.max(0.8, Math.min(1.7, 205 / (11 * value.length + 35)));

/** Pulls the live company address from the same endpoint the contact page uses. */
function useCompanyAddress() {
  const [address, setAddress] = useState(DISPATCH.fallbackAddress);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    let cancelled = false;
    fetch(`${api}/info`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const live = d?.data?.address?.trim();
        if (!cancelled && d?.success && live) setAddress(live);
      })
      .catch(() => {
        /* keep the fallback — a label must always print */
      });

    return () => { cancelled = true; };
  }, []);

  return address;
}

// ─── Slip document ──────────────────────────────────────────────────────────
// A 70mm thermal dispatch label. Pure black-on-white, all styles inline so
// nothing depends on Tailwind at print time. This is the branded slip that goes
// on the outside of the box — it deliberately carries NO prices or totals.

function TrackingSlipDocument({
  order,
  companyAddress,
}: {
  order: SlipOrder;
  companyAddress: string;
}) {
  const addr = order.shippingAddress ?? {};
  const name =
    addr.fullName ||
    [addr.firstName, addr.lastName].filter(Boolean).join(' ') ||
    'Customer';

  // Shipped parcels carry the courier's tracking number; anything earlier in the
  // pipeline falls back to the internal order reference so the slip is never
  // mistaken for a dispatched parcel.
  const tracked = Boolean(order.trackingNumber);
  const barcodeValue = (order.trackingNumber || order.orderNumber).toUpperCase();
  const courier = (order.courier || 'evri').toUpperCase();
  const bandLabel = tracked ? `TRACKED · ${courier}` : 'ORDER REF · NOT YET SHIPPED';

  const trackUrl = useMemo(() => {
    const qs = new URLSearchParams({ order: order.orderNumber });
    if (addr.email) qs.set('email', addr.email);
    return `${DISPATCH.origin}/track-order?${qs.toString()}`;
  }, [order.orderNumber, addr.email]);

  const totalUnits = (order.items ?? []).reduce((s, i) => s + (i.quantity || 0), 0);
  const ret = parseReturnAddress(companyAddress);

  // Hide the country line when it's the default on a UK postcode — it costs a
  // line of height and tells the courier nothing.
  const showCountry =
    addr.country && !/^united kingdom$|^uk$|^gb$/i.test(addr.country.trim());

  const ink = '#000';
  const soft = '#555';

  const rootStyle: React.CSSProperties = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: ink,
    background: '#fff',
    width: '65mm',
    maxWidth: '65mm',
    margin: '0 auto',
    padding: '2.5mm',
    border: '1px dashed #000',
    fontSize: '9px',
    lineHeight: 1.35,
    boxSizing: 'border-box',
  };

  const rule: React.CSSProperties = {
    borderTop: `1px solid ${ink}`,
    margin: '5px 0',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: '6.5px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: soft,
    margin: '0 0 3px',
  };

  const metaKey: React.CSSProperties = {
    fontSize: '6.5px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: soft,
    padding: '1.5px 0',
    verticalAlign: 'top',
    width: '34%',
  };

  const metaVal: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: 700,
    padding: '1.5px 0',
    verticalAlign: 'top',
    wordBreak: 'break-all',
  };

  return (
    <div id="slip-print-root" style={rootStyle}>

      {/* ── Brand header ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DISPATCH.logo}
          alt={DISPATCH.brand}
          style={{ width: '30px', height: '30px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {DISPATCH.brand}
          </div>
          <div style={{ fontSize: '6.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: soft }}>
            {DISPATCH.tagline}
          </div>
        </div>
      </div>

      {/* ── Service band ───────────────────────────────────────────────── */}
      <div
        className="slip-inv"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          marginTop: '5px',
          border: `1.5px solid ${ink}`,
        }}
      >
        <div
          className="slip-inv"
          style={{
            flex: 1,
            background: ink,
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            padding: '3px 5px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {bandLabel}
        </div>
        <div
          style={{
            padding: '3px 6px',
            fontSize: '9.5px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            borderLeft: `1.5px solid ${ink}`,
            whiteSpace: 'nowrap',
          }}
        >
          1 OF 1
        </div>
      </div>

      {/* ── Barcode ────────────────────────────────────────────────────── */}
      {/* The `svg { max-width }` guard is a backstop: however long a courier's
          tracking number gets, the barcode scales down rather than overflowing
          the label edge. */}
      <div className="slip-barcode" style={{ textAlign: 'center', padding: '7px 0 0' }}>
        <Barcode
          value={barcodeValue}
          format="CODE128"
          renderer="svg"
          displayValue={false}
          height={42}
          width={barWidthFor(barcodeValue)}
          margin={0}
          background="#ffffff"
          lineColor={ink}
        />
        <div
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            marginTop: '2px',
            wordBreak: 'break-all',
          }}
        >
          {barcodeValue}
        </div>
      </div>

      <div style={rule} />

      {/* ── Deliver to ─────────────────────────────────────────────────── */}
      <div>
        <p style={sectionLabel}>Deliver To</p>
        <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2 }}>
          {name}
        </div>
        <div style={{ fontSize: '10.5px', lineHeight: 1.4, marginTop: '2px' }}>
          {addr.addressLine1 && <div>{addr.addressLine1}</div>}
          {addr.addressLine2 && <div>{addr.addressLine2}</div>}
          {addr.county && <div>{addr.county}</div>}
          {addr.city && (
            <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {addr.city}
            </div>
          )}
        </div>

        {/* Postcode is the courier's sorting key — give it the most weight. */}
        {addr.postcode && (
          <div
            style={{
              display: 'inline-block',
              border: `2px solid ${ink}`,
              padding: '1px 8px',
              marginTop: '4px',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              fontFamily: '"Courier New", Courier, monospace',
            }}
          >
            {addr.postcode.toUpperCase()}
          </div>
        )}

        {(showCountry || addr.phone) && (
          <div style={{ fontSize: '8.5px', marginTop: '3px', color: soft }}>
            {[showCountry ? addr.country : null, addr.phone].filter(Boolean).join('  ·  ')}
          </div>
        )}
      </div>

      <div style={rule} />

      {/* ── Order meta + QR ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
        <table style={{ flex: 1, borderCollapse: 'collapse', minWidth: 0 }}>
          <tbody>
            <tr>
              <td style={metaKey}>ORDER</td>
              <td style={{ ...metaVal, fontFamily: '"Courier New", Courier, monospace' }}>
                {order.orderNumber}
              </td>
            </tr>
            <tr>
              <td style={metaKey}>DATE</td>
              <td style={metaVal}>{fmtDate(order.createdAt)}</td>
            </tr>
            <tr>
              <td style={metaKey}>ITEMS</td>
              <td style={metaVal}>
                {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <QRCodeSVG value={trackUrl} size={74} level="M" marginSize={0} />
          <div style={{ fontSize: '5.5px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px', color: soft }}>
            Scan to track
          </div>
        </div>
      </div>

      <div style={rule} />

      {/* ── Contents (no prices — this label rides on the outside) ──────── */}
      <div>
        <p style={sectionLabel}>Contents</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {(order.items ?? []).map((item, idx) => (
              <tr key={item._id ?? idx}>
                <td
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '1.5px 5px 1.5px 0',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                    width: '1%',
                  }}
                >
                  {item.quantity} ×
                </td>
                <td style={{ fontSize: '9px', padding: '1.5px 0', verticalAlign: 'top', lineHeight: 1.3 }}>
                  {item.name}
                  {item.size && item.size !== 'Default' && (
                    <span style={{ color: soft }}> — {item.size}</span>
                  )}
                  {item.subscriptionInterval && (
                    <span style={{ fontSize: '6.5px', fontWeight: 800, letterSpacing: '0.1em', marginLeft: '3px' }}>
                      ↻ SUB
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={rule} />

      {/* ── Return address ─────────────────────────────────────────────── */}
      <div>
        <p style={sectionLabel}>If Undelivered Return To</p>
        <div style={{ fontSize: '8.5px', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700 }}>{DISPATCH.brand}</div>
          {ret.streetLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          {(ret.town || ret.postcode) && (
            <div style={{ fontWeight: 700 }}>
              {ret.town && (
                <span style={{ textTransform: 'uppercase' }}>{ret.town}</span>
              )}
              {ret.town && ret.postcode ? '  ' : ''}
              {ret.postcode && (
                <span
                  style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '0.06em',
                  }}
                >
                  {ret.postcode.toUpperCase()}
                </span>
              )}
            </div>
          )}
          {ret.country && <div>{ret.country.toUpperCase()}</div>}
        </div>
      </div>

      {/* ── Handling footer ────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '5px',
          paddingTop: '4px',
          borderTop: `1px solid ${ink}`,
          textAlign: 'center',
          fontSize: '7px',
          letterSpacing: '0.06em',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          Keep dry · Store cool &amp; dry · Not for human consumption
        </div>
        <div style={{ color: soft }}>{DISPATCH.site}</div>
      </div>
    </div>
  );
}

// ─── Modal wrapper (print preview) ──────────────────────────────────────────

export default function TrackingSlipModal({
  order,
  onClose,
}: {
  order: SlipOrder;
  onClose: () => void;
}) {
  const companyAddress = useCompanyAddress();

  return (
    <div
      className="no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Tracking slip print preview"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] flex items-center justify-between gap-3 flex-wrap bg-white rounded-t-2xl px-5 py-3 border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          <FiTag size={16} className="text-amber-600" />
          Tracking Slip
          <span className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
            70mm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <FiPrinter size={13} />
            Print
          </button>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Preview surface — 265px ≈ 70mm at 96dpi, so screen matches paper */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-gray-100 rounded-b-2xl px-4 py-6 flex justify-center"
      >
        <div className="bg-white shadow-xl" style={{ width: '265px' }}>
          <TrackingSlipDocument order={order} companyAddress={companyAddress} />
        </div>
      </div>

      <p
        onClick={(e) => e.stopPropagation()}
        className="mt-3 text-[11px] text-white/70 flex items-center gap-1.5 text-center"
      >
        <FiScissors size={12} />
        Prints on a 70mm roll — attach to the outside of the parcel. No prices are shown.
      </p>

      {/* ── Print isolation: only the slip reaches the paper ──────────────── */}
      <style>{`
        #slip-print-root .slip-inv {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        #slip-print-root .slip-barcode svg {
          max-width: 100%;
          height: auto;
        }
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #slip-print-root, #slip-print-root * { visibility: visible !important; }
          #slip-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 65mm !important;
            max-width: 65mm !important;
            box-shadow: none !important;
          }
          .no-print { display: block; }
          @page {
            size: 70mm auto;
            margin: 2.5mm;
          }
        }
      `}</style>
    </div>
  );
}
