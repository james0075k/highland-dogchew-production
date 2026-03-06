import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Returns Policy | Highland Yak Chew',
  description:
    'Learn about our refund and returns policy at Highland Yak Chew. We offer a 14-day return window on unopened products with straightforward refunds to your original payment method.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/refunds',
  },
  openGraph: {
    title: 'Refund & Returns Policy | Highland Yak Chew',
    description:
      'Straightforward returns and refunds on Highland Yak Chew products. Read our full policy here.',
    url: 'https://highlanddogchew.co.uk/refunds',
    siteName: 'Highland Yak Chew',
  },
};

export default function RefundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
