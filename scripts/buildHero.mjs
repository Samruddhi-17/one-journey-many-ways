/*
 * buildHero.mjs — derives the cover artwork from the design reference.
 *
 * WHY THIS IS A SCRIPT AND NOT A ONE-OFF. `src/assets/hero-vista.jpg` is a DERIVED file: every number
 * below is a measurement of `images/Main Page.png`, and if that reference is ever redrawn the crop has
 * to be re-derived rather than re-guessed. Committing the recipe next to the output is what lets the
 * next person change it. It is deliberately NOT wired into `npm run build` — the reference is authored
 * art that changes rarely, and rebuilding a half-megabyte JPEG on every install is work nobody asked
 * for. Run it by hand: `node scripts/buildHero.mjs`.
 *
 * ============================================================================================
 * IT KEEPS ALMOST THE WHOLE FRAME, AND THAT IS THE POINT.
 *
 * An earlier version of this script cut a 740x772 window out of the middle of the reference — just the
 * traveller, the dog and the horizon. That threw away most of the artwork: Fuji, the pagoda, the
 * signpost, the Empire State building, the enamel mug and the open journal were all outside the window.
 * The reference is a composed scene where those props carry the whole idea of a journey being recorded,
 * and the crop reduced it to two figures on a hill. It also came out at 1.45 aspect, narrower than a
 * desktop viewport, so the browser then magnified it and cropped the sides a second time.
 *
 * So the window is nearly the reference's full height, and stops short of its right edge. Three bands
 * come off:
 *
 *   top: 100    Drops the reference's own header row (its nav and its "Journey Journal" card, y29-83).
 *               Those are interface, and the page renders live HTML versions of both.
 *   right: 1215 Drops the five-plank signpost, which the reference paints from x1222 to its right edge.
 *               See the note below — this one throws away scenery, and did so on purpose.
 *   bottom: 902 Stops just ABOVE the baked postmark (from y906) and "SCROLL TO EXPLORE" (from y939).
 *               Both are absent from the file rather than painted over.
 *
 * Result: 1215x802 at 1.51 aspect, upscaled 2x.
 *
 * ============================================================================================
 * THE SIGNPOST IS CROPPED OFF, AND IT TAKES TWO LANDMARKS WITH IT.
 *
 * The reference's right-hand third is a wooden signpost whose five planks read JAPAN, INDIA, ITALY,
 * SWITZERLAND, UNITED STATES. The site's whole structure is that the itinerary is revealed a country at a
 * time as a visitor travels — so a cover that carves all five names into the artwork answers the question
 * the rest of the site is built to ask. It was kept for one iteration at the user's explicit request and
 * then removed at the user's explicit request; this note records the cost rather than the preference.
 *
 * Measured, the planks' left tips reach x1222 (the JAPAN board is the widest), so x1215 is the last column
 * with no signpost in it. But the composition puts the Empire State building at x~1440 and the Golden Gate
 * bridge at x~1515 — BEHIND and beside the planks, not clear of them. There is no vertical cut that takes
 * the boards and leaves those two, so cropping the names necessarily loses them.
 *
 * What survives: Fuji, the pagoda, the Taj Mahal, the Colosseum, the Alps, the lake and villages, the
 * traveller, the dog, the enamel mug and the open journal. Two of the five countries lose their landmark
 * from the cover; both still have their own photography on their own pages, which is where the reveal is
 * supposed to happen anyway.
 *
 * The aspect drops from 1.92 to 1.51, which the page's cover box must follow — see the `aspect-[...]`
 * note in src/pages/HomePage.jsx. A 1.51 asset is NARROWER than a desktop viewport, so `object-cover`
 * now trims the top and bottom rather than the sides at every width. That is why the crop keeps every
 * row it can: the vertical margin is what absorbs the difference.
 *
 * BOTTOM WAS 838 FOR SEVERAL ITERATIONS, AND THAT WAS A MEASUREMENT ERROR WORTH RECORDING. It came from
 * scanning for `luminance > 200` below y836 and taking the first hit as the postmark. But this frame is a
 * sunlit rock face at golden hour: the enamel mug, the journal's pages and the rock's own specular
 * highlights all clear 200 easily. The scan was finding the photograph, not the interface.
 *
 * The two baked marks are NEUTRAL white — they are UI chrome, so their saturation is near zero, whereas
 * every bright thing in the photograph is warm. Re-scanning for `r > 200 && saturation <= 10` puts the
 * postmark at y906-986 and "SCROLL TO EXPLORE" at y939-984, with 68 clean rows in between that the old
 * bound was discarding. Those rows contain the bottom of the UNITED STATES plank, which was visibly
 * sheared off in the rendered cover. Brightness alone could not tell ink from sunlight here; the colour
 * of the brightness could.
 *
 * ============================================================================================
 * WHY THE BOTTOM IS CROPPED RATHER THAN REPAIRED, after eight attempts at repairing it.
 *
 * Both baked marks sit on dark rock, and every technique tried to remove them left something visible:
 *
 *   1. A narrow clean column stretched SIDEWAYS across the gap. Sky is near-uniform along x, nothing
 *      else in the frame is — it dragged the pagoda roof and the backpack across the picture.
 *   2. A low-pass (downsample to ~14px, resample up). It cannot leave a letterform behind, because the
 *      letters end up under a pixel — but it PRESERVES LARGE DARK SHAPES, so the dark pill button
 *      survived as an obvious grey bar.
 *   3. A hard blur (sigma 60). It removed every mark and the scene with them: an empty smear.
 *   4. A row-bridge crossfade. Right in principle for a frame whose tone changes down the picture, and
 *      it still left ghosts, because a patch must be oversized by its own feather width and mine were
 *      not.
 *   5. Patching with a flipped piece of real rock from elsewhere in the frame. Genuine texture, but the
 *      source region contained the dog's tail, so the fix duplicated the tail onto the ground.
 *   6. Averaging each ROW of the photograph's left edge to one colour and stretching it out. Averaging a
 *      column that crosses a mountain, a treeline and a rock face gives a DIFFERENT mean every few rows,
 *      so it produced ~40 hard horizontal stripes: the structure moved from x into y rather than
 *      disappearing. This one reached a screenshot, which makes it the most worth recording —
 *      "removing detail" and "removing structure" are not the same operation.
 *   7. A local-MIN filter over the two marks, to erode thin bright strokes. It darkened every pixel in
 *      the window, not only the strokes, so the two regions came out as solid black rectangles.
 *   8. A brightness-selective median: replace only pixels above a luminance threshold with the median of
 *      the dark rock around them. Closest of the eight, and still visibly ghosted — the strokes are
 *      anti-aliased, so their dim edges fall below any threshold that spares the rock's own highlights.
 *
 * The honest answer was always the cheapest one: crop above them. Nothing is invented, and the only cost
 * is 22px of rock — the marks sit lower in the frame than the bad `luminance > 200` scan suggested.
 *
 * ============================================================================================
 * THE LEFT TYPE ZONE IS VEILED, AND THAT WORKS FOR A MEASURED REASON.
 *
 * The reference has its headline, three cover lines, a dark pill button and a handwritten aside baked
 * into the left of the frame. None of that can ship inside a photograph — text in an image cannot be
 * selected, translated, resized, restyled or read aloud, and the live HTML renders the same words.
 *
 * Sampled, the haze that type sits on is 254,254,254 — within two units of `--color-surface-page`. So an
 * opaque cream veil over that zone is not a patch covering something up; it is the same colour the
 * region already is. That is why this succeeds where all eight repairs above failed: there is no texture
 * to reconstruct, because there was almost none there.
 *
 * The veil is TAPERED rather than rectangular, and that is the whole trick — see `VEIL_EDGE`.
 *
 * `4:4:4` chroma rather than the JPEG default: the picture's most important edges are the warm pack
 * against cool haze and the white dog against dark rock, which are chroma transitions, and 4:2:0 halves
 * the resolution of exactly those.
 */
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "images", "Main Page.png");
const OUT = path.join(root, "src", "assets", "hero-vista.jpg");

