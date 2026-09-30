// app/teacher/deliberation/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SectionDivider from '@/components/SectionDivider'
import GrilleCompetencesModal from '@/components/GrilleCompetencesModal'
import { sendDecisionEmailAction } from '@/app/actions/emailActions'

// Libellés des jours de préférence du candidat (inscriptions.jours_preference).
const JOUR_KEYS: Record<string, string> = {
  lundi: 'deliberation.dayMonday',
  mardi: 'deliberation.dayTuesday',
  mercredi: 'deliberation.dayWednesday',
  jeudi: 'deliberation.dayThursday',
  vendredi: 'deliberation.dayFriday',
  samedi: 'deliberation.daySaturday'
}

function DeliberationContent() {
  const { t } = useTranslation()
  const params = useSearchParams()
  const router = useRouter()
  const filter = params.get('filter') || 'pending_review'
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [allStatuses, setAllStatuses] = useState<{ status: string; is_reinscription: boolean }[]>([])
  // Sous-filtre du bouton "Dont N réinscriptions" : affine la liste déjà chargée
  // (pending_review) sur is_reinscription, sans requête supplémentaire. Toujours
  // remis à false par les 4 onglets de statut, qui portent sur l'ensemble des
  // candidats (réinscriptions incluses).
  const [filtreReinscriptionSeule, setFiltreReinscriptionSeule] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedInscription, setSelectedInscription] = useState<any>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [classesList, setClassesList] = useState<any[]>([])
  const [selectedClasseId, setSelectedClasseId] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [grilleModalOpen, setGrilleModalOpen] = useState(false)
  const [motifRejetInput, setMotifRejetInput] = useState('')
  const [sending, setSending] = useState(false)
  const [historiqueEleve, setHistoriqueEleve] = useState<{ annee_scolaire: string; niveau_calcule: string | null }[]>([])

  useEffect(() => {
    loadInscriptions()
  }, [filter])

  useEffect(() => {
    loadAllStatuses()
  }, [])

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    loadPhotoUrl()
  }, [selectedInscription?.id])

  useEffect(() => {
    setSelectedClasseId(selectedInscription?.classe_id || '')
    // La grille affichée appartient au candidat sélectionné : on la referme quand on
    // change de candidat, pour ne jamais laisser une grille ouverte sur un autre dossier.
    setGrilleModalOpen(false)
  }, [selectedInscription?.id])

  useEffect(() => {
    loadHistoriqueEleve()
  }, [selectedInscription?.id])

  // Historique de l'élève (années précédentes), pour aider la décision de
  // progression sur une réinscription : Maintien / Passage niveau sup / À réévaluer.
  const loadHistoriqueEleve = async () => {
    if (!selectedInscription?.is_reinscription || !selectedInscription?.eleve_id) {
      setHistoriqueEleve([])
      return
    }
    try {
      const { data, error } = await supabase
        .from('inscriptions_archive')
        .select('annee_scolaire, niveau_calcule')
        .eq('eleve_uuid', selectedInscription.eleve_id)
        .order('annee_scolaire', { ascending: false })

      if (error) throw error
      setHistoriqueEleve(data || [])
    } catch (error) {
      console.error('Erreur chargement historique élève:', error)
      setHistoriqueEleve([])
    }
  }

  const loadPhotoUrl = async () => {
    if (!selectedInscription?.photo_url) {
      setPhotoUrl(null)
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('photos-candidats')
        .createSignedUrl(selectedInscription.photo_url, 3600)

      if (error) throw error
      setPhotoUrl(data?.signedUrl || null)
    } catch (error) {
      console.error('Erreur:', error)
      setPhotoUrl(null)
    }
  }

  const loadInscriptions = async () => {
    try {
      let query = supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setInscriptions(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Compteurs indépendants du filtre actif : toujours calculés sur l'ensemble
  // complet des inscriptions, jamais sur la liste déjà filtrée côté requête.
  const loadAllStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('status, is_reinscription')

      if (error) throw error
      setAllStatuses(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // La jointure classe_enseignants → enseignants permet d'afficher le nom de
  // l'enseignant dans le sélecteur de classe. `role` est un texte libre côté base
  // (valeurs utilisées : "titulaire", "co-titulaire") et peut être absent : il sert
  // uniquement à faire remonter le titulaire en tête, jamais à filtrer. `code`
  // (format Cxx) est utilisé dans le libellé de l'option, cf. libelleOptionClasse.
  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, code, nom, niveau, jour, heure, pays, classe_enseignants(role, enseignants(id, nom, prenom))')
        .order('nom')

      if (error) throw error
      setClassesList(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Une classe "correspond" si son niveau égale le niveau définitif assigné
  // (quand il existe) et si son jour fait partie des disponibilités du
  // candidat (ou que celui-ci a coché "n'importe quel jour"). L'horaire précis
  // (classes.heure est une chaîne libre, ex: "18h") n'est pas comparé aux
  // créneaux booléens horaire_apres_midi/soir/autre de l'inscription : les deux
  // formats ne correspondent pas de façon fiable, un rapprochement forcé
  // produirait de faux "compatible" plutôt qu'une aide réelle au tri.
  const classeCorrespond = (classe: any) => {
    if (!selectedInscription) return false
    const niveauOk = !selectedInscription.niveau_definitif || classe.niveau === selectedInscription.niveau_definitif
    const jours = selectedInscription.jours_preference || []
    const jourOk = jours.length === 0 || jours.includes('peu_importe') || jours.includes(classe.jour)
    return niveauOk && jourOk
  }

  // Enseignants liés à une classe, titulaire(s) d'abord puis les autres rôles. Une
  // classe sans enseignant lié (C04, C05, C06 et C11 à ce jour) reste listée : on le
  // signale explicitement plutôt que de la masquer du sélecteur.
  const enseignantsOrdonnes = (classe: any): { prenom: string; nom: string }[] => {
    const liens = (classe.classe_enseignants || []).filter((ce: any) => ce.enseignants)
    return [...liens]
      .sort((a: any, b: any) => {
        const aTitulaire = a.role === 'titulaire' ? 0 : 1
        const bTitulaire = b.role === 'titulaire' ? 0 : 1
        return aTitulaire - bTitulaire
      })
      .map((ce: any) => ({ prenom: ce.enseignants.prenom || '', nom: ce.enseignants.nom || '' }))
      .filter((e) => e.prenom || e.nom)
  }

  // Enseignant principal d'une classe (titulaire en priorité, sinon le premier lien
  // trouvé) : sert à la fois de tête de libellé et de clé de tri du sélecteur.
  const enseignantPrincipal = (classe: any) => enseignantsOrdonnes(classe)[0] || null

  // Libellé d'une option du sélecteur de classe, format demandé : "prénom, NOM
  // enseignant - code classe (Cxx) - nom de la classe (Jour Heure) - niveau". Le ✓ de
  // compatibilité reste un simple préfixe informatif, cf. classeCorrespond ci-dessus.
  const libelleOptionClasse = (classe: any) => {
    const prefixe = classeCorrespond(classe) ? `${t('deliberation.classMatchBadge')} ` : ''
    const [principal, ...autres] = enseignantsOrdonnes(classe)
    let enseignantLabel = principal ? `${principal.prenom}, ${principal.nom}`.trim() : t('deliberation.classNoTeacherAssigned')
    if (autres.length > 0) {
      enseignantLabel += ` (+ ${autres.map((e) => `${e.prenom} ${e.nom}`.trim()).join(', ')})`
    }
    const parts = [enseignantLabel, classe.code, classe.nom, classe.niveau]
    return prefixe + parts.filter((p) => p).join(' — ')
  }

  // Ordre naturel de la semaine (lundi → dimanche) : classe.jour est une des valeurs
  // fixes du formulaire, donc un trigramme de rang plutôt qu'un tri alphabétique, qui
  // classerait par exemple "Jeudi" avant "Lundi".
  const ORDRE_JOURS: Record<string, number> = {
    lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7
  }

  // Tri du sélecteur : prénom de l'enseignant principal d'abord (demande explicite),
  // puis jour de la semaine en second critère (dans l'ordre du calendrier, pas
  // alphabétique) — pour départager plusieurs classes d'un même enseignant, et pour
  // ordonner entre elles les classes sans enseignant lié, repoussées en fin de liste
  // faute de prénom. À prénom et jour égaux (rare : même enseignant, même jour), on
  // départage par heure puis, en tout dernier recours, par nom de classe.
  const classesTrieesParPrenom = [...classesList].sort((a, b) => {
    const prenomA = enseignantPrincipal(a)?.prenom || ''
    const prenomB = enseignantPrincipal(b)?.prenom || ''
    if (!prenomA && prenomB) return 1
    if (prenomA && !prenomB) return -1
    if (prenomA && prenomB) {
      const cmp = prenomA.localeCompare(prenomB, 'fr', { sensitivity: 'base' })
      if (cmp !== 0) return cmp
    }
    const jourA = ORDRE_JOURS[(a.jour || '').toLowerCase()] ?? 99
    const jourB = ORDRE_JOURS[(b.jour || '').toLowerCase()] ?? 99
    if (jourA !== jourB) return jourA - jourB
    const heureCmp = (a.heure || '').localeCompare(b.heure || '')
    if (heureCmp !== 0) return heureCmp
    return (a.nom || '').localeCompare(b.nom || '', 'fr', { sensitivity: 'base' })
  })

  const formatAge = () => {
    const age = selectedInscription?.age
    if (age === null || age === undefined || age === '') return t('deliberation.ageUnknown')
    return t('deliberation.ageValue').replace('{n}', String(age))
  }

  // jours_preference est un tableau jsonb déjà ordonné par rang de choix (3 max),
  // ou la valeur unique ["peu_importe"].
  const joursPreferenceOrdonnes = (): { label: string; rang: string | null }[] => {
    const jours: string[] = selectedInscription?.jours_preference || []
    if (jours.length === 1 && jours[0] === 'peu_importe') {
      return [{ label: t('deliberation.preferredDaysAny'), rang: null }]
    }
    return jours.map((jour, index) => ({
      label: JOUR_KEYS[jour] ? t(JOUR_KEYS[jour]) : jour,
      rang: index === 0
        ? t('deliberation.choiceRankFirst')
        : t('deliberation.choiceRankOther').replace('{n}', String(index + 1))
    }))
  }

  // Créneaux cochés : préférences globales du candidat, sans couplage avec un jour
  // précis (le formulaire d'inscription ne le demande pas).
  const creneauxHoraires = (): string[] => {
    if (!selectedInscription) return []
    const creneaux: string[] = []
    if (selectedInscription.horaire_apres_midi) creneaux.push(t('deliberation.timeSlotAfternoon'))
    if (selectedInscription.horaire_soir) creneaux.push(t('deliberation.timeSlotEvening'))
    if (selectedInscription.horaire_autre) {
      creneaux.push(
        t('deliberation.timeSlotOther').replace(
          '{detail}',
          selectedInscription.horaire_autre_detail || '—'
        )
      )
    }
    return creneaux
  }

  const openRejectModal = () => {
    setMotifRejetInput('')
    setRejectModalOpen(true)
  }

  const closeRejectModal = () => {
    setRejectModalOpen(false)
    setMotifRejetInput('')
  }

  const handleApprove = async () => {
    if (!selectedInscription) return
    const niveau = selectedInscription.niveau_definitif || selectedInscription.niveau_suggere
    if (!niveau || !selectedClasseId) {
      alert(t('deliberation.validationMissingLevelOrClass'))
      return
    }
    if (!confirm(t('deliberation.approveConfirm'))) return

    setSending(true)
    try {
      const classeSelectionnee = classesList.find(c => c.id === selectedClasseId)

      const { error } = await supabase
        .from('inscriptions')
        .update({
          status: 'approved',
          niveau_definitif: niveau,
          classe_id: selectedClasseId,
          classe_attribuee: classeSelectionnee
            ? `${classeSelectionnee.jour} ${classeSelectionnee.heure} - ${classeSelectionnee.niveau} - ${classeSelectionnee.nom}`
            : '',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInscription.id)

      if (error) throw error

      // Matricule à mentionner dans l'email de décision : uniquement pour une
      // 1ère inscription (pas une réinscription, qui le connaît déjà). Pour un
      // nouveau candidat pas encore lié à une fiche élève, `creer_eleve_pour_inscription`
      // (fonction Postgres, matricule séquentiel atomique via `eleve_matricule_seq`)
      // crée cette fiche à la volée et relie `inscriptions.eleve_id` — avant ce
      // correctif, cette liaison ne se faisait jamais pour un nouveau candidat et
      // a dû être rattrapée manuellement pour les approbations déjà passées.
      let matriculePourEmail: string | undefined
      if (!selectedInscription.is_reinscription) {
        if (!selectedInscription.eleve_id) {
          const { data: eleveCree, error: erreurEleve } = await supabase.rpc(
            'creer_eleve_pour_inscription',
            { p_inscription_id: selectedInscription.id }
          )
          if (erreurEleve) throw erreurEleve
          matriculePourEmail = eleveCree?.matricule || undefined
        } else {
          const { data: eleve } = await supabase
            .from('eleve')
            .select('matricule')
            .eq('id', selectedInscription.eleve_id)
            .maybeSingle()
          matriculePourEmail = eleve?.matricule || undefined
        }
      }

      const emailResult = await sendDecisionEmailAction(
        { ...selectedInscription, matricule: matriculePourEmail },
        'approved',
        classeSelectionnee
      )
      if (emailResult.success) {
        alert(t('deliberation.statusUpdateAlert').replace('{status}', 'approved'))
      } else {
        alert(t('deliberation.emailFailedAlert'))
      }

      loadInscriptions()
      loadAllStatuses()
      setSelectedInscription(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('deliberation.updateErrorAlert'))
    } finally {
      setSending(false)
    }
  }

  const handleSendReject = async () => {
    if (!selectedInscription) return
    setSending(true)

    try {
      const motif = motifRejetInput.trim()

      const { error } = await supabase
        .from('inscriptions')
        .update({
          status: 'rejected',
          motif_rejet: motif || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInscription.id)

      if (error) throw error

      const emailResult = await sendDecisionEmailAction(selectedInscription, 'rejected', undefined, motif || undefined)
      if (emailResult.success) {
        alert(t('deliberation.statusUpdateAlert').replace('{status}', 'rejected'))
      } else {
        alert(t('deliberation.emailFailedAlert'))
      }

      closeRejectModal()
      loadInscriptions()
      loadAllStatuses()
      setSelectedInscription(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('deliberation.updateErrorAlert'))
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inscriptions')
        .update({ 
          status,
          niveau_definitif: status === 'approved' ? selectedInscription?.niveau_definitif || selectedInscription?.niveau_suggere : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      alert(t('deliberation.statusUpdateAlert').replace('{status}', status))
      loadInscriptions()
      loadAllStatuses()
      setSelectedInscription(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('deliberation.updateErrorAlert'))
    }
  }

  const updateNiveauDefinitif = async (id: string, niveau: string) => {
    try {
      const { error } = await supabase
        .from('inscriptions')
        .update({ 
          niveau_definitif: niveau,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      alert(t('deliberation.levelUpdateAlert').replace('{niveau}', niveau))
      loadInscriptions()
      loadAllStatuses()

      // Mettre à jour l'inscription sélectionnée
      if (selectedInscription?.id === id) {
        setSelectedInscription({...selectedInscription, niveau_definitif: niveau})
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('deliberation.updateErrorAlert'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  // Filtrage client du bouton "Dont N réinscriptions" : `inscriptions` reste la
  // liste telle que chargée par statut (loadInscriptions), ce sous-filtre ne
  // déclenche pas de nouvelle requête.
  const inscriptionsAffichees = filtreReinscriptionSeule
    ? inscriptions.filter((i) => i.is_reinscription)
    : inscriptions

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('deliberation.title')}
      </h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* "En attente total" en 1er, puis son sous-filtre réinscriptions juste après
            (plutôt qu'en fin de liste) : les deux portent sur la même file. */}
        <button
          onClick={() => {
            setFiltreReinscriptionSeule(false)
            router.push('/teacher/deliberation?filter=pending_review')
          }}
          className={`px-4 py-2 rounded ${filter === 'pending_review' && !filtreReinscriptionSeule ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {t('deliberation.filterPending')} ({allStatuses.filter((i) => i.status === 'pending_review').length})
        </button>
        <button
          onClick={() => {
            setFiltreReinscriptionSeule(true)
            if (filter !== 'pending_review') {
              router.push('/teacher/deliberation?filter=pending_review')
            }
          }}
          className={`px-4 py-2 rounded ${filtreReinscriptionSeule ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {t('deliberation.filterReinscriptionPending').replace(
            '{n}',
            String(allStatuses.filter((i) => i.status === 'pending_review' && i.is_reinscription).length)
          )}
        </button>
        {[
          { value: 'approved', label: t('deliberation.filterApproved'), color: 'bg-green-100 text-green-800' },
          { value: 'rejected', label: t('deliberation.filterRejected'), color: 'bg-red-100 text-red-800' },
          { value: 'all', label: t('deliberation.filterAll'), color: 'bg-gray-100 text-gray-800' }
        ].map((filtre) => (
          <button
            key={filtre.value}
            onClick={() => {
              setFiltreReinscriptionSeule(false)
              router.push(`/teacher/deliberation?filter=${filtre.value}`)
            }}
            className={`px-4 py-2 rounded ${filter === filtre.value && !filtreReinscriptionSeule ? filtre.color : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {filtre.label} ({filtre.value === 'all' ? allStatuses.length : allStatuses.filter(i => i.status === filtre.value).length})
          </button>
        ))}
      </div>

      <SectionDivider />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des inscriptions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('deliberation.tableStudent')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('deliberation.tableSuggestedLevel')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('deliberation.tableStatus')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('deliberation.tableDate')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('deliberation.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inscriptionsAffichees.map((inscription) => (
                  <tr 
                    key={inscription.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedInscription?.id === inscription.id ? 'bg-[#689e4e]/10' : ''}`}
                    onClick={() => setSelectedInscription(inscription)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium flex items-center gap-2">
                        <span>{inscription.prenom} {inscription.nom}</span>
                        {inscription.is_reinscription && (
                          <span className="px-2 py-0.5 text-xs rounded bg-violet-100 text-violet-700 font-medium whitespace-nowrap">
                            {t('deliberation.reinscriptionBadge')}
                          </span>
                        )}
                      </div>
                      <div className="text-base text-gray-700">{inscription.email_contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded bg-[#689e4e]/15 text-[#527d3e] font-bold">
                        {inscription.niveau_suggere}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        inscription.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        inscription.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatutLabel(inscription.status, { emoji: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base">
                      {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInscription(inscription)
                        }}
                        className="text-[#689e4e] hover:text-[#527d3e] text-base"
                      >
                        {t('deliberation.deliberateLink')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panneau de délibération */}
        <div className="space-y-6">
          {selectedInscription ? (
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
                <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
                {t('deliberation.panelTitle')}
              </h2>

              <div className="space-y-4">
                <div>
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt={`${selectedInscription.prenom} ${selectedInscription.nom}`}
                      className="w-20 h-20 rounded-full object-cover border border-gray-300 mb-3"
                    />
                  )}
                  <h3 className="font-medium mb-2">{selectedInscription.prenom} {selectedInscription.nom}</h3>
                  <p className="text-base text-gray-600">{t('deliberation.codeLabel').replace('{code}', selectedInscription.student_code)}</p>
                  {selectedInscription.is_reinscription && (
                    <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-violet-100 text-violet-700 font-semibold">
                      {t('deliberation.reinscriptionBadge')}
                    </span>
                  )}
                  <button
                    onClick={() => setGrilleModalOpen(true)}
                    className="mt-3 w-full px-3 py-2 border border-[#689e4e] text-[#527d3e] rounded text-sm hover:bg-[#689e4e]/10"
                  >
                    {t('deliberation.competenceGridButton')}
                  </button>
                </div>

                {/* Âge et disponibilités déclarées : données brutes du candidat, pour que
                    l'enseignant fasse lui-même le rapprochement fin avec les créneaux
                    réels des classes (le matching automatique ne compare que niveau + jour). */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="text-base font-medium mb-2">{t('deliberation.candidateInfoTitle')}</h4>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('deliberation.ageLabel')}</span>
                    <span className="font-medium">{formatAge()}</span>
                  </div>

                  <div className="text-sm mb-2">
                    <span className="text-gray-600">{t('deliberation.preferredDaysLabel')}</span>
                    {joursPreferenceOrdonnes().length === 0 ? (
                      <p className="font-medium">{t('deliberation.preferredDaysNone')}</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {joursPreferenceOrdonnes().map((jour, i) => (
                          <li key={i} className="flex justify-between">
                            <span className="font-medium">{jour.label}</span>
                            {jour.rang && <span className="text-gray-600">{jour.rang}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">{t('deliberation.timeSlotsLabel')}</span>
                    {creneauxHoraires().length === 0 ? (
                      <p className="font-medium">{t('deliberation.timeSlotsNone')}</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {creneauxHoraires().map((creneau, i) => (
                          <li key={i} className="font-medium">{creneau}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-2 italic">
                    {t('deliberation.preferencesGlobalNote')}
                  </p>
                </div>

                {selectedInscription.is_reinscription && (
                  <div className="p-3 bg-violet-50 rounded border border-violet-200">
                    <h4 className="text-base font-medium mb-2 text-violet-900">{t('deliberation.studentHistoryTitle')}</h4>
                    {historiqueEleve.length === 0 ? (
                      <p className="text-sm text-gray-600">{t('deliberation.studentHistoryEmpty')}</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {historiqueEleve.map((h, i) => (
                          <li key={i} className="flex justify-between">
                            <span className="text-gray-700">{h.annee_scolaire}</span>
                            <span className="font-medium">{h.niveau_calcule || '—'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-base font-medium mb-1">{t('deliberation.suggestedLevelLabel')}</label>
                  <div className="p-2 bg-[#689e4e]/10 rounded border border-[#689e4e]/30 text-center">
                    <span className="text-xl font-bold text-[#527d3e]">{selectedInscription.niveau_suggere}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium mb-1">{t('deliberation.finalLevelLabel')}</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((niveau) => (
                      <button
                        key={niveau}
                        onClick={() => updateNiveauDefinitif(selectedInscription.id, niveau)}
                        className={`p-2 text-center rounded border ${
                          selectedInscription.niveau_definitif === niveau
                            ? 'bg-green-600 text-white border-green-700'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {niveau}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {t('deliberation.currentLabel').replace('{niveau}', selectedInscription.niveau_definitif || t('deliberation.undefinedLevel'))}
                  </p>
                </div>

                <div>
                  <label className="block text-base font-medium mb-1">{t('deliberation.assignedClassLabel')}</label>
                  {classesList.length === 0 ? (
                    <p className="text-sm text-gray-700">{t('deliberation.noClassesAvailable')}</p>
                  ) : (
                    <select
                      value={selectedClasseId}
                      onChange={(e) => setSelectedClasseId(e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
                    >
                      <option value="">{t('deliberation.classSelectPlaceholder')}</option>
                      {classesTrieesParPrenom.map((classe) => (
                        <option key={classe.id} value={classe.id}>
                          {libelleOptionClasse(classe)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-base font-medium mb-2">{t('deliberation.finalDecisionLabel')}</label>
                  <div className="flex space-x-2">
                    {selectedInscription.status !== 'approved' && selectedInscription.status !== 'rejected' && (
                      <button
                        onClick={handleApprove}
                        disabled={sending}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {t('deliberation.approveButton')}
                      </button>
                    )}
                    {selectedInscription.status !== 'rejected' && (
                      <button
                        onClick={openRejectModal}
                        disabled={sending}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {t('deliberation.rejectButton')}
                      </button>
                    )}
                  </div>
                  {selectedInscription.status !== 'pending_review' && (
                    <button
                      onClick={() => updateStatus(selectedInscription.id, 'pending_review')}
                      className="w-full mt-2 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
                    >
                      {t('deliberation.resetToPendingButton')}
                    </button>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Link
                    href={`/admin/inscriptions/${selectedInscription.student_code}`}
                    className="block text-center text-[#689e4e] hover:text-[#527d3e]"
                  >
                    {t('deliberation.viewAllDetailsLink')}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded shadow p-6 text-center">
              <div className="text-gray-400 text-4xl mb-4">👨‍🏫</div>
              <h3 className="font-medium mb-2">{t('deliberation.selectStudentTitle')}</h3>
              <p className="text-base text-gray-600">
                {t('deliberation.selectStudentHint')}
              </p>
            </div>
          )}

          {/* Statistiques */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-bold mb-3">{t('deliberation.statsTitle')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('deliberation.statsPending')}</span>
                <span className="font-bold text-yellow-600">
                  {allStatuses.filter(i => i.status === 'pending_review').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('deliberation.statsApproved')}</span>
                <span className="font-bold text-green-600">
                  {allStatuses.filter(i => i.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('deliberation.statsRejected')}</span>
                <span className="font-bold text-red-600">
                  {allStatuses.filter(i => i.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {grilleModalOpen && selectedInscription && (
        <GrilleCompetencesModal
          inscription={selectedInscription}
          onClose={() => setGrilleModalOpen(false)}
        />
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('deliberation.modalRejectTitle')}
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">{t('deliberation.motifRejetLabel')}</label>
              <input
                type="text"
                value={motifRejetInput}
                onChange={(e) => setMotifRejetInput(e.target.value)}
                placeholder={t('deliberation.motifRejetPlaceholder')}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e] text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeRejectModal}
                disabled={sending}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('deliberation.modalCancelButton')}
              </button>
              <button
                onClick={handleSendReject}
                disabled={sending}
                className="px-4 py-2 text-white rounded text-sm disabled:opacity-50 bg-red-600 hover:bg-red-700"
              >
                {sending ? t('deliberation.modalSendingButton') : t('deliberation.modalSendButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DeliberationPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    }>
      <DeliberationContent />
    </Suspense>
  )
}