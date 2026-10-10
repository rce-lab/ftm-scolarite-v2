// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { envoyerRecuPaiementAction, telechargerRecuPaiementAction } from '@/app/actions/recuActions'
import { datePaiementIso, formaterDateFr } from '@/lib/datePaiement'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import SectionDivider from '@/components/SectionDivider'
import RequireAccess from '@/components/RequireAccess'

const MODES_PAIEMENT = [
  { value: 'virement', labelKey: 'payments.modeTransfer' },
  { value: 'especes', labelKey: 'payments.modeCash' },
  { value: 'autre', labelKey: 'payments.modeOther' }
] as const

// Rang dans la fratrie -> tarif (montant_inscription / montant_fratrie_2 / montant_fratrie_3_et_plus)
const RANGS_FRATRIE = [
  { value: '1', labelKey: 'payments.siblingRank1' },
  { value: '2', labelKey: 'payments.siblingRank2' },
  { value: '3', labelKey: 'payments.siblingRank3Plus' }
] as const
type RangFratrie = typeof RANGS_FRATRIE[number]['value']

// Date du jour yyyy-mm-dd en heure locale (toISOString donnerait la date UTC)
const aujourdhuiLocal = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Bandeau {
  type: 'erreur' | 'avertissement' | 'succes'
  texte: string
}

