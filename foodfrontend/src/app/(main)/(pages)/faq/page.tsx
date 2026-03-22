"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  RefreshCw,
  Search,
  ShoppingCart,
  CalendarCheck,
  Bell,
  Heart,
} from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";

/* ═══════════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════════ */
const categories = [
  {
    label: "Products",
    icon: <Package className="w-4 h-4" />,
    faqs: [
      {
        q: "What are yak milk chews made from?",
        a: "Our yak milk chews are made from just three natural ingredients: yak milk, cow milk, and a small amount of lime juice and salt. No preservatives, no artificial additives — just pure Himalayan goodness.",
      },
      {
        q: "Are yak chews safe for all dogs?",
        a: "Yes, yak chews are safe for most dogs. We recommend choosing the correct size for your dog's weight. Always supervise your dog while chewing. Puppies under 16 weeks and dogs with severe dairy sensitivities should consult a vet first.",
      },
      {
        q: "What sizes are available?",
        a: "We offer XS, Small, Medium, Large, and XL sizes to suit all breeds. You can find our full size guide on each product page or on our dedicated Size Guide section.",
      },
      {
        q: "Are yak chews suitable for puppies?",
        a: "Yak chews are suitable for puppies aged 16 weeks and older. Choose the puppy or XS size. Always supervise puppies while chewing.",
      },
      {
        q: "What is a Himalayan Puff Treat?",
        a: "When a yak chew becomes too small to chew safely, place the end piece on a microwave-safe plate and microwave on full power for 30–60 seconds. It puffs up into a light, crunchy snack! Allow to cool before giving to your dog.",
      },
      {
        q: "Are your products grain-free?",
        a: "Yes — all our yak milk chews, puff treats, and highland mix chews are 100% grain-free and low in lactose.",
      },
      {
        q: "How long does a yak chew last?",
        a: "This depends on your dog's size and chewing intensity. Aggressive chewers may get through a large chew in 1–3 days, while lighter chewers can enjoy them for up to 1–2 weeks.",
      },
      {
        q: "What is the Highland Mix Chew?",
        a: "Highland Mix Chews are a blend of yak milk and cow milk, infused with natural flavours such as blueberry, strawberry, pumpkin, or honey. They offer the same long-lasting chewing experience with an extra taste dogs love.",
      },
      {
        q: "How should I store my yak chews?",
        a: "Store yak chews in a cool, dry place away from direct sunlight. They have a long shelf life — typically 3–5 years from manufacture. Once your dog has started chewing, store the chew in a dry area between sessions.",
      },
    ],
  },
  {
    label: "Orders & Delivery",
    icon: <Truck className="w-4 h-4" />,
    faqs: [
      {
        q: "How much does delivery cost?",
        a: "Standard UK delivery is £2.99. Orders over £30 qualify for free standard delivery. Express delivery options are available at checkout.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3–5 business days. Express delivery is 1–2 business days. Next Day Delivery is available for orders placed before 12 PM Monday–Thursday.",
      },
      {
        q: "Do you ship outside the UK?",
        a: "Currently we ship to Great Britain and Northern Ireland only. We are working on expanding internationally — sign up to our newsletter to be notified.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is dispatched, you will receive an email with your tracking number. You can also use our Track Order page with your order number and email address.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can be changed or cancelled within 1 hour of placing them by contacting us at hello@highlanddogchew.co.uk. After dispatch, we are unable to make changes.",
      },
      {
        q: "What packaging do you use for delivery?",
        a: "We use minimal, recyclable packaging with paper inserts made from recycled or certified materials. Our compact shipping reduces environmental impact while keeping your products safe in transit.",
      },
      {
        q: "What happens if I'm not home during delivery?",
        a: "Our delivery partners will attempt to leave your parcel in a safe place or with a neighbour. You'll receive a notification with details. If delivery is unsuccessful, you can rearrange via the tracking link in your dispatch email.",
      },
    ],
  },
  {
    label: "Returns & Refunds",
    icon: <RotateCcw className="w-4 h-4" />,
    faqs: [
      {
        q: "What is your returns policy?",
        a: "We accept returns within 14 days of delivery for unused, unopened products in their original packaging. Opened or used chews cannot be returned for hygiene reasons.",
      },
      {
        q: "My order arrived damaged. What do I do?",
        a: "Please contact us within 48 hours of receiving a damaged order at hello@highlanddogchew.co.uk with photos of the damage. We will arrange a replacement or refund.",
      },
      {
        q: "How long does a refund take?",
        a: "Refunds are processed within 5–10 business days of receiving the returned item, to your original payment method.",
      },
      {
        q: "Who pays for return postage?",
        a: "Return postage is the customer's responsibility unless the return is due to a damaged or incorrect item, in which case we will cover the cost.",
      },
    ],
  },
  {
    label: "Payments",
    icon: <CreditCard className="w-4 h-4" />,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Stripe Link. All payments are processed securely via Stripe.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use Stripe for payment processing, which is PCI DSS Level 1 compliant — the highest level of payment security. We never store your card details.",
      },
      {
        q: "Can I pay in instalments?",
        a: "We do not currently offer instalment payments, but we do offer a Subscribe & Save option on some products for regular deliveries at a discounted price.",
      },
      {
        q: "Will I be charged VAT?",
        a: "Yes, all prices displayed on our website include 20% UK VAT. The VAT breakdown is shown on your order confirmation and invoice.",
      },
    ],
  },
  {
    label: "Subscribe & Save",
    icon: <RefreshCw className="w-4 h-4" />,
    faqs: [
      {
        q: "What is Subscribe & Save?",
        a: "Subscribe & Save allows you to set up automatic repeat deliveries of your favourite chews at a discounted price. Choose weekly or monthly intervals and save a percentage on every order.",
      },
      {
        q: "How do I set up a subscription?",
        a: "It's simple: browse our products, select the chew and size your dog loves, tick the 'Subscribe & Save' option on the product page, choose your delivery interval (e.g. every 2 weeks, every 4 weeks), then proceed to checkout. Your subscription starts automatically after your first payment.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes — you can cancel, skip, or modify your subscription at any time before your next scheduled delivery. There is no long-term commitment.",
      },
      {
        q: "How much do I save with a subscription?",
        a: "Subscription discounts vary by product, typically between 5–15%. The discount is clearly shown on each product page.",
      },
      {
        q: "Can I change my delivery frequency?",
        a: "Yes, you can change the delivery interval at any time. Simply contact us or manage your subscription through your order confirmation email. Changes take effect from your next billing cycle.",
      },
      {
        q: "What happens if a product is out of stock?",
        a: "If your subscribed product is temporarily out of stock, we will notify you by email and skip that delivery. Your subscription will resume automatically when stock is available. You will not be charged for skipped deliveries.",
      },
      {
        q: "Can I subscribe to multiple products?",
        a: "Absolutely! You can have separate subscriptions for different products, each with its own delivery interval. Mix and match yak chews, puff treats, and highland mix chews to keep your dog happy.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════
   SUBSCRIPTION STEPS DATA
   ═══════════════════════════════════════════════ */
const subscriptionSteps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Browse & Choose",
    desc: "Find the perfect chew for your dog's size and preference from our range of yak chews, puff treats, and highland mix.",
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Select Subscribe & Save",
    desc: "On the product page, tick the Subscribe & Save option and choose your preferred delivery interval.",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Checkout Securely",
    desc: "Complete your order with secure Stripe payment. Your card is saved safely for future automatic renewals.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6" />,
    title: "Automatic Renewals",
    desc: "Sit back — we'll process your order and ship fresh chews on your chosen schedule, every time.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Stay in Control",
    desc: "Cancel, skip, or change frequency anytime. We'll always email you before each renewal.",
  },
];

/* ═══════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════ */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   STITCH DECORATIVE ELEMENTS
   ═══════════════════════════════════════════════ */
function StitchLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`mx-auto ${className}`}
      width="120"
      height="4"
      viewBox="0 0 120 4"
      fill="none"
    >
      <path
        d="M0 2 L120 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
        className="animate-stitch"
      />
    </svg>
  );
}

function StitchCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const p: Record<string, string> = {
    tl: "top-2 left-2 rotate-0",
    tr: "top-2 right-2 rotate-90",
    bl: "bottom-2 left-2 -rotate-90",
    br: "bottom-2 right-2 rotate-180",
  };
  return (
    <svg
      className={`absolute ${p[pos]} text-[#B8976A]/40 dark:text-[#D4BC8E]/25`}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M2 16 L2 2 L16 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        className="animate-stitch-slow"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   FAQ ACCORDION ITEM
   ═══════════════════════════════════════════════ */
function FAQItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="border-b border-[var(--border-base)]/60 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span
          className="text-[15px] md:text-[16px] font-medium text-[var(--text-primary)] group-hover:text-[#B8976A] dark:group-hover:text-[#D4BC8E] transition-colors duration-200 leading-snug"
          style={{
            fontFamily:
              "var(--font-cormorant), 'Cormorant Garamond', serif",
            fontWeight: 600,
          }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-[18px] h-[18px] text-[#B8976A] dark:text-[#D4BC8E]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-relaxed pb-5 pl-0.5"
              style={{
                fontFamily:
                  "var(--font-cormorant), 'Cormorant Garamond', serif",
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN FAQ PAGE
   ═══════════════════════════════════════════════ */
export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  /* filter FAQs by search */
  const currentCategory = categories[activeTab];
  const filteredFaqs = searchQuery.trim()
    ? currentCategory.faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCategory.faqs;

  /* search across all categories */
  const allFilteredFaqs = searchQuery.trim()
    ? categories.flatMap((cat) =>
        cat.faqs
          .filter(
            (f) =>
              f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((f) => ({ ...f, category: cat.label }))
      )
    : [];

  const isSearching = searchQuery.trim().length > 0;

  return (
    <main className="min-h-screen bg-[var(--surface-page)] transition-colors duration-300">
      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--surface-secondary)] to-[var(--surface-page)] border-b border-[var(--border-base)]/40 pt-0 md:pt-0 lg:pt-0">
        {/* subtle texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20.5z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-3xl mx-auto px-6 pt-28 md:pt-32 pb-12 md:pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[12px] font-semibold tracking-[0.25em] uppercase text-[#B8976A] dark:text-[#D4BC8E] mb-4"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Help Centre
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[32px] md:text-[42px] text-[var(--text-primary)] mb-4 tracking-[0.03em]"
            style={{
              fontFamily:
                "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto h-px w-20 bg-[#B8976A] dark:bg-[#D4BC8E] origin-center mb-5"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[var(--text-secondary)] text-[15px]"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
            }}
          >
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 decoration-[#B8976A]/40 text-[#B8976A] dark:text-[#D4BC8E] hover:decoration-[#B8976A] transition-colors"
            >
              Contact us
            </Link>
          </motion.p>

          {/* search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 relative max-w-md mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[var(--surface-card)] dark:bg-[#1f1812] border border-[var(--border-base)]/60 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8976A]/30 focus:border-[#B8976A]/50 transition-all duration-200"
              style={{
                fontFamily:
                  "var(--font-cormorant), 'Cormorant Garamond', serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs"
              >
                Clear
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        {/* ═══════ CATEGORY TABS ═══════ */}
        {!isSearching && (
          <FadeUp>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    "flex items-center gap-2 text-[12px] font-semibold px-4 py-2.5 rounded-full border transition-all duration-250",
                    activeTab === i
                      ? "bg-[#2E1F14] dark:bg-[#B8976A] text-white border-[#2E1F14] dark:border-[#B8976A] shadow-sm"
                      : "text-[var(--text-secondary)] border-[var(--border-base)]/60 hover:border-[#B8976A]/50 dark:hover:border-[#D4BC8E]/40 hover:text-[#B8976A] dark:hover:text-[#D4BC8E]",
                  ].join(" ")}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {cat.icon}
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </FadeUp>
        )}

        {/* ═══════ SEARCH RESULTS ═══════ */}
        {isSearching && (
          <div className="mb-6">
            <p
              className="text-[13px] text-[var(--text-muted)] mb-4"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {allFilteredFaqs.length} result
              {allFilteredFaqs.length !== 1 ? "s" : ""} for &quot;
              {searchQuery}&quot;
            </p>
            <div className="bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 px-6 relative overflow-hidden transition-colors duration-300">
              <StitchCorner pos="tl" />
              <StitchCorner pos="br" />
              {allFilteredFaqs.length > 0 ? (
                allFilteredFaqs.map((item, i) => (
                  <div key={i}>
                    {i === 0 ||
                    allFilteredFaqs[i - 1].category !==
                      item.category ? (
                      <p
                        className="text-[11px] tracking-[0.2em] uppercase text-[#B8976A] dark:text-[#D4BC8E] font-semibold pt-4 pb-1"
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        {item.category}
                      </p>
                    ) : null}
                    <FAQItem q={item.q} a={item.a} index={i} />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p
                    className="text-[var(--text-muted)] text-[15px]"
                    style={{
                      fontFamily:
                        "var(--font-cormorant), 'Cormorant Garamond', serif",
                    }}
                  >
                    No matching questions found. Try a different
                    search or{" "}
                    <Link
                      href="/contact"
                      className="underline text-[#B8976A] dark:text-[#D4BC8E]"
                    >
                      contact us
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ FAQ LIST (normal browsing) ═══════ */}
        {!isSearching && (
          <FadeUp delay={0.05}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 px-6 relative overflow-hidden transition-colors duration-300"
              >
                <StitchCorner pos="tl" />
                <StitchCorner pos="tr" />
                <StitchCorner pos="bl" />
                <StitchCorner pos="br" />

                {filteredFaqs.map((item, i) => (
                  <FAQItem
                    key={`${activeTab}-${i}`}
                    q={item.q}
                    a={item.a}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </FadeUp>
        )}

        {/* ═══════ HOW SUBSCRIPTION WORKS ═══════ */}
        <FadeUp delay={0.1} className="mt-14 md:mt-18">
          <div className="text-center mb-10">
            <p
              className="text-[12px] font-semibold tracking-[0.22em] uppercase text-[#B8976A] dark:text-[#D4BC8E] mb-3"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Subscribe & Save
            </p>
            <h2
              className="text-[24px] md:text-[30px] text-[var(--text-primary)] tracking-[0.04em] transition-colors duration-300"
              style={{
                fontFamily:
                  "var(--font-playfair), 'Playfair Display', serif",
              }}
            >
              How Subscription Works
            </h2>
            <div className="flex justify-center mt-4">
              <StitchLine className="text-[var(--border-base)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {subscriptionSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className="relative bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 p-5 text-center transition-all duration-300 group"
              >
                {/* step number */}
                <div
                  className="absolute top-3 right-3 text-[11px] font-bold text-[#B8976A]/30 dark:text-[#D4BC8E]/20"
                  style={{
                    fontFamily:
                      "var(--font-playfair), 'Playfair Display', serif",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* icon */}
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.1 }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#B8976A]/10 dark:bg-[#D4BC8E]/10 text-[#B8976A] dark:text-[#D4BC8E] mb-4 transition-colors duration-300"
                >
                  {step.icon}
                </motion.div>

                <h3
                  className="text-[14px] font-semibold text-[var(--text-primary)] mb-2 transition-colors duration-300"
                  style={{
                    fontFamily:
                      "var(--font-playfair), 'Playfair Display', serif",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-[13px] text-[var(--text-muted)] leading-relaxed transition-colors duration-300"
                  style={{
                    fontFamily:
                      "var(--font-cormorant), 'Cormorant Garamond', serif",
                  }}
                >
                  {step.desc}
                </p>

                {/* connecting line (desktop only, not on last) */}
                {i < subscriptionSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 -translate-y-1/2">
                    <svg
                      width="16"
                      height="2"
                      viewBox="0 0 16 2"
                      fill="none"
                      className="text-[var(--border-base)]"
                    >
                      <path
                        d="M0 1 L16 1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* ═══════ QUICK LINKS ═══════ */}
        <FadeUp delay={0.1} className="mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Heart className="w-5 h-5" />,
                title: "Our Promise",
                desc: "Learn about our commitment to quality and dogs",
                href: "/process",
              },
              {
                icon: <Package className="w-5 h-5" />,
                title: "Shop Products",
                desc: "Browse our full range of natural yak chews",
                href: "/products",
              },
              {
                icon: <Truck className="w-5 h-5" />,
                title: "Track Order",
                desc: "Check the status of your delivery",
                href: "/track-order",
              },
            ].map((link, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={link.href}
                  className="block bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 p-5 hover:border-[#B8976A]/40 dark:hover:border-[#D4BC8E]/30 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#B8976A]/10 dark:bg-[#D4BC8E]/10 text-[#B8976A] dark:text-[#D4BC8E] mb-3 group-hover:bg-[#B8976A]/20 transition-colors duration-300">
                    {link.icon}
                  </div>
                  <h3
                    className="text-[14px] font-semibold text-[var(--text-primary)] mb-1 transition-colors duration-300"
                    style={{
                      fontFamily:
                        "var(--font-playfair), 'Playfair Display', serif",
                    }}
                  >
                    {link.title}
                  </h3>
                  <p
                    className="text-[13px] text-[var(--text-muted)] transition-colors duration-300"
                    style={{
                      fontFamily:
                        "var(--font-cormorant), 'Cormorant Garamond', serif",
                    }}
                  >
                    {link.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* ═══════ STILL NEED HELP CTA ═══════ */}
        <FadeUp delay={0.12} className="mt-14">
          <div className="relative rounded-2xl bg-gradient-to-br from-[var(--surface-secondary)] to-[#E8DFD1] dark:from-[#241b16] dark:to-[#1a1410] border border-[var(--border-base)]/40 p-8 md:p-10 text-center overflow-hidden transition-colors duration-300">
            <StitchCorner pos="tl" />
            <StitchCorner pos="tr" />
            <StitchCorner pos="bl" />
            <StitchCorner pos="br" />

            <p
              className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B8976A] dark:text-[#D4BC8E] mb-3"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Still need help?
            </p>
            <p
              className="text-[var(--text-secondary)] text-[16px] md:text-[18px] mb-7 max-w-md mx-auto transition-colors duration-300"
              style={{
                fontFamily:
                  "var(--font-cormorant), 'Cormorant Garamond', serif",
              }}
            >
              Our team is happy to help with any questions about our
              products, subscriptions, or your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/contact"
                  className="inline-block bg-gradient-to-r from-[#B8976A] to-[#9A7B52] hover:from-[#9A7B52] hover:to-[#7A5C4F] text-white text-[13px] font-semibold tracking-[0.12em] uppercase px-8 py-3 rounded-full shadow-sm transition-all duration-300"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Contact Us
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/track-order"
                  className="inline-block border border-[var(--border-base)] hover:border-[#B8976A]/60 text-[var(--text-primary)] text-[13px] font-semibold tracking-[0.12em] uppercase px-8 py-3 rounded-full transition-all duration-300"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Track My Order
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ═══════ GLOBAL STYLES ═══════ */}
      <style jsx global>{`
        @keyframes stitch-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 22;
          }
        }
        .animate-stitch {
          animation: stitch-dash 1.8s linear infinite;
        }
        .animate-stitch-slow {
          animation: stitch-dash 3s linear infinite;
        }
      `}</style>
    </main>
  );
}
