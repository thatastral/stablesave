# StableSave launch film: motion brief

> **For Claude.** This is a complete production spec. Build the film exactly as written using **Remotion**. Before writing code, load the `remotion:remotion-best-practices` skill (and `remotion:remotion-create` to scaffold). Do not improvise new scenes, copy or colours. Where this brief gives a number, use that number.

---

## 1. The film in one line

**"Your stablecoins are sleeping. StableSave shows you where they could earn, how much, and how safe it is, in seconds, without a wallet."**

- **Tone:** calm, precise, confident. Think Linear or Mercury product films, not crypto hype. No neon, no lens flares, no 3D coins, no stock footage.
- **Hero moment:** typing `$10,000` and watching **"+$512 / yr"** spring into the answer panel.
- **Promise to keep visible:** *No wallet. No sign-up. We never touch your money.*

## 2. Deliverables

| Cut | Size | FPS | Length | Composition id |
| --- | --- | --- | --- | --- |
| Main (X, site, YouTube) | 1920×1080 | 60 | 30 s (1800 frames) | `Launch16x9` |
| Vertical (Reels, TikTok, Shorts) | 1080×1920 | 60 | 30 s | `Launch9x16` |
| Teaser | 1920×1080 | 60 | 12 s (720 frames) | `Teaser` = scenes 3, 4 and 8 only |

Render to H.264 MP4, CRF 16, `yuv420p`, plus a ProRes 4444 master of `Launch16x9`.

## 3. Project setup

1. Scaffold in `video/` at the repo root (a separate Remotion project, not inside the Next app).
2. Install `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/media-utils`.
3. **Fonts** (via `@remotion/google-fonts`): `InterTight` 500/600, `Inter` 400/500, `GeistMono` 400. Block render until loaded (`waitForFonts`).
4. **Data:** copy `src/data/opportunities.json` into `video/public/`. Use real names and rates, never invented numbers. The hero example is **$10,000 USDC → Maple (Syrup USDC), Ethereum, 5.12%, grade A, +$512/yr**. If the snapshot differs, use whatever the "Balanced" top pick in the snapshot is, computed with `src/lib/scoring.ts` (copy that file over).
5. **Logos:** download protocol logos (`https://icons.llamao.fi/icons/protocols/<slug>`) and network icons (`https://icons.llamao.fi/icons/chains/rsz_<chain>.jpg`), convert them to PNG with `sharp`, and save them in `video/public/logos/`. Load them with `staticFile()`. Needed: maple, aave-v3, fluid-lending, compound-v3, gains-network, pareto-credit, ember-protocol; networks ethereum, arbitrum, base, solana, monad.
6. **Rebuild the UI as Remotion components.** Do not screen-record the site. Recreate the widget, list rows, detail panel and logo as pure React and inline styles from the tokens below, so every element can be animated independently and stays perfectly sharp.

## 4. Design tokens (use exactly)

```ts
// Dark film. The product's dark theme reads best on social.
export const T = {
  canvas: "#0c0c0c",
  surface: "#171717",
  surface2: "#1d1d1d",
  sunken: "#222222",
  line: "rgba(255,255,255,0.09)",
  ink: "#f5f5f3",
  ink2: "#a9a9a5",
  ink3: "#6e6e6b",
  accent: "#2bd488",        // earnings, positive
  accentInk: "#5be3a6",
  blue: "#6b9bff",
  gradeA: ["#2bd488", "rgba(43,212,136,0.14)"],
  gradeB: ["#6b9bff", "rgba(107,155,255,0.15)"],
  gradeC: ["#f5a524", "rgba(245,165,36,0.15)"],
  brand: "#0FA968",         // logo square only
  radius: { widget: 22, panel: 16, chip: 8, pill: 12 },
};
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);       // all entrances
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);   // camera moves
export const SPRING_UI = { damping: 26, stiffness: 170, mass: 0.7 };   // numbers, chips
export const SPRING_SOFT = { damping: 30, stiffness: 120, mass: 1 };   // panels, camera settle
```

- **Type:** headlines in Inter Tight 600, tracking -0.035em. Numbers in Inter Tight 600 with `font-variant-numeric: tabular-nums`, tracking -0.045em. Body in Inter 400/500. Small caps labels in Geist Mono 400, 0.06em tracking, uppercase, colour `ink3`.
- **Grid:** 16×9 frame with 120 px side margins; everything centres on x = 960 unless stated.
- **Background:** flat `canvas`. Add a single, barely visible radial light at top centre: `radial-gradient(circle at 50% -10%, rgba(43,212,136,0.07), transparent 55%)`. Nothing else.

