import Link from "next/link";
import { HelpButton } from "./Welcome";
import { ThemeToggle } from "./ThemeToggle";

/** Three coins stepping upward: savings that grow. Flat on purpose. */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#0FA968" />
      <rect x="6.5" y="19.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".55" />
      <rect x="10" y="13.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".78" />
      <rect x="13.5" y="7.5" width="12" height="5" rx="2.5" fill="#fff" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="pressable flex items-center gap-2" aria-label="StableSave home">
      <LogoMark />
      <span className="font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">StableSave</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--canvas)_55%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 text-[13px] font-medium">
          <Link href="/methodology" className="hidden px-2 py-1.5 text-ink-2 transition-colors hover:text-ink sm:block">
            How we rate safety
          </Link>
          <HelpButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3 px-4 pt-8 pb-4 text-[12px] leading-relaxed text-ink-3 sm:flex-row sm:justify-between sm:px-6">
        <p className="max-w-[540px]">
          StableSave helps you compare options. It isn’t financial advice. We never hold your money or ask for your wallet.
          DeFi apps aren’t banks: there’s no deposit insurance, and you could lose some or all of what you put in. Always
          double-check on the official app before depositing.
        </p>
        <p className="shrink-0">
          <Link href="/methodology" className="underline-offset-2 hover:underline">
            How we rate safety
          </Link>{" "}
          · Data from DeFiLlama
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-[1080px] items-center gap-1.5 px-4 pt-2 pb-10 text-[13px] text-ink-2 sm:px-6">
        Built with
        <svg width="14" height="14" viewBox="0 0 24 24" aria-label="love" role="img" className="text-[var(--grade-d)]">
          <path
            fill="currentColor"
            d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 4 4.4 7.3C19.5 16.4 12 21 12 21Z"
          />
        </svg>
        for the stable community
      </div>
    </footer>
  );
}
