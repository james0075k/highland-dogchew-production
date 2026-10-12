import Link from "next/link";
import CopyCodeButton from "./CopyCodeButton";
import { getPromoBanner } from "@/utils/promo";

// Slim one-line offer strip under the hero, modelled on Rhode's announcement
// bar: one neutral sand band, small tracked uppercase text, the code in bold and
// a small copy icon. Server-rendered so the offer text is in the initial HTML
// for search/answer engines; only the copy button is a client island. Links to
// /discount-code, the page that targets "discount code" searches.
// Text and code are edited in Dashboard → Homepage Banner; renders nothing when
// the banner is off or its code can no longer be redeemed.
export default async function PromoBanner() {
  const banner = await getPromoBanner();
  if (!banner.enabled || !banner.code) return null;

  return (
    <aside aria-label="Discount code" className="px-3 pt-3 md:px-5 md:pt-4">
      <div className="flex items-center justify-center gap-x-2 rounded-xl bg-[var(--color-sand)] px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-primary)] md:text-xs dark:bg-[var(--surface-secondary)]">
        <Link
          href="/discount-code"
          className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]"
        >
          {banner.leadText} <strong className="font-bold">{banner.code}</strong>
        </Link>
        <CopyCodeButton
          code={banner.code}
          icon
          className="-m-1.5 shrink-0 rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
        />
      </div>
    </aside>
  );
}
