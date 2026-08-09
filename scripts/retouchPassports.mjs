/*
 * retouchPassports.mjs
 *
 * Paints the misspelled lettering off the traveller illustrations' passport covers.
 *
 * ============================================================================================
 * WHY THIS SCRIPT EXISTS, AND WHY THE EDIT IS A REMOVAL RATHER THAN A CORRECTION
 *
 * The five traveller portraits are illustrations, and in each one the figure holds a passport with
 * words painted on the cover. The words are wrong, differently in each image:
 *
 *   japan        "PASSPORT" across the top, then "JAPAN PASSPORT" again below the globe. The word
 *                is simply on the cover twice.
 *   italy        "PASSAPDRIO" and "REPURSTICA TIALLANA". Neither is a word. (It was reaching for
 *                PASSAPORTO and REPUBBLICA ITALIANA.)
 *   switzerland  "SWISS CONFEDERATION" set so wide that it runs off the cover and under the hand.
 *   us           "UNITEO STATES OF AMERICA". The D of UNITED came out as an O.
 *   india        Clean. Not touched. It is in the manifest with no row bands, as a record that it
 *                was examined rather than skipped.
 *
 * A visitor caught this. It cannot be fixed in CSS, because it is not layout: the glyphs are pixels
 * in the artwork.
 *
 * THE LETTERING IS REMOVED AND NOTHING IS WRITTEN BACK. Setting the correct words in real type was
 * the obvious alternative and it was rejected for two reasons. Hand-set type over painted artwork
 * reads as pasted on. More importantly, it would make this project the author of a claim about what
 * each country's passport cover says. A navy cover with an embossed emblem and no title is a real
 * object; a navy cover with wording we invented is a small fabrication in a picture of a document.
 * The project refuses invented facts elsewhere, and this is that rule applied to pixels.
 *
 * WHY A SCRIPT AND NOT AN IMAGE EDITOR. The edit has to be reproducible and reviewable. A script
 * states exactly what was altered and how. A binary that arrives already retouched states nothing,
 * and the next person cannot tell a deliberate edit from a corrupted asset.
 *
 * Run with `npm run retouch`. Idempotent: the mask is found by looking for pixels that depart from
 * the cover's own smooth shading, so on an already-clean cover it selects nothing and the file is
 * rewritten unchanged. It does not touch the generated public assets; `npm run data` re-encodes from
 * images/, so the pipeline picks this up on the next build like any other source change.
 * ============================================================================================
 */

/*
 * HOW THE LETTERING IS FOUND. Four approaches preceded this one. Each failed on the artwork rather
 * than in principle, so they are recorded here to stop them being tried again.
 *
 *   1. SELECT THE GOLD BY COLOUR. The same warm gold appears in the figure's skin, the tan
 *      backpack and the jacket highlights, and the hand overlaps the cover in three of the four
 *      images. A colour mask ate fingers.
 *
 *   2. PAINT OVER EXPLICIT RECTANGLES, taking the replacement colour from a column of clean cover
 *      beside each one. Removes the words, but a rectangle is the wrong shape for the job: it also
 *      covers the clean cover between and around the letters, so the repair has to invent that
 *      area too, and the seams of the rectangle stay visible as a faint panel. It also cannot
 *      reach letters that pass behind a hand without painting over the hand.
 *
 *   3. INTERPOLATE ACROSS EACH RECTANGLE from clean cover on both sides. Four of the six
 *      rectangles have no clean cover on their right, because the wording runs out to the cover's
 *      lit edge or behind the hand, which is exactly why it needed removing.
 *
 *   4. FILL EACH ROW FROM A SINGLE SAMPLE COLUMN. Stretches one column's noise sideways, which
 *      reads as horizontal striping, and it still cannot follow shading that varies across the
 *      band.
 *
 * What works instead has three parts.
 *
 * FIND THE COVER, not a rectangle. The cover is the largest navy region in the image. Taking the
 * span between its leftmost and rightmost pixel on each row recovers the part a hand crosses in
 * front of, which matters: Switzerland's final letters sit there, and a mask built from the navy
 * region alone left "ION" behind.
 *
 * FIND THE INK BY ITS DEPARTURE FROM THE COVER'S OWN SHADING. Each row of the cover inside a band
 * is fitted with a quadratic in x, refitted a few times with outliers dropped. That curve is what
 * the cover would look like with nothing painted on it. Anything far from it is lettering, and this
 * catches the gold, its dark drop shadow and its pale highlights in one test, without naming a
 * single colour. Colour tests kept missing the highlights, which then survived as specks and, worse,
 * anchored the repair to a bright value that bled warmth across it.
 *
 * REPAIR BY DIFFUSION. The masked pixels relax to the average of their neighbours while the clean
 * cover around them is held fixed. The result is smooth by construction, so there are no seams and
 * no streaks, and it follows shading in both directions rather than only across.
 */
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

