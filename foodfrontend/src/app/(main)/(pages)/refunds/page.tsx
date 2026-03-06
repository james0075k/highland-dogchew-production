"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RotateCcw, CheckCircle, XCircle, Clock, Package,
  Mail, ChevronRight, Shield, Truck, AlertTriangle,
  CreditCard, RefreshCw, HelpCircle, BookOpen,
} from "lucide-react";

const LAST_UPDATED   = "24 February 2026";
const COMPANY_NAME   = "Highland Yak Chew";
const COMPANY_EMAIL  = "info@highlanddogchew.co.uk";
const RETURN_WINDOW  = "14 days";
const REFUND_DAYS    = "5–10 business days";

// ─── Section list ─────────────────────────────────────────────────────────────

interface Section {
  id: string;
  number: string;
  title: string;
  Icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "overview",      number: "01", title: "Overview",                    Icon: BookOpen     },
  { id: "eligibility",   number: "02", title: "What Can Be Returned",        Icon: CheckCircle  },
  { id: "non-eligible",  number: "03", title: "Non-Returnable Items",        Icon: XCircle      },
  { id: "how-to-return", number: "04", title: "How to Request a Return",     Icon: RotateCcw    },
  { id: "process",       number: "05", title: "Return Process & Postage",    Icon: Package      },
  { id: "refund-time",   number: "06", title: "Refund Processing Times",     Icon: Clock        },
  { id: "damaged",       number: "07", title: "Damaged or Incorrect Orders", Icon: AlertTriangle},
  { id: "exchanges",     number: "08", title: "Exchanges",                   Icon: RefreshCw    },
  { id: "delivery",      number: "09", title: "Return Delivery Costs",       Icon: Truck        },
  { id: "payment",       number: "10", title: "Refund to Payment Method",    Icon: CreditCard   },
  { id: "disputes",      number: "11", title: "Disputes & Escalation",       Icon: Shield       },
  { id: "contact",       number: "12", title: "Contact Us",                  Icon: Mail         },
];

// ─── Reusable components (mirrors terms page pattern) ─────────────────────────

