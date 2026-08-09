import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

/*
 * readXlsx — a minimal .xlsx reader built on Node's own zlib. No dependencies.
 *
 * WHY NOT JUST `npm install xlsx`
 * That was the first instinct and it is the wrong call here. SheetJS (`xlsx`) carries two
 * high-severity advisories — prototype pollution and a regular-expression denial of service
 * — with **no fixed version available**. It was installed, audited, and removed.
 *
 * The reasoning: a dependency is a permanent liability, and this one would sit in a build
 * script that reads a file we control. Everything the library offers beyond "read the cells"
 * — formulas, styles, charts, writing, a dozen legacy formats — is attack surface we would
 * be adopting for no benefit. Sixty lines of our own code has a smaller blast radius than
 * a library with an unfixable CVE, and we can read all of it.
 *
 * This is not a general argument against dependencies. It is the specific case where the
 * task is narrow, the input is trusted, and the available package is known-vulnerable.
 *
 * WHAT AN .xlsx FILE ACTUALLY IS
 * A ZIP archive of XML files. Unzip one and you get:
 *
 *   xl/workbook.xml          — the list of sheets and their names
 *   xl/_rels/workbook.xml.rels — maps each sheet to the file that holds it
 *   xl/worksheets/sheet1.xml — the cells of one sheet
 *   xl/sharedStrings.xml     — every distinct string in the workbook, deduplicated
 *
 * THE SHARED STRING TABLE is the part that surprises people. Excel does not store text in
 * the cell. It stores text once in a global table and puts an *index* in the cell, marked
 * `t="s"`. So a cell reading `<c r="A2" t="s"><v>7</v></c>` does not contain the number 7 —
 * it contains "the 8th string in the table". Reading the raw value and skipping the lookup
 * is the single most common way to get a spreadsheet parser subtly wrong: you get plausible
 * numbers instead of text, and nothing errors.
 */

/*
 * A minimal ZIP reader.
 *
 * We read the *central directory* at the end of the archive rather than walking the local
 * file headers from the front. WHY: the local header's compressed-size field is allowed to
 * be zero when a streaming writer used a data descriptor, in which case walking forward
 * requires guessing where each entry ends. The central directory always carries the real
 * sizes and offsets. It is the authoritative index, so we use it.
 */
function readZipEntries(buffer) {
  // The End Of Central Directory record starts with this signature. It sits at the very end
  // of the file, after a comment field of variable length — so we scan backwards for it.
  const EOCD_SIGNATURE = 0x06054b50
  let eocd = -1
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      eocd = i
      break
    }
  }
  if (eocd === -1) throw new Error('Not a ZIP archive: no end-of-central-directory record')

  const entryCount = buffer.readUInt16LE(eocd + 10)
  let pointer = buffer.readUInt32LE(eocd + 16) // offset of the central directory

  const entries = new Map()

  for (let n = 0; n < entryCount; n++) {
    // Central directory entry layout, per the ZIP spec (PKWARE APPNOTE 4.3.12).
    const compressionMethod = buffer.readUInt16LE(pointer + 10)
    const compressedSize = buffer.readUInt32LE(pointer + 20)
    const nameLength = buffer.readUInt16LE(pointer + 28)
    const extraLength = buffer.readUInt16LE(pointer + 30)
    const commentLength = buffer.readUInt16LE(pointer + 32)
    const localHeaderOffset = buffer.readUInt32LE(pointer + 42)
    const name = buffer.toString('utf8', pointer + 46, pointer + 46 + nameLength)

    // The local header repeats the name and extra fields, and its extra field length can
    // DIFFER from the central directory's — so the data offset must be computed from the
    // local header's own values, not the ones we just read.
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28)
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength
    const raw = buffer.subarray(dataStart, dataStart + compressedSize)

    // 0 = stored (no compression), 8 = deflate. Nothing else appears in an .xlsx.
    // `inflateRawSync` rather than `inflateSync`: ZIP stores a bare deflate stream with no
    // zlib header, which is what "raw" means. Using the wrong one fails with a bad-header
    // error that gives no hint as to why.
    entries.set(
      name,
      compressionMethod === 0 ? Buffer.from(raw) : inflateRawSync(raw),
    )

    pointer += 46 + nameLength + extraLength + commentLength
  }

  return entries
}

/*
 * XML helpers.
 *
 * DELIBERATELY NOT A FULL XML PARSER. These regexes handle the narrow, machine-generated
 * subset Excel emits. That is a legitimate choice for a trusted input we control, and an
 * illegitimate one for arbitrary XML from the internet — the distinction is the whole
 * justification, so it is worth stating rather than leaving as a code smell.
 */
const XML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
}

