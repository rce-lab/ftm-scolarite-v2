// src/app/public/inscription/data/competencesCECRL.ts

export interface SousQuestionCECRL {
  id: string;
  niveau: string;
  libelleNiveau: string;
  questionNumero: number;
  domaine: string;
  competenceNumero: number;
  texte: string;
  reponses: {
    oui: string;
    un_peu: string;
    non: string;
  };
}

// Libellés des niveaux
const LIBELLES_NIVEAUX: Record<string, string> = {
  'A1': 'DÉCOUVERTE',
  'A2': 'INTERMÉDIAIRE',
  'B1': 'SEUIL',
  'B2': 'AVANCÉ',
  'C1': 'AUTONOME',
  'C2': 'MAÎTRISE'
};

// Première question critique A1
export const PREMIERE_QUESTION_A1: SousQuestionCECRL = {
  id: 'A1_16_1',
  niveau: 'A1',
  libelleNiveau: 'DÉCOUVERTE',
  questionNumero: 16,
  domaine: 'COMPRENDRE',
  competenceNumero: 1,
  texte: 'Je n\'ai aucune notion (parlé / écrit) de la langue malagasy.',
  reponses: {
    oui: 'C27',
    un_peu: 'C28',
    non: 'C29'
  }
};

// Toutes les sous-questions CECRL (105 compétences)
export const SOUS_QUESTIONS_CECRL: SousQuestionCECRL[] = [
  // ==================== NIVEAU A1 DÉCOUVERTE ====================
  // Question 16 - COMPRENDRE (6 compétences)
  {
    id: 'A1_16_1',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'Je n\'ai aucune notion (parlé / écrit) de la langue malagasy.',
    reponses: { oui: 'C27', un_peu: 'C28', non: 'C29' }
  },
  {
    id: 'A1_16_2',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'Je peux comprendre des mots familiers et des phrases très simples en malgache.',
    reponses: { oui: 'C30', un_peu: 'C31', non: 'C32' }
  },
  {
    id: 'A1_16_3',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'ECOUTER : Si les gens parlent lentement et distinctement, je peux comprendre des expressions (simples) très courantes au sujet de moi-même, de ma famille.',
    reponses: { oui: 'C33', un_peu: 'C34', non: 'C35' }
  },
  {
    id: 'A1_16_4',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'ECOUTER : Ou de l\'environnement concret et immédiat.',
    reponses: { oui: 'C36', un_peu: 'C37', non: 'C38' }
  },
  {
    id: 'A1_16_5',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : En lisant, je peux comprendre des noms et des mots familiers.',
    reponses: { oui: 'C39', un_peu: 'C40', non: 'C41' }
  },
  {
    id: 'A1_16_6',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 16,
    domaine: 'COMPRENDRE',
    competenceNumero: 6,
    texte: 'LIRE : ainsi que des phrases très simples, par exemple dans des annonces, des affiches ou des catalogues.',
    reponses: { oui: 'C42', un_peu: 'C43', non: 'C44' }
  },

  // Question 17 - PARLER (6 compétences)
  {
    id: 'A1_17_1',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PARTICIPER A L\'ORAL : A condition que l\'interlocuteur est disposé à répéter ou reformuler ses phrases plus lentement et à m\'aider à formuler ce que j\'essaie de dire, je peux communiquer, de façon simple.',
    reponses: { oui: 'C45', un_peu: 'C46', non: 'C47' }
  },
  {
    id: 'A1_17_2',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PARTICIPER A L\'ORAL : Je peux poser des questions simples sur des sujets familiers.',
    reponses: { oui: 'C48', un_peu: 'C49', non: 'C50' }
  },
  {
    id: 'A1_17_3',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'PARTICIPER A L\'ORAL : ou sur ce dont j\'ai immédiatement besoin.',
    reponses: { oui: 'C51', un_peu: 'C52', non: 'C53' }
  },
  {
    id: 'A1_17_4',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'PARTICIPER A L\'ORAL : ainsi que répondre à de telles questions.',
    reponses: { oui: 'C54', un_peu: 'C55', non: 'C56' }
  },
  {
    id: 'A1_17_5',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux utiliser des expressions et des phrases simples pour décrire mon lieu d\'habitation.',
    reponses: { oui: 'C57', un_peu: 'C58', non: 'C59' }
  },
  {
    id: 'A1_17_6',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 17,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'PRENDRE PART A UNE CONVERSATION : Pour décrire les gens que je connais.',
    reponses: { oui: 'C60', un_peu: 'C61', non: 'C62' }
  },

  // Question 18 - ECRIRE (3 compétences)
  {
    id: 'A1_18_1',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 18,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux écrire une courte carte postale simple, par exemple de vacances.',
    reponses: { oui: 'C63', un_peu: 'C64', non: 'C65' }
  },
  {
    id: 'A1_18_2',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 18,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Porter des détails personnels dans un questionnaire.',
    reponses: { oui: 'C66', un_peu: 'C67', non: 'C68' }
  },
  {
    id: 'A1_18_3',
    niveau: 'A1',
    libelleNiveau: 'DÉCOUVERTE',
    questionNumero: 18,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Je peux inscrire par exemple mon nom, ma nationalité et mon adresse sur une fiche d\'hôtel.',
    reponses: { oui: 'C69', un_peu: 'C70', non: 'C71' }
  },

  // ==================== NIVEAU A2 INTERMÉDIAIRE ====================
  // Question 19 - COMPRENDRE (9 compétences)
  {
    id: 'A2_19_1',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'ECOUTER : Je peux comprendre des expressions et un vocabulaire très fréquent, relatifs à ce qui me concerne de très près, par exemple moi-même, ma famille, les achats.',
    reponses: { oui: 'C72', un_peu: 'C73', non: 'C74' }
  },
  {
    id: 'A2_19_2',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'ECOUTER : Je peux comprendre des expressions et un vocabulaire très fréquent, relatifs à ce qui me concerne de très près ou par exemple l\'environnement proche, le travail.',
    reponses: { oui: 'C75', un_peu: 'C76', non: 'C77' }
  },
  {
    id: 'A2_19_3',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'ECOUTER : Je peux saisir l\'essentiel des annonces.',
    reponses: { oui: 'C78', un_peu: 'C79', non: 'C80' }
  },
  {
    id: 'A2_19_4',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'ECOUTER : Je peux saisir l\'essentiel des messages simples et clairs.',
    reponses: { oui: 'C81', un_peu: 'C82', non: 'C83' }
  },
  {
    id: 'A2_19_5',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : Je peux lire des textes courts très simples.',
    reponses: { oui: 'C84', un_peu: 'C85', non: 'C86' }
  },
  {
    id: 'A2_19_6',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 6,
    texte: 'LIRE : Je peux trouver une information particulière prévisible dans des documents courants comme les petites publicités.',
    reponses: { oui: 'C87', un_peu: 'C88', non: 'C89' }
  },
  {
    id: 'A2_19_7',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 7,
    texte: 'LIRE : Je peux trouver une information particulière prévisible dans des documents courants comme les prospectus.',
    reponses: { oui: 'C90', un_peu: 'C91', non: 'C92' }
  },
  {
    id: 'A2_19_8',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 8,
    texte: 'LIRE : Je peux trouver une information particulière prévisible dans des documents courants comme les menus et les horaires.',
    reponses: { oui: 'C93', un_peu: 'C94', non: 'C95' }
  },
  {
    id: 'A2_19_9',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 19,
    domaine: 'COMPRENDRE',
    competenceNumero: 9,
    texte: 'LIRE : Je peux comprendre des lettres personnelles courtes et simples.',
    reponses: { oui: 'C96', un_peu: 'C97', non: 'C98' }
  },

  // Question 20 - PARLER (9 compétences)
  {
    id: 'A2_20_1',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PRENDRE PART A UNE CONVERSATION : Lors de tâches simples et habituelles ne demandant qu\'un échange d\'informations simple et direct, je peux communiquer sur des sujets et des activités familiers.',
    reponses: { oui: 'C99', un_peu: 'C100', non: 'C101' }
  },
  {
    id: 'A2_20_2',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux avoir des échanges très brefs même si, en règle générale, je ne comprends pas assez pour poursuivre une conversation.',
    reponses: { oui: 'C102', un_peu: 'C103', non: 'C104' }
  },
  {
    id: 'A2_20_3',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux utiliser une série de phrases ou d\'expressions pour décrire en termes simples ma famille.',
    reponses: { oui: 'C105', un_peu: 'C106', non: 'C107' }
  },
  {
    id: 'A2_20_4',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux utiliser une série de phrases ou d\'expressions pour décrire en termes simples d\'autres gens.',
    reponses: { oui: 'C108', un_peu: 'C109', non: 'C110' }
  },
  {
    id: 'A2_20_5',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux utiliser une série de phrases ou d\'expressions pour décrire en termes simples mes conditions de vie.',
    reponses: { oui: 'C111', un_peu: 'C112', non: 'C113' }
  },
  {
    id: 'A2_20_6',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux utiliser une série de phrases ou d\'expressions pour décrire en termes simples ma formation et mon activité professionnelle actuelle ou récente.',
    reponses: { oui: 'C114', un_peu: 'C115', non: 'C116' }
  },
  {
    id: 'A2_20_7',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 7,
    texte: 'ECRIRE : Ecrire une courte carte postale simple, par exemple de vacances.',
    reponses: { oui: 'C117', un_peu: 'C118', non: 'C119' }
  },
  {
    id: 'A2_20_8',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 8,
    texte: 'ECRIRE : Je peux porter des détails personnels dans un questionnaire.',
    reponses: { oui: 'C120', un_peu: 'C121', non: 'C122' }
  },
  {
    id: 'A2_20_9',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 20,
    domaine: 'PARLER',
    competenceNumero: 9,
    texte: 'ECRIRE : Je peux inscrire par exemple mon nom, ma nationalité et mon adresse sur une fiche d\'hôtel.',
    reponses: { oui: 'C123', un_peu: 'C124', non: 'C125' }
  },

  // Question 21 - ECRIRE (3 compétences)
  {
    id: 'A2_21_1',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 21,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux écrire une courte carte postale simple, par exemple de vacances.',
    reponses: { oui: 'C126', un_peu: 'C127', non: 'C128' }
  },
  {
    id: 'A2_21_2',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 21,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Porter des détails personnels dans un questionnaire.',
    reponses: { oui: 'C129', un_peu: 'C130', non: 'C131' }
  },
  {
    id: 'A2_21_3',
    niveau: 'A2',
    libelleNiveau: 'INTERMÉDIAIRE',
    questionNumero: 21,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Je peux inscrire par exemple mon nom, ma nationalité et mon adresse sur une fiche d\'hôtel.',
    reponses: { oui: 'C132', un_peu: 'C133', non: 'C134' }
  },

  // ==================== NIVEAU B1 SEUIL ====================
  // Question 22 - COMPRENDRE (8 compétences)
  {
    id: 'B1_22_1',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'ECOUTER : Je peux comprendre les points essentiels dans un langage clair, standard est utilisé, s\'il s\'agit de sujets familiers.',
    reponses: { oui: 'C135', un_peu: 'C136', non: 'C137' }
  },
  {
    id: 'B1_22_2',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'ECOUTER : Je peux comprendre les points essentiels concernant le travail, l\'école, les loisirs, etc.',
    reponses: { oui: 'C138', un_peu: 'C139', non: 'C140' }
  },
  {
    id: 'B1_22_3',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'ECOUTER : Je peux comprendre l\'essentiel de nombreuses émissions de radio ou de télévision si l\'on parle d\'une façon relativement lente et distincte sur l\'actualité, sur des sujets qui m\'intéressent à titre personnel ou professionnel.',
    reponses: { oui: 'C141', un_peu: 'C142', non: 'C143' }
  },
  {
    id: 'B1_22_4',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'ECOUTER : Je peux saisir l\'essentiel des messages simples et clairs.',
    reponses: { oui: 'C144', un_peu: 'C145', non: 'C146' }
  },
  {
    id: 'B1_22_5',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : Je peux comprendre des textes rédigés essentiellement en langue malgache courante.',
    reponses: { oui: 'C147', un_peu: 'C148', non: 'C149' }
  },
  {
    id: 'B1_22_6',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 6,
    texte: 'LIRE : Je peux comprendre des textes rédigés relatifs à mon travail.',
    reponses: { oui: 'C150', un_peu: 'C151', non: 'C152' }
  },
  {
    id: 'B1_22_7',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 7,
    texte: 'LIRE : Je peux comprendre dans des lettres personnelles la description d\'événements.',
    reponses: { oui: 'C153', un_peu: 'C154', non: 'C155' }
  },
  {
    id: 'B1_22_8',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 22,
    domaine: 'COMPRENDRE',
    competenceNumero: 8,
    texte: 'LIRE : Je peux comprendre dans des lettres personnelles l\'expression de sentiments et de souhaits.',
    reponses: { oui: 'C156', un_peu: 'C157', non: 'C158' }
  },

  // Question 23 - PARLER (8 compétences)
  {
    id: 'B1_23_1',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux faire face à la majorité des situations rencontrées au cours d\'un voyage.',
    reponses: { oui: 'C159', un_peu: 'C160', non: 'C161' }
  },
  {
    id: 'B1_23_2',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux faire face à la majorité des situations rencontrées dans un pays où la langue malgache est parlée.',
    reponses: { oui: 'C162', un_peu: 'C163', non: 'C164' }
  },
  {
    id: 'B1_23_3',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux prendre part sans préparation à une conversation sur des sujets familiers ou d\'intérêt personnel.',
    reponses: { oui: 'C165', un_peu: 'C166', non: 'C167' }
  },
  {
    id: 'B1_23_4',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux prendre part sans préparation à une conversation qui concernent la vie quotidienne par exemple la famille, les loisirs, le travail, le voyage et l\'actualité.',
    reponses: { oui: 'C168', un_peu: 'C169', non: 'C170' }
  },
  {
    id: 'B1_23_5',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux articuler des expressions de manière simple afin de raconter des expériences et des événements.',
    reponses: { oui: 'C171', un_peu: 'C172', non: 'C173' }
  },
  {
    id: 'B1_23_6',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux articuler des expressions de manière simple afin de raconter mes rêves, mes espoirs ou mes buts.',
    reponses: { oui: 'C174', un_peu: 'C175', non: 'C176' }
  },
  {
    id: 'B1_23_7',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 7,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux raconter une histoire ou l\'intrigue, d\'un livre ou d\'un film.',
    reponses: { oui: 'C177', un_peu: 'C178', non: 'C179' }
  },
  {
    id: 'B1_23_8',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 23,
    domaine: 'PARLER',
    competenceNumero: 8,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux raconter une histoire ou l\'intrigue mais aussi exprimer mes réactions.',
    reponses: { oui: 'C180', un_peu: 'C181', non: 'C182' }
  },

  // Question 24 - ECRIRE (3 compétences)
  {
    id: 'B1_24_1',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 24,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux écrire un texte simple et cohérent sur des sujets familiers.',
    reponses: { oui: 'C183', un_peu: 'C184', non: 'C185' }
  },
  {
    id: 'B1_24_2',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 24,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Je peux écrire un texte simple et cohérent sur des sujets qui m\'intéressent personnellement.',
    reponses: { oui: 'C186', un_peu: 'C187', non: 'C188' }
  },
  {
    id: 'B1_24_3',
    niveau: 'B1',
    libelleNiveau: 'SEUIL',
    questionNumero: 24,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Je peux écrire des lettres personnelles pour décrire expériences et impressions.',
    reponses: { oui: 'C189', un_peu: 'C190', non: 'C191' }
  },

  // ==================== NIVEAU B2 AVANCÉ ====================
  // Question 25 - COMPRENDRE (5 compétences)
  {
    id: 'B2_25_1',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 25,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'ECOUTER : Je peux comprendre des conférences et des discours assez longs et même suivre une argumentation complexe.',
    reponses: { oui: 'C192', un_peu: 'C193', non: 'C194' }
  },
  {
    id: 'B2_25_2',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 25,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'ECOUTER : Je peux comprendre des conférences et des discours assez longs si le sujet m\'en est relativement familier.',
    reponses: { oui: 'C195', un_peu: 'C196', non: 'C197' }
  },
  {
    id: 'B2_25_3',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 25,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'ECOUTER : Je peux comprendre la plupart des films en langue standard.',
    reponses: { oui: 'C198', un_peu: 'C199', non: 'C200' }
  },
  {
    id: 'B2_25_4',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 25,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'LIRE : Je peux lire des articles et des rapports sur des questions contemporaines dans lesquels les auteurs adoptent une attitude particulière ou un certain point de vue.',
    reponses: { oui: 'C201', un_peu: 'C202', non: 'C203' }
  },
  {
    id: 'B2_25_5',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 25,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : Je peux comprendre un texte littéraire contemporain en prose.',
    reponses: { oui: 'C204', un_peu: 'C205', non: 'C206' }
  },

  // Question 26 - PARLER (7 compétences)
  {
    id: 'B2_26_1',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux communiquer avec un degré de spontanéité et d\'aisance qui rende possible une interaction normale avec un interlocuteur natif.',
    reponses: { oui: 'C207', un_peu: 'C208', non: 'C209' }
  },
  {
    id: 'B2_26_2',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux participer activement à une conversation dans des situations familières.',
    reponses: { oui: 'C210', un_peu: 'C211', non: 'C212' }
  },
  {
    id: 'B2_26_3',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux participer activement à une conversation pour présenter et défendre mes opinions.',
    reponses: { oui: 'C213', un_peu: 'C214', non: 'C215' }
  },
  {
    id: 'B2_26_4',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux m\'exprimer de façon claire et détaillée sur une grande gamme de sujets relatifs à mes centres d\'intérêt.',
    reponses: { oui: 'C216', un_peu: 'C217', non: 'C218' }
  },
  {
    id: 'B2_26_5',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux développer un point de vue sur un sujet d\'actualité.',
    reponses: { oui: 'C219', un_peu: 'C220', non: 'C221' }
  },
  {
    id: 'B2_26_6',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux développer un point de vue et expliquer les avantages et les inconvénients.',
    reponses: { oui: 'C222', un_peu: 'C223', non: 'C224' }
  },
  {
    id: 'B2_26_7',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 26,
    domaine: 'PARLER',
    competenceNumero: 7,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux développer un point de vue de différentes possibilités.',
    reponses: { oui: 'C225', un_peu: 'C226', non: 'C227' }
  },

  // Question 27 - ECRIRE (5 compétences)
  {
    id: 'B2_27_1',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 27,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux écrire des textes clairs et détaillés sur une grande gamme de sujets.',
    reponses: { oui: 'C228', un_peu: 'C229', non: 'C230' }
  },
  {
    id: 'B2_27_2',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 27,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Je peux écrire un essai ou un rapport en transmettant une information.',
    reponses: { oui: 'C231', un_peu: 'C232', non: 'C233' }
  },
  {
    id: 'B2_27_3',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 27,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Je peux écrire des lettres personnelles pour décrire expériences et impressions.',
    reponses: { oui: 'C234', un_peu: 'C235', non: 'C236' }
  },
  {
    id: 'B2_27_4',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 27,
    domaine: 'ECRIRE',
    competenceNumero: 4,
    texte: 'ECRIRE : Je peux écrire un essai ou un rapport en exposant des raisons pour ou contre une opinion donnée.',
    reponses: { oui: 'C237', un_peu: 'C238', non: 'C239' }
  },
  {
    id: 'B2_27_5',
    niveau: 'B2',
    libelleNiveau: 'AVANCÉ',
    questionNumero: 27,
    domaine: 'ECRIRE',
    competenceNumero: 5,
    texte: 'ECRIRE : Je peux écrire des lettres qui mettent en valeur le sens que j\'attribue personnellement aux événements et aux expériences.',
    reponses: { oui: 'C240', un_peu: 'C241', non: 'C242' }
  },

  // ==================== NIVEAU C1 AUTONOME ====================
  // Question 28 - COMPRENDRE (6 compétences)
  {
    id: 'C1_28_1',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'ECOUTER : Je peux comprendre un long discours même s\'il n\'est pas clairement structuré.',
    reponses: { oui: 'C243', un_peu: 'C244', non: 'C245' }
  },
  {
    id: 'C1_28_2',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'ECOUTER : Je peux comprendre un long discours même si les articulations sont seulement implicites.',
    reponses: { oui: 'C246', un_peu: 'C247', non: 'C248' }
  },
  {
    id: 'C1_28_3',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'LIRE : Je peux comprendre des textes et en apprécier les différences de style même s\'ils sont longs, complexes et factuels.',
    reponses: { oui: 'C249', un_peu: 'C250', non: 'C251' }
  },
  {
    id: 'C1_28_4',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'LIRE : Je peux comprendre des textes et en apprécier les différences de style même s\'ils sont longs, complexes ou litteraires.',
    reponses: { oui: 'C252', un_peu: 'C253', non: 'C254' }
  },
  {
    id: 'C1_28_5',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : Je peux comprendre des articles spécialisés et de longues instructions techniques.',
    reponses: { oui: 'C255', un_peu: 'C256', non: 'C257' }
  },
  {
    id: 'C1_28_6',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 28,
    domaine: 'COMPRENDRE',
    competenceNumero: 6,
    texte: 'LIRE : Je peux comprendre des articles spécialisés même lorsqu\'ils ne sont pas en relation avec mon domaine.',
    reponses: { oui: 'C258', un_peu: 'C259', non: 'C260' }
  },

  // Question 29 - PARLER (6 compétences)
  {
    id: 'C1_29_1',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux m\'exprimer spontanément et couramment sans trop apparemment devoir chercher mes mots.',
    reponses: { oui: 'C261', un_peu: 'C262', non: 'C263' }
  },
  {
    id: 'C1_29_2',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux utiliser la langue de manière souple et efficace pour des relations sociales ou professionnelles.',
    reponses: { oui: 'C264', un_peu: 'C265', non: 'C266' }
  },
  {
    id: 'C1_29_3',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux exprimer mes idées et opinions.',
    reponses: { oui: 'C267', un_peu: 'C268', non: 'C269' }
  },
  {
    id: 'C1_29_4',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'PRENDRE PART A UNE CONVERSATION : je peux exprimer mes idées et opinions ainsi que lier mes interventions à celles de mes interlocuteurs.',
    reponses: { oui: 'C270', un_peu: 'C271', non: 'C272' }
  },
  {
    id: 'C1_29_5',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux présenter des descriptions claires et détaillées de sujets complexes en développant certains points.',
    reponses: { oui: 'C273', un_peu: 'C274', non: 'C275' }
  },
  {
    id: 'C1_29_6',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 29,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux présenter des descriptions claires et détaillées de sujets complexes en en terminant mon intervention de façon appropriée.',
    reponses: { oui: 'C276', un_peu: 'C277', non: 'C278' }
  },

  // Question 30 - ECRIRE (5 compétences)
  {
    id: 'C1_30_1',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 30,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux m\'exprimer dans un texte clair et bien structuré.',
    reponses: { oui: 'C279', un_peu: 'C280', non: 'C281' }
  },
  {
    id: 'C1_30_2',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 30,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Je peux m\'exprimer dans un texte et développer mon point de vue.',
    reponses: { oui: 'C282', un_peu: 'C283', non: 'C284' }
  },
  {
    id: 'C1_30_3',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 30,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Je peux écrire sur des sujets complexes dans une lettre, un essai ou un rapport.',
    reponses: { oui: 'C285', un_peu: 'C286', non: 'C287' }
  },
  {
    id: 'C1_30_4',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 30,
    domaine: 'ECRIRE',
    competenceNumero: 4,
    texte: 'ECRIRE : Je peux écrire sur des sujets complexes en soulignant les points que je juge importants.',
    reponses: { oui: 'C288', un_peu: 'C289', non: 'C290' }
  },
  {
    id: 'C1_30_5',
    niveau: 'C1',
    libelleNiveau: 'AUTONOME',
    questionNumero: 30,
    domaine: 'ECRIRE',
    competenceNumero: 5,
    texte: 'ECRIRE : Je peux adopter un style adapté au destinataire.',
    reponses: { oui: 'C291', un_peu: 'C292', non: 'C293' }
  },

  // ==================== NIVEAU C2 MAÎTRISE ====================
  // Question 31 - COMPRENDRE (6 compétences)
  {
    id: 'C2_31_1',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 1,
    texte: 'ECOUTER : A condition d\'avoir du temps pour me familiariser avec un accent particulier, je n\'ai aucune difficulté à comprendre le langage oral.',
    reponses: { oui: 'C294', un_peu: 'C295', non: 'C296' }
  },
  {
    id: 'C2_31_2',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 2,
    texte: 'ECOUTER : que ce soit dans les conditions du direct.',
    reponses: { oui: 'C297', un_peu: 'C298', non: 'C299' }
  },
  {
    id: 'C2_31_3',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 3,
    texte: 'ECOUTER : ou dans les médias.',
    reponses: { oui: 'C300', un_peu: 'C301', non: 'C302' }
  },
  {
    id: 'C2_31_4',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 4,
    texte: 'ECOUTER : et quand on parle vite.',
    reponses: { oui: 'C303', un_peu: 'C304', non: 'C305' }
  },
  {
    id: 'C2_31_5',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 5,
    texte: 'LIRE : Je peux lire sans effort tout type de texte même abstrait ou complexe quant au fond ou à la forme.',
    reponses: { oui: 'C306', un_peu: 'C307', non: 'C308' }
  },
  {
    id: 'C2_31_6',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 31,
    domaine: 'COMPRENDRE',
    competenceNumero: 6,
    texte: 'LIRE : Je peux lire sans effort tout type de texte par exemple un manuel, un article spécialisé ou une œuvre littéraire.',
    reponses: { oui: 'C309', un_peu: 'C310', non: 'C311' }
  },

  // Question 32 - PARLER (7 compétences)
  {
    id: 'C2_32_1',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 1,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux participer sans effort à toute conversation ou discussion.',
    reponses: { oui: 'C312', un_peu: 'C313', non: 'C314' }
  },
  {
    id: 'C2_32_2',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 2,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je suis aussi très à l\'aise avec les expressions idiomatiques et les tournures courantes.',
    reponses: { oui: 'C315', un_peu: 'C316', non: 'C317' }
  },
  {
    id: 'C2_32_3',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 3,
    texte: 'PRENDRE PART A UNE CONVERSATION : Je peux m\'exprimer couramment et exprimer avec précision de fines nuances de sens.',
    reponses: { oui: 'C318', un_peu: 'C319', non: 'C320' }
  },
  {
    id: 'C2_32_4',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 4,
    texte: 'PRENDRE PART A UNE CONVERSATION : En cas de difficulté je peux faire marche arrière pour y remédier avec assez d\'habileté et pour qu\'elle passe presque inaperçue.',
    reponses: { oui: 'C321', un_peu: 'C322', non: 'C323' }
  },
  {
    id: 'C2_32_5',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 5,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux présenter : description, argumentation claire & fluide dans 1 style adapté au contexte en développant certains points.',
    reponses: { oui: 'C324', un_peu: 'C325', non: 'C326' }
  },
  {
    id: 'C2_32_6',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 6,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux construire une présentation de façon logique.',
    reponses: { oui: 'C327', un_peu: 'C328', non: 'C329' }
  },
  {
    id: 'C2_32_7',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 32,
    domaine: 'PARLER',
    competenceNumero: 7,
    texte: 'S\'EXPRIMER ORALEMENT EN CONTINU : Je peux construire une présentation et aider mon auditeur à remarquer et à se rappeler les points importants.',
    reponses: { oui: 'C330', un_peu: 'C331', non: 'C332' }
  },

  // Question 33 - ECRIRE (3 compétences)
  {
    id: 'C2_33_1',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 33,
    domaine: 'ECRIRE',
    competenceNumero: 1,
    texte: 'ECRIRE : Je peux écrire un texte clair, fluide et stylistiquement adapté aux circonstances.',
    reponses: { oui: 'C333', un_peu: 'C334', non: 'C335' }
  },
  {
    id: 'C2_33_2',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 33,
    domaine: 'ECRIRE',
    competenceNumero: 2,
    texte: 'ECRIRE : Je peux rédiger des lettres, rapports ou articles complexes, avec une construction claire.',
    reponses: { oui: 'C336', un_peu: 'C337', non: 'C338' }
  },
  {
    id: 'C2_33_3',
    niveau: 'C2',
    libelleNiveau: 'MAÎTRISE',
    questionNumero: 33,
    domaine: 'ECRIRE',
    competenceNumero: 3,
    texte: 'ECRIRE : Dans ma rédaction, ma construction doit permettre au lecteur d\'en saisir et de mémoriser les points importants.',
    reponses: { oui: 'C339', un_peu: 'C340', non: 'C341' }
  },
];

