"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, Eye, Database, Lock, Mail, UserCheck, Globe, Trash2, RefreshCw, Phone, FileText, Cookie } from "lucide-react";

const LAST_UPDATED  = "19 March 2026";
const COMPANY_NAME  = "Highland Yak Chew";
const COMPANY_EMAIL = "hello@highlanddogchew.co.uk";
const COMPANY_URL   = "https://highlanddogchew.co.uk";

const SECTIONS = [
  { id: "overview",       number: "01", title: "Who We Are",                    Icon: Shield      },
  { id: "data-collect",   number: "02", title: "Data We Collect",               Icon: Database    },
  { id: "how-we-use",     number: "03", title: "How We Use Your Data",          Icon: Eye         },
  { id: "legal-basis",    number: "04", title: "Legal Basis for Processing",    Icon: FileText    },
  { id: "sharing",        number: "05", title: "Sharing Your Data",             Icon: Globe       },
  { id: "cookies",        number: "06", title: "Cookies & Tracking",            Icon: Cookie      },
  { id: "retention",      number: "07", title: "How Long We Keep Data",         Icon: RefreshCw   },
  { id: "your-rights",    number: "08", title: "Your Rights",                   Icon: UserCheck   },
  { id: "security",       number: "09", title: "Data Security",                 Icon: Lock        },
  { id: "third-party",    number: "10", title: "Third-Party Links",             Icon: Globe       },
  { id: "children",       number: "11", title: "Children's Privacy",            Icon: Shield      },
  { id: "changes",        number: "12", title: "Changes to This Policy",        Icon: RefreshCw   },
  { id: "contact",        number: "13", title: "Contact & Complaints",          Icon: Mail        },
];