function decodeXml(text) {
  return text
    .replace(/&(?:amp|lt|gt|quot|apos);/g, (m) => XML_ENTITIES[m])
    // Numeric character references, e.g. `&#8211;` for an en dash. Excel uses these for
    // anything outside its escaping set, and the dataset genuinely contains them — the age
    // group "15–64" has an en dash, not a hyphen.
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
}

/** Extract the text of every <t> element, in order — used for one shared string. */
function textOf(xml) {
  const parts = xml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? []
  return parts.map((p) => decodeXml(p.replace(/<t[^>]*>|<\/t>/g, ''))).join('')
}

/*
 * Convert a cell reference's column letters to a zero-based index: A->0, B->1, ..., AA->26.
 *
 * WHY THIS IS NEEDED AT ALL: Excel omits empty cells entirely rather than writing a blank.
 * A row with values in A and D contains three cell elements, not four. Reading cells in
 * document order and assuming they are consecutive silently shifts every value left of a
 * gap into the wrong column — which produces a plausible-looking table that is wrong.
 * So each cell is placed by its declared reference.
 */
function columnIndex(reference) {
  const letters = reference.match(/^[A-Z]+/)?.[0] ?? 'A'
  let index = 0
  for (const character of letters) {
    index = index * 26 + (character.charCodeAt(0) - 64)
  }
  return index - 1
}

/**
 * Read an .xlsx file into `{ [sheetName]: Array<Array<string>> }`.
 *
 * Every value is returned as a STRING, exactly as stored. Deliberate: interpreting types is
 * the caller's job, and it is where the real decisions live. Excel stores 36.7 as
 * "36.700000000000003", and whether that becomes 36.7, "36.7" or a rounded 37 depends on what
 * it means — a float artefact of binary storage, not a measurement to five decimal places.
 * A reader that guesses hides that decision; this one surfaces it.
 */
export function readXlsx(path) {
  const entries = readZipEntries(readFileSync(path))

  const read = (name) => {
    const entry = entries.get(name)
    if (!entry) throw new Error(`Missing ${name} — is this a valid .xlsx?`)
    return entry.toString('utf8')
  }

  // The shared string table, in order. Index N in a cell means entry N here.
  const sharedStrings = (read('xl/sharedStrings.xml').match(/<si>[\s\S]*?<\/si>/g) ?? []).map(
    textOf,
  )

  // Sheet name -> relationship id, then relationship id -> file path.
  const relationships = new Map()
  for (const match of read('xl/_rels/workbook.xml.rels').matchAll(
    /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g,
  )) {
    relationships.set(match[1], match[2])
  }

  const sheets = {}

  for (const match of read('xl/workbook.xml').matchAll(/<sheet[^>]*\/>/g)) {
    const tag = match[0]
    const name = decodeXml(/name="([^"]*)"/.exec(tag)?.[1] ?? '')
    const relationshipId = /r:id="([^"]*)"/.exec(tag)?.[1]
    const target = relationships.get(relationshipId)
    if (!target) continue

    // Targets are usually relative to xl/ ("worksheets/sheet1.xml") but may be absolute
    // ("/xl/worksheets/sheet1.xml"). Normalise both to the archive path.
    const path = `xl/${target.replace(/^\/?(xl\/)?/, '')}`
    const sheetXml = entries.get(path)?.toString('utf8')
    if (!sheetXml) continue

    const rows = []

    for (const rowMatch of sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells = new Map()

      for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
        const attributes = cellMatch[1]
        const body = cellMatch[2]
        const reference = /r="([^"]+)"/.exec(attributes)?.[1] ?? 'A1'
        const type = /t="([^"]+)"/.exec(attributes)?.[1]

        let value
        if (type === 'inlineStr') {
          // Text stored in the cell itself rather than the shared table.
          value = textOf(body)
        } else {
          const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? ''
          // THE SHARED-STRING LOOKUP. See the header note — skipping this yields numbers
          // where text belongs, with no error.
          value = type === 's' ? (sharedStrings[Number(raw)] ?? '') : decodeXml(raw)
        }

        cells.set(columnIndex(reference), value)
      }

      if (cells.size === 0) continue

      const width = Math.max(...cells.keys()) + 1
      rows.push(Array.from({ length: width }, (_, i) => cells.get(i) ?? ''))
    }

    sheets[name] = rows
  }

  return sheets
}

/**
 * Turn a sheet's rows into objects keyed by its header row.
 *
 * Header keys are normalised to snake_case, because the source spreadsheet is inconsistent
 * about it — the `language` sheet uses "Country" and "Display Value" while every other sheet
 * uses lowercase snake_case. Normalising here means the rest of the pipeline never has to
 * know which sheet it is reading from.
 */
export function toObjects(rows) {
  if (!rows?.length) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, i) => [header, (row[i] ?? '').trim()])),
  )
}
