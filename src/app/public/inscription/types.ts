// src/app/public/inscription/types.ts
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

export interface StepProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: any) => void
  onNext: () => void
  onBack: () => void
  config?: any
}