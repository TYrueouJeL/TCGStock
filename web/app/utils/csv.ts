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
  valeur: 'value', value: 'value', cote: 'value', emplacement: 'location', location: 'location', rangement: 'location', notes: 'notes', note: 'notes',
}

export type ImportRow = Record<string, string | number | null>

/** CSV or JSON (a previous export) to rows the API's import endpoint accepts. */
export function parseImport(text: string, fallbackGame: string): ImportRow[] {
  text = text.replace(/^﻿/, '').trim()
  if (!text) return []
  const toNum = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null
    const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.\-]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  let rows: Record<string, unknown>[]
  if (text[0] === '[' || text[0] === '{') {
    const data = JSON.parse(text)
    rows = Array.isArray(data) ? data : (data.cartes ?? data.cards ?? [])
  } else {
    const table = parseCsv(text)
    if (table.length < 2) throw new Error('Il faut une ligne d’en-têtes puis au moins une carte.')
    const keys = table[0]!.map((h) => HEADERS[norm(h)] ?? null)
    if (!keys.includes('name')) throw new Error('Colonne « nom » introuvable dans la première ligne.')
    rows = table.slice(1).map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i]?.trim() ?? '']).filter(([k]) => k)))
  }
  return rows
    .map((r) => {
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
    })
    .filter((r) => r.name)
}
