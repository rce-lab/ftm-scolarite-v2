'use client'

import { useState } from 'react'
import {
  soumettreReinscription,
  type DerniereInscriptionInfo
} from '@/app/actions/reinscriptionActions'

interface VariableFieldsStepProps {
  eleveId: string
  derniereInscription: DerniereInscriptionInfo | null
  onSubmitted: (code: string) => void
  onBack: () => void
}

const JOURS_OPTIONS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' }
]

export default function VariableFieldsStep({
  eleveId,
  derniereInscription,
  onSubmitted,
  onBack
}: VariableFieldsStepProps) {
  const [joursPreference, setJoursPreference] = useState<string[]>([])
  const [horaireApresMidi, setHoraireApresMidi] = useState(false)
  const [horaireSoir, setHoraireSoir] = useState(false)
  const [horaireAutre, setHoraireAutre] = useState(false)
  const [horaireAutreDetail, setHoraireAutreDetail] = useState('')
  const [garderMemeEnseignant, setGarderMemeEnseignant] = useState(false)
  const [niveauChoice, setNiveauChoice] = useState<'inchange' | 'reevaluer'>('inchange')
  const [remarques, setRemarques] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const peuImporte = joursPreference.length === 1 && joursPreference[0] === 'peu_importe'
  const niveauConnu = derniereInscription?.niveau_calcule || 'inconnu'

  const handleTogglePeuImporte = (checked: boolean) => {
    setJoursPreference(checked ? ['peu_importe'] : [])
  }

  const handleJourClick = (jour: string) => {
    if (peuImporte) return
    if (joursPreference.includes(jour)) {
      setJoursPreference(joursPreference.filter((j) => j !== jour))
    } else if (joursPreference.length < 3) {
      setJoursPreference([...joursPreference, jour])
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (joursPreference.length === 0) {
      newErrors.jours = 'Veuillez sélectionner au moins un jour de préférence.'
    }
    if (!horaireApresMidi && !horaireSoir && !horaireAutre) {
      newErrors.horaires = 'Veuillez sélectionner au moins un horaire souhaité.'
    }
    if (horaireAutre && !horaireAutreDetail.trim()) {
      newErrors.horaireAutre = 'Merci de préciser cet horaire.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const result = await soumettreReinscription({
        eleveId,
        joursPreference,
        horaireApresMidi,
        horaireSoir,
        horaireAutre,
        horaireAutreDetail,
        garderMemeEnseignant,
        niveauChoice,
        remarques
      })

      if (!result.success) {
        setSubmitError(result.error)
        return
      }

      onSubmitted(result.code)
    } catch (err: any) {
      console.error('Erreur soumission réinscription:', err)
      setSubmitError('Une erreur est survenue. Merci de réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Vos informations pour cette année</h2>
        <p className="text-gray-600 mt-1">
          Seules les quelques infos qui changent d'une année sur l'autre sont demandées ci-dessous.
        </p>
      </div>

      {/* Disponibilités */}
      <div className="space-y-3">
        <label className="block mb-2 font-medium text-base">Jours de disponibilité</label>

        <label className="flex items-center space-x-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={peuImporte}
            onChange={(e) => handleTogglePeuImporte(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-base font-medium">N'importe quel jour me convient</span>
        </label>

        <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${peuImporte ? 'opacity-40' : ''}`}>
          {JOURS_OPTIONS.map((jour) => {
            const isSelected = joursPreference.includes(jour.value)
            const position = joursPreference.indexOf(jour.value) + 1
            return (
              <button
                key={jour.value}
                type="button"
                onClick={() => handleJourClick(jour.value)}
                disabled={peuImporte}
                className={`p-3 border rounded text-center transition-all ${
                  peuImporte
                    ? 'cursor-not-allowed'
                    : isSelected
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-base">{jour.label}</div>
                {isSelected && <div className="text-sm mt-1 text-violet-600">Choix n°{position}</div>}
              </button>
            )
          })}
        </div>
        {errors.jours && <p className="text-sm text-red-500 mt-1">{errors.jours}</p>}

        <div className="pt-2">
          <label className="block mb-2 font-medium text-base">Horaire souhaité</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={horaireApresMidi}
                onChange={(e) => setHoraireApresMidi(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded"
              />
              <span className="text-base font-medium">Après-midi</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={horaireSoir}
                onChange={(e) => setHoraireSoir(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded"
              />
              <span className="text-base font-medium">Soir</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={horaireAutre}
                onChange={(e) => setHoraireAutre(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded"
              />
              <span className="text-base font-medium">Autre</span>
            </label>
          </div>
          {errors.horaires && <p className="text-sm text-red-500 mt-1">{errors.horaires}</p>}

          {horaireAutre && (
            <div className="mt-3">
              <input
                type="text"
                value={horaireAutreDetail}
                onChange={(e) => setHoraireAutreDetail(e.target.value)}
                placeholder="Précisez l'horaire"
                className={`w-full p-2 border rounded text-sm ${
                  errors.horaireAutre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.horaireAutre && <p className="text-sm text-red-500 mt-1">{errors.horaireAutre}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Même enseignant */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={garderMemeEnseignant}
            onChange={(e) => setGarderMemeEnseignant(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-base font-medium">Garder le même enseignant si possible</span>
        </label>
      </div>

      {/* Niveau ressenti */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block mb-2 font-medium text-base" htmlFor="niveau">
          Niveau ressenti
        </label>
        <select
          id="niveau"
          value={niveauChoice}
          onChange={(e) => setNiveauChoice(e.target.value as 'inchange' | 'reevaluer')}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="inchange">Niveau inchangé (dernier connu : {niveauConnu})</option>
          <option value="reevaluer">Je pense avoir progressé, à réévaluer</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Le niveau définitif sera tranché par l'enseignant lors de la délibération.
        </p>
      </div>

      {/* Remarques */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block mb-2 font-medium text-base" htmlFor="remarques">
          Remarques (optionnel)
        </label>
        <textarea
          id="remarques"
          value={remarques}
          onChange={(e) => setRemarques(e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 whitespace-pre-line">{submitError}</p>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Retour
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-sm text-white ${
            isSubmitting ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
          }`}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Confirmer ma réinscription'}
        </button>
      </div>
    </div>
  )
}
