"use client";

import { useSyncExternalStore } from "react";
import { isSoundOn, setSoundOn, subscribeSound } from "@/lib/sound";

export function SoundToggle() {
  // Server renders "on"; the client reads the saved preference.
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => true);
  return (
    <button
      onClick={() => setSoundOn(!on)}
      aria-pressed={on}
      aria-label={on ? "Mute interface sounds" : "Turn on interface sounds"}
      title={on ? "Sounds on" : "Sounds off"}
      className="pressable relative grid size-9 place-items-center rounded-full bg-surface text-ink-2 shadow-card hover:text-ink"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        {on ? (
          <path
            d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        ) : (
          <path d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
