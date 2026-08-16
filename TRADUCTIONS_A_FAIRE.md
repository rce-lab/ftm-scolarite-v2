# Traductions à faire — FTM Scolarité

**⚠️ Document généré automatiquement par `npm run generate-traductions-doc` à partir de `src/lib/i18n/translations.ts` — ne pas éditer ce fichier à la main, toute modification manuelle serait écrasée à la prochaine génération. Toute entrée ci-dessous reste un brouillon à vérifier par un locuteur natif tant qu'elle n'a pas été explicitement confirmée par Charles.**

Ce document recense uniquement les traductions français/malgache **internes** (admin, enseignants, connexion) définies dans `src/lib/i18n/translations.ts`. Il ne couvre **pas** les traductions français/anglais du formulaire public candidat (`src/lib/i18n/publicTranslations.ts`), qui n'ont jamais eu besoin de validation par un locuteur natif.

Généré le 2026-08-16 — 14 sections, 335 entrées.

---

## Page de connexion

| Clé | Français | Malgache |
|---|---|---|
| login.title | FTM - Connexion | FTM - Fidirana |
| login.identifiantLabel | Identifiant | Anaram-pidirana |
| login.identifiantPlaceholder | prenom.nom | prenom.nom |
| login.passwordLabel | Mot de passe | Tenimiafina |
| login.passwordPlaceholder | Admin123! | Admin123! |
| login.loadingButton | Connexion... | Eo am-pidirana... |
| login.submitButton | Se connecter | Hiditra |
| login.errorPrefix | Erreur : {message} | Hadisoana : {message} |
| login.logoAlt | Logo FTM | Sary famatarana ny FTM |

## Changement de mot de passe

| Clé | Français | Malgache |
|---|---|---|
| changePassword.title | Changement de mot de passe requis | Fanovana tenimiafina ilaina |
| changePassword.subtitle | Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer. | Noho ny antony fiarovana, tsy maintsy mametraka tenimiafina vaovao ianao alohan'ny handehanana. |
| changePassword.newPasswordLabel | Nouveau mot de passe | Tenimiafina vaovao |
| changePassword.confirmPasswordLabel | Confirmer le mot de passe | Hamarino ny tenimiafina |
| changePassword.submitButton | Valider | Hanova |
| changePassword.loadingButton | Enregistrement... | Eo am-pitahirizana... |
| changePassword.errorMismatch | Les mots de passe ne correspondent pas. | Tsy mitovy ny tenimiafina roa. |
| changePassword.errorTooShort | Le mot de passe doit contenir au moins 8 caractères. | Tsy maintsy misy fara-fahakeliny 8 tarehin-tsoratra ny tenimiafina. |
| changePassword.errorPrefix | Erreur : {message} | Hadisoana : {message} |

## Barre de navigation interne (InternalNav)

| Clé | Français | Malgache |
|---|---|---|
| internalNav.dashboard | Tableau de bord | Pejy fandravonana |
| internalNav.inscriptions | Inscriptions | Fisoratana anarana |
| internalNav.deliberation | Délibération | Fifampidinihana |
| internalNav.classes | Classes | Kilasy |
| internalNav.payments | Paiements | Fandoavam-bola |
| internalNav.settings | Paramètres | Fanova |
| internalNav.reports | Rapports | Tatitra |
| internalNav.historique | Historique | Tantara |
| internalNav.accessDeniedTooltip | Accès non autorisé pour votre rôle | Tsy manana alalana hiditra eto ianao raha ny anjara asanao |
| internalNav.logout | Déconnexion | Hiala |
| internalNav.logoAlt | Logo FTM | Sary famatarana FTM |

## Historique des inscriptions (archive 2023-2026)

