import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribed | Highland Yak Chew',
  description: 'You have been removed from Highland Yak Chew marketing emails.',
  robots: { index: false, follow: false },
};

type Status = 'ok' | 'invalid' | 'error';

const COPY: Record<Status, { title: string; body: string; tone: 'good' | 'bad' }> = {
  ok: {
    title: "You're unsubscribed",
    body: "We won't email you about this again. You'll still get order confirmations and delivery updates for anything you buy — those aren't marketing, and we'd be leaving you in the dark without them.",
    tone: 'good',
  },
  invalid: {
    title: 'That link has expired',
    body: "We couldn't read that unsubscribe link. Email us and we'll take you off the list by hand — it takes us a minute.",
    tone: 'bad',
  },
  error: {
    title: 'Something went wrong',
    body: "We couldn't complete that just now. Please email us and we'll remove you manually.",
    tone: 'bad',
  },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; scope?: string }>;
}) {
  const { status, scope } = await searchParams;
  const key: Status = status === 'ok' ? 'ok' : status === 'error' ? 'error' : 'invalid';
  const copy = COPY[key];

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-[#f5f0e8] dark:bg-[#1c1410]">
      <div className="w-full max-w-lg text-center">
        <div
          className={`mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full ${
            copy.tone === 'good'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
          aria-hidden
        >
          {copy.tone === 'good' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">{copy.title}</h1>

        <p className="mb-2 text-[15px] leading-relaxed text-[#5b4636] dark:text-[#c8b6a6]">{copy.body}</p>

        {key === 'ok' && scope === 'review' && (
          <p className="mb-2 text-sm text-[#7a5c4f] dark:text-[#a89383]">
            This covered review requests. You&rsquo;ll still receive the newsletter if you subscribed to it.
          </p>
        )}

        <p className="mb-10 mt-6 text-sm text-[#7a5c4f] dark:text-[#a89383]">
          Changed your mind, or need a hand?{' '}
          <a
            href="mailto:admin@highlanddogchew.co.uk"
            className="font-semibold text-amber-600 underline-offset-2 hover:underline dark:text-amber-500"
          >
            admin@highlanddogchew.co.uk
          </a>
        </p>

        <Link
          href="/"
          className="inline-block rounded-full bg-[#2f1e14] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#432c1d] dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          Back to Highland Yak Chew
        </Link>
      </div>
    </main>
  );
}
