import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertNoInternalReferences,
  assertNoRankings,
  assertItineraryIsSound,
  assertAssetsExist,
  checkSum,
  toNumber,
} from './validators.mjs'

/*
 * Tests for the data-pipeline guards. Run with `npm run test:data`.
 *
 * WHY THESE EXIST WHEN NOTHING ELSE IN THE PROJECT HAS TESTS YET
 * Because two of these guards were WRONG, and reading them did not reveal it. The ranking
 * check was written against the spreadsheet's `happiness_rank` while the converter emits
 * `happinessRank`, so it could never have fired. The fix then flagged `frank`. Neither problem
 * was visible in the code; both took two lines of exercise to find.
 *
 * THE GENERAL POINT, which is the reason to keep this file rather than delete it: a validator
 * that never fires looks exactly like a validator that cannot fire. Both produce a green build.
 * So a guard needs a test that proves it REJECTS the thing it exists to reject — the negative
 * case is the test that matters. A test that only checks good data passes would have been green
 * for both bugs.
 *
 * `node:test` is Node's built-in test runner — no dependency, no config. Given the earlier
 * decision to drop `xlsx` over unfixable advisories, adding a test framework to test the code
 * that replaced it would be an odd trade.
 */

// --- Rule 1: internal references ---------------------------------------------------------

test('rejects internal hostnames in the output', () => {
  for (const leak of [
    'https://drive.corp.amazon.com/documents/x/japan_hero.jpeg',
    'https://something.corp.amazon.com/a',
    'https://foo.a2z.com/b',
    'https://hub.cx.aws.dev/c',
    'documents/someone@/analyticon_2026/japan_pp.jpeg',
  ]) {
    assert.throws(
      () => assertNoInternalReferences(JSON.stringify({ image: leak }), 'test'),
      /internal reference/,
      `should have rejected: ${leak}`,
    )
  }
})

test('accepts local asset paths', () => {
  const clean = JSON.stringify({ images: { hero: '/images/japan_hero.jpeg' } })
  assert.doesNotThrow(() => assertNoInternalReferences(clean, 'test'))
})

// --- Rule 2: rankings --------------------------------------------------------------------

test('rejects ranking fields in every naming convention', () => {
  // Both spellings matter: the workbook uses snake_case, the converter emits camelCase.
  // The original bug was checking only the former.
  for (const key of [
    'rank',
    'ranking',
    'happiness_rank',
    'population_rank',
    'tourist_rank',
    'commute_rank',
    'happinessRank',
    'populationRank',
    'rank_order',
    'rankOrder',
  ]) {
    assert.throws(() => assertNoRankings([{ [key]: 1 }], 'test'), /ranking field/, `key: ${key}`)
  }
})

test('does not reject fields that merely contain the letters "rank"', () => {
  // The regression that the two-rule split fixed.
  for (const key of ['frank', 'franchise', 'frankfurtStop', 'arrivalOrder', 'population']) {
    assert.doesNotThrow(() => assertNoRankings([{ [key]: 1 }], 'test'), `key: ${key}`)
  }
})

test('finds rankings nested anywhere, not just at the top level', () => {
  // The guard has to be recursive: a rank buried three levels down still ships.
  assert.throws(
    () => assertNoRankings({ countries: [{ facts: { happinessRank: 55 } }] }, 'test'),
    /happinessRank/,
  )
})

test('reports the path to the offending field', () => {
  // The error has to say WHERE, or the next person has to search the JSON by hand.
  assert.throws(() => assertNoRankings({ a: { b: [{ tourist_rank: 11 }] } }, 'test'), /a\.b\[0\]/)
})

// --- Rule 3: itinerary ------------------------------------------------------------------

test('accepts a complete itinerary', () => {
  const sound = ['japan', 'india', 'italy', 'switzerland', 'united-states'].map((slug, i) => ({
    slug,
    arrivalOrder: i + 1,
  }))
  assert.doesNotThrow(() => assertItineraryIsSound(sound, 'test'))
})

test('rejects duplicate, gapped, or duplicated-slug itineraries', () => {
  assert.throws(
    () => assertItineraryIsSound([{ slug: 'a', arrivalOrder: 1 }, { slug: 'b', arrivalOrder: 1 }], 'test'),
    /arrival orders/,
  )
  assert.throws(
    () => assertItineraryIsSound([{ slug: 'a', arrivalOrder: 1 }, { slug: 'b', arrivalOrder: 3 }], 'test'),
    /arrival orders/,
  )
  assert.throws(
    () => assertItineraryIsSound([{ slug: 'a', arrivalOrder: 1 }, { slug: 'a', arrivalOrder: 2 }], 'test'),
    /duplicate country slugs/,
  )
})

// --- Rule 4: assets ---------------------------------------------------------------------

test('rejects missing assets and lists all of them', () => {
  // `assert.throws` returns undefined, so the error has to be captured to inspect its text.
  let message = ''
  try {
    assertAssetsExist(['images/a.jpg', 'images/b.jpg'], () => false, 'test')
    assert.fail('should have thrown')
  } catch (error) {
    message = error.message
  }
  assert.match(message, /do not exist/)
  // Listing only the first missing file means fixing them one build at a time.
  assert.match(message, /a\.jpg/)
  assert.match(message, /b\.jpg/)
})

test('ignores nulls and duplicates when checking assets', () => {
  assert.doesNotThrow(() => assertAssetsExist([null, '', 'x.jpg', 'x.jpg'], (p) => p === 'x.jpg', 'test'))
})

// --- Rule 5: sums -----------------------------------------------------------------------

test('sum check reports rather than throws', () => {
  // Deliberate: Principle 17. A drifting source is a fact to surface, not a build to break.
  const japanTransport = checkSum([46, 44.5, 8, 1.5], 100, 1.5, 'transport')
  assert.equal(japanTransport.withinTolerance, true)
  assert.equal(japanTransport.total, 100)

  const japanDay = checkSum([6.3, 10.4, 4, 2.2, 1.1], 24, 0.5, 'day')
  assert.equal(japanDay.withinTolerance, true)

  const broken = checkSum([46, 44.5, 8, 10], 100, 1.5, 'transport')
  assert.equal(broken.withinTolerance, false)
  assert.equal(broken.drift, 8.5)
})

// --- Rule 6: numbers --------------------------------------------------------------------

test('strips float noise to the stated precision', () => {
  // The exact values Excel stores for Japan.
  assert.equal(toNumber('36.700000000000003', { field: 'workHours', precision: 1 }), 36.7)
  assert.equal(toNumber('6.1470000000000002', { field: 'happiness', precision: 2 }), 6.15)
  assert.equal(toNumber('2.2000000000000002', { field: 'hours', precision: 1 }), 2.2)
  assert.equal(toNumber('9.1999999999999998E-2', { field: 'share', precision: 3 }), 0.092)
})

test('handles thousands separators and empty cells', () => {
  assert.equal(toNumber('123,366,734', { field: 'population', precision: 0 }), 123366734)
  assert.equal(toNumber('', { field: 'x', precision: 0 }), null)
  assert.equal(toNumber(undefined, { field: 'x', precision: 0 }), null)
})

test('rejects a value that is not a number', () => {
  // `flight_distance_km` for India is the string "~5,900" — a tilde, meaning the source knew
  // it was a guess. The column is dropped entirely, but if it were ever reinstated this is
  // the behaviour that would catch it rather than silently producing NaN.
  assert.throws(() => toNumber('~5,900', { field: 'flightDistance', precision: 0 }), /not a number/)
})