/*
 * The row bands to search, per file, as [firstRow, lastRow] in source pixels with y downward.
 *
 * ROWS ONLY, NOT RECTANGLES. Horizontal extent comes from the cover itself, so the only thing that
 * has to be stated is which lines of the artwork are the unwanted wording. That is the one judgement
 * a script cannot make: the correctly spelled "PASSPORT" at the top of the Japanese, Swiss and
 * American covers reads identically to the machine and has to stay.
 *
 * The bands were not estimated. Grouping the cover's contiguous rows of painted-on ink gives, per
 * image, the bands below alongside the ones kept, and the numbers here are those groups widened by
 * a few rows so a band ends where the surface is flat again rather than where the ink stops. The
 * type has a drop shadow, and ending at the ink left the shadow just outside the mask.
 *
 *   japan  631-698 PASSPORT (kept)  732-872 globe (kept)  887-966 JAPAN PASSPORT  981-1005 chip (kept)
 *   italy  528-577 PASSAPDRIO  588-672 globe (kept)  682-739 REPURSTICA TIALLANA  752-760 rule (kept)
 *   swiss  534-619 PASSPORT (kept)  641-779 shield (kept)  798-898 SWISS CONFEDERATION
 *   us     511-578 PASSPORT (kept)  592-738 shield (kept)  743-825 UNITEO STATES OF AMERICA
 */
const TARGETS = [
  {
    file: 'images/japan/traveler_japan.png',
    note: 'Removes the lower "JAPAN / PASSPORT". The upper PASSPORT, the globe and the chip stay.',
    rows: [[878, 974]],
  },
  {
    file: 'images/italy/italy_traveler.png',
    note: 'Removes "PASSAPDRIO" above the globe and "REPURSTICA / TIALLANA" below it. The globe and the small rule beneath it stay.',
    rows: [
      [520, 585],
      [674, 748],
    ],
  },
  {
    file: 'images/switzerland/switerland_traveler.png',
    /*
     * The awkward one. "CONFEDERATION" is set so wide that its last letters pass behind the hand,
     * which is the defect that made the wording unreadable in the first place. They are inside the
     * mask because the cover is measured by its per-row span rather than as a connected region;
     * the hand itself is excluded separately, so the letters go and the fingers stay.
     */
    note: 'Removes "SWISS / CONFEDERATION", including the letters behind the hand. The shield and the upper PASSPORT stay.',
    rows: [[790, 906]],
  },
  {
    file: 'images/us/us_traveler.png',
    /*
     * This band starts at 741 rather than at 735 where the ink group does. Six rows higher it
     * catches the lower tip of the shield's glow, and repairing that made the script non-idempotent:
     * a second run found the glow's new edge and repaired it again.
     */
    note: 'Removes "UNITEO STATES / OF AMERICA". The shield stays, and the upper PASSPORT is spelled correctly so it stays too.',
    rows: [[741, 833]],
  },
  {
    file: 'images/india/traveler_india.png',
    note: "India's cover is clean. Listed with no rows so it is on the record as examined, not skipped.",
    rows: [],
  },
]

/*
 * How far a pixel's luminance may sit from its row's fitted curve before it counts as ink, summed
 * over the three channels. Flat cover stays within about 15. The lettering, its shadow and its
 * highlights are all past 100. The value between them is not delicate.
 */
const INK_DEVIATION = 48

/* Grow the ink mask by this many pixels so the glyphs' soft edges are inside it, not beside it. */
const INK_GROW = 4

/* Diffusion passes. The mask is at most a couple of hundred pixels across, so this is ample. */
const RELAX_PASSES = 600

/* ------------------------------------------------------------------------------------------
 * Small binary-image helpers. These are the handful of morphology operations the mask needs,
 * written out rather than pulled in, because a five-image one-off retouch is not worth adding an
 * image-processing dependency to the project for.
 * ------------------------------------------------------------------------------------------ */

/** Dilate or erode by a 3x3 square, `times` over. A 9x9 erosion is four 3x3 erosions. */
function morph(mask, width, height, times, dilate) {
  let src = mask
  for (let pass = 0; pass < times; pass++) {
    const out = new Uint8Array(src.length)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let hit = dilate ? 0 : 1
        for (let dy = -1; dy <= 1 && hit === (dilate ? 0 : 1); dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy
            const nx = x + dx
            /* Outside the image counts as empty, which is right for both operations here. */
            const v = ny < 0 || ny >= height || nx < 0 || nx >= width ? 0 : src[ny * width + nx]
            if (dilate ? v : !v) {
              hit = dilate ? 1 : 0
              break
            }
          }
        }
        out[y * width + x] = hit
      }
    }
    src = out
  }
  return src
}

