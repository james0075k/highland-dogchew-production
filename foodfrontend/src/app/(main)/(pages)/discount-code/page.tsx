// /discount-code — landing page for "Highland Yak Chew discount code" /
// "yak chew discount" searches. Server component: the offer, steps and FAQ are
// all in the initial HTML, and the FAQPage JSON-LD mirrors the visible FAQ
// exactly (required for rich-result eligibility — keep them in sync).

import type { Metadata } from "next";
import Link from "next/link";
import CopyCodeButton from "@/components/organisms/PromoBanner/CopyCodeButton";
import { PROMO } from "@/utils/promo";
import { BASE_URL, BRAND, JsonLd, buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/utils/seo";

const URL = `${BASE_URL}/discount-code`;
const { code, percent } = PROMO;

export const metadata: Metadata = {
  title: `Discount Code: ${percent}% Off Yak Chews with ${code}`,
  description: `Save ${percent}% on natural yak milk dog chews, puff treats and Highland Mix. Use ${BRAND} discount code ${code} at checkout. Works on every product, UK delivery.`,
  alternates: { canonical: URL },
  openGraph: {
    title: `${BRAND} discount code: ${percent}% off with ${code}`,
    description: `Use code ${code} at checkout for ${percent}% off every ${BRAND} product.`,
    url: URL,
  },
};

const faqs = [
  {
    question: `Is there a ${BRAND} discount code?`,
    answer: `Yes. Use code ${code} at checkout for ${percent}% off every product, including yak milk chews, puff treats and Highland Mix.`,
  },
  {
    question: `How do I use the ${code} code?`,
    answer: `Add products to your basket and go to checkout. Type ${code} into the promo code box and select Apply. The discount shows in your order summary before you pay.`,
  },
  {
    question: "Where can I get a discount on yak chews for dogs in the UK?",
    answer: `${BRAND} sells natural Himalayan yak milk dog chews online across the UK. Code ${code} takes ${percent}% off every product on highlanddogchew.co.uk.`,
  },
  {
    question: "Can I use more than one discount code on an order?",
    answer: "No. One promo code can be applied per order.",
  },
  {
    question: "What if my discount code isn't working?",
    answer: `Check it's entered as ${code} with no spaces. If checkout still doesn't accept it, email hello@highlanddogchew.co.uk and we'll help.`,
  },
];

const steps = [
  "Add any chews or treats to your basket.",
  `At checkout, enter ${code} in the promo code box and select Apply.`,
  `${percent}% comes off your order before you pay.`,
];

export default function DiscountCodePage() {
  const faqLd = buildFaqJsonLd(faqs);

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: BASE_URL },
          { name: "Discount code", url: URL },
        ])}
      />
      {faqLd && <JsonLd data={faqLd} />}

      <div className="mx-auto max-w-2xl px-4 py-14 md:py-20">
        <h1 className="font-antique text-4xl leading-tight md:text-5xl">{BRAND} discount code</h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
          Get {percent}% off every yak milk chew, puff treat and Highland Mix with code {code}.
        </p>

        {/* Code */}
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-dashed border-[var(--border-hover)] bg-[var(--surface-card)] px-5 py-4">
          <p className="font-antique text-3xl tracking-[0.04em] md:text-4xl">{code}</p>
          <CopyCodeButton
            code={code}
            className="rounded-full bg-[var(--color-dark-brown)] px-5 py-2 text-sm text-[var(--color-cream)] hover:bg-[var(--color-warm-brown)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-dark-brown)] dark:bg-[var(--text-primary)] dark:text-[var(--surface-page)]"
          />
        </div>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-[var(--text-secondary)]"
        >
          Shop all chews
        </Link>

        <section className="mt-14">
          <h2 className="font-antique text-2xl">How to use it</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-[var(--text-secondary)]">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-antique text-2xl">Questions</h2>
          <dl className="mt-4 divide-y divide-[var(--border-base)] border-y border-[var(--border-base)]">
            {faqs.map((f) => (
              <div key={f.question} className="py-5">
                <dt className="font-medium">{f.question}</dt>
                <dd className="mt-2 leading-relaxed text-[var(--text-secondary)]">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
