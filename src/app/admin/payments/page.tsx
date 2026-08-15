// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getConfig } from '@/lib/config'
import { sendPaymentConfirmationAction } from '@/app/actions/emailActions'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const MODES_PAIEMENT = [
  { value: 'virement', labelKey: 'payments.modeTransfer' },
  { value: 'especes', labelKey: 'payments.modeCash' },
  { value: 'autre', labelKey: 'payments.modeOther' }
] as const

export default function PaymentsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'attente' | 'historique'>('attente')
  const [enAttente, setEnAttente] = useState<any[]>([])
  const [historique, setHistorique] = useState<any[]>([])
  const [montantAttendu, setMontantAttendu] = useState(30)
  const [loading, setLoading] = useState(true)

  const [inscriptionSelectionnee, setInscriptionSelectionnee] = useState<any>(null)
  const [montant, setMontant] = useState('')
  const [mode, setMode] = useState('virement')
  const [traitement, setTraitement] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const config = await getConfig()
    setMontantAttendu(config.montant_inscription || 30)
    await Promise.all([loadEnAttente(), loadHistorique()])
    setLoading(false)
  }

  const loadEnAttente = async () => {
    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .or('status.eq.payment_pending,and(status.eq.approved,statut_paiement.neq.paye)')
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
        .select('*, inscriptions(nom, prenom, student_code)')
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
    setMontant(montantAttendu.toString())
    setMode('virement')
  }

  const fermerConfirmation = () => {
    setInscriptionSelectionnee(null)
  }

  const confirmerPaiement = async () => {
    if (!inscriptionSelectionnee || traitement) return
    setTraitement(true)

    try {
      const { error } = await supabase.rpc('marquer_inscription_payee', {
        p_inscription_id: inscriptionSelectionnee.id,
        p_montant: parseFloat(montant),
        p_mode: mode
      })

      if (error) throw error

      sendPaymentConfirmationAction(
        inscriptionSelectionnee.email_contact,
        `${inscriptionSelectionnee.prenom} ${inscriptionSelectionnee.nom}`,
        inscriptionSelectionnee.student_code,
        parseFloat(montant)
      ).catch((err) => console.error('Erreur envoi email paiement:', err))

      fermerConfirmation()
      await Promise.all([loadEnAttente(), loadHistorique()])
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(t('payments.saveErrorAlert').replace('{message}', error.message || 'Inconnue'))
    } finally {
      setTraitement(false)
    }
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
      <h1 className="text-2xl font-bold text-gray-900">{t('payments.title')}</h1>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableCode')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableClass')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableEmail')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableExpectedAmount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.tableAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enAttente.map((inscription) => (
                <tr key={inscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inscription.prenom} {inscription.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{inscription.student_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{inscription.classe_attribuee || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{inscription.email_contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{montantAttendu}€</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => ouvrirConfirmation(inscription)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      {t('payments.markPaidButton')}
                    </button>
                  </td>
                </tr>
              ))}
              {enAttente.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.historyTableCandidate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.historyTableCode')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.historyTableAmount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.historyTableDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.historyTableMode')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historique.map((paiement) => (
                <tr key={paiement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {paiement.inscriptions?.prenom} {paiement.inscriptions?.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {paiement.inscriptions?.student_code || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{paiement.montant}€</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {paiement.date_paiement
                      ? new Date(paiement.date_paiement).toLocaleDateString('fr-FR')
                      : new Date(paiement.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{paiement.mode || '—'}</td>
                </tr>
              ))}
              {historique.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t('payments.noPaymentsRecorded')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de confirmation */}
      {inscriptionSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{t('payments.confirmModalTitle')}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {inscriptionSelectionnee.prenom} {inscriptionSelectionnee.nom} — {inscriptionSelectionnee.student_code}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.amountLabel')}</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.paymentModeLabel')}</label>
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
                disabled={traitement || !montant}
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
