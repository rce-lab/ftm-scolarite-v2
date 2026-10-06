// src/app/admin/rapports/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'
import { genererRapportPdf } from '@/lib/pdf/rapportPdf'
import RequireAccess from '@/components/RequireAccess'

function RapportClassesContent() {
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
      // La jointure classe_enseignants(enseignants(...)) manquait dans la version
      // précédente (la colonne enseignants restait vide) — même pattern que
      // teacher/classes/page.tsx et teacher/deliberation/page.tsx.
      const [classesRes, comptagesRes, config] = await Promise.all([
        supabase
          .from('classes')
          .select('id, code, nom, niveau, tranche_age, jour, heure, capacite_max, comptes_visio(nom), classe_enseignants(role, enseignants(id, nom, prenom))')
          .order('code')
          .order('nom'),
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

  // Enseignants liés à une classe, titulaire(s) d'abord — même convention que le
  // sélecteur de classe de la délibération (teacher/deliberation/page.tsx). Une
  // classe sans enseignant lié (C04, C05, C06, C11 au 2026-09-30) reste listée avec
  // la colonne vide plutôt que masquée.
  const nomsEnseignants = (classe: any): string => {
    const liens = (classe.classe_enseignants || []).filter((ce: any) => ce.enseignants)
    return [...liens]
      .sort((a: any, b: any) => (a.role === 'titulaire' ? 0 : 1) - (b.role === 'titulaire' ? 0 : 1))
      .map((ce: any) => `${ce.enseignants.prenom || ''} ${ce.enseignants.nom || ''}`.trim())
      .filter(Boolean)
      .join(', ')
  }

  const colonnes = [
    t('reports.colClassCode'), t('reports.colName'), t('reports.colLevel'), t('reports.colAgeRange'),
    t('reports.colDay'), t('reports.colTime'), t('reports.colMaxCapacity'), t('reports.colEnrolledCount'),
    t('reports.colTeachers'), t('reports.colVideoAccount')
  ]

  const ligneDe = (c: any): (string | number)[] => [
    c.code || '', c.nom, c.niveau || '', c.tranche_age || '', c.jour || '', c.heure || '',
    c.capacite_max ?? '', inscritsParClasse[c.id] || 0, nomsEnseignants(c), c.comptes_visio?.nom || ''
  ]

  const classesRows = () =>
    classes.map((c) => Object.fromEntries(colonnes.map((col, idx) => [col, ligneDe(c)[idx]])))

  const telechargerPdf = () => {
    genererRapportPdf({
      titre: t('reports.classesTitle'),
      sousTitre: anneeScolaire ? t('reports.schoolYearLabel').replace('{annee}', anneeScolaire) : undefined,
      colonnes,
      lignes: classes.map(ligneDe),
      nomFichier: `rapport_classes_${new Date().toISOString().slice(0, 10)}.pdf`
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
            {t('reports.classesTitle')}
          </h1>
          {anneeScolaire && (
            <p className="text-sm text-gray-600 mt-1">
              {t('reports.schoolYearLabel').replace('{annee}', anneeScolaire)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV('classes', classesRows())}
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
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 whitespace-nowrap font-mono font-medium">{c.code || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.niveau || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.tranche_age || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.jour || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.heure || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.capacite_max ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{inscritsParClasse[c.id] || 0}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{nomsEnseignants(c) || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.comptes_visio?.nom || '—'}</td>
                </tr>
              ))}
              {classes.length === 0 && (
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

// Rapport en lecture seule par nature (export CSV/PDF) : toujours 'full' pour tout
// rôle qui y a accès (jamais 'view' dans ROLE_PERMISSIONS).
export default function RapportClassesPage() {
  return (
    <RequireAccess ecran="reports">
      {() => <RapportClassesContent />}
    </RequireAccess>
  )
}
