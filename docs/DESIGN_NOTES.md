# Design notes: HackerRank Campus Crew

Source: https://www.hackerrank.com/campuscrew (studied 7 Oct 2026 at 1440 px wide).
Values below were read from the live page's computed styles, not guessed.

## 1. Background

- **Page:** near-black `#0B0A0A`. Header bar is `#141419`, sticky, 72 px tall, no blur, no border line.
- **Hero is a card, not the whole page:** 20 px inset from the edges, `border-radius: 20px`, pure black `#000`.
- **Hero texture:** a faint square grid drawn in one SVG (thin grey lines on black), plus a soft green glow behind the card. The grid makes it feel "techy" without noise.
- **Sections are separated by space, not boxes.** Large vertical gaps (around 120–160 px). Thin dashed and solid lines connect cards in the "About" section like a flow chart.
- **Few colours:** black, white, and one loud accent (lime `#AEF96C`). Card colours (lime, cobalt blue, lavender) only appear inside cards.

## 2. Type

- **Display font:** `PP Mondwest` (Pangram Pangram). A serif with pixel-cut edges, half retro computer, half editorial. Weight 400 only; it is never bolded.
  - H1: 32 px, UPPERCASE, letter-spacing 4.2 px (≈0.13em). Wide tracking makes a small size feel grand.
  - H2: 40 px, sentence case ("What you'll do", "Meet Our Crew").
  - Card titles: 24 px.
- **Body font:** `Satoshi` (Fontshare). Regular 400, Medium 500 for nav, Bold 700 for buttons.
  - Hero subtitle: 24 px / 36 px line height, max width ~795 px, centred.
  - Feature titles: 20 px / 28 px, regular, not bold.
  - Nav links: 14 px, weight 500, letter-spacing −0.28 px (slightly tight).
- **Rule they follow:** one quirky display font for headings only; one clean sans for everything else. Headings are never bold; contrast comes from the font itself and from size.

## 3. Stickers

- **What they are:** die-cut sticker illustrations (SVG and WebP) with a thick white border and rounded corners, like laptop stickers. Objects: a retro handheld console with a group photo, a Game Boy, a vinyl record "NOW PLAYING · CAMPUS CREW MIX", a round "CAMPUS AMBASSADOR PROGRAM" globe badge, the HackerRank logo tile, and tag stickers "Host / Coach / Build".
- **Placement:**
  - All in one cluster along the **bottom edge of the hero card**, below the buttons. The text area above stays completely clean.
  - Stickers **overlap each other** and **bleed off the card edges** (left edge and bottom are cropped by the card's rounded corners). That cropping makes the card feel like a real pile of stickers.
  - Each one is **rotated a little, in different directions:** about +15°, +16°, −27°, −60°, −12°. Never 0°, never all the same way.
  - Sizes vary from about 90 px to 530 px, so there is a clear big/medium/small rhythm.
- **Motion (subtle, looping):**
  - Vinyl and globe text rings spin slowly (`crew-spin`, 10–12 s, linear, infinite; the vinyl only spins on hover).
  - The console screen "PLAY" text blinks in hard steps (`crew-blink-step`, 1 s), like an old screen.
  - Nothing bounces or flies in.
- **About section cards** reuse the sticker idea: a white rounded frame (about 24 px radius), a coloured inner card (lime, blue, lavender), a 3D push-pin at the top, tilted about ±15°, joined by dashed curved lines.

## 4. Buttons and nav

- **Primary button:** lime `#AEF96C` fill, near-black `#080809` text, Satoshi Bold 20 px, padding 18 × 32 px (60 px tall), radius 6 px, no shadow.
- **Secondary button:** transparent, lime text, a 1 px lime outline drawn with an inset box-shadow (so it does not shift layout), same size and radius.
- **Header:** dark bar; plain white links; the only filled element is a white pill button "Create a free account →" on the right. Nav dropdown items are 8 × 12 px padding, 8 px radius, light grey hover fill.
- **Member cards ("Meet Our Crew"):** thick white frame, black-and-white photo, name in regular weight, college in bold. A horizontal scroll row that runs off both edges.
- **FAQ:** full-width rows with 24 px padding, no boxes, just lines.

## 5. Why it feels premium

1. **Restraint:** black, white, one accent. Colour is a reward, not wallpaper.
2. **One personality font, used sparingly** and never bolded; everything else is calm Satoshi.
3. **Big, consistent spacing.** Text blocks are narrow and centred; nothing is crowded.
4. **Physical objects:** stickers, pins and frames have white borders and slight rotation, so the flat page feels tactile.
5. **Controlled chaos:** playful stickers are confined to one zone; the reading areas stay strict and aligned.
6. **Tiny motion only:** slow spins and blinks reward attention without distracting.
7. **Buttons are big and simple:** 60 px tall, flat, high contrast, small radius.

## 6. How to apply this to CSE Spotlight

- **Fonts:** Satoshi for body and UI (free for commercial use on Fontshare). For headings, PP Mondwest needs a license from Pangram Pangram for a public site; a free stand-in with a similar feel is "Pixelify Sans" or "Jersey 10" (Google Fonts). Use the display font for H1/H2 only, weight 400, wide tracking on the hero line.
- **Hero:** keep our lake photo in light mode, but make the hero a rounded card (20 px radius) inset from the page edges. Put a cluster of 5–7 stickers along its bottom edge, rotated −30° to +20°, overlapping and cropped by the card. Keep the title and buttons area clear.
- **Dark mode:** we already use pure black. Add the faint grid behind the hero card in dark mode only.
- **Accent:** we keep our blue as the main action colour and use gold only for awards. Do not add a third loud colour.
- **Buttons:** make the main buttons taller (48–56 px), Satoshi Bold, radius 6–8 px; the outline button uses an inset 1 px ring.
- **Category shelves:** frame achievement cards like stickers (white border, slight tilt on hover only), and tilt the four category headings' sticker icons a little.
- **Motion:** one slow spinning badge ("CSE SPOTLIGHT · CLASS OF 2029") and nothing else. Respect "reduce motion".