/* The window, measured. See the header note for where each bound comes from. */
const TOP = 100;
const BOTTOM = 902;
const WIDTH = 1215;
const HEIGHT = BOTTOM - TOP;

/* `--color-surface-page`, kept in sync with src/styles/tokens.css by hand. Hard-coding it is acceptable
   in a build script that cannot read CSS custom properties; getting it wrong would show as a visible
   seam where the cover meets the page, which is a loud failure rather than a silent one. */
const CREAM = [253, 249, 243];

/* THE VEIL IS TAPERED, BECAUSE A RECTANGLE CANNOT BE THE RIGHT SHAPE HERE.
   Two rectangular versions were tried and each failed in the opposite direction:

     x0=500, x1=665  Covered every baked letter, and made a third of the cover's width flat cream. Rendered
                     full-bleed, the photograph appeared not to start until ~650px in.
     x0=250, x1=560  Left the photograph reaching the left edge, and let the tails of the baked type show
                     through the gaps between the live lines: "come", "me.", "-eight days.", "JOURNEY" all
                     read clearly in a screenshot.

   The reason neither width works is that both the type's right edge AND the scenery's left edge move down
   the frame, in opposite directions. Measured on the reference:

     the baked type reaches   x498 (headline line 1) -> x424 ("with me.") -> x389 (cover lines, button)
                              -> x290 (the handwritten aside)
     the artwork begins at    nothing before y280 (the 75th-percentile luminance is 244-254 — page cream —
                              all the way out to x680), then Fuji from ~y298, the pagoda from ~y360, and
                              dark foliage reaching the left edge by ~y700

   So above y285 a veil out to x505 costs nothing at all, and below y650 one out to x300 is all that is
   needed. `VEIL_EDGE` is that boundary as (y, x) control points, linearly interpolated; the veil is opaque
   inside it and ramps out over VEIL_RAMP px. The one genuine cost is around y430-545, where the cover
   lines end at x389 and the pagoda's left roof edge starts at about the same place: those few pixels of
   roof take a soft cream haze. The pagoda's body is untouched, and haze is what the reference already has
   there, so it reads as depth rather than as damage. */
