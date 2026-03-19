"use client";
import { Truck, Clock, MapPin, Package, AlertTriangle, Mail, RefreshCw, CreditCard, Shield, Gift } from "lucide-react";
import Link from "next/link";

const LAST_UPDATED  = "19 March 2026";
const COMPANY_EMAIL = "hello@highlanddogchew.co.uk";

const shippingOptions = [
  { name: "Standard UK Delivery", time: "3–5 business days", cost: "£2.99", note: "Free on orders over £30" },
  { name: "Express UK Delivery",  time: "1–2 business days", cost: "£5.99", note: "Order before 1 PM" },
  { name: "Next Day Delivery",    time: "Next business day",  cost: "£7.99", note: "Order before 12 PM Mon–Thu" },
];

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1f1812] rounded-2xl border border-[#2E1F14]/10 dark:border-[#3a2c23] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F4EDE4] dark:bg-[#241b16] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#C4A882] dark:text-amber-500" />
        </div>
        <h2 className="text-base font-bold text-[#2E1F14] dark:text-[#f5e9dc]">{title}</h2>
      </div>
      <div className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FDFAF6] dark:bg-[#1a1209]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F4EDE4] to-[#FDFAF6] dark:from-[#1f1812] dark:to-[#1a1209] border-b border-[#2E1F14]/10 dark:border-[#3a2c23]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">Delivery</p>
          <h1 className="text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-3">Shipping Policy</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Shipping options table */}
        <section>
          <h2 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-5">UK Delivery Options</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#2E1F14]/10 dark:border-[#3a2c23]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4EDE4] dark:bg-[#241b16]">
                  <th className="px-5 py-3.5 text-left font-bold text-[#2E1F14] dark:text-[#f5e9dc]">Service</th>
                  <th className="px-5 py-3.5 text-left font-bold text-[#2E1F14] dark:text-[#f5e9dc]">Estimated Time</th>
                  <th className="px-5 py-3.5 text-left font-bold text-[#2E1F14] dark:text-[#f5e9dc]">Cost</th>
                  <th className="px-5 py-3.5 text-left font-bold text-[#2E1F14] dark:text-[#f5e9dc]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {shippingOptions.map((opt, i) => (
                  <tr key={i} className={`border-t border-[#2E1F14]/10 dark:border-[#3a2c23] ${i % 2 === 0 ? "bg-white dark:bg-[#1f1812]" : "bg-[#FDFAF6] dark:bg-[#1a1209]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#2E1F14] dark:text-[#f5e9dc]">{opt.name}</td>
                    <td className="px-5 py-3.5 text-[#7A5C4F] dark:text-[#c8b6a6]">{opt.time}</td>
                    <td className="px-5 py-3.5 text-[#7A5C4F] dark:text-[#c8b6a6] font-semibold">{opt.cost}</td>
                    <td className="px-5 py-3.5 text-[#7A5C4F] dark:text-[#c8b6a6]">{opt.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] pl-1">
            * Delivery times are estimates and may vary during peak periods (Christmas, Bank Holidays).
          </p>
        </section>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Card icon={Clock} title="Order Processing">
            <p>Orders placed before <strong>1 PM (Monday–Friday)</strong> are processed the same day.</p>
            <p>Orders placed after 1 PM, or on weekends/bank holidays, are processed the next business day.</p>
            <p>You will receive a confirmation email once your order has been dispatched.</p>
          </Card>

          <Card icon={Package} title="Tracking Your Order">
            <p>Once dispatched, you will receive an email with your tracking number and courier details.</p>
            <p>You can track your order on our <Link href="/track-order" className="underline text-[#8B5E3C] dark:text-amber-400">Track Order</Link> page or directly on the courier's website.</p>
            <p>Tracking updates may take up to 24 hours to appear after dispatch.</p>
          </Card>

          <Card icon={MapPin} title="Delivery Address">
            <p>Please ensure your delivery address is correct at checkout. We are unable to redirect parcels once dispatched.</p>
            <p>We currently ship to <strong>Great Britain and Northern Ireland</strong>. For Scottish Highlands, islands, and remote areas, please allow an additional 1–2 business days.</p>
          </Card>

          <Card icon={Gift} title="Free Delivery">
            <p>Enjoy <strong>free standard delivery</strong> on all orders over <strong>£30</strong>.</p>
            <p>The free delivery threshold is applied automatically at checkout — no code needed.</p>
          </Card>

          <Card icon={AlertTriangle} title="Failed Deliveries">
            <p>If you are not home, the courier will attempt redelivery or leave your parcel with a neighbour/in a safe place.</p>
            <p>If delivery fails after multiple attempts, the parcel will be returned to us. We will contact you to arrange redelivery (additional shipping charge may apply).</p>
          </Card>

          <Card icon={RefreshCw} title="Lost or Damaged Parcels">
            <p>If your order has not arrived within <strong>7 business days</strong> of the expected delivery date, please contact us.</p>
            <p>For damaged deliveries, please retain all packaging and contact us within <strong>48 hours</strong> of receipt with photos.</p>
            <p>Email: <a href={`mailto:${COMPANY_EMAIL}`} className="underline text-[#8B5E3C] dark:text-amber-400">{COMPANY_EMAIL}</a></p>
          </Card>

          <Card icon={Shield} title="Packaging">
            <p>All orders are packed securely to protect your chews during transit. We use <strong>eco-friendly packaging</strong> wherever possible.</p>
            <p>Chews are individually wrapped and sealed to maintain freshness and hygiene.</p>
          </Card>

          <Card icon={Mail} title="Contact Us">
            <p>For any shipping queries, please don't hesitate to get in touch:</p>
            <p className="mt-1">
              <a href={`mailto:${COMPANY_EMAIL}`} className="underline text-[#8B5E3C] dark:text-amber-400">{COMPANY_EMAIL}</a>
            </p>
            <p className="mt-1">
              <Link href="/contact" className="underline text-[#8B5E3C] dark:text-amber-400">Contact Form</Link>
            </p>
          </Card>
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#2E1F14]/10 dark:border-[#3a2c23]">
          <Link href="/refunds" className="text-sm text-[#8B5E3C] dark:text-amber-400 underline underline-offset-2">Refund & Returns Policy</Link>
          <span className="text-[#7A5C4F]/40">·</span>
          <Link href="/track-order" className="text-sm text-[#8B5E3C] dark:text-amber-400 underline underline-offset-2">Track Your Order</Link>
          <span className="text-[#7A5C4F]/40">·</span>
          <Link href="/contact" className="text-sm text-[#8B5E3C] dark:text-amber-400 underline underline-offset-2">Contact Us</Link>
        </div>
      </div>
    </main>
  );
}
