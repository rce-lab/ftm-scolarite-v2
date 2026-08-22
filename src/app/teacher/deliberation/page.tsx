// app/teacher/deliberation/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SectionDivider from '@/components/SectionDivider'

function DeliberationContent() {
  const { t } = useTranslation()
  const params = useSearchParams()
  const router = useRouter()
  const filter = params.get('filter') || 'pending_review'
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInscription, setSelectedInscription] = useState<any>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    loadInscriptions()
  }, [filter])

  useEffect(() => {
    loadPhotoUrl()
  }, [selectedInscription?.id])

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
            {filtre.label} ({inscriptions.filter(i => filter === 'all' ? true : i.status === filtre.value).length})
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
                      <div className="font-medium">{inscription.prenom} {inscription.nom}</div>
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
                </div>

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

                <div className="pt-4 border-t">
                  <label className="block text-base font-medium mb-2">{t('deliberation.finalDecisionLabel')}</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(selectedInscription.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      {t('deliberation.approveButton')}
                    </button>
                    <button
                      onClick={() => updateStatus(selectedInscription.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                      {t('deliberation.rejectButton')}
                    </button>
                  </div>
                  <button
                    onClick={() => updateStatus(selectedInscription.id, 'pending_review')}
                    className="w-full mt-2 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
                  >
                    {t('deliberation.resetToPendingButton')}
                  </button>
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
                  {inscriptions.filter(i => i.status === 'pending_review').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('deliberation.statsApproved')}</span>
                <span className="font-bold text-green-600">
                  {inscriptions.filter(i => i.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('deliberation.statsRejected')}</span>
                <span className="font-bold text-red-600">
                  {inscriptions.filter(i => i.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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