// app/teacher/deliberation/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SectionDivider from '@/components/SectionDivider'
import { sendDecisionEmailAction } from '@/app/actions/emailActions'

function DeliberationContent() {
  const { t } = useTranslation()
  const params = useSearchParams()
  const router = useRouter()
  const filter = params.get('filter') || 'pending_review'
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [allStatuses, setAllStatuses] = useState<{ status: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInscription, setSelectedInscription] = useState<any>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [classesList, setClassesList] = useState<any[]>([])
  const [selectedClasseId, setSelectedClasseId] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
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
        .select('status')

      if (error) throw error
      setAllStatuses(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, nom, niveau, jour, heure, pays, couleur')
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

  const classesTriees = [...classesList].sort((a, b) => {
    const aMatch = classeCorrespond(a) ? 0 : 1
    const bMatch = classeCorrespond(b) ? 0 : 1
    return aMatch - bMatch
  })

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
      // 1ère inscription (pas une réinscription, qui le connaît déjà) et
      // uniquement si un élève est déjà lié à ce stade (eleve_id renseigné).
      let matriculePourEmail: string | undefined
      if (selectedInscription.eleve_id && !selectedInscription.is_reinscription) {
        const { data: eleve } = await supabase
          .from('eleve')
          .select('matricule')
          .eq('id', selectedInscription.eleve_id)
          .maybeSingle()
        matriculePourEmail = eleve?.matricule || undefined
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('deliberation.title')}
      </h1>

      {/* Filtres */}
      <div className="flex space-x-2 mb-6">
        {[
          { value: 'pending_review', label: t('deliberation.filterPending'), color: 'bg-yellow-100 text-yellow-800' },
          { value: 'approved', label: t('deliberation.filterApproved'), color: 'bg-green-100 text-green-800' },
          { value: 'rejected', label: t('deliberation.filterRejected'), color: 'bg-red-100 text-red-800' },
          { value: 'all', label: t('deliberation.filterAll'), color: 'bg-gray-100 text-gray-800' }
        ].map((filtre) => (
          <button
            key={filtre.value}
            onClick={() => router.push(`/teacher/deliberation?filter=${filtre.value}`)}
            className={`px-4 py-2 rounded ${filter === filtre.value ? filtre.color : 'bg-gray-200 hover:bg-gray-300'}`}
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
                {inscriptions.map((inscription) => (
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
                            Réinscription
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
                      Réinscription
                    </span>
                  )}
                </div>

                {selectedInscription.is_reinscription && (
                  <div className="p-3 bg-violet-50 rounded border border-violet-200">
                    <h4 className="text-base font-medium mb-2 text-violet-900">Historique de cet élève</h4>
                    {historiqueEleve.length === 0 ? (
                      <p className="text-sm text-gray-600">Aucune inscription précédente trouvée dans l'archive.</p>
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
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {classesTriees.map((classe) => (
                        <button
                          key={classe.id}
                          onClick={() => setSelectedClasseId(classe.id)}
                          className={`w-full p-2 rounded border text-left flex items-center gap-2 ${
                            selectedClasseId === classe.id
                              ? 'bg-green-600 text-white border-green-700'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {classe.couleur && (
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                              style={{ backgroundColor: classe.couleur }}
                            ></span>
                          )}
                          <span className="flex-1 text-sm">
                            {classe.nom} — {classe.niveau} — {classe.jour} {classe.heure}
                          </span>
                          {classeCorrespond(classe) && (
                            <span className={`text-xs ${selectedClasseId === classe.id ? 'text-white' : 'text-[#527d3e]'}`}>
                              {t('deliberation.classMatchBadge')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
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