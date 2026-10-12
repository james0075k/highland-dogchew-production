// Full-page brand spinner. Used as a Suspense fallback on pages that read the
// URL (useSearchParams). Don't reintroduce it as (main)/loading.tsx: a route
// loading boundary makes Next send 200 before notFound() runs → soft 404s.
export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFAF6] dark:bg-[#1a1209]">
      <div className="flex flex-col items-center gap-4">
        {/* Animated paw-print style loader */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#2E1F14]/10 dark:border-[#3a2c23]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#C4A882] dark:border-t-amber-500 animate-spin" />
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C4A882] dark:text-amber-500 animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  );
}
