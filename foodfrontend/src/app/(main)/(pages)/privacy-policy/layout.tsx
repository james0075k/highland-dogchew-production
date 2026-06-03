import { Metadata } from 'next';
const BASE_URL = 'https://highlanddogchew.co.uk';
export const metadata: Metadata = {
  title: 'Privacy Policy | Highland Yak Chew',
  description: 'How Highland Yak Chew collects, uses, and protects your personal data in accordance with UK GDPR.',
  alternates: { canonical: `${BASE_URL}/privacy-policy` },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
