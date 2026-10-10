'use server'

import {
  sendInscriptionNotification,
  sendDecisionEmail
} from '@/lib/emailService'

export async function sendInscriptionNotificationAction(
  inscription: Parameters<typeof sendInscriptionNotification>[0],
  adminEmails: Parameters<typeof sendInscriptionNotification>[1]
) {
  return sendInscriptionNotification(inscription, adminEmails)
}

export async function sendDecisionEmailAction(
  inscription: Parameters<typeof sendDecisionEmail>[0],
  status: Parameters<typeof sendDecisionEmail>[1],
  classe?: Parameters<typeof sendDecisionEmail>[2],
  motifRejet?: Parameters<typeof sendDecisionEmail>[3]
) {
  return sendDecisionEmail(inscription, status, classe, motifRejet)
}

// sendPaymentConfirmationAction supprimée (2026-10-09) : elle acceptait montant, nom et
// code depuis le navigateur. Remplacée par envoyerRecuPaiementAction
// (src/app/actions/recuActions.ts), qui relit tout en base avec le jeton de l'utilisateur.