/** Keep only connected regions of at least `minArea` pixels. 8-connected, iterative flood fill. */
function keepLargeRegions(mask, width, height, minArea) {
  const seen = new Uint8Array(mask.length)
  const out = new Uint8Array(mask.length)
  const stack = []
  const region = []
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue
    stack.length = 0
    region.length = 0
    stack.push(start)
    seen[start] = 1
    while (stack.length) {
      const p = stack.pop()
      region.push(p)
      const px = p % width
      const py = (p - px) / width
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = px + dx
          const ny = py + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const q = ny * width + nx
          if (mask[q] && !seen[q]) {
            seen[q] = 1
            stack.push(q)
          }
        }
      }
    }
    if (region.length >= minArea) for (const p of region) out[p] = 1
  }
  return out
}

/** The single largest connected region, which is how the passport cover is identified. */
function largestRegion(mask, width, height) {
  const seen = new Uint8Array(mask.length)
  const out = new Uint8Array(mask.length)
  const stack = []
  let best = []
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue
    stack.length = 0
    const region = []
    stack.push(start)
    seen[start] = 1
    while (stack.length) {
      const p = stack.pop()
      region.push(p)
      const px = p % width
      const py = (p - px) / width
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = px + dx
          const ny = py + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const q = ny * width + nx
          if (mask[q] && !seen[q]) {
            seen[q] = 1
            stack.push(q)
          }
        }
      }
    }
    if (region.length > best.length) best = region
  }
  for (const p of best) out[p] = 1
  return out
}

/**
 * Fill each row from its leftmost to its rightmost set pixel.
 *
 * This is what recovers the part of the cover a hand crosses in front of. The covers are drawn as
 * convex quadrilaterals, so every pixel between a row's two extremes is cover, whether or not it
 * is currently painted navy.
 */
function spanRows(mask, width, height) {
  const out = new Uint8Array(mask.length)
  for (let y = 0; y < height; y++) {
    let lo = -1
    let hi = -1
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) {
        if (lo < 0) lo = x
        hi = x
      }
    }
    if (lo < 0) continue
    for (let x = lo; x <= hi; x++) out[y * width + x] = 1
  }
  return out
}

/* ------------------------------------------------------------------------------------------
 * Region detection.
 * ------------------------------------------------------------------------------------------ */

/**
 * The passport cover, as a per-row span.
 *
 * Navy is "blue clearly ahead of red, and not bright". Opening first removes the scatter of stray
 * navy pixels in shadows elsewhere in the image, so the largest region really is the cover rather
 * than the cover fused to something behind it.
 */
function findCover(rgb, width, height) {
  const navy = new Uint8Array(width * height)
  for (let i = 0; i < navy.length; i++) {
    const r = rgb[i * 4]
    const g = rgb[i * 4 + 1]
    const b = rgb[i * 4 + 2]
    navy[i] = b > r + 6 && r + g + b < 430 ? 1 : 0
  }
  const opened = morph(morph(navy, width, height, 1, false), width, height, 1, true)
  return spanRows(largestRegion(opened, width, height), width, height)
}

/**
 * The hand, so the repair never reaches it.
 *
 * WARM AND LIGHT IS NOT ENOUGH ON ITS OWN, and getting this wrong was the subtlest failure of the
 * lot. The gold lettering's brightest highlights are also warm and light, so a plain colour test
 * marked them as hand, which excluded them from the mask, and being just outside it they were then
 * held fixed as boundary values and bled a warm haze across the repair. The area test is what
 * separates the two: a hand is thousands of connected pixels, a highlight is a speck.
 */
function findSkin(rgb, width, height) {
  const warm = new Uint8Array(width * height)
  for (let i = 0; i < warm.length; i++) {
    const r = rgb[i * 4]
    const g = rgb[i * 4 + 1]
    const b = rgb[i * 4 + 2]
    warm[i] = r > 175 && b > 95 && r - g > 28 && g - b > 12 ? 1 : 0
  }
  const opened = morph(morph(warm, width, height, 1, false), width, height, 1, true)
  const big = keepLargeRegions(opened, width, height, 3000)
  return morph(big, width, height, 3, true)
}

/* ------------------------------------------------------------------------------------------
 * The row model.
 * ------------------------------------------------------------------------------------------ */

