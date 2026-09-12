'use server'

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

// Client serveur avec la clé service_role : bypass RLS pour la lecture contrôlée
// de `eleve` / `inscriptions_archive` et l'écriture dans `inscriptions`.
// La clé n'est lue que côté serveur (pas de préfixe NEXT_PUBLIC_, donc jamais
// bundlée côté navigateur) et n'est utilisée que dans ce fichier.
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export interface EleveInfo {
  id: string
  nom: string
  prenom: string
}

export interface DerniereInscriptionInfo {
  ville_residence: string | null
  email: string | null
  niveau_calcule: string | null
  classe_attribuee: string | null
}

// Ligne interne récupérée depuis inscriptions_archive
interface ArchiveRow {
  ville_residence: string | null
  email: string | null
  niveau_calcule: string | null
  classe_attribuee: string | null
  age: number | null
  pays_residence: string | null
  telephone: string | null
  responsable_legal: string | null
}

/**
 * Va chercher la dernière inscription connue de l'élève dans
 * `inscriptions_archive`, la plus récente d'abord (ORDER BY annee_scolaire DESC).
 * Jointure directe sur `inscriptions_archive.eleve_uuid = eleve.id` (colonne
 * désormais peuplée rétroactivement).
 */
async function getDerniereInscriptionArchivee(
  supabase: SupabaseClient,
  eleveId: string
): Promise<ArchiveRow | null> {
  const { data, error } = await supabase
    .from('inscriptions_archive')
    .select('ville_residence, email, niveau_calcule, classe_attribuee, age, pays_residence, telephone, responsable_legal')
    .eq('eleve_uuid', eleveId)
    .order('annee_scolaire', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Erreur récupération dernière inscription archivée:', error)
    return null
  }

  return data
}

export type LookupResult =
  | { found: false }
  | { found: true; alreadyReinscribed: true; message: string }
  | {
      found: true
      alreadyReinscribed: false
      eleve: EleveInfo
      derniereInscription: DerniereInscriptionInfo | null
    }

/**
 * Cherche un élève par matricule exact (pas de recherche partielle/fuzzy).
 * Si l'élève existe déjà dans `inscriptions` (table du cycle en cours
 * uniquement, cf. archivage annuel), il est considéré déjà réinscrit cette
 * année. Sinon, on va chercher sa dernière inscription connue dans
 * `inscriptions_archive` pour pré-remplir l'étape de confirmation.
 */
export async function lookupParMatricule(matricule: string): Promise<LookupResult> {
  const matriculeNormalise = matricule.trim().toUpperCase()
  if (!matriculeNormalise) {
    return { found: false }
  }

  const supabase = getServiceClient()

  const { data: eleve, error: eleveError } = await supabase
    .from('eleve')
    .select('id, nom, prenom')
    .eq('matricule', matriculeNormalise)
    .maybeSingle()

  if (eleveError) {
    console.error('Erreur lookup eleve:', eleveError)
    return { found: false }
  }

  if (!eleve) {
    return { found: false }
  }

  // `inscriptions` ne contient que le cycle scolaire en cours (vidée à chaque
  // archivage annuel) : une ligne existante pour cet élève = déjà réinscrit.
  const { data: inscriptionExistante, error: inscriptionError } = await supabase
    .from('inscriptions')
    .select('id')
    .eq('eleve_id', eleve.id)
    .limit(1)
    .maybeSingle()

  if (inscriptionError) {
    console.error('Erreur vérification réinscription existante:', inscriptionError)
    return { found: false }
  }

  if (inscriptionExistante) {
    return {
      found: true,
      alreadyReinscribed: true,
      message: `${eleve.prenom} ${eleve.nom} est déjà réinscrit(e) pour l'année scolaire en cours.`
    }
  }

  const derniereArchive = await getDerniereInscriptionArchivee(supabase, eleve.id)

  return {
    found: true,
    alreadyReinscribed: false,
    eleve: { id: eleve.id, nom: eleve.nom, prenom: eleve.prenom },
    derniereInscription: derniereArchive
      ? {
          ville_residence: derniereArchive.ville_residence,
          email: derniereArchive.email,
          niveau_calcule: derniereArchive.niveau_calcule,
          classe_attribuee: derniereArchive.classe_attribuee
        }
      : null
  }
}

