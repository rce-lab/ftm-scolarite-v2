// src/lib/i18n/publicTranslations.ts
// Dictionnaire fr/en pour le formulaire public d'inscription — système indépendant
// de src/lib/i18n/translations.ts (fr/mg, réservé aux écrans internes).
// Pour l'instant, seule la section "personalInfo" (PersonalInfoStep) est traduite.
// Les autres étapes (Disponibilités, Motivation, Évaluation/CECRL, Contact, confirmation)
// viendront dans de prochaines sessions.

export interface PublicTranslationEntry {
  fr: string
  en: string
}

export const publicTranslations = {
  personalInfo: {
    title: { fr: 'Informations personnelles', en: 'Personal information' },
    subtitle: { fr: 'Veuillez remplir tous les champs obligatoires (*)', en: 'Please fill in all required fields (*)' },

    nameLabel: { fr: 'Nom *', en: 'Last name *' },
    namePlaceholder: { fr: 'Dupont', en: 'Smith' },
    nameRequiredError: { fr: 'Le nom est requis', en: 'Last name is required' },
    nameInvalidError: { fr: "Nom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d'union", en: 'Invalid last name. Use only letters, accents, apostrophes and hyphens' },

    firstNameLabel: { fr: 'Prénom *', en: 'First name *' },
    firstNamePlaceholder: { fr: 'Jean', en: 'John' },
    firstNameRequiredError: { fr: 'Le prénom est requis', en: 'First name is required' },
    firstNameInvalidError: { fr: "Prénom invalide. Utilisez seulement des lettres, accents, apostrophes et traits d'union", en: 'Invalid first name. Use only letters, accents, apostrophes and hyphens' },

    ageLabel: { fr: 'Âge *', en: 'Age *' },
    agePlaceholder: { fr: 'Entre 6 et 80 ans', en: 'Between 6 and 80 years old' },
    ageRequiredError: { fr: "L'âge est requis (6-80 ans)", en: 'Age is required (6-80 years old)' },
    ageInvalidError: { fr: 'Âge invalide (doit être entre 6 et 80 ans)', en: 'Invalid age (must be between 6 and 80 years old)' },

    countryLabel: { fr: 'Pays de résidence *', en: 'Country of residence *' },
    countrySelectPlaceholder: { fr: '— Sélectionnez un pays —', en: '— Select a country —' },
    countryRequiredError: { fr: 'Pays de résidence est requis', en: 'Country of residence is required' },

    cityLabel: { fr: 'Ville de résidence *', en: 'City of residence *' },
    cityPlaceholder: { fr: 'Paris', en: 'London' },
    cityRequiredError: { fr: 'Ville de résidence est requis', en: 'City of residence is required' },

    legalGuardianLabel: { fr: 'Responsable légal', en: 'Legal guardian' },
    legalGuardianPlaceholder: { fr: 'Pour les mineurs uniquement', en: 'For minors only' },
    legalGuardianHint: { fr: 'À remplir uniquement pour les mineurs', en: 'To be filled in for minors only' },

    emailLabel: { fr: 'Email *', en: 'Email *' },
    emailPlaceholder: { fr: 'jean.dupont@exemple.com', en: 'john.smith@example.com' },
    emailRequiredError: { fr: "L'email est requis", en: 'Email is required' },
    emailInvalidError: { fr: 'Format email invalide (ex: nom@domaine.com)', en: 'Invalid email format (e.g. name@domain.com)' },

    addressLabel: { fr: 'Adresse postale', en: 'Postal address' },
    addressPlaceholder: { fr: "123 Rue de l'Exemple, 75000 Paris", en: '123 Example Street, London SW1A 1AA' },

    phoneLabel: { fr: 'Téléphone *', en: 'Phone *' },
    countryCodePlaceholder: { fr: '+33', en: '+33' },
    phonePlaceholder: { fr: '1 23 45 67 89', en: '20 1234 5678' },
    phoneRequiredError: { fr: 'Le téléphone est requis', en: 'Phone number is required' },
    phoneTooShortError: { fr: 'Numéro trop court (minimum 6 chiffres)', en: 'Number too short (minimum 6 digits)' },
    countryCodeHint: { fr: 'Indicatif pré-rempli selon le pays de résidence, modifiable si besoin', en: 'Country code pre-filled based on country of residence, editable if needed' },

    backButton: { fr: "← Retour à l'accueil", en: '← Back to home' },
    nextButton: { fr: 'Suivant → Disponibilités', en: 'Next → Availability' }
  }
} as const
