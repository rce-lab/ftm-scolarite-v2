// app/teacher/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { translations } from '@/lib/i18n/translations'

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const COULEURS = [
  { hex: '#ef4444', key: 'classes.colorRed' },
  { hex: '#22c55e', key: 'classes.colorGreen' },
  { hex: '#3b82f6', key: 'classes.colorBlue' },
  { hex: '#eab308', key: 'classes.colorYellow' },
  { hex: '#f97316', key: 'classes.colorOrange' },
  { hex: '#8b5cf6', key: 'classes.colorPurple' },
  { hex: '#ec4899', key: 'classes.colorPink' },
  { hex: '#92400e', key: 'classes.colorBrown' },
  { hex: '#6b7280', key: 'classes.colorGray' },
  { hex: '#111827', key: 'classes.colorBlack' }
]
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const JOUR_KEYS: Record<string, string> = {
  Lundi: 'classes.monday',
  Mardi: 'classes.tuesday',
  Mercredi: 'classes.wednesday',
  Jeudi: 'classes.thursday',
  Vendredi: 'classes.friday',
  Samedi: 'classes.saturday'
}

const emptyForm = {
  nom: '',
  niveau: 'A1',
  niveau_max: '',
  tranche_age: '',
  capacite_max: '',
  jour: 'Lundi',
  heure: '',
  duree_minutes: '90',
  compte_visio_id: '',
  lien_visio: '',
  couleur: ''
}