/**
 * Least squares quadratic through (xs, ys), refitted with outliers dropped.
 *
 * The cover's shading along a row is smooth and close to quadratic; the lettering is not. Fitting,
 * discarding whatever sits far from the fit, and fitting again converges on the shading and ignores
 * the words. Four rounds is enough, and the tolerance shrinks to a multiple of the median absolute
 * residual so a row of clean cover is not gradually eaten by its own noise.
 *
 * Returns a function of x, or null if the row has too few usable pixels to fit.
 */
function robustQuadratic(xs, ys) {
  if (xs.length < 8) return null
  let keep = new Uint8Array(xs.length).fill(1)
  let coeffs = null
  for (let round = 0; round < 4; round++) {
    coeffs = fitQuadratic(xs, ys, keep)
    if (!coeffs) return null
    const residuals = new Float64Array(xs.length)
    const kept = []
    for (let i = 0; i < xs.length; i++) {
      residuals[i] = ys[i] - evalQuadratic(coeffs, xs[i])
      if (keep[i]) kept.push(Math.abs(residuals[i]))
    }
    kept.sort((a, b) => a - b)
    const mad = kept.length ? kept[kept.length >> 1] : 0
    /* 1.4826 puts a median absolute deviation on the same footing as a standard deviation. */
    const tolerance = Math.max(14, 2.5 * (mad * 1.4826 + 1e-6))
    const next = new Uint8Array(xs.length)
    let count = 0
    for (let i = 0; i < xs.length; i++) {
      if (Math.abs(residuals[i]) < tolerance) {
        next[i] = 1
        count++
      }
    }
    if (count < 6) break
    keep = next
  }
  return (x) => evalQuadratic(coeffs, x)
}

function evalQuadratic(c, x) {
  return c[0] * x * x + c[1] * x + c[2]
}

/** Normal equations for a quadratic, solved by Gaussian elimination on a 3x3. */
function fitQuadratic(xs, ys, keep) {
  const A = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  let n = 0
  for (let i = 0; i < xs.length; i++) {
    if (!keep[i]) continue
    n++
    /* Powers of x are large for pixel coordinates, so accumulate in doubles and scale x first. */
    const x = xs[i] / 1000
    const y = ys[i]
    const p = [x * x, x, 1]
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) A[r][c] += p[r] * p[c]
      A[r][3] += p[r] * y
    }
  }
  if (n < 6) return null
  for (let col = 0; col < 3; col++) {
    let pivot = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r
    if (Math.abs(A[pivot][col]) < 1e-12) return null
    const tmp = A[col]
    A[col] = A[pivot]
    A[pivot] = tmp
    for (let r = 0; r < 3; r++) {
      if (r === col) continue
      const factor = A[r][col] / A[col][col]
      for (let c = col; c < 4; c++) A[r][c] -= factor * A[col][c]
    }
  }
  const a = A[0][3] / A[0][0]
  const b = A[1][3] / A[1][1]
  const c = A[2][3] / A[2][2]
  /* Undo the x scaling so the returned coefficients take x in pixels. */
  return [a / 1e6, b / 1e3, c]
}

/* ------------------------------------------------------------------------------------------
 * The repair.
 * ------------------------------------------------------------------------------------------ */

/**
 * Diffuse the masked pixels until they agree with the clean cover around them.
 *
 * Each masked pixel repeatedly becomes the average of its four neighbours while everything outside
 * the mask holds still, which settles into a smooth surface spanning the hole. Neighbours that are
 * neither clean cover nor part of the mask, the hand for instance, are skipped, so nothing outside
 * the cover can leak in.
 *
 * The seed is the row model's own prediction, which starts the surface close to its answer and
 * matters for the widest holes, where diffusion from the edges alone would be slow to reach the
 * middle.
 */
function diffuse(channel, mask, usable, seed, width, height, box) {
  const [x0, y0, x1, y1] = box
  const current = Float64Array.from(channel)
  for (let i = 0; i < mask.length; i++) if (mask[i]) current[i] = seed[i]
  for (let pass = 0; pass < RELAX_PASSES; pass++) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * width + x
        if (!mask[i]) continue
        let sum = 0
        let n = 0
        const neighbours = [
          y > 0 ? i - width : -1,
          y < height - 1 ? i + width : -1,
          x > 0 ? i - 1 : -1,
          x < width - 1 ? i + 1 : -1,
        ]
        for (const j of neighbours) {
          if (j < 0 || !(mask[j] || usable[j])) continue
          sum += current[j]
          n++
        }
        if (n) current[i] = sum / n
      }
    }
  }
  return current
}