| Clé | Français | Malgache |
|---|---|---|
| historique.title | Historique des inscriptions (2023-2026) | Tantaram-pisoratana anarana (2023-2026) |
| historique.introText | Cette archive rassemble les inscriptions enregistrées entre 2023 et 2026, avant la mise en place de l'application actuelle. Elle est conservée comme référence historique et comme source de statistiques sur le long terme. | Ity tahirim-panaka ity dia mirakitra ny fisoratana anarana natao teo anelanelan'ny 2023 sy 2026, talohan'ny nametrahana ity rindrankajy ity. Voatahiry ho fitsipiky ny tantara sy loharanon'antontan'isa maharitra izy io. |
| historique.loading | Chargement... | Eo am-panintonana... |
| historique.errorLoading | Erreur lors du chargement de l'archive. | Nisy hadisoana teo am-panintonana ny tahirim-panaka. |
| historique.statsSectionTitle | Statistiques | Antontan-isa |
| historique.byYearTitle | Inscriptions par année scolaire | Fisoratana anarana isaky ny taom-pianarana |
| historique.colYear | Année | Taona |
| historique.colCount | Nombre | Isa |
| historique.colGrowth | Croissance | Fitomboana |
| historique.growthNA | — | — |
| historique.byMigrationStatusTitle | Répartition par statut, par année | Fizarana araka ny sata, isaky ny taona |
| historique.statusKeep | Conservés | Voatahiry |
| historique.statusAbandon | Abandonnés | Nilaozana |
| historique.statusDoublon | Doublons | Mitovy |
| historique.colTotal | Total | Fitambarana |
| historique.uniqueStudentsLabel | Élèves uniques | Mpianatra tokana |
| historique.reenrolledLabel | Réinscrits | Niditra indray |
| historique.reenrolledPercentSuffix | {percent}% des élèves uniques | {percent}% amin'ny mpianatra tokana |
| historique.byLevelTitle | Répartition par niveau CEFR | Fizarana araka ny ambaratonga CEFR |
| historique.colLevel | Niveau | Ambaratonga |
| historique.byCountryTitle | Répartition par pays de résidence | Fizarana araka ny firenena ipetrahana |
| historique.colCountry | Pays | Firenena |
| historique.searchListTitle | Recherche et liste | Fikarohana sy lisitra |
| historique.searchPlaceholder | Rechercher par nom ou prénom... | Karohy amin'ny anarana na fanampin'anarana... |
| historique.filterAllYears | Toutes les années | Taona rehetra |
| historique.filterToVerifyOnly | Afficher seulement les identités à vérifier | Asehoy ihany ireo mila hamarinana |
| historique.colFirstName | Prénom | Fanampin'anarana |
| historique.colName | Nom | Anarana |
| historique.colAge | Âge | Taona |
| historique.colMigrationStatus | Statut | Sata |
| historique.colCode | Code inscription | Kaody fisoratana anarana |
| historique.colReenrolled | Réinscription | Fidirana indray |
| historique.reenrolledYes | 🔁 Oui | 🔁 Eny |
| historique.reenrolledNo | — | — |
| historique.codeEmpty | — | — |
| historique.noResults | Aucun résultat. | Tsy misy valiny. |
| historique.resultsCount | {count} résultat(s) | Valiny {count} |
| historique.paginationPrevious | ← Précédent | ← Teo aloha |
| historique.paginationNext | Suivant → | Manaraka → |
| historique.paginationInfo | Page {page} / {total} | Pejy {page} / {total} |
| historique.resolutionTitle | Résolution des identités ambiguës | Famahana ireo mombamomba mila hamarinana |
| historique.resolutionIntro | Ces lignes partagent le même nom mais des emails différents : il s'agit probablement de la même personne (selon la progression d'âge observée), mais cela n'a jamais été confirmé formellement. Vérifiez chaque groupe et choisissez l'action appropriée. | Ireto andalana ireto dia mitovy anarana saingy tsy mitovy mailaka: azo inoana fa olona iray ihany (araka ny fivoaran'ny taona hita), saingy tsy mbola voamarina mazava. Jereo ny vondrona tsirairay ary safidio ny hetsika mifanaraka. |
| historique.resolutionNoGroups | Aucune identité à vérifier pour le moment. | Tsy misy mombamomba mila hamarinana amin'izao fotoana izao. |
| historique.groupLabel | Groupe {n} | Vondrona {n} |
| historique.colEmail | Email | Mailaka |
| historique.confirmSameButton | Confirmer : même personne | Hanamarina : olona iray ihany |
| historique.confirmSameConfirm | Confirmer que ces {count} lignes concernent bien la même personne ? | Hamarino fa ilay olona iray ihany no tian'ireto andalana {count} ireto ambara? |
| historique.separateButton | Séparer : personne différente | Hanasaraka : olona hafa |
| historique.separateConfirm | Séparer cette ligne comme une personne différente du reste du groupe ? | Hosarahina ho olona hafa noho ny sisa amin'ny vondrona ity andalana ity ? |
| historique.actionError | Erreur : {message} | Hadisoana : {message} |

## Tableau de bord (admin)

| Clé | Français | Malgache |
|---|---|---|
| adminDashboard.title | Tableau de bord | Pejy fandravonana |
| adminDashboard.totalInscriptions | Total inscriptions | Mpisoratra anarana rehetra |
| adminDashboard.pendingReview | En attente de validation | Miandry fankatoavana |
| adminDashboard.viewInscriptionsLink | Voir les inscriptions → | Jereo ny fisoratana anarana → |
| adminDashboard.approvedInscriptions | Inscriptions validées | Fisoratana anarana efa nankatoavina |
| adminDashboard.paymentsPending | Paiements en attente | Mbola miandry ny fandoavam-bola |
| adminDashboard.managePaymentsLink | Gérer les paiements → | Mitantana ny fandoavam-bola → |
| adminDashboard.recentInscriptionsTitle | Dernières inscriptions | Fisoratana anarana farany |
| adminDashboard.tableCode | Code | Kaody |
| adminDashboard.tableName | Nom | Anarana |
| adminDashboard.tableLevel | Niveau | Lentam-pahaizana |
| adminDashboard.tableDate | Date | Daty |
| adminDashboard.tableStatus | Statut | Sata |
| adminDashboard.tableAction | Action | Hetsika |
| adminDashboard.viewLink | Voir → | Jereo → |
| adminDashboard.viewAllInscriptionsLink | Voir toutes les inscriptions → | Jereo ny fisoratana anarana rehetra → |
| adminDashboard.quickActionsTitle | Actions rapides | Rohy haingana |
| adminDashboard.quickActionValidate | ⏳ Valider les inscriptions en attente | ⏳ Ankatoavy ny fisoratana anarana miandry |
| adminDashboard.quickActionStudents | 👨‍🎓 Gérer les étudiants | 👨‍🎓 Fitantanana ny mpianatra |
| adminDashboard.quickActionPayments | 💰 Suivi des paiements | 💰 Fanaraha-maso ny fandoavam-bola |
| adminDashboard.quickActionSettings | ⚙️ Paramètres | ⚙️ Fanova |
| adminDashboard.statsByLevelTitle | Statistiques par niveau | Antontan'isa araka ny ambaratonga |
| adminDashboard.levelTileLabel | Niveau | Lentam-pahaizana |
| adminDashboard.studentsUnit | étudiants | Mpianatra |

## Liste des inscriptions

| Clé | Français | Malgache |
|---|---|---|
| inscriptionsList.title | Gestion des inscriptions | Fitantanana ny fisoratana anarana |
| inscriptionsList.newInscriptionButton | + Nouvelle inscription | + Fisoratana anarana vaovao |
| inscriptionsList.filterAll | Toutes | Rehetra |
| inscriptionsList.filterPending | En attente | Miandry |
| inscriptionsList.filterApproved | Validées | Voamarina |
| inscriptionsList.filterPaymentPending | Paiements en attente | Fandoavam-bola miandry |
| inscriptionsList.filterRejected | Rejetées | Nolavina |
| inscriptionsList.tableCode | Code | Kaody |
| inscriptionsList.tableName | Nom | Anarana |
| inscriptionsList.tableEmail | Email | Mailaka |
| inscriptionsList.tableLevel | Niveau | Lentam-pahaizana |
| inscriptionsList.tableDate | Date | Daty |
| inscriptionsList.tableStatus | Statut | Sata |
| inscriptionsList.tableActions | Actions | Hetsika |
| inscriptionsList.viewLink | Voir → | Jereo → |

## Détail d'une inscription

| Clé | Français | Malgache |
|---|---|---|
| inscriptionsDetail.notFoundTitle | Inscription non trouvée | Tsy hita ny fisoratana anarana |
| inscriptionsDetail.notFoundMessage | Le code étudiant {code} n'existe pas. | Tsy misy ny kaody mpianatra {code}. |
| inscriptionsDetail.backToListLink | ← Retour à la liste | ← Miverina any amin'ny lisitra |
| inscriptionsDetail.statusPendingBadge | ⏳ En attente de validation | ⏳ Miandry ny fankatoavana |
| inscriptionsDetail.statusApprovedBadge | ✅ Inscription validée | ✅ Ankatoavina ny fisoratana anarana |
| inscriptionsDetail.statusRejectedBadge | ❌ Inscription rejetée | ❌ Lavina ny fisoratana anarana |
| inscriptionsDetail.statusPaymentPendingBadge | 💰 Paiement en attente | 💰 Miandry ny fandoavam-bola |
| inscriptionsDetail.registeredOn | Inscrit le {date} | Voasoratra tamin'ny {date} |
| inscriptionsDetail.studentCodeLabel | Code étudiant: | Laharan'ny mpianatra |
| inscriptionsDetail.personalInfoTitle | Informations personnelles | Mombamomba ny tena manokana |
| inscriptionsDetail.fieldName | Nom | Anarana |
| inscriptionsDetail.fieldFirstName | Prénom | Fanampin'anarana |
| inscriptionsDetail.fieldAge | Âge | Taona |
| inscriptionsDetail.ageYears | {age} ans | {age} taona |
| inscriptionsDetail.fieldEmail | Email | Mailaka |
| inscriptionsDetail.fieldPhone | Téléphone | Laharan-tariby |
| inscriptionsDetail.evaluationTitle | Évaluation et décision | Fanombanana sy fanapahan-kevitra |
| inscriptionsDetail.suggestedLevelLabel | Niveau suggéré (auto) | Lentam-pahaizana voakajy araka ny valinteny |
| inscriptionsDetail.autoCalculated | Calculé automatiquement | Voakajy ho azy |
| inscriptionsDetail.finalLevelLabel | Niveau définitif | Lentam-pahaizana tazomina farany |
| inscriptionsDetail.assignedClassLabel | Classe attribuée | Sokajiana ao @ kilasy |
| inscriptionsDetail.noClassOption | — Aucune classe — | — Tsy misy kilasy — |
| inscriptionsDetail.adminNotesLabel | Notes administratives | Fanamarihana ara-pitantanana |
| inscriptionsDetail.adminNotesPlaceholder | Notes internes pour cette inscription... | Fanamarihana manokana ho an'ity fisoratana anarana ity... |
| inscriptionsDetail.saveButton | Enregistrer les modifications | Tahirizo ary ny fanovana |
| inscriptionsDetail.detailedStatsTitle | Statistiques détaillées | Antontan'isa amin'ny antsipiriany |
| inscriptionsDetail.statsTableLevel | Niveau | Lentam-pahaizana |
| inscriptionsDetail.statsTableScore | Score | Isa |
| inscriptionsDetail.statsTableQuestions | Questions | Fanontaniana |
| inscriptionsDetail.statsTableScorePercent | % Score | % Isa |
| inscriptionsDetail.statsTableThreshold | Seuil | Fetra |
| inscriptionsDetail.statsTableStatus | Statut | Sata |
| inscriptionsDetail.thresholdReached | Atteint | Tratra |
| inscriptionsDetail.thresholdNotReached | Non atteint | Tsy tratra |
| inscriptionsDetail.actionsTitle | Actions | Hetsika |
| inscriptionsDetail.actionApprove | ✅ Valider l'inscription | ✅ ankatoavina ny fisoratana anarana |
| inscriptionsDetail.actionMarkPaymentPending | 💰 Marquer comme "Paiement en attente" | 💰 Mariho hoe "Miandry ny fandoavam-bola" |
| inscriptionsDetail.actionReject | ❌ Rejeter l'inscription | ❌ Lavina ny fisoratana anarana |
| inscriptionsDetail.actionPaymentPending | 💰 Paiement en attente | 💰 Miandry ny fandoavam-bola |
| inscriptionsDetail.actionPaymentConfirmed | ✅ Paiement confirmé | ✅ Voamarina ny fandoavam-bola |
| inscriptionsDetail.actionPrint | 🖨️ Imprimer cette page | 🖨️ Manonta ity pejy ity |
| inscriptionsDetail.actionSendEmail | 📧 Envoyer un email | 📧 Mandefa mailaka |
| inscriptionsDetail.historyTitle | Historique | Tantara |
| inscriptionsDetail.createdLabel | Création | noforonina t@ |
| inscriptionsDetail.lastModifiedLabel | Dernière modification | Fanovana farany |
| inscriptionsDetail.responsesSummaryTitle | Résumé des réponses | Famintinana ny valiny |
| inscriptionsDetail.totalQuestions | Total questions | Fitambaran'ny fanontaniana |
| inscriptionsDetail.responsesYes | Réponses OUI | Valiny ENY |
| inscriptionsDetail.responsesSomewhat | Réponses UN PEU | Valiny KELY |
| inscriptionsDetail.responsesNo | Réponses NON | Valiny TSIA |
| inscriptionsDetail.saveSuccessAlert | Modifications enregistrées avec succès | Voatahiry soa aman-tsara ny fanovana |
| inscriptionsDetail.saveErrorAlert | Erreur lors de l'enregistrement | Hadisoana teo am-pitahirizana ny fanovana |
| inscriptionsDetail.statusChangeConfirm | Voulez-vous vraiment changer le statut en "{status}" ? | Tena tianao hovana ho "{status}" ve ny sata ? |
| inscriptionsDetail.statusUpdateSuccessAlert | Statut mis à jour avec succès | Voaova soa aman-tsara ny sata |
| inscriptionsDetail.statusUpdateErrorAlert | Erreur lors de la mise à jour | Hadisoana teo am-panovana |

## Suivi des paiements

| Clé | Français | Malgache |
|---|---|---|
| payments.title | Suivi des paiements | Fanaraha-maso ny fandoavam-bola |
| payments.pendingTab | En attente ({n}) | Miandry ({n}) |
| payments.historyTab | Historique des paiements | Fisesin'ny fandoavam-bola |
| payments.tableName | Nom | Anarana |
| payments.tableCode | Code | Kaody |
| payments.tableClass | Classe | Kilasy |
| payments.tableEmail | Email | Mailaka |
| payments.tableExpectedAmount | Montant attendu | Vola andrasana |
| payments.tableAction | Action | Hetsika |
| payments.markPaidButton | Marquer payé | Mariho hoe efa voaloa |
| payments.noPendingPayments | Aucun paiement en attente. | Tsy misy fandoavam-bola miandry. |
| payments.historyTableCandidate | Candidat | Mpandray anjara |
| payments.historyTableCode | Code | Kaody |
| payments.historyTableAmount | Montant | Vola |
| payments.historyTableDate | Date | Daty |
| payments.historyTableMode | Mode | Fomba |
| payments.noPaymentsRecorded | Aucun paiement enregistré pour le moment. | Tsy misy fandoavam-bola voatahiry ankehitriny. |
| payments.confirmModalTitle | Confirmer le paiement | Manamarina ny fandoavam-bola |
| payments.amountLabel | Montant (€) | Vola (€) |
| payments.paymentModeLabel | Mode de paiement | Fomba fandoavana |
| payments.modeTransfer | Virement | Famindrana vola |
| payments.modeCash | Espèces | Vola mivantana |
| payments.modeOther | Autre | Hafa |
| payments.cancelButton | Annuler | Foano |
| payments.savingButton | Enregistrement... | Eo am-pitahirizana... |
| payments.confirmButton | Confirmer le paiement | Manamarina ny fandoavam-bola |
| payments.saveErrorAlert | Erreur lors de l'enregistrement du paiement : {message} | Hadisoana teo am-pitahirizana ny fandoavam-bola : {message} |

## Paramètres

| Clé | Français | Malgache |
|---|---|---|
| settings.title | Paramètres | Fandrindrana |
| settings.registrationFeeLabel | Frais d'inscription (€) | Sarany fisoratana anarana (€) |
| settings.contactEmailLabel | Email de contact/communication | Mailaka fifandraisana |
| settings.currentSchoolYearLabel | Année scolaire courante | Taom-pianarana ankehitriny |
| settings.schoolYearPlaceholder | AAAA-AAAA | AAAA-AAAA |
| settings.studentCodePrefixLabel | Préfixe des codes étudiants | Sombin-teny mialoha ny kaodin'ny mpianatra |
| settings.bankRibLabel | RIB bancaire | RIB banky |
| settings.beneficiaryLabel | Bénéficiaire (nom sur le compte) | Mpandray ny vola ao @ FTM (anarana amin'ny kaonty) |
| settings.schoolManagerEmailLabel | Email Responsable Scolarité | Mailakan'ny Tompon'andraikitra Fampianarana |
| settings.adminManagerEmailLabel | Email Responsable Administratif | Mailakan'ny Tonia |
| settings.associationAddressLabel | Adresse de l'association | Adiresin'ny fikambanana |
| settings.saveSuccessMessage | Paramètres enregistrés avec succès. | Voatahiry soa aman-tsara ny fanova. |
| settings.saveErrorMessage | Une erreur est survenue lors de la sauvegarde. | Nisy hadisoana teo am-pitahirizana. |
| settings.savingButton | Enregistrement... | Eo am-pitahirizana... |
| settings.saveButton | Enregistrer | Tahirizo |

## Gestion des étudiants

| Clé | Français | Malgache |
|---|---|---|
| students.title | Gestion des étudiants | Fitantanana ny mpianatra |
| students.underConstructionMessage | Page en construction. Gestion des étudiants à venir. | Pejy mbola eo am-pandrafetana. Ho avy tsy ho ela ny fitantanana ny mpianatra. |

## Délibération (conseil des enseignants)

| Clé | Français | Malgache |
|---|---|---|
| deliberation.title | Conseil des enseignants - Délibération | Filan-kevitry ny mpampianatra - Fifampidinihana |
| deliberation.filterPending | En attente | Miandry |
| deliberation.filterApproved | Validées | Voamarina |
| deliberation.filterRejected | Rejetées | Nolavina |
| deliberation.filterAll | Toutes | Rehetra |
| deliberation.tableStudent | Étudiant | Mpianatra |
| deliberation.tableSuggestedLevel | Niveau suggéré | Lentam-pahaizana voatolotra |
| deliberation.tableStatus | Statut | Sata |
| deliberation.tableDate | Date | Daty |
| deliberation.tableActions | Actions | Hetsika |
| deliberation.statusPendingBadge | ⏳ En attente | ⏳ Miandry |
| deliberation.statusApprovedBadge | ✅ Validé | ✅ Voamarina |
| deliberation.statusRejectedBadge | ❌ Rejeté | ❌ Nolavina |
| deliberation.deliberateLink | Délibérer → | Mifampidinika → |
| deliberation.panelTitle | Délibération | Fifampidinihana |
| deliberation.codeLabel | Code: {code} | Kaody: {code} |
| deliberation.suggestedLevelLabel | Niveau suggéré (auto) | Lentam-pahaizana voatolotra (ho azy) |
| deliberation.finalLevelLabel | Niveau définitif (conseil) | Lentam-pahaizana farany (filan-kevitra) |
| deliberation.currentLabel | Actuel: {niveau} | Ankehitriny: {niveau} |
| deliberation.undefinedLevel | Non défini | Tsy voafaritra |
| deliberation.finalDecisionLabel | Décision finale | Fanapahan-kevitra farany |
| deliberation.approveButton | ✅ Valider | ✅ Manamarina |
| deliberation.rejectButton | ❌ Rejeter | ❌ Mandà |
| deliberation.resetToPendingButton | ⏳ Remettre en attente | ⏳ Ampidino ho miandry indray |
| deliberation.viewAllDetailsLink | Voir tous les détails → | Jereo ny antsipiriany rehetra → |
| deliberation.selectStudentTitle | Sélectionnez un étudiant | Misafidiana mpianatra iray |
| deliberation.selectStudentHint | Cliquez sur un étudiant dans la liste pour commencer la délibération | Tsindrio ny mpianatra iray ao amin'ny lisitra mba hanombohana ny fifampidinihana |
| deliberation.statsTitle | Statistiques de délibération | Antontan'isa momba ny fifampidinihana |
| deliberation.statsPending | En attente: | Miandry: |
| deliberation.statsApproved | Validées: | Voamarina: |
| deliberation.statsRejected | Rejetées: | Nolavina: |
| deliberation.statusUpdateAlert | Statut mis à jour: {status} | Voaova ny sata: {status} |
| deliberation.updateErrorAlert | Erreur lors de la mise à jour | Hadisoana teo am-panovana |
| deliberation.levelUpdateAlert | Niveau définitif mis à jour: {niveau} | Voaova ny ambaratonga farany: {niveau} |

## Gestion des classes

| Clé | Français | Malgache |
|---|---|---|
| classes.title | Gestion des classes | Fitantanana ny kilasy |
| classes.newClassTitle | Nouvelle classe | Kilasy vaovao |
| classes.nameLabel | Nom | Anarana |
| classes.namePlaceholder | Ex: M-LUNDI-18H-A1 | Ohatra: M-LUNDI-18H-A1 |
| classes.levelLabel | Niveau | Lentam-pahaizana |
| classes.ageRangeLabel | Tranche d'âge | Sokajy taona |
| classes.ageRangePlaceholder | Ex: Enfants, Adultes | Ohatra: Ankizy, Olon-dehibe |
| classes.maxCapacityLabel | Capacité max | Fetra isan'olona |
| classes.dayLabel | Jour | Andro |
| classes.monday | Lundi | Alatsinainy |
| classes.tuesday | Mardi | Talata |
| classes.wednesday | Mercredi | Alarobia |
| classes.thursday | Jeudi | Alakamisy |
| classes.friday | Vendredi | Zoma |
| classes.saturday | Samedi | Sabotsy |
| classes.timeLabel | Heure | Ora |
| classes.timePlaceholder | Ex: 18:00 | Ohatra: 18:00 |
| classes.durationLabel | Durée (minutes) | Faharetana (minitra) |
| classes.videoAccountLabel | Compte visio | Kaonty Zoom iza sa jitsi |
| classes.noneOption | — Aucun — | — Tsy misy — |
| classes.videoLinkLabel | Lien visio | Rohy Zoom na jitsi |
| classes.videoLinkPlaceholder | https://... | https://... |
| classes.teachersLabel | Enseignants | Mpampianatra |
| classes.teachersPlaceholder | Un nom par ligne, ou séparés par des virgules | Anarana iray isaky ny andalana, na sarahin'ny faingo |
| classes.conflictWarning | ⚠️ Ce compte est déjà utilisé à ce créneau par la classe {nom}. La création reste possible, mais vérifiez qu'il n'y a pas de conflit réel. | ⚠️ Efa ampiasain'ny kilasy {nom} amin'ity fotoana ity  kaonty ity. Azo atao ihany ny mamorona, kanefa hamarino raha tsy misy fifanitsahana marina. |
| classes.creatingButton | Création... | Eo am-pamoronana... |
| classes.createButton | Créer la classe | Mamorona ny kilasy |
| classes.tableName | Nom | Anarana |
| classes.tableLevel | Niveau | Lentam-pahaizana |
| classes.tableAgeRange | Tranche d'âge | Sokajy taona |
| classes.tableDay | Jour | Andro |
| classes.tableTime | Heure | Ora |
| classes.tableCapacity | Capacité | Fetra |
| classes.tableVideoAccount | Compte visio | Kaonty Zoom iza sa jitsi |
| classes.tableTeachers | Enseignants | Mpampianatra |
| classes.noClassesYet | Aucune classe créée pour le moment. | Tsy misy kilasy voaforona ankehitriny. |
| classes.createErrorAlert | Erreur lors de la création : {message} | Hadisoana teo am-pamoronana : {message} |

## Rapports

| Clé | Français | Malgache |
|---|---|---|
| reports.title | Rapports | Tatitra |
| reports.inscriptionsTitle | Inscriptions | Fisoratana anarana |
| reports.classesTitle | Classes | Kilasy |
| reports.paymentsTitle | Paiements | Fandoavam-bola |
| reports.downloadCsvButton | Télécharger CSV | Alao CSV |
| reports.printButton | Imprimer | Manonta |
| reports.filterStatus | Statut | Sata |
| reports.filterAllStatuses | Tous les statuts | Sata rehetra |
| reports.filterLevel | Niveau | Lentam-pahaizana |
| reports.filterAllLevels | Tous les niveaux | Lentam-pahaizana rehetra |
| reports.noData | Aucune donnée | Tsy misy angona |
| reports.colStudentCode | Code étudiant | Kaody mpianatra |
| reports.colName | Nom | Anarana |
| reports.colFirstName | Prénom | Fanampin'anarana |
| reports.colEmail | Email | Mailaka |
| reports.colPhone | Téléphone | Laharan-tariby |
| reports.colCountry | Pays | Firenena |
| reports.colSuggestedLevel | Niveau suggéré | Lentam-pahaizana voatolotra |
| reports.colFinalLevel | Niveau définitif | Lentam-pahaizana farany |
| reports.colStatus | Statut | Sata |
| reports.colAssignedClass | Classe attribuée | Kilasy nomena |
| reports.colPaymentStatus | Statut paiement | Sataon'ny fandoavam-bola |
| reports.colRegistrationDate | Date d'inscription | Daty nisoratana anarana |
| reports.colLevel | Niveau | Lentam-pahaizana |
| reports.colAgeRange | Tranche d'âge | Sokajy taona |
| reports.colDay | Jour | Andro |
| reports.colTime | Heure | Ora |
| reports.colMaxCapacity | Capacité max | Fetra isan'olona |
| reports.colEnrolledCount | Nombre d'inscrits | Isan'ny mpianatra voasoratra |
| reports.colTeachers | Enseignants | Mpampianatra |
| reports.colVideoAccount | Compte visio | Kaonty Zoom iza sa jitsi |
| reports.colCandidateName | Nom du candidat | Anaran'ny mpandray anjara |
| reports.colAmount | Montant | Vola |
| reports.colDate | Date | Daty |
| reports.colMode | Mode | Fomba |
| reports.paymentStatusPending | En attente | Miandry |
| reports.paymentStatusPaid | Payé | Voaloa |

## Email de notification interne (nouvelle inscription)

| Clé | Français | Malgache |
|---|---|---|
| emailAdminNotification.subject | [Nouvelle inscription] {code} - {prenom} {nom} | [Fisoratana anarana vaovao] {code} - {prenom} {nom} |
| emailAdminNotification.heading | Nouvelle inscription FTM | Fisoratana anarana vaovao FTM |
| emailAdminNotification.studentCodeLabel | Code étudiant | Kaody mpianatra |
| emailAdminNotification.emailLabel | Email | Mailaka |
| emailAdminNotification.phoneLabel | Téléphone | Laharan-tariby |
| emailAdminNotification.ageLabel | Âge | Taona |
| emailAdminNotification.ageYears | {age} ans | {age} taona |
| emailAdminNotification.suggestedLevelLabel | Niveau suggéré | Lentam-pahaizana voatolotra |
| emailAdminNotification.viewDetailsButton | 👁️ Voir les détails de l'inscription | 👁️ Jereo ny antsipirian'ny fisoratana anarana |
| emailAdminNotification.autoNotice | Cette notification a été envoyée automatiquement par le système d'inscription FTM. | Nalefan'ny rafi-pisoratana anaran'ny FTM ho azy ity fampahafantarana ity. |
