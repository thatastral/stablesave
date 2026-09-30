"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-4 pt-32 pb-24 text-center">
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink">Something went wrong</h1>
      <p className="mt-2 text-[15px] text-ink-3">We couldn’t load the latest rates. This is usually temporary.</p>
      <button
        onClick={reset}
        className="pressable mt-8 h-12 rounded-full bg-ink px-6 text-[15px] font-semibold text-canvas"
      >
        Try again
      </button>
    </main>
  );
}
