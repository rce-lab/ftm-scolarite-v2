// src/app/admin/rapports/inscriptions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'
import { genererRapportPdf } from '@/lib/pdf/rapportPdf'
import RequireAccess from '@/components/RequireAccess'

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUTS = ['pending_review', 'approved', 'rejected']

function RapportInscriptionsContent() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [anneeScolaire, setAnneeScolaire] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('all')
  const [niveauFiltre, setNiveauFiltre] = useState('all')
  const [typeFiltre, setTypeFiltre] = useState('all')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [inscriptionsRes, config] = await Promise.all([
        supabase.from('inscriptions').select('*').order('created_at', { ascending: false }),
        getConfig()
      ])

      if (inscriptionsRes.error) throw inscriptionsRes.error

      setInscriptions(inscriptionsRes.data || [])
      setAnneeScolaire(config.annee_scolaire_courante || '')
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const statutPaiementLabel = (statut: string | null) => {
    if (statut === 'paye') return t('reports.paymentStatusPaid')
    return t('reports.paymentStatusPending')
  }

  const typeLabel = (estReinscription: boolean) =>
    estReinscription ? t('reports.typeReinscription') : t('reports.typeNew')

  const inscriptionsFiltrees = inscriptions.filter((i) => {
    const matchStatut = statutFiltre === 'all' || i.status === statutFiltre
    const matchNiveau = niveauFiltre === 'all' || i.niveau_suggere === niveauFiltre || i.niveau_definitif === niveauFiltre
    const matchType =
      typeFiltre === 'all' ||
      (typeFiltre === 'reinscription' && i.is_reinscription) ||
      (typeFiltre === 'nouvelle' && !i.is_reinscription)
    return matchStatut && matchNiveau && matchType
  })

  // Colonnes communes au tableau à l'écran, au CSV et au PDF — gardées ici en un
  // seul endroit pour que les trois sorties restent synchronisées.
  const colonnes = [
    t('reports.colStudentCode'), t('reports.colName'), t('reports.colFirstName'),
    t('reports.colType'), t('reports.colEmail'), t('reports.colPhone'), t('reports.colCountry'),
    t('reports.colSuggestedLevel'), t('reports.colFinalLevel'), t('reports.colStatus'),
    t('reports.colAssignedClass'), t('reports.colPaymentStatus'), t('reports.colRegistrationDate')
  ]

  const ligneDe = (i: any): (string | number)[] => [
    i.student_code, i.nom, i.prenom, typeLabel(i.is_reinscription), i.email_contact, i.telephone,
    i.pays_residence, i.niveau_suggere, i.niveau_definitif || '', getStatutLabel(i.status),
    i.classe_attribuee || '', statutPaiementLabel(i.statut_paiement),
    new Date(i.created_at).toLocaleDateString('fr-FR')
  ]

  const inscriptionsRows = () =>
    inscriptionsFiltrees.map((i) => Object.fromEntries(colonnes.map((c, idx) => [c, ligneDe(i)[idx]])))

  const telechargerPdf = () => {
    genererRapportPdf({
      titre: t('reports.inscriptionsTitle'),
      sousTitre: anneeScolaire ? t('reports.schoolYearLabel').replace('{annee}', anneeScolaire) : undefined,
      colonnes,
      lignes: inscriptionsFiltrees.map(ligneDe),
      nomFichier: `rapport_inscriptions_${new Date().toISOString().slice(0, 10)}.pdf`
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
            {t('reports.inscriptionsTitle')}
          </h1>
          {anneeScolaire && (
            <p className="text-sm text-gray-600 mt-1">
              {t('reports.schoolYearLabel').replace('{annee}', anneeScolaire)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV('inscriptions', inscriptionsRows())}
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
            value={typeFiltre}
            onChange={(e) => setTypeFiltre(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('reports.filterAllTypes')}</option>
            <option value="nouvelle">{t('reports.filterNewOnly')}</option>
            <option value="reinscription">{t('reports.filterReinscriptionOnly')}</option>
          </select>
          <select
            value={statutFiltre}
            onChange={(e) => setStatutFiltre(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('reports.filterAllStatuses')}</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>{getStatutLabel(s)}</option>
            ))}
          </select>
          <select
            value={niveauFiltre}
            onChange={(e) => setNiveauFiltre(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('reports.filterAllLevels')}</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>{n}</option>
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
              {inscriptionsFiltrees.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{i.student_code}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.prenom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {i.is_reinscription ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 font-semibold">
                        {typeLabel(true)}
                      </span>
                    ) : (
                      <span className="text-gray-600">{typeLabel(false)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.email_contact}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.telephone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.pays_residence}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.niveau_suggere}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.niveau_definitif || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{getStatutLabel(i.status)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.classe_attribuee || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{statutPaiementLabel(i.statut_paiement)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(i.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {inscriptionsFiltrees.length === 0 && (
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
export default function RapportInscriptionsPage() {
  return (
    <RequireAccess ecran="reports">
      {() => <RapportInscriptionsContent />}
    </RequireAccess>
  )
}
