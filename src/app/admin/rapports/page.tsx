// src/app/admin/rapports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import SectionDivider from '@/components/SectionDivider'

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUTS = ['pending_review', 'approved', 'rejected', 'payment_pending']

// Construit une chaîne CSV à partir d'un tableau d'objets (en-têtes = clés des objets)
function toCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return ''

  const headers = Object.keys(rows[0])

  const escape = (value: any): string => {
    const str = value === null || value === undefined ? '' : String(value)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ]

  return lines.join('\n')
}

function downloadCSV(filenamePrefix: string, rows: Record<string, any>[]) {
  const csv = toCSV(rows)
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filenamePrefix}_${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function RapportsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [printSection, setPrintSection] = useState<'inscriptions' | 'classes' | 'paiements' | null>(null)

  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [statutFiltre, setStatutFiltre] = useState('all')
  const [niveauFiltre, setNiveauFiltre] = useState('all')

  const [classes, setClasses] = useState<any[]>([])
  const [inscritsParClasse, setInscritsParClasse] = useState<Record<string, number>>({})

  const [paiements, setPaiements] = useState<any[]>([])

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [inscriptionsRes, classesRes, comptagesRes, paiementsRes] = await Promise.all([
        supabase.from('inscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('classes').select('*, comptes_visio(nom)').order('nom'),
        supabase.from('inscriptions').select('classe_id'),
        supabase.from('paiements').select('*, inscriptions(nom, prenom, student_code)').order('created_at', { ascending: false })
      ])

      if (inscriptionsRes.error) throw inscriptionsRes.error
      if (classesRes.error) throw classesRes.error
      if (comptagesRes.error) throw comptagesRes.error
      if (paiementsRes.error) throw paiementsRes.error

      setInscriptions(inscriptionsRes.data || [])
      setClasses(classesRes.data || [])
      setPaiements(paiementsRes.data || [])

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

  const handlePrint = (section: 'inscriptions' | 'classes' | 'paiements') => {
    setPrintSection(section)
    setTimeout(() => {
      window.print()
      setPrintSection(null)
    }, 50)
  }

  const inscriptionsFiltrees = inscriptions.filter((i) => {
    const matchStatut = statutFiltre === 'all' || i.status === statutFiltre
    const matchNiveau = niveauFiltre === 'all' || i.niveau_suggere === niveauFiltre || i.niveau_definitif === niveauFiltre
    return matchStatut && matchNiveau
  })

  const statutPaiementLabel = (statut: string | null) => {
    if (statut === 'paye') return t('reports.paymentStatusPaid')
    return t('reports.paymentStatusPending')
  }

  const inscriptionsRows = () => inscriptionsFiltrees.map((i) => ({
    [t('reports.colStudentCode')]: i.student_code,
    [t('reports.colName')]: i.nom,
    [t('reports.colFirstName')]: i.prenom,
    [t('reports.colEmail')]: i.email_contact,
    [t('reports.colPhone')]: i.telephone,
    [t('reports.colCountry')]: i.pays_residence,
    [t('reports.colSuggestedLevel')]: i.niveau_suggere,
    [t('reports.colFinalLevel')]: i.niveau_definitif || '',
    [t('reports.colStatus')]: getStatutLabel(i.status),
    [t('reports.colAssignedClass')]: i.classe_attribuee || '',
    [t('reports.colPaymentStatus')]: statutPaiementLabel(i.statut_paiement),
    [t('reports.colRegistrationDate')]: new Date(i.created_at).toLocaleDateString('fr-FR')
  }))

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
    <div className="space-y-8">
      <style>{`
        @media print {
          nav { display: none !important; }
          .no-print { display: none !important; }
          .print-section { display: none !important; }
          .print-section.active-print { display: block !important; }
        }
      `}</style>

      <h1 className="text-2xl font-bold text-gray-900 no-print flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('reports.title')}
      </h1>

      {/* Inscriptions */}
      <div className={`print-section ${printSection === 'inscriptions' ? 'active-print' : ''} bg-white rounded-lg shadow border border-gray-200 p-6`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
            {t('reports.inscriptionsTitle')}
          </h2>
          <div className="flex gap-2 no-print">
            <button
              onClick={() => downloadCSV('inscriptions', inscriptionsRows())}
              className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e]"
            >
              {t('reports.downloadCsvButton')}
            </button>
            <button
              onClick={() => handlePrint('inscriptions')}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              {t('reports.printButton')}
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-4 no-print">
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
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colStudentCode')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colFirstName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colEmail')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colPhone')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colCountry')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colSuggestedLevel')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colFinalLevel')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colStatus')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colAssignedClass')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colPaymentStatus')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm">{t('reports.colRegistrationDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inscriptionsFiltrees.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{i.student_code}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{i.prenom}</td>
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
                  <td colSpan={12} className="px-3 py-6 text-center text-gray-700">{t('reports.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SectionDivider />

      {/* Classes */}
      <div className={`print-section ${printSection === 'classes' ? 'active-print' : ''} bg-white rounded-lg shadow border border-gray-200 p-6`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
            {t('reports.classesTitle')}
          </h2>
          <div className="flex gap-2 no-print">
            <button
              onClick={() => downloadCSV('classes', classesRows())}
              className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e]"
            >
              {t('reports.downloadCsvButton')}
            </button>
            <button
              onClick={() => handlePrint('classes')}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              {t('reports.printButton')}
            </button>
          </div>
        </div>

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

      <SectionDivider />

      {/* Paiements */}
      <div className={`print-section ${printSection === 'paiements' ? 'active-print' : ''} bg-white rounded-lg shadow border border-gray-200 p-6`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
            {t('reports.paymentsTitle')}
          </h2>
          <div className="flex gap-2 no-print">
            <button
              onClick={() => downloadCSV('paiements', paiementsRows())}
              className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e]"
            >
              {t('reports.downloadCsvButton')}
            </button>
            <button
              onClick={() => handlePrint('paiements')}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              {t('reports.printButton')}
            </button>
          </div>
        </div>

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
