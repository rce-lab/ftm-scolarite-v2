// D:\ftm-scolarite\src\app\admin\inscriptions\[code]\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel, getStatutPaiementLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { useParams, useRouter } from 'next/navigation'
import { calculerStatistiquesDetaillees } from '@/app/public/inscription/data/niveauCalcul'
import Link from 'next/link'
import SectionDivider from '@/components/SectionDivider'

export default function InscriptionDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [inscription, setInscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [matricule, setMatricule] = useState<string | null>(null)
  const [historiqueEleve, setHistoriqueEleve] = useState<{ annee_scolaire: string; niveau_calcule: string | null }[]>([])

  useEffect(() => {
    if (params.code) {
      loadInscription()
    }
  }, [params.code])

  const loadInscription = async () => {
    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .eq('student_code', params.code)
        .single()

      if (error) throw error
      
      setInscription(data)
      setNotes(data.notes_admin || '')

      // Calculer les statistiques détaillées
      if (data.reponses_competences) {
        const statistiques = calculerStatistiquesDetaillees(data.reponses_competences)
        setStats(statistiques)
      }

      if (data.eleve_id) {
        const { data: eleve } = await supabase.from('eleve').select('matricule').eq('id', data.eleve_id).maybeSingle()
        setMatricule(eleve?.matricule || null)

        if (data.is_reinscription) {
          const { data: archive, error: archiveError } = await supabase
            .from('inscriptions_archive')
            .select('annee_scolaire, niveau_calcule')
            .eq('eleve_uuid', data.eleve_id)
            .order('annee_scolaire', { ascending: false })

          if (archiveError) {
            console.error('Erreur chargement historique élève:', archiveError)
          } else {
            setHistoriqueEleve(archive || [])
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInscription = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('inscriptions')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('student_code', params.code)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Erreur:', error)
      return { success: false, error }
    }
  }

  const handleSave = async () => {
    const result = await updateInscription({ notes_admin: notes })

    if (result.success) {
      alert(t('inscriptionsDetail.saveSuccessAlert'))
      loadInscription()
    } else {
      alert(t('inscriptionsDetail.saveErrorAlert'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  if (!inscription) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-700 text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{t('inscriptionsDetail.notFoundTitle')}</h3>
        <p className="text-gray-700 mb-6">{t('inscriptionsDetail.notFoundMessage').replace('{code}', String(params.code))}</p>
        <Link
          href="/admin/inscriptions"
          className="text-[#689e4e] hover:text-[#527d3e] font-medium"
        >
          {t('inscriptionsDetail.backToListLink')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/admin/inscriptions')}
              className="text-gray-500 hover:text-gray-700"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {inscription.prenom} {inscription.nom}
              {inscription.is_reinscription && (
                <span className="px-3 py-1 text-sm rounded-full bg-violet-100 text-violet-700 font-semibold">
                  Réinscription
                </span>
              )}
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            {t('inscriptionsDetail.studentCodeLabel')} <span className="font-mono font-bold">{inscription.student_code}</span>
            {matricule && (
              <span className="ml-3">
                Matricule : <span className="font-mono font-bold">{matricule}</span>
              </span>
            )}
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${
            inscription.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            inscription.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-green-100 text-green-800 border-green-200'
          }`}>
            {getStatutLabel(inscription.status, { emoji: true })}
          </div>
          <div>
            {inscription.status === 'approved' ? (
              <div className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${
                inscription.statut_paiement !== 'paye' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'
              }`}>
                {getStatutPaiementLabel(inscription.statut_paiement, { emoji: true })}
              </div>
            ) : (
              <span className="text-sm text-gray-700">—</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {t('inscriptionsDetail.registeredOn').replace('{date}', new Date(inscription.created_at).toLocaleDateString('fr-FR'))}
          </p>
        </div>
      </div>

      <SectionDivider />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('inscriptionsDetail.personalInfoTitle')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldName')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.nom}</div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldFirstName')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.prenom}</div>
              </div>
              {inscription.age && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldAge')}</label>
                  <div className="p-2 bg-gray-50 rounded border">{t('inscriptionsDetail.ageYears').replace('{age}', String(inscription.age))}</div>
                </div>
              )}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldEmail')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.email_contact}</div>
              </div>
              <div className="col-span-2">
                <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldPhone')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.telephone}</div>
              </div>
            </div>
          </div>

          {/* Évaluation et décision */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('inscriptionsDetail.evaluationTitle')}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('inscriptionsDetail.suggestedLevelLabel')}</label>
                <div className="p-3 bg-[#689e4e]/10 rounded border border-[#689e4e]/30">
                  <div className="text-2xl font-bold text-[#689e4e]">{inscription.niveau_suggere}</div>
                  <div className="text-sm text-[#527d3e]">{t('inscriptionsDetail.autoCalculated')}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('inscriptionsDetail.adminNotesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
                placeholder={t('inscriptionsDetail.adminNotesPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium"
              >
                {t('inscriptionsDetail.saveButton')}
              </button>
            </div>
          </div>

          {/* Statistiques détaillées */}
          {stats && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
                {t('inscriptionsDetail.detailedStatsTitle')}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-base">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableLevel')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableScore')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableQuestions')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableScorePercent')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableThreshold')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('inscriptionsDetail.statsTableStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats).map(([niveau, data]: [string, any]) => (
                      <tr key={niveau} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{niveau}</td>
                        <td className="px-4 py-3">
                          {data.score} / {data.scoreMaxPossible}
                        </td>
                        <td className="px-4 py-3">
                          {data.questionsRepondues} / {data.totalQuestions}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-[#689e4e] h-2.5 rounded-full"
                              style={{ width: `${Math.min(data.pourcentageScore, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{data.pourcentageScore.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3">{data.seuil}</td>
                        <td className="px-4 py-3">
                          {data.seuilAtteint ? (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">{t('inscriptionsDetail.thresholdReached')}</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">{t('inscriptionsDetail.thresholdNotReached')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('inscriptionsDetail.actionsTitle')}
            </h2>
            <div className="space-y-3">
              <Link
                href="/teacher/deliberation"
                className="block w-full p-3 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium text-left"
              >
                {t('inscriptionsDetail.viewInDeliberationLink')}
              </Link>
              <button
                onClick={() => window.print()}
                className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-left"
              >
                {t('inscriptionsDetail.actionPrint')}
              </button>
            </div>
          </div>

          {/* Historique de cet élève (réinscription uniquement) */}
          {inscription.is_reinscription && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-1 self-stretch bg-violet-500 rounded-sm"></span>
                Historique de cet élève
              </h2>
              {historiqueEleve.length === 0 ? (
                <p className="text-sm text-gray-600">Aucune inscription précédente trouvée dans l'archive.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="pb-2 font-medium">Année scolaire</th>
                      <th className="pb-2 font-medium">Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historiqueEleve.map((h, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2">{h.annee_scolaire}</td>
                        <td className="py-2">{h.niveau_calcule || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Historique */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('inscriptionsDetail.historyTitle')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('inscriptionsDetail.createdLabel')}</span>
                <span className="font-medium">{new Date(inscription.created_at).toLocaleString('fr-FR')}</span>
              </div>
              {inscription.updated_at !== inscription.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('inscriptionsDetail.lastModifiedLabel')}</span>
                  <span className="font-medium">{new Date(inscription.updated_at).toLocaleString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Réponses */}
          {inscription.reponses_competences && Object.keys(inscription.reponses_competences).length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
                {t('inscriptionsDetail.responsesSummaryTitle')}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('inscriptionsDetail.totalQuestions')}</span>
                  <span className="font-medium">{Object.keys(inscription.reponses_competences).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('inscriptionsDetail.responsesYes')}</span>
                  <span className="font-medium text-green-600">
                    {Object.values(inscription.reponses_competences).filter(r => r === 'oui').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('inscriptionsDetail.responsesSomewhat')}</span>
                  <span className="font-medium text-yellow-600">
                    {Object.values(inscription.reponses_competences).filter(r => r === 'un_peu').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('inscriptionsDetail.responsesNo')}</span>
                  <span className="font-medium text-red-600">
                    {Object.values(inscription.reponses_competences).filter(r => r === 'non').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}