/* ------------------------------------------------------------------------------------------ */

let changed = 0
for (const target of TARGETS) {
  if (target.rows.length === 0) {
    console.log(`· ${target.file}: no rows (${target.note})`)
    continue
  }

  const image = sharp(await readFile(target.file)).ensureAlpha()
  const { width, height } = await image.metadata()
  const rgb = await image.raw().toBuffer()

  const cover = findCover(rgb, width, height)
  /*
   * Pull in from the cover's outline so the repair never touches its lit edge or its dark border.
   *
   * EIGHT PIXELS, NOT FOUR, AND THE TEST WAS IDEMPOTENCY. At four the zone still reached the dark
   * inner border along the American cover's left edge, which is a genuine step in the artwork rather
   * than lettering, so the row fit called it ink, repaired it, and a second run found the repair's
   * own new edge and did it again. A margin wide enough that the border is outside the zone makes
   * the second run a no-op, which is the only observable way to tell the two apart.
   */
  const inner = morph(cover, width, height, 8, false)
  const skin = findSkin(rgb, width, height)

  /* Where the script is allowed to look: the named rows, on the cover, and not the hand. */
  const zone = new Uint8Array(width * height)
  for (const [rowStart, rowEnd] of target.rows) {
    for (let y = Math.max(0, rowStart); y <= Math.min(height - 1, rowEnd); y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (inner[i] && !skin[i]) zone[i] = 1
      }
    }
  }

  const ink = new Uint8Array(width * height)
  const seeds = [new Float64Array(width * height), new Float64Array(width * height), new Float64Array(width * height)]
  let rowsFitted = 0
  let rowsSkipped = 0
  for (let y = 0; y < height; y++) {
    const xs = []
    for (let x = 0; x < width; x++) if (zone[y * width + x]) xs.push(x)
    if (xs.length === 0) continue
    if (xs.length < 20) {
      rowsSkipped++
      continue
    }
    const xf = Float64Array.from(xs)
    const luminance = Float64Array.from(xs, (x) => {
      const i = (y * width + x) * 4
      return rgb[i] + rgb[i + 1] + rgb[i + 2]
    })
    const model = robustQuadratic(xf, luminance)
    if (!model) {
      rowsSkipped++
      continue
    }
    rowsFitted++
    for (let k = 0; k < xs.length; k++) {
      if (Math.abs(luminance[k] - model(xf[k])) > INK_DEVIATION) ink[y * width + xs[k]] = 1
    }
    for (let c = 0; c < 3; c++) {
      const channelModel = robustQuadratic(
        xf,
        Float64Array.from(xs, (x) => rgb[(y * width + x) * 4 + c]),
      )
      if (!channelModel) continue
      for (const x of xs) seeds[c][y * width + x] = channelModel(x)
    }
  }

  /* Grow the mask, then clip it back to the zone so growing cannot push it onto a hand. */
  const grown = morph(ink, width, height, INK_GROW, true)
  const mask = new Uint8Array(width * height)
  let maskCount = 0
  let x0 = width
  let y0 = height
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!grown[i] || !zone[i]) continue
      mask[i] = 1
      maskCount++
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }

  if (maskCount === 0) {
    console.log(`· ${target.file}: nothing to remove, cover already clean`)
    continue
  }

  /* Clean cover: on the cover, not the hand, not being repaired. This is what holds the edges. */
  const usable = new Uint8Array(width * height)
  for (let i = 0; i < usable.length; i++) usable[i] = inner[i] && !skin[i] && !mask[i] ? 1 : 0

  const out = Buffer.from(rgb)
  const box = [Math.max(0, x0 - 2), Math.max(0, y0 - 2), Math.min(width - 1, x1 + 2), Math.min(height - 1, y1 + 2)]
  for (let c = 0; c < 3; c++) {
    const channel = Float64Array.from({ length: width * height }, (_, i) => rgb[i * 4 + c])
    const filled = diffuse(channel, mask, usable, seeds[c], width, height, box)
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) out[i * 4 + c] = Math.max(0, Math.min(255, Math.round(filled[i])))
    }
    /* Alpha is untouched: these are cut-out PNGs and the cover is fully opaque throughout. */
  }

  await writeFile(
    target.file,
    await sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer(),
  )
  console.log(
    `✓ ${target.file}: ${maskCount} px repaired in ${x0},${y0}-${x1},${y1} ` +
      `(${rowsFitted} rows fitted, ${rowsSkipped} too narrow to fit)`,
  )
  changed++
}
console.log(`\n${changed} illustration(s) retouched.`)
