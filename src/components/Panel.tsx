"use client";

import { useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { play } from "@/lib/sound";
import { useMinWidth } from "./primitives";

/**
 * Responsive container: a side panel docked right on desktop, a bottom sheet on
 * phones (where thumb-reach and swipe-to-dismiss matter).
 */
export function Panel({
  open,
  onOpenChange,
  width = 480,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  width?: number;
  children: React.ReactNode;
}) {
  const desktop = useMinWidth(768);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open !== wasOpen.current) play(open ? "open" : "close");
    wasOpen.current = open;
  }, [open]);
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={desktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          style={desktop ? { width } : undefined}
          className={
            desktop
              ? "fixed top-3 right-3 bottom-3 z-50 flex max-w-[calc(100vw-24px)] flex-col rounded-[28px] bg-surface shadow-float outline-none after:hidden"
              : "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-[28px] bg-surface outline-none"
          }
        >
          {desktop ? (
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="pressable absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-surface-2 text-ink-3 hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--hairline-strong)]" />
          )}
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