## 5. Motion rules (non-negotiable)

1. **Entrances:** opacity 0→1, translateY 12→0 px, blur 6→0 px over 18–24 frames with `EASE_OUT`. Never scale from 0. Minimum start scale is 0.96.
2. **Exits** are faster than entrances: 10–12 frames.
3. **Stagger** sibling items 3 frames apart (rows, words, chips).
4. **Numbers never cut.** Every changing number springs with `SPRING_UI` between values. Use a `useSpringNumber(from, to, startFrame)` helper built on `spring()` + `interpolate()`.
5. **Crossfades** between states (top-pick pill, grade chip) add `filter: blur(4px)` at the midpoint so they read as one morphing object.
6. **Camera:** a single root `<div>` with `transform: translate/scale` animated by `EASE_IN_OUT`. Wrap camera moves in `<CameraMotionBlur shutterAngle={180} samples={6}>`.
7. **Presses:** buttons scale to 0.97 for 6 frames, then spring back.
8. Maximum bounce is very low (a damping ratio around 0.85). Nothing wobbles.
9. **A fake cursor** (12 px white arrow with a 1 px `#000` stroke and soft shadow) moves along eased Bézier paths (`EASE_IN_OUT`, 24–36 frames per move). It clicks with a 20 px ring that expands to 0 opacity over 12 frames.

## 6. Scenes (60 fps, `Launch16x9`)

Use `<Series>` for the scenes, with `@remotion/transitions` `fade()` (12 frames) only where noted. Frame ranges are absolute.

### Scene 1: Hook (0–150, 2.5 s)
- Black canvas. Centre: Geist Mono label `IDLE BALANCE` (fades in, frames 6–24).
- Below it, Inter Tight 120 px: `$10,000.00` in `ink`. Under that, an `ink3` line `earning $0.00 a year`. The `$0.00` flickers subtly (opacity 0.6↔1, 3 cycles) to suggest nothing is happening.
- Frame 90: the headline types in word by word (3-frame stagger, blur entrance), in Inter Tight 64 px: **"Your stablecoins are sleeping."**
- Frames 138–150: everything exits upward 16 px with blur.

### Scene 2: The question (150–330, 3 s)
- Headline **"How much do you want to grow?"** enters word by word, 56 px, centred at y = 300.
- Frame 200: the **widget** assembles below it (520 px wide, scaled 1.6× so it reads at 1080p). The outer card rises (translateY 40→0, `SPRING_SOFT`), then the "You have" panel (frame +6), the seam arrow (frame +12, rotate -90°→0°), and the "You could earn" panel (frame +16). Both panels start empty: amount `0` in `ink3`, earnings `—`.
- Above the headline, a Geist Mono label with a pulsing green dot: `LIVE RATES · NO WALLET OR SIGN-UP`.

### Scene 3: Typing the amount (330–660, 5.5 s). This is the hero moment.
- The cursor moves into the amount field and clicks (frame 350). The panel gets a 1.5 px inner `accent` ring.
- Type `1`, `0`, `0`, `0`, `0` at a natural cadence (frames 370, 382, 392, 404, 414), with comma formatting appearing live (`10,000`). A caret blinks at 1 Hz.
- After each keystroke, the **"You could earn" number springs** to the value for that amount (+$0.05 → +$0.51 → +$5 → +$51 → **+$512**) and the Maple pill blurs in on the first keystroke.
- Frame 450: a soft camera push-in (scale 1 → 1.12, centred on the answer panel, 60 frames, `EASE_IN_OUT`).
- Frame 520: the detail line under the number fades in: `5.12% yearly rate · [A Safer] · ≈ $42.69 a month`. The grade chip pops (scale 0.96→1, `SPRING_UI`).
- Caption (lower third, Geist Mono, `ink2`): `TYPE AN AMOUNT. SEE WHAT IT COULD EARN.`

### Scene 4: Risk comfort (660–900, 4 s)
- The camera eases back to scale 1.0. The cursor moves to the segmented control.
- Click **Go bigger** (frame 700): the active tile slides (`SPRING_UI`), the earnings spring to the "Go bigger" top pick (+$4,057, Gains Network, grade C, amber chip), and the pill crossfades with blur.
- Click **Play it safe** (frame 790): back to a grade-A pick (Maple or Aave). Numbers spring down and the chip goes green.
- Caption: `PICK YOUR COMFORT. WE DO THE MATH.`

