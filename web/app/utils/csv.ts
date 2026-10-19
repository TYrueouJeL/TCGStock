/** Small CSV reader: quoted cells, comma / semicolon / tab separators. */
export function parseCsv(text: string): string[][] {
  text = text.replace(/^﻿/, '')
  const first = text.split(/\r?\n/)[0] ?? ''
  const count = (ch: string) => first.split(ch).length - 1
  const sep = count(';') > count(',') ? ';' : count('\t') > count(',') ? '\t' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === sep) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const q = (v: string | number | null | undefined) => {
    const s = String(v ?? '')
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + rows.map((r) => r.map(q).join(';')).join('\r\n')
}

export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

const HEADERS: Record<string, string> = {
  jeu: 'game', game: 'game', nom: 'name', name: 'name', carte: 'name', extension: 'extension', set: 'extension', serie: 'extension',
  numero: 'number', number: 'number', num: 'number', rarete: 'rarity', rarity: 'rarity', langue: 'language', language: 'language',
  lang: 'language', etat: 'condition', condition: 'condition', finition: 'finish', finish: 'finish', quantite: 'quantity', qte: 'quantity',
  qty: 'quantity', quantity: 'quantity', prixachat: 'purchasePrice', prix: 'purchasePrice', achat: 'purchasePrice', price: 'purchasePrice',
  valeur: 'value', value: 'value', cote: 'value', prixalunite: 'value', nomdelacarte: 'name', reference: 'number', ref: 'number', emplacement: 'location', location: 'location', rangement: 'location', notes: 'notes', note: 'notes',
}

export type ImportRow = Record<string, string | number | null>

/** What a file gave: the rows to send, plus how many lines were read. */
export type ParsedImport = { rows: ImportRow[]; format: 'wankul' | 'table' | 'json'; lines: number }

type Cell = string | number | null | undefined

const toNum = (v: unknown) => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.\-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function cleanRow(r: Record<string, unknown>, fallbackGame: string): ImportRow {
  const out: ImportRow = { game: String(r.game || fallbackGame), name: String(r.name ?? '').trim() }
  for (const k of ['extension', 'rarity', 'number', 'language', 'condition', 'finish', 'location', 'notes']) {
    if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') out[k] = String(r[k]).trim()
  }
  const q = toNum(r.quantity)
  if (q !== null) out.quantity = Math.max(0, Math.round(q))
  const p = toNum(r.purchasePrice)
  if (p !== null) out.purchasePrice = p
  const v = toNum(r.value)
  if (v !== null) out.value = v
  return out
}

/**
 * Export of a Wankul collection app: one sheet per extension listing every
 * card, with "J'ai" (Oui/Non) and "Nombre en +" (copies beyond the first).
 * Only owned cards are kept.
 */
const isWankulSheet = (keys: string[]) => keys.includes('jai') && keys.includes('nombreen') && keys.includes('nomdelacarte')

function wankulRows(table: Cell[][]): ImportRow[] {
  const keys = table[0]!.map((h) => norm(String(h ?? '')))
  const col = (row: Cell[], key: string) => {
    const v = row[keys.indexOf(key)]
    return v === null || v === undefined ? '' : String(v).trim()
  }
  const out: ImportRow[] = []
  for (const row of table.slice(1)) {
    const name = col(row, 'nomdelacarte')
    if (!name) continue
    const owned = norm(col(row, 'jai')) === 'oui' ? 1 : 0
    const quantity = owned + Math.max(0, Math.round(toNum(col(row, 'nombreen')) ?? 0))
    if (quantity === 0) continue
    const rarity = col(row, 'rarete')
    const notes = [col(row, 'typedecarte') && `Type : ${col(row, 'typedecarte')}`, col(row, 'artiste') && `Artiste : ${col(row, 'artiste')}`]
      .filter(Boolean)
      .join(' · ')
    out.push(
      cleanRow(
        {
          game: 'wankul',
          name,
          extension: col(row, 'extension'),
          number: col(row, 'reference'),
          rarity,
          finish: /holo/i.test(rarity) ? 'Holo' : '',
          quantity,
          value: col(row, 'prixalunite'),
          notes,
        },
        'wankul'
      )
    )
  }
  return out
}

/** A table whose first row holds the headers (CSV, or one Excel sheet). */
function tableRows(table: Cell[][], fallbackGame: string): ImportRow[] {
  const keys = table[0]!.map((h) => HEADERS[norm(String(h ?? ''))] ?? null)
  if (!keys.includes('name')) return []
  return table
    .slice(1)
    .map((r) => cleanRow(Object.fromEntries(keys.map((k, i) => [k, r[i] ?? '']).filter(([k]) => k)), fallbackGame))
    .filter((r) => r.name)
}

/** Every sheet of an Excel workbook: the Wankul collection format, or plain tables. */
export function parseSheets(sheets: { name: string; rows: Cell[][] }[], fallbackGame: string): ParsedImport {
  const tables = sheets.map((s) => s.rows.filter((r) => r.some((c) => c !== null && c !== undefined && String(c).trim() !== ''))).filter((t) => t.length)
  if (!tables.length) throw new Error('Le classeur est vide.')
  const lines = tables.reduce((n, t) => n + t.length - 1, 0)
  const wankul = tables.filter((t) => isWankulSheet(t[0]!.map((h) => norm(String(h ?? '')))))
  if (wankul.length) return { rows: wankul.flatMap(wankulRows), format: 'wankul', lines: wankul.reduce((n, t) => n + t.length - 1, 0) }
  const rows = tables.flatMap((t) => tableRows(t, fallbackGame))
  if (!rows.length) throw new Error('Colonne « nom » introuvable dans la première ligne des feuilles.')
  return { rows, format: 'table', lines }
}

/** CSV or JSON (a previous export) to rows the API's import endpoint accepts. */
export function parseImport(text: string, fallbackGame: string): ParsedImport {
  text = text.replace(/^\uFEFF/, '').trim()
  if (!text) return { rows: [], format: 'table', lines: 0 }
  if (text[0] === '[' || text[0] === '{') {
    const data = JSON.parse(text)
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.cartes ?? data.cards ?? [])
    const rows = list.map((r) => cleanRow(r, fallbackGame)).filter((r) => r.name)
    return { rows, format: 'json', lines: list.length }
  }
  const table = parseCsv(text)
  if (table.length < 2) throw new Error('Il faut une ligne d’en-têtes puis au moins une carte.')
  const keys = table[0]!.map((h) => norm(h))
  if (isWankulSheet(keys)) return { rows: wankulRows(table), format: 'wankul', lines: table.length - 1 }
  if (!keys.some((k) => HEADERS[k] === 'name')) throw new Error('Colonne « nom » introuvable dans la première ligne.')
  return { rows: tableRows(table, fallbackGame), format: 'table', lines: table.length - 1 }
}
