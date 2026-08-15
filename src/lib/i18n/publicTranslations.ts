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
    legalGuardianRequiredError: { fr: 'Le responsable légal est requis pour les candidats mineurs (moins de 18 ans)', en: 'A legal guardian is required for candidates under 18' },

    photoLabel: { fr: 'Photo (optionnelle)', en: 'Photo (optional)' },
    photoHint: { fr: 'Formats image uniquement, 5 Mo maximum', en: 'Image files only, 5 MB maximum' },
    photoInvalidTypeError: { fr: 'Veuillez sélectionner un fichier image', en: 'Please select an image file' },
    photoTooLargeError: { fr: 'Le fichier est trop volumineux (5 Mo maximum)', en: 'File is too large (5 MB maximum)' },
    photoUploadError: { fr: 'Échec de l\'envoi de la photo. Vous pouvez continuer sans photo.', en: 'Photo upload failed. You can continue without a photo.' },
    photoUploading: { fr: 'Envoi en cours...', en: 'Uploading...' },
    photoPreviewAlt: { fr: 'Aperçu de la photo', en: 'Photo preview' },
    removePhotoButton: { fr: 'Retirer la photo', en: 'Remove photo' },

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
  },

  contact: {
    title: { fr: 'Confirmation finale', en: 'Final confirmation' },
    recapTitle: { fr: 'Récapitulatif complet de votre inscription', en: 'Full summary of your registration' },

    nameLabel: { fr: 'Nom', en: 'Last name' },
    firstNameLabel: { fr: 'Prénom', en: 'First name' },
    ageLabel: { fr: 'Âge', en: 'Age' },
    ageYears: { fr: '{age} ans', en: '{age} years old' },
    countryLabel: { fr: 'Pays de résidence', en: 'Country of residence' },
    cityLabel: { fr: 'Ville de résidence', en: 'City of residence' },
    emailLabel: { fr: 'Email', en: 'Email' },
    phoneLabel: { fr: 'Téléphone', en: 'Phone' },

    availabilityTitle: { fr: 'Disponibilités', en: 'Availability' },
    daysLabel: { fr: 'Jours de préférence', en: 'Preferred days' },
    timesLabel: { fr: 'Horaires souhaités', en: 'Preferred times' },
    noDaySelected: { fr: 'Aucun jour sélectionné', en: 'No day selected' },
    noTimeSelected: { fr: 'Aucun horaire sélectionné', en: 'No time slot selected' },
    otherWithDetail: { fr: 'Autre: {detail}', en: 'Other: {detail}' },

    reasonsLabel: { fr: "Raisons de l'inscription", en: 'Reasons for registering' },
    expectationsLabel: { fr: 'Attentes de formation', en: 'Course expectations' },
    howKnownLabel: { fr: 'Comment avez-vous connu cette formation', en: 'How did you hear about this course' },
    remarksLabel: { fr: 'Remarques ou suggestions', en: 'Comments or suggestions' },
    noReasonSelected: { fr: 'Aucune raison', en: 'No reason selected' },
    notSpecified: { fr: 'Non spécifié', en: 'Not specified' },
    maternalLanguageSummary: { fr: 'Langue maternelle', en: 'Native language' },
    skillsSummary: { fr: 'Développement compétences', en: 'Skill development' },
    acquaintancesSummary: { fr: 'Connaissances', en: 'Acquaintances' },
    associationSummary: { fr: 'Association', en: 'Association' },
    formerStudentSummary: { fr: 'Ancien élève', en: 'Former student' },
    recommendationSummary: { fr: 'Recommandation', en: 'Recommendation' },

    suggestedLevelLabel: { fr: 'Niveau suggéré (auto)', en: 'Suggested level (auto)' },
    registrationFeeLabel: { fr: "Frais d'inscription", en: 'Registration fee' },
    perYear: { fr: '{montant}€/an', en: '€{montant}/year' },
    questionsAnsweredLabel: { fr: 'Questions répondues', en: 'Questions answered' },
    questionsCount: { fr: '{n} / 105 questions', en: '{n} / 105 questions' },

    finalNoticeLead: { fr: 'Vérifiez bien toutes vos informations.', en: 'Please double-check all your information.' },
    finalNoticeRest: { fr: 'Une fois confirmé, vous recevrez un code étudiant par email. Vous pourrez modifier certaines informations plus tard en contactant l\'administration.', en: 'Once confirmed, you will receive a student code by email. You will be able to update some information later by contacting the administration.' },

    editButton: { fr: '← Modifier', en: '← Edit' },
    confirmButton: { fr: "Confirmer et finaliser l'inscription", en: 'Confirm and complete registration' }
  },

  confirmation: {
    title: { fr: 'Inscription reçue et enregistrée', en: 'Registration received and saved' },
    subtitle: { fr: 'Votre inscription a été enregistrée avec succès', en: 'Your registration has been successfully saved' },
    studentCodeTitle: { fr: 'Votre code étudiant', en: 'Your student code' },
    keepCodeHint: { fr: 'Conservez ce code pour toute communication', en: 'Keep this code for all future communication' },
    paymentInstructionsTitle: { fr: 'Instructions de paiement', en: 'Payment instructions' },
    paymentIntro: { fr: 'Pour finaliser votre inscription, effectuez le paiement de {montant}€ :', en: 'To complete your registration, please make a payment of €{montant}:' },
    beneficiaryLabel: { fr: 'Bénéficiaire:', en: 'Beneficiary:' },
    ribLabel: { fr: 'RIB/IBAN:', en: 'Bank details (IBAN):' },
    amountLabel: { fr: 'Montant:', en: 'Amount:' },
    referenceLabel: { fr: 'Référence:', en: 'Reference:' },
    paymentConfirmationHint: { fr: 'Votre place sera confirmée après réception du paiement.', en: 'Your place will be confirmed once payment is received.' },
    nextStepsTitle: { fr: 'Prochaines étapes', en: 'Next steps' },
    nextStepPay: { fr: 'Effectuez le paiement de {montant}€', en: 'Make the payment of €{montant}' },
    nextStepEmailConfirmation: { fr: 'Recevez une confirmation par email sous 48h', en: 'Receive an email confirmation within 48 hours' },
    nextStepClassAssignment: { fr: 'Vous serez affecté à une classe selon votre niveau', en: 'You will be assigned to a class based on your level' },
    nextStepZoomLink: { fr: 'Recevez le lien Zoom pour les cours', en: 'Receive the Zoom link for classes' },
    contactLabel: { fr: 'Contact', en: 'Contact' },
    contactQuestionHint: { fr: 'Pour toute question : {email}', en: 'For any questions: {email}' },
    closeTabNotice: { fr: 'Vous pouvez fermer cet onglet.', en: 'You can now close this tab.' },
    loading: { fr: 'Chargement...', en: 'Loading...' }
  }
} as const