// Structure des niveaux avec informations
export const STRUCTURE_NIVEAUX = [
  {
    niveau: 'C2',
    libelle: 'MAÎTRISE',
    seuil: 16, // 6 + 7 + 3 = 16 sous-questions
    questions: [
      { numero: 31, domaine: 'COMPRENDRE', sousQuestionsCount: 6 },
      { numero: 32, domaine: 'PARLER', sousQuestionsCount: 7 },
      { numero: 33, domaine: 'ECRIRE', sousQuestionsCount: 3 }
    ]
  },
  {
    niveau: 'C1',
    libelle: 'AUTONOME',
    seuil: 17, // 6 + 6 + 5 = 17 sous-questions
    questions: [
      { numero: 28, domaine: 'COMPRENDRE', sousQuestionsCount: 6 },
      { numero: 29, domaine: 'PARLER', sousQuestionsCount: 6 },
      { numero: 30, domaine: 'ECRIRE', sousQuestionsCount: 5 }
    ]
  },
  {
    niveau: 'B2',
    libelle: 'AVANCÉ',
    seuil: 17, // 5 + 7 + 5 = 17 sous-questions
    questions: [
      { numero: 25, domaine: 'COMPRENDRE', sousQuestionsCount: 5 },
      { numero: 26, domaine: 'PARLER', sousQuestionsCount: 7 },
      { numero: 27, domaine: 'ECRIRE', sousQuestionsCount: 5 }
    ]
  },
  {
    niveau: 'B1',
    libelle: 'SEUIL',
    seuil: 19, // 8 + 8 + 3 = 19 sous-questions
    questions: [
      { numero: 22, domaine: 'COMPRENDRE', sousQuestionsCount: 8 },
      { numero: 23, domaine: 'PARLER', sousQuestionsCount: 8 },
      { numero: 24, domaine: 'ECRIRE', sousQuestionsCount: 3 }
    ]
  },
  {
    niveau: 'A2',
    libelle: 'INTERMÉDIAIRE',
    seuil: 21, // 9 + 9 + 3 = 21 sous-questions
    questions: [
      { numero: 19, domaine: 'COMPRENDRE', sousQuestionsCount: 9 },
      { numero: 20, domaine: 'PARLER', sousQuestionsCount: 9 },
      { numero: 21, domaine: 'ECRIRE', sousQuestionsCount: 3 }
    ]
  },
  {
    niveau: 'A1',
    libelle: 'DÉCOUVERTE',
    seuil: 15, // 6 + 6 + 3 = 15 sous-questions
    questions: [
      { numero: 16, domaine: 'COMPRENDRE', sousQuestionsCount: 6 },
      { numero: 17, domaine: 'PARLER', sousQuestionsCount: 6 },
      { numero: 18, domaine: 'ECRIRE', sousQuestionsCount: 3 }
    ]
  }
];