function SectionBlock({
  id, number, title, Icon, children,
}: {
  id: string; number: string; title: string;
  Icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28 group">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase block mb-0.5">
            Section {number}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <div className="pl-14 text-[15px] md:text-[16px] leading-relaxed text-[#4a3520] dark:text-[#c8b6a6] space-y-4">
        {children}
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-amber-200/80 dark:from-amber-800/40 via-amber-100/40 dark:via-amber-900/20 to-transparent" />
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 rounded-r-xl px-5 py-4 text-[#3d2512] dark:text-[#e8d5b8]">
      {children}
    </div>
  );
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400 dark:border-emerald-600 rounded-r-xl px-5 py-4 text-emerald-800 dark:text-emerald-200">
      {children}
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded-r-xl px-5 py-4 text-red-800 dark:text-red-200">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CrossList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <XCircle className="mt-0.5 w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center shadow-sm shadow-amber-500/30">
        {number}
      </div>
      <div>
        <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-0.5">{title}</p>
        <p className="text-[14px] text-[#5C4033] dark:text-[#b8a090]">{body}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RefundPolicyPage() {
  const [activeId, setActiveId]   = useState("overview");
  const [tocOpen, setTocOpen]     = useState(false);
  const observerRef               = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f9f5ef] dark:bg-[#150e09] pt-32">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f1e14] via-[#3d2512] to-[#1e1108] py-16 md:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-amber-200/50 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-200/80">Refund Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Returns & Refunds</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Refund Policy
          </h1>
          <p className="text-amber-100/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We want you to be completely happy with your order. If something isn&apos;t right,
            here&apos;s exactly how we handle returns and refunds at{" "}
            <strong className="text-amber-200">{COMPANY_NAME}</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-amber-200/50">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              {RETURN_WINDOW} return window
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Last updated: {LAST_UPDATED}
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Refunds in {REFUND_DAYS}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">

          {/* ── Desktop sidebar TOC ─────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100 dark:border-[#3a2c23] shadow-md p-5 overflow-hidden">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500 mb-4">
                Contents
              </p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, number, title, Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ${
                      activeId === id
                        ? "bg-amber-500 text-white font-semibold shadow-sm"
                        : "text-[#5C4033] dark:text-[#c8b6a6] hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${activeId === id ? "text-white" : "text-amber-500 dark:text-amber-400"}`} />
                    <span className="truncate">{number}. {title}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-5 pt-5 border-t border-amber-100 dark:border-[#3a2c23]">
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email us about a return
                </a>
              </div>
            </div>
          </aside>

          {/* ── Mobile TOC toggle ───────────────────────────────────── */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between gap-3 bg-white dark:bg-[#1e1510] border border-amber-100 dark:border-[#3a2c23] rounded-xl px-5 py-3.5 shadow-sm"
            >
              <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Table of Contents
              </span>
              <ChevronRight className={`w-4 h-4 text-amber-500 transition-transform duration-200 ${tocOpen ? "rotate-90" : ""}`} />
            </button>
            {tocOpen && (
              <div className="mt-2 bg-white dark:bg-[#1e1510] border border-amber-100 dark:border-[#3a2c23] rounded-xl shadow-md p-3">
                {SECTIONS.map(({ id, number, title, Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-[#5C4033] dark:text-[#c8b6a6]">{number}. {title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Main content ────────────────────────────────────────── */}
          <article className="space-y-12">

            {/* Quick summary card */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Clock,       label: "Return Window",    value: RETURN_WINDOW,      color: "amber"   },
                { icon: CreditCard,  label: "Refund Timeline",  value: REFUND_DAYS,        color: "emerald" },
                { icon: Mail,        label: "Start a Return",   value: "Email us",         color: "blue"    },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`bg-white dark:bg-[#1e1510] rounded-2xl border border-${color}-100 dark:border-[#3a2c23] p-5 text-center shadow-sm`}>
                  <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-5 h-5 text-${color}-500`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-base font-bold text-[#2f1e14] dark:text-[#f5e9dc]">{value}</p>
                </div>
              ))}
            </div>

            {/* ── Section 01 ── */}
            <SectionBlock id="overview" number="01" title="Overview" Icon={BookOpen}>
              <p>
                At <strong>{COMPANY_NAME}</strong> we stand behind every product we sell. If you are not
                completely satisfied with your purchase, we will do our best to make it right —
                subject to the conditions set out in this policy.
              </p>
              <SuccessBox>
                <strong>14-day return window.</strong> You have <strong>{RETURN_WINDOW}</strong> from
                the date of delivery to request a return on eligible items.
              </SuccessBox>
              <p>
                This policy applies to all orders placed on{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">highlanddogchew.co.uk</span>{" "}
                and is in addition to your statutory rights under the UK Consumer Rights Act 2015
                and the Consumer Contracts Regulations 2013.
              </p>
            </SectionBlock>

            {/* ── Section 02 ── */}
            <SectionBlock id="eligibility" number="02" title="What Can Be Returned" Icon={CheckCircle}>
              <p>We accept returns on the following:</p>
              <CheckList items={[
                "Unopened products in their original, undamaged packaging.",
                "Items returned within 14 days of the delivery date.",
                "Products that have not been used or tampered with.",
                "Items with all original tags and seals intact.",
                "Gift orders — provided the above conditions are met (a gift receipt or order number is required).",
              ]} />
              <Highlight>
                All returned items are inspected upon receipt. We reserve the right to decline a
                refund if the product does not meet the conditions above.
              </Highlight>
            </SectionBlock>

            {/* ── Section 03 ── */}
            <SectionBlock id="non-eligible" number="03" title="Non-Returnable Items" Icon={XCircle}>
              <p>
                For hygiene and safety reasons, the following items <strong>cannot</strong> be returned
                or refunded:
              </p>
              <WarningBox>
                <strong>Opened or used products</strong> cannot be accepted back under any
                circumstances, including if only partially consumed.
              </WarningBox>
              <CrossList items={[
                "Opened or used chew products.",
                "Items without original packaging or with broken seals.",
                "Products returned after the 14-day window without prior agreement.",
                "Items damaged due to misuse, negligence, or failure to follow care instructions.",
                "Personalised or custom orders.",
                "Items on final sale or marked as non-returnable at purchase.",
              ]} />
            </SectionBlock>

            {/* ── Section 04 ── */}
            <SectionBlock id="how-to-return" number="04" title="How to Request a Return" Icon={RotateCcw}>
              <p>
                Do <strong>not</strong> send items back without first contacting us — unauthorised
                returns cannot be processed.
              </p>
              <div className="space-y-5 pt-1">
                <Step number="1" title="Email us within 14 days of delivery"
                  body={`Send an email to ${COMPANY_EMAIL} with the subject line "Return Request — Order #[your order number]".`} />
                <Step number="2" title="Include the following details"
                  body="Your full name, order number, the item(s) you wish to return, and the reason for the return. Photos are required for damaged or incorrect items." />
                <Step number="3" title="Wait for our confirmation"
                  body="We will respond within 2 business days with a Return Merchandise Authorisation (RMA) number and return instructions." />
                <Step number="4" title="Pack and post the item"
                  body="Securely pack the item in its original packaging and include your RMA number inside the parcel. Post to the address provided in our confirmation email." />
                <Step number="5" title="Refund issued"
                  body={`Once we receive and inspect the item, your refund will be processed within ${REFUND_DAYS}.`} />
              </div>
              <Highlight>
                To start a return, email{" "}
                <a href={`mailto:${COMPANY_EMAIL}`} className="underline text-amber-700 dark:text-amber-400 font-medium">
                  {COMPANY_EMAIL}
                </a>{" "}
                — include your order number and reason for return.
              </Highlight>
            </SectionBlock>

            {/* ── Section 05 ── */}
            <SectionBlock id="process" number="05" title="Return Process & Postage" Icon={Package}>
              <BulletList items={[
                "Do not return any item without receiving an RMA number from us first.",
                "Package items securely to prevent damage in transit — we cannot refund items damaged during return shipping.",
                "We recommend using a tracked and insured postal service for all returns.",
                "Write your RMA number clearly on the outside of the parcel.",
                "Keep proof of postage until your refund has been confirmed.",
                "Items lost in transit during return are the customer's responsibility unless we provided the return label.",
              ]} />
            </SectionBlock>

            {/* ── Section 06 ── */}
            <SectionBlock id="refund-time" number="06" title="Refund Processing Times" Icon={Clock}>
              <p>
                Once we receive your returned item and confirm it meets our return conditions,
                we will process your refund promptly.
              </p>
              <div className="bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100 dark:border-[#3a2c23] overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-[#3a2c23]">
                      <th className="px-5 py-3 text-left text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Stage</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50 dark:divide-[#2a1e16]">
                    {[
                      ["Return item received by us",          "1–2 business days after delivery to us"],
                      ["Item inspection & approval",           "1–2 business days"],
                      ["Refund initiated to your bank/card",  "1 business day after approval"],
                      ["Funds appear in your account",        "3–5 business days (bank-dependent)"],
                      ["Total estimated timeframe",           `${REFUND_DAYS} from receipt of return`],
                    ].map(([stage, time], i) => (
                      <tr key={i} className={i === 4 ? "bg-emerald-50 dark:bg-emerald-900/10 font-semibold" : ""}>
                        <td className="px-5 py-3 text-[#4a3520] dark:text-[#c8b6a6]">{stage}</td>
                        <td className="px-5 py-3 text-[#2f1e14] dark:text-[#f5e9dc]">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Refunds are issued to the <strong>original payment method</strong> used at checkout.
                We cannot redirect refunds to a different card or account.
              </p>
            </SectionBlock>

            {/* ── Section 07 ── */}
            <SectionBlock id="damaged" number="07" title="Damaged or Incorrect Orders" Icon={AlertTriangle}>
              <WarningBox>
                If your order arrives damaged or you receive the wrong item, please contact us
                within <strong>48 hours of delivery</strong> with photographic evidence.
              </WarningBox>
              <p>
                We will arrange a replacement or full refund at no extra cost to you, including
                return postage where applicable. Claims made after 48 hours may not be accepted.
              </p>
              <BulletList items={[
                "Email us at info@highlanddogchew.co.uk with clear photos of the damage or incorrect item.",
                "Include your order number and a brief description of the issue.",
                "Do not dispose of the damaged item until we have reviewed your case.",
                "We will confirm the resolution — replacement or refund — within 2 business days.",
                "If a replacement is chosen and the original product is out of stock, a full refund will be issued instead.",
              ]} />
            </SectionBlock>

            {/* ── Section 08 ── */}
            <SectionBlock id="exchanges" number="08" title="Exchanges" Icon={RefreshCw}>
              <p>
                We do not offer direct exchanges. If you would like a different product, size,
                or variant, please:
              </p>
              <BulletList items={[
                "Return the unwanted item following the standard return process (if eligible).",
                "Place a new order for the item you want via our website.",
                "This ensures you receive your new item as quickly as possible without waiting for the return to be processed.",
              ]} />
              <p>
                If you received a damaged or incorrect item we will send a direct replacement
                free of charge — see Section 07.
              </p>
            </SectionBlock>

            {/* ── Section 09 ── */}
            <SectionBlock id="delivery" number="09" title="Return Delivery Costs" Icon={Truck}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 p-5">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">We Cover Return Postage</p>
                  <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Faulty or defective products</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Incorrect items sent by us</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Items damaged in transit to you</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 p-5">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">Customer Covers Return Postage</p>
                  <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                    <li className="flex gap-2"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Changed mind / no longer wanted</li>
                    <li className="flex gap-2"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Ordered the wrong product</li>
                    <li className="flex gap-2"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> General change of preference</li>
                  </ul>
                </div>
              </div>
              <p>
                Original delivery charges are non-refundable unless the entire order was faulty
                or incorrect.
              </p>
            </SectionBlock>

            {/* ── Section 10 ── */}
            <SectionBlock id="payment" number="10" title="Refund to Payment Method" Icon={CreditCard}>
              <BulletList items={[
                "Refunds are always issued to the original payment method used at checkout.",
                "We cannot transfer refunds to a different card, bank account, or payment method.",
                "If your card has expired or been replaced since purchase, your bank will typically reroute the refund — contact your bank if you do not receive it.",
                "Store credit or gift card refunds are issued as a code by email if requested.",
                "Partial refunds may be issued for orders where only some items are returned.",
                "Original shipping fees are refunded only when the fault lies with us (incorrect or damaged goods).",
              ]} />
            </SectionBlock>

            {/* ── Section 11 ── */}
            <SectionBlock id="disputes" number="11" title="Disputes & Escalation" Icon={Shield}>
              <p>
                We aim to resolve all return and refund requests fairly and promptly. If you are
                unhappy with our response, you have the following options:
              </p>
              <BulletList items={[
                "Contact us again and ask to escalate your case — we will review it at a senior level.",
                "If you paid by credit or debit card, you may be entitled to raise a chargeback with your card issuer under Section 75 of the Consumer Credit Act or Visa/Mastercard chargeback rules.",
                "You may contact the Citizens Advice consumer service on 0808 223 1133 (UK).",
                "For online purchases, you may also use the EU/UK Online Dispute Resolution (ODR) platform.",
                "Our statutory obligations under the UK Consumer Rights Act 2015 are unaffected by this policy.",
              ]} />
              <Highlight>
                We are committed to resolving all disputes quickly and fairly. Please contact us
                before escalating to a third party — most issues are resolved within 48 hours.
              </Highlight>
            </SectionBlock>

            {/* ── Section 12 ── */}
            <SectionBlock id="contact" number="12" title="Contact Us" Icon={Mail}>
              <p>
                For any questions about returns, refunds, or your order, please reach out:
              </p>
              <div className="bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100 dark:border-[#3a2c23] p-6 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                    <a
                      href={`mailto:${COMPANY_EMAIL}`}
                      className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                    >
                      {COMPANY_EMAIL}
                    </a>
                  </div>
                </div>
                <div className="border-t border-amber-50 dark:border-[#2a1e16] pt-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Response Time</p>
                    <p className="text-[#4a3520] dark:text-[#c8b6a6] font-medium">Within 2 business days</p>
                  </div>
                </div>
                <div className="border-t border-amber-50 dark:border-[#2a1e16] pt-4 flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Include in Your Email</p>
                    <p className="text-[#4a3520] dark:text-[#c8b6a6]">Order number · Item name · Reason for return · Photos (if damaged)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <a
                  href={`mailto:${COMPANY_EMAIL}?subject=Return Request — Order #`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start a Return Request
                </a>
              </div>
            </SectionBlock>

            {/* ── Footer note ── */}
            <div className="rounded-2xl bg-gradient-to-br from-[#2f1e14] to-[#1e1108] p-8 text-center text-sm text-amber-100/60">
              <RotateCcw className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="max-w-xl mx-auto leading-relaxed">
                Your satisfaction is our priority. If something isn&apos;t right with your order,
                we&apos;re here to help. This policy is governed by the laws of{" "}
                <strong className="text-amber-300">England &amp; Wales</strong> and is in addition
                to your statutory consumer rights.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-5">
                <Link href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Contact Us</Link>
                <span className="text-amber-800">·</span>
                <Link href="/about/terms" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Terms & Conditions</Link>
                <span className="text-amber-800">·</span>
                <Link href="/about" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">About Us</Link>
              </div>
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
