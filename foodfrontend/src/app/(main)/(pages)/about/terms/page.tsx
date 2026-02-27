"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield, ShoppingBag, Truck, RotateCcw, CreditCard, Lock,
  AlertTriangle, BookOpen, Mail, ChevronRight, Dog, FileText,
} from "lucide-react";

const LAST_UPDATED = "24 February 2026";
const COMPANY_NAME = "Highland Dog Chew";
const COMPANY_EMAIL = "info@highlanddogchew.co.uk";
const COMPANY_WEBSITE = "highlanddogchew.co.uk";

interface Section {
  id: string;
  number: string;
  title: string;
  Icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "general",       number: "01", title: "General Information",       Icon: BookOpen },
  { id: "products",      number: "02", title: "Product Information",        Icon: Dog },
  { id: "safety",        number: "03", title: "Dog Safety & Disclaimer",    Icon: AlertTriangle },
  { id: "orders",        number: "04", title: "Orders & Payments",          Icon: CreditCard },
  { id: "shipping",      number: "05", title: "Shipping & Delivery",        Icon: Truck },
  { id: "returns",       number: "06", title: "Returns & Refunds",          Icon: RotateCcw },
  { id: "products-sale", number: "07", title: "Products for Sale",          Icon: ShoppingBag },
  { id: "ip",            number: "08", title: "Intellectual Property",      Icon: Shield },
  { id: "liability",     number: "09", title: "Limitation of Liability",    Icon: Lock },
  { id: "privacy",       number: "10", title: "Privacy & Data",             Icon: Shield },
  { id: "changes",       number: "11", title: "Changes to These Terms",     Icon: FileText },
  { id: "contact",       number: "12", title: "Contact Us",                 Icon: Mail },
];

