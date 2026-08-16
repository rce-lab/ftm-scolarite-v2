// app/admin/enseignants/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import SectionDivider from '@/components/SectionDivider'

const emptyForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  actif: true,
  remarques: ''
}

export default function EnseignantsPage() {
  const { t } = useTranslation()
  const [enseignants, setEnseignants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    loadEnseignants()
  }, [])

  const loadEnseignants = async () => {
    try {
      const { data, error } = await supabase
        .from('enseignants')
        .select('*')
        .order('nom')

      if (error) throw error
      setEnseignants(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const { error } = await supabase.from('enseignants').insert([{
        nom: form.nom,
        prenom: form.prenom,
        email: form.email || null,
        telephone: form.telephone || null,
        actif: form.actif,
        remarques: form.remarques || null
      }])

      if (error) throw error

      setForm(emptyForm)
      loadEnseignants()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(t('enseignants.createErrorAlert').replace('{message}', error.message || 'Inconnue'))
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
          {t('enseignants.title')}
        </h1>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
          <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
          {t('enseignants.newTeacherTitle')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('enseignants.lastNameLabel')}</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateForm('nom', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('enseignants.firstNameLabel')}</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => updateForm('prenom', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('enseignants.emailLabel')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('enseignants.phoneLabel')}</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => updateForm('telephone', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="enseignant-actif"
                type="checkbox"
                checked={form.actif}
                onChange={(e) => updateForm('actif', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="enseignant-actif" className="text-sm font-medium">{t('enseignants.activeLabel')}</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('enseignants.remarksLabel')}</label>
              <textarea
                value={form.remarques}
                onChange={(e) => updateForm('remarques', e.target.value)}
                placeholder={t('enseignants.remarksPlaceholder')}
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium disabled:opacity-50"
            >
              {saving ? t('enseignants.creatingButton') : t('enseignants.createButton')}
            </button>
          </div>
        </form>
      </div>

      <SectionDivider />

      {/* Liste des enseignants */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tableLastName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tableFirstName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tableEmail')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tablePhone')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tableStatus')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enseignants.tableRemarks')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enseignants.map((enseignant) => (
              <tr key={enseignant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{enseignant.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{enseignant.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{enseignant.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{enseignant.telephone || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {enseignant.actif ? (
                    <span className="px-2 py-1 text-xs rounded bg-[#689e4e]/15 text-[#527d3e] font-bold">
                      {t('enseignants.statusActive')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600 font-bold">
                      {t('enseignants.statusInactive')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm max-w-xs">{enseignant.remarques || '—'}</td>
              </tr>
            ))}
            {enseignants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {t('enseignants.noTeachersYet')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
