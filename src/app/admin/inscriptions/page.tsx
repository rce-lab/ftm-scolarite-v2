// app/admin/inscriptions/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel, getStatutPaiementLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SectionDivider from '@/components/SectionDivider'

function InscriptionsListContent() {
  const { t } = useTranslation()
  const params = useSearchParams()
  const filter = params.get('filter') || 'all'
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInscriptions()
  }, [filter])

  const loadInscriptions = async () => {
    try {
      let query = supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'payment_pending') {
        query = query.eq('status', 'approved').neq('statut_paiement', 'paye')
      } else if (filter !== 'all') {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
          {t('inscriptionsList.title')}
        </h1>
        <Link
          href="/public/inscription"
          className="bg-[#689e4e] text-white px-4 py-2 rounded hover:bg-[#527d3e]"
        >
          {t('inscriptionsList.newInscriptionButton')}
        </Link>
      </div>

      <SectionDivider />

      {/* Filtres */}
      <div className="flex space-x-2">
        {[
          { value: 'all', label: t('inscriptionsList.filterAll'), count: inscriptions.length },
          { value: 'pending_review', label: t('inscriptionsList.filterPending'), count: inscriptions.filter(i => i.status === 'pending_review').length },
          { value: 'approved', label: t('inscriptionsList.filterApproved'), count: inscriptions.filter(i => i.status === 'approved').length },
          { value: 'payment_pending', label: t('inscriptionsList.filterPaymentPending'), count: inscriptions.filter(i => i.status === 'approved' && i.statut_paiement !== 'paye').length },
          { value: 'rejected', label: t('inscriptionsList.filterRejected'), count: inscriptions.filter(i => i.status === 'rejected').length }
        ].map((filtre) => (
          <Link
            key={filtre.value}
            href={`/admin/inscriptions?filter=${filtre.value}`}
            className={`px-4 py-2 rounded ${filter === filtre.value ? 'bg-[#689e4e] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {filtre.label} ({filtre.count})
          </Link>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableCode')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableName')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableEmail')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableLevel')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableDate')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableStatus')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('inscriptionsList.tableActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inscriptions.map((inscription) => (
              <tr key={inscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-base">{inscription.student_code}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {inscription.prenom} {inscription.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base">{inscription.email_contact}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded bg-[#689e4e]/15 text-[#527d3e]">
                    {inscription.niveau_suggere}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base">
                  {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    inscription.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                    inscription.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    inscription.status === 'approved' && inscription.statut_paiement !== 'paye' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {inscription.status === 'approved' && inscription.statut_paiement !== 'paye'
                      ? getStatutPaiementLabel(inscription.statut_paiement)
                      : getStatutLabel(inscription.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/inscriptions/${inscription.student_code}`}
                    className="text-[#689e4e] hover:text-[#527d3e] text-sm"
                  >
                    {t('inscriptionsList.viewLink')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function InscriptionsListPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    }>
      <InscriptionsListContent />
    </Suspense>
  )
}