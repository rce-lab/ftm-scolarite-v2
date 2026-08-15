// src/app/public/inscription/hooks/useInscriptionForm.ts
'use client'

import { useState, useCallback } from 'react'

export interface FormData {
  // Informations personnelles
  nom: string
  prenom: string
  age: string
  pays_residence: string
  ville_residence: string
  responsable_legal: string
  email_contact: string
  adresse_postale: string
  telephone: string
  indicatif_pays: string
  photo_url: string

  // Disponibilités
  jours_preference: string[]
  horaire_apres_midi: boolean
  horaire_soir: boolean
  horaire_autre: boolean
  horaire_autre_detail: string
  
  // Motivation
  raison_maternelle: boolean
  raison_competences: boolean
  raison_plaisir: boolean
  raison_autre: boolean
  raison_autre_detail: string
  attentes_formation: string
  
  // Comment avez-vous connu
  connaitre_connaissances: boolean
  connaitre_association: boolean
  connaitre_ancien_eleve: boolean
  connaitre_recommandation: boolean
  connaitre_autre: boolean
  connaitre_autre_detail: string
  
  // Remarques
  remarques: string
  
  // Évaluation
  niveau_suggere: string
  competences: Record<string, 'oui' | 'un_peu' | 'non'>
}

export function useInscriptionForm() {
  const [formData, setFormData] = useState<FormData>({
    // Informations personnelles
    nom: '',
    prenom: '',
    age: '',
    pays_residence: '',
    ville_residence: '',
    responsable_legal: '',
    email_contact: '',
    adresse_postale: '',
    telephone: '',
    indicatif_pays: '',
    photo_url: '',

    // Disponibilités
    jours_preference: [],
    horaire_apres_midi: false,
    horaire_soir: false,
    horaire_autre: false,
    horaire_autre_detail: '',
    
    // Motivation
    raison_maternelle: false,
    raison_competences: false,
    raison_plaisir: false,
    raison_autre: false,
    raison_autre_detail: '',
    attentes_formation: '',
    
    // Comment avez-vous connu
    connaitre_connaissances: false,
    connaitre_association: false,
    connaitre_ancien_eleve: false,
    connaitre_recommandation: false,
    connaitre_autre: false,
    connaitre_autre_detail: '',
    
    // Remarques
    remarques: '',
    
    // Évaluation
    niveau_suggere: 'A1',
    competences: {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fonctions de validation
  const validateEmail = (email: string): string => {
    if (!email) return 'Email requis'
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return 'Format email invalide (ex: nom@domaine.com)'
    }
    
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return 'Format email invalide'
    }
    
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Téléphone requis'
    
    const phoneRegex = /^\+\d{1,4}[\s\-]*\(?\d{1,}\)?[\s\-]*\d{1,}[\s\-]*\d{1,}[\s\-]*\d{1,}[\s\-]*\d{0,}$/
    
    if (!phoneRegex.test(phone.trim())) {
      return 'Format invalide. Utilisez le format international: +code pays numéro (ex: +33 1 23 45 67 89)'
    }
    
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 9) {
      return 'Numéro trop court. Minimum 8 chiffres après le code pays'
    }
    
    return ''
  }

  const validateName = (name: string, field: 'nom' | 'prenom'): string => {
    if (!name.trim()) {
      return field === 'prenom' ? 'Prénom requis' : 'Nom requis'
    }
    
    const nameRegex = /^[a-zA-ZÀ-ÿ\-\'\s]{2,50}$/
    
    if (!nameRegex.test(name.trim())) {
      return field === 'prenom' 
        ? 'Prénom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d\'union'
        : 'Nom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d\'union'
    }
    
    return ''
  }

  const validateAge = (age: string): string => {
    if (!age) return 'L\'âge est requis (6-80 ans)'
    
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 80) {
      return 'Âge invalide (doit être entre 6 et 80 ans)'
    }
    
    return ''
  }

  const validateRequiredField = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} est requis`
    return ''
  }

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validation en temps réel
    if (errors[field as string]) {
      let errorMessage = ''
      
      switch (field) {
        case 'email_contact':
          if (typeof value === 'string') errorMessage = validateEmail(value)
          break
        case 'telephone':
          if (typeof value === 'string') errorMessage = validatePhone(value)
          break
        case 'nom':
          if (typeof value === 'string') errorMessage = validateName(value, 'nom')
          break
        case 'prenom':
          if (typeof value === 'string') errorMessage = validateName(value, 'prenom')
          break
        case 'age':
          if (typeof value === 'string') errorMessage = validateAge(value)
          break
        case 'pays_residence':
        case 'ville_residence':
          if (typeof value === 'string') errorMessage = validateRequiredField(value, field.replace('_', ' '))
          break
      }
      
      if (errorMessage) {
        setErrors(prev => ({
          ...prev,
          [field]: errorMessage
        }))
      } else {
        const newErrors = { ...errors }
        delete newErrors[field as string]
        setErrors(newErrors)
      }
    }
  }, [errors])

  // Fonction pour gérer les jours de préférence (max 3)
  const updateJoursPreference = useCallback((jour: string) => {
    setFormData(prev => {
      const currentJours = [...prev.jours_preference]
      
      if (currentJours.includes(jour)) {
        // Retirer le jour
        return {
          ...prev,
          jours_preference: currentJours.filter(j => j !== jour)
        }
      } else {
        // Ajouter le jour si moins de 3
        if (currentJours.length < 3) {
          return {
            ...prev,
            jours_preference: [...currentJours, jour]
          }
        }
        return prev
      }
    })
  }, [])

  // Validation de l'étape 1
  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    newErrors.nom = validateName(formData.nom, 'nom')
    newErrors.prenom = validateName(formData.prenom, 'prenom')
    newErrors.age = validateAge(formData.age)
    newErrors.pays_residence = validateRequiredField(formData.pays_residence, 'Pays de résidence')
    newErrors.ville_residence = validateRequiredField(formData.ville_residence, 'Ville de résidence')
    newErrors.email_contact = validateEmail(formData.email_contact)
    newErrors.telephone = validatePhone(formData.telephone)

    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== '')
  }, [formData])

  // Validation de l'étape 2 (disponibilités)
  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (formData.jours_preference.length === 0) {
      newErrors.jours_preference = 'Veuillez sélectionner au moins un jour de préférence'
    }
    
    if (!formData.horaire_apres_midi && !formData.horaire_soir && !formData.horaire_autre) {
      newErrors.horaire = 'Veuillez sélectionner au moins un horaire souhaité'
    }
    
    if (formData.horaire_autre && !formData.horaire_autre_detail.trim()) {
      newErrors.horaire_autre_detail = 'Veuillez préciser l\'horaire'
    }
    
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== '')
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData({
      nom: '',
      prenom: '',
      age: '',
      pays_residence: '',
      ville_residence: '',
      responsable_legal: '',
      email_contact: '',
      adresse_postale: '',
      telephone: '',
      indicatif_pays: '',
      photo_url: '',
      jours_preference: [],
      horaire_apres_midi: false,
      horaire_soir: false,
      horaire_autre: false,
      horaire_autre_detail: '',
      raison_maternelle: false,
      raison_competences: false,
      raison_plaisir: false,
      raison_autre: false,
      raison_autre_detail: '',
      attentes_formation: '',
      connaitre_connaissances: false,
      connaitre_association: false,
      connaitre_ancien_eleve: false,
      connaitre_recommandation: false,
      connaitre_autre: false,
      connaitre_autre_detail: '',
      remarques: '',
      niveau_suggere: 'A1',
      competences: {}
    })
    setErrors({})
  }, [])

  // Fonction pour formater le téléphone
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/[^\d+]/g, '')
    
    if (cleaned.match(/^\d/)) {
      return '+' + cleaned
    }
    
    const match = cleaned.match(/^(\+\d{1,3})(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
      const [, code, part1, part2, part3] = match
      let formatted = code
      if (part1) formatted += ' ' + part1
      if (part2) formatted += ' ' + part2
      if (part3) formatted += ' ' + part3
      return formatted
    }
    
    return cleaned
  }

  return {
    formData,
    errors,
    updateFormData,
    updateJoursPreference,
    validateStep1,
    validateStep2,
    resetForm,
    formatPhoneNumber
  }
}