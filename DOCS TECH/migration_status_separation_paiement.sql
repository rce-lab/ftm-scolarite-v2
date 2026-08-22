-- Migration : séparation décision pédagogique / suivi de paiement
-- Contexte : `inscriptions.status` mélangeait jusqu'ici décision pédagogique
-- (pending_review/approved/rejected) et suivi de paiement (payment_pending).
-- Le paiement reste désormais exclusivement porté par `statut_paiement` +
-- la table `paiements` (déjà en place, fonctionnels, aucun changement requis
-- sur cette partie). `status` redevient purement pédagogique.
--
-- Diagnostic préalable (confirmé par Charles, pas vérifiable depuis cet
-- environnement en lecture seule) : 0 ligne actuellement à 'payment_pending'
-- en base — aucune donnée à migrer sur cette valeur avant d'ajouter la
-- contrainte CHECK ci-dessous.

-- 1. Contrainte CHECK sur inscriptions.status : idempotent (DROP IF EXISTS
--    avant ADD), échouera bruyamment si une ligne existante porte encore une
--    valeur hors de la liste (payment_pending ou autre) — c'est volontaire,
--    à corriger avant de relancer la migration plutôt que de l'ignorer.
alter table inscriptions drop constraint if exists inscriptions_status_check;
alter table inscriptions add constraint inscriptions_status_check
  check (status in ('pending_review', 'approved', 'rejected'));

-- 2. CREATE OR REPLACE de marquer_inscription_payee, sans la ligne
--    `status = 'approved'`.
--
-- ⚠️ AVERTISSEMENT IMPORTANT — à lire avant d'exécuter :
-- Le corps actuel de cette fonction n'existe dans AUCUN fichier versionné de
-- ce repo (recherché : tout `src/`, tout `DOCS TECH/*.sql`, aucune trace).
-- Ce qui suit est une RECONSTRUCTION à partir du comportement observable
-- déduit du code appelant (src/app/admin/payments/page.tsx : paramètres
-- p_inscription_id/p_montant/p_mode, statut_paiement mis à 'paye', ligne
-- ajoutée dans l'historique paiements) et du modèle de rôles documenté dans
-- DOCS TECH/PASSATION_projet_ftm_scolarite.md (comptable /
-- responsable_administratif / organisation_it). CE N'EST PAS une copie
-- vérifiée de la fonction réelle — je n'ai pas eu accès à sa définition
-- exacte (paramètres additionnels éventuels, message d'exception précis,
-- SECURITY DEFINER ou non, colonnes exactes insérées dans `paiements`,
-- validations supplémentaires sur le montant, etc.).
--
-- AVANT D'EXÉCUTER CE BLOC : récupérez la définition réelle actuelle depuis
-- le SQL Editor Supabase avec :
--   select pg_get_functiondef('marquer_inscription_payee'::regproc);
-- et comparez-la à la reconstruction ci-dessous. Si elles divergent au-delà
-- de la ligne `status = 'approved'` à retirer, adaptez ce bloc pour ne
-- reproduire QUE ce retrait, en gardant le reste identique à l'original réel
-- plutôt qu'à cette reconstruction.

create or replace function marquer_inscription_payee(
  p_inscription_id uuid,
  p_montant numeric,
  p_mode text
)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from utilisateurs
    where auth_user_id = auth.uid()
      and role in ('comptable', 'responsable_administratif', 'organisation_it')
      and actif = true
  ) then
    raise exception 'Accès refusé : rôle non autorisé à marquer un paiement';
  end if;

  update inscriptions
  set
    statut_paiement = 'paye',
    date_paiement = now(),
    updated_at = now()
  where id = p_inscription_id;

  insert into paiements (inscription_id, montant, mode, date_paiement, statut)
  values (p_inscription_id, p_montant, p_mode, now(), 'paye');
end;
$$;
