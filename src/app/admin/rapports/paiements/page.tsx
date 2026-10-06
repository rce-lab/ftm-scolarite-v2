// src/app/admin/rapports/paiements/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'
import { genererRapportPdf } from '@/lib/pdf/rapportPdf'
import RequireAccess from '@/components/RequireAccess'

// Une "année scolaire" (ex. "2026-2027") n'est pas une colonne de `paiements` —
// elle se déduit de la date du paiement (date_paiement, ou created_at à défaut)
// tombant dans la plage 1er septembre -> 31 août de cette année scolaire. Ce
// découpage est une convention (rentrée en septembre) : à corriger ici si la
// réalité de FTM diffère.
function plageAnneeScolaire(annee: string): { debut: Date; fin: Date } | null {
  const match = annee.match(/^(\d{4})-(\d{4})$/)
  if (!match) return null
  const [, premiere, deuxieme] = match
  return {
    debut: new Date(`${premiere}-09-01T00:00:00`),
    fin: new Date(`${deuxieme}-08-31T23:59:59`)
  }
}

function dateEffective(p: any): Date {
  return new Date(p.date_paiement || p.created_at)
}

function RapportPaiementsContent() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [paiements, setPaiements] = useState<any[]>([])
  const [anneeScolaireCourante, setAnneeScolaireCourante] = useState('')
  const [anneesArchivees, setAnneesArchivees] = useState<string[]>([])
  const [anneeFiltre, setAnneeFiltre] = useState('all')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [paiementsRes, anneesRes, config] = await Promise.all([
        // inscription_id n'est plus une FK fiable après archivage (cf. migration
        // eleve_id du 2026-10-01) : la jointure vers inscriptions renvoie null pour
        // un paiement d'une année déjà archivée (la ligne a été vidée) — repli sur
        // eleve_id, qui lui survit à l'archivage, pour garder nom/matricule.
        supabase.from('paiements').select('*, inscriptions(nom, prenom, student_code), eleve(nom, prenom, matricule)').order('created_at', { ascending: false }),
        supabase.from('inscriptions_archive').select('annee_scolaire'),
        getConfig()
      ])

      if (paiementsRes.error) throw paiementsRes.error
      if (anneesRes.error) throw anneesRes.error

      setPaiements(paiementsRes.data || [])
      setAnneeScolaireCourante(config.annee_scolaire_courante || '')
      setAnneeFiltre(config.annee_scolaire_courante || 'all')

      const distinctes = Array.from(new Set((anneesRes.data || []).map((r: any) => r.annee_scolaire).filter(Boolean)))
      setAnneesArchivees(distinctes)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Liste déroulante : année en cours d'abord, puis les années archivées, les plus
  // récentes en premier (tri lexical valide sur le format "AAAA-AAAA").
  const anneesDisponibles = useMemo(() => {
    const toutes = new Set<string>(anneesArchivees)
    if (anneeScolaireCourante) toutes.add(anneeScolaireCourante)
    return Array.from(toutes).sort().reverse()
  }, [anneesArchivees, anneeScolaireCourante])

  const paiementsFiltres = useMemo(() => {
    if (anneeFiltre === 'all') return paiements
    const plage = plageAnneeScolaire(anneeFiltre)
    if (!plage) return paiements
    return paiements.filter((p) => {
      const d = dateEffective(p)
      return d >= plage.debut && d <= plage.fin
    })
  }, [paiements, anneeFiltre])

  const dateAffichee = (p: any) =>
    p.date_paiement
      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
      : new Date(p.created_at).toLocaleDateString('fr-FR')

  const colonnes = [
    t('reports.colCandidateName'), t('reports.colStudentCode'), t('reports.colAmount'),
    t('reports.colDate'), t('reports.colMode')
  ]

  // inscriptions en priorité (le code étudiant de l'année en cours, plus précis),
  // repli sur eleve (matricule permanent) une fois l'inscription archivée/vidée.
  const nomCandidat = (p: any) =>
    `${p.inscriptions?.prenom || p.eleve?.prenom || ''} ${p.inscriptions?.nom || p.eleve?.nom || ''}`.trim()
  const codeCandidat = (p: any) => p.inscriptions?.student_code || p.eleve?.matricule || ''

  const ligneDe = (p: any): (string | number)[] => [
    nomCandidat(p),
    codeCandidat(p),
    `${p.montant}€`,
    dateAffichee(p),
    p.mode || ''
  ]

  const paiementsRows = () =>
    paiementsFiltres.map((p) => Object.fromEntries(colonnes.map((c, idx) => [c, ligneDe(p)[idx]])))

  const sousTitre = anneeFiltre === 'all'
    ? t('reports.filterAllYears')
    : t('reports.schoolYearLabel').replace('{annee}', anneeFiltre)

  const telechargerPdf = () => {
    genererRapportPdf({
      titre: t('reports.paymentsTitle'),
      sousTitre,
      colonnes,
      lignes: paiementsFiltres.map(ligneDe),
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
          <p className="text-sm text-gray-600 mt-1">{sousTitre}</p>
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
        <div className="flex gap-3 mb-4 flex-wrap">
          <select
            value={anneeFiltre}
            onChange={(e) => setAnneeFiltre(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('reports.filterAllYears')}</option>
            {anneesDisponibles.map((annee) => (
              <option key={annee} value={annee}>{annee}</option>
            ))}
          </select>
        </div>

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
              {paiementsFiltres.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{nomCandidat(p) || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{codeCandidat(p) || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.montant}€</td>
                  <td className="px-3 py-2 whitespace-nowrap">{dateAffichee(p)}</td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">{p.mode || '—'}</td>
                </tr>
              ))}
              {paiementsFiltres.length === 0 && (
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
export default function RapportPaiementsPage() {
  return (
    <RequireAccess ecran="reports">
      {() => <RapportPaiementsContent />}
    </RequireAccess>
  )
}
