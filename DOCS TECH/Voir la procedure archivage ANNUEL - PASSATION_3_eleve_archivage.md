# FTM Scolarité — Table `eleve`, nettoyage archive, archivage annuel

*Session de suite (PASSATION / PASSATION_2)*

## 1. Contexte

Chantier réinscription : créer une notion d'**élève** stable dans le temps (matricule permanent), distincte de l'**inscription** (événement annuel). Nécessite au préalable un nettoyage de `inscriptions_archive` pour ne pas migrer de mauvaises données.

## 2. Règles de casse actées (rappel, déjà en vigueur ailleurs dans le projet)

- **Nom** → MAJUSCULES
- **Prénom** → casse de titre
- **Ville de résidence** → MAJUSCULES
- **Pays** → liste fermée
- **Adresse postale** → aucune transformation

## 3. Nettoyage `inscriptions_archive` effectué

- **`pays_residence`** : toutes variantes de casse/espaces fusionnées ; noms de pays traduits en malgache (Frantsa, Soisa, Italia, Belzika, Alemaina, Madagasikara, Torkia, Angletera, La Réunion, Norvezy, Maroc, Moldavy, Holandy, Gabon, Etazonia, Tanzania, Kanada) ; `Côte d'Ivoire` et `Luxembourg` laissés en l'état faute de traduction fiable ; `'null'` (texte) converti en vrai `NULL`.
- **`ville_residence`** : passage en MAJUSCULES (règle métier) + fusion des doublons orthographiques (accents, tirets, abréviations, coquilles type `GRADIGNANT`→`GRADIGNAN`, `LA CHAPELLE-SAINT-MESNIN`→`LA CHAPELLE-SAINT-MESMIN`).
- **`nom`** : MAJUSCULES + trim espaces. Cas Françoise Villemont uniformisé sur `VILLEMONT RAKOTOMANIRAKA RAVELONANOSY`.
- **`prenom`** : casse de titre (`INITCAP`) + trim espaces. Cas `Jahyana et Jahnaé` laissé tel quel (décision : ne pas séparer en 2 fiches).
- **`responsable_legal`** : casse de titre + trim. Valeurs non-noms (`Moi`, `Moi même`, `Etudiant(e)`, `/`, `Fpma Toulouse`, `Orthophoniste - Assistante En Chirurgie Dentaire`) mises à `NULL`.
- **Doublon Raberanto Johary (2024-2025)** : 2 soumissions la même année sous 2 emails différents (hotmail incomplète, gmail complète) → la incomplète requalifiée en `archive_doublon`.
- **5 groupes `identite_a_verifier=true`** (changement d'email d'une année sur l'autre, `eleve_id` resté cohérent) → flag levé (`false`) pour tous après résolution Raberanto.

## 4. Table `eleve` — créée et peuplée

```sql
CREATE TABLE eleve (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule text UNIQUE NOT NULL,        -- format FTM-000001, séquentiel par date de 1ère inscription
  eleve_id_archive text UNIQUE,          -- ancien identifiant ELV-XXXX de l'archive
  nom text NOT NULL,
  prenom text NOT NULL,
  date_premiere_inscription date NOT NULL,
  source_decouverte jsonb,               -- instantané figé de la 1ère inscription (voir §6)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

- Peuplée à partir des `eleve_id` distincts de `inscriptions_archive` (statut `keep`), un par personne, matricule attribué dans l'ordre de la date de première soumission.
- **Décision** : pas de dénormalisation de l'année/pays courant sur `eleve` — toujours passer par un JOIN avec `inscriptions`/`inscriptions_archive`.
- **Décision** : redondance nom/prénom/email/etc. entre `eleve` et chaque ligne d'inscription assumée et conservée — chaque inscription reste une photo figée du moment de la soumission ; `eleve` sert uniquement au regroupement/matricule/historique global.

## 5. Liens FK mis en place

- `inscriptions_archive.eleve_uuid` → `eleve(id)` (peuplé rétroactivement via `eleve_id_archive`)
- `inscriptions.eleve_id` (text, orpheline) supprimée puis recréée en `uuid REFERENCES eleve(id)`
- `inscriptions.is_reinscription boolean DEFAULT false` ajoutée

## 6. Nouveaux champs "source de découverte de la FTM"

Sur `inscriptions` :
```sql
connaitre_internet boolean
connaitre_evenement boolean
association_nom text          -- valeurs pilotées par configuration (clé 'associations_liste')
association_autre_detail text
evenement_nom text            -- valeurs pilotées par configuration (clé 'evenements_liste')
evenement_autre_detail text
```
Les 4 booléens déjà existants (`connaitre_connaissances`, `connaitre_ancien_eleve`, `connaitre_recommandation`, `connaitre_autre`+détail) sont conservés inchangés. Choix multiple autorisé.

Table `configuration` (clé/valeur) alimentée :
```sql
('associations_liste', '["FPMA", "FIMPIMA", "Autre"]')
('evenements_liste', '["RNS", "Autre"]')
```

Sur `eleve` : `source_decouverte jsonb` = instantané figé des réponses `connaitre_*` de la **première** inscription uniquement (pas remis à jour aux réinscriptions suivantes).

## 7. `inscriptions_archive` élargie (pour ne rien perdre à l'archivage annuel)

Colonnes ajoutées : `classe_attribuee`, `classe_id`, `statut_paiement`, `date_paiement`, `date_dernier_rappel`, `photo_url`, `scores_calculs`, `notes_admin`, `indicatif_pays`, `connaitre_internet`, `connaitre_evenement`, `association_nom`, `association_autre_detail`, `evenement_nom`, `evenement_autre_detail`, `is_reinscription`, `eleve_uuid`.

## 8. Fonctionnement retenu : archivage annuel (pas de table unique)

`inscriptions` reste la table du cycle en cours uniquement ; en fin/début d'année scolaire, tout est copié vers `inscriptions_archive` (avec `annee_scolaire` renseigné) puis `inscriptions` est vidée.

### Fonction `archiver_annee_scolaire()`

```sql
CREATE OR REPLACE FUNCTION archiver_annee_scolaire(p_annee_scolaire text, p_dry_run boolean DEFAULT true)
RETURNS TABLE(nb_lignes_a_archiver bigint, deja_archivee boolean) AS $$
DECLARE
  v_count_source bigint;
  v_count_dest bigint;
  v_deja_archivee boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM inscriptions_archive WHERE annee_scolaire = p_annee_scolaire) INTO v_deja_archivee;
  SELECT count(*) INTO v_count_source FROM inscriptions;

  IF p_dry_run THEN
    RETURN QUERY SELECT v_count_source, v_deja_archivee;
    RETURN;
  END IF;

  IF v_deja_archivee THEN
    RAISE EXCEPTION 'L''année % a déjà été archivée. Opération annulée.', p_annee_scolaire;
  END IF;

  INSERT INTO inscriptions_archive (
    annee_scolaire, eleve_id, eleve_uuid, code_inscription, nom, prenom, age,
    pays_residence, ville_residence, email, telephone, responsable_legal,
    date_soumission, niveau_calcule, reponses_cecrl_json,
    horaire_souhaite, motivation,
    classe_attribuee, classe_id, statut_paiement, date_paiement, date_dernier_rappel,
    photo_url, scores_calculs, notes_admin, indicatif_pays,
    connaitre_internet, connaitre_evenement, association_nom, association_autre_detail,
    evenement_nom, evenement_autre_detail, is_reinscription, statut_migration
  )
  SELECT
    p_annee_scolaire, e.eleve_id_archive, i.eleve_id, i.student_code, i.nom, i.prenom, i.age,
    i.pays_residence, i.ville_residence, i.email_contact, i.telephone, i.responsable_legal,
    i.created_at::text, COALESCE(i.niveau_definitif, i.niveau_suggere), i.reponses_competences::text,
    CASE WHEN i.horaire_soir THEN '["Soir"]'::jsonb
         WHEN i.horaire_apres_midi THEN '["Après-midi"]'::jsonb
         ELSE jsonb_build_array(i.horaire_autre_detail) END,
    (SELECT jsonb_agg(v) FROM (VALUES
       (CASE WHEN i.raison_maternelle THEN 'Langue maternelle' END),
       (CASE WHEN i.raison_competences THEN 'Développement compétences' END),
       (CASE WHEN i.raison_plaisir THEN 'Plaisir' END),
       (i.raison_autre_detail)
     ) AS t(v) WHERE v IS NOT NULL),
    i.classe_attribuee, i.classe_id, i.statut_paiement, i.date_paiement, i.date_dernier_rappel,
    i.photo_url, i.scores_calculs, i.notes_admin, i.indicatif_pays,
    i.connaitre_internet, i.connaitre_evenement, i.association_nom, i.association_autre_detail,
    i.evenement_nom, i.evenement_autre_detail, i.is_reinscription, 'keep'
  FROM inscriptions i
  LEFT JOIN eleve e ON e.id = i.eleve_id;

  GET DIAGNOSTICS v_count_dest = ROW_COUNT;

  IF v_count_dest != v_count_source THEN
    RAISE EXCEPTION 'Comptage incohérent (source=%, copié=%). Rollback automatique.', v_count_source, v_count_dest;
  END IF;

  TRUNCATE inscriptions;

  RETURN QUERY SELECT v_count_dest, false;
END;
$$ LANGUAGE plpgsql;
```

**Usage** :
```sql
SELECT * FROM archiver_annee_scolaire('2026-2027', true);   -- dry-run, ne modifie rien
SELECT * FROM archiver_annee_scolaire('2026-2027', false);  -- exécution réelle
```

Garde-fous inclus : transaction implicite (fonction plpgsql), vérification de comptage source/destination avant vidage, refus si l'année a déjà été archivée, mode dry-run pour vérifier avant d'exécuter pour de vrai.

## 9. Prochaines étapes

- [ ] Reprendre le workflow de réinscription (formulaire allégé, email/bannière distincts, délibération avec choix "Maintien / Passage niveau sup / À réévaluer") maintenant que `eleve` existe
- [ ] Construire l'écran `/admin/students` une fois les données de Liva (classes, enseignants, zoom, élèves par classe) disponibles
- [ ] Reprendre les tests d'inscription (notifications aux responsables via `scolarite.ftm@gmail.com`), suspendus pour cause de vacances
- [ ] Envisager une interface admin pour éditer les listes `associations_liste`/`evenements_liste` dans `configuration` plutôt que de les modifier en SQL direct
