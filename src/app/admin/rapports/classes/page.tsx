// src/app/admin/rapports/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'

export default function RapportClassesPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [inscritsParClasse, setInscritsParClasse] = useState<Record<string, number>>({})
  const [anneeScolaire, setAnneeScolaire] = useState('')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [classesRes, comptagesRes, config] = await Promise.all([
        supabase.from('classes').select('*, comptes_visio(nom)').order('nom'),
        supabase.from('inscriptions').select('classe_id'),
        getConfig()
      ])

      if (classesRes.error) throw classesRes.error
      if (comptagesRes.error) throw comptagesRes.error

      setClasses(classesRes.data || [])
      setAnneeScolaire(config.annee_scolaire_courante || '')

      const comptages: Record<string, number> = {}
      ;(comptagesRes.data || []).forEach((row: any) => {
        if (row.classe_id) {
          comptages[row.classe_id] = (comptages[row.classe_id] || 0) + 1
        }
      })
      setInscritsParClasse(comptages)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const classesRows = () => classes.map((c) => ({
    [t('reports.colName')]: c.nom,
    [t('reports.colLevel')]: c.niveau || '',
    [t('reports.colAgeRange')]: c.tranche_age || '',
    [t('reports.colDay')]: c.jour || '',
    [t('reports.colTime')]: c.heure || '',
    [t('reports.colMaxCapacity')]: c.capacite_max ?? '',
    [t('reports.colEnrolledCount')]: inscritsParClasse[c.id] || 0,
    [t('reports.colTeachers')]: c.enseignants && c.enseignants.length > 0 ? c.enseignants.join(', ') : '',
    [t('reports.colVideoAccount')]: c.comptes_visio?.nom || ''
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
            {t('reports.classesTitle')}
          </h1>
          {anneeScolaire && (
            <p className="text-sm text-gray-600 mt-1">
              {t('reports.schoolYearLabel').replace('{annee}', anneeScolaire)}
            </p>
          )}
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => downloadCSV('classes', classesRows())}
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
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colLevel')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colAgeRange')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colDay')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colTime')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colMaxCapacity')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colEnrolledCount')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colTeachers')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colVideoAccount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">{c.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.niveau || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.tranche_age || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.jour || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.heure || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.capacite_max ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{inscritsParClasse[c.id] || 0}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.enseignants && c.enseignants.length > 0 ? c.enseignants.join(', ') : '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.comptes_visio?.nom || '—'}</td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-gray-700">{t('reports.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
