# StableSave launch film: motion brief

> **For Claude.** This is a complete production spec. Build the film exactly as written using **Remotion**. Before writing any code, load `remotion:remotion-best-practices`, and use `remotion:remotion-create` to scaffold. Don't invent new scenes, copy or colours. Where this brief gives a number, use that number.

---

## 1. The story

A 30-second film with a beginning, middle and end. The structure comes from strong fintech launch films (kinetic problem statements, a single "Introducing" reveal, the product floating on a calm field, one confident closing line):

| Act | Feeling | Beat |
| --- | --- | --- |
| **I. The problem** | Mild frustration | Your dollars are sitting idle, and DeFi is noisy: jargon, a hundred apps, 40% APYs that feel like traps. |
| **II. The turn** | Relief | A quiet "Introducing StableSave". The noise falls away and leaves one simple question. |
| **III. The product** | Delight and clarity | Type an amount and see the answer. Change your comfort level. See the whole market and the risk. |
| **IV. The promise** | Trust | You deposit on the official app. We never touch your money. |
| **V. Resolution** | Calm confidence | Logo. "Find where your stablecoins earn the most." |

**One-line pitch:** *Your stablecoins are sleeping. StableSave shows where they could earn, how much, and how safe it is, in seconds, without a wallet.*

**Tone:** soft, warm and precise, like a calm friend who's good with money. No hype, neon, 3D coins, lens flares or stock footage.

## 2. Deliverables

| Cut | Size | FPS | Length | Composition id |
| --- | --- | --- | --- | --- |
| Main (site, X, YouTube) | 1920×1080 | 60 | 30 s (1800 frames) | `Launch16x9` |
| Vertical (Reels, TikTok, Shorts) | 1080×1920 | 60 | 30 s | `Launch9x16` |
| Teaser | 1920×1080 | 60 | 12 s (720 frames) | `Teaser` = scenes 4, 5 and 9 |

Render as H.264 MP4 (CRF 16, `yuv420p`), plus a ProRes 4444 master of `Launch16x9`.

## 3. Project setup

1. Scaffold a separate Remotion project in `video/` at the repo root.
2. Install `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/noise`.
3. **Fonts** (via `@remotion/google-fonts`):
   - **Rubik** 500 and 600 for headlines, numbers and buttons. Its softly rounded shapes are the brand's voice.
   - **Inter** 400 and 500 for small body text.
   - **Geist Mono** 400 for tiny uppercase labels.
   - Do **not** use SF Pro Rounded or Nunito.
   - Block rendering until fonts load.
4. **Data:** copy `src/data/opportunities.json` and `src/lib/scoring.ts` into `video/`. Never invent numbers. The hero example is **$10,000 USDC → Maple (Syrup USDC), Ethereum, about 5.1%, grade A, about +$512/yr**. If the snapshot differs, use the real "Balanced" top pick it produces.
5. **Logos:** download from `https://icons.llamao.fi/icons/protocols/<slug>` and `https://icons.llamao.fi/icons/chains/rsz_<chain>.jpg`, convert to PNG with `sharp`, and save to `video/public/logos/`. Load them with `staticFile()`. Slugs needed: maple, aave-v3, fluid-lending, compound-v3, gains-network, pareto-credit, ember-protocol, kamino-lend, morpho-blue, spark-savings. Networks needed: ethereum, arbitrum, base, solana, monad.
6. **Rebuild the UI as Remotion React components, not screen recordings:**
   - the hero widget
   - the list rows
   - the side panel
   - the welcome card
   - the logo
   - the halftone backdrop

   Match the live site at `stablesave.vercel.app` pixel for pixel.

## 4. Look and feel (use exactly)

The film is **light**, matching the site's default theme. Only the end card's background may switch to dark.

```ts
export const T = {
  canvas: "#f4f4f1",
  surface: "#ffffff",
  surface2: "#f7f7f5",
  sunken: "#efefeb",
  ink: "#111111",
  ink2: "#5d5d5b",
  ink3: "#9a9a96",
  accent: "#0fa968",          // growth, earnings
  accentSoft: "#e3f6ec",
  accentInk: "#067047",
  gradeA: ["#0fa968", "#e3f6ec"],
  gradeB: ["#3a7bfd", "#e8f0ff"],
  gradeC: ["#e08a00", "#fdf1dc"],
  brand: "#0FA968",           // logo square only
  radius: { widget: 30, panel: 22, list: 28, pill: 999 },
};
// Softness = no outlines. Depth comes only from these shadows and tinted surfaces.
export const SHADOW_CARD = "0 1px 2px rgba(17,17,17,0.03), 0 6px 20px -8px rgba(17,17,17,0.08)";
export const SHADOW_SOFT = "0 1px 2px rgba(17,17,17,0.04), 0 24px 56px -24px rgba(31,52,41,0.22)";
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // entrances
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // camera
export const SPRING_UI = { damping: 26, stiffness: 170, mass: 0.7 };
export const SPRING_SOFT = { damping: 30, stiffness: 120, mass: 1 };
```

