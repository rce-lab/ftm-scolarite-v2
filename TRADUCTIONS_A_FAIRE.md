# Traductions à faire — FTM Scolarité

**⚠️ Ces traductions sont un premier jet automatique, non fiable — à vérifier intégralement par un locuteur natif avant toute mise en production. Ne pas utiliser tel quel.**

Ce document recense les textes visibles par un humain dans les écrans **internes** de l'application (admin, enseignants, connexion) et dans la **notification interne** envoyée par email, avec une proposition de traduction malgache à faire vérifier. Un tableau par écran/fichier. Les textes dynamiques (variables insérées) sont indiqués entre accolades `{...}` ; seule la partie fixe du texte doit être traduite, la structure de la phrase autour de la variable devra être adaptée par le traducteur si l'ordre des mots diffère en malgache.

**Important — périmètre volontairement restreint :** le public candidat (formulaire d'inscription, grille CECRL, page de confirmation, page d'accueil, et tous les emails envoyés à un candidat) ne parle pas encore malgache. Cette partie reste en français et n'est **pas listée** dans ce document, sur demande explicite — ce n'est pas un oubli.

---

## Périmètre de ce document

Parcouru :
- `src/app/login/page.tsx`
- `src/app/admin/**` (tableau de bord, inscriptions liste + détail, paiements, paramètres, étudiants)
- `src/app/teacher/**` (délibération, classes)
- `src/components/InternalNav.tsx`
- `src/lib/emailService.ts` — **uniquement** la notification interne envoyée aux responsables (fonction `sendInscriptionNotification`, deuxième email de la fonction, celui envoyé à `adminEmails`)

