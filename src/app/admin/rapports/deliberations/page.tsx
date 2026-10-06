// src/app/admin/rapports/deliberations/page.tsx
// Rapport « Délibérations du jour » : après un conseil des enseignants, liste les
// nouveaux inscrits et réinscrits dont le dossier a été mis à jour (updated_at) à la
// date de séance choisie, avec niveau et classe attribuée — remplace la requête SQL
// manuelle (DOCS TECH/rapport_deliberation_v3.sql). Lecture seule.
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { downloadCSV } from '@/lib/csv'
import { genererRapportSectionsPdf, SectionRapportPdf } from '@/lib/pdf/rapportPdf'

interface LigneDeliberation {
  id: string
  matricule: string
  nom: string
  prenom: string
  age: number | null
  niveauSuggere: string
  niveauRetenu: string
  classe: string
  niveauClasse: string
  enseignants: string
  // Clés du tri par défaut (enseignant titulaire → code classe)
  titulaire: string
  codeClasse: string
  status: string
  isReinscription: boolean
}

type CleBloc = 'nouveaux' | 'reinscrits'
type SensTri = 'asc' | 'desc'

// Date du jour au format yyyy-mm-dd en heure locale du navigateur (toISOString
// donnerait la date UTC, décalée le soir à Québec ou le matin à Madagascar).
const aujourdhuiLocal = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Noms saisis avec des espaces parasites (début/fin ou doublés)
const nettoyer = (valeur: string | null | undefined): string => (valeur || '').replace(/\s+/g, ' ').trim()

// Une classe peut porter un niveau composé (« A1/A2 ») : l'écart n'est signalé que si
// le niveau de l'élève n'en fait pas partie.
const niveauxDifferents = (niveauEleve: string, niveauClasse: string): boolean => {
  if (!niveauEleve || !niveauClasse) return false
  const niveauxClasse = niveauClasse.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean)
  return !niveauxClasse.includes(niveauEleve.toUpperCase().trim())
}