**Rules of the look:**
- **No outlines anywhere.** Cards, pills, panels and chips are separated only by tint and soft shadow.
- **Rounded corners everywhere.** Controls and chips are full pills.
- **No colour gradients** in the background.
- **Halftone backdrop** (the brand's signature texture): a grid of tiny grey dots, gap 13 px, max radius 1.9 px, colour `rgba(17,17,17,0.075)`. Dot size follows two soft orbit arcs that frame the centre, strongest at the left and right edges, plus one slow drifting bloom. Port `src/components/Backdrop.tsx`'s field function directly into a Remotion `<AbsoluteFill>` canvas driven by `useCurrentFrame()`, so time equals frame × (1000/60). It must stay **very faint**: the viewer should feel it, not read it.
- **Type:** Rubik 600 headlines with tracking -0.02em to -0.03em. Numbers in Rubik 600 with `tabular-nums`. Small labels in Geist Mono uppercase at 0.06em tracking, `ink3`.

## 5. Motion rules (non-negotiable)

1. **Entrances:** opacity 0→1, y 12→0 px, blur 6→0 px over 18–24 frames with `EASE_OUT`. Nothing ever scales from 0. The minimum starting scale is 0.96.
2. **Exits** take 10–12 frames, faster than entrances.
3. **Stagger** siblings 3 frames apart.
4. **Numbers always spring** (`SPRING_UI`). They never cut.
5. **State crossfades** (top-pick pill, grade chip) blur to 4 px at the midpoint.
6. **Camera:** one root transform with `EASE_IN_OUT`, wrapped in `<CameraMotionBlur shutterAngle={180} samples={6}>`.
7. **Presses:** scale to 0.97 for 6 frames, then spring back.
8. **No wobble:** damping ratio at least 0.85.
9. **Cursor:** a soft white arrow (12 px, 1 px `#111` stroke, soft shadow) moving on eased Bézier paths over 24–36 frames. A click shows a 20 px ring that fades to 0 over 12 frames.
10. The halftone backdrop breathes continuously underneath every scene. It never cuts, even between scenes.

## 6. Scenes (`Launch16x9`, 60 fps, absolute frames)

### Act I: The problem

**Scene 1. Asleep (0–150)**
- Canvas plus halftone. Centre: Geist Mono label `YOUR USDC`.
- Below it, in Rubik 140 px: `$10,000`. Under that, an `ink3` line `earning $0.00` with a tiny "z z" that drifts up and fades (a soft, playful wink).
- Frame 80: in Rubik 64 px, word by word: **"Your stablecoins are sleeping."**

**Scene 2. The noise (150–330)**
- Floating pill tags drift in from the edges (soft surfaces, shadow only, no outlines, 3-frame stagger), slowly rotating ±4° and gently overlapping: `APY?`, `TVL`, `100+ protocols`, `40% APY 🤔`, `bridges`, `reward tokens`, `which chain?`, `is this safe?`.
- Centre, in Rubik 56 px: **"Earning on DeFi shouldn't feel like homework."**
- Frames 300–330: every tag drifts outward and fades as if a breath clears the room (exit with blur).

### Act II: The turn

**Scene 3. Introducing (330–450)**
- Pure canvas. The halftone bloom drifts to the centre.
- Geist Mono `INTRODUCING` fades in, then the logo builds: the green rounded square (rx 9) scales 0.96→1, the three coin bars rise into place bottom to top (5-frame stagger, `SPRING_UI`), and the wordmark **StableSave** reveals with a clip-path wipe over 18 frames.
- Hold for 30 frames, then the logo glides up and shrinks into the header position, becoming the site header (a FLIP move, `SPRING_SOFT`).

### Act III: The product

**Scene 4. One question (450–600)**
- Headline **"How much do you want to grow?"** appears word by word (Rubik 56 px).
- The **widget** rises (translateY 40→0, `SPRING_SOFT`): the white card with `SHADOW_SOFT`, then the "You have" panel, then the round seam button (rotates -90°→0°), then the mint "You could earn in a year" panel. Everything starts empty: `$0`, `—`.

**Scene 5. The answer (600–900). This is the hero moment.**
- The cursor clicks the amount. The panel gets a soft 2 px mint inner glow.
- Type `1`, `0`, `0`, `0`, `0` (frames 630, 642, 652, 664, 674) with live comma formatting.
- After every keystroke the earnings **spring** (+$0.05 → +$0.51 → +$5 → +$51 → **+$512**). The Maple pill blurs in on the first keystroke.
- Frame 720: gentle camera push-in on the answer panel (scale 1 → 1.14, 60 frames).
- Frame 790: `at 5.12% a year` fades in, then the round **A Safer** chip pops (scale 0.96→1).
- Caption (Geist Mono, `ink2`, lower third): `TYPE AN AMOUNT. SEE WHAT IT COULD EARN.`

**Scene 6. Your comfort (900–1080)**
- The camera eases back. The cursor taps **Go bigger**: the pill indicator slides, the earnings spring up, the pick crossfades (grade C, amber chip).
- It taps **Play it safe**: the earnings spring back down, the chip turns green.
- Caption: `PICK YOUR COMFORT. WE DO THE MATH.`

**Scene 7. The whole market (1080–1320)**
- The camera glides down (translateY -520, scale 0.84, 72 frames, motion blur) to the soft white list card (radius 28, no outlines).
- Eight rows stagger in. The sort switches to **Highest rate** and rows **reorder with FLIP springs**, then switch back.
- A quiet line types in: `Best grade-A USDC today 6.19% · 150 options across 56 apps`.
- Caption: `EVERY OPTION. ONE CLEAR SAFETY GRADE.`

**Scene 8. Under the hood (1320–1560)**
- Tap the Maple row. The **side panel** slides in from the right (radius 28, `SPRING_SOFT`) while the page softly blurs (6 px) and dims.
- The rate chart draws left to right (48 frames) with a faint mint area underneath. The end dot pulses once.
- The safety ring fills to **87**, then the five factor bars fill with a 4-frame stagger, labelled in plain English:
  - "How established the app is"
  - "Size of the pool"
  - "How steady the rate is"
  - "Real interest vs. bonuses"
  - "Time running"
- Caption: `SEE THE RISK, NOT JUST THE RATE.`

### Act IV: The promise

**Scene 9. The hand-off (1560–1680)**
- Settle on the full-pill black CTA **"Go to this pool on app.maple.finance ↗"**. The cursor presses it (0.97).
- A shield icon and line type in: **"You deposit on the official app. We never touch your money."**

### Act V: Resolution

**Scene 10. End card (1680–1800)**
- Fade (12 frames) to canvas with the halftone arcs at their most visible, still faint.
- The logo builds again (same as Scene 3, faster). Under it, in Rubik 34 px `ink2`: **"Find where your stablecoins earn the most."**
- Below, in Geist Mono: `stablesave.vercel.app` and `NO WALLET · NO SIGN-UP · FREE`.
- Final 40 frames: completely still. Only the halftone keeps breathing.

## 7. Vertical cut (`Launch9x16`)
- Same story and timing. The widget renders at 1.3× and is centred at y = 760. Captions sit at y = 1500, clear of platform UI.
- Scene 2's tags fill the tall frame. In Scene 7 the list replaces the widget (blur crossfade). In Scene 8 the panel rises as a **bottom sheet** (radius 28 top corners), matching mobile.

## 8. Sound
- One warm, understated track around 96–100 BPM: soft keys or plucked synth, no drops.
- **SFX at about -24 dB:**
  - a soft tick per keystroke
  - a muted "tock" per click
  - a gentle low swell when +$512 lands (frame 674)
  - a soft whoosh for the noise clearing (frame 300)
- Leave 6 frames of silence at the end.

## 9. Quality checklist (verify before rendering)
- [ ] All rates, names and logos come from `opportunities.json` and the copied scoring code.
- [ ] No outlines or borders on any UI element, and no colour gradients in the background.
- [ ] Rubik is used for every headline and number.
- [ ] The halftone is grey and barely visible, and it never stops or cuts.
- [ ] Nothing scales from 0, and every number springs.
- [ ] The story reads with the sound off: problem → turn → product → promise → logo.
- [ ] Text is at least 24 px at 1080p (32 px in the vertical cut), and captions stay up at least 1.5 s.
- [ ] Logos are crisp PNGs. The last 40 frames are still.
- [ ] Scrub every scene at 0.25× in Remotion Studio before the final render.

## 10. Commands
```bash
cd video && npx remotion studio
npx remotion render Launch16x9 out/stablesave-16x9.mp4 --codec=h264 --crf=16
npx remotion render Launch9x16 out/stablesave-9x16.mp4 --codec=h264 --crf=16
npx remotion render Teaser out/stablesave-teaser.mp4 --codec=h264 --crf=16
npx remotion render Launch16x9 out/stablesave-master.mov --codec=prores --prores-profile=4444
```