const VEIL_EDGE = [
  [100, 505],
  [285, 505],
  [310, 440],
  [420, 415],
  [440, 405],
  [560, 405],
  [650, 410],
  [700, 330],
  [902, 300],
];
const VEIL_RAMP = 95;

/* The veil fades out over the bottom rows, and the fade runs all the way to the crop's bottom edge ON
   PURPOSE. Fading out over ~30 rows just above the enamel mug would protect the mug but leave a hard
   horizontal line at the left edge, where the dark foliage suddenly reappears at full strength. Ending the
   fade exactly where the picture ends means the veil has no bottom edge to see.

   y790 is the last row that has to be fully covered: the handwritten aside's descenders reach y789, and
   the mug's rim starts at about y795. The two barely miss each other, which is why the fade starts here
   and not ten rows either side. */
const VEIL_Y = 790;
const VEIL_FADE = BOTTOM - VEIL_Y;

const SCALE = 2;

const { data, info } = await sharp(SRC)
  .removeAlpha()
  .extract({ left: 0, top: TOP, width: WIDTH, height: HEIGHT })
  .raw()
  .toBuffer({ resolveWithObject: true });

const channels = info.channels;
const pixels = Buffer.from(data);

/* Smoothstep, so the veil has no visible start or end — a linear ramp shows both. */
const smoothstep = (t) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/* VEIL_EDGE read as a piecewise-linear function of the reference's y. */
const veilEdgeAt = (refY) => {
  if (refY <= VEIL_EDGE[0][0]) return VEIL_EDGE[0][1];
  for (let i = 1; i < VEIL_EDGE.length; i++) {
    const [y0, x0] = VEIL_EDGE[i - 1];
    const [y1, x1] = VEIL_EDGE[i];
    if (refY <= y1) return x0 + ((x1 - x0) * (refY - y0)) / (y1 - y0);
  }
  return VEIL_EDGE[VEIL_EDGE.length - 1][1];
};

for (let y = 0; y < HEIGHT; y++) {
  const refY = y + TOP;
  const vertical =
    refY > VEIL_Y ? 1 - smoothstep((refY - VEIL_Y) / VEIL_FADE) : 1;
  if (vertical <= 0) continue;

  const edge = veilEdgeAt(refY);
  const limit = Math.min(WIDTH, Math.ceil(edge + VEIL_RAMP));

  for (let x = 0; x < limit; x++) {
    const alpha = vertical * (1 - smoothstep((x - edge) / VEIL_RAMP));
    if (alpha <= 0) continue;

    const i = (y * WIDTH + x) * channels;
    for (let k = 0; k < 3; k++) {
      pixels[i + k] = Math.round(
        pixels[i + k] * (1 - alpha) + CREAM[k] * alpha,
      );
    }
  }
}

await sharp(pixels, {
  raw: { width: WIDTH, height: HEIGHT, channels },
})
  /* Lanczos plus a mild unsharp. The upscale is a real cost, stated rather than hidden: the reference is
     only 1536px wide and the cover spans the viewport. It holds up because this frame is haze, foliage,
     fabric and fur, none of which has the hard geometric edges that make an upscale obvious. */
  .resize({ width: WIDTH * SCALE, height: HEIGHT * SCALE, kernel: "lanczos3" })
  .sharpen({ sigma: 0.7, m1: 0.3, m2: 0.8 })
  .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(OUT);

const { width, height } = await sharp(OUT).metadata();
console.log(
  `hero-vista.jpg  ${width}x${height}  aspect ${(width / height).toFixed(2)}  ${(
    statSync(OUT).size / 1024
  ).toFixed(0)} KB`,
);
