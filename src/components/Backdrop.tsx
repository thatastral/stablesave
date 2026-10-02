"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient halftone field behind the hero: a grid of tiny dots whose size is
 * driven by two soft "orbit" arcs framing the content and a slow drifting
 * bloom, like a dot-matrix globe breathing. Kept extremely faint on purpose.
 *
 * Canvas (one draw per frame, ~30fps), pauses off-screen / in background tabs,
 * and renders a single still frame under reduced motion.
 */
const GAP = 13; // grid spacing in CSS px
const MAX_R = 1.9; // largest dot radius
const FPS = 30;

export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function color() {
      const dark = document.documentElement.dataset.theme
        ? document.documentElement.dataset.theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Neutral grey, barely there.
      return dark ? "rgba(255, 255, 255, 0.07)" : "rgba(17, 17, 17, 0.075)";
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color();
      const cx = w / 2;
      const cy = Math.min(h * 0.5, 430);
      // Orbit radius frames the hero widget; it breathes very slowly.
      const R = Math.min(w * 0.46, 620) * (1 + Math.sin(t * 0.00025) * 0.015);
      // Drifting bloom on one side, like weather on a globe.
      const bx = cx + Math.cos(t * 0.00009) * R * 0.78;
      const by = cy + Math.sin(t * 0.00013) * R * 0.32;
      const bR = R * 0.42;

      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - cx;
          const dy = (y - cy) * 1.25;
          const d = Math.sqrt(dx * dx + dy * dy);

          // Two thin orbit rings, strongest at the left/right edges (like the reference arcs).
          const ring1 = Math.exp(-((d - R) ** 2) / 900);
          const ring2 = Math.exp(-((d - R * 0.82) ** 2) / 500) * 0.55;
          const sideWeight = Math.min(1, Math.abs(dx) / (R * 0.75)) ** 2;
          // A slow shimmer travels around the rings.
          const shimmer = 0.6 + 0.4 * Math.sin(Math.atan2(dy, dx) * 3 - t * 0.0006);
          const rings = (ring1 + ring2) * sideWeight * shimmer;

          // Soft bloom with a halftone falloff.
          const bd = Math.hypot(x - bx, (y - by) * 1.1);
          const bloom = Math.max(0, 1 - bd / bR) ** 1.6 * 0.85;

          const v = Math.min(1, rings + bloom);
          if (v < 0.06) continue;
          ctx.beginPath();
          ctx.arc(x, y, v * MAX_R + 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const onVis = () => (visible = document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[880px] overflow-hidden"
      style={{ maskImage: "linear-gradient(to bottom, #000 50%, transparent 95%)" }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