export interface DonneesReinscription {
  eleveId: string
  joursPreference: string[]
  horaireApresMidi: boolean
  horaireSoir: boolean
  horaireAutre: boolean
  horaireAutreDetail: string
  garderMemeEnseignant: boolean
  niveauChoice: 'inchange' | 'reevaluer'
  remarques: string
}

export type SubmitResult =
  | { success: true; code: string }
  | { success: false; error: string }

/**
 * Crée la ligne `inscriptions` de réinscription. Ré-vérifie l'absence de
 * doublon côté serveur (protection contre une double soumission concurrente)
 * puis recopie depuis `eleve` / la dernière ligne d'`inscriptions_archive` les
 * informations qui ne changent pas d'une année sur l'autre (redondance
 * assumée : chaque inscription reste une photo figée, cf. doc archivage).
 */
export async function soumettreReinscription(
  donnees: DonneesReinscription
): Promise<SubmitResult> {
  const supabase = getServiceClient()

  const { data: eleve, error: eleveError } = await supabase
    .from('eleve')
    .select('id, nom, prenom')
    .eq('id', donnees.eleveId)
    .maybeSingle()

  if (eleveError || !eleve) {
    return { success: false, error: "Élève introuvable. Merci de recommencer depuis l'étape 1." }
  }

  const { data: inscriptionExistante } = await supabase
    .from('inscriptions')
    .select('id')
    .eq('eleve_id', eleve.id)
    .limit(1)
    .maybeSingle()

  if (inscriptionExistante) {
    return {
      success: false,
      error: `${eleve.prenom} ${eleve.nom} est déjà réinscrit(e) pour l'année scolaire en cours.`
    }
  }

  const derniereArchive = await getDerniereInscriptionArchivee(supabase, eleve.id)

  const { data: configRows } = await supabase
    .from('configuration')
    .select('key, value')
    .in('key', ['prefixe_code_etudiant', 'annee_scolaire_courante'])

  const configMap: Record<string, string> = {}
  for (const row of configRows ?? []) {
    configMap[row.key] = row.value
  }

  // Même convention de code que le formulaire d'inscription classique
  const anneeStr = configMap.annee_scolaire_courante || '2026-2027'
  const annee = anneeStr.slice(-2)
  const prefixe = configMap.prefixe_code_etudiant || 'FTM-26'
  const code = `${prefixe}-${annee}-${Date.now().toString().slice(-6)}`

  const { error: insertError } = await supabase.from('inscriptions').insert([
    {
      eleve_id: eleve.id,
      is_reinscription: true,
      garder_meme_enseignant: donnees.garderMemeEnseignant,

      nom: eleve.nom,
      prenom: eleve.prenom,
      email_contact: derniereArchive?.email ?? null,
      ville_residence: derniereArchive?.ville_residence ?? null,
      pays_residence: derniereArchive?.pays_residence ?? null,
      age: derniereArchive?.age ?? null,
      telephone: derniereArchive?.telephone ?? null,
      responsable_legal: derniereArchive?.responsable_legal ?? null,
      adresse_postale: '', // non conservée dans l'archive historique

      jours_preference: donnees.joursPreference,
      horaire_apres_midi: donnees.horaireApresMidi,
      horaire_soir: donnees.horaireSoir,
      horaire_autre: donnees.horaireAutre,
      horaire_autre_detail: donnees.horaireAutreDetail || null,

      niveau_suggere: donnees.niveauChoice === 'inchange' ? derniereArchive?.niveau_calcule ?? null : null,
      remarques: donnees.remarques?.trim() || null,
      reponses_competences: {},
      scores_calculs: {},

      student_code: code,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  if (insertError) {
    console.error('Erreur insertion réinscription:', insertError)
    return { success: false, error: `Erreur lors de l'enregistrement : ${insertError.message}` }
  }

  return { success: true, code }
}
