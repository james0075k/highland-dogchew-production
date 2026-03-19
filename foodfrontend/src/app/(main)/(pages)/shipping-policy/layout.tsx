import { Metadata } from 'next';
const BASE_URL = 'https://highlanddogchew.co.uk';
export const metadata: Metadata = {
  title: 'Shipping Policy | Highland Yakchew',
  description: 'Highland Yakchew UK shipping information — delivery times, costs, and tracking details.',
  alternates: { canonical: `${BASE_URL}/shipping-policy` },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
