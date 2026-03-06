import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Map | Highland Yak Chew',
  description:
    'A full overview of all pages on the Highland Yak Chew website — products, policies, gallery, contact, and more.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/site-map',
  },
  openGraph: {
    title: 'Site Map | Highland Yak Chew',
    description: 'Browse all pages on Highland Yak Chew.',
    url: 'https://highlanddogchew.co.uk/site-map',
    siteName: 'Highland Yak Chew',
  },
};

export default function SiteMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
