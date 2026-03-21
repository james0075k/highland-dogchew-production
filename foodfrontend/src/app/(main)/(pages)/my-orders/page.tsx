'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  MailOpen,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  RefreshCcw,
  Hash,
  ArrowRight,
  PackageCheck,
  Timer,
  Boxes,
  ChevronRight,
} from 'lucide-react';
import MySubscriptions from '@/components/subscription/MySubscriptions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

interface MyOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  grandTotal: number;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

interface TrackResult {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  totalTax: number;
  totalDelivery: number;
  grandTotal: number;
  shippingAddress: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

type PageTab = 'orders' | 'track' | 'subscriptions';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; barColor: string; icon: React.ReactNode }> = {
  pending:    { label: 'Order Received',       barColor: 'bg-amber-400',   color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',    icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed:  { label: 'Order Confirmed',      barColor: 'bg-blue-500',    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',          icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: 'Preparing Your Order', barColor: 'bg-purple-500',  color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', icon: <Package className="w-3.5 h-3.5" /> },
  shipped:    { label: 'Out for Delivery',     barColor: 'bg-teal-500',    color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',           icon: <Truck className="w-3.5 h-3.5" /> },
  delivered:  { label: 'Delivered',            barColor: 'bg-emerald-500', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:  { label: 'Cancelled',            barColor: 'bg-red-400',     color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',                 icon: <XCircle className="w-3.5 h-3.5" /> },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Timeline steps ──────────────────────────────────────────────────────────

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'Received',
  confirmed: 'Confirmed',
  processing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};
const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  processing: <Package className="w-3.5 h-3.5" />,
  shipped: <Truck className="w-3.5 h-3.5" />,
  delivered: <PackageCheck className="w-3.5 h-3.5" />,
};

function getStepIndex(status: string): number {
  return STEPS.indexOf(status as (typeof STEPS)[number]);
}

// ─── Animated Delivery Timeline ──────────────────────────────────────────────

function DeliveryTimeline({ status }: { status: string }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50/60 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">This order has been cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative py-3">
      <div className="flex items-start justify-between relative">
        {/* Background track */}
        <div className="absolute top-[14px] left-[14px] right-[14px] h-[3px] bg-[#f0ebe4] dark:bg-[#2e2420] rounded-full" />
        {/* Active track */}
        <div
          className="absolute top-[14px] left-[14px] h-[3px] rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-1000 ease-out"
          style={{ width: `calc(${(Math.max(0, currentStep) / (STEPS.length - 1)) * 100}% - 28px)` }}
        />

        {/* Truck animation overlay on the progress line */}
        {status === 'shipped' && (
          <div
            className="absolute top-[6px] z-10 transition-all duration-1000 animate-[truck-drive_1.5s_ease-in-out_infinite]"
            style={{ left: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 6px)` }}
          >
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        )}

        {STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          return (
            <div key={step} className="flex flex-col items-center z-10" style={{ width: `${100 / STEPS.length}%` }}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  done
                    ? active
                      ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-500/25 scale-110'
                      : 'bg-emerald-500 border-emerald-500'
                    : 'bg-white dark:bg-[#17120e] border-[#e8e3dc] dark:border-[#3a2c23]'
                }`}
              >
                {done && !active ? (
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                ) : active ? (
                  <span className="text-white">{STEP_ICONS[step]}</span>
                ) : (
                  <span className="text-[#ccc] dark:text-[#444]">{STEP_ICONS[step]}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-2 text-center leading-tight transition-colors duration-300 ${
                  done ? 'text-[#2f1e14] dark:text-[#f5e9dc]' : 'text-[#c8b6a6] dark:text-[#555]'
                } ${active ? 'font-bold' : ''}`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc] leading-none">{value}</p>
        <p className="text-[11px] text-[#aaa] dark:text-[#666] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: MyOrder }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.pending;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="group bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#d8ccba] dark:hover:border-[#3a2c23]">
      {/* Status bar */}
      <div className={`h-[3px] ${status.barColor}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#faf5ee] dark:bg-[#2a211b] flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] tracking-wide">
                {order.orderNumber}
              </p>
              <p className="text-xs text-[#aaa] dark:text-[#666] mt-0.5">
                {fmtDate(order.createdAt)} &middot; {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
            <span className="text-base font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
              £{order.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery timeline */}
        <DeliveryTimeline status={order.orderStatus} />

        {/* Shipping address line */}
        {order.shippingAddress?.city && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#aaa] dark:text-[#666]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {[
                order.shippingAddress.fullName,
                order.shippingAddress.addressLine1,
                order.shippingAddress.city,
                order.shippingAddress.postcode,
              ].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Tracking banner — shipped + has tracking */}
        {order.orderStatus === 'shipped' && order.trackingNumber && (
          <div className="mt-4 px-4 py-3 bg-teal-50/70 dark:bg-teal-900/15 border border-teal-200/70 dark:border-teal-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-[truck-drive_1.5s_ease-in-out_infinite]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600/80 dark:text-teal-400/80">
                  {order.courier || 'Evri'} Tracking
                </p>
                <p className="font-mono text-sm text-teal-700 dark:text-teal-300 font-bold truncate">
                  {order.trackingNumber}
                </p>
              </div>
            </div>
            <a
              href={`https://www.evri.com/track/parcel/${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Track Parcel
            </a>
          </div>
        )}
      </div>

      {/* Expand / collapse items */}
      <div className="border-t border-[#f0ebe4] dark:border-[#2e2420]">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] hover:bg-[#faf8f4] dark:hover:bg-[#17120e] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5" />
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in this order
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-5 pb-4 space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm py-2.5 border-b border-[#f8f3ee] dark:border-[#2a211b] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50/80 dark:bg-[#2a211b] flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc] text-sm">{item.name}</p>
                    <p className="text-[11px] text-[#aaa] dark:text-[#666] mt-0.5">
                      {item.size} &middot; Qty {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm ml-4 shrink-0">
                  £{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Order total */}
            <div className="flex justify-between items-center pt-3 border-t border-[#e8e3dc] dark:border-[#2e2420]">
              <span className="text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6]">Order Total</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                £{order.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Track Order Result ──────────────────────────────────────────────────────

function TrackResult({ result }: { result: TrackResult }) {
  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      {/* Main status card */}
      <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm">
        <div className={`h-[3px] ${STATUS_CONFIG[result.orderStatus]?.barColor || 'bg-amber-400'}`} />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#666] mb-1 font-medium">
                Order
              </p>
              <p className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] font-mono tracking-wide">
                {result.orderNumber}
              </p>
              <p className="text-xs text-[#aaa] dark:text-[#666] mt-1.5">
                Placed on {fmtDate(result.createdAt)}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${STATUS_CONFIG[result.orderStatus]?.color ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              {STATUS_CONFIG[result.orderStatus]?.icon}
              {STATUS_CONFIG[result.orderStatus]?.label ?? result.orderStatus}
            </span>
          </div>

          {/* Delivery timeline */}
          <div className="mb-2">
            <DeliveryTimeline status={result.orderStatus} />
          </div>

          {/* Tracking info */}
          {result.orderStatus === 'shipped' && result.trackingNumber && (
            <div className="mt-5 bg-teal-50/70 dark:bg-teal-900/15 border border-teal-200/70 dark:border-teal-800/50 rounded-xl p-4 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 font-bold">
                Live Tracking
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#aaa] dark:text-[#666]">Courier:</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] capitalize">
                    {result.courier || 'Evri'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#aaa] dark:text-[#666]">Tracking:</span>
                  <span className="font-mono font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
                    {result.trackingNumber}
                  </span>
                </div>
                {result.shippedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#aaa] dark:text-[#666]">Shipped:</span>
                    <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                      {fmtShort(result.shippedAt)}
                    </span>
                  </div>
                )}
              </div>
              <a
                href={`https://www.evri.com/track/parcel/${result.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Truck className="w-4 h-4" />
                Track Parcel on Evri
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          )}

          {/* Shipping address */}
          {result.shippingAddress?.addressLine1 && (
            <div className="mt-5 pt-5 border-t border-[#f0ebe4] dark:border-[#2e2420]">
              <div className="flex items-center gap-2 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#aaa] dark:text-[#666]" />
                <span className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#666] font-medium">
                  Delivery Address
                </span>
              </div>
              <address className="not-italic text-sm text-[#2f1e14] dark:text-[#f5e9dc] leading-relaxed pl-6">
                {result.shippingAddress.fullName && <p className="font-semibold">{result.shippingAddress.fullName}</p>}
                {result.shippingAddress.addressLine1 && <p>{result.shippingAddress.addressLine1}</p>}
                {result.shippingAddress.city && (
                  <p>{result.shippingAddress.city}{result.shippingAddress.postcode ? `, ${result.shippingAddress.postcode}` : ''}</p>
                )}
                {result.shippingAddress.country && (
                  <p className="text-[#aaa] dark:text-[#666]">{result.shippingAddress.country}</p>
                )}
              </address>
            </div>
          )}
        </div>
      </div>

      {/* Items + pricing card */}
      <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm">
        <div className="h-[3px] bg-amber-400" />
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Boxes className="w-3.5 h-3.5 text-[#aaa] dark:text-[#666]" />
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] dark:text-[#666] font-bold">
              Items Ordered
            </h2>
          </div>
          <div className="space-y-1">
            {result.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-3 border-b border-[#f0ebe4] dark:border-[#2e2420] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50/80 dark:bg-[#2a211b] flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc]">{item.name}</p>
                    <p className="text-xs text-[#aaa] dark:text-[#666]">{item.size} &times; {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] ml-4 shrink-0">
                  £{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="mt-4 pt-4 border-t border-[#e8e3dc] dark:border-[#2e2420] space-y-2">
            <div className="flex justify-between text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
              <span>Subtotal</span>
              <span>£{result.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
              <span>VAT (20%)</span>
              <span>£{result.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
              <span>Delivery</span>
              <span>£{result.totalDelivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#f0ebe4] dark:border-[#2e2420]">
              <span className="font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                £{result.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<PageTab>('orders');

  // My Orders state
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [searched, setSearched] = useState('');

  // Track Order state
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);

  // Support deep-linking: ?tab=subscriptions or ?tab=track
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subscriptions') setActiveTab('subscriptions');
    else if (tab === 'track') setActiveTab('track');
  }, [searchParams]);

  // ── My Orders lookup ────────────────────────────────────────────────────────
  const handleOrdersLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch(`${API}/orders/my-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data as MyOrder[]);
        setSearched(email.trim().toLowerCase());
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Track Order ─────────────────────────────────────────────────────────────
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim() || !trackEmail.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await fetch(`${API}/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: trackOrderNumber.trim().toUpperCase(),
          email: trackEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTrackResult(data.data as TrackResult);
      } else {
        setTrackError(data.message || 'Order not found. Please check your details and try again.');
      }
    } catch {
      setTrackError('Network error. Please try again.');
    } finally {
      setTrackLoading(false);
    }
  };

  // Stats
  const stats = orders
    ? {
        total: orders.length,
        pending: orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length,
        shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
        delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
      }
    : null;

  const TAB_CONFIG: { key: PageTab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'track', label: 'Track Parcel', icon: <Truck className="w-4 h-4" /> },
    { key: 'subscriptions', label: 'Subscriptions', icon: <RefreshCcw className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Custom animations */}
      <style>{`
        @keyframes truck-drive {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-1px) translateX(1px); }
          50% { transform: translateY(0) translateX(2px); }
          75% { transform: translateY(-1px) translateX(1px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] pt-32 pb-20 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 text-sm mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 flex items-center justify-center shadow-sm">
                <Package className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] font-heading">
                  My Orders
                </h1>
                <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mt-0.5">
                  Track deliveries, view orders &amp; manage subscriptions
                </p>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-[#f0ebe4] dark:bg-[#2a2018] rounded-xl mb-7 shadow-inner shadow-black/[0.03]">
            {TAB_CONFIG.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-white dark:bg-[#1e1812] text-[#2f1e14] dark:text-[#f5e9dc] shadow-sm'
                    : 'text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc]'
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-xs">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MY ORDERS TAB                                                      */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="animate-[fade-in_0.3s_ease-out]">
              {/* Search form */}
              <form
                onSubmit={handleOrdersLookup}
                className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-6 shadow-sm mb-6"
              >
                <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2.5">
                  Email Address
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8b6a6] dark:text-[#5a4a40]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                      className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="flex items-center gap-2 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-5 rounded-xl transition-all text-sm shrink-0 active:scale-[0.97]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {loading ? 'Searching…' : 'Find Orders'}
                  </button>
                </div>

                {/* Quick links */}
                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-[#aaa] dark:text-[#666]">
                    Looking for a specific order?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('track')}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Truck className="w-3 h-3" />
                      Track by order number
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('subscriptions')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    My Subscriptions
                  </button>
                </div>
              </form>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 mb-6 animate-[fade-in_0.3s_ease-out]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Results */}
              {orders !== null && (
                <div className="animate-[slide-up_0.4s_ease-out]">
                  {/* Stats row */}
                  {stats && orders.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <StatCard
                        icon={<ShoppingBag className="w-4 h-4 text-amber-600" />}
                        label="Total Orders"
                        value={stats.total}
                        accent="bg-amber-50 dark:bg-amber-900/20"
                      />
                      <StatCard
                        icon={<Timer className="w-4 h-4 text-blue-600" />}
                        label="In Progress"
                        value={stats.pending}
                        accent="bg-blue-50 dark:bg-blue-900/20"
                      />
                      <StatCard
                        icon={<Truck className="w-4 h-4 text-teal-600" />}
                        label="Shipped"
                        value={stats.shipped}
                        accent="bg-teal-50 dark:bg-teal-900/20"
                      />
                      <StatCard
                        icon={<PackageCheck className="w-4 h-4 text-emerald-600" />}
                        label="Delivered"
                        value={stats.delivered}
                        accent="bg-emerald-50 dark:bg-emerald-900/20"
                      />
                    </div>
                  )}

                  {/* Results header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                      {orders.length > 0
                        ? `${orders.length} order${orders.length === 1 ? '' : 's'} found`
                        : 'No orders found'}
                    </p>
                    {searched && (
                      <p className="text-xs text-[#aaa] dark:text-[#666] truncate max-w-[200px]">
                        for <span className="font-medium">{searched}</span>
                      </p>
                    )}
                  </div>

                  {/* Empty state */}
                  {orders.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-12 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-amber-50 to-[#faf5ee] dark:from-[#2a211b] dark:to-[#1e1812] rounded-2xl flex items-center justify-center shadow-inner shadow-amber-100/50 dark:shadow-amber-900/10">
                        <ShoppingBag className="w-7 h-7 text-amber-300 dark:text-amber-700" />
                      </div>
                      <h3 className="text-base font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">
                        No orders found
                      </h3>
                      <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mb-6 max-w-sm mx-auto leading-relaxed">
                        We couldn&apos;t find any orders for this email. Make sure you&apos;re using the email you checked out with.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-2 bg-[#2f1e14] dark:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Start Shopping
                        </Link>
                        <button
                          onClick={() => setActiveTab('track')}
                          className="inline-flex items-center gap-2 border border-[#e8e3dc] dark:border-[#2e2420] text-[#2f1e14] dark:text-[#f5e9dc] text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#f5f0eb] dark:hover:bg-[#2a211b] transition-colors"
                        >
                          <Hash className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          Track by Order Number
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, i) => (
                        <div key={order.orderNumber} style={{ animationDelay: `${i * 0.05}s` }} className="animate-[slide-up_0.4s_ease-out_both]">
                          <OrderCard order={order} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TRACK PARCEL TAB                                                   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'track' && (
            <div className="animate-[fade-in_0.3s_ease-out]">
              {/* Track form */}
              <form
                onSubmit={handleTrack}
                className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-6 shadow-sm mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2">
                      Order Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8b6a6] dark:text-[#5a4a40]" />
                      <input
                        type="text"
                        value={trackOrderNumber}
                        onChange={(e) => setTrackOrderNumber(e.target.value)}
                        placeholder="e.g. HD-ABC123-XY12"
                        required
                        className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8b6a6] dark:text-[#5a4a40]" />
                      <input
                        type="email"
                        value={trackEmail}
                        onChange={(e) => setTrackEmail(e.target.value)}
                        placeholder="The email you used at checkout"
                        required
                        className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={trackLoading || !trackOrderNumber.trim() || !trackEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm active:scale-[0.98]"
                >
                  {trackLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Tracking…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Track Order
                    </>
                  )}
                </button>

                {/* Quick link */}
                <p className="mt-4 text-xs text-[#aaa] dark:text-[#666] text-center">
                  Don&apos;t know your order number?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    Search by email instead
                  </button>
                </p>
              </form>

              {/* Error */}
              {trackError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 mb-6 animate-[fade-in_0.3s_ease-out]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {trackError}
                </div>
              )}

              {/* Track result */}
              {trackResult && <TrackResult result={trackResult} />}

              {/* Initial empty state */}
              {!trackResult && !trackLoading && !trackError && (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-[#faf5ee] dark:from-[#2a211b] dark:to-[#1e1812] rounded-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Truck className="w-9 h-9 text-amber-400 dark:text-amber-600" />
                    </div>
                    {/* Animated dots */}
                    <div className="absolute -right-1 top-3 w-2.5 h-2.5 bg-amber-400 rounded-full animate-[pulse-dot_2s_ease-in-out_infinite]" />
                    <div className="absolute -right-3 top-6 w-2 h-2 bg-amber-300 rounded-full animate-[pulse-dot_2s_ease-in-out_infinite_0.5s]" />
                  </div>
                  <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] mb-1">
                    Track your parcel
                  </p>
                  <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] max-w-xs mx-auto">
                    Enter your order number and email above to see real-time delivery status and tracking.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SUBSCRIPTIONS TAB                                                  */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'subscriptions' && (
            <div className="animate-[fade-in_0.3s_ease-out]">
              <MySubscriptions prefillEmail={email || trackEmail || ''} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
