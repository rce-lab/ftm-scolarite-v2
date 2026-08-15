// src/app/public/inscription/components/InitialAssessmentStep/index.tsx
'use client'

import { StepProps } from '../../types'
import { RadioGroup } from '@/components/ui/RadioButton'
import { useState } from 'react'

// Import des données
import { 
  PREMIERE_QUESTION_A1, 
  getAllQuestions,
  STRUCTURE_NIVEAUX,
  getLibelleNiveau
} from '../../data/competencesCECRL'
import { calculerNiveauSuggere } from '../../data/niveauCalcul'

const OPTIONS = [
  { value: 'oui', label: 'OUI' },
  { value: 'un_peu', label: 'UN PEU' },
  { value: 'non', label: 'NON' }
]

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

export default function InitialAssessmentStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack 
}: StepProps) {
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Évaluation en cours</h3>
          <p className="text-gray-600">
            Vous avez répondu <strong>« OUI »</strong> à la première question.
          </p>
          <p className="text-gray-600 mt-2">
            Vous êtes automatiquement classé en niveau <strong>A1</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Redirection automatique...
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
            ← Retour
          </button>
          
          <div className="text-xs text-gray-600">
            {Object.keys(reponses).length} / {toutesSousQuestions.length + 1} questions répondues
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
            Valider et continuer →
          </button>
        </div>
      </div>

      {/* Première question critique */}
      <div className="bg-white border-2 border-blue-100 rounded-xl p-4 shadow-sm">
        <div className="mb-4">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-1">
            QUESTION CLÉ
          </div>
          <h3 className="text-md font-semibold text-gray-800">
            Niveau A1 - Découverte
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            <strong>{PREMIERE_QUESTION_A1.texte}</strong>
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
              Grille complète des compétences CECRL
            </h3>
            <p className="text-gray-600 text-sm">
              Évaluez vos compétences pour chaque affirmation ci-dessous.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-bold text-blue-800 mb-1 text-sm">Instructions :</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>OUI</strong> : Cette affirmation correspond parfaitement à vos capacités</li>
              <li>• <strong>UN PEU</strong> : Cette affirmation correspond partiellement à vos capacités</li>
              <li>• <strong>NON</strong> : Cette affirmation ne correspond pas à vos capacités actuelles</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Note :</strong> Le système calcule automatiquement votre niveau CECRL en fonction de vos réponses.
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
                          {sousQuestion.niveau} - {sousQuestion.libelleNiveau}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${DOMAINE_COLORS[sousQuestion.domaine] || 'bg-gray-100'}`}>
                          {sousQuestion.domaine}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Compétence {sousQuestion.competenceNumero}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 rounded p-3 mb-3">
                    <p className="text-gray-800 text-sm">
                      {sousQuestion.texte}
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
                Aucune sous-question trouvée. Le fichier de données est en cours de préparation.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Pour l'instant, nous allons utiliser des valeurs temporaires pour continuer.
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
              Valider et continuer →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}