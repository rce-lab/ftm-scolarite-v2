// src/app/admin/parametres/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import SectionDivider from '@/components/SectionDivider'

const CHAMPS_CONFIG = [
  { key: 'montant_inscription', labelKey: 'settings.registrationFeeLabel', type: 'number' },
  { key: 'email_communication', labelKey: 'settings.contactEmailLabel', type: 'email' },
  { key: 'annee_scolaire_courante', labelKey: 'settings.currentSchoolYearLabel', type: 'text', placeholderKey: 'settings.schoolYearPlaceholder' },
  { key: 'prefixe_code_etudiant', labelKey: 'settings.studentCodePrefixLabel', type: 'text' },
  { key: 'rib_banque', labelKey: 'settings.bankRibLabel', type: 'textarea' },
  { key: 'beneficiaire', labelKey: 'settings.beneficiaryLabel', type: 'text' },
  { key: 'email_responsable_scolarite', labelKey: 'settings.schoolManagerEmailLabel', type: 'email' },
  { key: 'email_responsable_administratif', labelKey: 'settings.adminManagerEmailLabel', type: 'email' },
  { key: 'adresse_association', labelKey: 'settings.associationAddressLabel', type: 'text' }
] as const

type FormState = Record<typeof CHAMPS_CONFIG[number]['key'], string>

const emptyForm: FormState = {
  montant_inscription: '',
  email_communication: '',
  annee_scolaire_courante: '',
  prefixe_code_etudiant: '',
  rib_banque: '',
  beneficiaire: '',
  email_responsable_scolarite: '',
  email_responsable_administratif: '',
  adresse_association: ''
}

export default function ParametresPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('configuration')
        .select('key, value')

      if (error) throw error

      const nouveauForm = { ...emptyForm }
      data?.forEach((item) => {
        if (item.key in nouveauForm) {
          nouveauForm[item.key as keyof FormState] = item.value ?? ''
        }
      })
      setForm(nouveauForm)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const lignes = CHAMPS_CONFIG.map(({ key }) => ({ key, value: form[key] }))

      const { error } = await supabase
        .from('configuration')
        .upsert(lignes, { onConflict: 'key' })

      if (error) throw error

      setSuccessMessage(t('settings.saveSuccessMessage'))
    } catch (error: any) {
      console.error('Erreur:', error)
      setErrorMessage(error.message || t('settings.saveErrorMessage'))
    } finally {
      setSaving(false)
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
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('settings.title')}
      </h1>

      <SectionDivider />

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
        {CHAMPS_CONFIG.map((champ) => (
          <div key={champ.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(champ.labelKey)}</label>
            {champ.type === 'textarea' ? (
              <textarea
                value={form[champ.key]}
                onChange={(e) => updateField(champ.key, e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              />
            ) : (
              <input
                type={champ.type}
                value={form[champ.key]}
                onChange={(e) => updateField(champ.key, e.target.value)}
                placeholder={'placeholderKey' in champ ? t(champ.placeholderKey) : undefined}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              />
            )}
          </div>
        ))}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded">
            ✅ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded">
            ❌ {errorMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium disabled:opacity-50"
          >
            {saving ? t('settings.savingButton') : t('settings.saveButton')}
          </button>
        </div>
      </form>
    </div>
  )
}
