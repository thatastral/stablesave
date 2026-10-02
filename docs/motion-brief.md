# StableSave launch film: motion brief

> **For Claude.** This is a complete production spec. Build the film exactly as written using **Remotion**. Before writing any code, load `remotion:remotion-best-practices`, and use `remotion:remotion-create` to scaffold. Don't invent new scenes, copy or colours. Where this brief gives a number, use that number.

---

## 1. The story

A **15-second** film (with an optional 30-second extended cut) with a beginning, middle and end. The structure comes from strong fintech launch films (kinetic problem statements, a single "Introducing" reveal, the product floating on a calm field, one confident closing line):

| Act | Feeling | Beat |
| --- | --- | --- |
| **I. The problem** | Mild frustration | Your dollars are sitting idle, and DeFi is noisy: jargon, a hundred apps, 40% APYs that feel like traps. |
| **II. The turn** | Relief | A quiet "Introducing StableSave". The noise falls away and leaves one simple question. |
| **III. The product** | Delight and clarity | Type an amount and see the answer. Change your comfort level. See the whole market and the risk. |
| **IV. The promise** | Trust | You deposit on the official app. We never touch your money. |
| **V. Resolution** | Calm confidence | Logo. "Find where your stablecoins earn the most." |

**One-line pitch:** *Your stablecoins are sleeping. StableSave shows where they could earn, how much, and how safe it is, in seconds, without a wallet.*

**Tone:** soft, warm and precise, like a calm friend who's good with money. **Dark mode** throughout. No hype, neon, 3D coins, lens flares or stock footage.

## 2. Deliverables

**The main film is 15 seconds.** It's short enough to watch to the end in a feed, and long enough to tell the whole story. The 30-second version is an optional extended cut for the website and YouTube.

| Cut | Size | FPS | Length | Composition id |
| --- | --- | --- | --- | --- |
| **Main (X, Reels, TikTok, site hero)** | 1920×1080 | 60 | **15 s (900 frames)**, see section 6A | `Main16x9` |
| **Main vertical** | 1080×1920 | 60 | **15 s**, see section 6A | `Main9x16` |
| Extended (optional) | 1920×1080 | 60 | 30 s (1800 frames), see section 6 | `Launch16x9` |
| Extended vertical (optional) | 1080×1920 | 60 | 30 s | `Launch9x16` |

Render as H.264 MP4 (CRF 16, `yuv420p`), plus a ProRes 4444 master of `Main16x9`. Build `Main16x9` first, then derive the others.

## 3. Project setup

1. Scaffold a separate Remotion project in `video/` at the repo root.
2. Install `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/noise`, `@remotion/media-utils` (audio waveforms and duration helpers). Use Remotion's `<Audio>` with `volume` callbacks for ducking.
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

The film is **dark mode**, matching the site's dark theme exactly (the founder's daily view). Never switch to light.

```ts
export const T = {
  canvas: "#0c0c0c",
  surface: "#171717",
  surface2: "#1d1d1d",
  sunken: "#222222",
  ink: "#f5f5f3",
  ink2: "#a9a9a5",
  ink3: "#6e6e6b",
  accent: "#2bd488",                        // growth, earnings
  accentSoft: "rgba(43,212,136,0.12)",
  accentInk: "#5be3a6",
  gradeA: ["#2bd488", "rgba(43,212,136,0.13)"],
  gradeB: ["#6b9bff", "rgba(107,155,255,0.14)"],
  gradeC: ["#f5a524", "rgba(245,165,36,0.14)"],
  brand: "#0FA968",                         // logo square only
  radius: { widget: 30, panel: 22, list: 28, pill: 999 },
};
// On near-black, surfaces lift with a faint top rim, never a dark halo or outline.
export const SHADOW_CARD = "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.25)";
export const SHADOW_SOFT = "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.3)";
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // entrances
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // camera
export const SPRING_UI = { damping: 26, stiffness: 170, mass: 0.7 };
export const SPRING_SOFT = { damping: 30, stiffness: 120, mass: 1 };
```

