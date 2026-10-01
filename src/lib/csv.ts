// src/lib/csv.ts
// Utilitaires CSV partagés par les pages de rapports (src/app/admin/rapports/**).
// Extraits de l'ancienne page unique src/app/admin/rapports/page.tsx lors de son
// éclatement en sous-pages, pour éviter de dupliquer cette logique trois fois.

// Construit une chaîne CSV à partir d'un tableau d'objets (en-têtes = clés des objets)
export function toCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return ''

  const headers = Object.keys(rows[0])

  const escape = (value: any): string => {
    const str = value === null || value === undefined ? '' : String(value)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ]

  return lines.join('\n')
}

export function downloadCSV(filenamePrefix: string, rows: Record<string, any>[]) {
  const csv = toCSV(rows)
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filenamePrefix}_${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
