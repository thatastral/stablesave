import Link from "next/link";
import { HelpButton } from "./Welcome";
import { ThemeToggle } from "./ThemeToggle";

/** Three coins stepping upward: savings that grow. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="ss-mark" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FD98E" />
          <stop offset="1" stopColor="#079A5C" />
        </linearGradient>
        <linearGradient id="ss-shine" x1="16" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Squircle-ish container */}
      <path d="M16 0c11.3 0 16 4.7 16 16s-4.7 16-16 16S0 27.3 0 16 4.7 0 16 0Z" fill="url(#ss-mark)" />
      <path d="M16 0c11.3 0 16 4.7 16 16H0C0 4.7 4.7 0 16 0Z" fill="url(#ss-shine)" />
      {/* Coins, bottom to top */}
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
      <span className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
        Stable<span className="text-accent-ink">Save</span>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--canvas)_80%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-[14px] font-semibold">
          <Link href="/methodology" className="pressable hidden rounded-full px-3 py-2 text-ink-2 hover:text-ink sm:block">
            How we rate safety
          </Link>
          <HelpButton />
          <span className="ml-1">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline">
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
      <div className="mx-auto flex w-full max-w-[1080px] items-center justify-center gap-1.5 px-4 pt-2 pb-10 text-[13px] font-medium text-ink-2 sm:px-6">
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
