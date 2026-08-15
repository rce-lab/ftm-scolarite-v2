// app/teacher/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const emptyForm = {
  nom: '',
  niveau: 'A1',
  tranche_age: '',
  capacite_max: '',
  jour: 'Lundi',
  heure: '',
  duree_minutes: '90',
  compte_visio_id: '',
  lien_visio: '',
  enseignants: ''
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [comptesVisio, setComptesVisio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [conflit, setConflit] = useState<any>(null)

  useEffect(() => {
    loadClasses()
    loadComptesVisio()
  }, [])

  useEffect(() => {
    verifierConflit()
  }, [form.compte_visio_id, form.jour, form.heure])

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, comptes_visio(nom)')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const enseignants = form.enseignants
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean)

      const { error } = await supabase.from('classes').insert([{
        nom: form.nom,
        niveau: form.niveau,
        tranche_age: form.tranche_age || null,
        capacite_max: form.capacite_max ? parseInt(form.capacite_max) : null,
        jour: form.jour,
        heure: form.heure,
        duree_minutes: form.duree_minutes ? parseInt(form.duree_minutes) : 90,
        compte_visio_id: form.compte_visio_id || null,
        lien_visio: form.lien_visio || null,
        enseignants
      }])

      if (error) throw error

      setForm(emptyForm)
      setConflit(null)
      loadClasses()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(`Erreur lors de la création : ${error.message || 'Inconnue'}`)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des classes</h1>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4">Nouvelle classe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateForm('nom', e.target.value)}
                placeholder="Ex: M-LUNDI-18H-A1"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Niveau</label>
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
              <label className="block text-sm font-medium mb-1">Tranche d'âge</label>
              <input
                type="text"
                value={form.tranche_age}
                onChange={(e) => updateForm('tranche_age', e.target.value)}
                placeholder="Ex: Enfants, Adultes"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacité max</label>
              <input
                type="number"
                value={form.capacite_max}
                onChange={(e) => updateForm('capacite_max', e.target.value)}
                min={1}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jour</label>
              <select
                value={form.jour}
                onChange={(e) => updateForm('jour', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {JOURS.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure</label>
              <input
                type="text"
                value={form.heure}
                onChange={(e) => updateForm('heure', e.target.value)}
                placeholder="Ex: 18:00"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
              <input
                type="number"
                value={form.duree_minutes}
                onChange={(e) => updateForm('duree_minutes', e.target.value)}
                min={1}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compte visio</label>
              <select
                value={form.compte_visio_id}
                onChange={(e) => updateForm('compte_visio_id', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">— Aucun —</option>
                {comptesVisio.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien visio</label>
              <input
                type="text"
                value={form.lien_visio}
                onChange={(e) => updateForm('lien_visio', e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Enseignants</label>
              <textarea
                value={form.enseignants}
                onChange={(e) => updateForm('enseignants', e.target.value)}
                placeholder="Un nom par ligne, ou séparés par des virgules"
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {conflit && (
            <div className="p-4 bg-orange-50 border border-orange-300 text-orange-800 rounded">
              ⚠️ Ce compte est déjà utilisé à ce créneau par la classe <strong>{conflit.nom}</strong>.
              La création reste possible, mais vérifiez qu'il n'y a pas de conflit réel.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer la classe'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des classes */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tranche d'âge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte visio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((classe) => (
              <tr key={classe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{classe.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-bold">
                    {classe.niveau || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.tranche_age || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.jour || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.heure || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.capacite_max ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{classe.comptes_visio?.nom || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {classe.enseignants && classe.enseignants.length > 0 ? classe.enseignants.join(', ') : '—'}
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  Aucune classe créée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
