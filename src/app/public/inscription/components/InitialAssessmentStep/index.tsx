// src/app/public/inscription/components/InitialAssessmentStep/index.tsx
'use client'

import { StepProps } from '../../types'
import { useState } from 'react'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

// Import des données
import {
  PREMIERE_QUESTION_A1,
  getAllQuestions
} from '../../data/competencesCECRL'
import { calculerNiveauSuggere } from '../../data/niveauCalcul'

// Couleurs pour les niveaux
const NIVEAU_COLORS: Record<string, string> = {
  'A1': 'bg-blue-100 text-blue-800 border-blue-200',
  'A2': 'bg-green-100 text-green-800 border-green-200',
  'B1': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'B2': 'bg-orange-100 text-orange-800 border-orange-200',
  'C1': 'bg-purple-100 text-purple-800 border-purple-200',
  'C2': 'bg-red-100 text-red-800 border-red-200'
}

// Couleurs pour les domaines
const DOMAINE_COLORS: Record<string, string> = {
  'COMPRENDRE': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'PARLER': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'ECRIRE': 'bg-amber-50 text-amber-700 border-amber-200'
}

// Clés de traduction pour les libellés de niveau et de domaine (données provenant de competencesCECRL.ts)
const NIVEAU_LABEL_KEYS: Record<string, string> = {
  'A1': 'assessment.levelA1',
  'A2': 'assessment.levelA2',
  'B1': 'assessment.levelB1',
  'B2': 'assessment.levelB2',
  'C1': 'assessment.levelC1',
  'C2': 'assessment.levelC2'
}

const DOMAINE_LABEL_KEYS: Record<string, string> = {
  'COMPRENDRE': 'assessment.domainUnderstanding',
  'PARLER': 'assessment.domainSpeaking',
  'ECRIRE': 'assessment.domainWriting'
}

