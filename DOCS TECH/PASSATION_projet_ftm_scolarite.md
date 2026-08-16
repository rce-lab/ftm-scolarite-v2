# FTM Scolarité — Document de passation (session suivante)

Ce document résume l'état complet du projet pour reprendre le travail dans une
nouvelle conversation, sans perdre le contexte accumulé. À coller/uploader en
tout début de la prochaine session.

## Rôle de Claude sur ce projet

Claude agit comme analyste/architecte technique. L'exécution du code se fait
via **Claude Code (CC)**, un outil agentique séparé que Charles utilise en
local sur sa machine (Windows, dossier `D:\ftm-scolarite-v2`). Claude écrit des
prompts précis et scopés que Charles copie-colle dans CC, puis relaie les
réponses de CC à Claude pour validation/suite.

**Règles de prompt établies (à respecter strictement) :**
- Toujours lister les fichiers concernés EXACTEMENT, avec la consigne "ne
  touche à rien d'autre que ces fichiers"
- Demander à CC de lister les fichiers modifiés à la fin de chaque tâche
- Si CC signale une divergence entre le prompt et le code réel, ou une
  ambiguïté : CC doit signaler plutôt qu'improviser — c'est le comportement
  voulu, à encourager
- **Leçon apprise (deux incidents de perte de travail)** : après que CC annonce
  une tâche terminée, vérifier la présence réelle du code AVANT de commiter,
  via une recherche ciblée (`Select-String -Path "chemin" -Pattern "élément
  attendu"` en PowerShell, équivalent de `grep`). Ne jamais supposer qu'un
  changement testé "ça marche" a bien été commité — toujours vérifier
  `git status` et `git log --oneline` en cas de doute avant d'enchaîner sur un
  nouveau prompt
- Après chaque prompt réussi et vérifié : `git add -A && git commit -m "..."
  && git push` immédiatement, avant de passer au prompt suivant (Vercel
  redéploie automatiquement sur push)
- Tester sur l'URL déployée réelle (pas seulement en local), avec
  rechargement forcé (Ctrl+Maj+R)

## Infrastructure

