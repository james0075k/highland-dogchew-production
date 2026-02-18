import '../../globals.css';

export const metadata = {
  title: 'Forgot Password | Highland Dog Chew Admin',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
