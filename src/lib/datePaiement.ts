// src/lib/datePaiement.ts
// Dates de paiement partagées entre la page Paiements (client) et le reçu PDF (serveur).

// paiements.date_paiement est un timestamptz. Une date saisie par l'opérateur est
// stockée à minuit UTC : la convertir en heure locale la ferait reculer d'un jour à
// l'ouest de Greenwich (Québec). On garde donc la date telle quelle dans ce cas ; les
// anciens paiements horodatés avec now() restent convertis en date locale.
export function datePaiementIso(valeur: string | null | undefined): string {
  if (!valeur) return ''
  const minuitUtc = valeur.match(/^(\d{4}-\d{2}-\d{2})(?:[T ]00:00:00(?:\.0+)?(?:Z|\+00(?::?00)?))?$/)
  if (minuitUtc) return minuitUtc[1]
  const d = new Date(valeur)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// yyyy-mm-dd -> jj/mm/aaaa, sans passer par Date (aucun décalage de fuseau)
export function formaterDateFr(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-')
  return jour && mois && annee ? `${jour}/${mois}/${annee}` : '—'
}