function PaymentsContent({ readOnly }: { readOnly: boolean }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'attente' | 'historique'>('attente')
  const [enAttente, setEnAttente] = useState<any[]>([])
  const [historique, setHistorique] = useState<any[]>([])
  const [tarifs, setTarifs] = useState<Record<RangFratrie, number>>({ '1': 30, '2': 25, '3': 20 })
  const [loading, setLoading] = useState(true)

  const [inscriptionSelectionnee, setInscriptionSelectionnee] = useState<any>(null)
  const [montant, setMontant] = useState('')
  const [mode, setMode] = useState('virement')
  const [rang, setRang] = useState<RangFratrie>('1')
  const [datePaiement, setDatePaiement] = useState(aujourdhuiLocal())
  const [erreurModale, setErreurModale] = useState('')
  const [traitement, setTraitement] = useState(false)

  const [bandeau, setBandeau] = useState<Bandeau | null>(null)
  // Paiements dont l'envoi du reçu a échoué pendant cette session
  const [echecsEnvoi, setEchecsEnvoi] = useState<Set<string>>(new Set())
  const [renvoiEnCours, setRenvoiEnCours] = useState<string | null>(null)
  const [telechargementEnCours, setTelechargementEnCours] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const config = await getConfig()
    setTarifs({
      '1': Number(config.montant_inscription) || 30,
      '2': Number(config.montant_fratrie_2) || 25,
      '3': Number(config.montant_fratrie_3_et_plus) || 20
    })
    await Promise.all([loadEnAttente(), loadHistorique()])
    setLoading(false)
  }

  const loadEnAttente = async () => {
    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .eq('status', 'approved')
        .neq('statut_paiement', 'paye')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEnAttente(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadHistorique = async () => {
    try {
      const { data, error } = await supabase
        .from('paiements')
        .select('*, inscriptions(nom, prenom, student_code, email_contact)')
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error
      setHistorique(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const ouvrirConfirmation = (inscription: any) => {
    setInscriptionSelectionnee(inscription)
    setRang('1')
    setMontant(tarifs['1'].toString())
    setMode('virement')
    setDatePaiement(aujourdhuiLocal())
    setErreurModale('')
  }

  const fermerConfirmation = () => {
    setInscriptionSelectionnee(null)
  }

  const changerRang = (valeur: RangFratrie) => {
    setRang(valeur)
    setMontant(tarifs[valeur].toString())
  }

  // Jeton d'accès de l'utilisateur connecté, transmis aux actions serveur du reçu :
  // elles relisent paiement et inscription en base avec ce jeton (RLS + contrôle du rôle)
  const jetonAcces = async (): Promise<string> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }

  const envoyerRecu = async (paiementId: string): Promise<boolean> => {
    let succes = false
    try {
      const resultat = await envoyerRecuPaiementAction(paiementId, await jetonAcces())
      succes = resultat.success
      if (!resultat.success) console.error('Erreur envoi reçu:', resultat.error)
    } catch (err) {
      console.error('Erreur envoi reçu:', err)
    }
    setEchecsEnvoi((courants) => {
      const suivants = new Set(courants)
      if (succes) suivants.delete(paiementId)
      else suivants.add(paiementId)
      return suivants
    })
    return succes
  }

  const telechargerRecu = async (paiement: any) => {
    if (telechargementEnCours) return
    setTelechargementEnCours(paiement.id)
    try {
      const resultat = await telechargerRecuPaiementAction(paiement.id, await jetonAcces())
      if (!resultat.success) throw new Error(resultat.error)
      const octets = Uint8Array.from(atob(resultat.pdfBase64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([octets], { type: 'application/pdf' }))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = resultat.nomFichier
      document.body.appendChild(lien)
      lien.click()
      document.body.removeChild(lien)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Erreur téléchargement reçu:', err)
      setBandeau({ type: 'erreur', texte: t('payments.downloadReceiptFailed').replace('{message}', err?.message || 'Inconnue') })
    } finally {
      setTelechargementEnCours(null)
    }
  }

  // Messages d'erreur de marquer_inscription_payee rendus lisibles ; le message
  // brut de la fonction reste affiché entre parenthèses
  const messageErreurRpc = (message: string): { texte: string; dejaPaye: boolean } => {
    if (/d[ée]j[àa].{0,20}pay/i.test(message)) return { texte: t('payments.errorAlreadyPaid'), dejaPaye: true }
    if (/futur/i.test(message)) return { texte: t('payments.errorFutureDate'), dejaPaye: false }
    if (/montant/i.test(message)) return { texte: t('payments.errorInvalidAmount'), dejaPaye: false }
    return { texte: t('payments.saveErrorAlert').replace('{message}', message), dejaPaye: false }
  }

  const confirmerPaiement = async () => {
    if (!inscriptionSelectionnee || traitement) return

    const montantNum = parseFloat(montant)
    if (!datePaiement) return setErreurModale(t('payments.errorDateRequired'))
    if (datePaiement > aujourdhuiLocal()) return setErreurModale(t('payments.errorFutureDate'))
    if (!(montantNum > 0)) return setErreurModale(t('payments.errorInvalidAmount'))

    setTraitement(true)
    setErreurModale('')
    const inscription = inscriptionSelectionnee

    try {
      const { error } = await supabase.rpc('marquer_inscription_payee', {
        p_inscription_id: inscription.id,
        p_montant: montantNum,
        p_mode: mode,
        p_date: datePaiement
      })

      if (error) {
        console.error('Erreur:', error)
        const { texte, dejaPaye } = messageErreurRpc(error.message || 'Inconnue')
        const detail = error.message ? `${texte} (${error.message})` : texte
        if (dejaPaye) {
          fermerConfirmation()
          setBandeau({ type: 'erreur', texte: detail })
          await Promise.all([loadEnAttente(), loadHistorique()])
        } else {
          setErreurModale(detail)
        }
        return
      }

      fermerConfirmation()
      await Promise.all([loadEnAttente(), loadHistorique()])

      // Le paiement est enregistré quoi qu'il arrive au reçu. Le rpc ne renvoie pas
      // l'id du paiement créé : on relit le plus récent de cette inscription.
      const { data: dernier } = await supabase
        .from('paiements')
        .select('id')
        .eq('inscription_id', inscription.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const envoye = dernier ? await envoyerRecu(dernier.id) : false
      const nom = `${inscription.prenom} ${inscription.nom}`
      setBandeau(
        envoye
          ? { type: 'succes', texte: t('payments.savedAndEmailSent').replace('{nom}', nom) }
          : { type: 'avertissement', texte: t('payments.emailFailedWarning').replace('{nom}', nom) }
      )
    } catch (error: any) {
      console.error('Erreur:', error)
      setErreurModale(t('payments.saveErrorAlert').replace('{message}', error.message || 'Inconnue'))
    } finally {
      setTraitement(false)
    }
  }

  const renvoyerRecu = async (paiement: any) => {
    if (!paiement.inscriptions || renvoiEnCours) return
    setRenvoiEnCours(paiement.id)
    const envoye = await envoyerRecu(paiement.id)
    const nom = `${paiement.inscriptions.prenom} ${paiement.inscriptions.nom}`
    setBandeau(
      envoye
        ? { type: 'succes', texte: t('payments.resendSuccess').replace('{nom}', nom) }
        : { type: 'avertissement', texte: t('payments.resendFailed').replace('{nom}', nom) }
    )
    setRenvoiEnCours(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  const stylesBandeau: Record<Bandeau['type'], string> = {
    erreur: 'bg-red-50 border-red-300 text-red-800',
    avertissement: 'bg-amber-50 border-amber-300 text-amber-900',
    succes: 'bg-green-50 border-green-300 text-green-800'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('payments.title')}
      </h1>

      <SectionDivider />

      {bandeau && (
        <div role="alert" className={`flex justify-between items-start gap-4 p-4 border rounded ${stylesBandeau[bandeau.type]}`}>
          <p className="text-base">{bandeau.texte}</p>
          <button onClick={() => setBandeau(null)} className="text-sm underline shrink-0">
            {t('payments.dismissButton')}
          </button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex space-x-2">
        <button
          onClick={() => setTab('attente')}
          className={`px-4 py-2 rounded ${tab === 'attente' ? 'bg-[#689e4e] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('payments.pendingTab').replace('{n}', String(enAttente.length))}
        </button>
        <button
          onClick={() => setTab('historique')}
          className={`px-4 py-2 rounded ${tab === 'historique' ? 'bg-[#689e4e] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('payments.historyTab')}
        </button>
      </div>

      {tab === 'attente' && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableName')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableCode')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableClass')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableEmail')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableExpectedAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enAttente.map((inscription) => (
                <tr key={inscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inscription.prenom} {inscription.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-base">{inscription.student_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">{inscription.classe_attribuee || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">{inscription.email_contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">{tarifs['1']}€</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!readOnly && (
                      <button
                        onClick={() => ouvrirConfirmation(inscription)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('payments.markPaidButton')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {enAttente.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-700">
                    {t('payments.noPendingPayments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'historique' && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.historyTableCandidate')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.historyTableCode')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.historyTableAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.historyTableDate')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.historyTableMode')}</th>
                {!readOnly && (
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('payments.tableAction')}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historique.map((paiement) => {
                const echec = echecsEnvoi.has(paiement.id)
                return (
                  <tr key={paiement.id} className={echec ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {paiement.inscriptions?.prenom} {paiement.inscriptions?.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-base">
                      {paiement.inscriptions?.student_code || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base">{paiement.montant}€</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base">
                      {formaterDateFr(datePaiementIso(paiement.date_paiement || paiement.created_at))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base capitalize">{paiement.mode || '—'}</td>
                    {!readOnly && (
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => telechargerRecu(paiement)}
                          disabled={!!telechargementEnCours}
                          className="px-3 py-1 rounded text-sm border border-[#689e4e] text-[#527d3e] hover:bg-[#689e4e]/10 disabled:opacity-50"
                        >
                          {telechargementEnCours === paiement.id ? t('payments.downloadingReceiptButton') : t('payments.downloadReceiptButton')}
                        </button>
                        {paiement.inscriptions?.email_contact && (
                          <button
                            onClick={() => renvoyerRecu(paiement)}
                            disabled={!!renvoiEnCours}
                            className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${
                              echec
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {renvoiEnCours === paiement.id ? t('payments.resendingButton') : t('payments.resendReceiptButton')}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
              {historique.length === 0 && (
                <tr>
                  <td colSpan={readOnly ? 5 : 6} className="px-6 py-8 text-center text-gray-700">
                    {t('payments.noPaymentsRecorded')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de confirmation */}
      {inscriptionSelectionnee && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('payments.confirmModalTitle')}
            </h2>
            <p className="text-base text-gray-600 mb-4">
              {inscriptionSelectionnee.prenom} {inscriptionSelectionnee.nom} — {inscriptionSelectionnee.student_code}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('payments.paymentDateLabel')}</label>
                <input
                  type="date"
                  required
                  value={datePaiement}
                  max={aujourdhuiLocal()}
                  onChange={(e) => setDatePaiement(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('payments.siblingRankLabel')}</label>
                <select
                  value={rang}
                  onChange={(e) => changerRang(e.target.value as RangFratrie)}
                  className="w-full p-2 border rounded"
                >
                  {RANGS_FRATRIE.map((r) => (
                    <option key={r.value} value={r.value}>{t(r.labelKey)} — {tarifs[r.value]} €</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('payments.amountLabel')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">{t('payments.paymentModeLabel')}</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {MODES_PAIEMENT.map((m) => (
                    <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                  ))}
                </select>
              </div>
            </div>

            {erreurModale && (
              <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded text-sm">
                {erreurModale}
              </p>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={fermerConfirmation}
                disabled={traitement}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('payments.cancelButton')}
              </button>
              <button
                onClick={confirmerPaiement}
                disabled={traitement || !montant || !datePaiement}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {traitement ? t('payments.savingButton') : t('payments.confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <RequireAccess ecran="payments">
      {(readOnly) => <PaymentsContent readOnly={readOnly} />}
    </RequireAccess>
  )
}
