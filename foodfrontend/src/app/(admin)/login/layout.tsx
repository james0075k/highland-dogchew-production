import '../../globals.css';

export const metadata = {
  title: 'Admin Login | Highland Yak Chew',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
