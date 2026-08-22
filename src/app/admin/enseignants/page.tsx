// app/admin/enseignants/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import SectionDivider from '@/components/SectionDivider'

// Textes ajoutés pour l'édition — translations.ts hors périmètre pour cette tâche.
// editButton/cancelButton/saveEditButton/savingEditButton/tableActions réutilisent des
// paires fr/mg déjà validées ailleurs dans translations.ts (voir commentaires).
// editTitle/classesLabel/noClassesAvailable sont des brouillons, non validés.
const EDIT_TEXTS = {
  editButton: { fr: '✏️ Modifier', mg: '✏️ Hanova' }, // cf. changePassword.submitButton
  cancelButton: { fr: 'Annuler', mg: 'Foano' }, // cf. payments.cancelButton
  saveEditButton: { fr: 'Enregistrer les modifications', mg: 'Tahirizo ary ny fanovana' }, // cf. inscriptionsDetail.saveButton
  savingEditButton: { fr: 'Enregistrement...', mg: 'Eo am-pitahirizana...' }, // cf. settings.savingButton
  editTitle: { fr: "Modifier l'enseignant", mg: "Fanovan'ny mpampianatra" }, // brouillon
  tableActions: { fr: 'Actions', mg: 'Hetsika' }, // cf. deliberation.tableActions
  classesLabel: { fr: 'Classes associées', mg: 'Kilasy mifandray' }, // brouillon
  noClassesAvailable: { fr: 'Aucune classe enregistrée.', mg: 'Tsy misy kilasy voarakitra.' } // brouillon
}

const emptyForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  actif: true,
  remarques: ''
}

export default function EnseignantsPage() {
  const { t, language } = useTranslation()
  const [enseignants, setEnseignants] = useState<any[]>([])
  const [classesDisponibles, setClassesDisponibles] = useState<any[]>([])
  const [classesSelectionnees, setClassesSelectionnees] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadEnseignants()
    loadClasses()
  }, [])

  const loadEnseignants = async () => {
    try {
      const { data, error } = await supabase
        .from('enseignants')
        .select('*, classe_enseignants(classes(id, nom))')
        .order('nom')

      if (error) throw error
      setEnseignants(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, nom')
        .order('nom')

      if (error) throw error
      setClassesDisponibles(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const toggleClasse = (id: string) => {
    setClassesSelectionnees(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const commencerEdition = (enseignant: any) => {
    setEditingId(enseignant.id)
    setForm({
      nom: enseignant.nom || '',
      prenom: enseignant.prenom || '',
      email: enseignant.email || '',
      telephone: enseignant.telephone || '',
      actif: enseignant.actif ?? true,
      remarques: enseignant.remarques || ''
    })
    setClassesSelectionnees(
      (enseignant.classe_enseignants || []).map((ce: any) => ce.classes.id)
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const annulerEdition = () => {
    setEditingId(null)
    setForm(emptyForm)
    setClassesSelectionnees([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email || null,
        telephone: form.telephone || null,
        actif: form.actif,
        remarques: form.remarques || null
      }

      let enseignantId: string

      if (editingId) {
        const { error } = await supabase.from('enseignants').update(payload).eq('id', editingId)
        if (error) throw error
        enseignantId = editingId

        const { error: erreurSuppression } = await supabase
          .from('classe_enseignants')
          .delete()
          .eq('enseignant_id', enseignantId)
        if (erreurSuppression) throw erreurSuppression
      } else {
        const { data, error } = await supabase.from('enseignants').insert([payload]).select('id').single()
        if (error) throw error
        enseignantId = data.id
      }

      if (classesSelectionnees.length > 0) {
        const { error: erreurClasses } = await supabase.from('classe_enseignants').insert(
          classesSelectionnees.map(classeId => ({
            classe_id: classeId,
            enseignant_id: enseignantId
          }))
        )
        if (erreurClasses) throw erreurClasses
      }

      setForm(emptyForm)
      setClassesSelectionnees([])
      setEditingId(null)
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
          {editingId ? EDIT_TEXTS.editTitle[language] : t('enseignants.newTeacherTitle')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium mb-1">{t('enseignants.lastNameLabel')}</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateForm('nom', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">{t('enseignants.firstNameLabel')}</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => updateForm('prenom', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">{t('enseignants.emailLabel')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">{t('enseignants.phoneLabel')}</label>
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
              <label htmlFor="enseignant-actif" className="text-base font-medium">{t('enseignants.activeLabel')}</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-medium mb-1">{t('enseignants.remarksLabel')}</label>
              <textarea
                value={form.remarques}
                onChange={(e) => updateForm('remarques', e.target.value)}
                placeholder={t('enseignants.remarksPlaceholder')}
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-medium mb-1">{EDIT_TEXTS.classesLabel[language]}</label>
              {classesDisponibles.length > 0 ? (
                <div className="flex flex-wrap gap-3 p-2 border rounded max-h-48 overflow-y-auto">
                  {classesDisponibles.map(classe => (
                    <label key={classe.id} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={classesSelectionnees.includes(classe.id)}
                        onChange={() => toggleClasse(classe.id)}
                        className="h-4 w-4"
                      />
                      {classe.nom}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-700">{EDIT_TEXTS.noClassesAvailable[language]}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={annulerEdition}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                {EDIT_TEXTS.cancelButton[language]}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium disabled:opacity-50"
            >
              {editingId
                ? (saving ? EDIT_TEXTS.savingEditButton[language] : EDIT_TEXTS.saveEditButton[language])
                : (saving ? t('enseignants.creatingButton') : t('enseignants.createButton'))}
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tableLastName')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tableFirstName')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tableEmail')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tablePhone')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tableStatus')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{t('enseignants.tableRemarks')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">{EDIT_TEXTS.tableActions[language]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enseignants.map((enseignant) => (
              <tr key={enseignant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{enseignant.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{enseignant.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base">{enseignant.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base">{enseignant.telephone || '—'}</td>
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
                <td className="px-6 py-4 text-base max-w-xs">{enseignant.remarques || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    type="button"
                    onClick={() => commencerEdition(enseignant)}
                    className="text-[#689e4e] hover:text-[#527d3e] font-medium"
                  >
                    {EDIT_TEXTS.editButton[language]}
                  </button>
                </td>
              </tr>
            ))}
            {enseignants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">
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