function SectionBlock({ id, number, title, Icon, children }: { id: string; number: string; title: string; Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 group">
      <div className="flex items-start gap-5 mb-5">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F4EDE4] dark:bg-[#241b16] flex items-center justify-center group-hover:bg-[#2E1F14] dark:group-hover:bg-amber-700 transition-colors duration-300">
          <Icon className="w-5 h-5 text-[#C4A882] dark:text-amber-500 group-hover:text-white transition-colors duration-300" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#C4A882] dark:text-amber-500 uppercase tracking-widest mb-0.5">{number}</p>
          <h2 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc]">{title}</h2>
        </div>
      </div>
      <div className="ml-16 text-[#7A5C4F] dark:text-[#c8b6a6] text-sm leading-relaxed space-y-3">{children}</div>
      <div className="mt-8 h-px bg-gradient-to-r from-[#2E1F14]/10 to-transparent dark:from-[#3a2c23]" />
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [active, setActive] = useState("overview");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });
    return () => observer.current?.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFAF6] dark:bg-[#1a1209]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F4EDE4] to-[#FDFAF6] dark:from-[#1f1812] dark:to-[#1a1209] border-b border-[#2E1F14]/10 dark:border-[#3a2c23]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-3">Privacy Policy</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective immediately</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-[#1f1812] rounded-2xl border border-[#2E1F14]/10 dark:border-[#3a2c23] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4A882] dark:text-amber-500 mb-4">Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map(({ id, number, title }) => (
                <a key={id} href={`#${id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${active === id ? "bg-[#2E1F14] text-white" : "text-[#7A5C4F] dark:text-[#c8b6a6] hover:bg-[#F4EDE4] dark:hover:bg-[#241b16]"}`}>
                  <span className="font-bold opacity-60">{number}</span>
                  <span>{title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-10 max-w-3xl">
          <SectionBlock id="overview" number="01" title="Who We Are" Icon={Shield}>
            <p>{COMPANY_NAME} ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") operates the website <a href={COMPANY_URL} className="underline text-[#8B5E3C] dark:text-amber-400">{COMPANY_URL}</a>. We are the data controller responsible for your personal data collected through this website.</p>
            <p>This Privacy Policy explains what data we collect, why we collect it, and your rights under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
          </SectionBlock>

          <SectionBlock id="data-collect" number="02" title="Data We Collect" Icon={Database}>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Identity data:</strong> first name, last name</li>
              <li><strong>Contact data:</strong> email address, phone number, postal address</li>
              <li><strong>Transaction data:</strong> order history, payment references (we do not store card numbers)</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information, pages visited</li>
              <li><strong>Marketing data:</strong> your preferences for receiving marketing from us</li>
              <li><strong>Communications:</strong> any messages you send us via email or our contact form</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="how-we-use" number="03" title="How We Use Your Data" Icon={Eye}>
            <ul className="list-disc ml-4 space-y-1.5">
              <li>Processing and fulfilling your orders</li>
              <li>Sending order confirmations and shipping updates</li>
              <li>Responding to enquiries and customer support requests</li>
              <li>Sending marketing emails (only where you have opted in)</li>
              <li>Improving our website and customer experience</li>
              <li>Complying with legal and regulatory obligations</li>
              <li>Fraud prevention and security</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="legal-basis" number="04" title="Legal Basis for Processing" Icon={FileText}>
            <p>Under UK GDPR, we process your data on the following legal bases:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Contract:</strong> to fulfil orders you have placed with us</li>
              <li><strong>Legitimate interests:</strong> fraud prevention, website security, analytics</li>
              <li><strong>Consent:</strong> for marketing emails — you may withdraw consent at any time</li>
              <li><strong>Legal obligation:</strong> for accounting, tax records, and legal compliance</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="sharing" number="05" title="Sharing Your Data" Icon={Globe}>
            <p>We do not sell your personal data. We share it only with:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Stripe:</strong> payment processing — governed by Stripe's Privacy Policy</li>
              <li><strong>Delivery couriers</strong> (e.g. Royal Mail, Evri): to fulfil your order</li>
              <li><strong>Email service providers:</strong> for transactional and marketing emails</li>
              <li><strong>Analytics providers:</strong> aggregated, anonymised usage data</li>
              <li><strong>Legal authorities:</strong> if required by law or to protect our rights</li>
            </ul>
            <p>All third-party processors are bound by data processing agreements and handle your data only on our instructions.</p>
          </SectionBlock>

          <SectionBlock id="cookies" number="06" title="Cookies & Tracking" Icon={Cookie}>
            <p>We use cookies to improve your experience. Types of cookies we use:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Essential cookies:</strong> required for the site to function (cart, session)</li>
              <li><strong>Analytics cookies:</strong> help us understand how visitors use our site (e.g. Google Analytics)</li>
              <li><strong>Marketing cookies:</strong> used to show relevant adverts (only with your consent)</li>
            </ul>
            <p>You can manage or withdraw cookie consent at any time via our cookie banner or your browser settings.</p>
          </SectionBlock>

          <SectionBlock id="retention" number="07" title="How Long We Keep Data" Icon={RefreshCw}>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Order data:</strong> 7 years (UK tax and accounting requirements)</li>
              <li><strong>Customer accounts:</strong> for the duration of your account plus 2 years</li>
              <li><strong>Marketing data:</strong> until you unsubscribe or withdraw consent</li>
              <li><strong>Support enquiries:</strong> 2 years from last contact</li>
              <li><strong>Technical/log data:</strong> 12 months</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="your-rights" number="08" title="Your Rights" Icon={UserCheck}>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Rectification</strong> of inaccurate or incomplete data</li>
              <li><strong>Erasure</strong> ("right to be forgotten") in certain circumstances</li>
              <li><strong>Restriction</strong> of processing in certain circumstances</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Object</strong> to processing based on legitimate interests or for direct marketing</li>
              <li><strong>Withdraw consent</strong> for marketing at any time</li>
            </ul>
            <p>To exercise any right, contact us at <a href={`mailto:${COMPANY_EMAIL}`} className="underline text-[#8B5E3C] dark:text-amber-400">{COMPANY_EMAIL}</a>. We will respond within 30 days.</p>
          </SectionBlock>

          <SectionBlock id="security" number="09" title="Data Security" Icon={Lock}>
            <p>We implement appropriate technical and organisational measures to protect your personal data, including:</p>
            <ul className="list-disc ml-4 space-y-1.5">
              <li>SSL/TLS encryption for all data in transit</li>
              <li>Payment processing via Stripe (PCI DSS compliant) — we never store card numbers</li>
              <li>Access controls limiting who can view personal data</li>
              <li>Regular security reviews</li>
            </ul>
            <p>No internet transmission is 100% secure. In the event of a data breach that affects your rights, we will notify you as required by law.</p>
          </SectionBlock>

          <SectionBlock id="third-party" number="10" title="Third-Party Links" Icon={Globe}>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to read their privacy policies before submitting any data.</p>
          </SectionBlock>

          <SectionBlock id="children" number="11" title="Children's Privacy" Icon={Shield}>
            <p>Our website and services are not directed at children under 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, please contact us immediately and we will delete it.</p>
          </SectionBlock>

          <SectionBlock id="changes" number="12" title="Changes to This Policy" Icon={RefreshCw}>
            <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect any changes. Where changes are significant, we will notify you by email or a prominent notice on our website.</p>
            <p>Continued use of our website after changes constitutes acceptance of the revised policy.</p>
          </SectionBlock>

          <SectionBlock id="contact" number="13" title="Contact & Complaints" Icon={Mail}>
            <p>For any privacy-related queries or to exercise your rights, contact us:</p>
            <div className="bg-[#F4EDE4] dark:bg-[#241b16] rounded-xl p-4 space-y-2">
              <p><strong>{COMPANY_NAME}</strong></p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#C4A882]" /><a href={`mailto:${COMPANY_EMAIL}`} className="underline text-[#8B5E3C] dark:text-amber-400">{COMPANY_EMAIL}</a></p>
              <p className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#C4A882]" /><a href="/contact" className="underline text-[#8B5E3C] dark:text-amber-400">Contact Form</a></p>
            </div>
            <p className="mt-3">You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline text-[#8B5E3C] dark:text-amber-400">ico.org.uk</a>.</p>
          </SectionBlock>
        </div>
      </div>
    </main>
  );
}
