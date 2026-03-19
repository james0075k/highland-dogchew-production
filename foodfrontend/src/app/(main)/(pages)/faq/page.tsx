"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categories = [
  {
    label: "Products",
    faqs: [
      { q: "What are yak milk chews made from?", a: "Our yak milk chews are made from just three natural ingredients: yak milk, cow milk, and a small amount of lime juice and salt. No preservatives, no artificial additives — just pure Himalayan goodness." },
      { q: "Are yak chews safe for all dogs?", a: "Yes, yak chews are safe for most dogs. We recommend choosing the correct size for your dog's weight. Always supervise your dog while chewing. Puppies under 16 weeks and dogs with severe dairy sensitivities should consult a vet first." },
      { q: "What sizes are available?", a: "We offer XS, Small, Medium, Large, and XL sizes to suit all breeds. You can find our full size guide on each product page or on our dedicated Size Guide section." },
      { q: "Are yak chews suitable for puppies?", a: "Yak chews are suitable for puppies aged 16 weeks and older. Choose the puppy or XS size. Always supervise puppies while chewing." },
      { q: "What is a Himalayan Puff Treat?", a: "When a yak chew becomes too small to chew safely, place the end piece on a microwave-safe plate and microwave on full power for 30–60 seconds. It puffs up into a light, crunchy snack! Allow to cool before giving to your dog." },
      { q: "Are your products grain-free?", a: "Yes — all our yak milk chews, puff treats, and highland mix chews are 100% grain-free and low in lactose." },
      { q: "How long does a yak chew last?", a: "This depends on your dog's size and chewing intensity. Aggressive chewers may get through a large chew in 1–3 days, while lighter chewers can enjoy them for up to 1–2 weeks." },
    ],
  },
  {
    label: "Orders & Delivery",
    faqs: [
      { q: "How much does delivery cost?", a: "Standard UK delivery is £2.99. Orders over £30 qualify for free standard delivery. Express delivery options are available at checkout." },
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery is 1–2 business days. Next Day Delivery is available for orders placed before 12 PM Monday–Thursday." },
      { q: "Do you ship outside the UK?", a: "Currently we ship to Great Britain and Northern Ireland only. We are working on expanding internationally — sign up to our newsletter to be notified." },
      { q: "How do I track my order?", a: "Once your order is dispatched, you will receive an email with your tracking number. You can also use our Track Order page with your order number and email address." },
      { q: "Can I change or cancel my order?", a: "Orders can be changed or cancelled within 1 hour of placing them by contacting us at hello@highlanddogchew.co.uk. After dispatch, we are unable to make changes." },
    ],
  },
  {
    label: "Returns & Refunds",
    faqs: [
      { q: "What is your returns policy?", a: "We accept returns within 14 days of delivery for unused, unopened products in their original packaging. Opened or used chews cannot be returned for hygiene reasons." },
      { q: "My order arrived damaged. What do I do?", a: "Please contact us within 48 hours of receiving a damaged order at hello@highlanddogchew.co.uk with photos of the damage. We will arrange a replacement or refund." },
      { q: "How long does a refund take?", a: "Refunds are processed within 5–10 business days of receiving the returned item, to your original payment method." },
      { q: "Who pays for return postage?", a: "Return postage is the customer's responsibility unless the return is due to a damaged or incorrect item, in which case we will cover the cost." },
    ],
  },
  {
    label: "Payments",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Stripe Link. All payments are processed securely via Stripe." },
      { q: "Is my payment information secure?", a: "Absolutely. We use Stripe for payment processing, which is PCI DSS Level 1 compliant — the highest level of payment security. We never store your card details." },
      { q: "Can I pay in instalments?", a: "We do not currently offer instalment payments, but we do offer a Subscribe & Save option on some products for regular deliveries at a discounted price." },
    ],
  },
  {
    label: "Subscribe & Save",
    faqs: [
      { q: "What is Subscribe & Save?", a: "Subscribe & Save allows you to set up automatic repeat deliveries of your favourite chews at a discounted price. Choose weekly or monthly intervals and save a percentage on every order." },
      { q: "Can I cancel my subscription?", a: "Yes — you can cancel, skip, or modify your subscription at any time before your next scheduled delivery. There is no long-term commitment." },
      { q: "How much do I save with a subscription?", a: "Subscription discounts vary by product, typically between 5–15%. The discount is clearly shown on each product page." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2E1F14]/10 dark:border-[#3a2c23] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 text-[#C4A882] dark:text-amber-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="min-h-screen bg-[#FDFAF6] dark:bg-[#1a1209]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F4EDE4] to-[#FDFAF6] dark:from-[#1f1812] dark:to-[#1a1209] border-b border-[#2E1F14]/10 dark:border-[#3a2c23]">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">Help Centre</p>
          <h1 className="text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-3">Frequently Asked Questions</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Can't find what you're looking for? <Link href="/contact" className="underline underline-offset-2 text-[#8B5E3C] dark:text-amber-400">Contact us</Link></p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                activeTab === i
                  ? 'bg-[#2E1F14] dark:bg-amber-700 text-white border-[#2E1F14] dark:border-amber-700'
                  : 'text-[#7A5C4F] dark:text-[#c8b6a6] border-[#2E1F14]/15 dark:border-[#3a2c23] hover:border-[#2E1F14]/40 dark:hover:border-amber-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="bg-white dark:bg-[#1f1812] rounded-2xl border border-[#2E1F14]/10 dark:border-[#3a2c23] px-6">
          {categories[activeTab].faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-[#F4EDE4] to-[#E8DFD1] dark:from-[#1f1812] dark:to-[#18120e] border border-[#2E1F14]/10 dark:border-[#3a2c23] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C4A882] dark:text-amber-500 mb-2">Still need help?</p>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm mb-5">Our team is happy to help with any questions about our products or your order.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors">
              Contact Us
            </Link>
            <Link href="/track-order" className="border border-[#2E1F14]/20 dark:border-[#3a2c23] hover:border-[#2E1F14]/50 text-[#2E1F14] dark:text-[#f5e9dc] text-sm font-semibold px-8 py-3 rounded-full transition-colors">
              Track My Order
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
