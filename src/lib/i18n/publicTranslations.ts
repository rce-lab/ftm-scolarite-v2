// src/lib/i18n/publicTranslations.ts
// Dictionnaire fr/en pour le formulaire public d'inscription — système indépendant
// de src/lib/i18n/translations.ts (fr/mg, réservé aux écrans internes).
// Sections traduites : personalInfo, availability, motivation, homepage.
// Restent à traduire dans de prochaines sessions : Évaluation/grille CEFR, Contact/récap,
// page de confirmation.

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
  },

  availability: {
    title: { fr: 'Disponibilités et préférences', en: 'Availability and preferences' },
    daysQuestion: { fr: '10. Veuillez entrer vos jours de disponibilité par ordre de préférence (maximum 3)', en: '10. Please enter your available days in order of preference (maximum 3)' },
    anyDayOption: { fr: "N'importe quel jour me convient", en: 'Any day works for me' },
    monday: { fr: 'Lundi', en: 'Monday' },
    tuesday: { fr: 'Mardi', en: 'Tuesday' },
    wednesday: { fr: 'Mercredi', en: 'Wednesday' },
    thursday: { fr: 'Jeudi', en: 'Thursday' },
    friday: { fr: 'Vendredi', en: 'Friday' },
    saturday: { fr: 'Samedi', en: 'Saturday' },
    choiceNumber: { fr: 'Choix n°{position}', en: 'Choice #{position}' },
    daysRequiredError: { fr: 'Veuillez sélectionner au moins un jour de préférence', en: 'Please select at least one preferred day' },
    timeRequiredError: { fr: 'Veuillez sélectionner au moins un horaire', en: 'Please select at least one time slot' },
    otherTimeRequiredError: { fr: "Veuillez préciser l'horaire autre", en: 'Please specify the other time slot' },
    anyDaySummary: { fr: "Vous avez indiqué que n'importe quel jour vous convient.", en: 'You have indicated that any day works for you.' },
    selectedCount: { fr: 'Sélectionnés : {n}/3 jours', en: 'Selected: {n}/3 days' },
    selectionHint: { fr: "Cliquez sur les jours pour les sélectionner/désélectionner. L'ordre de sélection détermine votre préférence.", en: 'Click on the days to select/deselect them. The selection order determines your preference.' },
    timeQuestion: { fr: '11. Horaire souhaité', en: '11. Preferred time' },
    afternoonOption: { fr: 'Après-midi', en: 'Afternoon' },
    eveningOption: { fr: 'Soir', en: 'Evening' },
    otherTimeOption: { fr: 'Autre dans la mesure du possible', en: 'Other, if possible' },
    otherTimeLabel: { fr: "Précisez l'horaire autre :", en: 'Please specify the other time slot:' },
    otherTimePlaceholder: { fr: 'Ex: Week-end, matinée...', en: 'E.g.: Weekend, morning...' },
    backButton: { fr: '← Retour (Informations)', en: '← Back (Personal info)' },
    nextButton: { fr: 'Suivant → Motivation', en: 'Next → Motivation' }
  },

  motivation: {
    title: { fr: 'Motivation et attentes', en: 'Motivation and expectations' },
    reasonsQuestion: { fr: '12. Pour quelles raisons avez-vous choisi de suivre/reprendre cette formation ?', en: '12. Why did you choose to start/resume this course?' },
    reasonMaternal: { fr: "C'est ma langue maternelle", en: 'It is my native language' },
    reasonSkills: { fr: 'Développement de mes compétences', en: 'Developing my skills' },
    reasonEnjoyment: { fr: 'Pour le plaisir', en: 'For enjoyment' },
    otherOption: { fr: 'Autres', en: 'Other' },
    otherReasonLabel: { fr: 'Précisez la raison autre :', en: 'Please specify the other reason:' },
    otherReasonPlaceholder: { fr: 'Ex: Pour le travail, études...', en: 'E.g.: For work, studies...' },
    expectationsQuestion: { fr: '13. Quelles sont vos attentes par rapport à cette formation ?', en: '13. What are your expectations for this course?' },
    expectationsPlaceholder: { fr: 'Décrivez vos attentes, objectifs, ce que vous espérez apprendre...', en: 'Describe your expectations, goals, what you hope to learn...' },
    howKnownQuestion: { fr: "14. Comment avez-vous appris l'existence de cette formation ?", en: '14. How did you hear about this course?' },
    knownAcquaintances: { fr: 'Par le biais de mes connaissances', en: 'Through acquaintances' },
    knownAssociation: { fr: 'Via une association', en: 'Through an association' },
    knownFormerStudent: { fr: "Je suis un(e) ancien(ne) élève", en: 'I am a former student' },
    knownRecommendation: { fr: 'Par recommandation', en: 'By recommendation' },
    otherKnownLabel: { fr: 'Précisez :', en: 'Please specify:' },
    otherKnownPlaceholder: { fr: 'Ex: Internet, réseaux sociaux, événement...', en: 'E.g.: Internet, social media, event...' },
    remarksQuestion: { fr: '15. Remarques ou suggestions à nous adresser :', en: '15. Any comments or suggestions for us:' },
    remarksPlaceholder: { fr: 'Vos commentaires, suggestions, questions...', en: 'Your comments, suggestions, questions...' },
    backButton: { fr: '← Retour (Disponibilités)', en: '← Back (Availability)' },
    nextButton: { fr: 'Suivant → Évaluation', en: 'Next → Assessment' }
  },

  homepage: {
    schoolYear: { fr: 'Année scolaire {annee}', en: 'School year {annee}' },
    ctaButton: { fr: "S'inscrire maintenant", en: 'Register now' },
    logoAlt: { fr: 'Logo FTM', en: 'FTM logo' }
  }
} as const
