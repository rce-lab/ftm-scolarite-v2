// src/app/admin/historique/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const ROWS_PER_PAGE = 30

interface ArchiveRow {
  id: string
  annee_scolaire: string
  nom: string
  prenom: string
  age: number | null
  pays_residence: string | null
  email: string | null
  niveau_calcule: string | null
  statut_migration: string
  eleve_id: string | null
  identite_a_verifier: boolean
  code_inscription: string | null
}

export default function HistoriquePage() {
  const { t } = useTranslation()

  const [rows, setRows] = useState<ArchiveRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingKey, setProcessingKey] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [onlyToVerify, setOnlyToVerify] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('inscriptions_archive')
        .select('id, annee_scolaire, nom, prenom, age, pays_residence, email, niveau_calcule, statut_migration, eleve_id, identite_a_verifier, code_inscription')

      if (error) throw error
      setRows(data || [])
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  // Table eleve_id -> ensemble des années scolaires distinctes où il apparaît
  const eleveIdAnnees = useMemo(() => {
    const map = new Map<string, Set<string>>()
    rows.forEach((r) => {
      if (!r.eleve_id) return
      if (!map.has(r.eleve_id)) map.set(r.eleve_id, new Set())
      map.get(r.eleve_id)!.add(r.annee_scolaire)
    })
    return map
  }, [rows])

  const uniqueStudentsCount = eleveIdAnnees.size
  const reenrolledCount = useMemo(
    () => Array.from(eleveIdAnnees.values()).filter((annees) => annees.size > 1).length,
    [eleveIdAnnees]
  )
  const reenrolledPercent = uniqueStudentsCount > 0 ? ((reenrolledCount / uniqueStudentsCount) * 100).toFixed(1) : '0'

  const isReinscrit = (row: ArchiveRow) => {
    if (!row.eleve_id) return false
    return (eleveIdAnnees.get(row.eleve_id)?.size || 0) > 1
  }

  const years = useMemo(
    () => Array.from(new Set(rows.map((r) => r.annee_scolaire))).sort(),
    [rows]
  )

  const byYearStats = useMemo(() => {
    let previousCount: number | null = null
    return years.map((year) => {
      const count = rows.filter((r) => r.annee_scolaire === year).length
      const growth = previousCount !== null && previousCount > 0
        ? (((count - previousCount) / previousCount) * 100).toFixed(1)
        : null
      previousCount = count
      return { year, count, growth }
    })
  }, [years, rows])

  const byMigrationStatus = useMemo(() => {
    return years.map((year) => {
      const yearRows = rows.filter((r) => r.annee_scolaire === year)
      return {
        year,
        keep: yearRows.filter((r) => r.statut_migration === 'keep').length,
        archive_abandon: yearRows.filter((r) => r.statut_migration === 'archive_abandon').length,
        archive_doublon: yearRows.filter((r) => r.statut_migration === 'archive_doublon').length
      }
    })
  }, [years, rows])

  const byLevel = useMemo(() => {
    const known = NIVEAUX.map((n) => ({ niveau: n, count: rows.filter((r) => r.niveau_calcule === n).length }))
    const autreCount = rows.filter((r) => !r.niveau_calcule || !NIVEAUX.includes(r.niveau_calcule)).length
    return autreCount > 0 ? [...known, { niveau: 'N/A', count: autreCount }] : known
  }, [rows])

  const byCountry = useMemo(() => {
    const counts = new Map<string, number>()
    rows.forEach((r) => {
      const pays = r.pays_residence || 'N/A'
      counts.set(pays, (counts.get(pays) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([pays, count]) => ({ pays, count }))
      .sort((a, b) => b.count - a.count)
  }, [rows])

  const statutMigrationLabel = (statut: string) => {
    if (statut === 'keep') return t('historique.statusKeep')
    if (statut === 'archive_abandon') return t('historique.statusAbandon')
    if (statut === 'archive_doublon') return t('historique.statusDoublon')
    return statut
  }

  const filteredRows = useMemo(() => {
    const searchLower = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchSearch = searchLower === '' ||
        r.nom?.toLowerCase().includes(searchLower) ||
        r.prenom?.toLowerCase().includes(searchLower)
      const matchYear = yearFilter === 'all' || r.annee_scolaire === yearFilter
      const matchToVerify = !onlyToVerify || r.identite_a_verifier
      return matchSearch && matchYear && matchToVerify
    })
  }, [rows, search, yearFilter, onlyToVerify])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = filteredRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const updateYearFilter = (value: string) => {
    setYearFilter(value)
    setPage(1)
  }
  const updateOnlyToVerify = (value: boolean) => {
    setOnlyToVerify(value)
    setPage(1)
  }

  const toVerifyGroups = useMemo(() => {
    const groups = new Map<string, ArchiveRow[]>()
    rows.filter((r) => r.identite_a_verifier).forEach((r) => {
      const key = r.eleve_id || r.id
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(r)
    })
    return Array.from(groups.entries())
  }, [rows])

  const handleConfirmSame = async (eleveId: string, groupRows: ArchiveRow[]) => {
    if (!confirm(t('historique.confirmSameConfirm').replace('{count}', String(groupRows.length)))) return
    setProcessingKey(eleveId)
    const { error } = await supabase
      .from('inscriptions_archive')
      .update({ identite_a_verifier: false })
      .in('id', groupRows.map((r) => r.id))

    if (error) {
      alert(t('historique.actionError').replace('{message}', error.message))
      setProcessingKey(null)
      return
    }

    await loadData()
    setProcessingKey(null)
  }

  const handleSeparate = async (row: ArchiveRow) => {
    if (!confirm(t('historique.separateConfirm'))) return
    setProcessingKey(row.id)
    const newEleveId = `ELV-SEP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const { error } = await supabase
      .from('inscriptions_archive')
      .update({ eleve_id: newEleveId, identite_a_verifier: false })
      .eq('id', row.id)

    if (error) {
      alert(t('historique.actionError').replace('{message}', error.message))
      setProcessingKey(null)
      return
    }

    await loadData()
    setProcessingKey(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        {t('historique.errorLoading')} ({error})
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('historique.title')}</h1>
        <p className="text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">{t('historique.introText')}</p>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">{t('historique.statsSectionTitle')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#689e4e]">{uniqueStudentsCount}</p>
            <p className="text-sm text-gray-600">{t('historique.uniqueStudentsLabel')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#689e4e]">{reenrolledCount}</p>
            <p className="text-sm text-gray-600">
              {t('historique.reenrolledLabel')} ({t('historique.reenrolledPercentSuffix').replace('{percent}', reenrolledPercent)})
            </p>
          </div>
        </div>

        {/* Par année scolaire */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">{t('historique.byYearTitle')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colYear')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCount')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colGrowth')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byYearStats.map((s) => (
                  <tr key={s.year}>
                    <td className="px-3 py-2 whitespace-nowrap font-medium">{s.year}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.count}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {s.growth === null ? t('historique.growthNA') : `${s.growth}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Par statut de migration, par année */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">{t('historique.byMigrationStatusTitle')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colYear')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.statusKeep')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.statusAbandon')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.statusDoublon')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byMigrationStatus.map((s) => (
                  <tr key={s.year}>
                    <td className="px-3 py-2 whitespace-nowrap font-medium">{s.year}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.keep}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.archive_abandon}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.archive_doublon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Par niveau */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">{t('historique.byLevelTitle')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colLevel')}</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {byLevel.map((l) => (
                    <tr key={l.niveau}>
                      <td className="px-3 py-2 whitespace-nowrap font-medium">{l.niveau}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{l.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Par pays de résidence (liste complète) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">{t('historique.byCountryTitle')}</h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCountry')}</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {byCountry.map((c) => (
                    <tr key={c.pays}>
                      <td className="px-3 py-2 whitespace-nowrap">{c.pays}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recherche et liste */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('historique.searchListTitle')}</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder={t('historique.searchPlaceholder')}
            className="p-2 border rounded text-sm flex-1 min-w-[200px]"
          />
          <select
            value={yearFilter}
            onChange={(e) => updateYearFilter(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('historique.filterAllYears')}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm px-2">
            <input
              type="checkbox"
              checked={onlyToVerify}
              onChange={(e) => updateOnlyToVerify(e.target.checked)}
            />
            {t('historique.filterToVerifyOnly')}
          </label>
        </div>

        <p className="text-sm text-gray-500 mb-2">{t('historique.resultsCount').replace('{count}', String(filteredRows.length))}</p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colYear')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colFirstName')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colAge')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCountry')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colLevel')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colMigrationStatus')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colCode')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colReenrolled')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRows.map((r) => (
                <tr key={r.id} className={r.identite_a_verifier ? 'bg-amber-50' : undefined}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.annee_scolaire}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.prenom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.age ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.pays_residence || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.niveau_calcule || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{statutMigrationLabel(r.statut_migration)}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{r.code_inscription || t('historique.codeEmpty')}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{isReinscrit(r) ? t('historique.reenrolledYes') : t('historique.reenrolledNo')}</td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-gray-500">{t('historique.noResults')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('historique.paginationPrevious')}
            </button>
            <span className="text-sm text-gray-600">
              {t('historique.paginationInfo').replace('{page}', String(currentPage)).replace('{total}', String(totalPages))}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('historique.paginationNext')}
            </button>
          </div>
        )}
      </div>

      {/* Résolution des identités ambiguës */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('historique.resolutionTitle')}</h2>
        <p className="text-sm text-gray-600 mb-4">{t('historique.resolutionIntro')}</p>

        {toVerifyGroups.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('historique.resolutionNoGroups')}</p>
        ) : (
          <div className="space-y-6">
            {toVerifyGroups.map(([eleveId, groupRows], index) => (
              <div key={eleveId} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-800">{t('historique.groupLabel').replace('{n}', String(index + 1))}</h3>
                  <button
                    onClick={() => handleConfirmSame(eleveId, groupRows)}
                    disabled={processingKey === eleveId}
                    className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e] disabled:opacity-50"
                  >
                    {t('historique.confirmSameButton')}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colName')}</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colFirstName')}</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colYear')}</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colAge')}</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs">{t('historique.colEmail')}</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase text-xs"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupRows.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 whitespace-nowrap">{r.nom}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.prenom}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.annee_scolaire}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.age ?? '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.email || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              onClick={() => handleSeparate(r)}
                              disabled={processingKey === r.id}
                              className="px-2 py-1 border border-[#b03c2d] text-[#b03c2d] rounded text-xs hover:bg-red-50 disabled:opacity-50"
                            >
                              {t('historique.separateButton')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
