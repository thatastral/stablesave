import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="enter mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-4 pt-24 pb-24 text-center">
        <p className="font-display text-[88px] leading-none font-semibold tracking-[-0.04em] text-ink-3">404</p>
        <h1 className="mt-4 font-display text-[28px] font-semibold tracking-[-0.02em] text-ink">This page wandered off</h1>
        <p className="mt-2 text-[15px] text-ink-3">Your money’s fine. Let’s get you back to comparing rates.</p>
        <Link
          href="/"
          className="pressable mt-8 inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-canvas"
        >
          Back to StableSave
        </Link>
      </main>
      <Footer />
    </>
  );
}
