// src/app/admin/rapports/paiements/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'

export default function RapportPaiementsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [paiements, setPaiements] = useState<any[]>([])
  const [anneeScolaire, setAnneeScolaire] = useState('')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [paiementsRes, config] = await Promise.all([
        supabase.from('paiements').select('*, inscriptions(nom, prenom, student_code)').order('created_at', { ascending: false }),
        getConfig()
      ])

      if (paiementsRes.error) throw paiementsRes.error

      setPaiements(paiementsRes.data || [])
      setAnneeScolaire(config.annee_scolaire_courante || '')
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const paiementsRows = () => paiements.map((p) => ({
    [t('reports.colCandidateName')]: `${p.inscriptions?.prenom || ''} ${p.inscriptions?.nom || ''}`.trim(),
    [t('reports.colStudentCode')]: p.inscriptions?.student_code || '',
    [t('reports.colAmount')]: p.montant,
    [t('reports.colDate')]: p.date_paiement
      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
      : new Date(p.created_at).toLocaleDateString('fr-FR'),
    [t('reports.colMode')]: p.mode || ''
  }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          nav { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <Link href="/admin/rapports" className="text-sm text-[#689e4e] hover:text-[#527d3e]">
          {t('reports.backToReports')}
        </Link>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
            {t('reports.paymentsTitle')}
          </h1>
          {anneeScolaire && (
            <p className="text-sm text-gray-600 mt-1">
              {t('reports.schoolYearLabel').replace('{annee}', anneeScolaire)}
            </p>
          )}
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => downloadCSV('paiements', paiementsRows())}
            className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e]"
          >
            {t('reports.downloadCsvButton')}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            {t('reports.printButton')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colCandidateName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colStudentCode')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colAmount')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colDate')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colMode')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{p.inscriptions?.prenom} {p.inscriptions?.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{p.inscriptions?.student_code || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.montant}€</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {p.date_paiement
                      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
                      : new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">{p.mode || '—'}</td>
                </tr>
              ))}
              {paiements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-700">{t('reports.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
