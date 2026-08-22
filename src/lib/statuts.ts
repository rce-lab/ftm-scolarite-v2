// src/lib/statuts.ts

export const STATUT_LABELS: Record<string, string> = {
  pending_review: 'En attente',
  approved: 'Validé',
  rejected: 'Rejeté'
}

const STATUT_EMOJIS: Record<string, string> = {
  pending_review: '⏳',
  approved: '✅',
  rejected: '❌'
}

export function getStatutLabel(status: string, options?: { emoji?: boolean }): string {
  const label = STATUT_LABELS[status] || status

  if (options?.emoji) {
    const emoji = STATUT_EMOJIS[status]
    return emoji ? `${emoji} ${label}` : label
  }

  return label
}

// Libellé du suivi de paiement (statut_paiement), séparé de la décision
// pédagogique (status) — même texte/emoji que l'ancien statut payment_pending,
// désormais dérivé de statut_paiement au lieu de status.
export const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  en_attente: 'Paiement en attente',
  paye: 'Payé'
}

const STATUT_PAIEMENT_EMOJIS: Record<string, string> = {
  en_attente: '💰',
  paye: '✅'
}

export function getStatutPaiementLabel(statutPaiement: string | null | undefined, options?: { emoji?: boolean }): string {
  const key = statutPaiement === 'paye' ? 'paye' : 'en_attente'
  const label = STATUT_PAIEMENT_LABELS[key]

  if (options?.emoji) {
    return `${STATUT_PAIEMENT_EMOJIS[key]} ${label}`
  }

  return label
}
