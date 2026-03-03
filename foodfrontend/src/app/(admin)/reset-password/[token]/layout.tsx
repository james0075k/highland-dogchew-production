import '../../../globals.css';

export const metadata = {
  title: 'Reset Password | Highland Yak Chew Admin',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