function SectionBlock({
  id, number, title, Icon, children,
}: { id: string; number: string; title: string; Icon: React.ElementType; children: React.ReactNode }) {
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

export default function TermsAndConditions() {
  const [activeId, setActiveId] = useState("general");
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
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

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f1e14] via-[#3d2512] to-[#1e1108] py-16 md:py-20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-amber-200/50 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-200/80">Terms & Conditions</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Legal Agreement</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-amber-100/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using our website or purchasing
            any products from <strong className="text-amber-200">{COMPANY_NAME}</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-amber-200/50">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Last updated: {LAST_UPDATED}
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Governed by UK Law
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">

          {/* ── Desktop sidebar TOC ────────────────────────────────── */}
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
                  Questions? Email us
                </a>
              </div>
            </div>
          </aside>

          {/* ── Mobile TOC toggle ──────────────────────────────────── */}
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

          {/* ── Main content ──────────────────────────────────────── */}
          <article className="space-y-12">

            {/* Intro notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <p className="text-[#3d2512] dark:text-[#e8d5b8] text-[15px] leading-relaxed">
                These Terms & Conditions govern your use of <strong>{COMPANY_WEBSITE}</strong> and any
                purchase of products from <strong>{COMPANY_NAME}</strong>. By accessing our website or
                placing an order you confirm that you have read, understood, and agree to be bound by
                these terms. If you do not agree, please do not use our website.
              </p>
            </div>

            {/* ── Section 01 ── */}
            <SectionBlock id="general" number="01" title="General Information" Icon={BookOpen}>
              <p>
                {COMPANY_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">{COMPANY_WEBSITE}</span>.
                We are a UK-based company specialising in premium, natural Himalayan yak and cow milk dog chews.
              </p>
              <p>
                These terms apply to all visitors, customers, and users of our website. Your continued use
                of the website constitutes your agreement to these terms and any future revisions.
              </p>
            </SectionBlock>

            {/* ── Section 02 ── */}
            <SectionBlock id="products" number="02" title="Product Information" Icon={Dog}>
              <p>
                Our dog chews are crafted from natural yak and cow milk using traditional Himalayan
                methods. Because they are a natural product, variations in size, shape, colour, and
                texture are entirely normal and do not indicate a defect.
              </p>
              <BulletList items={[
                "All products are grain-free, gluten-free, and free from artificial additives.",
                "Weights and dimensions listed are approximate.",
                "Product images are for illustration purposes; actual items may differ slightly.",
                "We strive to keep product descriptions accurate, but we do not guarantee that descriptions are error-free.",
              ]} />
            </SectionBlock>

            {/* ── Section 03 ── */}
            <SectionBlock id="safety" number="03" title="Dog Safety & Disclaimer" Icon={AlertTriangle}>
              <Highlight>
                <strong>Always supervise your dog while chewing.</strong> Remove small pieces
                to prevent choking. Consult your vet if your dog has dietary restrictions.
              </Highlight>
              <BulletList items={[
                "Products are intended for dogs only and are not for human consumption.",
                "Not recommended for puppies under 4 months of age.",
                "Do not give to dogs with known dairy or milk allergies.",
                "Remove and discard pieces small enough to swallow whole.",
                "Ensure your dog has access to fresh water at all times.",
                "Highland Dog Chew is not liable for any injury or adverse reaction resulting from unsupervised use or failure to follow these guidelines.",
                "If your dog shows signs of distress after chewing, discontinue use and consult a veterinarian immediately.",
              ]} />
            </SectionBlock>

            {/* ── Section 04 ── */}
            <SectionBlock id="orders" number="04" title="Orders & Payments" Icon={CreditCard}>
              <p>
                All prices are displayed in <strong>Great British Pounds (GBP)</strong> and include VAT
                where applicable. Prices are subject to change without prior notice.
              </p>
              <BulletList items={[
                "An order is not confirmed until payment has been successfully processed.",
                "We accept major credit/debit cards and other payment methods displayed at checkout.",
                "We reserve the right to cancel any order due to pricing errors, stock unavailability, or suspected fraudulent activity.",
                "You will receive an order confirmation email once payment is accepted.",
                "We do not store full payment card details on our servers.",
              ]} />
            </SectionBlock>

            {/* ── Section 05 ── */}
            <SectionBlock id="shipping" number="05" title="Shipping & Delivery" Icon={Truck}>
              <p>
                We aim to dispatch all orders within <strong>1–2 business days</strong>, excluding UK bank
                holidays and weekends.
              </p>
              <BulletList items={[
                "Shipping costs and estimated delivery times are shown at checkout.",
                "We ship to UK addresses and select international destinations.",
                "International customers are solely responsible for any customs duties, import taxes, or additional fees.",
                "We are not liable for delays caused by carriers, customs, or circumstances beyond our control.",
                "Risk of loss passes to you upon delivery to the carrier.",
              ]} />
            </SectionBlock>

            {/* ── Section 06 ── */}
            <SectionBlock id="returns" number="06" title="Returns & Refunds" Icon={RotateCcw}>
              <p>
                Your satisfaction matters to us. Due to hygiene and safety reasons, we are unable to
                accept returns of opened or used chew products.
              </p>
              <BulletList items={[
                "Unopened, undamaged products may be returned within 14 days of receipt.",
                "If your order arrives damaged or incorrect, contact us within 48 hours with photographic evidence.",
                "Refunds are processed to the original payment method within 5–10 business days of approval.",
                "Return postage costs are the customer's responsibility unless the item is faulty.",
                "We reserve the right to refuse a refund if the product has been used or tampered with.",
              ]} />
              <Highlight>
                To initiate a return, email us at{" "}
                <a href={`mailto:${COMPANY_EMAIL}`} className="underline text-amber-700 dark:text-amber-400 font-medium">
                  {COMPANY_EMAIL}
                </a>{" "}
                with your order number and reason.
              </Highlight>
            </SectionBlock>

            {/* ── Section 07 ── */}
            <SectionBlock id="products-sale" number="07" title="Products for Sale" Icon={ShoppingBag}>
              <p>
                All products listed on our website are subject to availability. We reserve the right to
                discontinue any product at any time.
              </p>
              <BulletList items={[
                "Promotional discounts and offers are valid only for the specified period and cannot be applied retrospectively.",
                "Bundle offers are subject to stock availability.",
                "We reserve the right to limit the quantity of items purchased per customer.",
                "Subscription or repeat-order offers are governed by their own specific terms, available at the point of purchase.",
              ]} />
            </SectionBlock>

            {/* ── Section 08 ── */}
            <SectionBlock id="ip" number="08" title="Intellectual Property" Icon={Shield}>
              <p>
                All content on this website — including but not limited to text, photography, logos,
                branding, product descriptions, and design — is the exclusive property of{" "}
                <strong>{COMPANY_NAME}</strong> or its licensors.
              </p>
              <BulletList items={[
                "You may not copy, reproduce, republish, upload, post, transmit, or distribute any content without prior written permission.",
                "Unauthorised use of our trademarks or branding is strictly prohibited.",
                "User-generated content submitted to us (e.g. reviews, photos) may be used by us for marketing purposes.",
              ]} />
            </SectionBlock>

            {/* ── Section 09 ── */}
            <SectionBlock id="liability" number="09" title="Limitation of Liability" Icon={Lock}>
              <p>
                To the fullest extent permitted by applicable UK law, {COMPANY_NAME} shall not be liable for:
              </p>
              <BulletList items={[
                "Any indirect, incidental, special, or consequential damages arising from the use of our products or website.",
                "Loss of profits, revenue, data, or goodwill.",
                "Injury to animals resulting from unsupervised or improper use of our products.",
                "Errors, inaccuracies, or interruptions on the website.",
              ]} />
              <p>
                Our total liability for any claim shall not exceed the amount paid by you for the relevant
                product(s). Nothing in these terms limits our liability for death, personal injury, or
                fraud caused by our negligence.
              </p>
            </SectionBlock>

            {/* ── Section 10 ── */}
            <SectionBlock id="privacy" number="10" title="Privacy & Data" Icon={Shield}>
              <p>
                We take your privacy seriously. Personal data you provide when making a purchase or
                contacting us is handled in accordance with our Privacy Policy and the UK GDPR.
              </p>
              <BulletList items={[
                "We do not sell your personal data to third parties.",
                "Data is used only to process orders, improve our services, and communicate with you.",
                "You can request access to, correction of, or deletion of your data at any time.",
                "By subscribing to our newsletter you consent to receiving marketing emails. You may unsubscribe at any time.",
              ]} />
            </SectionBlock>

            {/* ── Section 11 ── */}
            <SectionBlock id="changes" number="11" title="Changes to These Terms" Icon={FileText}>
              <p>
                We reserve the right to update or amend these Terms & Conditions at any time. The date
                at the top of this page reflects the most recent revision.
              </p>
              <p>
                Continued use of our website or purchase of products after changes are posted constitutes
                your acceptance of the revised terms. We encourage you to review this page periodically.
              </p>
            </SectionBlock>

            {/* ── Section 12 ── */}
            <SectionBlock id="contact" number="12" title="Contact Us" Icon={Mail}>
              <p>
                If you have any questions, concerns, or feedback regarding these Terms & Conditions,
                please get in touch:
              </p>
              <div className="bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100 dark:border-[#3a2c23] p-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
                  >
                    {COMPANY_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Dog className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-[#4a3520] dark:text-[#c8b6a6]">{COMPANY_NAME} — Premium Himalayan Dog Chews</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-[#4a3520] dark:text-[#c8b6a6]">Governed by the laws of England & Wales</span>
                </div>
              </div>
            </SectionBlock>

            {/* ── Footer note ── */}
            <div className="rounded-2xl bg-gradient-to-br from-[#2f1e14] to-[#1e1108] p-8 text-center text-sm text-amber-100/60">
              <Dog className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="max-w-xl mx-auto leading-relaxed">
                Thank you for choosing <strong className="text-amber-300">{COMPANY_NAME}</strong>. We&apos;re
                committed to providing safe, natural, and premium dog chews that your pets will love.
                If anything in these terms is unclear, please don&apos;t hesitate to reach out.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-5">
                <Link href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Contact Us</Link>
                <span className="text-amber-800">·</span>
                <Link href="/refunds" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Refund Policy</Link>
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
