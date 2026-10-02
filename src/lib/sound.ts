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
let noise: AudioBuffer | null = null;

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
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** One enveloped oscillator: quick attack, exponential tail. */
function tone(
  c: AudioContext,
  { type = "sine", from, to = from, at = 0, dur, gain }: { type?: OscillatorType; from: number; to?: number; at?: number; dur: number; gain: number },
) {
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function whoosh(c: AudioContext, { dur = 0.28, gain = 0.05, from = 500, to = 2200 } = {}) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master!);
  src.start(t);
  src.stop(t + dur + 0.02);
}

let lastTick = 0;

export type SoundName = "tick" | "tap" | "select" | "pop" | "unpop" | "chime" | "open" | "close" | "toggleOn";

export function play(name: SoundName) {
  const c = audio();
  if (!c) return;
  switch (name) {
    case "tick": {
      // Keystrokes: throttled so fast typing stays a soft patter.
      const now = performance.now();
      if (now - lastTick < 35) return;
      lastTick = now;
      tone(c, { type: "sine", from: 2100 + Math.random() * 300, dur: 0.035, gain: 0.025 });
      break;
    }
    case "tap": // presets, segmented, toggles
      tone(c, { type: "triangle", from: 640, to: 420, dur: 0.07, gain: 0.07 });
      break;
    case "select": // choosing an option in a menu
      tone(c, { type: "sine", from: 740, dur: 0.09, gain: 0.05 });
      tone(c, { type: "sine", from: 1110, at: 0.045, dur: 0.12, gain: 0.04 });
      break;
    case "pop": // add to compare
      tone(c, { type: "sine", from: 520, to: 980, dur: 0.11, gain: 0.07 });
      break;
    case "unpop": // remove from compare
      tone(c, { type: "sine", from: 900, to: 480, dur: 0.1, gain: 0.05 });
      break;
    case "chime": // a new top pick lands
      tone(c, { type: "sine", from: 1046.5, dur: 0.5, gain: 0.035 });
      tone(c, { type: "sine", from: 1568, at: 0.07, dur: 0.6, gain: 0.03 });
      break;
    case "open": // sheet/panel/dialog in
      whoosh(c, { from: 450, to: 2000, gain: 0.045 });
      break;
    case "close":
      whoosh(c, { dur: 0.2, from: 1800, to: 500, gain: 0.03 });
      break;
    case "toggleOn":
      tone(c, { type: "sine", from: 660, dur: 0.08, gain: 0.05 });
      tone(c, { type: "sine", from: 990, at: 0.06, dur: 0.12, gain: 0.045 });
      break;
  }
}
