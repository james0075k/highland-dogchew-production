// /track-order has been merged into /my-orders to remove the duplicate "track vs.
// my orders" confusion. This server-side redirect preserves any inbound query
// params (?tab=subscriptions, ?order=HD-XXX, etc.) so existing links keep working.

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TrackOrderRedirect({ searchParams }: Props) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  // If user came in with no tab hint, drop them on the parcel-tracking tab
  // (matches their original intent when clicking "Track Order" links)
  if (!qs.has('tab') && !qs.has('order')) qs.set('tab', 'track');
  const suffix = qs.toString();
  redirect(`/my-orders${suffix ? `?${suffix}` : ''}`);
}
