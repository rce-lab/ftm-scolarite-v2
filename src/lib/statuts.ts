// src/lib/statuts.ts

export const STATUT_LABELS: Record<string, string> = {
  pending_review: 'En attente',
  approved: 'Validé',
  rejected: 'Rejeté',
  payment_pending: 'Paiement en attente'
}

const STATUT_EMOJIS: Record<string, string> = {
  pending_review: '⏳',
  approved: '✅',
  rejected: '❌',
  payment_pending: '💰'
}

export function getStatutLabel(status: string, options?: { emoji?: boolean }): string {
  const label = STATUT_LABELS[status] || status

  if (options?.emoji) {
    const emoji = STATUT_EMOJIS[status]
    return emoji ? `${emoji} ${label}` : label
  }

  return label
}
