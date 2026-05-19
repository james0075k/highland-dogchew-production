import { notFound } from 'next/navigation';

// Catch-all that funnels every unmatched URL under (main) into the route group's
// not-found.tsx — that way the 404 inherits Navbar, Footer and theme providers
// instead of falling through to the bare root not-found.
export default function CatchAllNotFound() {
  notFound();
}
