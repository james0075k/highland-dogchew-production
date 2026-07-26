'use client';

import React, { useState } from 'react';
import { FiPrinter, FiX, FiFileText, FiCreditCard } from 'react-icons/fi';
import { formatMoney } from '@/lib/format';

// ─── Types ──────────────────────────────────────────────────────────────────
// Kept intentionally loose so the page's own Order type satisfies it without a
// shared import. Only the fields the receipt renders are required.

export interface ReceiptItem {
  _id?: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptOrder {
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
  items: ReceiptItem[];
  subtotal?: number;
  totalTax?: number;
  totalDelivery?: number;
  totalDiscount?: number;
  grandTotal?: number;
  paymentIntentId?: string;
  paymentStatus?: string;
  orderStatus?: string;
  trackingNumber?: string | null;
  courier?: string;
  createdAt: string;
}

type PaperSize = 'a4' | 'thermal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// Brand constants — kept here so the receipt reads as its own document.
const BRAND = {
  name: 'Highland Yak Chew',
  tagline: 'Himalayan Yak Milk Dog Chews',
  site: 'highlanddogchew.co.uk',
  email: 'admin@highlanddogchew.co.uk',
  logo: '/images/logo11.png',
};

// ─── Receipt document ─────────────────────────────────────────────────────────
// A self-contained, print-ready receipt. All colours are inline so nothing
// depends on Tailwind being present at print time. `size` reflows the layout for
// A4/Letter paper vs. an 80mm thermal roll.

function ReceiptDocument({ order, size }: { order: ReceiptOrder; size: PaperSize }) {
  const thermal = size === 'thermal';

  const addr = order.shippingAddress ?? {};
  const name =
    addr.fullName ||
    [addr.firstName, addr.lastName].filter(Boolean).join(' ') ||
    'Customer';

  // ── Totals — computed from order data, with safe fallbacks ────────────────
  const itemsTotal = (order.items ?? []).reduce(
    (s, i) => s + i.quantity * (i.unitPrice ?? 0),
    0,
  );
  const subtotal = order.subtotal ?? itemsTotal;
  const discount = order.totalDiscount ?? 0;
  const shipping = order.totalDelivery ?? 0;
  const tax = order.totalTax ?? 0;
  const total =
    order.grandTotal ?? Math.max(0, subtotal - discount + shipping + tax);

  const paymentMethod = order.paymentIntentId ? 'Card — Stripe' : 'Free order — no payment';
  const paid = order.paymentStatus === 'paid';

  const ink = '#1a1a1a';
  const muted = '#6b7280';
  const line = '#e5e7eb';
  const accent = '#b45309'; // amber-700, matches the dashboard accent

  const rootStyle: React.CSSProperties = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: ink,
    background: '#fff',
    width: thermal ? '76mm' : '100%',
    maxWidth: thermal ? '76mm' : '780px',
    margin: '0 auto',
    padding: thermal ? '4mm 3mm' : '0',
    fontSize: thermal ? '11px' : '13px',
    lineHeight: 1.5,
    boxSizing: 'border-box',
  };

  const labelCell: React.CSSProperties = {
    color: muted,
    fontSize: thermal ? '10px' : '11px',
    padding: thermal ? '2px 0' : '3px 0',
  };
  const valueCell: React.CSSProperties = {
    textAlign: 'right',
    padding: thermal ? '2px 0' : '3px 0',
    fontWeight: 500,
  };
  const sectionLabel: React.CSSProperties = {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: muted,
    margin: '0 0 5px',
    fontWeight: 600,
  };