export default function TeacherClassesPage() {
  const { t } = useTranslation()
  const [classes, setClasses] = useState<any[]>([])
  const [comptesVisio, setComptesVisio] = useState<any[]>([])
  const [enseignants, setEnseignants] = useState<any[]>([])
  const [enseignantsSelectionnes, setEnseignantsSelectionnes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [conflit, setConflit] = useState<any>(null)

  useEffect(() => {
    loadClasses()
    loadComptesVisio()
    loadEnseignants()
  }, [])

  useEffect(() => {
    verifierConflit()
  }, [form.compte_visio_id, form.jour, form.heure])

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, comptes_visio(nom), classe_enseignants(enseignants(id, nom, prenom))')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComptesVisio = async () => {
    try {
      const { data, error } = await supabase
        .from('comptes_visio')
        .select('id, nom')
        .order('nom')

      if (error) throw error
      setComptesVisio(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadEnseignants = async () => {
    try {
      const { data, error } = await supabase
        .from('enseignants')
        .select('id, nom, prenom')
        .order('nom')

      if (error) throw error
      setEnseignants(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const toggleEnseignant = (id: string) => {
    setEnseignantsSelectionnes(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const verifierConflit = async () => {
    if (!form.compte_visio_id || !form.jour || !form.heure) {
      setConflit(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, nom')
        .eq('compte_visio_id', form.compte_visio_id)
        .eq('jour', form.jour)
        .eq('heure', form.heure)

      if (error) throw error
      setConflit(data && data.length > 0 ? data[0] : null)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleColorChange = (hex: string) => {
    const couleur = COULEURS.find(c => c.hex === hex)
    setForm(prev => {
      if (prev.nom || !couleur) {
        return { ...prev, couleur: hex }
      }
      const shortKey = couleur.key.split('.')[1] as keyof typeof translations.classes
      const nomMalgache = translations.classes[shortKey]?.mg
      return {
        ...prev,
        couleur: hex,
        nom: nomMalgache ? `Kilasy ${nomMalgache}` : prev.nom
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const { data, error } = await supabase.from('classes').insert([{
        nom: form.nom,
        niveau: form.niveau,
        niveau_max: form.niveau_max || null,
        tranche_age: form.tranche_age || null,
        capacite_max: form.capacite_max ? parseInt(form.capacite_max) : null,
        jour: form.jour,
        heure: form.heure,
        duree_minutes: form.duree_minutes ? parseInt(form.duree_minutes) : 90,
        compte_visio_id: form.compte_visio_id || null,
        lien_visio: form.lien_visio || null,
        couleur: form.couleur || null
      }]).select('id').single()

      if (error) throw error

      if (enseignantsSelectionnes.length > 0) {
        const { error: erreurEnseignants } = await supabase.from('classe_enseignants').insert(
          enseignantsSelectionnes.map(enseignantId => ({
            classe_id: data.id,
            enseignant_id: enseignantId
          }))
        )
        if (erreurEnseignants) throw erreurEnseignants
      }

      setForm(emptyForm)
      setEnseignantsSelectionnes([])
      setConflit(null)
      loadClasses()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(t('classes.createErrorAlert').replace('{message}', error.message || 'Inconnue'))
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
        <h1 className="text-2xl font-bold">{t('classes.title')}</h1>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4">{t('classes.newClassTitle')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.nameLabel')}</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateForm('nom', e.target.value)}
                placeholder={t('classes.namePlaceholder')}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.levelLabel')}</label>
              <select
                value={form.niveau}
                onChange={(e) => updateForm('niveau', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {NIVEAUX.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.levelMaxLabel')}</label>
              <select
                value={form.niveau_max}
                onChange={(e) => updateForm('niveau_max', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{t('classes.noneOption')}</option>
                {NIVEAUX.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.ageRangeLabel')}</label>
              <input
                type="text"
                value={form.tranche_age}
                onChange={(e) => updateForm('tranche_age', e.target.value)}
                placeholder={t('classes.ageRangePlaceholder')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.maxCapacityLabel')}</label>
              <input
                type="number"
                value={form.capacite_max}
                onChange={(e) => updateForm('capacite_max', e.target.value)}
                min={1}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.dayLabel')}</label>
              <select
                value={form.jour}
                onChange={(e) => updateForm('jour', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {JOURS.map(j => (
                  <option key={j} value={j}>{t(JOUR_KEYS[j])}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.timeLabel')}</label>
              <input
                type="text"
                value={form.heure}
                onChange={(e) => updateForm('heure', e.target.value)}
                placeholder={t('classes.timePlaceholder')}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.durationLabel')}</label>
              <input
                type="number"
                value={form.duree_minutes}
                onChange={(e) => updateForm('duree_minutes', e.target.value)}
                min={1}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.videoAccountLabel')}</label>
              <select
                value={form.compte_visio_id}
                onChange={(e) => updateForm('compte_visio_id', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{t('classes.noneOption')}</option>
                {comptesVisio.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.videoLinkLabel')}</label>
              <input
                type="text"
                value={form.lien_visio}
                onChange={(e) => updateForm('lien_visio', e.target.value)}
                placeholder={t('classes.videoLinkPlaceholder')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('classes.colorLabel')}</label>
              <select
                value={form.couleur}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{t('classes.noneOption')}</option>
                {COULEURS.map(c => (
                  <option key={c.hex} value={c.hex}>{t(c.key)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">{t('classes.teachersLabel')}</label>
              {enseignants.length > 0 ? (
                <div className="flex flex-wrap gap-3 p-2 border rounded max-h-48 overflow-y-auto">
                  {enseignants.map(enseignant => (
                    <label key={enseignant.id} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={enseignantsSelectionnes.includes(enseignant.id)}
                        onChange={() => toggleEnseignant(enseignant.id)}
                        className="h-4 w-4"
                      />
                      {enseignant.prenom} {enseignant.nom}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('classes.noTeachersAvailable')}</p>
              )}
            </div>
          </div>

          {conflit && (
            <div className="p-4 bg-orange-50 border border-orange-300 text-orange-800 rounded">
              {t('classes.conflictWarning').split('{nom}')[0]}
              <strong>{conflit.nom}</strong>
              {t('classes.conflictWarning').split('{nom}')[1]}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#689e4e] text-white rounded-lg hover:bg-[#527d3e] font-medium disabled:opacity-50"
            >
              {saving ? t('classes.creatingButton') : t('classes.createButton')}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des classes */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableLevel')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableAgeRange')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableDay')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableTime')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableCapacity')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableVideoAccount')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('classes.tableTeachers')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((classe) => (
              <tr key={classe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <span className="flex items-center gap-2">
                    {classe.couleur && (
                      <span
                        className="inline-block rounded-full flex-shrink-0 border border-gray-300"
                        style={{ width: 16, height: 16, backgroundColor: classe.couleur }}
                      ></span>
                    )}
                    {classe.nom}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded bg-[#689e4e]/15 text-[#527d3e] font-bold">
                    {classe.niveau
                      ? (classe.niveau_max && classe.niveau_max !== classe.niveau
                          ? `${classe.niveau}-${classe.niveau_max}`
                          : classe.niveau)
                      : '—'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.tranche_age || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {classe.jour ? (JOUR_KEYS[classe.jour] ? t(JOUR_KEYS[classe.jour]) : classe.jour) : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.heure || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.capacite_max ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.comptes_visio?.nom || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {classe.classe_enseignants && classe.classe_enseignants.length > 0
                    ? classe.classe_enseignants.map((ce: any) => `${ce.enseignants.prenom} ${ce.enseignants.nom}`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {t('classes.noClassesYet')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
