import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline · Ivan Holovko',
  // Don't index the offline shell — it's a fallback, not real content.
  robots: { index: false, follow: false },
};

/**
 * Static fallback page shown by the service worker when a navigation
 * request fails because the user is offline. Outside the [lang]
 * segment on purpose: this is the universal "no network" surface,
 * so it doesn't need i18n routing.
 */
export default function OfflinePage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white'>
      <div className='max-w-md'>
        <p className='text-[64px] leading-none'>🛰️</p>
        <h1 className='mt-6 text-2xl font-semibold'>You&apos;re offline</h1>
        <p className='mt-3 text-sm text-white/70'>
          Looks like there&apos;s no connection right now. The pages you&apos;ve
          already visited still work — try opening them from your history, or
          come back when you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