export default function RapportDeliberationsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [dateSeance, setDateSeance] = useState(aujourdhuiLocal())
  const [lignes, setLignes] = useState<LigneDeliberation[]>([])
  // Tri courant par bloc ; absent = tri par défaut
  const [tris, setTris] = useState<Partial<Record<CleBloc, { colonne: number; sens: SensTri }>>>({})
  const fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    if (dateSeance) chargerDonnees(dateSeance)
  }, [dateSeance])

  const chargerDonnees = async (date: string) => {
    setLoading(true)
    try {
      // Plage 00:00 → 23:59:59 en heure locale du navigateur, convertie en UTC
      const [annee, mois, jour] = date.split('-').map(Number)
      const debut = new Date(annee, mois - 1, jour)
      const fin = new Date(annee, mois - 1, jour + 1)

      const [inscriptionsRes, classesRes] = await Promise.all([
        supabase
          .from('inscriptions')
          .select('id, nom, prenom, age, status, niveau_suggere, niveau_definitif, is_reinscription, classe_id, eleve_id, updated_at')
          .gte('updated_at', debut.toISOString())
          .lt('updated_at', fin.toISOString()),
        supabase
          .from('classes')
          .select('id, code, nom, niveau, classe_enseignants(role, enseignants(nom, prenom))')
      ])

      if (inscriptionsRes.error) throw inscriptionsRes.error
      if (classesRes.error) throw classesRes.error

      const inscriptions = inscriptionsRes.data || []

      // Matricules : même jointure eleve_id -> eleve.id que admin/inscriptions/page.tsx
      const eleveIds = Array.from(new Set(inscriptions.map((i: any) => i.eleve_id).filter(Boolean)))
      const matricules: Record<string, string> = {}
      if (eleveIds.length > 0) {
        const { data, error } = await supabase.from('eleve').select('id, matricule').in('id', eleveIds)
        if (error) throw error
        ;(data || []).forEach((e: any) => { matricules[e.id] = e.matricule })
      }

      const classesParId: Record<string, any> = {}
      ;(classesRes.data || []).forEach((c: any) => { classesParId[c.id] = c })

      setLignes(
        inscriptions.map((i: any): LigneDeliberation => {
          const classe = i.classe_id ? classesParId[i.classe_id] : null
          return {
            id: i.id,
            matricule: (i.eleve_id && matricules[i.eleve_id]) || '',
            nom: nettoyer(i.nom),
            prenom: nettoyer(i.prenom),
            age: i.age ?? null,
            niveauSuggere: i.niveau_suggere || '',
            niveauRetenu: i.niveau_definitif || '',
            classe: classe ? [classe.code, classe.nom].filter(Boolean).join(' — ') : '',
            niveauClasse: classe?.niveau || '',
            enseignants: classe ? nomsEnseignants(classe) : '',
            titulaire: classe ? nomTitulaire(classe) : '',
            codeClasse: classe?.code || '',
            status: i.status || '',
            isReinscription: !!i.is_reinscription
          }
        })
      )
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Titulaire(s) d'abord — même convention que rapports/classes/page.tsx
  const nomsEnseignants = (classe: any): string => {
    const liens = (classe.classe_enseignants || []).filter((ce: any) => ce.enseignants)
    return [...liens]
      .sort((a: any, b: any) => (a.role === 'titulaire' ? 0 : 1) - (b.role === 'titulaire' ? 0 : 1))
      .map((ce: any) => `${ce.enseignants.prenom || ''} ${ce.enseignants.nom || ''}`.trim())
      .filter(Boolean)
      .join(', ')
  }

  // Titulaire seul (clé du tri par défaut) ; à défaut, le premier enseignant lié
  const nomTitulaire = (classe: any): string => {
    const liens = (classe.classe_enseignants || []).filter((ce: any) => ce.enseignants)
    const lien = liens.find((ce: any) => ce.role === 'titulaire') || liens[0]
    return lien ? `${lien.enseignants.prenom || ''} ${lien.enseignants.nom || ''}`.trim() : ''
  }

  const enAttente = (l: LigneDeliberation) => l.status === 'pending_review'
  const niveauEleve = (l: LigneDeliberation) => l.niveauRetenu || l.niveauSuggere
  // Écart niveau élève / niveau de la classe : signalé discrètement (cellule Niveau
  // retenu en ambre + ⚠), plus listé dans « Points à confirmer » ni en remarque
  const ecartNiveauClasse = (l: LigneDeliberation) => !!l.classe && niveauxDifferents(niveauEleve(l), l.niveauClasse)

  const libelleStatut = (status: string): string => {
    switch (status) {
      case 'approved': return t('reports.statusApproved')
      case 'rejected': return t('reports.statusRejected')
      case 'pending_review': return t('reports.statusPending')
      case 'payment_pending': return t('reports.statusPaymentPending')
      default: return status
    }
  }

  const remarque = (l: LigneDeliberation): string => (enAttente(l) ? t('reports.remarkPendingDecision') : '')

  const parNom = (a: LigneDeliberation, b: LigneDeliberation) =>
    a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }) || a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' })

  const synthese = [
    { libelle: t('reports.summaryExamined'), valeur: lignes.length },
    { libelle: t('reports.summaryProcessed'), valeur: lignes.filter((l) => !enAttente(l)).length },
    { libelle: t('reports.summaryPending'), valeur: lignes.filter(enAttente).length },
    { libelle: t('reports.summaryNew'), valeur: lignes.filter((l) => !l.isReinscription).length },
    { libelle: t('reports.summaryReinscription'), valeur: lignes.filter((l) => l.isReinscription).length }
  ]

  const colonnes = [
    t('reports.colMatricule'), t('reports.colName'), t('reports.colFirstName'), t('reports.colAge'),
    t('reports.colSuggestedLevel'), t('reports.colRetainedLevel'), t('reports.colAssignedClass'),
    t('reports.colTeachers'), t('reports.colStatus'), t('reports.colRemark')
  ]
  const INDEX_NIVEAU_RETENU = 5

  const ligneDe = (l: LigneDeliberation): (string | number)[] => [
    l.matricule, l.nom, l.prenom, l.age ?? '', l.niveauSuggere, l.niveauRetenu,
    l.classe, l.enseignants, libelleStatut(l.status), remarque(l)
  ]

  // Insensible à la casse et aux accents ; numeric : tri naturel des codes (C02 avant C10)
  const comparer = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base', numeric: true })

  // Tri par défaut : enseignant titulaire → code classe → nom → prénom de l'élève ; dossiers sans
  // classe attribuée (en attente) en dernier
  const triParDefaut = (a: LigneDeliberation, b: LigneDeliberation) =>
    (a.classe ? 0 : 1) - (b.classe ? 0 : 1) ||
    comparer(a.titulaire, b.titulaire) ||
    comparer(a.codeClasse, b.codeClasse) ||
    comparer(a.nom, b.nom) ||
    comparer(a.prenom, b.prenom)

  // Tri par colonne (valeurs telles qu'affichées) ; cellules vides toujours en dernier,
  // départage par le tri par défaut pour un ordre stable
  const triParColonne = (colonne: number, sens: SensTri) => (a: LigneDeliberation, b: LigneDeliberation) => {
    const va = ligneDe(a)[colonne]
    const vb = ligneDe(b)[colonne]
    const videA = va === '' || va === null
    const videB = vb === '' || vb === null
    if (videA || videB) return videA === videB ? triParDefaut(a, b) : videA ? 1 : -1
    const ordre = typeof va === 'number' && typeof vb === 'number' ? va - vb : comparer(String(va), String(vb))
    return (sens === 'asc' ? ordre : -ordre) || triParDefaut(a, b)
  }

  const lignesDuBloc = (cle: CleBloc, reinscription: boolean): LigneDeliberation[] => {
    const tri = tris[cle]
    return lignes
      .filter((l) => l.isReinscription === reinscription)
      .sort(tri ? triParColonne(tri.colonne, tri.sens) : triParDefaut)
  }

  // 1er clic = croissant, 2e = décroissant ; une autre colonne remplace le tri
  const cliquerEnTete = (cle: CleBloc, colonne: number) => {
    setTris((courants) => {
      const tri = courants[cle]
      const sens: SensTri = tri && tri.colonne === colonne && tri.sens === 'asc' ? 'desc' : 'asc'
      return { ...courants, [cle]: { colonne, sens } }
    })
  }

  // Ordre affiché à l'écran — repris tel quel par les exports CSV et PDF
  const blocs: { cle: CleBloc; titre: string; lignes: LigneDeliberation[] }[] = [
    { cle: 'nouveaux', titre: t('reports.blockNew'), lignes: lignesDuBloc('nouveaux', false) },
    { cle: 'reinscrits', titre: t('reports.blockReinscription'), lignes: lignesDuBloc('reinscrits', true) }
  ]

  // Points à confirmer : dossiers en attente uniquement
  const pointsAConfirmer = lignes.filter(enAttente).sort(parNom)
  const colonnesPoints = [
    t('reports.colBlock'), t('reports.colMatricule'), t('reports.colName'), t('reports.colFirstName'),
    t('reports.colAssignedClass'), t('reports.colTeachers'), t('reports.colRemark')
  ]
  const lignePointDe = (l: LigneDeliberation): string[] => [
    l.isReinscription ? t('reports.blockReinscription') : t('reports.blockNew'),
    l.matricule, l.nom, l.prenom, l.classe, l.enseignants, remarque(l)
  ]

  const libelleSeance = (): string => {
    const [annee, mois, jour] = dateSeance.split('-')
    return t('reports.sessionLabel').replace('{date}', `${jour}/${mois}/${annee}`)
  }

  const csvRows = () =>
    blocs.flatMap((bloc) =>
      bloc.lignes.map((l) => ({
        [t('reports.colBlock')]: bloc.titre,
        ...Object.fromEntries(colonnes.map((col, idx) => [col, ligneDe(l)[idx]]))
      }))
    )

  const telechargerPdf = () => {
    const sections: SectionRapportPdf[] = blocs.map((bloc) => ({
      titre: `${bloc.titre} (${bloc.lignes.length})`,
      lignes: bloc.lignes.map(ligneDe),
      lignesSurlignees: bloc.lignes.map((l, idx) => (enAttente(l) ? idx : -1)).filter((idx) => idx >= 0),
      cellulesSurlignees: bloc.lignes
        .map((l, idx): [number, number] | null => (ecartNiveauClasse(l) ? [idx, INDEX_NIVEAU_RETENU] : null))
        .filter((c): c is [number, number] => c !== null),
      messageVide: t('reports.noData')
    }))
    sections.push({
      titre: t('reports.toConfirmTitle'),
      colonnes: colonnesPoints,
      lignes: pointsAConfirmer.map(lignePointDe),
      lignesSurlignees: pointsAConfirmer.map((l, idx) => (enAttente(l) ? idx : -1)).filter((idx) => idx >= 0),
      nouvellePage: true,
      messageVide: t('reports.noneToConfirm')
    })

    genererRapportSectionsPdf({
      titre: t('reports.deliberationsTitle'),
      sousTitre: libelleSeance(),
      lignesInfo: [
        synthese.map((s) => `${s.libelle} : ${s.valeur}`).join('   |   '),
        `${t('reports.legendPending')}   |   ${t('reports.legendLevelChanged')}`
      ],
      colonnes,
      sections,
      nomFichier: `rapport_deliberations_${dateSeance}.pdf`
    })
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
            {t('reports.deliberationsTitle')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{libelleSeance()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV(`deliberations_${dateSeance}`, csvRows())}
            disabled={loading || lignes.length === 0}
            className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e] disabled:opacity-50"
          >
            {t('reports.downloadCsvButton')}
          </button>
          <button
            onClick={telechargerPdf}
            disabled={loading}
            className="px-3 py-1.5 border border-[#689e4e] text-[#527d3e] rounded text-sm hover:bg-[#689e4e]/10 disabled:opacity-50"
          >
            {t('reports.downloadPdfButton')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.filterSessionDate')}</label>
          <input
            type="date"
            value={dateSeance}
            onChange={(e) => setDateSeance(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5"
          />
        </div>
        <p className="text-sm text-gray-600">{t('reports.sessionDateHint').replace('{fuseau}', fuseau)}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {synthese.map((s) => (
              <div key={s.libelle} className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-[#689e4e]">{s.valeur}</div>
                <div className="text-sm text-gray-600">{s.libelle}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-blue-100 border border-blue-200 rounded"></span>{t('reports.legendPending')}</span>
            <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-amber-200 border border-amber-300 rounded"></span>{t('reports.legendLevelChanged')}</span>
          </div>

          {blocs.map((bloc) => (
            <div key={bloc.cle} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
                <h2 className="text-lg font-bold text-gray-900">{bloc.titre} ({bloc.lignes.length})</h2>
                <button
                  onClick={() => setTris((courants) => ({ ...courants, [bloc.cle]: undefined }))}
                  disabled={!tris[bloc.cle]}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  {t('reports.resetSortButton')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      {colonnes.map((c, idx) => {
                        const tri = tris[bloc.cle]
                        const actif = tri?.colonne === idx
                        return (
                          <th
                            key={c}
                            onClick={() => cliquerEnTete(bloc.cle, idx)}
                            title={t('reports.sortColumnHint')}
                            aria-sort={actif ? (tri.sens === 'asc' ? 'ascending' : 'descending') : 'none'}
                            className="px-3 py-2 text-left font-medium text-gray-700 uppercase text-sm cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
                          >
                            {c}
                            {actif && <span className="ml-1 text-[#689e4e]">{tri.sens === 'asc' ? '▲' : '▼'}</span>}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bloc.lignes.map((l) => (
                      <tr key={l.id} className={enAttente(l) ? 'bg-blue-100' : ''}>
                        <td className="px-3 py-2 whitespace-nowrap font-mono">{l.matricule || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-medium">{l.nom}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{l.prenom}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{l.age ?? '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{l.niveauSuggere || '—'}</td>
                        {ecartNiveauClasse(l) ? (
                          <td
                            className="px-3 py-2 whitespace-nowrap bg-amber-200 font-medium"
                            title={t('reports.remarkLevelGap').replace('{eleve}', niveauEleve(l)).replace('{classe}', l.niveauClasse)}
                          >
                            {l.niveauRetenu || '—'} <span className="text-amber-700">⚠</span>
                          </td>
                        ) : (
                          <td className="px-3 py-2 whitespace-nowrap">{l.niveauRetenu || '—'}</td>
                        )}
                        <td className="px-3 py-2 whitespace-nowrap">{l.classe || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{l.enseignants || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{libelleStatut(l.status)}</td>
                        <td className="px-3 py-2 text-sm">{remarque(l)}</td>
                      </tr>
                    ))}
                    {bloc.lignes.length === 0 && (
                      <tr>
                        <td colSpan={colonnes.length} className="px-3 py-6 text-center text-gray-700">{t('reports.noData')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('reports.toConfirmTitle')} ({pointsAConfirmer.length})</h2>
            {pointsAConfirmer.length === 0 ? (
              <p className="text-gray-700">{t('reports.noneToConfirm')}</p>
            ) : (
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {pointsAConfirmer.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium">{l.nom} {l.prenom}</span>
                    {l.classe && <> — {l.classe}</>} : {remarque(l)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