export default function InitialAssessmentStep({
  formData,
  updateFormData,
  onNext,
  onBack
}: StepProps) {
  const { t } = usePublicTranslation()

  const OPTIONS = [
    { value: 'oui', label: t('assessment.answerYes') },
    { value: 'un_peu', label: t('assessment.answerSomewhat') },
    { value: 'non', label: t('assessment.answerNo') }
  ]

  const [reponseInitiale, setReponseInitiale] = useState<'oui' | 'un_peu' | 'non' | null>(
    formData.competences?.[PREMIERE_QUESTION_A1.id] || null
  )
  const [isProcessingOui, setIsProcessingOui] = useState(false)
  const [reponses, setReponses] = useState<Record<string, 'oui' | 'un_peu' | 'non'>>(
    formData.competences || {}
  )

  const handleReponseInitiale = (valeur: string) => {
    const reponse = valeur as 'oui' | 'un_peu' | 'non'
    setReponseInitiale(reponse)

    const nouvellesReponses = {
      ...reponses,
      [PREMIERE_QUESTION_A1.id]: reponse
    }

    setReponses(nouvellesReponses)
    updateFormData('competences', nouvellesReponses)

    if (reponse === 'oui' && !isProcessingOui) {
      setIsProcessingOui(true)
      updateFormData('niveau_suggere', 'A1')

      setTimeout(() => {
        onNext()
      }, 500)
    }
  }

  const handleReponseChange = (questionId: string, valeur: string) => {
    const nouvellesReponses = {
      ...reponses,
      [questionId]: valeur as 'oui' | 'un_peu' | 'non'
    }

    setReponses(nouvellesReponses)
    updateFormData('competences', nouvellesReponses)
  }

  const handleSubmit = () => {
    const niveauSuggere = calculerNiveauSuggere(reponses)
    updateFormData('niveau_suggere', niveauSuggere)
    onNext()
  }

  if (isProcessingOui) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('assessment.processingTitle')}</h3>
          <p className="text-gray-600">
            {t('assessment.processingAnsweredYesLead')} <strong>{t('assessment.processingAnsweredYesQuoted')}</strong> {t('assessment.processingAnsweredYesTrail')}
          </p>
          <p className="text-gray-600 mt-2">
            {t('assessment.autoClassifiedLead')} <strong>A1</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {t('assessment.redirecting')}
          </p>
        </div>
      </div>
    )
  }

  // Récupérer toutes les sous-questions (sauf la première A1)
  const toutesSousQuestions = getAllQuestions()

  return (
    <div className="space-y-6">
      {/* Barre de navigation fixe en haut */}
      <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200 shadow-sm rounded-lg -mx-6 -mt-6 mb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
          >
            {t('assessment.backButton')}
          </button>

          <div className="text-xs text-gray-600">
            {t('assessment.questionsAnsweredCount')
              .replace('{n}', String(Object.keys(reponses).length))
              .replace('{total}', String(toutesSousQuestions.length + 1))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reponseInitiale}
            className={`px-3 py-1 rounded-lg font-medium text-xs ${
              reponseInitiale
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('assessment.validateButton')}
          </button>
        </div>
      </div>

      {/* Première question critique */}
      <div className="bg-white border-2 border-blue-100 rounded-xl p-4 shadow-sm">
        <div className="mb-4">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-1">
            {t('assessment.keyQuestionBadge')}
          </div>
          <h3 className="text-md font-semibold text-gray-800">
            {t('assessment.firstQuestionTitle')}
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            <strong>{t(`assessment.question_${PREMIERE_QUESTION_A1.id}`)}</strong>
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-4 justify-center">
              {OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name={PREMIERE_QUESTION_A1.id}
                    value={option.value}
                    checked={reponses[PREMIERE_QUESTION_A1.id] === option.value}
                    onChange={() => handleReponseInitiale(option.value)}
                    className="w-3 h-3 text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grille complète (si réponse "un_peu" ou "non") */}
      {(reponseInitiale === 'un_peu' || reponseInitiale === 'non') && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {t('assessment.gridTitle')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('assessment.gridSubtitle')}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-bold text-blue-800 mb-1 text-sm">{t('assessment.instructionsTitle')}</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>{t('assessment.answerYes')}</strong> : {t('assessment.instructionYesText')}</li>
              <li>• <strong>{t('assessment.answerSomewhat')}</strong> : {t('assessment.instructionSomewhatText')}</li>
              <li>• <strong>{t('assessment.answerNo')}</strong> : {t('assessment.instructionNoText')}</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <strong>{t('assessment.instructionsNoteLead')}</strong> {t('assessment.instructionsNoteText')}
            </p>
          </div>

          {/* Affichage des sous-questions */}
          {toutesSousQuestions.length > 0 ? (
            <div className="space-y-4">
              {toutesSousQuestions.map((sousQuestion, index) => (
                <div
                  key={sousQuestion.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${NIVEAU_COLORS[sousQuestion.niveau] || 'bg-gray-100'}`}>
                          {sousQuestion.niveau} - {NIVEAU_LABEL_KEYS[sousQuestion.niveau] ? t(NIVEAU_LABEL_KEYS[sousQuestion.niveau]) : sousQuestion.libelleNiveau}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${DOMAINE_COLORS[sousQuestion.domaine] || 'bg-gray-100'}`}>
                          {DOMAINE_LABEL_KEYS[sousQuestion.domaine] ? t(DOMAINE_LABEL_KEYS[sousQuestion.domaine]) : sousQuestion.domaine}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('assessment.competenceLabel').replace('{n}', String(sousQuestion.competenceNumero))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {index + 1}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded p-3 mb-3">
                    <p className="text-gray-800 text-sm">
                      {t(`assessment.question_${sousQuestion.id}`)}
                    </p>
                  </div>

                  <div className="max-w-md">
                    <div className="flex gap-3">
                      {OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name={sousQuestion.id}
                            value={option.value}
                            checked={reponses[sousQuestion.id] === option.value}
                            onChange={() => handleReponseChange(sousQuestion.id, option.value)}
                            className="w-3 h-3 text-blue-600"
                          />
                          <span className="text-xs">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                {t('assessment.noQuestionsFound')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t('assessment.noQuestionsFoundHint')}
              </p>
            </div>
          )}

          {/* Bouton de validation en bas, identique à celui de la barre du haut */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!reponseInitiale}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                reponseInitiale
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('assessment.validateButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