### Scene 5: The whole market (900–1200, 5 s)
- Camera pulls back and tilts the view upward (translateY -480 px, scale 1 → 0.82, 72 frames, `EASE_IN_OUT`, motion blur) to reveal the options list under the widget.
- Rows stagger in (3 frames apart, 8 rows): logo with network badge, name, grade chip, rate, `+$x/yr` in `accent`.
- Frame 1080: the sort switches to **Highest rate** and rows **reorder with a FLIP animation** (each row springs to its new y with `SPRING_SOFT`). Then it switches back to **Best for you**.
- Market line counts up from 0: `150 options tracked · 56 DeFi apps · 21 networks`.
- Caption: `EVERY OPTION. ONE CLEAR SAFETY GRADE.`

### Scene 6: Under the hood (1200–1500, 5 s)
- The cursor clicks the Maple row. The **detail panel slides in from the right** (translateX 100% → 0, `SPRING_SOFT`) while the list dims to 40%.
- The APY chart **draws left to right** (stroke-dashoffset, 48 frames, `EASE_OUT`) with a soft green area fade-in behind it, and the end dot pulses once.
- The safety ring fills from 0 to **87**, then the five factor bars fill with a 4-frame stagger, using the real scores from the scoring code:
  - How established the app is
  - Size of the pool
  - How steady the rate is
  - Real interest vs. bonuses
  - Time running
- Caption: `SEE THE RISK, NOT JUST THE RATE.`

### Scene 7: The hand-off (1500–1620, 2 s)
- The camera settles on the sticky CTA **"Go to this pool on app.maple.finance ↗"**. The cursor presses it (scale 0.97 press).
- The shield line types in beneath it: `You deposit on the official app. StableSave never touches your money.`

### Scene 8: End card (1620–1800, 3 s)
- `fade()` transition to clean `canvas`.
- **Logo build:** the green square scales 0.96→1 and fades in. The three white coin bars slide up into place one by one (bottom, middle, top; 5-frame stagger; translateY 10→0, `SPRING_UI`). Then the wordmark `StableSave` reveals left to right with a clip-path (`inset(0 100% 0 0)` → `inset(0 0 0 0)`, 18 frames).
- Below: `Find where your stablecoins earn the most.` (Inter 32 px, `ink2`).
- Below that: Geist Mono `stablesave.vercel.app` and `NO WALLET · NO SIGN-UP · FREE`.
- Hold still for the final 40 frames. No movement at all.

## 7. Vertical cut (`Launch9x16`)
- Same scenes and timings. The widget renders at 1.3× and is centred at y = 760. Captions sit at y = 1500, so they stay clear of platform UI.
- In Scene 5 the list replaces the widget instead of panning (crossfade with blur). In Scene 6 the panel rises as a bottom sheet (translateY 100% → 0), matching the mobile product.

## 8. Sound (optional but recommended)
- One understated track at about 100 BPM. A soft piano or synth pulse, no drops.
- **SFX**, mixed low (-24 dB): a soft key tick per keystroke, a muted "tock" on clicks, and a single low swell when the answer first lands (frame 414). Nothing else.
- Leave 6 frames of silence at the very end.

## 9. Quality checklist (Claude must verify before rendering)
- [ ] Every number in frame comes from `opportunities.json` and the copied scoring code. No made-up APYs.
- [ ] No element ever scales from 0, and nothing appears or disappears without an entrance or exit.
- [ ] All number changes spring. None cut.
- [ ] Text is never smaller than 24 px at 1080p (32 px in the vertical cut).
- [ ] Captions stay on screen for at least 1.5 s.
- [ ] Logos are crisp PNGs, not upscaled WebP.
- [ ] The final 40 frames are perfectly still.
- [ ] Preview in Remotion Studio at 0.25× speed to check every easing, then render.

## 10. Commands
```bash
cd video && npx remotion studio
npx remotion render Launch16x9 out/stablesave-16x9.mp4 --codec=h264 --crf=16
npx remotion render Launch9x16 out/stablesave-9x16.mp4 --codec=h264 --crf=16
npx remotion render Teaser out/stablesave-teaser.mp4 --codec=h264 --crf=16
npx remotion render Launch16x9 out/stablesave-master.mov --codec=prores --prores-profile=4444
```
