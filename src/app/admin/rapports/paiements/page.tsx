// src/app/admin/rapports/paiements/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'
import { genererRapportPdf } from '@/lib/pdf/rapportPdf'

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

  const dateAffichee = (p: any) =>
    p.date_paiement
      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
      : new Date(p.created_at).toLocaleDateString('fr-FR')

  const colonnes = [
    t('reports.colCandidateName'), t('reports.colStudentCode'), t('reports.colAmount'),
    t('reports.colDate'), t('reports.colMode')
  ]

  const ligneDe = (p: any): (string | number)[] => [
    `${p.inscriptions?.prenom || ''} ${p.inscriptions?.nom || ''}`.trim(),
    p.inscriptions?.student_code || '',
    `${p.montant}€`,
    dateAffichee(p),
    p.mode || ''
  ]

  const paiementsRows = () =>
    paiements.map((p) => Object.fromEntries(colonnes.map((c, idx) => [c, ligneDe(p)[idx]])))

  const telechargerPdf = () => {
    genererRapportPdf({
      titre: t('reports.paymentsTitle'),
      sousTitre: anneeScolaire ? t('reports.schoolYearLabel').replace('{annee}', anneeScolaire) : undefined,
      colonnes,
      lignes: paiements.map(ligneDe),
      nomFichier: `rapport_paiements_${new Date().toISOString().slice(0, 10)}.pdf`
    })
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
      <div>
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
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV('paiements', paiementsRows())}
            className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e]"
          >
            {t('reports.downloadCsvButton')}
          </button>
          <button
            onClick={telechargerPdf}
            className="px-3 py-1.5 border border-[#689e4e] text-[#527d3e] rounded text-sm hover:bg-[#689e4e]/10"
          >
            {t('reports.downloadPdfButton')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-gray-50">
              <tr>
                {colonnes.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{p.inscriptions?.prenom} {p.inscriptions?.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{p.inscriptions?.student_code || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.montant}€</td>
                  <td className="px-3 py-2 whitespace-nowrap">{dateAffichee(p)}</td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">{p.mode || '—'}</td>
                </tr>
              ))}
              {paiements.length === 0 && (
                <tr>
                  <td colSpan={colonnes.length} className="px-3 py-6 text-center text-gray-700">{t('reports.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
