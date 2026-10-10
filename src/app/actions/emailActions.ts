'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  sendInscriptionNotification,
  sendDecisionEmail,
  sendTeacherAssignmentEmail
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

// Information des enseignants de la classe attribuée, après approbation en délibération.
//
// Sécurité : action serveur appelable publiquement (POST Next.js). Elle n'accepte AUCUN
// contenu du navigateur — seulement l'id de l'inscription et le jeton d'accès Supabase
// de l'utilisateur connecté. Inscription, élève, classe et enseignants sont relus en
// base avec ce jeton (RLS appliquée). Rien n'est envoyé si l'inscription n'est pas
// approuvée avec une classe.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ResultatInfoEnseignants = {
  success: boolean
  error?: string
  // Enseignants effectivement destinataires (prénom nom)
  envoyes: string[]
  // Enseignants liés à la classe mais sans email : non notifiés
  sansEmail: string[]
  // Classe sans aucun enseignant lié : rien n'a été envoyé
  aucunEnseignant: boolean
}

export async function sendTeacherAssignmentEmailAction(
  inscriptionId: string,
  jeton: string
): Promise<ResultatInfoEnseignants> {
  const resultat: ResultatInfoEnseignants = { success: false, envoyes: [], sansEmail: [], aucunEnseignant: false }
  try {
    if (typeof inscriptionId !== 'string' || !UUID_RE.test(inscriptionId)) throw new Error("Identifiant d'inscription invalide")
    if (typeof jeton !== 'string' || !jeton) throw new Error('Session expirée : reconnectez-vous')

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${jeton}` } },
        auth: { persistSession: false, autoRefreshToken: false }
      }
    )

    const { data: inscription, error: erreurInscription } = await supabase
      .from('inscriptions')
      .select('id, nom, prenom, status, classe_id, niveau_definitif, niveau_suggere, is_reinscription, eleve_id')
      .eq('id', inscriptionId)
      .maybeSingle()
    if (erreurInscription) throw new Error(erreurInscription.message)
    if (!inscription) throw new Error('Inscription introuvable')
    if (inscription.status !== 'approved' || !inscription.classe_id) {
      throw new Error("L'inscription n'est pas approuvée avec une classe")
    }

    let matricule = ''
    if (inscription.eleve_id) {
      const { data: eleve, error: erreurEleve } = await supabase
        .from('eleve')
        .select('matricule')
        .eq('id', inscription.eleve_id)
        .maybeSingle()
      if (erreurEleve) throw new Error(erreurEleve.message)
      matricule = eleve?.matricule || ''
    }

    const { data: classe, error: erreurClasse } = await supabase
      .from('classes')
      .select('code, nom, jour, heure, classe_enseignants(role, enseignants(id, nom, prenom, email))')
      .eq('id', inscription.classe_id)
      .maybeSingle()
    if (erreurClasse) throw new Error(erreurClasse.message)
    if (!classe) throw new Error('Classe introuvable')

    // Titulaire et co-titulaire, dédoublonnés par enseignant puis par adresse email
    const vus = new Set<string>()
    const emails = new Map<string, string>()
    for (const lien of (classe.classe_enseignants || []) as any[]) {
      const enseignant = Array.isArray(lien.enseignants) ? lien.enseignants[0] : lien.enseignants
      if (!enseignant || vus.has(enseignant.id)) continue
      vus.add(enseignant.id)
      const nomEnseignant = `${(enseignant.prenom || '').trim()} ${(enseignant.nom || '').trim()}`.trim()
      const email = (enseignant.email || '').trim().toLowerCase()
      if (!email) {
        resultat.sansEmail.push(nomEnseignant)
      } else if (!emails.has(email)) {
        emails.set(email, nomEnseignant)
      }
    }

    if (vus.size === 0) {
      resultat.aucunEnseignant = true
      resultat.success = true
      return resultat
    }
    if (emails.size === 0) {
      resultat.success = true
      return resultat
    }

    const envoi = await sendTeacherAssignmentEmail(Array.from(emails.keys()), {
      nom: (inscription.nom || '').trim(),
      prenom: (inscription.prenom || '').trim(),
      matricule,
      niveau: inscription.niveau_definitif || inscription.niveau_suggere || '',
      isReinscription: !!inscription.is_reinscription,
      classe: { code: classe.code || '', nom: classe.nom || '', jour: classe.jour || '', heure: classe.heure || '' }
    })
    if (!envoi.success) {
      resultat.error = String(envoi.error || 'Envoi impossible')
      return resultat
    }

    resultat.envoyes = Array.from(emails.values())
    resultat.success = true
    return resultat
  } catch (error) {
    console.error('Erreur information enseignants:', error)
    resultat.error = error instanceof Error ? error.message : String(error)
    return resultat
  }
}
