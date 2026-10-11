import Link from "next/link";
import CopyCodeButton from "./CopyCodeButton";
import { PROMO } from "@/utils/promo";

// Slim one-line offer strip under the hero, modelled on Rhode's announcement
// bar: one neutral sand band, small tracked uppercase text, the code in bold and
// a small copy icon. Server-rendered so the offer text is in the initial HTML
// for search/answer engines; only the copy button is a client island. Links to
// /discount-code, the page that targets "discount code" searches.
export default function PromoBanner() {
  return (
    <aside aria-label="Discount code" className="px-3 pt-3 md:px-5 md:pt-4">
      <div className="flex items-center justify-center gap-x-2 rounded-xl bg-[var(--color-sand)] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-primary)] md:text-xs dark:bg-[var(--surface-secondary)]">
        <Link
          href="/discount-code"
          className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]"
        >
          {PROMO.percent}% off <span className="hidden sm:inline">every chew </span>with code{" "}
          <strong className="font-bold">{PROMO.code}</strong>
        </Link>
        <CopyCodeButton
          code={PROMO.code}
          icon
          className="-m-1.5 shrink-0 rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
        />
      </div>
    </aside>
  );
}
