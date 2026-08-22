// src/app/public/inscription/components/DisponibilitesStep/index.tsx
'use client'

import { StepProps } from '../../types'
import { useState } from 'react'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

export default function DisponibilitesStep({
  formData,
  updateFormData,
  onNext,
  onBack
}: StepProps) {
  const { t } = usePublicTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const JOURS_OPTIONS = [
    { value: 'lundi', label: t('availability.monday') },
    { value: 'mardi', label: t('availability.tuesday') },
    { value: 'mercredi', label: t('availability.wednesday') },
    { value: 'jeudi', label: t('availability.thursday') },
    { value: 'vendredi', label: t('availability.friday') },
    { value: 'samedi', label: t('availability.saturday') }
  ]

  const peuImporte = formData.jours_preference.length === 1 && formData.jours_preference[0] === 'peu_importe'

  // Gérer la case "n'importe quel jour me convient"
  const handleTogglePeuImporte = (checked: boolean) => {
    updateFormData('jours_preference', checked ? ['peu_importe'] : [])
  }

  // Gérer la sélection/désélection des jours (max 3)
  const handleJourClick = (jour: string) => {
    if (peuImporte) return
    const currentJours = [...formData.jours_preference]

    if (currentJours.includes(jour)) {
      // Retirer le jour
      updateFormData('jours_preference', currentJours.filter(j => j !== jour))
    } else {
      // Ajouter le jour si moins de 3
      if (currentJours.length < 3) {
        updateFormData('jours_preference', [...currentJours, jour])
      }
    }
  }

  // Gérer les checkbox horaires
  const handleHoraireChange = (horaire: 'apres_midi' | 'soir' | 'autre', checked: boolean) => {
    if (horaire === 'apres_midi') {
      updateFormData('horaire_apres_midi', checked)
    } else if (horaire === 'soir') {
      updateFormData('horaire_soir', checked)
    } else {
      updateFormData('horaire_autre', checked)
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Vérifier au moins 1 jour sélectionné
    if (formData.jours_preference.length === 0) {
      newErrors.jours = t('availability.daysRequiredError')
    }

    // Vérifier au moins 1 horaire sélectionné
    if (!formData.horaire_apres_midi && !formData.horaire_soir && !formData.horaire_autre) {
      newErrors.horaires = t('availability.timeRequiredError')
    }

    // Si "autre" est coché, vérifier le détail
    if (formData.horaire_autre && !formData.horaire_autre_detail.trim()) {
      newErrors.horaire_autre = t('availability.otherTimeRequiredError')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('availability.title')}</h2>

      {/* Jours de disponibilité */}
      <div className="space-y-3">
        <div>
          <label className="block mb-2 font-medium text-base">
            {t('availability.daysQuestion')}
          </label>

          <label className="flex items-center space-x-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={peuImporte}
              onChange={(e) => handleTogglePeuImporte(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-base font-medium">{t('availability.anyDayOption')}</span>
          </label>

          <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${peuImporte ? 'opacity-40' : ''}`}>
            {JOURS_OPTIONS.map((jour) => {
              const isSelected = formData.jours_preference.includes(jour.value)
              const position = formData.jours_preference.indexOf(jour.value) + 1

              return (
                <button
                  key={jour.value}
                  type="button"
                  onClick={() => handleJourClick(jour.value)}
                  disabled={peuImporte}
                  className={`p-3 border rounded text-center transition-all ${
                    peuImporte ? 'cursor-not-allowed' :
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500"></span>
                    {isSelected && (
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                        {position}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-base">{jour.label}</div>
                  {isSelected && (
                    <div className="text-sm mt-1 text-blue-600">
                      {t('availability.choiceNumber').replace('{position}', String(position))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {errors.jours && (
            <p className="text-sm text-red-500 mt-1">{errors.jours}</p>
          )}

          <div className="mt-3 text-sm text-gray-600">
            {peuImporte ? (
              <p>{t('availability.anyDaySummary')}</p>
            ) : (
              <>
                <p>
                  {t('availability.selectedCount').replace('{n}', String(formData.jours_preference.length))}
                  {formData.jours_preference.length > 0 && (
                    <span className="ml-2">
                      ({formData.jours_preference.map(j => {
                        const jourLabel = JOURS_OPTIONS.find(o => o.value === j)?.label || j
                        const position = formData.jours_preference.indexOf(j) + 1
                        return `${position}. ${jourLabel}`
                      }).join(', ')})
                    </span>
                  )}
                </p>
                <p className="mt-1 text-gray-700">
                  {t('availability.selectionHint')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Horaire souhaité */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block mb-3 font-medium text-base">
            {t('availability.timeQuestion')}
          </label>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.horaire_apres_midi}
                  onChange={(e) => handleHoraireChange('apres_midi', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-base">{t('availability.afternoonOption')}</span>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.horaire_soir}
                  onChange={(e) => handleHoraireChange('soir', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-base">{t('availability.eveningOption')}</span>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.horaire_autre}
                  onChange={(e) => handleHoraireChange('autre', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-base">{t('availability.otherTimeOption')}</span>
                </div>
              </label>
            </div>

            {errors.horaires && (
              <p className="text-sm text-red-500">{errors.horaires}</p>
            )}

            {/* Détail autre horaire */}
            {formData.horaire_autre && (
              <div className="mt-3">
                <label className="block mb-1 text-base">
                  {t('availability.otherTimeLabel')}
                </label>
                <input
                  type="text"
                  value={formData.horaire_autre_detail}
                  onChange={(e) => updateFormData('horaire_autre_detail', e.target.value)}
                  className={`w-full p-2 border rounded text-sm ${
                    errors.horaire_autre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('availability.otherTimePlaceholder')}
                />
                {errors.horaire_autre && (
                  <p className="text-sm text-red-500 mt-1">{errors.horaire_autre}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {t('availability.backButton')}
        </button>

        <button
          onClick={handleSubmit}
          disabled={formData.jours_preference.length === 0 ||
                   (!formData.horaire_apres_midi && !formData.horaire_soir && !formData.horaire_autre) ||
                   (formData.horaire_autre && !formData.horaire_autre_detail.trim())}
          className={`px-4 py-2 rounded text-sm ${
            formData.jours_preference.length > 0 &&
            (formData.horaire_apres_midi || formData.horaire_soir || formData.horaire_autre) &&
            (!formData.horaire_autre || formData.horaire_autre_detail.trim())
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('availability.nextButton')}
        </button>
      </div>
    </div>
  );
}
