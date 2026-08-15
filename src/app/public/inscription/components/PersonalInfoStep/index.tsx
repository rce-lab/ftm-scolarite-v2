// src/app/public/inscription/components/PersonalInfoStep/index.tsx
'use client'

import { StepProps, FormData } from '../../types'
import { useState } from 'react'
import { PAYS } from '../../data/pays'

export default function PersonalInfoStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack 
}: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation des noms
  const validateName = (name: string, field: 'nom' | 'prenom'): string => {
    if (!name.trim()) {
      return field === 'prenom' ? 'Le prénom est requis' : 'Le nom est requis'
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\-\'\s]{2,50}$/
    if (!nameRegex.test(name.trim())) {
      return field === 'prenom' 
        ? 'Prénom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d\'union'
        : 'Nom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d\'union'
    }
    return ''
  }

  // Validation email
  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'L\'email est requis'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return 'Format email invalide (ex: nom@domaine.com)'
    }
    return ''
  }

  // Validation téléphone (numéro local, sans indicatif)
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Le téléphone est requis'
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 6) {
      return 'Numéro trop court (minimum 6 chiffres)'
    }
    return ''
  }

  // Validation âge
  const validateAge = (age: string): string => {
    if (!age.trim()) return 'L\'âge est requis (6-80 ans)'
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 80) {
      return 'Âge invalide (doit être entre 6 et 80 ans)'
    }
    return ''
  }

  // Validation champ requis
  const validateRequired = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} est requis`
    return ''
  }

  // Formatage téléphone (numéro local uniquement, sans indicatif)
  const formatPhoneNumber = (value: string): string => {
    return value.replace(/[^\d\s\-]/g, '')
  }

  // Gestionnaire de changement
  const handleNameChange = (field: 'nom' | 'prenom', value: string) => {
    const cleaned = value.replace(/[^a-zA-ZÀ-ÿ\-\'\s]/g, '')
    const cased = field === 'nom' ? cleaned.toUpperCase() : cleaned.toLowerCase()
    updateFormData(field, cased)

    const error = validateName(cased, field)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  const handleEmailChange = (value: string) => {
    updateFormData('email_contact', value)
    
    const error = validateEmail(value)
    setErrors(prev => ({
      ...prev,
      email_contact: error
    }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    updateFormData('telephone', formatted)
    
    const error = validatePhone(formatted)
    setErrors(prev => ({
      ...prev,
      telephone: error
    }))
  }

  const handleAgeChange = (value: string) => {
    updateFormData('age', value)
    
    const error = validateAge(value)
    setErrors(prev => ({
      ...prev,
      age: error
    }))
  }

  const handleGeneralChange = (field: keyof FormData, value: string) => {
    const processed = (field === 'ville_residence' || field === 'adresse_postale')
      ? value.toLowerCase()
      : value
    updateFormData(field, processed)

    if (field === 'pays_residence') {
      const pays = PAYS.find(p => p.nom === processed)
      updateFormData('indicatif_pays', pays?.indicatif || '')
    }

    if (field === 'pays_residence' || field === 'ville_residence') {
      const error = validateRequired(processed, field === 'pays_residence' ? 'Pays de résidence' : 'Ville de résidence')
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }
  }

  const handleIndicatifChange = (value: string) => {
    updateFormData('indicatif_pays', value)
  }

  // Validation complète
  const validateForm = () => {
    const newErrors = {
      nom: validateName(formData.nom, 'nom'),
      prenom: validateName(formData.prenom, 'prenom'),
      age: validateAge(formData.age),
      pays_residence: validateRequired(formData.pays_residence, 'Pays de résidence'),
      ville_residence: validateRequired(formData.ville_residence, 'Ville de résidence'),
      email_contact: validateEmail(formData.email_contact),
      telephone: validatePhone(formData.telephone)
    }
    
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onNext()
    } else {
      const firstErrorField = Object.keys(errors).find(key => errors[key])
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Vérification si le formulaire est valide
  const isFormValid = () => {
    return formData.nom.trim() !== '' &&
           formData.prenom.trim() !== '' &&
           formData.age.trim() !== '' &&
           formData.pays_residence.trim() !== '' &&
           formData.ville_residence.trim() !== '' &&
           formData.email_contact.trim() !== '' &&
           formData.telephone.trim() !== '' &&
           errors.nom === '' &&
           errors.prenom === '' &&
           errors.age === '' &&
           errors.pays_residence === '' &&
           errors.ville_residence === '' &&
           errors.email_contact === '' &&
           errors.telephone === ''
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Informations personnelles</h2>
      <p className="text-gray-600 text-sm">Veuillez remplir tous les champs obligatoires (*)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Colonne gauche */}
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">
              Nom *
            </label>
            <input
              name="nom"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.nom}
              onChange={(e) => handleNameChange('nom', e.target.value)}
              required
              placeholder="Dupont"
            />
            {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Prénom *
            </label>
            <input
              name="prenom"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.prenom ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.prenom}
              onChange={(e) => handleNameChange('prenom', e.target.value)}
              required
              placeholder="Jean"
            />
            {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Âge *
            </label>
            <input
              name="age"
              type="number"
              className={`w-full p-2 border rounded text-sm ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.age}
              onChange={(e) => handleAgeChange(e.target.value)}
              min="6"
              max="80"
              required
              placeholder="Entre 6 et 80 ans"
            />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Pays de résidence *
            </label>
            <select
              name="pays_residence"
              className={`w-full p-2 border rounded text-sm ${
                errors.pays_residence ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.pays_residence}
              onChange={(e) => handleGeneralChange('pays_residence', e.target.value)}
              required
            >
              <option value="">— Sélectionnez un pays —</option>
              {PAYS.map((pays) => (
                <option key={pays.nom} value={pays.nom}>{pays.nom}</option>
              ))}
            </select>
            {errors.pays_residence && <p className="text-xs text-red-500 mt-1">{errors.pays_residence}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Ville de résidence *
            </label>
            <input
              name="ville_residence"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.ville_residence ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.ville_residence}
              onChange={(e) => handleGeneralChange('ville_residence', e.target.value)}
              required
              placeholder="Paris"
            />
            {errors.ville_residence && <p className="text-xs text-red-500 mt-1">{errors.ville_residence}</p>}
          </div>
        </div>
        
        {/* Colonne droite */}
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">
              Responsable légal
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              value={formData.responsable_legal}
              onChange={(e) => updateFormData('responsable_legal', e.target.value)}
              placeholder="Pour les mineurs uniquement"
            />
            <p className="text-xs text-gray-500 mt-1">À remplir uniquement pour les mineurs</p>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Email *
            </label>
            <input
              name="email_contact"
              type="email"
              className={`w-full p-2 border rounded text-sm ${
                errors.email_contact ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email_contact}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              placeholder="jean.dupont@exemple.com"
            />
            {errors.email_contact && <p className="text-xs text-red-500 mt-1">{errors.email_contact}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Adresse postale
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              value={formData.adresse_postale}
              onChange={(e) => handleGeneralChange('adresse_postale', e.target.value)}
              rows={2}
              placeholder="123 Rue de l'Exemple, 75000 Paris"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">
              Téléphone *
            </label>
            <div className="flex gap-2">
              <input
                name="indicatif_pays"
                type="text"
                value={formData.indicatif_pays}
                onChange={(e) => handleIndicatifChange(e.target.value)}
                className="w-20 p-2 border border-gray-300 rounded text-sm"
                placeholder="+33"
              />
              <input
                name="telephone"
                type="tel"
                className={`flex-1 p-2 border rounded text-sm ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.telephone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                placeholder="1 23 45 67 89"
              />
            </div>
            {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Indicatif pré-rempli selon le pays de résidence, modifiable si besoin
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          ← Retour à l'accueil
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`px-4 py-2 rounded text-sm ${
            isFormValid() 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Suivant → Disponibilités
        </button>
      </div>
    </div>
  );
}