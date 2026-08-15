// src/app/public/inscription/components/ContactStep/index.tsx
'use client'

import { StepProps } from '../../types'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

const JOUR_KEYS: Record<string, string> = {
  lundi: 'availability.monday',
  mardi: 'availability.tuesday',
  mercredi: 'availability.wednesday',
  jeudi: 'availability.thursday',
  vendredi: 'availability.friday',
  samedi: 'availability.saturday'
}

export default function ContactStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  config
}: StepProps) {
  const { t } = usePublicTranslation()

  const formatJoursPreference = () => {
    if (formData.jours_preference.length === 0) return t('contact.noDaySelected')

    return formData.jours_preference.map((jour, index) => {
      const label = JOUR_KEYS[jour] ? t(JOUR_KEYS[jour]) : jour
      return `${index + 1}. ${label}`
    }).join(', ')
  }

  const formatHoraires = () => {
    const horaires = []
    if (formData.horaire_apres_midi) horaires.push(t('availability.afternoonOption'))
    if (formData.horaire_soir) horaires.push(t('availability.eveningOption'))
    if (formData.horaire_autre && formData.horaire_autre_detail) {
      horaires.push(t('contact.otherWithDetail').replace('{detail}', formData.horaire_autre_detail))
    }
    return horaires.length > 0 ? horaires.join(', ') : t('contact.noTimeSelected')
  }

  const formatRaisons = () => {
    const raisons = []
    if (formData.raison_maternelle) raisons.push(t('contact.maternalLanguageSummary'))
    if (formData.raison_competences) raisons.push(t('contact.skillsSummary'))
    if (formData.raison_plaisir) raisons.push(t('motivation.reasonEnjoyment'))
    if (formData.raison_autre && formData.raison_autre_detail) {
      raisons.push(t('contact.otherWithDetail').replace('{detail}', formData.raison_autre_detail))
    }
    return raisons.length > 0 ? raisons.join(', ') : t('contact.noReasonSelected')
  }

  const formatConnaitre = () => {
    const moyens = []
    if (formData.connaitre_connaissances) moyens.push(t('contact.acquaintancesSummary'))
    if (formData.connaitre_association) moyens.push(t('contact.associationSummary'))
    if (formData.connaitre_ancien_eleve) moyens.push(t('contact.formerStudentSummary'))
    if (formData.connaitre_recommandation) moyens.push(t('contact.recommendationSummary'))
    if (formData.connaitre_autre && formData.connaitre_autre_detail) {
      moyens.push(t('contact.otherWithDetail').replace('{detail}', formData.connaitre_autre_detail))
    }
    return moyens.length > 0 ? moyens.join(', ') : t('contact.notSpecified')
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t('contact.title')}</h2>

      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="font-bold text-md mb-3">{t('contact.recapTitle')}</h3>

        <div className="space-y-4">
          {/* Informations personnelles */}
          <div>
            <h4 className="font-bold text-gray-700 mb-2 text-sm">{t('personalInfo.title')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">{t('contact.nameLabel')}</p>
                <p className="font-medium text-sm">{formData.nom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.firstNameLabel')}</p>
                <p className="font-medium text-sm">{formData.prenom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.ageLabel')}</p>
                <p className="font-medium text-sm">{t('contact.ageYears').replace('{age}', formData.age)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.countryLabel')}</p>
                <p className="font-medium text-sm">{formData.pays_residence}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.cityLabel')}</p>
                <p className="font-medium text-sm">{formData.ville_residence}</p>
              </div>
              {formData.responsable_legal && (
                <div>
                  <p className="text-xs text-gray-600">{t('personalInfo.legalGuardianLabel')}</p>
                  <p className="font-medium text-sm">{formData.responsable_legal}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">{t('contact.emailLabel')}</p>
                <p className="font-medium text-sm">{formData.email_contact}</p>
              </div>
              {formData.adresse_postale && (
                <div>
                  <p className="text-xs text-gray-600">{t('personalInfo.addressLabel')}</p>
                  <p className="font-medium text-sm">{formData.adresse_postale}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">{t('contact.phoneLabel')}</p>
                <p className="font-medium text-sm">{formData.indicatif_pays} {formData.telephone}</p>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="pt-3 border-t border-gray-300">
            <h4 className="font-bold text-gray-700 mb-2 text-sm">{t('contact.availabilityTitle')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">{t('contact.daysLabel')}</p>
                <p className="font-medium text-sm">{formatJoursPreference()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.timesLabel')}</p>
                <p className="font-medium text-sm">{formatHoraires()}</p>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="pt-3 border-t border-gray-300">
            <h4 className="font-bold text-gray-700 mb-2 text-sm">{t('motivation.title')}</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">{t('contact.reasonsLabel')}</p>
                <p className="font-medium text-sm">{formatRaisons()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.expectationsLabel')}</p>
                <p className="font-medium text-sm">{formData.attentes_formation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.howKnownLabel')}</p>
                <p className="font-medium text-sm">{formatConnaitre()}</p>
              </div>
              {formData.remarques && (
                <div>
                  <p className="text-xs text-gray-600">{t('contact.remarksLabel')}</p>
                  <p className="font-medium text-sm">{formData.remarques}</p>
                </div>
              )}
            </div>
          </div>

          {/* Évaluation */}
          <div className="pt-3 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">{t('contact.suggestedLevelLabel')}</p>
                <p className="font-medium text-md">{formData.niveau_suggere || 'A1'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('contact.registrationFeeLabel')}</p>
                <p className="font-medium text-md">{t('contact.perYear').replace('{montant}', String(config?.montant_inscription || 30))}</p>
              </div>
              {Object.keys(formData.competences || {}).length > 1 && (
                <div>
                  <p className="text-xs text-gray-600">{t('contact.questionsAnsweredLabel')}</p>
                  <p className="font-medium text-md">{t('contact.questionsCount').replace('{n}', String(Object.keys(formData.competences).length))}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>{t('contact.finalNoticeLead')}</strong> {t('contact.finalNoticeRest')}
        </p>
      </div>

      <div className="flex justify-between pt-3">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {t('contact.editButton')}
        </button>

        <button
          onClick={onNext}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-medium"
        >
          {t('contact.confirmButton')}
        </button>
      </div>
    </div>
  );
}
