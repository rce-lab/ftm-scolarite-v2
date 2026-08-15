// src/app/admin/parametres/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const CHAMPS_CONFIG = [
  { key: 'montant_inscription', label: "Frais d'inscription (€)", type: 'number' },
  { key: 'email_communication', label: 'Email de contact/communication', type: 'email' },
  { key: 'annee_scolaire_courante', label: 'Année scolaire courante', type: 'text', placeholder: 'AAAA-AAAA' },
  { key: 'prefixe_code_etudiant', label: 'Préfixe des codes étudiants', type: 'text' },
  { key: 'rib_banque', label: 'RIB bancaire', type: 'textarea' },
  { key: 'beneficiaire', label: 'Bénéficiaire (nom sur le compte)', type: 'text' },
  { key: 'email_responsable_scolarite', label: 'Email Responsable Scolarité', type: 'email' },
  { key: 'email_responsable_administratif', label: 'Email Responsable Administratif', type: 'email' }
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
  email_responsable_administratif: ''
}

export default function ParametresPage() {
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

      setSuccessMessage('Paramètres enregistrés avec succès.')
    } catch (error: any) {
      console.error('Erreur:', error)
      setErrorMessage(error.message || 'Une erreur est survenue lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
        {CHAMPS_CONFIG.map((champ) => (
          <div key={champ.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{champ.label}</label>
            {champ.type === 'textarea' ? (
              <textarea
                value={form[champ.key]}
                onChange={(e) => updateField(champ.key, e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <input
                type={champ.type}
                value={form[champ.key]}
                onChange={(e) => updateField(champ.key, e.target.value)}
                placeholder={'placeholder' in champ ? champ.placeholder : undefined}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
