/*
 * generateMap.mjs — turns real world geography into one flat SVG path, at build time.
 *
 * ============================================================================================
 * WHY THIS SCRIPT EXISTS
 *
 * The journey needs a map, because the visitor is about to watch a plane fly across it. The
 * previous build refused to draw one, and its reasoning is worth answering rather than ignoring
 * (see the long note that used to head RouteMap.jsx). It gave two objections:
 *
 *   1. "We do not have the data, and we do not invent it."
 *      We do have it. `journey.json` carries real latitude and longitude for all five countries,
 *      produced by the pipeline from the workbook. And the coastlines come from Natural Earth via
 *      the `world-atlas` package — the same public-domain dataset every serious map uses. Nothing
 *      here is eyeballed. Every pin lands where a projection puts it, and the projection is a
 *      published formula, not a judgement.
 *
 *   2. "A world map is a 1440px idea."
 *      True of a map that must be READ — one where the visitor picks out Switzerland from
 *      Austria. False of this one. This map is a stage for a flight: the visitor needs to see that
 *      they crossed a great distance in a particular direction, and that reads at 320px exactly as
 *      well as at 1920px, because it is carried by the movement rather than by the detail.
 *
 * So the objection was right about the wrong map. What it correctly rules out — and this script
 * upholds — is any NUMBER derived from the map. No distances, no bearings, no flight times. The
 * geometry is honest about position and silent about everything else.
 *
 * WHY PRECOMPUTE INSTEAD OF PROJECTING IN THE BROWSER
 * `world-atlas` + `topojson-client` + `d3-geo` is roughly 300 kB of dependency to produce a string
 * that is identical on every load, for every visitor, forever. Running it here means those three
 * packages stay `devDependencies` and the browser receives only the finished path. The measured
 * output is printed at the end of the run so the cost is never a guess.
 *
 * WHY 110m AND NOT 50m RESOLUTION
 * Natural Earth ships coastlines at three detail levels. At the size this map is drawn — a
 * backdrop a few hundred pixels tall — 50m detail is invisible and roughly five times the bytes.
 * 110m is the correct choice for a map at this scale, which is the same reasoning as picking a
 * font subset: ship the fidelity that renders, not the fidelity that exists.
 * ============================================================================================
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

/*
 * THE CANVAS. A fixed viewBox, so the SVG scales to any container without the path being
 * regenerated. 2:1 is close to the natural aspect of the projection below, which means the map
 * fills its box rather than floating in letterboxed whitespace.
 */
const WIDTH = 960
const HEIGHT = 480

/*
 * THE PROJECTION, and the one decision in this file that is a judgement rather than a formula.
 *
 * Mercator is the web default and the wrong choice here: it inflates high latitudes so severely
 * that Switzerland's pin drifts far north of where a reader expects, and Greenland ends up the
 * size of Africa. On a page whose entire premise is "no country is more important than another",
 * a projection that makes rich northern countries physically larger is an editorial claim we
 * would be making by accident.
 *
 * Natural Earth 1 is a compromise projection designed for exactly this job — small-scale world
 * maps meant to be looked at rather than measured. It distorts area and distance mildly and
 * evenly instead of severely and selectively. Neither is "accurate" (no flat map is), but this
 * one's inaccuracy does not favour anybody.
 *
 * `fitSize` scales and centres the projection so the land fills the canvas. Note it is fitted to
 * the land itself rather than given a hand-tuned scale and translate, so the framing is derived
 * from the data and cannot drift if the resolution or canvas ever changes.
 */
async function build() {
  const atlasPath = join(ROOT, 'node_modules/world-atlas/land-110m.json')
  const topology = JSON.parse(await readFile(atlasPath, 'utf8'))
  const land = feature(topology, topology.objects.land)

  const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], land)

  /*
   * `.digits(1)` — one decimal place in the output path.
   *
   * The default is full float precision, which writes coordinates like `412.83729384`. At a map
   * scale where one pixel is roughly forty kilometres, every digit after the first decimal
   * describes a distance smaller than a city and costs bytes on every page load. Measured on this
   * dataset it is a ~40% reduction in the path string for no visible difference.
   */
  const toPath = geoPath(projection).digits(1)
  const landPath = toPath(land)

  /*
   * THE STOPS — each country's real coordinates, run through the same projection as the land.
   *
   * This is the part that makes the map trustworthy rather than decorative: the pins are not
   * placed on the drawing, they are computed by the identical transform that drew it. A pin
   * cannot disagree with the coastline beneath it, because neither knows about the other.
   *
   * Read from journey.json rather than hardcoded here, so a change to the itinerary in the
   * workbook flows through to the map with no second list to update.
   */
  const journey = JSON.parse(await readFile(join(ROOT, 'src/data/journey.json'), 'utf8'))

  const stops = journey.countries.map((country) => {
    const { latitude, longitude } = country.coordinates
    /*
     * d3 projections take [longitude, latitude] — x before y, which is the opposite of how
     * coordinates are spoken ("36 north, 138 east"). Getting this backwards is the single most
     * common bug in map code and it fails silently: the pin simply lands somewhere plausible in
     * the wrong hemisphere. Named locals rather than an inline array literal, so the order is
     * stated rather than assumed.
     */
    const [x, y] = projection([longitude, latitude])

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(
        `generateMap: ${country.slug} projected to a non-finite point. ` +
          `Its coordinates (${latitude}, ${longitude}) are probably swapped or missing.`,
      )
    }

    return {
      slug: country.slug,
      name: country.name,
      /* Rounded to a tenth of a pixel for the same reason as the land path. */
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    }
  })

  const output = {
    generatedBy: 'scripts/generateMap.mjs',
    source: 'Natural Earth 1:110m land (public domain), via the world-atlas package',
    projection: 'geoNaturalEarth1, fitted to the land bounds',
    /*
     * WHAT THIS MAP DOES NOT CLAIM, recorded in the artefact itself rather than only in a
     * comment. Anyone who opens this JSON looking for a distance should find the reason there
     * isn't one.
     */
    doesNotClaim: 'distance, bearing, area, or travel time — position and sequence only',
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    width: WIDTH,
    height: HEIGHT,
    land: landPath,
    stops,
  }

  const target = join(ROOT, 'src/data/worldMap.json')
  await writeFile(target, `${JSON.stringify(output)}\n`, 'utf8')

  const kb = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1)
  console.log(`worldMap.json written — ${kb} kB, ${stops.length} stops projected.`)
  for (const stop of stops) {
    console.log(`  ${stop.name.padEnd(15)} → ${stop.x}, ${stop.y}`)
  }
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