**Rules of the look:**
- **No outlines anywhere.** Surfaces separate by tint (`surface` on `canvas`, `surface2` inside cards) plus the faint top rim. **No big black drop shadows** under cards; on near-black they read as a stain.
- **Rounded corners everywhere.** Controls and chips are full pills.
- **No colour gradients** in the background.
- **Halftone backdrop** (the brand's signature texture): a grid of tiny grey dots, gap 13 px, max radius 1.9 px, colour `rgba(255,255,255,0.07)`. Dot size follows two soft orbit arcs framing the centre, strongest at the left and right edges, plus one slow drifting bloom. Port the field function from `src/components/Backdrop.tsx` into a Remotion `<AbsoluteFill>` canvas driven by `useCurrentFrame()`, so time equals frame × (1000/60). It must stay **very faint**: the viewer should feel it, not read it.
- **Type:** Rubik 600 headlines (tracking -0.02em to -0.03em), numbers in Rubik 600 with `tabular-nums`, small labels in Geist Mono uppercase at 0.06em tracking in `ink3`.
- The earnings number and the "Safer" chip are the only saturated colour in most frames. Keep it that way, so green means money.

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
11. **Picture follows sound:** every UI change lands on a sound cue from section 8, and every VO line has its matching on-screen beat. Sync to the frame.

## 6A. Main cut: 15 seconds (`Main16x9`, 900 frames)

The same five-act story, compressed. The same rules, look and sounds apply. This is the film to make first.

| Frames | Act | Picture | Voiceover | Key sound |
| --- | --- | --- | --- | --- |
| 0–90 | I. Problem | `YOUR USDC` / `$10,000` / `earning $0.00`, and the "z z" drifts up | "Your stablecoins are sleeping." (starts 8) | soft ticks per word, airy z-z |
| 90–180 | I. Problem | 6 jargon pills pop in fast (2-frame stagger), then clear with a breath at 165 | "Earning on them shouldn't be homework." (starts 95) | muted taps, long swell at 165 |
| 180–270 | II. Turn | silence beat (180–192), then logo build: square, three coins stack then tumble into the S, wordmark wipe | "Meet StableSave." (starts 200) | sub thump at 192, three rising notes, music chord |
| 270–540 | III. Product | the widget rises (270–300). Type `10000` (keys at 305, 313, 320, 328, 335). **+$512 lands at 335**. Push-in to 1.12 (350–400). `A Safer` pops at 400. Tap Go bigger (450) → C pick, then Play it safe (495) → back to A | "Type what you have… see what it could earn, and how safe it is." (starts 300) | rising ticks, **chime + swell at 335**, pop, taps and chimes |
| 540–690 | III. Product | glide to the list: 6 rows stagger in (540–580), tap Maple (600), the side panel slides in, the safety ring fills to 87 (620–680) | "Every option. One clear safety grade." (starts 555) | tick patter, open swell, rising tone |
| 690–780 | IV. Promise | CTA "Go to this pool on app.maple.finance ↗" is pressed at 705, then the shield line appears | "You deposit on the official app. We never touch your money." (starts 690) | firm tap + confirm notes |
| 780–900 | V. Resolution | end card: logo, "Find where your stablecoins earn the most.", URL. Still for the last 30 frames | "StableSave." (starts 790) | final resolved chord, tail |

**Notes:**
- If a VO line runs long, trim the picture beat before it. Never speed up the voice.
- The vertical version uses the same frames with the section 7 layout.

## 6B. Optional 3D (Spline)
A 3D moment isn't required. The 2D halftone and UI carry the film cleanly, and that's the recommended path. If a single "wow" beat is wanted, use the **Spline MCP** (available in this environment) for exactly one shot: a slowly rotating **dot-matrix globe** built from the same grey halftone dots, which the logo emerges from in the Act II reveal (frames 180–270). Export it as a transparent PNG sequence at 60 fps and composite it in Remotion. Keep it monochrome grey, faint, and under 1.5 s on screen.

## 6. Extended cut: scenes (`Launch16x9`, 30 s, 60 fps, absolute frames)

### Act I: The problem

**Scene 1. Asleep (0–150)**
- Near-black canvas plus halftone. Centre: Geist Mono label `YOUR USDC`.
- Below it, in Rubik 140 px: `$10,000`. Under that, an `ink3` line `earning $0.00` with a tiny "z z" that drifts up and fades (a soft, playful wink).
- Frame 80: in Rubik 64 px, word by word: **"Your stablecoins are sleeping."**

**Scene 2. The noise (150–330)**
- Floating pill tags drift in from the edges (soft surfaces, shadow only, no outlines, 3-frame stagger), slowly rotating ±4° and gently overlapping: `APY?`, `TVL`, `100+ protocols`, `40% APY 🤔`, `bridges`, `reward tokens`, `which chain?`, `is this safe?`.
- Centre, in Rubik 56 px: **"Earning on DeFi shouldn't feel like homework."**
- Frames 300–330: every tag drifts outward and fades as if a breath clears the room (exit with blur).

### Act II: The turn

**Scene 3. Introducing (330–450)**
- Pure dark canvas. The halftone bloom drifts to the centre.
- Geist Mono `INTRODUCING` fades in, then the logo builds: the green rounded square (rx 9) scales 0.96→1. **Three coins drop in as a perfectly level stack** (bottom, middle, top, 5-frame stagger, `SPRING_UI`). On the last landing they **tumble into the S**: top coin to −16°, middle to +20°, bottom to −16°, each sliding to its final offset (`SPRING_SOFT`, 2-frame stagger). Each coin has a thin lighter edge so it reads as a coin. The story in one beat: a stack of savings becomes *S* for StableSave. Then the wordmark **StableSave** reveals with a clip-path wipe over 18 frames.
- Hold for 30 frames, then the logo glides up and shrinks into the header position, becoming the site header (a FLIP move, `SPRING_SOFT`).

### Act III: The product

**Scene 4. One question (450–600)**
- Headline **"How much do you want to grow?"** appears word by word (Rubik 56 px).
- The **widget** rises (translateY 40→0, `SPRING_SOFT`): the white card with `SHADOW_SOFT`, then the "You have" panel, then the round seam button (rotates -90°→0°), then the mint "You could earn in a year" panel. Everything starts empty: `$0`, `—`.

**Scene 5. The answer (600–900). This is the hero moment.**
- The cursor clicks the amount. The panel gets a soft 2 px mint inner glow (`accent` at 45%).
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
- Tap the Maple row. The **side panel** slides in from the right (radius 28, `SPRING_SOFT`) while the page softly blurs (6 px) and dims to 50%.
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
- Settle on the full-pill CTA (light `ink` pill with dark text, as in dark mode) **"Go to this pool on app.maple.finance ↗"**. The cursor presses it (0.97).
- A shield icon and line type in: **"You deposit on the official app. We never touch your money."**

### Act V: Resolution

**Scene 10. End card (1680–1800)**
- Fade (12 frames) to the dark canvas with the halftone arcs at their most visible, still faint.
- The logo builds again (coins stack, then tumble into the S, same as Scene 3, faster). Under it, in Rubik 34 px `ink2`: **"Find where your stablecoins earn the most."**
- Below, in Geist Mono: `stablesave.vercel.app` and `NO WALLET · NO SIGN-UP · FREE`.
- Final 40 frames: completely still. Only the halftone keeps breathing.

## 7. Vertical cuts (`Main9x16` and `Launch9x16`)
- Same story and timing. The widget renders at 1.3× and is centred at y = 760. Captions sit at y = 1500, clear of platform UI.
- Scene 2's tags fill the tall frame. In Scene 7 the list replaces the widget (blur crossfade). In Scene 8 the panel rises as a **bottom sheet** (radius 28 top corners), matching mobile.

## 8. Sound design

Sound is half the film. Three layers, mixed so the voice always wins.

### 8.1 Layers and levels (LUFS target −14 integrated, true peak −1 dBTP)
| Layer | Role | Level |
| --- | --- | --- |
| **Voiceover** | The story | −16 LUFS short-term; everything ducks under it |
| **UI sound effects** | Make the product feel touchable | −24 to −20 dB |
| **Music bed** | Emotion and pacing | −26 dB under VO, −18 dB in gaps (auto-duck 6 dB, 120 ms attack, 400 ms release) |
| **Atmosphere** | Air and space | a very low room tone or soft tape hiss at −40 dB so silence never feels dead |

### 8.2 Music
- About 96 BPM, warm and minimal: felt piano or soft electric keys, a low sub pulse, light brushed percussion entering in Act III. Key of D major, which feels hopeful but not saccharine.
- **Arc:** Act I is sparse and slightly unresolved (a single repeating note). Act II is one bar of silence, then a warm chord on "Introducing". Act III adds the full gentle groove. Act IV strips back to keys only. Act V ends on a resolved chord with a 2 s natural tail.
- **Source:** licensed royalty-free (Artlist, Musicbed, or Epidemic, supplied by the founder as `video/public/audio/music.wav`), or generated with an AI music tool using the description above. Cut it on the beat to scene boundaries.

### 8.3 UI sound effects (cue sheet for the 30-second extended cut; the 15-second cut uses the key sounds in section 6A, same recipes)
Build these **procedurally** so they are licence-free and match the live site's sounds (`src/lib/sound.ts`): a small Node script synthesises each as a 48 kHz WAV into `video/public/audio/sfx/`, using the same recipes (pure sine tones with soft attacks and long exponential tails, through a gentle 2.6 kHz low-pass), then layers them with `<Audio>` at the frames below.

**Character: calm, soft and warm.** There are no noise-based swelles or raspy textures. A "swell" in this sheet means a slow-attack pair of low sine tones (as in the site's panel-open sound), optionally with a whisper of low-passed air at −40 dB.

| Frame(s) | Event | Sound |
| --- | --- | --- |
| 80–140 | Headline words land | `tick` per word, very soft, rising pitch 1900 → 2300 Hz |
| 120–150 | "z z" drifts | two tiny airy `tick`s, high-passed, panned slightly right |
| 160–290 | Each jargon tag floats in | muted `tap`s (−26 dB), random pitch ±5%, panned to each tag's x position |
| 300 | Noise clears | long `close` swell (0.8 s, 2400 → 300 Hz) with a reverse-cymbal swell |
| 330–360 | Silence | ~0.5 s of true silence (no music) before the reveal |
| 360 | "Introducing" | soft sub thump (60 Hz, 120 ms) + music chord |
| 372, 377, 382 | Logo coins stack, then tumble into the S | three soft ascending notes (D5, F♯5, A5) as they land, then one airy swell as they tilt into the S |
| 400 | Wordmark wipe | soft `open` swell |
| 470–540 | Widget assembles | `open` swell, then a `tap` as each panel settles |
| 615 | Cursor clicks amount | `tap` |
| 630, 642, 652, 664, 674 | Keystrokes | `tick` each, +1 semitone per keystroke |
| 630–674 | Earnings spring | quiet rising shimmer under the number (sine sweep 400 → 900 Hz, −30 dB) |
| **674** | **+$512 lands** | **`chime` (C6 + G6) + a low warm swell + music lifts.** This is the emotional peak |
| 790 | "A Safer" chip pops | `pop` |
| 930 | Tap Go bigger | `tap`, then `chime` lower and slightly detuned (riskier) |
| 1010 | Tap Play it safe | `tap`, then clean `chime` |
| 1080–1150 | Camera glides to list | long soft swell with motion blur |
| 1150–1200 | Rows stagger in | soft `tick` patter (8 ticks, 3 frames apart, falling pitch) |
| 1230 | Sort reorders | quick `tap` + a "shuffle" of 4 tiny ticks |
| 1340 | Tap Maple row | `tap` + `open` swell as the panel slides in |
| 1370–1418 | Chart draws | rising filtered pad (400 → 1600 Hz) ending in a tiny `pop` on the end dot |
| 1430–1480 | Safety ring fills to 87 | gentle rising tone with 5 soft `tick`s as factor bars fill |
| 1600 | CTA press | firm `tap` (lower, 300 Hz) + soft "confirm" two-note `select` |
| 1690–1720 | End-card logo build | three ascending notes (as in Scene 3, softer) + final resolved chord |
| 1760–1800 | Hold | only music tail and room tone |

**SFX rules:** nothing harsh, nothing sharper than a soft tick, no "cash register" or coin-clink clichés. Less is more: if a beat already has VO, its sound effect sits 3 dB lower or is dropped. Pan gently to where the element sits on screen (±20%). Keep pitches in key (D major or neutral).

### 8.4 Voiceover

**Voice:** warm, calm, conversational, about 30 years old, mid-low register. Think a friend who's good with money, not an announcer. Neutral accent, unhurried, slight smile. ~140 words per minute.

**How to produce it:**
- **Preferred:** ElevenLabs text-to-speech via its API, using a calm conversational voice with stability around 0.5, similarity 0.75 and style 0.2. The founder supplies `ELEVENLABS_API_KEY`. Claude never hard-codes keys.
- **Alternative:** the founder records each line on a phone in a quiet room. Each line goes in its own WAV in `video/public/audio/vo/`.
- Trim breaths, add a gentle de-esser and compressor (3:1), and add 80 ms of room tone at each line's head and tail.
- Burned-in **captions follow the VO word by word** (Rubik 500, 34 px, `ink`, lower third, with key words such as "+$512" and "never touch" in `accentInk`). Ship an `.srt` too.

**Script (each line lands on its frame):**

| Line | Starts at | Text |
| --- | --- | --- |
| VO1 | 20 | "Right now, your stablecoins are probably just… sleeping." |
| VO2 | 175 | "And making them earn means wading through jargon, a hundred apps, and rates that feel too good to be true." |
| VO3 | 345 | "So we made it simple." |
| VO4 | 455 | "Tell us how much you have…" |
| VO5 | 690 | "…and see what it could earn. Instantly." |
| VO6 | 910 | "Play it safe, or go bigger. We do the math." |
| VO7 | 1100 | "Every option across DeFi, each with one clear safety grade." |
| VO8 | 1350 | "See the risk, not just the rate." |
| VO9 | 1570 | "When you're ready, you deposit on the official app. We never touch your money." |
| VO10 | 1700 | "StableSave. Find where your stablecoins earn the most." |

Captions from section 6 are replaced by these VO captions. Where both exist, the VO caption wins. If a VO line runs long, extend the scene by up to 20 frames rather than rushing the read, and shift later frames to match.

### 8.5 Short-cut audio and silent versions
- The VO script in the table above is for the 30-second extended cut. The 15-second main cut uses the shorter lines in section 6A.
- Also render a **silent-autoplay** version of `Launch9x16` (social feeds start muted) where captions alone carry the story.

## 9. Quality checklist (verify before rendering)
- [ ] All rates, names and logos come from `opportunities.json` and the copied scoring code.
- [ ] No outlines or borders on any UI element, and no colour gradients in the background.
- [ ] Rubik is used for every headline and number.
- [ ] The halftone is grey and barely visible, and it never stops or cuts.
- [ ] Nothing scales from 0, and every number springs.
- [ ] The story reads with the sound off (captions) **and** with eyes closed (VO and sound effects): problem → turn → product → promise → logo.
- [ ] Every UI change has its sound cue, synced to the frame. The VO is never masked by music or effects. The mix hits −14 LUFS.
- [ ] The film is dark mode throughout, with no black halo shadows under cards.
- [ ] Text is at least 24 px at 1080p (32 px in the vertical cut), and captions stay up at least 1.5 s.
- [ ] Logos are crisp PNGs. The last 40 frames are still.
- [ ] Scrub every scene at 0.25× in Remotion Studio before the final render.

## 10. Commands
```bash
cd video && npx remotion studio
npx remotion render Main16x9 out/stablesave-15s.mp4 --codec=h264 --crf=16
npx remotion render Main9x16 out/stablesave-15s-vertical.mp4 --codec=h264 --crf=16
npx remotion render Main16x9 out/stablesave-15s-master.mov --codec=prores --prores-profile=4444
# optional extended cut
npx remotion render Launch16x9 out/stablesave-30s.mp4 --codec=h264 --crf=16
```