  return (
    <div id="receipt-print-root" style={rootStyle}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: thermal ? 'column' : 'row',
          alignItems: thermal ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: thermal ? '8px' : '16px',
          textAlign: thermal ? 'center' : 'left',
          paddingBottom: thermal ? '10px' : '18px',
          borderBottom: `2px solid ${ink}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: thermal ? 'column' : 'row' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            style={{ width: thermal ? '44px' : '52px', height: thermal ? '44px' : '52px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: thermal ? '15px' : '19px', fontWeight: 700, letterSpacing: '0.01em' }}>
              {BRAND.name}
            </div>
            <div style={{ fontSize: thermal ? '9px' : '11px', color: muted }}>{BRAND.tagline}</div>
          </div>
        </div>
        <div style={{ textAlign: thermal ? 'center' : 'right' }}>
          <div
            style={{
              fontSize: thermal ? '13px' : '16px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            Receipt
          </div>
          <div style={{ fontSize: thermal ? '11px' : '13px', fontFamily: 'monospace', marginTop: '2px' }}>
            {order.orderNumber}
          </div>
        </div>
      </div>

      {/* ── Info grid: Order + Ship to ─────────────────────────────────── */}
      <div
        style={{
          display: thermal ? 'block' : 'flex',
          gap: '24px',
          padding: thermal ? '10px 0' : '18px 0',
          borderBottom: `1px solid ${line}`,
        }}
      >
        {/* Order details */}
        <div style={{ flex: 1, marginBottom: thermal ? '10px' : 0 }}>
          <p style={sectionLabel}>Order Details</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={labelCell}>Order ID</td>
                <td style={{ ...valueCell, fontFamily: 'monospace' }}>{order.orderNumber}</td>
              </tr>
              <tr>
                <td style={labelCell}>Order Date</td>
                <td style={valueCell}>{fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}</td>
              </tr>
              <tr>
                <td style={labelCell}>Order Status</td>
                <td style={{ ...valueCell, textTransform: 'capitalize' }}>{cap(order.orderStatus)}</td>
              </tr>
              {order.trackingNumber && (
                <tr>
                  <td style={labelCell}>Tracking</td>
                  <td style={{ ...valueCell, fontFamily: 'monospace' }}>
                    {cap(order.courier || 'evri')} · {order.trackingNumber}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ship to */}
        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Ship To</p>
          <div style={{ fontSize: thermal ? '11px' : '13px', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700 }}>{name}</div>
            {addr.addressLine1 && <div>{addr.addressLine1}</div>}
            {addr.addressLine2 && <div>{addr.addressLine2}</div>}
            {(addr.city || addr.county) && (
              <div>{addr.city}{addr.county ? `, ${addr.county}` : ''}</div>
            )}
            {addr.postcode && <div>{addr.postcode}</div>}
            {addr.country && <div style={{ color: muted }}>{addr.country}</div>}
            {addr.phone && <div style={{ marginTop: '3px' }}>{addr.phone}</div>}
            {addr.email && <div style={{ color: muted, wordBreak: 'break-all' }}>{addr.email}</div>}
          </div>
        </div>
      </div>

      {/* ── Items ─────────────────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: thermal ? '10px 0' : '18px 0' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${ink}` }}>
            {(thermal ? ['Item', 'Qty', 'Amount'] : ['Item', 'Size', 'Qty', 'Unit Price', 'Amount']).map((h, i) => (
              <th
                key={h}
                style={{
                  textAlign: i === 0 || (!thermal && i === 1) ? 'left' : 'right',
                  padding: '6px 0',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: muted,
                  width: i === 0 ? (thermal ? '55%' : 'auto') : undefined,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item, idx) => (
            <tr key={item._id ?? idx} style={{ borderBottom: `1px solid ${line}` }}>
              <td style={{ padding: thermal ? '5px 0' : '8px 0', fontWeight: 500 }}>
                {item.name}
                {thermal && item.size && item.size !== 'Default' && (
                  <span style={{ color: muted, fontWeight: 400 }}> · {item.size}</span>
                )}
                {thermal && (
                  <div style={{ color: muted, fontSize: '10px', fontWeight: 400 }}>
                    {formatMoney(item.unitPrice ?? 0)} each
                  </div>
                )}
              </td>
              {!thermal && (
                <td style={{ padding: '8px 0', color: muted }}>{item.size || '—'}</td>
              )}
              <td style={{ padding: thermal ? '5px 0' : '8px 0', textAlign: 'right' }}>{item.quantity}</td>
              {!thermal && (
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatMoney(item.unitPrice ?? 0)}</td>
              )}
              <td style={{ padding: thermal ? '5px 0' : '8px 0', textAlign: 'right', fontWeight: 600 }}>
                {formatMoney((item.unitPrice ?? 0) * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <table
          style={{
            width: thermal ? '100%' : '48%',
            borderCollapse: 'collapse',
            fontSize: thermal ? '11px' : '13px',
          }}
        >
          <tbody>
            <tr>
              <td style={labelCell}>Subtotal</td>
              <td style={valueCell}>{formatMoney(subtotal)}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td style={labelCell}>Discount</td>
                <td style={{ ...valueCell, color: '#16a34a' }}>−{formatMoney(discount)}</td>
              </tr>
            )}
            <tr>
              <td style={labelCell}>Shipping</td>
              <td style={valueCell}>{shipping > 0 ? formatMoney(shipping) : 'Free'}</td>
            </tr>
            {tax > 0 && (
              <tr>
                <td style={labelCell}>Tax (VAT)</td>
                <td style={valueCell}>{formatMoney(tax)}</td>
              </tr>
            )}
            <tr>
              <td
                style={{
                  paddingTop: '8px',
                  borderTop: `2px solid ${ink}`,
                  fontWeight: 700,
                  fontSize: thermal ? '13px' : '15px',
                }}
              >
                Total
              </td>
              <td
                style={{
                  paddingTop: '8px',
                  borderTop: `2px solid ${ink}`,
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: thermal ? '14px' : '17px',
                  color: accent,
                }}
              >
                {formatMoney(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Payment ────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: thermal ? '12px' : '20px',
          padding: thermal ? '8px 0 0' : '14px 0 0',
          borderTop: `1px solid ${line}`,
          display: thermal ? 'block' : 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <p style={sectionLabel}>Payment</p>
          <div style={{ fontSize: thermal ? '11px' : '13px' }}>
            <div><strong>Method:</strong> {paymentMethod}</div>
            <div>
              <strong>Status:</strong>{' '}
              <span style={{ color: paid ? '#16a34a' : '#b45309', fontWeight: 600 }}>
                {cap(order.paymentStatus)}
              </span>
            </div>
            {order.paymentIntentId && (
              <div style={{ color: muted, fontSize: '10px', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
                Ref: {order.paymentIntentId}
              </div>
            )}
          </div>
        </div>
        {paid && !thermal && (
          <div
            style={{
              border: `2px solid #16a34a`,
              color: '#16a34a',
              borderRadius: '8px',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transform: 'rotate(-4deg)',
              whiteSpace: 'nowrap',
            }}
          >
            Paid
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: thermal ? '12px' : '24px',
          paddingTop: thermal ? '8px' : '14px',
          borderTop: `1px solid ${line}`,
          textAlign: 'center',
          fontSize: thermal ? '9px' : '11px',
          color: muted,
          lineHeight: 1.7,
        }}
      >
        <div style={{ fontWeight: 600, color: ink }}>Thank you for your order!</div>
        <div>{BRAND.site} · {BRAND.email}</div>
        <div>Keep this receipt for your records. Questions about your order? Just reply to your confirmation email.</div>
      </div>
    </div>
  );
}

// ─── Modal wrapper (print preview) ──────────────────────────────────────────

export default function ReceiptModal({
  order,
  onClose,
}: {
  order: ReceiptOrder;
  onClose: () => void;
}) {
  const [size, setSize] = useState<PaperSize>('a4');

  return (
    <div
      className="no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Receipt print preview"
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
        className="w-full max-w-[820px] flex items-center justify-between gap-3 flex-wrap bg-white rounded-t-2xl px-5 py-3 border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          <FiFileText size={16} className="text-amber-600" />
          Print Preview
        </div>

        <div className="flex items-center gap-2">
          {/* Size toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setSize('a4')}
              className={`px-3 py-1.5 transition-colors ${size === 'a4' ? 'bg-[#0c1e35] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              A4 / Letter
            </button>
            <button
              onClick={() => setSize('thermal')}
              className={`px-3 py-1.5 transition-colors ${size === 'thermal' ? 'bg-[#0c1e35] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Thermal 80mm
            </button>
          </div>

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

      {/* Preview surface */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[820px] bg-gray-100 rounded-b-2xl px-4 py-6 flex justify-center"
      >
        <div
          className="bg-white shadow-xl"
          style={{
            width: size === 'thermal' ? '300px' : '100%',
            maxWidth: size === 'thermal' ? '300px' : '780px',
            padding: size === 'thermal' ? '0' : '32px 36px',
            borderRadius: '4px',
          }}
        >
          <ReceiptDocument order={order} size={size} />
        </div>
      </div>

      <p
        onClick={(e) => e.stopPropagation()}
        className="mt-3 text-[11px] text-white/70 flex items-center gap-1.5"
      >
        <FiCreditCard size={12} />
        Only this receipt prints — the dashboard is hidden from the printout.
      </p>

      {/* ── Print isolation: hide everything except the receipt ─────────── */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #receipt-print-root, #receipt-print-root * { visibility: visible !important; }
          #receipt-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .no-print { display: block; }
          @page {
            size: ${size === 'thermal' ? '80mm auto' : 'A4'};
            margin: ${size === 'thermal' ? '3mm' : '14mm'};
          }
        }
      `}</style>
    </div>
  );
}
