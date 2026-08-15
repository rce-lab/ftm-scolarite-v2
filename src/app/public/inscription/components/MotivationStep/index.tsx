// src/app/public/inscription/components/MotivationStep/index.tsx
'use client'

import { StepProps } from '../../types'

export default function MotivationStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack 
}: StepProps) {
  // Gérer les checkbox raisons
  const handleRaisonChange = (raison: 'maternelle' | 'competences' | 'plaisir' | 'autre', checked: boolean) => {
    if (raison === 'maternelle') {
      updateFormData('raison_maternelle', checked)
    } else if (raison === 'competences') {
      updateFormData('raison_competences', checked)
    } else if (raison === 'plaisir') {
      updateFormData('raison_plaisir', checked)
    } else {
      updateFormData('raison_autre', checked)
    }
  }

  // Gérer les checkbox "comment avez-vous connu"
  const handleConnaitreChange = (type: 'connaissances' | 'association' | 'ancien_eleve' | 'recommandation' | 'autre', checked: boolean) => {
    if (type === 'connaissances') {
      updateFormData('connaitre_connaissances', checked)
    } else if (type === 'association') {
      updateFormData('connaitre_association', checked)
    } else if (type === 'ancien_eleve') {
      updateFormData('connaitre_ancien_eleve', checked)
    } else if (type === 'recommandation') {
      updateFormData('connaitre_recommandation', checked)
    } else {
      updateFormData('connaitre_autre', checked)
    }
  }

  const handleSubmit = () => {
    // Aucune validation requise - passer directement à l'étape suivante
    onNext()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Motivation et attentes</h2>
      
      {/* Raisons de la formation */}
      <div className="space-y-3">
        <label className="block font-medium text-sm">
          12. Pour quelles raisons avez-vous choisi de suivre/reprendre cette formation ?
        </label>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.raison_maternelle}
              onChange={(e) => handleRaisonChange('maternelle', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">C'est ma langue maternelle</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.raison_competences}
              onChange={(e) => handleRaisonChange('competences', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Développement de mes compétences</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.raison_plaisir}
              onChange={(e) => handleRaisonChange('plaisir', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Pour le plaisir</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.raison_autre}
              onChange={(e) => handleRaisonChange('autre', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Autres</span>
            </div>
          </label>
        </div>
        
        {/* Détail autre raison */}
        {formData.raison_autre && (
          <div className="mt-2">
            <label className="block mb-1 text-xs">
              Précisez la raison autre :
            </label>
            <input
              type="text"
              value={formData.raison_autre_detail}
              onChange={(e) => updateFormData('raison_autre_detail', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Ex: Pour le travail, études..."
            />
          </div>
        )}
      </div>

      {/* Attentes de formation */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block mb-2 font-medium text-sm">
          13. Quelles sont vos attentes par rapport à cette formation ?
        </label>
        <textarea
          value={formData.attentes_formation}
          onChange={(e) => updateFormData('attentes_formation', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm min-h-[80px]"
          placeholder="Décrivez vos attentes, objectifs, ce que vous espérez apprendre..."
        />
      </div>

      {/* Comment avez-vous connu */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block mb-2 font-medium text-sm">
          14. Comment avez-vous appris l'existence de cette formation ?
        </label>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.connaitre_connaissances}
              onChange={(e) => handleConnaitreChange('connaissances', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Par le biais de mes connaissances</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.connaitre_association}
              onChange={(e) => handleConnaitreChange('association', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Via une association</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.connaitre_ancien_eleve}
              onChange={(e) => handleConnaitreChange('ancien_eleve', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Je suis un(e) ancien(ne) élève</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.connaitre_recommandation}
              onChange={(e) => handleConnaitreChange('recommandation', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Par recommandation</span>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.connaitre_autre}
              onChange={(e) => handleConnaitreChange('autre', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-sm">Autres</span>
            </div>
          </label>
        </div>
        
        {/* Détail autre connaissance */}
        {formData.connaitre_autre && (
          <div className="mt-2">
            <label className="block mb-1 text-xs">
              Précisez :
            </label>
            <input
              type="text"
              value={formData.connaitre_autre_detail}
              onChange={(e) => updateFormData('connaitre_autre_detail', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Ex: Internet, réseaux sociaux, événement..."
            />
          </div>
        )}
      </div>

      {/* Remarques */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block mb-2 font-medium text-sm">
          15. Remarques ou suggestions à nous adresser :
        </label>
        <textarea
          value={formData.remarques}
          onChange={(e) => updateFormData('remarques', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm min-h-[80px]"
          placeholder="Vos commentaires, suggestions, questions..."
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          ← Retour (Disponibilités)
        </button>
        
        <button 
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Suivant → Évaluation
        </button>
      </div>
    </div>
  );
}