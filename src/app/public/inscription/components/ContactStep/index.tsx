// src/app/public/inscription/components/ContactStep/index.tsx
'use client'

import { StepProps } from '../../types'

const JOURS_LABELS: Record<string, string> = {
  'lundi': 'Lundi',
  'mardi': 'Mardi',
  'mercredi': 'Mercredi',
  'jeudi': 'Jeudi',
  'vendredi': 'Vendredi',
  'samedi': 'Samedi'
}

export default function ContactStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack, 
  config 
}: StepProps) {
  const formatJoursPreference = () => {
    if (formData.jours_preference.length === 0) return 'Aucun jour sélectionné'
    
    return formData.jours_preference.map((jour, index) => {
      const label = JOURS_LABELS[jour] || jour
      return `${index + 1}. ${label}`
    }).join(', ')
  }

  const formatHoraires = () => {
    const horaires = []
    if (formData.horaire_apres_midi) horaires.push('Après-midi')
    if (formData.horaire_soir) horaires.push('Soir')
    if (formData.horaire_autre && formData.horaire_autre_detail) {
      horaires.push(`Autre: ${formData.horaire_autre_detail}`)
    }
    return horaires.length > 0 ? horaires.join(', ') : 'Aucun horaire sélectionné'
  }

  const formatRaisons = () => {
    const raisons = []
    if (formData.raison_maternelle) raisons.push('Langue maternelle')
    if (formData.raison_competences) raisons.push('Développement compétences')
    if (formData.raison_plaisir) raisons.push('Pour le plaisir')
    if (formData.raison_autre && formData.raison_autre_detail) {
      raisons.push(`Autre: ${formData.raison_autre_detail}`)
    }
    return raisons.length > 0 ? raisons.join(', ') : 'Aucune raison'
  }

  const formatConnaitre = () => {
    const moyens = []
    if (formData.connaitre_connaissances) moyens.push('Connaissances')
    if (formData.connaitre_association) moyens.push('Association')
    if (formData.connaitre_ancien_eleve) moyens.push('Ancien élève')
    if (formData.connaitre_recommandation) moyens.push('Recommandation')
    if (formData.connaitre_autre && formData.connaitre_autre_detail) {
      moyens.push(`Autre: ${formData.connaitre_autre_detail}`)
    }
    return moyens.length > 0 ? moyens.join(', ') : 'Non spécifié'
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Confirmation finale</h2>
      
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="font-bold text-md mb-3">Récapitulatif complet de votre inscription</h3>
        
        <div className="space-y-4">
          {/* Informations personnelles */}
          <div>
            <h4 className="font-bold text-gray-700 mb-2 text-sm">Informations personnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">Nom</p>
                <p className="font-medium text-sm">{formData.nom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Prénom</p>
                <p className="font-medium text-sm">{formData.prenom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Âge</p>
                <p className="font-medium text-sm">{formData.age} ans</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pays de résidence</p>
                <p className="font-medium text-sm">{formData.pays_residence}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ville de résidence</p>
                <p className="font-medium text-sm">{formData.ville_residence}</p>
              </div>
              {formData.responsable_legal && (
                <div>
                  <p className="text-xs text-gray-600">Responsable légal</p>
                  <p className="font-medium text-sm">{formData.responsable_legal}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-medium text-sm">{formData.email_contact}</p>
              </div>
              {formData.adresse_postale && (
                <div>
                  <p className="text-xs text-gray-600">Adresse postale</p>
                  <p className="font-medium text-sm">{formData.adresse_postale}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">Téléphone</p>
                <p className="font-medium text-sm">{formData.indicatif_pays} {formData.telephone}</p>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="pt-3 border-t border-gray-300">
            <h4 className="font-bold text-gray-700 mb-2 text-sm">Disponibilités</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">Jours de préférence</p>
                <p className="font-medium text-sm">{formatJoursPreference()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Horaires souhaités</p>
                <p className="font-medium text-sm">{formatHoraires()}</p>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="pt-3 border-t border-gray-300">
            <h4 className="font-bold text-gray-700 mb-2 text-sm">Motivation et attentes</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Raisons de l'inscription</p>
                <p className="font-medium text-sm">{formatRaisons()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Attentes de formation</p>
                <p className="font-medium text-sm">{formData.attentes_formation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Comment avez-vous connu cette formation</p>
                <p className="font-medium text-sm">{formatConnaitre()}</p>
              </div>
              {formData.remarques && (
                <div>
                  <p className="text-xs text-gray-600">Remarques ou suggestions</p>
                  <p className="font-medium text-sm">{formData.remarques}</p>
                </div>
              )}
            </div>
          </div>

          {/* Évaluation */}
          <div className="pt-3 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">Niveau suggéré (auto)</p>
                <p className="font-medium text-md">{formData.niveau_suggere || 'A1'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Frais d'inscription</p>
                <p className="font-medium text-md">{config?.montant_inscription || 30}€/an</p>
              </div>
              {Object.keys(formData.competences || {}).length > 1 && (
                <div>
                  <p className="text-xs text-gray-600">Questions répondues</p>
                  <p className="font-medium text-md">{Object.keys(formData.competences).length} / 105 questions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Vérifiez bien toutes vos informations.</strong> Une fois confirmé, vous recevrez un code étudiant par email.
          Vous pourrez modifier certaines informations plus tard en contactant l'administration.
        </p>
      </div>

      <div className="flex justify-between pt-3">
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          ← Modifier
        </button>
        
        <button 
          onClick={onNext}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-medium"
        >
          Confirmer et finaliser l'inscription
        </button>
      </div>
    </div>
  );
}