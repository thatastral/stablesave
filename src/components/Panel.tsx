"use client";

import { Drawer } from "vaul";
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
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={desktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <Drawer.Content
          aria-describedby={undefined}
          style={desktop ? { width } : undefined}
          className={
            desktop
              ? "fixed top-2 right-2 bottom-2 z-50 flex max-w-[calc(100vw-16px)] flex-col rounded-[14px] border border-line bg-surface shadow-float outline-none after:hidden"
              : "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-[18px] border-t border-line bg-surface outline-none"
          }
        >
          {desktop ? (
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="pressable absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-[8px] border border-line bg-surface text-ink-3 hover:text-ink"
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
