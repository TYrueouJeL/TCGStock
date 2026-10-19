/**
 * Minimal .xlsx reader, with no dependency: an .xlsx file is a zip of XML
 * files. The browser inflates the entries (DecompressionStream) and parses
 * the XML (DOMParser). Returns each sheet as rows of cell values.
 */

export type Sheet = { name: string; rows: (string | number | null)[][] }

async function unzip(buffer: ArrayBuffer): Promise<Map<string, () => Promise<string>>> {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  // End of central directory: last 22 bytes, plus an optional comment.
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('Ce fichier n’est pas un classeur Excel (.xlsx).')
  const count = view.getUint16(eocd + 10, true)
  let ptr = view.getUint32(eocd + 16, true)
  const decoder = new TextDecoder()
  const entries = new Map<string, () => Promise<string>>()
  for (let n = 0; n < count; n++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break
    const method = view.getUint16(ptr + 10, true)
    const size = view.getUint32(ptr + 20, true)
    const nameLen = view.getUint16(ptr + 28, true)
    const extraLen = view.getUint16(ptr + 30, true)
    const commentLen = view.getUint16(ptr + 32, true)
    const local = view.getUint32(ptr + 42, true)
    const name = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen))
    ptr += 46 + nameLen + extraLen + commentLen
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
    const data = bytes.slice(start, start + size)
    entries.set(name, async () => {
      if (method === 0) return decoder.decode(data)
      if (method !== 8) throw new Error('Compression du classeur non prise en charge.')
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      return new Response(stream).text()
    })
  }
  return entries
}

const xml = (text: string) => new DOMParser().parseFromString(text, 'application/xml')
const all = (node: Document | Element, tag: string) => Array.from(node.getElementsByTagNameNS('*', tag))
const text = (node: Element) => all(node, 't').map((t) => t.textContent ?? '').join('')

/** "C12" -> 2 (zero-based column). */
function columnOf(ref: string | null, fallback: number): number {
  const letters = /^[A-Z]+/.exec(ref ?? '')?.[0]
  if (!letters) return fallback
  let col = 0
  for (const ch of letters) col = col * 26 + (ch.charCodeAt(0) - 64)
  return col - 1
}

function resolve(target: string): string {
  if (target.startsWith('/')) return target.slice(1)
  const parts = ['xl']
  for (const part of target.split('/')) {
    if (part === '..') parts.pop()
    else if (part !== '.') parts.push(part)
  }
  return parts.join('/')
}

export async function readXlsx(file: Blob): Promise<Sheet[]> {
  const files = await unzip(await file.arrayBuffer())
  const read = async (path: string) => {
    const get = files.get(path)
    return get ? xml(await get()) : null
  }
  const workbook = await read('xl/workbook.xml')
  if (!workbook) throw new Error('Ce fichier n’est pas un classeur Excel (.xlsx).')
  const rels = await read('xl/_rels/workbook.xml.rels')
  const targets = new Map(all(rels ?? workbook, 'Relationship').map((r) => [r.getAttribute('Id'), r.getAttribute('Target') ?? '']))
  const shared = await read('xl/sharedStrings.xml')
  // Phonetic hints (<rPh>) are not part of the cell text.
  const strings = (shared ? all(shared, 'si') : []).map((si) => {
    for (const r of all(si, 'rPh')) r.remove()
    return text(si)
  })

  const sheets: Sheet[] = []
  for (const sheet of all(workbook, 'sheet')) {
    const rid = sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ?? sheet.getAttribute('r:id')
    const doc = await read(resolve(targets.get(rid) ?? ''))
    if (!doc) continue
    const rows: (string | number | null)[][] = []
    for (const row of all(doc, 'row')) {
      const cells: (string | number | null)[] = []
      all(row, 'c').forEach((c, i) => {
        const type = c.getAttribute('t')
        const raw = all(c, 'v')[0]?.textContent ?? null
        let value: string | number | null = raw
        if (type === 's') value = raw === null ? null : (strings[Number(raw)] ?? null)
        else if (type === 'inlineStr') value = text(c)
        else if (type === 'b') value = raw === '1' ? 'TRUE' : 'FALSE'
        else if (type !== 'str' && type !== 'e' && raw !== null && raw !== '' && Number.isFinite(Number(raw))) value = Number(raw)
        cells[columnOf(c.getAttribute('r'), i)] = value
      })
      rows.push(Array.from(cells, (v) => v ?? null))
    }
    sheets.push({ name: sheet.getAttribute('name') ?? '', rows })
  }
  return sheets
}
