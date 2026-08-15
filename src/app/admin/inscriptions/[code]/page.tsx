// D:\ftm-scolarite\src\app\admin\inscriptions\[code]\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { useParams, useRouter } from 'next/navigation'
import { calculerStatistiquesDetaillees } from '@/app/public/inscription/data/niveauCalcul'
import { sendDecisionEmailAction } from '@/app/actions/emailActions'
import Link from 'next/link'

export default function InscriptionDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [inscription, setInscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [niveauFinal, setNiveauFinal] = useState('')
  const [classe, setClasse] = useState('')
  const [classeId, setClasseId] = useState('')
  const [classesList, setClassesList] = useState<any[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (params.code) {
      loadInscription()
    }
  }, [params.code])

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, nom, niveau, jour, heure')
        .order('nom')

      if (error) throw error
      setClassesList(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleClasseChange = (id: string) => {
    setClasseId(id)
    const selected = classesList.find(c => c.id === id)
    setClasse(selected ? `${selected.jour} ${selected.heure} - ${selected.niveau} - ${selected.nom}` : '')
  }

  const loadInscription = async () => {
    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .eq('student_code', params.code)
        .single()

      if (error) throw error
      
      setInscription(data)
      setNiveauFinal(data.niveau_definitif || data.niveau_suggere || 'A1')
      setClasse(data.classe_attribuee || '')
      setClasseId(data.classe_id || '')
      setNotes(data.notes_admin || '')
      
      // Calculer les statistiques détaillées
      if (data.reponses_competences) {
        const statistiques = calculerStatistiquesDetaillees(data.reponses_competences)
        setStats(statistiques)
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
    const classeIdAvant = inscription?.classe_id || null

    const result = await updateInscription({
      niveau_definitif: niveauFinal,
      classe_id: classeId || null,
      classe_attribuee: classe,
      notes_admin: notes
    })

    if (result.success) {
      // Email de décision uniquement lors de la toute première assignation de classe
      if (classeId && !classeIdAvant) {
        const classeSelectionnee = classesList.find(c => c.id === classeId)
        if (classeSelectionnee) {
          sendDecisionEmailAction(
            { ...inscription, niveau_definitif: niveauFinal, classe_id: classeId },
            classeSelectionnee
          ).catch((err) => console.error('Erreur envoi email décision:', err))
        }
      }

      alert(t('inscriptionsDetail.saveSuccessAlert'))
      loadInscription()
    } else {
      alert(t('inscriptionsDetail.saveErrorAlert'))
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(t('inscriptionsDetail.statusChangeConfirm').replace('{status}', newStatus))) return

    const result = await updateInscription({ status: newStatus })

    if (result.success) {
      alert(t('inscriptionsDetail.statusUpdateSuccessAlert'))
      loadInscription()
    } else {
      alert(t('inscriptionsDetail.statusUpdateErrorAlert'))
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
        <div className="text-gray-400 text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{t('inscriptionsDetail.notFoundTitle')}</h3>
        <p className="text-gray-500 mb-6">{t('inscriptionsDetail.notFoundMessage').replace('{code}', String(params.code))}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              {inscription.prenom} {inscription.nom}
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Code étudiant: <span className="font-mono font-bold">{inscription.student_code}</span>
          </p>
        </div>
        <div className="text-right">
          <div className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${
            inscription.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            inscription.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
            inscription.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-orange-100 text-orange-800 border-orange-200'
          }`}>
            {getStatutLabel(inscription.status, { emoji: true })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('inscriptionsDetail.registeredOn').replace('{date}', new Date(inscription.created_at).toLocaleDateString('fr-FR'))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.personalInfoTitle')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldName')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.nom}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldFirstName')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.prenom}</div>
              </div>
              {inscription.age && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldAge')}</label>
                  <div className="p-2 bg-gray-50 rounded border">{t('inscriptionsDetail.ageYears').replace('{age}', String(inscription.age))}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldEmail')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.email_contact}</div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.fieldPhone')}</label>
                <div className="p-2 bg-gray-50 rounded border">{inscription.telephone}</div>
              </div>
            </div>
          </div>

          {/* Évaluation et décision */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.evaluationTitle')}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.suggestedLevelLabel')}</label>
                <div className="p-3 bg-[#689e4e]/10 rounded border border-[#689e4e]/30">
                  <div className="text-2xl font-bold text-[#689e4e]">{inscription.niveau_suggere}</div>
                  <div className="text-sm text-[#527d3e]">{t('inscriptionsDetail.autoCalculated')}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.finalLevelLabel')}</label>
                <select
                  value={niveauFinal}
                  onChange={(e) => setNiveauFinal(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
                >
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inscriptionsDetail.assignedClassLabel')}</label>
                <select
                  value={classeId}
                  onChange={(e) => handleClasseChange(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
                >
                  <option value="">{t('inscriptionsDetail.noClassOption')}</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} — {c.niveau} — {c.jour} {c.heure}
                    </option>
                  ))}
                </select>
                {classe && (
                  <p className="text-xs text-gray-500 mt-1">{classe}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inscriptionsDetail.adminNotesLabel')}</label>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.detailedStatsTitle')}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.actionsTitle')}</h2>
            <div className="space-y-3">
              {inscription.status === 'pending_review' && (
                <>
                  <button
                    onClick={() => handleStatusChange('approved')}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-left"
                  >
                    {t('inscriptionsDetail.actionApprove')}
                  </button>
                  <button
                    onClick={() => handleStatusChange('payment_pending')}
                    className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-left"
                  >
                    {t('inscriptionsDetail.actionMarkPaymentPending')}
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-left"
                  >
                    {t('inscriptionsDetail.actionReject')}
                  </button>
                </>
              )}
              {inscription.status === 'approved' && (
                <button
                  onClick={() => handleStatusChange('payment_pending')}
                  className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-left"
                >
                  {t('inscriptionsDetail.actionPaymentPending')}
                </button>
              )}
              {inscription.status === 'payment_pending' && (
                <button
                  onClick={() => handleStatusChange('approved')}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-left"
                >
                  {t('inscriptionsDetail.actionPaymentConfirmed')}
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-left"
              >
                {t('inscriptionsDetail.actionPrint')}
              </button>
              <button
                onClick={() => router.push(`/admin/inscriptions/${inscription.student_code}/email`)}
                className="w-full p-3 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium text-left"
              >
                  {t('inscriptionsDetail.actionSendEmail')}
              </button>
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.historyTitle')}</h2>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inscriptionsDetail.responsesSummaryTitle')}</h2>
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