| Composant | Détail |
|---|---|
| Code | GitHub `rce-lab/ftm-scolarite-v2`, branche `main` |
| Hébergement | Vercel (déploiement auto sur push), compte lié à `cramamonjisoa-5126s-projects` |
| URLs publiques | `inscription.ftmala.fr` et `inscriptions.ftmala.fr` (les deux, alias identiques) + `ftm-scolarite-v2.vercel.app` en secours |
| Base de données | Supabase, projet `ypzzsfjxddyipdwchmaj` (nouveau projet — l'ancien `ttmmxmiytpdnzcpdzczw` est en pause, abandonné) |
| Emails | Resend, domaine `ftmala.fr` vérifié (SPF/DKIM/DMARC dans les DNS Wix) — envoi possible vers n'importe qui |
| Stockage fichiers | Bucket Supabase Storage privé `photos-candidats` |
| Domaine | `ftmala.fr` appartient à la FTM, DNS géré via Wix (accès à demander à Charles si besoin, 2FA sur le téléphone d'un collègue parfois indisponible) |

**Sécurité — clé `service_role`** : jamais utilisée dans l'application
déployée. Utilisée uniquement via des scripts Node.js locaux ponctuels
(`create_comptes.js`, `reset_password.js`) exécutés par Charles lui-même,
jamais commités dans Git.

## Modèle de rôles (8 rôles, RLS réelle par action — pas des "niveaux" génériques)

| Rôle | Personne(s) | Droits |
|---|---|---|
| `organisation_it` | Charles (compte principal) · RAZAFINDRAKOTO Carol · RANAIVOARISOA Gino | Accès total |
| `responsable_scolarite` | FOCARD Liva | Valider/modifier inscriptions, affecter classes |
| `responsable_administratif` | RAKOTONIRINA Sonya | Mêmes droits que Scolarité + marquer paiements |
| `comptable` | RAKOTOMAVO Tafika (aussi président, mais un seul rôle actif choisi : comptable) | Marquer les paiements (fonction Postgres dédiée `marquer_inscription_payee`) |
| `responsable_communication` | ANDRIANTODY Joelle · RAMELINTSOA Carole Joëlle | Lecture inscriptions, log des relances |
| `responsable_etudes` | RANJATOHERY Harilala | Lecture seule |
| `direction` | RAZAFINTSALAMA Rolland · ANDRIMIARINA Andrymann | Lecture seule |
| `enseignant` | Aucun compte pour ce module — décision saisie par Scolarité/Administratif | — |

**Connexion** : identifiant = `prenom.nom` (l'app ajoute `@ftm.local`
automatiquement si pas de `@` tapé). Mot de passe par défaut à la création :
`FtmScolarite2026!`. Un flag `must_change_password` sur `utilisateurs` force un
passage par `/change-password` à la première connexion (fonctionnel et testé).

## Internationalisation — DEUX systèmes séparés, ne pas les confondre

1. **Interne (FR/MG)** — écrans admin/teacher/login : `src/lib/i18n/translations.ts` +
   `src/lib/i18n/LanguageContext.tsx`, hook `useTranslation()`. Sélecteur dans
   `InternalNav`. Persistance `localStorage['ftm_language']`. Traductions
   malgaches validées par Charles (locuteur natif) ; ~5% restent à affiner en
   continu, marquées "brouillon" quand nouvelles.
2. **Public (FR/EN)** — formulaire d'inscription + page d'accueil + page de
   confirmation : `src/lib/i18n/publicTranslations.ts` +
   `src/lib/i18n/PublicLanguageContext.tsx`, hook `usePublicTranslation()`.
   Lien "English version"/"Version française". Persistance
   `localStorage['ftm_public_language']`. Terminologie : CECRL → CEFR, niveaux
   Découverte/Intermédiaire/Seuil/Avancé/Autonome/Maîtrise →
   Discovery/Intermediate/Threshold/Advanced/Autonomous/Mastery.

Ne jamais mélanger ces deux systèmes ni réutiliser l'un dans les fichiers de
l'autre périmètre.

## Branding

Logo : `src/app/public/logo FTM officiel 2024.jpeg`. Couleurs : vert `#689e4e`
(action principale), rouge terracotta `#b03c2d` (accent secondaire). Appliqué
partout (accueil, login, formulaire, écrans internes).

## Statuts d'inscription

Centralisés dans `src/lib/statuts.ts` (`STATUT_LABELS`, `getStatutLabel(status,
{ emoji? })`). Valeurs techniques (clés françaises, pas anglaises malgré
l'historique) : `pending_review`, `approved`, `rejected`, `payment_pending`.
Toujours réutiliser cette fonction pour afficher un statut, ne jamais recréer
de mapping local.

## Tables principales

`inscriptions` (dossier candidat, avec `photo_url`, `indicatif_pays`,
`eleve_id`, `classe_id`, `statut_paiement`), `classes`, `comptes_visio` (3
comptes Zoom : FTM, Charles, Président — détection de chevauchement de
créneau), `paiements` (historique), `utilisateurs` (8 rôles,
`must_change_password`), `configuration` (paramètres éditables : montant
inscription, emails de notification, année scolaire, RIB, adresse
association...), `notifications_log`, **`inscriptions_archive`** (nouveau,
336 lignes historiques 2023-2026 importées et vérifiées — voir section
suivante).

## Écrans construits

`/` (accueil bilingue), `/login`, `/change-password`, `/admin` (dashboard),
`/admin/inscriptions` (liste + détail `[code]`), `/admin/payments`,
`/admin/parametres`, `/admin/rapports` (export CSV + impression : inscriptions,
classes, paiements), `/teacher/deliberation`, `/teacher/classes`,
`/public/inscription` (5 étapes + grille CECRL/CEFR bilingue), `/public/confirmation`.

`/admin/students` reste une coquille vide — en attente d'informations (voir
points ouverts).

## Historique importé — `inscriptions_archive` (fait, vérifié)

336 lignes (2023-2024 à 2025-2026), consolidées et nettoyées depuis les
exports bruts AllCounted. Vérifications post-import toutes correctes : 265
`keep` (dossiers réellement actifs), 49 `archive_abandon` (essais interrompus),
22 `archive_doublon` (resoumissions) ; 248 élèves uniques (`eleve_id`), dont 15
réinscrits sur plusieurs années (31 lignes, puisqu'un réinscrit a une ligne par
année) ; 5 groupes (11 lignes) signalés `identite_a_verifier` (même nom,
emails différents — vraisemblablement la même personne selon la progression
d'âge observée, mais jamais confirmé formellement) ; `code_inscription` vide
pour les 71 lignes archivées (normal, seuls les dossiers actifs en avaient un
à l'époque).

## PROCHAINE TÂCHE — Écran de consultation de l'historique

Charles veut un écran (nouveau, ex: `/admin/historique` ou intégré à
`/admin/rapports`) qui :
- Liste le contenu de `inscriptions_archive`, avec une explication claire de
  ce qu'elle contient (candidats de 2023 à 2026, avant la nouvelle
  application) affichée en tête d'écran
- Permet de **filtrer/rechercher** (par nom, par année)
- Signale visuellement les lignes `identite_a_verifier = true` et permet de
  les **marquer comme résolues** (vrai doublon fusionné, ou confirmé comme
  deux personnes distinctes) — Charles compte déléguer ce nettoyage à
  quelqu'un d'autre, donc l'écran doit être utilisable par une personne qui
  découvre les données, pas juste par Charles
- Affiche des **agrégats utiles** : nombre d'inscriptions par année, taux de
  croissance, nombre de réinscriptions, répartition par pays/niveau — utile
  pour des besoins futurs de l'association (ex: statistiques pour une
  manifestation)
- Accès : probablement ouvert à tous les rôles internes en lecture (comme
  Rapports), avec l'action de "résolution" réservée à IT/Scolarité — à
  confirmer avec Charles au moment de scoper le prompt

C'est la tâche à traiter en priorité à la reprise, sauf si Charles indique
autre chose en début de nouvelle session.

## Autres points ouverts

- **Liste des élèves par classe** + écran `/admin/students` réel — bloqué,
  en attente d'informations de FOCARD Liva (Responsable Scolarité) sur les
  classes/enseignants/élèves existants actuellement
- ~5% des traductions malgaches à affiner en continu (Charles corrige lui-même
  `TRADUCTIONS_A_FAIRE.md` à la racine du projet, puis répercuter dans
  `src/lib/i18n/translations.ts` au besoin)

## Module 2 (hors périmètre actuel, à concevoir plus tard)

Rappel de paiement automatique (tâche planifiée), tableau de bord Direction
(tendances dans le temps), interface élève, progression pédagogique
enseignants, calendrier/Zoom avancé, gestion des comptes utilisateurs
directement dans l'app (actuellement via script local avec `service_role`).

## Documents de référence déjà partagés avec Charles

- `FTM_Scolarite_Specifications_Module1_Inscriptions_v3.docx` — spécifications
  fonctionnelles à jour
- `TRADUCTIONS_A_FAIRE.md` — à la racine du projet local, suivi des
  traductions malgaches
- `FTM_inscriptions_consolidees_2023-2026.csv` — source de l'import archive
  (déjà utilisée, gardée pour référence)
