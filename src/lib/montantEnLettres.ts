// src/lib/montantEnLettres.ts
// Montant en euros écrit en lettres (orthographe traditionnelle, MAJUSCULES), pour le
// reçu de paiement : 25 -> « VINGT-CINQ EUROS », 30,5 -> « TRENTE EUROS ET CINQUANTE CENTIMES ».

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
]
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']

// 0 à 99 ; `final` : le nombre termine l'expression (accord de « quatre-vingts »)
function moinsDeCent(n: number, final: boolean): string {
  if (n < 20) return UNITES[n]
  const d = Math.floor(n / 10)
  let u = n % 10
  // 70-79 et 90-99 : soixante-dix..., quatre-vingt-dix...
  if (d === 7 || d === 9) u += 10
  if (u === 0) return d === 8 && final ? 'quatre-vingts' : DIZAINES[d]
  if ((u === 1 || u === 11) && d !== 8 && d !== 9) return `${DIZAINES[d]} et ${UNITES[u]}`
  return `${DIZAINES[d]}-${UNITES[u]}`
}

// 0 à 999
function moinsDeMille(n: number, final: boolean): string {
  const c = Math.floor(n / 100)
  const reste = n % 100
  if (c === 0) return moinsDeCent(reste, final)
  const cents = c === 1 ? 'cent' : `${UNITES[c]} cent${reste === 0 && final ? 's' : ''}`
  return reste === 0 ? cents : `${cents} ${moinsDeCent(reste, final)}`
}

// Entier de 0 à 999 999 999
export function nombreEnLettres(n: number): string {
  if (n === 0) return 'zéro'
  const millions = Math.floor(n / 1_000_000)
  const milliers = Math.floor((n % 1_000_000) / 1000)
  const reste = n % 1000
  const parties: string[] = []
  if (millions) parties.push(`${moinsDeMille(millions, true)} million${millions > 1 ? 's' : ''}`)
  if (milliers) parties.push(milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`)
  if (reste) parties.push(moinsDeMille(reste, true))
  return parties.join(' ')
}

export function montantEnLettres(montant: number): string {
  const centimesTotal = Math.round(montant * 100)
  const euros = Math.floor(centimesTotal / 100)
  const centimes = centimesTotal % 100
  let texte = `${nombreEnLettres(euros)} euro${euros > 1 ? 's' : ''}`
  if (centimes) texte += ` et ${nombreEnLettres(centimes)} centime${centimes > 1 ? 's' : ''}`
  return texte.toUpperCase()
}

// « 25,00 € (VINGT-CINQ EUROS) » — formatage manuel : toLocaleString insère des espaces
// insécables fines (U+202F) que les polices standard des PDF ne savent pas encoder
export function montantAvecLettres(montant: number): string {
  return `${montant.toFixed(2).replace('.', ',')} € (${montantEnLettres(montant)})`
}
