/*
 * images.js — the one rule for finding an image's AVIF companion.
 *
 * WHY THIS IS A SHARED MODULE AND NOT A LOCAL HELPER
 * Two components serve photographs — ImageFrame (the experience photographs inside a facet) and
 * LivingBackdrop (the drifting covers) — and both need the same derivation. Written twice it would
 * be two chances to disagree with the pipeline, and a disagreement here is quiet: the `<source>`
 * 404s, the browser falls back to the JPEG, the page looks perfect, and the site has simply stopped
 * saving a megabyte. A bug whose only symptom is a number nobody is looking at needs one home, not
 * two.
 *
 * THE OTHER HALF OF THE RULE LIVES IN scripts/convertData.mjs (`avifName`), because that is what
 * writes the file. This module and that function must agree, and the reason it is acceptable for
 * them to be separate is that the rule is small enough to state identically in both — "replace
 * the extension with .avif" — and neither side can express the other's language. The pipeline
 * works with filenames on disk, this works with the URLs in journey.json.
 *
 * The alternative was recording both paths for every image in the JSON. Rejected: the format an
 * image happens to be encoded in is a build detail, not a fact about the journey, and the data
 * the components read should only contain the latter.
 */

/**
 * Given a JPEG's public URL, return its AVIF companion's URL.
 *
 * `/images/japan_hero.jpeg` → `/images/japan_hero.avif`
 *
 * The pattern is anchored to the end of the string and excludes `/` from the extension it
 * matches, so a path containing a dot in a directory name cannot be mangled.
 */
export function toAvif(src) {
  return src.replace(/\.[^./]+$/, '.avif')
}
