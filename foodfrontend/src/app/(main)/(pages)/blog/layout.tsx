import { Metadata } from 'next';

const BASE_URL = 'https://highlanddogchew.co.uk';

export const metadata: Metadata = {
  title: 'Blog | Dog Chew Guides, Tips & Yak Chew News – Highland Yak Chew',
  description:
    'Expert articles on yak milk chews, dog nutrition guides, and healthy treat tips from the Highland Yak Chew team. Learn everything about natural dog chews.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog | Dog Chew Guides & Yak Chew Tips – Highland Yak Chew',
    description:
      'Read expert articles on yak milk chews, dog nutrition, and healthy treat tips from the Highland Yak Chew team.',
    url: `${BASE_URL}/blog`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Highland Yak Chew Blog' }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
