-- Migration Bloc 1 — FTM Scolarité
-- Base COMPLÈTE dès le départ : rien à refaire quand on affinera les fonctionnalités
-- Fidèle aux champs déjà utilisés par le code existant (extraits par grep, pas devinés)
-- pour les colonnes de `inscriptions`, complétée par les tables du document de
-- spécifications v2 (rôles — 8 avec le comptable ajouté par la Direction — comptes
-- visio, paiements historisés, notifications).

create extension if not exists pgcrypto;

create table if not exists configuration (
  key text primary key,
  value text
);

-- Les 7 rôles définis dans le document de spécifications
create table if not exists utilisateurs (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  nom text,
  email text unique not null,
  role text not null check (role in (
    'responsable_scolarite',
    'responsable_administratif',
    'comptable',
    'responsable_communication',
    'responsable_etudes',
    'enseignant',
    'organisation_it',
    'direction'
  )),
  actif boolean default true,
  created_at timestamptz default now()
);

-- Comptes Zoom/Jitsi disponibles (3 comptes connus : FTM, Charles, Président)
create table if not exists comptes_visio (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null default 'zoom' check (type in ('zoom', 'jitsi')),
  proprietaire text,
  limite_participants integer default 100,
  actif boolean default true
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  niveau text,
  tranche_age text,
  capacite_max integer,
  jour text,
  heure text,
  duree_minutes integer default 90,
  compte_visio_id uuid references comptes_visio(id),
  lien_visio text,
  enseignants text[],
  created_at timestamptz default now()
);

create table if not exists inscriptions (
  id uuid primary key default gen_random_uuid(),
  student_code text unique,

  -- Informations personnelles (champs exacts utilisés par public/inscription/page.tsx)
  nom text,
  prenom text,
  age integer,
  pays_residence text,
  ville_residence text,
  responsable_legal text,
  email_contact text,
  adresse_postale text,
  telephone text,

  -- Disponibilités
  jours_preference jsonb,
  horaire_apres_midi boolean,
  horaire_soir boolean,
  horaire_autre boolean,
  horaire_autre_detail text,

  -- Motivation
  raison_maternelle boolean,
  raison_competences boolean,
  raison_plaisir boolean,
  raison_autre boolean,
  raison_autre_detail text,
  attentes_formation text,

  -- Canal de découverte
  connaitre_connaissances boolean,
  connaitre_association boolean,
  connaitre_ancien_eleve boolean,
  connaitre_recommandation boolean,
  connaitre_autre boolean,
  connaitre_autre_detail text,

  remarques text,

  -- Évaluation CECRL
  niveau_suggere text default 'A1',
  reponses_competences jsonb default '{}'::jsonb,
  niveau_definitif text,
  motif_rejet text,

  -- Workflow (statuts en anglais, identiques au code existant — pas renommés pour le MVP,
  -- la traduction malgache se fait via une couche d'affichage séparée, pas en base)
  status text default 'pending_review', -- pending_review | approved | rejected | payment_pending

  -- Affectation classe (texte libre existant, conservé pour compat + nouvelle FK propre)
  classe_attribuee text,
  classe_id uuid references classes(id),

  -- Identité élève (réinscriptions)
  eleve_id text,

  -- Paiement (résumé rapide sur la ligne ; l'historique détaillé vit dans `paiements`)
  statut_paiement text default 'en_attente', -- en_attente | paye
  date_paiement timestamptz,
  date_dernier_rappel timestamptz,

  notes_admin text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Historique des paiements (une ligne par transaction/relance, pas juste un statut plat)
create table if not exists paiements (
  id uuid primary key default gen_random_uuid(),
  inscription_id uuid references inscriptions(id) on delete cascade,
  montant numeric,
  date_paiement timestamptz,
  mode text,
  statut text default 'en_attente',
  notes text,
  created_at timestamptz default now()
);

-- Traçabilité des emails envoyés (notification multi-destinataires, confirmations, relances)
create table if not exists notifications_log (
  id uuid primary key default gen_random_uuid(),
  inscription_id uuid references inscriptions(id) on delete cascade,
  type text, -- nouvelle_inscription | decision | rappel_paiement
  destinataires text[],
  date_envoi timestamptz default now()
);

create index if not exists idx_inscriptions_status on inscriptions(status);
create index if not exists idx_inscriptions_student_code on inscriptions(student_code);
create index if not exists idx_inscriptions_eleve_id on inscriptions(eleve_id);
create index if not exists idx_paiements_inscription on paiements(inscription_id);

insert into configuration (key, value) values
  ('frais_inscription', '30'),
  ('email_notification', 'scolarite_ftm@gmail.com')
on conflict (key) do nothing;

insert into comptes_visio (nom, type, proprietaire, limite_participants) values
  ('Zoom FTM officiel', 'zoom', 'FTM', 100),
  ('Zoom Charles', 'zoom', 'Charles', 100),
  ('Zoom Président', 'zoom', 'Président', 100)
on conflict do nothing;

-- RLS : activé mais permissif pour le MVP (tout utilisateur authentifié = accès complet).
-- Les permissions fines par rôle (cf. doc de spécifications) viendront affiner ces
-- policies sans changer la structure des tables.
alter table inscriptions enable row level security;
alter table classes enable row level security;
alter table paiements enable row level security;
alter table utilisateurs enable row level security;
alter table notifications_log enable row level security;

create policy "internal_full_access_inscriptions" on inscriptions
  for all using (auth.role() = 'authenticated');
create policy "internal_full_access_classes" on classes
  for all using (auth.role() = 'authenticated');
create policy "internal_full_access_paiements" on paiements
  for all using (auth.role() = 'authenticated');
create policy "internal_full_access_utilisateurs" on utilisateurs
  for all using (auth.role() = 'authenticated');
create policy "internal_full_access_notifications" on notifications_log
  for all using (auth.role() = 'authenticated');

-- Le formulaire public doit pouvoir insérer une inscription sans être authentifié
create policy "public_can_insert_inscription" on inscriptions
  for insert with check (true);
