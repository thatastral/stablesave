/**
 * Tiny UI sound kit, synthesised with Web Audio (no files to load).
 * Every sound is short, quiet and soft-edged; they confirm actions rather than
 * decorate them. Only ever triggered by user input, so autoplay rules are met.
 * Muting persists per browser.
 */

const KEY = "stablesave:sound";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function enabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function isSoundOn() {
  return typeof window !== "undefined" && enabled();
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
  if (on) play("toggleOn");
}

export function subscribeSound(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function audio() {
  if (typeof window === "undefined" || !enabled()) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    // A gentle low-pass keeps everything warm and rounded, never bright or sharp.
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 2600;
    warmth.Q.value = 0.5;
    master.connect(warmth).connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** One enveloped oscillator: quick attack, exponential tail. */
function tone(
  c: AudioContext,
  {
    type = "sine",
    from,
    to = from,
    at = 0,
    dur,
    gain,
    attack = 0.012,
  }: { type?: OscillatorType; from: number; to?: number; at?: number; dur: number; gain: number; attack?: number },
) {
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

let lastTick = 0;

export type SoundName = "tick" | "tap" | "select" | "pop" | "chime" | "open" | "toggleOn";

/**
 * Reserved for moments that matter: typing an amount, changing risk or coin,
 * the answer changing, adding to compare, and opening a pool. Everything else
 * stays silent on purpose.
 */
export function play(name: SoundName) {
  const c = audio();
  if (!c) return;
  switch (name) {
    case "tick": {
      // Keystrokes: a low, rounded patter, throttled for fast typing.
      const now = performance.now();
      if (now - lastTick < 45) return;
      lastTick = now;
      tone(c, { from: 1100 + Math.random() * 100, dur: 0.05, gain: 0.009, attack: 0.005 });
      break;
    }
    case "tap": // risk comfort change: a single soft, rounded pluck
      tone(c, { from: 587, dur: 0.32, gain: 0.011, attack: 0.025 });
      break;
    case "select": // choosing a coin
      tone(c, { from: 587, dur: 0.24, gain: 0.012, attack: 0.02 });
      tone(c, { from: 880, at: 0.06, dur: 0.3, gain: 0.009, attack: 0.025 });
      break;
    case "pop": // add to compare
      tone(c, { from: 494, to: 587, dur: 0.22, gain: 0.013, attack: 0.02 });
      break;
    case "chime": // the answer changes: soft, airy fifth
      tone(c, { from: 659, dur: 0.9, gain: 0.009, attack: 0.06 });
      tone(c, { from: 988, at: 0.08, dur: 1.0, gain: 0.006, attack: 0.07 });
      break;
    case "open": // a pool opens: a slow, warm swell, no noise
      tone(c, { from: 262, to: 294, dur: 0.6, gain: 0.014, attack: 0.12 });
      tone(c, { from: 392, to: 440, at: 0.05, dur: 0.65, gain: 0.009, attack: 0.14 });
      break;
    case "toggleOn": // confirms sounds were turned on
      tone(c, { from: 587, dur: 0.2, gain: 0.025 });
      tone(c, { from: 880, at: 0.07, dur: 0.28, gain: 0.02 });
      break;
  }
}
