'use server'

import {
  sendInscriptionNotification,
  sendDecisionEmail,
  sendPaymentConfirmation
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
  classe?: Parameters<typeof sendDecisionEmail>[2]
) {
  return sendDecisionEmail(inscription, status, classe)
}

export async function sendPaymentConfirmationAction(
  studentEmail: string,
  studentName: string,
  studentCode: string,
  amount: number
) {
  return sendPaymentConfirmation(studentEmail, studentName, studentCode, amount)
}
