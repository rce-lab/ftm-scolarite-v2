'use server'
// src/app/actions/recuActions.ts
// Reçu de paiement PDF signé : génération, envoi par email, téléchargement.
//
// Sécurité : ces actions serveur sont appelables publiquement (POST Next.js). Elles
// n'acceptent donc AUCUNE donnée métier du navigateur (montant, nom, numéro...) —
// seulement l'id du paiement et le jeton d'accès Supabase de l'utilisateur connecté.
// Tout est relu en base avec un client Supabase porteur de ce jeton (RLS appliquée),
// et le rpc obtenir_numero_recu refuse les rôles autres que comptable /
// responsable_administratif / organisation_it.

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { genererRecuPdf, nomFichierRecu } from '@/lib/pdf/recuPdf'
import { sendPaymentReceipt } from '@/lib/emailService'
import { datePaiementIso } from '@/lib/datePaiement'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ResultatRecu = { success: true; numero: string } | { success: false; error: string }
type ResultatTelechargement =
  | { success: true; numero: string; nomFichier: string; pdfBase64: string }
  | { success: false; error: string }

function clientUtilisateur(jeton: string): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${jeton}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  )
}

// Le type de retour exact du rpc n'est pas versionné dans le dépôt : accepte un texte
// (le numéro) ou une ligne / un tableau de lignes portant numero (ou numero_recu) et
// éventuellement annee_recu.
function lireRetourNumero(data: unknown): { numero: string; anneeRecu?: string } | null {
  const valeur = Array.isArray(data) ? data[0] : data
  if (typeof valeur === 'string' && valeur.trim()) return { numero: valeur.trim() }
  if (valeur && typeof valeur === 'object') {
    const ligne = valeur as Record<string, unknown>
    const numero = ligne.numero ?? ligne.numero_recu ?? ligne.obtenir_numero_recu
    if (typeof numero === 'string' && numero.trim()) {
      return { numero: numero.trim(), anneeRecu: typeof ligne.annee_recu === 'string' ? ligne.annee_recu : undefined }
    }
  }
  return null
}

// « 2026-2027 » -> « 2026 - 2027 » (présentation du modèle de reçu)
function formaterAnnee(annee: string): string {
  return annee.replace(/\s*-\s*/, ' - ').trim()
}

async function preparerRecu(paiementId: string, jeton: string) {
  if (typeof paiementId !== 'string' || !UUID_RE.test(paiementId)) throw new Error('Identifiant de paiement invalide')
  if (typeof jeton !== 'string' || !jeton) throw new Error('Session expirée : reconnectez-vous')

  const supabase = clientUtilisateur(jeton)

  // 1. Numéro de reçu (contrôle du rôle côté base)
  const { data: retour, error: erreurNumero } = await supabase.rpc('obtenir_numero_recu', { p_paiement_id: paiementId })
  if (erreurNumero) throw new Error(erreurNumero.message)
  const numeroLu = lireRetourNumero(retour)
  if (!numeroLu) throw new Error('Numéro de reçu introuvable')

  // 2. Paiement + inscription relus en base avec le même client
  const { data: paiement, error: erreurPaiement } = await supabase
    .from('paiements')
    .select('id, montant, mode, date_paiement, created_at, inscriptions(nom, prenom, email_contact, student_code)')
    .eq('id', paiementId)
    .maybeSingle()
  if (erreurPaiement) throw new Error(erreurPaiement.message)
  if (!paiement) throw new Error('Paiement introuvable')
  const inscription: any = Array.isArray(paiement.inscriptions) ? paiement.inscriptions[0] : paiement.inscriptions
  if (!inscription) throw new Error('Inscription liée introuvable')

  // 3. Année du reçu : fournie par le rpc, sinon suffixe du numéro (« 007/2026-2027 »),
  //    sinon année scolaire courante de la configuration
  let anneeRecu = numeroLu.anneeRecu || numeroLu.numero.split('/')[1] || ''
  if (!anneeRecu) {
    const { data: config } = await supabase
      .from('configuration')
      .select('value')
      .eq('key', 'annee_scolaire_courante')
      .maybeSingle()
    anneeRecu = config?.value || ''
  }

  const pdf = await genererRecuPdf({
    numero: numeroLu.numero,
    datePaiement: datePaiementIso(paiement.date_paiement || paiement.created_at),
    montant: Number(paiement.montant),
    prenom: inscription.prenom || '',
    nom: inscription.nom || '',
    anneeRecu: formaterAnnee(anneeRecu),
    mode: paiement.mode || ''
  })

  return { numero: numeroLu.numero, pdf, nomFichier: nomFichierRecu(numeroLu.numero), inscription }
}

export async function envoyerRecuPaiementAction(paiementId: string, jeton: string): Promise<ResultatRecu> {
  try {
    const { numero, pdf, nomFichier, inscription } = await preparerRecu(paiementId, jeton)
    if (!inscription.email_contact) return { success: false, error: "Pas d'adresse email pour cet élève" }
    const envoi = await sendPaymentReceipt(
      inscription.email_contact,
      `${(inscription.prenom || '').trim()} ${(inscription.nom || '').trim()}`.trim(),
      inscription.student_code || '',
      numero,
      pdf,
      nomFichier
    )
    return envoi.success ? { success: true, numero } : { success: false, error: String(envoi.error || 'Envoi impossible') }
  } catch (error) {
    console.error('Erreur reçu paiement (envoi):', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function telechargerRecuPaiementAction(paiementId: string, jeton: string): Promise<ResultatTelechargement> {
  try {
    const { numero, pdf, nomFichier } = await preparerRecu(paiementId, jeton)
    return { success: true, numero, nomFichier, pdfBase64: Buffer.from(pdf).toString('base64') }
  } catch (error) {
    console.error('Erreur reçu paiement (téléchargement):', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
