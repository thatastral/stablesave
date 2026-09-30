"use client";

import { THEME_KEY } from "@/lib/theme";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    // Keep the browser chrome (mobile address bar) in sync with the page.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute("content", next === "dark" ? "#0c0c0c" : "#f4f4f1"));
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Switch light / dark"
      className="pressable relative grid size-9 place-items-center rounded-full bg-surface text-ink-2 shadow-card hover:text-ink"
    >
      <svg className="theme-icon theme-icon-moon absolute" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="theme-icon theme-icon-sun absolute" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