**Explicitement exclu (candidat, pas encore traduit) :**
- Tout `src/app/public/**` (formulaire d'inscription en 5 étapes, grille des 105 compétences CECRL, page de confirmation)
- `src/app/page.tsx` (page d'accueil publique)
- Dans `src/lib/emailService.ts` : l'email de confirmation envoyé au candidat (première partie de `sendInscriptionNotification`), ainsi que `sendDecisionEmail` et `sendPaymentConfirmation` en entier — tous les trois s'adressent au candidat.
- `admin/layout.tsx` et `teacher/layout.tsx` — uniquement `<InternalNav />` + contenu de la page, aucun texte propre à traduire (déjà couvert par la section InternalNav ci-dessous).
- `src/app/communication/page.tsx` — non listé dans le périmètre demandé (`src/app/admin/**` ne l'inclut pas, c'est une route indépendante).

---

## Page de connexion

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| FTM - Connexion | FTM - Fidirana | |
| Email | Mailaka | |
| admin@ftm.local *(placeholder)* | admin@ftm.local | Exemple technique |
| Mot de passe | Tenimiafina | |
| Admin123! *(placeholder)* | Admin123! | Exemple technique |
| Connexion... | Eo am-piditra... | |
| Se connecter | Hiditra | |
| Erreur : {message} | Hadisoana : {message} | |
| Logo FTM *(texte alternatif image)* | Sarin'ilay FTM | Texte alternatif d'accessibilité |

---

## Barre de navigation interne (InternalNav)

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Tableau de bord | Tabilao fitantanana | |
| Inscriptions | Fisoratana anarana | |
| Délibération | Fifampidinihana | Incertain |
| Classes | Kilasy | |
| Paiements | Fandoavam-bola | |
| Paramètres | Fandrindrana | |
| Accès non autorisé pour votre rôle *(info-bulle sur item grisé)* | Tsy manana alalana ianao araka ny anjara asanao | |
| Déconnexion | Fivoahana | |
| Logo FTM *(texte alternatif image)* | Sarin'ilay FTM | |

---

## Tableau de bord admin

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Tableau de bord | Tabilao fitantanana | |
| Total inscriptions | Fitambaran'ny fisoratana anarana | |
| En attente de validation | Miandry fanamarinana | |
| Voir les inscriptions → | Jereo ny fisoratana anarana → | |
| Inscriptions validées | Fisoratana anarana voamarina | |
| Paiements en attente | Fandoavam-bola miandry | |
| Gérer les paiements → | Mitantana ny fandoavam-bola → | |
| Dernières inscriptions | Fisoratana anarana farany | |
| Code | Kaody | En-tête de tableau |
| Nom | Anarana | En-tête de tableau |
| Niveau | Ambaratonga | En-tête de tableau |
| Date | Daty | En-tête de tableau |
| Statut | Sata | En-tête de tableau |
| Action | Hetsika | En-tête de tableau |
| Voir → | Jereo → | |
| Voir toutes les inscriptions → | Jereo ny fisoratana anarana rehetra → | |
| Actions rapides | Hetsika haingana | |
| ⏳ Valider les inscriptions en attente | ⏳ Manamarina ny fisoratana anarana miandry | |
| 👨‍🎓 Gérer les étudiants | 👨‍🎓 Mitantana ny mpianatra | |
| 💰 Suivi des paiements | 💰 Fanaraha-maso ny fandoavam-bola | |
| ⚙️ Paramètres | ⚙️ Fandrindrana | |
| Statistiques par niveau | Antontan'isa araka ny ambaratonga | |
| Niveau | Ambaratonga | Sous-libellé dans chaque tuile A1-C2 |
| étudiants | mpianatra | |

**Note technique (pas une chaîne à traduire à proprement parler) :** dans `admin/inscriptions/page.tsx`, le statut d'une inscription est actuellement affiché tel quel via `{inscription.status}` (valeurs techniques : `pending_review`, `approved`, `rejected`, `payment_pending`), sans libellé français traduit. Probablement un oubli côté code — signalé pour information, à corriger séparément avant de s'en préoccuper pour la traduction.

---

## Gestion des inscriptions — Liste

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Gestion des inscriptions | Fitantanana ny fisoratana anarana | |
| + Nouvelle inscription | + Fisoratana anarana vaovao | |
| Toutes | Rehetra | Filtre |
| En attente | Miandry | Filtre |
| Validées | Voamarina | Filtre |
| Paiements en attente | Fandoavam-bola miandry | Filtre |
| Rejetées | Nolavina | Filtre |
| Code | Kaody | En-tête de tableau |
| Nom | Anarana | En-tête de tableau |
| Email | Mailaka | En-tête de tableau |
| Niveau | Ambaratonga | En-tête de tableau |
| Date | Daty | En-tête de tableau |
| Statut | Sata | En-tête de tableau, voir note technique dans la section Tableau de bord |
| Actions | Hetsika | En-tête de tableau |
| Voir → | Jereo → | |

---

## Gestion des inscriptions — Détail

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Inscription non trouvée | Tsy hita ny fisoratana anarana | |
| Le code étudiant {code} n'existe pas. | Tsy misy ny kaody mpianatra {code}. | |
| ← Retour à la liste | ← Miverina any amin'ny lisitra | |
| ⏳ En attente de validation | ⏳ Miandry fanamarinana | |
| ✅ Inscription validée | ✅ Voamarina ny fisoratana anarana | |
| ❌ Inscription rejetée | ❌ Nolavina ny fisoratana anarana | |
| 💰 Paiement en attente | 💰 Miandry fandoavam-bola | |
| Inscrit le {date} | Voasoratra tamin'ny {date} | |
| Informations personnelles | Mombamomba manokana | |
| Nom | Anarana | |
| Prénom | Fanampin'anarana | |
| Âge | Taona | |
| {age} ans | {age} taona | |
| Email | Mailaka | |
| Téléphone | Laharan-tariby | |
| Évaluation et décision | Fanombanana sy fanapahan-kevitra | |
| Niveau suggéré (auto) | Ambaratonga voatolotra (ho azy) | |
| Calculé automatiquement | Voakajy ho azy | |
| Niveau définitif | Ambaratonga farany | |
| Classe attribuée | Kilasy nomena | |
| — Aucune classe — | — Tsy misy kilasy — | |
| Notes administratives | Fanamarihana ara-pitantanana | |
| Notes internes pour cette inscription... *(placeholder)* | Fanamarihana anatiny ho an'ity fisoratana anarana ity... | |
| Enregistrer les modifications | Tahirizo ny fanovana | |
| Statistiques détaillées | Antontan'isa amin'ny antsipiriany | |
| Niveau | Ambaratonga | En-tête de tableau |
| Score | Isa | En-tête de tableau |
| Questions | Fanontaniana | En-tête de tableau |
| % Score | % Isa | En-tête de tableau |
| Seuil | Fetra | En-tête de tableau |
| Statut | Sata | En-tête de tableau |
| Atteint | Tratra | |
| Non atteint | Tsy tratra | |
| Actions | Hetsika | |
| ✅ Valider l'inscription | ✅ Manamarina ny fisoratana anarana | |
| 💰 Marquer comme "Paiement en attente" | 💰 Mariho hoe "Miandry fandoavam-bola" | |
| ❌ Rejeter l'inscription | ❌ Mandà ny fisoratana anarana | |
| 💰 Paiement en attente | 💰 Miandry fandoavam-bola | |
| ✅ Paiement confirmé | ✅ Voamarina ny fandoavam-bola | |
| 🖨️ Imprimer cette page | 🖨️ Manonta ity pejy ity | |
| 📧 Envoyer un email | 📧 Mandefa mailaka | Bouton pointant vers une route `/email` qui ne semble pas exister — signalé pour info, hors périmètre de la traduction |
| Historique | Tantara | |
| Création | Namorona | |
| Dernière modification | Fanovana farany | |
| Résumé des réponses | Famintinana ny valiny | |
| Total questions | Fitambaran'ny fanontaniana | |
| Réponses OUI | Valiny ENY | |
| Réponses UN PEU | Valiny KELY | |
| Réponses NON | Valiny TSIA | |
| Modifications enregistrées avec succès | Voatahiry soa aman-tsara ny fanovana | Message d'alerte navigateur |
| Erreur lors de l'enregistrement | Hadisoana teo am-pitahirizana | Message d'alerte navigateur |
| Voulez-vous vraiment changer le statut en "{status}" ? | Tena tianao hovana ho "{status}" ve ny sata ? | Message de confirmation navigateur |
| Statut mis à jour avec succès | Voavaozina soa aman-tsara ny sata | Message d'alerte navigateur |
| Erreur lors de la mise à jour | Hadisoana teo am-panavaozana | Message d'alerte navigateur |

---

## Suivi des paiements

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Suivi des paiements | Fanaraha-maso ny fandoavam-bola | |
| En attente ({n}) | Miandry ({n}) | Onglet |
| Historique des paiements | Tantaran'ny fandoavam-bola | Onglet |
| Nom | Anarana | En-tête de tableau |
| Code | Kaody | En-tête de tableau |
| Classe | Kilasy | En-tête de tableau |
| Email | Mailaka | En-tête de tableau |
| Montant attendu | Vola andrasana | En-tête de tableau |
| Action | Hetsika | En-tête de tableau |
| Marquer payé | Mariho ho voaloa | Bouton |
| Aucun paiement en attente. | Tsy misy fandoavam-bola miandry. | |
| Candidat | Mpandray anjara | En-tête de tableau |
| Code | Kaody | En-tête de tableau |
| Montant | Vola | En-tête de tableau |
| Date | Daty | En-tête de tableau |
| Mode | Fomba | En-tête de tableau |
| Aucun paiement enregistré pour le moment. | Tsy misy fandoavam-bola voatahiry ankehitriny. | |
| Confirmer le paiement | Manamarina ny fandoavam-bola | Titre de la fenêtre modale |
| Montant (€) | Vola (€) | |
| Mode de paiement | Fomba fandoavana | |
| Virement | Famindrana vola | |
| Espèces | Vola mivantana | |
| Autre | Hafa | |
| Annuler | Foano | |
| Enregistrement... | Eo am-pitahirizana... | |
| Confirmer le paiement | Manamarina ny fandoavam-bola | Bouton |
| Erreur lors de l'enregistrement du paiement : {message} | Hadisoana teo am-pitahirizana ny fandoavam-bola : {message} | Message d'alerte navigateur |

---

## Paramètres

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Paramètres | Fandrindrana | |
| Frais d'inscription (€) | Sarany fisoratana anarana (€) | |
| Email de contact/communication | Mailaka fifandraisana | |
| Année scolaire courante | Taom-pianarana ankehitriny | |
| AAAA-AAAA *(placeholder)* | AAAA-AAAA | Format technique, à garder tel quel |
| Préfixe des codes étudiants | Sombin-teny mialoha ny kaodin'ny mpianatra | Incertain |
| RIB bancaire | RIB banky | |
| Bénéficiaire (nom sur le compte) | Mpandray (anarana amin'ny kaonty) | |
| Email Responsable Scolarité | Mailakan'ny Tompon'andraikitra Fianarana | |
| Email Responsable Administratif | Mailakan'ny Tompon'andraikitra Fitantanana | |
| Adresse de l'association | Adiresin'ny fikambanana | |
| Paramètres enregistrés avec succès. | Voatahiry soa aman-tsara ny fandrindrana. | |
| Une erreur est survenue lors de la sauvegarde. | Nisy hadisoana teo am-pitahirizana. | |
| Enregistrement... | Eo am-pitahirizana... | |
| Enregistrer | Tahirizo | |

---

## Gestion des étudiants

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Gestion des étudiants | Fitantanana ny mpianatra | |
| Page en construction. Gestion des étudiants à venir. | Pejy mbola atao. Ho avy ny fitantanana ny mpianatra. | Écran encore une coquille vide (non développé) |

---

## Délibération enseignants

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Conseil des enseignants - Délibération | Filan-kevitry ny mpampianatra - Fifampidinihana | |
| En attente | Miandry | Filtre |
| Validées | Voamarina | Filtre |
| Rejetées | Nolavina | Filtre |
| Toutes | Rehetra | Filtre |
| Étudiant | Mpianatra | En-tête de tableau |
| Niveau suggéré | Ambaratonga voatolotra | En-tête de tableau |
| Statut | Sata | En-tête de tableau |
| Date | Daty | En-tête de tableau |
| Actions | Hetsika | En-tête de tableau |
| ⏳ En attente | ⏳ Miandry | |
| ✅ Validé | ✅ Voamarina | |
| ❌ Rejeté | ❌ Nolavina | |
| Délibérer → | Mifampidinika → | |
| Délibération | Fifampidinihana | Titre du panneau |
| Code: {code} | Kaody: {code} | |
| Niveau suggéré (auto) | Ambaratonga voatolotra (ho azy) | |
| Niveau définitif (conseil) | Ambaratonga farany (filan-kevitra) | |
| Actuel: {niveau} | Ankehitriny: {niveau} | |
| Non défini | Tsy voafaritra | |
| Décision finale | Fanapahan-kevitra farany | |
| ✅ Valider | ✅ Manamarina | |
| ❌ Rejeter | ❌ Mandà | |
| ⏳ Remettre en attente | ⏳ Ampidino ho miandry indray | |
| Voir tous les détails → | Jereo ny antsipiriany rehetra → | |
| Sélectionnez un étudiant | Misafidiana mpianatra iray | |
| Cliquez sur un étudiant dans la liste pour commencer la délibération | Tsindrio ny mpianatra iray ao amin'ny lisitra mba hanombohana ny fifampidinihana | |
| Statistiques de délibération | Antontan'isa momba ny fifampidinihana | |
| En attente: | Miandry: | |
| Validées: | Voamarina: | |
| Rejetées: | Nolavina: | |
| Statut mis à jour: {status} | Voavaozina ny sata: {status} | Message d'alerte navigateur |
| Erreur lors de la mise à jour | Hadisoana teo am-panavaozana | Message d'alerte navigateur |
| Niveau définitif mis à jour: {niveau} | Voavaozina ny ambaratonga farany: {niveau} | Message d'alerte navigateur |

---

## Gestion des classes

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| Gestion des classes | Fitantanana ny kilasy | |
| Nouvelle classe | Kilasy vaovao | |
| Nom | Anarana | |
| Ex: M-LUNDI-18H-A1 *(placeholder)* | Ohatra: M-LUNDI-18H-A1 | Format technique, à garder tel quel |
| Niveau | Ambaratonga | |
| Tranche d'âge | Sokajy taona | |
| Ex: Enfants, Adultes *(placeholder)* | Ohatra: Ankizy, Olon-dehibe | |
| Capacité max | Fetra isan'olona | |
| Jour | Andro | |
| Lundi | Alatsinainy | |
| Mardi | Talata | |
| Mercredi | Alarobia | |
| Jeudi | Alakamisy | |
| Vendredi | Zoma | |
| Samedi | Sabotsy | |
| Heure | Ora | |
| Ex: 18:00 *(placeholder)* | Ohatra: 18:00 | |
| Durée (minutes) | Faharetana (minitra) | |
| Compte visio | Kaonty visio | |
| — Aucun — | — Tsy misy — | |
| Lien visio | Rohy visio | |
| https://... *(placeholder)* | https://... | Format technique |
| Enseignants | Mpampianatra | |
| Un nom par ligne, ou séparés par des virgules *(placeholder)* | Anarana iray isaky ny andalana, na sarahin'ny faingo | |
| ⚠️ Ce compte est déjà utilisé à ce créneau par la classe {nom}. La création reste possible, mais vérifiez qu'il n'y a pas de conflit réel. | ⚠️ Efa ampiasain'ny kilasy {nom} amin'ity fotoana ity ity kaonty ity. Azo atao ihany ny mamorona, kanefa hamarino raha tsy misy fifanoherana marina. | |
| Création... | Eo am-pamoronana... | |
| Créer la classe | Mamorona ny kilasy | |
| Nom | Anarana | En-tête de tableau |
| Niveau | Ambaratonga | En-tête de tableau |
| Tranche d'âge | Sokajy taona | En-tête de tableau |
| Jour | Andro | En-tête de tableau |
| Heure | Ora | En-tête de tableau |
| Capacité | Fetra | En-tête de tableau |
| Compte visio | Kaonty visio | En-tête de tableau |
| Enseignants | Mpampianatra | En-tête de tableau |
| Aucune classe créée pour le moment. | Tsy misy kilasy voaforona ankehitriny. | |
| Erreur lors de la création : {message} | Hadisoana teo am-pamoronana : {message} | Message d'alerte navigateur |

---

## Email — Notification nouvelle inscription (responsables, interne uniquement)

Ceci est le seul email traduit ici : le second envoi de `sendInscriptionNotification`, celui qui part vers `adminEmails` (les responsables internes). Le premier envoi de cette même fonction (email de confirmation au candidat) reste en français, hors périmètre.

| Texte français actuel | Traduction malgache (brouillon) | Notes |
|---|---|---|
| [Nouvelle inscription] {code} - {prenom} {nom} *(objet)* | [Fisoratana anarana vaovao] {code} - {prenom} {nom} | |
| Nouvelle inscription FTM | Fisoratana anarana vaovao FTM | |
| Code étudiant | Kaody mpianatra | Libellé de tableau |
| Email | Mailaka | Libellé de tableau |
| Téléphone | Laharan-tariby | Libellé de tableau |
| Âge | Taona | Libellé de tableau |
| {age} ans | {age} taona | |
| Niveau suggéré | Ambaratonga voatolotra | Libellé de tableau |
| 👁️ Voir les détails de l'inscription | 👁️ Jereo ny antsipirian'ny fisoratana anarana | Bouton dans l'email |
| Cette notification a été envoyée automatiquement par le système d'inscription FTM. | Nalefan'ny rafi-pisoratana anaran'ny FTM ho azy ity fampahafantarana ity. | |

---

## Résumé

Une bonne partie des libellés courts (Nom, Email, Téléphone, Niveau, Date, Statut, etc.) reviennent à l'identique sur plusieurs écrans — un futur système d'i18n pourra factoriser ces clés une seule fois plutôt que de les dupliquer comme ici où chaque écran est listé séparément par souci d'exhaustivité.

Je ne suis pas locuteur du malgache — les traductions ci-dessus sont une tentative de premier jet, pas un travail fiable. Merci de les faire relire intégralement avant tout usage réel.