// Fonctions utilitaires
export function getQuestionsByNiveau(niveau: string): SousQuestionCECRL[] {
  return SOUS_QUESTIONS_CECRL.filter(q => q.niveau === niveau);
}

export function getAllQuestions(): SousQuestionCECRL[] {
  return SOUS_QUESTIONS_CECRL.filter(q => q.id !== PREMIERE_QUESTION_A1.id);
}

export function getLibelleNiveau(niveau: string): string {
  return LIBELLES_NIVEAUX[niveau] || niveau;
}

// Vérifier si toutes les compétences sont présentes
export function verifierCompletude(): { total: number; parNiveau: Record<string, number> } {
  const parNiveau: Record<string, number> = {};
  
  SOUS_QUESTIONS_CECRL.forEach(question => {
    if (!parNiveau[question.niveau]) {
      parNiveau[question.niveau] = 0;
    }
    parNiveau[question.niveau]++;
  });
  
  return {
    total: SOUS_QUESTIONS_CECRL.length,
    parNiveau
  };
}

// Afficher le résumé
export function afficherResumeCompletude(): string {
  const { total, parNiveau } = verifierCompletude();
  let resume = `Total des compétences: ${total}\n\n`;
  
  Object.entries(parNiveau).forEach(([niveau, count]) => {
    const attendu = STRUCTURE_NIVEAUX.find(n => n.niveau === niveau)?.seuil || 0;
    resume += `${niveau} (${getLibelleNiveau(niveau)}): ${count}/${attendu} compétences ${count >= attendu ? '✅' : '❌'}\n`;
  });
  
  return resume;
}